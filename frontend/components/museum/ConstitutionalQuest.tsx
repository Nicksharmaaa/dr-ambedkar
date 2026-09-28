'use client';

import React, { useState } from 'react';
import { 
  Trophy, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, 
  Share2, BookOpen, Flame, Award, Volume2, VolumeX, Check, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '@/data/interactiveData';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import MuseumGrandPavilion from './MuseumGrandPavilion';

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

  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      if (soundEnabled) soundEffects.playSuccess();
    } else {
      setStreak(0);
      if (soundEnabled) soundEffects.playWrong();
    }
  };

  const handleNext = () => {
    if (soundEnabled) soundEffects.playClick();
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
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
    <div className="min-h-screen bg-transparent text-[#0A2947] py-10 px-4 sm:px-6 lg:px-8 font-dmsans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Banner / Quest Identity */}
        <MuseumGrandPavilion
          title={t.questTitle || "Constitutional Quest"}
          subtitle={t.questSubtitle || "Interactive Archival Knowledge Game"}
          watermarkIcon={Award}
        >
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  soundEffects.enabled = !soundEnabled;
                }}
                className="p-2.5 rounded-xl border border-[#C59A45]/30 bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                title={soundEnabled ? "Mute Game Audio" : "Enable Game Audio"}
                aria-label="Sound Toggle"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#F5D77F]" /> : <VolumeX className="w-4 h-4 text-white/40" />}
              </button>
            </div>

            {streak > 1 && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C59A45] text-[#0A2947] font-montserrat font-black rounded-xl text-xs shadow-xs animate-pulse">
                <Flame className="w-4 h-4 fill-current" />
                <span>{streak}x {t.streakLabel || "Streak"}!</span>
              </div>
            )}
          </div>
        </MuseumGrandPavilion>

        {!isCompleted ? (
          <div className="space-y-6">
            
            {/* Progress Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-montserrat font-bold text-[#8B5E3C]">
                <span className="uppercase tracking-wider">
                  {t.questionLabel || "Question"} {currentIndex + 1} {t.ofLabel || "of"} {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-[#0A2947] font-mono">
                  {t.scoreLabel || "Score"}: {score} / {currentIndex + (isAnswered ? 1 : 0)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-white border border-[#D3D4C0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0A2947] rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Interactive Question Card */}
            <div className="bg-white rounded-3xl border-2 border-[#D3D4C0] p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Category tag */}
              <div>
                <span className="px-3 py-1 bg-[#FAF7F0] border border-[#D3D4C0] text-[#8B5E3C] rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
                  {currentQ.category}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-xl sm:text-2xl font-serif-editorial font-bold text-[#0A2947] leading-relaxed">
                {questionText}
              </h2>

              {/* Option List */}
              <div className="space-y-3">
                {optionsList.map((option: string, idx: number) => {
                  let btnStyle = "bg-[#FAF7F0] hover:bg-[#F3E4C9] border-[#D3D4C0] text-[#0A2947]";

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                    } else if (idx === selectedOption) {
                      btnStyle = "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20";
                    } else {
                      btnStyle = "bg-[#FAF7F0]/40 border-[#D3D4C0]/50 text-[#0A2947]/40";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-4 text-left rounded-2xl border-2 transition-all flex items-center justify-between text-sm sm:text-base font-dmsans cursor-pointer disabled:cursor-default ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-white border border-[#D3D4C0] text-[#0A2947] text-xs font-montserrat font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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
                <div className="p-5 bg-[#FAF7F0] border-l-4 border-[#8B5E3C] rounded-r-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-[#8B5E3C]" />
                    <span>{t.explanationEvidence || "Explanation & Historical Evidence:"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#0A2947] font-dmsans leading-relaxed">
                    {explanationText}
                  </p>
                  {currentQ.sourceCitation && (
                    <div className="pt-2 text-[11px] font-mono text-[#8B5E3C]">
                      {t.primaryArchivalSource || "Primary Archival Source:"} {currentQ.sourceCitation}
                    </div>
                  )}
                </div>
              )}

              {/* Action Bar */}
              {isAnswered && (
                <div className="flex items-center justify-between pt-2">
                  {onAskAI && (
                    <button
                      onClick={() => onAskAI(`Explain the constitutional history and archival context behind this question: "${currentQ.question}"`)}
                      className="px-4 py-2.5 bg-white hover:bg-[#FAF7F0] text-[#8B5E3C] border border-[#D3D4C0] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C59A45]" />
                      <span>{t.askAIAboutThis || "Ask AI Scholar"}</span>
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="ml-auto px-6 py-3 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
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
                {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedShare ? (t.copiedQuote || "Result Copied!") : (t.shareScore || "Share Achievement")}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ConstitutionalQuest;
