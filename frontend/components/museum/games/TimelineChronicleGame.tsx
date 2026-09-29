'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, ArrowUp, ArrowDown, CheckCircle2, 
  RotateCcw, Sparkles, Trophy, Clock, HelpCircle, ArrowRight,
  Compass, MapPin, Calendar, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import './ArcadeGames.css';

interface TimelineChronicleGameProps {
  language: Language;
}

interface ChronicleCard {
  id: string;
  year: number;
  title: string;
  location: string;
  description: string;
  category: string;
  badgeColor: string;
}

const CHRONICLE_CARDS: ChronicleCard[] = [
  {
    id: 'chron-1',
    year: 1916,
    title: 'Castes in India at Columbia University',
    location: 'New York, USA',
    description: 'Dr. Ambedkar presents his first anthropology paper demonstrating endogamy as the mechanism of caste hierarchy.',
    category: 'Scholarship',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  {
    id: 'chron-2',
    year: 1927,
    title: 'Mahad Chavadar Lake Satyagraha',
    location: 'Mahad, Maharashtra',
    description: 'Asserting the fundamental human right of untouchables to drink water from the public reservoir, burning the Manusmriti.',
    category: 'Civil Rights',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  {
    id: 'chron-3',
    year: 1932,
    title: 'The Historic Poona Pact',
    location: 'Yerwada Prison, Pune',
    description: 'Securing 148 reserved legislative seats for Depressed Classes under joint electorates to prevent political disenfranchisement.',
    category: 'Politics',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'chron-4',
    year: 1947,
    title: 'Chairmanship of the Drafting Committee',
    location: 'Constitution Hall, New Delhi',
    description: 'Appointed to pilot, architect, and defend the supreme Constitution of the newly independent Republic of India.',
    category: 'Constitution',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  {
    id: 'chron-5',
    year: 1956,
    title: 'The Great Conversion at Deekshabhoomi',
    location: 'Nagpur, Maharashtra',
    description: 'Embracing Buddhism with 500,000 followers, anchoring human dignity and freedom in reason, morality, and compassion.',
    category: 'Dhamma',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  }
];

export const TimelineChronicleGame: React.FC<TimelineChronicleGameProps> = ({
  language
}) => {
  const [cards, setCards] = useState<ChronicleCard[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isAllCorrect, setIsAllCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    soundEffects.playClick();
    let scrambled = [...CHRONICLE_CARDS].sort(() => Math.random() - 0.5);
    if (scrambled[0].year === 1916 && scrambled[4].year === 1956) {
      scrambled = [scrambled[1], scrambled[0], scrambled[2], scrambled[4], scrambled[3]];
    }
    setCards(scrambled);
    setIsVerified(false);
    setIsAllCorrect(false);
    setAttempts(0);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    soundEffects.playFlip();
    setIsVerified(false);
    const updated = [...cards];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setCards(updated);
  };

  const moveDown = (index: number) => {
    if (index === cards.length - 1) return;
    soundEffects.playFlip();
    setIsVerified(false);
    const updated = [...cards];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setCards(updated);
  };

  const verifyOrder = () => {
    soundEffects.playClick();
    setAttempts(prev => prev + 1);
    setIsVerified(true);

    let allCorrect = true;
    for (let i = 0; i < cards.length - 1; i++) {
      if (cards[i].year > cards[i + 1].year) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      soundEffects.playSuccess();
      soundEffects.playCoinDrop();
      setIsAllCorrect(true);
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      soundEffects.playWrong();
      setIsAllCorrect(false);
    }
  };

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
      {/* Header Arcade Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-serif-editorial text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <History className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Tactile Time-Machine Speed Sorter</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            Timeline Time-Traveler: The Epoch Sorter
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl">
            Babasaheb's historic milestones have been scrambled across space-time! Use the arrows to arrange them from earliest (1916) to latest (1956).
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-[#C89D56] font-mono text-xs text-[#0A2947] shadow-sm">
            <span className="font-bold">Attempts: {attempts}</span>
          </div>

          <button
            onClick={resetGame}
            title="Scramble Cards Again"
            className="p-2.5 rounded-2xl bg-white border border-[#D3D4C0] text-[#8B5E3C] hover:text-[#0A2947] hover:border-[#0A2947] transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Chrono-Rail Track */}
      <div className="space-y-3 relative z-10">
        {cards.map((card, idx) => {
          const isCorrectPosition = isVerified && card.year === CHRONICLE_CARDS[idx].year;

          return (
            <div
              key={card.id}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                isAllCorrect
                  ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-400'
                  : isVerified && isCorrectPosition
                  ? 'bg-emerald-50/60 border-emerald-400'
                  : isVerified && !isCorrectPosition
                  ? 'bg-rose-50/60 border-rose-300'
                  : 'bg-white border-[#D3D4C0] hover:border-[#C89D56] hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Station Number Badge */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 mt-0.5 shadow-sm ${
                  isAllCorrect
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0A2947] text-[#C89D56]'
                }`}>
                  #{idx + 1}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${card.badgeColor}`}>
                      {card.category}
                    </span>
                    <span className="text-xs font-mono text-[#8B5E3C] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {card.location}
                    </span>
                    {isVerified && (
                      <span className="text-xs font-mono font-bold text-[#0A2947] bg-[#FAF7F0] px-2 py-0.5 rounded border border-[#E2D9C8]">
                        📅 Year: {card.year}
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif-editorial font-bold text-base sm:text-lg text-[#0A2947]">
                    {card.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-dmsans text-[#0A2947]/80 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Up / Down Controls */}
              {!isAllCorrect && (
                <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2D9C8]">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-2 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947] hover:bg-[#C89D56] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-sm"
                    title="Shift Earlier"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === cards.length - 1}
                    className="p-2 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947] hover:bg-[#C89D56] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-sm"
                    title="Shift Later"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verify Button or Victory Banner */}
      {!isAllCorrect ? (
        <div className="pt-2 flex justify-end">
          <button
            onClick={verifyOrder}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#0A2947] to-[#142A4D] text-[#FAF7F0] font-serif-editorial font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-xl border border-amber-300"
          >
            <CheckCircle2 className="w-5 h-5 text-[#C89D56]" />
            <span>Verify Chronological Order</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 text-center space-y-3 shadow-lg animate-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-serif-editorial font-bold text-xl text-emerald-950">
            Timeline Synchronized Flawlessly!
          </h3>
          <p className="text-xs sm:text-sm font-dmsans text-emerald-900 max-w-md mx-auto">
            You successfully aligned the 5 monumental epochs of Babasaheb’s lifelong crusade from Columbia University (1916) to Deekshabhoomi (1956)!
          </p>
        </div>
      )}
    </div>
  );
};

export default TimelineChronicleGame;
