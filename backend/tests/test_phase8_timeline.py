"""
Phase 8: Historical Timeline Test Suite
Validates:
  - Chronological ordering of historical events
  - Precision-aware date parsing (DAY, MONTH, YEAR, RANGE)
  - Category taxonomy filtering (CONSTITUTIONAL, EDUCATION, SOCIAL_REFORM, etc.)
  - Verifiable archival citations and document deep-links
  - Full-text search across historical timeline events
"""
from __future__ import annotations

import pytest
from app.db.database import get_db_client
from app.services.timeline.service import TimelineService
from app.services.knowledge_graph.models import DatePrecision


@pytest.mark.asyncio
async def test_timeline_chronological_ordering():
    """Verify that timeline events are strictly ordered by start date."""
    db = get_db_client()
    service = TimelineService(db)

    events = await service.get_timeline(limit=50)
    assert len(events) >= 10

    dates = [e.start_date for e in events]
    assert dates == sorted(dates), "Timeline events must be strictly chronological"
    assert dates[0].startswith("1891"), "First canonical event should be birth in 1891"


@pytest.mark.asyncio
async def test_timeline_category_filter():
    """Verify category filtering isolates specific thematic events."""
    db = get_db_client()
    service = TimelineService(db)

    const_events = await service.get_timeline(category="CONSTITUTIONAL")
    assert len(const_events) >= 1
    for ev in const_events:
        assert ev.category == "CONSTITUTIONAL"


@pytest.mark.asyncio
async def test_timeline_date_precisions():
    """Verify that events support different date precisions without guess conversions."""
    db = get_db_client()
    service = TimelineService(db)

    events = await service.get_timeline(limit=50)
    precisions = {e.date_precision for e in events}
    assert DatePrecision.DAY in precisions
    assert len(precisions) >= 2


@pytest.mark.asyncio
async def test_timeline_archival_citations():
    """Verify that every approved historical event is anchored to archival evidence."""
    db = get_db_client()
    service = TimelineService(db)

    events = await service.get_timeline(limit=50)
    for ev in events:
        assert ev.document_id is not None
        assert ev.evidence_chunk_id is not None
        assert ev.evidence_text is not None
        assert len(ev.evidence_text) > 10
        assert ev.viewer_url is not None
        assert f"/documents/{ev.document_id}/viewer" in ev.viewer_url


@pytest.mark.asyncio
async def test_timeline_full_text_search():
    """Verify full-text search retrieves matching events."""
    db = get_db_client()
    service = TimelineService(db)

    results = await service.search_timeline("Constitution")
    assert len(results) >= 1
    assert any("Constitution" in r.title or "Constitution" in r.description for r in results)
