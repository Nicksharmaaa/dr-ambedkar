/**
 * TypeScript type definitions for Ambedkar Heritage Intelligence & Digital Preservation System.
 * Fully aligned with backend Pydantic models (v0.2.0-phase2).
 */

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  page: number;
  total_pages: number;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_key: string | null;
  display_order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  object_count?: number;
}

export type ArchivalObjectType =
  | "book"
  | "speech"
  | "letter"
  | "article"
  | "periodical"
  | "photograph"
  | "audio"
  | "video"
  | "legal_document"
  | "manuscript"
  | "constituent_assembly";

export interface ArchivalObject {
  id: string;
  collection_id: string | null;
  stable_id: string;
  title: string;
  subtitle: string | null;
  object_type: ArchivalObjectType;
  language: string;
  source_institution: string;
  provenance: string;
  rights_status: string;
  creator: string | null;
  publisher: string | null;
  publication_date: string | null;
  description: string | null;
  subject_keywords: string | null;
  physical_description: string | null;
  review_status: "pending" | "reviewed" | "approved" | "rejected";
  publication_status: "draft" | "published" | "archived" | "withdrawn";
  file_hash: string | null;
  file_size_bytes: number | null;
  original_filename: string | null;
  original_file_key: string | null;
  page_count: number | null;
  metadata_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  object_id: string;
  page_id: string | null;
  section_id: string | null;
  chunk_index: number;
  text: string;
  language: string;
  token_count: number | null;
  char_count: number | null;
  volume_number: string | null;
  page_number: number | null;
  section_title: string | null;
  is_header: boolean;
  is_footnote: boolean;
  created_at: string;
}

export interface PageResponse {
  id: string;
  object_id: string;
  page_number: number;
  image_key: string | null;
  width: number | null;
  height: number | null;
  alto_xml_key: string | null;
  ocr_confidence: number | null;
  has_handwriting: boolean;
  language_detected: string | null;
}

export interface SearchResultChunk {
  chunk_id: string;
  object_id: string;
  text: string;
  score: number;
  volume_number: string | null;
  page_number: number | null;
  section_title: string | null;
  language: string;
}

export interface SearchResponse {
  query: string;
  mode: "fts" | "vector" | "hybrid";
  results: SearchResultChunk[];
  total: number;
  took_ms: number;
}

export interface HealthStatus {
  status: "ok" | "degraded" | "error";
  service: string;
  version: string;
  environment: string;
}

export interface DatabaseHealth {
  status: "ok" | "error";
  database_url: string;
  latency_ms: number | null;
  tables_verified: string[];
  error: string | null;
}

export interface StorageHealth {
  status: "ok" | "error";
  backend: string;
  root: string;
  write_test: boolean;
  read_test: boolean;
  delete_test: boolean;
  error: string | null;
}

// ── Phase 7 AI Research Assistant ──────────────────────────────────────────

export type AssistantMode =
  | "ask"
  | "explain"
  | "summarize"
  | "compare"
  | "find_evidence"
  | "ask_document"
  | "ask_page"
  | "research";

export type ClaimStatus = "SUPPORTED" | "PARTIAL" | "UNSUPPORTED" | "CONFLICTING";

export interface CitationItem {
  chunk_id: string;
  object_id: string;
  object_title: string | null;
  page_number: number | null;
  section_title: string | null;
  source: string | null;
  excerpt: string;
  viewer_url: string;
  reranker_score: number | null;
}

export interface ClaimValidationItem {
  claim: string;
  status: ClaimStatus;
  supporting_chunk_ids: string[];
  confidence: number;
  explanation: string | null;
}

export interface EvidenceChainRecord {
  request_id: string;
  timestamp: string;
  question: string;
  mode: AssistantMode;
  object_id: string | null;
  page_number: number | null;
  retrieved_candidate_count: number;
  selected_evidence_count: number;
  reranker_scores: number[];
  claims_audited_count: number;
  supported_claim_count: number;
  model_name: string;
  model_version: string;
  total_latency_ms: number;
}

export interface AssistantRequest {
  question: string;
  mode?: AssistantMode;
  object_id?: string | null;
  page_number?: number | null;
  compare_object_id?: string | null;
  top_k?: number;
  enable_claim_validation?: boolean;
}

export interface AssistantResponse {
  question: string;
  mode: AssistantMode;
  answer: string;
  is_abstention: boolean;
  citations: CitationItem[];
  claims: ClaimValidationItem[];
  confidence: number;
  model: string;
  took_ms: number;
  evidence_chain: EvidenceChainRecord | null;
}

export interface AssistantModeInfo {
  mode: AssistantMode;
  name: string;
  description: string;
  requires_object_id: boolean;
  requires_page_number: boolean;
}

