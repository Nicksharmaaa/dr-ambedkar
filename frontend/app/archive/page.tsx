'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMuseum } from '@/components/museum/MuseumContext';
import { ExploreArchiveView } from '@/components/museum/ExploreArchiveView';

function ArchiveContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const category = searchParams.get('type') || searchParams.get('category') || 'all';

  const {
    language,
    openDocument,
    askAssistant,
    toggleSaveItem,
    isItemSaved
  } = useMuseum();

  return (
    <ExploreArchiveView
      language={language}
      onOpenDocument={openDocument}
      initialQuery={q}
      initialCategory={category}
      onAskAssistantWithQuery={askAssistant}
      onToggleSaveItem={toggleSaveItem}
      isItemSaved={isItemSaved}
    />
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent p-12 text-[#0A2947] font-mono text-sm">Loading archive corpus...</div>}>
      <ArchiveContent />
    </Suspense>
  );
}
