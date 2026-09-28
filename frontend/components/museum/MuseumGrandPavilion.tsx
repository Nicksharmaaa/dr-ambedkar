import React from 'react';
import { LucideIcon, Landmark } from 'lucide-react';

export interface PavilionStat {
  value: React.ReactNode;
  label: string;
}

export interface MuseumGrandPavilionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  stats?: PavilionStat[];
  watermarkIcon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export const MuseumGrandPavilion: React.FC<MuseumGrandPavilionProps> = ({
  title,
  subtitle,
  stats,
  watermarkIcon: WatermarkIcon = Landmark,
  className = '',
  children,
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-[#0B2540] via-[#0A2947] to-[#041424] text-[#FAF7F0] border border-[#C59A45]/45 ring-1 ring-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(10,41,71,0.5)] relative overflow-hidden ${className}`}
    >
      {/* Intricate Antique Brass Corner Accents with Rivets */}
      <div className="absolute top-3.5 left-3.5 w-7 h-7 border-t-2 border-l-2 border-[#D4AF37]/80 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#F5D77F] to-[#B8860B] mt-1 ml-1 shadow-[0_0_6px_rgba(245,215,127,0.6)]" />
      </div>
      <div className="absolute top-3.5 right-3.5 w-7 h-7 border-t-2 border-r-2 border-[#D4AF37]/80 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#F5D77F] to-[#B8860B] mt-1 mr-1 ml-auto shadow-[0_0_6px_rgba(245,215,127,0.6)]" />
      </div>
      <div className="absolute bottom-3.5 left-3.5 w-7 h-7 border-b-2 border-l-2 border-[#D4AF37]/80 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#F5D77F] to-[#B8860B] mb-1 ml-1 mt-auto shadow-[0_0_6px_rgba(245,215,127,0.6)]" />
      </div>
      <div className="absolute bottom-3.5 right-3.5 w-7 h-7 border-b-2 border-r-2 border-[#D4AF37]/80 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#F5D77F] to-[#B8860B] mb-1 mr-1 ml-auto mt-auto shadow-[0_0_6px_rgba(245,215,127,0.6)]" />
      </div>

      {/* Background Ambient Glows & Subtle Archival Watermark */}
      <div className="absolute -top-16 -right-16 w-[450px] h-[450px] bg-[#C59A45]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] bg-[#1A4870]/25 rounded-full blur-3xl pointer-events-none" />
      <WatermarkIcon className="absolute -right-8 -bottom-10 w-72 h-72 text-[#C59A45]/[0.035] pointer-events-none select-none rotate-12" />

      <div className="relative z-10 space-y-6">
        {/* Header Title Area - Clean, Spacious, Authoritative */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.5rem] xl:text-[5.25rem] font-serif-editorial font-bold tracking-tight leading-[1.04] text-white max-w-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-[#FAF7F0]/80 max-w-3xl font-dmsans leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional Custom In-Header Controls / Content */}
        {children}
      </div>
    </div>
  );
};

export default MuseumGrandPavilion;
