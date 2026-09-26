"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { AskPageActionResponse, PageActionType } from "@/lib/types";

interface AskThisPageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  objectId: string;
  pageNumber: number;
  documentTitle?: string;
  onAudioPlay?: (audioUrl: string) => void;
}

export function AskThisPageDrawer({
  isOpen,
  onClose,
  objectId,
  pageNumber,
  documentTitle,
  onAudioPlay,
}: AskThisPageDrawerProps) {
  const [selectedAction, setSelectedAction] = useState<PageActionType>("SUMMARIZE");
  const [customQuestion, setCustomQuestion] = useState("");
  const [targetLang, setTargetLang] = useState<"en" | "hi" | "mr">("en");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AskPageActionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions: { id: PageActionType; label: string; icon: string; desc: string }[] = [
    { id: "SUMMARIZE", label: "Summarize this page", icon: "📝", desc: "Executive 2-paragraph synthesis of this exact page" },
    { id: "EXPLAIN", label: "Explain this page", icon: "💡", desc: "Pedagogical breakdown of core concepts and arguments" },
    { id: "TRANSLATE", label: "Translate this page", icon: "🌐", desc: "Academic Indic translation preserving proper nouns" },
    { id: "READ_ALOUD", label: "Read this page aloud", icon: "🔊", desc: "Neural Indic narration streaming audio directly" },
    { id: "IDENTIFY_ENTITIES", label: "Identify people & topics", icon: "🏛️", desc: "Extract historical figures, legal cases, and concepts" },
    { id: "CUSTOM_QUESTION", label: "Ask a custom question", icon: "💬", desc: "Ask any scholarly inquiry grounded strictly in this page" },
  ];

  const handleExecuteAction = async (action: PageActionType) => {
    setSelectedAction(action);
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const q = action === "CUSTOM_QUESTION" ? customQuestion.trim() : undefined;
      const res = await api.askPageAction(objectId, pageNumber, action, q, targetLang);
      setResponse(res);
      if (action === "READ_ALOUD" && res.audio_url && onAudioPlay) {
        onAudioPlay(res.audio_url);
      }
    } catch (err: any) {
      console.error("Ask This Page failed:", err);
      setError(err.message || "Failed to process page inquiry");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950/95 backdrop-blur-xl border-l border-amber-500/20 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-sm">
            📖
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Ask This Page
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60">
                Page {pageNumber}
              </span>
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-[280px]">
              {documentTitle || objectId}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Target Language Toggle */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Response Language:</span>
        <div className="flex items-center gap-1">
          {(["en", "hi", "mr"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setTargetLang(lang)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                targetLang === lang
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "मराठी"}
            </button>
          ))}
        </div>
      </div>

      {/* Action Selector Buttons */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
          Signature Page Actions
        </label>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((act) => (
            <button
              key={act.id}
              onClick={() => {
                if (act.id !== "CUSTOM_QUESTION") {
                  handleExecuteAction(act.id);
                } else {
                  setSelectedAction("CUSTOM_QUESTION");
                }
              }}
              disabled={isLoading}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedAction === act.id
                  ? "bg-blue-900/30 border-blue-500/60 text-white ring-1 ring-blue-500/30"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60"
              }`}
            >
              <div className="text-base mb-1">{act.icon}</div>
              <div className="text-xs font-semibold">{act.label}</div>
            </button>
          ))}
        </div>

        {/* Custom Question input */}
        {selectedAction === "CUSTOM_QUESTION" && (
          <div className="mt-3 space-y-2">
            <textarea
              id="page-custom-question-textarea"
              name="page_custom_question"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g. What does Dr. Ambedkar argue regarding caste representation on this page?"
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleExecuteAction("CUSTOM_QUESTION")}
              disabled={!customQuestion.trim() || isLoading}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white transition-all"
            >
              {isLoading ? "Querying Page..." : "Ask Question"}
            </button>
          </div>
        )}
      </div>

      {/* Content Area / Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">
              Analyzing Page {pageNumber} with strict archival provenance...
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300">
            ⚠️ {error}
          </div>
        )}

        {response && !isLoading && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Citation Provenance Banner */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-2.5">
              <span className="text-emerald-400 text-base">📌</span>
              <div className="text-xs">
                <div className="font-semibold text-emerald-300">
                  {response.source_attribution}
                </div>
                <div className="text-emerald-400/80 mt-0.5">
                  Grounded strictly in {response.current_page_citation.document_title || response.object_id} (Page {response.page_number})
                </div>
              </div>
            </div>

            {/* Answer Content */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
              {response.answer}
            </div>

            {/* Audio Narration Bar if available */}
            {response.audio_url && (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">🔊</span>
                  <span className="text-xs text-blue-300 font-medium">Page Narration Audio</span>
                </div>
                <audio controls src={response.audio_url} className="h-8 max-w-[200px]" />
              </div>
            )}

            {/* Related Sources (Strict Separation: Not part of current page) */}
            {response.related_citations && response.related_citations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Related Archive Sources (Separate Corpus Evidence)
                </div>
                <div className="space-y-2">
                  {response.related_citations.map((c, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div className="font-medium text-slate-300">{c.title || c.document_id}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{c.excerpt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Telemetry Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
              <span>Model: {response.model_name}</span>
              <span>Latency: {response.took_ms} ms</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
