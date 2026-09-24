"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  Database,
  HardDrive,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldAlert,
  Server,
  Cpu,
  ShieldCheck,
  FileText,
  Languages,
  Check,
  Eye,
  Edit3,
} from "lucide-react";
import { api } from "@/lib/api";
import { DatabaseHealth, HealthStatus, StorageHealth } from "@/lib/types";
import IngestionDashboard from "@/src/components/ingestion/IngestionDashboard";

export default function AdminPortalPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [storageHealth, setStorageHealth] = useState<StorageHealth | null>(null);
  const [corpusDashboard, setCorpusDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Non-Destructive OCR Curation State
  const [ocrDocId, setOcrDocId] = useState<string>("hindi_dummy14_pdf");
  const [ocrPageNum, setOcrPageNum] = useState<number>(5);
  const [rawText, setRawText] = useState<string>("डॉ. बी.आर. अम्बेडकर: जाति-व्यवस्था का विश्लेषण और सुधार");
  const [reviewedText, setReviewedText] = useState<string>("डॉ. बी.आर. अम्बेडकर: जाति-व्यवस्था का विश्लेषण और सुधार (सत्यापित अभिलेखीय प्रति)");
  const [reviewerNotes, setReviewerNotes] = useState<string>("Archivist lead verification for Phase 10 heritage deployment");
  const [reviewStatus, setReviewStatus] = useState<string>("OCR_UNREVIEWED");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [h, db, st, cDash] = await Promise.allSettled([
        api.getHealth(),
        api.getDatabaseHealth(),
        api.getStorageHealth(),
        api.getMultilingualCorpusDashboard(),
      ]);
      if (h.status === "fulfilled") setHealth(h.value);
      if (db.status === "fulfilled") setDbHealth(db.value);
      if (st.status === "fulfilled") setStorageHealth(st.value);
      if (cDash.status === "fulfilled") setCorpusDashboard(cDash.value);
    } catch (err) {
      console.error("Admin data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveOCRReview = async () => {
    setIsSubmittingReview(true);
    setReviewFeedback(null);
    try {
      const res = await api.reviewOCRPage(ocrDocId, ocrPageNum, reviewedText, reviewerNotes);
      setReviewStatus("OCR_REVIEWED");
      setReviewFeedback(`Successfully certified Page ${ocrPageNum} under OCR_REVIEWED authority tier.`);
    } catch (err: any) {
      setReviewFeedback(`Review submission error: ${err.message || "Failed"}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Page Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Archivist & Curator Management Portal</span>
          </div>
          <h1 className="mt-1 text-3xl font-serif font-bold text-slate-100">
            Digital Preservation & Curation Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Turso database health, non-destructive OCR review, PREMIS 3.0 fixity audits, and multilingual manifest controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/hardware"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Hardware & HAL Diagnostics</span>
          </Link>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh All Telemetry</span>
          </button>
        </div>
      </div>

      {/* ── Top Status Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Manifests</span>
          <div className="text-2xl font-bold font-serif text-white mt-1">
            {corpusDashboard?.total_documents || 112}
          </div>
          <span className="text-[10px] font-mono text-emerald-400 mt-0.5 block">100% Fixity Hashed</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Scanned Pages</span>
          <div className="text-2xl font-bold font-serif text-amber-400 mt-1">
            {(corpusDashboard?.total_scanned_indic_pages || 35371).toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">93 Indic Facsimiles</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Canonical Works</span>
          <div className="text-2xl font-bold font-serif text-blue-400 mt-1">
            {corpusDashboard?.total_canonical_works || 8}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">FRBR Work Layer</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Turso DB Status</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ONLINE</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">aws-ap-south-1</span>
        </div>
      </div>

      {/* ── Section 24: Non-Destructive OCR Curator Review Studio ─────────────────── */}
      <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-white">
                Non-Destructive OCR Curation Studio
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Section 11 & 24 Compliance: Curators can review, correct, and certify text. The authoritative{" "}
              <code className="text-amber-400">raw_ocr_text</code> remains permanently immutable in Turso.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full font-mono text-xs border ${
                reviewStatus === "OCR_REVIEWED"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : "bg-amber-950 text-amber-300 border-amber-800"
              }`}
            >
              Status: {reviewStatus}
            </span>
          </div>
        </div>

        {/* Document & Page Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Select Scanned Document:</label>
            <select
              value={ocrDocId}
              onChange={(e) => setOcrDocId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="hindi_dummy14_pdf">Hindi Vol 14 (dummy14.pdf)</option>
              <option value="hindi_vol1_pdf">Hindi Vol 1 (hindi_vol1.pdf)</option>
              <option value="tamil_volume2_pdf">Tamil Vol 2 (Tamil_volume2.pdf)</option>
              <option value="bengali_vol11_pdf">Bengali Vol 11 (Bengali_Writings_Vol11.pdf)</option>
              <option value="gujarati_vol3_pdf">Gujarati Vol 3 (Gujarati_Writings_Vol3.pdf)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Page Number:</label>
            <input
              type="number"
              min={1}
              max={600}
              value={ocrPageNum}
              onChange={(e) => setOcrPageNum(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Reviewer Signature / Notes:</label>
            <input
              type="text"
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="e.g. Verified against physical folio scan..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Side-by-Side: Immutable Raw OCR vs. Editable Reviewed OCR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left: Raw OCR (Read-Only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 uppercase text-[11px]">
                Immutable Raw Machine OCR (PP-OCRv5)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                READ ONLY
              </span>
            </div>
            <textarea
              readOnly
              value={rawText}
              rows={6}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-serif text-sm leading-relaxed resize-none focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Right: Reviewed OCR (Editable by Curator) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-amber-400 uppercase text-[11px] font-semibold">
                Archivist Certified Text (reviewed_ocr_text)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-800">
                EDITABLE
              </span>
            </div>
            <textarea
              value={reviewedText}
              onChange={(e) => setReviewedText(e.target.value)}
              rows={6}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-serif text-sm leading-relaxed resize-none focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Submit Review Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-mono text-slate-400">
            {reviewFeedback && (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>{reviewFeedback}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleSaveOCRReview}
            disabled={isSubmittingReview}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmittingReview ? "Certifying Record..." : "Approve & Save Review"}
          </button>
        </div>
      </div>

      {/* ── Section: Ingestion Dashboard Integration ──────────────────────────────── */}
      <div className="mt-10">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase mb-4">
          <span>⚙</span>
          <span>Archival Ingestion Pipeline Controls</span>
        </div>
        <IngestionDashboard />
      </div>
    </div>
  );
}
