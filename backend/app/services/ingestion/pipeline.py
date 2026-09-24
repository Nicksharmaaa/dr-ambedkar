"""
Ingestion Pipeline Orchestrator — Phase 3.

Orchestrates the full lifecycle for a single file:
1. Analyze (format, fixity, provenance)
2. Verify no duplicate
3. Copy original to storage backend (immutable)
4. Write archival_object + files records to Turso
5. Log INGEST preservation event to Turso
6. Enqueue downstream processing_jobs (OCR, THUMBNAIL, METADATA_EXTRACTION)
7. Write per-file manifest JSON to data/manifests/

Per-file isolation: exceptions for one file NEVER abort processing of others.
"""
from __future__ import annotations

import json
import os
import uuid
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.db.database import DatabaseClient
from app.db.repositories.archival_objects import ArchivalObjectRepository
from app.db.repositories.jobs import JobRepository
from app.db.repositories.preservation import PreservationRepository
from app.services.ingestion.analyzer import (
    AnalysisStatus,
    FileAnalysis,
    build_analysis,
    compute_sha256_streaming,
)
from app.services.storage.base import StorageBackend

# Manifests output directory (relative to workspace root)
MANIFESTS_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent.parent / "data" / "manifests"
MANIFESTS_DIR.mkdir(parents=True, exist_ok=True)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


class IngestResult:
    """Tracks per-file ingestion outcome."""

    def __init__(self, filename: str, path: str) -> None:
        self.filename = filename
        self.path = path
        self.archival_id: str | None = None
        self.object_id: str | None = None
        self.sha256: str | None = None
        self.status: str = "pending"
        self.error: str | None = None
        self.analysis: FileAnalysis | None = None

    def to_dict(self) -> dict:
        return {
            "filename": self.filename,
            "path": self.path,
            "archival_id": self.archival_id,
            "object_id": self.object_id,
            "sha256": self.sha256,
            "status": self.status,
            "error": self.error,
        }


class BatchIngestionSummary:
    """Aggregates results from a batch scan."""

    def __init__(self) -> None:
        self.total: int = 0
        self.processed: int = 0
        self.pending: int = 0
        self.failed: int = 0
        self.duplicate: int = 0
        self.needs_review: int = 0
        self.results: list[IngestResult] = []

    def add_result(self, r: IngestResult) -> None:
        self.total += 1
        if r.status == "ok":
            self.processed += 1
        elif r.status == "needs_review":
            self.needs_review += 1
        elif r.status == "duplicate":
            self.duplicate += 1
        elif r.status == "failed":
            self.failed += 1
        elif r.status == "pending":
            self.pending += 1
        self.results.append(r)

    def to_dict(self) -> dict:
        return {
            "total": self.total,
            "processed": self.processed,
            "pending": self.pending,
            "failed": self.failed,
            "duplicate": self.duplicate,
            "needs_review": self.needs_review,
            "results": [r.to_dict() for r in self.results],
        }


async def get_known_hashes(db: DatabaseClient) -> set[str]:
    """Fetch all SHA-256 hashes from archival_objects for duplicate detection."""
    result = await db.execute(
        "SELECT file_hash FROM archival_objects WHERE file_hash IS NOT NULL"
    )
    return {row["file_hash"] for row in result.rows if row.get("file_hash")}


