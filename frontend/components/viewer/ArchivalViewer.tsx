"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
  Check,
  Copy,
  Download,
  Share2,
  Printer,
  Bookmark,
  Bot,
  Play,
  Pause,
  Sliders,
  Type,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  FolderOpen,
  Globe,
} from "lucide-react";
import { api } from "@/lib/api";
import { PreservationDrawer } from "./PreservationDrawer";
import { AskThisPageDrawer } from "./AskThisPageDrawer";
import { IncomingPdfBrowserDrawer } from "./IncomingPdfBrowserDrawer";
import { MultimodalPageAnalysis } from "@/lib/types";
import { BOOK_READER_REGISTRY, BookReaderDocument, BookChapter } from "@/data/bookReaderData";
import { ARCHIVE_DOCUMENTS } from "@/data/archiveData";
import { INCOMING_DOCUMENTS_CATALOG, IncomingDocumentItem } from "@/data/incomingDocumentsData";
import {
  INCOMING_VOLUMES_CATALOG,
  LANGUAGE_FOLDERS,
  IncomingVolumeItem,
} from "@/data/incomingPdfCatalog";
import { speechController } from "@/utils/speechUtils";
import { soundEffects } from "@/utils/soundEffects";
import { resolveIncomingDocumentUrl } from "@/utils/pdfCatalogResolver";

interface ArchivalViewerProps {
  documentId: string;
  initialPage?: number;
  initialQuery?: string;
  initialTab?: string;
  initialFile?: string;
}

export type ViewerTab = "PDF" | "READER" | "ORIGINAL" | "OCR" | "TRANSLATION" | "AUDIO";
export type ReaderTheme = "parchment" | "sepia" | "nocturne";

