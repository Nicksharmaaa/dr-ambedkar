'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, CornerDownRight } from 'lucide-react';
import { Graph3DNode } from './types';

interface GraphSearchProps {
  nodes: Graph3DNode[];
  onSelectNode: (node: Graph3DNode) => void;
  selectedNodeId: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  person:       '#8B5E3C',
  work:         '#0A2947',
  book:         '#0A2947',
  document:     '#0A2947',
  organization: '#0D6E57',
  institution:  '#0D6E57',
  event:        '#B91C1C',
  concept:      '#B45309',
  place:        '#6D28D9',
  media:        '#C2410C',
};

export const GraphSearch: React.FC<GraphSearchProps> = ({ nodes, onSelectNode, selectedNodeId }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return nodes
      .filter((n) => {
        return (
          n.label.toLowerCase().includes(q) ||
          n.shortDesc?.toLowerCase().includes(q) ||
          n.aliases?.some((a) => a.toLowerCase().includes(q))
        );
      })
      .slice(0, 8);
  }, [nodes, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((p) => (p + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((p) => (p - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectNode(results[selectedIndex]);
        setIsOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const getColor = (cat: string) => CATEGORY_COLORS[cat?.toLowerCase()] || '#C59A45';

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-[#8B5E3C] pointer-events-none" />
        <input
          ref={inputRef}
          id="graph-entity-search-input"
          name="graph_entity_search"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          placeholder="Search entities, treatises, events..."
          className="w-full pl-9 pr-8 py-2 rounded-2xl text-xs text-[#0A2947] placeholder-[#0A2947]/45 bg-white/95 backdrop-blur-md border border-[#D3D4C0] shadow-sm focus:outline-none focus:border-[#C59A45] focus:ring-2 focus:ring-[#C59A45]/20 transition-all font-sans"
          aria-label="Search knowledge graph entities"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-1 rounded-lg text-[#0A2947]/40 hover:text-[#0A2947] cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 py-1 bg-white border-2 border-[#D3D4C0] shadow-xl animate-in fade-in slide-in-from-top-1"
        >
          {results.map((item, idx) => {
            const isHighlighted = idx === selectedIndex;
            const catColor = getColor(item.category);
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectNode(item);
                  setIsOpen(false);
                  setQuery('');
                }}
                className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer border-b border-[#FAF7F0] last:border-b-0 ${
                  isHighlighted ? 'bg-[#FAF7F0] border-l-4 border-l-[#C59A45]' : 'hover:bg-[#FAF7F0]/60'
                }`}
              >
                <div className="space-y-0.5 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="text-xs font-semibold text-[#0A2947] truncate block">
                      {item.label}
                    </span>
                  </div>
                  {item.shortDesc && (
                    <p className="text-[11px] text-[#0A2947]/65 line-clamp-1 pl-4">
                      {item.shortDesc}
                    </p>
                  )}
                </div>

                <div className="text-[10px] font-mono text-[#8B5E3C] uppercase text-right shrink-0">
                  {item.year || item.category}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
