'use client';

import React, { useState } from 'react';
import { 
  X, ShieldCheck, BookOpen, Sparkles, ChevronRight, ChevronLeft, 
  ExternalLink, Layers, ArrowUpRight, CheckCircle2, Bookmark,
  Calendar, FileText, Loader2, ArrowRight
} from 'lucide-react';
import { Graph3DNode, ConnectedEntitySummary, MUSEUM_PALETTE } from './types';
import { ArchivalDocument } from '@/types/museum';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { api } from '@/lib/api';
import { soundEffects } from '@/utils/soundEffects';

interface ArchivalDossierProps {
  node: Graph3DNode | null;
  connectedEntities: ConnectedEntitySummary[];
  onClose: () => void;
  onSelectConnectedNode: (nodeId: string) => void;
  onOpenDocument?: (doc: ArchivalDocument) => void;
  onAskAI?: (query: string) => void;
  isOpen: boolean;
}

export const ArchivalDossier: React.FC<ArchivalDossierProps> = ({
  node,
  connectedEntities,
  onClose,
  onSelectConnectedNode,
  onOpenDocument,
  onAskAI,
  isOpen,
}) => {
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiCitations, setAiCitations] = useState<any[]>([]);
  const [connIndex, setConnIndex] = useState(0);

  // Reset local AI answers when node changes
  React.useEffect(() => {
    setAiAnswer(null);
    setAiCitations([]);
    setConnIndex(0);
  }, [node?.id]);

  if (!node || !isOpen) return null;

  const linkedDoc = node.linkedDocId
    ? ARCHIVE_DOCUMENTS.find((d) => d.id === node.linkedDocId)
    : null;

  const handleAskAboutEntity = async () => {
    soundEffects.playTactileChime();
    const prompt = `Explain the intellectual connections and archival significance of "${node.label}" (${node.category}) in Dr. B. R. Ambedkar's work and philosophy citing BAWS volumes.`;

    if (onAskAI) {
      onAskAI(prompt);
      return;
    }

    try {
      setIsAskingAI(true);
      setAiAnswer(null);
      const res = await api.askAssistant({
        question: prompt,
        mode: 'ask',
      });
      if (res && res.answer) {
        setAiAnswer(res.answer);
        if (res.citations) setAiCitations(res.citations);
      }
    } catch (err) {
      console.warn('AI Assistant error:', err);
      setAiAnswer('Archival Q&A service is grounded in Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS).');
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleNextNeighbor = () => {
    if (connectedEntities.length === 0) return;
    const nextIdx = (connIndex + 1) % connectedEntities.length;
    setConnIndex(nextIdx);
    soundEffects.playClick();
    onSelectConnectedNode(connectedEntities[nextIdx].node.id);
  };

  const handlePrevNeighbor = () => {
    if (connectedEntities.length === 0) return;
    const prevIdx = (connIndex - 1 + connectedEntities.length) % connectedEntities.length;
    setConnIndex(prevIdx);
    soundEffects.playClick();
    onSelectConnectedNode(connectedEntities[prevIdx].node.id);
  };

  return (
    <aside 
      className="absolute top-4 right-4 bottom-4 w-full sm:w-[460px] max-w-[calc(100vw-32px)] z-30 flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out animate-in slide-in-from-right-8"
      style={{
        background: 'rgba(255, 249, 239, 0.88)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(164, 119, 69, 0.22)',
        boxShadow: '0 24px 60px -12px rgba(47, 36, 28, 0.18)',
      }}
      aria-label="Archival Museum Dossier"
    >
      {/* ── Top Header / Museum Label Bar ── */}
      <div className="p-6 pb-4 border-b border-[#A47745]/15 flex items-start justify-between gap-4">
        <div className="space-y-1.5 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#A47745] px-2.5 py-0.5 rounded-full bg-[#A47745]/10 border border-[#A47745]/20">
              {node.category?.toUpperCase() || 'HISTORICAL ARTIFACT'}
            </span>
            {node.year && (
              <span className="text-xs font-mono font-semibold text-[#756555]">
                · {node.year}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-mono font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              Verified
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2F241C] tracking-tight leading-tight">
            {node.label}
          </h2>

          {node.bawsVolume && (
            <div className="text-[11px] font-mono text-[#756555] flex items-center gap-1">
              <Bookmark className="w-3 h-3 text-[#A47745]" />
              <span>{node.bawsVolume}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="shrink-0 p-2 rounded-full text-[#756555] hover:text-[#2F241C] hover:bg-[#A47745]/15 transition-colors"
          title="Close Dossier (ESC)"
          aria-label="Close Dossier"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Scrollable Curatorial Body ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[#2F241C] text-sm leading-relaxed">
        
        {/* Curatorial Summary */}
        {node.shortDesc && (
          <div className="space-y-1">
            <h3 className="text-[11px] uppercase tracking-wider font-mono font-bold text-[#A47745]">
              Curatorial Summary
            </h3>
            <p className="text-sm font-sans text-[#2F241C]/90 leading-relaxed font-normal">
              {node.shortDesc}
            </p>
          </div>
        )}

        {/* Significance / Why It Matters */}
        {node.whyItMatters && (
          <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#A47745]/15 space-y-1 shadow-2xs">
            <div className="text-[11px] font-mono uppercase font-bold text-[#A47745] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9AC72]" />
              Historical Emancipation Significance
            </div>
            <p className="text-xs text-[#2F241C]/85 leading-relaxed italic">
              "{node.whyItMatters}"
            </p>
          </div>
        )}

        {/* Key Verified Facts */}
        {node.keyFacts && node.keyFacts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[11px] uppercase tracking-wider font-mono font-bold text-[#A47745]">
              Verified Archival Facts
            </h3>
            <ul className="space-y-2">
              {node.keyFacts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2F241C]/85 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A47745] mt-1.5 shrink-0" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Provenance & Citation */}
        {node.provenanceCitation && (
          <div className="space-y-1 pt-2 border-t border-[#A47745]/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#756555] font-semibold">
              Archival Provenance Citation
            </div>
            <div className="text-xs font-mono text-[#756555] bg-[#FAF5EB] p-2.5 rounded-xl border border-[#A47745]/10">
              {node.provenanceCitation}
            </div>
          </div>
        )}

        {/* Linked Archival Document */}
        {linkedDoc && (
          <div className="p-4 rounded-2xl bg-white/70 border border-[#A47745]/20 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase font-bold text-[#A47745] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Linked Primary Source
              </div>
              <span className="text-[10px] font-mono text-[#756555]">{linkedDoc.year}</span>
            </div>
            <div className="font-serif font-bold text-[#2F241C] text-sm">
              {linkedDoc.title}
            </div>
            <button
              onClick={() => {
                soundEffects.playClick();
                if (onOpenDocument) onOpenDocument(linkedDoc);
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#2F241C] text-[#FAF5EB] hover:bg-[#433428] text-xs font-sans font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>Examine Document Facsimile</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Connected Lineages (1-Hop Spatial Navigation) */}
        {connectedEntities.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[#A47745]/10">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-wider font-mono font-bold text-[#A47745] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Lineages ({connectedEntities.length})
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevNeighbor}
                  className="p-1 rounded-lg hover:bg-[#A47745]/15 text-[#756555] hover:text-[#2F241C] transition-colors"
                  title="Previous connected entity"
                  aria-label="Previous connected entity"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-[#756555]">
                  {connIndex + 1} / {connectedEntities.length}
                </span>
                <button
                  onClick={handleNextNeighbor}
                  className="p-1 rounded-lg hover:bg-[#A47745]/15 text-[#756555] hover:text-[#2F241C] transition-colors"
                  title="Next connected entity"
                  aria-label="Next connected entity"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {connectedEntities.slice(0, 4).map((conn, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundEffects.playClick();
                    onSelectConnectedNode(conn.node.id);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#FFFDF8] hover:bg-white border border-[#A47745]/15 hover:border-[#A47745]/35 text-left transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-[10px] font-mono text-[#A47745] uppercase font-semibold">
                      {conn.relation}
                    </div>
                    <div className="text-xs font-serif font-bold text-[#2F241C] group-hover:text-[#A47745] transition-colors">
                      {conn.node.label}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#756555] group-hover:translate-x-1 group-hover:text-[#A47745] transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Grounded RAG Assistant Section ── */}
        <div className="space-y-3 pt-3 border-t border-[#A47745]/15">
          <button
            onClick={handleAskAboutEntity}
            disabled={isAskingAI}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#A47745] to-[#8B5E3C] text-white font-serif font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAskingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Consulting Archival Evidence …</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FFF2D4]" />
                <span>Ask AI About This Entity</span>
              </>
            )}
          </button>

          {aiAnswer && (
            <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#A47745]/25 space-y-2 animate-in fade-in">
              <div className="text-[10px] font-mono font-bold uppercase text-[#A47745] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Archival Scholar Grounded Synthesis
              </div>
              <p className="text-xs font-sans text-[#2F241C] leading-relaxed">
                {aiAnswer}
              </p>
              {aiCitations.length > 0 && (
                <div className="pt-2 border-t border-[#A47745]/10 space-y-1">
                  <div className="text-[9px] font-mono uppercase text-[#756555] font-bold">
                    Citations ({aiCitations.length})
                  </div>
                  {aiCitations.slice(0, 2).map((c, i) => (
                    <div key={i} className="text-[10px] font-mono text-[#756555]">
                      • {c.citation_string || c.object_title || 'BAWS Archival Record'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Footer Navigation ── */}
      <div className="p-4 px-6 border-t border-[#A47745]/15 bg-[#FAF5EB]/60 flex items-center justify-between text-xs text-[#756555] font-mono">
        <span>Click empty canvas to deselect</span>
        <kbd className="px-2 py-0.5 rounded bg-white border border-[#A47745]/20 text-[10px]">
          ESC
        </kbd>
      </div>
    </aside>
  );
};
