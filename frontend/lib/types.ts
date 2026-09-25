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

// ── Phase 8: Knowledge Graph, Timeline & Story Engine ────────

export interface EntityItem {
  id: string;
  entity_type: string;
  canonical_name: string;
  description: string | null;
  source: string;
  status: "CANDIDATE" | "VERIFIED" | "REJECTED";
  date: string | null;
  date_precision: string | null;
  language: string;
  location: string | null;
  aliases: string[];
  external_identifiers: Record<string, any>;
  rights: string;
  object_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CytoscapeNodeData {
  id: string;
  label: string;
  type: string;
  description: string | null;
  status: string;
  year: string | null;
  degree: number;
}

export interface CytoscapeNode {
  data: CytoscapeNodeData;
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  status: string;
  confidence: number;
  has_evidence: boolean;
}

export interface CytoscapeEdge {
  data: CytoscapeEdgeData;
}

export interface GraphNeighborhood {
  center_id: string;
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
  total_nodes: number;
  total_edges: number;
}

export interface WhyConnectedEvidence {
  predicate: string;
  subject_name: string;
  object_name: string;
  document_id: string | null;
  document_title: string | null;
  page_number: number | null;
  chunk_id: string | null;
  evidence_text: string;
  viewer_url: string;
  confidence: number;
  status: string;
}

export interface WhyConnectedResponse {
  entity_a: EntityItem;
  entity_b: EntityItem;
  direct_connection: boolean;
  path_length: number;
  connections: WhyConnectedEvidence[];
  summary: string;
}

export interface TimelineEventItem {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  date_precision: "DAY" | "MONTH" | "YEAR" | "RANGE" | "APPROXIMATE" | "UNKNOWN";
  category: string;
  location: string | null;
  related_people: string[];
  related_documents: string[];
  related_topics: string[];
  source: string;
  document_id: string | null;
  page_number: number | null;
  evidence_chunk_id: string | null;
  evidence_text: string | null;
  publication_status: string;
  viewer_url: string | null;
  created_at?: string;
}

export interface StoryItem {
  id: string;
  story_id: string;
  sequence: number;
  title: string;
  narrative_text?: string;
  body?: string;
  document_id: string | null;
  document_title?: string | null;
  page_number: number | null;
  source_chunk_id?: string | null;
  chunk_id?: string | null;
  evidence_quote?: string | null;
  highlighted_passage?: string | null;
  media_type: string;
  media_url: string | null;
  caption?: string | null;
  viewer_url: string | null;
}

export interface StoryCollectionItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  cover_image_url: string | null;
  category: string;
  published: boolean;
  display_order: number;
  items: StoryItem[];
}

// ── Phase 9: Multilingual, Media, Multimodal & Accessibility ──

export interface TranslationResponse {
  source_text: string;
  source_language: string;
  target_language: string;
  translated_text: string;
  translation_model: string;
  translation_version: string;
  review_status: string;
  is_cached: boolean;
  chunk_id?: string | null;
}

export interface TTSResponse {
  audio_url: string;
  filename: string;
  duration_seconds: number;
  language: string;
  voice: string;
  is_cached: boolean;
  generation_type: "ORIGINAL_RECORDING" | "AI_NARRATION";
}

export interface VoiceTranscriptionResponse {
  text: string;
  language: string;
  duration_seconds: number;
  segments: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
}

export interface TranscriptSegment {
  id?: string;
  media_id?: string;
  start_time: number;
  end_time: number;
  text: string;
  language?: string;
  speaker_id?: string;
  speaker_name?: string;
  confidence?: number;
  source?: string;
}

export interface MediaTrack {
  id: string;
  object_id: string;
  title: string;
  asset_type: "audio" | "video";
  duration_seconds?: number;
  duration_secs?: number;
  codec?: string;
  language?: string;
  transcript_language?: string;
  file_path?: string;
  storage_key?: string;
  mime_type?: string;
  description?: string | null;
  recording_date?: string | null;
  segments?: TranscriptSegment[];
}

export interface SpokenSearchResult {
  segment_id: string;
  media_id: string;
  media_title: string;
  asset_type: "audio" | "video";
  timestamp_seconds: number;
  timestamp_str: string;
  speaker_name: string;
  matching_text: string;
  seek_url: string;
}

export interface MultimodalPageAnalysis {
  object_id: string;
  page_number: number;
  layout_type: string;
  visual_structure: {
    has_footnotes: boolean;
    has_signatures: boolean;
    has_tables: boolean;
    has_marginalia: boolean;
    column_count: number;
    visual_condition: string;
  };
  visual_transcription: string;
  has_ocr_conflict: boolean;
  ocr_conflicts: {
    type: string;
    ocr_reading: string;
    visual_reading: string;
    confidence: number;
    explanation: string;
  }[];
  model: string;
}

export type PageActionType =
  | "SUMMARIZE"
  | "EXPLAIN"
  | "TRANSLATE"
  | "READ_ALOUD"
  | "IDENTIFY_ENTITIES"
  | "CUSTOM_QUESTION";

export interface AskPageActionResponse {
  object_id: string;
  page_number: number;
  action: PageActionType;
  language: string;
  answer: string;
  source_attribution: string;
  current_page_citation: {
    source: string;
    document_id: string;
    document_title?: string;
    page_number: number;
    chunk_count?: number;
  };
  related_citations: any[];
  audio_url?: string | null;
  model_name: string;
  took_ms: number;
}

// ── Re-export museum exhibition domain types ──
export * from "../types/museum";

