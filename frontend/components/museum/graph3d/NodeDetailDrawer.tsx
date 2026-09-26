'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Calendar, BookOpen, Sparkles, 
  ExternalLink, ChevronRight, ChevronLeft, Layers, 
  Compass, ArrowUpRight, CheckCircle2, FileText, 
  CornerDownRight, Loader2, Award, Bookmark, ArrowRight,
  Minimize2, Maximize2
} from 'lucide-react';
import { Graph3DNode, ConnectedEntitySummary } from './types';
import { ArchivalDocument } from '@/types/museum';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { api } from '@/lib/api';
import { soundEffects } from '@/utils/soundEffects';

interface NodeDetailDrawerProps {
  node: Graph3DNode | null;
  connectedEntities: ConnectedEntitySummary[];
  onClose: () => void;
  onSelectConnectedNode: (nodeId: string) => void;
  onOpenDocument?: (doc: ArchivalDocument) => void;
  onAskAI?: (query: string) => void;
  onExpandConnections?: (nodeId: string) => void;
  isExpanded?: boolean;
  historyStack?: string[];
  onNavigateHistoryBack?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  person: '#C88A58',        // Terracotta / Portrait
  work: '#C5A880',          // Aged Parchment / Treatises
  book: '#C5A880',
  document: '#C5A880',
  organization: '#5C7873',  // Aged Patina Teal / Civic Institutions
  institution: '#5C7873',
  event: '#B45339',         // Historical Saffron-Rust / Movements
  movement: '#B45339',
  concept: '#657D5A',       // Olive Sage / Constitutional Morality
  idea: '#657D5A',
  article: '#657D5A',
  place: '#8B5E3C',         // Muted Bronze Earth / Places
  media: '#D4A373',         // Archival Amber / Media
  figure: '#C88A58',
};

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  connectedEntities,
  onClose,
  onSelectConnectedNode,
  onOpenDocument,
  onAskAI,
  onExpandConnections,
  isExpanded = false,
  historyStack = [],
  onNavigateHistoryBack,
}) => {
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiCitations, setAiCitations] = useState<any[]>([]);
  const [currentConnIndex, setCurrentConnIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Reset connection navigator index whenever focused node changes
  useEffect(() => {
    setCurrentConnIndex(0);
    setAiAnswer(null);
    setAiCitations([]);
  }, [node?.id]);

  if (!node) return null;

  const linkedDoc = node.linkedDocId
    ? ARCHIVE_DOCUMENTS.find((d) => d.id === node.linkedDocId)
    : null;

  const handleAskAboutNode = async () => {
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
      setAiAnswer('The AI Research Assistant is currently indexing archival volumes. Please refer to Babasaheb Ambedkar: Writings and Speeches (BAWS).');
    } finally {
      setIsAskingAI(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    return CATEGORY_COLORS[cat?.toLowerCase()] || '#C89D56';
  };

  const catColor = getCategoryColor(node.category);

  // Connected entity sequential navigation handlers
  const hasConnections = connectedEntities.length > 0;
  const currentConnection = hasConnections ? connectedEntities[currentConnIndex] : null;

  const handleNextConnection = () => {
    if (!hasConnections) return;
    soundEffects.playLineageTransition();
    const nextIdx = (currentConnIndex + 1) % connectedEntities.length;
    setCurrentConnIndex(nextIdx);
    onSelectConnectedNode(connectedEntities[nextIdx].node.id);
  };

  const handlePrevConnection = () => {
    if (!hasConnections) return;
    soundEffects.playLineageTransition();
    if (historyStack.length > 0 && onNavigateHistoryBack) {
      onNavigateHistoryBack();
    } else {
      const prevIdx = (currentConnIndex - 1 + connectedEntities.length) % connectedEntities.length;
      setCurrentConnIndex(prevIdx);
      onSelectConnectedNode(connectedEntities[prevIdx].node.id);
    }
  };

  // Compact Floating Card Mode (keeps 3D graph 100% visible and interactive)
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 z-[10000] w-80 sm:w-96 bg-white/95 backdrop-blur-xl border-2 border-[#D3D4C0] rounded-2xl shadow-2xl p-4 text-[#0A2947] animate-in fade-in slide-in-from-bottom-2"
        role="region"
        aria-label={`Summary for ${node.label}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full ring-2 ring-black/10 shrink-0"
              style={{ backgroundColor: catColor }}
            />
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#8B5E3C]">
              {node.category.toUpperCase()}
            </span>
            {node.year && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947] font-semibold">
                {node.year}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-lg text-[#0A2947]/60 hover:text-[#0A2947] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
              title="Expand Archival Dossier"
              aria-label="Expand dossier"
            >
              <Maximize2 className="w-4 h-4 text-[#8B5E3C]" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#0A2947]/50 hover:text-[#0A2947] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
              title="Close (Esc)"
              aria-label="Close dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          <h3 className="text-base font-serif font-bold text-[#0A2947] leading-snug line-clamp-1">
            {node.label}
          </h3>
          {node.shortDesc && (
            <p className="text-xs text-[#0A2947]/70 line-clamp-2 leading-relaxed">
              {node.shortDesc}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#D3D4C0] flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-[#8B5E3C] font-semibold">
            {connectedEntities.length} direct lineages
          </span>
          <button
            onClick={() => setIsMinimized(false)}
            className="px-3 py-1.5 rounded-xl bg-[#0A2947] hover:bg-[#123B60] text-[#FAF7F0] text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
          >
            <span>Dossier</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside 
      className="fixed inset-y-0 right-0 z-[10000] w-full sm:w-[460px] lg:w-[490px] bg-white/98 backdrop-blur-2xl border-l-2 border-[#D3D4C0] text-[#0A2947] shadow-2xl flex flex-col transition-transform duration-300 ease-out transform translate-x-0"
      aria-label={`Archival Dossier for ${node.label}`}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#D3D4C0] bg-[#FAF7F0]">
        <div className="flex items-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full ring-2 ring-black/10"
            style={{ backgroundColor: catColor }}
          />
          <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#8B5E3C]">
            {node.category.toUpperCase()}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#D3D4C0] text-[#0A2947] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>ARCHIVAL SPECIMEN</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg text-[#0A2947]/50 hover:text-[#0A2947] hover:bg-white transition-colors cursor-pointer"
            title="Minimize to Floating Card"
            aria-label="Minimize dossier"
          >
            <Minimize2 className="w-4 h-4 text-[#8B5E3C]" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#0A2947]/50 hover:text-[#0A2947] hover:bg-white transition-colors cursor-pointer"
            title="Close Dossier (Esc)"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body: Progressive Disclosure */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar bg-white">
        
        {/* Node Archival Image / Specimen Plate */}
        {node.imageUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-[#D3D4C0] aspect-video sm:aspect-16/10 bg-[#FAF7F0] shadow-md group">
            <img
              src={node.imageUrl}
              alt={node.label}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-[#F3E4C9]">
              <span className="flex items-center gap-1 font-semibold">
                <Bookmark className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>Primary Visual Record</span>
              </span>
              <span>{node.year ? `Circa ${node.year}` : 'Historical Provenance'}</span>
            </div>
          </div>
        )}

        {/* 1. ENTITY NAME & METADATA */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2947] leading-tight">
              {node.label}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#0A2947]/70 font-mono">
            {node.year && (
              <span className="flex items-center gap-1 text-[#8B5E3C] font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{node.year}</span>
              </span>
            )}
            {node.date && <span>· {node.date}</span>}
            {node.cluster && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#D3D4C0] text-[#8B5E3C] font-semibold">
                {node.cluster}
              </span>
            )}
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Archival Entity</span>
            </span>
          </div>
        </div>

        {/* 2. SHORT DESCRIPTION */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold">
            Archival Summary
          </h3>
          <p className="text-sm text-[#0A2947]/85 font-sans leading-relaxed">
            {node.shortDesc}
          </p>
        </div>

        {/* 3. KEY FACTS */}
        {node.keyFacts && node.keyFacts.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#D3D4C0]">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>Key Facts</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-[#0A2947]/85 font-sans">
              {node.keyFacts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. HISTORICAL CONTEXT */}
        {(node.historicalContext || node.significance) && (
          <div className="p-4 rounded-xl bg-[#FAF7F0] border-l-4 border-[#8B5E3C] border-y border-r border-[#D3D4C0] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-[#8B5E3C] tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Historical Context</span>
            </div>
            <p className="text-xs text-[#0A2947]/90 leading-relaxed font-sans">
              {node.historicalContext || node.significance}
            </p>
          </div>
        )}

        {/* 5. WHY IT MATTERS */}
        {node.whyItMatters && (
          <div className="space-y-2 pt-2 border-t border-[#D3D4C0]">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold">
              Why It Matters
            </h3>
            <p className="text-xs text-[#0A2947]/85 font-sans leading-relaxed italic">
              "{node.whyItMatters}"
            </p>
          </div>
        )}

        {/* 6. SEQUENTIAL CONNECTED NODE NAVIGATION & RELATIONSHIPS */}
        <div className="space-y-3 pt-3 border-t border-[#D3D4C0]">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Connections ({connectedEntities.length})</span>
            </h3>
            {onExpandConnections && (
              <button
                onClick={() => onExpandConnections(node.id)}
                className="text-[11px] font-mono text-[#0A2947] hover:text-[#8B5E3C] underline cursor-pointer font-semibold"
              >
                {isExpanded ? 'Collapse 2-Hop' : 'Expand Network'}
              </button>
            )}
          </div>

          {/* Sequential Navigator Carousel */}
          {hasConnections && currentConnection && (
            <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8B5E3C]">
                <span className="font-bold uppercase tracking-wider">CONNECTED THROUGH</span>
                <span className="font-bold text-[#0A2947]">
                  {String(currentConnIndex + 1).padStart(2, '0')} / {String(connectedEntities.length).padStart(2, '0')}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wide text-[#8B5E3C] font-bold">
                  {currentConnection.relation.toUpperCase()}
                </div>
                <div className="text-sm font-serif font-bold text-[#0A2947]">
                  {currentConnection.node.label}
                </div>
                <div className="text-[11px] text-[#0A2947]/70 font-sans line-clamp-2">
                  {currentConnection.node.shortDesc}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handlePrevConnection}
                  disabled={currentConnIndex === 0 && historyStack.length === 0}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947] text-[11px] font-mono flex items-center justify-center gap-1 transition-all disabled:opacity-30 cursor-pointer font-semibold"
                  title="Previous connected entity"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>PREVIOUS</span>
                </button>

                <button
                  onClick={handleNextConnection}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-[#0A2947] hover:bg-[#123B60] text-white font-bold text-[11px] font-mono flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                  title="Next connected entity"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Full List of Connections */}
          {connectedEntities.length === 0 ? (
            <p className="text-xs text-[#0A2947]/50 italic">No direct connections recorded.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {connectedEntities.map((item, idx) => {
                const targetColor = getCategoryColor(item.node.category);
                const isCurrent = idx === currentConnIndex;
                return (
                  <button
                    key={`${item.node.id}-${idx}`}
                    onClick={() => {
                      soundEffects.playLineageTransition();
                      setCurrentConnIndex(idx);
                      onSelectConnectedNode(item.node.id);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left group flex items-center justify-between cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-white border-2 border-[#0A2947] shadow-xs'
                        : 'bg-[#FAF7F0] hover:bg-white border border-[#D3D4C0]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: targetColor }}
                        />
                        <span className={`text-xs font-semibold ${isCurrent ? 'text-[#0A2947]' : 'text-[#0A2947]/90 group-hover:text-[#0A2947]'} transition-colors`}>
                          {item.node.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#0A2947]/60 pl-4">
                        <CornerDownRight className="w-2.5 h-2.5 text-[#8B5E3C]" />
                        <span className="text-[#8B5E3C] font-semibold">{item.relation}</span>
                        <span>· {item.node.category}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#0A2947]/30 group-hover:text-[#0A2947] group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. ARCHIVAL SOURCES & PROVENANCE */}
        <div className="space-y-2.5 pt-3 border-t border-[#D3D4C0]">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Archival Sources & Provenance</span>
          </h3>

          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] space-y-2 text-xs">
            {node.bawsVolume && (
              <div className="flex items-start gap-2">
                <span className="text-[#0A2947]/60 font-mono text-[10px] uppercase w-20">Volume:</span>
                <span className="text-[#0A2947] font-semibold">{node.bawsVolume}</span>
              </div>
            )}

            {node.provenanceCitation && (
              <div className="flex items-start gap-2">
                <span className="text-[#0A2947]/60 font-mono text-[10px] uppercase w-20">Citation:</span>
                <span className="text-[#0A2947] font-serif italic">{node.provenanceCitation}</span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="text-[#0A2947]/60 font-mono text-[10px] uppercase w-20">Authority:</span>
              <span className="text-[#8B5E3C] font-mono text-[11px] font-semibold">
                Babasaheb Ambedkar: Writings and Speeches (Govt of Maharashtra)
              </span>
            </div>

            {node.aliases && node.aliases.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1.5 border-t border-[#D3D4C0]">
                <span className="text-[10px] font-mono text-[#0A2947]/60 w-full mb-1">Archival Aliases:</span>
                {node.aliases.map((alias, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#D3D4C0] text-[#0A2947]"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 8. INLINE AI SCHOLAR RESPONSE */}
        {aiAnswer && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold font-mono text-[11px]">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Grounded Archival Scholar Synthesis</span>
            </div>
            <p className="text-emerald-950 leading-relaxed font-sans">{aiAnswer}</p>
            {aiCitations.length > 0 && (
              <div className="pt-2 border-t border-emerald-200 text-[10px] font-mono text-emerald-800">
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
      <div className="p-5 border-t border-[#D3D4C0] bg-[#FAF7F0] space-y-2.5">
        
        {/* Open in Archive Button */}
        {linkedDoc && (
          <button
            onClick={() => {
              soundEffects.playTactileChime();
              if (onOpenDocument) onOpenDocument(linkedDoc);
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C89D56] to-[#A87D36] hover:from-[#d8ad66] hover:to-[#b88d46] text-[#0A2947] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all transform hover:scale-[1.01] cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Archival Volume ↗</span>
          </button>
        )}

        {/* Ask About This Node Button */}
        <button
          onClick={handleAskAboutNode}
          disabled={isAskingAI}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0A2947] hover:bg-[#123B60] text-[#FAF7F0] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {isAskingAI ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C89D56]" />
              <span>Consulting AI Archival Scholar...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#C89D56]" />
              <span>Ask The Archive About This</span>
            </>
          )}
        </button>

      </div>
    </aside>
  );
};
