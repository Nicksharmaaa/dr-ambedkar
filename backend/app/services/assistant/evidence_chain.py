"""
Evidence Chain & Audit Logging — Phase 7
Retains full internal telemetry per research response:
  - question
  - retrieved chunks
  - retrieval scores
  - reranker scores
  - selected evidence
  - model
  - model version
  - answer
  - citations
  - timestamp

Phase 7.5: Records are now also persisted to audit_events table for long-term
audit trail across server restarts.
"""
from __future__ import annotations

import collections
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from app.schemas.assistant import EvidenceChainRecord

logger = logging.getLogger("ambedkar.assistant.evidence_chain")

# Thread-safe in-memory ring buffer for evidence chain audit records (recent 200)
_EVIDENCE_BUFFER: collections.deque[dict[str, Any]] = collections.deque(maxlen=200)


def record_evidence_chain(
    request_id: str,
    question: str,
    mode: str,
    retrieved_chunks: list[dict[str, Any]],
    selected_evidence: list[dict[str, Any]],
    model_name: str,
    answer: str,
    citations: list[dict[str, Any]],
    claims: list[dict[str, Any]],
    took_ms: float,
    object_id: str | None = None,
    page_number: int | None = None,
) -> EvidenceChainRecord:
    """Record an internal audit log of the full retrieval, reranking, and generation chain."""
    now_iso = datetime.now(timezone.utc).isoformat()

    reranker_scores = [
        float(c["reranker_score"])
        for c in selected_evidence
        if c.get("reranker_score") is not None
    ]

    supported_count = sum(
        1 for cl in claims if cl.get("status") == "SUPPORTED"
    )

    record_data = {
        "request_id": request_id,
        "timestamp": now_iso,
        "question": question,
        "mode": mode,
        "object_id": object_id,
        "page_number": page_number,
        "retrieved_candidate_count": len(retrieved_chunks),
        "selected_evidence_count": len(selected_evidence),
        "reranker_scores": reranker_scores,
        "claims_audited_count": len(claims),
        "supported_claim_count": supported_count,
        "model_name": model_name,
        "model_version": "v1",
        "total_latency_ms": round(took_ms, 2),
        "answer_preview": answer[:200],
        "citations_count": len(citations),
    }

    _EVIDENCE_BUFFER.append(record_data)
    logger.info("Evidence chain recorded", extra={"request_id": request_id, "mode": mode, "evidence_count": len(selected_evidence)})

    # Persist to DB audit_events table (best-effort, non-blocking)
    _schedule_db_persist(request_id, mode, object_id, page_number, retrieved_chunks,
                         selected_evidence, claims, model_name, took_ms, citations, answer, now_iso)

    return EvidenceChainRecord(
        request_id=request_id,
        timestamp=now_iso,
        question=question,
        mode=mode,  # type: ignore
        object_id=object_id,
        page_number=page_number,
        retrieved_candidate_count=len(retrieved_chunks),
        selected_evidence_count=len(selected_evidence),
        reranker_scores=reranker_scores,
        claims_audited_count=len(claims),
        supported_claim_count=supported_count,
        model_name=model_name,
        model_version="v1",
        total_latency_ms=round(took_ms, 2),
    )


def _schedule_db_persist(
    request_id: str,
    mode: str,
    object_id: str | None,
    page_number: int | None,
    retrieved_chunks: list[dict],
    selected_evidence: list[dict],
    claims: list[dict],
    model_name: str,
    took_ms: float,
    citations: list[dict],
    answer: str,
    now_iso: str,
) -> None:
    """Fire-and-forget DB write for evidence chain audit record."""
    import asyncio

    supported_count = sum(1 for cl in claims if cl.get("status") == "SUPPORTED")

    details_json = json.dumps({
        "mode": mode,
        "object_id": object_id,
        "page_number": page_number,
        "retrieved_candidate_count": len(retrieved_chunks),
        "selected_evidence_count": len(selected_evidence),
        "claims_audited_count": len(claims),
        "supported_claim_count": supported_count,
        "model_name": model_name,
        "total_latency_ms": round(took_ms, 2),
        "citations_count": len(citations),
        "answer_preview": answer[:200],
    })

    async def _persist() -> None:
        try:
            from app.db.database import get_db_client
            db = get_db_client()
            await db.execute(
                """
                INSERT INTO audit_events (id, action, resource, resource_id, details, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [str(uuid.uuid4()), "assistant_query", "evidence_chain", request_id, details_json, now_iso],
            )
        except Exception as exc:
            logger.warning("Evidence chain DB persistence failed: %s", exc)

    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_persist())
    except RuntimeError:
        pass  # No running event loop (e.g. unit tests) — skip DB write


def list_recent_evidence_chains(limit: int = 50) -> list[dict[str, Any]]:
    """Retrieve recent evidence chains for audit and inspection."""
    return list(_EVIDENCE_BUFFER)[-limit:]


def get_evidence_chain_by_id(request_id: str) -> dict[str, Any] | None:
    """Retrieve a specific evidence chain by UUID."""
    for item in _EVIDENCE_BUFFER:
        if item.get("request_id") == request_id:
            return item
    return None
