import React from 'react';
import { Search, Mic, Shield, ChevronDown, User, Sparkles, GraduationCap, Microscope, Lock, Camera } from 'lucide-react';
import { AccessibilitySettings, Language, UserMode } from '@/types/museum';
import { soundEffects } from '@/utils/soundEffects';
import { LanguageDropdown } from './LanguageDropdown';

interface TopUtilityBarProps {
  language?: Language;
  onSelectLanguage?: (lang: Language) => void;
  accessibility?: AccessibilitySettings;
  onToggleAccessibilityModal: () => void;
  onToggleSoundEffects?: () => void;
  onOpenSearch?: () => void;
  onOpenVoiceModal?: () => void;
  onReplayIntro?: () => void;
  userMode?: UserMode;
  onSelectUserMode?: (mode: UserMode) => void;
  onOpenAdmin?: () => void;
  onOpenScanner?: () => void;
}

/**
 * Universal Accessibility SVG Icon
 * International symbol of universal accessibility & human dignity
 */
const UniversalAccessibilityIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer subtle guide ring */}
    <circle
      cx="12"
      cy="12"
      r="9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.35"
    />
    {/* Head */}
    <circle cx="12" cy="5" r="2.1" fill="currentColor" />
    {/* Outstretched arms of universal human inclusion */}
    <path
      d="M5 9.2 C 8.5 8.1, 15.5 8.1, 19 9.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Torso */}
    <path
      d="M12 8.8 L12 14.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Legs */}
    <path
      d="M12 14.5 L8.8 20.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 14.5 L15.2 20.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

import { UI_STRINGS } from '@/utils/i18n';

const USER_MODES_I18N: Record<Language, Record<UserMode, { label: string; desc: string }>> = {
  en: {
    visitor: { label: 'Visitor', desc: 'Public exhibition & exploration' },
    student: { label: 'Student', desc: 'Educational quests & simplified overviews' },
    researcher: { label: 'Researcher', desc: 'Deep citations, folios & research pack' },
    archivist: { label: 'Archivist', desc: 'OCR verification & preservation controls' },
  },
  hi: {
    visitor: { label: 'आगंतुक', desc: 'सार्वजनिक प्रदर्शनी एवं अन्वेषण' },
    student: { label: 'विद्यार्थी', desc: 'शैक्षणिक अध्ययन एवं प्रश्नमंजूषा' },
    researcher: { label: 'शोधकर्ता', desc: 'गहन संदर्भ, उद्धरण एवं अनुसंधान' },
    archivist: { label: 'अभिलेखपाल', desc: 'ओसीआर सत्यापन एवं डिजिटल संरक्षण' },
  },
  mr: {
    visitor: { label: 'अभ्यागत', desc: 'सार्वजनिक प्रदर्शन व माहिती दर्शन' },
    student: { label: 'विद्यार्थी', desc: 'मार्गदर्शित अभ्यास व प्रश्नमंजूषा' },
    researcher: { label: 'संशोधक', desc: 'सखोल संदर्भ, उतारे व संशोधन संग्रह' },
    archivist: { label: 'अभिलेखपाल', desc: 'ओसीआर पडताळणी व जतन व्यवस्था' },
  },
  ta: {
    visitor: { label: 'பார்வையாளர்', desc: 'பொதுக் கண்காட்சி மற்றும் ஆய்வு' },
    student: { label: 'மாணவர்', desc: 'கல்விசார் தேடல்கள் மற்றும் வினாடி வினா' },
    researcher: { label: 'ஆராய்ச்சியாளர்', desc: 'ஆழமான சான்றுகள் மற்றும் ஆய்வுக் குறிப்புகள்' },
    archivist: { label: 'காப்பகப் பொறுப்பாளர்', desc: 'OCR சரிபார்ப்பு மற்றும் டிஜிட்டல் பாதுகாப்பு' },
  },
  bn: {
    visitor: { label: 'দর্শনার্থী', desc: 'পাবলিক প্রদর্শনী ও অন্বেষণ' },
    student: { label: 'শিক্ষার্থী', desc: 'শিক্ষামূলক কুইজ ও সংক্ষিপ্ত রূপরেখা' },
    researcher: { label: 'গবেষক', desc: 'গভীর তথ্যসূত্র, উদ্ধৃতি ও গবেষণা নথি' },
    archivist: { label: 'নথিপত্র সংরক্ষক', desc: 'OCR যাচাইকরণ ও ডিজিটাল সংরক্ষণ' },
  },
};

