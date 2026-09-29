'use client';

import React, { useState } from 'react';
import { 
  Landmark, Gavel, Award, Sparkles, CheckCircle2, 
  XCircle, RotateCcw, ArrowRight, Users, ShieldAlert, Heart,
  Flame, Volume2, Check, HelpCircle, ThumbsUp, ThumbsDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import './ArcadeGames.css';

interface DebateSimulatorGameProps {
  language: Language;
  onExploreDoc?: (docId: string) => void;
}

interface AssemblyMotion {
  id: string;
  articleLabel: string;
  motionTitle: string;
  year: number;
  oppositionSpeaker: string;
  oppositionArgument: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    consensusDelta: number;
    explanation: string;
    ambedkarQuote: string;
  }>;
  cadCitation: string;
}

const MOTIONS: AssemblyMotion[] = [
  {
    id: 'motion-1',
    articleLabel: 'Article 17',
    motionTitle: 'Abolition of Untouchability & Criminal Penalties',
    year: 1948,
    oppositionSpeaker: 'Orthodox Traditionalist Faction',
    oppositionArgument: 'Social customs and caste habits have existed for millennia. The Constitution should not brand traditional religious practices as criminal offences; leave it to gradual social reform without state interference!',
    options: [
      {
        id: 'opt-1a',
        text: 'Dr. Ambedkar’s Defense: Untouchability is a heinous denial of human dignity and an anti-social crime. It must be abolished unconditionally, and its practice in any form made a severely punishable criminal offense by law.',
        isCorrect: true,
        consensusDelta: 25,
        explanation: 'The Assembly overwhelmingly voted with Dr. Ambedkar to declare untouchability abolished and strictly punishable under Article 17.',
        ambedkarQuote: "Our struggle is not for water or temples; it is to establish our natural human rights and prove that we too are human beings."
      },
      {
        id: 'opt-1b',
        text: 'Compromise Stance: Allow customary practices in private homes and restrict the abolition strictly to government premises.',
        isCorrect: false,
        consensusDelta: -15,
        explanation: 'Dr. Ambedkar rejected half-measures. Partial abolition would have legitimized caste segregation in society.',
        ambedkarQuote: "You cannot build anything on the foundations of caste. Anything built on it will crack."
      },
      {
        id: 'opt-1c',
        text: 'Postponement Stance: Let provincial legislatures decide if and when to abolish untouchability after a period of 20 years.',
        isCorrect: false,
        consensusDelta: -20,
        explanation: 'Leaving human rights to local majorities would leave the oppressed defenseless in rural areas.',
        ambedkarQuote: "Rights cannot be protected by mere declarations; they require constitutional guarantees."
      }
    ],
    cadCitation: 'Constituent Assembly Debates, 29 November 1948'
  },
  {
    id: 'motion-2',
    articleLabel: 'Article 32',
    motionTitle: 'The Right to Constitutional Remedies',
    year: 1948,
    oppositionSpeaker: 'Executive Centralist Delegate',
    oppositionArgument: 'Granting citizens the direct right to petition the Supreme Court for writs like Habeas Corpus and Mandamus will paralyze government administration during public emergencies!',
    options: [
      {
        id: 'opt-2a',
        text: 'Dilution Stance: Allow citizens to seek writs only if the central executive cabinet grants prior administrative approval.',
        isCorrect: false,
        consensusDelta: -20,
        explanation: 'Subjecting constitutional remedies to executive permission would destroy fundamental rights entirely.',
        ambedkarQuote: "A right without a remedy is no right at all."
      },
      {
        id: 'opt-2b',
        text: 'Dr. Ambedkar’s Defense: Article 32 is the very soul and heart of the Constitution. Without judicial writs directly enforceable by the Supreme Court, all Fundamental Rights are mere paper declarations.',
        isCorrect: true,
        consensusDelta: 25,
        explanation: 'Dr. Ambedkar famously proclaimed Article 32 as the most important article in the entire Constitution, securing unanimous approval.',
        ambedkarQuote: "If I was asked to name any particular article as the most important, I could not refer to any other article except this one."
      },
      {
        id: 'opt-2c',
        text: 'Alternative Stance: Restrict remedies strictly to monetary compensation rather than binding injunctions against the State.',
        isCorrect: false,
        consensusDelta: -15,
        explanation: 'Monetary fines cannot undo unlawful detentions or restore silenced speech.',
        ambedkarQuote: "The judiciary must stand as an independent bulwark against tyranny."
      }
    ],
    cadCitation: 'Constituent Assembly Debates, 9 December 1948'
  },
  {
    id: 'motion-3',
    articleLabel: 'Universal Suffrage',
    motionTitle: 'One Citizen, One Vote (Universal Adult Franchise)',
    year: 1949,
    oppositionSpeaker: 'Colonial Aristocratic Delegate',
    oppositionArgument: 'Over 82% of our population is illiterate and impoverished. Giving every adult the right to vote will lead to mob rule and chaos. We should require a literacy test and property ownership!',
    options: [
      {
        id: 'opt-3a',
        text: 'Property Franchise: Restrict voting to landholders and income tax payers to ensure fiscal responsibility.',
        isCorrect: false,
        consensusDelta: -25,
        explanation: 'Property-based voting was the colonial system that disenfranchised 90% of Indians.',
        ambedkarQuote: "Political power must belong to the common people, not the propertied few."
      },
      {
        id: 'opt-3b',
        text: 'Dr. Ambedkar’s Defense: Enact universal adult suffrage immediately. Franchise is a birthright of human dignity. Poverty and lack of formal schooling do not deprive a citizen of natural wisdom to elect their leaders.',
        isCorrect: true,
        consensusDelta: 25,
        explanation: 'Dr. Ambedkar and the Drafting Committee made India the world’s largest democracy overnight, granting unconditional voting rights to women and all citizens alike.',
        ambedkarQuote: "Democracy is not merely a form of government; it is primarily a mode of associated living."
      },
      {
        id: 'opt-3c',
        text: 'Gradual Franchise: Grant voting rights only to literate men now, and women after literacy expands in future decades.',
        isCorrect: false,
        consensusDelta: -20,
        explanation: 'Dr. Ambedkar fought vehemently for gender equality, ensuring women had equal voting rights from Day 1.',
        ambedkarQuote: "I measure the progress of a community by the degree of progress which women have achieved."
      }
    ],
    cadCitation: 'Constituent Assembly Debates, 16 June 1949'
  },
  {
    id: 'motion-4',
    articleLabel: 'Uniform Civil Rights',
    motionTitle: 'The Hindu Code Bill & Women’s Property Rights',
    year: 1951,
    oppositionSpeaker: 'Patriarchal Parliamentary Bloc',
    oppositionArgument: 'Giving women equal inheritance rights, outlawing polygamy, and legalizing divorce will destroy the traditional joint family system! The State must not interfere in sacred personal law!',
    options: [
      {
        id: 'opt-4a',
        text: 'Status Quo Stance: Retain male primogeniture and deny married daughters any share in ancestral property.',
        isCorrect: false,
        consensusDelta: -25,
        explanation: 'Denying property rights kept women economically subordinate and vulnerable.',
        ambedkarQuote: "No society can progress while half of its population is chained in social subjugation."
      },
      {
        id: 'opt-4b',
        text: 'Dr. Ambedkar’s Defense: Codify women’s absolute property rights, abolish polygamy, and establish equal grounds for divorce. True independence is meaningless without the legal liberation of Indian women.',
        isCorrect: true,
        consensusDelta: 25,
        explanation: 'Dr. Ambedkar drafted the monumental Hindu Code Bill and even resigned as Law Minister in 1951 when conservative resistance delayed it, cementing women’s rights as non-negotiable.',
        ambedkarQuote: "To leave inequality between class and class, between sex and sex, which is the soul of Hindu society, and to go on passing legislation relating to economic problems is to make a farce of our Constitution."
      },
      {
        id: 'opt-4c',
        text: 'Optional Stance: Make women’s property rights optional only if the father writes an explicit registered will.',
        isCorrect: false,
        consensusDelta: -15,
        explanation: 'Dr. Ambedkar insisted on statutory legal rights as default law, not customary discretion.',
        ambedkarQuote: "Law must be the guardian of the weak against the strong."
      }
    ],
    cadCitation: 'Parliamentary Debates on Hindu Code Bill, 1951'
  }
];