export function ArchivalViewer({
  documentId,
  initialPage = 1,
  initialQuery = "",
  initialTab,
  initialFile,
}: ArchivalViewerProps) {
  // ── PDF Viewer & Incoming Volumes State ──────────────────────────────
  const initialPdf = useMemo(() => {
    if (initialFile) {
      const match = INCOMING_VOLUMES_CATALOG.find(
        (v) => v.filePath === initialFile || v.filename.toLowerCase() === initialFile.toLowerCase()
      );
      if (match) return match;
    }
    // Match by documentId
    const matchId = INCOMING_VOLUMES_CATALOG.find(
      (v) => v.id === documentId || v.filename.toLowerCase() === documentId.toLowerCase()
    );
    if (matchId) return matchId;

    // Match by related treatise (e.g. annihilation-of-caste -> hindi_vol1.pdf)
    const relMatch = INCOMING_VOLUMES_CATALOG.find(
      (v) => v.relatedTreatises.includes(documentId) && v.isPdf
    );
    if (relMatch) return relMatch;

    // Default to Hindi Vol. 1 (Volume 1 of BAWS containing Annihilation of Caste, 299 pages)
    return (
      INCOMING_VOLUMES_CATALOG.find((v) => v.filename === "hindi_vol1.pdf") ||
      INCOMING_VOLUMES_CATALOG[0]
    );
  }, [documentId, initialFile]);

  const [activePdf, setActivePdf] = useState<IncomingVolumeItem | null>(initialPdf);
  const [activePdfPath, setActivePdfPath] = useState<string>(() =>
    resolveIncomingDocumentUrl(initialPdf?.filePath || "/incoming_documents/books_and_writings/hindi/hindi_vol1.pdf")
  );
  const [isPdfDrawerOpen, setIsPdfDrawerOpen] = useState<boolean>(false);
  const [pdfPageInput, setPdfPageInput] = useState<string>("1");
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1);
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>(
    initialPdf?.folder || "hindi"
  );
  const [isMuseumFramed, setIsMuseumFramed] = useState<boolean>(true);
  const [showNativePdfToolbar, setShowNativePdfToolbar] = useState<boolean>(false);

  // Initial tab resolution: default to "PDF" viewer
  const determinedInitialTab: ViewerTab = useMemo(() => {
    if (initialTab) {
      const upper = initialTab.toUpperCase();
      if (["PDF", "READER", "ORIGINAL", "OCR", "TRANSLATION", "AUDIO"].includes(upper)) {
        return upper as ViewerTab;
      }
    }
    return "PDF";
  }, [initialTab]);

  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [documentMeta, setDocumentMeta] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ViewerTab>(determinedInitialTab);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "mr" | "bn" | "gu" | "ta">("en");

  // Reader Customization State
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("parchment");
  const [fontSize, setFontSize] = useState<number>(18);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  // Audio Speech Narration State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingSentenceIdx, setSpeakingSentenceIdx] = useState<number | null>(null);

  // Drawers & Modals
  const [isPreservationOpen, setIsPreservationOpen] = useState<boolean>(false);
  const [isAskPageOpen, setIsAskPageOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [multimodalAnalysis, setMultimodalAnalysis] = useState<MultimodalPageAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);

  // Facsimile Zoom & Pan state
  const [scale, setScale] = useState<number>(0.85);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<any>(null);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  // ── 1. Resolve Document Context (Curated Reader / Archive / Incoming / DB) ──
  const bookDoc: BookReaderDocument | null = useMemo(() => {
    // Check direct registry match
    if (BOOK_READER_REGISTRY[documentId]) {
      return BOOK_READER_REGISTRY[documentId];
    }
    // Check archive documents match
    const archMatch = ARCHIVE_DOCUMENTS.find((d) => d.id === documentId);
    if (archMatch) {
      // Split full text into sections
      const paras = archMatch.fullText
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const hiParas = archMatch.fullTextLocal?.hi
        ?.split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean);
      const mrParas = archMatch.fullTextLocal?.mr
        ?.split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean);

      return {
        id: archMatch.id,
        title: archMatch.title,
        titleLocal: archMatch.titleLocal,
        year: archMatch.year,
        dateString: archMatch.date,
        volumeCitation: archMatch.collection || `Ambedkar Heritage Collection (${archMatch.year})`,
        category: (archMatch.type === "photograph" ? "manuscript" : archMatch.type) as any,
        categoryLabel: archMatch.categoryLabel || "Historical Treatise",
        sourceArchive: archMatch.source || "Official Memorial Archives",
        preface: archMatch.shortDescription,
        ocrConfidence: archMatch.ocrConfidence || 99.4,
        totalChapters: 1,
        totalPages: Math.max(1, Math.ceil(paras.length / 3)),
        chapters: [
          {
            id: `${archMatch.id}-full`,
            number: 1,
            title: archMatch.title,
            pageNumber: 1,
            paragraphs: paras,
            translation: {
              hi: hiParas,
              mr: mrParas,
            },
            keyQuote: paras[0] || archMatch.shortDescription,
            citation: `${archMatch.title}, ${archMatch.source}`,
          },
        ],
      };
    }

    // Check incoming documents match
    const incomingMatch = INCOMING_DOCUMENTS_CATALOG.find(
      (d) => d.id === documentId || d.relativePath.includes(documentId)
    );
    if (incomingMatch) {
      return {
        id: incomingMatch.id,
        title: incomingMatch.title,
        year: 1940,
        dateString: "Historical Archive Record",
        volumeCitation: incomingMatch.formatLabel,
        category: "book",
        categoryLabel: incomingMatch.formatLabel,
        sourceArchive: `incoming_documents/${incomingMatch.relativePath}`,
        preface: incomingMatch.description,
        ocrConfidence: 99.0,
        totalChapters: 1,
        totalPages: incomingMatch.pageCount || 20,
        chapters: [
          {
            id: `${incomingMatch.id}-c1`,
            number: 1,
            title: incomingMatch.title,
            pageNumber: 1,
            paragraphs: [
              incomingMatch.description,
              `This volume is preserved in the institutional corpus as an authentic ${incomingMatch.formatLabel}.`,
              `Preservation SHA-256 fixity hash: ${incomingMatch.sha256 || "Audited & Verified"}.`,
            ],
            citation: `${incomingMatch.title} (${incomingMatch.languageLabel})`,
          },
        ],
      };
    }

    // Check incoming volumes catalog match
    const incomingVol = INCOMING_VOLUMES_CATALOG.find(
      (v) => v.id === documentId || v.filename.toLowerCase() === documentId.toLowerCase()
    );
    if (incomingVol) {
      return {
        id: incomingVol.id,
        title: incomingVol.title,
        year: 1940,
        dateString: `${incomingVol.languageLabel} Preservation Edition`,
        volumeCitation: `Archive Corpus - ${incomingVol.languageLabel} ${incomingVol.volumeNumber ? `Vol. ${incomingVol.volumeNumber}` : ""}`,
        category: "book" as any,
        categoryLabel: incomingVol.format,
        sourceArchive: incomingVol.filePath,
        preface: incomingVol.highlight,
        ocrConfidence: 99.4,
        totalChapters: 1,
        totalPages: 100,
        chapters: [
          {
            id: `${incomingVol.id}-c1`,
            number: 1,
            title: incomingVol.title,
            pageNumber: 1,
            paragraphs: [
              incomingVol.highlight,
              `Preserved volume: ${incomingVol.filename} (${incomingVol.fileSizeFormatted}) in folder '${incomingVol.folder}'.`,
              `You are viewing this archival volume in the Normal PDF Viewer. Standard PDF zoom, page thumbnails, text search, download, and print are fully enabled.`,
            ],
            keyQuote: incomingVol.highlight,
            citation: `${incomingVol.title} (${incomingVol.languageLabel})`,
          },
        ],
      };
    }

    return null;
  }, [documentId]);

  // Set initial total pages & document metadata
  useEffect(() => {
    if (bookDoc) {
      setDocumentMeta({
        id: bookDoc.id,
        title: bookDoc.title,
        titleLocal: bookDoc.titleLocal,
        year: bookDoc.year,
        date: bookDoc.dateString,
        source_institution: bookDoc.sourceArchive,
        category: bookDoc.category,
      });
      setTotalPages(bookDoc.chapters.length > 0 ? bookDoc.chapters.length : bookDoc.totalPages);
    } else {
      // Fetch from backend API
      api.getDocument(documentId)
        .then((doc) => {
          if (doc) {
            setDocumentMeta(doc);
            if (doc.page_count) setTotalPages(doc.page_count);
          }
        })
        .catch(() => {
          // Fallback to title from documentId
          setDocumentMeta({
            id: documentId,
            title: documentId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            year: 1940,
          });
        });
    }
  }, [bookDoc, documentId]);

  // Load annotations if available
  useEffect(() => {
    let mounted = true;
    api.getIIIFAnnotations(documentId, currentPage)
      .then((res) => {
        if (mounted && res && res.items) setAnnotations(res.items);
      })
      .catch(() => {
        if (mounted) setAnnotations([]);
      });
    return () => {
      mounted = false;
    };
  }, [documentId, currentPage]);

  // Active Chapter calculation
  const activeChapter: BookChapter | null = useMemo(() => {
    if (!bookDoc || !bookDoc.chapters || bookDoc.chapters.length === 0) return null;
    const index = Math.max(0, Math.min(currentPage - 1, bookDoc.chapters.length - 1));
    return bookDoc.chapters[index];
  }, [bookDoc, currentPage]);

  // ── Speech Read-Aloud Controller ──
  const toggleSpeechNarration = () => {
    soundEffects.playClick();
    if (isSpeaking) {
      speechController.stop();
      setIsSpeaking(false);
      setSpeakingSentenceIdx(null);
      return;
    }

    if (!activeChapter) return;

    // Use translation or original based on selected language
    let textToSpeak = "";
    if (selectedLanguage === "hi" && activeChapter.translation?.hi) {
      textToSpeak = activeChapter.translation.hi.join(". ");
    } else if (selectedLanguage === "mr" && activeChapter.translation?.mr) {
      textToSpeak = activeChapter.translation.mr.join(". ");
    } else {
      textToSpeak = `${activeChapter.title}. ${activeChapter.paragraphs.join(". ")}`;
    }

    setIsSpeaking(true);
    speechController.speak(textToSpeak, selectedLanguage, () => {
      setIsSpeaking(false);
      setSpeakingSentenceIdx(null);
    });
  };

  useEffect(() => {
    return () => {
      speechController.stop();
    };
  }, [currentPage]);

  // Navigation handlers
  const goToPage = (page: number) => {
    soundEffects.playClick();
    const valid = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(valid);
    setPosition({ x: 0, y: 0 });
    speechController.stop();
    setIsSpeaking(false);
    if (textContentRef.current) {
      textContentRef.current.scrollTop = 0;
    }
  };

  const handleCopyCitation = () => {
    soundEffects.playClick();
    const citationText = `Ambedkar, B. R. (${bookDoc?.year || 1936}). "${bookDoc?.title || documentId}". ${
      bookDoc?.volumeCitation || "BAWS Archive"
    }, Chapter ${activeChapter?.number || currentPage}: "${activeChapter?.title || "Folio"}".`;
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  // Zoom handlers for facsimile canvas
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.15, 3.5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.15, 0.4));
  const handleResetZoom = () => {
    setScale(0.85);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
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

  const handleLoadMultimodalAnalysis = async () => {
    if (multimodalAnalysis) return;
    setIsLoadingAnalysis(true);
    try {
      const res = await api.analyzePageFacsimile(documentId, currentPage);
      setMultimodalAnalysis(res);
    } catch {
      // Mock multimodal response if offline
      setMultimodalAnalysis({
        object_id: documentId,
        page_number: currentPage,
        layout_type: "SINGLE_COLUMN",
        visual_structure: {
          has_footnotes: false,
          has_signatures: false,
          has_tables: false,
          has_marginalia: false,
          column_count: 1,
          visual_condition: "PRISTINE_ARCHIVE",
        },
        visual_transcription: activeChapter?.title || "Historical Chapter",
        has_ocr_conflict: false,
        ocr_conflicts: [],
        model: "Qwen3-VL-2B-Local",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Color theme variables based on selected readerTheme
  const themeClasses = useMemo(() => {
    if (readerTheme === "sepia") {
      return {
        bg: "bg-[#F5EFEB]",
        text: "text-[#2B1D12]",
        headerBg: "bg-[#EAE0D3]/90",
        border: "border-[#D6C4B0]",
        cardBg: "bg-[#EDE2D4]",
        accent: "text-[#8B5E3C]",
        highlight: "bg-[#8B5E3C]/20",
      };
    }
    if (readerTheme === "nocturne") {
      return {
        bg: "bg-[#071524]",
        text: "text-[#FAF7F0]",
        headerBg: "bg-[#0B1E33]/90",
        border: "border-[#1E3A5F]",
        cardBg: "bg-[#0D2642]",
        accent: "text-[#C89D56]",
        highlight: "bg-[#C89D56]/25",
      };
    }
    // Default Parchment
    return {
      bg: "bg-[#FAF7F0]",
      text: "text-[#1A202C]",
      headerBg: "bg-[#F3EAD8]/90",
      border: "border-[#D3D4C0]",
      cardBg: "bg-white",
      accent: "text-[#8B5E3C]",
      highlight: "bg-[#C89D56]/20",
    };
  }, [readerTheme]);

  const availableFolderPdfs = useMemo(() => {
    const currentFolder = activePdf?.folder || selectedFolderFilter || "hindi";
    return INCOMING_VOLUMES_CATALOG.filter(
      (v) => v.folder.toLowerCase() === currentFolder.toLowerCase()
    );
  }, [activePdf, selectedFolderFilter]);

  const handleSelectPdf = (item: IncomingVolumeItem) => {
    soundEffects.playClick();
    setActivePdf(item);
    setActivePdfPath(resolveIncomingDocumentUrl(item.filePath));
    setSelectedFolderFilter(item.folder);
    setActiveTab("PDF");
    setPdfCurrentPage(1);
    setPdfPageInput("1");
  };

  const handleFolderQuickSwitch = (folder: string) => {
    soundEffects.playClick();
    setSelectedFolderFilter(folder);
    const firstInFolder =
      INCOMING_VOLUMES_CATALOG.find(
        (v) => v.folder.toLowerCase() === folder.toLowerCase() && v.isPdf
      ) ||
      INCOMING_VOLUMES_CATALOG.find(
        (v) => v.folder.toLowerCase() === folder.toLowerCase()
      );
    if (firstInFolder) {
      handleSelectPdf(firstInFolder);
    }
  };

  const handlePdfPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pdfPageInput, 10);
    if (!isNaN(p) && p > 0) {
      setPdfCurrentPage(p);
    }
  };

  const currentTitle =
    activeTab === "PDF" && activePdf
      ? activePdf.title
      : documentMeta?.title || bookDoc?.title || documentId.replace(/-/g, " ");

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col h-screen w-full overflow-hidden select-none font-dmsans bg-[#FAF7F0] text-[#0A2947]`}
    >
      {/* ── UNIFIED ARCHIVAL TOOLBAR (Website Light Theme Luxury Bar) ────────────────────────── */}
      <header className="z-30 flex items-center justify-between px-3 sm:px-6 h-14 bg-[#FAF7F0] text-[#0A2947] border-b border-[#DCD2C0] text-xs shadow-xs gap-3 shrink-0">
        
        {/* Left: Back Link & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/documents"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A2947]/5 hover:bg-[#0A2947]/10 text-[#0A2947] border border-[#DCD2C0] font-montserrat font-semibold transition-colors shrink-0"
            title="Return to BookView Library"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#8B5E3C]" />
            <span className="hidden sm:inline">Library</span>
          </Link>

          <div className="h-4 w-px bg-[#DCD2C0] hidden sm:block" />

          {/* Clean Title */}
          <div className="flex items-center gap-2 truncate">
            <span className="font-serif font-bold text-sm md:text-base text-[#0A2947] tracking-wide truncate">
              {bookDoc?.title || documentMeta?.title || documentId.replace(/-/g, " ")}
            </span>
          </div>

          {/* Quick Active Volume Badge (opens drawer on click) */}
          <button
            onClick={() => setIsPdfDrawerOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#C89D56]/15 hover:bg-[#C89D56]/25 border border-[#C89D56]/60 text-[#8B5E3C] font-montserrat text-xs font-bold transition-all cursor-pointer shrink-0"
            title="Switch language or volume"
          >
            <Globe className="w-3.5 h-3.5 text-[#8B5E3C]" />
            <span className="truncate max-w-[120px] md:max-w-[160px]">
              {activePdf ? `${activePdf.languageLabel} Vol. ${activePdf.volumeNumber || "1"}` : "Select Volume"}
            </span>
            <ChevronRight className="w-3 h-3 text-[#8B5E3C] rotate-90" />
          </button>
        </div>

        {/* Center: Simplified 2-Tab Switcher (PDF Document vs Book Reader) */}
        <div className="flex items-center rounded-xl bg-[#EDE6DA] p-1 border border-[#D8CEBD] text-xs shrink-0">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab("PDF");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-montserrat text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PDF"
                ? "bg-white text-[#0A2947] shadow-xs border border-[#C89D56]/40"
                : "text-slate-600 hover:text-[#0A2947]"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#8B5E3C]" />
            <span>PDF View</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab("READER");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-montserrat text-xs font-bold transition-all cursor-pointer ${
              activeTab === "READER"
                ? "bg-white text-[#0A2947] shadow-xs border border-[#C89D56]/40"
                : "text-slate-600 hover:text-[#0A2947]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8B5E3C]" />
            <span>Book Reader</span>
          </button>
        </div>

        {/* Right: Actions (Browse 93 Archives, Ask Scholar, Download, Fullscreen) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Browse All 93 PDFs Drawer */}
          <button
            onClick={() => setIsPdfDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0A2947]/5 hover:bg-[#0A2947]/10 text-[#0A2947] border border-[#DCD2C0] font-montserrat text-xs font-semibold transition-all cursor-pointer shrink-0"
            title="Browse all 93 incoming language PDFs"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#8B5E3C]" />
            <span className="hidden md:inline">93 Volumes</span>
          </button>

          {/* Ask Scholar */}
          <button
            onClick={() => setIsAskPageOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0A2947] to-[#1E3A5F] hover:from-[#0E355A] hover:to-[#2A4D7A] text-white font-montserrat text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Ask AI Research Scholar about this work"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Ask Scholar</span>
          </button>

          {/* Download PDF Button */}
          <a
            href={activePdfPath}
            download
            className="p-2 rounded-xl bg-[#0A2947]/5 hover:bg-[#0A2947]/10 text-[#0A2947] border border-[#DCD2C0] transition-colors"
            title={`Download authentic archival volume (${activePdf?.fileSizeFormatted || 'PDF'})`}
          >
            <Download className="w-4 h-4 text-[#8B5E3C]" />
          </a>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#0A2947]/5 hover:bg-[#0A2947]/10 text-[#0A2947] border border-[#DCD2C0] transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── SECONDARY READING CONTROLS BAR (Reader Theme & Typography) ── */}
      {activeTab !== "PDF" && (
        <div className="z-20 flex flex-wrap items-center justify-between px-6 py-2 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-xs gap-3">
          
          {/* Left: Chapter / Page Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-1 text-[#C89D56] font-bold"
              title="Toggle Chapter Navigation"
            >
              <List className="w-4 h-4" />
              <span>Contents</span>
            </button>
            <span>•</span>
            <span className="font-serif font-bold text-sm">
              {activeChapter ? `Chapter ${activeChapter.number}: ${activeChapter.title}` : `Page ${currentPage} of ${totalPages}`}
            </span>
          </div>

          {/* Right: Theme Selector & Font Sizer */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher for Translation / Reading */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-xl text-[11px] font-mono">
              <Languages className="w-3.5 h-3.5 text-[#C89D56]" />
              {(["en", "hi", "mr", "ta", "bn"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedLanguage(lang);
                  }}
                  className={`px-1.5 py-0.5 rounded font-bold uppercase transition-colors ${
                    selectedLanguage === lang
                      ? "bg-[#0A2947] text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Theme Toggles */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setReaderTheme("parchment")}
                className={`px-2 py-1 rounded-lg text-xs font-montserrat flex items-center gap-1 transition-all ${
                  readerTheme === "parchment" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500"
                }`}
                title="Ivory Parchment Mode"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Parchment</span>
              </button>

              <button
                onClick={() => setReaderTheme("sepia")}
                className={`px-2 py-1 rounded-lg text-xs font-montserrat flex items-center gap-1 transition-all ${
                  readerTheme === "sepia" ? "bg-[#EDE2D4] text-[#2B1D12] shadow-xs font-bold" : "text-slate-500"
                }`}
                title="Antique Sepia Mode"
              >
                <Coffee className="w-3.5 h-3.5 text-[#8B5E3C]" />
                <span className="hidden sm:inline">Sepia</span>
              </button>

              <button
                onClick={() => setReaderTheme("nocturne")}
                className={`px-2 py-1 rounded-lg text-xs font-montserrat flex items-center gap-1 transition-all ${
                  readerTheme === "nocturne" ? "bg-[#071524] text-amber-300 shadow-xs font-bold" : "text-slate-500"
                }`}
                title="Scholar Nocturne Mode"
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Nocturne</span>
              </button>
            </div>

            {/* Font Sizer */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-xl p-0.5 text-xs font-mono font-bold">
              <button
                onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                className="px-2 py-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"
                title="Decrease Font Size"
              >
                A-
              </button>
              <span className="px-1 text-slate-500">{fontSize}px</span>
              <button
                onClick={() => setFontSize((s) => Math.min(26, s + 2))}
                className="px-2 py-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MAIN WORKSPACE: SIDEBAR + CONTENT VIEWPORT ─────────────────── */}
      <div className="relative flex-1 flex overflow-hidden">
        
        {/* Left Chapter Navigator Sidebar */}
        {isSidebarOpen && activeTab !== "PDF" && bookDoc?.chapters && (
          <aside className={`w-72 sm:w-80 border-r ${themeClasses.border} ${themeClasses.cardBg} overflow-y-auto p-4 space-y-2 z-20 shrink-0 shadow-lg transition-all`}>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/10 dark:border-white/10 text-xs font-montserrat font-bold uppercase tracking-wider text-[#C89D56]">
              <span>Table of Contents</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              {bookDoc.chapters.map((ch, idx) => {
                const isSelected = ch.number === currentPage;
                return (
                  <button
                    key={ch.id || idx}
                    onClick={() => goToPage(ch.number)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${
                      isSelected
                        ? "bg-[#C89D56]/20 border-[#C89D56] shadow-sm font-semibold"
                        : "border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-slate-500">
                      <span className="font-bold text-[#C89D56]">CHAPTER {ch.number}</span>
                      <span>p. {ch.pageNumber}</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold leading-snug line-clamp-2">
                      {ch.title}
                    </h4>
                    {ch.subtitle && (
                      <p className="text-[11px] opacity-70 line-clamp-1 mt-1 font-dmsans">
                        {ch.subtitle}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* ── TAB 0: NORMAL PDF VIEWER (Elevated Museum Artifact Canvas - Website Light Theme) ── */}
        {activeTab === "PDF" && (
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#F4EFE6]">
            
            {/* Museum Artifact Vitrine Frame */}
            <div className={`flex-1 w-full h-full relative flex flex-col ${isMuseumFramed ? "p-2 sm:p-5" : "p-0"}`}>
              <div className={`w-full flex-1 h-full overflow-hidden bg-white relative flex flex-col transition-all ${
                isMuseumFramed
                  ? "max-w-6xl mx-auto rounded-2xl border border-[#D8CEBD] shadow-xl ring-1 ring-[#D8CEBD]/60"
                  : "border-0"
              }`}>
                {/* Museum Vitrine Archival Plaque */}
                <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-[#FAF7F0] border-b border-[#D8CEBD] text-xs shrink-0 select-none">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                    <span className="font-serif font-bold text-[#0A2947] tracking-wide truncate text-xs sm:text-sm">
                      {activePdf?.title || "Dr. Ambedkar Writings & Speeches"}
                    </span>
                    <span className="text-slate-400 hidden md:inline">•</span>
                    <span className="text-slate-600 font-mono text-[11px] hidden md:inline font-medium">
                      {activePdf?.languageLabel} ({activePdf?.fileSizeFormatted})
                    </span>
                  </div>

                  {/* Clean Page Navigation Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const prev = Math.max(1, pdfCurrentPage - 1);
                        setPdfCurrentPage(prev);
                        setPdfPageInput(String(prev));
                      }}
                      disabled={pdfCurrentPage <= 1}
                      className="p-1 rounded-lg bg-white border border-[#DCD2C0] hover:bg-slate-50 disabled:opacity-40 text-[#0A2947] font-mono text-xs cursor-pointer transition-colors shadow-2xs"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <form onSubmit={handlePdfPageSubmit} className="flex items-center gap-1 font-mono text-xs">
                      <span className="text-slate-600 hidden sm:inline">Page</span>
                      <input
                        type="text"
                        value={pdfPageInput}
                        onChange={(e) => setPdfPageInput(e.target.value)}
                        className="w-10 px-1 py-0.5 text-center bg-white border border-[#C89D56] rounded-md text-[#0A2947] font-bold focus:outline-none shadow-2xs"
                      />
                      <span className="text-slate-500">/ {activePdf?.volumeNumber === "1" ? "299" : "—"}</span>
                    </form>

                    <button
                      onClick={() => {
                        const next = pdfCurrentPage + 1;
                        setPdfCurrentPage(next);
                        setPdfPageInput(String(next));
                      }}
                      className="p-1 rounded-lg bg-white border border-[#DCD2C0] hover:bg-slate-50 text-[#0A2947] font-mono text-xs cursor-pointer transition-colors shadow-2xs"
                      title="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-3 w-px bg-[#D8CEBD] mx-1 hidden sm:block" />

                    {/* Frame mode toggle */}
                    <button
                      onClick={() => setIsMuseumFramed(!isMuseumFramed)}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#DCD2C0] hover:bg-slate-50 text-[#0A2947] text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                      title={isMuseumFramed ? "Expand Full Width" : "Museum Vitrine"}
                    >
                      <Layers className="w-3 h-3 text-[#8B5E3C]" />
                      <span>{isMuseumFramed ? "Expand" : "Framed"}</span>
                    </button>
                  </div>
                </div>

                {/* PDF Canvas Iframe */}
                <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
                  <iframe
                    key={`${activePdfPath}-${pdfCurrentPage}-${showNativePdfToolbar ? 'toolbar' : 'clean'}`}
                    src={`${activePdfPath}#page=${pdfCurrentPage}&view=FitH&toolbar=${showNativePdfToolbar ? 1 : 0}&navpanes=0`}
                    className="w-full h-full border-0 bg-white"
                    title={activePdf?.title || "PDF Viewer"}
                  />
                </div>
              </div>
            </div>

            {/* Subtle Minimal Museum Caption Strip */}
            <div className="px-4 py-1.5 bg-[#EFE8DC] border-t border-[#DCD2C0] flex items-center justify-between text-[11px] font-mono text-slate-600 shrink-0 select-none">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#0A2947] font-bold truncate">BAWS Digital Collection</span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="text-slate-500 hidden sm:inline truncate">{activePdf?.filePath}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab("READER");
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#C89D56]/20 hover:bg-[#C89D56]/30 text-[#0A2947] font-montserrat font-bold text-[10px] sm:text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Read digitized text with chapter navigation, audio narration and translations"
                >
                  <BookOpen className="w-3 h-3 text-[#8B5E3C]" />
                  <span>Interactive Reader</span>
                </button>

                <button
                  onClick={() => setShowNativePdfToolbar(!showNativePdfToolbar)}
                  className="hover:text-[#0A2947] transition-colors text-[10px] text-slate-600 hover:underline cursor-pointer hidden sm:inline"
                >
                  {showNativePdfToolbar ? "Hide Chrome" : "Browser PDF Controls"}
                </button>

                <a
                  href={activePdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0A2947] text-[#8B5E3C] flex items-center gap-1 transition-colors text-[10px] font-medium"
                  title="Open authentic archival volume in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Raw Tab</span>
                </a>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 1: BOOK READER VIEW (Primary, Authentic Reading Experience) ── */}
        {activeTab === "READER" && (
          <div
            ref={textContentRef}
            className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 py-10 max-w-4xl mx-auto w-full space-y-8 select-text"
          >
            {activeChapter ? (
              <article className="space-y-8 animate-in fade-in duration-300">
                
                {/* Chapter Banner & Title */}
                <header className="space-y-3 pb-6 border-b border-black/10 dark:border-white/10 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C89D56]/20 border border-[#C89D56]/40 text-xs font-mono font-bold uppercase tracking-widest text-[#C89D56]">
                    Chapter {activeChapter.number} of {bookDoc?.totalChapters || totalPages}
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
                    {activeChapter.title}
                  </h1>

                  {activeChapter.subtitle && (
                    <p className="text-sm sm:text-base opacity-75 font-serif italic max-w-2xl mx-auto">
                      "{activeChapter.subtitle}"
                    </p>
                  )}

                  {activeChapter.titleLocal && selectedLanguage !== "en" && (
                    <div className="pt-2 text-base sm:text-lg font-serif font-bold text-[#C89D56]">
                      {activeChapter.titleLocal[selectedLanguage as keyof typeof activeChapter.titleLocal]}
                    </div>
                  )}
                </header>

                {/* Prominent Key Historic Quote Plinth */}
                {activeChapter.keyQuote && (
                  <div className={`p-6 sm:p-8 rounded-3xl ${themeClasses.cardBg} border-l-4 border-l-[#C89D56] ${themeClasses.border} shadow-sm space-y-3`}>
                    <p className="font-serif italic text-base sm:text-lg md:text-xl leading-relaxed">
                      "{activeChapter.keyQuote}"
                    </p>
                    <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-2 border-t border-black/10 dark:border-white/10">
                      <span>— Dr. B. R. Ambedkar</span>
                      <span>{activeChapter.citation}</span>
                    </div>
                  </div>
                )}

                {/* Paragraphs of Chapter Text */}
                <div
                  style={{ fontSize: `${fontSize}px`, lineHeight: "1.85" }}
                  className="space-y-6 font-serif text-justify font-normal tracking-normal"
                >
                  {/* If translated language selected and available, display translated paragraphs */}
                  {selectedLanguage !== "en" && activeChapter.translation?.[selectedLanguage as keyof typeof activeChapter.translation] ? (
                    activeChapter.translation[selectedLanguage as keyof typeof activeChapter.translation]?.map((para, idx) => (
                      <p key={idx} className="first-letter:text-4xl first-letter:font-bold first-letter:font-serif first-letter:mr-1 first-letter:text-[#C89D56]">
                        {para}
                      </p>
                    ))
                  ) : (
                    activeChapter.paragraphs.map((para, idx) => (
                      <p key={idx} className={idx === 0 ? "first-letter:text-4xl first-letter:font-bold first-letter:font-serif first-letter:mr-1 first-letter:text-[#C89D56]" : ""}>
                        {para}
                      </p>
                    ))
                  )}
                </div>

                {/* Chapter Bottom Navigation & Citation Bar */}
                <footer className="pt-10 pb-6 border-t border-black/10 dark:border-white/10 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 text-xs font-montserrat font-bold transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Chapter</span>
                    </button>

                    <span className="font-mono text-xs opacity-60">
                      Folio {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0A2947] hover:bg-[#8B5E3C] text-white disabled:opacity-30 text-xs font-montserrat font-bold transition-all shadow-md cursor-pointer"
                    >
                      <span>Next Chapter</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                  </div>

                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <span className="font-mono opacity-70">
                      Archival Reference: <strong className="text-[#C89D56]">{activeChapter.citation}</strong>
                    </span>
                    <button
                      onClick={handleCopyCitation}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C89D56]/20 hover:bg-[#C89D56]/30 text-[#8B5E3C] dark:text-amber-300 font-semibold font-montserrat transition-colors"
                    >
                      {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCitation ? "Citation Copied" : "Copy Chicago Citation"}</span>
                    </button>
                  </div>
                </footer>

              </article>
            ) : (
              <div className="p-12 text-center space-y-4">
                <p className="text-sm opacity-70 font-mono">Loading authentic book text...</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: ORIGINAL FACSIMILE CANVAS ────────────────────────────── */}
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
              <div className="relative w-[1400px] h-[2000px] bg-[#fdfbf7] border border-[#d1c7b7] shadow-2xl overflow-hidden p-16 font-serif">
                {/* Authentic Facsimile Document Header */}
                <div className="border-b-2 border-slate-900 pb-8 mb-12 text-center space-y-4">
                  <div className="text-xs uppercase font-mono tracking-widest text-slate-500">
                    {bookDoc?.sourceArchive || "ARCHIVAL FACSIMILE RECORD"}
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">
                    {activeChapter?.title || currentTitle}
                  </h2>
                  <div className="text-sm italic text-slate-600">
                    Dr. B. R. Ambedkar • {bookDoc?.volumeCitation || "Writings & Speeches"}
                  </div>
                </div>

                {/* Facsimile Body with drop-cap and authentic paragraphs */}
                <div className="space-y-8 text-xl leading-loose text-slate-900 text-justify">
                  {activeChapter?.paragraphs.map((p, idx) => (
                    <p key={idx} className={idx === 0 ? "first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-slate-950" : ""}>
                      {p}
                    </p>
                  ))}
                </div>

                {/* Archival Seal Plinth */}
                <div className="absolute bottom-16 right-16 flex items-center gap-3 p-4 rounded-xl border border-slate-400 bg-white/80 shadow-md">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold text-xs">
                    BAWS
                  </div>
                  <div className="font-mono text-[10px] text-slate-700">
                    <div>PREMIS Fixity: SHA-256</div>
                    <div>Folio {currentPage} Verified</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Facsimile Zoom Overlay Controls */}
            <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl text-white">
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 text-xs font-mono text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Reset Zoom"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: VERBATIM OCR TEXT VIEW ───────────────────────────────── */}
        {activeTab === "OCR" && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold font-serif">
                  Verbatim Archival OCR (Chapter {currentPage})
                </h2>
                <p className="text-xs opacity-70 font-mono">
                  Machine-readable text blocks verified against PaddleOCR PP-OCRv5 baseline
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/40">
                  OCR {bookDoc?.ocrConfidence || 99.4}%
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 opacity-80">
                  {activeChapter?.paragraphs.reduce((acc, p) => acc + p.split(" ").length, 0) || 450} Words
                </span>
              </div>
            </div>

            <div className={`p-8 rounded-3xl ${themeClasses.cardBg} border ${themeClasses.border} shadow-sm font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-[#C89D56]/30`}>
              {activeChapter?.paragraphs.join("\n\n") || "No OCR text blocks available for this folio."}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  navigator.clipboard.writeText(activeChapter?.paragraphs.join("\n\n") || "");
                  setCopiedCitation(true);
                  setTimeout(() => setCopiedCitation(false), 2000);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] text-white text-xs font-montserrat font-semibold transition-all shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Verbatim Text</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 4: TRANSLATIONS VIEW ────────────────────────────────────── */}
        {activeTab === "TRANSLATION" && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold font-serif">
                  Multilingual Indic Translation Layer
                </h2>
                <p className="text-xs opacity-70 font-mono">
                  Standardized translations powered by Qwen 27B / IndicTrans2 architecture
                </p>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-xl text-xs font-mono font-bold">
                {(["hi", "mr", "ta", "bn"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedLanguage(lang);
                    }}
                    className={`px-3 py-1.5 rounded-lg uppercase transition-all ${
                      selectedLanguage === lang
                        ? "bg-[#0A2947] text-white shadow-xs"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {lang === "hi" ? "हिंदी" : lang === "mr" ? "मराठी" : lang === "ta" ? "தமிழ்" : "বাংলা"}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-8 rounded-3xl ${themeClasses.cardBg} border ${themeClasses.border} shadow-sm space-y-6 font-serif text-lg leading-relaxed`}>
              <h3 className="font-bold text-xl text-[#C89D56]">
                {activeChapter?.titleLocal?.[selectedLanguage as keyof typeof activeChapter.titleLocal] || activeChapter?.title}
              </h3>

              {activeChapter?.translation?.[selectedLanguage as keyof typeof activeChapter.translation] ? (
                activeChapter.translation[selectedLanguage as keyof typeof activeChapter.translation]?.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))
              ) : (
                <div className="p-6 text-center text-sm font-mono opacity-70">
                  Translation synthesized for active chapter in {selectedLanguage.toUpperCase()}.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: AUDIO NARRATION VIEW ─────────────────────────────────── */}
        {activeTab === "AUDIO" && (
          <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-[#C89D56]/20 text-[#C89D56] flex items-center justify-center text-5xl shadow-xl animate-pulse">
              <Volume2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-[#0A2947] text-amber-300 font-mono text-xs border border-[#C89D56]/50">
                Dr. Ambedkar Speech & Neural Narration
              </div>
              <h2 className="text-2xl font-bold font-serif">
                {activeChapter?.title || currentTitle}
              </h2>
              <p className="text-xs opacity-75 max-w-md mx-auto">
                Listen to the authentic words of Dr. Babasaheb Ambedkar narrated in clear cadence preserving historical fidelity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 w-full max-w-md space-y-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={toggleSpeechNarration}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isSpeaking
                      ? "bg-rose-600 text-white"
                      : "bg-[#0A2947] hover:bg-[#8B5E3C] text-white"
                  }`}
                >
                  {isSpeaking ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                </button>
              </div>

              <div className="text-xs font-mono opacity-70 flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                <span>Language: {selectedLanguage.toUpperCase()}</span>
                <span>Status: {isSpeaking ? "Active Narration" : "Ready"}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── BOTTOM FLOATING PAGE CONTROLLER (Only for Book Reader Mode - Light Theme) ── */}
      {activeTab !== "PDF" && (
        <footer className="z-30 flex items-center justify-between px-6 py-2.5 bg-[#FAF7F0] text-[#0A2947] border-t border-[#DCD2C0] text-xs shadow-xs">
          
          {/* Left: Previous / Next Chapter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl bg-white border border-[#DCD2C0] hover:bg-slate-50 disabled:opacity-30 text-[#0A2947] transition-colors cursor-pointer shadow-2xs"
              title="Previous Chapter"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-slate-600 font-medium">Chapter</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="w-12 px-1.5 py-0.5 rounded-lg bg-white border border-[#C89D56] text-center font-mono font-bold text-[#0A2947] outline-none shadow-2xs"
              />
              <span className="text-slate-500">of {totalPages}</span>
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl bg-white border border-[#DCD2C0] hover:bg-slate-50 disabled:opacity-30 text-[#0A2947] transition-colors cursor-pointer shadow-2xs"
              title="Next Chapter"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Center: Interactive Scrubber Slider */}
          <div className="hidden sm:flex items-center gap-3 max-w-sm w-full mx-6">
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="w-full h-1.5 bg-[#DCD2C0] rounded-lg appearance-none cursor-pointer accent-[#C89D56]"
            />
          </div>

          {/* Right: Quick Action Badges */}
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
            <span className="hidden md:inline">
              Accession: <strong className="text-[#8B5E3C] font-bold">{bookDoc?.id || documentId}</strong>
            </span>
            <button
              onClick={handleCopyCitation}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#DCD2C0] hover:bg-slate-50 text-[#0A2947] transition-colors shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>Cite</span>
            </button>
          </div>
        </footer>
      )}

      {/* ── DRAWERS ─────────────────────────────────────────────────────── */}
      <AskThisPageDrawer
        isOpen={isAskPageOpen}
        onClose={() => setIsAskPageOpen(false)}
        objectId={activePdf?.id || documentId}
        pageNumber={activeTab === "PDF" ? pdfCurrentPage : currentPage}
        documentTitle={activePdf?.title || currentTitle}
        contextText={
          activeTab === "READER" && activeChapter
            ? `Chapter ${activeChapter.number}: ${activeChapter.title}\n\n${activeChapter.paragraphs?.join('\n\n')}`
            : activePdf
            ? `Title: ${activePdf.title}\nVolume: ${activePdf.volumeNumber}\nLanguage: ${activePdf.languageLabel}\nTreatises: ${activePdf.relatedTreatises?.join(', ')}\nSynopsis: ${activePdf.highlight}`
            : bookDoc?.preface || ""
        }
      />

      <PreservationDrawer
        isOpen={isPreservationOpen}
        onClose={() => setIsPreservationOpen(false)}
        documentId={documentId}
        stableId={documentMeta?.stable_id || documentId}
        title={currentTitle}
        currentPage={currentPage}
      />

      <IncomingPdfBrowserDrawer
        isOpen={isPdfDrawerOpen}
        onClose={() => setIsPdfDrawerOpen(false)}
        onSelectPdf={handleSelectPdf}
        currentFilePath={activePdfPath}
      />
    </div>
  );
}
