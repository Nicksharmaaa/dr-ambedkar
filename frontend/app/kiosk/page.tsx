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
  Volume2,
  Search,
  ArrowRight,
  Sparkles,
  Home,
  Shield,
  Check
} from "lucide-react";
import { useMuseum } from "@/components/museum/MuseumContext";
import { UI_STRINGS } from "@/utils/i18n";
import { Language } from "@/types/museum";

interface AttractQuote {
  quote: string;
  quoteLocal?: Record<string, string>;
  context: string;
}

const ATTRACT_QUOTES: AttractQuote[] = [
  {
    quote: "Educate, Agitate, Organise, have faith in yourself and never lose hope.",
    quoteLocal: {
      hi: "शिक्षित बनो, आंदोलन करो, संगठित रहो; अपने आप में विश्वास रखो और कभी उम्मीद मत खोओ।",
      mr: "शिका, संघटित व्हा, संघर्ष करा; स्वतःवर विश्वास ठेवा आणि कधीही आशा सोडू नका.",
      ta: "கற்பி, கிளர்ந்தெழு, ஒன்றுசேர்; உங்கள் மீது நம்பிக்கை வையுங்கள், ஒருபோதும் நம்பிக்கையை இழக்காதீர்கள்.",
      bn: "শিক্ষিত হও, আন্দোলন করো, সংগঠিত হও; নিজের ওপর বিশ্বাস রাখো এবং কখনো আশা হারিও না।"
    },
    context: "All India Depressed Classes Conference, Nagpur (1942)",
  },
  {
    quote: "Political democracy cannot last unless there lies at the base of it social democracy.",
    quoteLocal: {
      hi: "राजनीतिक लोकतंत्र तब तक नहीं टिक सकता जब तक कि उसके आधार में सामाजिक लोकतंत्र न हो।",
      mr: "सामाजिक लोकशाहीचा पाया असल्याशिवाय राजकीय लोकशाही टिकू शकत नाही.",
      ta: "சமூக ஜனநாயகம் என்ற அடித்தளம் இல்லாத வரை அரசியல் ஜனநாயகம் நிலைத்திருக்க முடியாது.",
      bn: "সামাজিক গণতন্ত্রের ভিত্তি ছাড়া রাজনৈতিক গণতন্ত্র কখনোই স্থায়ী হতে পারে না।"
    },
    context: "Speech in the Constituent Assembly (25 November 1949)",
  },
  {
    quote: "Caste is not just a division of labour, it is a division of labourers.",
    quoteLocal: {
      hi: "जाति केवल श्रम का विभाजन नहीं है, बल्कि यह श्रमिकों का श्रेणीबद्ध विभाजन है।",
      mr: "जात ही केवळ कामाची विभागणी नाही, तर ती माणसांची आणि श्रमिकांची उतरंड आहे.",
      ta: "சாதி என்பது வெறும் உழைப்பின் பிரிவினை மட்டுமல்ல, அது உழைப்பாளர்களின் படிநிலை பிரிவினையாகும்.",
      bn: "জাতিভেদ কেবল শ্রমের বিভাজন নয়, এটি শ্রমিকদের স্তরায়িত বিভাজন।"
    },
    context: "Annihilation of Caste (1936)",
  },
  {
    quote: "Lost rights are never regained by begging... but by relentless struggle.",
    quoteLocal: {
      hi: "छीने हुए अधिकार कभी दया की भीख से नहीं मिलते, बल्कि निरंतर संघर्ष से हासिल होते हैं।",
      mr: "हिरावून घेतलेले हक्क भीक मागून कधीच मिळत नाहीत, तर अखंड संघर्षाने मिळतात.",
      ta: "இழந்த உரிமைகள் யாசிப்பதால் ஒருபோதும் கிடைக்காது... மாறாக இடைவிடாத போராட்டத்தாலேயே கிடைக்கும்.",
      bn: "ভিক্ষা চেয়ে হারানো অধিকার কখনোই ফিরে পাওয়া যায় না... তা কেবল অবিরাম সংগ্রামের মাধ্যমেই পাওয়া সম্ভব।"
    },
    context: "Address to the Depressed Classes (1927)",
  },
];

