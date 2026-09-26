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
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9]/60 border border-[#D3D4C0] hover:border-[#C59A45] text-xs font-mono font-bold text-[#0A2947] transition-all cursor-pointer shadow-xs select-none ${
          isOpen ? 'ring-2 ring-[#C59A45] border-[#C59A45] bg-[#F3E4C9]/40' : ''
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

      {/* 100% Solid Opaque Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute top-full right-0 mt-2 w-56 border-2 border-[#C59A45] rounded-2xl shadow-2xl p-1.5 z-[99999] animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            backgroundColor: '#FFFFFF',
            opacity: 1,
            boxShadow: '0 20px 45px rgba(10, 41, 71, 0.28), 0 4px 14px rgba(0, 0, 0, 0.12)',
          }}
        >
          {/* Header Bar */}
          <div className="px-3 py-1.5 flex items-center justify-between bg-[#FAF7F0] border-b border-[#D3D4C0] rounded-xl mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#0A2947] font-bold">
              Language
            </span>
            <span className="text-[11px] font-bold text-[#8B5E3C]">
              भाषा
            </span>
          </div>

          {/* Options with High Contrast & Solid Backgrounds */}
          <div className="space-y-1.5">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0A2947] text-white border-[#0A2947] shadow-sm'
                      : 'bg-white hover:bg-[#FAF7F0] text-[#0A2947] border-[#E8E6DE] hover:border-[#C59A45]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Badge */}
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? 'bg-[#C59A45] text-[#0A2947] border-[#C59A45]'
                          : 'bg-[#FAF7F0] text-[#0A2947] border-[#D3D4C0]'
                      }`}
                    >
                      {item.code}
                    </span>

                    {/* Text Labels */}
                    <div>
                      <div
                        className={`text-sm font-bold leading-tight ${
                          isSelected ? 'text-white' : 'text-[#0A2947]'
                        }`}
                      >
                        {item.nativeName}
                      </div>
                      {item.name !== item.nativeName && (
                        <div
                          className={`text-[11px] font-medium leading-tight ${
                            isSelected ? 'text-[#F3E4C9]' : 'text-[#0A2947]/70'
                          }`}
                        >
                          {item.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Checkmark */}
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#C59A45] stroke-[3] shrink-0 ml-2" />
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
