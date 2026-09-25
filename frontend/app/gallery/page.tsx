'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { PhotoGalleryView } from '@/components/museum/PhotoGalleryView';

export default function GalleryPage() {
  const { language, openDocument, askAssistant } = useMuseum();

  return (
    <PhotoGalleryView
      language={language}
      onOpenDocument={openDocument}
      onAskAIWithPhoto={askAssistant}
    />
  );
}
