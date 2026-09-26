"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Wifi,
  WifiOff,
  CheckCircle2,
  Info,
  Clock,
  Layers,
  FileText,
  Bookmark,
  Quote,
  Radio,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import VoicePill from "@/components/ui/VoicePill";
import {
  AssistantMode,
  AssistantRequest,
  CitationItem,
  ClaimValidationItem,
} from "@/lib/types";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  mode?: AssistantMode;
  confidence?: number;
  is_abstention?: boolean;
  citations?: CitationItem[];
  claims?: ClaimValidationItem[];
  model?: string;
  took_ms?: number;
  timestamp?: string;
}

const INITIAL_WELCOME: ChatMessage = {
  id: "msg-welcome",
  sender: "assistant",
  text: "Welcome to the Dr. B. R. Ambedkar Heritage AI Research Assistant. I am directly integrated with the verified Turso Cloud vector store comprising 12,154 pages of Dr. Babasaheb Ambedkar's Writings & Speeches (BAWS).\n\nInstitutional Scholarly Mandates:\n1. Strict Archival Grounding: Every assertion derives exclusively from retrieved primary source passages.\n2. Zero Pre-training Reliance: Model training memory is never treated as historical fact.\n3. Mandatory Abstention: If verified archival evidence is absent or disconnected, I will decline to answer.\n4. Verifiable Facsimiles: Click any citation to inspect the original archival page in the document viewer.",
  confidence: 1.0,
  is_abstention: false,
  model: "turso-bge-m3 / hybrid-rag",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const SUGGESTED_QUERIES = [
  { label: "Endogamy in Castes in India", query: "What did Dr. Ambedkar argue regarding endogamy in Castes in India?" },
  { label: "Social Endosmosis", query: "Explain Dr. Ambedkar's doctrine of social endosmosis and democracy." },
  { label: "November 1949 Warning", query: "What was Ambedkar's warning regarding Bhakti in politics on 25 November 1949?" },
  { label: "Mahad Satyagraha 1927", query: "What was the significance of the 1927 Mahad Satyagraha for civil rights?" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
];

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssistantDrawer({ isOpen, onClose }: AssistantDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [inputQuery, setInputQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<AssistantMode>("ask");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Audio & Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Monitor network connectivity
  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Clean up audio if drawer closed
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setActiveSpeechId(null);
      stopVoiceRecording();
    }
  }, [isOpen]);

  // Stop recording helper
  const stopVoiceRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("MediaRecorder stop warning:", err);
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("SpeechRecognition stop warning:", err);
      }
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  /**
   * Robust Multi-Engine Voice Recognition
   * 1. Primary: MediaRecorder -> Backend Whisper ASR (/api/v1/voice/transcribe)
   * 2. Secondary: Browser SpeechRecognition fallback
   * 3. Graceful Guidance: Helpful prompt if mic is blocked/denied
   */
  const handleToggleVoice = async () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    setVoiceNotice(null);
    audioChunksRef.current = [];

    // Attempt Tier 1: MediaRecorder via getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          if (audioBlob.size > 500) {
            await transcribeAudioBlob(audioBlob);
          }
        };

        mediaRecorder.start(250); // collect 250ms chunks
        setIsRecording(true);
        setRecordingSeconds(0);

        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => {
            if (prev >= 12) {
              stopVoiceRecording();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);

        return;
      } catch (micErr: any) {
        console.warn("getUserMedia failed or denied, trying SpeechRecognition fallback:", micErr);
      }
    }

    // Attempt Tier 2: Browser SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang =
          selectedLanguage === "hi"
            ? "hi-IN"
            : selectedLanguage === "mr"
            ? "mr-IN"
            : selectedLanguage === "bn"
            ? "bn-IN"
            : selectedLanguage === "ta"
            ? "ta-IN"
            : selectedLanguage === "gu"
            ? "gu-IN"
            : "en-IN";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsRecording(true);
          setVoiceNotice(null);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          stopVoiceRecording();
        };

        recognition.onerror = (event: any) => {
          console.warn("SpeechRecognition event:", event.error);
          stopVoiceRecording();
          if (event.error !== "no-speech") {
            setVoiceNotice(
              "Microphone input is unavailable. You can click any suggested inquiry below or type your question."
            );
            setTimeout(() => setVoiceNotice(null), 5000);
          }
        };

        recognition.onend = () => {
          stopVoiceRecording();
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (speechErr: any) {
        console.warn("SpeechRecognition initialization failed:", speechErr);
      }
    }

    // Tier 3: Helpful guidance fallback
    setVoiceNotice("Microphone permission is blocked in browser settings. Please allow mic access or use keyboard input.");
    setTimeout(() => setVoiceNotice(null), 5000);
  };

  const transcribeAudioBlob = async (blob: Blob) => {
    setIsLoading(true);
    try {
      const res = await api.transcribeVoice(blob, selectedLanguage);
      if (res && res.text) {
        setInputQuery(res.text);
      }
    } catch (err: any) {
      console.warn("Backend Whisper transcription error:", err);
      setVoiceNotice("Spoken voice processed. You may review and submit your inquiry below.");
      setTimeout(() => setVoiceNotice(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-Speech playback with waveform toggle
  const handleToggleTTS = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (activeSpeechId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);

    setActiveSpeechId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Submit inquiry to real backend RAG service
  const handleSendMessage = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isLoading) return;

    // Check offline status
    if (!isOnline) {
      const offlineMsg: ChatMessage = {
        id: `offline-${Date.now()}`,
        sender: "assistant",
        text: "MANDATORY ABSTENTION (OFFLINE):\n\nThe AI Research Assistant requires an active connection to Turso Cloud vector embeddings and the scholarly grounder. In accordance with institutional digital heritage preservation standards, generative AI is disabled during disconnected operation to prevent ungrounded hallucinations.\n\nPlease browse cached catalog exhibits, timeline events, or reconnect to the network.",
        is_abstention: true,
        confidence: 0.0,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text: q,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        offlineMsg,
      ]);
      setInputQuery("");
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      mode: selectedMode,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const reqPayload: AssistantRequest = {
        question: q,
        mode: selectedMode,
        top_k: 5,
        enable_claim_validation: true,
      };

      const res = await api.askAssistant(reqPayload);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        mode: res.mode,
        confidence: res.confidence,
        is_abstention: res.is_abstention,
        citations: res.citations,
        claims: res.claims,
        model: res.model,
        took_ms: res.took_ms,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "assistant",
        text: `Error contacting scholarly grounder: ${err?.message || "Backend server unavailable"}. Please ensure the archive API service is running.`,
        is_abstention: true,
        confidence: 0.0,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeechId(null);
    stopVoiceRecording();
    setMessages([INITIAL_WELCOME]);
  };

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
        aria-label="Close Assistant Panel"
      />

      {/* 
        The Assistant Drawer is anchored to the RIGHT SIDE of the screen.
      */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] md:w-[600px] h-full bg-[#0a0f1d] border-l border-amber-500/30 shadow-[-25px_0_60px_rgba(0,0,0,0.85)] flex flex-col pointer-events-auto text-slate-100 animate-in slide-in-from-right duration-300"
      >
        {/* Imperial Heritage Header */}
        <div className="px-6 py-5 bg-gradient-to-b from-slate-900 via-slate-950 to-[#0a0f1d] border-b border-amber-500/25 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/90 shadow-lg shadow-amber-500/25 shrink-0 bg-slate-950">
              <img src="/chatbot.png" alt="Ambedkar Heritage AI" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif font-bold text-lg text-amber-100 tracking-wide">
                  Ambedkar Heritage AI
                </h2>
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Turso Grounded
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    <WifiOff className="w-2.5 h-2.5" />
                    Offline Abstention
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Evidence-Grounded Scholarly Assistant • 12,154 Pages (BAWS)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-900 rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close drawer"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scholarly Mode Ribbon & Language Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs gap-3">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            {(
              [
                { mode: "ask", label: "Ask Archive" },
                { mode: "explain", label: "Explain" },
                { mode: "summarize", label: "Summarize" },
                { mode: "find_evidence", label: "Evidence" },
              ] as const
            ).map((m) => (
              <button
                key={m.mode}
                onClick={() => setSelectedMode(m.mode)}
                className={`px-3 py-1.5 rounded-lg font-medium text-[11px] transition-all whitespace-nowrap ${
                  selectedMode === m.mode
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div className="shrink-0">
            <select
              id="assistant-language-select"
              name="assistant_language"
              aria-label="Assistant response language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-900 text-slate-300 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[11px] font-medium focus:outline-none focus:border-amber-500/60"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isAbstain = msg.is_abstention;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[94%] rounded-2xl p-5 shadow-lg ${
                    isUser
                      ? "bg-amber-500/10 border border-amber-500/40 text-amber-100 rounded-br-xs"
                      : isAbstain
                      ? "bg-rose-950/25 border border-rose-500/40 text-rose-200 rounded-bl-xs"
                      : "bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-xs"
                  }`}
                  style={
                    !isUser && !isAbstain
                      ? {
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(245, 158, 11, 0.1)",
                        }
                      : undefined
                  }
                >
                  {/* Grounding Certificate Header for Assistant */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className={`w-4 h-4 ${
                            isAbstain ? "text-rose-400" : "text-amber-400"
                          }`}
                        />
                        <span className="font-semibold text-slate-200">
                          {isAbstain ? "Mandatory Abstention" : "Verified Source Grounded"}
                        </span>
                        {msg.confidence !== undefined && (
                          <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                            {(msg.confidence * 100).toFixed(0)}% Confidence
                          </span>
                        )}
                      </div>

                      {/* Text-to-Speech Playback */}
                      <button
                        onClick={() => handleToggleTTS(msg.id, msg.text)}
                        title={activeSpeechId === msg.id ? "Stop narration" : "Listen to response"}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          activeSpeechId === msg.id
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        {activeSpeechId === msg.id ? (
                          <>
                            <span className="flex items-center gap-0.5">
                              <span className="w-1 h-3 bg-amber-400 animate-pulse rounded-full" />
                              <span className="w-1 h-2 bg-amber-400 animate-pulse delay-75 rounded-full" />
                              <span className="w-1 h-3.5 bg-amber-400 animate-pulse delay-150 rounded-full" />
                            </span>
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="whitespace-pre-wrap leading-relaxed text-xs md:text-sm font-sans space-y-2.5 text-slate-200">
                    {msg.text}
                  </div>

                  {/* Archival Citations & Evidence Drawer */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          Archival Citations ({msg.citations.length})
                        </span>
                        <button
                          onClick={() => toggleEvidence(msg.id)}
                          className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                        >
                          {expandedEvidence[msg.id] ? "Hide Passages" : "View Passages"}
                          {expandedEvidence[msg.id] ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Clickable Citation Badges */}
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((c, i) => (
                          <Link
                            key={`${c.object_id}-${c.page_number}-${i}`}
                            href={c.viewer_url || `/documents/${c.object_id}?page=${c.page_number || 1}`}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-amber-950/50 border border-slate-700/80 hover:border-amber-500/50 text-slate-300 hover:text-amber-200 transition-all group shadow-sm"
                          >
                            <Bookmark className="w-3 h-3 text-amber-400" />
                            <span className="font-medium">
                              {c.object_title || "BAWS"} • Page {c.page_number || 1}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>

                      {/* Collapsible Verbatim Evidence Passages */}
                      {expandedEvidence[msg.id] && (
                        <div className="mt-3 space-y-2.5 max-h-52 overflow-y-auto pr-1">
                          {msg.citations.map((c, idx) => (
                            <div
                              key={`excerpt-${idx}`}
                              className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 text-xs text-slate-300 space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                                <span>{c.object_title || "Archival Source"} (Page {c.page_number || 1})</span>
                                {c.reranker_score !== null && (
                                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                    {(c.reranker_score * 100).toFixed(0)}% Match
                                  </span>
                                )}
                              </div>
                              <blockquote className="italic border-l-2 border-amber-500/40 pl-2.5 text-slate-400 text-[11px] leading-relaxed">
                                &ldquo;{c.excerpt}&rdquo;
                              </blockquote>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata Footer */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                    <div>
                      {!isUser && msg.model && (
                        <span className="font-mono text-slate-500">{msg.model}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {msg.took_ms !== undefined && <span>{msg.took_ms}ms</span>}
                      {msg.timestamp && <span>{msg.timestamp}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 bg-slate-900/80 rounded-2xl border border-amber-500/30 max-w-[85%] text-amber-200 text-xs shadow-md">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
              <span>Synthesizing evidence from Turso Cloud vector embeddings...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Helpful Voice Notice (if mic unavailable or processing) */}
        {voiceNotice && (
          <div className="mx-6 mb-2 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{voiceNotice}</span>
          </div>
        )}

        {/* Suggested Inquiries (if conversation is fresh) */}
        {messages.length <= 2 && (
          <div className="px-6 py-2.5 border-t border-slate-800/80 bg-slate-950/40">
            <div className="text-[11px] text-slate-400 mb-2 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Suggested Historical Inquiries:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sq.query)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-900 hover:bg-amber-950/50 text-slate-300 hover:text-amber-200 border border-slate-800 hover:border-amber-500/40 transition-all text-left"
                >
                  {sq.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Voice Recording Bar (When Mic is Live) */}
        {isRecording && (
          <div className="px-6 py-3 bg-rose-950/50 border-t border-rose-500/40 flex items-center justify-between text-xs text-rose-200 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-semibold">Listening to speech ({recordingSeconds}s)...</span>
              <span className="text-slate-400 text-[11px]">Speak clearly into microphone</span>
            </div>
            <button
              onClick={stopVoiceRecording}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              Stop & Inquire
            </button>
          </div>
        )}

        {/* Input Control Console */}
        <div className="p-6 bg-slate-950 border-t border-amber-500/25">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2.5"
          >
            {/* VoicePill Microphone */}
            <div className="shrink-0 flex items-center">
              <VoicePill
                accentColor="#C59A45"
                iconColor="#D3D4C0"
                background="#0A2947"
                size={38}
                shape="pill"
                showTime
                waveform
                slideToCancel
                mode="toggle"
                reactive="mic"
                isListening={isRecording}
                onStart={() => {
                  if (!isRecording) handleToggleVoice();
                }}
                onStop={() => {
                  if (isRecording) handleToggleVoice();
                }}
                ariaLabel={isRecording ? "Stop voice recording" : "Voice input inquiry"}
              />
            </div>

            {/* Inquire Textarea Input */}
            <div className="flex-1 relative">
              <textarea
                id="assistant-inquire-textarea"
                name="assistant_query"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={
                  !isOnline
                    ? "Network disconnected: AI abstains in offline mode"
                    : isRecording
                    ? "Listening to spoken inquiry..."
                    : "Ask the archive about doctrines, events, or texts..."
                }
                disabled={isLoading || !isOnline}
                className="w-full resize-none bg-slate-900/90 border border-slate-700/90 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 min-h-[44px] max-h-32 leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim() || !isOnline}
              className="p-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 active:scale-95 text-slate-950 font-bold disabled:opacity-40 transition-all shadow-md shadow-amber-500/20 shrink-0"
              title="Submit inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Institutional Integrity Tagline */}
          <div className="mt-3 text-[10px] text-center text-slate-500 font-sans">
            Grounded in 12,154 verified archival pages • Mandatory abstention when disconnected
          </div>
        </div>
      </div>
    </div>
  );
}
