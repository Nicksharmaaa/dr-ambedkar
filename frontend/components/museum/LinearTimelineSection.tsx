'use client';

import React, { useState } from 'react';
import { 
  Compass, ArrowRight, Calendar, MapPin, X, BookOpen, 
  ExternalLink, Sparkles, Copy, Check, Quote, Camera, Layers, CheckCircle2
} from 'lucide-react';
import { Language, ArchivalDocument, TimelineEvent } from '@/types/museum';
import { TIMELINE_EVENTS, ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';

interface LinearTimelineSectionProps {
  language: Language;
  onOpenDocument: (doc: ArchivalDocument) => void;
  onAskAIAboutEvent: (query: string) => void;
}

export const LinearTimelineSection: React.FC<LinearTimelineSectionProps> = ({
  language,
  onOpenDocument,
  onAskAIAboutEvent
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineEvent>(TIMELINE_EVENTS[0]);
  const [selectedEpoch, setSelectedEpoch] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const epochs = [
    { id: 'all', label: 'All Eras (1891–1956)', years: 'Complete Chronology' },
    { id: 'Early Life & Education', label: 'Scholarly Foundations', years: '1891–1923' },
    { id: 'Social Movements', label: 'Civil Rights & Satyagrahas', years: '1924–1939' },
    { id: 'Constitution & Governance', label: 'Drafting the Republic', years: '1940–1950' },
    { id: 'Later Life & Philosophy', label: 'The Dhamma Revolution', years: '1951–1956' }
  ];

  const filteredEvents = TIMELINE_EVENTS.filter((ev) => {
    if (selectedEpoch === 'all') return true;
    return ev.era === selectedEpoch;
  });

  const handleOpenMilestone = (ev: TimelineEvent) => {
    soundEffects.playClick();
    setSelectedMilestone(ev);
  };

  const handleCopyCitation = (ev: TimelineEvent) => {
    soundEffects.playClick();
    const text = `Dr. B. R. Ambedkar Chronology: ${ev.year} - ${ev.title} (${ev.dateString}, ${ev.location}). Dr. B. R. Ambedkar Digital Heritage Archive.`;
    navigator.clipboard.writeText(text);
    setCopiedId(ev.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRelatedDocs = (docIds: string[]) => {
    return ARCHIVE_DOCUMENTS.filter(d => docIds.includes(d.id));
  };

  const relatedDocs = getRelatedDocs(selectedMilestone.relatedDocIds || []);

  return (
    <section id="main-timeline-section" className="scroll-mt-24 space-y-8 font-dmsans">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 border-[#D3D4C0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-widest">
            <Compass className="w-4 h-4 text-[#8B5E3C]" />
            <span>EXHIBITION TIMELINE CORRIDOR · 1891–1956</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            Chronicles of a Revolutionary Life
          </h2>
          <p className="text-xs sm:text-sm text-[#0A2947]/75 font-normal max-w-2xl">
            Walk through the decisive historical epochs of Dr. Ambedkar's journey. Select any milestone on the timeline corridor to examine primary manuscripts, photographs, and constitutional debates.
          </p>
        </div>

        {/* Epoch Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#D3D4C0] shadow-xs">
          {epochs.map(epoch => (
            <button
              key={epoch.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedEpoch(epoch.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedEpoch === epoch.id
                  ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs'
                  : 'text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#FAF7F0]'
              }`}
            >
              {epoch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Corridor Box */}
      <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Horizontal Scrollable Station Track */}
        <div className="relative overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#8B5E3C]/40 scrollbar-track-[#FAF7F0]">
          <div className="relative min-w-[980px] px-4 pt-6 pb-4">
            
            {/* Elegant Historical Spine Line */}
            <div className="absolute top-10 left-8 right-8 h-1 bg-gradient-to-r from-[#8B5E3C] via-[#0A2947] to-[#8B5E3C] rounded-full opacity-60" />

            {/* Milestones Horizontal Array */}
            <div className="flex justify-between items-start relative z-10">
              {filteredEvents.map((item, idx) => {
                const isSelected = selectedMilestone.id === item.id;
                const displayTitle = language !== 'en' && item.titleLocal?.[language] ? item.titleLocal[language] : item.title;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleOpenMilestone(item)}
                    className="flex flex-col items-center group cursor-pointer w-28 text-center shrink-0 px-1 focus:outline-none transition-all"
                    aria-label={`Milestone ${item.year}: ${displayTitle}`}
                  >
                    {/* Year Tag */}
                    <span className={`text-xs font-mono font-bold tracking-tight mb-2.5 transition-all ${
                      isSelected 
                        ? 'text-[#8B5E3C] scale-125 font-black' 
                        : 'text-[#0A2947]/80 group-hover:text-[#8B5E3C]'
                    }`}>
                      {item.year}
                    </span>

                    {/* Historical Station Badge */}
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                        isSelected 
                          ? 'bg-[#0A2947] border-[#8B5E3C] text-[#F3E4C9] shadow-md ring-4 ring-[#F3E4C9] scale-110' 
                          : 'bg-[#FAF7F0] border-[#D3D4C0] text-[#0A2947] group-hover:border-[#8B5E3C] group-hover:bg-[#F3E4C9]'
                      }`}>
                        <span className="text-[11px] font-cinzel font-bold">{item.year.toString().slice(-2)}</span>
                      </div>
                    </div>

                    {/* Milestone Caption */}
                    <div className="mt-3 space-y-0.5">
                      <span className="text-[10px] font-mono uppercase text-[#8B5E3C] block truncate font-bold">
                        {item.location.split(',')[0]}
                      </span>
                      <h4 className={`font-serif-editorial text-xs line-clamp-2 leading-tight transition-colors ${
                        isSelected ? 'font-bold text-[#0A2947]' : 'text-[#0A2947]/70 group-hover:text-[#0A2947]'
                      }`}>
                        {displayTitle}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Selected Milestone Specimen Showcase (Inline Interactive Curatorial Display) */}
        <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-in fade-in">
          
          {/* Subtle Top Seal */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#8B5E3C]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Specimen Details & Historical Narrative (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D3D4C0] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#0A2947] text-[#F3E4C9] text-xs font-mono font-bold rounded-lg">
                    {selectedMilestone.year}
                  </span>
                  <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#8B5E3C]">
                    {selectedMilestone.era}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#0A2947]/60">
                  <MapPin className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  <span>{selectedMilestone.location}</span>
                  <span>·</span>
                  <span>{selectedMilestone.dateString}</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] leading-snug">
                {selectedMilestone.title}
              </h3>

              {/* Highlights Chips */}
              {selectedMilestone.highlights && (
                <div className="space-y-1.5 py-1">
                  {selectedMilestone.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2 text-xs text-[#0A2947]/90 font-dmsans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm sm:text-base text-[#0A2947]/85 font-dmsans leading-relaxed">
                {selectedMilestone.description}
              </p>

              {/* Historical Quotation Inscription */}
              {selectedMilestone.quote && (
                <div className="p-4 bg-white border-l-4 border-[#8B5E3C] rounded-r-xl space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C]">
                    <Quote className="w-3.5 h-3.5" />
                    <span>Archival Inscription:</span>
                  </div>
                  <blockquote className="font-serif-editorial italic text-sm text-[#0A2947] leading-relaxed">
                    "{selectedMilestone.quote}"
                  </blockquote>
                  {selectedMilestone.quoteAttribution && (
                    <div className="text-[11px] font-mono text-[#8B5E3C] text-right">
                      — {selectedMilestone.quoteAttribution}
                    </div>
                  )}
                </div>
              )}

              {/* Action Controls */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onAskAIAboutEvent(`Explain the historical significance of Dr. Ambedkar's milestone "${selectedMilestone.title}" in ${selectedMilestone.year} at ${selectedMilestone.location}.`);
                    const el = document.getElementById('ask-ai-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Consult AI Scholar</span>
                </button>

                <button
                  onClick={() => handleCopyCitation(selectedMilestone)}
                  className="px-4 py-2 bg-white hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === selectedMilestone.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />}
                  <span>{copiedId === selectedMilestone.id ? 'Citation Copied' : 'Copy Historical Citation'}</span>
                </button>
              </div>

            </div>

            {/* Right: Archival Specimen Photograph & Linked Treatises (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Historical Photo Specimen */}
              {selectedMilestone.imageUrl ? (
                <div className="bg-white p-2.5 rounded-2xl border border-[#D3D4C0] shadow-sm space-y-2">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[#0A2947] border border-[#D3D4C0] relative">
                    <img 
                      src={selectedMilestone.imageUrl} 
                      alt={selectedMilestone.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-[#0A2947]/90 text-[#F3E4C9] rounded-md text-[10px] font-mono font-bold">
                      {selectedMilestone.mediaType === 'video' ? '🎬 Historic Reel' : '📷 Archival Photo'}
                    </div>
                  </div>
                  <span className="block text-center text-[10px] font-mono text-[#0A2947]/70">
                    Primary Archival Specimen · {selectedMilestone.year}
                  </span>
                </div>
              ) : null}

              {/* Linked Primary Archival Documents */}
              {relatedDocs.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-[#D3D4C0] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Correlated Primary Treatises</span>
                  </div>

                  <div className="space-y-2">
                    {relatedDocs.map(doc => (
                      <div 
                        key={doc.id}
                        className="p-3 bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                        onClick={() => {
                          soundEffects.playClick();
                          onOpenDocument(doc);
                        }}
                      >
                        <div className="truncate">
                          <h5 className="font-serif-editorial text-xs font-bold text-[#0A2947] group-hover:text-[#8B5E3C] truncate">
                            {doc.title}
                          </h5>
                          <span className="text-[10px] font-mono text-[#0A2947]/60">
                            {doc.accessionNo} · {doc.year}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
