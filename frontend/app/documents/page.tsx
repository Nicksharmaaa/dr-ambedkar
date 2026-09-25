'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMuseum } from '@/components/museum/MuseumContext';
import { ExploreArchiveView } from '@/components/museum/ExploreArchiveView';

function DocumentsContent() {
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

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F0] p-12 text-[#0A2947] font-mono text-sm">Loading archival corpus...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}
