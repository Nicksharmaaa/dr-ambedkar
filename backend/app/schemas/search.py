"""Pydantic schemas for Phase 6 Search — hybrid RRF, reranking, deep-links."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class SearchRequest(BaseModel):
    """POST body for hybrid search."""
    q: str = Field(default="", min_length=1, max_length=500, description="Search query")
    mode: Literal["fts", "vector", "hybrid"] = "hybrid"
    limit: int = Field(default=20, ge=1, le=100)
    language: str | None = None
    object_type: str | None = None
    object_id: str | None = None
    collection_id: str | None = None
    date_from: str | None = None
    date_to: str | None = None
    enable_rerank: bool = True

    @model_validator(mode="before")
    @classmethod
    def _normalize_query_param(cls, data: Any) -> Any:
        if isinstance(data, dict):
            q_val = data.get("q") or data.get("query")
            if q_val:
                data["q"] = q_val
        return data


class SearchResultChunk(BaseModel):
    chunk_id: str
    object_id: str
    text: str
    score: float                         # RRF score
    reranker_score: float | None = None  # Cross-encoder score (if reranking enabled)
    volume_number: str | None = None
    page_number: int | None = None
    section_title: str | None = None
    object_title: str | None = None
    language: str = "en"
    viewer_url: str | None = None        # Deep-link to archival viewer at exact page


class SearchResponse(BaseModel):
    query: str
    mode: str
    results: list[SearchResultChunk]
    total: int
    took_ms: float
    fts_count: int = 0
    vector_count: int = 0
    detected_language: str | None = None
    translated_query: str | None = None


class SearchStats(BaseModel):
    total_chunks: int
    total_embeddings: int
    total_pages: int
    total_documents: int
    fts_indexed: bool
    embedding_model: str
    embedding_dimension: int
    embedding_version: str


class SuggestResult(BaseModel):
    term: str
    count: int = 1
