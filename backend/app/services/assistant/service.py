"""
AI Research Assistant Orchestrator — Phase 7
Coordinates the full scholarly research pipeline:
  question
  → intent / mode routing
  → hybrid retrieval (Phase 6)
  → reranking (Phase 6)
  → evidence selection
  → context construction (<ARCHIVAL_EVIDENCE> isolation)
  → generation
  → claim validation (SUPPORTED, PARTIAL, UNSUPPORTED, CONFLICTING)
  → citation mapping & deep-links
  → evidence chain audit logging
  → final answer
"""
from __future__ import annotations

import logging
import time
import uuid
from typing import Any

from app.db.database import DatabaseClient, get_db_client
from app.schemas.assistant import (
    AssistantMode,
    AssistantRequest,
    AssistantResponse,
    CitationItem,
    ClaimValidationItem,
)
from app.services.assistant.citation import resolve_citations
from app.services.assistant.claim_validator import ClaimValidator
from app.services.assistant.evidence_chain import record_evidence_chain
from app.services.assistant.generator import ABSTENTION_TEXT, GroundedGenerator
from app.services.search.hybrid import HybridSearchService

logger = logging.getLogger("ambedkar.assistant.service")


class ResearchAssistantService:
    """Scholarly AI Research Assistant for the Ambedkar Heritage Archive."""

    def __init__(self, db: DatabaseClient | None = None) -> None:
        self.db = db or get_db_client()
        self.search_service = HybridSearchService(self.db)
        self.generator = GroundedGenerator()
        self.claim_validator = ClaimValidator()

    async def answer(self, req: AssistantRequest) -> AssistantResponse:
        """Execute the end-to-end grounded research assistant pipeline."""
        t0 = time.monotonic()
        req_id = str(uuid.uuid4())
        mode = req.mode

        logger.info("Executing assistant request", extra={"mode": mode, "query": req.question[:60], "req_id": req_id})

        # ── Step 1: Mode-Specific Evidence Retrieval ──────────────────────────
        retrieved_chunks: list[dict[str, Any]] = []

        if mode == "ask_page":
            # Direct single-page retrieval from pages table OCR
            retrieved_chunks = await self._retrieve_page_evidence(req.object_id, req.page_number)
        elif mode == "compare" and req.object_id and req.compare_object_id:
            # Dual-volume retrieval for comparative research
            retrieved_chunks = await self._retrieve_compare_evidence(
                req.question, req.object_id, req.compare_object_id, top_k_per_doc=max(3, req.top_k // 2)
            )
        elif mode == "ask_document" and req.object_id:
            # Volume-scoped retrieval
            retrieved_chunks = await self._retrieve_hybrid_evidence(
                req.question, object_id=req.object_id, limit=req.top_k * 2
            )
        elif mode == "research":
            # Deep retrieval pool for Research Mode
            retrieved_chunks = await self._retrieve_hybrid_evidence(
                req.question, limit=max(20, req.top_k * 3)
            )
        else:
            # General archive retrieval (Ask, Explain, Summarize, Find Evidence)
            retrieved_chunks = await self._retrieve_hybrid_evidence(
                req.question, object_id=req.object_id, limit=req.top_k * 2
            )

        # ── Step 2: Evidence Selection (Top-K) ─────────────────────────────────
        target_k = req.top_k if mode != "research" else min(10, max(req.top_k, 8))
        selected_evidence = retrieved_chunks[:target_k]

        # ── Step 3: Grounded Generation ───────────────────────────────────────
        gen_result = await self.generator.generate_response(
            query=req.question,
            evidence_chunks=selected_evidence,
            mode=mode,
        )

        raw_answer = gen_result["answer"]
        model_used = gen_result["model"]
        is_abstention = gen_result["is_abstention"]

        # ── Step 4: Claim Validation & Filtering ──────────────────────────────
        audited_claims: list[ClaimValidationItem] = []
        final_answer = raw_answer

        if req.enable_claim_validation and not is_abstention:
            final_answer, audited_claims, is_abstention = self.claim_validator.audit_response(
                answer=raw_answer,
                evidence_chunks=selected_evidence,
            )

        # ── Step 5: Citation Mapping & Deep-Linking ───────────────────────────
        citations: list[CitationItem] = []
        if not is_abstention:
            citations = resolve_citations(selected_evidence, query=req.question)

        # ── Step 6: Confidence Scoring ────────────────────────────────────────
        confidence = self._compute_confidence(selected_evidence, audited_claims, is_abstention)

        took_ms = round((time.monotonic() - t0) * 1000, 2)

        # ── Step 7: Record Evidence Chain Telemetry ───────────────────────────
        chain_record = record_evidence_chain(
            request_id=req_id,
            question=req.question,
            mode=mode,
            retrieved_chunks=retrieved_chunks,
            selected_evidence=selected_evidence,
            model_name=model_used,
            answer=final_answer,
            citations=[c.model_dump() for c in citations],
            claims=[cl.model_dump() for cl in audited_claims],
            took_ms=took_ms,
            object_id=req.object_id,
            page_number=req.page_number,
        )

        return AssistantResponse(
            question=req.question,
            mode=mode,
            answer=final_answer,
            is_abstention=is_abstention,
            citations=citations,
            claims=audited_claims,
            confidence=confidence,
            model=model_used,
            took_ms=took_ms,
            evidence_chain=chain_record,
        )

    # ── Internal Retrieval Helpers ────────────────────────────────────────────

    async def _retrieve_hybrid_evidence(
        self,
        query: str,
        object_id: str | None = None,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Retrieve evidence chunks via Phase 6 four-component hybrid search with reranking."""
        try:
            res = await self.search_service.search(
                query=query,
                mode="hybrid",
                limit=limit,
                object_id=object_id,
                enable_rerank=True,
            )
            return res.get("results", [])
        except Exception as exc:
            logger.error("Hybrid retrieval failed: %s", exc)
            return []

    async def _retrieve_page_evidence(
        self,
        object_id: str | None,
        page_number: int | None,
    ) -> list[dict[str, Any]]:
        """Retrieve the exact page's OCR text for 'Ask This Page' mode."""
        if not object_id or page_number is None:
            return []

        try:
            res = await self.db.execute(
                """
                SELECT p.id, p.object_id, p.page_number, p.ocr_text AS text,
                       ao.title AS object_title
                FROM pages p
                JOIN archival_objects ao ON ao.id = p.object_id
                WHERE p.object_id = ? AND p.page_number = ?
                LIMIT 1
                """,
                [object_id, page_number],
            )
            if res.rows:
                row = dict(res.rows[0])
                row["chunk_id"] = f"{object_id}-P{page_number}"
                row["reranker_score"] = 1.0
                return [row]
        except Exception as exc:
            logger.error("Page retrieval failed: %s", exc)
        return []

    async def _retrieve_compare_evidence(
        self,
        query: str,
        doc_a: str,
        doc_b: str,
        top_k_per_doc: int = 4,
    ) -> list[dict[str, Any]]:
        """Retrieve targeted evidence from two separate volumes for comparison."""
        res_a = await self._retrieve_hybrid_evidence(query, object_id=doc_a, limit=top_k_per_doc)
        res_b = await self._retrieve_hybrid_evidence(query, object_id=doc_b, limit=top_k_per_doc)
        # Interleave sources
        combined = []
        for a, b in zip(res_a, res_b):
            combined.extend([a, b])
        if len(res_a) > len(res_b):
            combined.extend(res_a[len(res_b):])
        elif len(res_b) > len(res_a):
            combined.extend(res_b[len(res_a):])
        return combined

    def _compute_confidence(
        self,
        evidence: list[dict[str, Any]],
        claims: list[ClaimValidationItem],
        is_abstention: bool,
    ) -> float:
        """Compute holistic factual confidence score [0.0, 1.0]."""
        if is_abstention or not evidence:
            return 0.0

        # Reranker score component
        top_rerank = 0.5
        if evidence and evidence[0].get("reranker_score") is not None:
            top_rerank = float(evidence[0]["reranker_score"])

        # Claim validation score component
        claim_ratio = 1.0
        if claims:
            supported = sum(1.0 for c in claims if c.status == "SUPPORTED")
            partial = sum(0.5 for c in claims if c.status == "PARTIAL")
            claim_ratio = (supported + partial) / len(claims)

        score = (top_rerank * 0.4) + (claim_ratio * 0.6)
        return round(min(1.0, max(0.2, score)), 2)
