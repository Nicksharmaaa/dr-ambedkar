"""
Phase 8: Heritage Story Engine Test Suite
Validates:
  - Curated story collection retrieval
  - Chapter sequential integrity and order
  - Strict archival grounding (every chapter links to primary volume and page)
  - Primary document deep-link URLs
"""
from __future__ import annotations

import pytest
from app.db.database import get_db_client
from app.services.story.service import StoryService


@pytest.mark.asyncio
async def test_list_published_stories():
    """Verify listing published story collections."""
    db = get_db_client()
    service = StoryService(db)

    stories = await service.list_stories(published_only=True)
    assert len(stories) >= 3
    slugs = [s.slug for s in stories]
    assert "ambedkar-and-the-constitution" in slugs
    assert "mahad-satyagraha-civil-rights" in slugs
    assert "monetary-economics-and-the-rbi" in slugs


@pytest.mark.asyncio
async def test_story_chapters_and_evidence():
    """Verify that a story loads its chapters in sequential order with verified citations."""
    db = get_db_client()
    service = StoryService(db)

    story = await service.get_story("ambedkar-and-the-constitution")
    assert story is not None
    assert story.title == "Dr. Ambedkar & The Making of the Indian Constitution"
    assert len(story.items) >= 3

    sequences = [item.sequence for item in story.items]
    assert sequences == sorted(sequences), "Chapters must be ordered by sequence"

    for chapter in story.items:
        assert chapter.title is not None
        assert len(chapter.body) > 30
        assert chapter.document_id is not None, "Each chapter must anchor to an archival document"
        assert chapter.page_number is not None, "Each chapter must specify an exact page"
        assert chapter.highlighted_passage is not None
        assert chapter.viewer_url is not None
        assert f"/documents/{chapter.document_id}/viewer?page={chapter.page_number}" in chapter.viewer_url


@pytest.mark.asyncio
async def test_non_existent_story_returns_none():
    """Verify that querying a missing story returns None without error."""
    db = get_db_client()
    service = StoryService(db)

    story = await service.get_story("non-existent-story-slug")
    assert story is None
