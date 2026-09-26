'use client';

import React, { useRef } from 'react';
import { 
  Clock, ChevronLeft, ChevronRight, Film, BookOpen, Compass, 
  Sparkles, Award, MapPin, CheckCircle2 
} from 'lucide-react';
import { TimelineEvent } from '@/types/museum';
import { soundEffects } from '@/utils/soundEffects';

interface TimelineHorizonScrubberProps {
  events: TimelineEvent[];
  activeMilestoneId: string | null;
  onSelectMilestone: (event: TimelineEvent) => void;
  selectedEra: string;
  onSelectEra: (eraId: string) => void;
  eras: Array<{ id: string; label: string; span: string; desc: string; count: number }>;
}

export const TimelineHorizonScrubber: React.FC<TimelineHorizonScrubberProps> = ({
  events,
  activeMilestoneId,
  onSelectMilestone,
  selectedEra,
  onSelectEra,
  eras
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    soundEffects.playClick();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    soundEffects.playClick();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  // Find active event index
  const activeIndex = events.findIndex(e => e.id === activeMilestoneId);
  const activeEvent = activeIndex >= 0 ? events[activeIndex] : events[0];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (events[idx]) {
      soundEffects.playClick();
      onSelectMilestone(events[idx]);
    }
  };

  return (
    <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 relative overflow-hidden font-dmsans">
      {/* Top Scrubber Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D3D4C0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0A2947] border border-[#C59A45] text-[#F3E4C9] flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5 text-[#C59A45]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-cinzel font-bold text-[#8B5E3C] uppercase tracking-widest">
                INTERACTIVE EPOCH HORIZON
              </span>
              <span className="px-2 py-0.5 bg-[#FAF7F0] border border-[#D3D4C0] rounded text-[10px] font-mono font-bold text-[#0A2947]">
                1891 – 1956
              </span>
            </div>
            <div className="text-xs text-[#0A2947]/75">
              {"Touch or slide to travel across Babasaheb's historical turning points"}
            </div>
          </div>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={scrollLeft}
            className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] transition-colors cursor-pointer"
            title="Scroll earlier years"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[#0A2947]/70 px-1">
            {activeIndex >= 0 ? `${activeIndex + 1} / ${events.length}` : `${events.length} Stations`}
          </span>
          <button
            onClick={scrollRight}
            className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] transition-colors cursor-pointer"
            title="Scroll later years"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Touch Scroll Corridor */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#8B5E3C]/40 scrollbar-track-[#FAF7F0] scroll-smooth"
      >
        <div className="flex items-stretch gap-3 min-w-[920px] py-1">
          {events.map((ev, idx) => {
            const isActive = ev.id === activeMilestoneId;
            return (
              <button
                key={ev.id}
                onClick={() => {
                  soundEffects.playClick();
                  onSelectMilestone(ev);
                }}
                className={`flex-1 min-w-[145px] p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between group relative border-2 ${
                  isActive
                    ? 'bg-[#0A2947] text-white border-[#C59A45] shadow-lg scale-102 ring-2 ring-[#C59A45]/30'
                    : 'bg-[#FAF7F0] hover:bg-white text-[#0A2947] border-[#D3D4C0] hover:border-[#8B5E3C]'
                }`}
              >
                {/* Year Header & Media Tag */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-base font-mono font-black tracking-tight ${
                    isActive ? 'text-[#C59A45]' : 'text-[#0A2947] group-hover:text-[#8B5E3C]'
                  }`}>
                    {ev.year}
                  </span>

                  <span className={`p-1 rounded-lg text-[10px] ${
                    isActive ? 'bg-white/15 text-[#F3E4C9]' : 'bg-white text-[#8B5E3C] border border-[#D3D4C0]'
                  }`}>
                    {ev.mediaType === 'video' ? (
                      <Film className="w-3 h-3 text-[#C59A45]" />
                    ) : ev.mediaType === 'document' ? (
                      <BookOpen className="w-3 h-3 text-[#8B5E3C]" />
                    ) : (
                      <Compass className="w-3 h-3 text-[#8B5E3C]" />
                    )}
                  </span>
                </div>

                {/* Title Preview */}
                <div className={`text-xs font-serif-editorial font-bold line-clamp-2 leading-snug ${
                  isActive ? 'text-white' : 'text-[#0A2947]'
                }`}>
                  {ev.title}
                </div>

                {/* Location / Date Footnote */}
                <div className={`text-[10px] font-mono mt-2 pt-2 border-t truncate ${
                  isActive ? 'border-white/20 text-[#F3E4C9]/80' : 'border-[#D3D4C0]/70 text-[#0A2947]/60'
                }`}>
                  {ev.location.split(',')[0]}
                </div>

                {/* Active Indicator Pip */}
                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#C59A45] rotate-45 rounded-xs" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Range Slider Scrubber */}
      <div className="pt-2 px-1 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-xs font-mono font-bold text-[#8B5E3C] uppercase shrink-0">
          Slide Corridor:
        </span>
        <input
          type="range"
          min="0"
          max={Math.max(0, events.length - 1)}
          value={activeIndex >= 0 ? activeIndex : 0}
          onChange={handleSliderChange}
          className="w-full accent-[#C59A45] cursor-pointer h-2 bg-[#FAF7F0] border border-[#D3D4C0] rounded-lg"
        />
        <span className="text-xs font-mono text-[#0A2947]/70 shrink-0 font-bold">
          {activeEvent ? `${activeEvent.year} (${activeEvent.location.split(',')[0]})` : ''}
        </span>
      </div>

      {/* Era Jump Buttons Strip */}
      <div className="pt-3 border-t border-[#D3D4C0]/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-cinzel font-bold text-[#8B5E3C] uppercase mr-1 shrink-0">
          Epochs:
        </span>
        {eras.map(era => (
          <button
            key={era.id}
            onClick={() => {
              soundEffects.playClick();
              onSelectEra(era.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedEra === era.id
                ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs ring-1 ring-[#8B5E3C]'
                : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947]/80 border border-[#D3D4C0]'
            }`}
          >
            <span>{era.label}</span>
            <span className={`text-[10px] font-mono ${selectedEra === era.id ? 'text-[#F3E4C9]/70' : 'text-[#8B5E3C]'}`}>
              {era.span}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
