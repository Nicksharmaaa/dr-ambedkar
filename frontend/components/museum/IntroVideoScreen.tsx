'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, SkipForward, Film } from 'lucide-react';

interface IntroVideoScreenProps {
  onComplete: () => void;
  videoSrc?: string;
  posterSrc?: string;
}

export const IntroVideoScreen: React.FC<IntroVideoScreenProps> = ({
  onComplete,
  videoSrc = '/intro/ambedkar-intro.mp4',
  posterSrc = '/intro/ambedkar-intro-poster.jpg'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showTitles, setShowTitles] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    // Safety timeout in case video stalls or hangs
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 6000);

    // Title reveal at 3.8s - 4.2s
    const titleTimer = setTimeout(() => {
      setShowTitles(true);
    }, 3200);

    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(titleTimer);
    };
  }, []);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 800); // 800ms smooth archival dissolve
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 5;
      setProgress((current / duration) * 100);

      if (current >= 3.5 && !showTitles) {
        setShowTitles(true);
      }

      if (current >= 4.8) {
        handleFinish();
      }
    }
  };

  const handleVideoCanPlay = () => {
    setIsVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked by browser policy: fallback gracefully
        setIsError(true);
      });
    }
  };

  const handleVideoError = () => {
    setIsError(true);
    // Even if video file fails, keep archival portrait for 4 seconds then transition smoothly
    setTimeout(() => {
      setShowTitles(true);
    }, 2000);
    setTimeout(() => {
      handleFinish();
    }, 4500);
  };

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Museum Exhibition Prologue"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#07131F] text-[#FAF7F0] overflow-hidden select-none transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Archival Film Grain Effect */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-screen"
        style={{
          backgroundImage: 'radial-gradient(#F3E4C9 0.75px, transparent 0.75px)',
          backgroundSize: '8px 8px'
        }}
      />

      {/* Main Video Presentation or Graceful Archival Ken-Burns Fallback */}
      <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
        {!isError ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted={isMuted}
            playsInline
            preload="auto"
            onCanPlay={handleVideoCanPlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleFinish}
            onError={handleVideoError}
            className="w-full h-full object-cover object-center filter contrast-105 brightness-95 transform scale-105 transition-transform duration-[6000ms] ease-out"
            style={{
              animation: 'museumKenBurns 6s ease-out forwards'
            }}
          />
        ) : (
          /* Graceful Fallback: Archival Portrait with Cinematic Slow Zoom */
          <div 
            className="w-full h-full bg-cover bg-center filter contrast-105 brightness-90 animate-kenburns"
            style={{ 
              backgroundImage: `url(${posterSrc})`,
              transform: 'scale(1.08)',
              transition: 'transform 5s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          />
        )}

        {/* Cinematic Vignette & Atmospheric Gradients */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#07131F]/50 to-[#07131F]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07131F] via-transparent to-[#07131F]/70 pointer-events-none" />
      </div>

      {/* Top Museum Header Bar in Intro */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0]/10 border border-[#F3E4C9]/20 flex items-center justify-center backdrop-blur-sm">
            <Film className="w-4 h-4 text-[#F3E4C9]" />
          </div>
          <span className="font-cinzel text-xs tracking-widest uppercase text-[#F3E4C9]/80 hidden sm:inline">
            National Archival Prologue
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isError && (
            <button
              onClick={toggleSound}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="p-2.5 rounded-full bg-[#0A2947]/60 hover:bg-[#0A2947] text-[#F3E4C9] border border-[#F3E4C9]/30 transition-all cursor-pointer backdrop-blur-md"
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A2947]/70 hover:bg-[#F3E4C9] text-[#F3E4C9] hover:text-[#0A2947] border border-[#F3E4C9]/40 hover:border-[#F3E4C9] text-xs font-montserrat font-bold tracking-wider uppercase transition-all duration-300 backdrop-blur-md cursor-pointer group"
          >
            <span>Enter Exhibition</span>
            <SkipForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Layered Typography Reveal (3.2s – 5.0s) */}
      <div 
        className={`absolute inset-x-0 bottom-16 sm:bottom-20 z-20 text-center px-6 transition-all duration-1000 transform ${
          showTitles 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <p className="font-cinzel text-[11px] sm:text-xs tracking-[0.3em] uppercase text-[#C89D56] font-semibold">
            Archival Exhibition & Corpus
          </p>

          <h1 className="font-cinzel text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-wider text-[#FAF7F0] drop-shadow-md">
            DR. B. R. AMBEDKAR
          </h1>

          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm font-montserrat tracking-[0.25em] text-[#D3D4C0]">
            <span>1891</span>
            <span className="w-8 h-px bg-[#C89D56]/60"></span>
            <span>1956</span>
          </div>

          <p className="font-serif-editorial italic text-xs sm:text-sm text-[#F3E4C9]/90 max-w-lg mx-auto pt-1 font-light">
            "Ideas that shaped the world's largest constitutional democracy."
          </p>
        </div>
      </div>

      {/* Discreet 5-Second Exhibition Progress Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
        <div 
          className="h-full bg-gradient-to-r from-[#8B5E3C] via-[#C89D56] to-[#F3E4C9] transition-all duration-150 ease-linear"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};
