"""
Kiosk and Offline Synchronization API Routes — Phase 12
Exposes sync manifests and packaged offline bundles for disconnected operation.
"""
from __future__ import annotations

import hashlib
import json
import logging
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.db.database import DatabaseClient, get_db_client

logger = logging.getLogger("ambedkar.api.kiosk")

router = APIRouter(prefix="/kiosk", tags=["Kiosk & Offline Sync"])

CONTENT_VERSION = "2026.09.24-p12"
METADATA_VERSION = "v1.2.0"


@router.get("/manifest", summary="Get Kiosk Sync & Offline Manifest")
async def get_kiosk_manifest(db: DatabaseClient = Depends(get_db_client)) -> dict[str, Any]:
    """
    Returns synchronization versions, content hashes, and offline bundle availability.
    Enables museum kiosks to detect if their local cache requires synchronization.
    """
    # Count verified documents and works
    res_works = await db.execute("SELECT count(*) AS work_count FROM multilingual_works")
    res_docs = await db.execute("SELECT count(*) AS doc_count FROM archival_objects")
    work_count = res_works.rows[0]["work_count"] if res_works.rows else 0
    doc_count = res_docs.rows[0]["doc_count"] if res_docs.rows else 0

    return {
        "content_version": CONTENT_VERSION,
        "metadata_version": METADATA_VERSION,
        "last_synced_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sync_status": "SYNCHRONIZED",
        "counts": {
            "canonical_works": work_count,
            "registered_documents": doc_count,
        },
        "critical_offline_routes": [
            "/kiosk",
            "/",
            "/documents",
            "/timeline",
            "/stories",
            "/media",
            "/compare",
        ],
        "offline_ai_policy": "MANDATORY_ABSTENTION_WHEN_DISCONNECTED",
    }


@router.get("/offline-package", summary="Download Offline Metadata Package")
async def get_offline_package(db: DatabaseClient = Depends(get_db_client)) -> dict[str, Any]:
    """
    Packages canonical works, timeline events, and essential exhibits
    into a portable JSON bundle for local browser IndexedDB hydration.
    """
    # 1. Fetch Works
    res_works = await db.execute(
        "SELECT id, canonical_title, original_language, description FROM multilingual_works ORDER BY canonical_title"
    )
    works = [dict(r) for r in (res_works.rows or [])]

    # 2. Fetch Timeline Events
    res_events = await db.execute(
        "SELECT id, title, start_date AS event_date, category, description, source AS archival_source FROM timeline_events ORDER BY start_date ASC LIMIT 50"
    )
    events = [dict(r) for r in (res_events.rows or [])]

    # 3. Fetch Featured Stories
    res_stories = await db.execute(
        "SELECT id, title, slug, subtitle, summary, cover_image_url FROM story_collections ORDER BY created_at DESC LIMIT 10"
    )
    stories = [dict(r) for r in (res_stories.rows or [])]

    package_payload = {
        "version": CONTENT_VERSION,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "works": works,
        "timeline_events": events,
        "stories": stories,
    }

    # Cryptographic checksum of offline bundle
    raw_bytes = json.dumps(package_payload, sort_keys=True).encode("utf-8")
    bundle_hash = hashlib.sha256(raw_bytes).hexdigest()

    return {
        "bundle_sha256": bundle_hash,
        "total_works": len(works),
        "total_events": len(events),
        "total_stories": len(stories),
        "data": package_payload,
    }
