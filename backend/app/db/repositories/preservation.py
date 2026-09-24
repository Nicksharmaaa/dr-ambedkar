"""Repository: Preservation Events (PREMIS 3.0) and Audit Events."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.database import DatabaseClient


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


class PreservationRepository:
    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def log_preservation_event(
        self,
        object_id: str | None,
        event_type: str,
        event_detail: str,
        event_outcome: str,
        agent_name: str,
        agent_type: str = "software",
        outcome_detail: str | None = None,
        file_hash_before: str | None = None,
        file_hash_after: str | None = None,
    ) -> str:
        event_id = _new_id()
        await self.db.execute(
            """
            INSERT INTO preservation_events (
                id, object_id, event_type, event_detail, event_outcome,
                outcome_detail, agent_name, agent_type, event_date,
                file_hash_before, file_hash_after
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                event_id, object_id, event_type, event_detail, event_outcome,
                outcome_detail, agent_name, agent_type, _now(),
                file_hash_before, file_hash_after,
            ],
        )
        return event_id

    async def get_preservation_events(self, object_id: str) -> list[dict]:
        result = await self.db.execute(
            "SELECT * FROM preservation_events WHERE object_id = ? ORDER BY event_date DESC",
            [object_id],
        )
        return [dict(r) for r in result.rows]

    async def log_audit_event(
        self,
        action: str,
        resource: str,
        user_id: str | None = None,
        resource_id: str | None = None,
        details: dict | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> str:
        import json
        event_id = _new_id()
        await self.db.execute(
            """
            INSERT INTO audit_events (
                id, user_id, action, resource, resource_id,
                details, ip_address, user_agent, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                event_id, user_id, action, resource, resource_id,
                json.dumps(details) if details else None,
                ip_address, user_agent, _now(),
            ],
        )
        return event_id

    async def get_recent_audit_events(self, limit: int = 100) -> list[dict]:
        result = await self.db.execute(
            "SELECT * FROM audit_events ORDER BY created_at DESC LIMIT ?",
            [limit],
        )
        return [dict(r) for r in result.rows]
