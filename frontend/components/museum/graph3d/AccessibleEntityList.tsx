'use client';

import React, { useState, useMemo } from 'react';
import { Search, ShieldCheck, BookOpen, ExternalLink, Calendar, Filter, X } from 'lucide-react';
import { Graph3DNode } from './types';
import { ArchivalDocument } from '@/types/museum';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';

interface AccessibleEntityListProps {
  nodes: Graph3DNode[];
  onSelectNode: (node: Graph3DNode) => void;
  onOpenDocument?: (doc: ArchivalDocument) => void;
  onClose: () => void;
}

export const AccessibleEntityList: React.FC<AccessibleEntityListProps> = ({
  nodes,
  onSelectNode,
  onOpenDocument,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const filtered = useMemo(() => {
    return nodes.filter((n) => {
      const matchCat = selectedCat === 'ALL' || n.category === selectedCat;
      const q = search.toLowerCase().trim();
      const matchText =
        !q ||
        n.label.toLowerCase().includes(q) ||
        n.shortDesc?.toLowerCase().includes(q) ||
        n.aliases?.some((a) => a.toLowerCase().includes(q));
      return matchCat && matchText;
    });
  }, [nodes, search, selectedCat]);

  return (
    <div 
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 bg-[#08192A]/90 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessible-directory-title"
    >
      <div className="bg-[#0A2947] border border-[#C89D56]/50 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden text-[#FAF7F0]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#C89D56]/30 bg-[#08192A]">
          <div>
            <h2 id="accessible-directory-title" className="text-xl font-serif font-bold text-white">
              Accessible Knowledge Archive Directory
            </h2>
            <p className="text-xs text-white/60 font-sans mt-0.5">
              Screen-reader and keyboard-optimized directory of all verified entities and relationships.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-white/10 bg-[#0A2947]/70 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/50" />
            <input
              id="accessible-entity-filter-input"
              name="entity_filter_query"
              autoComplete="off"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter entities by name, concept, or description..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#08192A] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#C89D56]"
              aria-label="Filter directory"
            />
          </div>

          <select
            id="accessible-entity-category-select"
            name="entity_category_filter"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#08192A] border border-white/20 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#C89D56]"
            aria-label="Filter by category"
          >
            <option value="ALL">All Categories</option>
            <option value="person">People</option>
            <option value="work">Works & Treatises</option>
            <option value="organization">Institutions</option>
            <option value="event">Events</option>
            <option value="concept">Concepts</option>
            <option value="place">Places</option>
            <option value="media">Media</option>
          </select>
        </div>

        {/* Entity List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-white/10 custom-scrollbar">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-sm text-white/50">No entities match your criteria.</p>
          ) : (
            filtered.map((item) => {
              const linkedDoc = item.linkedDocId
                ? ARCHIVE_DOCUMENTS.find((d) => d.id === item.linkedDocId)
                : null;

              return (
                <article
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-[#C89D56] font-bold">
                        {item.category}
                      </span>
                      {item.year && (
                        <span className="text-xs font-mono text-white/50 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.year}</span>
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-white group-hover:text-[#C89D56] transition-colors">
                      {item.label}
                    </h3>

                    <p className="text-xs text-white/80 font-sans leading-relaxed">
                      {item.shortDesc}
                    </p>

                    {item.bawsVolume && (
                      <p className="text-[11px] font-mono text-white/50">
                        Citation: {item.bawsVolume}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectNode(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#C89D56] hover:bg-[#d8ad66] text-[#0A2947] text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      View in 3D
                    </button>

                    {linkedDoc && onOpenDocument && (
                      <button
                        onClick={() => {
                          onOpenDocument(linkedDoc);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#C89D56]" />
                        <span>Archive ↗</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#08192A] text-right text-xs text-white/60 font-mono">
          Showing {filtered.length} of {nodes.length} verified archive entities
        </div>

      </div>
    </div>
  );
};
