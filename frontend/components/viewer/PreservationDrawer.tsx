"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  X,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  History,
  FileCode,
  Building,
  Scale,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";

interface PreservationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  stableId: string;
  title: string;
  currentPage: number;
}

export function PreservationDrawer({
  isOpen,
  onClose,
  documentId,
  stableId,
  title,
  currentPage,
}: PreservationDrawerProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingFixity, setCheckingFixity] = useState(false);
  const [fixityResult, setFixityResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadEvents();
  }, [isOpen, documentId]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getPreservationEvents(documentId);
      setEvents(data);
    } catch (err) {
      console.error("Failed to load preservation events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFixityCheck = async () => {
    setCheckingFixity(true);
    try {
      const res = await api.runFixityCheck(documentId);
      setFixityResult(res);
      await loadEvents();
    } catch (err) {
      console.error("Fixity check failed", err);
    } finally {
      setCheckingFixity(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[999999] w-full max-w-md bg-slate-950/98 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Preservation Record</h2>
            <p className="text-[11px] font-mono text-slate-400">PREMIS 3.0 & Dublin Core</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300">
        {/* Document Provenance Summary */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Archival Object
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400">
              {stableId}
            </span>
          </div>
          <h3 className="font-serif font-bold text-slate-100 text-sm leading-snug">{title}</h3>

          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px]">
            <div className="flex items-center gap-2 text-slate-400">
              <Building className="h-3.5 w-3.5 text-slate-500" />
              <span>Government of Maharashtra / BAWS Archive</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Scale className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Public Domain (Historical Archive)</span>
            </div>
          </div>
        </div>

        {/* Fixity & Integrity Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Cryptographic Fixity
            </span>
            <button
              onClick={handleFixityCheck}
              disabled={checkingFixity}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-[10px] border border-emerald-500/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${checkingFixity ? "animate-spin" : ""}`} />
              <span>{checkingFixity ? "Verifying..." : "Verify Hash"}</span>
            </button>
          </div>

          {fixityResult && (
            <div
              className={`p-2.5 rounded-lg border text-[11px] font-mono ${
                fixityResult.status === "verified"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
              }`}
            >
              {fixityResult.status === "verified" ? "✓ Fixity Verified: SHA-256 Match" : "⚠ Fixity Check Failed"}
            </div>
          )}

          <div>
            <div className="text-[10px] font-mono text-slate-400 mb-1">SHA-256 Digest</div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800">
              <span className="font-mono text-[10px] text-amber-400 break-all select-all flex-1">
                {fixityResult?.computed_hash ||
                  events[0]?.file_hash_after ||
                  events[0]?.file_hash_before ||
                  "Verifiable via API"}
              </span>
              <button
                onClick={() =>
                  copyHash(
                    fixityResult?.computed_hash ||
                      events[0]?.file_hash_after ||
                      events[0]?.file_hash_before ||
                      ""
                  )
                }
                className="text-slate-400 hover:text-slate-200"
              >
                {copiedHash ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Machine-Readable Standards Links */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-2">
            Archival Formats & Standards
          </span>
          <div className="space-y-1.5 font-mono text-[11px]">
            <a
              href={`http://localhost:8000/api/v1/iiif/manifest/${documentId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5" />
                IIIF Presentation 3.0 Manifest
              </span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={`http://localhost:8000/api/v1/documents/${documentId}/alto/${currentPage}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5" />
                ALTO v4.2 XML (Page {currentPage})
              </span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* PREMIS 3.0 Event Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-amber-400" />
              PREMIS 3.0 Event Log ({events.length})
            </span>
            <button onClick={loadEvents} className="text-slate-400 hover:text-slate-200">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {events.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 font-mono text-xs">
              No events recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider bg-slate-800 text-amber-400 border border-slate-700">
                      {ev.event_type}
                    </span>
                    <span
                      className={`font-mono text-[10px] ${
                        ev.event_outcome === "success" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {ev.event_outcome}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs">{ev.event_detail}</p>

                  {ev.outcome_detail && (
                    <p className="text-slate-400 font-mono text-[10px] break-all">
                      {ev.outcome_detail}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] font-mono text-slate-500">
                    <span>{ev.agent_name}</span>
                    <span>
                      {ev.event_date ? new Date(ev.event_date).toLocaleTimeString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
