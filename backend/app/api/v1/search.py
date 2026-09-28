"""
Phase 6 — Search API
Full four-component hybrid search: FTS5 BM25, Qwen3-Embedding vector,
metadata filters, RRF merge, Qwen3-Reranker cross-encoder.

Endpoints:
  GET  /api/v1/search              — query-param search (URL-shareable)
  POST /api/v1/search              — POST body search (full options)
  POST /api/v1/search/semantic     — vector-only
  POST /api/v1/search/lexical      — FTS5-only
  GET  /api/v1/search/suggest      — prefix autocomplete
  GET  /api/v1/search/stats        — corpus + index health
"""
from __future__ import annotations

import time
from typing import Literal

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.db.database import get_db_client
from app.schemas.search import (
    SearchRequest,
    SearchResponse,
    SearchResultChunk,
    SearchStats,
    SuggestResult,
)
from app.services.search.hybrid import HybridSearchService

router = APIRouter(prefix="/search", tags=["search"])


# ── Shared helper ──────────────────────────────────────────────────────────────

def _to_result_chunk(r: dict) -> SearchResultChunk:
    return SearchResultChunk(
        chunk_id=r.get("chunk_id", ""),
        object_id=r.get("object_id", ""),
        text=r.get("text", ""),
        score=float(r.get("score", 0.0)),
        reranker_score=r.get("reranker_score"),
        volume_number=r.get("volume_number"),
        page_number=r.get("page_number"),
        section_title=r.get("section_title"),
        object_title=r.get("object_title"),
        language=r.get("language", "en"),
        viewer_url=r.get("viewer_url"),
    )


# ── GET /search ────────────────────────────────────────────────────────────────

@router.get("", response_model=SearchResponse)
async def search_get(
    q: str = Query(..., min_length=1, max_length=500, description="Search query"),
    mode: Literal["fts", "vector", "hybrid"] = Query(default="hybrid"),
    limit: int = Query(default=20, ge=1, le=100),
    language: str | None = Query(default=None),
    object_type: str | None = Query(default=None),
    object_id: str | None = Query(default=None),
    rerank: bool = Query(default=True),
) -> SearchResponse:
    """URL-shareable GET search — supports all three modes."""
    db      = get_db_client()
    service = HybridSearchService(db)

    result = await service.search(
        query=q,
        mode=mode,
        limit=limit,
        language=language,
        object_type=object_type,
        object_id=object_id,
        enable_rerank=rerank,
    )

    return SearchResponse(
        query=q,
        mode=mode,
        results=[_to_result_chunk(r) for r in result["results"]],
        total=result["total"],
        took_ms=result["took_ms"],
        fts_count=result["fts_count"],
        vector_count=result["vector_count"],
        detected_language=result.get("detected_language"),
        translated_query=result.get("translated_query"),
    )


# ── POST /search ───────────────────────────────────────────────────────────────

@router.post("", response_model=SearchResponse)
async def search_post(body: SearchRequest) -> SearchResponse:
    """Full POST body search with all metadata filter options."""
    db      = get_db_client()
    service = HybridSearchService(db)

    result = await service.search(
        query=body.q,
        mode=body.mode,
        limit=body.limit,
        language=body.language,
        object_type=body.object_type,
        object_id=body.object_id,
        collection_id=body.collection_id,
        date_from=body.date_from,
        date_to=body.date_to,
        enable_rerank=body.enable_rerank,
    )

    return SearchResponse(
        query=body.q,
        mode=body.mode,
        results=[_to_result_chunk(r) for r in result["results"]],
        total=result["total"],
        took_ms=result["took_ms"],
        fts_count=result["fts_count"],
        vector_count=result["vector_count"],
        detected_language=result.get("detected_language"),
        translated_query=result.get("translated_query"),
    )


# ── POST /search/semantic ──────────────────────────────────────────────────────

@router.post("/semantic", response_model=SearchResponse)
async def search_semantic(body: SearchRequest) -> SearchResponse:
    """Vector-only semantic search."""
    body.mode = "vector"
    return await search_post(body)


# ── POST /search/lexical ───────────────────────────────────────────────────────

@router.post("/lexical", response_model=SearchResponse)
async def search_lexical(body: SearchRequest) -> SearchResponse:
    """FTS5 BM25 lexical-only search."""
    body.mode = "fts"
    body.enable_rerank = False
    return await search_post(body)


# ── GET /search/suggest ────────────────────────────────────────────────────────

@router.get("/suggest", response_model=list[SuggestResult])
async def search_suggest(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(default=8, ge=1, le=20),
) -> list[SuggestResult]:
    """
    FTS5-based prefix autocomplete from indexed corpus vocabulary.
    Returns matching terms sorted by frequency.
    """
    db = get_db_client()
    from app.db.repositories.chunks import ChunkRepository
    repo = ChunkRepository(db)

    try:
        # Use FTS5 MATCH with prefix: 'query*'
        safe_q = q.replace('"', "").strip()
        result = await db.execute(
            f"""
            SELECT dc.text
            FROM fts_chunks fts
            JOIN document_chunks dc ON dc.rowid = fts.rowid
            WHERE fts_chunks MATCH '{safe_q}*'
            ORDER BY fts.rank
            LIMIT ?
            """,
            [limit],
        )

        seen: set[str] = set()
        suggestions: list[SuggestResult] = []
        for row in (result.rows or []):
            text = (row.get("text") or "")[:200]
            # Extract words matching prefix
            for word in text.split():
                w = word.strip(".,;:\"'()[]").lower()
                if w.startswith(q.lower()) and w not in seen and len(w) > 1:
                    seen.add(w)
                    suggestions.append(SuggestResult(term=w))
                    if len(suggestions) >= limit:
                        break
            if len(suggestions) >= limit:
                break

        return suggestions[:limit]
    except Exception:
        return []


# ── GET /search/stats ──────────────────────────────────────────────────────────

@router.get("/stats", response_model=SearchStats)
async def search_stats() -> SearchStats:
    """Return corpus and search index health metrics."""
    db = get_db_client()

    async def _count(table: str, where: str = "") -> int:
        try:
            sql = f"SELECT COUNT(*) AS cnt FROM {table}"
            if where:
                sql += f" WHERE {where}"
            res = await db.execute(sql)
            row = res.first()
            return int(row["cnt"]) if row else 0
        except Exception:
            return 0

    from app.core.config import settings

    chunk_count     = await _count("document_chunks")
    embedding_count = await _count("embeddings", "embedding_json IS NOT NULL")
    page_count      = await _count("pages")
    doc_count       = await _count("archival_objects")
    fts_count       = await _count("fts_chunks")

    return SearchStats(
        total_chunks=chunk_count,
        total_embeddings=embedding_count,
        total_pages=page_count,
        total_documents=doc_count,
        fts_indexed=fts_count > 0,
        embedding_model=settings.ai_embedding_model,
        embedding_dimension=settings.ai_embedding_dimension,
        embedding_version="v1",
    )
