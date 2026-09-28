'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Clock, Calendar, MapPin, Quote, ArrowRight, BookOpen,
  ChevronRight, ChevronLeft, X, ExternalLink, Sparkles,
  Layers, CheckCircle2, Maximize2, Share2, Copy, Check, Compass,
  LayoutGrid, SlidersHorizontal, Play, Pause, Volume2, VolumeX, Film,
  Eye, Award, ArrowUpRight, Search, Filter, Trophy, Scale, RotateCcw
} from 'lucide-react';
import { Language, TimelineEvent, ArchivalDocument, UserMode } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import { TIMELINE_EVENTS, ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { api } from '@/lib/api';
import type { TimelineEventItem } from '@/lib/types';
import { soundEffects } from '@/utils/soundEffects';
import { speechController } from '@/utils/speechUtils';

// Subcomponents for the revamped interactive kiosk experience
import { TimelineHorizonScrubber } from './timeline/TimelineHorizonScrubber';
import { TimelineQuizDrawer } from './timeline/TimelineQuizDrawer';
import { TimelineEpochComparator } from './timeline/TimelineEpochComparator';
import { TimelineGuidedTourBar } from './timeline/TimelineGuidedTourBar';
import TimelineDemo from '@/components/timeline-demo';
import { ThreeDPhotoCarousel, ThreeDCarouselCard } from '@/components/ui/three-d-carousel';
import { motion, useScroll, useTransform } from 'motion/react';
import { MuseumGrandPavilion } from './MuseumGrandPavilion';

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
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [timelineMode, setTimelineMode] = useState<'alternating' | 'slideshow' | 'grid'>('slideshow');
  const [activeMediaEvent, setActiveMediaEvent] = useState<TimelineEvent | null>(null);
  const [isPlayingMedia, setIsPlayingMedia] = useState<boolean>(false);
  const [mediaTime, setMediaTime] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'photo' | 'document'>('all');
  const [filmGrainEffect, setFilmGrainEffect] = useState<boolean>(true);
  const [spineSubView, setSpineSubView] = useState<'memorial' | 'demo'>('memorial');

  // Interactive Kiosk Additions
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState<boolean>(false);
  const [peekDocId, setPeekDocId] = useState<string | null>(null);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState<boolean>(true);
  // Timeline events — fetched from live API, static data as fallback
  const [liveEvents, setLiveEvents] = useState<TimelineEvent[]>(TIMELINE_EVENTS);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(TIMELINE_EVENTS[0].id);

  useEffect(() => {
    api.getTimelineEvents({ limit: 200 })
      .then((items: TimelineEventItem[]) => {
        if (!items || items.length === 0) return;
        const adapted: TimelineEvent[] = items.map(ev => {
          const fallback = TIMELINE_EVENTS.find(t => t.id === ev.id || t.title.toLowerCase() === ev.title?.toLowerCase());
          return {
            id: ev.id,
            year: ev.start_date ? parseInt(ev.start_date.substring(0, 4), 10) : (fallback?.year || 0),
            dateString: ev.start_date || fallback?.dateString || ev.id,
            title: ev.title,
            titleLocal: fallback?.titleLocal,
            era: ev.category || fallback?.era || 'General',
            location: ev.location || fallback?.location || 'India',
            description: ev.description || fallback?.description || '',
            descriptionLocal: fallback?.descriptionLocal,
            quote: ev.evidence_text || fallback?.quote,
            quoteAttribution: fallback?.quoteAttribution,
            imageUrl: fallback?.imageUrl,
            relatedDocIds: ev.related_documents || fallback?.relatedDocIds || [],
            highlights: ev.related_topics || fallback?.highlights || []
          };
        });
        setLiveEvents(adapted);
        if (adapted.length > 0) {
          setActiveMilestoneId(adapted[0].id);
        }
      })
      .catch(() => {
        // Fallback: keep static TIMELINE_EVENTS already in state
      });
  }, []);



  // Guided Memorial Tour State
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [isTourPaused, setIsTourPaused] = useState<boolean>(false);
  const [tourIndex, setTourIndex] = useState<number>(0);
  const [tourRemainingSeconds, setTourRemainingSeconds] = useState<number>(8);
  const TOUR_DURATION = 8;

  const eras = [
    { id: 'all', label: language === 'hi' ? 'सभी युग' : language === 'mr' ? 'सर्व कालखंड' : language === 'ta' ? 'அனைத்து காலங்கள்' : language === 'bn' ? 'সকল যুগ' : 'All Eras', span: '1891–1956', desc: '1891–1956', count: liveEvents.length },
    { id: 'Early Life & Education', label: language === 'hi' ? 'प्रारंभिक जीवन एवं शिक्षा' : language === 'mr' ? 'प्रारंभिक जीवन व शिक्षण' : language === 'ta' ? 'ஆரம்ப வாழ்க்கை & கல்வி' : language === 'bn' ? 'প্রাথমিক জীবন ও শিক্ষা' : 'Early Life & Studies', span: '1891–1923', desc: 'Satara, Columbia & London', count: liveEvents.filter(e => e.era === 'Early Life & Education').length || 2 },
    { id: 'Social Awakening', label: language === 'hi' ? 'सामाजिक जागरण' : language === 'mr' ? 'सामाजिक प्रबोधन' : language === 'ta' ? 'சமூக விழிப்புணர்வு' : language === 'bn' ? 'সামাজিক জাগরণ' : 'Social Awakening', span: '1924–1926', desc: 'Bahishkrit Hitakarini Sabha', count: liveEvents.filter(e => e.era === 'Social Awakening').length || 1 },
    { id: 'Social Movements', label: language === 'hi' ? 'नागरिक अधिकार आंदोलन' : language === 'mr' ? 'नागरी हक्क चळवळी' : language === 'ta' ? 'குடிமை உரிமை இயக்கங்கள்' : language === 'bn' ? 'নাগরিক অধিকার আন্দোলন' : 'Civil Rights Movements', span: '1927–1939', desc: 'Mahad Satyagraha & Poona Pact', count: liveEvents.filter(e => e.era === 'Social Movements').length || 3 },
    { id: 'Political Life', label: language === 'hi' ? 'राजनीतिक जीवन एवं शासन' : language === 'mr' ? 'राजकीय जीवन व प्रशासन' : language === 'ta' ? 'அரசியல் வாழ்க்கை & நிர்வாகம்' : language === 'bn' ? 'রাজনৈতিক জীবন ও প্রশাসন' : 'Public Statecraft', span: '1940–1946', desc: 'Viceroy Council & 8-Hr Workday', count: liveEvents.filter(e => e.era === 'Political Life').length || 2 },
    { id: 'Constitution & Governance', label: language === 'hi' ? 'संविधान निर्माण एवं गणतंत्र' : language === 'mr' ? 'घटना निर्मिती व प्रजासत्ताक' : language === 'ta' ? 'அரசியலமைப்பு & குடியரசு' : language === 'bn' ? 'সংবিধান প্রণয়ন ও প্রজাতন্ত্র' : 'Constitution & Republic', span: '1947–1950', desc: 'Drafting Committee & Law Ministry', count: liveEvents.filter(e => e.era === 'Constitution & Governance').length || 3 },
    { id: 'Later Life & Philosophy', label: language === 'hi' ? 'धम्म दीक्षा एवं दर्शन' : language === 'mr' ? 'धम्मक्रांती व तत्त्वज्ञान' : language === 'ta' ? 'தம்ம தீக்ஷை & தத்துவம்' : language === 'bn' ? 'ধম্ম দীক্ষা ও দর্শন' : 'Dhamma & Philosophy', span: '1951–1956', desc: 'The Deeksha Revolution', count: liveEvents.filter(e => e.era === 'Later Life & Philosophy').length || 2 },
  ];

  // Filtering events from live API data (with static fallback)
  const filteredEvents = liveEvents.filter((ev) => {
    const eraMatch = selectedEra === 'all' || ev.era === selectedEra;
    const typeMatch = filterType === 'all' || ev.mediaType === filterType;
    return eraMatch && typeMatch;
  });

  // Memoized cards for the Cult UI 3D Reel Carousel
  const carouselCards: ThreeDCarouselCard[] = React.useMemo(() => {
    return filteredEvents.map(event => ({
      id: event.id,
      image: event.imageUrl || '/images/ambedkar_portrait_1950.jpg',
      title: event.title,
      titleLocal: event.titleLocal,
      year: event.year,
      dateString: event.dateString,
      era: event.era,
      location: event.location,
      description: event.description,
      descriptionLocal: event.descriptionLocal,
      quote: event.quote,
      quoteAttribution: event.quoteAttribution,
      highlights: event.highlights,
      mediaType: event.mediaType,
      videoTitle: event.videoTitle,
      videoDuration: event.videoDuration,
      relatedDocIds: event.relatedDocIds,
    }));
  }, [filteredEvents]);

  // Scroll-Driven Central Spine Animation State
  const spineContainerRef = useRef<HTMLDivElement>(null);
  const [spineHeight, setSpineHeight] = useState<number>(0);

  useEffect(() => {
    if (!spineContainerRef.current) return;
    const updateHeight = () => {
      if (spineContainerRef.current) {
        setSpineHeight(spineContainerRef.current.offsetHeight);
      }
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(spineContainerRef.current);
    window.addEventListener('resize', updateHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [filteredEvents]);

  const { scrollYProgress: spineScrollYProgress } = useScroll({
    target: spineContainerRef,
    offset: ["start 20%", "end 85%"],
  });

  const spineBeamHeight = useTransform(spineScrollYProgress, [0, 1], ["0%", "100%"]);
  const spineBeamOpacity = useTransform(spineScrollYProgress, [0, 0.05], [0.4, 1]);

  const getRelatedDocs = (docIds: string[]) => {
    return ARCHIVE_DOCUMENTS.filter(d => docIds.includes(d.id));
  };

  const handleCopyCitation = (event: TimelineEvent) => {
    soundEffects.playClick();
    const citation = `"${event.title}" (${event.dateString}, ${event.location}). Era: ${event.era}. Dr. B. R. Ambedkar Historical Chronology (1891–1956). Digital Heritage Archive · DAIC.`;
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

  // Voice Speech playback toggle for milestone quotes
  const handleToggleSpeakQuote = (event: TimelineEvent) => {
    soundEffects.playClick();
    if (activeSpeakingId === event.id) {
      speechController.stop();
      setActiveSpeakingId(null);
      return;
    }

    speechController.stop();
    setActiveSpeakingId(event.id);

    const quoteToRead = (language !== 'en' && event.descriptionLocal?.[language])
      ? event.descriptionLocal[language]!
      : (event.quote || (language !== 'en' && event.titleLocal?.[language]) || event.title);
    speechController.speak(quoteToRead, ['mr', 'hi', 'ta', 'bn'].includes(language) ? language : 'en', () => {
      setActiveSpeakingId(null);
    });
  };

  // Scroll smoothly to any milestone ID
  const scrollToMilestone = (id: string) => {
    soundEffects.playClick();
    setActiveMilestoneId(id);
    const element = document.getElementById(`milestone-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Update slideshow index if in slideshow mode
    const idx = filteredEvents.findIndex(e => e.id === id);
    if (idx >= 0) setActiveEventIndex(idx);
  };

  // Switch timeline display mode (Spine, Reel, Grid) and automatically smooth scroll down to the view stage
  const handleModeChange = (mode: 'alternating' | 'slideshow' | 'grid') => {
    soundEffects.playClick();
    setTimelineMode(mode);

    // Automatically smooth scroll down to the active view stage
    setTimeout(() => {
      const targetElement = document.getElementById('timeline-view-stage');
      if (targetElement) {
        const yOffset = -24; // Comfortable breathing space from top edge
        const targetY = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    }, 60);
  };

  // Guided Memorial Tour Timer
  useEffect(() => {
    let timer: any;
    if (isTourActive && !isTourPaused) {
      timer = setInterval(() => {
        setTourRemainingSeconds(prev => {
          if (prev <= 1) {
            // Advance to next station
            const nextIdx = (tourIndex + 1) % filteredEvents.length;
            setTourIndex(nextIdx);
            const nextEvent = filteredEvents[nextIdx];
            if (nextEvent) {
              setActiveMilestoneId(nextEvent.id);
              if (timelineMode === 'alternating') {
                const el = document.getElementById(`milestone-${nextEvent.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else if (timelineMode === 'slideshow') {
                setActiveEventIndex(nextIdx);
              }

              // Speak quote if voice guide is enabled
              if (voiceGuideEnabled && nextEvent.quote) {
                speechController.speak(nextEvent.quote, ['mr', 'hi', 'ta', 'bn'].includes(language) ? language : 'en');
                setActiveSpeakingId(nextEvent.id);
              }
            }
            return TOUR_DURATION;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTourActive, isTourPaused, tourIndex, filteredEvents, timelineMode, voiceGuideEnabled, language]);

  // Start guided tour
  const handleStartTour = () => {
    soundEffects.playClick();
    setIsTourActive(true);
    setIsTourPaused(false);
    setTourIndex(0);
    setTourRemainingSeconds(TOUR_DURATION);

    const firstEvent = filteredEvents[0];
    if (firstEvent) {
      setActiveMilestoneId(firstEvent.id);
      if (timelineMode === 'alternating') {
        const el = document.getElementById(`milestone-${firstEvent.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (timelineMode === 'slideshow') {
        setActiveEventIndex(0);
      }

      if (voiceGuideEnabled && firstEvent.quote) {
        speechController.speak(firstEvent.quote, ['mr', 'hi', 'ta', 'bn'].includes(language) ? language : 'en');
        setActiveSpeakingId(firstEvent.id);
      }
    }
  };

  const handleStopTour = () => {
    soundEffects.playClick();
    setIsTourActive(false);
    speechController.stop();
    setActiveSpeakingId(null);
  };

  const handleTourPrev = () => {
    soundEffects.playClick();
    const prevIdx = (tourIndex - 1 + filteredEvents.length) % filteredEvents.length;
    setTourIndex(prevIdx);
    setTourRemainingSeconds(TOUR_DURATION);
    const ev = filteredEvents[prevIdx];
    if (ev) {
      setActiveMilestoneId(ev.id);
      if (timelineMode === 'alternating') {
        const el = document.getElementById(`milestone-${ev.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (timelineMode === 'slideshow') {
        setActiveEventIndex(prevIdx);
      }
      if (voiceGuideEnabled && ev.quote) {
        speechController.speak(ev.quote, ['mr', 'hi', 'ta', 'bn'].includes(language) ? language : 'en');
        setActiveSpeakingId(ev.id);
      }
    }
  };

  const handleTourNext = () => {
    soundEffects.playClick();
    const nextIdx = (tourIndex + 1) % filteredEvents.length;
    setTourIndex(nextIdx);
    setTourRemainingSeconds(TOUR_DURATION);
    const ev = filteredEvents[nextIdx];
    if (ev) {
      setActiveMilestoneId(ev.id);
      if (timelineMode === 'alternating') {
        const el = document.getElementById(`milestone-${ev.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (timelineMode === 'slideshow') {
        setActiveEventIndex(nextIdx);
      }
      if (voiceGuideEnabled && ev.quote) {
        speechController.speak(ev.quote, ['mr', 'hi', 'ta', 'bn'].includes(language) ? language : 'en');
        setActiveSpeakingId(ev.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 space-y-8 font-dmsans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* =========================================================================
            INSTITUTIONAL KIOSK TITLE BAR & ACTION TERMINAL
            ========================================================================= */}
        <MuseumGrandPavilion
          title={
            language === 'en' ? (
              <>
                Chronicles of a{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
                  Revolutionary
                </span>{' '}
                Life
              </>
            ) : (
              <span className="bg-gradient-to-r from-white via-[#FAF7F0] to-[#EAD8B1] bg-clip-text text-transparent">
                {t.timelineTitle || "क्रांतिकारी जीवन गाथा"}
              </span>
            )
          }
          watermarkIcon={Clock}
        >
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={isTourActive ? handleStopTour : handleStartTour}
                className={`px-4 py-2 rounded-2xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                  isTourActive
                    ? 'bg-rose-900 text-white ring-2 ring-rose-500 animate-pulse'
                    : 'bg-[#C59A45] hover:bg-[#d6aa55] text-[#0A2947] hover:scale-105'
                }`}
                title="Auto-advancing memorial presentation"
              >
                {isTourActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isTourActive ? (language === 'hi' ? 'दौरा रोकें' : language === 'mr' ? 'दौरा थांबवा' : language === 'ta' ? 'நிறுத்து' : language === 'bn' ? 'যাত্রা থামান' : 'Stop Tour') : (language === 'hi' ? 'मार्गदर्शित यात्रा' : language === 'mr' ? 'मार्गदर्शित दौरा' : language === 'ta' ? 'நிகழ்வுப் பயணம்' : language === 'bn' ? 'পরিচালিত যাত্রা' : 'Guided Tour')}</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsQuizOpen(true);
                }}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-[#FAF7F0] border border-white/20 rounded-2xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                title="Test Your Knowledge in the Memorial Quiz"
              >
                <Trophy className="w-3.5 h-3.5 text-[#F5D061]" />
                <span>{language === 'hi' ? 'क्विज़' : language === 'mr' ? 'प्रश्नावली' : language === 'ta' ? 'வினாடி வினா' : language === 'bn' ? 'কুইজ' : 'Epoch Quiz'}</span>
              </button>
            </div>

            <div className="flex items-center bg-white/10 p-1.5 rounded-2xl border border-white/20 shadow-xs">
              <button
                type="button"
                onClick={() => handleModeChange('slideshow')}
                className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  timelineMode === 'slideshow'
                    ? 'bg-[#C59A45] text-[#0A2947] shadow-xs'
                    : 'text-[#FAF7F0]/70 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reel</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  timelineMode === 'grid'
                    ? 'bg-[#C59A45] text-[#0A2947] shadow-xs'
                    : 'text-[#FAF7F0]/70 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grid</span>
              </button>
            </div>
          </div>
        </MuseumGrandPavilion>

        {/* =========================================================================
            TOUCH HORIZON CHRONOLOGICAL SCRUBBER & SLIDER
            ========================================================================= */}
        <TimelineHorizonScrubber
          events={TIMELINE_EVENTS}
          selectedEra={selectedEra}
          onSelectEra={(eraId) => setSelectedEra(eraId)}
          eras={eras}
        />

        {/* =========================================================================
            ACTIVE TIMELINE VIEW STAGE (Spine, Reel, Grid)
            ========================================================================= */}
        <div id="timeline-view-stage" className="scroll-mt-6">
          {/* VIEW 1: ALTERNATING MILESTONE SPINE (INTERACTIVE STATION WALKWAY) */}
          {timelineMode === 'alternating' && (
            <div className="space-y-6">
              {/* Spine Subview Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border-2 border-[#D3D4C0] rounded-2xl shadow-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8B5E3C]" />
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#0A2947]">
                    Central Milestone Spine
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#D3D4C0] text-[10px] font-mono text-[#8B5E3C]">
                    Scroll-Driven Beam
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1 rounded-xl border border-[#D3D4C0]">
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSpineSubView('memorial');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold uppercase transition-all cursor-pointer ${spineSubView === 'memorial'
                      ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs'
                      : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                      }`}
                  >
                    Babasaheb Milestones ({filteredEvents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSpineSubView('demo');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold uppercase transition-all cursor-pointer ${spineSubView === 'demo'
                      ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs'
                      : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                      }`}
                  >
                    Aceternity Demo Preview
                  </button>
                </div>
              </div>

              {spineSubView === 'demo' ? (
                <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-4 sm:p-6 shadow-sm overflow-hidden">
                  <TimelineDemo />
                </div>
              ) : (
                <div ref={spineContainerRef} className="relative py-8">
                  {/* Center Vertical Axis with Aceternity Scroll-Driven Animated Beam (Centered on md+, Left on mobile) */}
                  <div className="absolute left-5 md:left-1/2 -translate-x-1/2 top-4 bottom-8 w-2 md:w-2.5 bg-[#D3D4C0]/80 dark:bg-neutral-800 rounded-full overflow-hidden shadow-inner z-10">
                    {/* Aceternity Glowing Animated Gradient Beam */}
                    <motion.div
                      style={{
                        height: spineBeamHeight,
                        opacity: spineBeamOpacity,
                      }}
                      className="absolute inset-x-0 top-0 w-full bg-gradient-to-b from-purple-600 via-blue-500 to-[#C59A45] rounded-full shadow-[0_0_18px_rgba(147,51,234,0.8),0_0_28px_rgba(59,130,246,0.9),0_0_36px_rgba(197,154,69,0.8)]"
                    />
                  </div>

                  {/* Radiant Leading Pulse Bead at the head of the beam */}
                  <div className="absolute left-5 md:left-1/2 -translate-x-1/2 top-4 bottom-8 w-0 z-30 pointer-events-none">
                    <motion.div
                      style={{
                        top: spineBeamHeight,
                        opacity: spineBeamOpacity,
                      }}
                      className="absolute -left-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 via-blue-400 to-amber-300 shadow-[0_0_16px_#8b5cf6,0_0_25px_#3b82f6,0_0_35px_#C59A45] ring-2 ring-white animate-pulse"
                    />
                  </div>

                  <div className="space-y-12 sm:space-y-16">
                    {filteredEvents.map((event, index) => {
                      const isEven = index % 2 === 0;
                      const displayTitle = language !== 'en' && event.titleLocal?.[language] ? event.titleLocal[language] : event.title;
                      const displayDesc = language !== 'en' && event.descriptionLocal?.[language] ? event.descriptionLocal[language] : event.description;
                      const relatedDocs = getRelatedDocs(event.relatedDocIds || []);
                      const isStationSpeaking = activeSpeakingId === event.id;
                      const isSelected = activeMilestoneId === event.id;

                      return (
                        <div
                          key={event.id}
                          id={`milestone-${event.id}`}
                          onClick={() => setActiveMilestoneId(event.id)}
                          className={`relative flex flex-col md:flex-row items-center scroll-mt-28 group ${isEven ? 'md:flex-row-reverse' : ''
                            }`}
                        >

                          {/* Central Glowing Node Milestone Pin */}
                          <div className="absolute left-5 md:left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                            <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm shadow-md transition-all duration-300 cursor-pointer ${isSelected
                              ? 'bg-[#C59A45] text-[#0A2947] ring-4 ring-[#C59A45]/40 scale-115'
                              : 'bg-[#0A2947] border-2 border-[#C59A45] text-[#F3E4C9] group-hover:scale-110 group-hover:ring-4 group-hover:ring-[#C59A45]/30'
                              }`}>
                              {event.mediaType === 'video' ? (
                                <Film className="w-5 h-5 text-[#C59A45] animate-pulse" />
                              ) : (
                                <span>{index + 1}</span>
                              )}
                            </div>
                            <span className="hidden md:block text-[10px] font-mono font-bold text-[#8B5E3C] mt-1 bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-[#D3D4C0]">
                              {event.year}
                            </span>
                          </div>

                          {/* Content Card Side (Half-width on desktop) */}
                          <div className={`w-full md:w-1/2 pl-14 sm:pl-16 md:pl-0 ${isEven ? 'md:pr-12' : 'md:pl-12'
                            }`}>

                            {/* Interactive Visual Card */}
                            <div className={`bg-white border-2 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 ${isSelected ? 'border-[#C59A45] ring-2 ring-[#C59A45]/20' : 'border-[#D3D4C0] hover:border-[#8B5E3C]'
                              }`}>

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
                                      ) : event.mediaType === 'document' ? (
                                        <>
                                          <BookOpen className="w-3 h-3 text-[#8B5E3C]" />
                                          <span>Primary Treaty Folio</span>
                                        </>
                                      ) : (
                                        <>
                                          <Compass className="w-3 h-3 text-[#C59A45]" />
                                          <span>Archival Specimen Plate</span>
                                        </>
                                      )}
                                    </span>
                                  </div>

                                  {/* Year Floating Badge */}
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
                                    <span className="flex items-center gap-1 truncate max-w-[220px]">
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
                                    Station #{index + 1} of {filteredEvents.length}
                                  </span>
                                </div>

                                {/* Title */}
                                <h3
                                  onClick={() => handleOpenMedia(event)}
                                  className="text-xl sm:text-2xl font-serif-editorial font-bold text-[#0A2947] hover:text-[#8B5E3C] transition-colors cursor-pointer leading-snug"
                                >
                                  {displayTitle}
                                </h3>

                                {/* Highlights Chips */}
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

                                {/* Historical Proclamation Quote with Speech synthesis */}
                                {event.quote && (
                                  <div className="p-4 bg-[#FAF7F0] border-l-4 border-[#8B5E3C] rounded-r-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase">
                                        <Quote className="w-3.5 h-3.5" />
                                        <span>Historical Proclamation</span>
                                      </div>

                                      {/* Audio Voice Button */}
                                      <button
                                        onClick={() => handleToggleSpeakQuote(event)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isStationSpeaking
                                          ? 'bg-[#C59A45] text-[#0A2947] ring-2 ring-[#C59A45]/40 animate-pulse'
                                          : 'bg-white hover:bg-[#F3E4C9] text-[#8B5E3C] border border-[#D3D4C0]'
                                          }`}
                                        title="Listen to Babasaheb's quote read aloud"
                                      >
                                        {isStationSpeaking ? (
                                          <>
                                            <div className="flex items-end gap-0.5 h-3">
                                              <span className="w-0.5 bg-[#0A2947] animate-[bounce_0.8s_infinite] h-2" />
                                              <span className="w-0.5 bg-[#0A2947] animate-[bounce_0.6s_infinite] h-3" />
                                              <span className="w-0.5 bg-[#0A2947] animate-[bounce_0.9s_infinite] h-1.5" />
                                            </div>
                                            <span>Stop Audio</span>
                                          </>
                                        ) : (
                                          <>
                                            <Volume2 className="w-3.5 h-3.5" />
                                            <span>Listen</span>
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    <p className="text-xs font-serif-editorial italic text-[#0A2947] leading-relaxed">
                                      "{event.quote}"
                                    </p>
                                    {event.quoteAttribution && (
                                      <div className="text-[10px] font-mono text-[#8B5E3C] text-right">
                                        — {event.quoteAttribution}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Primary Documents Available */}
                                {relatedDocs.length > 0 && (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase mr-1">
                                        Primary Folios:
                                      </span>
                                      {relatedDocs.map(doc => (
                                        <button
                                          key={doc.id}
                                          onClick={() => {
                                            soundEffects.playClick();
                                            setPeekDocId(peekDocId === doc.id ? null : doc.id);
                                          }}
                                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors flex items-center gap-1 cursor-pointer border ${peekDocId === doc.id
                                            ? 'bg-[#0A2947] text-[#F3E4C9] border-[#0A2947]'
                                            : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-[#D3D4C0]'
                                            }`}
                                          title="Click to peek document details"
                                        >
                                          <BookOpen className="w-3 h-3 text-[#8B5E3C]" />
                                          <span className="truncate max-w-[130px]">{doc.title}</span>
                                        </button>
                                      ))}
                                    </div>

                                    {/* In-Card Folio Peek Drawer */}
                                    {peekDocId && relatedDocs.some(d => d.id === peekDocId) && (
                                      (() => {
                                        const doc = relatedDocs.find(d => d.id === peekDocId)!;
                                        return (
                                          <div className="p-3.5 bg-[#FAF7F0] border-2 border-[#8B5E3C]/40 rounded-2xl space-y-2 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="font-serif-editorial font-bold text-[#0A2947] truncate max-w-[200px]">
                                                {doc.title}
                                              </span>
                                              <span className="text-[10px] font-mono text-[#8B5E3C]">
                                                {doc.accessionNo} · {doc.year}
                                              </span>
                                            </div>
                                            <p className="text-xs text-[#0A2947]/80 line-clamp-2">
                                              {doc.shortDescription}
                                            </p>
                                            <div className="flex items-center justify-between pt-1">
                                              <button
                                                onClick={() => onOpenDocument(doc)}
                                                className="text-xs font-montserrat font-bold uppercase text-[#8B5E3C] hover:text-[#0A2947] flex items-center gap-1 cursor-pointer"
                                              >
                                                <span>Open Full Archival Reader</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() => setPeekDocId(null)}
                                                className="text-[11px] font-mono text-[#0A2947]/50 hover:text-[#0A2947] cursor-pointer"
                                              >
                                                Close Peek
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })()
                                    )}
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
            </div>
          )}

          {/* =========================================================================
            VIEW 2: CINEMATIC REEL 3D CORRIDOR (CULT UI 3D PHOTO CAROUSEL)
            ========================================================================= */}
          {timelineMode === 'slideshow' && (
            <div className="space-y-8">
              {/* Cult UI 3D Perspective Cylindrical Carousel */}
              <ThreeDPhotoCarousel
                cards={carouselCards}
                activeIndex={activeEventIndex}
                language={language}
                onCardChange={(idx) => {
                  soundEffects.playClick();
                  setActiveEventIndex(idx);
                }}
                onOpenMedia={(card, idx) => {
                  const ev = (card?.id ? filteredEvents.find(e => e.id === card.id) : null) || (typeof idx === 'number' ? filteredEvents[idx] : null) || filteredEvents[activeEventIndex];
                  if (ev) {
                    if (typeof idx === 'number') setActiveEventIndex(idx);
                    handleOpenMedia(ev);
                  }
                }}
                onAskAI={(query) => {
                  onAskAIAboutEvent(query);
                }}
                onSpeakQuote={(text) => {
                  speechController.speak(text, ['mr', 'hi', 'ta', 'bn'].includes(language) ? language : 'en');
                }}
              />
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
                    <span className="text-[11px] font-mono text-[#0A2947]/60 truncate max-w-[150px]">
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
        </div>

        {/* =========================================================================
            MULTIMEDIA REEL & SPECIMEN MODAL
            ========================================================================= */}
        {activeMediaEvent && (
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-[#0A2947]/90 backdrop-blur-md animate-in fade-in duration-200"
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase border transition-colors cursor-pointer ${filmGrainEffect ? 'bg-[#C59A45] text-[#0A2947] border-[#F3E4C9]' : 'bg-[#FAF7F0]/20 text-white border-white/30'
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
                    className={`w-full h-full object-cover transition-transform duration-1000 ${isPlayingMedia ? 'scale-105 filter contrast-110 brightness-95' : ''
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

                  {/* Historical Quote with Voice playback */}
                  {activeMediaEvent.quote && (
                    <div className="p-4 bg-[#FAF7F0] border-l-4 border-[#8B5E3C] rounded-r-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase">
                          <Quote className="w-3 h-3" />
                          <span>Direct Historical Proclamation</span>
                        </div>
                        <button
                          onClick={() => handleToggleSpeakQuote(activeMediaEvent)}
                          className="px-2.5 py-1 bg-white hover:bg-[#F3E4C9] text-[#8B5E3C] border border-[#D3D4C0] rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
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

        {/* =========================================================================
            INTERACTIVE KIOSK DRAWERS & CONTROLLERS
            ========================================================================= */}

        {/* Milestone Chronicle Quiz Drawer */}
        <TimelineQuizDrawer
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onJumpToMilestone={(milestoneId) => scrollToMilestone(milestoneId)}
        />

        {/* Epoch Comparison Lens Drawer */}
        <TimelineEpochComparator
          isOpen={isComparatorOpen}
          onClose={() => setIsComparatorOpen(false)}
          onJumpToMilestone={(milestoneId) => scrollToMilestone(milestoneId)}
        />

        {/* Guided Memorial Tour Dock Bar */}
        <TimelineGuidedTourBar
          isActive={isTourActive}
          isPaused={isTourPaused}
          currentEvent={filteredEvents[tourIndex] || filteredEvents[0]}
          currentIndex={tourIndex}
          totalEvents={filteredEvents.length}
          remainingSeconds={tourRemainingSeconds}
          maxSeconds={TOUR_DURATION}
          isSpeaking={activeSpeakingId !== null}
          voiceEnabled={voiceGuideEnabled}
          onTogglePause={() => {
            soundEffects.playClick();
            setIsTourPaused(!isTourPaused);
          }}
          onPrev={handleTourPrev}
          onNext={handleTourNext}
          onToggleVoice={() => {
            soundEffects.playClick();
            setVoiceGuideEnabled(!voiceGuideEnabled);
            if (voiceGuideEnabled) {
              speechController.stop();
              setActiveSpeakingId(null);
            }
          }}
          onStopTour={handleStopTour}
        />

      </div>
    </div>
  );
};
