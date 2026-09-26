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
  const iconBtn = 'p-2 rounded-xl text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#FAF7F0] transition-all cursor-pointer';

  return (
    <div
      className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D3D4C0] shadow-sm select-none"
      role="toolbar"
      aria-label="3D Graph Navigation Controls"
    >
      <button onClick={onZoomIn} className={iconBtn} title="Zoom In" aria-label="Zoom in">
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
      <button onClick={onZoomOut} className={iconBtn} title="Zoom Out" aria-label="Zoom out">
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-[#D3D4C0] mx-0.5" />

      <button onClick={onFitGraph} className={iconBtn} title="Fit All Nodes" aria-label="Fit graph">
        <Scan className="w-3.5 h-3.5" />
      </button>
      <button onClick={onResetView} className={iconBtn} title="Reset Camera" aria-label="Reset view">
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-[#D3D4C0] mx-0.5" />

      {/* Auto-rotate / Orbit */}
      <button
        onClick={onToggleAutoRotate}
        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
          autoRotate
            ? 'bg-[#FAF7F0] text-[#8B5E3C] border border-[#D3D4C0] font-bold'
            : 'text-[#0A2947]/70 hover:bg-[#FAF7F0]'
        }`}
        title={autoRotate ? 'Pause 3D Orbit' : 'Start 3D Orbit'}
        aria-label="Toggle auto rotation"
        aria-pressed={autoRotate}
      >
        {autoRotate ? <Pause className="w-3.5 h-3.5 text-[#8B5E3C]" /> : <Play className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline uppercase tracking-wider">Orbit</span>
      </button>

      {/* Sound */}
      {onToggleSound && (
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isSoundMuted 
              ? 'text-red-700 bg-red-50 hover:bg-red-100' 
              : 'text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#FAF7F0]'
          }`}
          title={isSoundMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          aria-label="Toggle sound"
          aria-pressed={!isSoundMuted}
        >
          {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}

      <div className="w-px h-4 bg-[#D3D4C0] mx-0.5" />

      {/* Immersive Fullscreen Mode */}
      <button
        onClick={onToggleImmersive}
        className={`px-3 py-1.5 rounded-xl text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
          isImmersive
            ? 'bg-[#0A2947] text-[#FAF7F0] shadow-xs'
            : 'bg-[#FAF7F0] text-[#0A2947] hover:bg-[#F3E4C9] border border-[#D3D4C0]'
        }`}
        title={isImmersive ? 'Exit Immersive Mode (Esc)' : 'Expand to Immersive 3D'}
        aria-label="Toggle immersive mode"
      >
        {isImmersive ? (
          <>
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline uppercase">Exit</span>
          </>
        ) : (
          <>
            <Maximize2 className="w-3.5 h-3.5 text-[#8B5E3C]" />
            <span className="hidden sm:inline uppercase">Full View</span>
          </>
        )}
      </button>
    </div>
  );
};
