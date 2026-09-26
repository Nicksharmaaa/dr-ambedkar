'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { soundEffects } from '@/utils/soundEffects';
import './PillNav.css';

export interface PillNavItem {
  id?: string;
  label: string;
  subtitle?: string;
  href: string;
  ariaLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export interface PillNavProps {
  logo?: string;
  logoAlt?: string;
  logoText?: string;
  items: PillNavItem[];
  activeHref?: string;
  activeId?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  onSelectTab?: (id: string) => void;
  initialLoadAnimation?: boolean;
  orientation?: 'horizontal' | 'vertical';
  enableGooeyParticles?: boolean;
}

export const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = 'Museum Seal',
  logoText,
  items,
  activeHref,
  activeId,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#0A2947',
  pillColor = '#FAF7F0',
  hoveredPillTextColor = '#C89D56',
  pillTextColor = '#0A2947',
  onMobileMenuClick,
  onSelectTab,
  initialLoadAnimation = true,
  orientation = 'vertical',
  enableGooeyParticles = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTextRef = useRef<HTMLSpanElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);

  const isVertical = orientation === 'vertical';

  // React Bits Gooey Particle Physics Engine
  const noise = useCallback((n = 1) => n / 2 - Math.random() * n, []);

  const getXY = useCallback(
    (distance: number, pointIndex: number, totalPoints: number) => {
      const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
      return [distance * Math.cos(angle), distance * Math.sin(angle)];
    },
    [noise]
  );

  const createParticle = useCallback(
    (i: number, t: number, d: [number, number], r: number, total: number) => {
      const rotate = noise(r / 10);
      const particleColors = ['#C89D56', '#0A2947', '#8B5E3C', '#D4AF37', '#FAF7F0'];
      return {
        start: getXY(d[0], total - i, total),
        end: getXY(d[1] + noise(7), total - i, total),
        time: t,
        scale: 1 + noise(0.3),
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
      };
    },
    [getXY, noise]
  );

  const triggerGooeyBurst = useCallback(
    (targetElement: HTMLElement) => {
      if (!enableGooeyParticles || typeof window === 'undefined') return;

      const d: [number, number] = isVertical ? [70, 10] : [80, 12];
      const r = 90;
      const animationTime = 550;
      const timeVariance = 200;
      const particleCount = 14;

      for (let i = 0; i < particleCount; i++) {
        const t = animationTime * 1.6 + noise(timeVariance * 2);
        const p = createParticle(i, t, d, r, particleCount);

        setTimeout(() => {
          const particle = document.createElement('span');
          const point = document.createElement('span');
          particle.classList.add('gooey-particle');
          particle.style.setProperty('--start-x', `${p.start[0]}px`);
          particle.style.setProperty('--start-y', `${p.start[1]}px`);
          particle.style.setProperty('--end-x', `${p.end[0]}px`);
          particle.style.setProperty('--end-y', `${p.end[1]}px`);
          particle.style.setProperty('--time', `${p.time}ms`);
          particle.style.setProperty('--scale', `${p.scale}`);
          particle.style.setProperty('--rotate', `${p.rotate}deg`);

          point.classList.add('gooey-point');
          point.style.setProperty('--color', p.color);
          particle.appendChild(point);
          targetElement.appendChild(particle);

          setTimeout(() => {
            try {
              if (particle.parentElement === targetElement) {
                targetElement.removeChild(particle);
              }
            } catch {
              // Node already cleaned up
            }
          }, t);
        }, 20);
      }
    },
    [createParticle, enableGooeyParticles, isVertical, noise]
  );

  const layout = useCallback(() => {
    circleRefs.current.forEach((circle, index) => {
      if (!circle?.parentElement) return;

      const pill = circle.parentElement;
      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      if (w === 0 || h === 0) return;

      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`,
      });

      const label = pill.querySelector<HTMLElement>('.pill-label');
      const white = pill.querySelector<HTMLElement>('.pill-label-hover');

      if (label) gsap.set(label, { y: 0 });
      if (white) gsap.set(white, { y: h + 12, opacity: 0 });

      tlRefs.current[index]?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(
        circle,
        { scale: 1.35, xPercent: -50, duration: 1.4, ease, overwrite: 'auto' },
        0
      );

      if (label) {
        tl.to(label, { y: -(h + 8), duration: 1.4, ease, overwrite: 'auto' }, 0);
      }

      if (white) {
        gsap.set(white, { y: Math.ceil(h + 20), opacity: 0 });
        tl.to(
          white,
          { y: 0, opacity: 1, duration: 1.4, ease, overwrite: 'auto' },
          0
        );
      }

      tlRefs.current[index] = tl;
    });
  }, [ease]);

  useEffect(() => {
    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(layout).catch(() => { });
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItemsEl = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0, opacity: 0 });
        gsap.to(logoEl, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease,
        });
      }

      if (navItemsEl) {
        if (isVertical) {
          gsap.fromTo(
            navItemsEl,
            { opacity: 0, y: 20, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.65, ease, delay: 0.1 }
          );
        } else {
          gsap.set(navItemsEl, { width: 0, overflow: 'hidden' });
          gsap.to(navItemsEl, {
            width: 'auto',
            duration: 0.6,
            ease,
          });
        }
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation, layout, isVertical]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.25,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLogoEnter = () => {
    const target = logoImgRef.current || logoTextRef.current;
    if (!target) return;
    logoTweenRef.current?.kill();
    gsap.set(target, { rotate: 0 });
    logoTweenRef.current = gsap.to(target, {
      rotate: 360,
      duration: 0.45,
      ease,
      overwrite: 'auto',
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (lines.length >= 2) {
        if (newState) {
          gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
          gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
        } else {
          gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
          gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
        }
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center',
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };

  const handleItemClick = (e: React.MouseEvent, item: PillNavItem, index: number) => {
    soundEffects.playClick();

    // Trigger Gooey Burst on the clicked pill element
    const btnEl = buttonRefs.current[index] || (e.currentTarget as HTMLElement);
    if (btnEl) {
      triggerGooeyBurst(btnEl);
    }

    if (onSelectTab && item.id) {
      if (!item.href || item.href.startsWith('#')) {
        e.preventDefault();
      }
      onSelectTab(item.id);
    }
    setIsMobileMenuOpen(false);
  };

  const isExternalLink = (href: string) =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const isRouterLink = (href: string) => Boolean(href && !isExternalLink(href));

  const isItemActive = (item: PillNavItem) => {
    if (activeId && item.id) {
      return activeId === item.id;
    }
    if (activeHref && item.href) {
      return activeHref === item.href;
    }
    return false;
  };

  const cssVars: React.CSSProperties = {
    ['--base' as any]: baseColor,
    ['--pill-bg' as any]: pillColor,
    ['--hover-text' as any]: hoveredPillTextColor,
    ['--pill-text' as any]: pillTextColor,
  };

  return (
    <div
      className={`pill-nav-container ${isVertical ? 'is-vertical' : 'is-horizontal'}`}
    >
      <nav
        className={`pill-nav ${isVertical ? 'is-vertical' : 'is-horizontal'} ${className}`}
        aria-label="Museum Navigation Rail"
        style={cssVars}
      >
        {/* Top Seal Logo Button (Optional) */}
        {logo ? (
          <Link
            className="pill-logo"
            href={items[0]?.href || '/'}
            aria-label={logoAlt}
            onMouseEnter={handleLogoEnter}
            ref={(el) => {
              logoRef.current = el;
            }}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
            <span className="pill-logo-halo" />
          </Link>
        ) : logoText ? (
          <button
            type="button"
            className="pill-logo"
            aria-label="Archive Navigation Seal"
            title="Archive Seal"
            onMouseEnter={handleLogoEnter}
            onClick={() => {
              soundEffects.playClick();
              if (onSelectTab && items[0]?.id) {
                onSelectTab(items[0].id);
              }
            }}
            ref={(el) => {
              logoRef.current = el;
            }}
          >
            <span ref={logoTextRef} className="select-none font-bold">
              {logoText}
            </span>
            <span className="pill-logo-halo" />
          </button>
        ) : null}

        {/* Slender & Statuesque Elongated Vertical Rail */}
        <div className="pill-nav-items" ref={navItemsRef}>
          {/* Decorative Archival Separator (only if logo or logoText is present) */}
          {Boolean(logo || logoText) && <div className="pill-nav-divider" />}

          <ul className="pill-list" role="menubar">
            {items.map((item, i) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              const pillBody = (
                <>
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  {Icon && (
                    <span className="pill-icon" aria-hidden="true">
                      <Icon />
                    </span>
                  )}
                  {!isVertical && (
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span className="pill-badge-pill">{item.badge}</span>
                  )}
                </>
              );

              return (
                <li key={item.id || item.href || `item-${i}`} role="none">
                  {onSelectTab && (!item.href || item.href.startsWith('#')) ? (
                    <button
                      type="button"
                      role="menuitem"
                      className={`pill${active ? ' is-active' : ''}`}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                      onClick={(e) => handleItemClick(e, item, i)}
                      ref={(el) => {
                        buttonRefs.current[i] = el;
                      }}
                    >
                      {pillBody}
                    </button>
                  ) : isRouterLink(item.href) ? (
                    <Link
                      role="menuitem"
                      href={item.href}
                      className={`pill${active ? ' is-active' : ''}`}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                      onClick={(e) => handleItemClick(e, item, i)}
                      ref={(el) => {
                        buttonRefs.current[i] = el;
                      }}
                    >
                      {pillBody}
                    </Link>
                  ) : (
                    <a
                      role="menuitem"
                      href={item.href}
                      className={`pill${active ? ' is-active' : ''}`}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                      onClick={(e) => handleItemClick(e, item, i)}
                      ref={(el) => {
                        buttonRefs.current[i] = el;
                      }}
                    >
                      {pillBody}
                    </a>
                  )}

                  {/* Floating Curatorial Card Tooltip (Vertical Side Mode) */}
                  {isVertical && (
                    <div className="pill-tooltip-card" aria-hidden="true">
                      <span className="pill-tooltip-title">{item.label}</span>
                      {item.subtitle && (
                        <span className="pill-tooltip-subtitle">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Bottom Archival Finial Accent */}
          {isVertical && (
            <div className="pill-nav-finial" title="Heritage Archival Rail">
              <span className="pill-nav-finial-dot" />
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle for Small Screens */}
        <button
          className="pill-mobile-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {/* Mobile Popover Menu */}
      <div className="pill-mobile-popover" ref={mobileMenuRef}>
        <ul className="pill-mobile-list">
          {items.map((item, i) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <li key={`mobile-${item.id || item.href || i}`}>
                {onSelectTab && (!item.href || item.href.startsWith('#')) ? (
                  <button
                    type="button"
                    className={`pill-mobile-link w-full text-left${active ? ' is-active' : ''
                      }`}
                    onClick={(e) => handleItemClick(e, item, i)}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1 text-[#C89D56]" />}
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="ml-auto text-[10px] bg-[#C89D56] text-[#0A2947] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ) : isRouterLink(item.href) ? (
                  <Link
                    href={item.href}
                    className={`pill-mobile-link${active ? ' is-active' : ''}`}
                    onClick={(e) => handleItemClick(e, item, i)}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1 text-[#C89D56]" />}
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="ml-auto text-[10px] bg-[#C89D56] text-[#0A2947] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={`pill-mobile-link${active ? ' is-active' : ''}`}
                    onClick={(e) => handleItemClick(e, item, i)}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1 text-[#C89D56]" />}
                    <span>{item.label}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