async def ingest_file(
    *,
    file_bytes: bytes,
    filename: str,
    source_path: Path,
    db: DatabaseClient,
    storage: StorageBackend,
    known_hashes: set[str] | None = None,
) -> IngestResult:
    """
    Fully ingest one file. All exceptions are caught and returned in IngestResult.
    Does not raise. The caller decides how to surface errors.
    """
    result = IngestResult(filename=filename, path=str(source_path))

    try:
        # Resolve known hashes if not pre-fetched
        if known_hashes is None:
            known_hashes = await get_known_hashes(db)

        # --- PHASE 1: File Analysis ---
        analysis = build_analysis(
            file_bytes=file_bytes,
            filename=filename,
            source_path=source_path,
            known_hashes=known_hashes,
        )
        result.analysis = analysis
        result.sha256 = analysis.sha256
        result.archival_id = analysis.archival_id

        # --- PHASE 2: Route by Status ---
        if analysis.status == AnalysisStatus.DUPLICATE:
            result.status = "duplicate"
            result.error = analysis.error_detail
            return result

        if analysis.status == AnalysisStatus.UNSUPPORTED:
            result.status = "failed"
            result.error = analysis.error_detail
            return result

        if analysis.status == AnalysisStatus.CORRUPT:
            result.status = "failed"
            result.error = analysis.error_detail
            # Still write a preservation event for the failed ingest
            pev_repo = PreservationRepository(db)
            await pev_repo.log_preservation_event(
                object_id=None,
                event_type="ingestion",
                event_detail=f"Corrupt file rejected during ingestion: {filename}",
                event_outcome="failure",
                agent_name="ingestion-pipeline-v3",
                outcome_detail=analysis.error_detail,
            )
            return result

        # --- PHASE 3: Storage (binary only, never in Turso) ---
        ext = Path(filename).suffix.lower()
        object_id = _new_id()
        storage_key = f"originals/{analysis.object_type}/{object_id}/original{ext}"
        await storage.put(storage_key, file_bytes, content_type=analysis.mime_type_detected)

        # --- PHASE 4: Turso Archival Object ---
        ao_repo = ArchivalObjectRepository(db)
        stable_id = analysis.archival_id
        await ao_repo.create({
            "id": object_id,
            "stable_id": stable_id,
            "title": analysis.title,
            "subtitle": analysis.subtitle,
            "object_type": analysis.object_type,
            "language": analysis.language,
            "source_institution": analysis.source_institution,
            "provenance": analysis.provenance,
            "rights_status": analysis.rights_status,
            "creator": analysis.creator,
            "publication_date": analysis.publication_date,
            "description": analysis.description,
            "subject_keywords": analysis.subject_keywords,
            "review_status": "needs_review" if analysis.needs_review else "pending",
            "publication_status": "draft",
            "file_hash": analysis.sha256,
            "file_size_bytes": analysis.file_size_bytes,
            "original_filename": filename,
            "original_file_key": storage_key,
            "page_count": analysis.page_count,
            "metadata_json": json.dumps({
                "mime_type": analysis.mime_type_detected,
                "duration_secs": analysis.duration_secs,
                "codec_info": analysis.codec_info,
                "image_width": analysis.image_width,
                "image_height": analysis.image_height,
                "is_large_file": analysis.is_large_file,
                "ingestion_timestamp": analysis.ingestion_timestamp,
                "archival_id": analysis.archival_id,
            }),
        })

        # --- PHASE 5: Files table record ---
        await db.execute(
            """
            INSERT INTO files (id, object_id, file_type, storage_key, mime_type,
                               file_size_bytes, file_hash, width_px, height_px, duration_secs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                _new_id(), object_id, "original", storage_key,
                analysis.mime_type_detected, analysis.file_size_bytes, analysis.sha256,
                analysis.image_width, analysis.image_height, analysis.duration_secs,
            ],
        )

        # --- PHASE 6: PREMIS Preservation Event ---
        pev_repo = PreservationRepository(db)
        await pev_repo.log_preservation_event(
            object_id=object_id,
            event_type="ingestion",
            event_detail=f"File ingested: {filename} ({analysis.mime_type_detected}, {analysis.file_size_bytes} bytes)",
            event_outcome="success",
            agent_name="ingestion-pipeline-v3",
            file_hash_after=analysis.sha256,
        )

        # --- PHASE 7: Enqueue Downstream Jobs ---
        job_repo = JobRepository(db)
        jobs_to_enqueue: list[str] = []

        if analysis.mime_type_detected == "application/pdf":
            jobs_to_enqueue = ["OCR", "THUMBNAIL", "METADATA_EXTRACTION"]
        elif analysis.mime_type_detected.startswith("image/"):
            jobs_to_enqueue = ["THUMBNAIL", "METADATA_EXTRACTION"]
        elif analysis.mime_type_detected.startswith("audio/"):
            jobs_to_enqueue = ["TRANSCRIPTION", "METADATA_EXTRACTION"]
        elif analysis.mime_type_detected.startswith("video/"):
            jobs_to_enqueue = ["TRANSCRIPTION", "THUMBNAIL", "METADATA_EXTRACTION"]

        for job_type in jobs_to_enqueue:
            await job_repo.enqueue(object_id, job_type, {"storage_key": storage_key})

        # --- PHASE 8: Write Manifest JSON ---
        manifest_path = MANIFESTS_DIR / f"{stable_id}.json"
        manifest_data = analysis.to_dict()
        manifest_data["object_id"] = object_id
        manifest_data["storage_key"] = storage_key
        manifest_data["jobs_enqueued"] = jobs_to_enqueue
        with open(manifest_path, "w", encoding="utf-8") as mf:
            json.dump(manifest_data, mf, indent=2, default=str)

        # --- Update known_hashes to prevent same-batch duplicates ---
        known_hashes.add(analysis.sha256)

        result.object_id = object_id
        result.status = "needs_review" if analysis.needs_review else "ok"

    except Exception as exc:
        result.status = "failed"
        result.error = f"{type(exc).__name__}: {str(exc)[:500]}"

    return result
