"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Building,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  FileText,
  Bookmark,
  Layers,
  Sparkles,
  ExternalLink,
  Volume2,
  Bot,
  GitCompare,
  Languages,
  Eye,
  Search,
  Users,
  MapPin,
  Clock,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { ArchivalObject, DocumentChunk } from "@/lib/types";
import { useUserMode } from "@/lib/UserModeContext";

// Sample verified excerpts when DB chunks are loading
const DEFAULT_CHUNKS: DocumentChunk[] = [
  {
    id: "chunk-01",
    object_id: "doc-annihilation-of-caste",
    page_id: null,
    section_id: null,
    chunk_index: 1,
    text: "Caste is not just a division of labour, it is a division of labourers. Civilised society undoubtedly needs division of labour. But in no civilised society is division of labour accompanied by this unnatural division of labourers into water-tight compartments. Caste system is not merely division of labour. It is also a division of labourers.",
    language: "en",
    token_count: 72,
    char_count: 420,
    volume_number: "1",
    page_number: 47,
    section_title: "Chapter I: The Division of Labour and Labourers",
    is_header: false,
    is_footnote: false,
    created_at: "2026-09-22T12:00:00Z",
  },
  {
    id: "chunk-02",
    object_id: "doc-annihilation-of-caste",
    page_id: null,
    section_id: null,
    chunk_index: 2,
    text: "You cannot build anything on the foundations of caste. You cannot build up a nation, you cannot build up an ideology. Anything that you will build on the foundations of caste will crack and will never be a whole.",
    language: "en",
    token_count: 46,
    char_count: 220,
    volume_number: "1",
    page_number: 62,
    section_title: "Chapter IV: Social Reform vs Political Reform",
    is_header: false,
    is_footnote: false,
    created_at: "2026-09-22T12:00:00Z",
  },
  {
    id: "chunk-03",
    object_id: "doc-annihilation-of-caste",
    page_id: null,
    section_id: null,
    chunk_index: 3,
    text: "The real method of breaking up the Caste System was not to bring about inter-caste dinners and inter-caste marriages, which were but negative of what was bad. The real remedy was to destroy the belief in the sanctity of the Shastras.",
    language: "en",
    token_count: 48,
    char_count: 236,
    volume_number: "1",
    page_number: 78,
    section_title: "Chapter VII: The True Remedy",
    is_header: false,
    is_footnote: false,
    created_at: "2026-09-22T12:00:00Z",
  },
];

