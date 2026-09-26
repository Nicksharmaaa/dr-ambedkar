'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, CornerDownLeft, Sparkles } from 'lucide-react';
import { Graph3DNode } from './types';

interface GraphSearchProps {
  nodes: Graph3DNode[];
  onSelectNode: (node: Graph3DNode) => void;
  selectedNodeId: string | null;
}

export const GraphSearch: React.FC<GraphSearchProps> = ({
  nodes,
  onSelectNode,
  selectedNodeId,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter matching nodes from the actual dataset (NO fake entities)
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return nodes
      .filter((n) => {
        const matchLabel = n.label.toLowerCase().includes(q);
        const matchDesc = n.shortDesc?.toLowerCase().includes(q);
        const matchAlias = n.aliases?.some((a) => a.toLowerCase().includes(q));
        return matchLabel || matchDesc || matchAlias;
      })
      .slice(0, 7);
  }, [nodes, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Click outside listener to close search dropdown
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
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
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

  const getCategoryColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'person': return '#3b82f6';
      case 'work':
      case 'book': return '#6366f1';
      case 'organization': return '#0284c7';
      case 'event': return '#f97316';
      case 'concept': return '#10b981';
      case 'place': return '#8B5E3C';
      case 'media': return '#f59e0b';
      default: return '#C89D56';
    }
  };

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-white/50 pointer-events-none" />
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
          placeholder="Search entities, treatises, institutions..."
          className="w-full pl-9 pr-8 py-2 rounded-2xl bg-[#0A2947]/85 backdrop-blur-md border border-[#C89D56]/40 text-xs text-[#FAF7F0] placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#C89D56] transition-all shadow-lg"
          aria-label="Search knowledge graph entities"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-1 rounded-full text-white/40 hover:text-white"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[#0A2947]/95 backdrop-blur-xl border border-[#C89D56]/40 shadow-2xl overflow-hidden z-50 py-1.5 divide-y divide-white/5 animate-in fade-in slide-in-from-top-1"
        >
          {results.map((item, idx) => {
            const isHighlighted = idx === selectedIndex;
            const catColor = getCategoryColor(item.category);

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectNode(item);
                  setIsOpen(false);
                  setQuery('');
                }}
                className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isHighlighted ? 'bg-[#C89D56]/20 text-white' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <div className="space-y-0.5 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="text-xs font-semibold truncate text-[#FAF7F0]">
                      {item.label}
                    </span>
                    {item.year && (
                      <span className="text-[10px] font-mono text-[#C89D56]">
                        ({item.year})
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/50 truncate font-sans pl-4">
                    {item.shortDesc}
                  </p>
                </div>

                <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                  {item.category}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
