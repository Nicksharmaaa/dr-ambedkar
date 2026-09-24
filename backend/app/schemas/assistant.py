"""
Pydantic schemas for Phase 7 AI Research Assistant.
Defines requests, responses, citations, claims, and evidence chain data models.
"""
from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field


AssistantMode = Literal[
    "ask",
    "explain",
    "summarize",
    "compare",
    "find_evidence",
    "ask_document",
    "ask_page",
    "research",
]

ClaimStatus = Literal[
    "SUPPORTED",
    "PARTIAL",
    "UNSUPPORTED",
    "CONFLICTING",
]


class CitationItem(BaseModel):
    """Exposes verified provenance for a retrieved archival excerpt."""
    chunk_id: str = Field(..., description="Unique database UUID of the chunk")
    object_id: str = Field(..., description="Archival object ID (e.g. AMBEDKAR-VOL-13)")
    object_title: str | None = Field(default=None, description="Human-readable title of the volume")
    page_number: int | None = Field(default=None, description="Verified printed page number")
    section_title: str | None = Field(default=None, description="Section or chapter heading")
    source: str | None = Field(default=None, description="Source institution or collection")
    excerpt: str = Field(..., description="1-2 sentence verbatim evidence excerpt")
    viewer_url: str = Field(..., description="Deep-link URL opening the exact page in Document Viewer")
    reranker_score: float | None = Field(default=None, description="Cross-encoder relevance score [0, 1]")


class ClaimValidationItem(BaseModel):
    """Represents an atomic factual claim audited against archival evidence."""
    claim: str = Field(..., description="Atomic factual assertion extracted from answer")
    status: ClaimStatus = Field(..., description="Validation outcome: SUPPORTED, PARTIAL, UNSUPPORTED, CONFLICTING")
    supporting_chunk_ids: list[str] = Field(default_factory=list, description="IDs of chunks supporting this claim")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Verification confidence score")
    explanation: str | None = Field(default=None, description="Audit rationale or discrepancy note")


class EvidenceChainRecord(BaseModel):
    """Internal audit record retaining the end-to-end reasoning and retrieval chain."""
    request_id: str
    timestamp: str
    question: str
    mode: AssistantMode
    object_id: str | None = None
    page_number: int | None = None
    retrieved_candidate_count: int
    selected_evidence_count: int
    reranker_scores: list[float] = Field(default_factory=list)
    claims_audited_count: int
    supported_claim_count: int
    model_name: str
    model_version: str
    total_latency_ms: float


class AssistantRequest(BaseModel):
    """Payload for asking the research assistant."""
    question: str = Field(..., min_length=2, max_length=1500, description="Scholarly research question")
    mode: AssistantMode = Field(default="ask", description="Research assistant mode")
    object_id: str | None = Field(default=None, description="Optional target volume for document-scoped queries")
    page_number: int | None = Field(default=None, description="Optional page number for page-scoped queries")
    compare_object_id: str | None = Field(default=None, description="Secondary volume ID for compare mode")
    top_k: int = Field(default=5, ge=1, le=15, description="Number of evidence chunks to assemble into context")
    enable_claim_validation: bool = Field(default=True, description="Whether to audit factual claims before returning")


class AssistantResponse(BaseModel):
    """Final scholarly response returned by the research assistant."""
    question: str
    mode: AssistantMode
    answer: str
    is_abstention: bool = False
    citations: list[CitationItem] = Field(default_factory=list)
    claims: list[ClaimValidationItem] = Field(default_factory=list)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    model: str
    took_ms: float
    evidence_chain: EvidenceChainRecord | None = None


class ModeInfo(BaseModel):
    mode: AssistantMode
    name: str
    description: str
    requires_object_id: bool = False
    requires_page_number: bool = False
