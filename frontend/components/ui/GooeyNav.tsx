'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import './GooeyNav.css';

export interface GooeyNavItem {
  id?: string;
  label: string;
  subtitle?: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
  activeId?: string;
  onSelectTab?: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  activeId,
  onSelectTab,
  orientation = 'horizontal',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // Derive initial active index if activeId is provided
  const findActiveIndex = useCallback(() => {
    if (activeId) {
      const idx = items.findIndex((item) => item.id === activeId);
      if (idx !== -1) return idx;
    }
    return initialActiveIndex;
  }, [activeId, initialActiveIndex, items]);

  const [activeIndex, setActiveIndex] = useState(findActiveIndex);

  useEffect(() => {
    if (activeId) {
      const idx = items.findIndex((item) => item.id === activeId);
      if (idx !== -1 && idx !== activeIndex) {
        setActiveIndex(idx);
      }
    }
  }, [activeId, items, activeIndex]);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };

  const makeParticles = (element: HTMLElement) => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, #C89D56)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // Do nothing if already removed
          }
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = useCallback((element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLElement>, index: number, item: GooeyNavItem) => {
    const liEl = e.currentTarget.closest('li') || e.currentTarget;
    if (activeIndex === index) return;

    setActiveIndex(index);
    updateEffectPosition(liEl as HTMLElement);

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach((p) => {
        try {
          filterRef.current?.removeChild(p);
        } catch {
          // ignore
        }
      });
    }

    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }

    if (filterRef.current) {
      makeParticles(filterRef.current);
    }

    if (onSelectTab && item.id) {
      onSelectTab(item.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number, item: GooeyNavItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.parentElement;
      if (liEl) {
        handleClick({ currentTarget: liEl } as any, index, item);
      }
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const lis = navRef.current.querySelectorAll('li');
    const activeLi = lis[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi as HTMLElement);
      textRef.current?.classList.add('active');
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentLis = navRef.current?.querySelectorAll('li');
      const currentActiveLi = currentLis ? currentLis[activeIndex] : null;
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi as HTMLElement);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex, updateEffectPosition]);

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`gooey-nav-container ${isVertical ? 'is-vertical' : 'is-horizontal'} ${className}`}
      ref={containerRef}
    >
      <nav ref={navRef}>
        <ul className={isVertical ? 'vertical-list' : 'horizontal-list'}>
          {items.map((item, index) => {
            const Icon = item.icon;
            const isRouterLink = item.href && !item.href.startsWith('http') && !item.href.startsWith('#');

            return (
              <li
                key={item.id || item.href || index}
                className={activeIndex === index ? 'active' : ''}
              >
                {isRouterLink ? (
                  <Link
                    href={item.href}
                    onClick={(e) => handleClick(e, index, item)}
                    onKeyDown={(e) => handleKeyDown(e, index, item)}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1.5 inline-block" />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <a
                    href={item.href || '#'}
                    onClick={(e) => {
                      if (!item.href || item.href.startsWith('#')) e.preventDefault();
                      handleClick(e, index, item);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index, item)}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1.5 inline-block" />}
                    <span>{item.label}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} />
      <span className="effect text" ref={textRef} />
    </div>
  );
};

export default GooeyNav;
