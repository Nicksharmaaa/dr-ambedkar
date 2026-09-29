"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { AskPageActionResponse, PageActionType } from "@/lib/types";
import { Sparkles, X, Volume2, Globe, FileText, Lightbulb, Landmark, MessageSquare, CheckCircle2 } from "lucide-react";

interface AskThisPageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  objectId: string;
  pageNumber: number;
  documentTitle?: string;
  contextText?: string;
  onAudioPlay?: (audioUrl: string) => void;
}

export function AskThisPageDrawer({
  isOpen,
  onClose,
  objectId,
  pageNumber,
  documentTitle,
  contextText,
  onAudioPlay,
}: AskThisPageDrawerProps) {
  const [selectedAction, setSelectedAction] = useState<PageActionType>("SUMMARIZE");
  const [customQuestion, setCustomQuestion] = useState("");
  const [targetLang, setTargetLang] = useState<"en" | "hi" | "mr">("en");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AskPageActionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions: { id: PageActionType; label: string; icon: string; desc: string }[] = [
    { id: "SUMMARIZE", label: "Summarize this page", icon: "📝", desc: "Authoritative 2-paragraph synthesis of core arguments" },
    { id: "EXPLAIN", label: "Explain this page", icon: "💡", desc: "Pedagogical breakdown of core concepts and principles" },
    { id: "TRANSLATE", label: "Translate this page", icon: "🌐", desc: "Scholarly translation into Hindi or Marathi" },
    { id: "READ_ALOUD", label: "Read this page aloud", icon: "🔊", desc: "Neural audio narration streaming directly" },
    { id: "IDENTIFY_ENTITIES", label: "Identify people & topics", icon: "🏛️", desc: "Extract historical figures, legal cases, and concepts" },
    { id: "CUSTOM_QUESTION", label: "Ask a custom question", icon: "💬", desc: "Inquire about Dr. Ambedkar's specific philosophy" },
  ];

  const handleExecuteAction = async (action: PageActionType, lang = targetLang) => {
    setSelectedAction(action);
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const q = action === "CUSTOM_QUESTION" ? customQuestion.trim() : undefined;
      const res = await api.askPageAction(objectId, pageNumber, action, q, lang, contextText);
      setResponse(res);
      if (action === "READ_ALOUD" && res.audio_url && onAudioPlay) {
        onAudioPlay(res.audio_url);
      }
    } catch (err: any) {
      console.error("Ask This Page failed:", err);
      setError(err.message || "Failed to process scholarly inquiry");
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically execute default SUMMARIZE action when opened if no response
  useEffect(() => {
    if (isOpen && !response && !isLoading) {
      handleExecuteAction("SUMMARIZE", targetLang);
    }
  }, [isOpen, objectId, pageNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[999999] w-full sm:w-[500px] bg-[#FAF7F0] border-l border-[#DCD2C0] shadow-2xl flex flex-col text-[#0A2947] font-dmsans animate-in slide-in-from-right duration-200">
      
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-[#DCD2C0] flex items-center justify-between bg-[#F5ECE1]">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#0A2947] text-[#FAF7F0] font-bold text-sm shadow-xs">
            <Sparkles className="w-4 h-4 text-[#C89D56]" />
          </span>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#0A2947] flex items-center gap-2">
              Ask AI Scholar
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono bg-[#C89D56]/20 text-[#8B5E3C] border border-[#C89D56]/50 font-bold">
                Page {pageNumber}
              </span>
            </h3>
            <p className="text-xs text-slate-600 truncate max-w-[280px]">
              {documentTitle || objectId}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-[#0A2947] hover:bg-black/5 p-1.5 rounded-xl transition-colors cursor-pointer"
          title="Close Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── RESPONSE LANGUAGE TOGGLE ─────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-[#FAF7F0] border-b border-[#DCD2C0] flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">Response Language:</span>
        <div className="flex items-center gap-1.5">
          {(["en", "hi", "mr"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setTargetLang(lang);
                handleExecuteAction(selectedAction, lang);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-montserrat font-bold transition-all cursor-pointer ${
                targetLang === lang
                  ? "bg-[#0A2947] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-[#DCD2C0] hover:bg-amber-50/50"
              }`}
            >
              {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "मराठी"}
            </button>
          ))}
        </div>
      </div>

      {/* ── SIGNATURE ACTIONS GRID ────────────────────────────────────────── */}
      <div className="p-4 border-b border-[#DCD2C0] bg-[#F7F2EB]">
        <label className="text-[11px] uppercase tracking-wider text-slate-600 font-bold block mb-2.5">
          Signature Scholarly Actions
        </label>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((act) => {
            const isSelected = selectedAction === act.id;
            return (
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
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? "bg-[#C89D56]/15 border-[#C89D56] text-[#0A2947] ring-2 ring-[#C89D56]/50 font-semibold"
                    : "bg-white border-[#DCD2C0] text-slate-800 hover:border-[#C89D56]/80 hover:bg-amber-50/40"
                }`}
              >
                <div className="text-base mb-1">{act.icon}</div>
                <div className="text-xs font-bold text-[#0A2947]">{act.label}</div>
              </button>
            );
          })}
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
              className="w-full text-xs p-3 rounded-xl bg-white border border-[#DCD2C0] text-[#0A2947] placeholder:text-slate-400 focus:outline-none focus:border-[#C89D56] focus:ring-1 focus:ring-[#C89D56] shadow-xs"
            />
            <button
              onClick={() => handleExecuteAction("CUSTOM_QUESTION")}
              disabled={!customQuestion.trim() || isLoading}
              className="w-full py-2.5 rounded-xl bg-[#0A2947] hover:bg-[#0E355A] disabled:opacity-50 text-xs font-montserrat font-bold text-white transition-all cursor-pointer shadow-sm"
            >
              {isLoading ? "Consulting Archive..." : "Ask AI Scholar"}
            </button>
          </div>
        )}
      </div>

      {/* ── CONTENT RESULTS AREA ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F0]">
        {isLoading && (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#C89D56] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">
              Analyzing Page {pageNumber} with authentic archival provenance...
            </p>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 shadow-xs">
            ⚠️ {error}
          </div>
        )}

        {response && !isLoading && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Citation Provenance Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-emerald-900 font-montserrat">
                  {response.source_attribution} Grounded Evidence
                </div>
                <div className="text-emerald-800 mt-0.5">
                  Verified citation in {response.current_page_citation?.document_title || documentTitle || objectId} (Page {response.page_number})
                </div>
              </div>
            </div>

            {/* Answer Content Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DCD2C0] text-sm leading-relaxed text-[#1A202C] whitespace-pre-wrap shadow-xs">
              {response.answer}
            </div>

            {/* Audio Narration Bar if available */}
            {response.audio_url && (
              <div className="p-3 rounded-xl bg-amber-50 border border-[#C89D56]/50 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#8B5E3C]" />
                  <span className="text-xs text-[#8B5E3C] font-bold">Page Narration Audio</span>
                </div>
                <audio controls src={response.audio_url} className="h-8 max-w-[200px]" />
              </div>
            )}

            {/* Telemetry Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-[#DCD2C0]">
              <span>Model: {response.model_name || "Qwen 27B LPU"}</span>
              <span>Latency: {response.took_ms} ms</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
