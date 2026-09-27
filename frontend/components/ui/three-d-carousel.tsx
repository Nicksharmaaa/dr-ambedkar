'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Film,
  ExternalLink,
  Award,
  Layers,
  ArrowRight,
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
    image: '/images/ambedkar_archive_hero_1790176060286.jpg',
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
    image: '/images/ambedkar_drafting_constitution_1790182039282.jpg',
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
    image: '/images/ambedkar_rajgruha_library_1790182019374.jpg',
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
    image: '/images/ambedkar_round_table_1790182055124.jpg',
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
    image: '/images/ambedkar_law_minister_1790182070157.jpg',
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
    image: '/images/ambedkar_nagpur_deeksha_1790182086774.jpg',
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
  autoRotateSpeed = 0.16,
  cardWidth = 240,
  cardHeight = 340,
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
  const effectiveCardWidth = isMobile ? 170 : isTablet ? 210 : cardWidth;
  const effectiveCardHeight = isMobile ? 250 : isTablet ? 295 : cardHeight;

  // Cylindrical Apothem Geometry: R = (W / 2) / tan(pi / N)
  const radius = useMemo(() => {
    if (count <= 2) return 240;
    const rad = (effectiveCardWidth / 2) / Math.tan(Math.PI / count);
    return Math.max(220, Math.round(rad) + (isMobile ? 25 : 45));
  }, [count, effectiveCardWidth, isMobile]);

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

  // DOM elements
  const cylinderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // 60fps Physics & Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      // Auto-spin ticker
      if (isAutoSpinning && !isDraggingRef.current && !isHoveredRef.current) {
        targetAngleRef.current -= autoRotateSpeed;
      }

      // Physics spring interpolation
      if (!isDraggingRef.current) {
        velocityRef.current *= 0.91;
        targetAngleRef.current += velocityRef.current;

        const diff = targetAngleRef.current - currentAngleRef.current;
        currentAngleRef.current += diff * 0.12;
      }

      const rotY = currentAngleRef.current;

      // Update cylinder rotation
      if (cylinderRef.current) {
        cylinderRef.current.style.transform = `rotateY(${rotY.toFixed(2)}deg)`;
      }

      // Compute facing card & cull backface cards
      let bestDist = Infinity;
      let frontIdx = 0;

      for (let i = 0; i < count; i++) {
        const el = cardElementsRef.current[i];
        if (!el) continue;

        const baseAngle = i * angleStep;
        let rel = (baseAngle + rotY) % 360;
        if (rel < -180) rel += 360;
        if (rel > 180) rel -= 360;

        const absRel = Math.abs(rel);
        if (absRel < bestDist) {
          bestDist = absRel;
          frontIdx = i;
        }

        // Backface Culling & Depth Scale
        if (absRel > 95) {
          el.style.opacity = '0.08';
          el.style.pointerEvents = 'none';
          el.style.transform = `rotateY(${baseAngle}deg) translateZ(${radius}px) scale(0.82)`;
          el.style.zIndex = '1';
        } else {
          const normalizedDist = absRel / 90;
          const opacity = Math.max(0.3, 1 - normalizedDist * 0.6);
          const scale = Math.max(0.88, 1 - normalizedDist * 0.12);
          const zIndex = Math.round(100 - absRel);

          el.style.opacity = opacity.toFixed(2);
          el.style.pointerEvents = 'auto';
          el.style.transform = `rotateY(${baseAngle}deg) translateZ(${radius}px) scale(${scale.toFixed(3)})`;
          el.style.zIndex = String(zIndex);
        }
      }

      // Sync active state when rotation settles
      if (frontIdx !== internalActive && !isDraggingRef.current) {
        setInternalActive(frontIdx);
        onCardChange?.(frontIdx, cards[frontIdx]);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [count, angleStep, radius, isAutoSpinning, autoRotateSpeed, internalActive, cards, onCardChange]);

  // Rotate smoothly to specific index
  const rotateToIndex = useCallback(
    (targetIndex: number) => {
      if (count === 0) return;
      const targetBaseAngle = -targetIndex * angleStep;

      const cur = targetAngleRef.current;
      const diff = ((((targetBaseAngle - cur) % 360) + 540) % 360) - 180;
      targetAngleRef.current = cur + diff;
      velocityRef.current = 0;

      setInternalActive(targetIndex);
      onCardChange?.(targetIndex, cards[targetIndex]);
    },
    [count, angleStep, cards, onCardChange]
  );

  // Sync external index
  useEffect(() => {
    if (externalActiveIndex !== undefined && externalActiveIndex !== internalActive) {
      rotateToIndex(externalActiveIndex);
    }
  }, [externalActiveIndex, rotateToIndex, internalActive]);

  const cardPointerDownRef = useRef<{ index: number; x: number; y: number } | null>(null);

  // Pointer drag gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasMovedSignificantlyRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartAngleRef.current = currentAngleRef.current;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = performance.now();
    velocityRef.current = 0;
    // NOTE: DO NOT call setPointerCapture here so click events on child cards are never blocked!
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartXRef.current;
    if (!hasMovedSignificantlyRef.current && Math.abs(dx) > 7) {
      hasMovedSignificantlyRef.current = true;
      try {
        containerRef.current?.setPointerCapture(e.pointerId);
      } catch (_) { }
    }

    if (!hasMovedSignificantlyRef.current) return;

    const sensitivity = 0.32;
    currentAngleRef.current = dragStartAngleRef.current + dx * sensitivity;
    targetAngleRef.current = currentAngleRef.current;

    const now = performance.now();
    const dt = Math.max(1, now - lastDragTimeRef.current);
    const frameDx = e.clientX - lastDragXRef.current;
    velocityRef.current = (frameDx / dt) * 3.5;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = now;
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
    velocityRef.current = -Math.sign(rawDelta) * Math.min(Math.abs(rawDelta) * 0.15, 6);
  };

  // Click card to open detailed popup (Examine modal)
  const handleCardClick = (card: ThreeDCarouselCard, index: number, e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    // If user was actively dragging or swiping, don't trigger modal
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
      className={`relative w-full rounded-3xl bg-gradient-to-b from-[#061B30] via-[#0A2947] to-[#030F1C] border-2 border-[#C59A45]/40 shadow-2xl p-4 sm:p-7 overflow-hidden select-none ${className}`}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
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
      {/* Background Architectural Ambient Radial Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[380px] bg-[#C59A45]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls & Curatorial Header Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#C59A45]/20 pb-3 mb-2">

        <div className="flex items-center gap-2">
          {/* Quick Prev / Next Station Stepper */}
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-xl bg-white/5 border border-white/15 text-[#F3E4C9] hover:bg-[#C59A45] hover:text-[#0A2947] transition-all cursor-pointer shadow-xs"
            aria-label="Previous Milestone"
            title="Previous Station (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[#C59A45] px-1.5">
            {activeIndex + 1} / {count}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="p-2 rounded-xl bg-white/5 border border-white/15 text-[#F3E4C9] hover:bg-[#C59A45] hover:text-[#0A2947] transition-all cursor-pointer shadow-xs"
            aria-label="Next Milestone"
            title="Next Station (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Side Large Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-[#0A2947]/80 hover:bg-[#C59A45] border border-[#C59A45]/40 text-[#F3E4C9] hover:text-[#0A2947] items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer group hover:scale-105"
        aria-label="Rotate Previous Milestone"
      >
        <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-[#0A2947]/80 hover:bg-[#C59A45] border border-[#C59A45]/40 text-[#F3E4C9] hover:text-[#0A2947] items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer group hover:scale-105"
        aria-label="Rotate Next Milestone"
      >
        <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* 3D Perspective Stage */}
      <div
        className="relative w-full h-[480px] sm:h-[530px] flex items-center justify-center cursor-grab active:cursor-grabbing"
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

            return (
              <div
                key={card.id || `card-${i}`}
                ref={(el) => {
                  cardElementsRef.current[i] = el;
                }}
                className="absolute top-0 left-0 transition-shadow duration-300 cursor-pointer group"
                style={{
                  width: effectiveCardWidth,
                  height: effectiveCardHeight,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                onPointerDown={(e) => {
                  cardPointerDownRef.current = { index: i, x: e.clientX, y: e.clientY };
                }}
                onPointerUp={(e) => handleCardPointerUp(card, i, e)}
                onClick={(e) => handleCardClick(card, i, e)}
              >
                {/* 3D Film Reel Card Frame */}
                <div
                  className={`w-full h-full rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-2xl relative backdrop-blur-md flex flex-col justify-between ${isSelected
                    ? 'border-[#C59A45] ring-4 ring-[#C59A45]/60 shadow-[0_0_40px_rgba(197,154,69,0.4)] bg-[#0A2947]'
                    : 'border-[#D3D4C0]/70 hover:border-[#C59A45] bg-[#0A2947]/90 hover:shadow-xl'
                    }`}
                >
                  {/* Vintage Film Reel Perforations at Top */}
                  <div className="h-3.5 w-full bg-[#041220] flex items-center justify-around px-2 border-b border-[#D3D4C0]/20 shrink-0">
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                  </div>

                  {/* Card Visual Specimen Frame */}
                  <div className="relative flex-1 w-full overflow-hidden bg-black/50">
                    <img
                      src={card.image || '/images/ambedkar_archive_hero_1790176060286.jpg'}
                      alt={card.title || `Reel Frame ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                      draggable={false}
                    />

                    {/* Gradient Shading */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2947] via-black/20 to-black/30 opacity-90" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                      {card.year && (
                        <div className="px-2.5 py-1 rounded-lg bg-[#0A2947]/95 border border-[#C59A45]/80 text-[#F3E4C9] text-xs font-mono font-bold tracking-wider shadow-lg backdrop-blur-xs">
                          {card.year}
                        </div>
                      )}

                      {card.mediaType === 'video' ? (
                        <div className="w-7 h-7 rounded-full bg-[#C59A45] text-[#0A2947] flex items-center justify-center shadow-lg animate-pulse">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded-md bg-black/60 border border-white/20 text-[#FAF7F0]/90 text-[9px] font-mono uppercase tracking-wider backdrop-blur-xs">
                          Photo
                        </div>
                      )}
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-2.5 inset-x-2.5 p-2.5 rounded-xl bg-[#0A2947]/95 border border-[#C59A45]/40 backdrop-blur-md text-left shadow-lg">
                      <p className="text-xs font-serif-editorial font-bold text-[#F3E4C9] line-clamp-1 group-hover:text-[#C59A45] transition-colors">
                        {card.title || `Reel Frame ${i + 1}`}
                      </p>
                      {card.era && (
                        <p className="text-[10px] font-cinzel font-medium text-[#C59A45] truncate mt-0.5">
                          {card.era}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-[#D3D4C0]/70">
                        <span className="truncate max-w-[100px]">{card.location || 'Historic Archive'}</span>
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
                          className="text-[#C59A45] hover:text-white font-bold flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded-md bg-[#C59A45]/20 hover:bg-[#C59A45] transition-colors"
                        >
                          <span>Examine</span>
                          <ArrowRight className="w-3 h-3 inline" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vintage Film Reel Perforations at Bottom */}
                  <div className="h-3.5 w-full bg-[#041220] flex items-center justify-around px-2 border-t border-[#D3D4C0]/20 shrink-0">
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                    <span className="w-2.5 h-1.5 bg-[#FAF7F0]/30 rounded-xs" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Station Thumbnails / Quick Dot Scrubber */}
      <div className="relative z-10 pt-4 border-t border-[#C59A45]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
        </div>
      </div>
    </div>
  );
}

export default ThreeDPhotoCarousel;
