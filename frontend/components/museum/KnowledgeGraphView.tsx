'use client';

import React, { useState } from 'react';
import { KnowledgeGraph3D } from './graph3d';
import { ArchivalDocument, Language } from '@/types/museum';
import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_LINKS } from '@/data/archiveData';
import { ShieldCheck, Sparkles, Network, BookOpen } from 'lucide-react';
import { UI_STRINGS } from '@/utils/i18n';
import MuseumGrandPavilion from './MuseumGrandPavilion';

interface KnowledgeGraphViewProps {
  language?: Language;
  onOpenDocument?: (doc: ArchivalDocument) => void;
  kidMode?: boolean;
  onAskAI?: (query: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  language = 'en',
  onOpenDocument,
  kidMode = false,
  onAskAI,
}) => {
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const [isImmersive, setIsImmersive] = useState<boolean>(false);

  if (isImmersive) {
    return (
      <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#FAF7F0] overflow-hidden m-0 p-0">
        <KnowledgeGraph3D
          language={language}
          onOpenDocument={onOpenDocument}
          onAskAI={onAskAI}
          kidMode={kidMode}
          isImmersive={true}
          onToggleImmersive={() => setIsImmersive(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent text-[#0A2947] font-dmsans py-6 sm:py-8 px-3 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-[1600px] mx-auto space-y-5">

        {/* Curatorial Header */}
        {/* Curatorial Header */}
        <MuseumGrandPavilion
          title={
            <>
              Semantic{' '}
              <span className="font-serif italic font-normal bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
                Knowledge
              </span>{' '}
              Graph
            </>
          }
          watermarkIcon={Network}
        />

        {/* 3D Knowledge Universe Viewport */}
        <KnowledgeGraph3D
          language={language}
          onOpenDocument={onOpenDocument}
          onAskAI={onAskAI}
          kidMode={kidMode}
          isImmersive={false}
          onToggleImmersive={() => setIsImmersive(true)}
        />

      </div>
    </div>
  );
};
