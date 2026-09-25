'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { AIStoryModeView } from '@/components/museum/AIStoryModeView';

export default function StoriesPage() {
  const { language, openDocument, accessibility } = useMuseum();

  return (
    <AIStoryModeView
      language={language}
      onOpenDocument={openDocument}
      kidModeDefault={accessibility.kidMode}
    />
  );
}
