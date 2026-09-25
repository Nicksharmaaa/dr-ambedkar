'use client';

import React, { useState } from 'react';
import { 
  Network, ShieldCheck, Sparkles, Compass, 
  BookOpen, Maximize2, Layers, CheckCircle2, 
  ExternalLink, FileText, ArrowRight
} from 'lucide-react';
import { KnowledgeGraph3D } from './graph3d';
import { ArchivalDocument, Language } from '@/types/museum';
import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_LINKS } from '@/data/archiveData';

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
  const [isImmersive, setIsImmersive] = useState<boolean>(false);

  if (isImmersive) {
    return (
      <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#08192A] overflow-hidden m-0 p-0">
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
    <div className="min-h-screen bg-[#FAF7F0] text-[#0A2947] py-6 sm:py-8 px-3 sm:px-6 lg:px-8 font-dmsans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* =========================================================================
            1. HEADER BANNER (MUSEUM PROVENANCE & INTELLECTUAL UNIVERSE)
            ========================================================================= */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Archival Provenance Badge */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0A2947] text-[#C59A45] border-2 border-[#C59A45] flex items-center justify-center shadow-md shrink-0">
                <Compass className="w-7 h-7 text-[#C59A45] animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
                    The Ambedkar Knowledge Universe
                  </h1>
                  <span className="px-3 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>BAWS Primary Provenance</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#0A2947]/75 font-dmsans max-w-3xl">
                  Interactive 3D WebGL semantic space mapping Dr. B. R. Ambedkar's foundational treatises, constitutional lineages, historical movements, and intellectual contemporaries.
                </p>
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
              <div className="px-3.5 py-2 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947] text-center">
                <div className="font-bold text-base text-[#8B5E3C]">{KNOWLEDGE_GRAPH_NODES.length}</div>
                <div className="text-[10px] text-[#0A2947]/60 uppercase">Entities</div>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947] text-center">
                <div className="font-bold text-base text-[#8B5E3C]">{KNOWLEDGE_GRAPH_LINKS.length}</div>
                <div className="text-[10px] text-[#0A2947]/60 uppercase">Lineages</div>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947] text-center">
                <div className="font-bold text-base text-emerald-700">100%</div>
                <div className="text-[10px] text-[#0A2947]/60 uppercase">Verified</div>
              </div>
            </div>

          </div>

          {/* Quick Context & Instruction Pills */}
          <div className="pt-3 border-t border-[#D3D4C0]/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#0A2947]/80">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[#8B5E3C] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#C59A45]" />
                <span>Zero Visual Clutter:</span>
              </span>
              <span>Labels and relationship paths reveal on hover and selection.</span>
            </div>
            <div className="text-[11px] text-[#0A2947]/60">
              Click <strong className="text-[#8B5E3C]">"Immersive 3D"</strong> to expand to full viewport (100vw × 100vh).
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. THE 3D KNOWLEDGE UNIVERSE CANVAS
            ========================================================================= */}
        <KnowledgeGraph3D
          language={language}
          onOpenDocument={onOpenDocument}
          onAskAI={onAskAI}
          kidMode={kidMode}
          isImmersive={false}
          onToggleImmersive={() => setIsImmersive(true)}
        />

        {/* =========================================================================
            3. EVIDENCE-FIRST ARCHIVAL INTEGRITY FOOTER
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="bg-white border-2 border-[#D3D4C0] rounded-2xl p-4 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Evidence-First Principles</span>
            </div>
            <p className="text-xs text-[#0A2947]/75 font-dmsans leading-relaxed">
              Every node and edge is verified against archival records in <em>Babasaheb Ambedkar: Writings and Speeches</em> (Vols 1–22). No hallucinated or synthetic relationships.
            </p>
          </div>

          <div className="bg-white border-2 border-[#D3D4C0] rounded-2xl p-4 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase">
              <Compass className="w-4 h-4 text-[#C59A45]" />
              <span>Spatial Lineage Navigation</span>
            </div>
            <p className="text-xs text-[#0A2947]/75 font-dmsans leading-relaxed">
              Selecting any sphere isolates its 1-degree intellectual neighborhood, dims distant entities, and activates real-time relationship particle flows.
            </p>
          </div>

          <div className="bg-white border-2 border-[#D3D4C0] rounded-2xl p-4 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>Primary Source Deep Linking</span>
            </div>
            <p className="text-xs text-[#0A2947]/75 font-dmsans leading-relaxed">
              Direct transitions from knowledge entities to full-text archival treatises, constitutional draft transcripts, and audio-visual recordings.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
