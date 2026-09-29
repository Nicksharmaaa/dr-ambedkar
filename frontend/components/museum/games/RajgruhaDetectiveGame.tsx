'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookMarked, Search, Key, Sparkles, CheckCircle2, 
  HelpCircle, Eye, ArrowRight, RotateCcw, Award, Lock, Unlock,
  Bookmark, Feather, FileText, Check, ChevronRight, Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
import { speechController } from '@/utils/speechUtils';
import { Language } from '@/types/museum';
import './ArcadeGames.css';

interface RajgruhaDetectiveGameProps {
  language: Language;
}

interface MysteryCase {
  id: string;
  caseNumber: number;
  caseTitle: string;
  missionBrief: string;
  targetBookTitle: string;
  bayName: string;
  bookshelf: Array<{
    id: string;
    title: string;
    author: string;
    year: string;
    shelfLocation: string;
    spineColor: 'maroon' | 'navy' | 'green' | 'amber';
    hasClue: boolean;
    marginalia: string;
    isTarget: boolean;
    excerpt: string;
  }>;
  solutionSummary: string;
}

const CASES: MysteryCase[] = [
  {
    id: 'case-1',
    caseNumber: 1,
    caseTitle: 'The Undelivered Address of Lahore (1936)',
    missionBrief: 'In 1936, the Jat-Pat-Todak Mandal cancelled Dr. Ambedkar’s presidential speech because of his uncompromising critique of Vedic authority. Inspect the Social Philosophy shelf in Rajgruha to locate his original proof demonstrating that caste is a division of labourers!',
    targetBookTitle: 'Annihilation of Caste (1936 Galley Proofs with Marginalia)',
    bayName: 'Rajgruha Archival Bay 3 — Social Democracy & Caste Critique',
    bookshelf: [
      {
        id: 'book-1a',
        title: 'Representative Government',
        author: 'John Stuart Mill',
        year: '1861',
        shelfLocation: 'Shelf 3, Vol. 12',
        spineColor: 'navy',
        hasClue: false,
        excerpt: 'The only purpose for which power can be rightfully exercised over any member of a civilized community against his will is to prevent harm to others.',
        marginalia: 'Underlined in black ink: "Essential principle for minority liberty, but Mill overlooked how caste hierarchy enforces hereditary servitude without formal legal power."',
        isTarget: false
      },
      {
        id: 'book-1b',
        title: 'Annihilation of Caste (1936 Galley Proofs)',
        author: 'Dr. B. R. Ambedkar',
        year: '1936',
        shelfLocation: 'Shelf 3, Rare Vault',
        spineColor: 'maroon',
        hasClue: true,
        excerpt: 'Caste is not merely a division of labour. It is also a division of labourers... It is a hierarchy in which the divisions of labourers are graded one above another.',
        marginalia: 'Scribbled in Babasaheb’s bold blue fountain pen: "I will not alter a single comma for the Lahore committee! If they cannot digest the truth, I shall publish it myself at my own expense for 8 annas so every common citizen may read it!"',
        isTarget: true
      },
      {
        id: 'book-1c',
        title: 'Ancient Law',
        author: 'Sir Henry Maine',
        year: '1861',
        shelfLocation: 'Shelf 3, Vol. 44',
        spineColor: 'green',
        hasClue: false,
        excerpt: 'The movement of progressive societies has hitherto been a movement from Status to Contract.',
        marginalia: 'Margin annotation: "In Hindu society, caste denies contract altogether. Status is frozen at birth like a perpetual prison."',
        isTarget: false
      },
      {
        id: 'book-1d',
        title: 'Democracy and Education',
        author: 'John Dewey (Columbia Univ)',
        year: '1916',
        shelfLocation: 'Shelf 3, Vol. 88',
        spineColor: 'amber',
        hasClue: false,
        excerpt: 'Democracy is more than a form of government; it is primarily a mode of associated living, of conjoint communicated experience.',
        marginalia: 'Dedicated to my beloved professor: "Dewey taught me that education must shatter rigid social barriers to achieve fraternity."',
        isTarget: false
      }
    ],
    solutionSummary: 'Brilliant deduction! You uncovered Babasaheb’s authentic marginal notes proving he rejected censorship and self-published Annihilation of Caste, which sold out worldwide and became a foundational human rights manifesto.'
  },
  {
    id: 'case-2',
    caseNumber: 2,
    caseTitle: 'The Currency Crisis & The Birth of RBI (1923)',
    missionBrief: 'In 1923, Dr. Ambedkar presented his monumental D.Sc. dissertation to the London School of Economics. Search the Monetary Economics section to uncover his blueprint that directly shaped the Reserve Bank of India!',
    targetBookTitle: 'The Problem of the Rupee: Its Origin and Its Solution',
    bayName: 'Rajgruha Archival Bay 7 — Central Banking & Public Finance',
    bookshelf: [
      {
        id: 'book-2a',
        title: 'Principles of Economics',
        author: 'Alfred Marshall',
        year: '1890',
        shelfLocation: 'Shelf 7, Vol. 05',
        spineColor: 'green',
        hasClue: false,
        excerpt: 'Economics is a study of mankind in the ordinary business of life.',
        marginalia: 'Margin note: "Classical price equilibrium breaks down under colonial extraction where agricultural producers bear the full brunt of currency manipulation."',
        isTarget: false
      },
      {
        id: 'book-2b',
        title: 'The Problem of the Rupee',
        author: 'Dr. B. R. Ambedkar (London, 1923)',
        year: '1923',
        shelfLocation: 'Shelf 7, Rare Vault',
        spineColor: 'navy',
        hasClue: true,
        excerpt: 'The gold exchange standard has failed the Indian peasant. Stability of currency is indispensable for the welfare of the poorest wage-earner.',
        marginalia: 'Handwritten inscription in margins: "Testimony prepared for the Royal Hilton Young Commission (1926). We must establish an independent Central Bank of India free from colonial Whitehall influence to control credit and stabilize purchasing power!"',
        isTarget: true
      },
      {
        id: 'book-2c',
        title: 'The Wealth of Nations',
        author: 'Adam Smith',
        year: '1776',
        shelfLocation: 'Shelf 7, Vol. 01',
        spineColor: 'amber',
        hasClue: false,
        excerpt: 'It is not from the benevolence of the butcher, the brewer, or the baker that we expect our dinner, but from their regard to their own interest.',
        marginalia: 'Note on markets: "Self-interest without constitutional guardrails degenerates into extortion and monopoly."',
        isTarget: false
      },
      {
        id: 'book-2d',
        title: 'The Evolution of Provincial Finance',
        author: 'Dr. B. R. Ambedkar (Columbia Ph.D)',
        year: '1925',
        shelfLocation: 'Shelf 7, Vol. 19',
        spineColor: 'maroon',
        hasClue: false,
        excerpt: 'Imperial finance concentrated all taxing power in the center while starving the provinces of social development funds.',
        marginalia: 'Financial federalism: "Decentralization must be accompanied by statutory devolution, not discretionary imperial doles."',
        isTarget: false
      }
    ],
    solutionSummary: 'Magnificent sleuthing! You discovered Dr. Ambedkar’s seminal central banking thesis that led the Hilton Young Commission to mandate the creation of the Reserve Bank of India in 1934.'
  },
  {
    id: 'case-3',
    caseNumber: 3,
    caseTitle: 'The Moral Universe of the Buddha & Dhamma (1956)',
    missionBrief: 'In October 1956 at Nagpur, Dr. Ambedkar led the historic Dhamma conversion of 500,000 followers. Search the Comparative Religion Bay to locate his final masterwork manuscript explaining why Buddhism rejects divine hierarchy!',
    targetBookTitle: 'The Buddha and His Dhamma (Corrected Typescript)',
    bayName: 'Rajgruha Archival Bay 11 — Comparative Religion & Buddhist Philosophy',
    bookshelf: [
      {
        id: 'book-3a',
        title: 'The Gospel of Buddha',
        author: 'Paul Carus',
        year: '1894',
        shelfLocation: 'Shelf 11, Vol. 08',
        spineColor: 'amber',
        hasClue: false,
        excerpt: 'Praise be unto the Blessed One, the Holy One, the fully Enlightened One.',
        marginalia: 'Annotated by Babasaheb: "Poetic translation, but misses the radical social revolution the Buddha ignited against the Brahminical caste hierarchy."',
        isTarget: false
      },
      {
        id: 'book-3b',
        title: 'The Buddha and His Dhamma',
        author: 'Dr. B. R. Ambedkar',
        year: '1956',
        shelfLocation: 'Shelf 11, Rare Vault',
        spineColor: 'maroon',
        hasClue: true,
        excerpt: 'Religion must mainly be a matter of principles only. It cannot be a matter of rules. The moment it degenerates into rules, it ceases to be religion.',
        marginalia: 'Babasaheb’s fountain pen inscription: "Buddha’s Dhamma is founded on Pragya (reason), Karuna (compassion), and Samata (equality). It gives human beings freedom from superstition and spiritual tyranny!"',
        isTarget: true
      },
      {
        id: 'book-3c',
        title: 'The Religions of India',
        author: 'Edward Washburn Hopkins',
        year: '1895',
        shelfLocation: 'Shelf 11, Vol. 33',
        spineColor: 'green',
        hasClue: false,
        excerpt: 'Buddhism was an offshoot of ancient Hindu philosophy that gradually decayed in the land of its origin.',
        marginalia: 'Strong pencil marginalia: "False assumption! Buddhism was an independent moral revolution that challenged caste privilege at its root."',
        isTarget: false
      },
      {
        id: 'book-3d',
        title: 'The Milinda-Panha',
        author: 'T.W. Rhys Davids (Pali Text Society)',
        year: '1890',
        shelfLocation: 'Shelf 11, Vol. 16',
        spineColor: 'navy',
        hasClue: false,
        excerpt: 'The King said: Reverend Nagasena, what is the characteristic mark of wisdom? Reason and illumination, O King!',
        marginalia: 'Underlined: "Nagasena’s dialogue proves that Buddhist philosophy demands rational inquiry rather than blind devotion."',
        isTarget: false
      }
    ],
    solutionSummary: 'Astonishing discovery! You located Babasaheb’s final treatise manuscript written in his final months, anchoring human dignity in reason, compassion, and fraternity.'
  }
];

