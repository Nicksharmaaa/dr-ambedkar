'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, RotateCcw, FastForward, 
  FileText, ArrowRight, Video, Radio, Mic, Sparkles, Disc
} from 'lucide-react';
import { Language, MediaItem, ArchivalDocument } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import { MEDIA_RECORDS, ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { SoundboardWidget } from './SoundboardWidget';
import { soundEffects } from '@/utils/soundEffects';
import MuseumGrandPavilion from './MuseumGrandPavilion';

interface MediaArchiveViewProps {
  language: Language;
  onOpenDocument: (doc: ArchivalDocument) => void;
}

export const MediaArchiveView: React.FC<MediaArchiveViewProps> = ({
  language,
  onOpenDocument
}) => {
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const [activeMedia, setActiveMedia] = useState<MediaItem>(MEDIA_RECORDS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(24);
  const [transcriptLang, setTranscriptLang] = useState<Language>(language);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const totalDurationSeconds = 1335; // 22:15

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => (prev < totalDurationSeconds ? prev + 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const filteredMedia = MEDIA_RECORDS.filter(m => {
    if (selectedCategory === 'all') return true;
    return m.type === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-10 px-4 sm:px-6 lg:px-8 space-y-10 font-dmsans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Museum Header Bar */}
        <MuseumGrandPavilion
          title={
            <>
              Historic Audio &{' '}
              <span className="font-serif italic font-normal bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
                Voice
              </span>{' '}
              Recordings
            </>
          }
          watermarkIcon={Radio}
        />

        {/* 1. Interactive Soundboard Widget Spotlight */}
        <SoundboardWidget
          onOpenDocument={(docId) => {
            const doc = ARCHIVE_DOCUMENTS.find(d => d.id === docId);
            if (doc) onOpenDocument(doc);
          }}
        />

        {/* 2. Master Full-Length Audioguide Deck */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Deck Audio Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8B5E3C] font-bold">
                <Radio className="w-4 h-4 text-[#E76F51] animate-pulse" />
                <span className="uppercase tracking-wider">{activeMedia.typeLabel}</span>
                <span className="text-[#D3D4C0]">·</span>
                <span>{activeMedia.date}</span>
                <span className="text-[#D3D4C0]">·</span>
                <span>Duration: {activeMedia.duration}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] leading-tight">
                {language !== 'en' && activeMedia.titleLocal?.[language] ? activeMedia.titleLocal[language] : activeMedia.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#0A2947]/80 font-normal leading-relaxed">
                {activeMedia.description}
              </p>

              {/* Scrubber & Controls */}
              <div className="pt-2 space-y-3">
                <div className="space-y-1">
                  <div className="relative w-full h-2.5 bg-[#FAF7F0] border border-[#D3D4C0] rounded-full overflow-hidden cursor-pointer">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8B5E3C] to-[#C89D56] rounded-full transition-all"
                      style={{ width: `${(currentTime / totalDurationSeconds) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#0A2947]/60">
                    <span>{formatTime(currentTime)}</span>
                    <span>{activeMedia.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentTime(Math.max(0, currentTime - 10));
                      }}
                      className="p-2 text-[#0A2947]/70 hover:text-[#0A2947] rounded-xl hover:bg-[#FAF7F0] border border-[#D3D4C0]/60 transition-colors cursor-pointer"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsPlaying(!isPlaying);
                      }}
                      className="w-12 h-12 rounded-2xl bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                      aria-label={isPlaying ? 'Pause Audio' : 'Play Audio'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentTime(Math.min(totalDurationSeconds, currentTime + 10));
                      }}
                      className="p-2 text-[#0A2947]/70 hover:text-[#0A2947] rounded-xl hover:bg-[#FAF7F0] border border-[#D3D4C0]/60 transition-colors cursor-pointer"
                      title="Forward 10s"
                    >
                      <FastForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Frequency Waveform Bar */}
                  <div className="flex items-center gap-1 h-6 px-3 bg-[#FAF7F0] rounded-xl border border-[#D3D4C0]">
                    {[4, 8, 14, 20, 10, 16, 22, 12, 18, 24, 15, 9, 5].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlaying ? 'bg-[#C89D56]' : 'bg-[#D3D4C0]'
                        }`}
                        style={{ height: isPlaying ? `${Math.max(4, (h * (currentTime % 5 + 1)) % 24)}px` : `${h}px` }}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Deck Synchronized Transcript (5 Cols) */}
            <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl p-5 flex flex-col h-[340px]">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#D3D4C0] mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0A2947]">
                  <FileText className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  <span className="font-montserrat font-bold uppercase tracking-wider text-[11px]">Synchronized Transcript</span>
                </div>

                <div className="flex items-center bg-white border border-[#D3D4C0] rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setTranscriptLang('en')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      transcriptLang === 'en' ? 'bg-[#0A2947] text-white' : 'text-[#0A2947]/70'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setTranscriptLang('hi')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      transcriptLang === 'hi' ? 'bg-[#0A2947] text-white' : 'text-[#0A2947]/70'
                    }`}
                  >
                    HI
                  </button>
                  <button
                    onClick={() => setTranscriptLang('mr')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      transcriptLang === 'mr' ? 'bg-[#0A2947] text-white' : 'text-[#0A2947]/70'
                    }`}
                  >
                    MR
                  </button>
                </div>
              </div>

              {/* Transcript Text */}
              <div className="flex-1 overflow-y-auto space-y-3 text-xs sm:text-sm text-[#0A2947] font-serif leading-relaxed pr-2">
                <p className="p-3 bg-white border-l-3 border-[#8B5E3C] rounded-r-xl text-[#0A2947] shadow-2xs">
                  {activeMedia.transcript[transcriptLang] || activeMedia.transcript.en}
                </p>
                <p className="text-[#0A2947]/50 italic text-[11px]">
                  [Archival audio restoration note: Digitized at 24-bit/96kHz high fidelity.]
                </p>
              </div>

              {/* Linked Records */}
              {activeMedia.relatedDocIds.length > 0 && (
                <div className="pt-3 border-t border-[#D3D4C0] flex items-center justify-between text-xs">
                  <span className="text-[#0A2947]/60">Official text folio:</span>
                  <button
                    onClick={() => {
                      const doc = ARCHIVE_DOCUMENTS.find(d => d.id === activeMedia.relatedDocIds[0]);
                      if (doc) onOpenDocument(doc);
                    }}
                    className="text-[#8B5E3C] hover:text-[#0A2947] flex items-center gap-1 font-montserrat font-bold text-[11px] cursor-pointer"
                  >
                    <span>Read Record</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* 3. Media Catalog Filter and List */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl sm:text-2xl text-[#0A2947] font-serif-editorial font-bold">
              Archival Broadcasts & Speeches
            </h3>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Media' },
                { id: 'speech', label: 'Historic Speeches' },
                { id: 'interview', label: 'Interviews' },
                { id: 'historical_recording', label: 'Radio Broadcasts' },
                { id: 'documentary', label: 'Documentaries' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCategory(tab.id);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-montserrat font-bold rounded-xl transition-colors cursor-pointer border ${
                    selectedCategory === tab.id
                      ? 'bg-[#0A2947] text-[#FAF7F0] border-[#0A2947] shadow-xs'
                      : 'bg-white text-[#0A2947] hover:bg-[#FAF7F0] border-[#D3D4C0]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => {
              const isSelected = activeMedia.id === item.id;
              const displayTitle = language !== 'en' && item.titleLocal?.[language] ? item.titleLocal[language] : item.title;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveMedia(item);
                    setIsPlaying(true);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#FAF7F0] border-[#8B5E3C] shadow-md ring-2 ring-[#C89D56]/30'
                      : 'bg-white hover:bg-[#FAF7F0]/60 border-[#D3D4C0] hover:border-[#8B5E3C]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#0A2947]/60 font-mono mb-2">
                      <span className="text-[#8B5E3C] font-bold">{item.typeLabel}</span>
                      <span>{item.duration}</span>
                    </div>

                    <h4 className="text-sm font-serif-editorial font-bold text-[#0A2947] group-hover:text-[#8B5E3C] transition-colors line-clamp-2">
                      {displayTitle}
                    </h4>

                    <p className="text-xs text-[#0A2947]/70 font-dmsans mt-1.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D3D4C0]/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#0A2947]/50">{item.date}</span>
                    <span className="text-[#8B5E3C] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Listen</span>
                      <Play className="w-3 h-3 fill-current" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
