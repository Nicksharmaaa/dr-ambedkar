'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Dices, Copy, Check, Volume2, Share2, 
  Quote, ArrowRight, Bookmark, Compass, Landmark, Scale, BookOpen
} from 'lucide-react';
import { FAMOUS_QUOTES } from '@/data/interactiveData';
import { soundEffects } from '@/utils/soundEffects';
import { QuoteItem, Language } from '@/types/museum';

interface WisdomMachineProps {
  language: Language;
  onExploreTopic?: (topic: string) => void;
  onAskAI?: (query: string) => void;
}

export const WisdomMachine: React.FC<WisdomMachineProps> = ({
  language,
  onExploreTopic,
  onAskAI
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const filteredQuotes = selectedTheme === 'all' 
    ? FAMOUS_QUOTES 
    : FAMOUS_QUOTES.filter(q => q.theme === selectedTheme);

  const currentQuote: QuoteItem = filteredQuotes[currentIndex % filteredQuotes.length] || FAMOUS_QUOTES[0];

  const handleShuffle = () => {
    soundEffects.playShuffle();
    setIsFlipping(true);
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * filteredQuotes.length);
      if (nextIndex === currentIndex && filteredQuotes.length > 1) {
        nextIndex = (nextIndex + 1) % filteredQuotes.length;
      }
      setCurrentIndex(nextIndex);
      setIsFlipping(false);
    }, 200);
  };

  const handleCopy = () => {
    soundEffects.playClick();
    const textToCopy = `"${currentQuote.quote}"\n— Dr. B. R. Ambedkar (${currentQuote.work}, ${currentQuote.year})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentQuote.quote);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const themes = [
    { id: 'all', label: 'All Wisdom' },
    { id: 'Democracy', label: 'Democracy' },
    { id: 'Social Justice', label: 'Social Justice' },
    { id: 'Education', label: 'Education' },
    { id: 'Women Rights', label: 'Women’s Rights' },
    { id: 'Constitutional Morality', label: 'Constitutional Morality' },
  ];

  return (
    <div className="w-full bg-[#0A2947] text-[#FAF7F0] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border-2 border-[#C59A45]/40 font-dmsans">
      
      {/* Decorative Archival Corner Accents */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#C59A45]/60 pointer-events-none" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#C59A45]/60 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#C59A45]/60 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#C59A45]/60 pointer-events-none" />

      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C59A45]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8B5E3C]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar: Title & Theme switcher */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-[#C59A45]/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C59A45]/20 border border-[#C59A45]/50 text-[#F3E4C9] rounded-full text-xs font-cinzel font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#C59A45]" />
            <span>Interactive Wisdom Explorer</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif-editorial font-bold text-white tracking-tight">
            Words of Babasaheb
          </h2>
          <p className="text-xs sm:text-sm text-[#F3E4C9]/85 max-w-2xl leading-relaxed">
            Shuffle through immortal insights on human freedom, democracy, constitutional morality, and equality drawn from the 22 verified BAWS volumes.
          </p>
        </div>

        {/* Shuffle Button CTA */}
        <button
          onClick={handleShuffle}
          className="self-start md:self-auto px-5 py-3 bg-gradient-to-r from-[#D4AF37] via-[#C59A45] to-[#B8860B] hover:brightness-110 active:scale-95 text-[#0A2947] font-montserrat font-bold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#C59A45]/25 cursor-pointer border border-[#F3E4C9]/50"
        >
          <Dices className="w-4 h-4 text-[#0A2947]" />
          <span>Shuffle Wisdom</span>
        </button>
      </div>

      {/* Theme selection buttons */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedTheme(t.id);
              setCurrentIndex(0);
              soundEffects.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-montserrat font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedTheme === t.id
                ? 'bg-[#C59A45] text-[#0A2947] border-[#F3E4C9] shadow-md font-bold'
                : 'bg-white/10 hover:bg-white/20 text-[#FAF7F0] border-white/15'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Quote Display Card with Rich Antique Parchment Styling & Smooth Flip Transition */}
      <div className={`relative z-10 my-4 bg-[#FAF7F0] text-[#0A2947] border-2 border-[#C59A45]/40 rounded-2xl p-6 sm:p-9 shadow-xl transition-all duration-200 ${
        isFlipping ? 'scale-95 opacity-50 rotate-1' : 'scale-100 opacity-100 rotate-0'
      }`}>
        
        {/* Top Folio Specimen Tag & Year */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#D3D4C0]">
          <div className="flex items-center gap-2">
            <Quote className="w-7 h-7 text-[#C59A45] shrink-0" />
            <span className="text-[11px] font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider">
              Primary Archival Specimen
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#0A2947] text-[#F3E4C9] font-mono font-bold tracking-wide">
              {currentQuote.theme}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-[#D3D4C0] text-[#8B5E3C] font-mono font-bold">
              {currentQuote.year}
            </span>
          </div>
        </div>

        {/* Main Quote Text */}
        <blockquote className="text-lg sm:text-2xl font-serif-editorial leading-relaxed text-[#0A2947] font-semibold my-4">
          "{currentQuote.quote}"
        </blockquote>

        {/* Multilingual preview if selected */}
        {language !== 'en' && currentQuote.quoteLocal?.[language] && (
          <p className="text-sm sm:text-base text-[#8B5E3C] font-serif italic mb-4 border-l-3 border-[#C59A45] pl-3 py-1 bg-[#F3E4C9]/40 rounded-r-lg">
            "{currentQuote.quoteLocal[language]}"
          </p>
        )}

        {/* Source and context */}
        <div className="pt-4 border-t border-[#D3D4C0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-montserrat font-bold text-[#0A2947] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>{currentQuote.work}</span>
            </div>
            <div className="text-[#0A2947]/70 font-mono text-[11px]">
              {currentQuote.context}
            </div>
          </div>

          {/* Quick interactive utility buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleSpeak}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isSpeaking 
                  ? 'bg-[#C59A45] text-[#0A2947] border-[#C59A45] font-bold shadow-md' 
                  : 'bg-white hover:bg-[#F3E4C9] border-[#D3D4C0] text-[#0A2947]'
              }`}
              title={isSpeaking ? "Stop Voice Narration" : "Listen via Audio"}
            >
              <Volume2 className="w-4 h-4 text-[#8B5E3C]" />
              <span className="text-[11px] font-montserrat font-bold hidden sm:inline">
                {isSpeaking ? "Speaking" : "Listen"}
              </span>
            </button>

            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-white hover:bg-[#F3E4C9] border border-[#D3D4C0] text-[#0A2947] transition-all cursor-pointer flex items-center gap-1.5"
              title="Copy quote with scholarly citation"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span className="text-[11px] font-montserrat font-bold text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#8B5E3C]" />
                  <span className="text-[11px] font-montserrat font-bold hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Footer helper */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#F3E4C9]/75 pt-2">
        <span className="font-mono text-[11px]">
          Archival Quote {((currentIndex % filteredQuotes.length) + 1)} of {filteredQuotes.length} · Dr. B. R. Ambedkar Writings & Speeches
        </span>
        {onAskAI && (
          <button
            onClick={() => onAskAI(`What did Dr. Ambedkar mean when he wrote: "${currentQuote.quote}" in ${currentQuote.work}?`)}
            className="hover:text-[#F3E4C9] text-[#D4AF37] font-montserrat font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Consult AI Scholar on this Insight</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

    </div>
  );
};
