'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { KnowledgeGraphView } from '@/components/museum/KnowledgeGraphView';

export default function KnowledgeMapPage() {
  const { language, openDocument, accessibility, askAssistant } = useMuseum();

  return (
    <KnowledgeGraphView
      language={language}
      onOpenDocument={openDocument}
      kidMode={accessibility.kidMode}
      onAskAI={askAssistant}
    />
  );
}