export const RajgruhaDetectiveGame: React.FC<RajgruhaDetectiveGameProps> = ({
  language
}) => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [inspectedBookId, setInspectedBookId] = useState<string | null>(null);
  const [solvedCases, setSolvedCases] = useState<string[]>([]);
  const [showVictory, setShowVictory] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activeCase = CASES[currentCaseIndex];
  const inspectedBook = activeCase.bookshelf.find(b => b.id === inspectedBookId);
  const isCaseSolved = solvedCases.includes(activeCase.id);

  const handleInspectBook = (bookId: string) => {
    soundEffects.playBookOpen();
    speechController.stop();
    setIsPlayingAudio(false);
    setInspectedBookId(bookId);

    const book = activeCase.bookshelf.find(b => b.id === bookId);
    if (book?.isTarget && !solvedCases.includes(activeCase.id)) {
      setSolvedCases(prev => [...prev, activeCase.id]);
      soundEffects.playSuccess();
      soundEffects.playCoinDrop();
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNextCase = () => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);

    if (currentCaseIndex + 1 < CASES.length) {
      setCurrentCaseIndex(prev => prev + 1);
      setInspectedBookId(null);
    } else {
      setShowVictory(true);
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestart = () => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);
    setCurrentCaseIndex(0);
    setInspectedBookId(null);
    setSolvedCases([]);
    setShowVictory(false);
  };

  const handleToggleNarration = () => {
    if (!inspectedBook) return;
    if (isPlayingAudio) {
      speechController.stop();
      setIsPlayingAudio(false);
    } else {
      const textToRead = `${inspectedBook.title} by ${inspectedBook.author}. Printed excerpt: ${inspectedBook.excerpt}. Babasaheb's handwritten margin notes: ${inspectedBook.marginalia}`;
      setIsPlayingAudio(true);
      speechController.speak(textToRead, language, () => setIsPlayingAudio(false));
    }
  };

  const getSpineClass = (color: string) => {
    switch (color) {
      case 'maroon': return 'leather-spine-maroon';
      case 'navy': return 'leather-spine-navy';
      case 'green': return 'leather-spine-green';
      case 'amber': return 'leather-spine-amber';
      default: return 'leather-spine-maroon';
    }
  };

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden font-dmsans">
      {/* Header Arcade Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-mono text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Key className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Station 4 · Archival Library Sleuth & Mystery Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            Rajgruha Library Detective: Marginalia Mysteries
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl leading-relaxed">
            Explore Dr. Ambedkar’s legendary 50,000-volume personal library at Rajgruha, Mumbai. Pull antique leather books, inspect authentic handwritten marginal notes in blue fountain pen, and solve historic mysteries!
          </p>
        </div>

        {/* Solved Cases Counter */}
        <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-2xl border-2 border-[#C89D56] shadow-sm">
          <Award className="w-7 h-7 text-[#C89D56]" />
          <div className="text-left">
            <div className="text-sm font-mono font-bold text-[#0A2947]">
              {solvedCases.length} of {CASES.length} Cases Solved
            </div>
            <div className="text-[10px] font-mono text-[#8B5E3C] uppercase tracking-wider font-bold">
              Senior Archival Sleuth (+50 XP)
            </div>
          </div>
        </div>
      </div>

      {!showVictory ? (
        <div className="space-y-6 relative z-10">
          {/* Mission Briefing Card with Vintage Detective Badge */}
          <div className="bg-white border-2 border-[#D3D4C0] rounded-2xl p-6 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4EBD9] pb-3 text-xs font-mono">
              <span className="font-bold text-[#0A2947] uppercase bg-[#FAF7F0] px-3.5 py-1.5 rounded-xl border border-[#E2D9C8] flex items-center gap-1.5 shadow-2xs">
                <Search className="w-3.5 h-3.5 text-[#C89D56]" />
                Mystery Case #{activeCase.caseNumber}: {activeCase.caseTitle}
              </span>
              <span className={isCaseSolved ? 'text-emerald-800 font-bold bg-emerald-100 px-3 py-1 rounded-xl flex items-center gap-1' : 'text-amber-800 bg-amber-100 font-bold px-3 py-1 rounded-xl'}>
                {isCaseSolved ? '✅ Case Solved (+50 XP)' : '🔍 Clue Hunting'}
              </span>
            </div>

            <p className="text-sm sm:text-base font-dmsans text-[#0A2947] leading-relaxed">
              <strong>Curator&apos;s Mission Brief:</strong> {activeCase.missionBrief}
            </p>
          </div>

          {/* Authentic 3D Mahogany Bookshelf */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-[#C89D56]" />
                Click Any Antique Leather Volume to Pull & Inspect:
              </span>
              <span className="hidden sm:inline text-[#8B5E3C]/80">Rajgruha Collection Bay</span>
            </div>

            {/* Mahogany Shelf Container */}
            <div className="mahogany-shelf p-6 sm:p-10 rounded-3xl border-4 border-[#3e220e] shadow-2xl relative">
              {/* Brass Nameplate on Shelf */}
              <div className="brass-plate px-4 py-2 rounded-lg inline-block text-[11px] font-mono font-black tracking-widest uppercase mb-6 mx-auto shadow-md">
                🏷️ {activeCase.bayName}
              </div>

              {/* The Books on the Shelf */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-end pt-4 border-b-8 border-[#3e220e]">
                {activeCase.bookshelf.map((book) => {
                  const isSelected = inspectedBookId === book.id;
                  const spineClass = getSpineClass(book.spineColor);

                  return (
                    <button
                      key={book.id}
                      onClick={() => handleInspectBook(book.id)}
                      className={`h-60 sm:h-72 rounded-t-2xl p-4 flex flex-col justify-between text-left transition-all duration-300 cursor-pointer border-x-2 border-t-2 relative overflow-hidden group shadow-2xl ${spineClass} ${
                        isSelected
                          ? '-translate-y-8 ring-4 ring-amber-400 border-amber-300 shadow-amber-500/40 scale-105'
                          : 'border-white/10 hover:-translate-y-4 hover:border-amber-300/60'
                      }`}
                    >
                      {/* Gold Embossed Ribs on Spine */}
                      <div className="space-y-1">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-80" />
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-80" />
                      </div>

                      {/* Vertical Gold Foil Spine Text */}
                      <div className="my-auto py-2">
                        <span className="text-[9px] font-mono text-amber-300/80 block uppercase tracking-wider mb-1">
                          {book.shelfLocation}
                        </span>
                        <h4 className="font-serif-editorial font-bold text-xs sm:text-sm text-amber-100 leading-snug line-clamp-3 filter drop-shadow">
                          {book.title}
                        </h4>
                        <p className="text-[10px] font-mono text-amber-200/70 mt-1 line-clamp-1">
                          {book.author} ({book.year})
                        </p>
                      </div>

                      {/* Bottom Ribs and Click Indicator */}
                      <div>
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-80 mb-2" />
                        <div className="flex items-center justify-between text-[10px] font-mono text-amber-200">
                          <span>{isSelected ? 'Opened' : 'Pull Volume'}</span>
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Wooden Shelf Base Plinth */}
              <div className="w-full h-5 bg-gradient-to-r from-[#201005] via-[#4d280e] to-[#201005] rounded-b-xl mt-0.5 shadow-inner" />
            </div>
          </div>

          {/* Inspected Book Open Double-Page Presentation */}
          {inspectedBook && (
            <div className="bg-white border-3 border-[#C89D56] rounded-3xl p-6 sm:p-9 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative overflow-hidden">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4EBD9] pb-3 text-xs font-mono">
                <span className="font-bold text-[#0A2947] flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#C89D56]" />
                  Examining Volume: {inspectedBook.title} ({inspectedBook.year})
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleNarration}
                    className="p-1.5 rounded-lg bg-[#FAF7F0] border border-[#D3D4C0] hover:bg-[#F3E4C9] text-[#0A2947] cursor-pointer flex items-center gap-1 text-[11px] font-mono"
                    title="Audio Narration of Marginalia"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-rose-600 animate-pulse' : 'text-[#C89D56]'}`} />
                    <span>{isPlayingAudio ? 'Speaking...' : 'Listen'}</span>
                  </button>

                  <span className={inspectedBook.isTarget ? 'text-emerald-800 font-bold bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300' : 'text-[#8B5E3C] bg-[#FAF7F0] px-2.5 py-1 rounded-xl'}>
                    {inspectedBook.isTarget ? '🎯 HISTORIC TARGET CLUE UNLOCKED!' : 'General Reference Volume'}
                  </span>
                </div>
              </div>

              {/* 2-Page Open Spread */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF7F0] p-6 sm:p-8 rounded-3xl border-2 border-[#E2D9C8] shadow-inner">
                {/* Left Page: Published Text */}
                <div className="space-y-3 border-r md:border-r-[#E2D9C8] pr-0 md:pr-6">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8B5E3C] font-bold">
                    <span>Original Printed Edition Text:</span>
                    <span>By {inspectedBook.author}</span>
                  </div>
                  <p className="text-sm sm:text-base font-serif-editorial text-[#0A2947] leading-relaxed">
                    &quot;{inspectedBook.excerpt}&quot;
                  </p>
                </div>

                {/* Right Page: Dr. Ambedkar's Handwritten Marginalia in Blue Fountain Pen */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase text-blue-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Feather className="w-4 h-4 text-blue-700" />
                      Babasaheb’s Marginalia (Blue Ink):
                    </span>
                    <span className="bg-blue-100 px-2 py-0.5 rounded text-[10px]">Archival Gem</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-blue-50/80 border-l-4 border-l-blue-600 font-serif-editorial italic text-blue-950 text-sm sm:text-base leading-relaxed shadow-xs">
                    &quot;{inspectedBook.marginalia}&quot;
                  </div>
                </div>
              </div>

              {/* Target Solved Banner */}
              {inspectedBook.isTarget && (
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 text-emerald-950 space-y-3 animate-in fade-in shadow-md">
                  <div className="flex items-center gap-2 font-bold font-serif-editorial text-lg text-emerald-900">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span>Case #{activeCase.caseNumber} Solved: {activeCase.caseTitle}</span>
                  </div>
                  <p className="text-sm font-dmsans leading-relaxed">
                    {activeCase.solutionSummary}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextCase}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0A2947] text-[#FAF7F0] font-serif-editorial font-bold text-xs uppercase tracking-wider hover:bg-[#C89D56] hover:text-[#0A2947] transition-all cursor-pointer shadow-lg active:scale-95"
                    >
                      <span>{currentCaseIndex + 1 < CASES.length ? 'Next Mystery Case' : 'Complete Detective Journey'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Victory Screen */
        <div className="bg-white border-3 border-[#C89D56] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-[#C89D56] text-[#0A2947] flex items-center justify-center mx-auto shadow-2xl">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold uppercase">
              🕵️ Master Archival Investigator Certified
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947]">
              Rajgruha Archive Mysteries Solved!
            </h3>
            <p className="text-sm font-dmsans text-[#8B5E3C] leading-relaxed">
              You uncovered Babasaheb’s rare handwritten annotations across all 3 historical cases, reconstructing his intellectual battles from Lahore to London to Nagpur.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0A2947] text-[#FAF7F0] hover:bg-[#C89D56] hover:text-[#0A2947] font-serif-editorial font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Solve Archive Mysteries Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RajgruhaDetectiveGame;
