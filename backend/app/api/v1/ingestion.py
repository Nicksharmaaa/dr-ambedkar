"""
Admin Ingestion API — Phase 3.

Endpoints:
  GET  /admin/ingest/inbox       — List files in data/inbox/ (dry-run discovery)
  POST /admin/ingest/scan        — Run full ingestion pipeline on data/inbox/
  POST /admin/ingest/scan/dry    — Dry-run scan: analyze only, no writes
  GET  /admin/ingest/status/{id} — Get archival object status by ID
  GET  /admin/ingest/manifests   — List generated manifests
  GET  /admin/ingest/queue       — Count pending jobs
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from app.db.database import get_db_client
from app.db.repositories.archival_objects import ArchivalObjectRepository
from app.services.ingestion.scanner import INBOX_DIR, discover_inbox_files, scan_and_ingest
from app.services.storage.local import LocalStorageBackend
from app.core.config import settings

router = APIRouter(prefix="/admin/ingest", tags=["admin-ingestion"])

MANIFESTS_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent.parent / "data" / "manifests"


def _get_storage() -> LocalStorageBackend:
    return LocalStorageBackend(root=settings.storage_root)


# ─────────────────────────────────────────────────────────────────────────────
# GET /admin/ingest/inbox
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/inbox")
async def list_inbox() -> dict:
    """
    List all eligible files currently in data/inbox/ (does NOT ingest them).
    Returns file names, sizes, and relative paths.
    """
    files = discover_inbox_files()
    items = []
    for f in files:
        try:
            size = f.stat().st_size
        except OSError:
            size = None
        items.append({
            "filename": f.name,
            "relative_path": str(f.relative_to(INBOX_DIR)),
            "size_bytes": size,
        })
    return {
        "inbox_root": str(INBOX_DIR),
        "count": len(items),
        "files": items,
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /admin/ingest/scan/dry
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/scan/dry")
async def dry_run_scan() -> dict:
    """
    Analyze all files in data/inbox/ WITHOUT writing to Turso or storage.
    Returns analysis results for review. Safe to call multiple times.
    """
    db = get_db_client()
    storage = _get_storage()

    summary = await scan_and_ingest(db=db, storage=storage, dry_run=True)
    return {
        "dry_run": True,
        "summary": summary.to_dict(),
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /admin/ingest/scan
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/scan")
async def run_ingest_scan() -> dict:
    """
    Discover all files in data/inbox/ and run the full ingestion pipeline.

    - Calculates SHA-256 fixity hash
    - Detects duplicates, corrupt files, unsupported formats
    - Writes immutable original to local storage backend
    - Creates archival_objects + files records in Turso
    - Logs INGEST PREMIS preservation events
    - Enqueues downstream processing jobs

    Failures for one file do NOT abort the batch.
    """
    db = get_db_client()
    storage = _get_storage()

    summary = await scan_and_ingest(db=db, storage=storage, dry_run=False)
    return {
        "dry_run": False,
        "summary": summary.to_dict(),
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /admin/ingest/status/{object_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/status/{object_id}")
async def get_ingest_status(object_id: str) -> dict:
    """Get the ingestion and review status of a specific archival object."""
    db = get_db_client()
    ao_repo = ArchivalObjectRepository(db)
    obj = await ao_repo.get_by_id(object_id)
    if not obj:
        obj = await ao_repo.get_by_stable_id(object_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Archival object '{object_id}' not found")

    # Get processing jobs
    result = await db.execute(
        "SELECT job_type, status, queued_at, completed_at, error_message "
        "FROM processing_jobs WHERE object_id = ? ORDER BY queued_at",
        [obj["id"]],
    )
    jobs = [dict(r) for r in result.rows]

    # Get preservation events
    pev_result = await db.execute(
        "SELECT event_type, event_outcome, event_date, event_detail "
        "FROM preservation_events WHERE object_id = ? ORDER BY event_date",
        [obj["id"]],
    )
    events = [dict(r) for r in pev_result.rows]

    return {
        "object": obj,
        "processing_jobs": jobs,
        "preservation_events": events,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /admin/ingest/manifests
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/manifests")
async def list_manifests(limit: int = Query(default=50, le=200)) -> dict:
    """List the most recently generated ingestion manifests."""
    if not MANIFESTS_DIR.is_dir():
        return {"manifests": [], "count": 0}

    manifest_files = sorted(MANIFESTS_DIR.glob("*.json"), key=lambda f: f.stat().st_mtime, reverse=True)
    manifests = []
    for mf in manifest_files[:limit]:
        try:
            with open(mf, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            manifests.append({
                "archival_id": data.get("archival_id"),
                "filename": data.get("filename"),
                "status": data.get("status"),
                "sha256": data.get("sha256"),
                "mime_type": data.get("mime_type_detected"),
                "ingestion_timestamp": data.get("ingestion_timestamp"),
                "manifest_file": mf.name,
            })
        except Exception as e:
            manifests.append({"manifest_file": mf.name, "error": str(e)})

    return {"manifests": manifests, "count": len(manifest_files)}


# ─────────────────────────────────────────────────────────────────────────────
# GET /admin/ingest/queue
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/queue")
async def job_queue_summary() -> dict:
    """Return a summary of the processing_jobs queue by type and status."""
    db = get_db_client()
    result = await db.execute(
        """
        SELECT job_type, status, COUNT(*) AS count
        FROM processing_jobs
        GROUP BY job_type, status
        ORDER BY job_type, status
        """
    )
    rows = [dict(r) for r in result.rows]

    # Total counts per status
    total_result = await db.execute(
        "SELECT status, COUNT(*) AS count FROM processing_jobs GROUP BY status"
    )
    totals = {row["status"]: row["count"] for row in total_result.rows}

    return {
        "by_type_and_status": rows,
        "totals_by_status": totals,
        "total_jobs": sum(totals.values()),
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /admin/ingest/objects
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/objects")
async def list_ingested_objects(
    review_status: str | None = Query(default=None),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0),
) -> dict:
    """List all ingested archival objects, optionally filtered by review_status."""
    db = get_db_client()

    if review_status:
        result = await db.execute(
            "SELECT id, stable_id, title, creator, object_type, review_status, "
            "publication_status, file_size_bytes, original_filename, created_at "
            "FROM archival_objects WHERE review_status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [review_status, limit, offset],
        )
        count_result = await db.execute(
            "SELECT COUNT(*) AS cnt FROM archival_objects WHERE review_status = ?",
            [review_status],
        )
    else:
        result = await db.execute(
            "SELECT id, stable_id, title, creator, object_type, review_status, "
            "publication_status, file_size_bytes, original_filename, created_at "
            "FROM archival_objects ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [limit, offset],
        )
        count_result = await db.execute(
            "SELECT COUNT(*) AS cnt FROM archival_objects"
        )

    total = count_result.scalar() or 0
    return {
        "objects": [dict(r) for r in result.rows],
        "total": total,
        "limit": limit,
        "offset": offset,
    }
