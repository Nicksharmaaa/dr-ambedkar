'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { MyCollectionView } from '@/components/museum/MyCollectionView';

export default function CollectionPage() {
  const {
    language,
    savedCollection,
    removeSavedItem,
    openDocument,
    updateNote,
    navigateToTab
  } = useMuseum();

  return (
    <MyCollectionView
      language={language}
      savedItems={savedCollection}
      onRemoveItem={removeSavedItem}
      onOpenDocument={openDocument}
      onUpdateNote={updateNote}
      onNavigateTab={navigateToTab}
    />
  );
}
