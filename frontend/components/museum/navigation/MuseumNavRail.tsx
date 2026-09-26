'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Landmark, BookOpen, Clock, Radio, Sparkles, 
  Camera, Network, Star, Zap, Bookmark, X,
  ChevronRight, Compass
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';

export interface NavDestination {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface MuseumNavRailProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  savedCount?: number;
}

export const NAV_DESTINATIONS: NavDestination[] = [
  { 
    id: 'home', 
    label: 'Exhibition', 
    subtitle: 'Grand Exhibition Hall', 
    icon: Landmark 
  },
  { 
    id: 'archive', 
    label: 'The Archive', 
    subtitle: 'BAWS Volumes 1–22', 
    icon: BookOpen 
  },
  { 
    id: 'timeline', 
    label: 'Timeline', 
    subtitle: 'Chronicle 1891–1956', 
    icon: Clock 
  },
  { 
    id: 'media', 
    label: 'Media & Voice', 
    subtitle: 'Historical Audio & Speeches', 
    icon: Radio 
  },
  { 
    id: 'assistant', 
    label: 'AI Scholar', 
    subtitle: 'Grounded Archival RAG', 
    icon: Sparkles 
  },
  { 
    id: 'gallery', 
    label: 'Folio', 
    subtitle: 'Visual Archive & Photographs', 
    icon: Camera 
  },
  { 
    id: 'graph', 
    label: 'Knowledge Universe', 
    subtitle: '3D Semantic Lineage Graph', 
    icon: Network 
  },
  { 
    id: 'stories', 
    label: 'Curated Stories', 
    subtitle: 'Audio-Narrative Journeys', 
    icon: Star 
  },
  { 
    id: 'quest', 
    label: 'Constitutional Quest', 
    subtitle: 'Interactive Education Game', 
    icon: Zap 
  },
  { 
    id: 'collection', 
    label: 'Notebook', 
    subtitle: 'Curated Archival Folio', 
    icon: Bookmark 
  },
];

