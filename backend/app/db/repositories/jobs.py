"""Repository: Processing Jobs queue."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.database import DatabaseClient


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


class JobRepository:
    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def enqueue(
        self,
        object_id: str,
        job_type: str,
        payload: dict | None = None,
        priority: int = 5,
    ) -> str:
        import json
        job_id = _new_id()
        await self.db.execute(
            """
            INSERT INTO processing_jobs (id, object_id, job_type, status, priority,
                payload_json, queued_at)
            VALUES (?, ?, ?, 'queued', ?, ?, ?)
            """,
            [job_id, object_id, job_type, priority,
             json.dumps(payload) if payload else None, _now()],
        )
        return job_id

    async def dequeue_next(self, job_type: str | None = None) -> dict | None:
        """Fetch the next queued job by priority."""
        if job_type:
            result = await self.db.execute(
                """
                SELECT * FROM processing_jobs
                WHERE status = 'queued' AND job_type = ? AND attempts < max_attempts
                ORDER BY priority DESC, queued_at ASC
                LIMIT 1
                """,
                [job_type],
            )
        else:
            result = await self.db.execute(
                """
                SELECT * FROM processing_jobs
                WHERE status = 'queued' AND attempts < max_attempts
                ORDER BY priority DESC, queued_at ASC
                LIMIT 1
                """
            )
        row = result.first()
        return dict(row) if row else None

    async def mark_running(self, job_id: str, worker_id: str) -> None:
        await self.db.execute(
            """
            UPDATE processing_jobs
            SET status = 'running', started_at = ?, worker_id = ?, attempts = attempts + 1
            WHERE id = ?
            """,
            [_now(), worker_id, job_id],
        )

    async def mark_done(self, job_id: str, result: dict | None = None) -> None:
        import json
        await self.db.execute(
            """
            UPDATE processing_jobs
            SET status = 'done', completed_at = ?, result_json = ?
            WHERE id = ?
            """,
            [_now(), json.dumps(result) if result else None, job_id],
        )

    async def mark_error(self, job_id: str, error: str) -> None:
        await self.db.execute(
            """
            UPDATE processing_jobs
            SET status = 'error', completed_at = ?, error_message = ?
            WHERE id = ?
            """,
            [_now(), error, job_id],
        )

    async def get_job(self, job_id: str) -> dict | None:
        result = await self.db.execute(
            "SELECT * FROM processing_jobs WHERE id = ?", [job_id]
        )
        row = result.first()
        return dict(row) if row else None

    async def list_for_object(self, object_id: str) -> list[dict]:
        result = await self.db.execute(
            "SELECT * FROM processing_jobs WHERE object_id = ? ORDER BY queued_at DESC",
            [object_id],
        )
        return [dict(r) for r in result.rows]
