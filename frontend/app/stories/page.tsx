"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Clock,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import { StoryCollectionItem } from "@/lib/types";

export default function StoriesDirectoryPage() {
  const [stories, setStories] = useState<StoryCollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getStories()
      .then((data) => setStories(data))
      .catch((err) => console.error("Failed to load stories", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Heritage Story Engine
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Archival Truth
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Curated historical narratives composed strictly of approved archival objects
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Hero Banner */}
        <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-2xl overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Zero Hallucination Storytelling
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Explore the Archive Through Grounded Historical Journeys
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Every chapter and claim in these heritage stories is anchored directly to verified primary documents, debates, and manuscripts from Babasaheb Ambedkar&apos;s corpus.
            </p>
          </div>
        </div>

        {/* Story Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading Curated Stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-base font-semibold text-slate-300">No stories published yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {story.category}
                    </span>
                    <span className="flex items-center text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      5 min read
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {story.title}
                    </h3>
                    {story.subtitle && (
                      <p className="text-xs text-amber-400/80 font-medium mt-1">
                        {story.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-3">
                      {story.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Archival Grounded
                  </span>
                  <Link
                    href={`/stories/${story.slug}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition space-x-1"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
