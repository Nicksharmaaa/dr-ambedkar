'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Puzzle, Sparkles, CheckCircle2, RotateCcw, 
  Trophy, Clock, BookOpen, Landmark, ArrowRight,
  Flame, Star, Check, Volume2, Award, Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
import { speechController } from '@/utils/speechUtils';
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
  themeColor: string;
}

const PREAMBLE_SEQUENCE: PreambleToken[] = [
  { 
    id: 't1', 
    word: 'WE, THE PEOPLE OF INDIA', 
    category: 'opening', 
    badge: 'Source of Sovereign Authority', 
    historicalNote: 'Affirms that all democratic power originates directly from the citizens of India, not a British monarch or feudal princes.',
    themeColor: 'from-[#0A2947] to-[#142A4D]'
  },
  { 
    id: 't2', 
    word: 'SOVEREIGN', 
    category: 'nature', 
    badge: 'Independent Republic', 
    historicalNote: 'India is completely independent and internally supreme, free from any external dominion, colonial treaties, or foreign dictates.',
    themeColor: 'from-[#784315] to-[#B48842]'
  },
  { 
    id: 't3', 
    word: 'SOCIALIST', 
    category: 'nature', 
    badge: 'Economic Welfare Goal', 
    historicalNote: 'Directs state policy to eradicate systemic poverty and prevent monopolistic concentration of wealth for common welfare.',
    themeColor: 'from-[#5C1D1D] to-[#991B1B]'
  },
  { 
    id: 't4', 
    word: 'SECULAR', 
    category: 'nature', 
    badge: 'Equal Religious Dignity', 
    historicalNote: 'The State treats all faiths with equal dignity and neutrality without establishing a theocracy or favoring any creed.',
    themeColor: 'from-[#063F35] to-[#047857]'
  },
  { 
    id: 't5', 
    word: 'DEMOCRATIC', 
    category: 'nature', 
    badge: 'Associated Living', 
    historicalNote: 'Dr. Ambedkar defined democracy primarily as a mode of associated living and human fraternity rooted in adult suffrage.',
    themeColor: 'from-[#1E293B] to-[#3B82F6]'
  },
  { 
    id: 't6', 
    word: 'REPUBLIC', 
    category: 'nature', 
    badge: 'Elected Head of State', 
    historicalNote: 'The President is elected by the people, permanently abolishing hereditary monarchy and aristocratic titles.',
    themeColor: 'from-[#431407] to-[#C2410C]'
  },
  { 
    id: 't7', 
    word: 'JUSTICE', 
    category: 'pillar', 
    badge: 'Social, Economic & Political', 
    historicalNote: 'Social, Economic and Political justice to emancipate the oppressed and establish equal rights.',
    themeColor: 'from-[#0A2947] to-[#2563EB]'
  },
  { 
    id: 't8', 
    word: 'LIBERTY', 
    category: 'pillar', 
    badge: 'Thought, Faith & Worship', 
    historicalNote: 'Liberty of thought, expression, belief, faith, and worship as the cornerstone of human intellect.',
    themeColor: 'from-[#701A75] to-[#A21CAF]'
  },
  { 
    id: 't9', 
    word: 'EQUALITY', 
    category: 'pillar', 
    badge: 'Status & Opportunity', 
    historicalNote: 'Equality of status and of opportunity; total eradication of untouchability, graded inequality, and caste hierarchy.',
    themeColor: 'from-[#065F46] to-[#059669]'
  },
  { 
    id: 't10', 
    word: 'FRATERNITY', 
    category: 'pillar', 
    badge: 'Dignity & Unity', 
    historicalNote: 'Assuring the dignity of the individual and the supreme unity and integrity of the Nation; the moral soul of democracy.',
    themeColor: 'from-[#854D0E] to-[#CA8A04]'
  }
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
  const [copiedShare, setCopiedShare] = useState(false);

  // Reset Game
  const resetGame = useCallback(() => {
    soundEffects.playClick();
    speechController.stop();
    const shuffled = [...PREAMBLE_SEQUENCE].sort(() => Math.random() - 0.5);
    setAvailableTokens(shuffled);
    setPlacedTokens([]);
    setActiveNote(null);
    setSeconds(0);
    setIsTimerRunning(false);
    setIsCompleted(false);
    setComboCount(0);
    setCopiedShare(false);
  }, []);

  // Shuffle tokens on initial mount
  useEffect(() => {
    resetGame();
  }, [resetGame]);

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
      setActiveNote(`${token.word}: ${token.historicalNote}`);
      setComboCount(prev => prev + 1);

      // Play chime speech synthesis for term
      speechController.speak(token.word, 'en');

      if (updatedPlaced.length === PREAMBLE_SEQUENCE.length) {
        setIsCompleted(true);
        setIsTimerRunning(false);
        soundEffects.playCoinDrop();
        confetti({
          particleCount: 140,
          spread: 85,
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

  const handleCopyCitation = () => {
    const text = `I reconstructed the Sacred Preamble of the Indian Constitution in ${seconds}s with ${getStarRating()} Stars in the Dr. B. R. Ambedkar Archival Learning Hub!`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden font-dmsans">
      {/* Header Arcade Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-mono text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Puzzle className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Station 3 · Tactile Word-Sequence Jigsaw</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            Preamble Architect: The Sacred Word Mosaic
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl leading-relaxed">
            Reconstruct India’s supreme constitutional preamble in its authentic historical order. Snap each illuminated token into its golden socket!
          </p>
        </div>

        {/* Timer, Combo & Controls */}
        <div className="flex items-center gap-3">
          {comboCount > 1 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-3.5 py-2 rounded-2xl font-mono text-xs font-bold shadow animate-pulse">
              <Flame className="w-4 h-4 fill-white" />
              <span>{comboCount}x Cadence!</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border-2 border-[#C89D56] font-mono text-xs text-[#0A2947] shadow-sm">
            <Clock className="w-4 h-4 text-[#C89D56]" />
            <span className="font-bold">Time: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
          </div>

          <button
            onClick={resetGame}
            title="Reset Puzzle"
            className="p-3 rounded-2xl bg-white border border-[#D3D4C0] text-[#8B5E3C] hover:text-[#0A2947] hover:border-[#0A2947] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Golden Illuminated Manuscript Frame */}
      <div className="bg-white preamble-illuminated-border rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
        {/* Subtle Watermark */}
        <Landmark className="absolute -right-8 -bottom-8 w-72 h-72 text-[#C89D56]/[0.04] pointer-events-none select-none" />

        <div className="text-center border-b border-[#F4EBD9] pb-4">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#8B5E3C] font-bold">
            Constituent Assembly of India — 26 November 1949
          </div>
          <h3 className="font-serif-editorial font-bold text-2xl sm:text-3xl text-[#0A2947] tracking-wider mt-1">
            THE CONSTITUTION OF INDIA
          </h3>
          <div className="text-xs font-serif-editorial text-[#8B5E3C] italic mt-0.5">
            Original Preamble Calligraphic Folio by Beohar Rammanohar Sinha & Nandalal Bose
          </div>
        </div>

        {/* Narrative Preamble Canvas with Illuminated Embedded Sockets */}
        <div className="bg-[#FAF7F0] p-6 rounded-2xl border border-[#E2D9C8] font-serif-editorial text-[#0A2947] leading-loose text-base sm:text-lg space-y-4">
          <p>
            {placedTokens.length > 0 ? (
              <span className="inline-block px-3 py-1 rounded-xl bg-[#0A2947] text-amber-200 font-bold shadow-sm mr-2 text-sm sm:text-base border border-[#C89D56]">
                {placedTokens[0].word}
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-xl border-2 border-dashed border-amber-500 bg-amber-100/50 text-amber-900 font-bold text-xs font-mono mr-2 animate-pulse">
                [ 1. INSERT SOURCE OF AUTHORITY ]
              </span>
            )}
            having solemnly resolved to constitute India into a
          </p>

          {/* 5 Republic Nature Tokens */}
          <div className="flex flex-wrap items-center gap-2 my-2">
            {[1, 2, 3, 4, 5].map((idx) => {
              const isPlaced = placedTokens.length > idx;
              const isNext = placedTokens.length === idx;
              const token = isPlaced ? placedTokens[idx] : null;

              if (isPlaced && token) {
                return (
                  <span
                    key={idx}
                    className={`inline-block px-3 py-1.5 rounded-xl text-white font-bold shadow-md text-xs sm:text-sm bg-gradient-to-r ${token.themeColor} border border-amber-300`}
                  >
                    {token.word}
                  </span>
                );
              }
              return (
                <span
                  key={idx}
                  className={`inline-block px-3 py-1.5 rounded-xl text-xs font-mono font-bold border-2 border-dashed ${
                    isNext
                      ? 'border-amber-500 bg-amber-100/80 text-amber-950 animate-pulse'
                      : 'border-slate-300 bg-white/70 text-slate-400'
                  }`}
                >
                  [{idx + 1}. {PREAMBLE_SEQUENCE[idx].word}]
                </span>
              );
            })}
          </div>

          <p>and to secure to all its citizens:</p>

          {/* 4 Core Pillars: Justice, Liberty, Equality, Fraternity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm sm:text-base">
            {[6, 7, 8, 9].map((idx) => {
              const isPlaced = placedTokens.length > idx;
              const isNext = placedTokens.length === idx;
              const token = isPlaced ? placedTokens[idx] : null;
              const label = PREAMBLE_SEQUENCE[idx].badge;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isPlaced
                      ? 'bg-white border-[#C89D56] shadow-sm'
                      : isNext
                      ? 'bg-amber-50 border-amber-400 border-dashed animate-pulse'
                      : 'bg-white/50 border-dashed border-slate-300 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#8B5E3C]">#{idx + 1}</span>
                    {isPlaced && token ? (
                      <span className="font-bold text-[#0A2947]">{token.word}</span>
                    ) : (
                      <span className="text-xs font-mono italic text-slate-500">[{PREAMBLE_SEQUENCE[idx].word}]</span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#8B5E3C]">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Archival Meaning Box */}
        {activeNote && (
          <div className="bg-[#FAF7F0] border-l-4 border-l-[#C89D56] border border-[#E2D9C8] rounded-2xl p-4 text-xs font-dmsans text-[#0A2947] space-y-1 animate-in fade-in shadow-xs">
            <span className="font-mono font-bold text-[#8B5E3C] uppercase tracking-wider block">
              💡 Constitutional Doctrine:
            </span>
            <p className="leading-relaxed text-sm">{activeNote}</p>
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
                className="px-4 py-3 rounded-2xl bg-white border-2 border-[#D3D4C0] hover:border-[#C89D56] hover:bg-[#F3E4C9]/40 text-[#0A2947] font-serif-editorial font-bold text-sm tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center gap-2.5 group"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#C89D56] group-hover:scale-125 transition-transform" />
                <span>{token.word}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF7F0] text-[#8B5E3C]">
                  {token.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Victory Completion Certificate */
        <div className="bg-white border-3 border-emerald-500 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-center gap-1.5 text-amber-400">
            {[...Array(getStarRating())].map((_, i) => (
              <Star key={i} className="w-9 h-9 fill-amber-400" />
            ))}
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold uppercase">
              🏛️ Constitutional Architect Certified
            </span>
            <h3 className="font-serif-editorial font-bold text-3xl text-[#0A2947]">
              Preamble Successfully Assembled!
            </h3>
            <p className="text-sm font-dmsans text-[#8B5E3C] leading-relaxed">
              You reconstructed the sacred text of the Sovereign Democratic Republic in <strong>{seconds} seconds</strong> with a <strong>{getStarRating()} Star</strong> cadence rating!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCopyCitation}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-[#0A2947] text-[#0A2947] hover:bg-[#FAF7F0] font-serif-editorial font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedShare ? 'Copied to Clipboard!' : 'Share Achievement'}</span>
            </button>

            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0A2947] text-[#FAF7F0] hover:bg-[#C89D56] hover:text-[#0A2947] font-serif-editorial font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
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
