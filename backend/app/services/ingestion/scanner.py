"""
Inbox Scanner — Phase 3.

Walks data/inbox/ recursively, discovers all files (optionally in subdirectories),
and submits them to the ingestion pipeline. Skips .json sidecar metadata files
and hidden/system files.

Returns a BatchIngestionSummary.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import AsyncGenerator

from app.db.database import DatabaseClient
from app.services.ingestion.pipeline import (
    BatchIngestionSummary,
    IngestResult,
    get_known_hashes,
    ingest_file,
)
from app.services.storage.base import StorageBackend

# Resolved absolute path to data/inbox/
INBOX_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent.parent / "data" / "inbox"

# Extensions that are sidecar metadata — never treat as archival objects
SIDECAR_EXTENSIONS = {".json", ".xml", ".md", ".txt.meta"}

# Hidden / system files to skip
SKIP_PREFIXES = {".", "_", "~"}


def discover_inbox_files(inbox_root: Path | None = None) -> list[Path]:
    """
    Recursively walk inbox_root (default: data/inbox/) and return
    all files that are not sidecar metadata, hidden, or system files.
    Sorted for deterministic ordering.
    """
    root = inbox_root or INBOX_DIR
    candidates: list[Path] = []

    if not root.is_dir():
        return candidates

    for dirpath, dirnames, filenames in os.walk(root):
        # Skip hidden directories
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]

        for fn in filenames:
            # Skip hidden/system files
            if fn[0] in SKIP_PREFIXES:
                continue
            ext = Path(fn).suffix.lower()
            # Skip sidecar metadata files
            if ext in SIDECAR_EXTENSIONS:
                continue
            candidates.append(Path(dirpath) / fn)

    return sorted(candidates)


async def scan_and_ingest(
    db: DatabaseClient,
    storage: StorageBackend,
    inbox_root: Path | None = None,
    dry_run: bool = False,
) -> BatchIngestionSummary:
    """
    Discover all eligible files in the inbox, then ingest each one.

    dry_run=True: analyze files and return results but do NOT write to Turso or storage.

    Failures in one file NEVER abort the batch.
    """
    summary = BatchIngestionSummary()
    files = discover_inbox_files(inbox_root)

    if not files:
        return summary

    # Pre-fetch known hashes once to avoid per-file DB round trips
    known_hashes = await get_known_hashes(db)

    for file_path in files:
        try:
            file_bytes = file_path.read_bytes()
        except OSError as e:
            result = IngestResult(filename=file_path.name, path=str(file_path))
            result.status = "failed"
            result.error = f"Cannot read file: {e}"
            summary.add_result(result)
            continue

        if dry_run:
            from app.services.ingestion.analyzer import build_analysis
            analysis = build_analysis(
                file_bytes=file_bytes,
                filename=file_path.name,
                source_path=file_path,
                known_hashes=known_hashes,
            )
            result = IngestResult(filename=file_path.name, path=str(file_path))
            result.analysis = analysis
            result.sha256 = analysis.sha256
            result.archival_id = analysis.archival_id
            result.status = analysis.status.value
            result.error = analysis.error_detail
            summary.add_result(result)
            # Track hash for within-batch duplicate detection even in dry run
            known_hashes.add(analysis.sha256)
            continue

        result = await ingest_file(
            file_bytes=file_bytes,
            filename=file_path.name,
            source_path=file_path,
            db=db,
            storage=storage,
            known_hashes=known_hashes,
        )
        summary.add_result(result)

    return summary
