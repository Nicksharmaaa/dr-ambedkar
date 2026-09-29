'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMuseum } from '@/components/museum/MuseumContext';
import { BookViewLibraryView } from '@/components/museum/BookViewLibraryView';

function DocumentsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const category = searchParams.get('type') || searchParams.get('category') || 'all';

  const {
    language,
    openDocument,
    askAssistant,
  } = useMuseum();

  return (
    <BookViewLibraryView
      language={language}
      onOpenDocument={openDocument}
      initialQuery={q}
      initialCategory={category}
      onAskAssistant={askAssistant}
    />
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent p-12 text-[#0A2947] font-mono text-sm">Loading archival corpus...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}
