'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, BookOpen, Scale, Mic, MicOff, Scroll, FileText,
  ArrowRight, RotateCcw, Sparkles, LayoutGrid, List, Columns3,
  Bookmark, Check, Copy, CheckCircle2, ChevronDown, SlidersHorizontal,
  X, ExternalLink, Calendar, MapPin, Landmark, Compass, Eye, Maximize2,
  ShieldCheck, Volume2, VolumeX, Tag, Award, BookMarked, Shield
} from 'lucide-react';
import { Language, ArchivalDocument } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';
import { speechController, voiceRecognitionController } from '@/utils/speechUtils';
import VoicePill from '@/components/ui/VoicePill';

interface ExploreArchiveViewProps {
  language: Language;
  onOpenDocument: (doc: ArchivalDocument) => void;
  initialQuery?: string;
  initialCategory?: string;
  onAskAssistantWithQuery: (query: string) => void;
  onToggleSaveItem?: (item: { itemId: string; itemType: 'document' | 'qa'; title: string }) => void;
  isItemSaved?: (id: string) => boolean;
}

export const ExploreArchiveView: React.FC<ExploreArchiveViewProps> = ({
  language,
  onOpenDocument,
  initialQuery = '',
  initialCategory = 'all',
  onAskAssistantWithQuery,
  onToggleSaveItem,
  isItemSaved
}) => {
  const t = UI_STRINGS[language];
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string>(initialCategory);
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date-asc' | 'date-desc' | 'title' | 'ocr'>('relevance');
  const [viewMode, setViewMode] = useState<'folio' | 'grid' | 'ledger'>('folio');
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [inspectedDoc, setInspectedDoc] = useState<ArchivalDocument | null>(null);
  const [isSpeakingDocId, setIsSpeakingDocId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Voice search state
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      voiceRecognitionController.stopListening();
      speechController.stop();
    };
  }, []);

  const handleToggleVoiceSearch = () => {
    soundEffects.playClick();
    if (isListeningVoice) {
      voiceRecognitionController.stopListening();
      setIsListeningVoice(false);
      setVoiceNotice(null);
      return;
    }

    setVoiceNotice('Listening... Speak a search topic or title');
    const started = voiceRecognitionController.startListening({
      lang: language,
      onStart: () => setIsListeningVoice(true),
      onResult: (transcript) => {
        setSearchQuery(transcript);
        setVoiceNotice(`Searching for: "${transcript}"`);
      },
      onEnd: () => {
        setIsListeningVoice(false);
        setTimeout(() => setVoiceNotice(null), 2500);
      },
      onError: (err) => {
        setIsListeningVoice(false);
        setVoiceNotice(err);
        setTimeout(() => setVoiceNotice(null), 3000);
      }
    });

    if (!started) {
      setVoiceNotice('Voice recognition not supported on this browser.');
      setTimeout(() => setVoiceNotice(null), 3000);
    }
  };

  // Archival search suggestions
  const searchSuggestions = [
    "Article 32",
    "Annihilation of Caste",
    "Constituent Assembly",
    "Social Democracy",
    "Problem of the Rupee",
    "States and Minorities",
    "Mahad Satyagraha",
    "Buddha and His Dhamma",
    "Hindu Code Bill"
  ];

  const allTopics = [
    'Constitution', 'Social Equality', 'Caste Abolition', 'Fundamental Rights',
    'Economics', 'Democracy', 'Buddhism', 'Fraternity', 'Labour', 'Human Rights'
  ];

  const allSources = useMemo(() => {
    const set = new Set(ARCHIVE_DOCUMENTS.map(d => d.source.split('(')[0].trim()));
    return Array.from(set);
  }, []);

  // Filter & Search Logic
  const filteredDocuments = useMemo(() => {
    let result = ARCHIVE_DOCUMENTS.filter((doc) => {
      // Document Type Filter
      if (selectedType !== 'all') {
        if (selectedType === 'book' && doc.type !== 'book') return false;
        if (selectedType === 'debate' && doc.type !== 'debate') return false;
        if (selectedType === 'speech' && doc.type !== 'speech') return false;
        if (selectedType === 'manuscript' && doc.type !== 'manuscript') return false;
      }

      // Historical Era Filter
      if (selectedEra === 'early' && (doc.year < 1910 || doc.year > 1925)) return false;
      if (selectedEra === 'movements' && (doc.year < 1926 || doc.year > 1939)) return false;
      if (selectedEra === 'constitution' && (doc.year < 1940 || doc.year > 1949)) return false;
      if (selectedEra === 'later' && (doc.year < 1950 || doc.year > 1957)) return false;

      // Theme / Topic Filter
      if (selectedTopic !== 'all') {
        const matchesTopic = doc.keyTopics.some(t => t.toLowerCase().includes(selectedTopic.toLowerCase()));
        if (!matchesTopic) return false;
      }

      // Source Filter
      if (selectedSource !== 'all') {
        if (!doc.source.toLowerCase().includes(selectedSource.toLowerCase())) return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = doc.title.toLowerCase().includes(q) ||
          (doc.titleLocal?.hi?.toLowerCase().includes(q) ?? false) ||
          (doc.titleLocal?.mr?.toLowerCase().includes(q) ?? false);
        const descMatch = doc.shortDescription.toLowerCase().includes(q) ||
          doc.fullText.toLowerCase().includes(q);
        const topicMatch = doc.keyTopics.some(topic => topic.toLowerCase().includes(q));
        const sourceMatch = doc.source.toLowerCase().includes(q);
        const accessionMatch = doc.accessionNo.toLowerCase().includes(q);
        const yearMatch = doc.year.toString().includes(q);

        return titleMatch || descMatch || topicMatch || sourceMatch || accessionMatch || yearMatch;
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'date-asc') return a.year - b.year;
      if (sortBy === 'date-desc') return b.year - a.year;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'ocr') return b.ocrConfidence - a.ocrConfidence;
      return 0; // relevance
    });

    return result;
  }, [selectedType, selectedEra, selectedTopic, selectedSource, searchQuery, sortBy]);

  const activeFiltersCount = [
    selectedType !== 'all' && selectedType,
    selectedEra !== 'all' && selectedEra,
    selectedTopic !== 'all' && selectedTopic,
    selectedSource !== 'all' && selectedSource,
    searchQuery.trim() && 'search'
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    soundEffects.playClick();
    setSearchQuery('');
    setSelectedType('all');
    setSelectedEra('all');
    setSelectedTopic('all');
    setSelectedSource('all');
    setSortBy('relevance');
    setShowAdvancedFilters(false);
  };

  const handleCopyCitation = (doc: ArchivalDocument) => {
    soundEffects.playClick();
    const citation = `Ambedkar, B. R. (${doc.year}). ${doc.title}. ${doc.collection}. Accession: ${doc.accessionNo}. Dr. B. R. Ambedkar Digital Heritage Archive.`;
    navigator.clipboard.writeText(citation);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2000);
  };

  const handleSpeakExcerpt = (doc: ArchivalDocument) => {
    soundEffects.playClick();
    if (isSpeakingDocId === doc.id) {
      speechController.stop();
      setIsSpeakingDocId(null);
      return;
    }

    setIsSpeakingDocId(doc.id);
    speechController.speak(doc.shortDescription, language, () => {
      setIsSpeakingDocId(null);
    });
  };

  // Highlight search snippet
  const getSearchSnippet = (doc: ArchivalDocument, query: string) => {
    if (!query.trim()) return null;
    const cleanQ = query.trim().toLowerCase();
    const full = doc.fullText;
    const idx = full.toLowerCase().indexOf(cleanQ);
    if (idx !== -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(full.length, idx + cleanQ.length + 80);
      const pre = (start > 0 ? '...' : '') + full.slice(start, idx);
      const match = full.slice(idx, idx + cleanQ.length);
      const post = full.slice(idx + cleanQ.length, end) + (end < full.length ? '...' : '');
      return { pre, match, post };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-dmsans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* =========================================================================
            1. MUSEUM ARCHIVAL GRAND PAVILION & LIVE STATS
            ========================================================================= */}
        <div className="bg-[#0A2947] text-[#FAF7F0] border-2 border-[#C59A45]/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">

          {/* Antique Brass Corner Accents */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#C59A45]/60 pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#C59A45]/60 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#C59A45]/60 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#C59A45]/60 pointer-events-none" />

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C59A45]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3.5 max-w-3xl">

              <h1 className="text-3xl sm:text-5xl font-serif-editorial font-bold text-white tracking-tight leading-tight">
                Manuscripts & Primary Archival Corpus
              </h1>
            </div>

            {/* Live Repository Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-8 border-[#C59A45]/30 shrink-0">
              <div className="space-y-0.5 bg-white/5 p-3 rounded-2xl border border-white/10 text-center sm:text-left">
                <span className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#D4AF37] block">
                  22
                </span>
                <span className="text-[10px] font-montserrat font-bold text-[#F3E4C9] uppercase tracking-wider block">
                  BAWS Volumes
                </span>
              </div>

              <div className="space-y-0.5 bg-white/5 p-3 rounded-2xl border border-white/10 text-center sm:text-left">
                <span className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#D4AF37] block">
                  113,664+
                </span>
                <span className="text-[10px] font-montserrat font-bold text-[#F3E4C9] uppercase tracking-wider block">
                  Pages Indexed
                </span>
              </div>

              <div className="space-y-0.5 bg-white/5 p-3 rounded-2xl border border-white/10 text-center sm:text-left">
                <span className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#D4AF37] block">
                  {ARCHIVE_DOCUMENTS.length}
                </span>
                <span className="text-[10px] font-montserrat font-bold text-[#F3E4C9] uppercase tracking-wider block">
                  Curated Folios
                </span>
              </div>

              <div className="space-y-0.5 bg-white/5 p-3 rounded-2xl border border-white/10 text-center sm:text-left">
                <span className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#D4AF37] block">
                  {allSources.length}
                </span>
                <span className="text-[10px] font-montserrat font-bold text-[#F3E4C9] uppercase tracking-wider block">
                  Repositories
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            3. MUSEUM SEARCH & COMMAND CONSOLE WITH VOICE SEARCH BUTTON
            ========================================================================= */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 shadow-sm space-y-4">

          {/* Live Voice Status Indicator */}
          {voiceNotice && (
            <div className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center justify-between border transition-all ${isListeningVoice
              ? 'bg-amber-100/90 text-amber-900 border-amber-300 animate-pulse'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isListeningVoice ? 'bg-red-600 animate-ping' : 'bg-emerald-600'}`} />
                <span className="font-semibold">{voiceNotice}</span>
              </div>
              {isListeningVoice && (
                <button
                  type="button"
                  onClick={handleToggleVoiceSearch}
                  className="text-xs uppercase font-bold text-red-700 hover:underline cursor-pointer"
                >
                  Done Speaking
                </button>
              )}
            </div>
          )}

          {/* Main Large Search Input Field with Voice Button */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#8B5E3C]" />
            <input
              id="explore-archive-search-input"
              name="archive_search_query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isListeningVoice ? "Listening... Speak your query (e.g., 'Article 32' or 'Annihilation of Caste')..." : "Search the archive by title, speech, clause, accession, year, or transcript text..."}
              autoComplete="off"
              className={`w-full pl-12 pr-32 sm:pr-40 py-4 bg-[#FAF7F0] border-2 text-[#0A2947] placeholder-[#0A2947]/50 rounded-2xl text-sm sm:text-base focus:outline-none transition-all font-dmsans ${isListeningVoice ? 'border-amber-500 ring-2 ring-amber-400/40' : 'border-[#D3D4C0] focus:border-[#0A2947]'
                }`}
            />

            <div className="absolute right-2.5 flex items-center gap-1.5">
              {/* Voice Search Pill */}
              <VoicePill
                accentColor="#C59A45"
                iconColor="#8B5E3C"
                background="#0A2947"
                size={36}
                shape="pill"
                showTime
                waveform
                slideToCancel
                mode="toggle"
                reactive="mic"
                isListening={isListeningVoice}
                onStart={() => {
                  if (!isListeningVoice) handleToggleVoiceSearch();
                }}
                onStop={() => {
                  if (isListeningVoice) handleToggleVoiceSearch();
                }}
                ariaLabel={isListeningVoice ? "Stop voice listening" : "Click to speak search query"}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 bg-white border border-[#D3D4C0] text-xs font-montserrat font-bold text-[#0A2947] rounded-xl hover:bg-[#FAF7F0] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Archival Search Suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C] text-[10px] shrink-0">
              Curatorial Suggestions:
            </span>
            {searchSuggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => {
                  soundEffects.playClick();
                  setSearchQuery(sug);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-montserrat transition-all cursor-pointer ${searchQuery.toLowerCase() === sug.toLowerCase()
                  ? 'bg-[#0A2947] text-[#F3E4C9] font-bold shadow-xs'
                  : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                  }`}
              >
                {sug}
              </button>
            ))}
          </div>

        </div>

        {/* =========================================================================
            4. INTERACTIVE CURATORIAL FILTERING HUB
            ========================================================================= */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5E3C] via-[#C89D56] to-[#0A2947]" />

          {/* Top Bar: Title, Live Folio Counter & Refinements Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D3D4C0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] flex items-center justify-center text-[#8B5E3C] shadow-2xs">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#0A2947]">
                    Curatorial Facets & Lenses
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FAF7F0] border border-[#D3D4C0] text-[10px] font-mono font-bold text-[#8B5E3C]">
                    {filteredDocuments.length} Folios
                  </span>
                </div>
                <p className="text-[11px] text-[#0A2947]/60 font-mono">
                  Select an epoch or format to curate the historical corpus
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Granular Themes & Sources */}
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setShowAdvancedFilters(!showAdvancedFilters);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showAdvancedFilters || (selectedTopic !== 'all' || selectedSource !== 'all')
                    ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs'
                    : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>More Filters</span>
                {(selectedTopic !== 'all' || selectedSource !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-[#C89D56] animate-pulse" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#8B5E3C] hover:text-[#0A2947] bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] font-montserrat font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Curatorial Lenses (Fun One-Click Presets) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-montserrat">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C] shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C89D56]" />
              <span>Lenses:</span>
            </span>
            {[
              {
                id: 'lens-all',
                label: 'All Works',
                icon: '🌐',
                apply: () => {
                  setSelectedEra('all');
                  setSelectedType('all');
                }
              },
              {
                id: 'lens-constitution',
                label: 'Constituent Assembly',
                icon: '🏛️',
                apply: () => {
                  setSelectedEra('constitution');
                  setSelectedType('debate');
                }
              },
              {
                id: 'lens-treatises',
                label: 'Magnum Treatises',
                icon: '📖',
                apply: () => {
                  setSelectedEra('all');
                  setSelectedType('book');
                }
              },
              {
                id: 'lens-satyagraha',
                label: 'Civil Rights & Satyagraha',
                icon: '✊',
                apply: () => {
                  setSelectedEra('movements');
                  setSelectedType('all');
                }
              },
              {
                id: 'lens-columbia',
                label: 'Columbia & LSE Scholarly',
                icon: '🎓',
                apply: () => {
                  setSelectedEra('early');
                  setSelectedType('all');
                }
              },
            ].map((lens) => (
              <button
                key={lens.id}
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  lens.apply();
                }}
                className="px-2.5 py-1 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] text-[#0A2947] hover:text-[#8B5E3C] text-[11px] font-semibold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{lens.icon}</span>
                <span>{lens.label}</span>
              </button>
            ))}
          </div>

          {/* 1. Interactive Epoch Timeline (Lifepath Scrubber) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8B5E3C]" />
                <span>Historical Lifepath Epoch:</span>
              </span>
              <span className="text-[10px] font-mono text-[#0A2947]/60 hidden sm:inline">
                Click an epoch to travel in time
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {[
                { id: 'all', icon: '🌐', label: 'All Eras', years: '1916–1956', desc: 'Full Corpus' },
                { id: 'early', icon: '🎓', label: 'Scholarly Roots', years: '1916–1925', desc: 'Columbia & LSE' },
                { id: 'movements', icon: '✊', label: 'Satyagrahas', years: '1926–1939', desc: 'Social Awakening' },
                { id: 'constitution', icon: '🏛️', label: 'Constitution', years: '1940–1949', desc: 'Drafting Assembly' },
                { id: 'later', icon: '🪷', label: 'Dhamma & Code', years: '1950–1956', desc: 'Deekshabhoomi' },
              ].map((era) => {
                const isSelected = selectedEra === era.id;
                return (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedEra(era.id);
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0A2947] text-[#FAF7F0] border-[#0A2947] shadow-md ring-2 ring-[#C89D56]/30'
                        : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0] hover:border-[#8B5E3C]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base sm:text-lg">{era.icon}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isSelected ? 'bg-white/20 text-[#F3E4C9]' : 'bg-white/80 text-[#8B5E3C] border border-[#D3D4C0]'
                      }`}>
                        {era.years}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-montserrat font-bold truncate">{era.label}</div>
                      <div className={`text-[10px] font-mono truncate ${
                        isSelected ? 'text-[#F3E4C9]/70' : 'text-[#0A2947]/50'
                      }`}>
                        {era.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Document Classification Badges */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>Document Classification:</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', icon: '📜', label: 'All Records', count: ARCHIVE_DOCUMENTS.length },
                { id: 'book', icon: '📚', label: 'Treatises & Books', count: ARCHIVE_DOCUMENTS.filter(d => d.type === 'book').length },
                { id: 'debate', icon: '🏛️', label: 'Assembly Debates', count: ARCHIVE_DOCUMENTS.filter(d => d.type === 'debate').length },
                { id: 'speech', icon: '🎙️', label: 'Addresses & Speeches', count: ARCHIVE_DOCUMENTS.filter(d => d.type === 'speech').length },
                { id: 'manuscript', icon: '✍️', label: 'Memoranda & Notes', count: ARCHIVE_DOCUMENTS.filter(d => d.type === 'manuscript').length },
              ].map((btn) => {
                const isSelected = selectedType === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedType(btn.id);
                    }}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-montserrat font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs ring-1 ring-[#C89D56]/40'
                        : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                    }`}
                  >
                    <span>{btn.icon}</span>
                    <span>{btn.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-[#FAF7F0]' : 'bg-[#D3D4C0]/40 text-[#0A2947]/70'
                    }`}>
                      {btn.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Collapsible / Expandable More Filters (Thematic Subjects & Repositories) */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-[#D3D4C0] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C]">
                  Granular Thematic & Repository Filters:
                </span>
                <span className="text-[10px] font-mono text-[#0A2947]/50">
                  Click any pill to narrow or expand results
                </span>
              </div>

              {/* Subject Theme Filter Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-montserrat font-bold text-[#0A2947]/70 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  <span>Thematic Subject:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedTopic('all');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      selectedTopic === 'all'
                        ? 'bg-[#0A2947] text-[#FAF7F0] font-bold'
                        : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                    }`}
                  >
                    All Themes
                  </button>
                  {allTopics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedTopic(selectedTopic === topic ? 'all' : topic);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        selectedTopic === topic
                          ? 'bg-[#0A2947] text-[#FAF7F0] font-bold ring-1 ring-[#C89D56]'
                          : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Repository Filter Chips */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-montserrat font-bold text-[#0A2947]/70 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  <span>Source Archive / Repository:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Collections' },
                    { id: 'BAWS', label: 'BAWS (Writings & Speeches)' },
                    { id: 'Parliament', label: 'Constituent Assembly' },
                    { id: 'Lahore', label: 'Jat-Pat-Todak Mandal' },
                    { id: 'National Archives', label: 'National Archives' },
                  ].map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedSource(selectedSource === src.id ? 'all' : src.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        selectedSource === src.id
                          ? 'bg-[#0A2947] text-[#FAF7F0] font-bold ring-1 ring-[#C89D56]'
                          : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Removable Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#D3D4C0]/60">
              <span className="text-[10px] font-mono text-[#0A2947]/60 uppercase">Applied Filters:</span>

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0A2947] text-[#F3E4C9] text-xs font-mono">
                  <span>Query: &quot;{searchQuery}&quot;</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-300 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedType !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-xs font-mono text-[#0A2947]">
                  <span>Type: {selectedType}</span>
                  <button onClick={() => setSelectedType('all')} className="hover:text-red-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedEra !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-xs font-mono text-[#0A2947]">
                  <span>Era: {selectedEra}</span>
                  <button onClick={() => setSelectedEra('all')} className="hover:text-red-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedTopic !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-xs font-mono text-[#0A2947]">
                  <span>Topic: {selectedTopic}</span>
                  <button onClick={() => setSelectedTopic('all')} className="hover:text-red-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedSource !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-xs font-mono text-[#0A2947]">
                  <span>Source: {selectedSource}</span>
                  <button onClick={() => setSelectedSource('all')} className="hover:text-red-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={resetAllFilters}
                className="text-[11px] text-[#8B5E3C] hover:text-[#0A2947] underline underline-offset-2 ml-2 cursor-pointer font-mono font-bold"
              >
                Clear all filters
              </button>
            </div>
          )}

        </div>

        {/* =========================================================================
            5. RESULTS CONTROL BAR: COUNTS, SORT & VIEW SWITCHER
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">

          <div className="text-xs text-[#0A2947]/70 font-mono">
            Displaying <strong className="text-[#0A2947] font-bold">{filteredDocuments.length}</strong> verified archival folios
          </div>

          <div className="flex items-center gap-4">

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="explore-sort-select" className="text-[#0A2947]/60 font-montserrat font-bold uppercase text-[10px]">Sort:</label>
              <select
                id="explore-sort-select"
                name="explore_sort_order"
                aria-label="Sort archival records"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#D3D4C0] rounded-xl px-3 py-1.5 text-xs text-[#0A2947] font-medium focus:outline-none cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="date-asc">Chronological (Oldest First)</option>
                <option value="date-desc">Chronological (Newest First)</option>
                <option value="title">Title (A to Z)</option>
                <option value="ocr">OCR Confidence</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-white border border-[#D3D4C0] rounded-xl p-1">
              <button
                onClick={() => setViewMode('folio')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-montserrat font-bold ${viewMode === 'folio' ? 'bg-[#0A2947] text-[#F3E4C9]' : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                  }`}
                title="Curatorial Folio View"
              >
                <Columns3 className="w-4 h-4" />
                <span className="hidden md:inline">Folios</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-montserrat font-bold ${viewMode === 'grid' ? 'bg-[#0A2947] text-[#F3E4C9]' : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                  }`}
                title="Exhibition Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode('ledger')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-montserrat font-bold ${viewMode === 'ledger' ? 'bg-[#0A2947] text-[#F3E4C9]' : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                  }`}
                title="Scholarly Registry Ledger"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline">Ledger</span>
              </button>
            </div>

          </div>

        </div>

        {/* =========================================================================
            6. CURATORIAL SPECIMEN QUICK INSPECTOR CHAMBER (INLINE DRAWER)
            ========================================================================= */}
        {inspectedDoc && (
          <div className="bg-[#FAF7F0] border-2 border-[#C59A45] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl relative overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#D3D4C0] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
                <span className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
                  SPECIMEN QUICK INSPECTION CHAMBER
                </span>
                <span className="text-xs font-mono text-[#0A2947]/60">· {inspectedDoc.accessionNo}</span>
              </div>
              <button
                onClick={() => setInspectedDoc(null)}
                className="p-1 rounded-lg text-[#0A2947] hover:bg-white cursor-pointer"
                title="Close Inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-0.5 bg-[#0A2947] text-[#F3E4C9] rounded-lg font-bold">{inspectedDoc.year}</span>
                  <span className="text-[#8B5E3C] font-bold uppercase">{inspectedDoc.categoryLabel}</span>
                  <span className="text-[#0A2947]/60">· {inspectedDoc.source}</span>
                </div>
                <h3 className="text-2xl font-serif-editorial font-bold text-[#0A2947]">
                  {inspectedDoc.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#0A2947]/80 font-dmsans leading-relaxed">
                  {inspectedDoc.shortDescription}
                </p>
                <div className="p-4 bg-white border-l-4 border-[#C59A45] rounded-r-2xl text-xs sm:text-sm font-serif italic text-[#0A2947] shadow-xs">
                  "{inspectedDoc.fullText.slice(0, 320)}..."
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3 bg-white p-5 rounded-2xl border border-[#D3D4C0]">
                <div className="text-xs font-mono text-[#0A2947]/70 space-y-1.5 pb-2 border-b border-[#D3D4C0]">
                  <div><strong>Format:</strong> High-Resolution Folio Specimen</div>
                  <div><strong>Collection:</strong> {inspectedDoc.collection}</div>
                  <div><strong>OCR Accuracy:</strong> <span className="text-emerald-700 font-bold">{inspectedDoc.ocrConfidence}%</span></div>
                  <div><strong>Language:</strong> Multi-Script (EN/MR/HI)</div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      onOpenDocument(inspectedDoc);
                    }}
                    className="w-full py-3 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Full Folio in Viewer</span>
                  </button>

                  <button
                    onClick={() => handleSpeakExcerpt(inspectedDoc)}
                    className="w-full py-2.5 bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-[#8B5E3C]" />
                    <span>{isSpeakingDocId === inspectedDoc.id ? 'Stop Speech' : 'Listen to Folio Summary'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            7. ARCHIVAL RESULTS PRESENTATION
            ========================================================================= */}
        {filteredDocuments.length === 0 ? (
          <div className="py-20 text-center bg-white border-2 border-[#D3D4C0] rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-4">
            <BookOpen className="w-12 h-12 text-[#8B5E3C] mx-auto" />
            <h3 className="font-serif-editorial text-2xl text-[#0A2947] font-bold">
              No Archival Folios Match Your Criteria
            </h3>
            <p className="text-xs sm:text-sm text-[#0A2947]/75">
              No verified documents match the active filter combination. Try resetting your query or exploring our featured vaults.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-6 py-3 bg-[#0A2947] text-[#F3E4C9] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#8B5E3C] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'folio' ? (

          /* VIEW MODE 1: CURATORIAL ARCHIVAL FOLIOS (Prestigious Folio Specimen Cards) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => {
              const displayTitle = language !== 'en' && doc.titleLocal?.[language] ? doc.titleLocal[language] : doc.title;
              const displayDesc = language !== 'en' && doc.shortDescriptionLocal?.[language] ? doc.shortDescriptionLocal[language] : doc.shortDescription;
              const snippet = getSearchSnippet(doc, searchQuery);
              const isSaved = isItemSaved ? isItemSaved(doc.id) : false;

              return (
                <div
                  key={doc.id}
                  className="bg-white border-2 border-[#D3D4C0] hover:border-[#C59A45] rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all shadow-xs hover:shadow-xl group relative overflow-hidden"
                >
                  {/* Antique Gold Top Edge Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C59A45] via-[#8B5E3C] to-[#0A2947]" />

                  <div className="space-y-4">

                    {/* Archival Metadata Header */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#8B5E3C] uppercase px-2 py-0.5 bg-[#FAF7F0] rounded-md border border-[#D3D4C0]">
                          {doc.categoryLabel}
                        </span>
                        <span className="text-[#0A2947] font-bold">·</span>
                        <span className="px-2 py-0.5 bg-[#0A2947] text-[#F3E4C9] rounded-md font-bold">
                          {doc.year}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>OCR {doc.ocrConfidence}%</span>
                        </span>
                      </div>
                    </div>

                    {/* Document Title */}
                    <h3
                      onClick={() => onOpenDocument(doc)}
                      className="font-serif-editorial text-xl sm:text-2xl text-[#0A2947] font-bold group-hover:text-[#8B5E3C] transition-colors leading-snug cursor-pointer"
                    >
                      {displayTitle}
                    </h3>

                    {/* Document Description */}
                    <p className="text-xs sm:text-sm text-[#0A2947]/75 font-normal leading-relaxed line-clamp-3">
                      {displayDesc}
                    </p>

                    {/* Primary Source Text Match Snippet Highlight */}
                    {snippet && (
                      <div className="p-3.5 rounded-2xl bg-[#F3E4C9]/70 border border-[#D3D4C0] text-xs text-[#0A2947]">
                        <span className="text-[10px] font-cinzel uppercase text-[#8B5E3C] block mb-1 font-bold">
                          Primary Source Match:
                        </span>
                        <span className="italic text-[#0A2947]/85">
                          {snippet.pre}
                          <mark className="bg-[#C59A45] text-[#0A2947] px-1 py-0.5 rounded font-bold not-italic">
                            {snippet.match}
                          </mark>
                          {snippet.post}
                        </span>
                      </div>
                    )}

                    {/* Provenance & Citation Metadata Box */}
                    <div className="pt-3 border-t border-[#D3D4C0]/70 text-xs font-mono text-[#0A2947]/70 space-y-1">
                      <div className="truncate">
                        <strong className="text-[#0A2947]">Collection:</strong> {doc.collection}
                      </div>
                      <div className="truncate">
                        <strong className="text-[#0A2947]">Accession No:</strong> <span className="text-[#8B5E3C] font-semibold">{doc.accessionNo}</span>
                      </div>
                      <div className="truncate text-[11px] text-[#0A2947]/60">
                        <strong>Source:</strong> {doc.source}
                      </div>
                    </div>

                    {/* Key Thematic Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doc.keyTopics.slice(0, 4).map((topic) => (
                        <span
                          key={topic}
                          onClick={() => {
                            soundEffects.playClick();
                            setSelectedTopic(topic);
                          }}
                          className="px-2.5 py-0.5 rounded-md bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] text-[10px] font-mono text-[#0A2947] cursor-pointer transition-colors"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Actions Bar */}
                  <div className="pt-5 mt-5 border-t border-[#D3D4C0] flex flex-wrap items-center justify-between gap-2">

                    <div className="flex items-center gap-1.5">
                      {/* Ask AI Scholar Button */}
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          onAskAssistantWithQuery(`Analyze the treatise "${doc.title}" and explain its historical significance.`);
                        }}
                        className="px-3 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] text-xs font-montserrat font-bold text-[#0A2947] border border-[#D3D4C0] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Consult AI Scholar on this document"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
                        <span className="hidden sm:inline">Ask AI Scholar</span>
                      </button>

                      {/* Add to Notebook Button */}
                      {onToggleSaveItem && (
                        <button
                          onClick={() => onToggleSaveItem({ itemId: doc.id, itemType: 'document', title: doc.title })}
                          className={`p-2 rounded-xl text-xs font-montserrat font-bold border transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs ${isSaved
                            ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                            : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0]'
                            }`}
                          title={isSaved ? "Saved in Research Notebook" : "Save to Notebook"}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isSaved ? "Saved" : "Notebook"}</span>
                        </button>
                      )}

                      {/* Copy Citation Button */}
                      <button
                        onClick={() => handleCopyCitation(doc)}
                        className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] text-xs text-[#0A2947] border border-[#D3D4C0] transition-colors cursor-pointer shadow-xs"
                        title="Copy Scholarly Citation"
                      >
                        {copiedDocId === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Quick Inspect Button */}
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          setInspectedDoc(doc);
                        }}
                        className="px-3.5 py-2 bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] text-xs font-montserrat font-bold uppercase tracking-wider rounded-xl transition-colors border border-[#D3D4C0] flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Inspect Specimen"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#8B5E3C]" />
                        <span className="hidden sm:inline">Inspect</span>
                      </button>

                      {/* Open Full Document in Viewer */}
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          onOpenDocument(doc);
                        }}
                        className="px-4 py-2 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] text-xs font-montserrat font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>Examine Folio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        ) : viewMode === 'grid' ? (

          /* VIEW MODE 2: EXHIBITION GALLERY GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => {
              const displayTitle = language !== 'en' && doc.titleLocal?.[language] ? doc.titleLocal[language] : doc.title;
              return (
                <div
                  key={doc.id}
                  className="bg-white border-2 border-[#D3D4C0] hover:border-[#C59A45] rounded-3xl p-5 flex flex-col justify-between transition-all shadow-xs hover:shadow-xl group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#8B5E3C] uppercase px-2 py-0.5 bg-[#FAF7F0] rounded border border-[#D3D4C0]">
                        {doc.categoryLabel}
                      </span>
                      <span className="px-2 py-0.5 bg-[#0A2947] text-[#F3E4C9] rounded font-bold">
                        {doc.year}
                      </span>
                    </div>

                    <h4
                      onClick={() => onOpenDocument(doc)}
                      className="font-serif-editorial font-bold text-lg text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {displayTitle}
                    </h4>

                    <p className="text-xs text-[#0A2947]/75 line-clamp-3 leading-relaxed">
                      {doc.shortDescription}
                    </p>

                    <div className="pt-2 text-[11px] font-mono text-[#0A2947]/60 truncate">
                      {doc.collection}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#D3D4C0] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8B5E3C] font-semibold">{doc.accessionNo}</span>
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onOpenDocument(doc);
                      }}
                      className="px-3.5 py-1.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase transition-colors cursor-pointer shadow-xs"
                    >
                      Read Folio &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* VIEW MODE 3: SCHOLARLY REGISTRY LEDGER TABLE */
          <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#0A2947]">
                <thead className="bg-[#0A2947] text-[#F3E4C9] font-cinzel font-bold uppercase tracking-wider text-[11px] border-b-2 border-[#C59A45]">
                  <tr>
                    <th className="p-4">Year</th>
                    <th className="p-4">Title & Collection</th>
                    <th className="p-4">Classification</th>
                    <th className="p-4">Accession No.</th>
                    <th className="p-4">OCR Accuracy</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D3D4C0]">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#FAF7F0] transition-colors">
                      <td className="p-4 font-mono font-bold text-[#8B5E3C] whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-[#FAF7F0] border border-[#D3D4C0]">
                          {doc.year}
                        </span>
                      </td>
                      <td className="p-4 font-medium max-w-sm">
                        <button
                          onClick={() => onOpenDocument(doc)}
                          className="font-serif-editorial text-sm font-bold text-[#0A2947] hover:text-[#8B5E3C] text-left cursor-pointer line-clamp-1"
                        >
                          {doc.title}
                        </button>
                        <div className="text-[11px] text-[#0A2947]/60 truncate mt-0.5 font-mono">
                          {doc.collection} · {doc.source}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-[#D3D4C0] font-mono text-[10px] font-semibold text-[#0A2947]">
                          {doc.categoryLabel}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[#8B5E3C] font-semibold whitespace-nowrap">
                        {doc.accessionNo}
                      </td>
                      <td className="p-4 font-mono text-emerald-700 font-bold whitespace-nowrap">
                        {doc.ocrConfidence}%
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            setInspectedDoc(doc);
                          }}
                          className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] font-montserrat font-bold text-[11px] uppercase rounded-xl transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            onOpenDocument(doc);
                          }}
                          className="px-3 py-1.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] font-montserrat font-bold text-[11px] uppercase rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                          Open Folio &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        )}

      </div>
    </div>
  );
};
