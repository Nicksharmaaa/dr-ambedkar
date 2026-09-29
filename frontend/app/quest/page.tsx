'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMuseum } from '@/components/museum/MuseumContext';
import { InteractiveLearningHub, LearningWing } from '@/components/museum/InteractiveLearningHub';

function QuestPageContent() {
  const { language, openDocById, askAssistant } = useMuseum();
  const searchParams = useSearchParams();
  const wingParam = searchParams.get('wing') as LearningWing | null;

  return (
    <div className="bg-transparent min-h-screen py-4">
      <InteractiveLearningHub
        language={language}
        initialWing={wingParam || undefined}
        onExploreDoc={openDocById}
        onAskAI={askAssistant}
      />
    </div>
  );
}

export default function QuestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center font-serif-editorial text-[#0A2947]">Loading Interactive Learning Hub...</div>}>
      <QuestPageContent />
    </Suspense>
  );
}
