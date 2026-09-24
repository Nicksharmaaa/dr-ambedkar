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
  Share2,
  Copy,
  Check,
  ExternalLink,
  List,
} from "lucide-react";
import { api } from "@/lib/api";
import { PreservationDrawer } from "./PreservationDrawer";

interface ArchivalViewerProps {
  documentId: string;
  initialPage?: number;
  initialQuery?: string;
}

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
  const [hoveredAnnotation, setHoveredAnnotation] = useState<any>(null);

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
  }, [documentId, currentPage]);

  // Handle URL initial query & page
  useEffect(() => {
    if (initialPage && initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialPage, initialQuery]);

  // Zoom Handlers
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.15, 3.5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.15, 0.4));
  const handleResetZoom = () => {
    setScale(0.85);
    setPosition({ x: 0, y: 0 });
  };
  const handleFitWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 80;
      setScale(Math.max(containerWidth / 1800, 0.4));
      setPosition({ x: 0, y: 0 });
    }
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

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 3.5));
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Page Navigation
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

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col h-[calc(100vh-4rem)] w-full bg-slate-950 text-slate-100 overflow-hidden select-none"
    >
      {/* Top Archival Toolbar */}
      <header className="z-30 flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-xs">
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
              <span className="font-serif font-bold text-slate-200 truncate max-w-[220px] md:max-w-md">
                {currentTitle}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 font-mono text-[10px] text-amber-400">
                {pageStableId}
              </span>
            </div>
          </div>
        </div>

        {/* Center: In-Document Search */}
        <div className="flex items-center gap-2 max-w-xs w-full mx-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in page..."
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 focus:border-amber-500 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
            {searchQuery && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px] font-mono text-amber-400">
                {matchingAnnotations.length}
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls & Preservation Drawer Trigger */}
        <div className="flex items-center gap-2">
          {/* Toggle OCR Overlay */}
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            title="Toggle OCR Coordinate Overlay"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-[11px] transition-colors ${
              showAnnotations
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden md:inline">OCR Boxes</span>
          </button>

          {/* IIIF Manifest Link */}
          <a
            href={`http://localhost:8000/api/v1/iiif/manifest/${documentId}`}
            target="_blank"
            rel="noreferrer"
            title="View IIIF Presentation 3.0 Manifest"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-mono text-[11px] transition-colors"
          >
            <span>IIIF 3.0</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          {/* Preservation & PREMIS */}
          <button
            onClick={() => setIsPreservationOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Preservation</span>
          </button>
        </div>
      </header>

      {/* Main Viewer Body */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Optional Page List / Thumbnails Drawer */}
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

        {/* 2D Zoom & Pan Viewport */}
        <div
          className={`relative flex-1 flex items-center justify-center bg-slate-950 overflow-hidden cursor-${
            isDragging ? "grabbing" : "grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Transformable Canvas Container */}
          <div
            ref={canvasRef}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.05s ease-out",
            }}
            className="relative shadow-2xl rounded-sm"
          >
            {/* SVG Page Folio Canvas (1800 x 2700 px) */}
            <div className="relative w-[1800px] h-[2700px] bg-[#fdfbf7] border border-[#d1c7b7] shadow-2xl">
              {/* Load SVG from IIIF Image endpoint */}
              <img
                src={`http://localhost:8000/api/v1/iiif/image/${documentId}/${currentPage}/page.svg`}
                alt={`Page ${currentPage}`}
                className="w-full h-full pointer-events-none select-none"
              />

              {/* Word-Level OCR Coordinate Boxes Overlay */}
              {showAnnotations && (
                <div className="absolute inset-0 pointer-events-auto">
                  {annotations.map((anno, idx) => {
                    // Target format: ...#xywh=x,y,w,h
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

          {/* Hovered Annotation Tooltip */}
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
      </div>

      {/* Bottom Floating Control Bar */}
      <footer className="z-30 flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 text-xs">
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
