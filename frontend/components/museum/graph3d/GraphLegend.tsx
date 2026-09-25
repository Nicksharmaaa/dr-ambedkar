'use client';

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

const LEGEND_ITEMS = [
  { label: 'Dr. B. R. Ambedkar (Anchor)', color: '#C89D56' },
  { label: 'People / Intellectuals', color: '#3b82f6' },
  { label: 'Works & Treatises', color: '#6366f1' },
  { label: 'Institutions & Parties', color: '#0284c7' },
  { label: 'Events & Movements', color: '#f97316' },
  { label: 'Concepts & Principles', color: '#10b981' },
  { label: 'Places & Historic Sites', color: '#8B5E3C' },
  { label: 'Speeches & Media', color: '#f59e0b' },
];

export const GraphLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-[#0A2947]/85 backdrop-blur-md border border-[#C89D56]/30 shadow-xl overflow-hidden text-[#FAF7F0] select-none text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between gap-3 text-white/80 hover:text-white transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#C89D56]">
          <Info className="w-3.5 h-3.5" />
          <span>Legend</span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-white/60" /> : <ChevronDown className="w-3.5 h-3.5 text-white/60" />}
      </button>

      {isOpen && (
        <div className="p-3 border-t border-white/10 space-y-1.5 animate-in fade-in duration-200">
          {LEGEND_ITEMS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] font-sans text-white/80">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/20"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-white/10 text-[10px] text-white/50 font-mono">
            Particles highlight active 1-hop relationships.
          </div>
        </div>
      )}
    </div>
  );
};
