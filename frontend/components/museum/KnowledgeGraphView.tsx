'use client';

import React, { useState } from 'react';
import { KnowledgeGraph3D } from './graph3d';
import { ArchivalDocument, Language } from '@/types/museum';
import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_LINKS } from '@/data/archiveData';
import { ShieldCheck, Network } from 'lucide-react';
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
    <div className="min-h-screen bg-transparent text-[#0A2947] font-dmsans py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* =========================================================================
            1. MUSEUM ARCHIVAL GRAND PAVILION & LIVE ENTITY STATS
            ========================================================================= */}
        <MuseumGrandPavilion
          title={
            language === 'en' ? (
              <>
                3D Knowledge{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
                  Universe
                </span>{' '}
                &amp; Lineages
              </>
            ) : (
              <span className="bg-gradient-to-r from-white via-[#FAF7F0] to-[#EAD8B1] bg-clip-text text-transparent">
                {language === 'hi' ? '3D ज्ञान संबंध एवं वैचारिक वंशवृक्ष' : language === 'mr' ? '3D ज्ञान संबंध व वैचारिक आलेख' : language === 'ta' ? '3D அறிவு வரைபடம் & கருத்தியல் தொடர்பு' : language === 'bn' ? '3D জ্ঞান মানচিত্র ও ভাবাদর্শ' : (t.wingGraphTitle || 'Knowledge Universe')}
              </span>
            )
          }
          watermarkIcon={Network}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-2">
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-3xl">
              {t.wingGraphSub || `Explore ${KNOWLEDGE_GRAPH_NODES.length} verified historical entities and ${KNOWLEDGE_GRAPH_LINKS.length} intellectual lineages across seminal treatises, civic movements, institutional foundations, and constitutional philosophies.`}
            </p>

            {/* Quick Metrics & Curatorial Badges */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[76px] shadow-2xs">
                <div className="text-base sm:text-lg font-bold font-mono text-white">
                  {KNOWLEDGE_GRAPH_NODES.length}
                </div>
                <div className="text-[10px] text-[#F5D061] uppercase font-mono font-bold tracking-wider">
                  {language === 'hi' ? 'संस्थाएं' : language === 'mr' ? 'संकल्पना' : language === 'ta' ? 'உட்பொருள்கள்' : language === 'bn' ? 'সত্তা ও ধারণা' : 'Entities'}
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[76px] shadow-2xs">
                <div className="text-base sm:text-lg font-bold font-mono text-[#F5D061]">
                  {KNOWLEDGE_GRAPH_LINKS.length}
                </div>
                <div className="text-[10px] text-[#F5D061] uppercase font-mono font-bold tracking-wider">
                  {language === 'hi' ? 'संबंध' : language === 'mr' ? 'संबंध' : language === 'ta' ? 'தொடர்புகள்' : language === 'bn' ? 'সংযোগ' : 'Lineages'}
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[76px] shadow-2xs">
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100%</span>
                </div>
                <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold tracking-wider">
                  {language === 'hi' ? 'प्रमाणित' : language === 'mr' ? 'प्रमाणित' : language === 'ta' ? 'சரிபார்க்கப்பட்டது' : language === 'bn' ? 'যাচাইकृत' : 'Verified'}
                </div>
              </div>
            </div>
          </div>
        </MuseumGrandPavilion>

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
