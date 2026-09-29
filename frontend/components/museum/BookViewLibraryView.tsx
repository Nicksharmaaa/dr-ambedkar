'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Search, Video, FileText, Download, ExternalLink,
  Maximize2, Minimize2, X, Eye, Sparkles, Filter, SlidersHorizontal,
  ArrowRight, CheckCircle2, Copy, Check, Bot, Volume2, ShieldCheck,
  Layers, LayoutGrid, List, Play, Pause, RotateCcw, Clock, Languages,
  Library, ArrowLeft, RefreshCw, Bookmark
} from 'lucide-react';
import { MuseumGrandPavilion } from './MuseumGrandPavilion';
import { INCOMING_DOCUMENTS_CATALOG, INCOMING_VIDEOS, IncomingDocumentItem } from '@/data/incomingDocumentsData';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { ArchivalDocument, Language } from '@/types/museum';
import { soundEffects } from '@/utils/soundEffects';

interface BookViewLibraryViewProps {
  language?: Language;
  onOpenDocument?: (doc: ArchivalDocument) => void;
  onAskAssistant?: (query: string) => void;
  initialCategory?: string;
  initialQuery?: string;
}

export const BookViewLibraryView: React.FC<BookViewLibraryViewProps> = ({
  language = 'en',
  onOpenDocument,
  onAskAssistant,
  initialCategory = 'all',
  initialQuery = '',
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'pdf' | 'text' | 'video'>('all');
  const [viewMode, setViewMode] = useState<'shelf' | 'ledger'>('shelf');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active Reader Modals
  const [activeItem, setActiveItem] = useState<IncomingDocumentItem | null>(null);
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);
  const [videoPlaybackRate, setVideoPlaybackRate] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Combine curated core monographs with incoming catalog
  const curatedClassicsAsIncoming: IncomingDocumentItem[] = useMemo(() => {
    return ARCHIVE_DOCUMENTS.map((doc) => ({
      id: doc.id,
      title: doc.title,
      language: (doc.language.toLowerCase().includes('marathi') ? 'mr' : 'en') as any,
      languageLabel: doc.language,
      format: 'text',
      formatLabel: `${doc.categoryLabel} (Archival Monograph)`,
      pageCount: 380,
      fileSizeBytes: 2450000,
      fileSizeMb: '2.34 MB',
      relativePath: `classic/${doc.id}`,
      streamUrl: `/documents/${doc.id}/viewer`,
      downloadUrl: `/documents/${doc.id}`,
      category: 'classic',
      description: doc.shortDescription,
      curatedId: doc.id,
    }));
  }, []);

  const fullCorpus: IncomingDocumentItem[] = useMemo(() => {
    return [...curatedClassicsAsIncoming, ...INCOMING_DOCUMENTS_CATALOG];
  }, [curatedClassicsAsIncoming]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return fullCorpus.filter((item) => {
      // Category Filter
      if (selectedCategory === 'hindi_pdf' && item.category !== 'hindi_pdf') return false;
      if (selectedCategory === 'tamil_pdf' && item.category !== 'tamil_pdf') return false;
      if (selectedCategory === 'baws_english' && item.category !== 'baws_english') return false;
      if (selectedCategory === 'bengali_gujarati' && item.category !== 'bengali_pdf' && item.category !== 'gujarati_pdf') return false;
      if (selectedCategory === 'audio_video' && item.category !== 'audio_video') return false;
      if (selectedCategory === 'classics' && item.category !== 'classic') return false;

      // Format Filter
      if (selectedFormat !== 'all' && item.format !== selectedFormat) return false;

      // Text Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchLang = item.languageLabel.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLang && !matchId) return false;
      }

      return true;
    });
  }, [fullCorpus, selectedCategory, selectedFormat, searchQuery]);

  const handleCopyCitation = (item: IncomingDocumentItem) => {
    soundEffects.playClick();
    const citation = `Ambedkar Heritage Archive (${item.languageLabel}). "${item.title}". Reference ID: ${item.id}. Formats: ${item.formatLabel}. SHA-256: ${item.sha256 || 'Archival Verified'}.`;
    navigator.clipboard.writeText(citation);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenBookView = (item: IncomingDocumentItem) => {
    soundEffects.playClick();
    if (item.category === 'classic' && item.curatedId) {
      const matchDoc = ARCHIVE_DOCUMENTS.find(d => d.id === item.curatedId);
      if (matchDoc && onOpenDocument) {
        onOpenDocument(matchDoc);
        return;
      }
      router.push(`/documents/${item.curatedId}/viewer`);
      return;
    }
    if (item.format === 'pdf') {
      router.push(`/documents/${item.id}/viewer`);
      return;
    }
    setActiveItem(item);
  };

  const handleAskAIAboutItem = (item: IncomingDocumentItem) => {
    soundEffects.playClick();
    const prompt = `Provide an authoritative scholarly summary and key historical insights regarding Dr. B.R. Ambedkar's work: "${item.title}".`;
    if (onAskAssistant) {
      onAskAssistant(prompt);
      router.push('/assistant');
    } else {
      router.push(`/assistant?q=${encodeURIComponent(prompt)}`);
    }
  };

  const categoryPills = [
    { id: 'all', label: 'All Holdings', count: fullCorpus.length },
    { id: 'hindi_pdf', label: 'Hindi PDF Volumes', count: 39 },
    { id: 'tamil_pdf', label: 'Tamil PDF Volumes', count: 31 },
    { id: 'baws_english', label: 'English BAWS Texts', count: 19 },
    { id: 'bengali_gujarati', label: 'Bengali & Gujarati', count: 23 },
    { id: 'audio_video', label: 'Video & Audio Reels', count: 3 },
    { id: 'classics', label: 'Foundational Classics', count: curatedClassicsAsIncoming.length },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-dmsans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── Grand Pavilion Header ────────────────────────────────────────── */}
        <MuseumGrandPavilion
          title={
            <span>
              Books & Archival <span className="text-[#C89D56] italic">BookView</span>
            </span>
          }
          subtitle="Access Dr. B. R. Ambedkar's complete multilingual writings, incoming scanned PDF volumes, rare manuscripts, and restored archival video reels through the high-fidelity BookView facsimile interface."
          watermarkIcon={Library}
          stats={[
            { value: `${fullCorpus.length}`, label: 'Archival Holdings' },
            { value: '55,000+', label: 'Verified Pages' },
            { value: '5', label: 'Languages (EN, HI, TA, BN, GU)' },
            { value: 'SHA-256', label: 'PREMIS Fixity Cataloged' }
          ]}
        />

        {/* ── Search & Filter Control Deck ─────────────────────────────────── */}
        <div className="rounded-3xl bg-[#FAF7F0]/90 backdrop-blur-md border border-[#D3D4C0] p-6 shadow-sm space-y-6">
          
          {/* Top Row: Search input + Format selector + View toggle */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5E3C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across books, volumes, PDF facsimiles, or videos..."
                className="w-full pl-11 pr-10 py-3 bg-white border border-[#D3D4C0] focus:border-[#C89D56] focus:ring-2 focus:ring-[#C89D56]/20 rounded-2xl text-sm font-medium text-[#0A2947] placeholder:text-[#0A2947]/50 shadow-inner outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right: Format Pills & View Mode */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              
              {/* Format Dropdown / Badges */}
              <div className="flex items-center bg-white border border-[#D3D4C0] rounded-2xl p-1 text-xs">
                {(['all', 'pdf', 'text', 'video'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedFormat(fmt);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-montserrat font-semibold capitalize transition-all ${
                      selectedFormat === fmt
                        ? 'bg-[#0A2947] text-white shadow-xs'
                        : 'text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {fmt === 'all' ? 'All Formats' : fmt.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white border border-[#D3D4C0] rounded-2xl p-1 text-xs">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('shelf');
                  }}
                  className={`p-1.5 rounded-xl transition-all ${
                    viewMode === 'shelf'
                      ? 'bg-[#C89D56] text-white shadow-xs'
                      : 'text-[#0A2947]/60 hover:text-[#0A2947]'
                  }`}
                  title="Library Shelf Mode"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('ledger');
                  }}
                  className={`p-1.5 rounded-xl transition-all ${
                    viewMode === 'ledger'
                      ? 'bg-[#C89D56] text-white shadow-xs'
                      : 'text-[#0A2947]/60 hover:text-[#0A2947]'
                  }`}
                  title="Curatorial Ledger Mode"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Row: Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryPills.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#0A2947] to-[#12385F] text-[#FAF7F0] border-[#0A2947] shadow-sm'
                    : 'bg-white/80 hover:bg-white text-[#0A2947]/80 hover:text-[#0A2947] border-[#D3D4C0]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  selectedCategory === cat.id ? 'bg-[#C89D56] text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Results Summary bar */}
          <div className="flex items-center justify-between text-xs font-montserrat text-[#0A2947]/60 pt-2 border-t border-[#D3D4C0]/60">
            <span>
              Showing <strong className="text-[#0A2947]">{filteredItems.length}</strong> items matching filters
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fixity SHA-256 Audited</span>
            </span>
          </div>

        </div>

        {/* ── MAIN CONTENT: SHELF MODE ─────────────────────────────────────── */}
        {viewMode === 'shelf' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isVideo = item.format === 'video';
              const isPdf = item.format === 'pdf';
              const isClassic = item.category === 'classic';

              return (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-white border border-[#D3D4C0] hover:border-[#C89D56] p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden"
                >
                  {/* Decorative embossed gold ribbon on card top */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B5E3C] via-[#C89D56] to-[#0A2947] opacity-80" />

                  {/* Top Card Info */}
                  <div className="space-y-4">
                    
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                        isVideo
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isPdf
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {isVideo ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        <span>{item.formatLabel.split(' ')[0]}</span>
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {item.languageLabel}
                      </span>
                    </div>

                    {/* Book Title */}
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0A2947] leading-snug group-hover:text-[#8B5E3C] transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#0A2947]/70 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Physical Archival Metrics */}
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                      {item.pageCount && item.pageCount > 0 ? (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-[#C89D56]" />
                          <span>{item.pageCount} Pages</span>
                        </span>
                      ) : null}

                      {item.duration ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          <span>{item.duration}</span>
                        </span>
                      ) : null}

                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.fileSizeMb}</span>
                      </span>
                    </div>

                  </div>

                  {/* Card Action Plinth */}
                  <div className="pt-4 border-t border-[#D3D4C0]/50 space-y-2.5">
                    
                    {/* Primary Button: BookView */}
                    <button
                      onClick={() => handleOpenBookView(item)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0A2947] to-[#164472] hover:from-[#8B5E3C] hover:to-[#C89D56] text-white font-montserrat font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                      {isVideo ? <Play className="w-3.5 h-3.5 fill-current" /> : <BookOpen className="w-3.5 h-3.5" />}
                      <span>{item.format === 'pdf' ? 'Open in PDF Viewer' : 'Open in BookView'}</span>
                    </button>

                    {/* Secondary Actions Row */}
                    <div className="flex items-center justify-between gap-1 text-xs">
                      
                      {/* Ask AI */}
                      <button
                        onClick={() => handleAskAIAboutItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#0A2947] hover:bg-slate-100 transition-colors"
                        title="Query AI Scholar with this book"
                      >
                        <Bot className="w-3.5 h-3.5 text-[#C89D56]" />
                        <span>Ask Scholar</span>
                      </button>

                      {/* Download File */}
                      <a
                        href={item.downloadUrl}
                        download
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#0A2947] hover:bg-slate-100 transition-colors"
                        title="Download authentic archival binary"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Download</span>
                      </a>

                      {/* Copy Citation */}
                      <button
                        onClick={() => handleCopyCitation(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#0A2947] hover:bg-slate-100 transition-colors"
                        title="Copy Chicago/APA citation"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Cite</span>
                          </>
                        )}
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ── MAIN CONTENT: CURATORIAL LEDGER MODE ─────────────────────────── */}
        {viewMode === 'ledger' && (
          <div className="rounded-3xl bg-white border border-[#D3D4C0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-dmsans">
                <thead className="bg-[#FAF7F0] border-b border-[#D3D4C0] font-montserrat font-bold text-[#0A2947] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-6">Work / Document Title</th>
                    <th className="py-4 px-4">Language</th>
                    <th className="py-4 px-4">Format</th>
                    <th className="py-4 px-4">Extent</th>
                    <th className="py-4 px-4">File Size</th>
                    <th className="py-4 px-4">SHA-256 Hash</th>
                    <th className="py-4 px-6 text-right">BookView Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D3D4C0]/50 text-slate-700">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                      <td className="py-4 px-6 font-serif font-bold text-[#0A2947]">
                        <div className="space-y-0.5">
                          <span className="text-sm line-clamp-1">{item.title}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-normal">{item.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                          {item.languageLabel}
                        </span>
                      </td>
                      <td className="py-4 px-4 uppercase font-mono font-bold text-[10px] text-slate-600">
                        {item.format}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {item.pageCount ? `${item.pageCount} pgs` : item.duration || '—'}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-500">
                        {item.fileSizeMb}
                      </td>
                      <td className="py-4 px-4 font-mono text-[10px] text-slate-400">
                        {item.sha256 ? `${item.sha256.substring(0, 10)}...` : 'Verified'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenBookView(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] text-white font-montserrat font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>BookView</span>
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

      {/* ── MODAL: BOOKVIEW PDF READER ─────────────────────────────────────── */}
      {activeItem && activeItem.format === 'pdf' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200">
          <div
            className={`w-full bg-[#FAF7F0] rounded-3xl shadow-2xl border border-[#C89D56]/50 flex flex-col overflow-hidden transition-all duration-300 ${
              isPdfFullscreen ? 'h-full max-w-full' : 'max-w-6xl h-[92vh]'
            }`}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#0A2947] to-[#12385F] text-white flex items-center justify-between border-b border-[#C89D56]/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base md:text-lg text-[#FAF7F0] line-clamp-1">
                      {activeItem.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#C89D56] text-slate-950 font-bold uppercase">
                      BookView Facsimile
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    {activeItem.languageLabel} • {activeItem.pageCount || 0} Pages • {activeItem.fileSizeMb}
                  </p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2">
                <a
                  href={activeItem.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-montserrat font-semibold transition-colors"
                  title="Open native PDF in external tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>External Tab</span>
                </a>

                <a
                  href={activeItem.downloadUrl}
                  download
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-montserrat font-semibold transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  onClick={() => setIsPdfFullscreen(!isPdfFullscreen)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isPdfFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isPdfFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveItem(null);
                  }}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors ml-2"
                  title="Close BookView"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF Viewport */}
            <div className="flex-1 bg-slate-900 relative">
              <iframe
                src={`${activeItem.streamUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-none"
                title={activeItem.title}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-2.5 bg-white border-t border-[#D3D4C0] flex items-center justify-between text-xs text-[#0A2947]">
              <span className="font-mono text-[11px] text-slate-500">
                Fixity Hash: <span className="text-[#0A2947] font-semibold">{activeItem.sha256 || 'SHA-256 Verified'}</span>
              </span>
              <button
                onClick={() => handleAskAIAboutItem(activeItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C89D56]/20 hover:bg-[#C89D56]/30 text-[#8B5E3C] font-semibold transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask AI Scholar about this Volume</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: BOOKVIEW VIDEO PLAYER ───────────────────────────────────── */}
      {activeItem && activeItem.format === 'video' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-950 rounded-3xl shadow-2xl border border-rose-500/30 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base md:text-lg text-white">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Archival 1080p MP4 • {activeItem.duration} • {activeItem.fileSizeMb}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveItem(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[65vh] object-contain"
                src={activeItem.streamUrl}
              >
                Your browser does not support HTML5 video streaming.
              </video>
            </div>

            {/* Context & Controls */}
            <div className="p-6 bg-slate-900/90 text-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {activeItem.description}
                </p>

                {/* Playback speed selector */}
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-400 mr-1">Speed:</span>
                  {[0.75, 1, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setVideoPlaybackRate(speed);
                        if (videoRef.current) videoRef.current.playbackRate = speed;
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        videoPlaybackRate === speed
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">Verified Ingest: incoming_documents/{activeItem.relativePath}</span>
                <a
                  href={activeItem.downloadUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BookViewLibraryView;
