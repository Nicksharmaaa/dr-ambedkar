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
import { Language } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';

interface MuseumFooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenSearch?: () => void;
  onOpenVoice?: () => void;
  onOpenAccessibility?: () => void;
  onSelectUserMode?: (mode: any) => void;
  userMode?: string;
  language?: Language;
}

export const MuseumFooter: React.FC<MuseumFooterProps> = ({
  onNavigateTab,
  onOpenSearch,
  onOpenVoice,
  onOpenAccessibility,
  onSelectUserMode,
  language = 'en',
}) => {
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const handleScrollTop = () => {
    soundEffects.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (tabId: string) => {
    soundEffects.playClick();
    onNavigateTab(tabId);
  };

  return (
    <footer className="relative mt-auto z-10 selection:bg-[#D3D4C0] selection:text-[#0A2947] bg-[#FAF7F0] border-t border-[#C89D56]/40">
      {/* Signature Museum Tricolor Archival Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5E3C] via-[#C89D56] to-[#0A2947]" />

      {/* Main Institutional Multi-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Archival Holdings */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#0A2947]">
              <BookOpen className="w-5 h-5 text-[#C89D56]" />
              <h3 className="font-cinzel font-bold text-sm tracking-wider uppercase text-[#0A2947]">{t.footerHoldings || "Archival Holdings"}</h3>
            </div>
            <ul className="space-y-2 text-xs font-montserrat">
              <li>
                <a href="/archive" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingArchiveTitle || "The Archive"}
                </a>
              </li>
              <li>
                <a href="/search" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.searchBtn || "Search"} & Research
                </a>
              </li>
              <li>
                <a href="/gallery" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingGalleryTitle || "Visual Folio"}
                </a>
              </li>
              <li>
                <a href="/media" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingMediaTitle || "Media & Voice"}
                </a>
              </li>
              <li>
                <a href="/knowledge-map" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingGraphTitle || "3D Knowledge Graph"}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Research & Memorials */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#0A2947]">
              <Compass className="w-5 h-5 text-[#C89D56]" />
              <h3 className="font-cinzel font-bold text-sm tracking-wider uppercase text-[#0A2947]">{t.footerResearch || "Research & Memorials"}</h3>
            </div>
            <ul className="space-y-2 text-xs font-montserrat">
              <li>
                <a href="/timeline" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingTimelineTitle || "Timeline Chronicle"}
                </a>
              </li>
              <li>
                <a href="/memorials" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingStoriesTitle ? "Memorials & Geography" : "Memorials"}
                </a>
              </li>
              <li>
                <a href="/stories" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingStoriesTitle || "Audio Stories"}
                </a>
              </li>
              <li>
                <a href="/assistant" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingAssistantTitle || "AI Scholar"}
                </a>
              </li>
              <li>
                <a href="/collection" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingCollectionTitle || "Personal Notebook"}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional & Preservation */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#0A2947]">
              <ShieldCheck className="w-5 h-5 text-[#C89D56]" />
              <h3 className="font-cinzel font-bold text-sm tracking-wider uppercase text-[#0A2947]">{t.footerPreservation || "Preservation & Ops"}</h3>
            </div>
            <ul className="space-y-2 text-xs font-montserrat">
              <li>
                <a href="/preservation" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5 font-medium">
                  <span className="text-[#C89D56]">›</span> PREMIS 3.0 Fixity Dashboard
                </a>
              </li>
              <li>
                <a href="/admin" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5 font-medium">
                  <span className="text-[#C89D56]">›</span> {t.adminPortal || "Admin Portal"}
                </a>
              </li>
              <li>
                <a href="/kiosk" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.kioskModeTitle || "Kiosk Mode"}
                </a>
              </li>
              <li>
                <a href="/quest" className="text-[#0A2947]/80 hover:text-[#C89D56] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C89D56]">›</span> {t.wingQuestTitle || "Interactive Quest"}
                </a>
              </li>
              <li>
                <span className="text-[#0A2947]/60 flex items-center gap-1.5">
                  <span className="text-[#8B5E3C]">❖</span> OAIS-Compliant Archival Store
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Institutional Architecture */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#0A2947]">
              <Award className="w-5 h-5 text-[#C89D56]" />
              <h3 className="font-cinzel font-bold text-sm tracking-wider uppercase text-[#0A2947]">{t.footerStandards || "Archive Standards"}</h3>
            </div>
            <div className="space-y-2 text-xs text-[#0A2947]/80 font-dmsans">
              <p className="leading-relaxed">
                {t.footerStandardsDesc || "Grounding democratic thought with verifiable primary sources, immutable SHA-256 fixity hashes, and high-precision RAG."}
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-sm bg-[#0A2947]/10 text-[#0A2947] text-[10px] font-mono font-bold">PREMIS 3.0</span>
                <span className="px-2 py-0.5 rounded-sm bg-[#0A2947]/10 text-[#0A2947] text-[10px] font-mono font-bold">RRF DiskANN</span>
                <span className="px-2 py-0.5 rounded-sm bg-[#0A2947]/10 text-[#0A2947] text-[10px] font-mono font-bold">Qwen3 Rerank</span>
                <span className="px-2 py-0.5 rounded-sm bg-[#0A2947]/10 text-[#0A2947] text-[10px] font-mono font-bold">IIIF v3.0</span>
                <span className="px-2 py-0.5 rounded-sm bg-[#0A2947]/10 text-[#0A2947] text-[10px] font-mono font-bold">22 Indic Lang</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          SIGNATURE PLINTH (Grounding Deep Archival Navy Bar)
          ========================================================================= */}
      <div className="bg-[#0A2947] text-[#FAF7F0] border-t border-[#8B5E3C]/40 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-dmsans text-[11px] text-[#F3E4C9]">
              © {new Date().getFullYear()} {t.footerCopyright || "Dr. B. R. Ambedkar Digital Heritage Archive."}
            </span>
            <span className="hidden sm:inline text-[#8B5E3C]">❖</span>
            <span className="text-[11px] text-[#D3D4C0] font-mono">
              {t.footerPlatform || "National Digital Heritage Archive & Audio-Visual Knowledge Platform"}
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
            <span>{t.backToTop || "Back to Top"}</span>
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 text-[#C89D56] group-hover:text-[#0A2947]" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default MuseumFooter;
