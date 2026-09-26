'use client';

import React from 'react';
import { FilterCategory } from './types';

interface GraphFiltersProps {
  activeCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { id: FilterCategory; label: string; color: string }[] = [
  { id: 'ALL', label: 'All Entities', color: '#0A2947' },
  { id: 'person', label: 'People', color: '#8B5E3C' },
  { id: 'work', label: 'Works & Treatises', color: '#0A2947' },
  { id: 'organization', label: 'Institutions', color: '#0D6E57' },
  { id: 'event', label: 'Events & Movements', color: '#B91C1C' },
  { id: 'concept', label: 'Concepts', color: '#B45309' },
  { id: 'place', label: 'Places', color: '#6D28D9' },
  { id: 'media', label: 'Media', color: '#C2410C' },
];

export const GraphFilters: React.FC<GraphFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div 
      className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-[#D3D4C0] shadow-md overflow-x-auto max-w-full custom-scrollbar select-none"
      role="tablist"
      aria-label="Filter entities by category"
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const count = categoryCounts[cat.id] ?? (cat.id === 'ALL' ? categoryCounts.total : 0);

        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              isActive
                ? 'bg-[#0A2947] text-[#FAF7F0] font-bold shadow-xs scale-100'
                : 'text-[#0A2947]/75 hover:text-[#0A2947] hover:bg-[#FAF7F0]'
            }`}
          >
            {cat.id !== 'ALL' && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
            )}
            <span>{cat.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#0A2947]/60 border border-[#D3D4C0]'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