export const MuseumNavRail: React.FC<MuseumNavRailProps> = ({
  currentTab,
  onSelectTab,
  savedCount = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isExpanded && railRef.current && !railRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleToggleExpand = useCallback(() => {
    soundEffects.playClick();
    setIsExpanded((prev) => !prev);
  }, []);

  const handleDestinationClick = useCallback((id: string) => {
    soundEffects.playClick();
    onSelectTab(id);
    setIsExpanded(false);
  }, [onSelectTab]);

  return (
    <>
      {/* 1. Subtle Atmospheric Backdrop Dim when Fan Navigation is Expanded */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 z-[8990] bg-black/25 backdrop-blur-[1px] transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* 2. Floating Museum Navigation Rail */}
      <aside
        ref={railRef}
        aria-label="Museum Navigation Rail"
        role="navigation"
        className={`fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-[9000] select-none transition-all duration-300 ease-out ${
          isExpanded ? 'w-[320px] sm:w-[350px]' : 'w-[58px] sm:w-[62px]'
        }`}
      >
        <div 
          className={`relative rounded-3xl transition-all duration-300 border-2 border-[#C8C9B4] shadow-xl overflow-visible ${
            isExpanded 
              ? 'bg-white p-4 ring-1 ring-[#C89D56]/25' 
              : 'bg-white p-2 sm:p-2.5 hover:border-[#C89D56]/70'
          }`}
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 16px 40px rgba(10, 41, 71, 0.15), 0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Header Anchor Mark ("A" Museum Seal) */}
          <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-[#D3D4C0]">
            <button
              onClick={handleToggleExpand}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#0A2947] to-[#123B60] border border-[#C89D56]/60 flex items-center justify-center text-[#F3E4C9] font-cinzel font-bold text-lg shadow-md hover:scale-105 hover:border-[#C89D56] transition-all cursor-pointer relative group"
              title={isExpanded ? 'Collapse Navigation (Esc)' : 'Expand Museum Wings Fan'}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse Navigation' : 'Expand Navigation'}
            >
              <span className="group-hover:text-[#C89D56] transition-colors">A</span>
              {/* Subtle pulsing brass halo when collapsed */}
              {!isExpanded && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C89D56] ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isExpanded && (
              <div className="flex-1 pl-3 flex items-center justify-between animate-in fade-in duration-200">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B5E3C] font-bold">
                    MUSEUM WINGS
                  </div>
                  <div className="text-xs font-serif font-bold text-[#0A2947]">
                    Heritage Archive
                  </div>
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-xl text-[#0A2947]/50 hover:text-[#0A2947] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                  title="Close Navigation (Esc)"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items (Fan / Arc Architecture) */}
          <nav className="flex flex-col gap-1.5 py-1">
            {NAV_DESTINATIONS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isHovered = hoveredId === item.id;

              // Arc Fan calculation:
              // Items in the middle curve outward creating an organic, elegant fan curve
              const totalItems = NAV_DESTINATIONS.length;
              const normalizedIndex = idx / (totalItems - 1); // 0 to 1
              const arcOffset = Math.sin(normalizedIndex * Math.PI) * 16; // Bowed fan curve up to 16px
              const staggerDelay = idx * 30; // 0ms, 30ms, 60ms, 90ms...

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleDestinationClick(item.id)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(item.id)}
                    onBlur={() => setHoveredId(null)}
                    style={{
                      transform: isExpanded ? `translateX(${arcOffset}px)` : 'none',
                      transitionDelay: isExpanded ? `${staggerDelay}ms` : '0ms',
                    }}
                    className={`w-full text-left rounded-2xl flex items-center transition-all duration-300 ease-out cursor-pointer relative ${
                      isExpanded ? 'px-3 py-2.5 gap-3' : 'p-2 sm:p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-[#F3E4C9] border border-[#C89D56] text-[#0A2947] shadow-xs'
                        : 'hover:bg-[#FAF7F0] text-[#0A2947]/75 hover:text-[#0A2947] border border-transparent'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                  >
                    {/* Icon Container */}
                    <div 
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        isActive 
                          ? 'bg-[#0A2947] text-[#F3E4C9] shadow-sm font-bold scale-105' 
                          : 'text-[#0A2947]/70 group-hover:text-[#0A2947]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Active State Micro Indicator Dot */}
                    {isActive && !isExpanded && (
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#0A2947] shadow-xs" />
                    )}

                    {/* Notebook Counter Badge in Collapsed State */}
                    {item.id === 'collection' && savedCount > 0 && !isExpanded && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#0A2947] text-white font-mono text-[9px] font-bold shadow-xs">
                        {savedCount}
                      </span>
                    )}

                    {/* Expanded Fan Labels (Fade & Slide into view) */}
                    {isExpanded && (
                      <div 
                        className="flex-1 flex items-center justify-between min-w-0 animate-in fade-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${staggerDelay + 40}ms` }}
                      >
                        <div className="space-y-0.5 truncate">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-serif font-bold tracking-wide truncate ${isActive ? 'text-[#0A2947]' : 'text-[#0A2947]/90'}`}>
                              {item.label}
                            </span>
                            {item.id === 'collection' && savedCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-[#0A2947] text-white font-mono text-[9px] font-bold">
                                {savedCount}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#0A2947]/60 truncate font-sans">
                            {item.subtitle}
                          </div>
                        </div>

                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'text-[#0A2947] translate-x-0.5' : 'text-[#0A2947]/40 group-hover:text-[#0A2947]'}`} />
                      </div>
                    )}
                  </button>

                  {/* Desktop Hover Tooltip in Collapsed State */}
                  {!isExpanded && isHovered && (
                    <div 
                      className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-[9999] px-3.5 py-2 rounded-xl bg-white text-[#0A2947] border-2 border-[#C8C9B4] shadow-2xl whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-left-1 duration-150"
                      style={{ backgroundColor: '#FFFFFF', opacity: 1 }}
                      role="tooltip"
                    >
                      <div className="text-xs font-serif font-bold text-[#0A2947] flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.id === 'collection' && savedCount > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0A2947] text-white font-mono font-bold">
                            {savedCount}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-[#8B5E3C] uppercase tracking-wider font-bold">
                        {item.subtitle}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
