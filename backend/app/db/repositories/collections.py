"""Repository: Collections."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.database import DatabaseClient


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


class CollectionRepository:
    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def create(self, data: dict[str, Any]) -> str:
        col_id = data.get("id") or _new_id()
        now = _now()
        await self.db.execute(
            """
            INSERT INTO collections (id, slug, title, description, cover_image_key,
                display_order, is_public, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                col_id,
                data["slug"],
                data["title"],
                data.get("description"),
                data.get("cover_image_key"),
                data.get("display_order", 0),
                int(data.get("is_public", True)),
                now,
                now,
            ],
        )
        return col_id

    async def get_by_id(self, col_id: str) -> dict | None:
        result = await self.db.execute(
            "SELECT * FROM collections WHERE id = ?", [col_id]
        )
        row = result.first()
        return dict(row) if row else None

    async def get_by_slug(self, slug: str) -> dict | None:
        result = await self.db.execute(
            "SELECT * FROM collections WHERE slug = ?", [slug]
        )
        row = result.first()
        return dict(row) if row else None

    async def list_public(self) -> list[dict]:
        result = await self.db.execute(
            "SELECT * FROM collections WHERE is_public = 1 ORDER BY display_order, title"
        )
        return [dict(r) for r in result.rows]

    async def list_all(self) -> list[dict]:
        result = await self.db.execute(
            "SELECT * FROM collections ORDER BY display_order, title"
        )
        return [dict(r) for r in result.rows]

    async def count_objects(self, col_id: str) -> int:
        result = await self.db.execute(
            "SELECT COUNT(*) AS cnt FROM archival_objects WHERE collection_id = ?",
            [col_id],
        )
        return result.scalar() or 0
