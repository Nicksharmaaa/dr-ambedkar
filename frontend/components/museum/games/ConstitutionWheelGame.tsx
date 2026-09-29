'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, Award, RotateCw, CheckCircle2, 
  XCircle, ArrowRight, ShieldCheck, Scale, Compass,
  BookOpen, Heart, Flame, ShieldAlert, Coins, ChevronRight,
  Gavel, Volume2, VolumeX, Keyboard, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
import { speechController } from '@/utils/speechUtils';
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
    docketNumber: string;
    petitioner: string;
    respondent: string;
    title: string;
    description: string;
    question: string;
    correctAnswer: 'violation' | 'permissible';
    legalRationale: string;
    landmarkPrecedent: string;
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
      docketNumber: 'SC-WP-1952/14',
      petitioner: 'Federation of Auto-Rickshaw Drivers',
      respondent: 'Municipal Corporation',
      title: 'The Differential Traffic Penalty',
      description: 'A municipal corporation issues a decree charging 5x higher fines to three-wheeled auto-rickshaw drivers than luxury car owners for identical parking infractions, claiming auto-rickshaws cause more public inconvenience.',
      question: 'Does this municipal classification violate Article 14 equality before law?',
      correctAnswer: 'violation',
      legalRationale: 'Article 14 forbids arbitrary discrimination and mandates that equal offenses under equal circumstances must be treated uniformly without bias towards wealth or social status.',
      landmarkPrecedent: 'E.P. Royappa v. State of Tamil Nadu (1974) — "Equality is antithetic to arbitrariness."',
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
      docketNumber: 'SC-WP-1976/17',
      petitioner: 'Depressed Classes Citizens Collective',
      respondent: 'Village Panchayat Elders',
      title: 'The Village Well Restriction',
      description: 'Village elders claim that centuries-old customary tradition allows them to bar certain community members from drawing water from a public borewell built with government funds.',
      question: 'Is this customary village restriction an absolute constitutional violation?',
      correctAnswer: 'violation',
      legalRationale: 'Article 17 completely outlaws untouchability in any form, whether practiced by state actors or private citizens, enforceable under the Protection of Civil Rights Act.',
      landmarkPrecedent: 'State of Karnataka v. Appa Balu Ingale (1993) — "Abolition of untouchability is the cornerstone of social justice."',
      ambedkarDoctrine: "Untouchability is an unnatural and anti-social institution that robs human beings of life and natural fellowship."
    }
  },
  {
    id: 'art-19',
    article: 'Article 19',
    title: 'Freedom of Expression',
    themeColor: '#784315',
    accentColor: '#f59e0b',
    iconName: 'megaphone',
    scenario: {
      docketNumber: 'SC-WP-1982/19',
      petitioner: 'University Student Union',
      respondent: 'State University Administration',
      title: 'The Peaceful Armband Protest',
      description: 'University authorities suspend students for wearing black armbands in silent, peaceful protest against unannounced hostel fee hikes, claiming armbands tarnish campus discipline.',
      question: 'Does peaceful symbolic armband protest fall under constitutionally protected freedom of expression?',
      correctAnswer: 'permissible',
      legalRationale: 'Article 19(1)(a) protects symbolic non-violent expression, including peaceful armband protests, unless it incites violence or undermines public order.',
      landmarkPrecedent: 'Bijoe Emmanuel v. State of Kerala (1986) — "Respectful, silent expression of conscience cannot be penalized."',
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
      docketNumber: 'SC-WP-1991/21',
      petitioner: 'River Valley Residents Association',
      respondent: 'Industrial Sludge Processing Plant',
      title: 'Clean Drinking Water as Fundamental Right',
      description: 'An industrial plant discharges chemical sludge into a municipal river, contaminating the drinking water of neighboring settlements and causing chronic illness.',
      question: 'Does polluting community drinking water violate Article 21 Right to Life?',
      correctAnswer: 'violation',
      legalRationale: 'The Supreme Court held that Article 21 encompasses the right to clean drinking water and pollution-free air necessary for dignified living.',
      landmarkPrecedent: 'Subhash Kumar v. State of Bihar (1991) — "Right to live includes the right of enjoyment of pollution-free water."',
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
      docketNumber: 'SC-WP-2010/21A',
      petitioner: 'Itinerant Construction Workers Society',
      respondent: 'Municipal Primary School Board',
      title: 'Refusal of Admission to Migrant Child',
      description: 'A neighborhood government school denies admission to an 8-year-old child because their itinerant migrant parents cannot provide a permanent local residence certificate.',
      question: 'Does denying school admission for lack of residence documentation violate Article 21A?',
      correctAnswer: 'violation',
      legalRationale: 'Article 21A and the Right to Education Act mandate free and compulsory education for all children aged 6 to 14 without bureaucratic residency barriers.',
      landmarkPrecedent: 'Society for Unaided Private Schools v. Union of India (2012) — "Universal elementary education is non-negotiable."',
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
      docketNumber: 'SC-WP-1978/32',
      petitioner: 'Detained Citizen by Family Counsel',
      respondent: 'State Police Directorate',
      title: 'Direct Supreme Court Habeas Corpus Petition',
      description: 'A citizen detained without charge or magistrate presentation for 48 hours files a writ petition directly with the Supreme Court instead of first exhausting lower court appeals.',
      question: 'Can the Supreme Court be approached directly under Article 32 without first going to lower courts?',
      correctAnswer: 'permissible',
      legalRationale: 'Article 32 guarantees direct access to the Supreme Court as a Fundamental Right itself to enforce any fundamental rights violation.',
      landmarkPrecedent: 'Prem Chand Garg v. Excise Commissioner (1962) — "Article 32 is a basic feature beyond executive curtailment."',
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
      docketNumber: 'SC-WP-1980/39',
      petitioner: 'National Consumer Rights Alliance',
      respondent: 'Grain Storage Monopoly Conglomerate',
      title: 'Monopoly Over Essential Food Commodities',
      description: 'A corporate conglomerate corners 85% of grain storage silos, hoarding supplies to drive up market prices for working-class consumers.',
      question: 'Does the State have the constitutional mandate to regulate this concentration of wealth under Article 39?',
      correctAnswer: 'permissible',
      legalRationale: 'Article 39(b) and (c) explicitly command the State to ensure ownership of material resources subserves the common good and prevents detrimental concentration of wealth.',
      landmarkPrecedent: 'Sanjeev Coke Mfg. Co. v. Bharat Coking Coal (1983) — "Public welfare overrides private monopolistic concentration."',
      ambedkarDoctrine: "We must establish State regulation so that private capital cannot monopolize democratic life or starve the laborer."
    }
  },
  {
    id: 'art-51a',
    article: 'Article 51A',
    title: 'Fraternity & Scientific Temper',
    themeColor: '#2e1065',
    accentColor: '#c084fc',
    iconName: 'compass',
    scenario: {
      docketNumber: 'SC-WP-1994/51A',
      petitioner: 'Civil Liberties Forum',
      respondent: 'Public Welfare Officer',
      title: 'Promoting Superstition and Hate Speech',
      description: 'A public official uses government resources to organize superstition rituals and incite social ostracization against a linguistic minority in government housing.',
      question: 'Does this conduct violate the constitutional duties enshrined in Article 51A(h) and 51A(e)?',
      correctAnswer: 'violation',
      legalRationale: 'Article 51A duties call upon every citizen and official to promote harmony, the spirit of common brotherhood, and develop scientific temper and humanism.',
      landmarkPrecedent: 'AIIMS Students’ Union v. AIIMS (2002) — "Fundamental duties are valuable beacons for interpreting state conduct."',
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [gavelStrikeAnim, setGavelStrikeAnim] = useState(false);

  // Spin Wheel Logic
  const handleSpinWheel = useCallback(() => {
    if (isSpinning) return;
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);
    setIsSpinning(true);
    setSelectedSegment(null);
    setSelectedAnswer(null);

    const sliceCount = WHEEL_SEGMENTS.length;
    const sliceAngle = 360 / sliceCount; // 45 degrees
    const randomSlice = Math.floor(Math.random() * sliceCount);
    const extraSpins = 6 * 360;
    const targetSliceAngle = (sliceCount - randomSlice) * sliceAngle - sliceAngle / 2;
    const currentBaseAngle = Math.floor(rotationAngle / 360) * 360;
    const finalAngle = currentBaseAngle + extraSpins + targetSliceAngle;

    // Wheel tick ratchet sounds
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundEffects.playWheelTick();
      setTickerBump(prev => !prev);
      tickCount++;
      if (tickCount > 28) clearInterval(tickInterval);
    }, 110);

    setRotationAngle(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedSegment(WHEEL_SEGMENTS[randomSlice]);
      soundEffects.playSuccess();
    }, 3400);
  }, [isSpinning, rotationAngle]);

  // Handle Verdict
  const handleAnswer = useCallback((ans: 'violation' | 'permissible') => {
    if (!selectedSegment || selectedAnswer !== null) return;
    setSelectedAnswer(ans);
    setGavelStrikeAnim(true);
    soundEffects.playGavel();
    setTimeout(() => soundEffects.playStampSlam(), 200);

    if (ans === selectedSegment.scenario.correctAnswer) {
      setTimeout(() => {
        soundEffects.playSuccess();
        soundEffects.playCoinDrop();
        setTokensCollected(prev => prev + 1);
        setStreakCount(prev => prev + 1);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }, 400);
    } else {
      setTimeout(() => {
        soundEffects.playWrong();
        setStreakCount(0);
      }, 350);
    }

    setTimeout(() => setGavelStrikeAnim(false), 900);
  }, [selectedSegment, selectedAnswer]);

  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (!isSpinning && !selectedSegment) {
          handleSpinWheel();
        } else if (selectedAnswer) {
          handleSpinWheel();
        }
      } else if (e.key === '1' && selectedSegment && !selectedAnswer) {
        handleAnswer('violation');
      } else if (e.key === '2' && selectedSegment && !selectedAnswer) {
        handleAnswer('permissible');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, selectedSegment, selectedAnswer, handleSpinWheel, handleAnswer]);

  // Audio Narration
  const handleToggleNarration = () => {
    if (!selectedSegment) return;
    if (isPlayingAudio) {
      speechController.stop();
      setIsPlayingAudio(false);
    } else {
      const text = `${selectedSegment.scenario.title}. ${selectedSegment.scenario.description}. Constitutional Question: ${selectedSegment.scenario.question}`;
      setIsPlayingAudio(true);
      speechController.speak(text, language, () => setIsPlayingAudio(false));
    }
  };

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden font-dmsans">
      {/* Background radial gold glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Arcade Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-mono text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Scale className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Station 1 · Supreme Court Constitutional Bench Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight flex items-center gap-2">
            The Constitution Wheel of Rights & Dilemmas
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl leading-relaxed">
            Spin the 8-spoke Dharma Wheel to land on a landmark Constitutional Article, then render your Supreme Court ruling on an authentic citizen dilemma docket!
          </p>
        </div>

        {/* Tokens & Streak Counter */}
        <div className="flex items-center gap-3">
          {streakCount > 1 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-3.5 py-2 rounded-2xl font-mono text-xs font-bold shadow-sm animate-pulse">
              <Flame className="w-4 h-4 fill-white" />
              <span>{streakCount}x Streak! (+50 XP)</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 bg-gradient-to-br from-[#0A2947] to-[#041424] text-white px-4 py-2.5 rounded-2xl border-2 border-[#C89D56]/60 shadow-md">
            <div className="w-8 h-8 rounded-full bg-[#C89D56] text-[#0A2947] flex items-center justify-center font-bold text-sm shadow">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-mono font-bold text-amber-300">
                {tokensCollected} Tokens
              </div>
              <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">
                Judicial Vault
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
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 select-none">
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
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -150px) rotate(-${angle}deg)`,
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
                    {WHEEL_SEGMENTS.map((seg) => (
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
                  <circle cx="200" cy="200" r="18" fill="#C89D56" stroke="#FFD700" strokeWidth="2.5" />
                  <circle cx="200" cy="200" r="6" fill="#FFD700" />
                </svg>
              </div>
            </div>
          </div>

          {/* Big Tactile 3D Arcade Spin Button */}
          <div className="w-full flex flex-col items-center gap-1.5">
            <button
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className={`w-full max-w-xs py-4 px-6 rounded-2xl font-serif-editorial font-bold text-base uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xl flex items-center justify-center gap-2.5 border-2 ${
                isSpinning
                  ? 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#C89D56] via-[#B48842] to-[#8B5E3C] text-[#FAF7F0] border-amber-300 hover:brightness-110 active:translate-y-1 pulse-gold-glow'
              }`}
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'The Wheel Is Turning...' : 'Spin Wheel [Space]'}</span>
            </button>
            <span className="text-[11px] font-mono text-[#8B5E3C]/80">
              Hotkey: Press <strong>[Space]</strong> to spin
            </span>
          </div>
        </div>

        {/* Right: The Constitutional Courtroom Trial Box (7 cols) */}
        <div className="lg:col-span-7">
          {selectedSegment ? (
            <div className="court-docket-paper border-3 border-[#C89D56] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in zoom-in-95 relative overflow-hidden">
              
              {/* Judicial Gavel Strike Animation Overlay */}
              {gavelStrikeAnim && (
                <div className="absolute top-4 right-4 z-30 pointer-events-none animate-gavel-strike">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-amber-500">
                    <Gavel className="w-8 h-8 text-amber-900" />
                  </div>
                </div>
              )}

              {/* Courtroom Docket Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#C89D56]/40 pb-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0A2947] text-[#C89D56] px-3 py-1 rounded-lg font-bold shadow-xs">
                    ⚖️ {selectedSegment.article}
                  </span>
                  <span className="text-[#8B5E3C] font-bold">
                    {selectedSegment.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded border border-amber-300 font-bold">
                    Docket #{selectedSegment.scenario.docketNumber}
                  </span>
                  <button
                    onClick={handleToggleNarration}
                    className="p-1.5 rounded-lg bg-white border border-[#D3D4C0] hover:bg-[#F3E4C9] text-[#0A2947] cursor-pointer"
                    title="Read Case Scenario Aloud"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-rose-600 animate-pulse' : 'text-[#C89D56]'}`} />
                  </button>
                </div>
              </div>

              {/* Case Docket Details */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[#8B5E3C] flex items-center justify-between">
                  <span><strong>Petitioner:</strong> {selectedSegment.scenario.petitioner}</span>
                  <span><strong>Respondent:</strong> {selectedSegment.scenario.respondent}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif-editorial font-bold text-[#0A2947]">
                  {selectedSegment.scenario.title}
                </h3>
                
                <p className="text-sm font-dmsans text-[#0A2947]/90 leading-relaxed bg-white/80 p-4 rounded-2xl border border-[#E2D9C8] shadow-inner">
                  {selectedSegment.scenario.description}
                </p>
              </div>

              {/* The Trial Question Box */}
              <div className="bg-gradient-to-r from-blue-50/90 to-amber-50/90 border-2 border-blue-200/80 rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-mono font-bold text-blue-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-[#C89D56]" />
                  <span>Constitutional Question for Your Judicial Bench:</span>
                </div>
                <p className="text-base font-serif-editorial font-bold text-[#0A2947]">
                  &quot;{selectedSegment.scenario.question}&quot;
                </p>
              </div>

              {/* Action Buttons: The Two Judicial Wax Seal Stampers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold">
                  <span>Render Your Judicial Ruling:</span>
                  <span className="text-[#8B5E3C]/70">Hotkeys: [1] Violation · [2] Permissible</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Seal 1: Unconstitutional Violation */}
                  <button
                    onClick={() => handleAnswer('violation')}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      selectedAnswer === 'violation'
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 animate-stamp-slam shadow-lg'
                        : selectedAnswer !== null
                        ? 'bg-slate-50 border-slate-200 opacity-50'
                        : 'bg-white border-rose-300 text-rose-950 hover:bg-rose-50 hover:border-rose-500 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif-editorial font-bold text-sm text-rose-950 flex items-center gap-1.5">
                        <span>Unconstitutional Violation</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">[1]</span>
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
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 animate-stamp-slam shadow-lg'
                        : selectedAnswer !== null
                        ? 'bg-slate-50 border-slate-200 opacity-50'
                        : 'bg-white border-emerald-300 text-emerald-950 hover:bg-emerald-50 hover:border-emerald-500 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif-editorial font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                        <span>Permissible & Protected</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">[2]</span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-700">
                        Upheld by Supreme Court
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Rationale & Ambedkar Doctrine Revealed */}
              {selectedAnswer && (
                <div className={`p-5 rounded-2xl border-2 space-y-3.5 animate-in fade-in ${
                  selectedAnswer === selectedSegment.scenario.correctAnswer
                    ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-md'
                    : 'bg-amber-50/90 border-amber-400 text-amber-950 shadow-md'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-serif-editorial font-bold text-base flex items-center gap-2">
                      {selectedAnswer === selectedSegment.scenario.correctAnswer ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Magnificent Judicial Reasoning! (+1 Judicial Token)</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-5 h-5 text-amber-600" />
                          <span>Judicial Precedent Clarification</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-dmsans leading-relaxed">
                    <strong>Legal Rationale:</strong> {selectedSegment.scenario.legalRationale}
                  </p>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-[#D3D4C0] text-xs font-mono text-[#0A2947]">
                    🏛️ <strong>Landmark Precedent:</strong> {selectedSegment.scenario.landmarkPrecedent}
                  </div>

                  <div className="bg-white/90 border-l-4 border-l-[#C89D56] rounded-xl p-3 text-xs sm:text-sm font-serif-editorial italic text-[#0A2947]">
                    &quot;{selectedSegment.scenario.ambedkarDoctrine}&quot;
                    <span className="block mt-1 font-mono text-[11px] font-bold text-[#8B5E3C] not-italic">
                      — Dr. B. R. Ambedkar, Constitutional Assembly Doctrine
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSpinWheel}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0A2947] text-[#FAF7F0] font-serif-editorial font-bold text-xs uppercase tracking-wider hover:bg-[#C89D56] hover:text-[#0A2947] transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <span>Spin for Next Case Docket [Space]</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standby State */
            <div className="bg-white border-2 border-dashed border-[#D3D4C0] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#C89D56] flex items-center justify-center mx-auto shadow-inner">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif-editorial font-bold text-2xl text-[#0A2947]">
                  The Supreme Court Bench Awaits Your Verdict
                </h3>
                <p className="text-sm font-dmsans text-[#8B5E3C] max-w-md mx-auto mt-2 leading-relaxed">
                  Press the golden <strong>"Spin Wheel [Space]"</strong> button on the left to activate the Dharma Chakra and trigger your next constitutional citizen docket!
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#0A2947]/70 pt-2">
                <Award className="w-4 h-4 text-[#C89D56]" />
                <span>Earn Judicial Tokens & Level Up Your Citizen Bench Rank</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstitutionWheelGame;
