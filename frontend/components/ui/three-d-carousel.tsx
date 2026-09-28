'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  MapPin,
  Sparkles,
  BookOpen,
  Film,
  ArrowRight,
  Eye,
  Compass,
} from 'lucide-react';

export interface ThreeDCarouselCard {
  id?: string;
  image?: string;
  title: string;
  titleLocal?: {
    hi?: string;
    mr?: string;
  };
  year: number | string;
  dateString?: string;
  era?: string;
  location?: string;
  description: string;
  descriptionLocal?: {
    hi?: string;
    mr?: string;
  };
  quote?: string;
  quoteAttribution?: string;
  highlights?: string[];
  tag?: string;
  mediaType?: 'video' | 'photo' | 'document' | 'speech';
  videoTitle?: string;
  videoDuration?: string;
  videoReelClip?: string;
  relatedDocIds?: string[];
}

export interface ThreeDPhotoCarouselProps {
  cards?: (string | ThreeDCarouselCard)[];
  activeIndex?: number;
  language?: string;
  onCardChange?: (index: number, card: ThreeDCarouselCard) => void;
  onOpenMedia?: (card: ThreeDCarouselCard, index?: number) => void;
  onAskAI?: (query: string) => void;
  onSpeakQuote?: (text: string) => void;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
}

const DEFAULT_CARDS: ThreeDCarouselCard[] = [
  {
    id: 'birth-1891',
    image: '/images/ambedkar_young.gif',
    title: 'Birth at Mhow Cantonment',
    year: 1891,
    dateString: 'April 14, 1891',
    era: 'Early Life & Awakenings',
    location: 'Mhow (Dr. Ambedkar Nagar), Central Provinces',
    description: 'Born to Subedar Ramji Maloji Sakpal and Bhimabai, beginning a monumental journey against social ostracization.',
    highlights: [
      '14th child of Ramji Sakpal and Bhimabai',
      'Father was a Subedar-Major in the British Indian Army',
      'Early education in Satara under profound social hurdles',
    ],
    quote: 'Life should be great rather than long.',
  },
  {
    id: 'columbia-1916',
    image: '/images/ambedkar_columbia_study_tour.jpg',
    title: 'Columbia University & London School of Economics',
    year: 1916,
    dateString: '1913 – 1923',
    era: 'Education & Early Struggle',
    location: 'New York & London',
    description: 'Earned Master of Arts, PhD, Bar-at-Law, and Doctor of Science. Authored seminal economic and sociological theses.',
    highlights: [
      'MA and PhD from Columbia University under Prof. Edwin Seligman',
      'D.Sc. in Economics from London School of Economics',
      'Called to the Bar at Gray’s Inn, London',
    ],
    quote: 'Cultivation of mind should be the ultimate aim of human existence.',
  },
  {
    id: 'mahad-1927',
    image: '/images/ambedkar_public_assembly.png',
    title: 'The Historic Mahad Satyagraha (Chavdar Tale)',
    year: 1927,
    dateString: 'March 20, 1927',
    era: 'Mass Movements & Civil Rights',
    location: 'Mahad, Kolaba District, Maharashtra',
    description: 'Asserting fundamental human equality by peacefully drinking water from the Chavdar public reservoir.',
    highlights: [
      'Over 10,000 disciplined marchers gathered at Mahad',
      'Asserted drinking water as an inalienable civic right',
      'Commemorated annually as National Social Empowerment Day',
    ],
    mediaType: 'video',
    videoTitle: 'Mahad Satyagraha March Reel & Water Declaration',
    quote: 'We are not going to Chavdar Tale merely to drink water; we are going there to establish our human rights.',
  },
  {
    id: 'round-table-1930',
    image: '/images/ambedkar_barrister_1922.jpg',
    title: 'Round Table Conferences in London',
    year: 1930,
    dateString: 'November 1930 – 1932',
    era: 'Political Representation',
    location: 'House of Lords, St. James Palace, London',
    description: 'Forcefully championed separate electorates, adult franchise, and statutory civil safeguards before the imperial assembly.',
    highlights: [
      'Sole representative of the Depressed Classes of India',
      'Challenged colonial and orthodox hegemony on constitutional safeguards',
      'Laid groundwork for the Poona Pact of 1932',
    ],
    quote: 'Men are mortal. So are ideas. An idea needs propagation as much as a plant needs watering.',
  },
  {
    id: 'constitution-1947',
    image: '/images/ambedkar_signing_constitution.jpg',
    title: 'Chairman of Constitution Drafting Committee',
    year: 1947,
    dateString: 'August 29, 1947 – January 26, 1950',
    era: 'Nation Building & Constitution',
    location: 'Constituent Assembly Chamber, New Delhi',
    description: 'Chief Architect and Pilot of the Constitution of India, guaranteeing fundamental rights, social democracy, and universal suffrage.',
    highlights: [
      'Appointed Drafting Committee Chairman on August 29, 1947',
      'Steered 7,635 tabled amendments and thousands of hours of debate',
      'Drafted the Preamble, Fundamental Rights, and Directive Principles',
    ],
    mediaType: 'video',
    videoTitle: 'Drafting Committee Chamber Reel & Assembly Debates',
    quote: 'Constitutional morality is not a natural sentiment. It has to be cultivated.',
  },
  {
    id: 'deeksha-1956',
    image: '/images/ambedkar_historic_seated.jpg',
    title: 'The Historic Dhamma Deeksha at Nagpur',
    year: 1956,
    dateString: 'October 14, 1956',
    era: 'Spiritual Renaissance & Legacy',
    location: 'Deekshabhoomi, Nagpur',
    description: 'Renounced caste inequality by embracing Buddhism with over 500,000 followers, administering the 22 historic vows of liberation.',
    highlights: [
      'Largest peaceful mass religious conversion in recorded human history',
      'Administered the 22 vows of rationalism and civic liberty',
      'Revitalized the Buddhist Dhamma of compassion and equality in modern India',
    ],
    mediaType: 'video',
    videoTitle: 'Deekshabhoomi Archival Reel: Nagpur 1956 Congregation',
    quote: 'I like the religion that teaches liberty, equality, and fraternity.',
  },
];

