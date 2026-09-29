'use client';

import React, { useState } from 'react';
import {
  Search, BookOpen, Sparkles, ArrowRight, Zap, Radio,
  Compass, Quote, Camera, CheckCircle2, Network, ShieldCheck,
  Star, ExternalLink, Calendar, FileText, ChevronRight, Bookmark, Film,
  Clock, GraduationCap, Microscope, Gamepad2
} from 'lucide-react';
import { Language, ArchivalDocument } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import {
  ARCHIVE_DOCUMENTS, HERO_IMAGE, DRAFTING_CONSTITUTION_IMAGE,
  HISTORICAL_PHOTOS, TIMELINE_EVENTS
} from '@/data/archiveData';
import { SoundboardWidget } from './SoundboardWidget';
import { HomeAskAI } from './HomeAskAI';
import { api } from '@/lib/api';
import { soundEffects } from '@/utils/soundEffects';
import dynamic from 'next/dynamic';
import DepthCarousel from '@/components/ui/DepthCarousel';

const DitherVeil = dynamic(() => import('@/components/ui/DitherVeil'), { ssr: false });

import { UserMode } from '@/types/museum';

interface HomeViewProps {
  language: Language;
  userMode?: UserMode;
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
  userMode = 'visitor',
  onExploreCategory,
  onOpenDocument,
  onAskAssistantWithQuery,
  onSearchSubmit,
  onNavigateTab,
  incomingAIQuery,
  onClearAIQuery,
  onReplayIntro
}) => {
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const [heroVisualMode, setHeroVisualMode] = useState<'prism' | 'dither'>('dither');
  const [totalPhotosCount, setTotalPhotosCount] = useState<number>(HISTORICAL_PHOTOS.length);

  React.useEffect(() => {
    api.getDocuments({ object_type: 'photo', limit: 1 })
      .then(res => {
        if (res && res.total) setTotalPhotosCount(res.total);
      })
      .catch(() => {});
  }, []);

  // Landmark featured document: Constituent Assembly Speech 1949
  const featuredDocument = ARCHIVE_DOCUMENTS.find(d => d.id === 'constituent-assembly-speech-1949') || ARCHIVE_DOCUMENTS[0];
  const primaryCorpusDocs = ARCHIVE_DOCUMENTS.filter(d => d.id !== featuredDocument.id).slice(0, 3);

  // Archival Photographs of Babasaheb Dr. B. R. Ambedkar for Depth Carousel (Capped for smooth 60fps rendering)
  const items = React.useMemo(() => {
    const base = HISTORICAL_PHOTOS.slice(0, 10).map((photo) => ({
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
        image: '/images/ambedkar_pm_nehrus_cabinet.png',
        alt: 'First Cabinet of Independent India with Dr. Ambedkar, Nehru, and Patel',
        title: 'The Sovereign Republic Cabinet',
        subtitle: '1947 · New Delhi',
        year: 1947,
        id: 'photo-first-cabinet-1947',
      },
    ];

    return [...base, ...additional];
  }, []);

  // 9 Core Museum Exploration Wings (Aligned 1:1 with Side Navigation Rail, excluding Exhibition/Home)
  const navigationWings = [
    {
      id: 'archive',
      tab: 'archive',
      title: t.wingArchiveTitle || 'The Archive',
      subtitle: t.wingArchiveSub || 'BAWS Volumes 1–22 · Full Corpus',
      icon: BookOpen,
      badge: language === 'hi' ? 'ग्रंथ संग्रह' : language === 'mr' ? 'ग्रंथ संग्रह' : language === 'ta' ? 'முதன்மை காப்பகம்' : language === 'bn' ? 'মূল আর্কাইভ' : 'Primary Corpus',
    },
    {
      id: 'timeline',
      tab: 'timeline',
      title: t.wingTimelineTitle || 'Timeline Chronicle',
      subtitle: t.wingTimelineSub || '1891–1956 · Five Historical Epochs',
      icon: Clock,
      badge: language === 'hi' ? 'कालक्रम' : language === 'mr' ? 'कालक्रम' : language === 'ta' ? 'காலவரிசை' : language === 'bn' ? 'সময়রেখা' : 'Chronicle',
    },
    {
      id: 'media',
      tab: 'media',
      title: t.wingMediaTitle || 'Media & Voice',
      subtitle: t.wingMediaSub || 'BBC Broadcasts & Historic Audio',
      icon: Radio,
      badge: language === 'hi' ? 'ध्वनि व प्रसारण' : language === 'mr' ? 'ध्वनि व प्रसारण' : language === 'ta' ? 'ஒலி & ஒளி' : language === 'bn' ? 'অডিও ও ভাষণ' : 'Historic Audio',
    },
    {
      id: 'assistant',
      tab: 'assistant',
      title: t.wingAssistantTitle || 'AI Scholar',
      subtitle: t.wingAssistantSub || 'Grounded Archival Research & Citations',
      icon: Sparkles,
      badge: language === 'hi' ? 'एआई शोध' : language === 'mr' ? 'एआय संशोधन' : language === 'ta' ? 'AI அறிஞர்' : language === 'bn' ? 'এআই পণ্ডিত' : 'AI Intelligence',
    },
    {
      id: 'gallery',
      tab: 'gallery',
      title: t.wingGalleryTitle || 'Visual Folio',
      subtitle: t.wingGallerySub || 'Rare Photographic Prints & Plates',
      icon: Camera,
      badge: language === 'hi' ? 'चित्र दीर्घा' : language === 'mr' ? 'चित्र दालन' : language === 'ta' ? 'புகைப்படங்கள்' : language === 'bn' ? 'চিত্রশালা' : 'Photo Prints',
    },
    {
      id: 'graph',
      tab: 'graph',
      title: t.wingGraphTitle || '3D Knowledge Graph',
      subtitle: t.wingGraphSub || 'Interactive Semantic Lineage & Map',
      icon: Network,
      badge: language === 'hi' ? 'ज्ञान संजाल' : language === 'mr' ? 'ज्ञान आलेख' : language === 'ta' ? 'அறிவு வரைபடம்' : language === 'bn' ? 'জ্ঞান মানচিত্র' : 'Semantic Map',
    },
    {
      id: 'stories',
      tab: 'stories',
      title: t.wingStoriesTitle || 'Audio Stories',
      subtitle: t.wingStoriesSub || 'Guided Audiovisual Walkthroughs',
      icon: Star,
      badge: language === 'hi' ? 'कथा यात्रा' : language === 'mr' ? 'कथा यात्रा' : language === 'ta' ? 'வரலாற்றுக் கதைகள்' : language === 'bn' ? 'জীবনগাথা' : 'Guided Narrative',
    },
    {
      id: 'quest',
      tab: 'quest',
      title: t.wingQuestTitle || 'Interactive Quest',
      subtitle: t.wingQuestSub || 'Constitutional Challenges & Quiz',
      icon: Zap,
      badge: language === 'hi' ? 'प्रश्नोत्तरी' : language === 'mr' ? 'प्रश्नोत्तरी' : language === 'ta' ? 'வினாடி வினா' : language === 'bn' ? 'কুইজ' : 'Constitutional Quiz',
    },
    {
      id: 'collection',
      tab: 'collection',
      title: t.wingCollectionTitle || 'Personal Notebook',
      subtitle: t.wingCollectionSub || 'Saved Dossier & Scholarly Notes',
      icon: Bookmark,
      badge: language === 'hi' ? 'नोंदवही' : language === 'mr' ? 'नोंदवही' : language === 'ta' ? 'குறிப்பேடு' : language === 'bn' ? 'নোটবই' : 'Saved Dossier',
    },
  ];

  const quickInquiryTopics = language === 'hi' ? [
    'जाति का विनाश',
    'संविधान सभा',
    'पूना पैक्ट',
    'अनुच्छेद 32',
    'रुपये की समस्या'
  ] : language === 'mr' ? [
    'जातीचा उच्छेद',
    'घटना समिती वादविवाद',
    'पुणे करार',
    'कलम 32',
    'रुपयाचा प्रश्न'
  ] : language === 'ta' ? [
    'சாதி ஒழிப்பு',
    'அரசியலமைப்புச் சபை',
    'பூனா ஒப்பந்தம்',
    'உறுப்பு 32',
    'ரூபாயின் சிக்கல்'
  ] : language === 'bn' ? [
    'জাতপাত উচ্ছেদ',
    'গণপরিষদ বিতর্ক',
    'পুনা চুক্তি',
    'অনুচ্ছেদ ৩২',
    'টাকার সমস্যা'
  ] : [
    'Annihilation of Caste',
    'Constituent Assembly',
    'Poona Pact',
    'Article 32',
    'Problem of the Rupee'
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

      {/* =========================================================================
          HERO EXHIBITION: CINEMATIC MUSEUM ENTRANCE
          ========================================================================= */}
      <section className="relative overflow-hidden bg-transparent pt-14 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#D3D4C0]">

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">

          {/* Left: Curatorial Identity & Exhibition Entrance */}
          <div className="lg:col-span-7 space-y-6">

            {/* Museum Header Tags */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-[#0A2947] text-[#FAF7F0] text-[11px] font-cinzel font-bold uppercase tracking-widest rounded-md shadow-xs">
                {t.heroBadge || "Dr. B. R. Ambedkar Digital Heritage Archive"}
              </span>
              {/* Role-aware context pill */}
              {userMode === 'student' && (
                <span className="px-3 py-1 bg-[#d6eaf8] text-[#1a5276] text-[11px] font-montserrat font-bold uppercase tracking-widest rounded-md border border-[#7fb3d3] flex items-center gap-1.5 animate-pulse-once">
                  <GraduationCap className="w-3 h-3" /> Student Mode — Interactive Learning Active
                </span>
              )}
              {userMode === 'researcher' && (
                <span className="px-3 py-1 bg-[#d5f5e3] text-[#1a3a1a] text-[11px] font-montserrat font-bold uppercase tracking-widest rounded-md border border-[#82e0aa] flex items-center gap-1.5">
                  <Microscope className="w-3 h-3" /> Researcher Mode — Citations & Fixity Active
                </span>
              )}
              {userMode === 'archivist' && (
                <span className="px-3 py-1 bg-[#e8daef] text-[#4a235a] text-[11px] font-montserrat font-bold uppercase tracking-widest rounded-md border border-[#c39bd3] flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" /> Archivist Mode — Preservation Console Active
                </span>
              )}
            </div>

            {/* Display Exhibition Typography */}
            <div className="space-y-2">
              <p className="font-cinzel text-xs sm:text-sm tracking-[0.25em] text-[#8B5E3C] uppercase font-bold">
                {userMode === 'student' ? 'Learning Edition · 1891–1956 · Educational Archive'
                 : userMode === 'researcher' ? '1891–1956 · Scholarly Archive · Full Citations'
                 : userMode === 'archivist' ? '1891–1956 · Preservation Archive · PREMIS Events'
                 : (t.heroDates || '1891 — 1956 · Curatorial Exhibition')}
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-editorial font-bold text-[#0A2947] tracking-tight leading-[1.04]">
                {t.heroTitle1 || "Ideas That"}{' '}
                <span className="italic font-normal">{t.heroTitleItalic || "Rewrote"}</span>{' '}
                {t.heroTitle2 || "a Nation."}
              </h1>
            </div>

            {/* Role-adaptive subtitle */}
            <p className="text-sm sm:text-base text-[#0A2947]/80 leading-relaxed font-normal max-w-xl">
              {userMode === 'student'
                ? 'Start your learning journey with guided flashcards, the Constitutional Quest game, and annotated primary sources designed for students.'
                : userMode === 'researcher'
                ? 'Access full archival metadata, BibTeX/APA/MLA citations, PREMIS fixity checksums, and the knowledge graph — built for academic research.'
                : userMode === 'archivist'
                ? 'Manage the OCR review pipeline, monitor preservation events, export METS/Dublin Core metadata, and audit fixity across all archival objects.'
                : (t.heroSubtitle || 'Explore primary manuscripts, constituent assembly transcripts, photographic records, and source-grounded historical intelligence.')}
            </p>

            {/* Role-specific primary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {userMode === 'student' ? (
                <>
                  <button
                    onClick={() => { soundEffects.playClick(); onNavigateTab('quest'); }}
                    className="px-6 py-3.5 bg-[#1a5276] hover:bg-[#154360] text-white rounded-xl text-xs sm:text-sm font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer shadow-md active:scale-98"
                  >
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>Start Constitutional Quest</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { soundEffects.playClick(); onNavigateTab('archive'); }}
                    className="px-5 py-3.5 bg-white hover:bg-[#eaf4fb] text-[#1a5276] border border-[#7fb3d3] rounded-xl text-xs sm:text-sm font-montserrat font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-98"
                  >
                    <BookOpen className="w-4 h-4 text-[#1a5276]" />
                    <span>Explore Archive</span>
                  </button>
                </>
              ) : userMode === 'researcher' ? (
                <>
                  <button
                    onClick={() => { soundEffects.playClick(); onNavigateTab('assistant'); }}
                    className="px-6 py-3.5 bg-[#1a3a1a] hover:bg-[#145a32] text-white rounded-xl text-xs sm:text-sm font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer shadow-md active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-green-300" />
                    <span>Open AI Research Scholar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { soundEffects.playClick(); onNavigateTab('graph'); }}
                    className="px-5 py-3.5 bg-white hover:bg-[#eafaf1] text-[#1a3a1a] border border-[#82e0aa] rounded-xl text-xs sm:text-sm font-montserrat font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-98"
                  >
                    <Network className="w-4 h-4 text-[#1a3a1a]" />
                    <span>Knowledge Graph</span>
                  </button>
                </>
              ) : userMode === 'archivist' ? (
                <>
                  <button
                    onClick={() => { soundEffects.playClick(); onNavigateTab('admin'); }}
                    className="px-6 py-3.5 bg-[#4a235a] hover:bg-[#6c3483] text-white rounded-xl text-xs sm:text-sm font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer shadow-md active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-200" />
                    <span>Open Curatorial Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { soundEffects.playClick(); onNavigateTab('archive'); }}
                    className="px-5 py-3.5 bg-white hover:bg-[#f5eef8] text-[#4a235a] border border-[#c39bd3] rounded-xl text-xs sm:text-sm font-montserrat font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-98"
                  >
                    <BookOpen className="w-4 h-4 text-[#4a235a]" />
                    <span>Archival Objects</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      onNavigateTab('archive');
                    }}
                    className="px-6 py-3.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] rounded-xl text-xs sm:text-sm font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer shadow-md active:scale-98"
                  >
                    <BookOpen className="w-4 h-4 text-[#C89D56]" />
                    <span>{t.enterArchive || "Enter The Archive"}</span>
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
                    <span>{t.chronology || "Chronology"}</span>
                  </button>
                </>
              )}
            </div>

            {/* Curated Historical Inquiry Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold">
                {t.quickInquiries || "Quick Inquiries:"}
              </span>
              {quickInquiryTopics.map((topic) => (
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
                <span>{t.hologram || "Hologram"}</span>
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
                <span>{t.archivalDither || "Archival Dither"}</span>
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
                    className="max-h-[540px] w-auto object-contain select-none pointer-events-none transform-gpu"
                  />
                </div>
              )}
            </div>

            {/* Dignified Memorial Inscription Plinth */}
            <div className="mt-1 text-center px-4">
              <div className="font-cinzel font-bold text-base sm:text-lg text-[#0A2947] tracking-wider uppercase">
                {t.plinthName || "Dr. Bhimrao Ramji Ambedkar"}
              </div>
              <p className="text-xs font-mono text-[#8B5E3C] tracking-wide mt-0.5">
                {t.plinthSubtitle || "1891–1956 · Chief Architect of the Constitution · Bharat Ratna"}
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          SECTION 2: MUSEUM EXPLORATION WINGS (Side Navigation Rail Portals)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#D3D4C0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C89D56] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8B5E3C] font-semibold">
                {t.pavilionsCount || "9 Pavilions"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
              {t.wingsTitle || "Explore the Museum"}
            </h2>
            <p className="text-xs sm:text-sm text-[#0A2947]/75 mt-0.5 font-dmsans max-w-2xl">
              {t.wingsSubtitle || "Direct access to all dedicated research pavilions, interactive archives, audio narrations, and 3D visualizers."}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8B5E3C] bg-white/80 px-3.5 py-1.5 rounded-full border border-[#D3D4C0] shadow-2xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#C89D56] animate-pulse" />
            <span>{t.pavilionsCount || "9 Pavilions"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {navigationWings.map((wing, index) => {
            const Icon = wing.icon;
            const pavilionNum = String(index + 1).padStart(2, '0');
            return (
              <button
                key={wing.id}
                onClick={() => {
                  soundEffects.playClick();
                  onNavigateTab(wing.tab);
                }}
                className="group relative p-3 sm:p-3.5 rounded-xl bg-white/90 hover:bg-white border border-[#D3D4C0] hover:border-[#0A2947]/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(10,41,71,0.08),0_2px_6px_rgba(200,157,86,0.06)] cursor-pointer flex items-center gap-3 sm:gap-3.5 overflow-hidden backdrop-blur-xs shadow-2xs"
              >
                {/* Gilded Left Accent Line */}
                <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-gradient-to-b from-[#C89D56] to-[#8B5E3C] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l" />

                {/* Gilded Top Hairline */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C89D56]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Archival Folio Watermark Numeral */}
                <span className="absolute right-2 -bottom-2 text-5xl font-cinzel font-bold text-[#0A2947]/[0.03] select-none pointer-events-none group-hover:text-[#C89D56]/[0.08] transition-colors">
                  {pavilionNum}
                </span>

                {/* Icon Squircle */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] flex items-center justify-center text-[#0A2947] group-hover:bg-[#0A2947] group-hover:text-[#F3E4C9] group-hover:border-[#0A2947] group-hover:scale-105 group-hover:-rotate-2 transition-all duration-300 shadow-2xs shrink-0">
                  <Icon className="w-5 h-5 transition-transform duration-300" />
                </div>

                {/* Center Content Stack */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[10px] font-bold text-[#8B5E3C] tracking-wider uppercase bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#D3D4C0]/70 leading-none">
                      {pavilionNum}
                    </span>
                    {wing.badge && (
                      <span className="text-[10px] font-mono tracking-wider uppercase text-[#0A2947]/50 font-semibold truncate">
                        · {wing.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif-editorial text-[15px] sm:text-base font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors leading-snug truncate">
                    {wing.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#0A2947]/70 font-dmsans truncate mt-0.5">
                    {wing.subtitle}
                  </p>
                </div>

                {/* Directional Action Pill */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-transparent group-hover:border-[#D3D4C0] group-hover:bg-[#FAF7F0] flex items-center justify-center text-[#8B5E3C]/60 group-hover:text-[#0A2947] group-hover:translate-x-0.5 transition-all duration-300 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                {t.galleryTitle || "Gallery"}
              </h2>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onNavigateTab('gallery');
              }}
              className="px-5 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <span>{t.seeMore || "See More"} ({totalPhotosCount})</span>
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
          SECTION 5: INTERACTIVE LEARNING & DISCOVERY PAVILIONS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#D3D4C0] rounded-3xl p-6 sm:p-10 space-y-8 bg-[#FAF7F0] shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#D3D4C0]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947]/10 text-[#0A2947] font-serif-editorial text-xs rounded-full uppercase tracking-wider mb-2 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>Interactive Learning & Discovery Lab</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial font-bold text-[#0A2947]">
                {language === 'hi' ? 'संवादात्मक अध्ययन एवं अनुसंधान केंद्र' :
                 language === 'mr' ? 'संवादात्मक अभ्यास व संशोधन दालने' :
                 language === 'ta' ? 'ஊடாடும் கற்றல் மற்றும் ஆய்வுப் பிரிவுகள்' :
                 language === 'bn' ? 'ইন্টারেক্টিভ শিক্ষা ও গবেষণা কেন্দ্র' :
                 'Interactive Learning & Discovery Pavilions'}
              </h2>
              <p className="text-sm text-[#8B5E3C] font-dmsans mt-1 max-w-2xl">
                Dedicated primary-source learning environments custom-engineered for Students, Academic Researchers, and Memorial Visitors.
              </p>
            </div>

            <a
              href="/quest"
              onClick={(e) => {
                e.preventDefault();
                soundEffects.playClick();
                onNavigateTab('quest');
              }}
              className="px-5 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <span>Explore Interactive Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Interactive Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD 1: STUDENTS */}
            <div className="bg-white border-2 border-[#D3D4C0] hover:border-[#C89D56] rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-300 flex flex-col justify-between group hover:shadow-md">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A2947] text-[#C89D56] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold block mb-1">
                    For Schools & Colleges
                  </span>
                  <h3 className="text-xl font-serif-editorial font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors">
                    Students’ Academy
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-dmsans text-[#0A2947]/80 leading-relaxed">
                  Interactive Preamble tenets with Dr. Ambedkar’s Constituent Assembly defense, 3D spaced-repetition concept flashcards, and gamified Constitutional Quest with downloadable scholarship certificates.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-mono bg-[#FAF7F0] text-[#0A2947] px-2.5 py-1 rounded-md border border-[#E2D9C8]">
                    🏛️ Preamble Lab
                  </span>
                  <span className="text-[10px] font-mono bg-[#FAF7F0] text-[#0A2947] px-2.5 py-1 rounded-md border border-[#E2D9C8]">
                    🃏 3D Flashcards
                  </span>
                  <span className="text-[10px] font-mono bg-[#FAF7F0] text-[#0A2947] px-2.5 py-1 rounded-md border border-[#E2D9C8]">
                    📜 Scholar Certificate
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F4EBD9] mt-6">
                <a
                  href="/quest?wing=students"
                  onClick={(e) => {
                    e.preventDefault();
                    soundEffects.playClick();
                    window.location.href = '/quest?wing=students';
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] font-montserrat font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Enter Students’ Academy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* CARD 2: RESEARCHERS */}
            <div className="bg-white border-2 border-[#D3D4C0] hover:border-[#C89D56] rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-300 flex flex-col justify-between group hover:shadow-md">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A2947] text-[#C89D56] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                  <Microscope className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold block mb-1">
                    Scholarly Workbench
                  </span>
                  <h3 className="text-xl font-serif-editorial font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors">
                    Researchers’ Laboratory
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-dmsans text-[#0A2947]/80 leading-relaxed">
                  Generate source citations for all 22 BAWS volumes in APA 7, MLA 9, Chicago 17, Harvard, and BibTeX. Compare historical text drafts with synchronized diffs, and inspect SHA-256 fixity audits.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-mono bg-[#FAF7F0] text-[#0A2947] px-2.5 py-1 rounded-md border border-[#E2D9C8]">
                    📖 APA / MLA / BibTeX
                  </span>
                  <span className="text-[10px] font-mono bg-[#FAF7F0] text-[#0A2947] px-2.5 py-1 rounded-md border border-[#E2D9C8]">
                    ⚖️ Variorum Text Differ
                  </span>
                  <span className="text-[10px] font-mono bg-[#FAF7F0] text-[#0A2947] px-2.5 py-1 rounded-md border border-[#E2D9C8]">
                    🔐 PREMIS 3.0 Fixity
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F4EBD9] mt-6">
                <a
                  href="/quest?wing=researchers"
                  onClick={(e) => {
                    e.preventDefault();
                    soundEffects.playClick();
                    window.location.href = '/quest?wing=researchers';
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] font-montserrat font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Launch Research Workbench</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* CARD 3: INTERACTIVE GAMES ARCADE */}
            <div className="bg-white border-2 border-[#D3D4C0] hover:border-[#C89D56] rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-300 flex flex-col justify-between group hover:shadow-md">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A2947] text-[#C89D56] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold block mb-1">
                    5 Unique Games & Sims
                  </span>
                  <h3 className="text-xl font-serif-editorial font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors">
                    Interactive Arcade
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-dmsans text-[#0A2947]/80 leading-relaxed">
                  Role-play the Constituent Assembly debates, reconstruct the Preamble word jigsaw, spin the Chakra Wheel of Rights, and solve Rajgruha library mystery clues!
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-mono bg-[#FAF7F0] text-[#0A2947] px-2.5 py-1 rounded-md border border-[#E2D9C8]">
                    🏛️ Debate Sim
                  </span>
                  <span className="text-[10px] font-mono bg-[#FAF7F0] text-[#0A2947] px-2.5 py-1 rounded-md border border-[#E2D9C8]">
                    🎡 Wheel of Rights
                  </span>
                  <span className="text-[10px] font-mono bg-[#FAF7F0] text-[#0A2947] px-2.5 py-1 rounded-md border border-[#E2D9C8]">
                    🗝️ Rajgruha Detective
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F4EBD9] mt-6">
                <a
                  href="/quest?wing=games"
                  onClick={(e) => {
                    e.preventDefault();
                    soundEffects.playClick();
                    window.location.href = '/quest?wing=games';
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] font-montserrat font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Play Interactive Games</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: AUDIOVISUAL ARCHIVE (Voices & Historical Broadcasts)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <SoundboardWidget
          language={language}
          onOpenDocument={(docId) => {
            const doc = ARCHIVE_DOCUMENTS.find(d => d.id === docId);
            if (doc) onOpenDocument(doc);
          }}
        />

      </section>

    </div>
  );
};
