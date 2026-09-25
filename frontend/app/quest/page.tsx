'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { ConstitutionalQuest } from '@/components/museum/ConstitutionalQuest';

export default function QuestPage() {
  const { language, openDocById, askAssistant } = useMuseum();

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-8">
      <ConstitutionalQuest
        language={language}
        onExploreDoc={openDocById}
        onAskAI={askAssistant}
      />
    </div>
  );
}
