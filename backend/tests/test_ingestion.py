"""
Phase 3 Ingestion Pipeline Tests.

Tests are isolated from Turso Cloud — they use in-memory mock DB clients
and a temp-directory storage backend. No real archival files are used.
Only synthetic fixtures from tests/fixtures/ingestion/ are used.

Test groups:
  1. Analyzer unit tests (pure function, no I/O)
  2. Pipeline integration tests (mock DB + temp storage)
  3. Scanner integration tests (temp inbox dir)
  4. API endpoint tests via FastAPI TestClient
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import struct
import tempfile
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio

# ── Fixtures path ─────────────────────────────────────────────────────────────

FIXTURE_DIR = Path(__file__).parent / "fixtures" / "ingestion"

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────


def load_fixture(name: str) -> bytes:
    path = FIXTURE_DIR / name
    assert path.exists(), f"Fixture not found: {path}"
    return path.read_bytes()


def load_sidecar(name: str) -> dict:
    path = FIXTURE_DIR / name
    assert path.exists(), f"Sidecar not found: {path}"
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# ─────────────────────────────────────────────────────────────────────────────
# 1. Analyzer Unit Tests
# ─────────────────────────────────────────────────────────────────────────────


class TestAnalyzerMIMEDetection:
    """Verify magic byte detection outperforms extension-based guessing."""

    def test_pdf_detected_by_magic(self):
        from app.services.ingestion.analyzer import detect_mime_type
        data = load_fixture("minimal_pdf.pdf")
        mime = detect_mime_type(data, "renamed_as_unknown.xyz")
        assert mime == "application/pdf"

    def test_jpeg_detected_by_magic(self):
        from app.services.ingestion.analyzer import detect_mime_type
        data = load_fixture("minimal_jpeg.jpg")
        mime = detect_mime_type(data, "image_without_extension")
        assert mime == "image/jpeg"

    def test_png_detected_by_magic(self):
        from app.services.ingestion.analyzer import detect_mime_type
        data = load_fixture("minimal_png.png")
        mime = detect_mime_type(data, "mystery_file")
        assert mime == "image/png"

    def test_wav_detected_by_magic(self):
        from app.services.ingestion.analyzer import detect_mime_type
        data = load_fixture("minimal_wav.wav")
        mime = detect_mime_type(data, "audio")
        assert mime in ("audio/wav", "audio/x-wav", "audio/wave")

    def test_unsupported_format_identified(self):
        from app.services.ingestion.analyzer import detect_mime_type
        data = load_fixture("unsupported.gif")
        mime = detect_mime_type(data, "unsupported.gif")
        assert "gif" in mime or mime == "image/gif"


class TestAnalyzerSHA256:
    def test_sha256_deterministic(self):
        from app.services.ingestion.analyzer import compute_sha256
        data = b"hello world"
        h1 = compute_sha256(data)
        h2 = compute_sha256(data)
        assert h1 == h2
        assert len(h1) == 64

    def test_sha256_streaming_matches(self):
        """Streaming SHA-256 must match in-memory SHA-256."""
        import os
        from app.services.ingestion.analyzer import compute_sha256, compute_sha256_streaming

        with tempfile.NamedTemporaryFile(delete=False, suffix=".bin") as f:
            f.write(b"test binary content " * 1000)
            tmp_path = Path(f.name)
        try:
            expected = compute_sha256(tmp_path.read_bytes())
            streaming = compute_sha256_streaming(tmp_path)
            assert expected == streaming
        finally:
            tmp_path.unlink()

    def test_different_files_different_hashes(self):
        from app.services.ingestion.analyzer import compute_sha256
        a = compute_sha256(b"file one")
        b_ = compute_sha256(b"file two")
        assert a != b_


class TestArchivalIDGeneration:
    def test_archival_id_format(self):
        from app.services.ingestion.analyzer import generate_archival_id
        test_hash = "abcdef1234567890" * 4
        aid = generate_archival_id(test_hash)
        assert aid.startswith("AH-")
        parts = aid.split("-")
        assert len(parts) == 3
        assert len(parts[1]) == 8   # YYYYMMDD
        assert len(parts[2]) == 8   # sha256[:8]

    def test_archival_id_deterministic(self):
        """Same hash on same date → same ID (idempotent)."""
        from app.services.ingestion.analyzer import generate_archival_id
        test_hash = "0011223344556677" * 4
        id1 = generate_archival_id(test_hash)
        id2 = generate_archival_id(test_hash)
        assert id1 == id2


class TestPDFExtraction:
    def test_valid_pdf_page_count(self):
        from app.services.ingestion.analyzer import extract_pdf_metadata
        data = load_fixture("minimal_pdf.pdf")
        page_count, err = extract_pdf_metadata(data)
        assert page_count == 1
        assert err is None

    def test_corrupt_pdf_returns_none(self):
        from app.services.ingestion.analyzer import extract_pdf_metadata
        data = load_fixture("corrupt_pdf.pdf")
        page_count, err = extract_pdf_metadata(data)
        assert page_count is None
        assert err is not None


class TestImageExtraction:
    def test_jpeg_dimensions(self):
        from app.services.ingestion.analyzer import extract_image_dimensions
        data = load_fixture("minimal_jpeg.jpg")
        w, h, err = extract_image_dimensions(data)
        # Minimal JPEG is 1x1
        assert isinstance(w, int) and w >= 1
        assert isinstance(h, int) and h >= 1

    def test_png_dimensions(self):
        from app.services.ingestion.analyzer import extract_image_dimensions
        data = load_fixture("minimal_png.png")
        w, h, err = extract_image_dimensions(data)
        assert isinstance(w, int) and w >= 1
        assert isinstance(h, int) and h >= 1


class TestBuildAnalysis:
    """End-to-end analysis of each fixture type."""

    def _known_hashes(self) -> set[str]:
        return set()

    def test_pdf_ok(self):
        from app.services.ingestion.analyzer import AnalysisStatus, build_analysis
        data = load_fixture("minimal_pdf.pdf")
        result = build_analysis(data, "minimal_pdf.pdf", FIXTURE_DIR / "minimal_pdf.pdf", self._known_hashes())
        # Has full sidecar so should be OK
        assert result.status != AnalysisStatus.CORRUPT
        assert result.status != AnalysisStatus.UNSUPPORTED
        assert result.page_count == 1
        assert result.sha256 == sha256(data)
        assert result.archival_id.startswith("AH-")
        assert result.title != "UNKNOWN"

    def test_jpeg_ok(self):
        from app.services.ingestion.analyzer import AnalysisStatus, build_analysis
        data = load_fixture("minimal_jpeg.jpg")
        result = build_analysis(data, "minimal_jpeg.jpg", FIXTURE_DIR / "minimal_jpeg.jpg", self._known_hashes())
        assert result.status != AnalysisStatus.CORRUPT
        assert result.mime_type_detected == "image/jpeg"
        assert result.image_width is not None

    def test_wav_ok(self):
        from app.services.ingestion.analyzer import AnalysisStatus, build_analysis
        data = load_fixture("minimal_wav.wav")
        result = build_analysis(data, "minimal_wav.wav", FIXTURE_DIR / "minimal_wav.wav", self._known_hashes())
        assert result.status != AnalysisStatus.UNSUPPORTED
        assert "wav" in result.mime_type_detected or result.mime_type_detected.startswith("audio/")

    def test_corrupt_pdf_detected(self):
        from app.services.ingestion.analyzer import AnalysisStatus, build_analysis
        data = load_fixture("corrupt_pdf.pdf")
        result = build_analysis(data, "corrupt_pdf.pdf", FIXTURE_DIR / "corrupt_pdf.pdf", self._known_hashes())
        assert result.status == AnalysisStatus.CORRUPT

    def test_unsupported_format_rejected(self):
        from app.services.ingestion.analyzer import AnalysisStatus, build_analysis
        data = load_fixture("unsupported.gif")
        result = build_analysis(data, "unsupported.gif", FIXTURE_DIR / "unsupported.gif", self._known_hashes())
        assert result.status == AnalysisStatus.UNSUPPORTED

    def test_duplicate_detection(self):
        from app.services.ingestion.analyzer import AnalysisStatus, build_analysis, compute_sha256
        data = load_fixture("minimal_pdf.pdf")
        known = {compute_sha256(data)}
        result = build_analysis(data, "minimal_pdf.pdf", FIXTURE_DIR / "minimal_pdf.pdf", known)
        assert result.status == AnalysisStatus.DUPLICATE

    def test_no_metadata_flagged_needs_review(self):
        from app.services.ingestion.analyzer import AnalysisStatus, build_analysis
        data = load_fixture("no_metadata.pdf")
        # no_metadata.pdf has no sidecar → all fields UNKNOWN
        result = build_analysis(data, "no_metadata.pdf", FIXTURE_DIR / "no_metadata.pdf", self._known_hashes())
        assert result.needs_review is True
        assert result.title == "UNKNOWN"
        assert result.creator == "UNKNOWN"


# ─────────────────────────────────────────────────────────────────────────────
# 2. Scanner Unit Tests (no DB / Storage I/O)
# ─────────────────────────────────────────────────────────────────────────────


class TestInboxScanner:
    def test_discover_excludes_sidecars(self):
        from app.services.ingestion.scanner import discover_inbox_files
        files = discover_inbox_files(FIXTURE_DIR)
        names = [f.name for f in files]
        # .json sidecars must NOT appear
        assert not any(n.endswith(".json") for n in names)

    def test_discover_excludes_hidden(self):
        """Hidden files (starting with .) must be excluded."""
        import tempfile
        from app.services.ingestion.scanner import discover_inbox_files
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            (tmp / ".hidden_file.pdf").write_bytes(b"%PDF-1.4")
            (tmp / "visible.pdf").write_bytes(b"%PDF-1.4")
            files = discover_inbox_files(tmp)
            names = [f.name for f in files]
            assert ".hidden_file.pdf" not in names
            assert "visible.pdf" in names

    def test_discover_finds_all_supported(self):
        from app.services.ingestion.scanner import discover_inbox_files
        files = discover_inbox_files(FIXTURE_DIR)
        names = [f.name for f in files]
        # Should include our fixture files
        assert "minimal_pdf.pdf" in names
        assert "minimal_jpeg.jpg" in names
        assert "minimal_wav.wav" in names

    def test_empty_inbox_returns_empty(self):
        import tempfile
        from app.services.ingestion.scanner import discover_inbox_files
        with tempfile.TemporaryDirectory() as tmpdir:
            files = discover_inbox_files(Path(tmpdir))
            assert files == []


# ─────────────────────────────────────────────────────────────────────────────
# 3. Pipeline Integration Tests (mock DB + temp storage)
# ─────────────────────────────────────────────────────────────────────────────


class MockResultSet:
    def __init__(self, rows=None, scalar_val=None):
        self.rows = rows or []
        self._scalar = scalar_val

    def first(self):
        return self.rows[0] if self.rows else None

    def scalar(self):
        return self._scalar


class MockDB:
    """Minimal mock DatabaseClient that records execute calls."""

    def __init__(self):
        self.calls = []

    async def execute(self, sql: str, params=None):
        self.calls.append((sql.strip()[:80], params))
        # Simulate no existing hashes
        if "file_hash" in sql.lower() and "SELECT" in sql.upper():
            return MockResultSet(rows=[])
        if "COUNT" in sql.upper():
            return MockResultSet(scalar_val=0)
        return MockResultSet()


class TestIngestFilePipeline:
    @pytest.mark.asyncio
    async def test_valid_pdf_ingested(self):
        from app.services.ingestion.pipeline import ingest_file
        from app.services.storage.local import LocalStorageBackend

        with tempfile.TemporaryDirectory() as tmpdir:
            storage = LocalStorageBackend(root=Path(tmpdir) / "storage")
            db = MockDB()
            data = load_fixture("minimal_pdf.pdf")
            result = await ingest_file(
                file_bytes=data,
                filename="minimal_pdf.pdf",
                source_path=FIXTURE_DIR / "minimal_pdf.pdf",
                db=db,
                storage=storage,
                known_hashes=set(),
            )
            assert result.status in ("ok", "needs_review")
            assert result.sha256 == sha256(data)
            assert result.archival_id.startswith("AH-")
            assert result.object_id is not None

    @pytest.mark.asyncio
    async def test_corrupt_pdf_not_stored(self):
        from app.services.ingestion.pipeline import ingest_file
        from app.services.storage.local import LocalStorageBackend

        with tempfile.TemporaryDirectory() as tmpdir:
            storage = LocalStorageBackend(root=Path(tmpdir) / "storage")
            db = MockDB()
            data = load_fixture("corrupt_pdf.pdf")
            result = await ingest_file(
                file_bytes=data,
                filename="corrupt_pdf.pdf",
                source_path=FIXTURE_DIR / "corrupt_pdf.pdf",
                db=db,
                storage=storage,
                known_hashes=set(),
            )
            assert result.status == "failed"
            # Nothing should be in storage
            stored = await storage.list_prefix("originals")
            assert len(stored) == 0

    @pytest.mark.asyncio
    async def test_duplicate_not_re_ingested(self):
        from app.services.ingestion.pipeline import ingest_file
        from app.services.storage.local import LocalStorageBackend

        with tempfile.TemporaryDirectory() as tmpdir:
            storage = LocalStorageBackend(root=Path(tmpdir) / "storage")
            db = MockDB()
            data = load_fixture("minimal_pdf.pdf")
            already_known = {sha256(data)}
            result = await ingest_file(
                file_bytes=data,
                filename="minimal_pdf.pdf",
                source_path=FIXTURE_DIR / "minimal_pdf.pdf",
                db=db,
                storage=storage,
                known_hashes=already_known,
            )
            assert result.status == "duplicate"

    @pytest.mark.asyncio
    async def test_unsupported_format_rejected(self):
        from app.services.ingestion.pipeline import ingest_file
        from app.services.storage.local import LocalStorageBackend

        with tempfile.TemporaryDirectory() as tmpdir:
            storage = LocalStorageBackend(root=Path(tmpdir) / "storage")
            db = MockDB()
            data = load_fixture("unsupported.gif")
            result = await ingest_file(
                file_bytes=data,
                filename="unsupported.gif",
                source_path=FIXTURE_DIR / "unsupported.gif",
                db=db,
                storage=storage,
                known_hashes=set(),
            )
            assert result.status == "failed"
            stored = await storage.list_prefix("originals")
            assert len(stored) == 0

    @pytest.mark.asyncio
    async def test_no_metadata_flagged_needs_review(self):
        from app.services.ingestion.pipeline import ingest_file
        from app.services.storage.local import LocalStorageBackend

        with tempfile.TemporaryDirectory() as tmpdir:
            storage = LocalStorageBackend(root=Path(tmpdir) / "storage")
            db = MockDB()
            data = load_fixture("no_metadata.pdf")
            result = await ingest_file(
                file_bytes=data,
                filename="no_metadata.pdf",
                source_path=FIXTURE_DIR / "no_metadata.pdf",
                db=db,
                storage=storage,
                known_hashes=set(),
            )
            # Should succeed but flagged for review
            assert result.status == "needs_review"

    @pytest.mark.asyncio
    async def test_batch_isolation_failure_does_not_abort(self):
        """A bad file must not prevent a good file from being ingested."""
        from app.services.ingestion.scanner import scan_and_ingest
        from app.services.storage.local import LocalStorageBackend

        with tempfile.TemporaryDirectory() as tmpdir_storage, \
             tempfile.TemporaryDirectory() as tmpdir_inbox:

            inbox = Path(tmpdir_inbox)
            storage = LocalStorageBackend(root=Path(tmpdir_storage) / "storage")
            db = MockDB()

            # Place one corrupt and one valid file
            (inbox / "corrupt.pdf").write_bytes(b"%PDF garbage")
            (inbox / "valid.pdf").write_bytes(load_fixture("minimal_pdf.pdf"))

            summary = await scan_and_ingest(db=db, storage=storage, inbox_root=inbox)
            assert summary.total == 2
            # The valid file should succeed (ok or needs_review)
            statuses = [r.status for r in summary.results]
            assert "failed" in statuses
            assert any(s in ("ok", "needs_review") for s in statuses)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Dry-Run Scanner Tests
# ─────────────────────────────────────────────────────────────────────────────


class TestDryRunScan:
    @pytest.mark.asyncio
    async def test_dry_run_does_not_write_to_storage(self):
        from app.services.ingestion.scanner import scan_and_ingest
        from app.services.storage.local import LocalStorageBackend

        with tempfile.TemporaryDirectory() as tmpdir_storage, \
             tempfile.TemporaryDirectory() as tmpdir_inbox:

            inbox = Path(tmpdir_inbox)
            storage = LocalStorageBackend(root=Path(tmpdir_storage) / "storage")
            db = MockDB()

            (inbox / "test.pdf").write_bytes(load_fixture("minimal_pdf.pdf"))

            summary = await scan_and_ingest(db=db, storage=storage, inbox_root=inbox, dry_run=True)
            assert summary.total == 1

            # Storage must remain empty
            stored = await storage.list_prefix("originals")
            assert len(stored) == 0

    @pytest.mark.asyncio
    async def test_dry_run_does_not_write_to_db(self):
        from app.services.ingestion.scanner import scan_and_ingest
        from app.services.storage.local import LocalStorageBackend

        with tempfile.TemporaryDirectory() as tmpdir_storage, \
             tempfile.TemporaryDirectory() as tmpdir_inbox:

            inbox = Path(tmpdir_inbox)
            storage = LocalStorageBackend(root=Path(tmpdir_storage) / "storage")
            db = MockDB()

            (inbox / "test.pdf").write_bytes(load_fixture("minimal_pdf.pdf"))

            await scan_and_ingest(db=db, storage=storage, inbox_root=inbox, dry_run=True)

            # DB should have 0 or only the hash-check SELECT, no INSERTs
            insert_calls = [c for c in db.calls if c[0].upper().startswith("INSERT")]
            assert len(insert_calls) == 0


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
