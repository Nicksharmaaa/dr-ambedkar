'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { DocumentComparisonView } from '@/components/museum/DocumentComparisonView';

export default function ComparePage() {
  const { language, openDocument, accessibility } = useMuseum();

  return (
    <div className="bg-transparent min-h-screen py-6">
      <DocumentComparisonView
        language={language}
        onOpenDocument={openDocument}
        kidMode={accessibility.kidMode}
      />
    </div>
  );
}
