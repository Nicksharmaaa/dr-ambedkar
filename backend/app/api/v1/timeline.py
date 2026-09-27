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


HISTORICAL_MEMORIAL_LOCATIONS = [
    {
        "id": "loc-mhow",
        "name": "Dr. Ambedkar Nagar (Mhow)",
        "label": "Birthplace & Military Cantonment",
        "city": "Mhow, Indore",
        "state": "Madhya Pradesh",
        "country": "India",
        "lat": 22.5539,
        "lng": 75.7644,
        "year": 1891,
        "category": "MEMORIAL",
        "significance": "Birthplace of Dr. B.R. Ambedkar on April 14, 1891. Now honored as Dr. Ambedkar Nagar with a monumental national memorial stupa.",
        "related_documents": ["AMBEDKAR-VOL-01"],
        "related_event_ids": ["event-1891-birth"],
    },
    {
        "id": "loc-satara",
        "name": "Satara Camp School",
        "label": "Formative Schooling & Registration",
        "city": "Satara",
        "state": "Maharashtra",
        "country": "India",
        "lat": 17.6805,
        "lng": 73.9997,
        "year": 1900,
        "category": "EDUCATION",
        "significance": "Entered Government High School Satara on Nov 7, 1900. His school entry day is now observed as Student Day (Vidyarthi Diwas) across Maharashtra.",
        "related_documents": ["AMBEDKAR-VOL-01"],
        "related_event_ids": ["event-1900-satara"],
    },
    {
        "id": "loc-mumbai-elphinstone",
        "name": "Elphinstone College & Parel",
        "label": "Collegiate Education & Early Social Lab",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "lat": 18.9298,
        "lng": 72.8317,
        "year": 1912,
        "category": "EDUCATION",
        "significance": "Graduated with B.A. in Economics and Political Science (1912). Later established Siddharth College and lived in Parel and Dadar Rajgruha.",
        "related_documents": ["AMBEDKAR-VOL-01", "AMBEDKAR-VOL-06"],
        "related_event_ids": ["event-1912-elphinstone"],
    },
    {
        "id": "loc-columbia",
        "name": "Columbia University",
        "label": "M.A. & Ph.D. in Political Science & Economics",
        "city": "New York",
        "state": "New York",
        "country": "United States",
        "lat": 40.8075,
        "lng": -73.9626,
        "year": 1913,
        "category": "EDUCATION",
        "significance": "Studied under John Dewey, Edwin Seligman, and James Shotwell. Penned 'Castes in India: Their Mechanism, Genesis and Development' (1916).",
        "related_documents": ["AMBEDKAR-VOL-01", "AMBEDKAR-VOL-06"],
        "related_event_ids": ["event-1913-columbia"],
    },
    {
        "id": "loc-lse",
        "name": "London School of Economics & Gray's Inn",
        "label": "D.Sc. Economics & Barrister-at-Law",
        "city": "London",
        "state": "England",
        "country": "United Kingdom",
        "lat": 51.5144,
        "lng": -0.1165,
        "year": 1916,
        "category": "EDUCATION",
        "significance": "Authored 'The Problem of the Rupee: Its Origin and Its Solution' (D.Sc.) and called to the Bar at Gray's Inn.",
        "related_documents": ["AMBEDKAR-VOL-06"],
        "related_event_ids": ["event-1916-lse"],
    },
    {
        "id": "loc-mahad",
        "name": "Chavdar Tank (Mahad)",
        "label": "Mahad Satyagraha for Civil Rights & Water",
        "city": "Mahad, Raigad",
        "state": "Maharashtra",
        "country": "India",
        "lat": 18.2327,
        "lng": 73.4217,
        "year": 1927,
        "category": "CIVIL_RIGHTS",
        "significance": "On March 20, 1927, led the Mahad Satyagraha asserting public water rights and human dignity. Observed annually as Social Empowerment Day.",
        "related_documents": ["AMBEDKAR-VOL-01", "AMBEDKAR-VOL-05"],
        "related_event_ids": ["event-1927-mahad"],
    },
    {
        "id": "loc-yerwada",
        "name": "Yerwada Central Prison",
        "label": "Poona Pact Negotiations",
        "city": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "lat": 18.5529,
        "lng": 73.8821,
        "year": 1932,
        "category": "POLITICAL",
        "significance": "Site of the September 24, 1932 Poona Pact negotiations securing 148 reserved legislative seats for the Depressed Classes.",
        "related_documents": ["AMBEDKAR-VOL-09"],
        "related_event_ids": ["event-1932-poona-pact"],
    },
    {
        "id": "loc-delhi-parliament",
        "name": "Parliament House & Constituent Assembly",
        "label": "Drafting of the Constitution of India",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "lat": 28.6172,
        "lng": 77.2081,
        "year": 1947,
        "category": "CONSTITUTIONAL",
        "significance": "Chairman of the Drafting Committee (1947–1950) and First Law Minister. Delivered the historic final address on November 25, 1949.",
        "related_documents": ["AMBEDKAR-VOL-13", "AMBEDKAR-VOL-14-P1", "AMBEDKAR-VOL-14-P2"],
        "related_event_ids": ["event-1947-drafting-chair", "event-1949-constitution-adoption"],
    },
    {
        "id": "loc-deekshabhoomi",
        "name": "Deekshabhoomi",
        "label": "Historic Buddhist Conversion & 22 Vows",
        "city": "Nagpur",
        "state": "Maharashtra",
        "country": "India",
        "lat": 21.1278,
        "lng": 79.0689,
        "year": 1956,
        "category": "SPIRITUAL",
        "significance": "On October 14, 1956, Dr. Ambedkar and approximately 500,000 followers embraced Buddhism, administering the historic 22 Vows of ethical liberation.",
        "related_documents": ["AMBEDKAR-VOL-03"],
        "related_event_ids": ["event-1956-buddhist-conversion"],
    },
    {
        "id": "loc-chaityabhoomi",
        "name": "Chaitya Bhoomi (Dadar)",
        "label": "National Memorial & Resting Place",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "lat": 19.0269,
        "lng": 72.8353,
        "year": 1956,
        "category": "MEMORIAL",
        "significance": "Memorial site on the Arabian Sea coast in Dadar, Mumbai, where Dr. Ambedkar was cremated on December 7, 1956. Millions pay homage on Mahaparinirvan Diwas.",
        "related_documents": ["AMBEDKAR-VOL-01"],
        "related_event_ids": ["event-1956-parinirvana"],
    },
]


@router.get("/locations")
async def list_heritage_locations() -> dict[str, Any]:
    """Retrieve geocoded historical heritage locations and memorials linked to Dr. Ambedkar's archival corpus."""
    return {
        "locations": HISTORICAL_MEMORIAL_LOCATIONS,
        "count": len(HISTORICAL_MEMORIAL_LOCATIONS),
    }
