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
  EntityItem,
  GraphNeighborhood,
  WhyConnectedResponse,
  TimelineEventItem,
  StoryCollectionItem,
  TranslationResponse,
  TTSResponse,
  VoiceTranscriptionResponse,
  MediaTrack,
  SpokenSearchResult,
  MultimodalPageAnalysis,
  PageActionType,
  AskPageActionResponse,
} from "./types";

function getApiBase(): string {
  let raw = (
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tear-venture-suppliers-many.trycloudflare.com/api/v1"
  ).trim();
  raw = raw.replace(/^["']|["']$/g, "").trim();
  raw = raw.replace(/\/+$/, ""); // Strip trailing slashes
  if (!raw.startsWith("http://") && !raw.startsWith("https://") && !raw.startsWith("/")) {
    raw = `https://${raw}`;
  }
  // Ensure /api/v1 is appended if not present
  if (!raw.endsWith("/api/v1")) {
    if (raw.endsWith("/api")) {
      raw = `${raw}/v1`;
    } else {
      raw = `${raw}/api/v1`;
    }
  }
  return raw;
}

const API_BASE = getApiBase();

export class ApiError extends Error {
  constructor(public status: number, message: string, public detail?: any) {
    super(message);
    this.name = "ApiError";
  }
}

let cachedSessionToken: string | null = null;

export function setSessionToken(token: string | null): void {
  cachedSessionToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        sessionStorage.setItem("ambedkar_auth_token", token);
      } else {
        sessionStorage.removeItem("ambedkar_auth_token");
      }
    } catch {
      // sessionStorage restricted fallback
    }
  }
}

