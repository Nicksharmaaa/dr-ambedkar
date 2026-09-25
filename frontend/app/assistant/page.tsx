'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { ResearchAssistantView } from '@/components/museum/ResearchAssistantView';

export default function AssistantPage() {
  const {
    language,
    openDocument,
    toggleSaveItem,
    isItemSaved,
    assistantQuery,
    activeDocumentContext,
    setActiveDocumentContext,
  } = useMuseum();

  return (
    <ResearchAssistantView
      language={language}
      onOpenDocument={openDocument}
      onToggleSaveItem={toggleSaveItem}
      isItemSaved={isItemSaved}
      incomingQuery={assistantQuery}
      activeDocumentContext={activeDocumentContext}
      onClearDocumentContext={() => setActiveDocumentContext(null)}
    />
  );
}
