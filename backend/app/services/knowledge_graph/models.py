"""
Phase 8: Knowledge Graph, Timeline, and Heritage Story Models & Enums.
Strictly evidence-backed data structures for archival entities and relationships.
"""
from __future__ import annotations

from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


# ── Entity Types (Mandated by Phase 8 Architecture) ─────────────────────────
class EntityType(str, Enum):
    PERSON = "PERSON"
    WORK = "WORK"
    BOOK = "BOOK"
    SPEECH = "SPEECH"
    MANUSCRIPT = "MANUSCRIPT"
    DOCUMENT = "DOCUMENT"
    PAGE = "PAGE"
    CONSTITUENT_ASSEMBLY_DEBATE = "CONSTITUENT_ASSEMBLY_DEBATE"
    EVENT = "EVENT"
    PLACE = "PLACE"
    ORGANIZATION = "ORGANIZATION"
    TOPIC = "TOPIC"
    CONCEPT = "CONCEPT"
    PHOTOGRAPH = "PHOTOGRAPH"
    AUDIO = "AUDIO"
    VIDEO = "VIDEO"
    COLLECTION = "COLLECTION"
    SOURCE = "SOURCE"


# ── Relationship Predicates ──────────────────────────────────────────────────
class RelationshipPredicate(str, Enum):
    WROTE = "WROTE"
    AUTHORED = "AUTHORED"
    DELIVERED = "DELIVERED"
    PARTICIPATED_IN = "PARTICIPATED_IN"
    MEMBER_OF = "MEMBER_OF"
    MENTIONED = "MENTIONED"
    DISCUSSED = "DISCUSSED"
    ARGUED = "ARGUED"
    RESPONDED_TO = "RESPONDED_TO"
    RELATED_TO = "RELATED_TO"
    OCCURRED_AT = "OCCURRED_AT"
    OCCURRED_ON = "OCCURRED_ON"
    LOCATED_AT = "LOCATED_AT"
    BELONGS_TO = "BELONGS_TO"
    REFERENCES = "REFERENCES"
    DERIVED_FROM = "DERIVED_FROM"
    VERSION_OF = "VERSION_OF"
    SUPPORTS = "SUPPORTS"
    CONTRADICTS = "CONTRADICTS"
    FOLLOWS = "FOLLOWS"
    PRECEDES = "PRECEDES"


# ── Verification Status ──────────────────────────────────────────────────────
class VerificationStatus(str, Enum):
    CANDIDATE = "CANDIDATE"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


# ── Date Precision ───────────────────────────────────────────────────────────
class DatePrecision(str, Enum):
    DAY = "DAY"
    MONTH = "MONTH"
    YEAR = "YEAR"
    RANGE = "RANGE"
    APPROXIMATE = "APPROXIMATE"
    UNKNOWN = "UNKNOWN"


# ── Timeline Categories ──────────────────────────────────────────────────────
class TimelineCategory(str, Enum):
    PERSONAL = "PERSONAL"
    EDUCATION = "EDUCATION"
    SOCIAL_REFORM = "SOCIAL_REFORM"
    POLITICAL = "POLITICAL"
    CONSTITUTIONAL = "CONSTITUTIONAL"
    ECONOMIC = "ECONOMIC"
    ACADEMIC = "ACADEMIC"
    WRITINGS = "WRITINGS"
    SPEECHES = "SPEECHES"
    MOVEMENTS = "MOVEMENTS"
    INSTITUTIONS = "INSTITUTIONS"
    LEGACY = "LEGACY"


# ── Data Schemas ─────────────────────────────────────────────────────────────
class EntityItem(BaseModel):
    id: str
    entity_type: EntityType
    canonical_name: str
    description: str | None = None
    source: str = "archival_corpus"
    status: VerificationStatus = VerificationStatus.VERIFIED
    date: str | None = None
    date_precision: DatePrecision | None = DatePrecision.YEAR
    language: str = "en"
    location: str | None = None
    aliases: list[str] = Field(default_factory=list)
    external_identifiers: dict[str, Any] = Field(default_factory=dict)
    rights: str = "public_domain"
    object_id: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


class RelationshipItem(BaseModel):
    id: str
    subject_id: str
    subject_name: str | None = None
    subject_type: EntityType | None = None
    predicate: RelationshipPredicate
    object_id: str
    object_name: str | None = None
    object_type: EntityType | None = None
    source_document_id: str | None = None
    source_page_id: int | None = None
    source_chunk_id: str | None = None
    evidence_text: str | None = None
    extraction_method: str = "manual_seed"
    created_by: str = "archivist"
    confidence: float = 1.0
    status: VerificationStatus = VerificationStatus.VERIFIED
    viewer_url: str | None = None
    created_at: str | None = None


class WhyConnectedEvidence(BaseModel):
    predicate: str
    subject_name: str
    object_name: str
    document_id: str | None = None
    document_title: str | None = None
    page_number: int | None = None
    chunk_id: str | None = None
    evidence_text: str
    viewer_url: str
    confidence: float = 1.0
    status: str = "VERIFIED"


class WhyConnectedResponse(BaseModel):
    entity_a: EntityItem
    entity_b: EntityItem
    direct_connection: bool
    path_length: int
    connections: list[WhyConnectedEvidence] = Field(default_factory=list)
    summary: str


class CytoscapeNodeData(BaseModel):
    id: str
    label: str
    type: str
    description: str | None = None
    status: str = "VERIFIED"
    year: str | None = None
    degree: int = 1


class CytoscapeEdgeData(BaseModel):
    id: str
    source: str
    target: str
    label: str
    status: str = "VERIFIED"
    confidence: float = 1.0
    has_evidence: bool = True


class CytoscapeNode(BaseModel):
    data: CytoscapeNodeData


class CytoscapeEdge(BaseModel):
    data: CytoscapeEdgeData


class GraphNeighborhood(BaseModel):
    center_id: str
    nodes: list[CytoscapeNode]
    edges: list[CytoscapeEdge]
    total_nodes: int
    total_edges: int


class TimelineEventItem(BaseModel):
    id: str
    title: str
    description: str
    start_date: str
    end_date: str | None = None
    date_precision: DatePrecision = DatePrecision.DAY
    category: TimelineCategory = TimelineCategory.SOCIAL_REFORM
    location: str | None = None
    related_people: list[str] = Field(default_factory=list)
    related_documents: list[str] = Field(default_factory=list)
    related_topics: list[str] = Field(default_factory=list)
    source: str
    evidence_chunk_id: str | None = None
    evidence_text: str | None = None
    document_id: str | None = None
    page_number: int | None = None
    viewer_url: str | None = None
    publication_status: str = "APPROVED"


class StoryItem(BaseModel):
    id: str
    story_id: str
    sequence: int
    title: str
    narrative_text: str
    media_url: str | None = None
    media_type: str = "document"
    document_id: str | None = None
    document_title: str | None = None
    page_number: int | None = None
    chunk_id: str | None = None
    evidence_quote: str | None = None
    viewer_url: str | None = None
    interactive_graph_config: dict[str, Any] | None = None


class StoryCollectionItem(BaseModel):
    id: str
    slug: str
    title: str
    subtitle: str | None = None
    summary: str
    cover_image_url: str | None = None
    category: str = "MEMORIAL"
    published: bool = True
    display_order: int = 0
    items: list[StoryItem] = Field(default_factory=list)
