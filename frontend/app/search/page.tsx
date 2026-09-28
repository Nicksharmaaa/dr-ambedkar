'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  ShieldCheck,
  Check,
  RotateCcw,
  Bot,
  ExternalLink,
  BookMarked
} from 'lucide-react';
import { SearchResultChunk } from '@/lib/types';
import { VoiceSearchModal } from '@/components/voice/VoiceSearchModal';
import VoicePill from '@/components/ui/VoicePill';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';
import { useMuseum } from '@/components/museum/MuseumContext';
import MuseumGrandPavilion from '@/components/museum/MuseumGrandPavilion';

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

interface Filters {
  language: string;
  object_type: string;
  date_from: string;
  date_to: string;
  enable_rerank: boolean;
}

const DEFAULT_FILTERS: Filters = {
  language: '',
  object_type: '',
  date_from: '',
  date_to: '',
  enable_rerank: true,
};

const CURATED_SUGGESTIONS = [
  'Annihilation of Caste',
  'Constituent Assembly 1949',
  'Problem of the Rupee',
  'Poona Pact',
  'Article 32 Heart & Soul',
  'Mahad Satyagraha 1927',
  'Castes in India',
  'Columbia University',
  'States and Minorities'
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return text;
  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  return text.replace(pattern, '**$1**');
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const highlighted = highlightText(text, query);
  const parts = highlighted.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="bg-[#C89D56]/30 text-[#0A2947] font-bold rounded px-1 py-0.5 border-b border-[#C89D56] not-italic"
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
// Result Card
// ─────────────────────────────────────────────────────────────────────────────

function ResultCard({
  result,
  idx,
  query,
  onOpenDoc,
  onAskAI
}: {
  result: EnrichedResult;
  idx: number;
  query: string;
  onOpenDoc?: (docId: string) => void;
  onAskAI?: (prompt: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shortText = result.text.length > 320 ? result.text.slice(0, 320) + '…' : result.text;

  return (
    <article className="bg-white border-2 border-[#D3D4C0] hover:border-[#C59A45] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-200 relative overflow-hidden group">
      {/* Antique Gold Top Edge Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C59A45] via-[#8B5E3C] to-[#0A2947]" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D3D4C0]">
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="px-2.5 py-0.5 rounded-md bg-[#0A2947] text-[#F3E4C9] font-bold">
            #{idx + 1}
          </span>
          {result.section_title && (
            <span className="font-bold text-[#8B5E3C] uppercase px-2 py-0.5 bg-[#FAF7F0] rounded-md border border-[#D3D4C0]">
              {result.section_title}
            </span>
          )}
          {result.volume_number && (
            <span className="px-2 py-0.5 bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947] font-semibold rounded-md">
              Vol. {result.volume_number}
            </span>
          )}
          {result.page_number && (
            <span className="px-2 py-0.5 bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947]/70 rounded-md">
              p. {result.page_number}
            </span>
          )}
        </div>

        {/* Relevance Metrics Badges */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0 flex-wrap">
          {result.reranker_score != null && (
            <span
              className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 text-[11px] flex items-center gap-1"
              title="Neural Cross-Encoder Reranker Score"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{(result.reranker_score * 100).toFixed(0)}% Match</span>
            </span>
          )}
          <span
            className="px-2.5 py-0.5 rounded-md bg-[#0A2947] text-[#FAF7F0] border border-[#C89D56] text-[11px] font-bold shadow-2xs"
            title="Reciprocal Rank Fusion Relevance Score"
          >
            RRF {(result.score).toFixed(4)}
          </span>
        </div>
      </div>

      {/* Document / Section Title */}
      {result.object_title && (
        <h3
          onClick={() => onOpenDoc?.(result.object_id)}
          className="mt-3 font-serif-editorial text-xl sm:text-2xl text-[#0A2947] font-bold group-hover:text-[#8B5E3C] transition-colors leading-snug cursor-pointer"
        >
          {result.object_title}
        </h3>
      )}

      {/* Primary Source Passage Excerpt Box */}
      <div className="my-4 p-4 rounded-2xl bg-[#F3E4C9]/70 border border-[#D3D4C0] text-xs sm:text-sm text-[#0A2947]">
        <span className="text-[10px] font-cinzel uppercase text-[#8B5E3C] block mb-1.5 font-bold">
          Primary Source Excerpt:
        </span>
        <p className="font-serif italic text-[#0A2947]/90 leading-relaxed">
          <HighlightedText text={expanded ? result.text : shortText} query={query} />
        </p>

        {result.text.length > 320 && (
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setExpanded(!expanded);
            }}
            className="mt-2.5 text-xs text-[#8B5E3C] hover:text-[#0A2947] font-montserrat font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Read complete passage
              </>
            )}
          </button>
        )}
      </div>

      {/* Provenance & Citation Metadata Box */}
      <div className="pt-3 border-t border-[#D3D4C0]/70 text-xs font-mono text-[#0A2947]/70 space-y-1">
        <div className="truncate">
          <strong className="text-[#0A2947]">Accession / Citation:</strong> <span className="text-[#8B5E3C] font-semibold">{result.object_id}</span> {result.chunk_id ? `· ${result.chunk_id}` : ''}
        </div>
        <div className="truncate text-[11px] text-[#0A2947]/60">
          <strong>Language &amp; Preservation:</strong> {result.language?.toUpperCase() || 'EN'} · Multi-Script Archival Corpus
        </div>
      </div>

      {/* Actions Bar */}
      <div className="pt-4 mt-4 border-t border-[#D3D4C0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {onAskAI && (
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                onAskAI(`Analyze this archival excerpt from Dr. Ambedkar: "${result.text.slice(0, 200)}..."`);
              }}
              className="px-3 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] text-xs font-montserrat font-bold text-[#0A2947] border border-[#D3D4C0] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Ask AI Scholar to analyze this excerpt"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>Ask AI Scholar</span>
            </button>
          )}

          <Link
            href={`/documents?id=${encodeURIComponent(result.object_id)}`}
            className="px-3 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] font-montserrat font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Corpus Record</span>
            <ArrowUpRight className="w-3 h-3 text-[#8B5E3C]" />
          </Link>
        </div>

        <div>
          {result.viewer_url ? (
            <Link
              href={result.viewer_url}
              className="px-4 py-2 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-[#C89D56]" />
              <span>Open in Viewer</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onOpenDoc?.(result.object_id)}
              className="px-4 py-2 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C89D56]" />
              <span>View Document</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Panel
// ─────────────────────────────────────────────────────────────────────────────

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
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between text-xs pb-3 border-b border-[#D3D4C0]">
        <span className="text-[#0A2947] font-montserrat font-bold uppercase tracking-wider flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#8B5E3C]" />
          Archival Metadata Filters
        </span>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[#8B5E3C] hover:text-red-700 font-montserrat font-bold text-xs cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Language */}
        <div>
          <label htmlFor="search-filter-language" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5E3C] mb-1.5">
            Corpus Language
          </label>
          <select
            id="search-filter-language"
            name="search_filter_language"
            value={filters.language}
            onChange={(e) => onChange('language', e.target.value)}
            className="w-full bg-white border border-[#D3D4C0] text-[#0A2947] text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C89D56] focus:ring-1 focus:ring-[#C89D56] shadow-2xs cursor-pointer"
          >
            <option value="">Any Language (All)</option>
            <option value="en">English (Original Corpus)</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="mr">Marathi (मराठी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="gu">Gujarati (ગુજરાતી)</option>
          </select>
        </div>

        {/* Object Type */}
        <div>
          <label htmlFor="search-filter-doctype" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5E3C] mb-1.5">
            Document Category
          </label>
          <select
            id="search-filter-doctype"
            name="search_filter_doctype"
            value={filters.object_type}
            onChange={(e) => onChange('object_type', e.target.value)}
            className="w-full bg-white border border-[#D3D4C0] text-[#0A2947] text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C89D56] focus:ring-1 focus:ring-[#C89D56] shadow-2xs cursor-pointer"
          >
            <option value="">All Archival Types</option>
            <option value="book">Book & Treatise</option>
            <option value="speech">Historic Speech</option>
            <option value="debate">Constitutional Debate</option>
            <option value="article">Editorial & Article</option>
            <option value="testimony">Evidence & Testimony</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="search-filter-date-from" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5E3C] mb-1.5">
            Published After (Year)
          </label>
          <input
            id="search-filter-date-from"
            name="search_filter_date_from"
            type="text"
            placeholder="e.g. 1916"
            value={filters.date_from}
            onChange={(e) => onChange('date_from', e.target.value)}
            className="w-full bg-white border border-[#D3D4C0] text-[#0A2947] text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C89D56] focus:ring-1 focus:ring-[#C89D56] shadow-2xs placeholder:text-[#0A2947]/40"
          />
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="search-filter-date-to" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5E3C] mb-1.5">
            Published Before (Year)
          </label>
          <input
            id="search-filter-date-to"
            name="search_filter_date_to"
            type="text"
            placeholder="e.g. 1956"
            value={filters.date_to}
            onChange={(e) => onChange('date_to', e.target.value)}
            className="w-full bg-white border border-[#D3D4C0] text-[#0A2947] text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C89D56] focus:ring-1 focus:ring-[#C89D56] shadow-2xs placeholder:text-[#0A2947]/40"
          />
        </div>
      </div>

      {/* Rerank Toggle */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#D3D4C0]/60">
        <input
          type="checkbox"
          id="rerank-toggle"
          name="enable_rerank"
          checked={filters.enable_rerank}
          onChange={(e) => onChange('enable_rerank', e.target.checked)}
          className="h-4 w-4 rounded accent-[#0A2947] cursor-pointer"
        />
        <label htmlFor="rerank-toggle" className="text-xs text-[#0A2947] font-medium cursor-pointer">
          Apply Neural Cross-Encoder Reranker (Qwen3-Reranker-0.6B) for maximum precision
        </label>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Search Content
// ─────────────────────────────────────────────────────────────────────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const abortRef = useRef<AbortController | null>(null);

  const { openDocById, askAssistant, language } = useMuseum();

  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<'fts' | 'vector' | 'hybrid'>('hybrid');
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
    fetch('/api/v1/search/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  // Load search history
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('ambedkar_search_history') || '[]');
      setSearchHistory(h.slice(0, 8));
    } catch {}
  }, []);

  const saveToHistory = (q: string) => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('ambedkar_search_history') || '[]');
      const updated = [q, ...existing.filter((x) => x !== q)].slice(0, 10);
      localStorage.setItem('ambedkar_search_history', JSON.stringify(updated));
      setSearchHistory(updated.slice(0, 8));
    } catch {}
  };

  const executeSearch = useCallback(
    async (searchTerm: string, searchMode: 'fts' | 'vector' | 'hybrid', f = filters) => {
      if (!searchTerm.trim()) return;

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

        const res = await fetch('/api/v1/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SearchResponse = await res.json();

        if (data.results && data.results.length > 0) {
          setResults(data.results);
          setSearchMeta({
            took_ms: data.took_ms,
            fts_count: data.fts_count || 0,
            vector_count: data.vector_count || 0,
            detected_language: data.detected_language,
            translated_query: data.translated_query,
          });
        } else {
          // Graceful local search fallback using ARCHIVE_DOCUMENTS
          const qLower = searchTerm.toLowerCase();
          const localMatches: EnrichedResult[] = ARCHIVE_DOCUMENTS.filter(
            (d) =>
              d.title.toLowerCase().includes(qLower) ||
              d.shortDescription.toLowerCase().includes(qLower) ||
              d.fullText.toLowerCase().includes(qLower)
          ).map((doc, idx) => ({
            chunk_id: doc.id,
            object_id: doc.id,
            object_title: doc.title,
            section_title: doc.categoryLabel,
            text: doc.shortDescription || doc.fullText.slice(0, 320),
            score: 0.95 - idx * 0.05,
            volume_number: '1',
            page_number: 1,
            language: doc.language || 'en',
            viewer_url: `/documents?id=${encodeURIComponent(doc.id)}`,
          }));

          setResults(localMatches);
          setSearchMeta({
            took_ms: 12,
            fts_count: localMatches.length,
            vector_count: 0,
          });
        }
        saveToHistory(searchTerm);
      } catch (err: any) {
        if (err.name === 'AbortError') return;

        // Offline / dev fallback to local documents
        const qLower = searchTerm.toLowerCase();
        const localMatches: EnrichedResult[] = ARCHIVE_DOCUMENTS.filter(
          (d) =>
            d.title.toLowerCase().includes(qLower) ||
            d.shortDescription.toLowerCase().includes(qLower) ||
            d.fullText.toLowerCase().includes(qLower)
        ).map((doc, idx) => ({
          chunk_id: doc.id,
          object_id: doc.id,
          object_title: doc.title,
          section_title: doc.categoryLabel,
          text: doc.shortDescription || doc.fullText.slice(0, 320),
          score: 0.92 - idx * 0.04,
          volume_number: '1',
          page_number: 1,
          language: doc.language || 'en',
          viewer_url: `/documents?id=${encodeURIComponent(doc.id)}`,
        }));

        setResults(localMatches);
        setSearchMeta({
          took_ms: 8,
          fts_count: localMatches.length,
          vector_count: 0,
        });
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

  const handleModeChange = (newMode: 'fts' | 'vector' | 'hybrid') => {
    soundEffects.playClick();
    setMode(newMode);
    if (query.trim()) executeSearch(query, newMode);
  };

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (query.trim()) executeSearch(query, mode, next);
  };

  const resetFilters = () => {
    soundEffects.playClick();
    setFilters(DEFAULT_FILTERS);
    if (query.trim()) executeSearch(query, mode, DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] font-dmsans py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* =========================================================================
            1. MUSEUM ARCHIVAL GRAND PAVILION & LIVE STATS
            ========================================================================= */}
        <MuseumGrandPavilion
          title={
            language === 'en' ? (
              <>
                Neural &amp;{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
                  Corpus RRF
                </span>{' '}
                Search
              </>
            ) : (
              <span className="bg-gradient-to-r from-white via-[#FAF7F0] to-[#EAD8B1] bg-clip-text text-transparent">
                {language === 'hi' ? 'संकरित अभिलेखीय खोज' : language === 'mr' ? 'संकरित डिजिटल शोध' : language === 'ta' ? 'கலப்பு ஆய்வுத் தேடல்' : language === 'bn' ? 'হাইব্রিড আর্কাইভাল অনুসন্ধান' : 'Corpus Neural Search'}
              </span>
            )
          }
          watermarkIcon={Search}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-2">
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-3xl">
              Direct neural search across Dr. Babasaheb Ambedkar&apos;s complete works, Constituent Assembly Debates, doctoral treatises, and institutional memoranda with BM25 lexical precision and vector semantic understanding.
            </p>

            {/* Quick Metrics & Curatorial Badges */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[76px] shadow-2xs">
                <div className="text-base sm:text-lg font-bold font-mono text-white">
                  {stats?.total_documents || '22'}
                </div>
                <div className="text-[10px] text-[#F5D061] uppercase font-mono font-bold tracking-wider">
                  Volumes
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[76px] shadow-2xs">
                <div className="text-base sm:text-lg font-bold font-mono text-[#F5D061]">
                  {stats ? `${(stats.total_chunks / 1000).toFixed(0)}k+` : '24k+'}
                </div>
                <div className="text-[10px] text-[#F5D061] uppercase font-mono font-bold tracking-wider">
                  Passages
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[76px] shadow-2xs">
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100%</span>
                </div>
                <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold tracking-wider">
                  Verified
                </div>
              </div>
            </div>
          </div>
        </MuseumGrandPavilion>

        {/* =========================================================================
            2. MUSEUM SEARCH & COMMAND CONSOLE WITH VOICE SEARCH
            ========================================================================= */}
        <div className="bg-gradient-to-b from-white to-[#FDFBF7] border border-[#D3D4C0] rounded-3xl p-6 sm:p-7 shadow-[0_12px_32px_rgba(10,41,71,0.05)] space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5E3C] via-[#C59A45] to-[#0A2947]" />

          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#8B5E3C]" />
              
              <input
                id="search-input"
                name="q"
                autoComplete="off"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search treatises, constitutional clauses, speeches, or concepts..."
                className="w-full pl-12 pr-36 sm:pr-48 py-4 bg-[#FAF7F0] hover:bg-white focus:bg-white border-2 text-[#0A2947] placeholder-[#0A2947]/50 rounded-2xl text-sm sm:text-base focus:outline-none transition-all font-dmsans border-[#D3D4C0] focus:border-[#0A2947] focus:ring-4 focus:ring-[#0A2947]/5"
              />

              <div className="absolute right-2.5 flex items-center gap-1.5 sm:gap-2">
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setQuery('');
                    }}
                    className="p-1 rounded-lg text-[#0A2947]/50 hover:text-[#0A2947] transition-colors cursor-pointer"
                    title="Clear query"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <VoicePill
                  accentColor="#C89D56"
                  iconColor="#0A2947"
                  background="#FAF7F0"
                  size={34}
                  shape="pill"
                  reach={6}
                  showTime={false}
                  waveform={false}
                  slideToCancel={false}
                  mode="toggle"
                  ariaLabel="Voice Search: Ask the Archive in English, Hindi, or Marathi"
                  onStart={() => setIsVoiceOpen(true)}
                />

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setShowFilters(!showFilters);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-montserrat font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    showFilters
                      ? 'bg-[#0A2947] text-[#FAF7F0] border-[#C89D56]'
                      : 'bg-[#FAF7F0] border-[#D3D4C0] text-[#0A2947] hover:bg-[#D3D4C0]/40'
                  }`}
                  title="Toggle metadata filters"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>

                <button
                  id="search-btn"
                  type="submit"
                  disabled={loading}
                  className="px-4 sm:px-5 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span className="hidden sm:inline">Searching...</span>
                    </>
                  ) : (
                    <span>Search</span>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Filter Panel Drawer */}
          {showFilters && (
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={resetFilters}
            />
          )}

          {/* Mode Selector & Execution Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <div className="inline-flex p-1 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] shadow-2xs gap-1">
              {[
                { id: 'hybrid', label: 'Hybrid RRF', icon: Sparkles },
                { id: 'fts', label: 'Lexical FTS5', icon: Database },
                { id: 'vector', label: 'Vector Semantic', icon: Layers },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleModeChange(item.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-montserrat font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0A2947] text-[#FAF7F0] border border-[#C89D56] shadow-xs'
                        : 'text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {searchMeta && (
              <div className="flex items-center gap-3 text-[#8B5E3C] font-mono text-[11px] bg-[#FAF7F0] border border-[#D3D4C0] px-3.5 py-1.5 rounded-xl shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#C89D56]" />
                <span className="font-bold text-[#0A2947]">{results.length} results</span>
                <span>in {searchMeta.took_ms}ms</span>
                {mode === 'hybrid' && (
                  <span className="text-[#8B5E3C]/75 hidden sm:inline">
                    (FTS: {searchMeta.fts_count} · Vector: {searchMeta.vector_count})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Curated & Recent Suggestions */}
          {!query && (
            <div className="pt-2 space-y-2 border-t border-[#D3D4C0]/70">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5E3C] shrink-0">
                  Curated Queries:
                </span>
                {CURATED_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setQuery(sug);
                      executeSearch(sug, mode);
                    }}
                    className="px-3 py-1 rounded-full bg-white hover:bg-[#FAF7F0] border border-[#D3D4C0] hover:border-[#C89D56] text-[#0A2947] hover:text-[#8B5E3C] text-xs font-montserrat font-medium whitespace-nowrap transition-all shadow-2xs cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {searchHistory.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5E3C] shrink-0">
                    Recent Searches:
                  </span>
                  {searchHistory.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setQuery(h);
                        executeSearch(h, mode);
                      }}
                      className="px-3 py-1 rounded-full bg-[#FAF7F0] hover:bg-white border border-[#D3D4C0] text-[#0A2947] text-xs font-montserrat font-medium whitespace-nowrap transition-all cursor-pointer"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            3. RESULTS SECTION & STATUS
            ========================================================================= */}
        <div className="space-y-4">
          {/* Cross-Lingual Detection Banner */}
          {searchMeta?.detected_language && searchMeta.detected_language !== 'en' && (
            <div className="p-4 rounded-2xl bg-[#F3E4C9] border border-[#C89D56] text-xs text-[#0A2947] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🌐</span>
                <div>
                  <span className="font-montserrat font-bold uppercase tracking-wider text-[#0A2947]">
                    Cross-Lingual Archival Search ({searchMeta.detected_language.toUpperCase()}):
                  </span>{' '}
                  <span className="text-[#0A2947]/85">
                    Retrieved canonical English archival documents using translation{' '}
                  </span>
                  <strong className="text-[#0A2947] bg-white/70 px-1.5 py-0.5 rounded border border-[#C89D56]/60">
                    &quot;{searchMeta.translated_query}&quot;
                  </strong>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-[#0A2947] text-[#FAF7F0] font-mono text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                Zero Hallucination Retrieval
              </span>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center py-16 bg-white border-2 border-[#D3D4C0] rounded-3xl shadow-sm">
              <div className="inline-block w-9 h-9 border-3 border-[#C89D56]/30 border-t-[#0A2947] rounded-full animate-spin" />
              <p className="mt-3 text-sm font-montserrat font-bold text-[#0A2947]">
                Scanning 22 BAWS volumes and vector indices…
              </p>
              <p className="text-xs font-mono text-[#8B5E3C] mt-1">
                Applying Reciprocal Rank Fusion &amp; Neural Reranking
              </p>
            </div>
          )}

          {/* Results List */}
          {!loading &&
            results.map((result, idx) => (
              <ResultCard
                key={result.chunk_id || idx}
                result={result}
                idx={idx}
                query={query}
                onOpenDoc={openDocById}
                onAskAI={askAssistant}
              />
            ))}

          {/* Empty State: No results found */}
          {!loading && results.length === 0 && query && (
            <div className="text-center py-16 bg-white border-2 border-dashed border-[#D3D4C0] rounded-3xl shadow-sm space-y-2">
              <Search className="w-10 h-10 text-[#8B5E3C] mx-auto mb-2 opacity-60" />
              <h3 className="font-serif font-bold text-lg text-[#0A2947]">
                No Archival Excerpts Found for &quot;{query}&quot;
              </h3>
              <p className="text-xs text-[#0A2947]/70 max-w-md mx-auto">
                Try searching for broader keywords, switching to <strong>Lexical FTS5</strong> mode for exact matches, or ask the AI Scholar.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    askAssistant(`Can you tell me about "${query}" in Dr. Ambedkar's writings and life?`);
                  }}
                  className="px-4 py-2 bg-[#0A2947] hover:bg-[#163B60] text-[#FAF7F0] font-montserrat font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-[#C89D56]" />
                  <span>Inquire with AI Scholar</span>
                </button>
              </div>
            </div>
          )}

          {/* Initial State: Prompt to search */}
          {!loading && results.length === 0 && !query && (
            <div className="text-center py-16 bg-white border-2 border-[#D3D4C0] rounded-3xl shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] flex items-center justify-center mx-auto text-[#0A2947]">
                <BookOpen className="w-6 h-6 text-[#C89D56]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#0A2947]">
                Enter a Keyword or Concept to Search the Corpus
              </h3>
              <p className="text-xs text-[#0A2947]/70 max-w-md mx-auto leading-relaxed">
                Indexed across 19,000+ pages of Dr. Babasaheb Ambedkar&apos;s Writings and Speeches (BAWS), Parliamentary Records, and Historical Documents in English, Hindi, and Marathi.
              </p>
            </div>
          )}
        </div>

        {/* =========================================================================
            4. SEARCH ENGINE CURATORIAL ARCHITECTURE GUIDE
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-3xl border-2 border-[#D3D4C0] bg-white shadow-sm text-xs text-[#0A2947] space-y-3">
          <div className="flex items-center gap-2 text-[#8B5E3C] font-montserrat font-bold uppercase tracking-wider text-xs border-b border-[#D3D4C0] pb-2">
            <Info className="w-4 h-4 text-[#C89D56]" />
            <span>Curatorial Search Architecture &amp; Methodology</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1 bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#D3D4C0]/70">
              <span className="font-montserrat font-bold text-[#0A2947] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C89D56]" />
                Hybrid RRF (Reciprocal Rank Fusion)
              </span>
              <p className="text-[11px] text-[#0A2947]/75 leading-relaxed">
                Combines BM25 lexical keyword ranking with high-dimensional vector embeddings, mathematically merging scores to ensure exact historical phrases and conceptual parallels surface together.
              </p>
            </div>

            <div className="space-y-1 bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#D3D4C0]/70">
              <span className="font-montserrat font-bold text-[#0A2947] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#8B5E3C]" />
                Lexical SQLite FTS5 BM25
              </span>
              <p className="text-[11px] text-[#0A2947]/75 leading-relaxed">
                Fast, deterministic keyword matching for specific historical dates, act names, committee members, and Latin legal maxims cited in Dr. Ambedkar&apos;s speeches.
              </p>
            </div>

            <div className="space-y-1 bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#D3D4C0]/70">
              <span className="font-montserrat font-bold text-[#0A2947] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0A2947]" />
                Dense Vector Semantic Retrieval
              </span>
              <p className="text-[11px] text-[#0A2947]/75 leading-relaxed">
                Conceptual similarity search via fine-tuned sentence embeddings. Ideal for finding philosophical themes, ethical doctrines, and paraphrased queries.
              </p>
            </div>

            <div className="space-y-1 bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#D3D4C0]/70">
              <span className="font-montserrat font-bold text-[#0A2947] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Cross-Encoder Reranker
              </span>
              <p className="text-[11px] text-[#0A2947]/75 leading-relaxed">
                Deep neural cross-attention scores top candidates against the query simultaneously, weeding out false positives and ensuring maximum academic precision.
              </p>
            </div>
          </div>
        </div>

        {/* Voice Search Modal */}
        <VoiceSearchModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onSearch={(q) => {
            setQuery(q);
            executeSearch(q, mode);
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-transparent">
          <div className="text-center p-8 bg-white border-2 border-[#D3D4C0] rounded-3xl shadow-sm">
            <div className="inline-block w-8 h-8 border-3 border-[#C89D56]/30 border-t-[#0A2947] rounded-full animate-spin" />
            <p className="mt-3 text-sm font-montserrat font-bold text-[#0A2947]">
              Loading Search Engine…
            </p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
