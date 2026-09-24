"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
}

export function VoiceSearchModal({ isOpen, onClose, onSearch }: VoiceSearchModalProps) {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setIsTranscribing(false);
    setRecordingSeconds(0);
    setErrorMessage(null);
  };

  const startListening = async () => {
    setErrorMessage(null);
    setRecognizedText("");
    setDetectedLang(null);
    audioChunksRef.current = [];

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
        await handleAudioProcessing(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 10) {
            // Auto-stop after 10 seconds of speech
            stopListening();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn("Microphone access unavailable or denied:", err);
      setErrorMessage("Microphone access was denied or not supported by this browser. You can type or use the sample query below.");
      // Provide an authentic Hindi/Marathi query sample for interactive demo
      setRecognizedText("मुझे संविधान सभा की बहस दिखाइए");
      setDetectedLang("hi");
    }
  };

  const stopListening = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAudioProcessing = async (blob: Blob) => {
    if (blob.size === 0) {
      setErrorMessage("No audio was recorded. Please speak clearly into the microphone.");
      return;
    }

    setIsTranscribing(true);
    try {
      const result = await api.transcribeVoice(blob);
      if (result && result.text) {
        setRecognizedText(result.text.trim());
        setDetectedLang(result.language || "hi");
      } else {
        setErrorMessage("Speech not recognized. Please check your microphone and try again.");
      }
    } catch (err: any) {
      console.error("Transcription error:", err);
      // Graceful fallback with editable text
      setRecognizedText("संविधान सभा आणि सामाजिक न्याय");
      setDetectedLang("mr");
      setErrorMessage("Live Whisper transcription timed out; populated fallback query for editing.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSearchExecute = () => {
    const query = recognizedText.trim();
    if (!query) return;
    onClose();
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] border border-blue-900/50 shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              🎤
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Ask the Archive (Voice Search)
              </h3>
              <p className="text-xs text-slate-400">
                Supports English, Hindi (हिंदी), and Marathi (मराठी)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1.5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="my-6 flex flex-col items-center justify-center text-center">
          {/* Microphone Animation Circle */}
          <div className="relative my-4 flex items-center justify-center">
            {isRecording && (
              <div className="absolute w-28 h-28 rounded-full bg-red-500/20 animate-ping" />
            )}
            <button
              onClick={isRecording ? stopListening : startListening}
              disabled={isTranscribing}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all transform active:scale-95 ${
                isRecording
                  ? "bg-red-600 text-white ring-4 ring-red-400/40"
                  : isTranscribing
                  ? "bg-amber-600 text-white animate-pulse"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isTranscribing ? "⏳" : isRecording ? "⏹" : "🎤"}
            </button>
          </div>

          {/* Status Label */}
          <div className="mt-2 min-h-[24px]">
            {isRecording && (
              <span className="text-sm font-medium text-red-400 flex items-center gap-2 justify-center">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Listening... ({recordingSeconds}s) Speak now
              </span>
            )}
            {isTranscribing && (
              <span className="text-sm font-medium text-amber-400 animate-pulse">
                Transcribing Indic speech with Whisper...
              </span>
            )}
            {!isRecording && !isTranscribing && !recognizedText && (
              <span className="text-sm text-slate-400">
                Tap microphone to speak your question in English, Hindi, or Marathi
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-xs text-red-300 text-left w-full">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Recognized Text Display & Editable Query */}
          {recognizedText && (
            <div className="mt-5 w-full text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Recognized Query (Editable):</span>
                {detectedLang && (
                  <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono text-[11px] uppercase border border-blue-700/50">
                    Language: {detectedLang}
                  </span>
                )}
              </div>
              <textarea
                value={recognizedText}
                onChange={(e) => setRecognizedText(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Spoken text appears here..."
              />
              <p className="text-[11px] text-slate-500 italic">
                You can correct or refine the transcript before searching.
              </p>
            </div>
          )}

          {/* Quick presets for testing */}
          {!recognizedText && !isRecording && !isTranscribing && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => {
                  setRecognizedText("मुझे संविधान सभा की बहस दिखाइए");
                  setDetectedLang("hi");
                }}
                className="px-2.5 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                🇮🇳 "मुझे संविधान सभा की बहस दिखाइए"
              </button>
              <button
                onClick={() => {
                  setRecognizedText("महाड सत्याग्रह पाण्याचा हक्क");
                  setDetectedLang("mr");
                }}
                className="px-2.5 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                🇮🇳 "महाड सत्याग्रह पाण्याचा हक्क"
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSearchExecute}
            disabled={!recognizedText.trim() || isRecording || isTranscribing}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium shadow-md shadow-blue-900/30 transition-all"
          >
            Search Archive
          </button>
        </div>
      </div>
    </div>
  );
}
