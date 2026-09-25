'use client';

import React, { useState } from 'react';
import { 
  X, ShieldCheck, Calendar, BookOpen, Sparkles, 
  ExternalLink, ChevronRight, Layers, HelpCircle, 
  Share2, Compass, ArrowUpRight, CheckCircle2,
  FileText, CornerDownRight, Loader2
} from 'lucide-react';
import { Graph3DNode, ConnectedEntitySummary } from './types';
import { ArchivalDocument } from '@/types/museum';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { api } from '@/lib/api';

interface NodeDetailDrawerProps {
  node: Graph3DNode | null;
  connectedEntities: ConnectedEntitySummary[];
  onClose: () => void;
  onSelectConnectedNode: (nodeId: string) => void;
  onOpenDocument?: (doc: ArchivalDocument) => void;
  onAskAI?: (query: string) => void;
  onExpandConnections?: (nodeId: string) => void;
  isExpanded?: boolean;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  connectedEntities,
  onClose,
  onSelectConnectedNode,
  onOpenDocument,
  onAskAI,
  onExpandConnections,
  isExpanded = false,
}) => {
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiCitations, setAiCitations] = useState<any[]>([]);

  if (!node) return null;

  const linkedDoc = node.linkedDocId
    ? ARCHIVE_DOCUMENTS.find((d) => d.id === node.linkedDocId)
    : null;

  const handleAskAboutNode = async () => {
    const prompt = `Explain the intellectual connections and archival significance of "${node.label}" (${node.category}) in Dr. B. R. Ambedkar's work and philosophy.`;
    
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
      setAiAnswer('The AI Research Assistant is currently indexing archival documents. Please consult the BAWS volumes directly.');
    } finally {
      setIsAskingAI(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'person': return '#3b82f6';
      case 'work':
      case 'book':
      case 'document': return '#6366f1';
      case 'organization':
      case 'institution': return '#0284c7';
      case 'event': return '#f97316';
      case 'concept':
      case 'idea': return '#10b981';
      case 'article': return '#14b8a6';
      case 'place': return '#8B5E3C';
      case 'media': return '#f59e0b';
      default: return '#C89D56';
    }
  };

  const catColor = getCategoryColor(node.category);

  return (
    <aside 
      className="fixed inset-y-0 right-0 z-[10000] w-full sm:w-[440px] lg:w-[460px] bg-[#0A2947]/95 backdrop-blur-xl border-l border-[#C89D56]/30 text-[#FAF7F0] shadow-2xl flex flex-col transition-transform duration-300 ease-out transform translate-x-0"
      aria-label={`Details for ${node.label}`}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#C89D56]/20 bg-[#08192A]/80">
        <div className="flex items-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
            style={{ backgroundColor: catColor }}
          />
          <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-[#C89D56]">
            {node.category.toUpperCase()}
          </span>
          {node.status && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-medium">
              {node.status}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close inspector (Esc)"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
        
        {/* Node Image / Medallion if available */}
        {node.imageUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-[#C89D56]/40 aspect-video sm:aspect-16/10 bg-[#08192A] shadow-lg group">
            <img
              src={node.imageUrl}
              alt={node.label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2947] via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-[#F3E4C9]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>Archival Specimen</span>
              </span>
              <span>{node.year ? `Circa ${node.year}` : 'Historical Record'}</span>
            </div>
          </div>
        )}

        {/* Title, Year & Verified Badge */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
              {node.label}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/70 font-mono">
            {node.year && (
              <span className="flex items-center gap-1 text-[#C89D56]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{node.year}</span>
              </span>
            )}
            {node.date && <span>· {node.date}</span>}
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Archival Entity</span>
            </span>
          </div>
        </div>

        {/* Short Summary */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#C89D56] font-semibold">
            Archival Summary
          </h3>
          <p className="text-sm text-white/85 font-sans leading-relaxed">
            {node.shortDesc}
          </p>
        </div>

        {/* Historical Significance */}
        {node.significance && (
          <div className="p-4 rounded-xl bg-[#08192A]/70 border-l-4 border-[#C89D56] border-y border-r border-[#C89D56]/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-[#C89D56] tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Historical Significance</span>
            </div>
            <p className="text-xs text-[#FAF7F0]/90 leading-relaxed font-sans">
              {node.significance}
            </p>
          </div>
        )}

        {/* Interactive Connected Entities */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#C89D56] font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Connected Entities ({connectedEntities.length})</span>
            </h3>
            {onExpandConnections && (
              <button
                onClick={() => onExpandConnections(node.id)}
                className="text-[11px] font-mono text-[#C89D56] hover:text-white underline cursor-pointer"
              >
                {isExpanded ? 'Collapse 2-Hop' : 'Expand Network'}
              </button>
            )}
          </div>

          {connectedEntities.length === 0 ? (
            <p className="text-xs text-white/50 italic">No direct connections recorded.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {connectedEntities.map((item, idx) => {
                const targetColor = getCategoryColor(item.node.category);
                return (
                  <button
                    key={`${item.node.id}-${idx}`}
                    onClick={() => onSelectConnectedNode(item.node.id)}
                    className="w-full p-2.5 rounded-xl bg-[#08192A]/50 hover:bg-[#08192A] border border-white/10 hover:border-[#C89D56]/60 transition-all text-left group flex items-center justify-between cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: targetColor }}
                        />
                        <span className="text-xs font-semibold text-white group-hover:text-[#C89D56] transition-colors">
                          {item.node.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 pl-4">
                        <CornerDownRight className="w-2.5 h-2.5 text-[#C89D56]" />
                        <span className="text-amber-200/80">{item.relation}</span>
                        <span>· {item.node.category}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#C89D56] group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Archival Provenance & Sources */}
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#C89D56] font-semibold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Archival Provenance & Citations</span>
          </h3>

          <div className="p-3.5 rounded-xl bg-[#08192A]/60 border border-white/10 space-y-2 text-xs">
            {node.bawsVolume ? (
              <div className="flex items-start gap-2">
                <span className="text-white/50 font-mono text-[10px] uppercase w-20">Volume:</span>
                <span className="text-[#F3E4C9] font-medium">{node.bawsVolume}</span>
              </div>
            ) : null}

            {node.provenanceCitation ? (
              <div className="flex items-start gap-2">
                <span className="text-white/50 font-mono text-[10px] uppercase w-20">Citation:</span>
                <span className="text-[#F3E4C9] font-serif italic">{node.provenanceCitation}</span>
              </div>
            ) : null}

            <div className="flex items-start gap-2">
              <span className="text-white/50 font-mono text-[10px] uppercase w-20">Authority:</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                Babasaheb Ambedkar: Writings and Speeches (BAWS)
              </span>
            </div>

            {node.aliases && node.aliases.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1.5 border-t border-white/10">
                <span className="text-[10px] font-mono text-white/50 w-full mb-1">Archival Aliases:</span>
                {node.aliases.map((alias, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inline AI Response if generated */}
        {aiAnswer && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold font-mono text-[11px]">
              <Sparkles className="w-4 h-4 text-[#C89D56]" />
              <span>Grounded AI Scholar Synthesis</span>
            </div>
            <p className="text-white/90 leading-relaxed font-sans">{aiAnswer}</p>
            {aiCitations.length > 0 && (
              <div className="pt-2 border-t border-emerald-500/20 text-[10px] font-mono text-emerald-200/80">
                <span>Verified Sources: </span>
                {aiCitations.map((c, idx) => (
                  <span key={idx} className="underline mr-2">{c.document_title || c.title || `Doc #${c.document_id}`}</span>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 3. Action Footer */}
      <div className="p-5 border-t border-[#C89D56]/20 bg-[#08192A]/90 space-y-2.5">
        
        {/* Open in Archive Button (if linked document exists or primary treatise) */}
        {linkedDoc && (
          <button
            onClick={() => onOpenDocument && onOpenDocument(linkedDoc)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C89D56] to-[#A87D36] hover:from-[#d8ad66] hover:to-[#b88d46] text-[#0A2947] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.01] cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Archival Volume ↗</span>
          </button>
        )}

        {/* Ask About This Node Button */}
        <button
          onClick={handleAskAboutNode}
          disabled={isAskingAI}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0A2947] hover:bg-[#103A63] border border-[#C89D56]/50 text-[#F3E4C9] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isAskingAI ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C89D56]" />
              <span>Consulting AI Scholar...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#C89D56]" />
              <span>Ask AI About This Entity</span>
            </>
          )}
        </button>

      </div>
    </aside>
  );
};