export function getSessionToken(): string | null {
  if (cachedSessionToken) return cachedSessionToken;
  if (typeof window !== "undefined") {
    try {
      cachedSessionToken = sessionStorage.getItem("ambedkar_auth_token");
    } catch {
      // fallback
    }
  }
  return cachedSessionToken;
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  const token = getSessionToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
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
  // Base URLs & Auth
  getBaseUrl: () => API_BASE,
  getDocumentExportUrl: (id: string, format: string = "text") => {
    const token = getSessionToken();
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : "";
    return `${API_BASE}/documents/${id}/export?format=${format}${tokenParam}`;
  },
  getResearchPackExportUrl: () => `${API_BASE}/collections/export/research-pack`,

  // Authentication & RBAC
  acquireRoleSession: async (role: string, fullName?: string) => {
    const res = await fetchJson<{ access_token: string; user: any }>("/auth/session-token", {
      method: "POST",
      body: JSON.stringify({ role, full_name: fullName }),
    });
    if (res?.access_token) {
      setSessionToken(res.access_token);
    }
    return res;
  },
  getCurrentUser: () => fetchJson<any>("/auth/me"),
  logout: async () => {
    try {
      await fetchJson("/auth/logout", { method: "POST" });
    } finally {
      setSessionToken(null);
    }
  },

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

  getDocumentCitations: (id: string) =>
    fetchJson<{
      document_id: string;
      title: string;
      date: string;
      citations: {
        apa: string;
        mla: string;
        chicago: string;
        bibtex: string;
        ris: string;
      };
    }>(`/documents/${id}/citations`),

  // Search
  searchArchive: (
    query: string,
    mode: "fts" | "vector" | "hybrid" = "hybrid",
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

  semanticSearch: (query: string, limit = 20) => {
    return fetchJson<SearchResponse>("/search", {
      method: "POST",
      body: JSON.stringify({ q: query, mode: "hybrid", limit, enable_rerank: true }),
    });
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

  // Phase 8 Knowledge Graph
  getEntity: (id: string) =>
    fetchJson<EntityItem>(`/graph/entities/${id}`),

  getGraphNeighborhood: (id: string, depth = 1, limit = 40) =>
    fetchJson<GraphNeighborhood>(`/graph/entities/${id}/neighbors?depth=${depth}&limit=${limit}`),

  searchGraph: (query: string, entityType?: string, limit = 20) => {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    if (entityType) params.append("entity_type", entityType);
    return fetchJson<{ query: string; total: number; entities: any[] }>(`/graph/search?${params.toString()}`);
  },

  getRelationship: (id: string) =>
    fetchJson<any>(`/graph/relationships/${id}`),

  getRelationshipEvidence: (id: string) =>
    fetchJson<{ relationship_id: string; evidence_count: number; evidence: any[] }>(`/graph/relationships/${id}/evidence`),

  whyConnected: (sourceId: string, targetId: string) =>
    fetchJson<WhyConnectedResponse>(`/graph/why-connected?source_id=${encodeURIComponent(sourceId)}&target_id=${encodeURIComponent(targetId)}`),

  // Phase 8 Timeline
  getTimelineEvents: (params?: { year_from?: number; year_to?: number; category?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.year_from) q.append("year_from", String(params.year_from));
    if (params?.year_to) q.append("year_to", String(params.year_to));
    if (params?.category) q.append("category", params.category);
    if (params?.limit) q.append("limit", String(params.limit));
    if (params?.offset) q.append("offset", String(params.offset));
    const qs = q.toString();
    return fetchJson<TimelineEventItem[]>(`/timeline${qs ? `?${qs}` : ""}`);
  },

  getTimelineEvent: (id: string) =>
    fetchJson<TimelineEventItem>(`/timeline/events/${id}`),

  searchTimeline: (query: string, limit = 20) =>
    fetchJson<TimelineEventItem[]>(`/timeline/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  getTimelineCategories: () =>
    fetchJson<{ categories: { category: string; count: number }[] }>("/timeline/categories"),

  getHeritageLocations: () =>
    fetchJson<{ locations: any[]; count: number }>("/timeline/locations"),

  // Phase 8 Heritage Stories
  getStories: () =>
    fetchJson<StoryCollectionItem[]>("/stories"),

  getStory: (slugOrId: string) =>
    fetchJson<StoryCollectionItem>(`/stories/${slugOrId}`),

  // Phase 9 Multilingual, Media, Voice & Multimodal
  translate: (text: string, targetLanguage: string, sourceLanguage?: string, chunkId?: string) =>
    fetchJson<TranslationResponse>("/indic/translate", {
      method: "POST",
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
        source_language: sourceLanguage,
        chunk_id: chunkId,
      }),
    }),

  synthesizeSpeech: (text: string, language = "en", gender = "female") =>
    fetchJson<TTSResponse>("/indic/tts/synthesize", {
      method: "POST",
      body: JSON.stringify({ text, language, gender }),
    }),

  getEntityLocalizations: (id: string) =>
    fetchJson<{ entity_id: string; localizations: { language: string; localized_name: string; localized_description: string | null }[] }>(`/indic/localizations/entities/${id}`),

  getTimelineLocalizations: (id: string) =>
    fetchJson<{ event_id: string; localizations: { language: string; localized_title: string; localized_description: string | null }[] }>(`/indic/localizations/timeline/${id}`),

  transcribeVoice: async (audioBlob: Blob, language?: string) => {
    const formData = new FormData();
    const ext = audioBlob.type.includes("webm") ? "webm" : audioBlob.type.includes("ogg") ? "ogg" : "wav";
    formData.append("audio", audioBlob, `voice_query.${ext}`);
    if (language) formData.append("language", language);

    const res = await fetch(`${API_BASE}/voice/transcribe`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Voice transcription failed");
    }
    return (await res.json()) as VoiceTranscriptionResponse;
  },

  getMediaTracks: (assetType?: "audio" | "video") =>
    fetchJson<MediaTrack[]>(`/media/tracks${assetType ? `?asset_type=${assetType}` : ""}`),

  getMediaTrack: (id: string) =>
    fetchJson<MediaTrack>(`/media/tracks/${id}`),

  searchSpokenMedia: (q: string, limit = 20) =>
    fetchJson<{ query: string; total: number; matches: SpokenSearchResult[] }>(`/media/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  analyzePageFacsimile: (objectId: string, pageNumber: number) =>
    fetchJson<MultimodalPageAnalysis>("/multimodal/analyze-page", {
      method: "POST",
      body: JSON.stringify({ object_id: objectId, page_number: pageNumber }),
    }),

  askPageAction: (objectId: string, pageNumber: number, action: PageActionType, question?: string, targetLanguage = "en") =>
    fetchJson<AskPageActionResponse>("/assistant/ask-page-action", {
      method: "POST",
      body: JSON.stringify({
        object_id: objectId,
        page_number: pageNumber,
        action,
        question,
        target_language: targetLanguage,
      }),
    }),

  // Phase 9.5 Multilingual Books & Writings Corpus & OCR
  getMultilingualCorpusDashboard: () =>
    fetchJson<any>("/multilingual-corpus/dashboard"),

  getMultilingualWorks: () =>
    fetchJson<any[]>("/multilingual-corpus/works"),

  getMultilingualWorkRelationships: () =>
    fetchJson<any[]>("/multilingual-corpus/relationships"),

  getMultilingualWorkAlignments: (workId?: string) =>
    fetchJson<any[]>(`/multilingual-corpus/alignments${workId ? `?work_id=${encodeURIComponent(workId)}` : ""}`),

  getMultilingualDocuments: (language?: string) =>
    fetchJson<any[]>(`/multilingual-corpus/documents${language ? `?language=${language}` : ""}`),

  getOCRBaseline: () =>
    fetchJson<any>("/ocr/baseline"),

  reviewOCRPage: (docId: string, pageNum: number, reviewedText: string, reviewerNotes?: string) =>
    fetchJson<any>("/ocr/review", {
      method: "POST",
      body: JSON.stringify({
        document_id: docId,
        page_number: pageNum,
        reviewed_text: reviewedText,
        reviewer_notes: reviewerNotes,
      }),
    }),

  // Phase 12 Hardware Integration, Diagnostics & Kiosk Sync
  getHardwareProfile: () =>
    fetchJson<{ profile: string; peripherals: Record<string, any> }>("/hardware/profile"),

  getHardwareEnvironment: () =>
    fetchJson<any>("/hardware/environment/current"),

  getHardwareDiagnostics: () =>
    fetchJson<any>("/hardware/diagnostics"),

  getKioskManifest: () =>
    fetchJson<any>("/kiosk/manifest"),

  getOfflinePackage: () =>
    fetchJson<any>("/kiosk/offline-package"),
};

