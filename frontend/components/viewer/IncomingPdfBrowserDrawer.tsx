"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Filter,
  Check,
  FolderOpen,
  Globe,
  Sparkles,
} from "lucide-react";
import {
  INCOMING_VOLUMES_CATALOG,
  LANGUAGE_FOLDERS,
  IncomingVolumeItem,
} from "@/data/incomingPdfCatalog";

interface IncomingPdfBrowserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPdf: (item: IncomingVolumeItem) => void;
  currentFilePath?: string;
}

export function IncomingPdfBrowserDrawer({
  isOpen,
  onClose,
  onSelectPdf,
  currentFilePath,
}: IncomingPdfBrowserDrawerProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredItems = useMemo(() => {
    return INCOMING_VOLUMES_CATALOG.filter((item) => {
      // Folder filter
      if (selectedFolder !== "all" && item.folder.toLowerCase() !== selectedFolder.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesFile = item.filename.toLowerCase().includes(q);
        const matchesHighlight = item.highlight.toLowerCase().includes(q);
        const matchesVol = item.volumeNumber.includes(q);
        const matchesLang = item.languageLabel.toLowerCase().includes(q);
        return matchesTitle || matchesFile || matchesHighlight || matchesVol || matchesLang;
      }
      return true;
    });
  }, [selectedFolder, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-2xl h-full bg-[#FAF7F0] text-[#0A2947] shadow-2xl border-l border-[#C89D56]/40 overflow-hidden font-dmsans">
        
        {/* Drawer Header */}
        <div className="p-5 bg-gradient-to-r from-[#0A2947] via-[#0E355A] to-[#041424] text-white border-b border-[#C89D56]/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#C89D56]/20 border border-[#C89D56]/40 text-amber-300">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base md:text-lg text-white">
                  Incoming Language Archives
                </h3>
                <p className="text-[11px] font-mono text-slate-300">
                  Folder: <code className="text-amber-300">incoming_documents/books_and_writings</code>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-300 font-sans leading-relaxed">
            Browse and view 93 authentic multi-language PDF volumes and 19 English text editions directly in the normal PDF viewer.
          </p>

          {/* Search Box */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by volume (e.g. 'Vol 1', 'Caste', 'Buddha', 'Hindi')..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/60 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#C89D56] transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Language Folder Tabs */}
        <div className="px-4 py-2.5 bg-[#F2ECE1] border-b border-[#D3D4C0] flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none text-xs font-montserrat">
          <button
            onClick={() => setSelectedFolder("all")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              selectedFolder === "all"
                ? "bg-[#0A2947] text-white shadow-xs"
                : "bg-white/80 hover:bg-white text-slate-700 border border-[#D3D4C0]"
            }`}
          >
            All Archives ({INCOMING_VOLUMES_CATALOG.length})
          </button>
          {LANGUAGE_FOLDERS.map((f) => (
            <button
              key={f.folder}
              onClick={() => setSelectedFolder(f.folder)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedFolder.toLowerCase() === f.folder.toLowerCase()
                  ? "bg-[#0A2947] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-slate-700 border border-[#D3D4C0]"
              }`}
            >
              <span>{f.flag}</span>
              <span>{f.label}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 text-[10px] font-mono">
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Catalog Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono pb-1">
            <span>
              Showing {filteredItems.length} volume{filteredItems.length === 1 ? "" : "s"}
            </span>
            <span>Click any item to load in viewer</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#D3D4C0]">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="font-serif text-sm font-bold text-slate-700">No volumes found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for "Vol 1", "Hindi", or clearing your filters.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isActive = currentFilePath === item.filePath;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-[#C89D56]/15 border-[#C89D56] shadow-sm ring-1 ring-[#C89D56]"
                      : "bg-white hover:bg-[#FAF7F0] border-[#D3D4C0] hover:border-[#C89D56]/60 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#0A2947] text-white font-mono text-[10px] font-bold">
                          {item.folder.toUpperCase()}
                        </span>
                        {item.volumeNumber && (
                          <span className="px-2 py-0.5 rounded-md bg-[#C89D56]/20 border border-[#C89D56]/40 text-[#8B5E3C] font-mono text-[10px] font-bold">
                            Vol. {item.volumeNumber}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {item.fileSizeFormatted}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold">
                          {item.format}
                        </span>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#8B5E3C] font-mono">
                            <Check className="w-3 h-3 text-[#8B5E3C]" />
                            <span>Currently Viewing</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[#0A2947] leading-snug line-clamp-1">
                        {item.title}
                      </h4>

                      <p className="mt-1 text-xs text-slate-600 font-sans line-clamp-2">
                        {item.highlight}
                      </p>

                      <div className="mt-1 text-[10px] font-mono text-slate-400 truncate">
                        File: {item.filename}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onSelectPdf(item);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-montserrat text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                          isActive
                            ? "bg-[#C89D56] text-slate-950 hover:bg-[#B88D46]"
                            : "bg-[#0A2947] hover:bg-[#123C63] text-white"
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isActive ? "Viewing" : "View"}</span>
                      </button>

                      <a
                        href={item.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-xl font-montserrat text-[11px] font-medium text-slate-600 hover:text-[#0A2947] hover:bg-black/5 flex items-center justify-center gap-1 transition-colors"
                        title="Open raw file in new browser tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Raw</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[#EAE3D2] border-t border-[#D3D4C0] flex items-center justify-between text-xs font-mono text-slate-600">
          <span>Path: <code>/incoming_documents/books_and_writings/</code></span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-100 rounded-lg text-slate-800 font-montserrat font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
