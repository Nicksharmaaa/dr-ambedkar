"""
Phase 9: Audio & Video Media API Endpoints
Provides media track catalog, synchronized timestamped transcripts, and seek-to-timestamp search.
"""
from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Path

from app.db.database import get_db_client
from app.services.media.media_service import MediaService

router = APIRouter(prefix="/media", tags=["audio-video-media"])


@router.get("/tracks")
async def list_media_tracks(
    asset_type: Optional[str] = Query(None, description="Filter by audio or video"),
) -> list[dict]:
    """List all archival audio and video tracks."""
    db = get_db_client()
    service = MediaService(db)
    return await service.list_tracks(asset_type=asset_type)


@router.get("/tracks/{id}")
async def get_media_track_by_id(
    id: str = Path(..., description="Media asset ID (e.g. track-bbc-1931, video-cad-1949)"),
) -> dict:
    """Fetch media track details with ordered timestamped segments."""
    db = get_db_client()
    service = MediaService(db)
    track = await service.get_track(track_id=id)
    if not track:
        raise HTTPException(status_code=404, detail=f"Media asset not found: {id}")
    return track


@router.get("/search")
async def search_spoken_media(
    q: str = Query(..., min_length=1, description="Search term for spoken transcripts"),
    limit: int = Query(20, ge=1, le=50),
) -> dict:
    """
    Search spoken transcripts across all archival audio and video recordings.
    Returns matching snippets with direct seek-to-timestamp links.
    """
    db = get_db_client()
    service = MediaService(db)
    results = await service.search_spoken_media(query=q, limit=limit)
    return {
        "query": q,
        "total": len(results),
        "matches": results,
    }
