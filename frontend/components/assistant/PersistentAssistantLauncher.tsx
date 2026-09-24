"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, MessageSquareQuote, WifiOff } from "lucide-react";
import AssistantDrawer from "./AssistantDrawer";

/**
 * PersistentAssistantLauncher
 *
 * CRITICAL ARCHITECTURAL INVARIANT:
 * This launcher MUST remain anchored strictly in the BOTTOM-LEFT CORNER (fixed bottom-6 left-6 z-[9999]).
 * It is persistently mounted in the root layout to provide instant access to the
 * Turso-grounded AI Research Assistant from any page across the entire archive.
 */
export default function PersistentAssistantLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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

  return (
    <>
      {/* 
        Persistent AI Research Assistant Launcher anchored on the BOTTOM-RIGHT CORNER
        (fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]).
      */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] pointer-events-auto">
        {/* Subtle pulsing aura ring */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/40 via-amber-400/20 to-amber-600/40 blur-sm animate-pulse pointer-events-none" />

        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Dr. Ambedkar Heritage AI Research Assistant"
          title="Ask the Archive (Grounded Scholarly AI Assistant)"
          className="relative group h-14 min-w-[56px] px-4 sm:px-5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-2xl border border-amber-300/60 flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          style={{
            boxShadow: "0 10px 30px -5px rgba(217, 119, 6, 0.45), 0 0 20px rgba(245, 158, 11, 0.25)",
          }}
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-slate-950/20">
            <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform duration-300" />
            {/* Status indicator dot */}
            <span
              className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
          </div>

          <span className="text-xs sm:text-sm tracking-wide font-sans select-none hidden sm:inline-block font-bold">
            Ask the Archive
          </span>

          {!isOnline && (
            <span title="Offline Mode (Abstention Active)">
              <WifiOff className="w-3.5 h-3.5 text-slate-900 opacity-80" />
            </span>
          )}
        </button>
      </div>

      {/* The Assistant Drawer */}
      <AssistantDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
