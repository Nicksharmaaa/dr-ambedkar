"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
  Database,
  Sparkles,
  Layers,
  ChevronRight,
  FileText,
  Volume2,
  Mic,
  Compass,
  Share2,
  GitCompare,
  Eye,
  GraduationCap,
  Play,
  Languages,
  Bookmark,
  Award,
} from "lucide-react";
import { api } from "@/lib/api";
import { Collection, DatabaseHealth } from "@/lib/types";
import { useUserMode } from "@/lib/UserModeContext";
import { VoiceSearchModal } from "@/components/voice/VoiceSearchModal";

// Featured historical themes for visual exploration
const EXPLORE_THEMES = [
  {
    title: "The Constitution of India",
    subtitle: "Drafting Committee & Fundamental Rights",
    description: "Dr. Ambedkar's seminal contributions as Chairman of the Drafting Committee, embedding Liberty, Equality, and Fraternity as constitutional bedrocks.",
    query: "Constituent Assembly fundamental rights drafting committee",
    tag: "Constitutionalism",
    icon: Award,
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300",
  },
  {
    title: "Annihilation of Caste",
    subtitle: "1936 Classic Speech & Social Democracy",
    description: "The undelivered presidential address to the Jat-Pat-Todak Mandal exposing caste as an unnatural division of labourers.",
    query: "Annihilation of Caste social democracy shastras",
    tag: "Social Philosophy",
    icon: BookOpen,
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300",
  },
  {
    title: "Economics & Problem of the Rupee",
    subtitle: "Columbia & LSE Financial Treatises",
    description: "Pioneering monetary theory, public finance decentralization, and the foundational economic concepts that led to the Reserve Bank of India.",
    query: "Problem of the Rupee monetary economics currency",
    tag: "Economic Theory",
    icon: Database,
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300",
  },
  {
    title: "Mahad Satyagraha & Water Rights",
    subtitle: "1927 Landmark Human Rights Declaration",
    description: "The assertion of equal access to Chavdar Tale public reservoir—heralded as the Magna Carta of Dalit human rights in modern India.",
    query: "Mahad Satyagraha Chavdar Tale water rights 1927",
    tag: "Civil Rights",
    icon: Compass,
    color: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300",
  },
];

// Featured historical timeline eras
const HISTORICAL_ERAS = [
  { era: "1891–1923", label: "Formative & Academic", highlight: "Columbia, LSE & Bar-at-Law" },
  { era: "1924–1935", label: "Social Awakening", highlight: "Bahishkrit Hitakarini Sabha & Mahad" },
  { era: "1936–1946", label: "Political Vanguard", highlight: "Independent Labour Party & Cripps Mission" },
  { era: "1947–1950", label: "Architect of the Republic", highlight: "Drafting Committee & Constituent Assembly" },
  { era: "1951–1956", label: "Dhamma & Universal Justice", highlight: "Hindu Code Bill & Deekshabhoomi" },
];

