'use client';

import React from 'react';
import { AccessibilitySettings, Language, UserMode } from '@/types/museum';
import { soundEffects } from '@/utils/soundEffects';

interface TopUtilityBarProps {
  language?: Language;
  onSelectLanguage?: (lang: Language) => void;
  accessibility?: AccessibilitySettings;
  onToggleAccessibilityModal: () => void;
  onToggleSoundEffects?: () => void;
  onOpenSearch?: () => void;
  onOpenVoiceModal?: () => void;
  onReplayIntro?: () => void;
  userMode?: UserMode;
  onSelectUserMode?: (mode: UserMode) => void;
  onOpenAdmin?: () => void;
}

/**
 * Universal Accessibility SVG Icon
 * International symbol of universal accessibility & human dignity
 */
const UniversalAccessibilityIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer subtle guide ring */}
    <circle
      cx="12"
      cy="12"
      r="9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.35"
    />
    {/* Head */}
    <circle cx="12" cy="5" r="2.1" fill="currentColor" />
    {/* Outstretched arms of universal human inclusion */}
    <path
      d="M5 9.2 C 8.5 8.1, 15.5 8.1, 19 9.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Torso */}
    <path
      d="M12 8.8 L12 14.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Legs */}
    <path
      d="M12 14.5 L8.8 20.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 14.5 L15.2 20.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({
  accessibility,
  onToggleAccessibilityModal,
}) => {
  const isCustomActive = Boolean(
    accessibility?.highContrast ||
      accessibility?.audioNarrationActive ||
      (accessibility?.textSize && accessibility.textSize !== 'normal')
  );

  return (
    <header
      className="fixed top-3 sm:top-5 right-3 sm:right-6 z-[8900] select-none"
      aria-label="Universal Accessibility Settings"
    >
      <button
        type="button"
        onClick={() => {
          soundEffects.playClick();
          onToggleAccessibilityModal();
        }}
        className="group relative flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-2xl border border-[#D3D4C0] hover:border-[#C89D56] shadow-[0_4px_20px_rgba(10,41,71,0.06),0_1px_3px_rgba(10,41,71,0.04)] hover:shadow-[0_8px_30px_rgba(200,157,86,0.14)] transition-all duration-300 cursor-pointer active:scale-95 text-[#8B5E3C] hover:text-[#C89D56]"
        title="Accessibility & Reading Modes (Font Size, Contrast, Narration, Language)"
        aria-label="Open Accessibility & Reading Settings"
      >
        {/* Universal Accessibility Icon */}
        <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-108">
          <UniversalAccessibilityIcon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
        </div>

        {/* Active Preference Dot */}
        {isCustomActive && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C89D56] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8B5E3C] border-2 border-white" />
          </span>
        )}

        {/* Curatorial Tooltip */}
        <span className="absolute top-full mt-2 right-0 px-2.5 py-1 bg-[#0A2947] text-[#FAF7F0] text-[11px] font-montserrat font-medium rounded-xl shadow-xl border border-[#D3D4C0]/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          Accessibility Settings
        </span>
      </button>
    </header>
  );
};

export default TopUtilityBar;
