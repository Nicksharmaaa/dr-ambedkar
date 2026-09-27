'use client';

import React from 'react';
import {
  Landmark,
  BookOpen,
  Compass,
  Star,
  Zap,
  ArrowUp,
  Sparkles,
  Network,
  Radio,
  Camera,
  Bookmark,
  Search,
  Mic,
  SlidersHorizontal,
  ChevronRight,
  Quote,
  Layers,
  Globe,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';

interface MuseumFooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenSearch?: () => void;
  onOpenVoice?: () => void;
  onOpenAccessibility?: () => void;
  onSelectUserMode?: (mode: any) => void;
  userMode?: string;
}

export const MuseumFooter: React.FC<MuseumFooterProps> = ({
  onNavigateTab,
  onOpenSearch,
  onOpenVoice,
  onOpenAccessibility,
  onSelectUserMode,
}) => {
  const handleScrollTop = () => {
    soundEffects.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (tabId: string) => {
    soundEffects.playClick();
    onNavigateTab(tabId);
  };

  return (
    <footer className="relative mt-auto z-10 selection:bg-[#D3D4C0] selection:text-[#0A2947]">
      {/* Signature Museum Tricolor Archival Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#8B5E3C] via-[#C89D56] to-[#0A2947]" />
      {/* =========================================================================
          SIGNATURE PLINTH (Grounding Deep Archival Navy Bar)
          ========================================================================= */}
      <div className="bg-[#0A2947] text-[#FAF7F0] border-t border-[#8B5E3C]/40 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-dmsans text-[11px] text-[#F3E4C9]">
              © {new Date().getFullYear()} Dr. B. R. Ambedkar Digital Heritage Archive.
            </span>
            <span className="hidden sm:inline text-[#8B5E3C]">❖</span>
            <span className="text-[11px] text-[#D3D4C0] font-mono">
              Open National Heritage & Democratic Knowledge Lab
            </span>
          </div>

          {/* Elegant Back to Top Elevator Button */}
          <button
            type="button"
            onClick={handleScrollTop}
            className="group px-4 py-1.5 rounded-full bg-white/10 hover:bg-[#F3E4C9] text-[#FAF7F0] hover:text-[#0A2947] border border-[#C89D56]/60 hover:border-[#F3E4C9] flex items-center gap-2 transition-all duration-300 cursor-pointer font-montserrat font-bold text-xs active:scale-95 shadow-xs"
            title="Elevate to top of page"
            aria-label="Back to top"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 text-[#C89D56] group-hover:text-[#0A2947]" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default MuseumFooter;
