'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Language } from '@/types/museum';
import { soundEffects } from '@/utils/soundEffects';

interface LanguageOption {
  id: Language;
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'en', code: 'EN', name: 'English', nativeName: 'English' },
  { id: 'hi', code: 'HI', name: 'Hindi', nativeName: 'हिन्दी' },
  { id: 'mr', code: 'MR', name: 'Marathi', nativeName: 'मराठी' },
];

interface LanguageDropdownProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  className?: string;
  buttonClassName?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  language,
  onSelectLanguage,
  className = '',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id="top-language-select"
        aria-label="Select interface language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          soundEffects.playClick();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9]/50 border border-[#D3D4C0] hover:border-[#C59A45]/60 text-xs font-mono font-bold text-[#0A2947] transition-all cursor-pointer shadow-xs select-none ${
          isOpen ? 'ring-2 ring-[#C59A45]/40 border-[#C59A45]' : ''
        } ${buttonClassName}`}
      >
        <Globe className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
        <span className="tracking-wide">{currentLang.code}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#8B5E3C] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute top-full right-0 mt-2 w-48 bg-white/98 backdrop-blur-md border-2 border-[#D3D4C0] rounded-2xl shadow-2xl p-1.5 z-[9999] animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            boxShadow: '0 12px 32px rgba(10, 41, 71, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Header */}
          <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-[#FAF7F0] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold">
              Language
            </span>
            <span className="text-[10px] text-[#0A2947]/50 font-sans font-medium">
              भाषा
            </span>
          </div>

          {/* Options */}
          <div className="space-y-0.5">
            {LANGUAGES.map((item) => {
              const isSelected = item.id === language;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    soundEffects.playClick();
                    onSelectLanguage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF7F0] text-[#0A2947] border border-[#C59A45]/40 font-semibold shadow-xs'
                      : 'text-[#0A2947]/80 hover:bg-[#FAF7F0]/80 hover:text-[#0A2947]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isSelected
                          ? 'bg-white text-[#8B5E3C] border-[#C59A45]/40'
                          : 'bg-gray-50 text-[#0A2947]/60 border-gray-200'
                      }`}
                    >
                      {item.code}
                    </span>
                    <div>
                      <div className="text-xs text-[#0A2947] font-medium leading-tight">
                        {item.nativeName}
                      </div>
                      {item.name !== item.nativeName && (
                        <div className="text-[10px] text-[#0A2947]/50 leading-tight">
                          {item.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
