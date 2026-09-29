'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, BookOpen, User, Calendar, Tag, Image, Sparkles, 
  ArrowRight, X, Command, ExternalLink, Mic, MicOff 
} from 'lucide-react';
import { Language, ArchivalDocument } from '@/types/museum';
import { ARCHIVE_DOCUMENTS, HISTORICAL_PHOTOS, TIMELINE_EVENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';
import { UI_STRINGS } from '@/utils/i18n';
import { voiceRecognitionController } from '@/utils/speechUtils';
import VoicePill from '@/components/ui/VoicePill';


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
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [semanticDocs, setSemanticDocs] = useState<ArchivalDocument[]>([]);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      voiceRecognitionController.stopListening();
    };
  }, []);

  const cleanQuery = query.toLowerCase().trim();

  // Canonical Semantic Search Fetch
  useEffect(() => {
    if (!cleanQuery) {
      setSemanticDocs([]);
      setIsSearchingSemantic(false);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsSearchingSemantic(true);
        const res = await fetch("/api/v1/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: query.trim(),
            mode: "hybrid",
            limit: 4,
            enable_rerank: true,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (isMounted) {
          const mapped: ArchivalDocument[] = (data.results || []).map((r: any, idx: number) => {
            const volNum = r.volume_number || '';
            const pageNum = r.page_number || 1;
            const scorePct = Math.round((r.reranker_score ?? r.score ?? 0.8) * 100);

            const existing = ARCHIVE_DOCUMENTS.find(
              (d) =>
                d.id === r.object_id ||
                d.title.toLowerCase() === (r.object_title || "").toLowerCase()
            );

            if (existing) {
              const safeText = r.text || existing.shortDescription || '';
              return {
                ...existing,
                shortDescription: safeText.length > 200 ? safeText.slice(0, 200) + '...' : safeText,
                fullText: safeText || existing.fullText,
                keyTopics: [
                  `Relevance: ${scorePct}%`,
                  ...(existing.keyTopics || []).slice(0, 2),
                ],
              };
            }

            const safeText = r.text || r.object_title || 'Archival passage from Dr. Ambedkar\'s writings.';
            return {
              id: r.chunk_id || `chunk-${idx}`,
              title: r.section_title || r.object_title || 'Dr. Ambedkar Archival Corpus',
              author: 'Dr. B. R. Ambedkar',
              type: 'book',
              categoryLabel: `${volNum ? `Vol. ${volNum}` : 'Writings'} · p. ${pageNum}`,
              date: volNum ? `Volume ${volNum}` : 'Archival Corpus',
              year: 1949,
              collection: r.object_title || 'Dr. Babasaheb Ambedkar: Writings and Speeches',
              language: r.language || 'en',
              source: r.object_title || 'BAWS Archival Repository',
              accessionNo: r.object_id || r.chunk_id?.slice(0, 8) || 'AMBEDKAR-ARC',
              accessRights: 'Public Domain',
              shortDescription: safeText.length > 200 ? safeText.slice(0, 200) + '...' : safeText,
              fullText: safeText,
              ocrConfidence: 99.4,
              keyTopics: [`Relevance: ${scorePct}%`, volNum ? `Vol. ${volNum}` : 'Passage'],
              aiSummary: { en: safeText.slice(0, 160), hi: '', mr: '' },
              relatedDocumentIds: []
            };
          });
          setSemanticDocs(mapped);
          setIsSearchingSemantic(false);
        }
      } catch {
        if (isMounted) setIsSearchingSemantic(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [cleanQuery, query]);


  const handleToggleVoice = () => {
    soundEffects.playClick();
    if (isListeningVoice) {
      voiceRecognitionController.stopListening();
      setIsListeningVoice(false);
      return;
    }

    // Set listening state immediately so the button responds without waiting for async onStart
    setIsListeningVoice(true);

    const started = voiceRecognitionController.startListening({
      lang: language,
      autoStopOnFinal: true,
      onStart: () => setIsListeningVoice(true),
      onResult: (transcript, isFinal) => {
        setQuery(transcript);
        if (isFinal) {
          // Auto-stop mic and trigger search after a brief moment
          setIsListeningVoice(false);
        }
      },
      onEnd: () => setIsListeningVoice(false),
      onError: (err) => {
        setIsListeningVoice(false);
        console.warn('[Search Voice] Error:', err);
      },
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

  // Search Documents (Source from Canonical Semantic Vector Search when query entered)
  const matchedDocs = cleanQuery
    ? (semanticDocs.length > 0
        ? semanticDocs
        : ARCHIVE_DOCUMENTS.filter(doc => 
            doc.title.toLowerCase().includes(cleanQuery) || 
            (doc.titleLocal && Object.values(doc.titleLocal).some(t => t.toLowerCase().includes(cleanQuery))) ||
            doc.shortDescription.toLowerCase().includes(cleanQuery) ||
            (doc.shortDescriptionLocal && Object.values(doc.shortDescriptionLocal).some(d => d.toLowerCase().includes(cleanQuery))) ||
            doc.fullText.toLowerCase().includes(cleanQuery) ||
            doc.keyTopics.some(t => t.toLowerCase().includes(cleanQuery)) ||
            (doc.categoryLabel && doc.categoryLabel.toLowerCase().includes(cleanQuery))
          ).slice(0, 4))
    : ARCHIVE_DOCUMENTS.slice(0, 4);


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
      className="fixed inset-0 z-[999999] bg-[#0A2947]/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 animate-in fade-in duration-150"
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
            id="global-search-modal-input"
            name="global_search_query"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                e.preventDefault();
                onClose();
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder={isListeningVoice ? "Listening to your voice... Speak now..." : (UI_STRINGS[language]?.searchPlaceholder || "Search documents, people, events, themes, photographs...")}
            autoComplete="off"

            className={`w-full text-base sm:text-lg bg-transparent border-none focus:outline-none text-[#0A2947] placeholder-[#0A2947]/40 font-dmsans ${
              isListeningVoice ? 'font-semibold text-amber-900' : ''
            }`}
          />
          
          {/* Voice Search Pill */}
          <VoicePill
            accentColor="#C59A45"
            iconColor="#8B5E3C"
            background="#0A2947"
            size={34}
            shape="pill"
            showTime
            waveform
            slideToCancel
            mode="toggle"
            reactive="mic"
            isListening={isListeningVoice}
            onStart={() => {
              if (!isListeningVoice) handleToggleVoice();
            }}
            onStop={() => {
              if (isListeningVoice) handleToggleVoice();
            }}
            ariaLabel={isListeningVoice ? "Stop voice search" : "Click to speak your query"}
          />

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
                  <span>
                    Archival Documents & Passages ({matchedDocs.length})
                    {isSearchingSemantic && (
                      <span className="text-[10px] lowercase font-normal ml-2 text-[#8B5E3C] animate-pulse">
                        searching vectors...
                      </span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
                  }}
                  className="text-[11px] hover:underline cursor-pointer"
                >
                  View All in Search &rarr;
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
                        {language !== 'en' && doc.shortDescriptionLocal?.[language] ? doc.shortDescriptionLocal[language] : doc.shortDescription}
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
                      {language !== 'en' && evt.titleLocal?.[language] ? evt.titleLocal[language] : evt.title}
                    </h5>
                    <p className="text-[11px] text-[#0A2947]/70 line-clamp-2 mt-1">
                      {language !== 'en' && evt.descriptionLocal?.[language] ? evt.descriptionLocal[language] : evt.description}
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
                        {language !== 'en' && photo.titleLocal?.[language] ? photo.titleLocal[language] : photo.title}
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
