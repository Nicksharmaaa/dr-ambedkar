'use client';

import React from 'react';
import { useMuseum } from './MuseumContext';
import { HeaderNav } from './HeaderNav';
import { KioskBar } from './KioskBar';
import { AccessibilityModal } from './AccessibilityModal';
import { DocumentViewerModal } from './DocumentViewerModal';
import { GlobalSearchModal } from './GlobalSearchModal';
import { VoiceNavigatorModal } from './VoiceNavigatorModal';
import { FloatingAssistantDock } from './FloatingAssistantDock';
import { IntroVideoScreen } from './IntroVideoScreen';
import { BookOpen, Compass, Star, Zap, ArrowUp } from 'lucide-react';

export const MuseumShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentTab,
    navigateToTab,
    language,
    setLanguage,
    userMode,
    setUserMode,
    accessibility,
    setAccessibility,
    isAccessibilityModalOpen,
    setIsAccessibilityModalOpen,
    isSearchModalOpen,
    setIsSearchModalOpen,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    selectedDocument,
    isDocViewerOpen,
    openDocument,
    closeDocViewer,
    savedCollection,
    toggleSaveItem,
    isItemSaved,
    updateNote,
    removeSavedItem,
    askAssistant,
    showIntro,
    handleIntroComplete,
    replayIntro,
  } = useMuseum();

  const getTextSizeClass = () => {
    if (accessibility.textSize === 'large') return 'text-[1.125rem]';
    if (accessibility.textSize === 'xlarge') return 'text-[1.25rem]';
    return '';
  };

  const handleKioskBack = () => {
    if (isDocViewerOpen) {
      closeDocViewer();
      return;
    }
    navigateToTab('home');
  };

  return (
    <div
      className={`min-h-screen bg-[#FAF7F0] text-[#0A2947] flex flex-col font-dmsans transition-colors ${
        accessibility.highContrast ? 'contrast-125 saturate-125' : ''
      } ${getTextSizeClass()}`}
    >
      {/* 5-Second Cinematic Ambedkar Intro Exhibition Screen */}
      {showIntro && (
        <IntroVideoScreen
          onComplete={handleIntroComplete}
          videoSrc="/intro/ambedkar-intro.mp4"
          posterSrc="/intro/ambedkar-intro-poster.jpg"
        />
      )}

      {/* Sleek, Modern, Vibrant Navigation Header */}
      <HeaderNav
        currentTab={currentTab}
        onSelectTab={navigateToTab}
        language={language}
        onSelectLanguage={setLanguage}
        accessibility={accessibility}
        onToggleAccessibilityModal={() => setIsAccessibilityModalOpen(true)}
        onToggleSoundEffects={() =>
          setAccessibility(prev => ({ ...prev, soundEffectsEnabled: !prev.soundEffectsEnabled }))
        }
        onToggleKidMode={() =>
          setAccessibility(prev => ({ ...prev, kidMode: !prev.kidMode }))
        }
        savedCount={savedCollection.length}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenAIScholar={() => askAssistant('')}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onReplayIntro={replayIntro}
        userMode={userMode}
        onSelectUserMode={setUserMode}
      />

      {/* Main Viewport */}
      <main className="flex-1">{children}</main>

      {/* Interactive Archival Document Viewer Modal */}
      <DocumentViewerModal
        document={selectedDocument}
        isOpen={isDocViewerOpen}
        onClose={closeDocViewer}
        language={language}
        onSelectLanguage={setLanguage}
        onOpenRelatedDocument={openDocument}
        onToggleSaveItem={toggleSaveItem}
        isItemSaved={selectedDocument ? isItemSaved(selectedDocument.id) : false}
        onAskAIAboutDoc={askAssistant}
      />

      {/* Accessibility Control Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
        accessibility={accessibility}
        onChangeTextSize={(size) => setAccessibility(prev => ({ ...prev, textSize: size }))}
        onToggleHighContrast={() =>
          setAccessibility(prev => ({ ...prev, highContrast: !prev.highContrast }))
        }
        onToggleAudioNarration={() =>
          setAccessibility(prev => ({
            ...prev,
            audioNarrationActive: !prev.audioNarrationActive,
          }))
        }
        language={language}
        onSelectLanguage={setLanguage}
      />

      {/* Persistent Kiosk Touch Controls when Kiosk Mode is Active */}
      {accessibility.kioskMode && (
        <KioskBar
          onHome={() => navigateToTab('home')}
          onBack={handleKioskBack}
          onOpenSearch={() => navigateToTab('archive')}
          accessibility={accessibility}
          onToggleHighContrast={() =>
            setAccessibility(prev => ({ ...prev, highContrast: !prev.highContrast }))
          }
          onChangeTextSize={(size) =>
            setAccessibility(prev => ({ ...prev, textSize: size }))
          }
          onExitKiosk={() =>
            setAccessibility(prev => ({ ...prev, kioskMode: false }))
          }
          language={language}
        />
      )}

      {/* PERMANENT FLOATING ASSISTANT DOCK: Ask AI & Notebook on Bottom Left */}
      <FloatingAssistantDock
        language={language}
        savedCollection={savedCollection}
        onRemoveSavedItem={removeSavedItem}
        onUpdateNote={updateNote}
        onOpenDocument={openDocument}
        onNavigateTab={navigateToTab}
      />

      {/* GLOBAL SEARCH COMMAND MODAL */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        language={language}
        onSelectDocument={openDocument}
        onNavigateTab={navigateToTab}
        onAskAI={askAssistant}
      />

      {/* TOP-RIGHT POPUP VOICE NAVIGATOR & AI MODAL */}
      <VoiceNavigatorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={language}
        onNavigateTab={navigateToTab}
        onAskAIWithQuery={askAssistant}
        onOpenDocument={openDocument}
      />

      {/* World-Class Museum Heritage Footer */}
      <footer className="bg-[#0A2947] text-[#FAF7F0] text-xs mt-auto border-t-2 border-[#D3D4C0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#D3D4C0]/20">
            {/* Brand & Mission Statement */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F3E4C9] text-[#0A2947] flex items-center justify-center font-cinzel font-bold text-lg border border-[#8B5E3C] shadow-sm">
                  BA
                </div>
                <div>
                  <span className="text-base sm:text-lg font-serif-editorial font-bold tracking-tight text-[#F3E4C9] block">
                    THE DIGITAL MUSEUM OF DR. B. R. AMBEDKAR
                  </span>
                  <span className="text-[10px] text-[#D3D4C0] font-mono uppercase tracking-wider">
                    National Heritage Archive & Academic Repository
                  </span>
                </div>
              </div>

              <p className="text-[#D3D4C0] text-xs leading-relaxed max-w-sm font-dmsans">
                Preserving the constitutional philosophy, primary manuscripts, and social emancipation treatises of Dr. Bhimrao Ramji Ambedkar through unabridged facsimiles, high-accuracy OCR, and verified source intelligence.
              </p>

              <div className="p-3.5 rounded-xl bg-[#0A2947]/90 border border-[#D3D4C0]/30 text-[#F3E4C9] font-serif-editorial italic text-xs leading-relaxed">
                "Cultivation of mind should be the ultimate aim of human existence."
              </div>
            </div>

            {/* Museum Exhibition Wings */}
            <div className="md:col-span-4 space-y-3">
              <div className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#F3E4C9]">
                Exhibition Wings & Galleries
              </div>
              <ul className="space-y-2 text-[#D3D4C0] text-xs">
                <li>
                  <button 
                    onClick={() => navigateToTab('archive')}
                    className="hover:text-[#F3E4C9] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#F3E4C9]" />
                    <span>The Archival Corpus (22 Volumes · 113,664+ Pages)</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToTab('timeline')}
                    className="hover:text-[#F3E4C9] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#F3E4C9]" />
                    <span>The Historical Chronology (1891–1956)</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToTab('stories')}
                    className="hover:text-[#F3E4C9] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-[#F3E4C9]" />
                    <span>Curated Historical Pathways & Audio Stories</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToTab('gallery')}
                    className="hover:text-[#F3E4C9] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#F3E4C9]" />
                    <span>Archival Photographic Folio & Assemblies</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToTab('graph')}
                    className="hover:text-[#F3E4C9] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#F3E4C9]" />
                    <span>Constitutional & Intellectual Knowledge Graph</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Core Constitutional Pillars */}
            <div className="md:col-span-3 space-y-3">
              <div className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#F3E4C9]">
                Foundational Principles
              </div>
              <div className="space-y-2 text-[#D3D4C0] text-xs">
                <div className="flex items-center gap-2 text-white">
                  <span className="w-2 h-2 rounded-full bg-[#8B5E3C]"></span>
                  <span>Liberty, Equality & Fraternity</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="w-2 h-2 rounded-full bg-[#F3E4C9]"></span>
                  <span>Constitutional Morality</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="w-2 h-2 rounded-full bg-[#D3D4C0]"></span>
                  <span>Social & Economic Democracy</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                  <span>Subaltern Rights & Human Dignity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Museum Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D3D4C0]">
            <div>
              The Digital Museum of Dr. B. R. Ambedkar · Open National Heritage Research Platform
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3.5 py-1.5 rounded-xl bg-[#8B5E3C] hover:bg-[#F3E4C9] text-[#FAF7F0] hover:text-[#0A2947] flex items-center gap-1.5 transition-colors cursor-pointer font-montserrat font-bold text-xs"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
