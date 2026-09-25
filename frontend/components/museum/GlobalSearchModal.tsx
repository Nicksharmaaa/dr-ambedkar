'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, BookOpen, User, Calendar, Tag, Image, Sparkles, 
  ArrowRight, X, Command, ExternalLink, Mic, MicOff 
} from 'lucide-react';
import { Language, ArchivalDocument } from '@/types/museum';
import { ARCHIVE_DOCUMENTS, HISTORICAL_PHOTOS, TIMELINE_EVENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';
import { voiceRecognitionController } from '@/utils/speechUtils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (doc: ArchivalDocument) => void;
  onNavigateTab: (tab: string) => void;
  onAskAI: (query: string) => void;
  language: Language;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDocument,
  onNavigateTab,
  onAskAI,
  language
}) => {
  const [query, setQuery] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      voiceRecognitionController.stopListening();
    };
  }, []);

  const handleToggleVoice = () => {
    soundEffects.playClick();
    if (isListeningVoice) {
      voiceRecognitionController.stopListening();
      setIsListeningVoice(false);
      return;
    }

    const started = voiceRecognitionController.startListening({
      lang: language,
      onStart: () => setIsListeningVoice(true),
      onResult: (transcript) => {
        setQuery(transcript);
      },
      onEnd: () => setIsListeningVoice(false),
      onError: () => setIsListeningVoice(false)
    });

    if (!started) {
      setIsListeningVoice(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        if (!isOpen) {
          // Open handled by parent or state
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search Documents
  const matchedDocs = ARCHIVE_DOCUMENTS.filter(doc => 
    !cleanQuery || 
    doc.title.toLowerCase().includes(cleanQuery) || 
    doc.shortDescription.toLowerCase().includes(cleanQuery) ||
    doc.keyTopics.some(t => t.toLowerCase().includes(cleanQuery))
  ).slice(0, 4);

  // Search Historical Events & People
  const matchedEvents = TIMELINE_EVENTS.filter(evt =>
    !cleanQuery ||
    evt.title.toLowerCase().includes(cleanQuery) ||
    evt.description.toLowerCase().includes(cleanQuery) ||
    evt.year.toString().includes(cleanQuery)
  ).slice(0, 3);

  // Search Photos / Gallery
  const matchedPhotos = HISTORICAL_PHOTOS.filter(photo =>
    !cleanQuery ||
    photo.title.toLowerCase().includes(cleanQuery) ||
    photo.caption.toLowerCase().includes(cleanQuery) ||
    photo.era.toLowerCase().includes(cleanQuery)
  ).slice(0, 3);

  // Themes
  const themes = [
    'Constitution', 'Caste & Social Justice', 'Education', 'Economics', 
    'Women’s Rights', 'Labour', 'Religion & Philosophy', 'Democracy', 'Human Rights'
  ];
  const matchedThemes = themes.filter(t => !cleanQuery || t.toLowerCase().includes(cleanQuery)).slice(0, 4);

  const curatedSuggestions = [
    "Article 32", "Annihilation of Caste", "Round Table Conference", 
    "Mahad Satyagraha", "Buddha and His Dhamma", "Social Democracy"
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0A2947]/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Global Archival Search"
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#D3D4C0] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8B5E3C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListeningVoice ? "Listening to your voice... Speak now..." : "Search documents, people, events, themes, photographs..."}
            className={`w-full text-base sm:text-lg bg-transparent border-none focus:outline-none text-[#0A2947] placeholder-[#0A2947]/40 font-dmsans ${
              isListeningVoice ? 'font-semibold text-amber-900' : ''
            }`}
          />
          
          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isListeningVoice 
                ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400' 
                : 'text-[#8B5E3C] hover:bg-[#FAF7F0]'
            }`}
            title={isListeningVoice ? "Stop voice search" : "Click to speak your query"}
            aria-label="Voice search button"
          >
            {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {query ? (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#0A2947]/50 hover:text-[#0A2947] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#0A2947]/40 bg-[#FAF7F0] border border-[#D3D4C0] px-2 py-0.5 rounded">
              ESC to close
            </span>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {!cleanQuery && (
          <div className="px-5 py-3 bg-[#F3E4C9]/60 border-b border-[#D3D4C0]/70 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[#8B5E3C] font-montserrat font-bold uppercase tracking-wider text-[10px] shrink-0">
              Popular Archival Queries:
            </span>
            {curatedSuggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => {
                  soundEffects.playClick();
                  setQuery(sug);
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#D3D4C0] hover:border-[#8B5E3C] text-[#0A2947] hover:text-[#8B5E3C] text-[11px] font-montserrat font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Group 1: Archival Documents */}
          {matchedDocs.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C]">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Archival Documents & Treatises ({matchedDocs.length})</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('archive');
                  }}
                  className="text-[11px] hover:underline cursor-pointer"
                >
                  View All Archives &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {matchedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onClose();
                      onSelectDocument(doc);
                    }}
                    className="p-3.5 rounded-xl bg-white border border-[#D3D4C0] hover:border-[#8B5E3C] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#0A2947]/60">
                        <span className="font-bold text-[#8B5E3C] uppercase">{doc.categoryLabel}</span>
                        <span>·</span>
                        <span>{doc.year}</span>
                        <span>·</span>
                        <span>{doc.accessionNo}</span>
                      </div>
                      <h4 className="font-montserrat font-bold text-sm text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors line-clamp-1">
                        {language !== 'en' && doc.titleLocal?.[language] ? doc.titleLocal[language] : doc.title}
                      </h4>
                      <p className="text-xs text-[#0A2947]/70 line-clamp-1">
                        {doc.shortDescription}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8B5E3C] group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Key Historical Events */}
          {matchedEvents.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Historical Chronology & Milestones</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {matchedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      onClose();
                      onNavigateTab('timeline');
                    }}
                    className="p-3 rounded-xl bg-white border border-[#D3D4C0] hover:border-[#0A2947] transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-mono font-bold text-[#8B5E3C] block">{evt.year}</span>
                    <h5 className="font-montserrat font-bold text-xs text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors mt-0.5 line-clamp-1">
                      {evt.title}
                    </h5>
                    <p className="text-[11px] text-[#0A2947]/70 line-clamp-2 mt-1">
                      {evt.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Archival Themes */}
          {matchedThemes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C]">
                <Tag className="w-3.5 h-3.5" />
                <span>Museum Curatorial Themes</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {matchedThemes.map((thm) => (
                  <button
                    key={thm}
                    onClick={() => {
                      onClose();
                      onNavigateTab('archive');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#D3D4C0] hover:border-[#0A2947] hover:bg-[#F3E4C9] text-xs font-montserrat font-bold text-[#0A2947] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{thm}</span>
                    <ArrowRight className="w-3 h-3 text-[#8B5E3C]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 4: Visual Heritage Gallery */}
          {matchedPhotos.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C]">
                <div className="flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" />
                  <span>Visual Heritage Plates ({matchedPhotos.length})</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('gallery');
                  }}
                  className="text-[11px] hover:underline cursor-pointer"
                >
                  View Museum Wall &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {matchedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      onClose();
                      onNavigateTab('gallery');
                    }}
                    className="p-2 rounded-xl bg-white border border-[#D3D4C0] hover:border-[#8B5E3C] transition-all cursor-pointer flex items-center gap-2.5 group"
                  >
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.title}
                      className="w-12 h-12 rounded-lg object-cover bg-[#0A2947] shrink-0" 
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-mono text-[#8B5E3C] block">{photo.year}</span>
                      <h6 className="font-montserrat font-bold text-xs text-[#0A2947] group-hover:text-[#8B5E3C] truncate">
                        {photo.title}
                      </h6>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ask AI Option for Any Query */}
          {cleanQuery && (
            <div className="pt-2 border-t border-[#D3D4C0]">
              <button
                onClick={() => {
                  onClose();
                  onAskAI(query);
                }}
                className="w-full p-4 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F3E4C9]" />
                  <span>Ask Babasaheb AI Scholar: "{query}"</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#F3E4C9] border-t border-[#D3D4C0] flex items-center justify-between text-[11px] font-mono text-[#0A2947]/70">
          <span>Dr. B. R. Ambedkar Digital Museum Heritage Engine</span>
          <span className="hidden sm:inline">Use ↑↓ to navigate · ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
