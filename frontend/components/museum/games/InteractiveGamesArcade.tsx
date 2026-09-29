'use client';

import React, { useState } from 'react';
import { 
  Gamepad2, Gavel, Puzzle, Scale, 
  History, Key, Sparkles, Trophy, Award,
  Volume2, VolumeX, Flame, Coins, ShieldCheck
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
      title: 'Wheel of Rights & Dilemmas',
      subtitle: 'Spin the 8-Spoke Dharma Chakra',
      icon: Scale,
      badge: 'Interactive 3D Wheel',
      badgeClass: 'bg-amber-400 text-[#0A2947]'
    },
    {
      id: 'debate' as GameId,
      title: 'Assembly Debate Simulator',
      subtitle: 'Defend Rights at the Rostrum',
      icon: Gavel,
      badge: 'Role-Playing Game',
      badgeClass: 'bg-rose-500 text-white'
    },
    {
      id: 'detective' as GameId,
      title: 'Rajgruha Library Detective',
      subtitle: 'Inspect Rare Books & Marginalia',
      icon: Key,
      badge: 'Mahogany Mystery',
      badgeClass: 'bg-emerald-600 text-white'
    },
    {
      id: 'preamble' as GameId,
      title: 'Preamble Architect Mosaic',
      subtitle: 'Rebuild Sacred Word Sequence',
      icon: Puzzle,
      badge: 'Illuminated Jigsaw',
      badgeClass: 'bg-blue-600 text-white'
    },
    {
      id: 'timeline' as GameId,
      title: 'Timeline Epoch Sorter',
      subtitle: 'Speed-Sort Historic Milestones',
      icon: History,
      badge: 'Time-Machine Rail',
      badgeClass: 'bg-purple-600 text-white'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Arcade Master HUD */}
      <div className="bg-gradient-to-r from-[#0A2947] via-[#142A4D] to-[#041424] text-white p-4 sm:p-5 rounded-3xl border-2 border-[#C89D56] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Ambient Lighting */}
        <div className="absolute top-0 right-1/4 w-72 h-20 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C89D56] to-amber-600 text-[#0A2947] flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                Archival Learning Arcade
              </span>
              <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                5 Interactive Stations
              </span>
            </div>
            <h3 className="font-serif-editorial font-bold text-xl sm:text-2xl text-amber-200 mt-0.5">
              The Constitutional Arena
            </h3>
          </div>
        </div>

        {/* Global Player Controls & Audio Toggle */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-200 hover:bg-amber-400/30'
                : 'bg-slate-800 border-slate-700 text-slate-400'
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

      {/* Game Selector Arcade Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {gamesList.map((g) => {
          const isSelected = activeGame === g.id;
          const Icon = g.icon;

          return (
            <button
              key={g.id}
              onClick={() => handleSelectGame(g.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0A2947] to-[#041424] text-[#FAF7F0] border-[#C89D56] shadow-xl ring-2 ring-[#C89D56]/60 scale-[1.03] -translate-y-1'
                  : 'bg-white text-[#0A2947] border-[#D3D4C0] hover:border-[#C89D56] hover:bg-[#F3E4C9]/30 hover:-translate-y-0.5 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                  isSelected ? 'bg-[#C89D56] text-[#0A2947]' : 'bg-[#FAF7F0] text-[#0A2947] border border-[#E2D9C8]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold shadow-sm ${g.badgeClass}`}>
                  {g.badge}
                </span>
              </div>

              <div>
                <h4 className="font-serif-editorial font-bold text-xs sm:text-sm leading-tight">
                  {g.title}
                </h4>
                <p className={`text-[10px] font-mono mt-1 line-clamp-1 ${isSelected ? 'text-[#C89D56]' : 'text-[#8B5E3C]'}`}>
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

        {activeGame === 'detective' && (
          <RajgruhaDetectiveGame
            language={language}
          />
        )}

        {activeGame === 'preamble' && (
          <PreambleArchitectGame
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
