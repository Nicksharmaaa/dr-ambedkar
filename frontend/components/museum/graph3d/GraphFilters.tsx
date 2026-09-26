'use client';

import React from 'react';
import { FilterCategory } from './types';

interface GraphFiltersProps {
  activeCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { id: FilterCategory; label: string; color: string }[] = [
  { id: 'ALL',          label: 'All Entities', color: '#C59A45' },
  { id: 'person',       label: 'People',       color: '#8B5E3C' },
  { id: 'work',         label: 'Works',        color: '#0A2947' },
  { id: 'organization', label: 'Institutions', color: '#0D6E57' },
  { id: 'event',        label: 'Events',       color: '#B91C1C' },
  { id: 'concept',      label: 'Philosophy',   color: '#B45309' },
  { id: 'place',        label: 'Places',       color: '#6D28D9' },
  { id: 'media',        label: 'Speeches',     color: '#C2410C' },
];

export const GraphFilters: React.FC<GraphFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div
      className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D3D4C0] shadow-sm overflow-x-auto max-w-full select-none"
      role="tablist"
      aria-label="Filter entities by curatorial category"
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
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#0A2947] text-[#FAF7F0] shadow-xs'
                : 'text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#FAF7F0]'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200"
              style={{
                backgroundColor: cat.color,
                boxShadow: isActive ? `0 0 6px ${cat.color}` : 'none',
              }}
            />
            <span className="font-semibold">{cat.label}</span>
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  isActive
                    ? 'bg-white/20 text-[#FAF7F0]'
                    : 'bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947]/70'
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