export default function HomePage() {
  const router = useRouter();
  const { mode, isVisitor, isStudent, isResearcher, isArchivist } = useUserMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [corpusStats, setCorpusStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadHomeData = async () => {
      try {
        const stats = await api.getMultilingualCorpusDashboard().catch(() => null);
        if (mounted && stats) {
          setCorpusStats(stats);
        }
      } catch (err) {
        console.warn("Home dashboard stats error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadHomeData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─────────────────────────────────────────────────────────────────────────────
          HERO SECTION (Museum-Grade, Tablet-First)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-white/10 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        {/* Ambient atmospheric gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-24 right-1/4 w-[360px] h-[220px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Institutional Banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-serif">Dr. Babasaheb Ambedkar Digital Preservation Archive</span>
            <span className="text-amber-500/60 hidden sm:inline">|</span>
            <span className="text-slate-300 font-mono text-[11px] hidden sm:inline capitalize">{mode} Perspective</span>
          </div>

          {/* Monumental Serif Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            The Complete Works & Heritage of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">
              Dr. B.R. Ambedkar
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {isVisitor
              ? "Discover the life, speeches, manuscripts, and constitutional vision of Babasaheb through immersive archival exploration and voice discovery."
              : isStudent
              ? "Explore historical concepts, understand complex doctrines with grounded explanations, and trace every educational insight directly back to the original source."
              : isResearcher
              ? "Investigate 112 multi-lingual volumes, cross-lingual alignments, verified entity relationships, and non-destructive OCR facsimiles with verifiable citations."
              : "Institutional curator portal: monitor PREMIS preservation fixity, audit OCR extraction confidence, and manage multi-lingual document manifests."}
          </p>

          {/* Motto quote */}
          <div className="mt-3 text-xs tracking-widest uppercase font-mono text-slate-400">
            &ldquo;Educate, Agitate, Organise&rdquo;
          </div>

          {/* PRIMARY ACTION: SEARCH THE ARCHIVE */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl">
              <div className="absolute left-4 pointer-events-none text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search speeches, treaties, constitutional debates, or concepts..."
                className="w-full pl-12 pr-32 py-4 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm backdrop-blur-md transition-all shadow-inner"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 transition-colors"
                  title="Voice Search (English, Hindi, Marathi)"
                >
                  <Mic className="h-4 w-4 animate-pulse" />
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-md active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick suggested queries */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500">Suggested:</span>
              {[
                "Annihilation of Caste",
                "Problem of the Rupee",
                "Poona Pact 1932",
                "Constituent Assembly",
                "States and Minorities",
                "Water Rights Mahad",
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                  className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-amber-500/40 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Action Navigation Bar (Tablet-Friendly, $\ge 48\text{px}$) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/documents"
              className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 hover:border-amber-500/40 transition-all shadow-sm"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Writings & Speeches</span>
            </Link>
            <Link
              href="/timeline"
              className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 hover:border-amber-500/40 transition-all shadow-sm"
            >
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Historical Timeline</span>
            </Link>
            <Link
              href="/stories"
              className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 hover:border-amber-500/40 transition-all shadow-sm"
            >
              <Compass className="h-4 w-4 text-amber-400" />
              <span>Featured Stories</span>
            </Link>
            <Link
              href="/compare"
              className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 hover:border-amber-500/40 transition-all shadow-sm"
            >
              <GitCompare className="h-4 w-4 text-blue-400" />
              <span>Compare Sources</span>
            </Link>
            <Link
              href="/assistant"
              className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all shadow-sm"
            >
              <Cpu className="h-4 w-4 text-amber-400" />
              <span>Ask the Archive</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION: EXPLORE AMBEDKAR (Featured Historical Pillars)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 bg-slate-950 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-amber-400 font-mono text-xs uppercase tracking-wider">
                Curated Exhibition
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Explore Ambedkar: Foundational Themes
              </h2>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium group"
            >
              <span>Explore all archival themes</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXPLORE_THEMES.map((theme) => {
              const TIcon = theme.icon;
              return (
                <div
                  key={theme.title}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(theme.query)}`)}
                  className={`group relative p-6 rounded-2xl bg-gradient-to-b ${theme.color} bg-slate-900/60 border hover:border-amber-500/60 transition-all cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-900/80 border border-slate-700/60 text-slate-300">
                        {theme.tag}
                      </span>
                      <TIcon className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                      {theme.title}
                    </h3>
                    <div className="text-xs text-amber-400/90 font-serif italic mb-2">
                      {theme.subtitle}
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
                      {theme.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-300 transition-colors">
                    <span className="font-mono text-[11px]">View Archival Sources</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION: HISTORICAL TIMELINE STRIP (Section 21 Integration)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-slate-900/40 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-serif font-bold text-white">Chronological Eras (1891–1956)</h2>
            </div>
            <Link
              href="/timeline"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              <span>Interactive Timeline</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {HISTORICAL_ERAS.map((era) => (
              <Link
                key={era.era}
                href={`/timeline?era=${encodeURIComponent(era.era)}`}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 transition-all text-left group"
              >
                <div className="text-amber-400 font-mono text-xs font-bold">{era.era}</div>
                <div className="text-sm font-serif font-semibold text-slate-200 mt-1 group-hover:text-amber-300">
                  {era.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{era.highlight}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION: MULTILINGUAL CORPUS & EDITIONS (Section 7 & 15 Integration)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 bg-slate-950 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono mb-4">
                <Languages className="h-3.5 w-3.5 text-blue-400" />
                <span>Multilingual Archival Corpus (112 Volumes)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                Cross-Lingual Archival Access
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed font-sans">
                Search in Hindi, Bengali, Gujarati, or Tamil to retrieve authoritative archival English writings,
                or explore verified regional language editions with structural chapter and section alignment.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8">
              {[
                { name: "English", count: "19 Volumes", nature: "Digital DjVu Text", code: "en", script: "Latin" },
                { name: "Hindi (हिंदी)", count: "39 Volumes", nature: "Scanned Facsimile", code: "hi", script: "Devanagari" },
                { name: "Bengali (বাংলা)", count: "14 Volumes", nature: "Scanned Facsimile", code: "bn", script: "Bengali" },
                { name: "Gujarati (ગુજરાતી)", count: "9 Volumes", nature: "Scanned Facsimile", code: "gu", script: "Gujarati" },
                { name: "Tamil (தமிழ்)", count: "31 Volumes", nature: "Scanned Facsimile", code: "ta", script: "Tamil" },
              ].map((lang) => (
                <Link
                  key={lang.name}
                  href={`/search?language=${lang.code}`}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 transition-all text-left group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">{lang.name}</div>
                  <div className="text-amber-400 font-mono text-[11px] mt-0.5">{lang.count}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{lang.nature}</div>
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                35,371 Indic Scanned Facsimile Pages with Non-Destructive OCR
              </span>
              <Link
                href="/documents"
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
              >
                <span>Browse Multilingual Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION: MEDIA & PHOTOGRAPHS (Sections 16–19 Integration)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 bg-slate-900/30 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-amber-400 font-mono text-xs uppercase tracking-wider">
                Audiovisual Archive
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Audio Recordings & Video Footage
              </h2>
            </div>
            <Link
              href="/media"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              <span>Explore Media Gallery</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Media 1: BBC 1931 Address */}
            <Link
              href="/media/audio/track-bbc-1931"
              className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    HISTORIC AUDIO
                  </span>
                  <span>1931 • London</span>
                </div>
                <h3 className="text-base font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                  BBC Radio Address on Constitutional Safeguards
                </h3>
                <p className="mt-2 text-xs text-slate-300 line-clamp-3">
                  Recorded during the Second Round Table Conference, setting forth the human rights imperative for the Depressed Classes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3 fill-current" />
                  <span>Listen to Recording</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">4m 18s</span>
              </div>
            </Link>

            {/* Media 2: Constituent Assembly 1949 */}
            <Link
              href="/media/video/video-cad-1949"
              className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    HISTORIC VIDEO
                  </span>
                  <span>25 Nov 1949</span>
                </div>
                <h3 className="text-base font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                  Constituent Assembly: The Final Presentation
                </h3>
                <p className="mt-2 text-xs text-slate-300 line-clamp-3">
                  Documentary footage capturing Dr. Ambedkar presenting the final draft of the Indian Constitution to Assembly President Dr. Rajendra Prasad.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3 fill-current" />
                  <span>Watch Video & Transcript</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">12m 43s</span>
              </div>
            </Link>

            {/* Media 3: AIR 1950 Broadcast */}
            <Link
              href="/media/audio/track-air-1950"
              className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    HISTORIC BROADCAST
                  </span>
                  <span>26 Jan 1950</span>
                </div>
                <h3 className="text-base font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                  All India Radio: Voice of the Republic
                </h3>
                <p className="mt-2 text-xs text-slate-300 line-clamp-3">
                  Historical address on the eve of the Constitution's commencement expounding Justice, Liberty, Equality, and Fraternity.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3 fill-current" />
                  <span>Listen to Broadcast</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">6m 45s</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </div>
  );
}
