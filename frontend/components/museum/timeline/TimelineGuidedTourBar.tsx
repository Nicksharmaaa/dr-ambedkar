'use client';

import React from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, X, Volume2, 
  VolumeX, Sparkles, Compass 
} from 'lucide-react';
import { TimelineEvent } from '@/types/museum';
import { soundEffects } from '@/utils/soundEffects';

interface TimelineGuidedTourBarProps {
  isActive: boolean;
  isPaused: boolean;
  currentEvent: TimelineEvent;
  currentIndex: number;
  totalEvents: number;
  remainingSeconds: number;
  maxSeconds: number;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  onTogglePause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleVoice: () => void;
  onStopTour: () => void;
}

export const TimelineGuidedTourBar: React.FC<TimelineGuidedTourBarProps> = ({
  isActive,
  isPaused,
  currentEvent,
  currentIndex,
  totalEvents,
  remainingSeconds,
  maxSeconds,
  isSpeaking,
  voiceEnabled,
  onTogglePause,
  onPrev,
  onNext,
  onToggleVoice,
  onStopTour
}) => {
  if (!isActive) return null;

  const progressPercent = Math.max(0, Math.min(100, ((maxSeconds - remainingSeconds) / maxSeconds) * 100));

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-in slide-in-from-bottom-6 duration-300 font-dmsans">
      <div className="bg-[#0A2947] text-[#FAF7F0] border-2 border-[#C59A45] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 relative overflow-hidden backdrop-blur-md">
        {/* Subtle Gold Shimmer Bar at Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5E3C] via-[#C59A45] to-[#8B5E3C]" />

        {/* Progress Strip across all stations */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#C59A45] transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / totalEvents) * 100}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Active Station Info */}
          <div className="space-y-1 max-w-md">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#C59A45] text-[#0A2947] text-[10px] font-mono font-black rounded uppercase">
                Station {currentIndex + 1} of {totalEvents}
              </span>
              <span className="px-2 py-0.5 bg-white/10 text-[#F3E4C9] text-[10px] font-mono font-bold rounded">
                {currentEvent.year}
              </span>
              <span className="text-[11px] font-cinzel text-[#F3E4C9]/80 truncate">
                {currentEvent.era}
              </span>
            </div>

            <div className="text-sm sm:text-base font-serif-editorial font-bold text-white truncate">
              {currentEvent.title}
            </div>

            {/* Speaking equalizer bars */}
            {isSpeaking && (
              <div className="flex items-center gap-1.5 pt-0.5 text-xs text-[#C59A45] font-mono">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-[#C59A45] animate-[bounce_0.8s_infinite] h-2 rounded-xs" />
                  <span className="w-1 bg-[#C59A45] animate-[bounce_0.6s_infinite] h-3 rounded-xs" />
                  <span className="w-1 bg-[#C59A45] animate-[bounce_0.9s_infinite] h-1.5 rounded-xs" />
                  <span className="w-1 bg-[#C59A45] animate-[bounce_0.7s_infinite] h-2.5 rounded-xs" />
                </div>
                <span>{"Narrating Babasaheb's Historic Proclamation..."}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {/* Voice Guide Toggle */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onToggleVoice();
              }}
              className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                voiceEnabled ? 'bg-[#C59A45] text-[#0A2947] border-[#F3E4C9]' : 'bg-white/10 text-white border-white/20'
              }`}
              title={voiceEnabled ? 'Mute Voice Narration' : 'Enable Voice Narration'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Prev Station */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onPrev();
              }}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              title="Previous Milestone"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Pause / Resume Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onTogglePause();
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#C59A45] hover:bg-[#d6aa55] text-[#0A2947] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume ({remainingSeconds}s)</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause ({remainingSeconds}s)</span>
                </>
              )}
            </button>

            {/* Next Station */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onNext();
              }}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              title="Next Milestone"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Stop Tour */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onStopTour();
              }}
              className="p-2.5 rounded-2xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-500/40 transition-colors cursor-pointer ml-1"
              title="Exit Memorial Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
