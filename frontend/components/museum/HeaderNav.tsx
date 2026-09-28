'use client';

import React, { useState, useEffect } from 'react';
import { Language, AccessibilitySettings, UserMode } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import { 
  Globe, Bookmark, Search, Sparkles, Volume2, 
  VolumeX, Star, Radio, BookOpen, Clock, Camera,
  Scale, Network, ShieldCheck, Zap, ChevronDown, Sliders,
  GraduationCap, Eye, UserCheck, Key, Mic, Film
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { LanguageDropdown } from './navigation/LanguageDropdown';
import VoicePill from '@/components/ui/VoicePill';

interface HeaderNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  accessibility: AccessibilitySettings;
  onToggleAccessibilityModal: () => void;
  onToggleSoundEffects?: () => void;
  onToggleKidMode?: () => void;
  savedCount: number;
  onOpenSearch?: () => void;
  onOpenAIScholar?: () => void;
  onOpenVoiceModal?: () => void;
  onReplayIntro?: () => void;
  userMode?: UserMode;
  onSelectUserMode?: (mode: UserMode) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab,
  language,
  onSelectLanguage,
  accessibility,
  onToggleAccessibilityModal,
  onToggleSoundEffects,
  savedCount,
  onOpenSearch,
  onOpenAIScholar,
  onOpenVoiceModal,
  onReplayIntro,
  userMode = 'visitor',
  onSelectUserMode
}) => {
  const t = UI_STRINGS[language];
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExploreMenuOpen, setIsExploreMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tab: string) => {
    soundEffects.playClick();
    setIsExploreMenuOpen(false);
    setIsModeMenuOpen(false);
    onSelectTab(tab);
  };

  const primaryWings = [
    { id: 'home', label: t.navHome || 'Exhibition' },
    { id: 'archive', label: t.wingArchiveTitle || t.navArchive || 'The Archive' },
    { id: 'timeline', label: t.wingTimelineTitle || t.navTimeline || 'Timeline' },
    { id: 'media', label: t.wingMediaTitle || t.navMedia || 'Media & Voice' },
    { id: 'assistant', label: t.wingAssistantTitle || t.navAssistant || 'AI Scholar' },
    { id: 'gallery', label: t.wingGalleryTitle || t.catPhotographs || 'Folio' },
  ];

  const exploreSubItems = [
    { id: 'stories', label: t.wingStoriesTitle || 'Curated Stories', icon: Star, desc: t.wingStoriesSub || 'Immersive narrative audio pathways' },
    { id: 'graph', label: t.wingGraphTitle || 'Knowledge Graph', icon: Network, desc: t.wingGraphSub || 'Connected intellectual network' },
    { id: 'compare', label: t.compareTitle || 'Comparative Synthesis', icon: Scale, desc: t.compareSubtitle || 'Side-by-side treatise comparison' },
    { id: 'quest', label: t.wingQuestTitle || 'Constitutional Quest', icon: Zap, desc: t.wingQuestSub || 'Interactive educational exploration' },
  ];

  const exploreLabel = language === 'hi' ? 'अन्वेषण' : language === 'mr' ? 'अन्वेषण' : language === 'ta' ? 'ஆய்வு' : language === 'bn' ? 'অন্বেষণ' : 'Explore';
  const notebookLabel = t.navCollection || (language === 'hi' ? 'शोध वही' : language === 'mr' ? 'माझी वही' : language === 'ta' ? 'குறிப்பேடு' : language === 'bn' ? 'নোটবই' : 'Notebook');
  const searchLabel = t.searchBtn || (language === 'hi' ? 'खोजें' : language === 'mr' ? 'शोध' : language === 'ta' ? 'தேடல்' : language === 'bn' ? 'অনুসন্ধান' : 'Search');
  const voiceLabel = language === 'hi' ? 'आवाज' : language === 'mr' ? 'ध्वनी' : language === 'ta' ? 'குரல்' : language === 'bn' ? 'কণ্ঠ' : 'Voice';

  const userModes: Array<{ id: UserMode; label: string; desc: string; icon: any }> = [
    { id: 'visitor', label: t.userModeVisitor || 'Visitor', desc: t.userModeVisitorDesc || 'Narrative storytelling & exhibits', icon: Eye },
    { id: 'student', label: t.userModeStudent || 'Student', desc: t.userModeStudentDesc || 'Guided exploration & educational trivia', icon: GraduationCap },
    { id: 'researcher', label: t.userModeResearcher || 'Researcher', desc: t.userModeResearcherDesc || 'Full citations & PREMIS fixity checksums', icon: UserCheck },
    { id: 'archivist', label: t.userModeArchivist || 'Archivist', desc: t.userModeArchivistDesc || 'OCR pipeline & digital preservation', icon: Key },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 border-b border-[#D3D4C0] ${
      isScrolled 
        ? 'bg-[#FAF7F0]/95 backdrop-blur-md shadow-sm' 
        : 'bg-[#FAF7F0]'
    }`}>
      
      {/* Delicate National Archival Micro-Indicator Ribbon */}
      <div className="w-full h-1 flex">
        <div className="w-1/3 bg-[#E76F51]/75" />
        <div className="w-1/3 bg-[#F3E4C9]" />
        <div className="w-1/3 bg-[#2A9D8F]/75" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-200 gap-3 ${
          isScrolled ? 'h-16' : 'h-20'
        }`}>
          
          {/* Wing Left: Official Identity */}
          <button
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0A2947] p-0.5 shadow-sm group-hover:border-[#8B5E3C] transition-all flex items-center justify-center relative overflow-hidden border-2 border-[#D3D4C0]">
              <span className="font-cinzel text-[#F3E4C9] text-xl font-bold tracking-tighter">A</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5E3C]" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-cinzel font-bold tracking-wider text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors leading-tight">
                THE DIGITAL MUSEUM
              </span>
              <span className="text-[10px] font-montserrat font-semibold text-[#8B5E3C] uppercase tracking-widest hidden sm:inline">
                OF DR. B. R. AMBEDKAR · HERITAGE ARCHIVE
              </span>
            </div>
          </button>

          {/* Wing Center: Museum Wings Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {primaryWings.map(wing => {
              const isActive = currentTab === wing.id;
              return (
                <button
                  key={wing.id}
                  onClick={() => handleTabClick(wing.id)}
                  className={`px-3.5 py-2 text-xs font-montserrat font-semibold tracking-wider uppercase transition-all cursor-pointer relative ${
                    isActive
                      ? 'text-[#0A2947] font-bold'
                      : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                  }`}
                >
                  <span>{wing.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0A2947] rounded-full animate-in fade-in" />
                  )}
                </button>
              );
            })}

            {/* Explore Wing Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExploreMenuOpen(!isExploreMenuOpen)}
                className={`px-3.5 py-2 text-xs font-montserrat font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  ['quest', 'graph', 'media', 'compare'].includes(currentTab)
                    ? 'text-[#0A2947] font-bold'
                    : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                }`}
              >
                <span>{exploreLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExploreMenuOpen ? 'rotate-180' : ''}`} />
                {['quest', 'graph', 'media', 'compare'].includes(currentTab) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0A2947] rounded-full" />
                )}
              </button>

              {isExploreMenuOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#D3D4C0] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsExploreMenuOpen(false)}
                >
                  {exploreSubItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                          currentTab === item.id 
                            ? 'bg-[#F3E4C9] text-[#0A2947]' 
                            : 'hover:bg-[#FAF7F0] text-[#0A2947]'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-[#FAF7F0] text-[#8B5E3C] border border-[#D3D4C0]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-montserrat font-bold">{item.label}</div>
                          <div className="text-[10px] text-[#0A2947]/60 leading-tight">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notebook Tab */}
            <button
              onClick={() => handleTabClick('collection')}
              className={`px-3.5 py-2 text-xs font-montserrat font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 relative ${
                currentTab === 'collection'
                  ? 'text-[#8B5E3C] font-bold'
                  : 'text-[#0A2947]/70 hover:text-[#8B5E3C]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>{notebookLabel}</span>
              {savedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-[#8B5E3C] text-white rounded font-mono font-bold">
                  {savedCount}
                </span>
              )}
              {currentTab === 'collection' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#8B5E3C] rounded-full" />
              )}
            </button>
          </nav>

          {/* Wing Right: Search, Utilities & AI Scholar */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Global Command / Search Trigger */}
            <button
              onClick={() => {
                soundEffects.playClick();
                if (onOpenSearch) onOpenSearch();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#D3D4C0] hover:border-[#8B5E3C] text-[#0A2947] text-xs font-montserrat font-semibold transition-all cursor-pointer shadow-xs"
              title="Search Archives (Ctrl + K or /)"
              aria-label="Open Global Archival Search"
            >
              <Search className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span className="hidden sm:inline">{searchLabel}</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono text-[#0A2947]/50 bg-[#FAF7F0] border border-[#D3D4C0] rounded">
                /
              </kbd>
            </button>

            {/* Replay Exhibition Prologue Button */}
            {onReplayIntro && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onReplayIntro();
                }}
                className="p-2 text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#F3E4C9] rounded-xl transition-colors cursor-pointer border border-[#D3D4C0]/70 flex items-center gap-1.5"
                title="Replay 5s Exhibition Prologue Video"
                aria-label="Replay Museum Intro"
              >
                <Film className="w-4 h-4 text-[#8B5E3C]" />
                <span className="hidden xl:inline text-[11px] font-montserrat font-bold text-[#8B5E3C] uppercase tracking-wider">
                  Prologue
                </span>
              </button>
            )}

            {/* Sound Effects Toggle */}
            <button
              onClick={() => {
                const nextState = !soundEffects.enabled;
                soundEffects.enabled = nextState;
                if (onToggleSoundEffects) onToggleSoundEffects();
              }}
              className="p-2 text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#F3E4C9] rounded-xl transition-colors cursor-pointer border border-[#D3D4C0]/70"
              title={soundEffects.enabled ? "Archival Audio Narration: Enabled" : "Sounds Muted"}
              aria-label="Toggle Sound Effects"
            >
              {soundEffects.enabled ? (
                <Volume2 className="w-4 h-4 text-[#8B5E3C]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#0A2947]/40" />
              )}
            </button>

            {/* Accessibility Settings */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onToggleAccessibilityModal();
              }}
              className="p-2 text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#F3E4C9] rounded-xl transition-colors cursor-pointer border border-[#D3D4C0]/70 hidden sm:block"
              title="Accessibility & Typography Display"
              aria-label="Accessibility Settings"
            >
              <Sliders className="w-4 h-4 text-[#0A2947]/70" />
            </button>

            {/* Curatorial User Mode Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#D3D4C0] hover:border-[#8B5E3C] text-xs font-montserrat font-bold text-[#0A2947] transition-all cursor-pointer shadow-2xs"
                title="Switch Archival User Mode"
              >
                <span className="w-2 h-2 rounded-full bg-[#8B5E3C]" />
                <span className="capitalize">{userMode}</span>
                <ChevronDown className={`w-3 h-3 text-[#8B5E3C] transition-transform ${isModeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isModeMenuOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#D3D4C0] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsModeMenuOpen(false)}
                >
                  <div className="px-2 py-1 text-[10px] font-mono text-[#8B5E3C] uppercase tracking-wider font-bold">
                    Archival Interface Mode
                  </div>
                  {userModes.map(m => {
                    const ModeIcon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          soundEffects.playClick();
                          if (onSelectUserMode) onSelectUserMode(m.id);
                          setIsModeMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                          userMode === m.id
                            ? 'bg-[#F3E4C9] text-[#0A2947]'
                            : 'hover:bg-[#FAF7F0] text-[#0A2947]'
                        }`}
                      >
                        <div className="p-1 rounded-lg bg-[#FAF7F0] text-[#8B5E3C] border border-[#D3D4C0] mt-0.5">
                          <ModeIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-montserrat font-bold">{m.label} Mode</div>
                          <div className="text-[10px] text-[#0A2947]/65 leading-tight">{m.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <LanguageDropdown
              language={language}
              onSelectLanguage={onSelectLanguage}
            />

            {/* Dedicated Voice Assistant & Navigator Trigger */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-[#F3E4C9] border-2 border-[#C59A45] transition-all shadow-xs">
              <VoicePill
                accentColor="#C59A45"
                iconColor="#8B5E3C"
                background="#0A2947"
                size={26}
                shape="pill"
                showTime={false}
                waveform={false}
                slideToCancel={false}
                onClick={() => {
                  soundEffects.playClick();
                  if (onOpenVoiceModal) onOpenVoiceModal();
                }}
                ariaLabel="Open Voice Assistant & Navigator"
              />
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  if (onOpenVoiceModal) onOpenVoiceModal();
                }}
                className="hidden sm:inline text-[#0A2947] text-xs font-montserrat font-bold tracking-wide uppercase cursor-pointer"
              >
                {voiceLabel}
              </button>
            </div>

            {/* Dedicated AI Scholar Trigger */}
            <button
              onClick={() => {
                soundEffects.playClick();
                if (onOpenAIScholar) {
                  onOpenAIScholar();
                } else {
                  handleTabClick('assistant');
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                currentTab === 'assistant'
                  ? 'bg-[#8B5E3C] text-white ring-2 ring-[#0A2947]/20'
                  : 'bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9]'
              }`}
              title="Open Babasaheb AI Scholar"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F3E4C9]" />
              <span className="hidden sm:inline">AI Scholar</span>
            </button>

            {/* Admin Console: Discreet Curatorial Lock Access */}
            <button
              onClick={() => handleTabClick('admin')}
              className={`p-2 rounded-xl transition-colors cursor-pointer border border-[#D3D4C0]/70 ${
                currentTab === 'admin'
                  ? 'bg-[#8B5E3C] text-white'
                  : 'text-[#0A2947]/50 hover:text-[#0A2947] hover:bg-[#F3E4C9]'
              }`}
              title="Curatorial Administration & OCR Ingestion Pipeline"
              aria-label="Curatorial Administration"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Mobile / Tablet Wing Ribbon */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-[#D3D4C0] scrollbar-none gap-2 font-montserrat text-xs">
          {primaryWings.map(wing => (
            <button
              key={wing.id}
              onClick={() => handleTabClick(wing.id)}
              className={`px-3 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                currentTab === wing.id
                  ? 'bg-[#0A2947] text-[#F3E4C9] font-bold'
                  : 'text-[#0A2947] hover:bg-[#F3E4C9]'
              }`}
            >
              {wing.label}
            </button>
          ))}
          <button
            onClick={() => handleTabClick('quest')}
            className={`px-3 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'quest' ? 'bg-[#0A2947] text-[#F3E4C9] font-bold' : 'text-[#0A2947] hover:bg-[#F3E4C9]'
            }`}
          >
            {t.wingQuestTitle || 'Quest'}
          </button>
          <button
            onClick={() => handleTabClick('compare')}
            className={`px-3 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'compare' ? 'bg-[#0A2947] text-[#F3E4C9] font-bold' : 'text-[#0A2947] hover:bg-[#F3E4C9]'
            }`}
          >
            {t.compareTitle || 'Compare'}
          </button>
          <button
            onClick={() => handleTabClick('media')}
            className={`px-3 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'media' ? 'bg-[#0A2947] text-[#F3E4C9] font-bold' : 'text-[#0A2947] hover:bg-[#F3E4C9]'
            }`}
          >
            {voiceLabel}
          </button>
          <button
            onClick={() => handleTabClick('graph')}
            className={`px-3 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'graph' ? 'bg-[#0A2947] text-[#F3E4C9] font-bold' : 'text-[#0A2947] hover:bg-[#F3E4C9]'
            }`}
          >
            {t.wingGraphTitle || 'Graph'}
          </button>
          <button
            onClick={() => handleTabClick('collection')}
            className={`px-3 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
              currentTab === 'collection' ? 'bg-[#8B5E3C] text-[#F3E4C9] font-bold' : 'text-[#0A2947] hover:bg-[#F3E4C9]'
            }`}
          >
            <span>{notebookLabel}</span>
            {savedCount > 0 && <span className="font-mono">({savedCount})</span>}
          </button>
        </div>

      </div>
    </header>
  );
};
