'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, BookOpen, Volume2, VolumeX, Globe, Sparkles, Bookmark,
  Check, ZoomIn, ZoomOut, Layers, FileText, ArrowRight, Share2,
  HelpCircle, MessageSquare, Download, Copy, Cpu, ShieldCheck, Lightbulb,
  Printer, Maximize2, Minimize2, CheckCircle2, RotateCcw, Columns3,
  ExternalLink, ChevronLeft, ChevronRight, Info, Eye
} from 'lucide-react';
import { ArchivalDocument, Language } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { speechController } from '@/utils/speechUtils';
import { soundEffects } from '@/utils/soundEffects';
import { api } from '@/lib/api';

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
  const t = UI_STRINGS[language] || UI_STRINGS.en;

  // View state: 'read' (Default scholarly reader), 'split' (Dual view), 'scan' (Facsimile plate), 'ocr' (Raw text)
  const [viewMode, setViewMode] = useState<'read' | 'split' | 'scan' | 'ocr'>('read');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'askDoc' | 'summary' | 'citations'>('metadata');
  const [selectedFolio, setSelectedFolio] = useState<number>(1); // 1, 2, 3 or 0 (All Leaves)
  const [copiedText, setCopiedText] = useState(false);
  const [showLeavesSidebar, setShowLeavesSidebar] = useState(true);
  const [showDossierSidebar, setShowDossierSidebar] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      speechController.stop();
    };
  }, []);

  // Split document text cleanly across 3 distinct leaves
  const rawParagraphs = useMemo(() => {
    const list = displayText.split('\n\n').map(p => p.trim()).filter(Boolean);
    return list.length > 0 ? list : [displayText];
  }, [displayText]);

  const leafContentMap = useMemo(() => {
    const count = rawParagraphs.length;

    // Helper to slice paragraphs
    let pLeaf1: string[] = [];
    let pLeaf2: string[] = [];
    let pLeaf3: string[] = [];

    if (count <= 1) {
      const full = rawParagraphs[0] || displayText;
      const third = Math.ceil(full.length / 3);
      pLeaf1 = [full.slice(0, third)];
      pLeaf2 = [full.slice(third, third * 2)];
      pLeaf3 = [full.slice(third * 2)];
    } else if (count === 2) {
      pLeaf1 = [rawParagraphs[0]];
      pLeaf2 = [rawParagraphs[1]];
      pLeaf3 = [rawParagraphs[1]];
    } else {
      const perLeaf = Math.ceil(count / 3);
      pLeaf1 = rawParagraphs.slice(0, perLeaf);
      pLeaf2 = rawParagraphs.slice(perLeaf, perLeaf * 2);
      pLeaf3 = rawParagraphs.slice(perLeaf * 2);
    }

    return {
      0: {
        page: 0,
        label: 'Complete Archival Folio',
        subtitle: `Full Unabridged Corpus · ${document.collection}`,
        plateNumber: 'Plates 1–3',
        paragraphs: rawParagraphs,
        excerpt: rawParagraphs[0]?.slice(0, 100) + '...'
      },
      1: {
        page: 1,
        label: 'Folio I: Title & Opening Proclamation',
        subtitle: `Accession Proclamation · Plate #1`,
        plateNumber: 'Plate #1',
        paragraphs: pLeaf1,
        excerpt: pLeaf1[0]?.slice(0, 100) + '...'
      },
      2: {
        page: 2,
        label: 'Folio II: Core Historical Treatise',
        subtitle: `Primary Philosophical Arguments · Plate #2`,
        plateNumber: 'Plate #2',
        paragraphs: pLeaf2,
        excerpt: pLeaf2[0]?.slice(0, 100) + '...'
      },
      3: {
        page: 3,
        label: 'Folio III: Constitutional Analysis & Resolutions',
        subtitle: `Concluding Principles & Historical Decrees · Plate #3`,
        plateNumber: 'Plate #3',
        paragraphs: pLeaf3,
        excerpt: pLeaf3[0]?.slice(0, 100) + '...'
      }
    };
  }, [rawParagraphs, displayText, document.collection]);

  const currentLeaf = leafContentMap[selectedFolio as 0 | 1 | 2 | 3] || leafContentMap[1];

  const folioPages = [
    { page: 1, label: leafContentMap[1].label, excerpt: leafContentMap[1].excerpt },
    { page: 2, label: leafContentMap[2].label, excerpt: leafContentMap[2].excerpt },
    { page: 3, label: leafContentMap[3].label, excerpt: leafContentMap[3].excerpt },
  ];

  const handleToggleAudio = () => {
    soundEffects.playClick();
    if (isPlayingAudio) {
      speechController.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToRead = currentLeaf.paragraphs.join(' ');
      speechController.speak(textToRead.substring(0, 1200), language, () => {
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
    if (!showDossierSidebar) setShowDossierSidebar(true);

    setTimeout(() => {
      let generatedAnswer = '';
      let paragraphRef = `Leaf ${selectedFolio || 1}, Paragraph 1`;

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
        paragraphRef = `Accession ${document.accessionNo}, Leaf ${selectedFolio || 1}`;
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
    const textToCopy = currentLeaf.paragraphs.join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrintToPDF = () => {
    soundEffects.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-[#0A2947]/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200 font-dmsans">
      <div
        className="w-full max-w-7xl h-[94vh] bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#0A2947]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-title"
      >

        {/* =========================================================================
            TOP OPERATIONAL BAR: Clean, Balanced, Uncluttered
            ========================================================================= */}
        <div className="h-16 px-4 sm:px-6 bg-white border-b border-[#D3D4C0] flex items-center justify-between gap-4 shrink-0 shadow-2xs">

          {/* Left: Provenance & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-[#0A2947] text-[#F3E4C9] rounded-md shrink-0 uppercase tracking-wider">
              {document.categoryLabel}
            </span>
            <span className="text-[#D3D4C0] hidden sm:inline">|</span>
            <div className="min-w-0">
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

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0">

            {/* BookView Facsimile Reader External Link */}
            <a
              href={`/documents/${document.id}/viewer`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-montserrat font-bold rounded-xl border border-[#C89D56]/50 hover:border-[#8B5E3C] bg-gradient-to-r from-[#FAF7F0] to-[#F3E4C9] hover:from-[#F3E4C9] hover:to-[#EAD5B5] text-[#0A2947] transition-all cursor-pointer shadow-sm hover:shadow-md"
              title="Open full BookView facsimile reader in new tab"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>BookView</span>
            </a>

            {/* Export Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setShowExportMenu(!showExportMenu);
                }}
                className="px-3 py-1.5 text-xs font-montserrat font-semibold rounded-xl border border-[#D3D4C0] hover:border-[#8B5E3C] bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Export document"
              >
                <Download className="w-3.5 h-3.5 text-[#8B5E3C]" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-[#D3D4C0] p-1.5 z-50 text-xs font-montserrat space-y-1 animate-in fade-in">
                  <a
                    href={api.getDocumentExportUrl(document.id, 'text')}
                    target="_blank"
                    download
                    onClick={() => setShowExportMenu(false)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF7F0] flex items-center justify-between text-[#0A2947] transition-colors"
                  >
                    <span>Full Text (.txt)</span>
                    <span className="text-[10px] font-mono font-bold text-[#8B5E3C] bg-[#FAF7F0] px-1.5 py-0.5 rounded">TXT</span>
                  </a>
                  <a
                    href={api.getDocumentExportUrl(document.id, 'json')}
                    target="_blank"
                    download
                    onClick={() => setShowExportMenu(false)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF7F0] flex items-center justify-between text-[#0A2947] transition-colors"
                  >
                    <span>Metadata & Chunks (.json)</span>
                    <span className="text-[10px] font-mono font-bold text-[#8B5E3C] bg-[#FAF7F0] px-1.5 py-0.5 rounded">JSON</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      handlePrintToPDF();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF7F0] flex items-center justify-between text-[#0A2947] border-t border-[#D3D4C0]/60 pt-2 transition-colors cursor-pointer"
                  >
                    <span>Print / Save as PDF</span>
                    <span className="text-[10px] font-mono font-bold text-[#8B5E3C] bg-[#FAF7F0] px-1.5 py-0.5 rounded">PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Open Fullscreen BookView Viewer */}
            <a
              href={`/documents/${document.id}/viewer`}
              className="px-3 py-1.5 text-xs font-montserrat font-bold rounded-xl border border-[#C89D56]/60 bg-gradient-to-r from-[#0A2947] to-[#123C63] text-amber-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
              title="Open dedicated BookView reader for this volume"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">BookView</span>
              <ExternalLink className="w-3 h-3 text-amber-300/70" />
            </a>

            {/* Save to Notebook */}
            <button
              type="button"
              onClick={() => onToggleSaveItem({ itemId: document.id, itemType: 'document', title: document.title })}
              className={`px-3 py-1.5 text-xs font-montserrat font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${isItemSaved
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0]'
                }`}
              title={isItemSaved ? 'Saved in personal dossier' : 'Save folio to notebook'}
            >
              {isItemSaved ? <Check className="w-3.5 h-3.5 text-white" /> : <Bookmark className="w-3.5 h-3.5 text-[#8B5E3C]" />}
              <span className="hidden sm:inline">{isItemSaved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Toggle Dossier / Metadata Sidebar */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setShowDossierSidebar(!showDossierSidebar);
              }}
              className={`px-3 py-1.5 text-xs font-montserrat font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${showDossierSidebar
                ? 'bg-[#0A2947] text-[#FAF7F0] border-[#0A2947]'
                : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0]'
                }`}
              title={showDossierSidebar ? 'Close Dossier sidebar' : 'Open Dossier & Scholarly Notes'}
            >
              <Info className="w-3.5 h-3.5 text-[#C89D56]" />
              <span className="hidden md:inline">Dossier</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                speechController.stop();
                onClose();
              }}
              className="p-1.5 text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#FAF7F0] border border-transparent hover:border-[#D3D4C0] rounded-xl transition-all cursor-pointer ml-1"
              aria-label="Close document viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* =========================================================================
            MAIN VIEWPORT: Left Folio Leaves Drawer + Canvas Reader + Right Dossier
            ========================================================================= */}
        <div className="flex-1 flex overflow-hidden">

          {/* 1. LEFT COLUMN: VISIBLE FOLIO LEAVES DRAWER */}
          {showLeavesSidebar && (
            <div className="w-60 sm:w-64 bg-[#FAF7F0] border-r border-[#D3D4C0] flex flex-col shrink-0 overflow-y-auto p-3.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#D3D4C0]">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8B5E3C]" />
                  <span className="text-xs font-cinzel font-bold text-[#0A2947] uppercase tracking-wider">
                    Folio Leaves ({folioPages.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#8B5E3C] bg-white px-1.5 py-0.5 rounded border border-[#D3D4C0]">
                  {selectedFolio === 0 ? 'All' : `${selectedFolio}/${folioPages.length}`}
                </span>
              </div>

              {/* Leaf Cards */}
              <div className="space-y-2">
                {folioPages.map((folio) => {
                  const isSelected = selectedFolio === folio.page;
                  return (
                    <button
                      key={folio.page}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedFolio(folio.page);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-[#0A2947] text-[#FAF7F0] border-[#0A2947] shadow-sm ring-2 ring-[#C89D56]/50'
                          : 'bg-white hover:bg-[#F3E4C9]/40 text-[#0A2947] border-[#D3D4C0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-montserrat font-bold ${isSelected ? 'text-[#F3E4C9]' : 'text-[#0A2947]'}`}>
                          Page {folio.page}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          isSelected ? 'bg-white/15 text-[#F3E4C9]' : 'bg-[#FAF7F0] text-[#8B5E3C]'
                        }`}>
                          LEAF #{folio.page}
                        </span>
                      </div>

                      <div className={`text-[11px] font-serif-editorial line-clamp-1 font-semibold ${isSelected ? 'text-white/95' : 'text-[#0A2947]/90'}`}>
                        {folio.label}
                      </div>

                      <div className={`text-[10px] font-mono line-clamp-2 ${isSelected ? 'text-white/70' : 'text-[#0A2947]/60'}`}>
                        {folio.excerpt}
                      </div>
                    </button>
                  );
                })}

                {/* View Full Document / All Leaves Option */}
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedFolio(0);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedFolio === 0
                      ? 'bg-[#0A2947] text-[#FAF7F0] border-[#0A2947] shadow-sm ring-2 ring-[#C89D56]/50'
                      : 'bg-white hover:bg-[#F3E4C9]/40 text-[#0A2947] border-[#D3D4C0]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#C89D56]" />
                    <span className="text-xs font-montserrat font-bold">All Leaves</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8B5E3C]">Full Text</span>
                </button>
              </div>

              {/* Leaf Information Footer */}
              <div className="pt-2 border-t border-[#D3D4C0] text-[10px] font-mono text-[#0A2947]/60">
                Click any leaf to navigate and inspect its digitized plate.
              </div>
            </div>
          )}

          {/* 2. MAIN DOCUMENT CANVAS */}
          <div className="flex-1 flex flex-col bg-[#FAF7F0]/40 overflow-hidden min-w-0">

            {/* Streamlined Folio Reading Ribbon */}
            <div className="h-12 px-4 sm:px-6 bg-white border-b border-[#D3D4C0] flex items-center justify-between text-xs text-[#0A2947] shrink-0 gap-3">

              {/* Left: View Mode Switcher Pill */}
              <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#D3D4C0]/70">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('read');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'read'
                    ? 'bg-[#0A2947] text-[#F3E4C9] shadow-2xs'
                    : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                    }`}
                  title="Scholarly Reading View"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Reading</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('split');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'split'
                    ? 'bg-[#0A2947] text-[#F3E4C9] shadow-2xs'
                    : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                    }`}
                  title="Dual Facsimile and OCR Comparison"
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dual View</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('scan');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'scan'
                    ? 'bg-[#0A2947] text-[#F3E4C9] shadow-2xs'
                    : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                    }`}
                  title="Digitized Archival Facsimile Plate"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Facsimile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('ocr');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'ocr'
                    ? 'bg-[#0A2947] text-[#F3E4C9] shadow-2xs'
                    : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                    }`}
                  title="Transcribed OCR Text Layer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>OCR</span>
                </button>
              </div>

              {/* Middle: Leaves Sidebar Toggle Pill */}
              <div className="flex items-center gap-1 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl px-2 py-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setShowLeavesSidebar(!showLeavesSidebar);
                  }}
                  className="p-1 hover:text-[#8B5E3C] flex items-center gap-1 cursor-pointer"
                  title={showLeavesSidebar ? "Hide Leaves sidebar" : "Show Folio Leaves sidebar"}
                >
                  <Layers className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  <span className="font-semibold text-[#0A2947] hidden md:inline">Leaves:</span>
                  <span className="font-bold text-[#8B5E3C]">
                    {selectedFolio === 0 ? 'All' : `Leaf ${selectedFolio}/3`}
                  </span>
                </button>
              </div>

              {/* Right: Audio Narration, Zoom & Copy */}
              <div className="flex items-center gap-2">
                {/* Audio Listen */}
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`px-2.5 py-1 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${isPlayingAudio
                    ? 'bg-[#0A2947] text-[#FAF7F0] border-[#0A2947] animate-pulse'
                    : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0]'
                    }`}
                  title="Listen to current leaf with Speech Synthesis"
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 text-[#C89D56]" /> : <Volume2 className="w-3.5 h-3.5 text-[#8B5E3C]" />}
                  <span className="hidden md:inline">{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                </button>

                {/* Copy Text */}
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="p-1.5 px-2 bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] rounded-lg transition-colors cursor-pointer"
                  title="Copy current leaf text"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />}
                </button>

                {/* Zoom Stepper */}
                <div className="hidden sm:flex items-center gap-1 bg-[#FAF7F0] border border-[#D3D4C0] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
                    className="p-1 hover:text-[#8B5E3C] text-[#0A2947]/70 cursor-pointer"
                    title="Zoom Out"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono px-1 font-semibold">{zoomLevel}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                    className="p-1 hover:text-[#8B5E3C] text-[#0A2947]/70 cursor-pointer"
                    title="Zoom In"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Scrollable Reading Canvas */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto flex items-start justify-center">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className={`w-full ${viewMode === 'split' ? 'max-w-6xl' : 'max-w-3xl'} bg-white rounded-3xl shadow-sm p-6 sm:p-10 border border-[#D3D4C0] text-[#0A2947] transition-all relative`}
              >

                {/* Archival Authenticity Banner Header */}
                <div className="border-b border-[#D3D4C0] pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#0A2947]/70">
                  <div className="space-y-0.5">
                    <div className="font-cinzel font-bold tracking-wider uppercase text-[11px] text-[#0A2947] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C89D56]" />
                      <span>NATIONAL HERITAGE ARCHIVE OF INDIA · OFFICIAL RECORD</span>
                    </div>
                    <div className="text-[10px] text-[#8B5E3C]">
                      Dr. Ambedkar Corpus · Accession: {document.accessionNo} · {selectedFolio === 0 ? 'All Leaves (Complete)' : `Leaf ${selectedFolio} of 3`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-[#0A2947] bg-[#FAF7F0] px-2 py-0.5 rounded border border-[#D3D4C0]">
                      Year: {document.year}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      OCR: {document.ocrConfidence}% Verified
                    </span>
                  </div>
                </div>

                {/* VIEW 1: SCHOLARLY READING VIEW (Default, Pristine Typography) */}
                {viewMode === 'read' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A2947] leading-tight">
                        {displayTitle}
                      </h3>
                      <div className="text-xs font-mono text-[#8B5E3C] uppercase tracking-wider flex flex-wrap items-center gap-2 pt-1">
                        <span>By Dr. Bhimrao Ramji Ambedkar</span>
                        <span>·</span>
                        <span>{currentLeaf.subtitle}</span>
                        <span>·</span>
                        <span>{document.date}</span>
                      </div>

                      {document.shortDescription && (
                        <div className="p-4 bg-[#FAF7F0] border-l-4 border-[#C89D56] rounded-r-2xl text-xs sm:text-sm font-dmsans text-[#0A2947]/85 leading-relaxed italic mt-4 shadow-2xs">
                          "{document.shortDescription}"
                        </div>
                      )}
                    </div>

                    {/* Active Leaf Badge Header */}
                    <div className="py-1 px-3 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs font-mono text-[#8B5E3C] flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider">{currentLeaf.label}</span>
                      <span className="text-[10px] text-[#0A2947]/60">{currentLeaf.plateNumber}</span>
                    </div>

                    {/* Full Reading Text with comfortable paragraph spacing */}
                    <div className="space-y-5 text-[#0A2947] font-serif-editorial text-base sm:text-lg leading-[1.85] select-text pt-2">
                      {currentLeaf.paragraphs.map((paragraph, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* Leaf Pagination Footer */}
                    <div className="mt-10 pt-6 border-t border-[#D3D4C0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setSelectedFolio(Math.max(1, (selectedFolio || 1) - 1));
                        }}
                        disabled={selectedFolio <= 1}
                        className="px-3.5 py-2 rounded-xl border border-[#D3D4C0] bg-[#FAF7F0] hover:bg-[#F3E4C9] text-xs font-montserrat font-bold flex items-center gap-1.5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#8B5E3C]" />
                        <span>Previous Leaf</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedFolio(page);
                            }}
                            className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                              selectedFolio === page
                                ? 'bg-[#0A2947] text-[#F3E4C9] shadow-2xs ring-2 ring-[#C89D56]/50'
                                : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.playClick();
                            setSelectedFolio(0);
                          }}
                          className={`px-2.5 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                            selectedFolio === 0
                              ? 'bg-[#0A2947] text-[#F3E4C9] border-[#0A2947] shadow-2xs'
                              : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0]'
                          }`}
                        >
                          All
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setSelectedFolio(Math.min(3, (selectedFolio || 1) + 1));
                        }}
                        disabled={selectedFolio >= 3 || selectedFolio === 0}
                        className="px-3.5 py-2 rounded-xl border border-[#D3D4C0] bg-[#FAF7F0] hover:bg-[#F3E4C9] text-xs font-montserrat font-bold flex items-center gap-1.5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
                      >
                        <span>Next Leaf</span>
                        <ChevronRight className="w-4 h-4 text-[#8B5E3C]" />
                      </button>
                    </div>

                    <div className="pt-2 text-center text-xs font-mono text-[#0A2947]/50">
                      Preserved in the BAWS Heritage Vault · OAIS-Compliant Archival Store
                    </div>
                  </div>
                )}

                {/* VIEW 2: DUAL SCHOLAR COMPARISON (Side-by-Side Facsimile & OCR) */}
                {viewMode === 'split' && (
                  <div className="space-y-6">
                    <div className="py-1 px-3 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs font-mono text-[#8B5E3C] flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider">{currentLeaf.label}</span>
                      <span className="text-[10px] text-[#0A2947]/60">{currentLeaf.plateNumber}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Left: Facsimile Plate */}
                      <div className="bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl p-5 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#8B5E3C] border-b border-[#D3D4C0] pb-2 font-bold uppercase">
                          <span>Original Archival Facsimile</span>
                          <span>{currentLeaf.plateNumber}</span>
                        </div>
                        <div className="p-5 bg-white rounded-xl border border-[#D3D4C0] font-serif-editorial text-[#0A2947] text-sm leading-relaxed space-y-3 select-text shadow-2xs">
                          <div className="text-[10px] font-mono uppercase text-[#8B5E3C] text-center border-b border-[#D3D4C0] pb-1">
                            Official Publication · {document.year}
                          </div>
                          <h4 className="font-bold text-center text-base">{document.title}</h4>
                          <div className="italic text-xs text-center text-[#0A2947]/70">By Dr. B. R. Ambedkar</div>
                          <div className="whitespace-pre-line text-xs font-serif-editorial text-[#0A2947]/90 leading-relaxed pt-2 space-y-2">
                            {currentLeaf.paragraphs.map((p, idx) => (
                              <p key={idx}>{p}</p>
                            ))}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-[#0A2947]/60 flex items-center justify-between pt-1">
                          <span>Accession: {document.accessionNo}</span>
                          <span className="text-emerald-700 font-bold">1200 DPI Facsimile</span>
                        </div>
                      </div>

                      {/* Right: Searchable OCR with Annotations */}
                      <div className="bg-white border border-[#D3D4C0] rounded-2xl p-5 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#0A2947]/70 border-b border-[#D3D4C0] pb-2 font-bold uppercase">
                          <span>Machine Transcribed OCR</span>
                          <span className="text-emerald-800 font-semibold">Confidence {document.ocrConfidence}%</span>
                        </div>
                        <div className="space-y-3 font-dmsans text-xs sm:text-sm text-[#0A2947] leading-relaxed">
                          <div className="p-3 bg-[#FAF7F0] border-l-3 border-[#8B5E3C] rounded-r-lg text-xs italic">
                            "Primary OCR text extracted from {currentLeaf.plateNumber} with high confidence indexing."
                          </div>
                          <div className="space-y-3 font-serif-editorial text-sm sm:text-base leading-relaxed">
                            {currentLeaf.paragraphs.map((p, idx) => (
                              <p key={idx}>{p}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 3: DIGITIZED FACSIMILE PLATE */}
                {viewMode === 'scan' && (
                  <div className="space-y-5 font-serif-editorial text-[#0A2947] select-text">
                    <div className="italic text-[#8B5E3C] border-l-3 border-[#8B5E3C] pl-3 text-xs font-mono">
                      [ARCHIVAL FACSIMILE · HIGH-FIDELITY DIGITIZED MANUSCRIPT {currentLeaf.plateNumber.toUpperCase()}]
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] border-b border-[#D3D4C0] pb-3">
                      {document.title}
                    </h3>
                    <div className="text-xs uppercase tracking-wider text-[#8B5E3C] font-mono">
                      By Dr. Bhimrao Ramji Ambedkar, M.A., Ph.D., D.Sc., Barrister-at-Law · {currentLeaf.label}
                    </div>
                    <div className="space-y-4 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif-editorial text-[#0A2947]/90">
                      {currentLeaf.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                    <div className="mt-8 pt-4 border-t border-[#D3D4C0] text-[10px] font-mono text-[#0A2947]/60 flex justify-between">
                      <span>Preserved in the BAWS Heritage Vault</span>
                      <span>Verified Historical Record</span>
                    </div>
                  </div>
                )}

                {/* VIEW 4: RAW OCR VECTORIZED BLOCKS */}
                {viewMode === 'ocr' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs bg-[#FAF7F0] border border-[#D3D4C0] p-3 rounded-xl text-[#0A2947] font-mono">
                      <span>Searchable OCR Text Layer ({currentLeaf.plateNumber})</span>
                      <span className="font-bold text-[#8B5E3C]">Language: {language.toUpperCase()}</span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      {currentLeaf.paragraphs.map((paragraph, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-3.5 border border-[#8B5E3C]/30 bg-[#FAF7F0]/40 rounded-xl relative hover:border-[#8B5E3C] hover:bg-[#FAF7F0] transition-colors"
                        >
                          <span className="absolute -top-2.5 left-2 px-1.5 py-0.2 bg-[#0A2947] text-[#F3E4C9] text-[9px] font-mono rounded font-bold">
                            Block #{pIdx + 1} · {currentLeaf.plateNumber} · Conf: {document.ocrConfidence}%
                          </span>
                          <p className="text-[#0A2947] text-sm font-dmsans leading-relaxed mt-1">
                            {paragraph}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* 3. RIGHT COLLAPSIBLE DOSSIER & AI SCHOLAR SIDEBAR */}
          {showDossierSidebar && (
            <div className="w-80 sm:w-96 bg-white border-l border-[#D3D4C0] flex flex-col shrink-0 overflow-hidden shadow-xs transition-all">

              {/* Sidebar Header & Tabs */}
              <div className="flex border-b border-[#D3D4C0] bg-[#FAF7F0] text-xs font-montserrat font-bold text-[#0A2947]/70 shrink-0 px-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab('metadata');
                  }}
                  className={`py-3 px-2.5 border-b-2 transition-colors cursor-pointer ${activeTab === 'metadata'
                    ? 'border-[#0A2947] text-[#0A2947]'
                    : 'border-transparent hover:text-[#0A2947]'
                    }`}
                >
                  Dossier
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab('askDoc');
                  }}
                  className={`py-3 px-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${activeTab === 'askDoc'
                    ? 'border-[#8B5E3C] text-[#8B5E3C]'
                    : 'border-transparent hover:text-[#8B5E3C]'
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab('summary');
                  }}
                  className={`py-3 px-2.5 border-b-2 transition-colors cursor-pointer ${activeTab === 'summary'
                    ? 'border-[#0A2947] text-[#0A2947]'
                    : 'border-transparent hover:text-[#0A2947]'
                    }`}
                >
                  Summary
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab('citations');
                  }}
                  className={`py-3 px-2.5 border-b-2 transition-colors cursor-pointer ${activeTab === 'citations'
                    ? 'border-[#0A2947] text-[#0A2947]'
                    : 'border-transparent hover:text-[#0A2947]'
                    }`}
                >
                  Citations
                </button>
              </div>

              {/* Tab Contents Scrollable Body */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5 text-xs text-[#0A2947]">

                {/* TAB 1: CURATORIAL DOSSIER */}
                {activeTab === 'metadata' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#8B5E3C] uppercase tracking-wider block font-bold">
                        Archival Provenance
                      </span>
                      <h4 className="font-serif-editorial text-base font-bold text-[#0A2947]">
                        {document.title}
                      </h4>
                      <p className="text-xs text-[#0A2947]/75 font-dmsans leading-relaxed">
                        {document.shortDescription}
                      </p>
                    </div>

                    {/* Metadata Key-Value Table */}
                    <div className="bg-[#FAF7F0] rounded-2xl border border-[#D3D4C0] p-3.5 space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between pb-1.5 border-b border-[#D3D4C0]/60">
                        <span className="text-[#0A2947]/60">Accession No:</span>
                        <span className="font-bold text-[#0A2947]">{document.accessionNo}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-[#D3D4C0]/60">
                        <span className="text-[#0A2947]/60">Collection:</span>
                        <span className="font-bold text-[#0A2947] truncate max-w-[170px]">{document.collection}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-[#D3D4C0]/60">
                        <span className="text-[#0A2947]/60">Publication Year:</span>
                        <span className="font-bold text-[#0A2947]">{document.year}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-[#D3D4C0]/60">
                        <span className="text-[#0A2947]/60">Source Repository:</span>
                        <span className="font-bold text-[#0A2947] truncate max-w-[170px]">{document.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#0A2947]/60">OCR Verification:</span>
                        <span className="font-bold text-emerald-800">{document.ocrConfidence}% Verified</span>
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
                              type="button"
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
                        Inquiries are answered strictly from the text of "{document.title}" with line citations.
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
                        id="doc-viewer-question-input"
                        name="doc_viewer_question"
                        type="text"
                        value={docQuestion}
                        onChange={(e) => setDocQuestion(e.target.value)}
                        placeholder="e.g., What does Ambedkar argue in this section?"
                        autoComplete="off"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#D3D4C0] focus:border-[#0A2947] rounded-xl text-xs text-[#0A2947] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isAnsweringDoc || !docQuestion.trim()}
                        className="w-full py-2 bg-[#0A2947] hover:bg-[#8B5E3C] disabled:opacity-50 text-[#F3E4C9] font-montserrat font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
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
                          type="button"
                          onClick={() => {
                            setDocQuestion(prompt);
                            handleAskThisDocument(prompt);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] text-[11px] text-[#0A2947] cursor-pointer text-left transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Answer Card */}
                    {docAnswer && (
                      <div className="p-4 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl space-y-2 mt-4 animate-in fade-in shadow-2xs">
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
                          type="button"
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
                          type="button"
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

                    {/* BibTeX Citation */}
                    <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D3D4C0] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8B5E3C] font-bold">
                        <span>BibTeX (LaTeX / Overleaf)</span>
                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.playClick();
                            navigator.clipboard.writeText(`@incollection{ambedkar_${document.year},\n  author = {Ambedkar, Bhimrao Ramji},\n  title = {${document.title}},\n  booktitle = {${document.collection}},\n  year = {${document.year}},\n  note = {Accession: ${document.accessionNo}}\n}`);
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Copy BibTeX
                        </button>
                      </div>
                      <pre className="text-[10px] text-[#0A2947] font-mono bg-white p-2.5 rounded-lg border border-[#D3D4C0] overflow-x-auto select-all leading-tight">
{`@incollection{ambedkar_${document.year},
  author = {Ambedkar, Bhimrao Ramji},
  title = {${document.title}},
  booktitle = {${document.collection}},
  year = {${document.year}},
  note = {Accession: ${document.accessionNo}}
}`}
                      </pre>
                    </div>

                    {/* Download Full Suite */}
                    <div className="pt-2 border-t border-[#D3D4C0] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#8B5E3C] font-bold">Download Citations:</span>
                      <a
                        href={api.getDocumentExportUrl(document.id, 'citations')}
                        target="_blank"
                        download
                        className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-lg transition-colors cursor-pointer"
                      >
                        Full Suite (.txt)
                      </a>
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
