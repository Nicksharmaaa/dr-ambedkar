'use client';

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

const LEGEND_ITEMS = [
  { label: 'Dr. B. R. Ambedkar (Anchor)', color: '#0A2947' },
  { label: 'People / Contemporaries', color: '#8B5E3C' },
  { label: 'Works & Treatises', color: '#0A2947' },
  { label: 'Institutions & Parties', color: '#0D6E57' },
  { label: 'Events & Movements', color: '#B91C1C' },
  { label: 'Concepts & Principles', color: '#B45309' },
  { label: 'Places & Historic Sites', color: '#6D28D9' },
  { label: 'Speeches & Media', color: '#C2410C' },
];

export const GraphLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-md border-2 border-[#D3D4C0] shadow-md overflow-hidden text-[#0A2947] select-none text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between gap-3 text-[#0A2947]/80 hover:text-[#0A2947] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#8B5E3C] font-semibold">
          <Info className="w-3.5 h-3.5" />
          <span>Legend</span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#0A2947]/60" /> : <ChevronDown className="w-3.5 h-3.5 text-[#0A2947]/60" />}
      </button>

      {isOpen && (
        <div className="p-3 border-t border-[#D3D4C0] space-y-1.5 animate-in fade-in duration-200 bg-white">
          {LEGEND_ITEMS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] font-sans text-[#0A2947]/85">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/10"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-[#D3D4C0] text-[10px] text-[#0A2947]/60 font-mono">
            Directional lines highlight active 1-hop relationships.
          </div>
        </div>
      )}
    </div>
  );
};
