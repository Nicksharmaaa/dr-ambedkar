'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Award, RotateCw, CheckCircle2, 
  XCircle, ArrowRight, ShieldCheck, Scale, Compass,
  BookOpen, Heart, Flame, ShieldAlert, Coins, ChevronRight,
  Gavel, Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import './ArcadeGames.css';

interface ConstitutionWheelGameProps {
  language: Language;
}

interface WheelSegment {
  id: string;
  article: string;
  title: string;
  themeColor: string;
  accentColor: string;
  iconName: string;
  scenario: {
    title: string;
    description: string;
    question: string;
    correctAnswer: 'violation' | 'permissible';
    legalRationale: string;
    ambedkarDoctrine: string;
  };
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  {
    id: 'art-14',
    article: 'Article 14',
    title: 'Equality Before Law',
    themeColor: '#0A2947',
    accentColor: '#3b82f6',
    iconName: 'scale',
    scenario: {
      title: 'The Differential Traffic Penalty',
      description: 'A municipal corporation issues a decree charging higher fines to auto-rickshaw drivers than luxury car owners for identical parking infractions.',
      question: 'Does this municipal policy violate Article 14 equality before law?',
      correctAnswer: 'violation',
      legalRationale: 'Article 14 forbids arbitrary discrimination and mandates that equal offenses under equal circumstances must be treated uniformly without bias towards wealth.',
      ambedkarDoctrine: "Equality may be a fiction but nonetheless one must accept it as the governing principle of a civilized democracy."
    }
  },
  {
    id: 'art-17',
    article: 'Article 17',
    title: 'Abolition of Untouchability',
    themeColor: '#5c1d1d',
    accentColor: '#ef4444',
    iconName: 'chains',
    scenario: {
      title: 'The Village Well Restriction',
      description: 'Village elders claim that private customary tradition allows them to bar certain community members from drawing water from a newly constructed village borewell.',
      question: 'Is this customary village restriction a constitutional violation?',
      correctAnswer: 'violation',
      legalRationale: 'Article 17 completely outlaws untouchability in any form, whether practiced by state actors or private citizens, backed by the Protection of Civil Rights Act.',
      ambedkarDoctrine: "Untouchability is an unnatural and anti-social institution that robs human beings of life and natural fellowship."
    }
  },
  {
    id: 'art-19',
    article: 'Article 19',
    title: 'Freedom of Speech',
    themeColor: '#784315',
    accentColor: '#f59e0b',
    iconName: 'megaphone',
    scenario: {
      title: 'The Peaceful Student Protest',
      description: 'University authorities ban students from wearing black armbands in peaceful protest against hostel fee hikes, citing disruption of campus dignity.',
      question: 'Does peaceful armband protest fall under constitutionally protected freedom of expression?',
      correctAnswer: 'permissible',
      legalRationale: 'Article 19(1)(a) protects symbolic speech, including peaceful armband protests, unless it incites violence or threatens public order.',
      ambedkarDoctrine: "Democracy cannot survive without the fearless expression of independent and dissenting opinions."
    }
  },
  {
    id: 'art-21',
    article: 'Article 21',
    title: 'Right to Life & Dignity',
    themeColor: '#063f35',
    accentColor: '#10b981',
    iconName: 'heart',
    scenario: {
      title: 'Clean Drinking Water as Fundamental Right',
      description: 'An industrial plant discharges chemical sludge into a municipal river, contaminating the drinking water of neighboring settlements.',
      question: 'Does polluting community drinking water violate Article 21 Right to Life?',
      correctAnswer: 'violation',
      legalRationale: 'The Supreme Court held in Subhash Kumar (1991) that Article 21 encompasses the right to clean water and pollution-free air necessary for dignified living.',
      ambedkarDoctrine: "Life is not merely animal existence; it is the fundamental right to live with health, honor, and human dignity."
    }
  },
  {
    id: 'art-21a',
    article: 'Article 21A',
    title: 'Right to Education',
    themeColor: '#1e293b',
    accentColor: '#60a5fa',
    iconName: 'book',
    scenario: {
      title: 'Refusal of Admission to Migrant Child',
      description: 'A neighborhood government school denies admission to an 8-year-old child because their itinerant migrant parents cannot provide a local residence certificate.',
      question: 'Does denying school admission to the child violate Article 21A?',
      correctAnswer: 'violation',
      legalRationale: 'Article 21A and the Right to Education Act mandate free and compulsory education for all children aged 6 to 14 without bureaucratic residency barriers.',
      ambedkarDoctrine: "Cultivation of mind should be the ultimate aim of human existence. Education is the weapon of social emancipation."
    }
  },
  {
    id: 'art-32',
    article: 'Article 32',
    title: 'Constitutional Remedies',
    themeColor: '#431407',
    accentColor: '#fb923c',
    iconName: 'pillar',
    scenario: {
      title: 'Direct Supreme Court Habeas Corpus Petition',
      description: 'A citizen detained without charge or magistrate presentation for 48 hours files a writ petition directly with the Supreme Court.',
      question: 'Can the Supreme Court be approached directly without first going to lower courts?',
      correctAnswer: 'permissible',
      legalRationale: 'Article 32 guarantees direct access to the Supreme Court as a Fundamental Right itself to enforce any fundamental rights violation.',
      ambedkarDoctrine: "Article 32 is the very soul of the Constitution and the very heart of it. Without it, rights are mere paper promises."
    }
  },
  {
    id: 'art-39',
    article: 'Article 39',
    title: 'Economic Justice',
    themeColor: '#142a4d',
    accentColor: '#38bdf8',
    iconName: 'cornucopia',
    scenario: {
      title: 'Monopoly Over Essential Food Commodities',
      description: 'A conglomerate corners 85% of grain storage silos, hoarding supplies to drive up market prices for working-class consumers.',
      question: 'Does the State have the constitutional mandate to regulate this concentration of wealth under Article 39?',
      correctAnswer: 'permissible',
      legalRationale: 'Article 39(b) and (c) explicitly command the State to ensure ownership of material resources subserves the common good and prevents detrimental concentration of wealth.',
      ambedkarDoctrine: "We must establish State regulation so that private capital cannot monopolize democratic life or starve the laborer."
    }
  },
  {
    id: 'art-51a',
    article: 'Article 51A',
    title: 'Brotherhood & Scientific Temper',
    themeColor: '#2e1065',
    accentColor: '#c084fc',
    iconName: 'compass',
    scenario: {
      title: 'Promoting Superstition and Hate Speech',
      description: 'A public official uses government resources to organize superstition rituals and incite prejudice against a linguistic minority.',
      question: 'Does this conduct violate the constitutional duties enshrined in Article 51A(h) and 51A(e)?',
      correctAnswer: 'violation',
      legalRationale: 'Article 51A duties call upon every citizen to promote harmony, the spirit of common brotherhood, and develop scientific temper and humanism.',
      ambedkarDoctrine: "Fraternity is the principle which gives unity and solidarity to social life. Without fraternity, equality and liberty are mere coats of paint."
    }
  }
];

