"use client";

import React from "react";
import Link from "next/link";
import {
  WhyConnectedResponse,
  WhyConnectedEvidence,
} from "@/lib/types";
import {
  X,
  ExternalLink,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  FileText,
} from "lucide-react";

interface WhyConnectedModalProps {
  data: WhyConnectedResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhyConnectedModal({
  data,
  isOpen,
  onClose,
}: WhyConnectedModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Signature Feature
              </span>
              <span className="flex items-center text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Archival Grounded Evidence
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{data.entity_a.canonical_name}</span>
              <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{data.entity_b.canonical_name}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Summary Pill */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            Connection Type:{" "}
            <span className="text-slate-200 font-medium">
              {data.direct_connection ? "Direct Archival Triple (1-hop)" : "Mediated Historical Path (2-hop)"}
            </span>
          </div>
          <div>
            Verified Citations:{" "}
            <span className="text-amber-400 font-semibold">{data.connections.length}</span>
          </div>
        </div>

        {/* Content Body: Verified Evidence Cards */}
        <div className="p-6 overflow-y-auto space-y-5">
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            {data.summary}
          </p>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Primary Archival Evidence
            </h3>

            {data.connections.map((conn: WhyConnectedEvidence, idx: number) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                {/* Triple Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-sm font-semibold">
                    <span className="text-amber-400">{conn.subject_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {conn.predicate.replace(/_/g, " ")}
                    </span>
                    <span className="text-sky-400">{conn.object_name}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 space-x-3">
                    <span className="flex items-center text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {conn.document_id || "Archival Source"}
                    </span>
                    {conn.page_number && (
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                        Page {conn.page_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Exact Verified Passage */}
                <div className="relative pl-4 border-l-2 border-amber-500/60 py-1 bg-amber-500/5 rounded-r-lg pr-3">
                  <p className="text-sm italic text-slate-200 leading-relaxed font-serif">
                    &ldquo;{conn.evidence_text}&rdquo;
                  </p>
                </div>

                {/* Actions: Deep Link to Archival Viewer & RAG */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 text-xs">
                  <span className="text-slate-500">
                    Confidence: {(conn.confidence * 100).toFixed(0)}% • Status: {conn.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/assistant?q=${encodeURIComponent(`Explain the archival connection between ${data.entity_a.canonical_name} and ${data.entity_b.canonical_name} based on ${conn.document_id} page ${conn.page_number}`)}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Ask AI Assistant
                    </Link>
                    <Link
                      href={conn.viewer_url || `/documents/${conn.document_id || "AMBEDKAR-VOL-01"}/viewer?page=${conn.page_number || 1}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      Open Exact Archival Page
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
