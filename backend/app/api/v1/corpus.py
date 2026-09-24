"""
Corpus & AI RAG API Endpoints — Phase 4
Routes for corpus stats, hybrid search, grounded Q&A (RAG), and streaming responses.
"""
from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app.db.database import get_db_client, DatabaseClient
from app.services.corpus.rag import AmbedkarRAGService
from app.services.corpus.search import HybridSearchService

logger = logging.getLogger("ambedkar.api.corpus")

router = APIRouter(prefix="/corpus", tags=["Corpus & AI Intelligence"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Search term or phrase")
    top_k: int = Field(default=10, ge=1, le=50, description="Max results to return")
    vol_num: int | None = Field(default=None, description="Optional volume filter (e.g. 1)")


class AskRequest(BaseModel):
    question: str = Field(..., min_length=3, description="Scholarly question for Ambedkar AI")
    top_k: int = Field(default=6, ge=1, le=20, description="Number of evidence chunks to retrieve")
    vol_num: int | None = Field(default=None, description="Optional volume filter")


# ── Dependencies ─────────────────────────────────────────────────────────────

def get_search_service(db: DatabaseClient = Depends(get_db_client)) -> HybridSearchService:
    return HybridSearchService(db=db)


def get_rag_service(db: DatabaseClient = Depends(get_db_client)) -> AmbedkarRAGService:
    search_svc = HybridSearchService(db=db)
    return AmbedkarRAGService(search_service=search_svc)


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/stats", summary="Corpus Ingestion & Indexing Statistics")
async def get_corpus_stats(db: DatabaseClient = Depends(get_db_client)) -> dict[str, Any]:
    """Return overview of all ingested volumes and chunks in Turso."""
    try:
        docs_res = await db.execute(
            """
            SELECT id, stable_id, title, subtitle, file_size_bytes, page_count, created_at, metadata_json
            FROM archival_objects
            ORDER BY id
            """
        )
        chunks_res = await db.execute("SELECT count(*) as c FROM chunks")
        fts_res = await db.execute("SELECT count(*) as c FROM chunks_fts")

        volumes = []
        for row in docs_res.rows:
            volumes.append({
                "id": row.get("id"),
                "title": row.get("title"),
                "subtitle": row.get("subtitle"),
                "file_size_bytes": row.get("file_size_bytes"),
                "page_count": row.get("page_count"),
                "created_at": row.get("created_at"),
            })

        total_chunks = chunks_res.rows[0]["c"] if chunks_res.rows else 0
        total_fts = fts_res.rows[0]["c"] if fts_res.rows else 0

        return {
            "total_volumes": len(volumes),
            "total_chunks": total_chunks,
            "total_fts_indexed": total_fts,
            "volumes": volumes,
            "status": "ready" if total_chunks > 0 else "ingesting",
        }
    except Exception as e:
        logger.error("Failed fetching corpus stats: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", summary="Hybrid Search (FTS5 + Vector with RRF)")
async def hybrid_search(
    req: SearchRequest,
    search_svc: HybridSearchService = Depends(get_search_service),
) -> dict[str, Any]:
    """Execute hybrid search across the Ambedkar archival corpus."""
    try:
        results = await search_svc.search(
            query=req.query,
            top_k=req.top_k,
            vol_filter=req.vol_num,
        )
        return {
            "query": req.query,
            "total_found": len(results),
            "results": [r.to_dict() for r in results],
        }
    except Exception as e:
        logger.error("Search failed for '%s': %s", req.query, e)
        raise HTTPException(status_code=500, detail=f"Search failed: {e}")


@router.post("/ask", summary="Evidence-Grounded RAG Answer")
async def ask_ambedkar(
    req: AskRequest,
    rag_svc: AmbedkarRAGService = Depends(get_rag_service),
) -> dict[str, Any]:
    """
    Ask a question grounded strictly in Dr. Ambedkar's writings.
    Zero hallucination: quotes and claims are attributed to volume, chapter, and page.
    """
    try:
        res = await rag_svc.ask(
            question=req.question,
            top_k=req.top_k,
            vol_filter=req.vol_num,
        )
        return res
    except Exception as e:
        logger.error("RAG failed for '%s': %s", req.question, e)
        raise HTTPException(status_code=500, detail=f"RAG failed: {e}")


@router.get("/ask/stream", summary="Stream Evidence-Grounded RAG (SSE)")
async def stream_ask_ambedkar(
    question: str = Query(..., min_length=3, description="User question"),
    top_k: int = Query(default=6, ge=1, le=15),
    vol_num: int | None = Query(default=None),
    rag_svc: AmbedkarRAGService = Depends(get_rag_service),
):
    """
    Server-Sent Events (SSE) streaming endpoint for the AI assistant.
    Yields events with tokens, source citations, and confidence.
    """
    generator = rag_svc.ask_stream(
        question=question,
        top_k=top_k,
        vol_filter=vol_num,
    )
    return EventSourceResponse(generator)
