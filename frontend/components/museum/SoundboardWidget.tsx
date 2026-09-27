'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, Sparkles, FastForward, 
  ExternalLink, Mic, Disc3, Radio, AudioLines, Music, Award
} from 'lucide-react';
import { SOUNDBOARD_CLIPS } from '@/data/interactiveData';
import { soundEffects } from '@/utils/soundEffects';
import { speechController } from '@/utils/speechUtils';

interface SoundboardWidgetProps {
  onOpenDocument?: (docId: string) => void;
}

export const SoundboardWidget: React.FC<SoundboardWidgetProps> = ({
  onOpenDocument
}) => {
  const [activeClipId, setActiveClipId] = useState<string | null>(SOUNDBOARD_CLIPS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);

  const activeClip = SOUNDBOARD_CLIPS.find(c => c.id === activeClipId) || SOUNDBOARD_CLIPS[0];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            speechController.stop();
            return 0;
          }
          return prev + 2 * playbackSpeed;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const handlePlayClip = (clipId: string) => {
    soundEffects.playClick();
    if (activeClipId === clipId && isPlaying) {
      // Pause
      setIsPlaying(false);
      speechController.stop();
      return;
    }

    const clip = SOUNDBOARD_CLIPS.find(c => c.id === clipId);
    if (!clip) return;

    setActiveClipId(clipId);
    setProgress(0);
    setIsPlaying(true);

    speechController.speak(clip.quote, 'en', () => {
      setIsPlaying(false);
      setProgress(100);
    });
  };

  const handleSpeedToggle = () => {
    soundEffects.playClick();
    const speeds = [0.8, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    
    if (isPlaying && activeClip) {
      speechController.stop();
      speechController.speak(activeClip.quote, 'en', () => setIsPlaying(false));
    }
  };

  return (
    <div className="bg-[#0A2947] text-[#FAF7F0] rounded-3xl p-6 sm:p-9 border-2 border-[#C59A45]/40 shadow-2xl relative overflow-hidden font-dmsans">
      
      {/* Antique Brass Corner Accents */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#C59A45]/60 pointer-events-none" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#C59A45]/60 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#C59A45]/60 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#C59A45]/60 pointer-events-none" />

      {/* Ambient archival warmth */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C59A45]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B5E3C]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C59A45]/30">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-[#C59A45] to-[#D4AF37] text-[#0A2947] rounded-2xl shadow-md border border-[#F3E4C9]/40">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-cinzel font-bold">
              Archival Broadcasts & Gramophone Recordings · 1930–1956
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif-editorial font-bold tracking-tight text-white">
              Voice of Babasaheb Soundboard
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#F3E4C9]/70 hidden sm:inline">Speed:</span>
          <button
            onClick={handleSpeedToggle}
            className="px-3.5 py-1.5 bg-[#FAF7F0]/15 hover:bg-[#FAF7F0]/25 text-[#FAF7F0] rounded-xl text-xs font-mono font-bold transition-all border border-[#C59A45]/40 cursor-pointer shadow-xs"
            title="Playback Speed"
          >
            {playbackSpeed}x Speed
          </button>
        </div>
      </div>

      {/* Main Active Player Bar (Rich tactile parchment console) */}
      <div className="relative z-10 my-6 p-6 sm:p-7 rounded-2xl bg-[#FAF7F0] text-[#0A2947] border-2 border-[#C59A45] shadow-xl overflow-hidden">
        
        {/* Animated Sound Waveform Bars and Clip Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#D3D4C0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#0A2947] text-[#F3E4C9] text-xs font-mono font-bold">
                {activeClip.year}
              </span>
              <span className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wide">
                {activeClip.event}
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-serif-editorial font-bold text-[#0A2947] mt-1">
              {activeClip.title}
            </h4>
          </div>

          {/* Interactive animated wave visualizer */}
          <div className="flex items-end gap-1.5 h-10 px-3 py-1 bg-white rounded-xl border border-[#D3D4C0] shrink-0">
            {[45, 75, 30, 95, 60, 100, 50, 85, 40, 90, 65, 75].map((height, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.max(20, (height * Math.random()) + 20)}%` : '25%',
                  backgroundColor: isPlaying ? (i % 2 === 0 ? '#C59A45' : '#8B5E3C') : '#D3D4C0',
                  opacity: isPlaying ? 1 : 0.6
                }}
              />
            ))}
          </div>
        </div>

        {/* Live synced quote preview in elegant historical typography */}
        <blockquote className="text-sm sm:text-base text-[#0A2947] font-serif italic mb-5 leading-relaxed bg-[#F3E4C9]/60 p-4 rounded-xl border border-[#D3D4C0]">
          "{activeClip.quote}"
        </blockquote>

        {/* Playback Scrub Bar */}
        <div className="w-full bg-[#D3D4C0] h-2 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-[#C59A45] via-[#8B5E3C] to-[#0A2947] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Player controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePlayClip(activeClip.id)}
              className="p-3.5 bg-[#0A2947] hover:bg-[#8B5E3C] active:scale-95 text-[#F3E4C9] rounded-2xl transition-all shadow-md flex items-center justify-center cursor-pointer border border-[#C59A45]"
              title={isPlaying ? "Pause Speech" : "Play Speech Audio"}
            >
              {isPlaying && activeClipId === activeClip.id ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                setProgress(0);
                if (isPlaying) handlePlayClip(activeClip.id);
              }}
              className="p-3 bg-white hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] rounded-xl transition-all cursor-pointer"
              title="Restart Audio"
            >
              <RotateCcw className="w-4 h-4 text-[#8B5E3C]" />
            </button>

            <span className="text-xs font-mono text-[#0A2947]/70 font-semibold">
              {isPlaying ? 'Broadcasting Historical Audio...' : 'Audio Ready · Click to Play'}
            </span>
          </div>

          {onOpenDocument && (
            <button
              onClick={() => onOpenDocument(activeClip.fullDocId)}
              className="text-xs font-montserrat font-bold text-[#8B5E3C] hover:text-[#0A2947] hover:underline flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <span>Examine Folio Transcript</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Grid of Soundboard Clips */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {SOUNDBOARD_CLIPS.map((clip) => {
          const isThisActive = activeClipId === clip.id;
          const isThisPlaying = isThisActive && isPlaying;

          return (
            <button
              key={clip.id}
              onClick={() => handlePlayClip(clip.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start justify-between gap-3 group cursor-pointer ${
                isThisActive
                  ? 'bg-[#FAF7F0] text-[#0A2947] border-[#C59A45] shadow-lg ring-2 ring-[#C59A45]/30'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 hover:border-[#C59A45]/50 text-[#FAF7F0]'
              }`}
            >
              <div className="space-y-1">
                <span className={`text-[10px] font-mono uppercase font-bold block ${
                  isThisActive ? 'text-[#8B5E3C]' : 'text-[#D4AF37]'
                }`}>
                  {clip.year} · {clip.duration}
                </span>
                <h5 className={`font-serif-editorial font-bold text-sm line-clamp-1 transition-colors ${
                  isThisActive ? 'text-[#0A2947]' : 'text-white group-hover:text-[#D4AF37]'
                }`}>
                  {clip.title}
                </h5>
                <p className={`text-xs line-clamp-1 ${
                  isThisActive ? 'text-[#0A2947]/75' : 'text-[#FAF7F0]/70'
                }`}>
                  {clip.event}
                </p>
              </div>

              <div className={`p-2.5 rounded-xl shrink-0 transition-colors shadow-xs ${
                isThisPlaying 
                  ? 'bg-[#C59A45] text-[#0A2947]' 
                  : isThisActive
                    ? 'bg-[#0A2947] text-[#F3E4C9]'
                    : 'bg-white/20 group-hover:bg-[#C59A45] group-hover:text-[#0A2947] text-white'
              }`}>
                {isThisPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