export const ConstitutionWheelGame: React.FC<ConstitutionWheelGameProps> = ({
  language
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<WheelSegment | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<'violation' | 'permissible' | null>(null);
  const [tokensCollected, setTokensCollected] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [tickerBump, setTickerBump] = useState(false);
  const [floatingCoins, setFloatingCoins] = useState<number[]>([]);

  const handleSpinWheel = () => {
    if (isSpinning) return;
    soundEffects.playClick();
    setIsSpinning(true);
    setSelectedSegment(null);
    setSelectedAnswer(null);

    // Number of segments
    const sliceCount = WHEEL_SEGMENTS.length;
    const sliceAngle = 360 / sliceCount; // 45 degrees per slice
    const randomSlice = Math.floor(Math.random() * sliceCount);
    const extraSpins = 6 * 360; // 6 full fast loops
    // In our SVG layout, slice index 0 starts at top-right, calculate pointer offset so top pointer lands exactly on slice center
    const targetSliceAngle = (sliceCount - randomSlice) * sliceAngle - sliceAngle / 2;
    const currentBaseAngle = Math.floor(rotationAngle / 360) * 360;
    const finalAngle = currentBaseAngle + extraSpins + targetSliceAngle;

    // Ratchet sound ticks + physical flapper vibration
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundEffects.playWheelTick();
      setTickerBump(prev => !prev);
      tickCount++;
      if (tickCount > 30) clearInterval(tickInterval);
    }, 100);

    setRotationAngle(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedSegment(WHEEL_SEGMENTS[randomSlice]);
      soundEffects.playSuccess();
    }, 3400);
  };

  const handleAnswer = (ans: 'violation' | 'permissible') => {
    if (!selectedSegment || selectedAnswer !== null) return;
    setSelectedAnswer(ans);

    // Play judicial stamp sound
    soundEffects.playStampSlam();

    if (ans === selectedSegment.scenario.correctAnswer) {
      setTimeout(() => {
        soundEffects.playSuccess();
        soundEffects.playCoinDrop();
        setTokensCollected(prev => prev + 1);
        setStreakCount(prev => prev + 1);
        setFloatingCoins(prev => [...prev, Date.now()]);
        
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 350);
    } else {
      setTimeout(() => {
        soundEffects.playGavel();
        setStreakCount(0);
      }, 300);
    }
  };

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
      {/* Background radial gold glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Arcade Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-serif-editorial text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Scale className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Interactive Citizen Dilemma Game</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight flex items-center gap-2">
            The Constitution Wheel of Rights
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl">
            Spin the 8-spoke Dharma Wheel to land on a landmark Constitutional Article, then render your Supreme Court ruling on a real-world citizen dilemma!
          </p>
        </div>

        {/* Tokens & Streak Counter */}
        <div className="flex items-center gap-3">
          {streakCount > 1 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-sm animate-pulse">
              <Flame className="w-4 h-4 fill-white" />
              <span>{streakCount}x Streak!</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 bg-gradient-to-br from-[#0A2947] to-[#041424] text-white px-4 py-2 rounded-2xl border border-[#C89D56]/50 shadow-md">
            <div className="w-7 h-7 rounded-full bg-[#C89D56] text-[#0A2947] flex items-center justify-center font-bold text-sm shadow">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-mono font-bold text-amber-300">
                {tokensCollected} Tokens
              </div>
              <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">
                Guardian Vault
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Wheel & Courtroom Trial Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left: The Deluxe 3D Ashoka Wheel Station (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-5">
          {/* Wheel Frame with Outer Brass Rivets */}
          <div className="relative w-72 h-72 sm:w-84 sm:h-84 select-none">
            {/* Top Mechanical Pointer Peg with Ratchet Flapper */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
              <div className={`w-6 h-8 bg-gradient-to-b from-amber-300 to-amber-600 rounded-b-md shadow-lg border-2 border-[#0A2947] origin-top transition-transform ${tickerBump ? 'animate-ticker-bump' : ''}`}>
                <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1" />
              </div>
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-rose-600 filter drop-shadow" />
            </div>

            {/* Glowing Outer Arcade Rim with 16 Brass Studs */}
            <div className="w-full h-full rounded-full p-2.5 bg-gradient-to-br from-[#d4af37] via-[#85581A] to-[#aa820a] shadow-2xl relative border-4 border-[#3e220e]">
              {/* Outer decorative studs that blink during spin */}
              {[...Array(16)].map((_, i) => {
                const angle = (i * 360) / 16;
                return (
                  <div
                    key={i}
                    className={`absolute w-3 h-3 rounded-full border border-amber-900 z-20 ${
                      isSpinning ? 'arcade-bulb' : 'bg-gradient-to-br from-yellow-200 to-amber-500 shadow-sm'
                    }`}
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -156px) rotate(-${angle}deg)`,
                      animationDelay: `${i * 0.08}s`
                    }}
                  />
                );
              })}

              {/* The Rotating High-Fidelity SVG Dharma Wheel */}
              <div
                className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3400ms] cubic-bezier(0.15, 0.9, 0.2, 1) shadow-inner"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    {WHEEL_SEGMENTS.map((seg, i) => (
                      <linearGradient key={seg.id} id={`grad-${seg.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={seg.themeColor} />
                        <stop offset="100%" stopColor="#041424" />
                      </linearGradient>
                    ))}
                  </defs>

                  {/* 8 Wedge Paths */}
                  {WHEEL_SEGMENTS.map((seg, i) => {
                    const startAngle = (i * 45 - 90) * (Math.PI / 180);
                    const endAngle = ((i + 1) * 45 - 90) * (Math.PI / 180);
                    const x1 = 200 + 195 * Math.cos(startAngle);
                    const y1 = 200 + 195 * Math.sin(startAngle);
                    const x2 = 200 + 195 * Math.cos(endAngle);
                    const y2 = 200 + 195 * Math.sin(endAngle);
                    const d = `M 200 200 L ${x1} ${y1} A 195 195 0 0 1 ${x2} ${y2} Z`;

                    // Midpoint for text
                    const midAngle = ((i + 0.5) * 45 - 90) * (Math.PI / 180);
                    const tx = 200 + 130 * Math.cos(midAngle);
                    const ty = 200 + 130 * Math.sin(midAngle);
                    const rotText = (i + 0.5) * 45;

                    return (
                      <g key={seg.id}>
                        <path
                          d={d}
                          fill={`url(#grad-${seg.id})`}
                          stroke="#C89D56"
                          strokeWidth="2.5"
                        />
                        {/* Spoke Divider Line */}
                        <line
                          x1="200"
                          y1="200"
                          x2={x1}
                          y2={y1}
                          stroke="#FFD700"
                          strokeWidth="2"
                        />
                        {/* Article Text on Wedge */}
                        <g transform={`translate(${tx}, ${ty}) rotate(${rotText + 90})`}>
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#FFFFFF"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                          >
                            {seg.article}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Outer Inner Ring */}
                  <circle cx="200" cy="200" r="192" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.6" />

                  {/* Center Ashoka Chakra Hub */}
                  <circle cx="200" cy="200" r="55" fill="#0A2947" stroke="#FFD700" strokeWidth="4" />
                  <circle cx="200" cy="200" r="48" fill="#142A4D" />

                  {/* 24 Tiny Radial Spokes in Center */}
                  {[...Array(24)].map((_, idx) => {
                    const spAngle = (idx * 360) / 24 * (Math.PI / 180);
                    const sx = 200 + 44 * Math.cos(spAngle);
                    const sy = 200 + 44 * Math.sin(spAngle);
                    return (
                      <line
                        key={idx}
                        x1="200"
                        y1="200"
                        x2={sx}
                        y2={sy}
                        stroke="#FFD700"
                        strokeWidth="1.2"
                        opacity="0.8"
                      />
                    );
                  })}

                  {/* Center Brass Gem */}
                  <circle cx="200" cy="200" r="18" fill="url(#grad-art-19)" stroke="#FFD700" strokeWidth="2.5" />
                  <circle cx="200" cy="200" r="6" fill="#FFD700" />
                </svg>
              </div>
            </div>
          </div>

          {/* Big Tactile 3D Arcade Spin Button */}
          <button
            onClick={handleSpinWheel}
            disabled={isSpinning}
            className={`w-full max-w-xs py-3.5 px-6 rounded-2xl font-serif-editorial font-bold text-base uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xl flex items-center justify-center gap-2.5 border-2 ${
              isSpinning
                ? 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-b from-[#C89D56] via-[#B48842] to-[#8B5E3C] text-[#FAF7F0] border-amber-300 hover:brightness-110 active:translate-y-1 pulse-gold-glow'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'The Wheel Is Turning...' : 'Spin the Wheel of Rights!'}</span>
          </button>
        </div>

        {/* Right: The Constitutional Courtroom Trial Box (7 cols) */}
        <div className="lg:col-span-7">
          {selectedSegment ? (
            <div className="bg-white border-2 border-[#C89D56] rounded-2xl p-6 sm:p-7 shadow-lg space-y-5 animate-in fade-in zoom-in-95 relative overflow-hidden">
              {/* Landed Banner */}
              <div className="flex items-center justify-between border-b border-[#F4EBD9] pb-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0A2947] text-[#C89D56] px-3 py-1 rounded-lg font-bold">
                    🎯 LANDED: {selectedSegment.article}
                  </span>
                  <span className="text-[#8B5E3C] font-semibold">
                    {selectedSegment.title}
                  </span>
                </div>
                <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 font-bold">
                  Dilemma #{selectedSegment.id}
                </span>
              </div>

              {/* Case Briefing */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-serif-editorial font-bold text-[#0A2947]">
                  {selectedSegment.scenario.title}
                </h3>
                <p className="text-sm font-dmsans text-[#0A2947]/90 leading-relaxed bg-[#FAF7F0] p-4 rounded-xl border border-[#E2D9C8]">
                  {selectedSegment.scenario.description}
                </p>
              </div>

              {/* The Trial Question */}
              <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200/80 rounded-xl p-4">
                <div className="text-xs font-mono font-bold text-blue-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-[#C89D56]" />
                  <span>Constitutional Question for Your Judicial Bench:</span>
                </div>
                <p className="text-sm font-serif-editorial font-bold text-[#0A2947]">
                  "{selectedSegment.scenario.question}"
                </p>
              </div>

              {/* Action Buttons: The Two Judicial Wax Seal Stampers */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold">
                  Render Your Judicial Verdict:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Seal 1: Unconstitutional Violation */}
                  <button
                    onClick={() => handleAnswer('violation')}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      selectedAnswer === 'violation'
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 animate-stamp-slam'
                        : selectedAnswer !== null
                        ? 'bg-slate-50 border-slate-200 opacity-50'
                        : 'bg-white border-rose-200 text-rose-950 hover:bg-rose-50 hover:border-rose-400 hover:shadow-md'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif-editorial font-bold text-sm text-rose-950">
                        Unconstitutional Violation
                      </div>
                      <div className="text-[11px] font-mono text-rose-700">
                        Infringes Fundamental Rights
                      </div>
                    </div>
                  </button>

                  {/* Seal 2: Permissible & Protected */}
                  <button
                    onClick={() => handleAnswer('permissible')}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      selectedAnswer === 'permissible'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 animate-stamp-slam'
                        : selectedAnswer !== null
                        ? 'bg-slate-50 border-slate-200 opacity-50'
                        : 'bg-white border-emerald-200 text-emerald-950 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-md'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif-editorial font-bold text-sm text-emerald-950">
                        Permissible & Protected
                      </div>
                      <div className="text-[11px] font-mono text-emerald-700">
                        Upheld by Constitution
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Rationale & Ambedkar Doctrine Revealed */}
              {selectedAnswer && (
                <div className={`p-5 rounded-2xl border-2 space-y-3 animate-in fade-in ${
                  selectedAnswer === selectedSegment.scenario.correctAnswer
                    ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950'
                    : 'bg-amber-50/70 border-amber-400 text-amber-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-serif-editorial font-bold text-base flex items-center gap-2">
                      {selectedAnswer === selectedSegment.scenario.correctAnswer ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Magnificent Judicial Reasoning! (+1 Guardian Token)</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-5 h-5 text-amber-600" />
                          <span>Judicial Review: Here is the Constitutional Precedent</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-dmsans leading-relaxed">
                    <strong>Legal Rationale:</strong> {selectedSegment.scenario.legalRationale}
                  </p>

                  <div className="bg-white/80 border-l-4 border-l-[#C89D56] rounded-xl p-3 text-xs sm:text-sm font-serif-editorial italic text-[#0A2947]">
                    "{selectedSegment.scenario.ambedkarDoctrine}"
                    <span className="block mt-1 font-mono text-[11px] font-bold text-[#8B5E3C] not-italic">
                      — Dr. B. R. Ambedkar, Constitutional Doctrine
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSpinWheel}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A2947] text-[#FAF7F0] font-serif-editorial font-bold text-xs uppercase tracking-wider hover:bg-[#C89D56] hover:text-[#0A2947] transition-colors cursor-pointer shadow"
                    >
                      <span>Spin for Next Article Dilemma</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standby State */
            <div className="bg-white border-2 border-dashed border-[#D3D4C0] rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#C89D56] flex items-center justify-center mx-auto shadow-inner">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif-editorial font-bold text-xl text-[#0A2947]">
                  The Bench Awaits Your Verdict
                </h3>
                <p className="text-sm font-dmsans text-[#8B5E3C] max-w-md mx-auto mt-1">
                  Hit the golden <strong>"Spin the Wheel of Rights"</strong> button on the left to activate the Dharma Chakra and trigger your next constitutional dilemma!
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#0A2947]/70 pt-2">
                <Award className="w-4 h-4 text-[#C89D56]" />
                <span>Earn Guardian Tokens & Level Up Your Citizen Rank</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstitutionWheelGame;
