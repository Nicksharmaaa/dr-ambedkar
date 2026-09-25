'use client';

import React from 'react';
import { X, Type, Eye, Volume2, Globe, Keyboard, Check, ShieldCheck } from 'lucide-react';
import { AccessibilitySettings, Language } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessibility: AccessibilitySettings;
  onChangeTextSize: (size: 'normal' | 'large' | 'xlarge') => void;
  onToggleHighContrast: () => void;
  onToggleAudioNarration: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  accessibility,
  onChangeTextSize,
  onToggleHighContrast,
  onToggleAudioNarration,
  language,
  onSelectLanguage
}) => {
  if (!isOpen) return null;
  const t = UI_STRINGS[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white border border-slate-300 rounded-lg shadow-2xl p-6 text-slate-900 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#0f2d59]" />
            <h2 id="accessibility-title" className="text-xl font-bold font-editorial text-slate-900">
              {t.accessibility} Options (GIGW 3.0)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close accessibility settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Text Size Selection */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-600 font-bold mb-2 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[#0f2d59]" />
              <span>Text Scaling & Typography</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChangeTextSize('normal')}
                className={`py-2 px-3 rounded border text-sm font-semibold transition-colors flex items-center justify-center ${
                  accessibility.textSize === 'normal'
                    ? 'bg-[#0f2d59] text-white border-[#0f2d59]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Standard (A)
              </button>
              <button
                onClick={() => onChangeTextSize('large')}
                className={`py-2 px-3 rounded border text-base font-semibold transition-colors flex items-center justify-center ${
                  accessibility.textSize === 'large'
                    ? 'bg-[#0f2d59] text-white border-[#0f2d59]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Large (A+)
              </button>
              <button
                onClick={() => onChangeTextSize('xlarge')}
                className={`py-2 px-3 rounded border text-lg font-semibold transition-colors flex items-center justify-center ${
                  accessibility.textSize === 'xlarge'
                    ? 'bg-[#0f2d59] text-white border-[#0f2d59]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                X-Large (A++)
              </button>
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded">
            <div>
              <div className="text-sm font-bold text-slate-900">High Contrast Mode</div>
              <div className="text-xs text-slate-600">Increases contrast ratios for low-vision readers</div>
            </div>
            <button
              onClick={onToggleHighContrast}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                accessibility.highContrast ? 'bg-[#0f2d59] justify-end' : 'bg-slate-300 justify-start'
              }`}
              aria-label="Toggle high contrast"
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Audio Narration Global Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded">
            <div>
              <div className="text-sm font-bold text-slate-900">Screen Audio Narration</div>
              <div className="text-xs text-slate-600">Enable voice assistance for primary documents</div>
            </div>
            <button
              onClick={onToggleAudioNarration}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                accessibility.audioNarrationActive ? 'bg-[#0f2d59] justify-end' : 'bg-slate-300 justify-start'
              }`}
              aria-label="Toggle continuous audio narration"
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Primary Language */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-600 font-bold mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#0f2d59]" />
              <span>Language Selection</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSelectLanguage('en')}
                className={`py-2 px-3 rounded border text-sm font-semibold transition-colors flex items-center justify-between ${
                  language === 'en'
                    ? 'bg-blue-50 border-[#0f2d59] text-[#0f2d59]'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onSelectLanguage('hi')}
                className={`py-2 px-3 rounded border text-sm font-semibold transition-colors flex items-center justify-between ${
                  language === 'hi'
                    ? 'bg-blue-50 border-[#0f2d59] text-[#0f2d59]'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>हिंदी</span>
                {language === 'hi' && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onSelectLanguage('mr')}
                className={`py-2 px-3 rounded border text-sm font-semibold transition-colors flex items-center justify-between ${
                  language === 'mr'
                    ? 'bg-blue-50 border-[#0f2d59] text-[#0f2d59]'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>मराठी</span>
                {language === 'mr' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Compliance Badge */}
          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>GIGW 3.0 & W3C WCAG 2.1 AA Compliant</span>
            </span>
            <span>Esc to close</span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-[#0f2d59] hover:bg-[#163e75] text-white rounded transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
