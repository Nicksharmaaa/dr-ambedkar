'use client';

import React, { useState } from 'react';
import { 
  Gamepad2, Gavel, Puzzle, Scale, 
  History, Key, Sparkles, Trophy, Award,
  Volume2, VolumeX, Flame, Coins, ShieldCheck,
  Star, CheckCircle2
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import './ArcadeGames.css';

import DebateSimulatorGame from './DebateSimulatorGame';
import PreambleArchitectGame from './PreambleArchitectGame';
import ConstitutionWheelGame from './ConstitutionWheelGame';
import TimelineChronicleGame from './TimelineChronicleGame';
import RajgruhaDetectiveGame from './RajgruhaDetectiveGame';

interface InteractiveGamesArcadeProps {
  language: Language;
  onExploreDoc?: (docId: string) => void;
}

export type GameId = 'wheel' | 'debate' | 'detective' | 'preamble' | 'timeline';

export const InteractiveGamesArcade: React.FC<InteractiveGamesArcadeProps> = ({
  language,
  onExploreDoc
}) => {
  const [activeGame, setActiveGame] = useState<GameId>('wheel');
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.enabled);
  const [completedStations, setCompletedStations] = useState<Record<GameId, boolean>>({
    wheel: false,
    debate: false,
    detective: false,
    preamble: false,
    timeline: false
  });

  const handleSelectGame = (id: GameId) => {
    soundEffects.playClick();
    setActiveGame(id);
  };

  const handleToggleSound = () => {
    const isNowOn = soundEffects.toggleSound();
    setSoundEnabled(isNowOn);
    if (isNowOn) {
      soundEffects.playSuccess();
    }
  };

  const gamesList = [
    {
      id: 'wheel' as GameId,
      stationNum: '01',
      title: 'Wheel of Rights',
      subtitle: '8-Spoke Dharma Chakra',
      icon: Scale,
      badge: 'Bench Trial',
      badgeClass: 'bg-amber-400 text-[#0A2947]',
      difficulty: '★★★'
    },
    {
      id: 'debate' as GameId,
      stationNum: '02',
      title: 'Assembly Debate',
      subtitle: 'Defend Rights at Rostrum',
      icon: Gavel,
      badge: 'Role-Playing',
      badgeClass: 'bg-rose-500 text-white',
      difficulty: '★★★'
    },
    {
      id: 'preamble' as GameId,
      stationNum: '03',
      title: 'Preamble Mosaic',
      subtitle: 'Sacred Word Sequence',
      icon: Puzzle,
      badge: 'Illuminated Jigsaw',
      badgeClass: 'bg-blue-600 text-white',
      difficulty: '★★☆'
    },
    {
      id: 'detective' as GameId,
      stationNum: '04',
      title: 'Rajgruha Sleuth',
      subtitle: 'Antique Library Marginalia',
      icon: Key,
      badge: 'Mahogany Mystery',
      badgeClass: 'bg-emerald-600 text-white',
      difficulty: '★★★'
    },
    {
      id: 'timeline' as GameId,
      stationNum: '05',
      title: 'Timeline Sorter',
      subtitle: 'Historic Epoch Rail',
      icon: History,
      badge: 'Chrono-Machine',
      badgeClass: 'bg-purple-600 text-white',
      difficulty: '★★☆'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Arcade Master HUD */}
      <div className="bg-gradient-to-r from-[#0A2947] via-[#142A4D] to-[#041424] text-white p-5 sm:p-7 rounded-3xl border-3 border-[#C89D56] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Ambient Lighting */}
        <div className="absolute top-0 right-1/4 w-80 h-28 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C89D56] to-amber-600 text-[#0A2947] flex items-center justify-center font-bold text-xl shadow-xl shrink-0 border-2 border-amber-200">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold tracking-wider">
                Constitutional Gaming Arena
              </span>
              <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                5 Interactive Stations
              </span>
            </div>
            <h3 className="font-serif-editorial font-bold text-2xl sm:text-3xl text-amber-200 mt-1 arcade-marquee-glow">
              Archival Learning Arcade
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 font-dmsans max-w-xl">
              Immerse yourself in authentic historical role-play, courtroom trials, sacred word mosaics, and library investigations.
            </p>
          </div>
        </div>

        {/* Global Player Controls & Audio Toggle */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer shadow-sm active:scale-95 ${
              soundEnabled
                ? 'bg-amber-400/20 border-amber-400/60 text-amber-200 hover:bg-amber-400/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
            title="Toggle Synthesizer Sound Effects"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>Audio FX On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Audio FX Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Game Selector Arcade Deck: 5 Deluxe Station Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {gamesList.map((g) => {
          const isSelected = activeGame === g.id;
          const Icon = g.icon;

          return (
            <button
              key={g.id}
              onClick={() => handleSelectGame(g.id)}
              className={`p-4 rounded-3xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group shadow-md ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0A2947] via-[#102B4C] to-[#041424] text-[#FAF7F0] border-[#C89D56] shadow-2xl ring-2 ring-[#C89D56]/70 scale-[1.03] -translate-y-1'
                  : 'bg-white text-[#0A2947] border-[#D3D4C0] hover:border-[#C89D56] hover:bg-[#F3E4C9]/30 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                  isSelected ? 'bg-[#C89D56] text-[#0A2947]' : 'bg-[#FAF7F0] text-[#0A2947] border border-[#E2D9C8]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-amber-500 font-bold block">
                    {g.difficulty}
                  </span>
                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold shadow-xs ${g.badgeClass}`}>
                    {g.badge}
                  </span>
                </div>
              </div>

              <div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                  isSelected ? 'text-[#C89D56]' : 'text-[#8B5E3C]'
                }`}>
                  Station {g.stationNum}
                </span>
                <h4 className="font-serif-editorial font-bold text-sm sm:text-base leading-tight mt-0.5">
                  {g.title}
                </h4>
                <p className={`text-[11px] font-dmsans mt-1 line-clamp-1 ${isSelected ? 'text-amber-200/80' : 'text-[#8B5E3C]'}`}>
                  {g.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Game Station */}
      <div className="animate-in fade-in duration-200">
        {activeGame === 'wheel' && (
          <ConstitutionWheelGame
            language={language}
          />
        )}

        {activeGame === 'debate' && (
          <DebateSimulatorGame
            language={language}
            onExploreDoc={onExploreDoc}
          />
        )}

        {activeGame === 'preamble' && (
          <PreambleArchitectGame
            language={language}
          />
        )}

        {activeGame === 'detective' && (
          <RajgruhaDetectiveGame
            language={language}
          />
        )}

        {activeGame === 'timeline' && (
          <TimelineChronicleGame
            language={language}
          />
        )}
      </div>
    </div>
  );
};

export default InteractiveGamesArcade;