export const DebateSimulatorGame: React.FC<DebateSimulatorGameProps> = ({
  language,
  onExploreDoc
}) => {
  const [currentMotionIndex, setCurrentMotionIndex] = useState(0);
  const [consensusScore, setConsensusScore] = useState(50); // Starts at 50%
  const [ayesCount, setAyesCount] = useState(150);
  const [noesCount, setNoesCount] = useState(150);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showGavelStrike, setShowGavelStrike] = useState(false);
  const [chamberReaction, setChamberReaction] = useState<string | null>(null);

  const motion = MOTIONS[currentMotionIndex];

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const chosen = motion.options.find(o => o.id === optionId);
    if (!chosen) return;

    if (chosen.isCorrect) {
      // Trigger dramatic golden gavel strike
      setShowGavelStrike(true);
      soundEffects.playGavel();
      setTimeout(() => {
        soundEffects.playSuccess();
        soundEffects.playCombo(streak + 1);
      }, 300);

      setConsensusScore(prev => Math.min(100, prev + chosen.consensusDelta));
      setAyesCount(prev => Math.min(300, prev + 50));
      setNoesCount(prev => Math.max(0, prev - 50));
      setStreak(prev => prev + 1);
      setChamberReaction('AYES HAVE IT! Chamber delegates erupt in standing ovation: "Hear, Hear!"');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      soundEffects.playWrong();
      setConsensusScore(prev => Math.max(10, prev + chosen.consensusDelta));
      setAyesCount(prev => Math.max(20, prev - 35));
      setNoesCount(prev => Math.min(280, prev + 35));
      setStreak(0);
      setChamberReaction('SHARP DISSENT! Opposition benches pound tables: "Order! Division called!"');
    }
  };

  const handleNextMotion = () => {
    soundEffects.playClick();
    setShowGavelStrike(false);
    setChamberReaction(null);

    if (currentMotionIndex + 1 < MOTIONS.length) {
      setCurrentMotionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setIsGameFinished(true);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
    }
  };

  const handleRestart = () => {
    soundEffects.playClick();
    setCurrentMotionIndex(0);
    setConsensusScore(50);
    setAyesCount(150);
    setNoesCount(150);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsGameFinished(false);
    setStreak(0);
    setShowGavelStrike(false);
    setChamberReaction(null);
  };

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
      {/* Header Arcade Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-serif-editorial text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Gavel className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Role-Playing Assembly Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            The Constituent Assembly Debate Simulator
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl">
            Step up to the Assembly Rostrum (1948–1951). Defend fundamental human rights against conservative opposition amendments to carry the House!
          </p>
        </div>

        {/* Live Vote Count & Streak */}
        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow animate-pulse">
              <Flame className="w-4 h-4 fill-white" />
              <span>{streak}x Combo!</span>
            </div>
          )}

          {/* Chamber Vote Bar */}
          <div className="bg-white border-2 border-[#C89D56] rounded-2xl p-3 min-w-[210px] shadow-sm text-center">
            <div className="flex items-center justify-between text-xs font-mono mb-1 font-bold">
              <span className="text-emerald-700 flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" /> Ayes: {ayesCount}
              </span>
              <span className="text-rose-700 flex items-center gap-1">
                Noes: {noesCount} <ThumbsDown className="w-3.5 h-3.5" />
              </span>
            </div>
            {/* Visual Balance Bar */}
            <div className="w-full bg-rose-200 h-3 rounded-full overflow-hidden flex border border-[#0A2947]/20">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full transition-all duration-700"
                style={{ width: `${consensusScore}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-[#8B5E3C] mt-1 font-semibold">
              Consensus: {consensusScore}%
            </div>
          </div>
        </div>
      </div>

      {!isGameFinished ? (
        <div className="space-y-6 relative z-10">
          {/* Visual Chamber Arena Stage */}
          <div className="bg-gradient-to-b from-[#0A2947] to-[#041424] rounded-2xl p-5 sm:p-7 text-white border-2 border-[#C89D56] shadow-xl relative overflow-hidden">
            {/* Ambient Parliamentary Hall Chandelier Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Stage Header Info */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-mono">
              <span className="bg-[#C89D56] text-[#0A2947] px-3 py-1 rounded-lg font-bold">
                Motion {currentMotionIndex + 1} of {MOTIONS.length}: {motion.articleLabel}
              </span>
              <span className="text-amber-300 font-serif-editorial">
                🏛️ Constitution Hall, New Delhi ({motion.year})
              </span>
            </div>

            {/* Motion Title */}
            <h3 className="text-xl sm:text-2xl font-serif-editorial font-bold text-amber-200 mt-4">
              {motion.motionTitle}
            </h3>

            {/* Dual Stage Layout: Opposition Podium vs Babasaheb's Rostrum */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5 items-stretch">
              {/* Left: Opposition Speaker (5 cols) */}
              <div className="md:col-span-6 bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                  <div className="w-6 h-6 rounded-full bg-rose-600/80 flex items-center justify-center text-white text-[10px]">
                    ⚠️
                  </div>
                  <span>Opposition Objection: {motion.oppositionSpeaker}</span>
                </div>
                <p className="text-sm font-serif-editorial italic text-rose-100/90 leading-relaxed bg-black/20 p-3 rounded-lg border-l-2 border-rose-400">
                  "{motion.oppositionArgument}"
                </p>
                <div className="text-[11px] font-mono text-rose-300/70">
                  Status: Formal Motion Raised on Floor
                </div>
              </div>

              {/* Right: Speaker Rostrum / Dr. Ambedkar Podium (6 cols) */}
              <div className="md:col-span-6 bg-blue-950/40 border border-amber-400/40 rounded-xl p-4 flex flex-col justify-between space-y-3 relative">
                {/* Golden Gavel Strike Animation Overlay */}
                {showGavelStrike && (
                  <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-30 animate-in fade-in">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#0A2947] flex items-center justify-center mx-auto shadow-2xl animate-gavel-strike border-2 border-white">
                        <Gavel className="w-8 h-8" />
                      </div>
                      <div className="inline-block bg-[#0A2947] text-amber-300 px-4 py-1.5 rounded-full font-serif-editorial font-bold text-sm shadow-xl border border-amber-400">
                        ⚡ ORDER! MOTION ADOPTED!
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  <div className="w-6 h-6 rounded-full bg-[#C89D56] text-[#0A2947] flex items-center justify-center font-bold text-xs">
                    📜
                  </div>
                  <span>Drafting Committee Chairman: Dr. B. R. Ambedkar</span>
                </div>
                <div className="text-xs font-dmsans text-amber-100/80 leading-relaxed">
                  The House awaits Babasaheb's definitive constitutional counter-argument. Select your amendment defense below to rally democratic consensus!
                </div>
                <div className="text-[11px] font-mono text-amber-300/70 flex items-center justify-between">
                  <span>Record: {motion.cadCitation}</span>
                  <span className="text-emerald-400 font-bold">Floor Yielded</span>
                </div>
              </div>
            </div>

            {/* Chamber Live Reaction Banner */}
            {chamberReaction && (
              <div className="mt-4 p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs font-mono text-center animate-in fade-in">
                📢 {chamberReaction}
              </div>
            )}
          </div>

          {/* Player Response Choices */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C89D56]" />
              <span>Choose Dr. Ambedkar’s Constitutional Defense to Deliver to the Assembly:</span>
            </div>

            <div className="space-y-3">
              {motion.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = 'bg-white border-[#D3D4C0] text-[#0A2947] hover:border-[#C89D56] hover:bg-[#F3E4C9]/30';

                if (isAnswered) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/40 shadow-md';
                  } else if (isSelected && !opt.isCorrect) {
                    btnStyle = 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400/40';
                  } else {
                    btnStyle = 'bg-white/60 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={isAnswered}
                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${btnStyle}`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 shadow-sm ${
                        isAnswered && opt.isCorrect ? 'bg-emerald-600 text-white' :
                        isAnswered && isSelected && !opt.isCorrect ? 'bg-rose-600 text-white' :
                        'bg-[#FAF7F0] text-[#0A2947] border border-[#E2D9C8]'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <p className="text-sm font-serif-editorial leading-relaxed font-medium">
                        {opt.text}
                      </p>
                    </div>

                    {isAnswered && (opt.isCorrect || isSelected) && (
                      <div className="mt-3 pt-3 border-t border-current/15 text-xs font-dmsans space-y-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          {opt.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-800">Assembly Passed Amendment! (+{opt.consensusDelta}% Consensus)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span className="text-rose-800">Assembly Fractured! ({opt.consensusDelta}% Consensus)</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs opacity-90">{opt.explanation}</p>
                        
                        {opt.isCorrect && (
                          <div className="bg-emerald-100/60 p-2.5 rounded-lg border-l-2 border-emerald-600 italic font-serif-editorial text-[#0A2947]">
                            "{opt.ambedkarQuote}"
                            <span className="block not-italic font-mono text-[10px] text-emerald-900 font-bold mt-1">
                              — Dr. B. R. Ambedkar, Constituent Assembly of India
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          {isAnswered && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-[#8B5E3C]">
                Official Record: {motion.cadCitation}
              </span>

              <button
                onClick={handleNextMotion}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A2947] text-[#FAF7F0] font-serif-editorial font-bold text-xs uppercase tracking-wider hover:bg-[#C89D56] hover:text-[#0A2947] transition-colors cursor-pointer shadow-lg"
              >
                <span>{currentMotionIndex + 1 < MOTIONS.length ? 'Next Assembly Motion' : 'View Final Verdict'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Victory Screen */
        <div className="bg-white border-2 border-[#C89D56] rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-[#C89D56] text-[#0A2947] flex items-center justify-center mx-auto shadow-2xl">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-mono text-xs font-bold uppercase tracking-wider">
              {consensusScore >= 75 ? '🏆 Grand Democratic Consensus Achieved' : '⚖️ Robust Debate Concluded'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947]">
              The Supreme Constitution Stands Victorious!
            </h3>
            <p className="text-sm font-dmsans text-[#8B5E3C] leading-relaxed">
              You defended foundational human rights, crushed discrimination, and united the Constituent Assembly with a final consensus rating of <strong>{consensusScore}%</strong>!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#0A2947] text-[#0A2947] hover:bg-[#FAF7F0] font-serif-editorial font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay Assembly Debate</span>
            </button>

            {onExploreDoc && (
              <button
                onClick={() => onExploreDoc('constituent-assembly-speech-1949')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A2947] text-[#FAF7F0] hover:bg-[#C89D56] hover:text-[#0A2947] font-serif-editorial font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow"
              >
                <span>Read Original 1949 CAD Speeches</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebateSimulatorGame;