export default function KioskPage() {
  const router = useRouter();
  const { language, setLanguage } = useMuseum();
  const t = UI_STRINGS[language] || UI_STRINGS.en;

  // Kiosk state
  const [isAttractMode, setIsAttractMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [inactivityTimer, setInactivityTimer] = useState<number>(120);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const kioskCategories = [
    {
      title: t.catWritings || "Explore Writings & Speeches",
      subtitle: "112 Multilingual Volumes",
      desc: language === 'hi' ? "22 खंडों के मूल ग्रंथों, लेखों और अभिलेखों का अन्वेषण करें।"
        : language === 'mr' ? "२२ खंडांमधील मूळ ग्रंथ, भाषणे आणि ऐतिहासिक दस्तऐवज चाळा."
        : language === 'ta' ? "22 தொகுதிகளில் உள்ள அசல் நூல்கள் மற்றும் உரைகளை ஆராயுங்கள்."
        : language === 'bn' ? "২২টি খণ্ডের মূল গ্রন্থ, ভাষণ এবং ঐতিহাসিক নথি অনুসন্ধান করুন।"
        : "Browse through original texts in English, Hindi, Bengali, Gujarati, and Tamil.",
      icon: BookOpen,
      href: "/documents",
      color: "from-amber-500/20 to-amber-700/20 border-amber-500/40 text-amber-300",
    },
    {
      title: t.timelineTitle || "Interactive Timeline",
      subtitle: "1891–1956 Life & Milestones",
      desc: language === 'hi' ? "प्रारंभिक शिक्षा, महाड सत्याग्रह, संविधान निर्माण और धम्म दीक्षा की समयरेखा।"
        : language === 'mr' ? "प्राथमिक शिक्षण, महाड सत्याग्रह, घटना निर्मिती व धम्मक्रांतीची कालरेषा."
        : language === 'ta' ? "தொடக்கக் கல்வி, மகாத் சத்தியாகிரகம், அரசியலமைப்பு உருவாக்கம் மற்றும் வரலாற்று நிகழ்வுகள்."
        : language === 'bn' ? "প্রাথমিক শিক্ষা, মহাদ সত্যাগ্রহ, সংবিধান প্রণয়ন ও মহাপরিনির্বাণের কালরেখা।"
        : "Touch through the formative eras, legal battles, and constitutional assembly.",
      icon: Clock,
      href: "/timeline",
      color: "from-blue-500/20 to-blue-700/20 border-blue-500/40 text-blue-300",
    },
    {
      title: t.memorialsTitle || "Historical Memorials & Geography",
      subtitle: "Panchtirth National Shrines",
      desc: language === 'hi' ? "महू, लंदन, महाड, दिल्ली, नागपुर और चैत्य भूमि का 3D संवादात्मक मानचित्र।"
        : language === 'mr' ? "महू, लंडन, महाड, दिल्ली, नागपूर आणि चैत्यभूमीचा ३D संवादात्मक नकाशा."
        : language === 'ta' ? "பஞ்சதீர்த்த நினைவகங்கள் மற்றும் வரலாற்று முக்கியத்துவம் வாய்ந்த தளங்கள்."
        : language === 'bn' ? "পঞ্চতীর্থ জাতীয় স্মারক এবং ঐতিহাসিক স্থানগুলির ৩D মানচিত্র।"
        : "Explore Mahad Satyagraha, London Memorial, Deekshabhoomi, and Chaitya Bhoomi.",
      icon: Compass,
      href: "/memorials",
      color: "from-emerald-500/20 to-emerald-700/20 border-emerald-500/40 text-emerald-300",
    },
    {
      title: t.mediaTitle || "Audiovisual Gallery",
      subtitle: "Historic Speeches & Recordings",
      desc: language === 'hi' ? "दुर्लभ बीबीसी साक्षात्कार और संविधान सभा के ऐतिहासिक ऑडियो भाषण सुनें।"
        : language === 'mr' ? "दुर्मिळ बीबीसी मुलाखत आणि संविधान सभेतील ऐतिहासिक भाषणे ऐका."
        : language === 'ta' ? "வரலாற்றுப் பதிவுகள் மற்றும் ஆவணப்படக் காட்சிகளைக் கேளுங்கள்."
        : language === 'bn' ? "ঐতিহাসিক অডিও রেকর্ডিং ও তথ্যচিত্রের সরাসরি সম্প্রচার।"
        : "Listen to original archival recordings and watch documentary footage.",
      icon: Volume2,
      href: "/media",
      color: "from-purple-500/20 to-purple-700/20 border-purple-500/40 text-purple-300",
    },
  ];

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
    if (!isAttractMode) return;

    const resetInactivity = () => {
      setInactivityTimer(120);
    };

    window.addEventListener("touchstart", resetInactivity);
    window.addEventListener("click", resetInactivity);
    window.addEventListener("keydown", resetInactivity);

    timerRef.current = setInterval(() => {
      setInactivityTimer((prev) => {
        if (prev <= 1) {
          handlePrivacyReset();
          return 120;
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

  const handlePrivacyReset = () => {
    setSearchQuery("");
    sessionStorage.clear();
    setIsAttractMode(true);
    setInactivityTimer(120);
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

  // ── RENDER ATTRACT SCREEN ──────────────────────────────────────────
  if (isAttractMode) {
    const curQuote = ATTRACT_QUOTES[quoteIndex];
    const displayQuote = (language !== 'en' && curQuote.quoteLocal?.[language])
      ? curQuote.quoteLocal[language]
      : curQuote.quote;

    return (
      <div
        onClick={handleStartExploring}
        className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-8 sm:p-14 select-none cursor-pointer overflow-hidden animate-in fade-in duration-500 font-dmsans"
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
                {t.brandTitle || "Ambedkar Digital Heritage Archive"}
              </div>
              <div className="text-xs font-mono text-amber-400">{t.kioskModeTitle || "Interactive Museum Kiosk Edition"}</div>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            {t.touchScreenEnabled || "Touch Screen Enabled"}
          </div>
        </div>

        {/* Centerpiece: Monumental Rotating Historical Quote */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Babasaheb Dr. B.R. Ambedkar (1891–1956)</span>
          </div>

          <blockquote className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight transition-all duration-700">
            &ldquo;{displayQuote}&rdquo;
          </blockquote>

          <div className="text-sm sm:text-base text-amber-400/90 font-serif italic">
            — {curQuote.context}
          </div>
        </div>

        {/* Bottom Call to Touch */}
        <div className="relative z-10 text-center space-y-3">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-base shadow-2xl shadow-amber-500/30 animate-pulse">
            <span>{t.kioskAttractHint || "Touch Screen to Begin Exploring"}</span>
            <ArrowRight className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 font-mono">
            English • हिंदी • मराठी • தமிழ் • বাংলা
          </p>
        </div>
      </div>
    );
  }

  // ── RENDER ACTIVE KIOSK INTERFACE ──────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none font-dmsans">
      {/* ── Kiosk Top Navigation Bar ─────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="min-h-[50px] min-w-[50px] rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Return to Main Portal"
          >
            <Home className="h-5 w-5 text-amber-400" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-serif font-bold text-white">
              {t.kioskModeTitle || "Museum Exhibition Kiosk"}
            </h1>
            <span className="text-xs text-amber-400 font-mono">{t.kioskModeSub || "Touch-Optimized Interactive Shell"}</span>
          </div>
        </div>

        {/* Language Quick Switcher Pills for Touch Kiosk */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
          {[
            { id: 'en', label: 'English' },
            { id: 'hi', label: 'हिंदी' },
            { id: 'mr', label: 'मराठी' },
            { id: 'ta', label: 'தமிழ்' },
            { id: 'bn', label: 'বাংলা' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id as Language)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                language === lang.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Inactivity Reset & Fullscreen Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span>Reset in {inactivityTimer}s</span>
          </div>

          <button
            onClick={handlePrivacyReset}
            className="min-h-[48px] px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Clear visitor session data and return to attract screen"
          >
            <Shield className="h-4 w-4" />
            <span>{t.resetSession || "End Session"}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="min-h-[48px] min-w-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
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
            id="kiosk-touch-search-input"
            name="kiosk_search_query"
            autoComplete="off"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchCorpusPlaceholder || t.searchPlaceholder || "Touch to search archival documents, speeches, or topics..."}
            className="w-full pl-16 pr-36 py-5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-base focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="absolute right-3 min-h-[48px] px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            {t.searchCorpus || "Search"}
          </button>
        </form>

        {/* 4 Large Touch Target Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kioskCategories.map((cat) => {
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
        <span>{t.footerPlatform || "Dr. B.R. Ambedkar Digital Preservation Archive • Exhibition Kiosk"}</span>
        <span>Automatic session reset purges all search history for privacy.</span>
      </footer>
    </div>
  );
}
