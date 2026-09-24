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
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Collection, DatabaseHealth } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [cols, health] = await Promise.allSettled([
          api.listCollections(),
          api.getDatabaseHealth(),
        ]);
        if (mounted) {
          if (cols.status === "fulfilled") setCollections(cols.value);
          if (health.status === "fulfilled") setDbHealth(health.value);
        }
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
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
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-white/5 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[250px] bg-blue-600/10 blur-[110px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Digital Preservation & Institutional AI System</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
            The Archival Corpus of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">
              Dr. B.R. Ambedkar
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Preserving, structuring, and unlocking the philosophical, constitutional, and economic
            writings of Babasaheb with zero-hallucination grounded AI.
          </p>

          {/* Motto quote */}
          <div className="mt-3 text-xs tracking-widest uppercase font-mono text-slate-400">
            &ldquo;Educate, Agitate, Organise&rdquo;
          </div>

          {/* Hero Search Box */}
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
                className="w-full pl-12 pr-28 py-4 bg-slate-900/90 border border-white/15 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 text-sm backdrop-blur-md transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-md hover:shadow-amber-500/20 active:scale-95"
              >
                Search
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500">Suggested:</span>
              {[
                "Annihilation of Caste",
                "Problem of the Rupee",
                "Poona Pact",
                "Constituent Assembly",
                "State and Minorities",
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                  className="px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700/50 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-slate-100 text-xs font-semibold border border-white/10 hover:border-amber-500/40 transition-all shadow-sm"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              Explore Archive Catalog
            </Link>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all shadow-sm"
            >
              <Cpu className="h-4 w-4 text-amber-400" />
              Grounded AI Assistant
            </Link>
            <Link
              href="/timeline"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-slate-100 text-xs font-semibold border border-white/10 hover:border-amber-500/40 transition-all shadow-sm"
            >
              <Clock className="h-4 w-4 text-amber-400" />
              Historical Timeline
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics & System Health Bar */}
      <section className="py-6 border-b border-white/5 bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Stat 1 */}
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Turso Managed Database</div>
              <div className="mt-1 text-2xl font-bold text-slate-100 font-serif flex items-center gap-2">
                <span>libSQL</span>
                {dbHealth?.status === "ok" ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                )}
              </div>
              <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3 w-3" />
                <span>{dbHealth?.latency_ms ? `${dbHealth.latency_ms}ms latency` : "Active Cloud"}</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Archival Volumes (BAWS)</div>
              <div className="mt-1 text-2xl font-bold text-slate-100 font-serif">22 Volumes</div>
              <div className="mt-1 text-[11px] text-amber-400/80">Writings & Speeches Corpus</div>
            </div>

            {/* Stat 3 */}
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Preservation Standard</div>
              <div className="mt-1 text-2xl font-bold text-slate-100 font-serif">PREMIS 3.0</div>
              <div className="mt-1 text-[11px] text-sky-400">SHA-256 Fixity Audit</div>
            </div>

            {/* Stat 4 */}
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Linguistic Reach</div>
              <div className="mt-1 text-2xl font-bold text-slate-100 font-serif">22 Indic + EN</div>
              <div className="mt-1 text-[11px] text-purple-400">AI4Bharat Translation Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Collections Showcase */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Core Archival Records
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Curated Archival Collections
            </h2>
          </div>
          <Link
            href="/documents"
            className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            <span>View All Records</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group">
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                Primary Corpus
              </span>
              <h3 className="mt-1 text-lg font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Babasaheb Ambedkar: Writings & Speeches
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                The authoritative 22-volume collection published by the Government of Maharashtra,
                comprising speeches, historical analyses, and research papers from 1916 to 1956.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">22 Volumes Indexed</span>
              <Link
                href="/documents?collection=baws"
                className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Browse</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group">
            <div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                Legal & Constitutional
              </span>
              <h3 className="mt-1 text-lg font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Constituent Assembly Debates
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Verbatim records of Dr. Ambedkar as Chairman of the Drafting Committee. Explaining
                fundamental rights, directive principles, and the federal framework of India.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">1946–1950 Proceedings</span>
              <Link
                href="/documents?type=constituent_assembly"
                className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Browse</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group">
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Volume2 className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                Audio & Spoken Word
              </span>
              <h3 className="mt-1 text-lg font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Historical Speeches & Broadcasts
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Archival audio recordings, All India Radio addresses, and BBC broadcasts synchronized
                with automated transcriptions and paragraph-level translations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Audio & Transcripts</span>
              <Link
                href="/media"
                className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Browse</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Ingested Files Ready for Phase 3 */}
      <section className="py-12 border-t border-white/5 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase">Archival Staging</span>
              <h3 className="text-xl font-serif font-bold text-slate-100">
                Incoming Corpus Documents
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Ready for Document AI Ingestion
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Annihilation of Caste",
                date: "1936",
                desc: "Undelivered speech for the Jat-Pat Todak Mandal annual conference.",
                tag: "Philosophy / Society",
              },
              {
                title: "The Problem of the Rupee",
                date: "1923",
                desc: "Doctoral dissertation at LSE examining monetary history of British India.",
                tag: "Economics",
              },
              {
                title: "Castes in India: Their Mechanism",
                date: "1916",
                desc: "Paper presented at Columbia University anthropology seminar.",
                tag: "Anthropology",
              },
              {
                title: "State and Minorities",
                date: "1947",
                desc: "Memorandum submitted on fundamental rights and economic safeguards.",
                tag: "Constitutional Law",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                    {item.date}
                  </span>
                  <span className="text-slate-500">{item.tag}</span>
                </div>
                <h4 className="font-semibold text-slate-200 text-sm font-serif line-clamp-1">
                  {item.title}
                </h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
