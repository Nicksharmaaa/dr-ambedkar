"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  BookOpen,
  Clock,
  Compass,
  Mic,
  Search,
  Volume2,
  Play,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Home,
  Shield,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api";

const ATTRACT_QUOTES = [
  {
    quote: "Educate, Agitate, Organise, have faith in yourself and never lose hope.",
    context: "All India Depressed Classes Conference, Nagpur (1942)",
  },
  {
    quote: "Political democracy cannot last unless there lies at the base of it social democracy.",
    context: "Speech in the Constituent Assembly (25 November 1949)",
  },
  {
    quote: "Caste is not just a division of labour, it is a division of labourers.",
    context: "Annihilation of Caste (1936)",
  },
  {
    quote: "Lost rights are never regained by begging... but by relentless struggle.",
    context: "Address to the Depressed Classes (1927)",
  },
];

const KIOSK_CATEGORIES = [
  {
    title: "Explore Writings & Speeches",
    subtitle: "112 Multilingual Volumes",
    desc: "Browse through original texts in English, Hindi, Bengali, Gujarati, and Tamil.",
    icon: BookOpen,
    href: "/documents",
    color: "from-amber-500/20 to-amber-700/20 border-amber-500/40 text-amber-300",
  },
  {
    title: "Interactive Timeline",
    subtitle: "1891–1956 Life & Milestones",
    desc: "Touch through the formative eras, legal battles, and constitutional assembly.",
    icon: Clock,
    href: "/timeline",
    color: "from-blue-500/20 to-blue-700/20 border-blue-500/40 text-blue-300",
  },
  {
    title: "Historical Stories",
    subtitle: "Curated Archival Exhibits",
    desc: "Discover Mahad Satyagraha, Poona Pact, and the drafting of the Constitution.",
    icon: Compass,
    href: "/stories",
    color: "from-emerald-500/20 to-emerald-700/20 border-emerald-500/40 text-emerald-300",
  },
  {
    title: "Audiovisual Gallery",
    subtitle: "BBC 1931 & Constituent Assembly 1949",
    desc: "Listen to original archival recordings and watch documentary footage.",
    icon: Volume2,
    href: "/media",
    color: "from-purple-500/20 to-purple-700/20 border-purple-500/40 text-purple-300",
  },
];

export default function KioskPage() {
  const router = useRouter();

  // Kiosk state
  const [isAttractMode, setIsAttractMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [inactivityTimer, setInactivityTimer] = useState<number>(60);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Rotate quotes every 8 seconds in attract screen
  useEffect(() => {
    if (!isAttractMode) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ATTRACT_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAttractMode]);

  // Inactivity countdown when kiosk is active
  useEffect(() => {
    if (isAttractMode) return;

    const resetInactivity = () => {
      setInactivityTimer(60);
    };

    window.addEventListener("touchstart", resetInactivity);
    window.addEventListener("click", resetInactivity);
    window.addEventListener("keydown", resetInactivity);

    timerRef.current = setInterval(() => {
      setInactivityTimer((prev) => {
        if (prev <= 1) {
          // Reset to attract screen & purge privacy session
          handlePrivacyReset();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("touchstart", resetInactivity);
      window.removeEventListener("click", resetInactivity);
      window.removeEventListener("keydown", resetInactivity);
    };
  }, [isAttractMode]);

  // Session privacy reset (Section 28)
  const handlePrivacyReset = () => {
    setSearchQuery("");
    sessionStorage.clear();
    setIsAttractMode(true);
    setInactivityTimer(60);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleStartExploring = () => {
    setIsAttractMode(false);
    setInactivityTimer(60);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // ── RENDER ATTRACT SCREEN (Section 27) ──────────────────────────────────────────
  if (isAttractMode) {
    const curQuote = ATTRACT_QUOTES[quoteIndex];
    return (
      <div
        onClick={handleStartExploring}
        className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-8 sm:p-14 select-none cursor-pointer overflow-hidden animate-in fade-in duration-500"
      >
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[150px] pointer-events-none rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-serif font-bold text-white text-xl shadow-lg shadow-amber-500/20">
              BA
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-white">
                Ambedkar Heritage Archive
              </div>
              <div className="text-xs font-mono text-amber-400">Digital Museum Kiosk Edition</div>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            Touch Screen Enabled
          </div>
        </div>

        {/* Centerpiece: Monumental Rotating Historical Quote */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Babasaheb Dr. B.R. Ambedkar (1891–1956)</span>
          </div>

          <blockquote className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight transition-all duration-700">
            &ldquo;{curQuote.quote}&rdquo;
          </blockquote>

          <div className="text-sm sm:text-base text-amber-400/90 font-serif italic">
            — {curQuote.context}
          </div>
        </div>

        {/* Bottom Call to Touch */}
        <div className="relative z-10 text-center space-y-3">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-base shadow-2xl shadow-amber-500/30 animate-pulse">
            <span>Touch Screen to Begin Exploring</span>
            <ArrowRight className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 font-mono">
            English • हिंदी • मराठी • বাংলা • ગુજરાતી • தமிழ்
          </p>
        </div>
      </div>
    );
  }

  // ── RENDER ACTIVE KIOSK INTERFACE (Section 26) ──────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* ── Kiosk Top Navigation Bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="min-h-[50px] min-w-[50px] rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center transition-colors"
            title="Return to Main Portal"
          >
            <Home className="h-5 w-5 text-amber-400" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-serif font-bold text-white">
              Museum Exhibition Kiosk
            </h1>
            <span className="text-xs text-amber-400 font-mono">Touch-Optimized Interactive Shell</span>
          </div>
        </div>

        {/* Inactivity Reset & Fullscreen Controls */}
        <div className="flex items-center gap-3">
          {/* Privacy Reset Countdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span>Reset in {inactivityTimer}s</span>
          </div>

          <button
            onClick={handlePrivacyReset}
            className="min-h-[48px] px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Clear visitor session data and return to attract screen"
          >
            <Shield className="h-4 w-4" />
            <span>End Session</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="min-h-[48px] min-w-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Kiosk Main Content Area: Large Touch Cards ────────────────────────────── */}
      <main className="my-8 flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full space-y-8">
        {/* Large Touch Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl">
          <Search className="h-6 w-6 absolute left-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Touch to search archival documents, speeches, or topics..."
            className="w-full pl-16 pr-36 py-5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-base focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="absolute right-3 min-h-[48px] px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg transition-transform active:scale-95"
          >
            Search
          </button>
        </form>

        {/* 4 Large Touch Target Categories ($\ge 56\text{px}$) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {KIOSK_CATEGORIES.map((cat) => {
            const CIcon = cat.icon;
            return (
              <div
                key={cat.title}
                onClick={() => router.push(cat.href)}
                className={`min-h-[140px] p-6 rounded-3xl bg-gradient-to-br ${cat.color} bg-slate-900 border hover:border-amber-500 transition-all cursor-pointer flex items-center justify-between shadow-xl active:scale-98`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    {cat.subtitle}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    {cat.title}
                  </h2>
                  <p className="text-xs text-slate-300 font-sans max-w-md">{cat.desc}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shrink-0 ml-4">
                  <CIcon className="h-7 w-7 text-amber-400" />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Kiosk Footer ──────────────────────────────────────────────────────────── */}
      <footer className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
        <span>Dr. B.R. Ambedkar Digital Preservation Archive • Exhibition Kiosk v10.0</span>
        <span>Automatic session reset purges all search history for privacy.</span>
      </footer>
    </div>
  );
}
