"""
Hybrid Search Service — Phase 4
Combines Lexical Search (Turso FTS5 with BM25) and Semantic Search (Embeddings)
using Reciprocal Rank Fusion (RRF).
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Any, Sequence

from app.core.config import settings
from app.db.database import get_db_client, DatabaseClient
from app.services.corpus.embedder import CorpusEmbedder

logger = logging.getLogger("ambedkar.corpus.search")


@dataclass
class SearchResult:
    chunk_id: str
    doc_id: str
    vol_num: int | None
    part_num: int | None
    chapter: str | None
    section: str | None
    page_est: int | None
    text: str
    score: float
    lexical_rank: int | None = None
    semantic_rank: int | None = None
    match_sources: list[str] | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "doc_id": self.doc_id,
            "vol_num": self.vol_num,
            "part_num": self.part_num,
            "chapter": self.chapter,
            "section": self.section,
            "page_est": self.page_est,
            "citation": self.citation,
            "text": self.text,
            "score": round(self.score, 4),
            "lexical_rank": self.lexical_rank,
            "semantic_rank": self.semantic_rank,
            "match_sources": self.match_sources or [],
        }

    @property
    def citation(self) -> str:
        vol_str = f"Vol. {self.vol_num}"
        if self.part_num:
            vol_str += f" (Part {self.part_num})"
        parts = [vol_str]
        if self.chapter:
            parts.append(self.chapter)
        if self.page_est:
            parts.append(f"p. ~{self.page_est}")
        return " — ".join(parts)


def _sanitize_fts_query(query: str) -> str:
    """Sanitize user query for SQLite FTS5 syntax."""
    # Remove characters that can break FTS5 parser
    cleaned = re.sub(r'[^\w\s\-\"\']', ' ', query).strip()
    words = [w for w in cleaned.split() if len(w) > 1]
    if not words:
        return cleaned or "Ambedkar"
    # Form an OR or phrase query
    return " OR ".join(f'"{w}"' for w in words)


class HybridSearchService:
    def __init__(
        self,
        db: DatabaseClient | None = None,
        embedder: CorpusEmbedder | None = None,
        rrf_k: int = 60,
    ) -> None:
        self.db = db or get_db_client()
        self.embedder = embedder or CorpusEmbedder()
        self.rrf_k = rrf_k

    async def search_lexical(
        self,
        query: str,
        limit: int = 20,
        vol_filter: int | None = None,
    ) -> list[dict[str, Any]]:
        """Query FTS5 full-text index with BM25 rank."""
        fts_query = _sanitize_fts_query(query)
        try:
            sql = """
                SELECT
                    f.chunk_id,
                    f.doc_id,
                    f.chapter,
                    f.text,
                    c.vol_num,
                    c.part_num,
                    c.section,
                    c.page_est,
                    f.rank
                FROM chunks_fts f
                JOIN chunks c ON f.chunk_id = c.id
                WHERE chunks_fts MATCH ?
            """
            params: list[Any] = [fts_query]

            if vol_filter is not None:
                sql += " AND c.vol_num = ?"
                params.append(vol_filter)

            sql += " ORDER BY f.rank ASC LIMIT ?"
            params.append(limit)

            res = await self.db.execute(sql, params)
            return [dict(row) for row in res.rows]
        except Exception as e:
            logger.warning("FTS5 search error: %s (query=%s)", e, fts_query)
            # Fallback to simple LIKE search if FTS query syntax error
            try:
                like_sql = """
                    SELECT id as chunk_id, doc_id, chapter, text, vol_num, part_num, section, page_est, 1.0 as rank
                    FROM chunks
                    WHERE text LIKE ?
                """
                like_params: list[Any] = [f"%{query}%"]
                if vol_filter is not None:
                    like_sql += " AND vol_num = ?"
                    like_params.append(vol_filter)
                like_sql += " LIMIT ?"
                like_params.append(limit)
                fallback_res = await self.db.execute(like_sql, like_params)
                return [dict(row) for row in fallback_res.rows]
            except Exception as e2:
                logger.error("Fallback LIKE search failed: %s", e2)
                return []

    async def search_semantic(
        self,
        query: str,
        limit: int = 20,
        vol_filter: int | None = None,
    ) -> list[dict[str, Any]]:
        """Query vector index if embeddings exist."""
        try:
            # Check if embeddings table has rows
            chk = await self.db.execute("SELECT count(*) as c FROM embeddings")
            if not chk.rows or chk.rows[0]["c"] == 0:
                return []

            import asyncio
            q_vec = await asyncio.to_thread(self.embedder.embed_text, query, True)
            # LibSQL vector query
            sql = """
                SELECT
                    c.id as chunk_id,
                    c.doc_id,
                    c.chapter,
                    c.text,
                    c.vol_num,
                    c.part_num,
                    c.section,
                    c.page_est,
                    vector_distance_cos(e.embedding, vector32(?)) as dist
                FROM embeddings e
                JOIN chunks c ON e.chunk_id = c.id
            """
            params: list[Any] = [str(q_vec)]
            if vol_filter is not None:
                sql += " WHERE c.vol_num = ?"
                params.append(vol_filter)
            sql += " ORDER BY dist ASC LIMIT ?"
            params.append(limit)

            res = await self.db.execute(sql, params)
            return [dict(row) for row in res.rows]
        except Exception as e:
            logger.debug("Semantic search skipped or failed: %s", e)
            return []

    async def search(
        self,
        query: str,
        top_k: int = 10,
        vol_filter: int | None = None,
    ) -> list[SearchResult]:
        """
        Execute Hybrid Search using Reciprocal Rank Fusion (RRF).
        RRF_score(d) = 1 / (K + rank_lexical) + 1 / (K + rank_semantic)
        """
        fetch_limit = max(top_k * 3, 30)

        # 1. Fetch lexical and semantic candidates in parallel
        lexical_hits = await self.search_lexical(query, limit=fetch_limit, vol_filter=vol_filter)
        semantic_hits = await self.search_semantic(query, limit=fetch_limit, vol_filter=vol_filter)

        # 2. Merge via RRF
        scores: dict[str, float] = {}
        items: dict[str, dict[str, Any]] = {}
        lex_ranks: dict[str, int] = {}
        sem_ranks: dict[str, int] = {}
        sources: dict[str, list[str]] = {}

        # Process lexical results
        for rank, hit in enumerate(lexical_hits, 1):
            cid = hit["chunk_id"]
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank))
            items[cid] = hit
            lex_ranks[cid] = rank
            sources.setdefault(cid, []).append("lexical")

        # Process semantic results
        for rank, hit in enumerate(semantic_hits, 1):
            cid = hit["chunk_id"]
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank))
            items[cid] = hit
            sem_ranks[cid] = rank
            sources.setdefault(cid, []).append("semantic")

        # 3. Sort by combined RRF score descending
        sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)[:top_k]

        results: list[SearchResult] = []
        for cid in sorted_ids:
            hit = items[cid]
            results.append(
                SearchResult(
                    chunk_id=cid,
                    doc_id=hit.get("doc_id", ""),
                    vol_num=hit.get("vol_num"),
                    part_num=hit.get("part_num"),
                    chapter=hit.get("chapter"),
                    section=hit.get("section"),
                    page_est=hit.get("page_est"),
                    text=hit.get("text", ""),
                    score=scores[cid],
                    lexical_rank=lex_ranks.get(cid),
                    semantic_rank=sem_ranks.get(cid),
                    match_sources=sources.get(cid, []),
                )
            )

        return results