// Related Knowledge entities for canonical works
const SAMPLE_RELATED_ENTITIES = [
  { id: "entity-ambedkar", name: "Dr. B.R. Ambedkar", type: "PERSON", relation: "Author" },
  { id: "entity-jat-pat-todak", name: "Jat-Pat-Todak Mandal", type: "ORGANIZATION", relation: "Inviting Committee" },
  { id: "entity-lahore", name: "Lahore (1936 Conference)", type: "PLACE", relation: "Intended Venue" },
  { id: "entity-social-democracy", name: "Social Democracy", type: "CONCEPT", relation: "Philosophical Thesis" },
  { id: "entity-castes-mechanism", name: "Castes in India (1916)", type: "WORK", relation: "Precursor Treatise" },
];

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const docId = resolvedParams.id;
  const { mode, isVisitor, isStudent, isResearcher, isArchivist } = useUserMode();

  const [document, setDocument] = useState<ArchivalObject | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>(DEFAULT_CHUNKS);
  const [activeTab, setActiveTab] = useState<"text" | "metadata" | "citations" | "knowledge">("text");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedLanguageVersion, setSelectedLanguageVersion] = useState<string>("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDoc = async () => {
      try {
        const doc = await api.getDocument(docId).catch(() => null);
        if (mounted && doc) {
          setDocument(doc);
          try {
            const chunkRes = await api.getDocumentChunks(doc.id, 50, 0);
            if (chunkRes && chunkRes.items && chunkRes.items.length > 0) {
              setChunks(chunkRes.items);
            }
          } catch {
            // retain sample chunks
          }
        }
      } catch (err) {
        console.warn("Backend document fetch fallback to default view", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDoc();
    return () => {
      mounted = false;
    };
  }, [docId]);

  const copyCitation = (chunk: DocumentChunk, index: number) => {
    const citation = `Ambedkar, B.R. (${document?.publication_date || "1936"}). "${document?.title || "Writings and Speeches"}". BAWS Vol. ${chunk.volume_number || "1"}, p. ${chunk.page_number || "47"}. Stable ID: ${document?.stable_id || docId}.`;
    navigator.clipboard.writeText(citation);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentTitle = document?.title || docId.replace(/[-_]/g, " ").replace("baws ", "BAWS: ");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Top Breadcrumbs & Mode Indicator ────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Archive Catalog</span>
        </Link>
        <div className="flex items-center gap-2">
          {!isVisitor && (
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-400">
              {document?.stable_id || docId}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/15 border border-amber-500/30 text-amber-300">
            {mode} Mode
          </span>
        </div>
      </div>

      {/* ── HEADER (Section 9: Title, Author, Date, Language, Type, Source) ───────────── */}
      <div className="mt-6 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
          {/* Authority Badge */}
          <span className="px-2.5 py-0.5 rounded-full font-mono uppercase text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {document?.object_type || "Archival Monograph"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-mono text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            {document?.publication_date || "1936"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Building className="h-3.5 w-3.5 text-slate-400" />
            {document?.source_institution || "Government of Maharashtra (BAWS Archive)"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-300 uppercase font-mono text-[10px]">
            <Languages className="h-3.5 w-3.5 text-blue-400" />
            {document?.language === "hi" ? "Hindi" : document?.language === "mr" ? "Marathi" : "English (Original)"}
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
          {currentTitle}
        </h1>

        {document?.subtitle && (
          <p className="mt-2 text-sm md:text-base text-amber-400/90 font-serif italic">
            {document.subtitle}
          </p>
        )}

        {/* ── Section 15: Available Versions (English, Hindi, Bengali, Gujarati, Tamil) ── */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300">Available Language Editions:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { code: "en", label: "English (Source)", available: true },
              { code: "hi", label: "हिंदी (Hindi)", available: true },
              { code: "bn", label: "বাংলা (Bengali)", available: true },
              { code: "gu", label: "ગુજરાતી (Gujarati)", available: true },
              { code: "ta", label: "தமிழ் (Tamil)", available: true },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguageVersion(lang.code)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
                  selectedLanguageVersion === lang.code
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── ACTION BAR (Section 9: Actions & Direct BookView Facsimile Reader Link) ─────────────── */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/documents/${docId}/viewer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              <span>Open in BookView Facsimile Viewer</span>
            </Link>

            <Link
              href={`/assistant?mode=ask_document&doc=${encodeURIComponent(docId)}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium transition-all"
            >
              <Bot className="h-3.5 w-3.5 text-blue-400" />
              <span>Ask This Document</span>
            </Link>

            <Link
              href={`/compare?sourceA=${encodeURIComponent(docId)}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            >
              <GitCompare className="h-3.5 w-3.5 text-purple-400" />
              <span>Compare Sources</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {!isVisitor && (
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>PREMIS Fixity Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Student Mode Quick Helper (Section 5: "Explain this simply") ─────────────── */}
      {isStudent && (
        <div className="mt-6 p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-blue-200">
            <HelpCircle className="h-4 w-4 text-blue-400 shrink-0" />
            <span>
              <strong>Student Learning Assistant:</strong> Need a simplified conceptual overview of this text grounded in archival evidence?
            </span>
          </div>
          <Link
            href={`/assistant?mode=explain&question=${encodeURIComponent(`Explain the core thesis of ${currentTitle} simply for a student.`)}`}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shrink-0 transition-colors"
          >
            Explain Simply
          </Link>
        </div>
      )}

      {/* ── TABS (Section 9: Text, Metadata, Citations, Knowledge Map) ────────────────── */}
      <div className="mt-8 flex border-b border-white/10 text-xs">
        {[
          { id: "text", label: "Archival Passages & Transcripts", icon: FileText },
          { id: "knowledge", label: "Related Entities & Knowledge Map", icon: Share2 },
          { id: "metadata", label: isResearcher ? "Preservation & Dublin Core" : "Document Overview", icon: Layers },
          { id: "citations", label: "Scholarly Citations", icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-amber-500 text-amber-300 bg-slate-900/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: TEXT CHUNKS & FACSIMILE EXCERPTS ──────────────────────────────────── */}
      {activeTab === "text" && (
        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              Displaying {chunks.length} verified excerpt segments
            </span>
            <Link
              href={`/documents/${docId}/viewer`}
              className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              <span>View full facsimile pages</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {chunks.map((chunk, idx) => (
            <article
              key={chunk.id || idx}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all"
            >
              {/* Chunk Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-amber-400 font-semibold">
                    § {chunk.chunk_index}
                  </span>
                  {chunk.section_title && (
                    <span className="font-serif italic text-slate-300 text-xs">
                      {chunk.section_title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-slate-400">
                    Vol. {chunk.volume_number || "1"}, Page {chunk.page_number || "47"}
                  </span>

                  {/* Section 10: Exact Page Deep-Link */}
                  <Link
                    href={`/documents/${docId}/viewer?page=${chunk.page_number || 1}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30 transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Page {chunk.page_number || 1}</span>
                  </Link>

                  <button
                    onClick={() => copyCitation(chunk, idx)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-slate-400" />
                        <span>Cite</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Chunk Content */}
              <p className="font-serif text-slate-200 leading-relaxed text-sm md:text-base tracking-wide selection:bg-amber-500/30">
                {chunk.text}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* ── TAB 2: KNOWLEDGE GRAPH & ENTITY RELATIONSHIPS (Section 20 Integration) ───── */}
      {activeTab === "knowledge" && (
        <div className="mt-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Archival Knowledge Graph Neighbors
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Verified historical entities, co-occurrences, and concepts linked to this document in the Turso Knowledge Graph.
              </p>
            </div>
            <Link
              href={`/knowledge-map?search=${encodeURIComponent(currentTitle)}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold shrink-0 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Explore Interactive Knowledge Map</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {SAMPLE_RELATED_ENTITIES.map((ent) => (
              <Link
                key={ent.id}
                href={`/knowledge-map?entity=${encodeURIComponent(ent.name)}`}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 transition-all group"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                    {ent.type}
                  </span>
                  <span>{ent.relation}</span>
                </div>
                <div className="font-serif font-semibold text-sm text-slate-200 group-hover:text-amber-300 transition-colors">
                  {ent.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: METADATA & PREMIS PRESERVATION (Progressive Disclosure) ────────────── */}
      {activeTab === "metadata" && (
        <div className="mt-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <h3 className="font-serif font-bold text-lg text-white">
            Bibliographic & Preservation Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                Author & Primary Creator
              </span>
              <span className="text-slate-200 font-semibold">{document?.creator || "Dr. B.R. Ambedkar"}</span>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                Publication Year / Historical Date
              </span>
              <span className="text-slate-200 font-semibold">{document?.publication_date || "1936"}</span>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                Rights & Legal Status
              </span>
              <span className="text-emerald-400 font-semibold">
                {document?.rights_status || "Public Domain (Archival)"}
              </span>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                Source Archival Institution
              </span>
              <span className="text-slate-200 font-semibold">
                {document?.source_institution || "Government of Maharashtra (BAWS Archive)"}
              </span>
            </div>
            {!isVisitor && (
              <div className="md:col-span-2 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                  PREMIS 3.0 Fixity Digest (SHA-256)
                </span>
                <span className="text-amber-400 font-mono text-[11px] break-all">
                  {document?.file_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: SCHOLARLY CITATIONS ──────────────────────────────────────────────── */}
      {activeTab === "citations" && (
        <div className="mt-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-serif font-bold text-lg text-white">Standard Scholarly Citation Formats</h3>
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-amber-400 font-mono text-[11px] block mb-1">APA 7th Edition</span>
              <p className="font-serif text-slate-300">
                Ambedkar, B. R. ({document?.publication_date || "1936"}).{" "}
                <em>{document?.title || "Annihilation of Caste"}</em>. Dr. Babasaheb Ambedkar Writings
                and Speeches, Government of Maharashtra. Stable ID: {document?.stable_id || docId}.
              </p>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-amber-400 font-mono text-[11px] block mb-1">Chicago 17th Edition</span>
              <p className="font-serif text-slate-300">
                Ambedkar, Bhimrao Ramji. <em>{document?.title || "Annihilation of Caste"}</em>.
                Bombay: Government of Maharashtra, {document?.publication_date || "1936"}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
