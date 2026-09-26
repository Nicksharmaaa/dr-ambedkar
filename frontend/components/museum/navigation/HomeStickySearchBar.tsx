'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight, BookOpen, Clock, Sparkles, Compass } from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import VoicePill from '@/components/ui/VoicePill';

interface HomeStickySearchBarProps {
  onSearchSubmit: (query: string) => void;
  onOpenVoiceModal?: () => void;
  initialQuery?: string;
  className?: string;
}

const QUICK_SUGGESTIONS = [
  {
    label: 'Annihilation of Caste',
    category: 'Treatise · 1936',
    icon: BookOpen,
  },
  {
    label: 'Constituent Assembly Speech 1949',
    category: 'Speech · 25 Nov 1949',
    icon: Sparkles,
  },
  {
    label: 'Mahad Satyagraha',
    category: 'Movement · 1927',
    icon: Compass,
  },
  {
    label: 'Poona Pact',
    category: 'Historical Accord · 1932',
    icon: Clock,
  },
  {
    label: 'Article 32 Constitutional Remedies',
    category: 'Constitution · Heart & Soul',
    icon: BookOpen,
  },
];

export const HomeStickySearchBar: React.FC<HomeStickySearchBarProps> = ({
  onSearchSubmit,
  onOpenVoiceModal,
  initialQuery = '',
  className = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync initialQuery if it changes
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Global Keyboard Shortcut: '/' or 'Ctrl+K' / 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in another input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape' && isFocused) {
          inputRef.current?.blur();
          setIsFocused(false);
        }
        return;
      }

      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsFocused(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Click outside listener to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech API for inline microphone capture
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback to voice modal if Web Speech API isn't supported
      if (onOpenVoiceModal) onOpenVoiceModal();
      return;
    }

    if (isListeningVoice) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { }
      }
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListeningVoice(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0]?.transcript || '')
          .join('');
        setQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
        inputRef.current?.focus();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListeningVoice(false);
      if (onOpenVoiceModal) onOpenVoiceModal();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery) {
      soundEffects.playClick();
      setIsFocused(false);
      inputRef.current?.blur();
      onSearchSubmit(cleanQuery);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    soundEffects.playClick();
    setQuery(suggestion);
    setIsFocused(false);
    onSearchSubmit(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-[8850] select-none ${className}`}
      role="search"
      aria-label="Corpus Search"
    >
      {/* Main Pill Search Bar Container */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center h-[42px] sm:h-[46px] w-[calc(100vw-150px)] sm:w-[380px] md:w-[440px] lg:w-[500px] max-w-[92vw] px-1.5 sm:px-2 rounded-full bg-white/95 backdrop-blur-2xl border-2 transition-all duration-300 shadow-xl ${isFocused
            ? 'border-[#C89D56] ring-3 ring-[#C89D56]/20 bg-white'
            : 'border-[#D3D4C0] hover:border-[#C89D56]/60'
          }`}
        style={{
          boxShadow: isFocused
            ? '0 12px 36px rgba(10, 41, 71, 0.16), 0 0 20px rgba(200, 157, 86, 0.12)'
            : '0 10px 30px rgba(10, 41, 71, 0.1), 0 0 15px rgba(200, 157, 86, 0.06)',
        }}
      >
        {/* Left Search Icon */}
        <div className="pl-2 sm:pl-2.5 pr-1 flex items-center justify-center shrink-0">
          <Search
            className={`w-4 h-4 transition-colors duration-200 ${isFocused ? 'text-[#8B5E3C]' : 'text-[#8B5E3C]/75'
              }`}
          />
        </div>

        {/* Search Input Field */}
        <input
          ref={inputRef}
          id="home-sticky-search-input"
          name="home_search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={
            isListeningVoice
              ? 'Listening to speech...'
              : 'Search archive, speeches, BAWS...'
          }
          autoComplete="off"
          spellCheck="false"
          className="flex-1 min-w-0 bg-transparent text-[#0A2947] placeholder-[#0A2947]/45 text-xs sm:text-sm font-dmsans px-2 py-1 border-0 focus:outline-none focus:ring-0"
        />

        {/* Right Section: Clear, Shortcut, VoicePill, Search Submit */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pr-0.5">
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-[#0A2947]/50 hover:text-[#0A2947] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}


          {/* Integrated React Bits VoicePill */}
          <div
            className="flex items-center"
            title={
              isListeningVoice
                ? 'Stop listening'
                : 'Speak inquiry in English, Hindi, or Marathi'
            }
          >
            <VoicePill
              isListening={isListeningVoice}
              accentColor="#C89D56"
              iconColor="#8B5E3C"
              background="#FAF7F0"
              size={28}
              shape="pill"
              reach={6}
              showTime={false}
              waveform={false}
              slideToCancel={false}
              mode="toggle"
              ariaLabel="Voice dictation"
              onStart={handleToggleVoice}
              onStop={handleToggleVoice}
            />
          </div>

          {/* Search Submit Action Button */}
          <button
            type="submit"
            disabled={!query.trim()}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${query.trim()
                ? 'bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0]'
                : 'bg-[#0A2947]/15 text-[#0A2947]/40 cursor-default'
              }`}
            title="Search the Archive"
            aria-label="Submit search query"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">Search</span>
          </button>
        </div>
      </form>

      {/* Quick Inquiries / Curated Suggestions Dropdown */}
      {isFocused && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-2xl border-2 border-[#D3D4C0] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            boxShadow:
              '0 20px 40px rgba(10, 41, 71, 0.15), 0 0 20px rgba(200, 157, 86, 0.08)',
          }}
        >
          <div className="px-2.5 py-1 text-[10px] font-mono text-[#8B5E3C] uppercase tracking-wider font-bold flex items-center justify-between">
            <span>Curated Archival Inquiries</span>
            <span className="text-[9px] text-[#0A2947]/40 lowercase font-normal">
              esc to close
            </span>
          </div>

          <div className="mt-1 space-y-0.5">
            {QUICK_SUGGESTIONS.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onMouseDown={(e) => {
                    // onMouseDown avoids blur event firing before click
                    e.preventDefault();
                    handleSelectSuggestion(item.label);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#FAF7F0] text-[#0A2947] transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-lg bg-[#FAF7F0] text-[#8B5E3C] group-hover:bg-[#0A2947] group-hover:text-[#FAF7F0] transition-colors shrink-0 border border-[#D3D4C0]">
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-montserrat font-semibold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors truncate">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#0A2947]/50 font-mono leading-none">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0A2947]/30 group-hover:text-[#8B5E3C] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeStickySearchBar;
