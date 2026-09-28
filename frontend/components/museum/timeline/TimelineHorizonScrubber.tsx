'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Clock, ChevronLeft, ChevronRight, Film, BookOpen, Compass,
  MapPin, Play, Pause, Sparkles, MoveHorizontal, RotateCcw
} from 'lucide-react';
import { TimelineEvent } from '@/types/museum';
import { soundEffects } from '@/utils/soundEffects';
import { motion, useMotionValue } from 'motion/react';

interface TimelineHorizonScrubberProps {
  events: TimelineEvent[];
  activeMilestoneId?: string | null;
  onSelectMilestone?: (event: TimelineEvent, shouldScrollDown?: boolean) => void;
  selectedEra: string;
  onSelectEra: (eraId: string) => void;
  eras: Array<{ id: string; label: string; span: string; desc: string; count: number }>;
}

export const TimelineHorizonScrubber: React.FC<TimelineHorizonScrubberProps> = ({
  events,
  selectedEra,
  onSelectEra,
  eras
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(true);
  const [currentStationIndex, setCurrentStationIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragScrollLeft, setDragScrollLeft] = useState<number>(0);
  const [sliderProgress, setSliderProgress] = useState<number>(0);

  // Geometric layout parameters: generous lead-in and runway for complete start-to-end journey
  const slotWidth = 270;
  const centerY = 165;
  const R = 96; // Semicircular arc radius hugs 180px circle card (radius 90 + 6px air gap)
  const startOffset = 120; // 120px clean lead-in runway before Node 1 (1891)
  const totalSvgWidth = startOffset + events.length * slotWidth + 140;

  // Single continuous progress value strictly from 0.000 to 1.000
  const progressRef = useRef<number>(0);
  const isUserInteractingRef = useRef<boolean>(false);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number | null>(null);
  const isHoldingAtEndRef = useRef<boolean>(false);

  // Motion value for 60fps GPU-accelerated SVG stroke pathLength
  const scrollProgressMotion = useMotionValue(0);

  // Color theme helper matching the reference infographic:
  // - Even index (0, 2, 4...): Emerald Green (#10B981) under-curve, bottom dotted line & pin
  // - Odd index (1, 3, 5...): Warm Amber Gold (#F59E0B) over-curve, top dotted line & pin
  const getStationTheme = (index: number) => {
    const isEven = index % 2 === 0;
    return {
      isEven,
      color: isEven ? '#10B981' : '#F59E0B',
      colorLight: isEven ? '#ECFDF5' : '#FFFBEB',
      borderColor: isEven ? '#34D399' : '#FBBF24',
      ringColor: isEven ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)',
    };
  };

  // Center coordinate of any station
  const getStationCenterX = useCallback((index: number) => {
    return startOffset + index * slotWidth + slotWidth / 2;
  }, [slotWidth, startOffset]);

  // Synchronize all visual elements from normalized progress p in [0, 1]
  const applyProgress = useCallback((p: number, updateScroll: boolean = true) => {
    const clampedP = Math.max(0, Math.min(1, p));
    progressRef.current = clampedP;
    scrollProgressMotion.set(clampedP);
    setSliderProgress(clampedP);

    // Smoothly pan scroll container in exact 1:1 synchronization with the beam
    if (updateScroll && scrollContainerRef.current) {
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      if (maxScroll > 0) {
        isProgrammaticScrollRef.current = true;
        scrollContainerRef.current.scrollLeft = clampedP * maxScroll;
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false;
        });
      }
    }

    // Update active station counter (1 / 13 to 13 / 13)
    const activeIdx = Math.min(events.length - 1, Math.floor(clampedP * events.length));
    setCurrentStationIndex(activeIdx);
  }, [events.length, scrollProgressMotion]);

  // 60FPS Continuous Autopilot Engine (Smooth continuous flow from start 0% till end 100%)
  useEffect(() => {
    if (!isPlayingAuto) {
      lastTimeRef.current = null;
      return;
    }

    let animId: number;
    // Full start-to-end journey takes ~28 seconds at buttery-smooth 60fps
    const speed = 1 / 28;

    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const dt = Math.min(0.1, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      if (!isUserInteractingRef.current && !isHoldingAtEndRef.current) {
        let nextP = progressRef.current + dt * speed;

        // Reached the very end (100% of Dr. Ambedkar's chronology)
        if (nextP >= 1) {
          nextP = 1;
          applyProgress(1, true);
          isHoldingAtEndRef.current = true;

          // Pause at the end for 2.6 seconds so visitor can view completed timeline
          setTimeout(() => {
            if (scrollContainerRef.current) {
              isProgrammaticScrollRef.current = true;
              scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              setTimeout(() => {
                isProgrammaticScrollRef.current = false;
              }, 600);
            }
            // Rewind to 0 and restart seamlessly from starting node
            setTimeout(() => {
              applyProgress(0, true);
              isHoldingAtEndRef.current = false;
            }, 800);
          }, 2600);
        } else {
          applyProgress(nextP, true);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingAuto, applyProgress]);

  // Initial mount: strictly start at 0 (from the very beginning)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    applyProgress(0, true);
  }, [applyProgress]);

  // Native horizontal scroll listener (user trackpad horizontal swipe, scrollbar drag, shift+wheel)
  const handleScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    if (!scrollContainerRef.current) return;

    // Pause autopilot when user scrolls manually
    setIsPlayingAuto(false);

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    // Direct 1:1 mapping from scrollLeft to beam progress
    const p = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    progressRef.current = p;
    scrollProgressMotion.set(p);
    setSliderProgress(p);

    const activeIdx = Math.min(events.length - 1, Math.floor(p * events.length));
    setCurrentStationIndex(activeIdx);
  }, [events.length, scrollProgressMotion]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Mouse Wheel translation: scrolling vertically translates smoothly to horizontal scroll
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If user scrolls mouse wheel over the scrubber, translate to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const atLeftEdge = el.scrollLeft <= 0;
        const atRightEdge = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;

        if ((e.deltaY > 0 && !atRightEdge) || (e.deltaY < 0 && !atLeftEdge)) {
          e.preventDefault();
          setIsPlayingAuto(false);
          el.scrollLeft += e.deltaY * 1.2;
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Toggle Autopilot Play / Pause
  const toggleAutopilot = () => {
    soundEffects.playClick();
    setIsPlayingAuto(prev => !prev);
  };

  // Restart strictly from the beginning (0%)
  const handleRestart = () => {
    soundEffects.playClick();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    applyProgress(0, true);
    setIsPlayingAuto(true);
    isHoldingAtEndRef.current = false;
  };

  // Step to specific station index
  const jumpToStation = (index: number) => {
    soundEffects.playClick();
    setIsPlayingAuto(false);
    const targetP = index / (events.length - 1);
    applyProgress(targetP, true);
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, currentStationIndex - 1);
    jumpToStation(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(events.length - 1, currentStationIndex + 1);
    jumpToStation(nextIdx);
  };

  // Mouse Drag to Scrub
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    if (!scrollContainerRef.current) return;
    setIsPlayingAuto(false);
    isUserInteractingRef.current = true;
    setIsDragging(true);
    setDragStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setDragScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.3;
    const newScroll = dragScrollLeft - walk;
    scrollContainerRef.current.scrollLeft = newScroll;

    const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
    if (maxScroll > 0) {
      const p = Math.max(0, Math.min(1, newScroll / maxScroll));
      applyProgress(p, false);
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 100);
    }
  };

  // Generate continuous alternating wave path string
  // Clean horizontal line from x = 0 through every arc, extending all the way to totalSvgWidth
  const generateWavePath = () => {
    if (events.length === 0) return '';
    let d = `M 0 ${centerY}`;

    for (let i = 0; i < events.length; i++) {
      const cx = getStationCenterX(i);
      const arcStartX = cx - R;
      const arcEndX = cx + R;

      // Straight horizontal line leading to circle arc
      d += ` L ${arcStartX} ${centerY}`;

      // Arc around circle:
      // Even (0, 2, 4...) = UNDER circle (sweep 0, counter-clockwise)
      // Odd (1, 3, 5...)  = OVER circle (sweep 1, clockwise)
      const sweepFlag = i % 2 === 0 ? 0 : 1;
      d += ` A ${R} ${R} 0 0 ${sweepFlag} ${arcEndX} ${centerY}`;

      // Final trailing line extending to the very end
      if (i === events.length - 1) {
        d += ` L ${totalSvgWidth} ${centerY}`;
      }
    }
    return d;
  };

  const wavePath = generateWavePath();

  return (
    <div className="bg-gradient-to-b from-white via-[#FCFBF8] to-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-5 sm:p-6 shadow-md space-y-4 relative overflow-hidden font-dmsans select-none">
      {/* Top Header Bar with Live Dynamic Counter & Interactive Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D3D4C0]/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0A2947] border border-[#C59A45] text-[#F3E4C9] flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5 text-[#C59A45]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-cinzel font-black text-[#0A2947] uppercase tracking-wider">
                INTERACTIVE TIMELINE
              </span>
            </div>
          </div>
        </div>

        {/* Counter (1 / 13), Prev/Next Buttons, and Autopilot toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Restart from Starting Node (1891) */}
          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] transition-colors cursor-pointer shadow-2xs"
            title="Restart Journey from Node 1 (1891)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Autopilot Button */}
          <button
            type="button"
            onClick={toggleAutopilot}
            className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${isPlayingAuto
              ? 'bg-[#10B981] text-white border-[#059669] shadow-sm ring-2 ring-[#10B981]/30'
              : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0]'
              }`}
            title={isPlayingAuto ? 'Pause Autopilot' : 'Resume Autopilot'}
          >
            {isPlayingAuto ? (
              <>
                <Pause className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-[#10B981]" />
              </>
            )}
          </button>

          {/* Previous Station Chevron */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStationIndex <= 0}
            className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A2947] border border-[#D3D4C0] transition-colors cursor-pointer shadow-2xs"
            title="Previous Milestone"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dynamic Station Counter: e.g. 1 / 13 at start, 13 / 13 at end */}
          <div className="flex items-center px-3 py-1.5 bg-white rounded-xl border border-[#D3D4C0] shadow-2xs">
            <span className="text-xs font-cinzel font-black text-[#0A2947]">
              {currentStationIndex + 1}
            </span>
            <span className="text-xs font-mono text-[#8B5E3C]/60 mx-1">/</span>
            <span className="text-xs font-mono font-bold text-[#8B5E3C]">
              {events.length}
            </span>
          </div>

          {/* Next Station Chevron */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentStationIndex >= events.length - 1}
            className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A2947] border border-[#D3D4C0] transition-colors cursor-pointer shadow-2xs"
            title="Next Milestone"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Horizontal Timeline Scrubber Slider (Scroll Left to Right) */}
      <div className="flex items-center gap-3 bg-[#FAF7F0] px-4 py-2.5 rounded-2xl border border-[#D3D4C0]/80">
        <span className="text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase shrink-0 flex items-center gap-1.5">
          <span>Scroll Timeline</span>
        </span>
        <div className="relative flex-1 flex items-center h-5 cursor-pointer">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(sliderProgress * 1000)}
            onChange={(e) => {
              setIsPlayingAuto(false);
              const val = Number(e.target.value) / 1000;
              applyProgress(val, true);
            }}
            className="w-full h-2 bg-[#D3D4C0] rounded-lg appearance-none cursor-pointer accent-[#10B981] hover:accent-[#059669] transition-all"
            title="Scrub left to right across Dr. Ambedkar's timeline"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 bg-white rounded-lg border border-[#D3D4C0] shadow-2xs">
          <span className="text-xs font-cinzel font-black text-[#0A2947]">
            {events[currentStationIndex]?.year || '1891'}
          </span>
          <span className="text-[10px] font-mono text-[#8B5E3C]">
            ({currentStationIndex + 1}/{events.length})
          </span>
        </div>
      </div>

      {/* Horizontal Alternating Wave Corridor */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-[#8B5E3C]/30 scrollbar-track-[#FAF7F0] transition-all relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
      >
        <div
          className="relative"
          style={{ width: `${totalSvgWidth}px`, height: '330px' }}
        >
          {/* Continuous Alternating Wave SVG Canvas */}
          <svg
            className="absolute inset-0 pointer-events-none z-0"
            width={totalSvgWidth}
            height={330}
            viewBox={`0 0 ${totalSvgWidth} 330`}
          >
            <defs>
              {/* Aceternity Signature Multi-Stop Dynamic Gradient */}
              <linearGradient id="waveAceternityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="15%" stopColor="#22C55E" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="55%" stopColor="#3B82F6" />
                <stop offset="75%" stopColor="#8B5CF6" />
                <stop offset="90%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#C59A45" />
              </linearGradient>

              {/* Luminous Glow Filter for Moving Beam */}
              <filter id="waveBeamGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Neutral Base Guide Track: starts at x=0, spans full length to end */}
            <path
              d={wavePath}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* 2. Alternating Color Hints on the Track (Green under, Amber over) */}
            {events.map((ev, i) => {
              const cx = getStationCenterX(i);
              const theme = getStationTheme(i);
              const arcStartX = cx - R;
              const arcEndX = cx + R;
              const sweepFlag = theme.isEven ? 0 : 1;
              const segmentD = `M ${arcStartX} ${centerY} A ${R} ${R} 0 0 ${sweepFlag} ${arcEndX} ${centerY}`;

              return (
                <path
                  key={`segment-hint-${ev.id}`}
                  d={segmentD}
                  fill="none"
                  stroke={theme.color}
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.25"
                />
              );
            })}

            {/* 3. The Aceternity Dynamic Beam (Flows continuously at 60fps from 0% to 100%) */}
            <motion.path
              d={wavePath}
              fill="none"
              stroke="url(#waveAceternityGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              style={{ pathLength: scrollProgressMotion }}
              filter="url(#waveBeamGlow)"
            />

            {/* 4. Radiant White Core Shimmer Beam */}
            <motion.path
              d={wavePath}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength: scrollProgressMotion }}
              strokeDasharray="24 160"
              opacity={0.85}
            />

            {/* 5. Dotted Vertical Connectors & Open Ring Pins */}
            {events.map((ev, i) => {
              const cx = getStationCenterX(i);
              const theme = getStationTheme(i);
              const isEven = theme.isEven;
              const isPassed = i <= currentStationIndex;

              // Arc apex: lowest point (bottom) for even; highest point (top) for odd
              const apexY = isEven ? centerY + R : centerY - R;
              // Pin position: drops 30px down for even, rises 30px up for odd
              const pinY = isEven ? apexY + 30 : apexY - 30;

              return (
                <g key={`pin-marker-${ev.id}`}>
                  {/* Vertical Dotted Connector Line */}
                  <line
                    x1={cx}
                    y1={apexY}
                    x2={cx}
                    y2={pinY}
                    stroke={isPassed ? theme.color : '#CBD5E1'}
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    className="transition-colors duration-300"
                  />

                  {/* Outer Ring Pin (circle with hollow/white center like reference image) */}
                  <circle
                    cx={cx}
                    cy={pinY}
                    r={7}
                    fill="#FFFFFF"
                    stroke={isPassed ? theme.color : '#94A3B8'}
                    strokeWidth={2.5}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
          </svg>

          {/* 6. Circular Milestone Cards (Clean, uniform 180px White Discs - NO active highlights) */}
          {events.map((ev, i) => {
            const cx = getStationCenterX(i);
            const theme = getStationTheme(i);

            return (
              <div
                key={`card-wrapper-${ev.id}`}
                style={{
                  position: 'absolute',
                  left: `${cx - 90}px`,
                  top: `${centerY - 90}px`,
                  width: '180px',
                  height: '180px',
                }}
                className="z-10 flex items-center justify-center pointer-events-auto"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => jumpToStation(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      jumpToStation(i);
                    }
                  }}
                  className="w-[180px] h-[180px] rounded-full p-4 flex flex-col items-center justify-center text-center bg-white hover:bg-[#FAF7F0] text-[#0A2947] border-2 border-[#D3D4C0] hover:border-[#8B5E3C] shadow-md hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer relative overflow-hidden group select-none"
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.07), 0 8px 10px -6px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Top Station Tag (#1 / 13) and Media Badge */}
                  <div className="flex items-center gap-1.5 mb-1 z-10">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] border border-[#D3D4C0] text-[#8B5E3C]"
                    >
                      #{i + 1}
                    </span>

                    <span
                      className="p-0.5 rounded-full text-neutral-400 group-hover:text-[#0A2947] transition-colors"
                      title={ev.mediaType}
                    >
                      {ev.mediaType === 'video' ? (
                        <Film className="w-3 h-3 text-[#E11D48]" />
                      ) : ev.mediaType === 'document' ? (
                        <BookOpen className="w-3 h-3 text-[#2563EB]" />
                      ) : (
                        <Compass className="w-3 h-3 text-[#D97706]" />
                      )}
                    </span>
                  </div>

                  {/* Prominent Historical Year (e.g. 1891, 1916, 1924...) */}
                  <span className="text-2xl font-cinzel font-black tracking-tight leading-none text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors z-10">
                    {ev.year}
                  </span>

                  {/* Milestone Title */}
                  <span className="text-[11px] font-serif font-bold text-[#0A2947] line-clamp-2 leading-tight my-1 px-1 z-10">
                    {ev.title}
                  </span>

                  {/* Location Footnote */}
                  <span className="text-[9px] font-mono text-neutral-500 truncate max-w-[140px] flex items-center gap-1 z-10">
                    <MapPin
                      className="w-2.5 h-2.5 shrink-0"
                      style={{ color: theme.color }}
                    />
                    <span className="truncate">{ev.location.split(',')[0]}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Epochs Filter Buttons Strip */}
      <div className="pt-3 border-t border-[#D3D4C0]/70 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-cinzel font-bold text-[#8B5E3C] uppercase mr-1 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#C59A45]" />
          Epochs:
        </span>
        {eras.map(era => {
          const isSelected = selectedEra === era.id;
          return (
            <button
              key={era.id}
              type="button"
              onClick={() => {
                soundEffects.playClick();
                onSelectEra(era.id);
                if (era.id === 'all') {
                  jumpToStation(0);
                } else {
                  const firstIdx = events.findIndex(e => e.era === era.id);
                  if (firstIdx >= 0) {
                    jumpToStation(firstIdx);
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${isSelected
                ? 'bg-[#0A2947] text-[#F3E4C9] shadow-sm ring-1 ring-[#8B5E3C]'
                : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947]/80 border border-[#D3D4C0]'
                }`}
            >
              <span>{era.label}</span>
              <span
                className={`text-[10px] font-mono ${isSelected ? 'text-[#F3E4C9]/70' : 'text-[#8B5E3C]'
                  }`}
              >
                {era.span}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
