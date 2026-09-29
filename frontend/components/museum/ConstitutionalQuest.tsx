'use client';

import React, { useState } from 'react';
import { 
  Trophy, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, 
  Share2, BookOpen, Flame, Award, Volume2, VolumeX, Check, HelpCircle,
  Zap, Compass, ShieldAlert, Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '@/data/interactiveData';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import MuseumGrandPavilion from './MuseumGrandPavilion';
import ConstitutionalCertificateModal from './interactive/ConstitutionalCertificateModal';

interface ConstitutionalQuestProps {
  language: Language;
  onExploreDoc: (docId: string) => void;
  onAskAI: (query: string) => void;
}

export const ConstitutionalQuest: React.FC<ConstitutionalQuestProps> = ({
  language,
  onExploreDoc,
  onAskAI
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  
  // Arcade Lifelines
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [usedClue, setUsedClue] = useState(false);
  const [showClue, setShowClue] = useState(false);

  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || eliminatedOptions.includes(idx)) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      if (soundEnabled) {
        soundEffects.playCoinDrop();
        if (newStreak >= 2) {
          setTimeout(() => soundEffects.playCombo(), 200);
        }
      }
    } else {
      setStreak(0);
      if (soundEnabled) soundEffects.playWrong();
    }
  };

  const handleFiftyFifty = () => {
    if (usedFiftyFifty || isAnswered) return;
    if (soundEnabled) soundEffects.playClick();
    setUsedFiftyFifty(true);

    // Pick 2 wrong options to eliminate
    const wrongIndices = currentQ.options
      .map((_, i) => i)
      .filter(i => i !== currentQ.correctIndex);
    
    // Shuffle and pick 2
    const toEliminate = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    setEliminatedOptions(toEliminate);
  };

  const handleUseClue = () => {
    if (usedClue || isAnswered) return;
    if (soundEnabled) soundEffects.playBookOpen();
    setUsedClue(true);
    setShowClue(true);
  };

  const handleNext = () => {
    if (soundEnabled) soundEffects.playClick();
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setEliminatedOptions([]);
      setShowClue(false);
    } else {
      setIsCompleted(true);
      if (soundEnabled) soundEffects.playStampSlam();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      } catch {
        // Fallback
      }
    }
  };

  const handleRestart = () => {
    if (soundEnabled) soundEffects.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
    setUsedFiftyFifty(false);
    setUsedClue(false);
    setEliminatedOptions([]);
    setShowClue(false);
  };

  const getRank = () => {
    const percent = (score / QUIZ_QUESTIONS.length) * 100;
    if (percent >= 90) return { title: t.constitutionalScholar || "Constitutional Architect", badge: "🏛️", desc: "Peerless mastery of Babasaheb's legal and social doctrines." };
    if (percent >= 70) return { title: "Champion of Rights", badge: "⚖️", desc: "Deep familiarity with primary source history and social justice movements." };
    if (percent >= 40) return { title: "Keen Scholar", badge: "📖", desc: "Great foundation! Keep exploring the 22 volumes of archival writings." };
    return { title: "Curious Inquirer", badge: "🌱", desc: "Every journey of awakening starts with asking the first question." };
  };

  const handleShare = () => {
    const shareText = `I just scored ${score}/${QUIZ_QUESTIONS.length} on the Dr. B. R. Ambedkar Constitutional Quest! Explore the interactive archive and test your knowledge of Babasaheb's legacy.`;
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const questionText = (language !== 'en' && currentQ.questionLocal?.[language]) || currentQ.question;
  const optionsList: string[] = (language !== 'en' && currentQ.optionsLocal?.[language]) || currentQ.options;
  const explanationText = (language !== 'en' && currentQ.explanationLocal?.[language]) || currentQ.explanation;

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-6 px-4 sm:px-6 lg:px-8 font-dmsans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Banner / Quest Identity */}
        <MuseumGrandPavilion
          title={t.questTitle || "Constitutional Quest"}
          subtitle={t.questSubtitle || "Interactive Archival Knowledge Game & Certification"}
          watermarkIcon={Award}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  soundEffects.enabled = !soundEnabled;
                }}
                className="p-2.5 rounded-xl border border-[#C59A45]/30 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={soundEnabled ? "Mute Game Audio" : "Enable Game Audio"}
                aria-label="Sound Toggle"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#F5D77F]" /> : <VolumeX className="w-4 h-4 text-white/40" />}
              </button>
            </div>

            {/* Streak & Score Indicators */}
            <div className="flex items-center gap-3">
              {streak > 1 && (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C59A45] text-[#0A2947] font-montserrat font-black rounded-xl text-xs shadow-md animate-pulse">
                  <Flame className="w-4 h-4 fill-current text-rose-700" />
                  <span>{streak}x {t.streakLabel || "Streak"}! (+50 XP)</span>
                </div>
              )}
              <div className="px-3.5 py-1.5 bg-white/10 border border-white/20 text-[#FAF7F0] font-mono text-xs font-bold rounded-xl">
                Score: {score} / {QUIZ_QUESTIONS.length}
              </div>
            </div>
          </div>
        </MuseumGrandPavilion>

        {!isCompleted ? (
          <div className="space-y-6">
            
            {/* Progress Header & Arcade Lifelines */}
            <div className="bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-[#8B5E3C]">
                  <span className="uppercase tracking-wider">
                    {t.questionLabel || "Question"} {currentIndex + 1} {t.ofLabel || "of"} {QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-[#0A2947]/40">•</span>
                  <span className="font-mono text-[#0A2947]">
                    Progress: {Math.round(((currentIndex) / QUIZ_QUESTIONS.length) * 100)}%
                  </span>
                </div>

                {/* Arcade Lifelines */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase text-[#8B5E3C] font-bold hidden sm:inline">
                    Lifelines:
                  </span>
                  
                  {/* 50:50 Lifeline */}
                  <button
                    onClick={handleFiftyFifty}
                    disabled={usedFiftyFifty || isAnswered}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      usedFiftyFifty
                        ? 'bg-[#EAE0D0] text-[#8B5E3C]/60 border-[#D3D4C0]'
                        : 'bg-white hover:bg-[#F3E4C9] text-[#0A2947] border-[#C89D56] shadow-xs'
                    }`}
                    title="Eliminate two incorrect options"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#C89D56]" />
                    <span>50:50 {usedFiftyFifty ? '(Used)' : ''}</span>
                  </button>

                  {/* Archival Clue Lifeline */}
                  <button
                    onClick={handleUseClue}
                    disabled={usedClue || isAnswered}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      usedClue
                        ? 'bg-[#EAE0D0] text-[#8B5E3C]/60 border-[#D3D4C0]'
                        : 'bg-white hover:bg-[#F3E4C9] text-[#0A2947] border-[#C89D56] shadow-xs'
                    }`}
                    title="Reveal an archival hint from the Debates"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-[#C89D56]" />
                    <span>Clue {usedClue ? '(Used)' : ''}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-white border border-[#D3D4C0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0A2947] via-[#C89D56] to-[#0A2947] rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Hint Drawer (If Clue Activated) */}
            {showClue && (
              <div className="bg-[#FFF9EA] border-2 border-[#C89D56] rounded-2xl p-4 shadow-sm flex items-start gap-3 animate-in fade-in duration-200">
                <Lightbulb className="w-5 h-5 text-[#C89D56] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-[#0A2947] space-y-1">
                  <strong className="font-mono text-[#8B5E3C] uppercase text-[11px] block">
                    Archival Clue from Dr. Ambedkar’s Volume:
                  </strong>
                  <p className="font-serif-editorial italic">
                    &quot;Consider Babasaheb’s fundamental distinction between social democracy and mere political democracy; explore the debates of Nov 1948–Nov 1949.&quot;
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Question Card */}
            <div className="bg-white rounded-3xl border-2 border-[#D3D4C0] p-6 sm:p-9 shadow-md space-y-6">
              
              {/* Category tag */}
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 bg-[#FAF7F0] border border-[#D3D4C0] text-[#8B5E3C] rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
                  {currentQ.category}
                </span>
                <span className="text-xs font-mono text-[#8B5E3C]">
                  Folio Question #{currentIndex + 1}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-xl sm:text-2xl font-serif-editorial font-bold text-[#0A2947] leading-relaxed">
                {questionText}
              </h2>

              {/* Option List with Arcade Tactile Cards */}
              <div className="space-y-3">
                {optionsList.map((option: string, idx: number) => {
                  const isEliminated = eliminatedOptions.includes(idx);
                  let btnStyle = "bg-[#FAF7F0] hover:bg-[#F3E4C9] border-[#D3D4C0] text-[#0A2947] shadow-2xs hover:border-[#C89D56]";

                  if (isEliminated) {
                    btnStyle = "bg-slate-100 border-slate-200 text-slate-300 opacity-40 line-through cursor-not-allowed";
                  } else if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-4 ring-emerald-500/20 shadow-md animate-stamp-slam";
                    } else if (idx === selectedOption) {
                      btnStyle = "bg-rose-50 border-rose-500 text-rose-950 ring-4 ring-rose-500/20";
                    } else {
                      btnStyle = "bg-[#FAF7F0]/40 border-[#D3D4C0]/50 text-[#0A2947]/30 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered || isEliminated}
                      className={`w-full p-4 sm:p-5 text-left rounded-2xl border-2 transition-all flex items-center justify-between text-sm sm:text-base font-dmsans cursor-pointer disabled:cursor-default active:scale-[0.99] ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-white border border-[#D3D4C0] text-[#0A2947] text-xs font-montserrat font-black flex items-center justify-center shrink-0 shadow-2xs">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-medium">{option}</span>
                      </div>

                      {isAnswered && idx === currentQ.correctIndex && (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-montserrat font-bold text-xs shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="hidden sm:inline">AUTHENTICATED</span>
                        </div>
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanatory Archival Insight (Post-Answer) */}
              {isAnswered && (
                <div className="p-5 sm:p-6 bg-[#FAF7F0] border-l-4 border-[#8B5E3C] rounded-r-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8B5E3C] uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-[#8B5E3C]" />
                    <span>{t.explanationEvidence || "Explanation & Historical Evidence:"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#0A2947] font-serif-editorial leading-relaxed font-medium">
                    {explanationText}
                  </p>
                  {currentQ.sourceCitation && (
                    <div className="pt-2 text-xs font-mono text-[#8B5E3C] border-t border-[#D3D4C0]">
                      <span className="font-bold">Primary Archival Reference:</span> {currentQ.sourceCitation}
                    </div>
                  )}
                </div>
              )}

              {/* Action Bar */}
              {isAnswered && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D3D4C0]">
                  {onAskAI && (
                    <button
                      onClick={() => onAskAI(`Explain the constitutional history and archival context behind this question: "${currentQ.question}"`)}
                      className="px-4 py-2.5 bg-white hover:bg-[#FAF7F0] text-[#8B5E3C] border border-[#D3D4C0] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C59A45]" />
                      <span>{t.askAIAboutThis || "Consult AI Scholar"}</span>
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="ml-auto px-7 py-3 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] font-montserrat font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>{currentIndex + 1 === QUIZ_QUESTIONS.length ? (t.questCompleted || "Finish Exhibition Quest") : (t.nextChallenge || "Next Historical Inquiry")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

          </div>
        ) : (
          /* Completion Screen */
          <div className="bg-white rounded-3xl border-2 border-[#D3D4C0] p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="text-6xl animate-bounce">
              {getRank().badge}
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-xs font-cinzel uppercase tracking-wider font-bold text-[#8B5E3C]">
                {t.questCompleted || "Quest Completed!"}
              </span>
              <h2 className="text-3xl font-serif-editorial font-bold text-[#0A2947]">
                {getRank().title}
              </h2>
              <p className="text-sm text-[#0A2947]/75 font-dmsans">
                {getRank().desc}
              </p>
            </div>

            {/* Score Summary Box */}
            <div className="p-6 bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-2xl max-w-sm mx-auto space-y-2">
              <div className="text-4xl font-serif-editorial font-bold text-[#0A2947]">
                {score} / {QUIZ_QUESTIONS.length}
              </div>
              <div className="text-xs font-mono text-[#8B5E3C]">
                {t.scoreLabel || "Score"}: {Math.round((score / QUIZ_QUESTIONS.length) * 100)}% · {t.bestStreakLabel || "Best Streak"}: {maxStreak}
              </div>
            </div>

            {/* Completion Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowCertificateModal(true);
                }}
                className="px-6 py-3 bg-[#C89D56] hover:bg-[#B38743] text-[#0A2947] rounded-xl text-xs font-montserrat font-bold uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Award className="w-4 h-4 text-[#0A2947]" />
                <span>Claim Archival Certificate</span>
              </button>

              <button
                onClick={handleRestart}
                className="px-5 py-2.5 bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#8B5E3C]" />
                <span>{t.playAgain || "Play Again"}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-5 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer"
              >
                {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-white" />}
                <span>{copiedShare ? (t.copiedQuote || "Result Copied!") : (t.shareScore || "Share Achievement")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        <ConstitutionalCertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          score={score}
          totalQuestions={QUIZ_QUESTIONS.length}
          rankTitle={getRank().title}
          rankBadge={getRank().badge}
          language={language}
        />

      </div>
    </div>
  );
};

export default ConstitutionalQuest;

