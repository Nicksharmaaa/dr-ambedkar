'use client';

import React, { useRef, useEffect, useCallback, ReactNode, CSSProperties } from 'react';

export interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  global?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

export const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = '#C59A45',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  global = false,
  className = '',
  style,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animatingRef = useRef<boolean>(false);
  const widthRef = useRef<number>(0);
  const heightRef = useRef<number>(0);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;

    const resizeCanvas = () => {
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const width = global ? window.innerWidth : (parent?.clientWidth || 0);
      const height = global ? window.innerHeight : (parent?.clientHeight || 0);
      
      widthRef.current = width;
      heightRef.current = height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    if (global) {
      window.addEventListener('resize', handleResize);
    } else if (parent) {
      const ro = new ResizeObserver(handleResize);
      ro.observe(parent);
      return () => {
        ro.disconnect();
        clearTimeout(resizeTimeout);
      };
    }

    return () => {
      if (global) window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [global]);

  const startAnimation = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, widthRef.current, heightRef.current);

      sparksRef.current = sparksRef.current.filter(spark => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      if (sparksRef.current.length > 0) {
        animationId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, widthRef.current, heightRef.current);
        animatingRef.current = false;
      }
    };

    animationId = requestAnimationFrame(draw);
  }, [duration, easeFunc, extraScale, sparkColor, sparkRadius, sparkSize]);

  const addSpark = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const now = performance.now();
      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now
      }));

      sparksRef.current.push(...newSparks);
      startAnimation();
    },
    [sparkCount, startAnimation]
  );

  // Global capture listener across entire window
  useEffect(() => {
    if (!global) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Allow primary button click or touch
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      addSpark(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true } as any);
    };
  }, [global, addSpark]);

  // Local element click handler when not global
  const handleLocalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (global) return;
    addSpark(e.clientX, e.clientY);
  };

  if (global) {
    return (
      <>
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 999999
          }}
        />
        {children}
      </>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...style
      }}
      onClick={handleLocalClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          userSelect: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 30
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark;
