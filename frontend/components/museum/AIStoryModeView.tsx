'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Sparkles, Volume2, VolumeX, ArrowRight, ArrowLeft, CheckCircle2, 
  HelpCircle, Compass, Award, Star, RotateCcw, Share2, Layers, Play, Pause,
  Film, Eye, Heart, PartyPopper, Check, Maximize2, Smile, Zap
} from 'lucide-react';
import { GuidedStoryPath, StoryStep, ArchivalDocument, Language } from '@/types/museum';
import { GUIDED_STORY_PATHS, ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { speechController } from '@/utils/speechUtils';
import { soundEffects } from '@/utils/soundEffects';

interface AIStoryModeViewProps {
  language: Language;
  onOpenDocument: (doc: ArchivalDocument) => void;
  kidModeDefault?: boolean;
}

export const AIStoryModeView: React.FC<AIStoryModeViewProps> = ({
  language,
  onOpenDocument,
  kidModeDefault = true
}) => {
  const [selectedPath, setSelectedPath] = useState<GuidedStoryPath>(GUIDED_STORY_PATHS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isKidFriendly, setIsKidFriendly] = useState<boolean>(kidModeDefault);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [storyCompleted, setStoryCompleted] = useState<boolean>(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'photo'>('video');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [poppedSticker, setPoppedSticker] = useState<string | null>(null);
  const [isZoomedPhoto, setIsZoomedPhoto] = useState<boolean>(false);

  const step: StoryStep = selectedPath.steps[currentStepIndex];

  useEffect(() => {
    setIsKidFriendly(kidModeDefault);
  }, [kidModeDefault]);

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    speechController.stop();
    setIsPlayingAudio(false);
    setIsVideoPlaying(false);
    setVideoProgress(0);
    setShowConfetti(false);
  }, [currentStepIndex, selectedPath]);

  useEffect(() => {
    return () => {
      speechController.stop();
    };
  }, []);

  // Video progress simulation timer
  useEffect(() => {
    let interval: any;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            setIsVideoPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying]);

  const handleSelectStory = (path: GuidedStoryPath) => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);
    setSelectedPath(path);
    setCurrentStepIndex(0);
    setStoryCompleted(false);
  };

  const handleToggleAudio = () => {
    soundEffects.playClick();
    if (isPlayingAudio) {
      speechController.stop();
      setIsPlayingAudio(false);
    } else {
      const textToRead = isKidFriendly ? step.kidFriendlyText : step.narrativeText;
      setIsPlayingAudio(true);
      speechController.speak(textToRead, language, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleToggleVideo = () => {
    soundEffects.playClick();
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleNextStep = () => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);
    if (currentStepIndex < selectedPath.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setStoryCompleted(true);
      soundEffects.playSuccess();
      setShowConfetti(true);
    }
  };

  const handlePrevStep = () => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
    setIsAnswerSubmitted(true);
    if (index === step.interactiveQuestion?.correctIndex) {
      soundEffects.playSuccess();
      setShowConfetti(true);
      if (step.badgeReward && !earnedBadges.includes(step.badgeReward)) {
        setEarnedBadges(prev => [...prev, step.badgeReward!]);
      }
      setTimeout(() => setShowConfetti(false), 3500);
    } else {
      soundEffects.playWrong();
    }
  };

  const handlePopSticker = (sticker: string) => {
    soundEffects.playClick();
    setPoppedSticker(sticker);
    setTimeout(() => setPoppedSticker(null), 1000);
  };

  const linkedDoc = step.archivalDocId 
    ? ARCHIVE_DOCUMENTS.find(d => d.id === step.archivalDocId)
    : null;

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 font-dmsans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* =========================================================================
            HEADER & STORY NAVIGATOR
            ========================================================================= */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B5E3C] via-[#C59A45] to-[#0A2947]" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
                <Compass className="w-4 h-4 text-[#8B5E3C]" />
                <span>VISUAL STORYBOOK & HISTORICAL REELS</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif-editorial font-bold text-[#0A2947] tracking-tight leading-tight">
                Babasaheb's Visual Stories
              </h1>
              <p className="text-sm sm:text-base text-[#0A2947]/75 font-normal leading-relaxed">
                Step into illustrated chapters and archival film reels. Designed for young explorers and curious scholars of all ages with voice narration, videos, and fun challenges!
              </p>
            </div>

            {/* Mode Switcher: Youth Explorer vs Curatorial */}
            <div className="flex items-center gap-3 bg-[#FAF7F0] p-2 rounded-2xl border-2 border-[#D3D4C0] shadow-xs self-start md:self-auto">
              <span className="text-xs font-montserrat font-bold uppercase text-[#0A2947] flex items-center gap-1.5 pl-1">
                <Sparkles className="w-4 h-4 text-[#C59A45] animate-spin" />
                Mode:
              </span>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsKidFriendly(!isKidFriendly);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  isKidFriendly
                    ? 'bg-[#C59A45] text-[#0A2947] shadow-xs ring-1 ring-[#8B5E3C]'
                    : 'bg-[#0A2947] text-[#F3E4C9] shadow-xs'
                }`}
              >
                {isKidFriendly ? (
                  <>
                    <span>🧒 Kid Friendly</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </>
                ) : (
                  <>
                    <span>🏛️ Scholar Edition</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Badges Earned Ribbon */}
          {earnedBadges.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#D3D4C0] flex items-center gap-2 flex-wrap">
              <span className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#C59A45]" />
                Earned Badges:
              </span>
              {earnedBadges.map((badge, bIdx) => (
                <span 
                  key={bIdx}
                  className="px-3 py-1 bg-[#FAF7F0] border border-[#C59A45] text-[#0A2947] rounded-xl text-xs font-montserrat font-bold shadow-2xs animate-in zoom-in"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            STORY PATHWAY CARDS SELECTOR (VIBRANT VISUALS)
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUIDED_STORY_PATHS.map((path) => {
            const isActive = path.id === selectedPath.id;
            return (
              <button
                key={path.id}
                onClick={() => handleSelectStory(path)}
                className={`p-4 text-left rounded-3xl border-2 transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                  isActive
                    ? 'bg-white border-[#C59A45] shadow-lg ring-3 ring-[#C59A45]/30 -translate-y-1'
                    : 'bg-white hover:bg-[#FAF7F0] border-[#D3D4C0] hover:border-[#8B5E3C] shadow-xs'
                }`}
              >
                <div>
                  {/* Thumbnail Image Header */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#0A2947] mb-3">
                    <img 
                      src={path.heroImage} 
                      alt={path.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#0A2947]/90 text-[#F3E4C9] rounded-lg text-[10px] font-mono font-bold">
                      {path.era}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#8B5E3C] text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                      <Film className="w-3 h-3 text-[#F3E4C9]" />
                      <span>Video Reel</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-cinzel uppercase font-bold text-[#8B5E3C] mb-1">
                    <span className="truncate">{path.badge}</span>
                    <span className="font-mono text-[#0A2947]/70 shrink-0">{path.durationMinutes}m</span>
                  </div>

                  <h3 className="font-serif-editorial text-base sm:text-lg font-bold text-[#0A2947] mb-1.5 line-clamp-1 group-hover:text-[#8B5E3C] transition-colors">
                    {path.title}
                  </h3>

                  <p className="text-xs text-[#0A2947]/75 font-dmsans line-clamp-2 mb-2">
                    {isKidFriendly ? path.kidSummary : path.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#D3D4C0]/70 font-montserrat font-bold">
                  <span className="text-[#8B5E3C] text-[11px]">{path.steps.length} Chapters</span>
                  <span className="text-[11px] text-[#0A2947] flex items-center gap-1">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 text-[#8B5E3C]" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            MAIN INTERACTIVE VISUAL STORYBOOK ARENA
            ========================================================================= */}
        {!storyCompleted ? (
          <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl shadow-xl overflow-hidden space-y-6 relative">
            
            {/* Instagram-Style Segmented Story Progress Bar */}
            <div className="p-4 sm:p-6 pb-0 flex items-center gap-2">
              {selectedPath.steps.map((s, idx) => {
                const isStepPassed = idx < currentStepIndex;
                const isStepActive = idx === currentStepIndex;
                return (
                  <div 
                    key={idx}
                    className="flex-1 h-2 rounded-full overflow-hidden bg-[#FAF7F0] border border-[#D3D4C0] relative cursor-pointer"
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentStepIndex(idx);
                    }}
                    title={`Chapter ${idx + 1}: ${s.title}`}
                  >
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isStepPassed 
                          ? 'bg-[#0A2947]' 
                          : isStepActive 
                            ? 'bg-[#C59A45] animate-pulse' 
                            : 'bg-transparent'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Chapter Header Deck */}
            <div className="px-4 sm:px-8 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D3D4C0] pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-[#0A2947] text-[#F3E4C9] font-cinzel flex items-center justify-center text-sm font-bold border-2 border-[#C59A45] shadow-xs">
                  {step.stepNumber}
                </span>
                <div>
                  <div className="flex items-center gap-2 text-xs font-cinzel uppercase tracking-wider text-[#8B5E3C] font-bold">
                    <span>{selectedPath.title}</span>
                    <span>·</span>
                    <span>Chapter {currentStepIndex + 1} of {selectedPath.steps.length}</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947]">
                    {step.title}
                  </h2>
                </div>
              </div>

              {/* Action Buttons: Read Aloud Voice & Fullscreen */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAudio}
                  className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isPlayingAudio
                      ? 'bg-[#0A2947] text-[#F3E4C9] ring-2 ring-[#C59A45]'
                      : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-4 h-4 text-[#C59A45]" />
                      <span>Stop Voice</span>
                      {/* Bouncing Audio Wave Animation */}
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="w-1 h-3 bg-[#C59A45] animate-bounce" />
                        <span className="w-1 h-4 bg-[#C59A45] animate-bounce delay-100" />
                        <span className="w-1 h-2 bg-[#C59A45] animate-bounce delay-200" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-[#8B5E3C]" />
                      <span>{isKidFriendly ? 'Read Aloud To Me' : 'Audio Guide'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Media Stage (Interactive Video Reel or High-Res Photograph) */}
            <div className="px-4 sm:px-8">
              
              {/* Media Mode Tabs */}
              <div className="flex items-center justify-between gap-2 pb-3">
                <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1 rounded-xl border border-[#D3D4C0]">
                  <button
                    onClick={() => setActiveMediaTab('video')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeMediaTab === 'video'
                        ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs'
                        : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5 text-[#C59A45]" />
                    <span>Historical Video Reel</span>
                  </button>

                  <button
                    onClick={() => setActiveMediaTab('photo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeMediaTab === 'photo'
                        ? 'bg-[#0A2947] text-[#F3E4C9] shadow-xs'
                        : 'text-[#0A2947]/70 hover:text-[#0A2947]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-[#8B5E3C]" />
                    <span>Archival Photograph</span>
                  </button>
                </div>

                <div className="text-xs font-mono text-[#8B5E3C] hidden sm:block">
                  {step.location} ({step.year})
                </div>
              </div>

              {/* Main Cinema Box */}
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-xl border-2 border-[#D3D4C0] group">
                <img 
                  src={step.imageUrl} 
                  alt={step.title}
                  className={`w-full h-full object-cover transition-transform duration-1000 ${
                    isVideoPlaying ? 'scale-105 filter contrast-110' : ''
                  }`}
                />

                {/* Simulated Film Reel Perforations on Top/Bottom */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-black/60 flex justify-between px-4 py-1 pointer-events-none">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2 bg-white/30 rounded-xs" />
                  ))}
                </div>

                {/* Live Action Video Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handleToggleVideo}
                    className="w-16 h-16 rounded-2xl bg-[#0A2947]/90 border-2 border-[#C59A45] text-[#F3E4C9] flex items-center justify-center shadow-2xl hover:scale-115 transition-transform cursor-pointer"
                  >
                    {isVideoPlaying ? (
                      <Pause className="w-7 h-7 fill-[#C59A45] text-[#C59A45]" />
                    ) : (
                      <Play className="w-7 h-7 fill-[#C59A45] text-[#C59A45] ml-1" />
                    )}
                  </button>
                </div>

                {/* Subtitle Ticker on Video */}
                <div className="absolute bottom-14 left-4 right-4 text-center pointer-events-none">
                  <div className="inline-block bg-black/85 px-4 py-2 rounded-xl border border-white/20 text-xs sm:text-sm font-dmsans text-[#F3E4C9] max-w-xl mx-auto shadow-lg backdrop-blur-xs">
                    {isVideoPlaying 
                      ? (step.videoReelClip || step.audioVoiceoverExcerpt) 
                      : (step.imageCaption || step.audioVoiceoverExcerpt)}
                  </div>
                </div>

                {/* Video Playback Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-3 text-white text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-[#C59A45] font-bold">
                    <Film className="w-3.5 h-3.5" />
                    <span>{step.videoTitle || 'Historical Reel'}</span>
                  </span>

                  <div className="flex-1 max-w-md h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#C59A45] rounded-full transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>

                  <span>{step.videoDuration || '03:15'}</span>
                </div>
              </div>

            </div>

            {/* Kid Interactive Stickers Strip */}
            {isKidFriendly && step.kidFriendlyStickers && (
              <div className="px-4 sm:px-8 py-1 flex items-center gap-3">
                <span className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase">
                  Tap Stickers to React:
                </span>
                <div className="flex items-center gap-2">
                  {step.kidFriendlyStickers.map((sticker, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handlePopSticker(sticker)}
                      className="w-9 h-9 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] hover:border-[#8B5E3C] text-lg flex items-center justify-center transition-all cursor-pointer hover:scale-125"
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
                {poppedSticker && (
                  <span className="text-xs font-montserrat font-bold text-[#8B5E3C] animate-bounce">
                    Nice! {poppedSticker} Added!
                  </span>
                )}
              </div>
            )}

            {/* Story Narrative Box */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Main Narrative with Friendly Visual Box */}
              <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all ${
                isKidFriendly
                  ? 'bg-amber-50/40 border-[#C59A45]/40 text-[#0A2947]'
                  : 'bg-white border-[#D3D4C0] text-[#0A2947]'
              }`}>
                <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C59A45]" />
                  <span>{isKidFriendly ? 'Storybook Narrative' : 'Curatorial Historical Narrative'}</span>
                </div>

                <p className="text-base sm:text-xl font-dmsans leading-relaxed">
                  {isKidFriendly ? step.kidFriendlyText : step.narrativeText}
                </p>
              </div>

              {/* Archival Quotation & Audio Voiceover Plate */}
              <div className="p-5 bg-[#FAF7F0] border-l-4 border-[#8B5E3C] rounded-r-2xl space-y-2">
                <span className="text-[10px] font-cinzel uppercase tracking-wider font-bold text-[#8B5E3C] block">
                  HISTORICAL CONTEXT & VOICEOVER EXCERPT
                </span>
                <p className="font-serif-editorial italic text-base sm:text-lg text-[#0A2947] leading-relaxed">
                  "{step.audioVoiceoverExcerpt}"
                </p>
                <div className="text-xs font-mono text-[#8B5E3C] pt-1">
                  Location: {step.location} ({step.year})
                </div>
              </div>

              {/* Linked Archival Folio CTA */}
              {linkedDoc && (
                <div className="p-4 bg-white border border-[#D3D4C0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C] block">
                      Primary Archival Facsimile Available
                    </span>
                    <h4 className="font-serif-editorial font-bold text-sm sm:text-base text-[#0A2947]">
                      {linkedDoc.title}
                    </h4>
                    <p className="text-xs text-[#0A2947]/70 font-mono">
                      {linkedDoc.accessionNo} · {linkedDoc.year}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      onOpenDocument(linkedDoc);
                    }}
                    className="px-4 py-2 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Primary Folio</span>
                  </button>
                </div>
              )}

              {/* Interactive In-Chapter Mini-Quiz Check with Confetti Celebration */}
              {step.interactiveQuestion && (
                <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-3xl border-2 border-[#D3D4C0] space-y-5 relative overflow-hidden">
                  
                  {/* Floating Confetti Particle Indicator */}
                  {showConfetti && (
                    <div className="absolute top-2 right-4 text-2xl animate-bounce">
                      🎉 ✨ 🌟 🏆
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 text-[#C59A45]" />
                    <span>{isKidFriendly ? 'Junior Explorer Mini-Challenge' : 'Historical Inquiry Check'}</span>
                  </div>

                  <p className="font-montserrat font-bold text-base sm:text-lg text-[#0A2947]">
                    {step.interactiveQuestion.prompt}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {step.interactiveQuestion.options.map((opt: string, oIdx: number) => {
                      let optionStyle = "bg-white hover:bg-[#F3E4C9] border-[#D3D4C0] text-[#0A2947]";
                      if (isAnswerSubmitted) {
                        if (oIdx === step.interactiveQuestion?.correctIndex) {
                          optionStyle = "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-500/30 scale-[1.02]";
                        } else if (oIdx === selectedAnswer) {
                          optionStyle = "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20";
                        } else {
                          optionStyle = "bg-white/50 border-[#D3D4C0]/50 text-[#0A2947]/40";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectAnswer(oIdx)}
                          disabled={isAnswerSubmitted}
                          className={`p-4 text-left rounded-2xl border-2 transition-all flex items-center justify-between text-xs sm:text-sm font-dmsans cursor-pointer disabled:cursor-default shadow-xs ${optionStyle}`}
                        >
                          <span className="leading-snug">{opt}</span>
                          {isAnswerSubmitted && oIdx === step.interactiveQuestion?.correctIndex && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswerSubmitted && (
                    <div className="p-4 bg-white border border-[#C59A45] rounded-2xl text-xs sm:text-sm font-dmsans leading-relaxed text-[#0A2947] animate-in fade-in space-y-1">
                      <div className="flex items-center gap-1.5 text-[#8B5E3C] font-bold text-xs uppercase font-cinzel">
                        <Sparkles className="w-4 h-4 text-[#C59A45]" />
                        <span>Fascinating Historical Fact:</span>
                      </div>
                      <p>{step.interactiveQuestion.funFact}</p>
                      {step.badgeReward && (
                        <div className="pt-2 flex items-center gap-2 text-xs font-montserrat font-bold text-emerald-800">
                          <Award className="w-4 h-4 text-[#C59A45]" />
                          <span>Unlocked: {step.badgeReward}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Visual Chapter Thumbnails Strip (Kids can tap picture to jump) */}
              <div className="pt-4 border-t border-[#D3D4C0] space-y-2">
                <span className="text-[11px] font-cinzel uppercase font-bold text-[#8B5E3C] block">
                  All Chapters in this Pathway (Tap photo to jump):
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#8B5E3C]/40 scrollbar-track-[#FAF7F0]">
                  {selectedPath.steps.map((st, sIdx) => {
                    const isCurrent = sIdx === currentStepIndex;
                    return (
                      <button
                        key={sIdx}
                        onClick={() => {
                          soundEffects.playClick();
                          setCurrentStepIndex(sIdx);
                        }}
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-2xl border-2 transition-all shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#0A2947] border-[#C59A45] text-[#F3E4C9] shadow-md ring-2 ring-[#C59A45]/30'
                            : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] border-[#D3D4C0] text-[#0A2947]'
                        }`}
                      >
                        <img 
                          src={st.imageUrl} 
                          alt={st.title} 
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div className="text-left">
                          <span className="block text-[10px] font-cinzel uppercase font-bold text-[#C59A45]">
                            Chapter {st.stepNumber}
                          </span>
                          <span className="block text-xs font-serif-editorial font-bold truncate max-w-[120px]">
                            {st.title}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between pt-6 border-t-2 border-[#D3D4C0]">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-5 py-2.5 bg-[#FAF7F0] hover:bg-[#F3E4C9] disabled:opacity-40 text-[#0A2947] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 cursor-pointer border border-[#D3D4C0]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs font-mono text-[#8B5E3C]">
                  Chapter {currentStepIndex + 1} of {selectedPath.steps.length}
                </div>

                <button
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105"
                >
                  <span>{currentStepIndex === selectedPath.steps.length - 1 ? 'Finish Pathway 🏆' : 'Next Chapter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* Pathway Completed Grand Celebration Screen */
          <div className="bg-white border-2 border-[#C59A45] rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-3xl bg-[#0A2947] border-3 border-[#C59A45] text-[#F3E4C9] flex items-center justify-center mx-auto text-4xl shadow-lg animate-bounce">
              🏆
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-cinzel uppercase tracking-wider font-bold text-[#8B5E3C] flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-current text-[#C59A45]" />
                <span>Junior Historian Certificate Unlocked</span>
                <Star className="w-4 h-4 fill-current text-[#C59A45]" />
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif-editorial font-bold text-[#0A2947]">
                Congratulations!
              </h2>
              <p className="text-sm sm:text-base text-[#0A2947]/80 font-dmsans">
                You completed all chapters of <strong>"{selectedPath.title}"</strong>! You have explored the primary photographs, historic newsreels, and constitutional lessons of Dr. B. R. Ambedkar.
              </p>
            </div>

            {/* Badges Earned in this Pathway */}
            {earnedBadges.length > 0 && (
              <div className="p-4 bg-[#FAF7F0] border border-[#C59A45] rounded-2xl max-w-md mx-auto space-y-2">
                <span className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase">
                  Your Earned Honors:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {earnedBadges.map((b, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-[#D3D4C0] text-[#0A2947] rounded-xl text-xs font-bold font-montserrat shadow-2xs">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentStepIndex(0);
                  setStoryCompleted(false);
                }}
                className="px-6 py-3 bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border-2 border-[#D3D4C0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#8B5E3C]" />
                <span>Explore Again</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  const nextPathIdx = (GUIDED_STORY_PATHS.findIndex(p => p.id === selectedPath.id) + 1) % GUIDED_STORY_PATHS.length;
                  handleSelectStory(GUIDED_STORY_PATHS[nextPathIdx]);
                }}
                className="px-6 py-3 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Next Historical Story</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
