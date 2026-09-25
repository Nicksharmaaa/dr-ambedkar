'use client';

import React from 'react';
import { Home, ArrowLeft, Search, Volume2, VolumeX, Eye, X } from 'lucide-react';
import { Language, AccessibilitySettings } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';

interface KioskBarProps {
  onHome: () => void;
  onBack: () => void;
  onOpenSearch: () => void;
  accessibility: AccessibilitySettings;
  onToggleHighContrast: () => void;
  onChangeTextSize: (size: 'normal' | 'large' | 'xlarge') => void;
  onExitKiosk: () => void;
  language: Language;
}

export const KioskBar: React.FC<KioskBarProps> = ({
  onHome,
  onBack,
  onOpenSearch,
  accessibility,
  onToggleHighContrast,
  onChangeTextSize,
  onExitKiosk,
  language
}) => {
  const t = UI_STRINGS[language];
  const [muted, setMuted] = React.useState(false);

  return (
    <div className="sticky bottom-0 z-50 w-full bg-white border-t-2 border-[#0f2d59] px-4 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left Touch Controls: Back & Home */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="kiosk-touch-target px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 rounded font-semibold text-sm flex items-center gap-2 border border-slate-300 transition-all"
            aria-label="Previous Screen"
          >
            <ArrowLeft className="w-5 h-5 text-[#0f2d59]" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={onHome}
            className="kiosk-touch-target px-5 py-2.5 bg-[#0f2d59] hover:bg-[#163e75] active:bg-[#0b2244] text-white font-bold rounded text-sm flex items-center gap-2 shadow-sm transition-all"
            aria-label="Return to National Archive Home"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
        </div>

        {/* Center Kiosk Display Notice */}
        <div className="hidden md:flex flex-col items-center text-center">
          <span className="text-xs uppercase tracking-wider text-[#0f2d59] font-mono font-bold">
            Interactive Museum & Memorial Terminal
          </span>
          <span className="text-[11px] text-slate-500">
            Touchscreen Access · Dr. Ambedkar National Memorial
          </span>
        </div>

        {/* Right Touch Controls: Quick Search, Audio, Text Sizing, Exit Kiosk */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="kiosk-touch-target px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center gap-1.5 border border-slate-300 text-sm font-semibold"
            aria-label="Open Search"
          >
            <Search className="w-4 h-4 text-[#0f2d59]" />
            <span className="hidden lg:inline">Search</span>
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className="kiosk-touch-target p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center justify-center border border-slate-300"
            title={muted ? "Unmute Audio Narration" : "Mute Audio Narration"}
            aria-label="Toggle Volume"
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-600" /> : <Volume2 className="w-5 h-5 text-emerald-700" />}
          </button>

          {/* Text Size Touch Buttons */}
          <div className="hidden sm:flex items-center bg-slate-100 border border-slate-300 rounded p-0.5">
            <button
              onClick={() => onChangeTextSize('normal')}
              className={`px-2.5 py-1.5 text-xs rounded font-bold ${accessibility.textSize === 'normal' ? 'bg-[#0f2d59] text-white' : 'text-slate-700'}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => onChangeTextSize('large')}
              className={`px-2.5 py-1.5 text-sm rounded font-bold ${accessibility.textSize === 'large' ? 'bg-[#0f2d59] text-white' : 'text-slate-700'}`}
              title="Large Font Size"
            >
              A+
            </button>
            <button
              onClick={() => onChangeTextSize('xlarge')}
              className={`px-2.5 py-1.5 text-base rounded font-bold ${accessibility.textSize === 'xlarge' ? 'bg-[#0f2d59] text-white' : 'text-slate-700'}`}
              title="Extra Large Font Size"
            >
              A++
            </button>
          </div>

          <button
            onClick={onToggleHighContrast}
            className={`kiosk-touch-target px-3 py-2.5 rounded border flex items-center gap-1 text-xs font-semibold ${
              accessibility.highContrast
                ? 'bg-[#0f2d59] text-white border-[#0f2d59]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Toggle High Contrast Display"
            aria-label="High Contrast"
          >
            <Eye className="w-4 h-4 text-blue-900" />
            <span className="hidden xl:inline">Contrast</span>
          </button>

          <button
            onClick={onExitKiosk}
            className="kiosk-touch-target p-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded flex items-center justify-center border border-slate-300"
            title="Exit Kiosk Mode"
            aria-label="Exit Kiosk Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
