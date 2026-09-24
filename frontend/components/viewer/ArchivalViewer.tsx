"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  Layers,
  ArrowLeft,
  BookOpen,
  Volume2,
  Languages,
  FileText,
  Sparkles,
  Eye,
  AlertTriangle,
  ExternalLink,
  List,
} from "lucide-react";
import { api } from "@/lib/api";
import { PreservationDrawer } from "./PreservationDrawer";
import { AskThisPageDrawer } from "./AskThisPageDrawer";
import { MultimodalPageAnalysis } from "@/lib/types";

interface ArchivalViewerProps {
  documentId: string;
  initialPage?: number;
  initialQuery?: string;
}

type ViewerTab = "ORIGINAL" | "OCR" | "TRANSLATION" | "AUDIO";

export function ArchivalViewer({
  documentId,
  initialPage = 1,
  initialQuery = "",
}: ArchivalViewerProps) {
  // State
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [documentMeta, setDocumentMeta] = useState<any>(null);
  const [pagesList, setPagesList] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [isPreservationOpen, setIsPreservationOpen] = useState<boolean>(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState<boolean>(false);
  const [isAskPageOpen, setIsAskPageOpen] = useState<boolean>(false);
  const [isMultimodalOpen, setIsMultimodalOpen] = useState<boolean>(false);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<any>(null);

  // Phase 9 Multilingual & Multimodal State
  const [activeTab, setActiveTab] = useState<ViewerTab>("ORIGINAL");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "mr" | "bn" | "gu" | "ta">("en");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [multimodalAnalysis, setMultimodalAnalysis] = useState<MultimodalPageAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);

  // Zoom & Pan state
  const [scale, setScale] = useState<number>(0.85);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load document metadata & pages
  useEffect(() => {
    let mounted = true;
    const fetchMeta = async () => {
      try {
        const doc = await api.getDocument(documentId);
        if (mounted && doc) {
          setDocumentMeta(doc);
          const pages = await api.getDocumentPages(doc.id);
          if (mounted && pages && pages.length > 0) {
            setPagesList(pages);
            setTotalPages(pages.length);
          } else if (doc.page_count) {
            setTotalPages(doc.page_count);
          }
        }
      } catch (err) {
        console.warn("Error fetching document metadata", err);
      }
    };
    fetchMeta();
    return () => {
      mounted = false;
    };
  }, [documentId]);

  // Load annotations for current page
  useEffect(() => {
    let mounted = true;
    const fetchAnnotations = async () => {
      try {
        const annoRes = await api.getIIIFAnnotations(documentId, currentPage);
        if (mounted && annoRes && annoRes.items) {
          setAnnotations(annoRes.items);
        }
      } catch (err) {
        console.warn("Error fetching annotations for page", currentPage, err);
        if (mounted) setAnnotations([]);
      }
    };
    fetchAnnotations();
    return () => {
      mounted = false;
    };
  }, [documentId, currentPage]);

  // Handle translation when tab is TRANSLATION or language changes (keeping page position!)
  useEffect(() => {
    if (activeTab !== "TRANSLATION") return;
    let mounted = true;
    const loadTranslation = async () => {
      setIsTranslating(true);
      try {
        const ocrText = annotations.map((a) => a.body?.value || "").join(" ");
        const textToTranslate =
          ocrText.trim() || `Dr. B.R. Ambedkar archival writings from ${documentId} page ${currentPage}.`;
        const res = await api.translate(textToTranslate, selectedLanguage, "en");
        if (mounted) {
          setTranslatedText(res.translated_text);
        }
      } catch (err) {
        console.error("Translation error:", err);
      } finally {
        if (mounted) setIsTranslating(false);
      }
    };
    loadTranslation();
    return () => {
      mounted = false;
    };
  }, [activeTab, selectedLanguage, currentPage, annotations, documentId]);

  // Handle TTS audio generation when tab is AUDIO
  useEffect(() => {
    if (activeTab !== "AUDIO") return;
    let mounted = true;
    const loadTTS = async () => {
      setIsSynthesizing(true);
      try {
        const ocrText = annotations.map((a) => a.body?.value || "").join(" ");
        const textToSpeak =
          ocrText.slice(0, 600) || `Reading page ${currentPage} of ${documentMeta?.title || documentId}.`;
        const res = await api.synthesizeSpeech(textToSpeak, selectedLanguage);
        if (mounted && res.audio_url) {
          setTtsAudioUrl(res.audio_url);
        }
      } catch (err) {
        console.error("TTS error:", err);
      } finally {
        if (mounted) setIsSynthesizing(false);
      }
    };
    loadTTS();
    return () => {
      mounted = false;
    };
  }, [activeTab, selectedLanguage, currentPage, annotations, documentMeta, documentId]);

  // Load multimodal page analysis
  const handleLoadMultimodalAnalysis = async () => {
    setIsMultimodalOpen(true);
    if (multimodalAnalysis && multimodalAnalysis.page_number === currentPage) return;
    setIsLoadingAnalysis(true);
    try {
      const res = await api.analyzePageFacsimile(documentId, currentPage);
      setMultimodalAnalysis(res);
    } catch (err) {
      console.error("Multimodal analysis failed:", err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Zoom Handlers
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.15, 3.5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.15, 0.4));
  const handleResetZoom = () => {
    setScale(0.85);
    setPosition({ x: 0, y: 0 });
  };

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 3.5));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Page Navigation (Preserves language and tab position!)
  const goToPage = (page: number) => {
    const valid = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(valid);
    setPosition({ x: 0, y: 0 });
  };

  // Matching annotations for search query
  const queryWords = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matchingAnnotations = annotations.filter((item) => {
    if (!queryWords.length) return false;
    const val = item.body?.value?.toLowerCase() || "";
    return queryWords.some((q) => val.includes(q));
  });

  const stableId = documentMeta?.stable_id || documentId;
  const currentTitle = documentMeta?.title || documentId.replace(/-/g, " ");
  const pageStableId = `${stableId}_p${String(currentPage).padStart(4, "0")}`;
  const fullOcrText = annotations.map((a) => a.body?.value || "").join(" ");

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col h-[calc(100vh-4rem)] w-full bg-slate-950 text-slate-100 overflow-hidden select-none"
    >
      {/* Top Archival Toolbar */}
      <header className="z-30 flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-xs gap-2">
        {/* Left: Document info & Back */}
        <div className="flex items-center gap-3">
          <Link
            href={`/documents/${documentId}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Details</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-slate-200 truncate max-w-[180px] md:max-w-xs">
                {currentTitle}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 font-mono text-[10px] text-amber-400">
                {pageStableId}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Multilingual Viewer Tabs (Section 14: ORIGINAL | OCR | TRANSLATION | AUDIO) */}
        <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
          {(["ORIGINAL", "OCR", "TRANSLATION", "AUDIO"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                activeTab === tab
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "ORIGINAL" && "Original"}
              {tab === "OCR" && "OCR Text"}
              {tab === "TRANSLATION" && "Translation"}
              {tab === "AUDIO" && "Audio"}
            </button>
          ))}
        </div>

        {/* Language Selector (Maintains Page Position!) */}
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
          <Languages className="w-3.5 h-3.5 text-blue-400" />
          {(["en", "hi", "mr", "bn", "gu", "ta"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
                selectedLanguage === lang
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Right: Signature Features & Triggers */}
        <div className="flex items-center gap-2">
          {/* Ask This Page Signature Button (Section 12) */}
          <button
            onClick={() => setIsAskPageOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-blue-900/30 transition-all ring-1 ring-blue-400/30"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-200 animate-pulse" />
            <span>Ask This Page</span>
          </button>

          {/* Multimodal Structure Inspector (Section 11) */}
          <button
            onClick={handleLoadMultimodalAnalysis}
            title="Inspect Multimodal Visual Structure & OCR Conflicts"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-mono text-[11px] transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden xl:inline">Vision AI</span>
          </button>

          {/* Preservation & PREMIS */}
          <button
            onClick={() => setIsPreservationOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preservation</span>
          </button>
        </div>
      </header>

      {/* Main Content Area Based on Active Tab */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Thumbnails Drawer */}
        {isThumbnailsOpen && (
          <aside className="w-56 bg-slate-900/90 border-r border-slate-800 overflow-y-auto p-3 space-y-1.5 z-20">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <span>Pages ({totalPages})</span>
              <button
                onClick={() => setIsThumbnailsOpen(false)}
                className="hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              const isSelected = pNum === currentPage;
              return (
                <button
                  key={pNum}
                  onClick={() => goToPage(pNum)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-mono transition-colors ${
                    isSelected
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <span>Page {pNum}</span>
                  <span className="text-[10px] text-slate-600">p{pNum}</span>
                </button>
              );
            })}
          </aside>
        )}

        {/* TAB 1: ORIGINAL (High-Res Facsimile Canvas) */}
        {activeTab === "ORIGINAL" && (
          <div
            className={`relative flex-1 flex items-center justify-center bg-slate-950 overflow-hidden cursor-${
              isDragging ? "grabbing" : "grab"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
          >
            <div
              ref={canvasRef}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.05s ease-out",
              }}
              className="relative shadow-2xl rounded-sm"
            >
              <div className="relative w-[1800px] h-[2700px] bg-[#fdfbf7] border border-[#d1c7b7] shadow-2xl">
                <img
                  src={`http://localhost:8000/api/v1/iiif/image/${documentId}/${currentPage}/page.svg`}
                  alt={`Page ${currentPage}`}
                  className="w-full h-full pointer-events-none select-none"
                />

                {showAnnotations && (
                  <div className="absolute inset-0 pointer-events-auto">
                    {annotations.map((anno, idx) => {
                      const match = anno.target?.match(/#xywh=(\d+),(\d+),(\d+),(\d+)/);
                      if (!match) return null;
                      const [, x, y, w, h] = match.map(Number);
                      const word = anno.body?.value || "";
                      const isMatched =
                        queryWords.length > 0 &&
                        queryWords.some((q) => word.toLowerCase().includes(q));

                      return (
                        <div
                          key={anno.id || idx}
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            width: `${w}px`,
                            height: `${h}px`,
                          }}
                          onMouseEnter={() =>
                            setHoveredAnnotation({
                              word,
                              confidence: anno.body?.confidence,
                              x,
                              y,
                              w,
                              h,
                            })
                          }
                          onMouseLeave={() => setHoveredAnnotation(null)}
                          className={`absolute cursor-pointer transition-all ${
                            isMatched
                              ? "bg-amber-400/40 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse z-10"
                              : "hover:bg-sky-500/20 hover:border hover:border-sky-400/60"
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {hoveredAnnotation && (
              <div className="absolute top-4 left-4 z-40 px-3 py-2 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-mono shadow-xl pointer-events-none space-y-1">
                <div className="text-amber-400 font-bold">"{hoveredAnnotation.word}"</div>
                <div className="text-[10px] text-slate-400">
                  Coords: [{hoveredAnnotation.x}, {hoveredAnnotation.y}, {hoveredAnnotation.w},{" "}
                  {hoveredAnnotation.h}]
                </div>
                <div className="text-[10px] text-emerald-400">
                  OCR Confidence: {(hoveredAnnotation.confidence * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OCR TEXT (Verbatim Archival Text Blocks) */}
        {activeTab === "OCR" && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold font-serif text-white">
                  Verbatim Archival OCR (Page {currentPage})
                </h2>
                <p className="text-xs text-slate-400">
                  Authoritative archival text extracted via PaddleOCR PP-OCRv5
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-amber-300">
                {annotations.length} Tokens
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 font-serif text-base leading-relaxed text-slate-200 whitespace-pre-wrap selection:bg-amber-500/30">
              {fullOcrText || "No OCR text blocks found for this folio."}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSLATION (Section 1 & 2: Derivative Representation) */}
        {activeTab === "TRANSLATION" && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-4">
            {/* Derivative Provenance Warning Banner */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2">
              <span className="text-base">📜</span>
              <div>
                <span className="font-semibold">Derivative Translation Layer:</span> Original archival
                English text remains authoritative. This translation is generated via Qwen 27B / IndicTrans2
                architecture for accessibility.
              </div>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold font-serif text-white">
                {selectedLanguage === "hi"
                  ? `हिंदी अनुवाद (पृष्ठ ${currentPage})`
                  : selectedLanguage === "mr"
                  ? `मराठी भाषांतर (पान ${currentPage})`
                  : selectedLanguage === "bn"
                  ? `বাংলা অনুবাদ (পৃষ্ঠা ${currentPage})`
                  : selectedLanguage === "gu"
                  ? `ગુજરાતી અનુવાદ (પાનું ${currentPage})`
                  : selectedLanguage === "ta"
                  ? `தமிழ் மொழிபெயர்ப்பு (பக்கம் ${currentPage})`
                  : `English Translation (Page ${currentPage})`}
              </h2>
              <span className="px-2.5 py-1 rounded bg-blue-950 border border-blue-800 font-mono text-xs text-blue-300 uppercase">
                Target: {selectedLanguage}
              </span>
            </div>

            {isTranslating ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Translating archival page into Indic language...</p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 font-serif text-base leading-relaxed text-slate-200 whitespace-pre-wrap selection:bg-blue-500/30">
                {translatedText || "Translation ready for active page."}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AUDIO NARRATION (Section 7: Neural Speech Narration) */}
        {activeTab === "AUDIO" && (
          <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-4xl shadow-xl">
              🔊
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-950 text-blue-300 font-mono text-xs border border-blue-800 mb-2">
                AI_NARRATION (Neural Indic TTS)
              </div>
              <h2 className="text-xl font-bold font-serif text-white">
                Listen to Page {currentPage}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Synthesized neural speech narration preserving Dr. B.R. Ambedkar's exact words.
                Distinct from archival original recordings.
              </p>
            </div>

            {isSynthesizing ? (
              <div className="space-y-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Synthesizing neural speech in {selectedLanguage.toUpperCase()}...</p>
              </div>
            ) : ttsAudioUrl ? (
              <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <audio controls autoPlay src={ttsAudioUrl} className="w-full" />
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Voice: {
                    selectedLanguage === "mr" ? "Aarohi (Marathi)" :
                    selectedLanguage === "hi" ? "Swara (Hindi)" :
                    selectedLanguage === "bn" ? "Tanushree (Bengali)" :
                    selectedLanguage === "gu" ? "Nirav (Gujarati)" :
                    selectedLanguage === "ta" ? "Valluvar (Tamil)" :
                    "Neerja (Indian English)"
                  }</span>
                  <span>Format: MP3 48kHz</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("AUDIO")}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-900/30"
              >
                Synthesize Audio
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <footer className="z-30 flex items-center justify-between px-4 py-2 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 text-xs">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsThumbnailsOpen(!isThumbnailsOpen)}
            title="Toggle Page Drawer"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="w-12 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-center font-mono text-amber-400 outline-none"
            />
            <span className="text-slate-400">of {totalPages}</span>
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Center: Page Slider Scrubber */}
        <div className="hidden sm:flex items-center gap-3 max-w-xs w-full mx-4">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Right: Zoom controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="font-mono text-[11px] text-slate-400 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </footer>

      {/* Multimodal Structure & OCR Conflict Modal (Section 11) */}
      {isMultimodalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-purple-900/60 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">👁️</span>
                <div>
                  <h3 className="font-semibold text-sm text-white">
                    Multimodal Page Understanding (Page {currentPage})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Qwen3-VL Vision Reasoning vs PaddleOCR Coordinate Layer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMultimodalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {isLoadingAnalysis ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Analyzing visual folio structure...</p>
              </div>
            ) : multimodalAnalysis ? (
              <div className="my-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Layout Type</span>
                    <span className="font-mono text-purple-300 font-semibold uppercase">
                      {multimodalAnalysis.layout_type}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Visual Condition</span>
                    <span className="font-mono text-emerald-300 font-semibold">
                      {multimodalAnalysis.visual_structure.visual_condition}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-300">Folio Elements:</span>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Columns: {multimodalAnalysis.visual_structure.column_count}
                    </span>
                    {multimodalAnalysis.visual_structure.has_footnotes && (
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300">Footnotes Present</span>
                    )}
                    {multimodalAnalysis.visual_structure.has_signatures && (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300">Signatures Present</span>
                    )}
                  </div>
                </div>

                {/* Section 11: OCR Conflict Warning if any */}
                {multimodalAnalysis.has_ocr_conflict ? (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>OCR Conflict Detected:</span>
                    </div>
                    {multimodalAnalysis.ocr_conflicts.map((c, i) => (
                      <div key={i} className="text-[11px] space-y-1 pl-5">
                        <div>OCR reading: <code className="bg-black/30 px-1 py-0.5 rounded text-red-300">{c.ocr_reading}</code></div>
                        <div>Vision reading: <code className="bg-black/30 px-1 py-0.5 rounded text-emerald-300">{c.visual_reading}</code></div>
                        <div className="text-slate-400 italic">{c.explanation}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
                    <span>✓</span>
                    <span>No conflict detected: OCR text matches visual layout perfectly.</span>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsMultimodalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Ask This Page Drawer (Section 12 & 13) */}
      <AskThisPageDrawer
        isOpen={isAskPageOpen}
        onClose={() => setIsAskPageOpen(false)}
        objectId={documentId}
        pageNumber={currentPage}
        documentTitle={currentTitle}
        onAudioPlay={(url) => {
          setTtsAudioUrl(url);
          setActiveTab("AUDIO");
        }}
      />

      {/* Preservation & PREMIS Drawer */}
      <PreservationDrawer
        isOpen={isPreservationOpen}
        onClose={() => setIsPreservationOpen(false)}
        documentId={documentId}
        stableId={stableId}
        title={currentTitle}
        currentPage={currentPage}
      />
    </div>
  );
}