export function ThreeDPhotoCarousel({
  cards: propCards,
  activeIndex: externalActiveIndex,
  language = 'en',
  onCardChange,
  onOpenMedia,
  onAskAI,
  onSpeakQuote,
  autoRotate = false,
  autoRotateSpeed = 0.12,
  cardWidth = 290,
  cardHeight = 420,
  className = '',
}: ThreeDPhotoCarouselProps) {
  // Normalize cards
  const cards = useMemo<ThreeDCarouselCard[]>(() => {
    if (propCards && propCards.length > 0) {
      return propCards.map((c, i) =>
        typeof c === 'string'
          ? {
            id: `card-${i}`,
            image: c,
            title: `Historical Item ${i + 1}`,
            year: 1891 + i * 5,
            description: 'Archival artifact from Dr. B. R. Ambedkar’s life and constitutional struggle.',
          }
          : c
      );
    }
    return DEFAULT_CARDS;
  }, [propCards]);

  const count = cards.length;
  const angleStep = count > 0 ? 360 / count : 0;

  // Responsive container width tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const isMobile = containerWidth < 640;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;
  const effectiveCardWidth = isMobile ? 210 : isTablet ? 250 : cardWidth;
  const effectiveCardHeight = isMobile ? 320 : isTablet ? 370 : cardHeight;

  // Cylindrical Geometry: R = (W / 2) / tan(pi / N)
  // Ensures cards form a continuous, graceful 3D ring
  const radius = useMemo(() => {
    if (count <= 2) return 260;
    const rad = (effectiveCardWidth / 2) / Math.tan(Math.PI / count);
    return Math.max(340, Math.round(rad));
  }, [count, effectiveCardWidth]);

  // Active milestone index state
  const [internalActive, setInternalActive] = useState<number>(0);
  const activeIndex = externalActiveIndex !== undefined ? externalActiveIndex : internalActive;

  // Auto-Spin State
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(autoRotate);

  // Animation and physics refs
  const currentAngleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartAngleRef = useRef<number>(0);
  const lastDragTimeRef = useRef<number>(0);
  const lastDragXRef = useRef<number>(0);
  const hasMovedSignificantlyRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const isLoopRunningRef = useRef<boolean>(false);
  const wakeRenderLoopRef = useRef<() => void>(() => {});

  const internalActiveRef = useRef<number>(0);
  const onCardChangeRef = useRef(onCardChange);
  onCardChangeRef.current = onCardChange;
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  // DOM elements
  const cylinderRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardPointerDownRef = useRef<{ index: number; x: number; y: number } | null>(null);

  // 60fps Smooth Physics & Sharp 3D Projection Render Loop with Sleep-When-Settled
  useEffect(() => {
    let animId: number = 0;

    const updateSceneTransforms = (rotY: number) => {
      if (cylinderRef.current) {
        cylinderRef.current.style.transform = `translateZ(${-radius}px) rotateY(${rotY.toFixed(2)}deg)`;
      }

      let bestDist = Infinity;
      let frontIdx = 0;

      for (let i = 0; i < count; i++) {
        const el = cardElementsRef.current[i];
        if (!el) continue;

        const baseAngle = i * angleStep;
        let rel = (baseAngle + rotY) % 360;
        if (rel < -180) rel += 360;
        if (rel > 180) rel += 360;

        const absRel = Math.abs(rel);
        if (absRel < bestDist) {
          bestDist = absRel;
          frontIdx = i;
        }

        // Backface Culling & Depth Hierarchy
        if (absRel > 92) {
          // Cards facing away from the viewer: completely hidden to save GPU compositing
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.visibility = 'hidden';
          el.style.zIndex = '1';
        } else {
          // Front and visible flanking cards: crystal sharp, natural depth falloff
          const normalizedDist = absRel / 90;
          const opacity = Math.max(0.42, 1 - normalizedDist * 0.45);
          const scale = absRel < 12 ? 1.03 : Math.max(0.90, 1 - normalizedDist * 0.08);
          const zIndex = Math.round(100 - absRel);

          el.style.visibility = 'visible';
          el.style.opacity = opacity.toFixed(2);
          el.style.pointerEvents = 'auto';
          el.style.transform = `rotateY(${baseAngle}deg) translateZ(${radius}px) scale(${scale.toFixed(3)})`;
          el.style.zIndex = String(zIndex);
        }
      }

      // Sync active state when card changes
      if (frontIdx !== internalActiveRef.current && !isDraggingRef.current) {
        internalActiveRef.current = frontIdx;
        setInternalActive(frontIdx);
        onCardChangeRef.current?.(frontIdx, cardsRef.current[frontIdx]);
      }
    };

    const render = () => {
      // Auto-spin ticker
      if (isAutoSpinning && !isDraggingRef.current && !isHoveredRef.current) {
        targetAngleRef.current -= autoRotateSpeed;
      }

      // Physics spring interpolation
      if (!isDraggingRef.current) {
        velocityRef.current *= 0.90;
        targetAngleRef.current += velocityRef.current;

        const diff = targetAngleRef.current - currentAngleRef.current;
        currentAngleRef.current += diff * 0.14;

        // SLEEP LOGIC: When movement ceases and not auto-spinning, stop the RAF loop completely
        // This drops idle CPU/GPU usage to exactly 0%!
        if (
          !isAutoSpinning &&
          Math.abs(velocityRef.current) < 0.002 &&
          Math.abs(diff) < 0.02
        ) {
          currentAngleRef.current = targetAngleRef.current;
          velocityRef.current = 0;
          updateSceneTransforms(currentAngleRef.current);
          isLoopRunningRef.current = false;
          return;
        }
      }

      updateSceneTransforms(currentAngleRef.current);
      animId = requestAnimationFrame(render);
    };

    const wakeLoop = () => {
      if (isLoopRunningRef.current) return;
      isLoopRunningRef.current = true;
      animId = requestAnimationFrame(render);
    };

    wakeRenderLoopRef.current = wakeLoop;

    // Start initial render
    wakeLoop();

    return () => {
      cancelAnimationFrame(animId);
      isLoopRunningRef.current = false;
    };
  }, [count, angleStep, radius, isAutoSpinning, autoRotateSpeed]);

  // Rotate smoothly to specific index
  const rotateToIndex = useCallback(
    (targetIndex: number) => {
      if (count === 0) return;
      const targetBaseAngle = -targetIndex * angleStep;

      const cur = targetAngleRef.current;
      const diff = ((((targetBaseAngle - cur) % 360) + 540) % 360) - 180;
      targetAngleRef.current = cur + diff;
      velocityRef.current = 0;

      internalActiveRef.current = targetIndex;
      setInternalActive(targetIndex);
      onCardChangeRef.current?.(targetIndex, cardsRef.current[targetIndex]);
      wakeRenderLoopRef.current();
    },
    [count, angleStep]
  );

  // Sync external index
  useEffect(() => {
    if (externalActiveIndex !== undefined && externalActiveIndex !== internalActiveRef.current) {
      rotateToIndex(externalActiveIndex);
    }
  }, [externalActiveIndex, rotateToIndex]);

  // Pointer drag gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasMovedSignificantlyRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartAngleRef.current = currentAngleRef.current;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = performance.now();
    velocityRef.current = 0;
    wakeRenderLoopRef.current();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartXRef.current;
    if (!hasMovedSignificantlyRef.current && Math.abs(dx) > 6) {
      hasMovedSignificantlyRef.current = true;
      try {
        containerRef.current?.setPointerCapture(e.pointerId);
      } catch (_) { }
    }

    if (!hasMovedSignificantlyRef.current) return;

    const sensitivity = 0.28;
    currentAngleRef.current = dragStartAngleRef.current + dx * sensitivity;
    targetAngleRef.current = currentAngleRef.current;

    const now = performance.now();
    const dt = Math.max(1, now - lastDragTimeRef.current);
    const frameDx = e.clientX - lastDragXRef.current;
    velocityRef.current = (frameDx / dt) * 3.2;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = now;
    wakeRenderLoopRef.current();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch (_) { }

    // Snap to nearest card upon release if moved
    if (hasMovedSignificantlyRef.current) {
      const nearestIndex = (Math.round(-targetAngleRef.current / angleStep) % count + count) % count;
      rotateToIndex(nearestIndex);
    }
  };

  // Wheel / Trackpad horizontal swipe
  const handleWheel = (e: React.WheelEvent) => {
    const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(rawDelta) < 3) return;

    e.preventDefault();
    velocityRef.current = -Math.sign(rawDelta) * Math.min(Math.abs(rawDelta) * 0.14, 5);
    wakeRenderLoopRef.current();
  };

  // Click card to open detailed popup (Examine modal)
  const handleCardClick = (card: ThreeDCarouselCard, index: number, e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    if (hasMovedSignificantlyRef.current || Math.abs(velocityRef.current) > 0.8) return;

    // Rotate cylinder to face this card
    rotateToIndex(index);

    // Directly open the Examine / Multimedia modal!
    onOpenMedia?.(card, index);
  };

  const handleCardPointerUp = (card: ThreeDCarouselCard, index: number, e: React.PointerEvent) => {
    if (cardPointerDownRef.current && cardPointerDownRef.current.index === index) {
      const dist = Math.hypot(e.clientX - cardPointerDownRef.current.x, e.clientY - cardPointerDownRef.current.y);
      if (dist < 10) {
        e.stopPropagation();
        rotateToIndex(index);
        onOpenMedia?.(card, index);
      }
    }
    cardPointerDownRef.current = null;
  };

  const handlePrev = () => {
    const nextIdx = (activeIndex - 1 + count) % count;
    rotateToIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % count;
    rotateToIndex(nextIdx);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter' || e.key === ' ') {
        onOpenMedia?.(cards[activeIndex], activeIndex);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cards, activeIndex, handlePrev, handleNext, onOpenMedia]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl bg-gradient-to-b from-[#06182C] via-[#0A243F] to-[#04101D] border-2 border-[#C59A45]/40 shadow-2xl p-4 sm:p-6 overflow-hidden select-none ${className}`}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        if (isAutoSpinning) wakeRenderLoopRef.current();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{ touchAction: 'pan-y' }}
      tabIndex={0}
      role="region"
      aria-label="3D Cylindrical Historical Timeline Reel"
    >
      {/* Subtle curatorial background ambient vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#14395E_0%,transparent_70%)] opacity-40 pointer-events-none" />

      {/* Top Controls & Curatorial Header Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#C59A45]/25 pb-3.5 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C59A45] text-[#0A2947] flex items-center justify-center shadow-md">
            <Film className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-cinzel font-bold tracking-widest text-[#F3E4C9] uppercase">
                Historical 3D Reel Rotunda
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#C59A45]/20 border border-[#C59A45]/50 text-[10px] font-mono text-[#C59A45] font-semibold">
                Interactive Cylinder
              </span>
            </div>
            <p className="text-[11px] font-dmsans text-[#D3D4C0]/75 hidden sm:block">
              Drag horizontally or use arrows to spin · Click any card to examine detailed archival records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-Rotate Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !isAutoSpinning;
              setIsAutoSpinning(next);
              if (next) wakeRenderLoopRef.current();
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              isAutoSpinning
                ? 'bg-[#C59A45] text-[#0A2947] border-[#C59A45]'
                : 'bg-white/5 border-white/20 text-[#F3E4C9] hover:bg-white/10'
            }`}
            title={isAutoSpinning ? 'Pause Automatic Rotation' : 'Start Automatic Rotation'}
          >
            {isAutoSpinning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span className="hidden sm:inline">Auto-Spin</span>
              </>
            )}
          </button>

          {/* Reset Center */}
          <button
            type="button"
            onClick={() => rotateToIndex(0)}
            className="p-2 rounded-xl bg-white/5 border border-white/20 text-[#F3E4C9] hover:bg-[#C59A45] hover:text-[#0A2947] transition-all cursor-pointer shadow-xs"
            title="Reset to First Milestone"
            aria-label="Reset to First Milestone"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Quick Prev / Next Stepper */}
          <div className="flex items-center gap-1 bg-[#041220] p-1 rounded-xl border border-[#C59A45]/30">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-[#F3E4C9] hover:bg-[#C59A45] hover:text-[#0A2947] transition-all cursor-pointer"
              aria-label="Previous Milestone"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-[#C59A45] px-2 min-w-[54px] text-center">
              {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-[#F3E4C9] hover:bg-[#C59A45] hover:text-[#0A2947] transition-all cursor-pointer"
              aria-label="Next Milestone"
              title="Next (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Side Large Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-[#06182C]/90 hover:bg-[#C59A45] border-2 border-[#C59A45]/60 text-[#F3E4C9] hover:text-[#0A2947] items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer group hover:scale-105"
        aria-label="Rotate Previous Milestone"
      >
        <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-[#06182C]/90 hover:bg-[#C59A45] border-2 border-[#C59A45]/60 text-[#F3E4C9] hover:text-[#0A2947] items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer group hover:scale-105"
        aria-label="Rotate Next Milestone"
      >
        <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* 3D Perspective Stage */}
      <div
        className="relative w-full h-[500px] sm:h-[560px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* The Rotating Cylinder Housing */}
        <div
          ref={cylinderRef}
          className="relative flex items-center justify-center"
          style={{
            width: effectiveCardWidth,
            height: effectiveCardHeight,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          {cards.map((card, i) => {
            const isSelected = activeIndex === i;
            const displayTitle =
              language !== 'en' && card.titleLocal?.[language as 'hi' | 'mr']
                ? card.titleLocal[language as 'hi' | 'mr']
                : card.title;

            return (
              <div
                key={card.id || `card-${i}`}
                ref={(el) => {
                  cardElementsRef.current[i] = el;
                }}
                className="absolute top-0 left-0 cursor-pointer group select-none"
                style={{
                  width: effectiveCardWidth,
                  height: effectiveCardHeight,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  willChange: 'transform, opacity',
                }}
                onPointerDown={(e) => {
                  cardPointerDownRef.current = { index: i, x: e.clientX, y: e.clientY };
                }}
                onPointerUp={(e) => handleCardPointerUp(card, i, e)}
                onClick={(e) => handleCardClick(card, i, e)}
              >
                {/* 3D Archival Card Specimen Frame */}
                <div
                  className={`w-full h-full rounded-2xl overflow-hidden border-2 transition-all duration-300 relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#C59A45] ring-4 ring-[#C59A45]/50 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(197,154,69,0.35)] bg-[#07192C]'
                      : 'border-[#C59A45]/30 hover:border-[#C59A45]/80 shadow-xl bg-[#061525]'
                  }`}
                  style={{
                    WebkitFontSmoothing: 'antialiased',
                  }}
                >
                  {/* Full-Bleed Archival Photo Container */}
                  <div className="relative flex-1 w-full overflow-hidden bg-[#040E1A]">
                    <img
                      src={card.image || '/images/ambedkar_portrait_1950.jpg'}
                      alt={displayTitle || `Reel Frame ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                      style={{
                        imageRendering: 'auto',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                      draggable={false}
                    />

                    {/* Clean Gradient Scrim: Top is 100% CLEAR so photo shines, bottom transitions smoothly for text */}
                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#04111E] via-[#04111E]/80 to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                      {card.year && (
                        <div
                          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider shadow-lg flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#C59A45] to-[#DFBA73] text-[#0A2947] ring-1 ring-white/40'
                              : 'bg-[#07192C]/95 border border-[#C59A45]/70 text-[#F3E4C9]'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{card.year}</span>
                        </div>
                      )}

                      {card.mediaType === 'video' ? (
                        <div className="px-2.5 py-1 rounded-xl bg-[#C59A45] text-[#0A2947] font-mono font-bold text-[10px] uppercase flex items-center gap-1 shadow-lg animate-pulse">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                          <span>Reel</span>
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-xl bg-[#04111E]/85 border border-white/20 text-[#FAF7F0] text-[10px] font-mono uppercase tracking-wider shadow-md">
                          Folio
                        </div>
                      )}
                    </div>

                    {/* Center Hover Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#C59A45]/90 text-[#0A2947] flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        {card.mediaType === 'video' ? (
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        ) : (
                          <Eye className="w-6 h-6" />
                        )}
                      </div>
                    </div>

                    {/* Bottom Caption & Action Area */}
                    <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 text-left pointer-events-auto z-10">
                      {card.era && (
                        <p className="text-[10px] font-cinzel font-bold text-[#C59A45] uppercase tracking-wider truncate mb-1">
                          {card.era}
                        </p>
                      )}

                      <h4 className="text-sm sm:text-base font-serif-editorial font-bold text-white leading-snug line-clamp-2 group-hover:text-[#F3E4C9] transition-colors drop-shadow-sm">
                        {displayTitle || `Milestone ${i + 1}`}
                      </h4>

                      {card.location && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#D3D4C0]/80 mt-1 truncate">
                          <MapPin className="w-3 h-3 text-[#C59A45] shrink-0" />
                          <span className="truncate">{card.location}</span>
                        </div>
                      )}

                      {/* Interactive Examine Button */}
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#D3D4C0]/60">
                          Milestone #{i + 1}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            rotateToIndex(i);
                            onOpenMedia?.(card, i);
                          }}
                          onPointerUp={(e) => {
                            e.stopPropagation();
                            rotateToIndex(i);
                            onOpenMedia?.(card, i);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C59A45] to-[#DFBA73] hover:from-[#DFBA73] hover:to-[#C59A45] text-[#0A2947] font-montserrat font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 active:scale-95"
                          title="Examine Historical Specimen"
                        >
                          <span>Examine</span>
                          <ArrowRight className="w-3 h-3 inline" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Station Thumbnails / Quick Jumper Scrubber */}
      <div className="relative z-20 pt-4 border-t border-[#C59A45]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none py-1">
          {cards.map((card, idx) => {
            const isCur = activeIndex === idx;
            return (
              <button
                key={card.id || `pill-${idx}`}
                type="button"
                onClick={() => rotateToIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCur
                    ? 'bg-[#C59A45] text-[#0A2947] shadow-md ring-2 ring-[#C59A45]/40 scale-105'
                    : 'bg-white/5 hover:bg-white/15 text-[#D3D4C0]/75 hover:text-white border border-white/10'
                }`}
                title={`Jump to: ${card.title} (${card.year})`}
              >
                <span>{card.year || idx + 1}</span>
              </button>
            );
          })}
        </div>

        <div className="text-right text-[11px] font-mono text-[#D3D4C0]/70 shrink-0 hidden sm:block">
          Use <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-[#FAF7F0]">←</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-[#FAF7F0]">→</kbd> or Drag to Rotate
        </div>
      </div>
    </div>
  );
}

export default ThreeDPhotoCarousel;
