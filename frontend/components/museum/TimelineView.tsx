'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Clock, Calendar, MapPin, Quote, ArrowRight, BookOpen, 
  ChevronRight, ChevronLeft, X, ExternalLink, Sparkles, 
  Layers, CheckCircle2, Maximize2, Share2, Copy, Check, Compass,
  LayoutGrid, SlidersHorizontal, Play, Pause, Volume2, Film,
  Eye, Award, ArrowUpRight, Search, Filter
} from 'lucide-react';
import { Language, TimelineEvent, ArchivalDocument, UserMode } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import { TIMELINE_EVENTS, ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';

interface TimelineViewProps {
  language: Language;
  onOpenDocument: (doc: ArchivalDocument) => void;
  onAskAIAboutEvent: (query: string) => void;
  userMode?: UserMode;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  language,
  onOpenDocument,
  onAskAIAboutEvent,
  userMode = 'visitor'
}) => {
  const t = UI_STRINGS[language];
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [timelineMode, setTimelineMode] = useState<'alternating' | 'slideshow' | 'grid'>('alternating');
  const [activeMediaEvent, setActiveMediaEvent] = useState<TimelineEvent | null>(null);
  const [isPlayingMedia, setIsPlayingMedia] = useState<boolean>(false);
  const [mediaTime, setMediaTime] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [popoutEvent, setPopoutEvent] = useState<TimelineEvent | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'photo' | 'document'>('all');
  const [filmGrainEffect, setFilmGrainEffect] = useState<boolean>(true);

  const eras = [
    { id: 'all', label: 'All Eras', span: '1891–1956', desc: 'Complete Chronology', count: 13 },
    { id: 'Early Life & Education', label: 'Early Life & Studies', span: '1891–1923', desc: 'Satara, Columbia & London', count: 2 },
    { id: 'Social Awakening', label: 'Social Awakening', span: '1924–1926', desc: 'Bahishkrit Hitakarini Sabha', count: 1 },
    { id: 'Social Movements', label: 'Civil Rights Movements', span: '1927–1939', desc: 'Mahad Satyagraha & Poona Pact', count: 3 },
    { id: 'Political Life', label: 'Public Statecraft', span: '1940–1946', desc: 'Viceroy Council & 8-Hr Workday', count: 2 },
    { id: 'Constitution & Governance', label: 'Constitution & Republic', span: '1947–1950', desc: 'Drafting Committee & Law Ministry', count: 3 },
    { id: 'Later Life & Philosophy', label: 'Dhamma & Philosophy', span: '1951–1956', desc: 'The Deeksha Revolution', count: 2 },
  ];

  const filteredEvents = TIMELINE_EVENTS.filter((ev) => {
    const eraMatch = selectedEra === 'all' || ev.era === selectedEra;
    const typeMatch = filterType === 'all' || ev.mediaType === filterType;
    return eraMatch && typeMatch;
  });

  const getRelatedDocs = (docIds: string[]) => {
    return ARCHIVE_DOCUMENTS.filter(d => docIds.includes(d.id));
  };

  const handleCopyCitation = (event: TimelineEvent) => {
    soundEffects.playClick();
    const citation = `"${event.title}" (${event.dateString}, ${event.location}). Era: ${event.era}. Dr. B. R. Ambedkar Historical Chronology (1891–1956). Digital Heritage Archive.`;
    navigator.clipboard.writeText(citation);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenMedia = (event: TimelineEvent) => {
    soundEffects.playClick();
    setActiveMediaEvent(event);
    setIsPlayingMedia(true);
    setMediaTime(0);
  };

  const handleCloseMedia = () => {
    soundEffects.playClick();
    setActiveMediaEvent(null);
    setIsPlayingMedia(false);
  };

  // Simulated media playback timer
  useEffect(() => {
    let interval: any;
    if (isPlayingMedia && activeMediaEvent) {
      interval = setInterval(() => {
        setMediaTime(prev => (prev < 90 ? prev + 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingMedia, activeMediaEvent]);

  const scrollToMilestone = (id: string) => {
    soundEffects.playClick();
    const element = document.getElementById(`milestone-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#0A2947] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 space-y-10 font-dmsans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* =========================================================================
            HEADER & EDITORIAL TITLE BAR
            ========================================================================= */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B5E3C] via-[#C59A45] to-[#0A2947]" />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-widest">
                <Compass className="w-4 h-4 text-[#8B5E3C]" />
                <span>EXHIBITION TIMELINE TRACK · 1891–1956</span>
                <span className="text-[#0A2947]/30">·</span>
                <span className="px-2 py-0.5 bg-[#FAF7F0] border border-[#D3D4C0] rounded-md text-[11px] text-[#0A2947] font-mono font-bold">
                  {filteredEvents.length} Milestones
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif-editorial font-bold text-[#0A2947] tracking-tight leading-tight">
                Chronicles of a Revolutionary Life
              </h1>

              <p className="text-sm sm:text-base text-[#0A2947]/75 font-normal leading-relaxed">
                Experience the visual journey of Dr. Bhimrao Ramji Ambedkar through archival photographs, documentary newsreels, and seminal constitutional milestones.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center bg-[#FAF7F0] p-1.5 rounded-2xl border-2 border-[#D3D4C0] shadow-xs">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setTimelineMode('alternating');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    timelineMode === 'alternating'
                      ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs ring-1 ring-[#8B5E3C]'
                      : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                  }`}
                  title="Alternating Milestone Spine"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Timeline Spine</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setTimelineMode('slideshow');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    timelineMode === 'slideshow'
                      ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs ring-1 ring-[#8B5E3C]'
                      : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                  }`}
                  title="Cinematic Slide Corridor"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Cinematic Reel</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setTimelineMode('grid');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    timelineMode === 'grid'
                      ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs ring-1 ring-[#8B5E3C]'
                      : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                  }`}
                  title="Curatorial Matrix Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Gallery Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick-Jump Milestone Scrubber Bar */}
          <div className="mt-8 pt-6 border-t border-[#D3D4C0] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#0A2947]/60">
              <span className="font-cinzel uppercase font-bold text-[#8B5E3C] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8B5E3C]" />
                Interactive Chronological Scrubber
              </span>
              <span>Click any year to jump</span>
            </div>

            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#8B5E3C]/40 scrollbar-track-[#FAF7F0]">
              <div className="flex items-center gap-2 min-w-[760px] py-1">
                {TIMELINE_EVENTS.map((ev, i) => (
                  <button
                    key={ev.id}
                    onClick={() => scrollToMilestone(ev.id)}
                    className="flex-1 py-1.5 px-2 bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] hover:border-[#8B5E3C] rounded-xl text-center group cursor-pointer transition-all hover:scale-105"
                  >
                    <span className="block text-[11px] font-mono font-bold text-[#0A2947] group-hover:text-[#8B5E3C]">
                      {ev.year}
                    </span>
                    <span className="block text-[9px] font-dmsans text-[#0A2947]/60 truncate group-hover:text-[#0A2947]">
                      {ev.title.split(':')[0].substring(0, 14)}..
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Era Filter Badges & Media Filter */}
          <div className="mt-4 pt-4 border-t border-[#D3D4C0]/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Eras */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {eras.map(era => (
                <button
                  key={era.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedEra(era.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedEra === era.id
                      ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs ring-1 ring-[#8B5E3C]'
                      : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947]/80 border border-[#D3D4C0]'
                  }`}
                >
                  <span>{era.label}</span>
                  <span className={`text-[10px] font-mono ${selectedEra === era.id ? 'text-[#F3E4C9]/70' : 'text-[#8B5E3C]'}`}>
                    {era.span}
                  </span>
                </button>
              ))}
            </div>

            {/* Media Type Filter */}
            <div className="flex items-center gap-1.5 shrink-0 bg-[#FAF7F0] p-1 rounded-xl border border-[#D3D4C0]">
              <span className="text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase px-2">Filter:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-montserrat font-bold uppercase transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-[#0A2947] text-[#F3E4C9]' : 'text-[#0A2947]/70'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('video')}
                className={`px-2.5 py-1 rounded-lg text-xs font-montserrat font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'video' ? 'bg-[#0A2947] text-[#F3E4C9]' : 'text-[#0A2947]/70'
                }`}
              >
                <Film className="w-3 h-3 text-[#C59A45]" />
                Videos
              </button>
              <button
                onClick={() => setFilterType('photo')}
                className={`px-2.5 py-1 rounded-lg text-xs font-montserrat font-bold uppercase transition-all cursor-pointer ${
                  filterType === 'photo' ? 'bg-[#0A2947] text-[#F3E4C9]' : 'text-[#0A2947]/70'
                }`}
              >
                Photos
              </button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            VIEW 1: ALTERNATING MILESTONE SPINE (MATCHING REQUESTED UX DESIGN)
            ========================================================================= */}
        {timelineMode === 'alternating' && (
          <div className="relative py-8">
            
            {/* Center Vertical Axis / Road Spine (hidden on small mobile, centered on md+) */}
            <div className="hidden md:block absolute left-1/2 top-4 bottom-8 -translate-x-1/2 w-1 bg-gradient-to-b from-[#8B5E3C] via-[#C59A45] to-[#0A2947] rounded-full shadow-xs" />
            
            {/* Mobile Left Axis */}
            <div className="md:hidden absolute left-5 top-4 bottom-8 w-1 bg-gradient-to-b from-[#8B5E3C] via-[#C59A45] to-[#0A2947] rounded-full" />

            <div className="space-y-12 sm:space-y-16">
              {filteredEvents.map((event, index) => {
                const isEven = index % 2 === 0;
                const displayTitle = language !== 'en' && event.titleLocal?.[language] ? event.titleLocal[language] : event.title;
                const displayDesc = language !== 'en' && event.descriptionLocal?.[language] ? event.descriptionLocal[language] : event.description;
                const relatedDocs = getRelatedDocs(event.relatedDocIds || []);

                return (
                  <div
                    key={event.id}
                    id={`milestone-${event.id}`}
                    className={`relative flex flex-col md:flex-row items-center scroll-mt-28 group ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    
                    {/* Central Glowing Node Milestone Pin */}
                    <div className="absolute left-5 md:left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0A2947] border-3 border-[#C59A45] text-[#F3E4C9] flex items-center justify-center font-mono font-bold text-xs sm:text-sm shadow-md group-hover:scale-110 group-hover:ring-4 group-hover:ring-[#C59A45]/30 transition-all duration-300">
                        {event.mediaType === 'video' ? (
                          <Film className="w-5 h-5 text-[#C59A45] animate-pulse" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className="hidden md:block text-[10px] font-mono font-bold text-[#8B5E3C] mt-1 bg-[#FAF7F0] px-1.5 py-0.5 rounded-md border border-[#D3D4C0]">
                        {event.year}
                      </span>
                    </div>

                    {/* Content Card Side (Half-width on desktop) */}
                    <div className={`w-full md:w-1/2 pl-14 sm:pl-16 md:pl-0 ${
                      isEven ? 'md:pr-12' : 'md:pl-12'
                    }`}>
                      
                      {/* Interactive Visual Card */}
                      <div className="bg-white border-2 border-[#D3D4C0] group-hover:border-[#C59A45] rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                        
                        {/* Visual Image / Video Header Banner */}
                        {event.imageUrl && (
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0A2947]">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            
                            {/* Gradient Vignette Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2947]/90 via-[#0A2947]/30 to-transparent" />

                            {/* Floating Media Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className="px-3 py-1 bg-[#0A2947]/90 backdrop-blur-md text-[#F3E4C9] text-[11px] font-mono font-bold rounded-xl border border-[#C59A45]/60 flex items-center gap-1.5 shadow-md">
                                {event.mediaType === 'video' ? (
                                  <>
                                    <Film className="w-3 h-3 text-[#C59A45]" />
                                    <span>Historical Video Reel</span>
                                  </>
                                ) : (
                                  <>
                                    <Compass className="w-3 h-3 text-[#C59A45]" />
                                    <span>Archival Specimen Plate</span>
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Year & Era Floating Badge */}
                            <div className="absolute top-3 right-3">
                              <span className="px-3 py-1 bg-[#8B5E3C] text-white text-xs font-mono font-black rounded-xl shadow-md border border-[#F3E4C9]/40">
                                {event.year}
                              </span>
                            </div>

                            {/* Play Video / Examine Overlay Trigger */}
                            <button
                              onClick={() => handleOpenMedia(event)}
                              className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/45 transition-colors cursor-pointer group/btn"
                            >
                              <div className="w-14 h-14 rounded-2xl bg-[#0A2947]/90 border-2 border-[#C59A45] text-[#F3E4C9] flex items-center justify-center shadow-lg group-hover/btn:scale-115 transition-transform">
                                {event.mediaType === 'video' ? (
                                  <Play className="w-6 h-6 fill-[#C59A45] text-[#C59A45] ml-0.5" />
                                ) : (
                                  <Eye className="w-6 h-6 text-[#F3E4C9]" />
                                )}
                              </div>
                            </button>

                            {/* Bottom Caption on Image */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-xs font-mono">
                              <span className="flex items-center gap-1 truncate max-w-[200px]">
                                <MapPin className="w-3.5 h-3.5 text-[#C59A45]" />
                                {event.location}
                              </span>
                              <span>{event.dateString}</span>
                            </div>
                          </div>
                        )}

                        {/* Card Text & Highlights Body */}
                        <div className="p-5 sm:p-7 space-y-4">
                          
                          {/* Era & Station Meta */}
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-[#D3D4C0]/70">
                            <span className="font-cinzel uppercase font-bold text-[#8B5E3C] tracking-wider text-[11px]">
                              {event.era}
                            </span>
                            <span className="font-mono text-[#0A2947]/60 text-[11px]">
                              Station #{index + 1}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 
                            onClick={() => handleOpenMedia(event)}
                            className="text-xl sm:text-2xl font-serif-editorial font-bold text-[#0A2947] hover:text-[#8B5E3C] transition-colors cursor-pointer leading-snug"
                          >
                            {displayTitle}
                          </h3>

                          {/* Highlights Chips - Solves "too much text right now" */}
                          {event.highlights && event.highlights.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              {event.highlights.map((point, pIdx) => (
                                <div key={pIdx} className="flex items-start gap-2 text-xs text-[#0A2947]/85 font-dmsans">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 mt-0.5" />
                                  <span className="leading-snug">{point}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Short Concise Description */}
                          <p className="text-xs sm:text-sm text-[#0A2947]/75 font-normal leading-relaxed line-clamp-3">
                            {displayDesc}
                          </p>

                          {/* Historical Proclamation Quote if present */}
                          {event.quote && (
                            <div className="p-3.5 bg-[#FAF7F0] border-l-3 border-[#8B5E3C] rounded-r-xl space-y-1">
                              <div className="flex items-center gap-1 text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase">
                                <Quote className="w-3 h-3" />
                                <span>Historical Proclamation</span>
                              </div>
                              <p className="text-xs font-serif-editorial italic text-[#0A2947] leading-relaxed line-clamp-2">
                                "{event.quote}"
                              </p>
                            </div>
                          )}

                          {/* Primary Documents Available */}
                          {relatedDocs.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase mr-1">
                                Primary Folios:
                              </span>
                              {relatedDocs.map(doc => (
                                <button
                                  key={doc.id}
                                  onClick={() => {
                                    soundEffects.playClick();
                                    onOpenDocument(doc);
                                  }}
                                  className="px-2.5 py-1 bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] rounded-lg text-[11px] font-mono text-[#0A2947] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <BookOpen className="w-3 h-3 text-[#8B5E3C]" />
                                  <span className="truncate max-w-[140px]">{doc.title}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Action Toolbar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#D3D4C0]/70">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenMedia(event)}
                                className="px-3.5 py-1.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                {event.mediaType === 'video' ? <Play className="w-3 h-3 fill-current" /> : <Maximize2 className="w-3 h-3" />}
                                <span>{event.mediaType === 'video' ? 'Watch Newsreel' : 'Examine Folio'}</span>
                              </button>

                              <button
                                onClick={() => onAskAIAboutEvent(`What was the national impact and historical context of "${event.title}" in ${event.year}?`)}
                                className="px-3 py-1.5 bg-white hover:bg-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                                title="Ask Babasaheb AI Scholar"
                              >
                                <Sparkles className="w-3 h-3 text-[#8B5E3C]" />
                                <span>Ask AI</span>
                              </button>
                            </div>

                            <button
                              onClick={() => handleCopyCitation(event)}
                              className="p-1.5 rounded-lg border border-[#D3D4C0] hover:bg-[#FAF7F0] text-[#0A2947] cursor-pointer transition-colors"
                              title="Copy Scholarly Citation"
                            >
                              {copiedId === event.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />}
                            </button>
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* Empty opposite column for symmetric spacing on desktop */}
                    <div className="hidden md:block w-1/2" />

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: CINEMATIC SLIDESHOW CORRIDOR
            ========================================================================= */}
        {timelineMode === 'slideshow' && (
          <div className="space-y-6">
            {filteredEvents.length > 0 && (
              <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#D3D4C0] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 bg-[#0A2947] text-[#F3E4C9] text-xs font-mono font-bold rounded-xl shadow-xs">
                      {filteredEvents[activeEventIndex]?.year}
                    </span>
                    <span className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
                      {filteredEvents[activeEventIndex]?.era}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setActiveEventIndex(prev => (prev > 0 ? prev - 1 : filteredEvents.length - 1));
                      }}
                      className="p-2 rounded-xl border border-[#D3D4C0] hover:bg-[#FAF7F0] text-[#0A2947] cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-[#0A2947]/70">
                      {activeEventIndex + 1} / {filteredEvents.length}
                    </span>
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setActiveEventIndex(prev => (prev < filteredEvents.length - 1 ? prev + 1 : 0));
                      }}
                      className="p-2 rounded-xl border border-[#D3D4C0] hover:bg-[#FAF7F0] text-[#0A2947] cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Active Slide Presentation */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7">
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#0A2947] shadow-md">
                      <img 
                        src={filteredEvents[activeEventIndex]?.imageUrl} 
                        alt={filteredEvents[activeEventIndex]?.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleOpenMedia(filteredEvents[activeEventIndex])}
                        className="absolute inset-0 bg-black/30 hover:bg-black/50 transition-colors flex items-center justify-center cursor-pointer group"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-[#0A2947] border-2 border-[#C59A45] text-[#F3E4C9] flex items-center justify-center group-hover:scale-115 transition-transform shadow-xl">
                          <Play className="w-7 h-7 fill-[#C59A45] text-[#C59A45] ml-1" />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="text-xs font-mono text-[#8B5E3C] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{filteredEvents[activeEventIndex]?.location} · {filteredEvents[activeEventIndex]?.dateString}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947]">
                      {filteredEvents[activeEventIndex]?.title}
                    </h2>

                    {filteredEvents[activeEventIndex]?.highlights && (
                      <div className="space-y-1.5 pt-1">
                        {filteredEvents[activeEventIndex]?.highlights?.map((h, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-[#0A2947]/85">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-[#0A2947]/80 leading-relaxed font-dmsans">
                      {filteredEvents[activeEventIndex]?.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-3">
                      <button
                        onClick={() => handleOpenMedia(filteredEvents[activeEventIndex])}
                        className="px-4 py-2 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Experience Newsreel Reel</span>
                      </button>
                      <button
                        onClick={() => onAskAIAboutEvent(`Explain the significance of "${filteredEvents[activeEventIndex]?.title}" in ${filteredEvents[activeEventIndex]?.year}`)}
                        className="px-4 py-2 bg-white hover:bg-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-bold uppercase transition-colors cursor-pointer"
                      >
                        Ask AI Scholar
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 3: GALLERY GRID MATRIX
            ========================================================================= */}
        {timelineMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <div 
                key={event.id}
                className="bg-white border-2 border-[#D3D4C0] hover:border-[#8B5E3C] rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-[#0A2947] overflow-hidden">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-[#0A2947]/90 text-[#F3E4C9] text-xs font-mono font-bold rounded-lg border border-[#C59A45]/40">
                        {event.year}
                      </span>
                    </div>
                    {event.mediaType === 'video' && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#8B5E3C] text-white text-[10px] font-mono font-bold rounded-md flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        <span>Video</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C]">
                      {event.era}
                    </div>
                    <h3 className="font-serif-editorial font-bold text-lg text-[#0A2947] line-clamp-1 group-hover:text-[#8B5E3C] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-[#0A2947]/75 font-dmsans line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-[#D3D4C0]/50 mt-3">
                  <span className="text-[11px] font-mono text-[#0A2947]/60">
                    {event.location}
                  </span>
                  <button
                    onClick={() => handleOpenMedia(event)}
                    className="text-xs font-montserrat font-bold uppercase text-[#8B5E3C] hover:text-[#0A2947] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Examine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            MULTIMEDIA REEL & SPECIMEN MODAL
            ========================================================================= */}
        {activeMediaEvent && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A2947]/85 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleCloseMedia}
          >
            <div 
              className="bg-white rounded-3xl border-2 border-[#C59A45] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Top Bar */}
              <div className="bg-[#0A2947] text-[#FAF7F0] px-6 py-4 flex items-center justify-between border-b-2 border-[#C59A45]">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#8B5E3C] text-white text-xs font-mono font-bold rounded-lg">
                    {activeMediaEvent.year}
                  </span>
                  <div>
                    <span className="text-[10px] font-cinzel uppercase tracking-wider text-[#F3E4C9] block">
                      ARCHIVAL MEDIA EXHIBIT · {activeMediaEvent.era}
                    </span>
                    <h3 className="font-serif-editorial font-bold text-base sm:text-lg text-white truncate max-w-md">
                      {activeMediaEvent.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilmGrainEffect(!filmGrainEffect)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase border transition-colors cursor-pointer ${
                      filmGrainEffect ? 'bg-[#C59A45] text-[#0A2947] border-[#F3E4C9]' : 'bg-[#FAF7F0]/20 text-white border-white/30'
                    }`}
                    title="Toggle Vintage Film Grain Simulation"
                  >
                    Film Grain: {filmGrainEffect ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={handleCloseMedia}
                    className="p-2 rounded-xl text-white hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
                
                {/* Cinema Player Container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl border-2 border-[#D3D4C0]">
                  <img
                    src={activeMediaEvent.imageUrl}
                    alt={activeMediaEvent.title}
                    className={`w-full h-full object-cover transition-transform duration-1000 ${
                      isPlayingMedia ? 'scale-105 filter contrast-110 brightness-95' : ''
                    } ${filmGrainEffect ? 'sepia-[0.25]' : ''}`}
                  />

                  {/* Simulated Vintage Newsreel Overlay */}
                  {filmGrainEffect && (
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
                  )}

                  {/* Film Header Ticker */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white/80 pointer-events-none">
                    <span className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      HISTORIC REEL · {activeMediaEvent.year}
                    </span>
                    <span className="bg-black/60 px-2.5 py-1 rounded-md">
                      ARCHIVE REG: ARC-{activeMediaEvent.year}-{activeMediaEvent.id.slice(0, 4).toUpperCase()}
                    </span>
                  </div>

                  {/* Bottom Subtitle Caption */}
                  <div className="absolute bottom-16 left-6 right-6 text-center">
                    <div className="inline-block bg-black/80 px-4 py-2 rounded-xl border border-white/20 text-xs sm:text-sm font-dmsans text-[#F3E4C9] max-w-xl mx-auto shadow-lg">
                      {activeMediaEvent.highlights?.[mediaTime % (activeMediaEvent.highlights.length || 1)] || activeMediaEvent.description}
                    </div>
                  </div>

                  {/* Player Controls Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-4 text-white text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          setIsPlayingMedia(!isPlayingMedia);
                        }}
                        className="w-8 h-8 rounded-lg bg-[#C59A45] text-[#0A2947] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                      >
                        {isPlayingMedia ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                      <span>00:{mediaTime.toString().padStart(2, '0')} / {activeMediaEvent.videoDuration || '04:30'}</span>
                    </div>

                    <div className="flex-1 max-w-md h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#C59A45] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (mediaTime / 90) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#C59A45]" />
                      <span className="hidden sm:inline">Restored Audio</span>
                    </div>
                  </div>
                </div>

                {/* Historical Narrative & Details */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D3D4C0] pb-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#0A2947]/70">
                      <MapPin className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      <span>{activeMediaEvent.location}</span>
                      <span>·</span>
                      <span>{activeMediaEvent.dateString}</span>
                    </div>
                    <span className="text-xs font-cinzel font-bold text-[#8B5E3C]">
                      {activeMediaEvent.era}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-[#0A2947]/85 font-dmsans leading-relaxed">
                    {activeMediaEvent.description}
                  </p>

                  {/* Highlights Bullet List */}
                  {activeMediaEvent.highlights && (
                    <div className="p-4 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl space-y-2">
                      <span className="text-[11px] font-cinzel font-bold text-[#8B5E3C] uppercase block">
                        Milestone Significance
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeMediaEvent.highlights.map((h, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#0A2947]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Historical Quote */}
                  {activeMediaEvent.quote && (
                    <div className="p-4 bg-[#FAF7F0] border-l-4 border-[#8B5E3C] rounded-r-2xl space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase">
                        <Quote className="w-3 h-3" />
                        <span>Direct Historical Proclamation</span>
                      </div>
                      <blockquote className="text-sm font-serif-editorial italic text-[#0A2947]">
                        "{activeMediaEvent.quote}"
                      </blockquote>
                      {activeMediaEvent.quoteAttribution && (
                        <div className="text-[11px] font-mono text-[#8B5E3C] text-right font-medium">
                          — {activeMediaEvent.quoteAttribution}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Correlated Primary Documents */}
                  {getRelatedDocs(activeMediaEvent.relatedDocIds || []).length > 0 && (
                    <div className="p-4 bg-white border border-[#D3D4C0] rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-cinzel uppercase font-bold text-[#8B5E3C]">
                        <span>Correlated Primary Treatises</span>
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {getRelatedDocs(activeMediaEvent.relatedDocIds || []).map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => {
                              handleCloseMedia();
                              onOpenDocument(doc);
                            }}
                            className="text-left p-3 bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer group"
                          >
                            <div className="truncate pr-2">
                              <span className="font-serif-editorial font-bold text-[#0A2947] group-hover:text-[#8B5E3C] block truncate">
                                {doc.title}
                              </span>
                              <span className="text-[10px] font-mono text-[#0A2947]/60">
                                {doc.accessionNo} · {doc.year}
                              </span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Scholar Inquiry Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#D3D4C0]">
                    <button
                      onClick={() => {
                        handleCloseMedia();
                        onAskAIAboutEvent(`Provide a detailed curatorial breakdown of "${activeMediaEvent.title}" (${activeMediaEvent.year}) and its lasting impact on modern democracy.`);
                      }}
                      className="px-5 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-[#C59A45]" />
                      <span>Consult Babasaheb AI Scholar</span>
                    </button>

                    <button
                      onClick={() => handleCopyCitation(activeMediaEvent)}
                      className="px-3 py-2 bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] rounded-xl text-xs font-montserrat transition-colors flex items-center gap-1.5 cursor-pointer border border-[#D3D4C0]"
                    >
                      {copiedId === activeMediaEvent.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />}
                      <span className="font-semibold text-[11px]">{copiedId === activeMediaEvent.id ? 'Copied' : 'Cite Station'}</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
