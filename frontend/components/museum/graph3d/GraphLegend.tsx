'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

const LEGEND_ITEMS = [
  { label: 'Dr. B. R. Ambedkar',       color: '#C59A45' },
  { label: 'Works & Treatises',         color: '#0A2947' },
  { label: 'Movements & Events',        color: '#B91C1C' },
  { label: 'Institutions & Parties',    color: '#0D6E57' },
  { label: 'Philosophy & Concepts',     color: '#B45309' },
  { label: 'Contemporaries & Figures',  color: '#8B5E3C' },
  { label: 'Historic Places',           color: '#6D28D9' },
  { label: 'Speeches & Media',          color: '#C2410C' },
];

export const GraphLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden select-none text-xs bg-white/95 backdrop-blur-md border border-[#D3D4C0] shadow-md min-w-[210px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-[#0A2947] hover:text-[#8B5E3C] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#8B5E3C] font-bold">
          <Layers className="w-3.5 h-3.5 text-[#C59A45]" />
          <span>Curatorial Legend</span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-[#0A2947]/50" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#0A2947]/50" />
        )}
      </button>

      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-[#D3D4C0]/70 animate-in fade-in duration-150">
          {LEGEND_ITEMS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs text-[#0A2947]">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
          <div className="pt-2 text-[10px] text-[#0A2947]/60 font-mono border-t border-[#D3D4C0]/60">
            Click any entity to inspect primary sources & relationships.
          </div>
        </div>
      )}
    </div>
  );
};
