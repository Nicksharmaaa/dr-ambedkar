/**
 * Typed API Client for Ambedkar Heritage Intelligence & Digital Preservation System.
 * Connects to FastAPI backend via relative `/api/v1` or NEXT_PUBLIC_API_URL.
 */
import {
  ArchivalObject,
  Collection,
  DatabaseHealth,
  DocumentChunk,
  HealthStatus,
  PageResponse,
  PaginatedResponse,
  SearchResponse,
  StorageHealth,
  AssistantModeInfo,
  AssistantRequest,
  AssistantResponse,
  EvidenceChainRecord,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export class ApiError extends Error {
  constructor(public status: number, message: string, public detail?: any) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let detail: any = null;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new ApiError(res.status, `API request failed with status ${res.status}`, detail);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, err.message || "Network error connecting to API");
  }
}

export const api = {
  // Health
  getHealth: () => fetchJson<HealthStatus>("/health"),
  getDatabaseHealth: () => fetchJson<DatabaseHealth>("/health/database"),
  getStorageHealth: () => fetchJson<StorageHealth>("/health/storage"),

  // Collections
  listCollections: () => fetchJson<Collection[]>("/collections"),
  getCollection: (idOrSlug: string) => fetchJson<Collection>(`/collections/${idOrSlug}`),

  // Documents
  listDocuments: (params?: {
    limit?: number;
    offset?: number;
    object_type?: string;
    collection_id?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    if (params?.object_type) q.set("object_type", params.object_type);
    if (params?.collection_id) q.set("collection_id", params.collection_id);
    const query = q.toString() ? `?${q.toString()}` : "";
    return fetchJson<PaginatedResponse<ArchivalObject>>(`/documents${query}`);
  },

  getDocument: (idOrStableId: string) =>
    fetchJson<ArchivalObject>(`/documents/${idOrStableId}`),

  getDocumentPages: (id: string) => fetchJson<PageResponse[]>(`/documents/${id}/pages`),

  getDocumentChunks: (id: string, limit = 50, offset = 0) =>
    fetchJson<PaginatedResponse<DocumentChunk>>(
      `/documents/${id}/chunks?limit=${limit}&offset=${offset}`
    ),

  // Search
  searchArchive: (
    query: string,
    mode: "fts" | "vector" | "hybrid" = "fts",
    limit = 20,
    offset = 0
  ) => {
    const q = new URLSearchParams({
      q: query,
      mode,
      limit: String(limit),
      offset: String(offset),
    });
    return fetchJson<SearchResponse>(`/search?${q.toString()}`);
  },

  // Admin
  getSchemaStatus: () => fetchJson<{ applied_migrations: any[]; count: number }>("/admin/schema/status"),
  initSchema: () => fetchJson<{ message: string; success: boolean }>("/admin/schema/init", {
    method: "POST",
  }),

  // Phase 4 Corpus & RAG
  getCorpusStats: () => fetchJson<{
    total_volumes: number;
    total_chunks: number;
    total_fts_indexed: number;
    volumes: Array<{
      id: string;
      title: string;
      subtitle: string;
      file_size_bytes: number;
      page_count: number;
      created_at: string;
    }>;
    status: string;
  }>("/corpus/stats"),

  searchCorpus: (query: string, top_k = 10, vol_num?: number) =>
    fetchJson<{
      query: string;
      total_found: number;
      results: Array<{
        chunk_id: string;
        doc_id: string;
        vol_num?: number;
        part_num?: number;
        chapter?: string;
        section?: string;
        page_est?: number;
        citation: string;
        text: string;
        score: number;
        match_sources: string[];
      }>;
    }>("/corpus/search", {
      method: "POST",
      body: JSON.stringify({ query, top_k, vol_num }),
    }),

  askCorpus: (question: string, top_k = 6, vol_num?: number) =>
    fetchJson<{
      query: string;
      answer: string;
      confidence: number;
      citations: Array<{
        chunk_id: string;
        doc_id: string;
        vol_num?: number;
        part_num?: number;
        chapter?: string;
        section?: string;
        page_est?: number;
        citation: string;
        text: string;
        score: number;
        match_sources: string[];
      }>;
      sources_used: number;
      model: string;
      timestamp: string;
    }>("/corpus/ask", {
      method: "POST",
      body: JSON.stringify({ question, top_k, vol_num }),
    }),

  // Phase 5 Preservation & IIIF
  getPreservationReport: () =>
    fetchJson<{
      total_objects: number;
      total_bytes: number;
      total_preservation_events: number;
      fixity: {
        total_checks: number;
        passed_checks: number;
        failed_checks: number;
        integrity_rate_pct: number;
      };
      status: string;
      evaluated_at: string;
      recent_events: Array<{
        id: string;
        object_id: string;
        event_type: string;
        event_detail: string;
        event_outcome: string;
        outcome_detail: string;
        agent_name: string;
        event_date: string;
        file_hash_before: string;
        file_hash_after: string;
      }>;
    }>("/preservation/report"),

  getPreservationEvents: (objectId: string) =>
    fetchJson<
      Array<{
        id: string;
        object_id: string;
        event_type: string;
        event_detail: string;
        event_outcome: string;
        outcome_detail: string;
        agent_name: string;
        event_date: string;
        file_hash_before: string;
        file_hash_after: string;
      }>
    >(`/preservation/events/${objectId}`),

  runFixityCheck: (objectId: string) =>
    fetchJson<{
      object_id: string;
      file_key: string;
      stored_hash: string;
      computed_hash: string;
      status: string;
      bytes_checked: number;
      event_id: string;
      verified_at: string;
    }>(`/preservation/fixity-check/${objectId}`, { method: "POST" }),

  runAllFixityChecks: () =>
    fetchJson<{
      total_objects: number;
      verified: number;
      mismatches: number;
      errors: number;
      results: any[];
    }>("/preservation/fixity-check/all", { method: "POST" }),

  getIIIFManifest: (objectId: string) =>
    fetchJson<any>(`/iiif/manifest/${objectId}`),

  getIIIFCanvas: (objectId: string, pageNumber: number) =>
    fetchJson<any>(`/iiif/canvas/${objectId}/${pageNumber}`),

  getIIIFAnnotations: (objectId: string, pageNumber: number) =>
    fetchJson<{
      "@context": string;
      id: string;
      type: string;
      items: Array<{
        id: string;
        type: string;
        motivation: string;
        body: {
          type: string;
          value: string;
          format: string;
          confidence: number;
        };
        target: string;
      }>;
    }>(`/iiif/annotation/${objectId}/${pageNumber}`),

  getIIIFImageUrl: (objectId: string, pageNumber: number) =>
    `${API_BASE}/iiif/image/${objectId}/${pageNumber}/page.svg`,

  // Phase 7 AI Research Assistant
  askAssistant: (req: AssistantRequest) =>
    fetchJson<AssistantResponse>("/assistant/ask", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  askPage: (objectId: string, pageNumber: number, question: string) =>
    fetchJson<AssistantResponse>("/assistant/ask-page", {
      method: "POST",
      body: JSON.stringify({
        object_id: objectId,
        page_number: pageNumber,
        question,
      }),
    }),

  getAssistantModes: () =>
    fetchJson<AssistantModeInfo[]>("/assistant/modes"),

  getAssistantHistory: (limit = 20) =>
    fetchJson<EvidenceChainRecord[]>(`/assistant/history?limit=${limit}`),

  validateClaims: (answer: string, evidenceChunks: any[]) =>
    fetchJson<{
      answer: string;
      claims: any[];
      is_abstention: boolean;
      total_claims: number;
      supported_count: number;
    }>("/assistant/validate-claims", {
      method: "POST",
      body: JSON.stringify({ answer, evidence_chunks: evidenceChunks }),
    }),
};

