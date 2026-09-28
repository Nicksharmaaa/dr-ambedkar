'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { MemorialsView } from '@/components/museum/MemorialsView';

export default function MemorialsPage() {
  const { openDocById, askAssistant, language } = useMuseum();

  return (
    <MemorialsView
      language={language}
      onOpenDocument={(id) => openDocById(id)}
      onAskAIAboutLocation={(name) =>
        askAssistant(`Explain the historical and constitutional significance of ${name} in Dr. B. R. Ambedkar's life and work.`)
      }
    />
  );
}
