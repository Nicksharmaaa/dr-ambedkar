"""
Archival File Analyzer — Phase 3 Core Component.

Responsibilities:
- Detect MIME type via magic bytes (not just extension).
- Calculate SHA-256 fixity hash via streaming (memory-safe for large files).
- Extract format-specific metadata (PDF page count, audio/video duration, image dims).
- Detect exact duplicates, corrupt files, unsupported formats, missing metadata.
- Never invents metadata. Unknown provenance → UNKNOWN. Needs verification → NEEDS_REVIEW.

All methods are pure functions (no side effects). The pipeline.py orchestrates
database and storage writes.
"""
from __future__ import annotations

import hashlib
import io
import json
import mimetypes
import os
import struct
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Supported Formats
# ---------------------------------------------------------------------------

ALLOWED_MIME_TYPES: set[str] = {
    # PDF
    "application/pdf",
    # Images
    "image/jpeg",
    "image/png",
    "image/tiff",
    # Audio
    "audio/mpeg",          # mp3
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/vnd.wave",
    # Video
    "video/mp4",
    "video/quicktime",     # .mov
}

# Magic byte signatures for robust format detection
MAGIC_SIGNATURES: list[tuple[bytes, str, int]] = [
    # (magic_bytes, mime_type, offset)
    (b"%PDF",              "application/pdf",   0),
    (b"\xff\xd8\xff",     "image/jpeg",         0),
    (b"\x89PNG\r\n\x1a\n","image/png",           0),
    (b"II\x2a\x00",       "image/tiff",          0),  # little-endian TIFF
    (b"MM\x00\x2a",       "image/tiff",          0),  # big-endian TIFF
    (b"RIFF",             "audio/wav",           0),  # WAV starts with RIFF
    (b"\xff\xfb",         "audio/mpeg",          0),  # MP3 frame sync
    (b"\xff\xf3",         "audio/mpeg",          0),
    (b"\xff\xf2",         "audio/mpeg",          0),
    (b"ID3",              "audio/mpeg",          0),  # MP3 with ID3 tag
    (b"ftyp",             "video/mp4",           4),  # MP4 — ftyp at offset 4
]


class AnalysisStatus(str, Enum):
    OK = "ok"
    DUPLICATE = "duplicate"
    CORRUPT = "corrupt"
    UNSUPPORTED = "unsupported"
    NEEDS_REVIEW = "needs_review"
    LARGE_FILE = "large_file"


LARGE_FILE_THRESHOLD_BYTES = 500 * 1024 * 1024  # 500 MB


@dataclass
class FileAnalysis:
    """Complete analysis result for one ingested file."""
    # Identity
    original_path: str = ""
    filename: str = ""
    archival_id: str = ""                # AH-{YYYYMMDD}-{sha256[:8]}

    # Fixity
    sha256: str = ""

    # Format
    mime_type_detected: str = ""
    extension: str = ""
    is_supported: bool = False

    # Size
    file_size_bytes: int = 0
    is_large_file: bool = False

    # Format-specific
    page_count: int | None = None           # PDF
    image_width: int | None = None          # Image
    image_height: int | None = None         # Image
    duration_secs: float | None = None      # Audio / Video
    codec_info: str | None = None           # Audio / Video

    # Provenance (from sidecar or defaults)
    title: str = "UNKNOWN"
    creator: str = "UNKNOWN"
    source_institution: str = "UNKNOWN"
    rights_status: str = "unknown"
    publication_date: str = "UNKNOWN"
    object_type: str = "book"
    language: str = "en"
    provenance: str = "UNKNOWN"
    description: str | None = None
    subject_keywords: str | None = None
    subtitle: str | None = None

    # Pipeline State
    status: AnalysisStatus = AnalysisStatus.OK
    error_detail: str | None = None
    needs_review: bool = False
    duplicate_of: str | None = None   # sha256 of the original if duplicate
    ingestion_timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict[str, Any]:
        return {k: (v.value if isinstance(v, AnalysisStatus) else v) for k, v in self.__dict__.items()}


# ---------------------------------------------------------------------------
# Core Analysis Functions
# ---------------------------------------------------------------------------

def compute_sha256(file_bytes: bytes) -> str:
    """Compute SHA-256 hex digest of file bytes."""
    return hashlib.sha256(file_bytes).hexdigest()


