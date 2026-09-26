'use client';

import React from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Maximize2, 
  Minimize2, Play, Pause, Scan, Volume2, VolumeX
} from 'lucide-react';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFitGraph: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  isImmersive: boolean;
  onToggleImmersive: () => void;
  isSoundMuted?: boolean;
  onToggleSound?: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitGraph,
  autoRotate,
  onToggleAutoRotate,
  isImmersive,
  onToggleImmersive,
  isSoundMuted = false,
  onToggleSound,
}) => {
  return (
    <div 
      className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-[#D3D4C0] shadow-md text-[#0A2947] select-none"
      role="toolbar"
      aria-label="3D Graph Navigation Controls"
    >
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="p-2 rounded-xl hover:bg-[#FAF7F0] text-[#0A2947]/75 hover:text-[#0A2947] transition-colors cursor-pointer"
        title="Zoom In (+)"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="p-2 rounded-xl hover:bg-[#FAF7F0] text-[#0A2947]/75 hover:text-[#0A2947] transition-colors cursor-pointer"
        title="Zoom Out (-)"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-[#D3D4C0] my-auto" />

      {/* Fit Graph */}
      <button
        onClick={onFitGraph}
        className="p-2 rounded-xl hover:bg-[#FAF7F0] text-[#0A2947]/75 hover:text-[#0A2947] transition-colors cursor-pointer"
        title="Fit All Nodes in View"
        aria-label="Fit graph to view"
      >
        <Scan className="w-4 h-4" />
      </button>

      {/* Reset Camera / Central Ambedkar */}
      <button
        onClick={onResetView}
        className="p-2 rounded-xl hover:bg-[#FAF7F0] text-[#0A2947]/75 hover:text-[#0A2947] transition-colors cursor-pointer"
        title="Reset Camera to Dr. Ambedkar"
        aria-label="Reset view"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-[#D3D4C0] my-auto" />

      {/* Auto Rotate Toggle */}
      <button
        onClick={onToggleAutoRotate}
        className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono ${
          autoRotate 
            ? 'bg-[#0A2947] text-[#FAF7F0] font-bold shadow-xs' 
            : 'hover:bg-[#FAF7F0] text-[#0A2947]/75 hover:text-[#0A2947]'
        }`}
        title={autoRotate ? 'Pause Slow Orbit' : 'Enable Slow Cinematic Orbit'}
        aria-label="Toggle auto rotation"
        aria-pressed={autoRotate}
      >
        {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Orbit</span>
      </button>

      {/* Sound Toggle */}
      {onToggleSound && (
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono ${
            !isSoundMuted 
              ? 'text-[#8B5E3C] hover:bg-[#FAF7F0]' 
              : 'text-[#0A2947]/40 hover:bg-[#FAF7F0]'
          }`}
          title={isSoundMuted ? 'Unmute Museum Sounds' : 'Mute Museum Sounds'}
          aria-label="Toggle museum sound effects"
          aria-pressed={!isSoundMuted}
        >
          {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}

      <div className="w-[1px] h-4 bg-[#D3D4C0] my-auto" />

      {/* Fullscreen / Immersive Mode */}
      <button
        onClick={onToggleImmersive}
        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono ${
          isImmersive
            ? 'bg-[#0A2947] text-[#FAF7F0] border border-[#0A2947] font-bold shadow-xs'
            : 'bg-[#FAF7F0] hover:bg-[#0A2947] hover:text-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0]'
        }`}
        title={isImmersive ? 'Exit Immersive View (Esc)' : 'Enter 3D Immersive Universe'}
        aria-label="Toggle immersive mode"
      >
        {isImmersive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        <span className="font-semibold text-[11px] tracking-wide uppercase">
          {isImmersive ? 'Exit 3D' : 'Immersive 3D'}
        </span>
      </button>
    </div>
  );
};
