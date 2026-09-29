'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, Sparkles, FastForward, 
  ExternalLink, Mic, Disc3, Radio, AudioLines, Music, Award,
  VolumeX, RadioTower
} from 'lucide-react';
import { SOUNDBOARD_CLIPS } from '@/data/interactiveData';
import { soundEffects } from '@/utils/soundEffects';
import { speechController } from '@/utils/speechUtils';
import { Language } from '@/types';
import { UI_STRINGS } from '@/utils/i18n';

interface SoundboardWidgetProps {
  language?: Language;
  onOpenDocument?: (docId: string) => void;
}

export const SoundboardWidget: React.FC<SoundboardWidgetProps> = ({
  language = 'en',
  onOpenDocument
}) => {
  const [activeClipId, setActiveClipId] = useState<string | null>(SOUNDBOARD_CLIPS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);

  const t = UI_STRINGS[language] || UI_STRINGS.en;
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
    soundEffects.playBookOpen();

    const quoteToSpeak = (language !== 'en' && clip.quoteLocal?.[language])
      ? clip.quoteLocal[language]!
      : clip.quote;

    speechController.speak(quoteToSpeak, language || 'en', () => {
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
      const quoteToSpeak = (language !== 'en' && activeClip.quoteLocal?.[language])
        ? activeClip.quoteLocal[language]!
        : activeClip.quote;
      speechController.speak(quoteToSpeak, language || 'en', () => setIsPlaying(false));
    }
  };

  const activeTitle = activeClip.titleLocal?.[language] || activeClip.title;
  const activeEvent = activeClip.eventLocal?.[language] || activeClip.event;
  const activeQuote = activeClip.quoteLocal?.[language] || activeClip.quote;

  return (
    <div className="bg-[#07192C] text-[#FAF7F0] rounded-3xl p-6 sm:p-9 border-2 border-[#C59A45]/40 shadow-2xl relative overflow-hidden font-dmsans">
      
      {/* Antique Brass Corner Accents */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#C59A45] pointer-events-none" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#C59A45] pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#C59A45] pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#C59A45] pointer-events-none" />

      {/* Ambient archival warmth */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C59A45]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B5E3C]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header with On-Air Tube Beacon */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C59A45]/30">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-[#C59A45] to-[#D4AF37] text-[#0A2947] rounded-2xl shadow-md border border-[#F3E4C9]/40 relative">
            <Radio className="w-6 h-6 animate-pulse" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-mono font-bold">
                {t.soundboardBadge || "Archival Broadcasts & Gramophone Recordings · 1930–1956"}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider ${
                isPlaying ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-white/10 text-white/50'
              }`}>
                {isPlaying ? '● ON AIR' : '○ STANDBY'}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif-editorial font-bold tracking-tight text-white mt-0.5">
              {t.soundboardTitle || "Voice of Babasaheb Soundboard"}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#F3E4C9]/70 hidden sm:inline">{t.playbackSpeed || "Speed"}:</span>
          <button
            onClick={handleSpeedToggle}
            className="px-3.5 py-1.5 bg-[#FAF7F0]/15 hover:bg-[#FAF7F0]/25 text-[#FAF7F0] rounded-xl text-xs font-mono font-bold transition-all border border-[#C59A45]/40 cursor-pointer shadow-xs"
            title={t.playbackSpeed || "Playback Speed"}
          >
            {playbackSpeed}x {t.playbackSpeed || "Speed"}
          </button>
        </div>
      </div>

      {/* Main Gramophone Turntable Player Bar */}
      <div className="relative z-10 my-6 p-6 sm:p-8 rounded-3xl bg-[#FAF7F0] text-[#0A2947] border-2 border-[#C59A45] shadow-2xl overflow-hidden">
        
        {/* Animated Vinyl Disc + Sound Waveform Bars */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-5 pb-4 border-b border-[#D3D4C0]">
          
          {/* Vinyl & Metadata Info */}
          <div className="flex items-center gap-4">
            {/* Spinning Golden Vinyl Record Disc */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <div 
                className={`w-full h-full rounded-full bg-gradient-to-tr from-[#1A1A1A] via-[#2D2D2D] to-[#111111] border-2 border-[#C59A45] shadow-lg flex items-center justify-center ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '3s' }}
              >
                {/* Vinyl Grooves */}
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-[#C59A45]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0A2947]" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#0A2947] text-[#F3E4C9] text-xs font-mono font-bold">
                  {activeClip.year}
                </span>
                <span className="text-xs font-mono font-bold text-[#8B5E3C] uppercase tracking-wide">
                  {activeEvent}
                </span>
              </div>
              <h4 className="text-xl sm:text-2xl font-serif-editorial font-bold text-[#0A2947] mt-1">
                {activeTitle}
              </h4>
            </div>
          </div>

          {/* Interactive animated audio wave visualizer */}
          <div className="flex items-end gap-1.5 h-12 px-4 py-1.5 bg-white rounded-2xl border border-[#D3D4C0] shrink-0 self-start md:self-auto">
            {[45, 75, 30, 95, 60, 100, 50, 85, 40, 90, 65, 75, 40, 80].map((height, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.max(20, (height * Math.random()) + 20)}%` : '20%',
                  backgroundColor: isPlaying ? (i % 2 === 0 ? '#C59A45' : '#8B5E3C') : '#D3D4C0',
                  opacity: isPlaying ? 1 : 0.5
                }}
              />
            ))}
          </div>
        </div>

        {/* Live synced quote preview in historical manuscript styling */}
        <blockquote className="text-sm sm:text-base text-[#0A2947] font-serif-editorial italic mb-5 leading-relaxed bg-[#F3E4C9]/60 p-4 sm:p-5 rounded-2xl border border-[#D3D4C0] shadow-2xs">
          &quot;{activeQuote}&quot;
        </blockquote>

        {/* Playback Scrub Bar */}
        <div className="w-full bg-[#D3D4C0] h-2.5 rounded-full overflow-hidden mb-4">
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
              title={isPlaying ? t.stopAudio : t.listenSpeech}
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

            <span className="text-xs font-mono text-[#0A2947] font-bold">
              {isPlaying ? (t.askingQuestion || 'Broadcasting Historical Audio...') : (t.listenSpeech || 'Audio Ready · Click to Play')}
            </span>
          </div>

          {onOpenDocument && (
            <button
              onClick={() => onOpenDocument(activeClip.fullDocId)}
              className="text-xs font-montserrat font-bold text-[#8B5E3C] hover:text-[#0A2947] hover:underline flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <span>{t.fullSpeechDoc || 'Examine Folio Transcript'}</span>
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
          const clipTitle = clip.titleLocal?.[language] || clip.title;
          const clipEvent = clip.eventLocal?.[language] || clip.event;

          return (
            <button
              key={clip.id}
              onClick={() => handlePlayClip(clip.id)}
              className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-start justify-between gap-3 group cursor-pointer ${
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
                <h5 className={`font-serif-editorial font-bold text-base line-clamp-1 transition-colors ${
                  isThisActive ? 'text-[#0A2947]' : 'text-white group-hover:text-[#D4AF37]'
                }`}>
                  {clipTitle}
                </h5>
                <p className={`text-xs line-clamp-1 ${
                  isThisActive ? 'text-[#0A2947]/75' : 'text-[#FAF7F0]/70'
                }`}>
                  {clipEvent}
                </p>
              </div>

              <div className={`p-2.5 rounded-xl shrink-0 transition-colors shadow-xs ${
                isThisPlaying 
                  ? 'bg-[#C59A45] text-[#0A2947] animate-pulse' 
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

export default SoundboardWidget;

