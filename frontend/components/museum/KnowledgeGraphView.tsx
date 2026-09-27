'use client';

import React, { useState } from 'react';
import { KnowledgeGraph3D } from './graph3d';
import { ArchivalDocument, Language } from '@/types/museum';
import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_LINKS } from '@/data/archiveData';
import { ShieldCheck, Sparkles, Network, BookOpen } from 'lucide-react';
import { UI_STRINGS } from '@/utils/i18n';

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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B5E3C] via-[#C59A45] to-[#0A2947]" />

          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF7F0] border border-[#D3D4C0] rounded-full text-xs font-mono font-bold tracking-wider uppercase text-[#8B5E3C]">
              <Sparkles className="w-3.5 h-3.5 text-[#C59A45]" />
              <span>Archival 3D Exhibition · BAWS Verified Corpus</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#0A2947] tracking-tight">
              {t.wingGraphTitle || "Knowledge Universe"} —{' '}
              <span className="text-[#8B5E3C] underline decoration-[#C59A45]/40 decoration-wavy underline-offset-4">
                Dr. B. R. Ambedkar
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#0A2947]/75 font-sans leading-relaxed">
              {t.wingGraphSub || `Explore ${KNOWLEDGE_GRAPH_NODES.length} verified historical entities and ${KNOWLEDGE_GRAPH_LINKS.length} intellectual lineages across seminal treatises, civic movements, institutional foundations, and constitutional philosophies.`}
            </p>
          </div>

          {/* Quick Metrics & Curatorial Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] text-center min-w-[76px] shadow-2xs">
              <div className="text-base sm:text-lg font-bold font-mono text-[#0A2947]">
                {KNOWLEDGE_GRAPH_NODES.length}
              </div>
              <div className="text-[10px] text-[#8B5E3C] uppercase font-mono font-bold tracking-wider">
                {language === 'hi' ? 'संस्थाएं' : language === 'mr' ? 'संकल्पना' : 'Entities'}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] text-center min-w-[76px] shadow-2xs">
              <div className="text-base sm:text-lg font-bold font-mono text-[#8B5E3C]">
                {KNOWLEDGE_GRAPH_LINKS.length}
              </div>
              <div className="text-[10px] text-[#8B5E3C] uppercase font-mono font-bold tracking-wider">
                {language === 'hi' ? 'संबंध' : language === 'mr' ? 'संबंध' : 'Lineages'}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] text-center min-w-[76px] shadow-2xs">
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-800 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100%</span>
              </div>
              <div className="text-[10px] text-emerald-800 uppercase font-mono font-bold tracking-wider">
                {language === 'hi' ? 'प्रमाणित' : language === 'mr' ? 'प्रमाणित' : 'Verified'}
              </div>
            </div>
          </div>
        </div>

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
