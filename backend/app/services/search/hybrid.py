"""
Phase 6 — Hybrid Search Service (RRF Orchestrator)

Coordinates all four search components:
  1. FTS5 BM25 lexical search (Turso fts_chunks)
  2. Semantic vector search (TursoVectorStore / Qwen3-Embedding-0.6B)
  3. Metadata filtering (SQL WHERE on language, object_type, date)
  4. Reranking (Qwen3-Reranker-0.6B cross-encoder)

RRF formula: rrf_score(d) = sum(1 / (k + rank_i(d))) for each ranked list
Default k=60 (standard RRF parameter from Cormack et al. 2009).
"""
from __future__ import annotations

import logging
import time
from typing import Any, Literal

from app.db.database import DatabaseClient
from app.db.repositories.chunks import ChunkRepository
from app.services.search.vector_store import TursoVectorStore

logger = logging.getLogger(__name__)

SearchMode = Literal["hybrid", "fts", "vector"]


class HybridSearchService:
    """
    Hybrid search orchestrator.
    Stateless per-request; db client injected at construction.
    """

    RRF_K = 60  # Standard RRF k parameter

    def __init__(self, db: DatabaseClient) -> None:
        self.db         = db
        self.chunk_repo = ChunkRepository(db)
        self.vector_store = TursoVectorStore(db)

    async def search(
        self,
        query: str,
        mode: SearchMode = "hybrid",
        limit: int = 20,
        rerank_k: int = 10,
        language: str | None = None,
        object_type: str | None = None,
        object_id: str | None = None,
        collection_id: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
        enable_rerank: bool = True,
    ) -> dict[str, Any]:
        """
        Execute hybrid search and return enriched result list.

        Returns:
            dict with keys: results, total, took_ms, fts_count, vector_count, mode
        """
        t0 = time.monotonic()

        # ── 0. Multilingual Detection & Cross-Lingual Query Normalization ─────
        from app.services.multilingual.translator import detect_language, TranslationService
        detected_lang = detect_language(query)
        effective_queries = [query]
        translated_query: str | None = None

        if detected_lang != "en":
            try:
                trans_svc = TranslationService(self.db)
                trans_res = await trans_svc.translate(
                    text=query,
                    target_language="en",
                    source_language=detected_lang,
                )
                if trans_res and trans_res.translated_text:
                    translated_query = trans_res.translated_text.strip()
                    if translated_query and translated_query.lower() != query.lower():
                        effective_queries.append(translated_query)
            except Exception as e:
                logger.warning("Cross-lingual query translation failed: %s", e)

        # ── 1. FTS5 Lexical Search ────────────────────────────────────────────
        fts_results: list[dict] = []
        if mode in ("hybrid", "fts"):
            try:
                seen_fts = set()
                for q_term in effective_queries:
                    fts_rows = await self.chunk_repo.fts_search(
                        query=q_term,
                        limit=50,
                        object_id=object_id,
                    )
                    for row in fts_rows:
                        if row["id"] not in seen_fts:
                            seen_fts.add(row["id"])
                            fts_results.append(row)
            except Exception as exc:
                logger.warning("FTS5 search failed", exc_info=exc)

        # ── 2. Semantic Vector Search ─────────────────────────────────────────
        vector_results: list[dict] = []
        if mode in ("hybrid", "vector"):
            try:
                from app.services.search.embedder import EmbeddingEngine
                engine = EmbeddingEngine.get()
                model_name = engine.model_name

                seen_vec = set()
                for q_term in effective_queries:
                    query_vec = engine.embed_query(q_term)
                    vec_hits = await self.vector_store.search(
                        query_embedding=query_vec,
                        top_k=50,
                        model_name=model_name,
                    )
                    for h in vec_hits:
                        if h.chunk_id not in seen_vec:
                            seen_vec.add(h.chunk_id)
                            vector_results.append({"id": h.chunk_id, "vector_score": h.score})
            except Exception as exc:
                logger.warning("Vector search failed", exc_info=exc)

        # ── 3. RRF Merge ──────────────────────────────────────────────────────
        if mode == "hybrid":
            merged = self._rrf_merge(fts_results, vector_results)
        elif mode == "fts":
            merged = [{"id": r.get("id", ""), "rrf_score": 1.0, **r} for r in fts_results]
        else:  # vector
            merged = [{"id": r["id"], "rrf_score": r["vector_score"]} for r in vector_results]

        if not merged:
            return self._empty_response(query, mode, t0, detected_lang, translated_query)

        # ── 4. Enrich with chunk text + metadata ──────────────────────────────
        candidate_ids = [m["id"] for m in merged]
        enriched = await self._enrich_chunks(
            chunk_ids=candidate_ids,
            rrf_scores={m["id"]: m.get("rrf_score", 0.0) for m in merged},
            language=language,
            object_type=object_type,
            collection_id=collection_id,
            date_from=date_from,
            date_to=date_to,
        )

        if not enriched:
            return self._empty_response(query, mode, t0, detected_lang, translated_query)

        # ── 5. Rerank top results ─────────────────────────────────────────────
        reranked = enriched[: min(limit * 2, 40)]  # send top-40 to reranker
        if enable_rerank and len(reranked) > 1:
            try:
                from app.services.search.reranker import RerankerService
                reranker = RerankerService.get()
                passages = [r["text"] for r in reranked]
                scores   = reranker.rerank(query, passages)

                for r, s in zip(reranked, scores):
                    r["reranker_score"] = s

                reranked.sort(key=lambda x: x.get("reranker_score", 0.0), reverse=True)
            except Exception as exc:
                logger.warning("Reranker failed; using RRF order", exc_info=exc)

        final = reranked[:limit]

        # ── 6. Add viewer deep-links ──────────────────────────────────────────
        import urllib.parse
        q_enc = urllib.parse.quote_plus(query)
        for r in final:
            doc_id  = r.get("object_id", "")
            page_no = r.get("page_number", 1) or 1
            r["viewer_url"] = f"/documents/{doc_id}/viewer?page={page_no}&query={q_enc}"

        took_ms = round((time.monotonic() - t0) * 1000, 2)

        return {
            "results":          final,
            "total":            len(final),
            "took_ms":          took_ms,
            "fts_count":        len(fts_results),
            "vector_count":     len(vector_results),
            "mode":             mode,
            "detected_language": detected_lang,
            "translated_query":  translated_query,
        }

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _rrf_merge(
        self,
        fts_results: list[dict],
        vector_results: list[dict],
    ) -> list[dict]:
        """Reciprocal Rank Fusion: rrf_score = sum(1/(k + rank))."""
        scores: dict[str, float] = {}
        meta: dict[str, dict] = {}

        # FTS5 ranked list
        for rank, row in enumerate(fts_results, start=1):
            cid = row.get("id", "")
            if not cid:
                continue
            scores[cid] = scores.get(cid, 0.0) + 1.0 / (self.RRF_K + rank)
            meta[cid]   = row

        # Vector ranked list
        for rank, row in enumerate(vector_results, start=1):
            cid = row.get("id", "")
            if not cid:
                continue
            scores[cid] = scores.get(cid, 0.0) + 1.0 / (self.RRF_K + rank)
            if cid not in meta:
                meta[cid] = row

        # Sort by RRF score descending
        sorted_ids = sorted(scores.keys(), key=lambda c: scores[c], reverse=True)
        return [{"id": cid, "rrf_score": scores[cid], **meta.get(cid, {})} for cid in sorted_ids]

    async def _enrich_chunks(
        self,
        chunk_ids: list[str],
        rrf_scores: dict[str, float],
        language: str | None = None,
        object_type: str | None = None,
        collection_id: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
    ) -> list[dict[str, Any]]:
        """Fetch chunk text + document metadata; apply metadata filters."""
        if not chunk_ids:
            return []

        # Build IN clause
        placeholders = ", ".join(["?"] * len(chunk_ids))
        sql = f"""
            SELECT
                dc.id             AS chunk_id,
                dc.object_id,
                dc.text,
                dc.language,
                dc.page_number,
                dc.volume_number,
                dc.section_title,
                ao.title          AS object_title,
                ao.object_type,
                ao.publication_date
            FROM document_chunks dc
            JOIN archival_objects ao ON ao.id = dc.object_id
            WHERE dc.id IN ({placeholders})
        """
        params: list[Any] = list(chunk_ids)

        if language:
            sql += " AND dc.language = ?"
            params.append(language)
        if object_type:
            sql += " AND ao.object_type = ?"
            params.append(object_type)
        if collection_id:
            sql += " AND ao.collection_id = ?"
            params.append(collection_id)
        if date_from:
            sql += " AND ao.publication_date >= ?"
            params.append(date_from)
        if date_to:
            sql += " AND ao.publication_date <= ?"
            params.append(date_to)

        try:
            result = await self.db.execute(sql, params)
        except Exception as exc:
            logger.error("Enrich query failed", exc_info=exc)
            return []

        enriched: list[dict[str, Any]] = []
        id_set = {r["chunk_id"] for r in result.rows} if result.rows else set()

        for row in (result.rows or []):
            cid = row["chunk_id"]
            enriched.append({
                "chunk_id":      cid,
                "object_id":     row.get("object_id", ""),
                "text":          row.get("text", ""),
                "score":         rrf_scores.get(cid, 0.0),
                "language":      row.get("language", "en"),
                "page_number":   row.get("page_number"),
                "volume_number": row.get("volume_number"),
                "section_title": row.get("section_title"),
                "object_title":  row.get("object_title"),
                "object_type":   row.get("object_type"),
                "reranker_score": None,
            })

        # Sort by RRF score descending (pre-rerank order)
        enriched.sort(key=lambda x: x["score"], reverse=True)
        return enriched

    def _empty_response(
        self,
        query: str,
        mode: str,
        t0: float,
        detected_language: str = "en",
        translated_query: str | None = None,
    ) -> dict:
        return {
            "results":           [],
            "total":             0,
            "took_ms":           round((time.monotonic() - t0) * 1000, 2),
            "fts_count":         0,
            "vector_count":      0,
            "mode":              mode,
            "detected_language": detected_language,
            "translated_query":   translated_query,
        }
