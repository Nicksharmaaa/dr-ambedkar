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
import { LinearTimelineSection } from './LinearTimelineSection';
import { soundEffects } from '@/utils/soundEffects';

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
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      soundEffects.playClick();
      onSearchSubmit(searchInput.trim());
    }
  };

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
    <div className="min-h-screen bg-[#FAF7F0] text-[#0A2947] pb-28 space-y-24 font-dmsans selection:bg-[#D3D4C0] selection:text-[#0A2947]">
      
      {/* =========================================================================
          HERO EXHIBITION: CINEMATIC MUSEUM ENTRANCE
          ========================================================================= */}
      <section className="relative overflow-hidden bg-[#FAF7F0] pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#D3D4C0]">
        
        {/* Archival Parchment Texture Pattern */}
        <div className="absolute inset-0 parchment-surface opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
          
          {/* Left: Curatorial Identity & Exhibition Entrance */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Museum Header Tags */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-[#0A2947] text-[#FAF7F0] text-[11px] font-cinzel font-bold uppercase tracking-widest rounded-md shadow-xs">
                Dr. B. R. Ambedkar Digital Heritage Archive
              </span>
              <span className="px-2.5 py-1 bg-white border border-[#D3D4C0] text-[#8B5E3C] text-[10px] font-mono font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C]" />
                <span>22 Volumes Digitize-Verified</span>
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

              {onReplayIntro && (
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onReplayIntro();
                  }}
                  className="px-4 py-3.5 bg-white hover:bg-[#FAF7F0] text-[#8B5E3C] border border-[#D3D4C0] hover:border-[#8B5E3C] rounded-xl text-xs font-montserrat font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-98"
                  title="Watch 5s Cinematic Exhibition Intro"
                >
                  <Film className="w-4 h-4 text-[#8B5E3C]" />
                  <span>Prologue</span>
                </button>
              )}
            </div>

            {/* Archival Catalog Search Bar */}
            <form onSubmit={handleSearch} className="pt-2 max-w-lg">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-[#8B5E3C]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Inquire corpus (e.g. Article 32, Poona Pact, Annihilation of Caste)..."
                  className="w-full pl-10 pr-24 py-3 bg-white text-[#0A2947] placeholder-[#0A2947]/45 text-xs sm:text-sm rounded-xl border border-[#D3D4C0] focus:border-[#0A2947] focus:outline-none transition-all shadow-xs"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3.5 py-1.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] text-xs font-montserrat font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

          </div>

          {/* Right: Layered Archival Photographic Plate with Ken Burns movement */}
          <div className="lg:col-span-5 relative">
            <div className="museum-photo-frame rounded-2xl bg-white border border-[#D3D4C0] shadow-xl group">
              
              <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-[#07131F]">
                <img
                  src={HERO_IMAGE}
                  alt="Dr. Bhimrao Ramji Ambedkar archival portrait"
                  className="w-full h-full object-cover grayscale contrast-110 object-top transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07131F]/90 via-[#07131F]/20 to-transparent" />

                {/* Brass Plate Museum Label */}
                <div className="absolute bottom-4 left-4 right-4 text-white bg-[#07131F]/85 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs font-cinzel font-bold text-[#C89D56]">
                    <span>Dr. Bhimrao Ramji Ambedkar</span>
                    <span className="font-mono text-white/70">1891–1956</span>
                  </div>
                  <p className="text-[11px] text-[#D3D4C0] leading-snug font-dmsans">
                    Chief Architect of the Constitution of India · First Minister of Law & Justice · Economist, Jurist & Social Emancipator
                  </p>
                </div>
              </div>

              {/* Museum Accession Stamp */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded border border-[#D3D4C0] text-[10px] font-mono font-bold text-[#0A2947] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C]" />
                <span>ARC-1891-1956</span>
              </div>
            </div>
          </div>

        </div>

        {/* Archival Epoch Gateways */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#D3D4C0]/80">
          <div className="flex items-center justify-between mb-3">
            <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#8B5E3C]">
              Historical Epochs · 1916–1956
            </span>
            <span className="text-[11px] font-mono text-[#0A2947]/60 hidden sm:inline">
              Select an epoch to examine verified treatises
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {historicalGateways.map((gate) => (
              <button
                key={gate.period}
                onClick={() => {
                  soundEffects.playClick();
                  onExploreCategory(gate.eraFilter);
                  onNavigateTab('archive');
                }}
                className="p-3.5 rounded-xl bg-white border border-[#D3D4C0] hover:border-[#8B5E3C] hover:bg-[#F3E4C9]/40 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif-editorial text-lg font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors">
                    {gate.period}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8B5E3C] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-xs font-montserrat font-bold text-[#8B5E3C] mt-0.5">
                  {gate.label}
                </div>
                <div className="text-[11px] text-[#0A2947]/70 line-clamp-1 mt-1 leading-snug">
                  {gate.event}
                </div>
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* =========================================================================
          SECTION 1: FEATURED ARTIFACT (Museum Facsimile Showcase)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#D3D4C0] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5E3C] via-[#C89D56] to-[#0A2947]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Scanned Facsimile Plate */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#D3D4C0] shadow-md bg-[#0A2947]">
                <img
                  src={DRAFTING_CONSTITUTION_IMAGE}
                  alt="Historic Constitution Drafting Committee"
                  className="w-full h-80 sm:h-96 object-cover object-top grayscale contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2947]/95 via-[#0A2947]/30 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs space-y-1">
                  <span className="font-montserrat font-bold text-[#F3E4C9] block uppercase tracking-wider text-[10px]">
                    Archival Facsimile · November 25, 1949
                  </span>
                  <h4 className="font-serif-editorial text-base text-white leading-snug font-bold">
                    Constituent Assembly Proceedings
                  </h4>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-[#D3D4C0]">
                    <span>Vol. XI, pp. 972–981</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-bold">OCR 99.8%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Curatorial Dossier */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
                  Featured Archival Artifact
                </span>
                <span className="text-xs font-mono text-[#0A2947]/40">·</span>
                <span className="text-xs font-mono text-[#0A2947]/70 font-semibold">{featuredDocument.accessionNo}</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl text-[#0A2947] font-bold leading-tight">
                  {featuredDocument.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#0A2947]/80 leading-relaxed font-dmsans">
                  {featuredDocument.shortDescription}
                </p>
              </div>

              {/* Excerpt */}
              <div className="p-4 bg-[#FAF7F0] border-l-3 border-[#8B5E3C] rounded-r-xl space-y-1.5">
                <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C] block">
                  Unabridged Historical Excerpt
                </span>
                <blockquote className="text-xs sm:text-sm text-[#0A2947] italic font-serif-editorial leading-relaxed">
                  "On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality... Political democracy cannot last unless there lies at the base of it social democracy."
                </blockquote>
              </div>

              {/* Direct Controls */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onOpenDocument(featuredDocument);
                  }}
                  className="px-5 py-3 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-4 h-4 text-[#C89D56]" />
                  <span>Examine Folio in Viewer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onAskAssistantWithQuery("Analyze Dr. Ambedkar's speech on November 25, 1949 regarding the life of contradictions.");
                    const el = document.getElementById('ask-ai-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-3 bg-white hover:bg-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  <span>Inquire AI Scholar</span>
                </button>
              </div>

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
              className="p-5 sm:p-6 rounded-2xl bg-white border border-[#D3D4C0] hover:border-[#0A2947] text-left transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B5E3C] font-bold">
                    {thm.code}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#D3D4C0] group-hover:text-[#0A2947] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-serif-editorial text-lg font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors">
                  {thm.title}
                </h3>
                <p className="text-xs text-[#0A2947]/70 font-dmsans leading-relaxed">
                  {thm.desc}
                </p>
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-[#D3D4C0]/50 text-[11px] font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C] group-hover:text-[#0A2947]">
                Open Gallery &rarr;
              </div>
            </button>
          ))}
        </div>

      </section>

      {/* =========================================================================
          SECTION 3: TIMELINE (Interactive Linear Timeline Spine)
          ========================================================================= */}
      <div id="main-timeline-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LinearTimelineSection
          language={language}
          onOpenDocument={onOpenDocument}
          onAskAIAboutEvent={onAskAssistantWithQuery}
        />
      </div>

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
          SECTION 5: PHILOSOPHICAL TENETS & WORDS THAT MOVED HISTORY
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#D3D4C0]">
          <div>
            <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
              <Quote className="w-4 h-4 text-[#8B5E3C]" />
              <span>Inscriptions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] mt-1">
              Words That Moved History
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#8B5E3C] hidden sm:inline font-bold">
            Verified Archival Citations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {historicalQuotations.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#D3D4C0] hover:border-[#8B5E3C] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all shadow-xs hover:shadow-md group relative"
            >
              <div className="space-y-3.5">
                <Quote className="w-7 h-7 text-[#8B5E3C]/30" />
                <blockquote className="font-serif-editorial text-lg sm:text-xl text-[#0A2947] leading-snug font-medium italic">
                  "{item.quote}"
                </blockquote>
                <p className="text-xs text-[#0A2947]/70 font-dmsans">
                  {item.context}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-[#D3D4C0]/70 flex flex-col gap-3">
                <div>
                  <div className="font-montserrat font-bold text-xs text-[#0A2947]">
                    {item.source}
                  </div>
                  <div className="text-[10px] font-mono text-[#8B5E3C]">
                    {item.year} · Primary Corpus
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    const doc = ARCHIVE_DOCUMENTS.find(d => d.id === item.docId);
                    if (doc) onOpenDocument(doc);
                  }}
                  className="w-full py-2 bg-[#FAF7F0] group-hover:bg-[#0A2947] group-hover:text-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Examine Source Treatise</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
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

        <WisdomMachine
          language={language}
          onAskAI={onAskAssistantWithQuery}
        />
      </section>

      {/* =========================================================================
          SECTION 7: EMBEDDED BABASAHEB AI SCHOLAR RESEARCH DESK
          ========================================================================= */}
      <div id="ask-ai-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <HomeAskAI
          language={language}
          onOpenDocument={onOpenDocument}
          incomingQuery={incomingAIQuery}
          onQueryHandled={onClearAIQuery}
        />
      </div>

    </div>
  );
};
