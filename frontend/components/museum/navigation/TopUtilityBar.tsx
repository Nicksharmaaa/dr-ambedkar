'use client';

import React, { useState } from 'react';
import { 
  Search, Mic, Globe, Volume2, VolumeX, 
  Sliders, ShieldCheck, Film, ChevronDown, 
  Eye, GraduationCap, UserCheck, Key
} from 'lucide-react';
import { Language, AccessibilitySettings, UserMode } from '@/types/museum';
import { soundEffects } from '@/utils/soundEffects';

interface TopUtilityBarProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  accessibility: AccessibilitySettings;
  onToggleAccessibilityModal: () => void;
  onToggleSoundEffects?: () => void;
  onOpenSearch?: () => void;
  onOpenVoiceModal?: () => void;
  onReplayIntro?: () => void;
  userMode?: UserMode;
  onSelectUserMode?: (mode: UserMode) => void;
  onOpenAdmin?: () => void;
}

const USER_MODES: Array<{ id: UserMode; label: string; desc: string; icon: any }> = [
  { id: 'visitor', label: 'Visitor', desc: 'Narrative storytelling & exhibits', icon: Eye },
  { id: 'student', label: 'Student', desc: 'Guided exploration & educational trivia', icon: GraduationCap },
  { id: 'researcher', label: 'Researcher', desc: 'Full citations & PREMIS fixity checksums', icon: UserCheck },
  { id: 'archivist', label: 'Archivist', desc: 'OCR pipeline & digital preservation', icon: Key },
];

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({
  language,
  onSelectLanguage,
  accessibility,
  onToggleAccessibilityModal,
  onToggleSoundEffects,
  onOpenSearch,
  onOpenVoiceModal,
  onReplayIntro,
  userMode = 'visitor',
  onSelectUserMode,
  onOpenAdmin,
}) => {
  const [isModeOpen, setIsModeOpen] = useState(false);

  return (
    <header 
      className="fixed top-3 sm:top-5 right-3 sm:right-6 z-[8900] select-none flex items-center gap-1.5 sm:gap-2"
      aria-label="Secondary Actions & Tools"
    >
      <div 
        className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-white/95 backdrop-blur-2xl border-2 border-[#D3D4C0] shadow-xl text-[#0A2947]"
        style={{
          boxShadow: '0 10px 30px rgba(10, 41, 71, 0.1), 0 0 15px rgba(200, 157, 86, 0.06)',
        }}
      >
        {/* 1. Global Search Trigger */}
        <button
          onClick={() => {
            soundEffects.playClick();
            if (onOpenSearch) onOpenSearch();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white hover:border-[#C89D56] border border-[#D3D4C0] text-xs font-mono transition-all cursor-pointer"
          title="Search Archive (Ctrl+K or /)"
          aria-label="Open Global Search"
        >
          <Search className="w-3.5 h-3.5 text-[#8B5E3C]" />
          <span className="hidden md:inline text-[11px] uppercase tracking-wider font-semibold text-[#0A2947]">Search</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-mono text-[#0A2947]/60 bg-white rounded border border-[#D3D4C0]">
            /
          </kbd>
        </button>

        {/* 2. Voice Navigator Trigger */}
        {onOpenVoiceModal && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenVoiceModal();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0A2947] hover:bg-[#123B60] border border-[#0A2947] text-[#F3E4C9] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
            title="Voice Navigator: English, Hindi, Marathi"
            aria-label="Open Voice Navigator"
          >
            <Mic className="w-3.5 h-3.5 text-[#C89D56] animate-pulse" />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-[#F3E4C9]">Voice</span>
          </button>
        )}

        <div className="w-[1px] h-4 bg-[#D3D4C0] my-auto hidden sm:block" />

        {/* 3. Language Selector */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-xs font-mono">
          <Globe className="w-3 h-3 text-[#8B5E3C]" />
          <select
            id="top-language-select"
            name="top_language"
            aria-label="Select interface language"
            value={language}
            onChange={(e) => {
              soundEffects.playClick();
              onSelectLanguage(e.target.value as Language);
            }}
            className="bg-transparent text-[#0A2947] text-xs font-mono font-bold focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-white text-[#0A2947]">EN</option>
            <option value="hi" className="bg-white text-[#0A2947]">HI</option>
            <option value="mr" className="bg-white text-[#0A2947]">MR</option>
          </select>
        </div>

        {/* 4. Audio Narration & Sound Toggle */}
        <button
          onClick={() => {
            const nextState = !soundEffects.enabled;
            soundEffects.enabled = nextState;
            if (onToggleSoundEffects) onToggleSoundEffects();
          }}
          className="p-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#0A2947]/70 hover:text-[#0A2947] transition-colors cursor-pointer"
          title={soundEffects.enabled ? "Museum Audio: Enabled" : "Museum Audio: Muted"}
          aria-label="Toggle Museum Audio"
        >
          {soundEffects.enabled ? (
            <Volume2 className="w-4 h-4 text-[#8B5E3C]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#0A2947]/40" />
          )}
        </button>

        {/* 5. Accessibility Modal Trigger */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onToggleAccessibilityModal();
          }}
          className="p-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#0A2947]/70 hover:text-[#0A2947] transition-colors cursor-pointer hidden sm:block"
          title="Display, Font Size & High Contrast Settings"
          aria-label="Accessibility Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* 6. Curatorial User Mode Dropdown */}
        {onSelectUserMode && (
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsModeOpen(!isModeOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-[#D3D4C0] text-xs font-mono font-semibold transition-all cursor-pointer text-[#0A2947]"
              title="Curatorial User Mode"
              aria-expanded={isModeOpen}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C]" />
              <span className="capitalize text-[11px] text-[#0A2947]">{userMode}</span>
              <ChevronDown className={`w-3 h-3 text-[#8B5E3C] transition-transform ${isModeOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModeOpen && (
              <div 
                className="absolute top-full right-0 mt-2 w-56 bg-white border-2 border-[#C8C9B4] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                style={{ backgroundColor: '#FFFFFF', opacity: 1 }}
                onMouseLeave={() => setIsModeOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono text-[#8B5E3C] uppercase tracking-wider font-bold">
                  Archival Mode
                </div>
                {USER_MODES.map(m => {
                  const ModeIcon = m.icon;
                  const isSelected = userMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        soundEffects.playClick();
                        onSelectUserMode(m.id);
                        setIsModeOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[#FAF7F0] text-[#0A2947] border border-[#C89D56]'
                          : 'hover:bg-[#FAF7F0] text-[#0A2947]/80'
                      }`}
                    >
                      <div className="p-1 rounded-lg bg-[#FAF7F0] text-[#8B5E3C] mt-0.5 border border-[#D3D4C0]">
                        <ModeIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-[#0A2947]">{m.label}</div>
                        <div className="text-[10px] text-[#0A2947]/60 leading-tight font-sans">{m.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 7. Replay Prologue Video */}
        {onReplayIntro && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onReplayIntro();
            }}
            className="p-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#0A2947]/70 hover:text-[#0A2947] transition-colors cursor-pointer hidden xl:block"
            title="Replay 5s Exhibition Prologue Video"
            aria-label="Replay Museum Intro"
          >
            <Film className="w-4 h-4 text-[#8B5E3C]" />
          </button>
        )}

        {/* 8. Curatorial Administration Access Lock */}
        {onOpenAdmin && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenAdmin();
            }}
            className="p-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#0A2947]/50 hover:text-[#0A2947] transition-colors cursor-pointer"
            title="Curatorial Administration & Ingestion Pipeline"
            aria-label="Curatorial Administration"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
