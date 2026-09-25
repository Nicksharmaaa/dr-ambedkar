'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { MediaArchiveView } from '@/components/museum/MediaArchiveView';

export default function MediaPage() {
  const { language, openDocument } = useMuseum();

  return (
    <MediaArchiveView
      language={language}
      onOpenDocument={openDocument}
    />
  );
}
