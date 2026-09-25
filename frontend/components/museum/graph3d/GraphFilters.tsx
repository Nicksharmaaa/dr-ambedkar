'use client';

import React from 'react';
import { FilterCategory } from './types';

interface GraphFiltersProps {
  activeCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { id: FilterCategory; label: string; color: string }[] = [
  { id: 'ALL', label: 'All Entities', color: '#FAF7F0' },
  { id: 'person', label: 'People', color: '#3b82f6' },
  { id: 'work', label: 'Works & Treatises', color: '#6366f1' },
  { id: 'organization', label: 'Institutions', color: '#0284c7' },
  { id: 'event', label: 'Events & Movements', color: '#f97316' },
  { id: 'concept', label: 'Concepts', color: '#10b981' },
  { id: 'place', label: 'Places', color: '#8B5E3C' },
  { id: 'media', label: 'Media', color: '#f59e0b' },
];

export const GraphFilters: React.FC<GraphFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div 
      className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0A2947]/85 backdrop-blur-md border border-[#C89D56]/30 shadow-xl overflow-x-auto max-w-full custom-scrollbar select-none"
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
                ? 'bg-[#C89D56] text-[#0A2947] font-bold shadow-md scale-100'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.id !== 'ALL' && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            )}
            <span>{cat.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-[#0A2947]/20 text-[#0A2947]' : 'bg-white/10 text-white/60'
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
