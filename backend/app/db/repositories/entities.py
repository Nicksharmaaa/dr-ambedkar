"""Repository: Named Entities — persons, organizations, events, places, topics, concepts."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Literal

from app.db.database import DatabaseClient


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


EntityType = Literal["person", "organization", "event", "place", "topic", "concept"]

_ENTITY_TABLE: dict[str, str] = {
    "person": "persons",
    "organization": "organizations",
    "event": "events",
    "place": "places",
    "topic": "topics",
    "concept": "concepts",
}


class EntityRepository:
    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def create_person(self, data: dict[str, Any]) -> str:
        eid = data.get("id") or _new_id()
        await self.db.execute(
            """
            INSERT OR IGNORE INTO persons (id, canonical_name, aliases, birth_date, death_date,
                description, wikidata_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                eid, data["canonical_name"], data.get("aliases"),
                data.get("birth_date"), data.get("death_date"),
                data.get("description"), data.get("wikidata_id"), _now(),
            ],
        )
        return eid

    async def create_organization(self, data: dict[str, Any]) -> str:
        eid = data.get("id") or _new_id()
        await self.db.execute(
            """
            INSERT OR IGNORE INTO organizations (id, canonical_name, aliases, org_type,
                founded_date, dissolved_date, description, wikidata_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                eid, data["canonical_name"], data.get("aliases"), data.get("org_type"),
                data.get("founded_date"), data.get("dissolved_date"),
                data.get("description"), data.get("wikidata_id"), _now(),
            ],
        )
        return eid

    async def create_event(self, data: dict[str, Any]) -> str:
        eid = data.get("id") or _new_id()
        await self.db.execute(
            """
            INSERT OR IGNORE INTO events (id, canonical_name, event_type, start_date, end_date,
                location_id, description, significance, wikidata_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                eid, data["canonical_name"], data.get("event_type"),
                data.get("start_date"), data.get("end_date"),
                data.get("location_id"), data.get("description"),
                data.get("significance"), data.get("wikidata_id"), _now(),
            ],
        )
        return eid

    async def create_relationship(self, data: dict[str, Any]) -> str:
        rid = data.get("id") or _new_id()
        await self.db.execute(
            """
            INSERT INTO relationships (
                id, subject_type, subject_id, predicate, object_type, object_id,
                evidence_chunk_id, confidence, source, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                rid, data["subject_type"], data["subject_id"],
                data["predicate"], data["object_type"], data["object_id"],
                data.get("evidence_chunk_id"), data.get("confidence", 1.0),
                data.get("source", "manual"), _now(),
            ],
        )
        return rid

    async def get_relationships_for(
        self, entity_type: str, entity_id: str
    ) -> list[dict]:
        result = await self.db.execute(
            """
            SELECT * FROM relationships
            WHERE (subject_type = ? AND subject_id = ?)
               OR (object_type  = ? AND object_id  = ?)
            ORDER BY created_at DESC
            """,
            [entity_type, entity_id, entity_type, entity_id],
        )
        return [dict(r) for r in result.rows]

    async def search_persons(self, query: str, limit: int = 20) -> list[dict]:
        result = await self.db.execute(
            """
            SELECT * FROM persons
            WHERE canonical_name LIKE ? OR aliases LIKE ?
            LIMIT ?
            """,
            [f"%{query}%", f"%{query}%", limit],
        )
        return [dict(r) for r in result.rows]
