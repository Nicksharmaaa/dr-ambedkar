'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { TimelineView } from '@/components/museum/TimelineView';

export default function TimelinePage() {
  const { language, openDocument, askAssistant, userMode } = useMuseum();

  return (
    <TimelineView
      language={language}
      onOpenDocument={openDocument}
      onAskAIAboutEvent={(q) => askAssistant(q)}
      userMode={userMode}
    />
  );
}
