'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './Masonry.css';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface MasonryItem {
  id: string;
  img: string;
  url?: string;
  height: number;
  photo?: any;
  [key: string]: any;
}

export interface MasonryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  onItemClick?: (item: MasonryItem, e: React.MouseEvent) => void;
  renderItem?: (item: MasonryItem) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const useMedia = (queries: string[], values: number[], defaultValue: number) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  };

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  return value;
};

const useMeasure = (): [React.RefObject<HTMLDivElement | null>, { width: number; height: number }] => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

export const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onItemClick,
  renderItem,
  className = '',
  style = {}
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure();

  const getInitialPosition = (item: MasonryItem & { x: number; y: number; w: number; h: number }) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;

    if (animateFrom === 'random') {
      const directions: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right'];
      direction = directions[Math.floor(Math.random() * directions.length)];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: (typeof window !== 'undefined' ? window.innerWidth : 1200) + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  const { grid, totalHeight } = useMemo(() => {
    if (!width) return { grid: [], totalHeight: 0 };

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    const calculatedGrid = items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = child.height / 2;
      const y = colHeights[col];

      colHeights[col] += height;

      return { ...child, x, y, w: columnWidth, h: height };
    });

    const calculatedHeight = Math.max(0, ...colHeights);

    return { grid: calculatedGrid, totalHeight: calculatedHeight };
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return;

    grid.forEach((item, index) => {
      const element = containerRef.current?.querySelector(`[data-key="${item.id}"]`);
      if (!element) return;

      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      };

      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item);
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus && { filter: 'blur(10px)' })
        };

        gsap.fromTo(element, initialState, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8,
          ease: 'power3.out',
          delay: index * stagger
        });
      } else {
        gsap.to(element, {
          ...animationProps,
          duration: duration,
          ease: ease,
          overwrite: 'auto'
        });
      }
    });

    hasMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, item: MasonryItem) => {
    const element = e.currentTarget;

    if (scaleOnHover) {
      gsap.to(element, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0.35,
          duration: 0.3
        });
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, item: MasonryItem) => {
    const element = e.currentTarget;

    if (scaleOnHover) {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3
        });
      }
    }
  };

  const handleClick = (item: MasonryItem, e: React.MouseEvent<HTMLDivElement>) => {
    if (onItemClick) {
      onItemClick(item, e);
    } else if (item.url && item.url !== '#') {
      window.open(item.url, '_blank', 'noopener');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`list ${className}`}
      style={{
        minHeight: totalHeight > 0 ? totalHeight : 300,
        ...style
      }}
    >
      {grid.map(item => {
        return (
          <div
            key={item.id}
            data-key={item.id}
            className="item-wrapper"
            onClick={e => handleClick(item, e)}
            onMouseEnter={e => handleMouseEnter(e, item)}
            onMouseLeave={e => handleMouseLeave(e, item)}
          >
            <div className="item-img relative overflow-hidden bg-stone-900">
              <img
                src={item.img}
                alt={(item as any).photo?.title || 'Archival photographic plate'}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105"
              />
              {colorShiftOnHover && (
                <div
                  className="color-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))',
                    opacity: 0,
                    pointerEvents: 'none',
                    borderRadius: 'inherit'
                  }}
                />
              )}
              {renderItem && renderItem(item)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Masonry;
