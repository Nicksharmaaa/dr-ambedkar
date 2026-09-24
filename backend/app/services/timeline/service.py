"""
Phase 8: Historical Timeline Service
Authoritative chronological timeline retrieval backed by Turso Cloud timeline_events.
Supports precision-aware dates, archival document deep-links, and category taxonomy filtering.
"""
from __future__ import annotations

import json
import logging
from typing import Any
from app.db.database import DatabaseClient
from app.services.knowledge_graph.models import (
    DatePrecision,
    TimelineCategory,
    TimelineEventItem,
)

logger = logging.getLogger("ambedkar.timeline.service")


class TimelineService:
    """Retrieval and search service for verified historical timeline events."""

    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def get_timeline(
        self,
        year_from: int | None = None,
        year_to: int | None = None,
        category: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[TimelineEventItem]:
        """Query chronological events with date bounds, category filters, and pagination."""
        sql = "SELECT * FROM timeline_events WHERE publication_status = 'APPROVED'"
        params: list[Any] = []

        if year_from is not None:
            sql += " AND CAST(substr(start_date, 1, 4) AS INTEGER) >= ?"
            params.append(year_from)

        if year_to is not None:
            sql += " AND CAST(substr(start_date, 1, 4) AS INTEGER) <= ?"
            params.append(year_to)

        if category:
            sql += " AND upper(category) = ?"
            params.append(category.upper())

        sql += " ORDER BY start_date ASC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        res = await self.db.execute(sql, params)
        events = []
        for r in res.rows:
            events.append(self._row_to_event(dict(r)))
        return events

    async def get_event(self, event_id: str) -> TimelineEventItem | None:
        """Fetch single timeline event by ID with verified provenance."""
        res = await self.db.execute(
            "SELECT * FROM timeline_events WHERE id = ? LIMIT 1",
            [event_id],
        )
        if not res.rows:
            return None
        return self._row_to_event(dict(res.rows[0]))

    async def search_timeline(self, query: str, limit: int = 20) -> list[TimelineEventItem]:
        """Search timeline events by text or related people."""
        sql = """
            SELECT * FROM timeline_events
            WHERE publication_status = 'APPROVED'
              AND (lower(title) LIKE ? OR lower(description) LIKE ? OR lower(location) LIKE ?)
            ORDER BY start_date ASC
            LIMIT ?
        """
        like_q = f"%{query.lower()}%"
        res = await self.db.execute(sql, [like_q, like_q, like_q, limit])
        return [self._row_to_event(dict(r)) for r in res.rows]

    def _row_to_event(self, row: dict[str, Any]) -> TimelineEventItem:
        people = []
        if row.get("related_people"):
            try:
                people = json.loads(row["related_people"])
            except Exception:
                people = [p.strip() for p in row["related_people"].split(",") if p.strip()]

        docs = []
        if row.get("related_documents"):
            try:
                docs = json.loads(row["related_documents"])
            except Exception:
                docs = [d.strip() for d in row["related_documents"].split(",") if d.strip()]

        topics = []
        if row.get("related_topics"):
            try:
                topics = json.loads(row["related_topics"])
            except Exception:
                topics = [t.strip() for t in row["related_topics"].split(",") if t.strip()]

        doc_id = row.get("document_id") or "AMBEDKAR-VOL-01"
        page_no = row.get("page_number") or 1
        chunk_id = row.get("evidence_chunk_id")

        viewer_url = f"/documents/{doc_id}/viewer?page={page_no}"
        if chunk_id:
            viewer_url += f"&chunk={chunk_id}"

        return TimelineEventItem(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            start_date=row["start_date"],
            end_date=row.get("end_date"),
            date_precision=row.get("date_precision", DatePrecision.DAY),
            category=row.get("category", TimelineCategory.HISTORICAL if hasattr(TimelineCategory, "HISTORICAL") else TimelineCategory.SOCIAL_REFORM),
            location=row.get("location"),
            related_people=people,
            related_documents=docs,
            related_topics=topics,
            source=row["source"],
            evidence_chunk_id=chunk_id,
            evidence_text=row.get("evidence_text"),
            document_id=doc_id,
            page_number=page_no,
            viewer_url=viewer_url,
            publication_status=row.get("publication_status", "APPROVED"),
        )
