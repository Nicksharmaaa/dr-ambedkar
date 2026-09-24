"""
Generate synthetic test fixtures for Phase 3 ingestion testing.

Run this script once to produce minimal valid binary files in:
  backend/tests/fixtures/ingestion/

These are the smallest possible valid binary structures — NOT real corpus files.
They are used ONLY for unit and integration testing of the ingestion pipeline.

No real archival material from data/inbox/ or incoming_documents/ is used here.
"""
import json
import struct
from pathlib import Path

FIXTURES = Path(__file__).parent

# ─────────────────────────────────────────────────────────────────────────────
# Minimal valid PDF (1 page, no real content)
# ─────────────────────────────────────────────────────────────────────────────

MINIMAL_PDF = b"""%PDF-1.4
1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj
2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj
3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer<</Size 4 /Root 1 0 R>>
startxref
190
%%EOF"""

# ─────────────────────────────────────────────────────────────────────────────
# Minimal valid JPEG (1x1 pixel, white, JFIF)
# ─────────────────────────────────────────────────────────────────────────────

MINIMAL_JPEG = bytes([
    0xFF, 0xD8, 0xFF, 0xE0,  # SOI + APP0 marker
    0x00, 0x10,              # APP0 length
    0x4A, 0x46, 0x49, 0x46, 0x00,  # JFIF\0
    0x01, 0x01,              # version 1.1
    0x00,                    # aspect ratio units
    0x00, 0x01, 0x00, 0x01, # density 1x1
    0x00, 0x00,              # thumbnail 0x0
    0xFF, 0xDB,              # DQT marker
    0x00, 0x43, 0x00,        # length + table id
    *([0x10] * 64),          # quantization table (64 bytes)
    0xFF, 0xC0,              # SOF0
    0x00, 0x0B,              # length
    0x08,                    # precision
    0x00, 0x01, 0x00, 0x01, # 1x1
    0x01,                    # components
    0x01, 0x11, 0x00,        # component 1
    0xFF, 0xC4,              # DHT marker
    0x00, 0x1F, 0x00,        # length + table class/id
    0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0A, 0x0B,
    0xFF, 0xDA,              # SOS
    0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
    0xF2, 0x8A,              # compressed data (minimal)
    0xFF, 0xD9,              # EOI
])

# ─────────────────────────────────────────────────────────────────────────────
# Minimal valid PNG (1x1 red pixel)
# ─────────────────────────────────────────────────────────────────────────────

MINIMAL_PNG = bytes([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG magic
    0x00, 0x00, 0x00, 0x0D,  # IHDR length
    0x49, 0x48, 0x44, 0x52,  # "IHDR"
    0x00, 0x00, 0x00, 0x01,  # width = 1
    0x00, 0x00, 0x00, 0x01,  # height = 1
    0x08, 0x02,              # bit depth 8, color type RGB
    0x00, 0x00, 0x00,        # compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE,  # CRC32 (IHDR)
    0x00, 0x00, 0x00, 0x0C,  # IDAT length
    0x49, 0x44, 0x41, 0x54,  # "IDAT"
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00,  # zlib compressed pixel
    0x00, 0x02, 0x00, 0x01,
    0xE2, 0x21, 0xBC, 0x33,  # CRC32 (IDAT)
    0x00, 0x00, 0x00, 0x00,  # IEND length
    0x49, 0x45, 0x4E, 0x44,  # "IEND"
    0xAE, 0x42, 0x60, 0x82,  # CRC32 (IEND)
])

# ─────────────────────────────────────────────────────────────────────────────
# Minimal valid WAV (0.01s mono 8000Hz 16-bit silence)
# ─────────────────────────────────────────────────────────────────────────────

def make_minimal_wav() -> bytes:
    sample_rate = 8000
    n_channels = 1
    bits_per_sample = 16
    n_samples = 80  # 0.01 seconds
    data_size = n_samples * n_channels * (bits_per_sample // 8)
    block_align = n_channels * (bits_per_sample // 8)
    byte_rate = sample_rate * block_align

    audio_data = bytes(data_size)  # silence

    riff_size = 4 + 8 + 16 + 8 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        riff_size,
        b"WAVE",
        b"fmt ",
        16,           # fmt chunk size
        1,            # PCM
        n_channels,
        sample_rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b"data",
        data_size,
    )
    return header + audio_data


# ─────────────────────────────────────────────────────────────────────────────
# Corrupt / invalid files
# ─────────────────────────────────────────────────────────────────────────────

CORRUPT_PDF = b"%PDF-1.4\nThis is a corrupt PDF with no valid structure\n%%"
UNSUPPORTED_FILE = b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x00\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"


def generate_all_fixtures() -> None:
    FIXTURES.mkdir(parents=True, exist_ok=True)

    # Valid fixtures with sidecar metadata
    fixtures = {
        "minimal_pdf.pdf": MINIMAL_PDF,
        "minimal_jpeg.jpg": MINIMAL_JPEG,
        "minimal_png.png": MINIMAL_PNG,
        "minimal_wav.wav": make_minimal_wav(),
        "corrupt_pdf.pdf": CORRUPT_PDF,
        "unsupported.gif": UNSUPPORTED_FILE,
        "no_metadata.pdf": MINIMAL_PDF,  # same bytes, no sidecar
    }

    sidecars = {
        "minimal_pdf.json": {
            "title": "Test Document — Ingestion Pipeline Fixture",
            "creator": "Ingestion Test Suite",
            "source_institution": "Phase 3 Test Environment",
            "rights_status": "public_domain",
            "publication_date": "2026",
            "object_type": "book",
            "language": "en",
            "provenance": "Synthetic fixture generated for pipeline testing",
            "description": "This is a synthetic test fixture. Not real archival material.",
        },
        "minimal_jpeg.json": {
            "title": "Test Photograph — Ingestion Pipeline Fixture",
            "creator": "Ingestion Test Suite",
            "source_institution": "Phase 3 Test Environment",
            "rights_status": "public_domain",
            "publication_date": "2026",
            "object_type": "photograph",
            "language": "en",
            "provenance": "Synthetic fixture generated for pipeline testing",
        },
        "minimal_png.json": {
            "title": "Test PNG Image — Ingestion Pipeline Fixture",
            "creator": "Ingestion Test Suite",
            "source_institution": "Phase 3 Test Environment",
            "rights_status": "public_domain",
            "publication_date": "2026",
            "object_type": "photograph",
            "language": "en",
            "provenance": "Synthetic fixture",
        },
        "minimal_wav.json": {
            "title": "Test Audio — Ingestion Pipeline Fixture",
            "creator": "Ingestion Test Suite",
            "source_institution": "Phase 3 Test Environment",
            "rights_status": "public_domain",
            "publication_date": "2026",
            "object_type": "speech",
            "language": "en",
            "provenance": "Synthetic fixture",
        },
    }
    # Note: no_metadata.pdf intentionally has NO sidecar

    for filename, content in fixtures.items():
        path = FIXTURES / filename
        path.write_bytes(content)
        print(f"  Created: {filename} ({len(content)} bytes)")

    for filename, meta in sidecars.items():
        path = FIXTURES / filename
        path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
        print(f"  Created: {filename} (sidecar)")

    print(f"\nAll fixtures written to: {FIXTURES}")


if __name__ == "__main__":
    generate_all_fixtures()
