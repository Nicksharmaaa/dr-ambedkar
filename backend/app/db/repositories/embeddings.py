"""Repository: Vector Embeddings — Turso DiskANN vector search."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.database import DatabaseClient


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


class EmbeddingRepository:
    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def upsert(
        self,
        chunk_id: str,
        model_name: str,
        embedding: list[float],
    ) -> str:
        """Upsert a vector embedding for a chunk."""
        emb_id = _new_id()
        now = _now()

        # Turso stores F32_BLOB vectors via vector() helper function
        # vector() accepts a JSON array of floats
        import json
        vec_json = json.dumps(embedding)

        # Use INSERT OR REPLACE; the UNIQUE(chunk_id, model_name) constraint handles dedup
        await self.db.execute(
            """
            INSERT OR REPLACE INTO embeddings (id, chunk_id, model_name, dimension, embedding, created_at)
            VALUES (?, ?, ?, ?, vector(?), ?)
            """,
            [emb_id, chunk_id, model_name, len(embedding), vec_json, now],
        )
        return emb_id

    async def vector_search(
        self,
        query_embedding: list[float],
        top_k: int = 10,
        model_name: str | None = None,
    ) -> list[dict]:
        """
        Turso DiskANN approximate nearest-neighbor search.
        Returns ranked list of {chunk_id, distance, ...} dicts.
        """
        import json
        vec_json = json.dumps(query_embedding)

        if model_name:
            result = await self.db.execute(
                """
                SELECT e.chunk_id, e.model_name, vt.distance
                FROM vector_top_k('embeddings_vec_idx', vector(?), ?) vt
                JOIN embeddings e ON e.rowid = vt.id
                WHERE e.model_name = ?
                """,
                [vec_json, top_k, model_name],
            )
        else:
            result = await self.db.execute(
                """
                SELECT e.chunk_id, e.model_name, vt.distance
                FROM vector_top_k('embeddings_vec_idx', vector(?), ?) vt
                JOIN embeddings e ON e.rowid = vt.id
                """,
                [vec_json, top_k],
            )
        return [dict(r) for r in result.rows]

    async def get_for_chunk(self, chunk_id: str) -> list[dict]:
        result = await self.db.execute(
            "SELECT id, chunk_id, model_name, dimension, created_at FROM embeddings WHERE chunk_id = ?",
            [chunk_id],
        )
        return [dict(r) for r in result.rows]

    async def count(self) -> int:
        result = await self.db.execute("SELECT COUNT(*) AS cnt FROM embeddings")
        return result.scalar() or 0
