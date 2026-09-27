'use client';

import React, { useState } from 'react';
import {
  Search, BookOpen, Sparkles, ArrowRight, Zap, Radio,
  Compass, Quote, Camera, CheckCircle2, Network, ShieldCheck,
  Star, ExternalLink, Calendar, FileText, ChevronRight, Bookmark, Film
} from 'lucide-react';
import { Language, ArchivalDocument } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import {
  ARCHIVE_DOCUMENTS, HERO_IMAGE, DRAFTING_CONSTITUTION_IMAGE,
  HISTORICAL_PHOTOS, TIMELINE_EVENTS
} from '@/data/archiveData';
import { WisdomMachine } from './WisdomMachine';
import { SoundboardWidget } from './SoundboardWidget';
import { HomeAskAI } from './HomeAskAI';
import { soundEffects } from '@/utils/soundEffects';
import DitherVeil from '@/components/ui/DitherVeil';
import ClickSpark from '@/components/ui/ClickSpark';
import { HomeStickySearchBar } from './navigation/HomeStickySearchBar';

interface HomeViewProps {
  language: Language;
  onExploreCategory: (category: string) => void;
  onOpenDocument: (doc: ArchivalDocument) => void;
  onAskAssistantWithQuery: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  onNavigateTab: (tab: string) => void;
  incomingAIQuery?: string;
  onClearAIQuery?: () => void;
  onReplayIntro?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onExploreCategory,
  onOpenDocument,
  onAskAssistantWithQuery,
  onSearchSubmit,
  onNavigateTab,
  incomingAIQuery,
  onClearAIQuery,
  onReplayIntro
}) => {
  const t = UI_STRINGS[language];
  const [heroVisualMode, setHeroVisualMode] = useState<'prism' | 'dither'>('prism');

  // Landmark featured document: Constituent Assembly Speech 1949
  const featuredDocument = ARCHIVE_DOCUMENTS.find(d => d.id === 'constituent-assembly-speech-1949') || ARCHIVE_DOCUMENTS[0];
  const primaryCorpusDocs = ARCHIVE_DOCUMENTS.filter(d => d.id !== featuredDocument.id).slice(0, 3);

  // Museum Curatorial Themes (Concise, zero clutter)
  const museumThemes = [
    { id: 'constitution', title: 'Constitutional Law', desc: 'Drafting the sovereign charter and constitutional morality', docQuery: 'constitution', code: 'W-01' },
    { id: 'caste', title: 'Annihilation of Caste', desc: 'Critique of graded inequality and foundational human rights', docQuery: 'caste', code: 'W-02' },
    { id: 'economics', title: 'Monetary Economics', desc: 'Currency reform, public finance, and rural peasant agrarian policy', docQuery: 'economics', code: 'W-03' },
    { id: 'women', title: "Women's Emancipation", desc: 'The Hindu Code Bill, reproductive self-determination, and gender parity', docQuery: 'women', code: 'W-04' },
    { id: 'labour', title: 'Labour & Trade Unions', desc: 'Eight-hour workdays, social security insurance, and workers rights', docQuery: 'labour', code: 'W-05' },
    { id: 'religion', title: 'Buddhist Philosophy', desc: 'The Buddha and His Dhamma, moral fraternity, and psychological liberation', docQuery: 'buddhism', code: 'W-06' },
    { id: 'democracy', title: 'Social Democracy', desc: 'Associated living and the one man, one value principle', docQuery: 'democracy', code: 'W-07' },
    { id: 'education', title: 'Enlightenment & Reason', desc: 'Cultivation of mind as the ultimate aim of human existence', docQuery: 'education', code: 'W-08' },
    { id: 'human-rights', title: 'Civil Dignity & Water Rights', desc: 'Mahad Satyagraha and universal subaltern citizenship', docQuery: 'human rights', code: 'W-09' }
  ];

  // Curatorial Timeline Gateways
  const historicalGateways = [
    { period: '1916', label: 'Columbia & LSE', event: 'Castes in India & Doctoral Dissertations', eraFilter: 'early' },
    { period: '1927', label: 'Mahad Satyagraha', event: 'Universal Water Access & Bahishkrit Bharat', eraFilter: 'movements' },
    { period: '1936', label: 'Annihilation of Caste', event: 'Treatise on Moral Fraternity & Social Reform', eraFilter: 'movements' },
    { period: '1949', label: 'The Constitution', event: 'Chairman of Drafting Committee & Law Minister', eraFilter: 'constitution' },
    { period: '1956', label: 'The Great Conversion', event: 'Nagpur Dhamma Diksha & Final Treatises', eraFilter: 'later' }
  ];

  // Archival Quotation Inscriptions
  const historicalQuotations = [
    {
      quote: "Cultivation of mind should be the ultimate aim of human existence.",
      source: "Annihilation of Caste",
      year: "1936",
      docId: "annihilation-of-caste",
      context: "Foundational treatise on reason and universal human dignity."
    },
    {
      quote: "Political democracy cannot last unless there lies at the base of it social democracy.",
      source: "Constituent Assembly Debates",
      year: "1949",
      docId: "constituent-assembly-speech-1949",
      context: "Historic closing address on the adoption of the Constitution."
    },
    {
      quote: "Educate, Agitate, Organise — have faith in yourselves and never lose moral courage.",
      source: "All-India Depressed Classes Conference",
      year: "1942",
      docId: "states-and-minorities-1947",
      context: "Rallying call for emancipation through knowledge and collective action."
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] pb-28 space-y-24 font-dmsans selection:bg-[#D3D4C0] selection:text-[#0A2947]">

      {/* Clean Persistent Sticky Top-Center Search Bar */}
      <HomeStickySearchBar onSearchSubmit={onSearchSubmit} />

      {/* =========================================================================
          HERO EXHIBITION: CINEMATIC MUSEUM ENTRANCE
          ========================================================================= */}
      <section className="relative overflow-hidden bg-transparent -mt-20 sm:-mt-24 pt-0 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#D3D4C0]">

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">

          {/* Left: Curatorial Identity & Exhibition Entrance */}
          <div className="lg:col-span-7 space-y-6">

            {/* Museum Header Tags */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-[#0A2947] text-[#FAF7F0] text-[11px] font-cinzel font-bold uppercase tracking-widest rounded-md shadow-xs">
                Dr. B. R. Ambedkar Digital Heritage Archive
              </span>
            </div>

            {/* Display Exhibition Typography */}
            <div className="space-y-2">
              <p className="font-cinzel text-xs sm:text-sm tracking-[0.25em] text-[#8B5E3C] uppercase font-bold">
                1891 — 1956 · Curatorial Exhibition
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-editorial font-bold text-[#0A2947] tracking-tight leading-[1.04]">
                Ideas That <br />
                <span className="italic font-normal">Rewrote</span> a Nation.
              </h1>
            </div>

            {/* Concise Archival Subtitle */}
            <p className="text-sm sm:text-base text-[#0A2947]/80 leading-relaxed font-normal max-w-xl">
              Explore primary manuscripts, constituent assembly transcripts, photographic records, and source-grounded historical intelligence.
            </p>

            {/* Direct Exhibition Navigation CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onNavigateTab('archive');
                }}
                className="px-6 py-3.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] rounded-xl text-xs sm:text-sm font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer shadow-md active:scale-98"
              >
                <BookOpen className="w-4 h-4 text-[#C89D56]" />
                <span>Enter The Archive</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  onNavigateTab('timeline');
                }}
                className="px-5 py-3.5 bg-white hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] hover:border-[#8B5E3C] rounded-xl text-xs sm:text-sm font-montserrat font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-98"
              >
                <Compass className="w-4 h-4 text-[#8B5E3C]" />
                <span>Chronology</span>
              </button>
            </div>

            {/* Curated Historical Inquiry Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold">
                Quick Inquiries:
              </span>
              {[
                'Annihilation of Caste',
                'Constituent Assembly',
                'Poona Pact',
                'Article 32',
                'Problem of the Rupee'
              ].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    onSearchSubmit(topic);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-[#FAF7F0] border border-[#D3D4C0] hover:border-[#8B5E3C] text-[11px] font-dmsans text-[#0A2947] hover:text-[#8B5E3C] transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  {topic}
                </button>
              ))}
            </div>

          </div>

          {/* Right: Dual-Mode Hero Visual Presentation */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">

            {/* Mode Switcher Pill: Holographic Prism & Archival Dither */}
            <div className="mb-2 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#D3D4C0] shadow-xs z-20">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setHeroVisualMode('prism');
                }}
                className={`px-3.5 py-1 rounded-full text-[11px] font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${heroVisualMode === 'prism'
                  ? 'bg-[#0A2947] text-[#FAF7F0] shadow-xs'
                  : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                  }`}
              >
                <span>Hologram</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setHeroVisualMode('dither');
                }}
                className={`px-3.5 py-1 rounded-full text-[11px] font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${heroVisualMode === 'dither'
                  ? 'bg-[#0A2947] text-[#FAF7F0] shadow-xs'
                  : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                  }`}
              >
                <span>Archival Dither</span>
              </button>
            </div>

            {/* 600px Presentation Stage */}
            <div style={{ width: '100%', height: '600px', position: 'relative' }}>
              {heroVisualMode === 'dither' ? (
                <DitherVeil
                  src="hero.png"
                  pattern="floyd"
                  pixelSize={2}
                  inkColor="#0a2947"
                  paperColor="#f4f1ea"
                  revealRadius={200}
                  softness={0.6}
                  linger={1}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src="/hero.png"
                    alt="Dr. B. R. Ambedkar Iridescent Chrome Memorial Sculpture"
                    className="animate-hero-float max-h-[540px] w-auto object-contain drop-shadow-[0_25px_40px_rgba(10,41,71,0.25)] select-none pointer-events-none filter brightness-105 contrast-105"
                  />
                </div>
              )}
            </div>

            {/* Dignified Memorial Inscription Plinth */}
            <div className="mt-1 text-center px-4">
              <div className="font-cinzel font-bold text-base sm:text-lg text-[#0A2947] tracking-wider uppercase">
                Dr. Bhimrao Ramji Ambedkar
              </div>
              <p className="text-xs font-mono text-[#8B5E3C] tracking-wide mt-0.5">
                1891–1956 · Chief Architect of the Constitution · Bharat Ratna
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          SECTION 2: EXHIBITIONS BY THEME (Curatorial Discipline Galleries)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#D3D4C0]">
          <div>
            <div className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#8B5E3C]">
              Curatorial Galleries
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] mt-1">
              Explore by Discipline & Theme
            </h2>
            <p className="text-xs sm:text-sm text-[#0A2947]/75 mt-0.5">
              The 22 volumes structured through nine foundational intellectual disciplines.
            </p>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onNavigateTab('archive');
            }}
            className="text-xs font-montserrat font-bold text-[#8B5E3C] hover:text-[#0A2947] uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>View All Works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {museumThemes.map((thm) => (
            <button
              key={thm.id}
              onClick={() => {
                soundEffects.playClick();
                onExploreCategory(thm.docQuery);
                onNavigateTab('archive');
              }}
              className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#C8C9B4] hover:border-[#0A2947] text-left transition-all hover:shadow-lg cursor-pointer group flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B5E3C] font-bold">
                    {thm.code}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#8B5E3C] group-hover:text-[#0A2947] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-serif-editorial text-lg font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors">
                  {thm.title}
                </h3>
                <p className="text-xs text-[#334155] font-normal leading-relaxed">
                  {thm.desc}
                </p>
              </div>

              <div className="pt-3.5 mt-3.5 border-t-2 border-[#D3D4C0]/70 text-[11px] font-montserrat font-bold uppercase tracking-wider text-[#0A2947] group-hover:text-[#8B5E3C]">
                Open Gallery &rarr;
              </div>
            </button>
          ))}
        </div>

      </section>

      {/* =========================================================================
          SECTION 4: PHOTOGRAPHIC ARCHIVE (Museum Gallery Wall)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#D3D4C0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#D3D4C0]">
            <div>
              <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-widest">
                <Camera className="w-3.5 h-3.5 text-[#8B5E3C]" />
                <span>Visual Heritage Folio</span>
                <span>·</span>
                <span className="text-[#0A2947]">1891–1956</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] mt-1">
                Archival Photographic Records
              </h2>
              <p className="text-xs sm:text-sm text-[#0A2947]/75 mt-0.5 max-w-xl font-dmsans">
                Original plates preserving historic assemblies, university studies, and the drafting of the Constitution.
              </p>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onNavigateTab('gallery');
              }}
              className="px-5 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <span>Examine Folio ({HISTORICAL_PHOTOS.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HISTORICAL_PHOTOS.slice(0, 4).map((photo) => (
              <div
                key={photo.id}
                onClick={() => {
                  soundEffects.playClick();
                  onNavigateTab('gallery');
                }}
                className="group relative rounded-2xl overflow-hidden bg-[#07131F] border border-[#D3D4C0] hover:border-[#8B5E3C] shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer h-72"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-2.5 left-2.5 bg-[#07131F]/90 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#F3E4C9] z-10">
                  {photo.year} · {photo.location.split(',')[0]}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#07131F] via-[#07131F]/70 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#C89D56]">
                    {photo.accessionNumber}
                  </span>
                  <h4 className="font-montserrat font-bold text-white text-sm line-clamp-2 mt-0.5">
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-[#D3D4C0] line-clamp-2 mt-1 leading-snug">
                    {photo.caption}
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-[#F3E4C9] font-montserrat font-bold">
                    <span>Inspect Plate</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: AUDIOVISUAL ARCHIVE (Voices & Historical Broadcasts)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <WisdomMachine
          language={language}
          onAskAI={onAskAssistantWithQuery}
        />


        <SoundboardWidget
          onOpenDocument={(docId) => {
            const doc = ARCHIVE_DOCUMENTS.find(d => d.id === docId);
            if (doc) onOpenDocument(doc);
          }}
        />


      </section>

    </div>
  );
};
