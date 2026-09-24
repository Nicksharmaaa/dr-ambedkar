"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  Filter,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  FileText,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { TimelineEventItem } from "@/lib/types";

const ERAS = [
  { label: "All Eras", from: undefined, to: undefined },
  { label: "1891–1920 (Education & Formative)", from: 1891, to: 1920 },
  { label: "1921–1935 (Mahad & Poona Pact)", from: 1921, to: 1935 },
  { label: "1936–1947 (Annihilation & Labour)", from: 1936, to: 1947 },
  { label: "1948–1956 (Constitution & Dhamma)", from: 1948, to: 1956 },
];

const CATEGORY_COLORS: Record<string, string> = {
  CONSTITUTIONAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  EDUCATION: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SOCIAL_REFORM: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MOVEMENTS: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  POLITICAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ACADEMIC: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  ECONOMIC: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  HISTORICAL: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEventItem[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedEra, setSelectedEra] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeModalEvent, setActiveModalEvent] = useState<TimelineEventItem | null>(null);

  // Load events
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const era = ERAS[selectedEra];
      const data = await api.getTimelineEvents({
        year_from: era.from,
        year_to: era.to,
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
        limit: 100,
      });
      setEvents(data);
    } catch (err) {
      console.error("Failed to load timeline events", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedEra]);

  // Load categories
  useEffect(() => {
    api.getTimelineCategories()
      .then((res) => setCategories(res.categories))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadEvents();
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.searchTimeline(searchQuery);
      setEvents(res);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Archival Historical Timeline
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Precision-Aware Chronology
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verified life events and historical milestones of Dr. B.R. Ambedkar backed by primary sources
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline events..."
              className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition w-64 md:w-80"
            />
          </form>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Controls: Era Scrubber & Category Filters */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-4">
          {/* Era Tabs */}
          <div className="flex flex-wrap gap-1.5 pb-3 border-b border-slate-800">
            {ERAS.map((era, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedEra(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  selectedEra === idx
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                {era.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCategory === "ALL"
                    ? "bg-slate-200 text-slate-950 font-bold"
                    : "bg-slate-800/60 text-slate-400 hover:text-white"
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.category}
                  onClick={() => setSelectedCategory(c.category)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedCategory === c.category
                      ? "bg-slate-200 text-slate-950 font-bold"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {c.category.replace(/_/g, " ")} ({c.count})
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              Showing {events.length} verified events
            </div>
          </div>
        </div>

        {/* Timeline Event Feed */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading Historical Timeline...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-base font-semibold text-slate-300">No events found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the era or category filters.</p>
          </div>
        ) : (
          <div className="relative pl-6 md:pl-8 border-l-2 border-slate-800 space-y-8 my-6">
            {events.map((event) => {
              const categoryColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.HISTORICAL;
              return (
                <div key={event.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-amber-500 group-hover:scale-125 transition-transform" />

                  {/* Event Card */}
                  <div className="p-5 md:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-4">
                    {/* Header Row: Date & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-amber-400 font-mono">
                          {event.start_date}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                          Precision: {event.date_precision}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {event.location && (
                          <span className="flex items-center text-xs text-slate-400">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            {event.location}
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryColor}`}>
                          {event.category.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        {event.title}
                      </h2>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Verified Evidence Callout */}
                    {event.evidence_text && (
                      <div className="relative pl-4 border-l-2 border-amber-500/50 py-1.5 bg-amber-500/5 rounded-r-xl pr-3">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                          Archival Citation ({event.source})
                        </span>
                        <p className="text-xs italic text-slate-200 font-serif leading-relaxed">
                          &ldquo;{event.evidence_text}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Actions & Deep Links */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {event.related_topics.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[11px]">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/assistant?q=${encodeURIComponent(`Explain the historical significance of: ${event.title} (${event.start_date}) in Dr. Ambedkar's corpus.`)}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          Ask AI Assistant
                        </Link>

                        {event.document_id && (
                          <Link
                            href={event.viewer_url || `/documents/${event.document_id}/viewer?page=${event.page_number || 1}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            Open Exact Page
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
