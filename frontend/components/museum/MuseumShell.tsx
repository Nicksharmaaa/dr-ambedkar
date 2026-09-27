'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMuseum } from './MuseumContext';
import { MuseumNavRail, TopUtilityBar } from './navigation';
import { KioskBar } from './KioskBar';
import { AccessibilityModal } from './AccessibilityModal';
import { DocumentViewerModal } from './DocumentViewerModal';
import { GlobalSearchModal } from './GlobalSearchModal';
import { VoiceNavigatorModal } from './VoiceNavigatorModal';
import { FloatingAssistantDock } from './FloatingAssistantDock';
import { IntroVideoScreen } from './IntroVideoScreen';
import { MuseumFooter } from './MuseumFooter';

export const MuseumShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
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
      className={`min-h-screen bg-transparent text-[#0A2947] flex flex-col font-dmsans transition-colors ${
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

      {/* Floating Left-Side Museum Navigation Rail (Compact Icon + Fan Arc Reveal) */}
      {!showIntro && (
        <MuseumNavRail
          currentTab={currentTab}
          onSelectTab={navigateToTab}
          savedCount={savedCollection.length}
        />
      )}

      {/* Floating Top-Right Secondary Utilities Dock - Visible exclusively on the Home Page */}
      {!showIntro && (pathname === '/' || currentTab === 'home') && (
        <TopUtilityBar
          language={language}
          onSelectLanguage={setLanguage}
          accessibility={accessibility}
          onToggleAccessibilityModal={() => setIsAccessibilityModalOpen(true)}
          onToggleSoundEffects={() =>
            setAccessibility(prev => ({ ...prev, soundEffectsEnabled: !prev.soundEffectsEnabled }))
          }
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onReplayIntro={replayIntro}
          userMode={userMode}
          onSelectUserMode={setUserMode}
          onOpenAdmin={() => navigateToTab('admin')}
        />
      )}

      {/* Main Viewport */}
      <main className="flex-1 pl-0 sm:pl-16">{children}</main>

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

      {/* PERMANENT FLOATING ASSISTANT DOCK: Ask AI Scholar on Bottom Right */}
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

      {/* World-Class Revamped Museum Heritage Footer */}
      <MuseumFooter
        onNavigateTab={navigateToTab}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        onOpenAccessibility={() => setIsAccessibilityModalOpen(true)}
        onSelectUserMode={setUserMode}
        userMode={userMode}
      />
    </div>
  );
};
