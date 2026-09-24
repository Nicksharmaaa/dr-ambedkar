"""
Repository: Archival Objects
All SQL for archival_objects, files, and pages tables.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.database import DatabaseClient, ResultSet


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


class ArchivalObjectRepository:
    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def create(self, data: dict[str, Any]) -> str:
        """Insert a new archival object. Returns the new ID."""
        obj_id = data.get("id") or _new_id()
        now = _now()
        await self.db.execute(
            """
            INSERT INTO archival_objects (
                id, collection_id, stable_id, title, subtitle, object_type,
                language, source_institution, provenance, rights_status,
                creator, publisher, publication_date, description,
                subject_keywords, physical_description, review_status,
                publication_status, file_hash, file_size_bytes,
                original_filename, original_file_key, page_count,
                metadata_json, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?
            )
            """,
            [
                obj_id,
                data.get("collection_id"),
                data.get("stable_id", obj_id),
                data["title"],
                data.get("subtitle"),
                data.get("object_type", "book"),
                data.get("language", "en"),
                data.get("source_institution", ""),
                data.get("provenance", ""),
                data.get("rights_status", "unknown"),
                data.get("creator"),
                data.get("publisher"),
                data.get("publication_date"),
                data.get("description"),
                data.get("subject_keywords"),
                data.get("physical_description"),
                data.get("review_status", "pending"),
                data.get("publication_status", "draft"),
                data.get("file_hash"),
                data.get("file_size_bytes"),
                data.get("original_filename"),
                data.get("original_file_key"),
                data.get("page_count"),
                data.get("metadata_json"),
                now,
                now,
            ],
        )
        return obj_id

    async def get_by_id(self, obj_id: str) -> dict | None:
        result = await self.db.execute(
            "SELECT * FROM archival_objects WHERE id = ?", [obj_id]
        )
        row = result.first()
        return dict(row) if row else None

    async def get_by_stable_id(self, stable_id: str) -> dict | None:
        result = await self.db.execute(
            "SELECT * FROM archival_objects WHERE stable_id = ?", [stable_id]
        )
        row = result.first()
        return dict(row) if row else None

    async def list_paginated(
        self,
        limit: int = 20,
        offset: int = 0,
        object_type: str | None = None,
        collection_id: str | None = None,
        publication_status: str = "published",
    ) -> tuple[list[dict], int]:
        """Returns (rows, total_count)."""
        where_parts = ["publication_status = ?"]
        params: list[Any] = [publication_status]

        if object_type:
            where_parts.append("object_type = ?")
            params.append(object_type)
        if collection_id:
            where_parts.append("collection_id = ?")
            params.append(collection_id)

        where = " AND ".join(where_parts)

        count_result = await self.db.execute(
            f"SELECT COUNT(*) AS cnt FROM archival_objects WHERE {where}", params
        )
        total = count_result.scalar() or 0

        rows_result = await self.db.execute(
            f"""
            SELECT * FROM archival_objects
            WHERE {where}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            params + [limit, offset],
        )
        return [dict(r) for r in rows_result.rows], total

    async def update_status(
        self,
        obj_id: str,
        review_status: str | None = None,
        publication_status: str | None = None,
    ) -> None:
        updates = []
        params: list[Any] = []
        if review_status:
            updates.append("review_status = ?")
            params.append(review_status)
        if publication_status:
            updates.append("publication_status = ?")
            params.append(publication_status)
        if not updates:
            return
        updates.append("updated_at = ?")
        params.append(_now())
        params.append(obj_id)
        await self.db.execute(
            f"UPDATE archival_objects SET {', '.join(updates)} WHERE id = ?", params
        )

    async def delete(self, obj_id: str) -> None:
        await self.db.execute(
            "DELETE FROM archival_objects WHERE id = ?", [obj_id]
        )

    # ── Pages ─────────────────────────────────────────────────────────────────

    async def create_page(self, data: dict[str, Any]) -> str:
        page_id = data.get("id") or _new_id()
        now = _now()
        await self.db.execute(
            """
            INSERT OR REPLACE INTO pages (
                id, object_id, page_number, label,
                image_file_key, thumbnail_key, alto_xml_key,
                ocr_text, ocr_confidence, processing_status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                page_id,
                data["object_id"],
                data["page_number"],
                data.get("label"),
                data.get("image_file_key"),
                data.get("thumbnail_key"),
                data.get("alto_xml_key"),
                data.get("ocr_text"),
                data.get("ocr_confidence"),
                data.get("processing_status", "pending"),
                now,
                now,
            ],
        )
        return page_id

    async def get_pages(self, object_id: str) -> list[dict]:
        result = await self.db.execute(
            "SELECT * FROM pages WHERE object_id = ? ORDER BY page_number", [object_id]
        )
        return [dict(r) for r in result.rows]
