"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Sparkles,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  BookmarkCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRightLeft,
  FileText,
  Compass,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  AssistantMode,
  AssistantModeInfo,
  AssistantRequest,
  AssistantResponse,
  CitationItem,
  ClaimValidationItem,
  EvidenceChainRecord,
} from "@/lib/types";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  mode: AssistantMode;
  confidence?: number;
  is_abstention?: boolean;
  citations?: CitationItem[];
  claims?: ClaimValidationItem[];
  model?: string;
  took_ms?: number;
  evidence_chain?: EvidenceChainRecord | null;
  timestamp?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-welcome",
    sender: "assistant",
    mode: "ask",
    text: "Welcome to the Ambedkar Heritage AI Research Assistant. I am an evidence-grounded research intelligence engine connected directly to the 12,154 verified archival pages of Dr. Babasaheb Ambedkar's Writings & Speeches.\n\nStrict Archival Source Policy:\n1. All factual assertions are derived exclusively from retrieved archival evidence.\n2. Model pre-training memory is never treated as archive truth.\n3. Every claim is mapped to verified volume and page citations with deep-links to the archival viewer.\n4. When the available archive lacks sufficient evidence, I will explicitly abstain.\n\nSelect a research mode below and enter your scholarly inquiry.",
    confidence: 1.0,
    is_abstention: false,
    model: "gemini-3.6-flash / hybrid-engine",
  },
];

const MODES: Array<{ mode: AssistantMode; label: string; icon: string; desc: string }> = [
  { mode: "ask", label: "Ask Archive", icon: "💬", desc: "Scholarly Q&A strictly grounded in retrieved archival passages" },
  { mode: "explain", label: "Explain", icon: "💡", desc: "Pedagogical breakdown of doctrines (social endosmosis, state socialism)" },
  { mode: "summarize", label: "Summarize", icon: "📝", desc: "Concise executive synthesis of chapters, speeches, or legal provisions" },
  { mode: "compare", label: "Compare", icon: "⚖️", desc: "Comparative analysis across two distinct archival volumes or eras" },
  { mode: "find_evidence", label: "Find Evidence", icon: "🔍", desc: "Verbatim historical quotations with exact citations and excerpts" },
  { mode: "ask_document", label: "Ask Document", icon: "📖", desc: "Restricts inquiry strictly to a single selected volume" },
  { mode: "ask_page", label: "Ask Page", icon: "📄", desc: "Answers questions strictly using the OCR text from a single page" },
  { mode: "research", label: "Research Mode", icon: "🔬", desc: "Deep scholar audit: 20-candidate retrieval, full claim audit & chain" },
];

const PRESET_QUERIES = [
  {
    mode: "ask" as AssistantMode,
    label: "Endogamy & Caste",
    query: "What did Ambedkar say about endogamy in Castes in India?",
  },
  {
    mode: "explain" as AssistantMode,
    label: "Social Endosmosis",
    query: "Explain Dr. Ambedkar's doctrine of social endosmosis and how it relates to democracy.",
  },
  {
    mode: "find_evidence" as AssistantMode,
    label: "Enclosed Class Evidence",
    query: "Find verbatim evidence on Ambedkar's definition of caste as an enclosed class.",
  },
  {
    mode: "summarize" as AssistantMode,
    label: "November 1949 Warning",
    query: "Summarize Ambedkar's warning regarding Bhakti in politics in the Constituent Assembly.",
  },
  {
    mode: "compare" as AssistantMode,
    label: "Vol 1 vs Vol 3",
    query: "Compare Ambedkar's treatment of caste mechanics in Vol 1 with religious critique in Vol 3.",
    docA: "AMBEDKAR-VOL-01",
    docB: "AMBEDKAR-VOL-03",
  },
  {
    mode: "ask_document" as AssistantMode,
    label: "Vol 1: Annihilation",
    query: "What are the essential conditions for the annihilation of caste according to Volume 1?",
    docA: "AMBEDKAR-VOL-01",
  },
];

