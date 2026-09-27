'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import './DepthCarousel.css';

export interface DepthCarouselItem {
  image: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  year?: number | string;
  id?: string;
}

export interface DepthCarouselProps {
  items?: (string | DepthCarouselItem)[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: 'left' | 'right' | 'both';
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: DepthCarouselItem) => void;
  onCardClick?: (index: number, item: DepthCarouselItem) => void;
  className?: string;
}

const DEFAULT_ITEMS: DepthCarouselItem[] = [
  { image: '/images/ambedkar_archive_hero_1790176060286.jpg', alt: 'Portrait of Dr. B. R. Ambedkar (1947)', title: 'First Law Minister', year: 1947 },
  { image: '/images/ambedkar_drafting_constitution_1790182039282.jpg', alt: 'Presenting the Constitution Draft', title: 'Architect of the Constitution', year: 1949 },
  { image: '/images/ambedkar_rajgruha_library_1790182019374.jpg', alt: 'In the Rajgruha Library', title: 'Sanctuary of Knowledge', year: 1934 },
  { image: '/images/ambedkar_round_table_1790182055124.jpg', alt: 'At the Round Table Conference London', title: 'Round Table Conference', year: 1931 },
  { image: '/images/ambedkar_law_minister_1790182070157.jpg', alt: 'Taking Oath as Law Minister', title: 'Law & Justice Minister', year: 1947 },
  { image: '/images/ambedkar_nagpur_deeksha_1790182086774.jpg', alt: 'The Great Conversion at Nagpur', title: 'Historic Dhamma Deeksha', year: 1956 }
];

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeItem = (it: string | DepthCarouselItem): DepthCarouselItem =>
  typeof it === 'string' ? { image: it, alt: '' } : it;

