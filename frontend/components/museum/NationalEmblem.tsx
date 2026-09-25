'use client';

import React from 'react';

export const NationalEmblem: React.FC<{ className?: string }> = ({ className = "h-14 w-auto" }) => {
  return (
    <svg 
      viewBox="0 0 100 130" 
      fill="currentColor" 
      className={className} 
      aria-label="State Emblem of India"
    >
      {/* Three Lions Representation */}
      <g fill="currentColor">
        {/* Center Lion Head */}
        <circle cx="50" cy="22" r="9" />
        <ellipse cx="50" cy="38" rx="14" ry="12" />
        <rect x="44" y="24" width="12" height="6" rx="2" fill="#fff" />
        <circle cx="47" cy="21" r="1.5" fill="#fff" />
        <circle cx="53" cy="21" r="1.5" fill="#fff" />
        
        {/* Left Lion */}
        <circle cx="33" cy="26" r="7" />
        <ellipse cx="33" cy="40" rx="9" ry="10" />
        <circle cx="31" cy="25" r="1.2" fill="#fff" />

        {/* Right Lion */}
        <circle cx="67" cy="26" r="7" />
        <ellipse cx="67" cy="40" rx="9" ry="10" />
        <circle cx="69" cy="25" r="1.2" fill="#fff" />

        {/* Lion Manes & Shoulder details */}
        <path d="M22 48 Q 50 56 78 48 L 74 62 Q 50 66 26 62 Z" />

        {/* Abacus platform */}
        <rect x="18" y="66" width="64" height="12" rx="2" />
        
        {/* Ashoka Chakra in center of abacus */}
        <circle cx="50" cy="72" r="5" fill="#fff" />
        <circle cx="50" cy="72" r="2" fill="currentColor" />
        {/* Bull on right, Horse on left */}
        <ellipse cx="32" cy="72" rx="4" ry="2.5" fill="#fff" />
        <ellipse cx="68" cy="72" rx="4" ry="2.5" fill="#fff" />

        {/* Bell-shaped lotus base */}
        <path d="M26 80 Q 50 78 74 80 L 80 94 Q 50 100 20 94 Z" />
        <path d="M30 94 Q 50 97 70 94 L 74 100 Q 50 102 26 100 Z" />

        {/* Satyameva Jayate (सत्यमेव जयते) in Devanagari script base banner */}
        <text 
          x="50" 
          y="114" 
          textAnchor="middle" 
          fontSize="9.5" 
          fontFamily="serif" 
          fontWeight="bold" 
          letterSpacing="0.5"
        >
          सत्यमेव जयते
        </text>
      </g>
    </svg>
  );
};