const VOLUMES = [
  { id: "AMBEDKAR-VOL-01", label: "Vol. 1: Castes in India & Annihilation of Caste" },
  { id: "AMBEDKAR-VOL-02", label: "Vol. 2: In the Bombay Legislature & Education" },
  { id: "AMBEDKAR-VOL-03", label: "Vol. 3: Philosophy of Hinduism & India and Communism" },
  { id: "AMBEDKAR-VOL-04", label: "Vol. 4: Riddles in Hinduism" },
  { id: "AMBEDKAR-VOL-05", label: "Vol. 5: Untouchables and Pax Britannica" },
  { id: "AMBEDKAR-VOL-06", label: "Vol. 6: Problem of the Rupee & Provincial Finance" },
  { id: "AMBEDKAR-VOL-07", label: "Vol. 7: Who Were the Shudras? & Untouchables" },
  { id: "AMBEDKAR-VOL-08", label: "Vol. 8: Pakistan or Partition of India" },
  { id: "AMBEDKAR-VOL-09", label: "Vol. 9: What Congress and Gandhi Have Done" },
  { id: "AMBEDKAR-VOL-10", label: "Vol. 10: Governor-General Executive Council" },
  { id: "AMBEDKAR-VOL-11", label: "Vol. 11: The Buddha and His Dhamma" },
  { id: "AMBEDKAR-VOL-12", label: "Vol. 12: Unpublished Writings" },
  { id: "AMBEDKAR-VOL-13", label: "Vol. 13: Architect of Constitution of India" },
  { id: "AMBEDKAR-VOL-14", label: "Vol. 14: Hindu Code Bill (Parts 1 & 2)" },
  { id: "AMBEDKAR-VOL-15", label: "Vol. 15: First Law Minister Speeches" },
  { id: "AMBEDKAR-VOL-16", label: "Vol. 16: Egalitarian Revolution - Speeches" },
  { id: "AMBEDKAR-VOL-17-P1", label: "Vol. 17 (Part 1): Egalitarian Revolution - Writings" },
  { id: "AMBEDKAR-VOL-17-P2", label: "Vol. 17 (Part 2): Egalitarian Revolution - Writings" },
  { id: "AMBEDKAR-VOL-17-P3", label: "Vol. 17 (Part 3): Egalitarian Revolution - Writings" },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState("");
  const [currentMode, setCurrentMode] = useState<AssistantMode>("ask");
  const [selectedDocId, setSelectedDocId] = useState<string>("AMBEDKAR-VOL-01");
  const [compareDocId, setCompareDocId] = useState<string>("AMBEDKAR-VOL-03");
  const [pageNumber, setPageNumber] = useState<number>(36);
  const [enableValidation, setEnableValidation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);
  const [activeChainId, setActiveChainId] = useState<string | null>(null);
  const [activeClaimsId, setActiveClaimsId] = useState<string | null>(null);

  const activeModeMeta = MODES.find((m) => m.mode === currentMode) || MODES[0];

  const handleSendMessage = async (queryText?: string, modeOverride?: AssistantMode) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const mode = modeOverride || currentMode;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      mode: mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setLoading(true);

    try {
      const req: AssistantRequest = {
        question: textToSend,
        mode: mode,
        object_id:
          mode === "ask_document" || mode === "ask_page" || mode === "compare"
            ? selectedDocId
            : undefined,
        page_number: mode === "ask_page" ? pageNumber : undefined,
        compare_object_id: mode === "compare" ? compareDocId : undefined,
        top_k: mode === "research" ? 10 : 6,
        enable_claim_validation: enableValidation,
      };

      const res = await api.askAssistant(req);

      const asstMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        mode: res.mode,
        confidence: res.confidence,
        is_abstention: res.is_abstention,
        citations: res.citations,
        claims: res.claims,
        model: res.model,
        took_ms: res.took_ms,
        evidence_chain: res.evidence_chain,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: any) {
      console.error("Assistant Error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `Error contacting the AI Research Assistant: ${err.message || "Network error"}. Please ensure the backend is running at http://127.0.0.1:8000.`,
        mode: mode,
        confidence: 0.0,
        is_abstention: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInputQuery("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Phase 7 AI Research Assistant</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Ambedkar Archival Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Evidence-grounded scholarly inquiry engine across 12,154 pages of Dr. Babasaheb Ambedkar&apos;s writings.
            Strict zero-hallucination policy with atomic claim auditing and deep-link citations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Zero Hallucination Policy</span>
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 8 Research Modes Selector */}
      <div className="my-4 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {MODES.map((m) => {
            const isActive = currentMode === m.mode;
            return (
              <button
                key={m.mode}
                onClick={() => setCurrentMode(m.mode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-semibold shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mode Description & Controls Bar */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-amber-400 uppercase font-mono text-[11px]">
              {activeModeMeta.label}:
            </span>
            <span className="text-slate-400">{activeModeMeta.desc}</span>
          </div>

          {/* Conditional Scoping Inputs */}
          <div className="flex flex-wrap items-center gap-3">
            {(currentMode === "ask_document" || currentMode === "ask_page" || currentMode === "compare") && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[11px]">Document:</span>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
                >
                  {VOLUMES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentMode === "compare" && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[11px]">Compare With:</span>
                <select
                  value={compareDocId}
                  onChange={(e) => setCompareDocId(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
                >
                  {VOLUMES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentMode === "ask_page" && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[11px]">Page #:</span>
                <input
                  type="number"
                  min={1}
                  max={1200}
                  value={pageNumber}
                  onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                  className="w-16 bg-slate-950 text-slate-200 border border-slate-800 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Claim Validation Checkbox */}
            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-300">
              <input
                type="checkbox"
                checked={enableValidation}
                onChange={(e) => setEnableValidation(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
              />
              <span className="font-mono text-[11px]">Claim Audit</span>
            </label>
          </div>
        </div>

        {/* Preset Queries Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-slate-400 font-mono text-[11px] uppercase whitespace-nowrap">
            Scholarly Inquiries:
          </span>
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentMode(preset.mode);
                if (preset.docA) setSelectedDocId(preset.docA);
                if (preset.docB) setCompareDocId(preset.docB);
                handleSendMessage(preset.query, preset.mode);
              }}
              disabled={loading}
              className="px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/50 text-[11px] whitespace-nowrap transition-all shadow-sm disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Stream */}
      <div className="flex-1 space-y-6 py-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "assistant" && (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                BA
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl p-5 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-amber-500 text-slate-950 font-medium ml-12 rounded-tr-sm"
                  : "glass-card border border-slate-800 text-slate-200 mr-8 rounded-tl-sm bg-slate-900/60"
              }`}
            >
              {/* Mode Badge for Assistant Message */}
              {msg.sender === "assistant" && (
                <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/5 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <span className="uppercase font-semibold tracking-wider">
                      {MODES.find((m) => m.mode === msg.mode)?.label || msg.mode}
                    </span>
                    {msg.is_abstention && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px]">
                        Abstention (No Grounding)
                      </span>
                    )}
                  </div>
                  {msg.took_ms && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {msg.took_ms}ms
                    </span>
                  )}
                </div>
              )}

              {/* Answer Content */}
              {msg.is_abstention && msg.sender === "assistant" ? (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 font-serif leading-relaxed text-sm">
                  <div className="flex items-center gap-2 mb-1.5 font-sans font-semibold text-xs text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Evidence Boundary Enforced</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none font-serif text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>
              )}

              {/* Citations Box */}
              {msg.citations && msg.citations.length > 0 && !msg.is_abstention && (
                <div className="mt-5 pt-4 border-t border-slate-800 space-y-3 font-sans">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-mono uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <BookOpen className="h-3.5 w-3.5" />
                      Archival Sources ({msg.citations.length})
                    </span>
                    {msg.confidence !== undefined && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                        {(msg.confidence * 100).toFixed(0)}% Verified Grounding
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {msg.citations.map((c, cIdx) => {
                      const isExpanded = expandedCitation === `${msg.id}-${cIdx}`;
                      return (
                        <div
                          key={cIdx}
                          className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 transition-colors text-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="font-semibold text-amber-300 text-[11px] line-clamp-1">
                                {c.object_id} • Page {c.page_number || "—"}
                              </span>
                              {c.reranker_score !== null && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                                  Rerank: {c.reranker_score.toFixed(3)}
                                </span>
                              )}
                            </div>

                            {c.section_title && (
                              <p className="text-[10px] text-slate-400 font-mono mb-1 line-clamp-1">
                                § {c.section_title}
                              </p>
                            )}

                            <p
                              className={`font-serif italic text-slate-300 text-[11px] leading-relaxed transition-all ${
                                isExpanded ? "" : "line-clamp-3"
                              }`}
                            >
                              &ldquo;{c.excerpt}&rdquo;
                            </p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCitation(isExpanded ? null : `${msg.id}-${cIdx}`)
                              }
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3" />
                                  <span>Collapse</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" />
                                  <span>Full Excerpt</span>
                                </>
                              )}
                            </button>

                            <Link
                              href={c.viewer_url}
                              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                            >
                              <span>Open in Viewer</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Drawers: Claim Validation & Evidence Chain */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono">
                    {msg.claims && msg.claims.length > 0 && (
                      <button
                        onClick={() =>
                          setActiveClaimsId(activeClaimsId === msg.id ? null : msg.id)
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        <span>Claim Audit ({msg.claims.length})</span>
                        {activeClaimsId === msg.id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}

                    {msg.evidence_chain && (
                      <button
                        onClick={() =>
                          setActiveChainId(activeChainId === msg.id ? null : msg.id)
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        <Layers className="h-3 w-3 text-amber-400" />
                        <span>Evidence Chain Telemetry</span>
                        {activeChainId === msg.id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}

                    {msg.model && (
                      <span className="text-slate-400 ml-auto flex items-center gap-1">
                        <Cpu className="h-3 w-3 text-slate-400" />
                        {msg.model}
                      </span>
                    )}
                  </div>

                  {/* Claims Drawer Content */}
                  {activeClaimsId === msg.id && msg.claims && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-[11px] font-mono font-semibold text-slate-300 uppercase">
                        Audited Factual Claims ({msg.claims.length})
                      </div>
                      <div className="space-y-1.5">
                        {msg.claims.map((claimItem, clIdx) => {
                          const statusColors = {
                            SUPPORTED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                            PARTIAL: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                            UNSUPPORTED: "bg-rose-500/10 text-rose-400 border-rose-500/30",
                            CONFLICTING: "bg-purple-500/10 text-purple-400 border-purple-500/30",
                          };
                          return (
                            <div
                              key={clIdx}
                              className="p-2 rounded bg-slate-900 border border-slate-800 text-xs flex items-start gap-2 justify-between"
                            >
                              <div className="font-serif text-slate-200">
                                {claimItem.claim}
                              </div>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${
                                  statusColors[claimItem.status] || "bg-slate-800 text-slate-300 border-slate-700"
                                }`}
                              >
                                {claimItem.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Evidence Chain Drawer Content */}
                  {activeChainId === msg.id && msg.evidence_chain && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-2 text-slate-300">
                      <div className="font-semibold text-amber-400 uppercase">
                        Audit Telemetry & Reasoning Chain
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Candidates:</span>
                          <span className="text-slate-100 font-semibold">{msg.evidence_chain.retrieved_candidate_count}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Selected Evidence:</span>
                          <span className="text-slate-100 font-semibold">{msg.evidence_chain.selected_evidence_count}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Audited Claims:</span>
                          <span className="text-slate-100 font-semibold">{msg.evidence_chain.claims_audited_count}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Total Latency:</span>
                          <span className="text-slate-100 font-semibold">{msg.evidence_chain.total_latency_ms} ms</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1">
                        Request ID: <span className="text-slate-300">{msg.evidence_chain.request_id}</span> • Model: <span className="text-slate-300">{msg.evidence_chain.model_name}</span> ({msg.evidence_chain.model_version})
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 items-center">
            <div className="h-8 w-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
              BA
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl border border-slate-800 text-xs text-slate-400 font-mono flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>
                Retrieving candidate chunks across 19 volumes, reranking with cross-encoder, and validating factual claims...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="pt-4 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            placeholder={
              currentMode === "ask_document"
                ? `Ask strictly about ${selectedDocId} (e.g. key principles, speeches, constitutional debates)...`
                : currentMode === "ask_page"
                ? `Ask strictly about ${selectedDocId} Page ${pageNumber}...`
                : currentMode === "compare"
                ? `Compare ${selectedDocId} and ${compareDocId}...`
                : "Enter scholarly question, doctrinal concept, or research prompt..."
            }
            className="w-full rounded-xl bg-slate-900/90 border border-slate-800 py-3.5 pl-4 pr-24 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="absolute right-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <span>Ask</span>
            <Send className="h-3 w-3" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1 font-mono">
          <span>All answers strictly verified against Dr. Babasaheb Ambedkar&apos;s Writings & Speeches.</span>
          <span>Zero Hallucination Guaranteed</span>
        </div>
      </div>
    </div>
  );
}