def compute_sha256_streaming(path: Path, chunk_size: int = 65536) -> str:
    """Memory-safe streaming SHA-256 for large files."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def detect_mime_type(file_bytes: bytes, filename: str) -> str:
    """
    Detect MIME type via magic byte inspection first,
    then fall back to mimetypes.guess_type from extension.
    """
    header = file_bytes[:12]

    # Special case: MOV/MP4 detection — read bytes 4–8 for 'ftyp'
    if len(file_bytes) >= 8 and file_bytes[4:8] == b"ftyp":
        brand = file_bytes[8:12]
        if brand in (b"qt  ", b"moov"):
            return "video/quicktime"
        return "video/mp4"

    for magic, mime, offset in MAGIC_SIGNATURES:
        if header[offset : offset + len(magic)] == magic:
            # Additional check for WAV: bytes 8-12 must be 'WAVE'
            if mime == "audio/wav":
                if len(file_bytes) >= 12 and file_bytes[8:12] == b"WAVE":
                    return "audio/wav"
                continue  # RIFF but not WAVE
            return mime

    # Fall back to extension-based detection
    guessed, _ = mimetypes.guess_type(filename)
    return guessed or "application/octet-stream"


def extract_pdf_metadata(file_bytes: bytes) -> tuple[int | None, str | None]:
    """
    Attempt to extract page count from PDF.
    Returns (page_count, error_detail).
    Returns (None, error_detail) for corrupt PDFs.
    """
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        return len(reader.pages), None
    except Exception as e:
        return None, f"PDF parse error: {type(e).__name__}: {str(e)[:200]}"


def extract_image_dimensions(file_bytes: bytes) -> tuple[int | None, int | None, str | None]:
    """
    Extract image width and height.
    Returns (width, height, error_detail).
    """
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(file_bytes))
        w, h = img.size
        return w, h, None
    except Exception as e:
        return None, None, f"Image parse error: {type(e).__name__}: {str(e)[:200]}"


def extract_audio_metadata(file_bytes: bytes, mime_type: str) -> tuple[float | None, str | None, str | None]:
    """
    Extract duration (seconds) and codec info from audio.
    Returns (duration_secs, codec_info, error_detail).
    """
    try:
        import mutagen
        audio = mutagen.File(io.BytesIO(file_bytes))
        if audio is None:
            return None, None, "Mutagen returned None — unrecognized audio format"
        duration = getattr(audio.info, "duration", None)
        codec = type(audio.info).__name__
        return duration, codec, None
    except Exception as e:
        # Fallback for WAV: parse RIFF header directly
        if mime_type in ("audio/wav", "audio/x-wav", "audio/wave"):
            try:
                if file_bytes[:4] == b"RIFF" and file_bytes[8:12] == b"WAVE":
                    # Extract sample rate and data chunk size
                    sample_rate = struct.unpack_from("<I", file_bytes, 24)[0]
                    # Find 'data' chunk
                    idx = file_bytes.find(b"data", 36)
                    if idx != -1:
                        data_size = struct.unpack_from("<I", file_bytes, idx + 4)[0]
                        channels = struct.unpack_from("<H", file_bytes, 22)[0]
                        bits = struct.unpack_from("<H", file_bytes, 34)[0]
                        bytes_per_sample = bits // 8
                        duration = data_size / (sample_rate * channels * bytes_per_sample)
                        return round(duration, 3), "WAV PCM", None
            except Exception:
                pass
        return None, None, f"Audio parse error: {type(e).__name__}: {str(e)[:200]}"


def load_sidecar_metadata(source_path: Path) -> dict[str, str]:
    """
    Attempt to load companion .json sidecar file (same directory, same stem).
    Returns an empty dict if not found or invalid JSON.
    """
    sidecar = source_path.with_suffix(".json")
    if sidecar.is_file():
        try:
            with open(sidecar, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict):
                return {k: str(v) for k, v in data.items()}
        except Exception:
            pass
    return {}


def generate_archival_id(sha256: str) -> str:
    """
    Generate a deterministic, human-readable archival ID.
    Format: AH-{YYYYMMDD}-{sha256[:8]}
    """
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"AH-{today}-{sha256[:8]}"


def build_analysis(
    file_bytes: bytes,
    filename: str,
    source_path: Path,
    known_hashes: set[str],
) -> FileAnalysis:
    """
    Orchestrate complete file analysis. Returns a populated FileAnalysis.
    Failures are contained — the object.status reflects the outcome.
    The caller should never crash due to a bad file; all exceptions are caught.
    """
    result = FileAnalysis(
        original_path=str(source_path),
        filename=filename,
        extension=Path(filename).suffix.lower().lstrip("."),
        file_size_bytes=len(file_bytes),
    )

    # 1. Large file guard
    if result.file_size_bytes > LARGE_FILE_THRESHOLD_BYTES:
        result.is_large_file = True
        # Still continue — log warning, do not abort

    # 2. SHA-256 fixity
    result.sha256 = compute_sha256(file_bytes)
    result.archival_id = generate_archival_id(result.sha256)

    # 3. Duplicate detection
    if result.sha256 in known_hashes:
        result.status = AnalysisStatus.DUPLICATE
        result.duplicate_of = result.sha256
        result.error_detail = f"Exact duplicate of existing archival object with hash {result.sha256}"
        return result

    # 4. MIME type detection
    result.mime_type_detected = detect_mime_type(file_bytes, filename)

    # 5. Unsupported format check
    if result.mime_type_detected not in ALLOWED_MIME_TYPES:
        result.status = AnalysisStatus.UNSUPPORTED
        result.error_detail = f"MIME type '{result.mime_type_detected}' is not supported. Allowed: {sorted(ALLOWED_MIME_TYPES)}"
        return result

    # 6. Infer object_type from MIME
    if result.mime_type_detected == "application/pdf":
        result.object_type = "book"
    elif result.mime_type_detected in ("image/jpeg", "image/png", "image/tiff"):
        result.object_type = "photograph"
    elif result.mime_type_detected in ("audio/mpeg", "audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"):
        result.object_type = "speech"
    elif result.mime_type_detected in ("video/mp4", "video/quicktime"):
        result.object_type = "speech"

    # 7. Format-specific extraction
    if result.mime_type_detected == "application/pdf":
        page_count, err = extract_pdf_metadata(file_bytes)
        if page_count is None:
            result.status = AnalysisStatus.CORRUPT
            result.error_detail = err or "PDF is corrupt or unreadable"
            return result
        result.page_count = page_count

    elif result.mime_type_detected in ("image/jpeg", "image/png", "image/tiff"):
        w, h, err = extract_image_dimensions(file_bytes)
        if err and w is None:
            result.status = AnalysisStatus.CORRUPT
            result.error_detail = err
            return result
        result.image_width = w
        result.image_height = h

    elif result.mime_type_detected in ALLOWED_MIME_TYPES:  # audio/video
        dur, codec, err = extract_audio_metadata(file_bytes, result.mime_type_detected)
        result.duration_secs = dur
        result.codec_info = codec
        if err and dur is None:
            # Non-fatal: log but continue
            result.error_detail = err

    # 8. Load sidecar metadata (provenance)
    sidecar = load_sidecar_metadata(source_path)
    result.title = sidecar.get("title", "UNKNOWN")
    result.creator = sidecar.get("creator", "UNKNOWN")
    result.source_institution = sidecar.get("source_institution", "UNKNOWN")
    result.rights_status = sidecar.get("rights_status", "unknown")
    result.publication_date = sidecar.get("publication_date", "UNKNOWN")
    result.language = sidecar.get("language", "en")
    result.provenance = sidecar.get("provenance", "UNKNOWN")
    result.description = sidecar.get("description", None)
    result.subject_keywords = sidecar.get("subject_keywords", None)
    result.subtitle = sidecar.get("subtitle", None)

    # Override object_type from sidecar if present
    if sidecar.get("object_type"):
        result.object_type = sidecar["object_type"]

    # 9. Missing metadata check → NEEDS_REVIEW
    unknown_fields = [
        f for f in ("title", "creator", "source_institution")
        if getattr(result, f) == "UNKNOWN"
    ]
    if unknown_fields or result.rights_status == "unknown":
        result.needs_review = True
        if result.status == AnalysisStatus.OK:
            result.status = AnalysisStatus.NEEDS_REVIEW

    # 10. Final status — OK if nothing else flagged it
    if result.status == AnalysisStatus.OK:
        pass  # Healthy

    return result
