'use client';

import React, { useState } from 'react';
import {
  Search, BookOpen, Sparkles, ArrowRight, Zap, Radio,
  Compass, Quote, Camera, CheckCircle2, Network, ShieldCheck,
  Star, ExternalLink, Calendar, FileText, ChevronRight, Bookmark, Film,
  Clock
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
import DepthCarousel from '@/components/ui/DepthCarousel';
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

  // Archival Photographs of Babasaheb Dr. B. R. Ambedkar for Depth Carousel
  const items = React.useMemo(() => {
    const base = HISTORICAL_PHOTOS.map((photo) => ({
      image: photo.imageUrl,
      alt: photo.title,
      title: photo.title,
      subtitle: `${photo.year} · ${photo.location.split(',')[0]}`,
      year: photo.year,
      id: photo.id,
    }));

    const additional = [
      {
        image: '/images/ambedkar_wikimedia.jpg',
        alt: 'Historic Photographic Portrait of Dr. B. R. Ambedkar (1935)',
        title: 'Scholar & Jurist',
        subtitle: '1935 · Mumbai',
        year: 1935,
        id: 'photo-wikimedia-portrait',
      },
      {
        image: '/images/constituent_assembly_hall_1790176093139.jpg',
        alt: 'The Constituent Assembly Chamber at New Delhi',
        title: 'Framing the Sovereign Charter',
        subtitle: '1949 · New Delhi',
        year: 1949,
        id: 'photo-assembly-debates-1949',
      },
    ];

    return [...base, ...additional];
  }, []);

  // 9 Core Museum Exploration Wings (Aligned 1:1 with Side Navigation Rail, excluding Exhibition/Home)
  const navigationWings = [
    {
      id: 'archive',
      tab: 'archive',
      title: 'The Archive',
      subtitle: 'BAWS Volumes 1–22 · Full Corpus',
      icon: BookOpen
    },
    {
      id: 'timeline',
      tab: 'timeline',
      title: 'Timeline Chronicle',
      subtitle: '1891–1956 · Five Historical Epochs',
      icon: Clock
    },
    {
      id: 'media',
      tab: 'media',
      title: 'Media & Voice',
      subtitle: 'BBC Broadcasts & Historic Audio',
      icon: Radio
    },
    {
      id: 'assistant',
      tab: 'assistant',
      title: 'AI Scholar',
      subtitle: 'Grounded Archival Research & Citations',
      icon: Sparkles
    },
    {
      id: 'gallery',
      tab: 'gallery',
      title: 'Visual Folio',
      subtitle: 'Rare Photographic Prints & Plates',
      icon: Camera
    },
    {
      id: 'graph',
      tab: 'graph',
      title: '3D Knowledge Graph',
      subtitle: 'Interactive Semantic Lineage & Map',
      icon: Network
    },
    {
      id: 'stories',
      tab: 'stories',
      title: 'Audio Stories',
      subtitle: 'Guided Audiovisual Walkthroughs',
      icon: Star
    },
    {
      id: 'quest',
      tab: 'quest',
      title: 'Interactive Quest',
      subtitle: 'Constitutional Challenges & Quiz',
      icon: Zap
    },
    {
      id: 'collection',
      tab: 'collection',
      title: 'Personal Notebook',
      subtitle: 'Saved Dossier & Scholarly Notes',
      icon: Bookmark
    },
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
          SECTION 2: MUSEUM EXPLORATION WINGS (Side Navigation Rail Portals)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#D3D4C0]">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial font-bold text-[#0A2947] mt-1 tracking-tight">
              Explore the Museum
            </h2>
            <p className="text-xs sm:text-sm text-[#0A2947]/75 mt-0.5 font-dmsans max-w-2xl">
              Direct access to all dedicated research pavilions, interactive archives, audio narrations, and 3D visualizers.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8B5E3C] bg-white/80 px-3.5 py-1.5 rounded-full border border-[#D3D4C0] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#C89D56] animate-pulse" />
            <span>9 Pavilions</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {navigationWings.map((wing) => {
            const Icon = wing.icon;
            return (
              <button
                key={wing.id}
                onClick={() => {
                  soundEffects.playClick();
                  onNavigateTab(wing.tab);
                }}
                className="group relative p-5 sm:p-6 rounded-2xl bg-white/85 hover:bg-white border border-[#D3D4C0] hover:border-[#0A2947]/30 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_-10px_rgba(10,41,71,0.08),0_2px_8px_rgba(200,157,86,0.06)] cursor-pointer flex flex-col justify-between h-[142px] sm:h-[150px] overflow-hidden backdrop-blur-xs shadow-2xs"
              >
                {/* Gilded Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C89D56] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Row: Icon Squircle & Directional Arrow */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] flex items-center justify-center text-[#0A2947] group-hover:bg-[#0A2947] group-hover:text-[#F3E4C9] group-hover:border-[#0A2947] group-hover:scale-105 group-hover:rotate-[-2deg] transition-all duration-300 shadow-2xs">
                    <Icon className="w-5 h-5 transition-transform duration-300" />
                  </div>
                  <div className="w-8 h-8 rounded-full border border-transparent group-hover:border-[#D3D4C0] group-hover:bg-[#FAF7F0] flex items-center justify-center text-[#8B5E3C]/60 group-hover:text-[#0A2947] group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Row: Minimal Title & 1-line Subtitle */}
                <div className="mt-auto">
                  <h3 className="font-serif-editorial text-lg sm:text-[19px] font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors leading-tight line-clamp-1">
                    {wing.title}
                  </h3>
                  <p className="text-xs text-[#0A2947]/65 font-dmsans mt-1 truncate">
                    {wing.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </section>

      {/* =========================================================================
          SECTION 4: PHOTOGRAPHIC ARCHIVE (Museum Gallery Wall)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#D3D4C0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#D3D4C0]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] mt-1">
                Gallery
              </h2>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onNavigateTab('gallery');
              }}
              className="px-5 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <span>See More ({HISTORICAL_PHOTOS.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* DepthCarousel: Dynamic 3D Perspective Photo Rail */}
          <div style={{ height: '580px', position: 'relative', overflow: 'hidden' }}>
            <DepthCarousel
              items={items}
              depth={85}
              spread={185}
              tilt={16}
              tiltDirection="both"
              perspective={1400}
              visibleCards={3}
              falloff={0.18}
              blur={1}
              autoplay
              loop
              cardWidth={420}
              cardHeight={500}
              radius={24}
              tint="#0a2947"
              autoplayDelay={2600}
              duration={900}
              ease="power2.out"
              showControls={false}
              showIndicators={false}
              onCardClick={(index, item) => {
                soundEffects.playClick();
                onNavigateTab('gallery');
              }}
            />
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: AUDIOVISUAL ARCHIVE (Voices & Historical Broadcasts)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

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
