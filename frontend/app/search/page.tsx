"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Layers,
  Database,
  SlidersHorizontal,
  FileText,
  Clock,
  ArrowUpRight,
  BookOpen,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  BarChart2,
  Zap,
  Info,
  Mic,
} from "lucide-react";
import { api } from "@/lib/api";
import { SearchResultChunk } from "@/lib/types";
import { VoiceSearchModal } from "@/components/voice/VoiceSearchModal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SearchStats {
  total_chunks: number;
  total_embeddings: number;
  total_pages: number;
  total_documents: number;
  fts_indexed: boolean;
  embedding_model: string;
  embedding_dimension: number;
  embedding_version: string;
}

interface EnrichedResult extends SearchResultChunk {
  reranker_score?: number | null;
  viewer_url?: string | null;
  object_title?: string | null;
}

interface SearchResponse {
  query: string;
  mode: string;
  results: EnrichedResult[];
  total: number;
  took_ms: number;
  fts_count?: number;
  vector_count?: number;
  detected_language?: string | null;
  translated_query?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return text;
  const pattern = new RegExp(`(${words.join("|")})`, "gi");
  return text.replace(pattern, "**$1**");
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const highlighted = highlightText(text, query);
  const parts = highlighted.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="bg-amber-400/20 text-amber-300 rounded px-0.5 not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats Bar
// ─────────────────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: SearchStats | null }) {
  if (!stats) return null;
  return (
    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 py-2 px-3 bg-slate-900/60 border border-slate-800 rounded-lg">
      <span className="flex items-center gap-1">
        <BarChart2 className="h-3 w-3 text-amber-400" />
        <span>{stats.total_documents} docs</span>
      </span>
      <span className="text-slate-700">|</span>
      <span>{stats.total_chunks.toLocaleString()} chunks</span>
      <span className="text-slate-700">|</span>
      <span>{stats.total_embeddings.toLocaleString()} embeddings</span>
      <span className="text-slate-700">|</span>
      <span className="truncate max-w-[140px]" title={stats.embedding_model}>
        {stats.embedding_model.split("/").pop()}
      </span>
      {stats.fts_indexed && (
        <>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" />
            FTS5 indexed
          </span>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Card
// ─────────────────────────────────────────────────────────────────────────────

function ResultCard({
  result,
  idx,
  query,
}: {
  result: EnrichedResult;
  idx: number;
  query: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const shortText = result.text.length > 320 ? result.text.slice(0, 320) + "…" : result.text;

  return (
    <div className="glass-card rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-mono text-[10px] border border-amber-500/20">
            #{idx + 1}
          </span>
          {result.object_title && (
            <span className="font-serif italic text-slate-300 text-xs truncate max-w-[260px]">
              {result.object_title}
            </span>
          )}
          {result.section_title && (
            <span className="text-slate-500 text-[11px]">— {result.section_title}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono shrink-0">
          {result.volume_number && (
            <span className="text-slate-500">Vol. {result.volume_number}</span>
          )}
          {result.page_number && (
            <span className="text-slate-500">p. {result.page_number}</span>
          )}
          {result.reranker_score != null && (
            <span
              className="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/25"
              title="Reranker cross-encoder score"
            >
              ⚡ {result.reranker_score.toFixed(3)}
            </span>
          )}
          <span
            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
            title="RRF relevance score"
          >
            {result.score.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <p className="font-serif text-slate-200 text-sm leading-relaxed">
          <HighlightedText
            text={expanded ? result.text : shortText}
            query={query}
          />
        </p>
        {result.text.length > 320 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show more
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/60 bg-slate-950/30">
        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
          {result.object_id}
        </span>
        <div className="flex items-center gap-2">
          {result.viewer_url && (
            <Link
              href={result.viewer_url}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 font-semibold text-[11px] rounded-md transition-all"
            >
              <Eye className="h-3 w-3" />
              <span>Open in Viewer</span>
            </Link>
          )}
          <Link
            href={`/documents/${result.object_id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 font-semibold text-[11px] rounded-md transition-all"
          >
            <BookOpen className="h-3 w-3" />
            <span>Document</span>
            <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Panel
// ─────────────────────────────────────────────────────────────────────────────

interface Filters {
  language: string;
  object_type: string;
  date_from: string;
  date_to: string;
  enable_rerank: boolean;
}

function FilterPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (key: keyof Filters, value: string | boolean) => void;
  onReset: () => void;
}) {
  const hasActive =
    filters.language || filters.object_type || filters.date_from || filters.date_to;

  return (
    <div className="mt-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
          Metadata Filters
        </span>
        {hasActive && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-[11px]"
          >
            <X className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Language */}
        <div>
          <label htmlFor="search-filter-language" className="block text-[10px] text-slate-500 mb-1">Language</label>
          <select
            id="search-filter-language"
            name="search_filter_language"
            value={filters.language}
            onChange={(e) => onChange("language", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="">Any</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="gu">Gujarati (ગુજરાતી)</option>
            <option value="ta">Tamil (தமிழ்)</option>
          </select>
        </div>

        {/* Object Type */}
        <div>
          <label htmlFor="search-filter-doctype" className="block text-[10px] text-slate-500 mb-1">Document Type</label>
          <select
            id="search-filter-doctype"
            name="search_filter_doctype"
            value={filters.object_type}
            onChange={(e) => onChange("object_type", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="">Any</option>
            <option value="book">Book</option>
            <option value="speech">Speech</option>
            <option value="article">Article</option>
            <option value="testimony">Testimony</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="search-filter-date-from" className="block text-[10px] text-slate-500 mb-1">Published After</label>
          <input
            id="search-filter-date-from"
            name="search_filter_date_from"
            type="text"
            placeholder="e.g. 1920"
            value={filters.date_from}
            onChange={(e) => onChange("date_from", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
          />
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="search-filter-date-to" className="block text-[10px] text-slate-500 mb-1">Published Before</label>
          <input
            id="search-filter-date-to"
            name="search_filter_date_to"
            type="text"
            placeholder="e.g. 1956"
            value={filters.date_to}
            onChange={(e) => onChange("date_to", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Rerank toggle */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="rerank-toggle"
          name="enable_rerank"
          checked={filters.enable_rerank}
          onChange={(e) => onChange("enable_rerank", e.target.checked)}
          className="h-3.5 w-3.5 accent-amber-500"
        />
        <label htmlFor="rerank-toggle" className="text-[11px] text-slate-400 cursor-pointer">
          Enable Qwen3-Reranker cross-encoder (adds ~1–3s latency)
        </label>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Search Content
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: Filters = {
  language: "",
  object_type: "",
  date_from: "",
  date_to: "",
  enable_rerank: false,
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<"fts" | "vector" | "hybrid">("hybrid");
  const [results, setResults] = useState<EnrichedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMeta, setSearchMeta] = useState<{
    took_ms: number;
    fts_count: number;
    vector_count: number;
    detected_language?: string | null;
    translated_query?: string | null;
  } | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load stats on mount
  useEffect(() => {
    fetch("/api/v1/search/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  // Load search history
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("search_history") || "[]");
      setSearchHistory(h.slice(0, 8));
    } catch {}
  }, []);

  const saveToHistory = (q: string) => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem("search_history") || "[]");
      const updated = [q, ...existing.filter((x) => x !== q)].slice(0, 10);
      localStorage.setItem("search_history", JSON.stringify(updated));
      setSearchHistory(updated.slice(0, 8));
    } catch {}
  };

  const executeSearch = useCallback(
    async (searchTerm: string, searchMode: "fts" | "vector" | "hybrid", f = filters) => {
      if (!searchTerm.trim()) return;

      // Abort previous request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setResults([]);
      setSearchMeta(null);

      try {
        const body = {
          q: searchTerm,
          mode: searchMode,
          limit: 20,
          language: f.language || undefined,
          object_type: f.object_type || undefined,
          date_from: f.date_from || undefined,
          date_to: f.date_to || undefined,
          enable_rerank: f.enable_rerank,
        };

        const res = await fetch("/api/v1/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SearchResponse = await res.json();

        setResults(data.results || []);
        setSearchMeta({
          took_ms: data.took_ms,
          fts_count: data.fts_count || 0,
          vector_count: data.vector_count || 0,
          detected_language: data.detected_language,
          translated_query: data.translated_query,
        });
        saveToHistory(searchTerm);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        // Graceful fallback — show empty state
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (initialQuery) executeSearch(initialQuery, mode);
  }, [initialQuery]); // eslint-disable-line

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
      executeSearch(query, mode);
    }
  };

  const handleModeChange = (newMode: "fts" | "vector" | "hybrid") => {
    setMode(newMode);
    if (query.trim()) executeSearch(query, newMode);
  };

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (query.trim()) executeSearch(query, mode, next);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    if (query.trim()) executeSearch(query, mode, DEFAULT_FILTERS);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
          Corpus Search &amp; Retrieval
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
          Query Dr. Ambedkar&apos;s archival writings with hybrid FTS5 BM25 lexical search,
          Qwen3 semantic vector embeddings, and cross-encoder reranking.
        </p>
      </div>

      {/* Stats bar */}
      <div className="mb-4">
        <StatsBar stats={stats} />
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative shadow-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-slate-400" />
          <input
            id="search-input"
            name="q"
            autoComplete="off"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, concepts, or exact phrases…"
            className="w-full pl-12 pr-40 py-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 text-sm md:text-base shadow-inner transition-colors"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              className="p-2 rounded-lg text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition-colors"
              title="Voice Search: Ask the Archive in English, Hindi, or Marathi"
            >
              <Mic className="h-3.5 w-3.5 text-blue-400" />
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-2.5 py-2 rounded-lg text-xs transition-colors border ${
                showFilters
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title="Toggle filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
            <button
              id="search-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>
      </form>

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
        />
      )}

      {/* Mode switches + meta */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
          {[
            { id: "hybrid", label: "Hybrid RRF", icon: Sparkles },
            { id: "fts", label: "Lexical FTS5", icon: Database },
            { id: "vector", label: "Vector Semantic", icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleModeChange(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  mode === item.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {searchMeta && (
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>{results.length} results in {searchMeta.took_ms}ms</span>
            {mode === "hybrid" && (
              <span className="text-slate-600">
                (FTS: {searchMeta.fts_count}, Vec: {searchMeta.vector_count})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Search history */}
      {!query && searchHistory.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-[11px] text-slate-500 self-center">Recent:</span>
          {searchHistory.map((h, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(h);
                executeSearch(h, mode);
              }}
              className="text-[11px] px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 rounded-full transition-all"
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="mt-8 space-y-4">
        {/* Cross-Lingual Detection Banner */}
        {searchMeta?.detected_language && searchMeta.detected_language !== "en" && (
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-200 flex flex-wrap items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-base">🌐</span>
              <div>
                <span className="font-semibold uppercase tracking-wider text-blue-300">
                  Cross-Lingual Search ({searchMeta.detected_language}):
                </span>{" "}
                <span>Retrieved English archival documents using translation</span>{" "}
                <strong className="text-amber-300">&quot;{searchMeta.translated_query}&quot;</strong>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-900/60 font-mono text-[10px] uppercase border border-blue-700">
              Zero Hallucination Retrieval
            </span>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 border-2 border-amber-500/40 border-t-amber-500 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-slate-400">Searching corpus…</p>
          </div>
        )}

        {!loading &&
          results.map((result, idx) => (
            <ResultCard key={result.chunk_id || idx} result={result} idx={idx} query={query} />
          ))}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
            <Search className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">
              No results for &quot;{query}&quot;
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try a different keyword or switch to Lexical FTS5 mode.
            </p>
          </div>
        )}

        {!loading && results.length === 0 && !query && (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
            <Search className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">Enter a query to search the corpus</p>
            <p className="text-xs text-slate-500 mt-1">
              Supports English and Indic keywords across all 19 BAWS volumes
            </p>
          </div>
        )}
      </div>

      {/* Mode explanation footer */}
      <div className="mt-10 p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-[11px] text-slate-500 space-y-1">
        <p className="flex items-center gap-1.5 text-slate-400 font-medium mb-2">
          <Info className="h-3.5 w-3.5 text-amber-400" />
          Search Mode Details
        </p>
        <p>
          <strong className="text-slate-300">Hybrid RRF</strong>: Combines lexical BM25 and vector
          embeddings via Reciprocal Rank Fusion. Best for most queries.
        </p>
        <p>
          <strong className="text-slate-300">Lexical FTS5</strong>: Exact keyword and phrase
          matching using SQLite FTS5 BM25. Best for names, dates, specific terms.
        </p>
        <p>
          <strong className="text-slate-300">Vector Semantic</strong>: Conceptual similarity via
          Qwen3-Embedding-0.6B. Best for concept exploration and paraphrase queries.
        </p>
        <p>
          <strong className="text-slate-300">Reranker</strong>: Qwen3-Reranker-0.6B cross-encoder
          re-scores the top results for maximum precision. Adds 1–3s latency.
        </p>
      </div>

      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSearch={(q) => {
          setQuery(q);
          executeSearch(q, mode);
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-20 text-center text-slate-400 font-mono text-sm">
          Loading Search Engine…
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
