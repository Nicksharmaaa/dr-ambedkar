"""
Phase 8: Historical Timeline API Endpoints
Authoritative chronological timeline retrieval backed by Turso Cloud.
Precision-aware dates, category filtering, and direct archival document deep-links.
"""
from __future__ import annotations

import logging
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, Query, Path

from app.db.database import get_db_client
from app.services.timeline.service import TimelineService
from app.services.knowledge_graph.models import TimelineEventItem

logger = logging.getLogger("ambedkar.api.timeline")
router = APIRouter(prefix="/timeline", tags=["historical-timeline"])


@router.get("", response_model=list[TimelineEventItem])
@router.get("/", response_model=list[TimelineEventItem], include_in_schema=False)
async def list_timeline_events(
    year_from: Optional[int] = Query(None, description="Starting year (e.g. 1891)"),
    year_to: Optional[int] = Query(None, description="Ending year (e.g. 1956)"),
    category: Optional[str] = Query(None, description="Category filter (e.g. CONSTITUTIONAL, EDUCATION, SOCIAL_REFORM)"),
    limit: int = Query(50, ge=1, le=100, description="Page limit"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
) -> list[TimelineEventItem]:
    """Retrieve chronologically ordered historical timeline events backed by archival evidence."""
    db = get_db_client()
    service = TimelineService(db)
    return await service.get_timeline(
        year_from=year_from,
        year_to=year_to,
        category=category,
        limit=limit,
        offset=offset,
    )


@router.get("/events/{id}", response_model=TimelineEventItem)
async def get_timeline_event_by_id(
    id: str = Path(..., description="Timeline event ID (e.g. event-1927-mahad)"),
) -> TimelineEventItem:
    """Fetch single timeline event with full evidence snippet and archival document citation."""
    db = get_db_client()
    service = TimelineService(db)
    event = await service.get_event(id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Timeline event not found: {id}")
    return event


@router.get("/search", response_model=list[TimelineEventItem])
async def search_timeline(
    q: str = Query(..., min_length=1, description="Search query across event titles, descriptions, locations"),
    limit: int = Query(20, ge=1, le=50, description="Max results"),
) -> list[TimelineEventItem]:
    """Full-text search across historical timeline events."""
    db = get_db_client()
    service = TimelineService(db)
    return await service.search_timeline(query=q, limit=limit)


@router.get("/categories")
async def list_timeline_categories() -> dict[str, Any]:
    """Fetch distinct timeline categories with event counts."""
    db = get_db_client()
    res = await db.execute(
        """
        SELECT category, COUNT(*) as count
        FROM timeline_events
        WHERE publication_status = 'APPROVED'
        GROUP BY category
        ORDER BY count DESC
        """
    )
    return {
        "categories": [dict(r) for r in res.rows],
    }
