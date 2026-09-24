"""
Phase 8: Heritage Story Engine API Endpoints
Curated, evidence-backed narrative journeys composed of primary archival objects.
Supports multimedia chapters, primary document deep-links, and chapter-level RAG inquiry.
"""
from __future__ import annotations

import logging
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, Query, Path

from app.db.database import get_db_client
from app.services.story.service import StoryService
from app.services.knowledge_graph.models import StoryCollectionItem

logger = logging.getLogger("ambedkar.api.stories")
router = APIRouter(prefix="/stories", tags=["heritage-stories"])


@router.get("", response_model=list[StoryCollectionItem])
@router.get("/", response_model=list[StoryCollectionItem], include_in_schema=False)
async def list_stories() -> list[StoryCollectionItem]:
    """Fetch all published heritage story collections ordered by display sequence."""
    db = get_db_client()
    service = StoryService(db)
    return await service.list_stories(published_only=True)


@router.get("/{id}", response_model=StoryCollectionItem)
async def get_story_by_slug_or_id(
    id: str = Path(..., description="Story slug or UUID (e.g. constitution-drafting, mahad-water-revolution)"),
) -> StoryCollectionItem:
    """Fetch complete historical story collection with all sequential archival chapters and source citations."""
    db = get_db_client()
    service = StoryService(db)
    story = await service.get_story(id)
    if not story:
        raise HTTPException(status_code=404, detail=f"Story collection not found: {id}")
    return story
