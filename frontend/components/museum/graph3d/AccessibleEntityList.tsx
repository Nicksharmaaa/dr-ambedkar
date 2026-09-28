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

const CATEGORY_COLORS: Record<string, string> = {
  person: '#C88A58',
  work: '#C5A880',
  book: '#C5A880',
  document: '#C5A880',
  organization: '#5C7873',
  institution: '#5C7873',
  event: '#B45339',
  concept: '#657D5A',
  place: '#8B5E3C',
  media: '#D4A373',
};

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
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessible-directory-title"
    >
      <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden text-[#0A2947]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D3D4C0] bg-[#FAF7F0]">
          <div>
            <h2 id="accessible-directory-title" className="text-xl font-serif font-bold text-[#0A2947]">
              Accessible Knowledge Archive Directory
            </h2>
            <p className="text-xs text-[#0A2947]/70 font-sans mt-0.5">
              Screen-reader and keyboard-optimized directory of all verified entities and relationships.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#0A2947]/50 hover:text-[#0A2947] hover:bg-white transition-colors cursor-pointer"
            aria-label="Close directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-[#D3D4C0] bg-[#FAF7F0]/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8B5E3C]" />
            <input
              id="accessible-entity-filter-input"
              name="entity_filter_query"
              autoComplete="off"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter entities by name, concept, or description..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#D3D4C0] text-xs text-[#0A2947] placeholder-[#0A2947]/50 focus:outline-none focus:ring-1 focus:ring-[#0A2947]"
              aria-label="Filter directory"
            />
          </div>

          <select
            id="accessible-entity-category-select"
            name="entity_category_filter"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#D3D4C0] text-xs font-mono text-[#0A2947] focus:outline-none focus:ring-1 focus:ring-[#0A2947]"
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
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#D3D4C0]/60 custom-scrollbar bg-white">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-sm text-[#0A2947]/50">No entities match your criteria.</p>
          ) : (
            filtered.map((item) => {
              const linkedDoc = item.linkedDocId
                ? ARCHIVE_DOCUMENTS.find((d) => d.id === item.linkedDocId)
                : null;
              const catColor = CATEGORY_COLORS[item.category?.toLowerCase()] || '#8B5E3C';

              return (
                <article
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#D3D4C0] font-bold"
                        style={{ color: catColor }}
                      >
                        {item.category}
                      </span>
                      {item.year && (
                        <span className="text-xs font-mono text-[#8B5E3C] font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.year}</span>
                        </span>
                      )}
                      <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors">
                      {item.label}
                    </h3>

                    <p className="text-xs text-[#0A2947]/75 font-sans leading-relaxed">
                      {item.shortDesc}
                    </p>

                    {item.provenanceCitation && (
                      <div className="text-[11px] text-[#8B5E3C] font-serif italic pt-1">
                        Citation: {item.provenanceCitation}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectNode(item);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#0A2947] hover:text-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0] text-xs font-mono font-semibold transition-all cursor-pointer shadow-2xs"
                    >
                      Focus in 3D
                    </button>

                    {linkedDoc && (
                      <button
                        onClick={() => {
                          if (onOpenDocument) onOpenDocument(linkedDoc);
                          onClose();
                        }}
                        className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#0A2947] border border-[#D3D4C0] text-xs transition-colors cursor-pointer"
                        title="Open Primary Archival Volume"
                        aria-label={`Open archival document for ${item.label}`}
                      >
                        <BookOpen className="w-4 h-4 text-[#8B5E3C]" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D3D4C0] bg-[#FAF7F0] flex items-center justify-between text-xs text-[#0A2947]/60 font-mono">
          <span>Showing {filtered.length} of {nodes.length} verified entities</span>
          <span>Press ESC to close</span>
        </div>

      </div>
    </div>
  );
};
