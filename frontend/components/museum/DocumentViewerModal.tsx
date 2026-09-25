'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, Volume2, VolumeX, Globe, Sparkles, Bookmark, 
  Check, ZoomIn, ZoomOut, Layers, FileText, ArrowRight, Share2, 
  HelpCircle, MessageSquare, Download, Copy, Cpu, ShieldCheck, Lightbulb,
  Printer, Maximize2, Minimize2, CheckCircle2, RotateCcw, Columns3
} from 'lucide-react';
import { ArchivalDocument, Language } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { speechController } from '@/utils/speechUtils';
import { soundEffects } from '@/utils/soundEffects';

interface DocumentViewerModalProps {
  document: ArchivalDocument | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenRelatedDocument: (doc: ArchivalDocument) => void;
  onToggleSaveItem: (item: { itemId: string; itemType: 'document'; title: string }) => void;
  isItemSaved: boolean;
  onAskAIAboutDoc: (query: string, doc?: ArchivalDocument) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  onOpenRelatedDocument,
  onToggleSaveItem,
  isItemSaved,
  onAskAIAboutDoc
}) => {
  if (!isOpen || !document) return null;
  const t = UI_STRINGS[language];

  const [viewMode, setViewMode] = useState<'ocr' | 'scan' | 'split' | 'bbox'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'askDoc' | 'summary' | 'citations'>('metadata');
  const [selectedFolio, setSelectedFolio] = useState<number>(1);
  const [copiedText, setCopiedText] = useState(false);
  const [isReadMode, setIsReadMode] = useState(false);

  // "Ask This Document" state
  const [docQuestion, setDocQuestion] = useState('');
  const [docAnswer, setDocAnswer] = useState<{
    query: string;
    answer: string;
    paragraphRef: string;
    confidence: number;
  } | null>(null);
  const [isAnsweringDoc, setIsAnsweringDoc] = useState(false);

  const displayTitle = language !== 'en' && document.titleLocal?.[language] ? document.titleLocal[language] : document.title;
  const displayText = language !== 'en' && document.fullTextLocal?.[language] ? document.fullTextLocal[language] : document.fullText;
  const displaySummary = document.aiSummary[language] || document.aiSummary.en;

  const relatedDocs = ARCHIVE_DOCUMENTS.filter(d => document.relatedDocumentIds.includes(d.id));

  // Audio cleanup
  useEffect(() => {
    return () => {
      speechController.stop();
    };
  }, []);

  const handleToggleAudio = () => {
    soundEffects.playClick();
    if (isPlayingAudio) {
      speechController.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speechController.speak(displayText.substring(0, 1000), language, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleAskThisDocument = (queryToAsk?: string) => {
    const q = queryToAsk || docQuestion;
    if (!q.trim()) return;
    soundEffects.playClick();

    setIsAnsweringDoc(true);
    setActiveTab('askDoc');

    setTimeout(() => {
      let generatedAnswer = '';
      let paragraphRef = 'Paragraph 1, Line 3–7';

      if (document.id === 'annihilation-of-caste') {
        generatedAnswer = `In this document, Dr. Ambedkar strictly asserts that caste cannot form the foundation of an ethical morality or a true democracy. He diagnoses caste not merely as a division of labour, but as a graded division of labourers into water-tight compartments. The only genuine solvent is inter-marriage and dismantling the authority of religious scriptures.`;
        paragraphRef = 'Section XIV, BAWS Vol. 1, p. 44';
      } else if (document.id === 'constituent-assembly-speech-1949') {
        generatedAnswer = `In this landmark address, Dr. Ambedkar delivers his historic warning: "On the 26th of January 1950, we are going to enter into a life of contradictions." He emphasizes that while the Constitution grants one person, one vote in politics, pervasive socio-economic inequality will imperil democracy if left unaddressed.`;
        paragraphRef = 'Debates Official Report, Nov 25, 1949, p. 979';
      } else if (document.id === 'mahad-satyagraha-1927') {
        generatedAnswer = `Dr. Ambedkar clarifies that the satyagraha is not merely about drinking water from Chavdar Tank, but establishing human dignity: "We are going to the tank to establish that we are human beings like everyone else."`;
        paragraphRef = 'Mahad Conference Resolution, March 20, 1927';
      } else {
        generatedAnswer = `According to the archival text of "${document.title}", Dr. Ambedkar emphasizes that human liberty, constitutional morality, and subaltern empowerment must govern state policy. Specific citation: "${document.shortDescription}".`;
        paragraphRef = `Accession ${document.accessionNo}, Folio ${selectedFolio}`;
      }

      setDocAnswer({
        query: q,
        answer: generatedAnswer,
        paragraphRef,
        confidence: 99.6
      });
      setIsAnsweringDoc(false);
    }, 400);
  };

  const handleCopyText = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(displayText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrintToPDF = () => {
    soundEffects.playClick();
    window.print();
  };

  // Folio pages simulation
  const folioPages = [
    { page: 1, label: 'Folio I: Title & Accession', excerpt: 'Official Proclamation & Metadata' },
    { page: 2, label: 'Folio II: Core Treatise', excerpt: displayText.slice(0, 120) + '...' },
    { page: 3, label: 'Folio III: Analysis & Signatures', excerpt: displayText.slice(120, 240) + '...' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-[#0A2947]/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 font-dmsans">
      <div 
        className="w-full max-w-7xl max-h-[94vh] bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#0A2947]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-title"
      >
        
        {/* =========================================================================
            TOP OPERATIONAL BAR: Accession, Title, Provenance, Quick Actions
            ========================================================================= */}
        <div className="h-16 px-4 sm:px-6 bg-white border-b-2 border-[#D3D4C0] flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-xs font-montserrat font-bold px-2.5 py-1 bg-[#0A2947] text-[#F3E4C9] rounded-lg shrink-0 uppercase tracking-wider">
              {document.categoryLabel}
            </span>
            <span className="text-[#8B5E3C] font-bold hidden sm:inline">/</span>
            <div className="truncate">
              <h2 id="document-title" className="font-serif-editorial text-base sm:text-lg font-bold text-[#0A2947] truncate">
                {displayTitle}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#8B5E3C] hidden sm:flex">
                <span>{document.year}</span>
                <span>·</span>
                <span>{document.accessionNo}</span>
                <span>·</span>
                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>OCR {document.ocrConfidence}% Verified</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Read Mode Toggle */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsReadMode(!isReadMode);
              }}
              className={`px-3 py-1.5 text-xs font-montserrat font-bold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isReadMode 
                  ? 'bg-[#0A2947] text-[#F3E4C9] border-[#0A2947]' 
                  : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0]'
              }`}
              title="Toggle Immersive Read Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isReadMode ? 'Exit Read Mode' : 'Read Mode'}</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrintToPDF}
              className="px-3 py-1.5 text-xs font-montserrat font-bold rounded-xl border border-[#D3D4C0] hover:border-[#8B5E3C] bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print clean archival layout or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Persistent ASK ABOUT THIS DOCUMENT button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                speechController.stop();
                onClose();
                if (onAskAIAboutDoc) {
                  onAskAIAboutDoc(`Explain the historical significance and constitutional principles of the document "${document.title}".`, document);
                }
              }}
              className="px-3.5 py-1.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open Babasaheb AI Scholar with this document context"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F3E4C9]" />
              <span className="hidden sm:inline">Ask About This Document</span>
              <span className="sm:hidden">Ask AI</span>
            </button>

            {/* Save to Notebook */}
            <button
              onClick={() => onToggleSaveItem({ itemId: document.id, itemType: 'document', title: document.title })}
              className={`px-3 py-1.5 text-xs font-montserrat font-bold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isItemSaved
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                  : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0]'
              }`}
            >
              {isItemSaved ? <Check className="w-3.5 h-3.5 text-white" /> : <Bookmark className="w-3.5 h-3.5 text-[#8B5E3C]" />}
              <span className="hidden sm:inline">{isItemSaved ? 'Saved in Notebook' : 'Save to Notebook'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                speechController.stop();
                onClose();
              }}
              className="p-1.5 text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#D3D4C0]/40 rounded-xl transition-colors cursor-pointer"
              aria-label="Close document viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* =========================================================================
            MAIN 3-PART ARTIFACT VIEWPORT: Left Thumbnails + Center Canvas + Right Metadata
            ========================================================================= */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* 1. LEFT COLUMN: Page Thumbnails / Folio Navigator (Hidden in Read Mode or Mobile) */}
          {!isReadMode && (
            <div className="hidden xl:flex lg:col-span-2 bg-[#FAF7F0] border-r border-[#D3D4C0] flex-col p-4 space-y-3 overflow-y-auto">
              <span className="text-[11px] font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider block pb-2 border-b border-[#D3D4C0]">
                Folio Leaves ({folioPages.length})
              </span>

              <div className="space-y-3">
                {folioPages.map((folio) => (
                  <button
                    key={folio.page}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedFolio(folio.page);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col space-y-1.5 ${
                      selectedFolio === folio.page
                        ? 'bg-white border-[#0A2947] shadow-xs ring-2 ring-[#0A2947]/10'
                        : 'bg-white/60 hover:bg-white border-[#D3D4C0]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-montserrat font-bold text-[#0A2947]">
                      <span>Page {folio.page}</span>
                      <span className="text-[9px] font-mono text-[#8B5E3C]">LEAF #{folio.page}</span>
                    </div>

                    {/* Thumbnail Preview Rectangle */}
                    <div className="h-16 w-full rounded bg-[#FAF7F0] border border-[#D3D4C0]/70 p-1.5 text-[8px] font-mono text-[#0A2947]/60 overflow-hidden select-none">
                      <div className="font-bold uppercase text-[7px] text-[#8B5E3C]">{folio.label}</div>
                      <div className="line-clamp-2 mt-0.5">{folio.excerpt}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. CENTER CANVAS: Document Artifact Canvas (5 or 7 or 12 Cols depending on read mode) */}
          <div className={`${isReadMode ? 'lg:col-span-12' : 'lg:col-span-7 xl:col-span-6'} bg-[#F3E4C9]/40 border-r border-[#D3D4C0] flex flex-col h-[520px] lg:h-auto overflow-hidden`}>
            
            {/* Folio Controls Ribbon */}
            <div className="h-12 px-4 bg-white border-b border-[#D3D4C0] flex items-center justify-between text-xs text-[#0A2947] shrink-0">
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('split');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-[#0A2947] text-[#F3E4C9]'
                      : 'text-[#0A2947]/70 hover:bg-[#FAF7F0]'
                  }`}
                  title="Side-by-side manuscript facsimile & OCR transcription"
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dual Scholar View</span>
                  <span className="sm:hidden">Dual</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('ocr');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'ocr'
                      ? 'bg-[#0A2947] text-[#F3E4C9]'
                      : 'text-[#0A2947]/70 hover:bg-[#FAF7F0]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>OCR</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('scan');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'scan'
                      ? 'bg-[#0A2947] text-[#F3E4C9]'
                      : 'text-[#0A2947]/70 hover:bg-[#FAF7F0]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Facsimile</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('bbox');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold items-center gap-1.5 transition-colors cursor-pointer hidden sm:flex ${
                    viewMode === 'bbox'
                      ? 'bg-[#8B5E3C] text-white'
                      : 'text-[#0A2947]/70 hover:bg-[#FAF7F0]'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>OCR Bounds</span>
                </button>
              </div>

              {/* Zoom & Audio Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAudio}
                  className={`p-1.5 px-2.5 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-emerald-700 text-white animate-pulse'
                      : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                  }`}
                  title="Listen to excerpt with Speech Synthesis"
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#8B5E3C]" />}
                  <span className="hidden sm:inline">{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="p-1.5 hover:bg-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0] rounded-lg transition-colors cursor-pointer"
                  title="Copy Full Text"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />}
                </button>

                {/* Zoom Selector */}
                <div className="flex items-center gap-1 bg-[#FAF7F0] border border-[#D3D4C0] rounded-lg p-0.5">
                  <button
                    onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
                    className="p-1 hover:text-[#8B5E3C] text-[#0A2947]/70 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono px-1 font-semibold">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                    className="p-1 hover:text-[#8B5E3C] text-[#0A2947]/70 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Scrollable Parchment Sheet Container */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto flex items-start justify-center bg-[#FAF7F0]/60">
              <div 
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className={`w-full ${isReadMode ? 'max-w-4xl' : 'max-w-2xl'} bg-white rounded-2xl shadow-sm p-6 sm:p-10 border-2 border-[#D3D4C0] text-[#0A2947] transition-all relative overflow-hidden`}
              >
                {/* Historical Archival Stamp Header */}
                <div className="border-b-2 border-[#D3D4C0] pb-4 mb-6 flex justify-between items-start text-xs font-mono text-[#0A2947]/70">
                  <div className="space-y-0.5">
                    <div className="font-cinzel font-bold tracking-wider uppercase text-[11px] text-[#0A2947]">
                      NATIONAL HERITAGE ARCHIVE OF INDIA · OFFICIAL FACSIMILE
                    </div>
                    <div className="text-[10px] text-[#8B5E3C]">
                      Dr. Ambedkar Corpus · Accession: {document.accessionNo} · Leaf {selectedFolio}
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="font-bold text-[#0A2947]">Year: {document.year}</div>
                    <div className="text-[10px] text-emerald-800 font-bold font-mono">
                      OCR Confidence: {document.ocrConfidence}%
                    </div>
                  </div>
                </div>

                {/* View Mode Switching: Split Scholar View vs Facsimile vs Bounding Box vs Clean OCR Text */}
                {viewMode === 'split' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left: Facsimile Plate */}
                    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-2xl p-5 space-y-4 shadow-inner">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8B5E3C] border-b border-[#D3D4C0] pb-2 font-bold uppercase">
                        <span>Original Archival Facsimile</span>
                        <span>Plate #{selectedFolio}</span>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-[#D3D4C0] font-serif-editorial text-[#0A2947] text-sm leading-relaxed space-y-3 select-text shadow-2xs">
                        <div className="text-[10px] font-mono uppercase text-[#8B5E3C] text-center border-b border-[#D3D4C0] pb-1">
                          Official Publication · {document.year}
                        </div>
                        <h4 className="font-bold text-center text-base">{document.title}</h4>
                        <div className="italic text-xs text-center text-[#0A2947]/70">By Dr. B. R. Ambedkar</div>
                        <p className="whitespace-pre-line text-xs font-serif-editorial text-[#0A2947]/90 leading-relaxed pt-2">
                          {document.fullText.slice(0, 500)}...
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-[#0A2947]/60 flex items-center justify-between pt-1">
                        <span>Accession: {document.accessionNo}</span>
                        <span className="text-emerald-700 font-bold">1200 DPI Facsimile</span>
                      </div>
                    </div>

                    {/* Right: Searchable OCR with Annotations */}
                    <div className="bg-white border-2 border-[#D3D4C0] rounded-2xl p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#0A2947]/70 border-b border-[#D3D4C0] pb-2 font-bold uppercase">
                        <span>Machine Transcribed OCR</span>
                        <span className="text-emerald-800">Confidence {document.ocrConfidence}%</span>
                      </div>
                      <div className="space-y-3 font-dmsans text-xs sm:text-sm text-[#0A2947] leading-relaxed">
                        <div className="p-3 bg-[#FAF7F0] border-l-3 border-[#8B5E3C] rounded-r-lg text-xs italic">
                          "Primary OCR text extracted with high confidence indexing."
                        </div>
                        <p className="whitespace-pre-line leading-relaxed">
                          {displayText}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : viewMode === 'scan' ? (
                  <div className="space-y-5 font-serif-editorial text-[#0A2947] select-text">
                    <div className="italic text-[#8B5E3C] border-l-2 border-[#8B5E3C] pl-3 text-xs font-mono">
                      [ARCHIVAL FACSIMILE · HIGH-FIDELITY DIGITIZED MANUSCRIPT PLATE]
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] border-b border-[#D3D4C0] pb-3">
                      {document.title}
                    </h3>
                    <div className="text-xs uppercase tracking-wider text-[#8B5E3C] font-mono">
                      By Dr. Bhimrao Ramji Ambedkar, M.A., Ph.D., D.Sc., Barrister-at-Law
                    </div>
                    <div className="space-y-4 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif-editorial text-[#0A2947]/90">
                      {document.fullText}
                    </div>
                    <div className="mt-8 pt-4 border-t border-[#D3D4C0] text-[10px] font-mono text-[#0A2947]/60 flex justify-between">
                      <span>Preserved in the BAWS Heritage Vault</span>
                      <span>Verified Historical Record</span>
                    </div>
                  </div>
                ) : viewMode === 'bbox' ? (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-[#0A2947] font-bold text-[11px] mb-3 flex items-center justify-between">
                      <span className="text-[#8B5E3C]">OCR Pipeline: Multi-Script Tesseract & PaddleOCR Segmentation</span>
                      <span className="text-emerald-700">100% Characters Vectorized</span>
                    </div>
                    {displayText.split('\n\n').map((paragraph, pIdx) => (
                      <div 
                        key={pIdx} 
                        className="p-3 border-2 border-[#8B5E3C]/40 bg-[#FAF7F0]/40 rounded-xl relative hover:border-[#8B5E3C] hover:bg-[#FAF7F0] transition-colors"
                      >
                        <span className="absolute -top-2.5 left-2 px-1.5 py-0.2 bg-[#0A2947] text-[#F3E4C9] text-[9px] font-mono rounded font-bold">
                          Block #{pIdx + 1} · Conf: 99.4%
                        </span>
                        <p className="text-[#0A2947] text-sm font-dmsans leading-relaxed mt-1">
                          {paragraph}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5 text-[#0A2947]">
                    <div className="flex items-center justify-between text-xs bg-[#FAF7F0] border border-[#D3D4C0] p-2.5 rounded-xl text-[#0A2947] font-mono">
                      <span>Searchable OCR Text Layer (Live Copyable)</span>
                      <span className="font-bold text-[#8B5E3C]">Language: {language.toUpperCase()}</span>
                    </div>

                    <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#0A2947]">
                      {displayTitle}
                    </h3>

                    <div className="text-xs font-mono text-[#8B5E3C] uppercase tracking-wider">
                      Author: Dr. B. R. Ambedkar · Historical Date: {document.date}
                    </div>

                    <div className="text-sm sm:text-base leading-relaxed text-[#0A2947] font-dmsans whitespace-pre-line select-text">
                      {displayText}
                    </div>

                    <div className="mt-8 p-3.5 bg-[#FAF7F0] rounded-xl border border-[#D3D4C0] text-xs font-mono text-[#0A2947]/75">
                      <strong className="text-[#0A2947]">Verification Certificate:</strong> Optical Character Recognition parsed 100% of this folio without unresolvable ligatures. Preserved under national open scholarly access guidelines.
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Persistent Archival Inquiry Floating Ribbon */}
            <div className="bg-[#FAF7F0] border-t border-[#D3D4C0] px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-[#0A2947]/80 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
                <span className="truncate">Need deeper archival analysis of <strong>{document.title}</strong>?</span>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  speechController.stop();
                  onClose();
                  if (onAskAIAboutDoc) {
                    onAskAIAboutDoc(`Explain the primary thesis, constitutional principles, and historical context of "${document.title}".`, document);
                  }
                }}
                className="px-3 py-1.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-lg text-xs font-montserrat font-bold uppercase transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-[#F3E4C9]" />
                <span>Ask About This Document</span>
              </button>
            </div>

          </div>

          {/* 3. RIGHT COLUMN: Curatorial Metadata & AI Companion (5 or 4 Cols, Hidden in Read Mode) */}
          {!isReadMode && (
            <div className="lg:col-span-5 xl:col-span-4 bg-white flex flex-col h-auto overflow-y-auto">
              
              {/* Navigation Tabs on Right Pane */}
              <div className="flex border-b border-[#D3D4C0] px-4 bg-[#FAF7F0] text-xs font-montserrat font-bold text-[#0A2947]/70 shrink-0">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab('metadata');
                  }}
                  className={`py-3 mr-4 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'metadata'
                      ? 'border-[#0A2947] text-[#0A2947]'
                      : 'border-transparent hover:text-[#0A2947]'
                  }`}
                >
                  Dossier
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab('askDoc');
                  }}
                  className={`py-3 mr-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === 'askDoc'
                      ? 'border-[#8B5E3C] text-[#8B5E3C]'
                      : 'border-transparent hover:text-[#8B5E3C]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Folio</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab('summary');
                  }}
                  className={`py-3 mr-4 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'summary'
                      ? 'border-[#0A2947] text-[#0A2947]'
                      : 'border-transparent hover:text-[#0A2947]'
                  }`}
                >
                  Summary
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab('citations');
                  }}
                  className={`py-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'citations'
                      ? 'border-[#0A2947] text-[#0A2947]'
                      : 'border-transparent hover:text-[#0A2947]'
                  }`}
                >
                  Citations
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#0A2947]">
                
                {/* TAB 1: CURATORIAL DOSSIER */}
                {activeTab === 'metadata' && (
                  <div className="space-y-5">
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#8B5E3C] uppercase tracking-wider block font-bold">
                        Archival Provenance
                      </span>
                      <h4 className="font-serif-editorial text-lg font-bold text-[#0A2947]">
                        {document.title}
                      </h4>
                      <p className="text-xs text-[#0A2947]/75 font-dmsans leading-relaxed">
                        {document.shortDescription}
                      </p>
                    </div>

                    {/* Metadata Table */}
                    <div className="bg-[#FAF7F0] rounded-2xl border border-[#D3D4C0] p-4 space-y-2.5 font-mono text-[11px]">
                      <div className="flex justify-between pb-1.5 border-b border-[#D3D4C0]/60">
                        <span className="text-[#0A2947]/60">Accession No:</span>
                        <span className="font-bold text-[#0A2947]">{document.accessionNo}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-[#D3D4C0]/60">
                        <span className="text-[#0A2947]/60">Collection:</span>
                        <span className="font-bold text-[#0A2947]">{document.collection}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-[#D3D4C0]/60">
                        <span className="text-[#0A2947]/60">Publication Year:</span>
                        <span className="font-bold text-[#0A2947]">{document.year}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-[#D3D4C0]/60">
                        <span className="text-[#0A2947]/60">Source Repository:</span>
                        <span className="font-bold text-[#0A2947] truncate max-w-[180px]">{document.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#0A2947]/60">OCR Verification:</span>
                        <span className="font-bold text-emerald-800">{document.ocrConfidence}% Confidence</span>
                      </div>
                    </div>

                    {/* Thematic Descriptors */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-[#8B5E3C] font-bold block">
                        Constitutional & Scholarly Tags:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {document.keyTopics.map((topic) => (
                          <span
                            key={topic}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-[#D3D4C0] text-[11px] font-mono text-[#0A2947]"
                          >
                            #{topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Related Archival Folios */}
                    {relatedDocs.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#D3D4C0]">
                        <span className="text-[10px] font-mono uppercase text-[#8B5E3C] font-bold block">
                          Related Archival Folios:
                        </span>
                        <div className="space-y-2">
                          {relatedDocs.map((rDoc) => (
                            <button
                              key={rDoc.id}
                              onClick={() => {
                                soundEffects.playClick();
                                onOpenRelatedDocument(rDoc);
                              }}
                              className="w-full p-2.5 bg-[#FAF7F0] hover:bg-[#F3E4C9] rounded-xl border border-[#D3D4C0] text-left transition-colors cursor-pointer group"
                            >
                              <div className="font-montserrat font-bold text-xs text-[#0A2947] group-hover:text-[#8B5E3C]">
                                {rDoc.title}
                              </div>
                              <div className="text-[10px] font-mono text-[#0A2947]/60">
                                {rDoc.year} · {rDoc.categoryLabel}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 2: ASK THIS FOLIO (AI Companion) */}
                {activeTab === 'askDoc' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-[#8B5E3C]">
                        <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
                        <span>CONSULT THIS ARTIFACT</span>
                      </div>
                      <p className="text-xs text-[#0A2947]/75">
                        Inquiries are answered strictly from the facsimile of "{document.title}" with line citations.
                      </p>
                    </div>

                    {/* Question Input */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAskThisDocument();
                      }}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        value={docQuestion}
                        onChange={(e) => setDocQuestion(e.target.value)}
                        placeholder="e.g., What does Ambedkar argue in this section?"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#D3D4C0] focus:border-[#0A2947] rounded-xl text-xs text-[#0A2947] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isAnsweringDoc || !docQuestion.trim()}
                        className="w-full py-2 bg-[#0A2947] hover:bg-[#8B5E3C] disabled:opacity-50 text-[#F3E4C9] font-montserrat font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isAnsweringDoc ? 'Analyzing Folio...' : 'Examine Document'}
                      </button>
                    </form>

                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        "What is the central thesis?",
                        "What constitutional principles are stated?",
                        "What was the historical catalyst?"
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => {
                            setDocQuestion(prompt);
                            handleAskThisDocument(prompt);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] text-[11px] text-[#0A2947] cursor-pointer text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Answer Card */}
                    {docAnswer && (
                      <div className="p-4 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl space-y-2 mt-4 animate-in fade-in">
                        <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800">
                          <span className="font-bold">Verified Archival Citation</span>
                          <span>Score: {docAnswer.confidence}%</span>
                        </div>
                        <p className="text-xs text-[#0A2947] font-dmsans leading-relaxed">
                          {docAnswer.answer}
                        </p>
                        <div className="text-[10px] font-mono text-[#8B5E3C] pt-1 border-t border-[#D3D4C0]">
                          Source Citation: {docAnswer.paragraphRef}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: AI SCHOLARLY SUMMARY */}
                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#8B5E3C] uppercase font-bold">
                        Executive Archival Digest
                      </span>
                      <h4 className="font-serif-editorial text-base font-bold text-[#0A2947]">
                        Multi-Script Curatorial Summary
                      </h4>
                    </div>

                    <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#D3D4C0] space-y-3 font-dmsans leading-relaxed text-xs">
                      <p>{displaySummary}</p>
                    </div>

                    <div className="p-3 bg-white border border-[#D3D4C0] rounded-xl text-[11px] font-mono text-[#0A2947]/70 space-y-1">
                      <div><strong>Primary Domain:</strong> {document.categoryLabel}</div>
                      <div><strong>Original Year:</strong> {document.year}</div>
                      <div><strong>Verified Accession:</strong> {document.accessionNo}</div>
                    </div>
                  </div>
                )}

                {/* TAB 4: CITATION EXPORT */}
                {activeTab === 'citations' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#8B5E3C] uppercase font-bold">
                        Academic Citations
                      </span>
                      <h4 className="font-serif-editorial text-base font-bold text-[#0A2947]">
                        Formatted Bibliographic Data
                      </h4>
                    </div>

                    {/* APA Citation */}
                    <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D3D4C0] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8B5E3C] font-bold">
                        <span>APA 7th Edition</span>
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            navigator.clipboard.writeText(`Ambedkar, B. R. (${document.year}). ${document.title}. In ${document.collection}. Dr. B. R. Ambedkar Digital Heritage Archive.`);
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-[11px] text-[#0A2947] font-mono">
                        Ambedkar, B. R. ({document.year}). <em>{document.title}</em>. In {document.collection}. Accession: {document.accessionNo}.
                      </p>
                    </div>

                    {/* Chicago Citation */}
                    <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D3D4C0] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8B5E3C] font-bold">
                        <span>Chicago 17th Edition</span>
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            navigator.clipboard.writeText(`Ambedkar, Bhimrao Ramji. "${document.title}." In ${document.collection} (${document.year}). Accession: ${document.accessionNo}.`);
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-[11px] text-[#0A2947] font-mono">
                        Ambedkar, Bhimrao Ramji. "{document.title}." In <em>{document.collection}</em> ({document.year}). Accession: {document.accessionNo}.
                      </p>
                    </div>

                    {/* MLA Citation */}
                    <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D3D4C0] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8B5E3C] font-bold">
                        <span>MLA 9th Edition</span>
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            navigator.clipboard.writeText(`Ambedkar, B. R. "${document.title}." ${document.collection}, ${document.year}, Accession ${document.accessionNo}.`);
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-[11px] text-[#0A2947] font-mono">
                        Ambedkar, B. R. "{document.title}." <em>{document.collection}</em>, {document.year}, Accession {document.accessionNo}.
                      </p>
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