const USER_MODES: { id: UserMode; icon: any }[] = [
  { id: 'visitor', icon: User },
  { id: 'student', icon: GraduationCap },
  { id: 'researcher', icon: Microscope },
  { id: 'archivist', icon: Shield },
];

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({
  language = 'en',
  onSelectLanguage,
  accessibility,
  onToggleAccessibilityModal,
  onOpenSearch,
  onOpenVoiceModal,
  userMode = 'visitor',
  onSelectUserMode,
  onOpenAdmin,
  onOpenScanner,
}) => {
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const modesLoc = USER_MODES_I18N[language] || USER_MODES_I18N.en;

  const [isModeOpen, setIsModeOpen] = React.useState(false);
  const modeMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setIsModeOpen(false);
      }
    };
    if (isModeOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isModeOpen]);

  const isCustomActive = Boolean(
    accessibility?.highContrast ||
      accessibility?.audioNarrationActive ||
      (accessibility?.textSize && accessibility.textSize !== 'normal')
  );

  const currentModeLoc = modesLoc[userMode] || modesLoc.visitor;
  const currentModeItem = USER_MODES.find(m => m.id === userMode) || USER_MODES[0];
  const CurrentModeIcon = currentModeItem.icon;

  return (
    <header
      className="fixed top-3 sm:top-5 right-3 sm:right-6 z-[8900] select-none flex items-center gap-2"
      aria-label="Universal Heritage Toolbar"
    >
      {/* 1. Global Search Quick Trigger */}
      {onOpenSearch && (
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onOpenSearch();
          }}
          className="group relative flex items-center gap-2 px-3.5 h-10 rounded-full bg-white/95 hover:bg-white backdrop-blur-xl border border-[#D3D4C0] hover:border-[#C89D56] shadow-[0_2px_10px_rgba(10,41,71,0.06)] hover:shadow-[0_4px_16px_rgba(200,157,86,0.14)] transition-all duration-200 cursor-pointer active:scale-95 text-[#0A2947]"
          title="Search Corpus (Press Cmd+K or /)"
          aria-label="Open Global Archive Search"
        >
          <Search className="w-4 h-4 text-[#8B5E3C] group-hover:text-[#C89D56] transition-colors" />
          <span className="hidden md:inline text-xs font-montserrat font-bold text-[#0A2947]">
            {t.searchBtn || 'Search'}
          </span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#8B5E3C] bg-[#FAF7F0] border border-[#D3D4C0] rounded-md">
            ⌘K
          </kbd>
        </button>
      )}

      {/* 2. Voice Navigator Trigger */}
      {onOpenVoiceModal && (
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onOpenVoiceModal();
          }}
          className="group relative flex items-center justify-center h-10 w-10 rounded-full bg-white/95 hover:bg-white backdrop-blur-xl border border-[#D3D4C0] hover:border-[#C89D56] shadow-[0_2px_10px_rgba(10,41,71,0.06)] hover:shadow-[0_4px_16px_rgba(200,157,86,0.14)] transition-all duration-200 cursor-pointer active:scale-95 text-[#8B5E3C] hover:text-[#C89D56]"
          title={t.voiceNav || "Voice Navigator & Audio Search"}
          aria-label="Open Voice Navigator"
        >
          <Mic className="w-4 h-4 transition-transform group-hover:scale-110" />
        </button>
      )}

      {/* 3. User Mode Selector Dropdown */}
      {onSelectUserMode && (
        <div ref={modeMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setIsModeOpen(prev => !prev);
            }}
            className="group relative flex items-center gap-1.5 px-3.5 h-10 rounded-full bg-white/95 hover:bg-white backdrop-blur-xl border border-[#D3D4C0] hover:border-[#C89D56] shadow-[0_2px_10px_rgba(10,41,71,0.06)] hover:shadow-[0_4px_16px_rgba(200,157,86,0.14)] transition-all duration-200 cursor-pointer active:scale-95 text-[#0A2947]"
            title={`Current Persona Mode: ${currentModeLoc.label}`}
            aria-label="Switch Persona Mode"
          >
            <CurrentModeIcon className="w-4 h-4 text-[#8B5E3C] group-hover:text-[#C89D56] transition-colors" />
            <span className="hidden sm:inline text-xs font-montserrat font-bold text-[#0A2947]">
              {currentModeLoc.label}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8B5E3C] transition-transform duration-200 ${isModeOpen ? 'rotate-180' : ''}`} />
          </button>

          {isModeOpen && (
            <div className="absolute top-full mt-2 right-0 w-64 p-2 bg-white border-2 border-[#D3D4C0] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-mono text-[#8B5E3C] font-bold uppercase tracking-wider border-b border-[#D3D4C0]/60 mb-1">
                {t.selectPersona || 'Select Persona Mode'}
              </div>
              {USER_MODES.map((mode) => {
                const MIcon = mode.icon;
                const isSelected = userMode === mode.id;
                const modeLoc = modesLoc[mode.id] || { label: mode.id, desc: '' };
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      onSelectUserMode(mode.id);
                      setIsModeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#0A2947] text-[#FAF7F0]'
                        : 'hover:bg-[#FAF7F0] text-[#0A2947]'
                    }`}
                  >
                    <MIcon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#C89D56]' : 'text-[#8B5E3C]'}`} />
                    <div>
                      <div className={`text-xs font-montserrat font-bold ${isSelected ? 'text-[#FAF7F0]' : 'text-[#0A2947]'}`}>
                        {modeLoc.label}
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-[#D3D4C0]' : 'text-[#0A2947]/70'}`}>
                        {modeLoc.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Language Dropdown */}
      {onSelectLanguage && (
        <LanguageDropdown
          language={language}
          onSelectLanguage={onSelectLanguage}
        />
      )}

      {/* 5. Mobile & Web Document Scanner Button */}
      {onOpenScanner && (
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onOpenScanner();
          }}
          className="group relative flex items-center justify-center h-10 w-10 rounded-full bg-white/95 hover:bg-white backdrop-blur-xl border border-[#D3D4C0] hover:border-[#0A2947] shadow-[0_2px_10px_rgba(10,41,71,0.06)] hover:shadow-[0_4px_16px_rgba(10,41,71,0.14)] transition-all duration-200 cursor-pointer active:scale-95 text-[#0A2947] hover:text-[#8B5E3C]"
          title="Scan Document &amp; OCR Digitizer (Mobile Camera)"
          aria-label="Scan Document"
        >
          <Camera className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="absolute top-full mt-2 right-0 px-2.5 py-1 bg-[#0A2947] text-[#FAF7F0] text-[11px] font-montserrat font-medium rounded-xl shadow-xl border border-[#D3D4C0]/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            Scan &amp; OCR
          </span>
        </button>
      )}

      {/* 6. Admin Portal Direct Link (for Archivists & Admins) */}
      {onOpenAdmin && (
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onOpenAdmin();
          }}
          className="group relative flex items-center justify-center h-10 w-10 rounded-full bg-white/95 hover:bg-white backdrop-blur-xl border border-[#D3D4C0] hover:border-[#8B5E3C] shadow-[0_2px_10px_rgba(10,41,71,0.06)] hover:shadow-[0_4px_16px_rgba(139,94,60,0.14)] transition-all duration-200 cursor-pointer active:scale-95 text-[#8B5E3C] hover:text-[#0A2947]"
          title={t.adminPortal || "Admin & Curatorial Ingestion Portal"}
          aria-label="Admin Portal"
        >
          <Shield className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="absolute top-full mt-2 right-0 px-2.5 py-1 bg-[#0A2947] text-[#FAF7F0] text-[11px] font-montserrat font-medium rounded-xl shadow-xl border border-[#D3D4C0]/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            {t.adminPortal || "Admin Portal"}
          </span>
        </button>
      )}

      {/* 6. Universal Accessibility Button */}
      <button
        type="button"
        onClick={() => {
          soundEffects.playClick();
          onToggleAccessibilityModal();
        }}
        className="group relative flex items-center justify-center h-10 w-10 rounded-full bg-white/95 hover:bg-white backdrop-blur-xl border border-[#D3D4C0] hover:border-[#C89D56] shadow-[0_2px_10px_rgba(10,41,71,0.06)] hover:shadow-[0_4px_16px_rgba(200,157,86,0.14)] transition-all duration-200 cursor-pointer active:scale-95 text-[#8B5E3C] hover:text-[#C89D56]"
        title="Accessibility & Reading Modes (Font Size, Contrast, Narration)"
        aria-label="Open Accessibility & Reading Settings"
      >
        <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-108">
          <UniversalAccessibilityIcon className="w-4.5 h-4.5" />
        </div>

        {isCustomActive && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C89D56] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5E3C] border-2 border-white" />
          </span>
        )}

        <span className="absolute top-full mt-2 right-0 px-2.5 py-1 bg-[#0A2947] text-[#FAF7F0] text-[11px] font-montserrat font-medium rounded-xl shadow-xl border border-[#D3D4C0]/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          Accessibility Settings
        </span>
      </button>
    </header>
  );
};

export default TopUtilityBar;

