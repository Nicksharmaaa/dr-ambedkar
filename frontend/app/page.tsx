'use client';

import React from 'react';
import { useMuseum } from '@/components/museum/MuseumContext';
import { HomeView } from '@/components/museum/HomeView';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const {
    language,
    openDocument,
    askAssistant,
    navigateToTab,
    assistantQuery,
    setAssistantQuery,
    replayIntro,
  } = useMuseum();

  const handleExploreCategory = (category: string) => {
    router.push(`/archive?type=${encodeURIComponent(category)}`);
  };

  const handleSearchSubmit = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <HomeView
      language={language}
      onExploreCategory={handleExploreCategory}
      onOpenDocument={openDocument}
      onAskAssistantWithQuery={askAssistant}
      onSearchSubmit={handleSearchSubmit}
      onNavigateTab={navigateToTab}
      incomingAIQuery={assistantQuery}
      onClearAIQuery={() => setAssistantQuery('')}
      onReplayIntro={replayIntro}
    />
  );
}
