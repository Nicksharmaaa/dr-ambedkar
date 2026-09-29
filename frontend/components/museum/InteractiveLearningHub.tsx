'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Microscope, Landmark, 
  Scale, BookOpen, Quote, ShieldCheck, Heart, 
  Sparkles, Award, Volume2, FileText, Zap, Key,
  Gamepad2
} from 'lucide-react';
import MuseumGrandPavilion from './MuseumGrandPavilion';
import { useUserMode } from '@/lib/UserModeContext';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';

// Subcomponents for Students
import PreambleLaboratory from './interactive/PreambleLaboratory';
import ArchivalFlashcards from './interactive/ArchivalFlashcards';
import { ConstitutionalQuest } from './ConstitutionalQuest';

// Subcomponents for Researchers
import ScholarlyCitationEngine from './interactive/ScholarlyCitationEngine';
import TreatiseConcordanceDiffer from './interactive/TreatiseConcordanceDiffer';
import ArchivalProvenanceInspector from './interactive/ArchivalProvenanceInspector';
import ResearchDossierNotebook from './interactive/ResearchDossierNotebook';

// Subcomponents for Games & Arcades
import InteractiveGamesArcade from './games/InteractiveGamesArcade';

export type LearningWing = 'students' | 'researchers' | 'games';

interface InteractiveLearningHubProps {
  language: Language;
  initialWing?: LearningWing;
  onExploreDoc?: (docId: string) => void;
  onAskAI?: (query: string) => void;
}

