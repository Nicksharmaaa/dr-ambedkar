"""Repository: Document Chunks + FTS5 lexical search."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.database import DatabaseClient


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


class ChunkRepository:
    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def insert_chunk(self, data: dict[str, Any]) -> str:
        chunk_id = data.get("id") or _new_id()
        now = _now()
        await self.db.execute(
            """
            INSERT OR REPLACE INTO document_chunks (
                id, object_id, page_id, section_id, chunk_index,
                text, language, token_count, char_count,
                volume_number, page_number, section_title,
                is_header, is_footnote, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                chunk_id,
                data["object_id"],
                data.get("page_id"),
                data.get("section_id"),
                data["chunk_index"],
                data["text"],
                data.get("language", "en"),
                data.get("token_count"),
                len(data["text"]),
                data.get("volume_number"),
                data.get("page_number"),
                data.get("section_title"),
                int(data.get("is_header", False)),
                int(data.get("is_footnote", False)),
                now,
            ],
        )
        return chunk_id

    async def bulk_insert_chunks(self, chunks: list[dict[str, Any]]) -> list[str]:
        """Insert multiple chunks efficiently. Returns list of IDs."""
        ids = []
        for chunk in chunks:
            cid = await self.insert_chunk(chunk)
            ids.append(cid)
        return ids

    async def get_chunk(self, chunk_id: str) -> dict | None:
        result = await self.db.execute(
            "SELECT * FROM document_chunks WHERE id = ?", [chunk_id]
        )
        row = result.first()
        return dict(row) if row else None

    async def get_chunks_for_object(
        self,
        object_id: str,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict]:
        result = await self.db.execute(
            """
            SELECT * FROM document_chunks
            WHERE object_id = ?
            ORDER BY chunk_index
            LIMIT ? OFFSET ?
            """,
            [object_id, limit, offset],
        )
        return [dict(r) for r in result.rows]

    async def fts_search(
        self,
        query: str,
        limit: int = 20,
        object_id: str | None = None,
    ) -> list[dict]:
        """
        Full-text search using FTS5 (joined on fts_chunks.chunk_id).
        Returns chunks ranked by BM25 relevance.
        Each row includes 'id' field (chunk_id) for RRF merge compatibility.
        """
        # Escape and sanitize FTS5 special characters
        import re
        clean_terms = re.findall(r"[\w']+", query)
        if not clean_terms:
            return []

        stopwords = {
            "what", "did", "say", "about", "in", "how", "why", "when", "where", "the",
            "a", "an", "is", "are", "was", "were", "to", "of", "and", "or", "for", "by",
            "on", "at", "from", "with", "does", "do", "he", "she", "it", "they", "their",
            "his", "her", "its", "explain", "summarize", "tell", "me", "which", "who",
            "have", "has", "had", "can", "could", "would", "should", "view", "views",
        }

        # First attempt: all terms (AND query)
        safe_query = " ".join(clean_terms)
        queries_to_try = [safe_query]

        # Second attempt: content terms joined with OR for natural language RAG questions
        key_terms = [t for t in clean_terms if t.lower() not in stopwords]
        if key_terms and len(key_terms) > 1 and len(clean_terms) > 2:
            queries_to_try.append(" OR ".join(key_terms))

        for fts_q in queries_to_try:
            try:
                if object_id:
                    result = await self.db.execute(
                        """
                        SELECT dc.id, dc.object_id, dc.text, dc.language,
                               dc.page_number, dc.volume_number, dc.section_title,
                               fts.rank AS fts_rank
                        FROM fts_chunks fts
                        JOIN document_chunks dc ON dc.id = fts.chunk_id
                        WHERE fts_chunks MATCH ?
                          AND dc.object_id = ?
                        ORDER BY fts.rank
                        LIMIT ?
                        """,
                        [fts_q, object_id, limit],
                    )
                else:
                    result = await self.db.execute(
                        """
                        SELECT dc.id, dc.object_id, dc.text, dc.language,
                               dc.page_number, dc.volume_number, dc.section_title,
                               fts.rank AS fts_rank
                        FROM fts_chunks fts
                        JOIN document_chunks dc ON dc.id = fts.chunk_id
                        WHERE fts_chunks MATCH ?
                        ORDER BY fts.rank
                        LIMIT ?
                        """,
                        [fts_q, limit],
                    )

                if result.rows:
                    rows = []
                    for r in result.rows:
                        row = dict(r)
                        row["id"] = row.get("id", "")
                        rows.append(row)
                    return rows
            except Exception:
                continue

        return []

    async def sync_fts_chunk(self, chunk_id: str, text: str, object_id: str) -> None:
        """Insert or replace a single chunk into the FTS5 virtual table."""
        try:
            await self.db.execute(
                "INSERT OR REPLACE INTO fts_chunks (chunk_id, text, object_id) VALUES (?, ?, ?)",
                [chunk_id, text, object_id],
            )
        except Exception:
            pass

    async def count_for_object(self, object_id: str) -> int:
        result = await self.db.execute(
            "SELECT COUNT(*) AS cnt FROM document_chunks WHERE object_id = ?",
            [object_id],
        )
        return result.scalar() or 0
