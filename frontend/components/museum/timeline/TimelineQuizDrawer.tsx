'use client';

import React, { useState } from 'react';
import { 
  Award, CheckCircle2, XCircle, Sparkles, Trophy, ArrowRight, 
  RotateCcw, HelpCircle, X, Compass, Check, BookOpen, Volume2
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';

export interface TimelineQuizQuestion {
  id: string;
  milestoneId: string;
  year: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation: string;
}

export const TIMELINE_QUIZ_DATA: TimelineQuizQuestion[] = [
  {
    id: 'tq-1924',
    milestoneId: 'bahishkrit-hitakarini-1924',
    year: 1924,
    category: 'Social Awakening',
    question: 'In July 1924, Dr. Ambedkar founded the Bahishkrit Hitakarini Sabha at Damodar Hall in Bombay. What was its world-famous revolutionary motto?',
    options: [
      'Satyameva Jayate (Truth Alone Triumphs)',
      'Educate, Agitate, Organise (शिका, संघटित व्हा आणि संघर्ष करा)',
      'Inquilab Zindabad (Long Live the Revolution)',
      'Ahimsa Paramo Dharma (Non-violence is the Supreme Duty)'
    ],
    correctIndex: 1,
    explanation: 'Dr. Ambedkar established the Sabha with the historic clarion call "Educate, Agitate, Organise" to awaken social consciousness, establish free student hostels, and unify the depressed classes into civic action.',
    citation: 'BAWS Vol. 17 (Part I) · Bahishkrit Hitakarini Sabha Charter (1924)'
  },
  {
    id: 'tq-1927',
    milestoneId: 'mahad-satyagraha-1927-event',
    year: 1927,
    category: 'Civil Rights',
    question: 'During the historic Mahad Satyagraha on March 20, 1927, what fundamental principle did Dr. Ambedkar declare at the public Chavdar Lake?',
    options: [
      'Boycotting British imported cotton goods',
      'Establishing water as a shared municipal tax',
      'Asserting civic equality and universal human rights to access public water',
      'Demanding separate territorial settlements'
    ],
    correctIndex: 2,
    explanation: 'Babasaheb proclaimed: "We are not going to the Chavdar Tale merely to drink water; we are going there to establish our human rights." March 20 is celebrated nationally as Social Empowerment Day.',
    citation: 'BAWS Vol. 17 (Part I) · Mahad Satyagraha Historical Records'
  },
  {
    id: 'tq-1932',
    milestoneId: 'poona-pact-1932',
    year: 1932,
    category: 'Political Safeguards',
    question: 'How did the signing of the Poona Pact in September 1932 affect legislative representation for the Depressed Classes?',
    options: [
      'Reserved seats in provincial legislatures were doubled from 71 to 148',
      'Separate electorates were maintained in all provinces',
      'All reservation provisions were deferred for 25 years',
      'Representation was limited strictly to municipal councils'
    ],
    correctIndex: 0,
    explanation: 'Under the Poona Pact signed at Yerwada Central Jail, reserved seats for Depressed Classes in provincial legislatures increased dramatically from 71 to 148, along with 18% reservation in the Central Assembly.',
    citation: 'BAWS Vol. 2 · Poona Pact Historical Documents (1932)'
  },
  {
    id: 'tq-1942',
    milestoneId: 'labour-member-viceroy-1942',
    year: 1942,
    category: 'Labour & Economic Justice',
    question: 'As Labour Member of the Viceroy’s Executive Council (1942–1946), what landmark reform did Dr. Ambedkar introduce for Indian factory workers?',
    options: [
      'Eliminated weekend rest days',
      'Reduced statutory working hours from 12 hours to 8 hours daily',
      'Restricted women from industrial employment',
      'Abolished statutory provident funds'
    ],
    correctIndex: 1,
    explanation: 'At the 7th Indian Labour Conference in 1942, Dr. Ambedkar reduced the statutory working day from 12 to 8 hours, instituted paid maternity benefits for women, and created the Central Waterways Commission for river valley electrification.',
    citation: 'BAWS Vol. 10 · Speeches of the Labour Member (1942–1946)'
  },
  {
    id: 'tq-1949',
    milestoneId: 'constitution-adopted-1949',
    year: 1949,
    category: 'Constitutional Philosophy',
    question: 'In his farewell address to the Constituent Assembly on Nov 25, 1949, which three principles did Dr. Ambedkar warn form an inseparable "Union of Trinity"?',
    options: [
      'Faith, Hope, and Charity',
      'Liberty, Equality, and Fraternity',
      'Justice, Sovereignty, and Socialism',
      'Dharma, Artha, and Kama'
    ],
    correctIndex: 1,
    explanation: 'Ambedkar warned: "Liberty cannot be divorced from equality, equality cannot be divorced from liberty. Nor can liberty and equality be divorced from fraternity... Without equality, liberty would produce the supremacy of the few over the many."',
    citation: 'Constituent Assembly Debates (CAD) · Vol. XI, Nov 25, 1949'
  },
  {
    id: 'tq-1956',
    milestoneId: 'deekshabhoomi-1956',
    year: 1956,
    category: 'Dhamma Renaissance',
    question: 'On October 14, 1956, at Deekshabhoomi Nagpur, Dr. Ambedkar led over 500,000 people to Buddhism. How many ethical vows (प्रतिज्ञा) did he personally administer?',
    options: [
      '5 Precepts (Pancha Sila)',
      '10 Perfections (Paramitas)',
      '22 Historic Vows (बावीस प्रतिज्ञा) rooted in equality and rationalism',
      '24 Spiritual Disciplines'
    ],
    correctIndex: 2,
    explanation: 'Dr. Ambedkar administered 22 specific vows designed to completely discard caste hierarchies, superstitions, and idolatry while embracing the Buddha’s path of Karuna (compassion), Pragya (wisdom), and Samata (equality).',
    citation: 'BAWS Vol. 11 · The Buddha and His Dhamma & 22 Vows (1956)'
  }
];

interface TimelineQuizDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToMilestone: (milestoneId: string) => void;
}