export const InteractiveLearningHub: React.FC<InteractiveLearningHubProps> = ({
  language,
  initialWing,
  onExploreDoc,
  onAskAI
}) => {
  const { mode } = useUserMode();
  const t = UI_STRINGS[language] || UI_STRINGS.en;

  // Determine initial wing from props or userMode
  const getInitialWing = (): LearningWing => {
    if (initialWing && (initialWing === 'students' || initialWing === 'researchers' || initialWing === 'games')) {
      return initialWing;
    }
    if (mode === 'researcher' || mode === 'archivist') return 'researchers';
    return 'students';
  };

  const [activeWing, setActiveWing] = useState<LearningWing>(getInitialWing);

  // Sub-tabs for each wing
  const [studentTab, setStudentTab] = useState<'preamble' | 'flashcards' | 'quest'>('preamble');
  const [researcherTab, setResearcherTab] = useState<'citation' | 'differ' | 'fixity' | 'dossier'>('citation');

  // Synchronize when mode changes if user hasn't explicitly navigated
  useEffect(() => {
    if (!initialWing || (initialWing as string) === 'visitors') {
      if (mode === 'researcher' || mode === 'archivist') setActiveWing('researchers');
      else setActiveWing('students');
    }
  }, [mode, initialWing]);

  const handleWingChange = (wing: LearningWing) => {
    soundEffects.playClick();
    setActiveWing(wing);
  };

  // Curatorial Stats
  const hubStats = [
    { value: '4 Pillars', label: 'Constitutional Tenets' },
    { value: '22 Volumes', label: 'BAWS Archival Corpus' },
    { value: '5 Games', label: 'Interactive Arcade Sims' },
    { value: 'PREMIS 3.0', label: 'Digital Fixity Standard' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      {/* GRAND PAVILION HEADER */}
      <MuseumGrandPavilion
        title={
          language === 'hi' ? 'संवादात्मक शिक्षण एवं शोध प्रयोगशाला' :
          language === 'mr' ? 'संवादात्मक शिक्षण व संशोधन प्रयोगशाळा' :
          language === 'ta' ? 'ஊடாடும் கற்றல் மற்றும் ஆய்வு களம்' :
          language === 'bn' ? 'ইন্টারেক্টিভ লার্নিং ও গবেষণা গবেষণাগার' :
          'Interactive Learning & Discovery Lab'
        }
        subtitle={
          language === 'hi' ? 'विद्यार्थियों और शोधकर्ताओं के लिए विशेष रूप से निर्मित संवादात्मक ऐतिहासिक अनुभव एवं खेल आर्केड।' :
          language === 'mr' ? 'विद्यार्थी आणि संशोधकांसाठी ऐतिहासिक साधनांवर आधारित संवादात्मक दालने व आर्केड खेळ.' :
          language === 'ta' ? 'மாணவர்கள் மற்றும் ஆராய்ச்சியாளர்களுக்கான வரலாற்று ஆய்வுக் கூடம் மற்றும் விளையாட்டுகள்.' :
          language === 'bn' ? 'শিক্ষার্থী ও গবেষকদের জন্য বিশেষভাবে প্রস্তুত করা ইন্টারেক্টিভ লার্নিং ও গেমস আর্কেড।' :
          'Curated primary-source learning environments tailored for Students, Researchers, and the Interactive Arcade.'
        }
        stats={hubStats}
        watermarkIcon={Landmark}
      >
        {/* Persona Switcher Segmented Control */}
        <div className="pt-2">
          <div className="bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 inline-flex flex-wrap gap-1 shadow-lg max-w-full">
            {/* STUDENTS TAB */}
            <button
              onClick={() => handleWingChange('students')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-serif-editorial font-bold transition-all cursor-pointer ${
                activeWing === 'students'
                  ? 'bg-[#C89D56] text-[#0A2947] shadow-md ring-1 ring-white/30 scale-[1.02]'
                  : 'text-[#FAF7F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Students’ Academy</span>
              <span className="hidden sm:inline text-[10px] opacity-75 font-mono">
                (Preamble • Flashcards • Quest)
              </span>
            </button>

            {/* RESEARCHERS TAB */}
            <button
              onClick={() => handleWingChange('researchers')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-serif-editorial font-bold transition-all cursor-pointer ${
                activeWing === 'researchers'
                  ? 'bg-[#C89D56] text-[#0A2947] shadow-md ring-1 ring-white/30 scale-[1.02]'
                  : 'text-[#FAF7F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Microscope className="w-4 h-4" />
              <span>Researchers’ Workbench</span>
              <span className="hidden sm:inline text-[10px] opacity-75 font-mono">
                (Citations • Differ • PREMIS • Notebook)
              </span>
            </button>

            {/* GAMES ARCADE TAB */}
            <button
              onClick={() => handleWingChange('games')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-serif-editorial font-bold transition-all cursor-pointer ${
                activeWing === 'games'
                  ? 'bg-[#C89D56] text-[#0A2947] shadow-md ring-1 ring-white/30 scale-[1.02]'
                  : 'text-[#FAF7F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Interactive Arcade</span>
              <span className="hidden sm:inline text-[10px] opacity-75 font-mono">
                (5 Fun Games & Sims)
              </span>
            </button>
          </div>
        </div>
      </MuseumGrandPavilion>

      {/* =========================================================================
          WING 1: STUDENTS' ACADEMY
          ========================================================================= */}
      {activeWing === 'students' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Sub-navigation for Students */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl p-2.5 shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setStudentTab('preamble');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  studentTab === 'preamble'
                    ? 'bg-[#0A2947] text-[#FAF7F0] shadow-sm'
                    : 'bg-white text-[#8B5E3C] border border-[#E2D9C8] hover:bg-[#F3E4C9]'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>Preamble Laboratory</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setStudentTab('flashcards');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  studentTab === 'flashcards'
                    ? 'bg-[#0A2947] text-[#FAF7F0] shadow-sm'
                    : 'bg-white text-[#8B5E3C] border border-[#E2D9C8] hover:bg-[#F3E4C9]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>3D Archival Flashcards</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setStudentTab('quest');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  studentTab === 'quest'
                    ? 'bg-[#0A2947] text-[#FAF7F0] shadow-sm'
                    : 'bg-white text-[#8B5E3C] border border-[#E2D9C8] hover:bg-[#F3E4C9]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>Constitutional Quest & Certificate</span>
              </button>
            </div>

            <div className="text-xs font-mono text-[#8B5E3C] px-2 hidden md:block">
              Educational Wing • Primary Document Grounded
            </div>
          </div>

          {/* Student Sub-Views */}
          {studentTab === 'preamble' && (
            <PreambleLaboratory
              language={language}
              onOpenDocument={onExploreDoc}
              onAskAI={onAskAI}
            />
          )}

          {studentTab === 'flashcards' && (
            <ArchivalFlashcards
              language={language}
              onOpenDocument={onExploreDoc}
              onAskAI={onAskAI}
            />
          )}

          {studentTab === 'quest' && (
            <div className="bg-transparent">
              <ConstitutionalQuest
                language={language}
                onExploreDoc={onExploreDoc || (() => {})}
                onAskAI={onAskAI || (() => {})}
              />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          WING 2: RESEARCHERS' WORKBENCH
          ========================================================================= */}
      {activeWing === 'researchers' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Sub-navigation for Researchers */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl p-2.5 shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setResearcherTab('citation');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  researcherTab === 'citation'
                    ? 'bg-[#0A2947] text-[#FAF7F0] shadow-sm'
                    : 'bg-white text-[#8B5E3C] border border-[#E2D9C8] hover:bg-[#F3E4C9]'
                }`}
              >
                <Quote className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>Citation Engine (APA/MLA/BibTeX)</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setResearcherTab('differ');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  researcherTab === 'differ'
                    ? 'bg-[#0A2947] text-[#FAF7F0] shadow-sm'
                    : 'bg-white text-[#8B5E3C] border border-[#E2D9C8] hover:bg-[#F3E4C9]'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>Treatise Concordance Differ</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setResearcherTab('fixity');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  researcherTab === 'fixity'
                    ? 'bg-[#0A2947] text-[#FAF7F0] shadow-sm'
                    : 'bg-white text-[#8B5E3C] border border-[#E2D9C8] hover:bg-[#F3E4C9]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>Archival Fixity & PREMIS 3.0</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setResearcherTab('dossier');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  researcherTab === 'dossier'
                    ? 'bg-[#0A2947] text-[#FAF7F0] shadow-sm'
                    : 'bg-white text-[#8B5E3C] border border-[#E2D9C8] hover:bg-[#F3E4C9]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>Research Dossier Notebook</span>
              </button>
            </div>

            <div className="text-xs font-mono text-[#8B5E3C] px-2 hidden md:block">
              Academic Workbench • OAIS & BAWS Compliant
            </div>
          </div>

          {/* Researcher Sub-Views */}
          {researcherTab === 'citation' && (
            <ScholarlyCitationEngine
              language={language}
              onOpenDocument={onExploreDoc}
            />
          )}

          {researcherTab === 'differ' && (
            <TreatiseConcordanceDiffer
              language={language}
              onOpenDocument={onExploreDoc}
            />
          )}

          {researcherTab === 'fixity' && (
            <ArchivalProvenanceInspector
              language={language}
            />
          )}

          {researcherTab === 'dossier' && (
            <ResearchDossierNotebook
              language={language}
            />
          )}
        </div>
      )}

      {/* =========================================================================
          WING 3: INTERACTIVE ARCADE & GAMES
          ========================================================================= */}
      {activeWing === 'games' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <InteractiveGamesArcade
            language={language}
            onExploreDoc={onExploreDoc}
          />
        </div>
      )}
    </div>
  );
};

export default InteractiveLearningHub;