export const DepthCarousel: React.FC<DepthCarouselProps> = ({
  items = DEFAULT_ITEMS,
  cardWidth = 350,
  cardHeight = 420,
  radius = 23,
  tint = '#0a2947',
  depth = 80,
  spread = 115,
  tilt = 19,
  tiltDirection = 'both',
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = 'power3.out',
  autoplay = false,
  autoplayDelay = 2000,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  onCardClick: externalCardClick,
  className = ''
}) => {
  const data = useMemo<DepthCarouselItem[]>(
    () => (Array.isArray(items) && items.length > 0 ? items : DEFAULT_ITEMS).map(normalizeItem),
    [items]
  );
  const count = data.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const posRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const scaleRef = useRef(1);
  const cfgRef = useRef<any>({});
  const onChangeRef = useRef(onChange);

  const dragRef = useRef<any>(null);
  const wheelTimerRef = useRef<any>(null);
  const autoTimerRef = useRef<any>(null);
  const reducedRef = useRef(false);

  const [active, setActive] = useState(0);

  onChangeRef.current = onChange;
  cfgRef.current = {
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
    autoplayDelay
  };

  const layout = useCallback((pos: number) => {
    const cfg = cfgRef.current;
    const n = cfg.count;
    if (!n) return;
    const isBoth = cfg.tiltDirection === 'both';
    const dir = cfg.tiltDirection === 'left' ? -1 : 1;
    const sc = scaleRef.current;
    const maxVis = cfg.visibleCards || 3;
    const fadeStart = maxVis - 0.8;
    const fadeEnd = maxVis + 0.6;

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      let d = i - pos;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const back = isBoth ? Math.abs(d) : Math.max(0, d);
      const az = Math.abs(d);

      let opacity: number;
      if (isBoth) {
        if (az <= fadeStart) {
          opacity = 1;
        } else if (az < fadeEnd) {
          opacity = Math.max(0, 1 - (az - fadeStart) / (fadeEnd - fadeStart));
        } else {
          opacity = 0;
        }
      } else {
        opacity = d < 0 ? Math.max(0, 1 + d) : (az <= maxVis ? 1 : Math.max(0, 1 - (az - maxVis)));
      }

      const shown = opacity > 0.01;

      let tz: number;
      let tx: number;
      let ry: number;

      if (isBoth) {
        tz = -cfg.depth * back;
        tx = cfg.spread * d;
        ry = Math.sign(d) * cfg.tilt * clamp(back, 0, 1);
      } else {
        tz = -cfg.depth * d;
        tx = dir * cfg.spread * d;
        ry = dir * cfg.tilt * clamp(d, 0, 1);
      }

      const brightness = Math.max(0.22, 1 - back * cfg.falloff);
      const blurPx = cfg.blur > 0 ? Math.min(cfg.blur, (back / maxVis) * cfg.blur) : 0;
      const zi = Math.round(2000 - back * 20);

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      if (blurPx > 0.3) {
        el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(1)}px)`;
      } else {
        el.style.filter = `brightness(${brightness.toFixed(3)})`;
      }
      el.style.zIndex = String(zi);
      el.style.pointerEvents = shown && opacity > 0.1 ? 'auto' : 'none';

      const ov = overlayRefs.current[i];
      if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }, []);

  const notify = useCallback(
    (idx: number) => {
      setActive(idx);
      onChangeRef.current?.(idx, data[idx]);
    },
    [data]
  );

  const tweenTo = useCallback(
    (target: number, animate: boolean) => {
      tweenRef.current?.kill();
      const cfg = cfgRef.current;
      const proxy = { p: posRef.current };
      const dur = animate && !reducedRef.current ? cfg.duration / 1000 : 0;
      tweenRef.current = gsap.to(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease || 'power2.out',
        onUpdate: () => {
          posRef.current = proxy.p;
          layout(proxy.p);
        },
        onComplete: () => {
          const n = cfg.count;
          if (n > 0 && cfg.loop) {
            posRef.current = ((proxy.p % n) + n) % n;
          } else {
            posRef.current = proxy.p;
          }
          layout(posRef.current);
        }
      });
    },
    [layout]
  );

  const setFocus = useCallback(
    (rawIndex: number, animate = true) => {
      const cfg = cfgRef.current;
      const n = cfg.count;
      if (!n) return;
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
      
      const currentPos = ((posRef.current % n) + n) % n;
      let delta = idx - currentPos;
      if (cfg.loop && n > 1) {
        if (delta > n / 2) delta -= n;
        if (delta < -n / 2) delta += n;
      }
      tweenTo(posRef.current + delta, animate);
      if (idx !== focusRef.current) {
        focusRef.current = idx;
        notify(idx);
      }
    },
    [tweenTo, notify]
  );

  const navigateBy = useCallback(
    (step: number) => {
      const cfg = cfgRef.current;
      const n = cfg.count;
      if (!n) return;
      const target = Math.round(posRef.current) + step;
      const nextIdx = ((target % n) + n) % n;
      focusRef.current = nextIdx;
      notify(nextIdx);
      tweenTo(target, true);
    },
    [tweenTo, notify]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      const cfg = cfgRef.current;
      const isBoth = cfg.tiltDirection === 'both';
      const sideFactor = isBoth ? 3.2 : 2;
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * sideFactor + 60;
      scaleRef.current = clamp(w / needed, 0.4, 1);
      layout(posRef.current);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [layout]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const cfg = cfgRef.current;
      if (cfg.count < 2) return;
      e.preventDefault();
      tweenRef.current?.kill();
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;
      const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6);
      posRef.current += step;
      layout(posRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => setFocus(Math.round(posRef.current), true), 130);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [layout, setFocus]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const cfg = cfgRef.current;
    if (cfg.count < 2) return;
    tweenRef.current?.kill();
    dragRef.current = {
      x: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId
    };
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const cfg = cfgRef.current;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (!drag.moved) return;
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1);
      drag.v = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX;
      drag.lastT = now;
      posRef.current = drag.startPos - dx / stepPx;
      layout(posRef.current);
    },
    [layout]
  );

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const cfg = cfgRef.current;
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
    const projected = posRef.current - (drag.v * 180) / stepPx;
    setFocus(Math.round(projected), true);
  }, [setFocus]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateBy(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateBy(1);
      }
    },
    [navigateBy]
  );

  const handleCardClick = useCallback(
    (index: number) => {
      if (dragRef.current?.moved) return;
      if (index === focusRef.current) {
        externalCardClick?.(index, data[index]);
      } else {
        setFocus(index, true);
      }
    },
    [setFocus, externalCardClick, data]
  );

  useEffect(() => {
    reducedRef.current = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!autoplay || reducedRef.current || count < 2) return;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    const stop = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    };
    const start = () => {
      stop();
      autoTimerRef.current = window.setInterval(
        () => {
          if (!hovered && !focused) navigateBy(1);
        },
        Math.max(cfgRef.current.autoplayDelay, 600)
      );
    };
    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    const onFocusIn = () => {
      focused = true;
    };
    const onFocusOut = () => {
      focused = false;
    };
    root?.addEventListener('mouseenter', onEnter);
    root?.addEventListener('mouseleave', onLeave);
    root?.addEventListener('focusin', onFocusIn);
    root?.addEventListener('focusout', onFocusOut);
    start();
    return () => {
      stop();
      root?.removeEventListener('mouseenter', onEnter);
      root?.removeEventListener('mouseleave', onLeave);
      root?.removeEventListener('focusin', onFocusIn);
      root?.removeEventListener('focusout', onFocusOut);
    };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => {
    layout(posRef.current);
  }, [layout, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count]);

  useEffect(
    () => () => {
      tweenRef.current?.kill();
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    },
    []
  );

  const currentItem = data[active];

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={{ ['--dc-perspective' as any]: `${perspective}px` }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Babasaheb Historical Photographs Depth Carousel"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage" ref={stageRef}>
        {data.map((item, i) => (
          <div
            key={item.id || i}
            className={`depth-carousel__card${active === i ? ' is-active' : ''}`}
            ref={el => {
              cardRefs.current[i] = el;
            }}
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={active !== i}
            onClick={() => handleCardClick(i)}
          >
            <img className="depth-carousel__img" src={item.image} alt={item.alt || ''} draggable={false} />
            <span
              className="depth-carousel__tint"
              ref={el => {
                overlayRefs.current[i] = el;
              }}
              style={{ background: tint }}
            />
            {/* Curatorial Card Foil Accent */}
            <div className="depth-carousel__card-border" />

            {/* Optional Card Bottom Caption Tag */}
            {(item.title || item.year) && (
              <div className="depth-carousel__card-info">
                {item.year && (
                  <span className="depth-carousel__card-year">{item.year}</span>
                )}
                {item.title && (
                  <span className="depth-carousel__card-title">{item.title}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            aria-label="Previous photograph"
            onClick={() => navigateBy(-1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            aria-label="Next photograph"
            onClick={() => navigateBy(1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="tablist" aria-label="Slides">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to photograph ${i + 1}`}
              className={`depth-carousel__dot${active === i ? ' is-active' : ''}`}
              onClick={() => setFocus(i, true)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepthCarousel;