export const TimelineQuizDrawer: React.FC<TimelineQuizDrawerProps> = ({
  isOpen,
  onClose,
  onJumpToMilestone
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ = TIMELINE_QUIZ_DATA[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      soundEffects.playSuccess();
      const newStreak = streak + 1;
      setScore(prev => prev + 1);
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      soundEffects.playWrong();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    soundEffects.playClick();
    if (currentIdx + 1 < TIMELINE_QUIZ_DATA.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    soundEffects.playClick();
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setQuizCompleted(false);
  };

  const handleJump = () => {
    soundEffects.playClick();
    onClose();
    onJumpToMilestone(currentQ.milestoneId);
  };

  const percentScore = Math.round((score / TIMELINE_QUIZ_DATA.length) * 100);

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-[#0A2947]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border-2 border-[#C59A45] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] font-dmsans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#0A2947] text-[#FAF7F0] px-6 py-4 flex items-center justify-between border-b-2 border-[#C59A45]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C59A45] text-[#0A2947] flex items-center justify-center font-bold shadow-md">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-cinzel uppercase tracking-widest text-[#F3E4C9] font-bold">
                  INTERACTIVE CHRONICLE CHALLENGE
                </span>
                <span className="px-2 py-0.5 bg-[#8B5E3C] text-white rounded text-[10px] font-mono font-bold">
                  DAIC KIOSK
                </span>
              </div>
              <h3 className="font-serif-editorial font-bold text-base sm:text-lg text-white">
                {"Test Your Knowledge: Babasaheb's Epochs"}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Challenge"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {!quizCompleted ? (
            <>
              {/* Progress & Score Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#0A2947]/70">
                  <span className="font-bold font-cinzel text-[#8B5E3C] uppercase">
                    Inquiry {currentIdx + 1} of {TIMELINE_QUIZ_DATA.length} · {currentQ.category} ({currentQ.year})
                  </span>
                  <div className="flex items-center gap-3">
                    {streak > 1 && (
                      <span className="text-amber-700 font-bold flex items-center gap-1 animate-bounce">
                        🔥 {streak} Streak!
                      </span>
                    )}
                    <span className="bg-[#FAF7F0] px-2.5 py-1 rounded-lg border border-[#D3D4C0] font-bold text-[#0A2947]">
                      Score: {score}/{TIMELINE_QUIZ_DATA.length}
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#FAF7F0] rounded-full overflow-hidden border border-[#D3D4C0]">
                  <div 
                    className="h-full bg-gradient-to-r from-[#8B5E3C] via-[#C59A45] to-[#0A2947] transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / TIMELINE_QUIZ_DATA.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Statement */}
              <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-2xl p-5 sm:p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#0A2947] text-[#F3E4C9] text-xs font-mono font-bold rounded-md">
                    {currentQ.year}
                  </span>
                  <span className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
                    Historic Turning Point
                  </span>
                </div>
                <h4 className="text-base sm:text-xl font-serif-editorial font-bold text-[#0A2947] leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  const isCorrect = oIdx === currentQ.correctIndex;
                  
                  let buttonStyle = 'bg-white border-[#D3D4C0] hover:border-[#8B5E3C] hover:bg-[#FAF7F0] text-[#0A2947]';
                  if (isAnswered) {
                    if (isCorrect) {
                      buttonStyle = 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                    } else if (isSelected) {
                      buttonStyle = 'bg-rose-50 border-rose-500 text-rose-950';
                    } else {
                      buttonStyle = 'opacity-50 bg-white border-[#D3D4C0] text-[#0A2947]';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${buttonStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                          isAnswered && isCorrect 
                            ? 'bg-emerald-600 text-white' 
                            : isAnswered && isSelected 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0]'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="text-sm font-medium leading-snug">{opt}</span>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Curatorial Citation upon answer */}
              {isAnswered && (
                <div className="p-4 sm:p-5 bg-amber-50/70 border border-[#C59A45]/60 rounded-2xl space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8B5E3C]" />
                    <span className="font-cinzel text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
                      Curatorial Verification & Source Citation
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#0A2947] leading-relaxed">
                    {currentQ.explanation}
                  </p>

                  <div className="text-[11px] font-mono text-[#8B5E3C] bg-white/70 p-2 rounded-lg border border-[#D3D4C0]">
                    📖 Source: {currentQ.citation}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#C59A45]/30">
                    <button
                      onClick={handleJump}
                      className="px-3 py-1.5 bg-white hover:bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs font-mono text-[#0A2947] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      <span>Jump to Station on Timeline</span>
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>{currentIdx + 1 === TIMELINE_QUIZ_DATA.length ? 'View Final Results' : 'Next Historical Inquiry'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Quiz Completion Screen */
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-[#FAF7F0] border-3 border-[#C59A45] mx-auto flex items-center justify-center text-[#8B5E3C] shadow-lg">
                <Trophy className="w-10 h-10 text-[#C59A45]" />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-widest">
                  MEMORIAL EXHIBITION CERTIFICATION
                </div>
                <h3 className="font-serif-editorial font-bold text-2xl sm:text-3xl text-[#0A2947]">
                  {percentScore >= 80 ? "Master of Babasaheb's Epochs!" : percentScore >= 50 ? "Distinguished Archival Explorer!" : "Historical Journey Completed!"}
                </h3>
                <p className="text-sm text-[#0A2947]/75 max-w-md mx-auto">
                  You scored <span className="font-bold text-[#0A2947]">{score} out of {TIMELINE_QUIZ_DATA.length}</span> ({percentScore}%) across the defining moments of Dr. B. R. Ambedkar&apos;s revolutionary life.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D3D4C0]">
                  <span className="block text-[11px] font-mono text-[#0A2947]/60">Accuracy</span>
                  <span className="font-serif-editorial font-bold text-lg text-[#0A2947]">{percentScore}%</span>
                </div>
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D3D4C0]">
                  <span className="block text-[11px] font-mono text-[#0A2947]/60">Max Streak</span>
                  <span className="font-serif-editorial font-bold text-lg text-[#8B5E3C]">{maxStreak} 🔥</span>
                </div>
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D3D4C0] col-span-2 sm:col-span-1">
                  <span className="block text-[11px] font-mono text-[#0A2947]/60">DAIC Badge</span>
                  <span className="font-serif-editorial font-bold text-xs text-emerald-700">Verified Scholar</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleRestart}
                  className="px-5 py-2.5 bg-white hover:bg-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#8B5E3C]" />
                  <span>Retake Challenge</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <span>Continue Exploring Timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
