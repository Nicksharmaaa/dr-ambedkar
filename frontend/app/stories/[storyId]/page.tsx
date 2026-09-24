"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
  FileText,
  Clock,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { api } from "@/lib/api";
import { StoryCollectionItem, StoryItem } from "@/lib/types";

export default function StoryReaderPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<StoryCollectionItem | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!storyId) return;
    setIsLoading(true);
    api.getStory(storyId)
      .then((data) => {
        setStory(data);
      })
      .catch((err) => {
        console.error("Failed to load story", err);
      })
      .finally(() => setIsLoading(false));
  }, [storyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading Heritage Narrative...</p>
        </div>
      </div>
    );
  }

  if (!story || !story.items || story.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <p className="text-lg font-bold text-slate-300">Story Not Found</p>
        <Link
          href="/stories"
          className="mt-4 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-amber-400 text-sm font-medium rounded-xl transition"
        >
          Return to Story Directory
        </Link>
      </div>
    );
  }

  const currentItem: StoryItem = story.items[activeChapterIndex] || story.items[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur sticky top-0 z-30 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/stories"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Back to Stories"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Heritage Story
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">
                  Chapter {activeChapterIndex + 1} of {story.items.length}
                </span>
              </div>
              <h1 className="text-sm md:text-base font-bold text-white truncate max-w-md md:max-w-xl">
                {story.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="hidden md:flex items-center text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Archival Verified
            </span>
          </div>
        </div>
      </header>

      {/* Main Reader Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Chapter Index & Reading Progress (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 sticky top-24">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {story.category}
              </span>
              <h2 className="text-base font-bold text-white pt-1">
                {story.title}
              </h2>
              {story.subtitle && (
                <p className="text-xs text-slate-400">
                  {story.subtitle}
                </p>
              )}
            </div>

            {/* Chapter Stepper List */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Narrative Chapters
              </span>

              {story.items.map((item, idx) => {
                const isActive = idx === activeChapterIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between text-xs ${
                      isActive
                        ? "bg-amber-500 text-slate-950 font-bold shadow"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive
                            ? "bg-slate-950 text-amber-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Column: Chapter Content & Archival Citation (8 cols) */}
        <main className="lg:col-span-8 flex flex-col space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-6">
            {/* Chapter Header */}
            <div className="space-y-2 border-b border-slate-800 pb-6">
              <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
                <span>Chapter {currentItem.sequence}</span>
                <span>•</span>
                <span>Primary Source Anchored</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {currentItem.title}
              </h2>
            </div>

            {/* Chapter Narration Body */}
            <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm md:text-base space-y-4">
              <p className="whitespace-pre-line leading-relaxed">
                {currentItem.narrative_text || currentItem.body}
              </p>
            </div>

            {/* Highlighted Primary Archival Passage Quote Card */}
            {(currentItem.evidence_quote || currentItem.highlighted_passage) && (
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    Exact Archival Excerpt
                  </span>
                  {currentItem.page_number && (
                    <span className="text-slate-400 font-mono text-[11px]">
                      Page {currentItem.page_number}
                    </span>
                  )}
                </div>
                <blockquote className="italic text-slate-100 font-serif text-sm md:text-base leading-relaxed pl-3 border-l-2 border-amber-500">
                  &ldquo;{currentItem.evidence_quote || currentItem.highlighted_passage}&rdquo;
                </blockquote>
              </div>
            )}

            {/* Archival Citation & Deep-Links */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">
                  Authoritative Archival Source
                </span>
                <span className="font-bold text-white flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-amber-400" />
                  {currentItem.document_id || "Archival Corpus Volume"}
                  {currentItem.page_number && ` (Page ${currentItem.page_number})`}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                {/* Ask AI Assistant */}
                <Link
                  href={`/assistant?q=${encodeURIComponent(`Explain this historical chapter: "${currentItem.title}" from Dr. Ambedkar's corpus (${currentItem.document_id}, Page ${currentItem.page_number}).`)}`}
                  className="inline-flex items-center px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Ask AI About This
                </Link>

                {/* Open Exact Page in Archival Viewer */}
                {currentItem.document_id && (
                  <Link
                    href={currentItem.viewer_url || `/documents/${currentItem.document_id}/viewer?page=${currentItem.page_number || 1}`}
                    className="inline-flex items-center px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md"
                  >
                    <span>Open Exact Page</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Stepper Footer Controls */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActiveChapterIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeChapterIndex === 0}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium transition space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Chapter</span>
              </button>

              <button
                onClick={() =>
                  setActiveChapterIndex((prev) =>
                    Math.min(story.items.length - 1, prev + 1)
                  )
                }
                disabled={activeChapterIndex === story.items.length - 1}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium transition space-x-1"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
