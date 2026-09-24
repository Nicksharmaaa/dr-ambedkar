"""
Assistant API Routes — Phase 7
Exposes endpoints for the AI Research Assistant, claim validation,
multi-mode queries, and evidence chain history.
"""
from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pydantic import BaseModel, Field

from app.db.database import DatabaseClient, get_db_client
from app.schemas.assistant import (
    AssistantMode,
    AssistantRequest,
    AssistantResponse,
    ClaimValidationItem,
    ModeInfo,
)
from app.services.assistant.claim_validator import ClaimValidator
from app.services.assistant.evidence_chain import list_recent_evidence_chains, get_evidence_chain_by_id
from app.services.assistant.service import ResearchAssistantService

logger = logging.getLogger("ambedkar.api.assistant")

router = APIRouter(prefix="/assistant", tags=["Research Assistant"])


# ── Dependency ───────────────────────────────────────────────────────────────

def get_assistant_service(db: DatabaseClient = Depends(get_db_client)) -> ResearchAssistantService:
    return ResearchAssistantService(db=db)


# ── Modes Metadata ───────────────────────────────────────────────────────────

AVAILABLE_MODES: list[ModeInfo] = [
    ModeInfo(
        mode="ask",
        name="Ask Archive",
        description="Scholarly Q&A strictly grounded in retrieved archival passages.",
    ),
    ModeInfo(
        mode="explain",
        name="Explain Concept",
        description="Detailed pedagogical breakdown of complex theories and doctrines (e.g. social endosmosis, state socialism).",
    ),
    ModeInfo(
        mode="summarize",
        name="Summarize",
        description="Concise executive synthesis of chapters, debates, speeches, or legal provisions.",
    ),
    ModeInfo(
        mode="compare",
        name="Compare Sources",
        description="Structured comparative analysis across two distinct archival volumes or historical periods.",
        requires_object_id=True,
    ),
    ModeInfo(
        mode="find_evidence",
        name="Find Evidence",
        description="Extraction-first search returning verbatim historical quotations with exact citations.",
    ),
    ModeInfo(
        mode="ask_document",
        name="Ask This Document",
        description="Restricts inquiry strictly to a single selected volume.",
        requires_object_id=True,
    ),
    ModeInfo(
        mode="ask_page",
        name="Ask This Page",
        description="Answers questions strictly using the OCR text from the active viewer page.",
        requires_object_id=True,
        requires_page_number=True,
    ),
    ModeInfo(
        mode="research",
        name="Research Mode",
        description="Deep scholar audit: top-20 candidate retrieval, full claim audit, and evidence chain tracking.",
    ),
]


# ── Standalone Request Models ─────────────────────────────────────────────────

class AskPageRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000)
    object_id: str = Field(..., description="Target document ID (e.g. AMBEDKAR-VOL-01)")
    page_number: int = Field(..., ge=1, description="Target printed page number")


class ValidateClaimsRequest(BaseModel):
    answer: str = Field(..., min_length=5)
    evidence_chunk_ids: list[str] = Field(default_factory=list)


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/modes", response_model=list[ModeInfo], summary="List Assistant Modes")
async def get_modes() -> list[ModeInfo]:
    """Return all 8 supported research assistant modes with descriptions."""
    return AVAILABLE_MODES


@router.post("/ask", response_model=AssistantResponse, summary="Query Research Assistant")
async def ask_assistant(
    req: AssistantRequest,
    svc: ResearchAssistantService = Depends(get_assistant_service),
) -> AssistantResponse:
    """
    Primary endpoint for the AI Research Assistant.
    Evaluates query through Phase 6 hybrid search, cross-encoder reranking,
    prompt-isolated generation, claim validation, and citation mapping.
    """
    try:
        return await svc.answer(req)
    except Exception as exc:
        logger.error("Assistant execution failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Assistant execution error: {exc}")


@router.post("/ask-page", response_model=AssistantResponse, summary="Ask This Page")
async def ask_page(
    req: AskPageRequest,
    svc: ResearchAssistantService = Depends(get_assistant_service),
) -> AssistantResponse:
    """Specialized endpoint for querying a single page directly from the Document Viewer."""
    full_req = AssistantRequest(
        question=req.question,
        mode="ask_page",
        object_id=req.object_id,
        page_number=req.page_number,
        top_k=1,
    )
    return await svc.answer(full_req)


@router.post("/ask-page-action", summary="Ask This Page Signature Actions")
async def ask_page_action(
    req: dict = Body(...),
    db: DatabaseClient = Depends(get_db_client),
) -> dict:
    """
    Phase 9 Signature Feature: Execute structured actions on an active document page.
    Actions: SUMMARIZE, EXPLAIN, TRANSLATE, READ_ALOUD, IDENTIFY_ENTITIES, CUSTOM_QUESTION.
    Distinguishes strictly between 'Source: Current Page' and supplementary related citations.
    """
    from app.services.assistant.ask_page import AskPageEngine, AskPageRequest as ActionReq, PageAction
    action_enum = PageAction(req.get("action", "SUMMARIZE"))
    action_req = ActionReq(
        object_id=req["object_id"],
        page_number=int(req["page_number"]),
        action=action_enum,
        question=req.get("question"),
        target_language=req.get("target_language", "en"),
    )
    engine = AskPageEngine(db)
    res = await engine.execute(action_req)
    return res.model_dump()


@router.post("/validate-claims", summary="Validate Claims Against Evidence")
async def validate_claims(
    req: ValidateClaimsRequest,
    db: DatabaseClient = Depends(get_db_client),
) -> dict[str, Any]:
    """Standalone claim verification endpoint auditing statements against specified chunks."""
    validator = ClaimValidator()

    # Load chunks if IDs provided
    evidence: list[dict[str, Any]] = []
    if req.evidence_chunk_ids:
        placeholders = ", ".join(["?"] * len(req.evidence_chunk_ids))
        res = await db.execute(f"SELECT id AS chunk_id, text FROM document_chunks WHERE id IN ({placeholders})", req.evidence_chunk_ids)
        evidence = [dict(r) for r in (res.rows or [])]

    refined_answer, items, is_abstain = validator.audit_response(req.answer, evidence)

    return {
        "is_abstention": is_abstain,
        "claims": [item.model_dump() for item in items],
        "total_claims": len(items),
        "supported": sum(1 for i in items if i.status == "SUPPORTED"),
        "partial": sum(1 for i in items if i.status == "PARTIAL"),
        "unsupported": sum(1 for i in items if i.status == "UNSUPPORTED"),
        "conflicting": sum(1 for i in items if i.status == "CONFLICTING"),
    }


@router.get("/history", summary="Evidence Chain Audit History")
async def get_history(limit: int = Query(default=20, ge=1, le=100)) -> list[dict[str, Any]]:
    """Retrieve recent evidence chain audit records for system inspection."""
    return list_recent_evidence_chains(limit=limit)


@router.get("/history/{request_id}", summary="Get Evidence Chain By ID")
async def get_history_item(request_id: str) -> dict[str, Any]:
    """Retrieve full evidence chain telemetry for a specific request UUID."""
    record = get_evidence_chain_by_id(request_id)
    if not record:
        raise HTTPException(status_code=404, detail="Evidence chain record not found")
    return record
