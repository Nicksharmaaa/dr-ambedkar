'use client';

import React, { useState, useEffect } from 'react';
import { 
  Puzzle, Sparkles, CheckCircle2, RotateCcw, 
  Trophy, Clock, BookOpen, Landmark, ArrowRight,
  Flame, Star, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import './ArcadeGames.css';

interface PreambleArchitectGameProps {
  language: Language;
}

interface PreambleToken {
  id: string;
  word: string;
  category: 'opening' | 'nature' | 'pillar';
  historicalNote: string;
  badge: string;
}

const PREAMBLE_SEQUENCE: PreambleToken[] = [
  { id: 't1', word: 'WE, THE PEOPLE OF INDIA', category: 'opening', badge: 'Source of Authority', historicalNote: 'Affirms that all democratic power originates directly from the citizens of India, not a British monarch or feudal princes.' },
  { id: 't2', word: 'SOVEREIGN', category: 'nature', badge: 'Republic Nature', historicalNote: 'India is completely independent and free from any external dominion or foreign dictates.' },
  { id: 't3', word: 'SOCIALIST', category: 'nature', badge: 'Economic Goal', historicalNote: 'Commands state policy to eradicate poverty and prevent concentration of wealth for common welfare.' },
  { id: 't4', word: 'SECULAR', category: 'nature', badge: 'Equal Dignity', historicalNote: 'The State treats all faiths with equal dignity without establishing a theocracy.' },
  { id: 't5', word: 'DEMOCRATIC', category: 'nature', badge: 'Associated Living', historicalNote: 'Dr. Ambedkar defined democracy primarily as a mode of associated living and human fraternity.' },
  { id: 't6', word: 'REPUBLIC', category: 'nature', badge: 'Elected Head', historicalNote: 'The Head of State is elected by the people, abolishing hereditary privilege and monarchy.' },
  { id: 't7', word: 'JUSTICE', category: 'pillar', badge: 'Foundational Pillar', historicalNote: 'Social, Economic and Political justice to emancipate the oppressed and establish equal rights.' },
  { id: 't8', word: 'LIBERTY', category: 'pillar', badge: 'Freedom of Mind', historicalNote: 'Liberty of thought, expression, belief, faith, and worship as the cornerstone of intellect.' },
  { id: 't9', word: 'EQUALITY', category: 'pillar', badge: 'Level Playing Field', historicalNote: 'Equality of status and of opportunity; total eradication of untouchability and hierarchy.' },
  { id: 't10', word: 'FRATERNITY', category: 'pillar', badge: 'Soul of Democracy', historicalNote: 'Assuring the dignity of the individual and the supreme unity and integrity of the Nation.' }
];

export const PreambleArchitectGame: React.FC<PreambleArchitectGameProps> = ({
  language
}) => {
  const [placedTokens, setPlacedTokens] = useState<PreambleToken[]>([]);
  const [availableTokens, setAvailableTokens] = useState<PreambleToken[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [comboCount, setComboCount] = useState(0);

  // Shuffle tokens on initial mount
  useEffect(() => {
    resetGame();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  const resetGame = () => {
    soundEffects.playClick();
    const shuffled = [...PREAMBLE_SEQUENCE].sort(() => Math.random() - 0.5);
    setAvailableTokens(shuffled);
    setPlacedTokens([]);
    setActiveNote(null);
    setSeconds(0);
    setIsTimerRunning(false);
    setIsCompleted(false);
    setComboCount(0);
  };

  const handleSelectToken = (token: PreambleToken) => {
    if (!isTimerRunning && !isCompleted) {
      setIsTimerRunning(true);
    }

    const nextExpected = PREAMBLE_SEQUENCE[placedTokens.length];

    if (token.id === nextExpected.id) {
      // Correct token chosen
      soundEffects.playSuccess();
      soundEffects.playCombo(comboCount + 1);
      const updatedPlaced = [...placedTokens, token];
      setPlacedTokens(updatedPlaced);
      setAvailableTokens(prev => prev.filter(t => t.id !== token.id));
      setActiveNote(token.historicalNote);
      setComboCount(prev => prev + 1);

      if (updatedPlaced.length === PREAMBLE_SEQUENCE.length) {
        setIsCompleted(true);
        setIsTimerRunning(false);
        soundEffects.playCoinDrop();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } else {
      // Incorrect token chosen
      soundEffects.playWrong();
      setComboCount(0);
    }
  };

  // Calculate star rating based on speed
  const getStarRating = () => {
    if (seconds <= 25) return 3;
    if (seconds <= 45) return 2;
    return 1;
  };

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
      {/* Header Arcade Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-serif-editorial text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Puzzle className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Tactile Word-Sequence Jigsaw</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            Preamble Architect: The Sacred Word Mosaic
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl">
            Reconstruct India’s supreme constitutional preamble in its authentic historical order. Snap each illuminated token into its golden socket!
          </p>
        </div>

        {/* Timer, Combo & Controls */}
        <div className="flex items-center gap-3">
          {comboCount > 1 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow animate-pulse">
              <Flame className="w-4 h-4 fill-white" />
              <span>{comboCount}x Cadence!</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-[#C89D56] font-mono text-xs text-[#0A2947] shadow-sm">
            <Clock className="w-4 h-4 text-[#C89D56]" />
            <span className="font-bold">Time: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
          </div>

          <button
            onClick={resetGame}
            title="Reset Puzzle"
            className="p-2.5 rounded-2xl bg-white border border-[#D3D4C0] text-[#8B5E3C] hover:text-[#0A2947] hover:border-[#0A2947] transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Golden Illuminated Manuscript Frame */}
      <div className="bg-white border-4 border-[#C89D56] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-5">
        {/* Subtle Watermark */}
        <Landmark className="absolute -right-8 -bottom-8 w-64 h-64 text-[#C89D56]/[0.05] pointer-events-none select-none" />

        <div className="text-center border-b border-[#F4EBD9] pb-4">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#8B5E3C]">
            Constituent Assembly of India — 26 November 1949
          </div>
          <h3 className="font-serif-editorial font-bold text-2xl text-[#0A2947] tracking-wider mt-1">
            THE CONSTITUTION OF INDIA
          </h3>
          <div className="text-xs font-serif-editorial text-[#8B5E3C] italic mt-0.5">
            Preamble Architecture Wall
          </div>
        </div>

        {/* Sockets Wall: 10 Sockets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PREAMBLE_SEQUENCE.map((target, idx) => {
            const isPlaced = placedTokens.length > idx;
            const isNext = placedTokens.length === idx;
            const placedItem = isPlaced ? placedTokens[idx] : null;

            return (
              <div
                key={target.id}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-300 min-h-[90px] flex flex-col justify-between ${
                  isPlaced
                    ? 'bg-gradient-to-br from-[#0A2947] to-[#041424] border-[#C89D56] text-[#FAF7F0] shadow-md scale-[1.02]'
                    : isNext
                    ? 'bg-amber-50/80 border-dashed border-amber-400 text-amber-900 animate-pulse'
                    : 'bg-[#FAF7F0]/60 border-dashed border-slate-300 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={isPlaced ? 'text-[#C89D56] font-bold' : ''}>#{idx + 1}</span>
                  {isPlaced && <Check className="w-3 h-3 text-[#C89D56]" />}
                </div>

                <div className="font-serif-editorial font-bold text-xs sm:text-sm my-auto leading-tight">
                  {isPlaced ? (
                    <span className="text-amber-200">{placedItem?.word}</span>
                  ) : isNext ? (
                    <span className="text-amber-700 italic">Insert #{idx + 1}</span>
                  ) : (
                    <span className="opacity-40">{target.badge}</span>
                  )}
                </div>

                <div className="text-[9px] font-mono opacity-70">
                  {isPlaced ? placedItem?.badge : 'Empty Socket'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Archival Meaning Box */}
        {activeNote && (
          <div className="bg-[#FAF7F0] border-l-4 border-l-[#C89D56] border border-[#E2D9C8] rounded-xl p-4 text-xs font-dmsans text-[#0A2947] space-y-1 animate-in fade-in">
            <span className="font-mono font-bold text-[#8B5E3C] uppercase tracking-wider block">
              💡 Constitutional Doctrine:
            </span>
            <p className="leading-relaxed">{activeNote}</p>
          </div>
        )}
      </div>

      {/* Available Word Tiles Palette */}
      {!isCompleted ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold">
            <span>Click the Correct Matching Token in Exact Order:</span>
            <span>{availableTokens.length} Tokens Remaining</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {availableTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => handleSelectToken(token)}
                className="px-4 py-3 rounded-xl bg-white border-2 border-[#D3D4C0] hover:border-[#C89D56] hover:bg-[#F3E4C9]/40 text-[#0A2947] font-serif-editorial font-bold text-sm tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center gap-2 group"
              >
                <div className="w-2 h-2 rounded-full bg-[#C89D56] group-hover:scale-125 transition-transform" />
                <span>{token.word}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Victory Completion Certificate */
        <div className="bg-white border-2 border-emerald-500 rounded-2xl p-8 text-center space-y-5 shadow-xl animate-in zoom-in-95">
          <div className="flex justify-center gap-1.5 text-amber-400">
            {[...Array(getStarRating())].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-amber-400" />
            ))}
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-serif-editorial font-bold text-2xl text-[#0A2947]">
              Preamble Successfully Assembled!
            </h3>
            <p className="text-xs sm:text-sm font-dmsans text-[#8B5E3C]">
              You completed the sacred text in <strong>{seconds} seconds</strong> with a <strong>{getStarRating()} Star</strong> rating!
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A2947] text-[#FAF7F0] hover:bg-[#C89D56] hover:text-[#0A2947] font-serif-editorial font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Assemble Again to Beat Your Time</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreambleArchitectGame;
