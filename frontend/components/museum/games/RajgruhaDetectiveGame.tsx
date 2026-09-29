'use client';

import React, { useState } from 'react';
import { 
  BookMarked, Search, Key, Sparkles, CheckCircle2, 
  HelpCircle, Eye, ArrowRight, RotateCcw, Award, Lock, Unlock,
  Bookmark, Feather, FileText, Check, ChevronRight, Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
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
    missionBrief: 'In 1936, the Jat-Pat-Todak Mandal cancelled Dr. Ambedkar’s presidential speech because of his critique of Vedic authority. Inspect the Political Philosophy shelf in Rajgruha to locate his original proof verifying that caste is a division of labourers!',
    targetBookTitle: 'Annihilation of Caste (Galley Proofs with Marginalia)',
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
        title: 'The Evolution of Provincial Finance in British India',
        author: 'Dr. B. R. Ambedkar (Columbia Ph.D)',
        year: '1925',
        shelfLocation: 'Shelf 7, Vol. 19',
        spineColor: 'maroon',
        hasClue: false,
        excerpt: 'Decentralization of revenue is the bedrock of democratic accountability.',
        marginalia: 'Note: "Imperial taxation sucked wealth from the provinces to fund military conquest. Federal fiscal devolution is imperative."',
        isTarget: false
      }
    ],
    solutionSummary: 'Magnificent detective work! You located Dr. Ambedkar’s seminal central banking proposal which he presented before the Hilton Young Commission, directly resulting in the enactment of the Reserve Bank of India Act of 1934!'
  },
  {
    id: 'case-3',
    caseNumber: 3,
    caseTitle: 'The 22 Historic Vows of Deekshabhoomi (1956)',
    missionBrief: 'In October 1956 at Nagpur, Dr. Ambedkar led over 500,000 people to embrace the Dhamma. Search the Comparative Religion Shelf to discover his working typescript of the 22 historic vows of ethical liberation.',
    targetBookTitle: 'The Buddha and His Dhamma (Corrected Working Typescript)',
    bayName: 'Rajgruha Archival Bay 12 — Comparative Religion & Buddhist Philosophy',
    bookshelf: [
      {
        id: 'book-3a',
        title: 'The Dhammapada (Pali Canon Translation)',
        author: 'Max Müller (Ed.)',
        year: '1881',
        shelfLocation: 'Shelf 12, Vol. 09',
        spineColor: 'amber',
        hasClue: false,
        excerpt: 'Mind precedes all mental states. Mind is their chief; they are all mind-wrought.',
        marginalia: 'Underlined in red pencil: "The Buddha anchored all morality in human consciousness, liberating religion from priesthood and sacrifices."',
        isTarget: false
      },
      {
        id: 'book-3b',
        title: 'The Buddha and His Dhamma (Working Typescript)',
        author: 'Dr. B. R. Ambedkar (1956)',
        year: '1956',
        shelfLocation: 'Shelf 12, Rare Vault',
        spineColor: 'maroon',
        hasClue: true,
        excerpt: 'Religion must be judged by social utility and morality. True Dhamma is Prajna (understanding), Karuna (compassion), and Samata (equality).',
        marginalia: 'Drafted in margins with fountain pen: "Vow 1 to 22: I shall have no faith in Brahma, Vishnu, or Mahesh... I shall treat all human beings as equals and lead my life according to the Noble Eightfold Path. Without social morality, freedom is impossible!"',
        isTarget: true
      },
      {
        id: 'book-3c',
        title: 'Buddhism in Translations',
        author: 'Henry Clarke Warren (Harvard)',
        year: '1896',
        shelfLocation: 'Shelf 12, Vol. 22',
        spineColor: 'green',
        hasClue: false,
        excerpt: 'There is no permanent ego; life is an unbroken stream of cause and effect.',
        marginalia: 'Pencil note on Anatta: "Because there is no immutable soul, human beings can always change and reform their society."',
        isTarget: false
      },
      {
        id: 'book-3d',
        title: 'The Essence of Buddhism',
        author: 'Prof. P. Lakshmi Narasu',
        year: '1907',
        shelfLocation: 'Shelf 12, Vol. 03',
        spineColor: 'navy',
        hasClue: false,
        excerpt: 'Buddhism is not a mystical retreat from life, but an active pursuit of social justice and brotherhood.',
        marginalia: 'Personal preface note by Babasaheb: "Prof. Narasu was one of the finest modern interpreters of Dhamma as social enlightenment."',
        isTarget: false
      }
    ],
    solutionSummary: 'Case closed with highest honors! You discovered Dr. Ambedkar’s original handwritten draft of the 22 Vows taken at Deekshabhoomi, which triggered the greatest bloodless spiritual revolution for human dignity in modern world history.'
  }
];

export const RajgruhaDetectiveGame: React.FC<RajgruhaDetectiveGameProps> = ({
  language
}) => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [inspectedBookId, setInspectedBookId] = useState<string | null>(null);
  const [solvedCases, setSolvedCases] = useState<string[]>([]);
  const [showVictory, setShowVictory] = useState(false);

  const activeCase = CASES[currentCaseIndex];
  const inspectedBook = activeCase.bookshelf.find(b => b.id === inspectedBookId) || null;
  const isCaseSolved = solvedCases.includes(activeCase.id);

  const handleInspectBook = (bookId: string) => {
    soundEffects.playBookOpen();
    setInspectedBookId(bookId);

    const chosen = activeCase.bookshelf.find(b => b.id === bookId);
    if (chosen?.isTarget && !isCaseSolved) {
      soundEffects.playStampSlam();
      setTimeout(() => {
        soundEffects.playSuccess();
        soundEffects.playCoinDrop();
      }, 250);

      setSolvedCases(prev => [...prev, activeCase.id]);
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNextCase = () => {
    soundEffects.playClick();
    if (currentCaseIndex + 1 < CASES.length) {
      setCurrentCaseIndex(prev => prev + 1);
      setInspectedBookId(null);
    } else {
      setShowVictory(true);
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestart = () => {
    soundEffects.playClick();
    setCurrentCaseIndex(0);
    setInspectedBookId(null);
    setSolvedCases([]);
    setShowVictory(false);
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
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
      {/* Header Arcade Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-serif-editorial text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Key className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Archival Investigation & Mystery Game</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            Rajgruha Library Detective: Marginalia Mysteries
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl">
            Explore Dr. Ambedkar’s legendary 50,000-volume personal library at Rajgruha, Mumbai. Pull antique leather books, inspect authentic handwritten marginal notes, and solve historic mysteries!
          </p>
        </div>

        {/* Solved Cases Counter */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-[#C89D56] shadow-sm">
          <Award className="w-6 h-6 text-[#C89D56]" />
          <div className="text-left">
            <div className="text-xs font-mono font-bold text-[#0A2947]">
              {solvedCases.length} of {CASES.length} Cases Solved
            </div>
            <div className="text-[10px] font-mono text-[#8B5E3C] uppercase tracking-wider font-semibold">
              Senior Archival Sleuth
            </div>
          </div>
        </div>
      </div>

      {!showVictory ? (
        <div className="space-y-6 relative z-10">
          {/* Mission Briefing Card with Vintage Detective Badge */}
          <div className="bg-white border-2 border-[#D3D4C0] rounded-2xl p-6 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#F4EBD9] pb-2.5 text-xs font-mono">
              <span className="font-bold text-[#0A2947] uppercase bg-[#FAF7F0] px-3 py-1 rounded-lg border border-[#E2D9C8] flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#C89D56]" />
                Mystery Case #{activeCase.caseNumber}: {activeCase.caseTitle}
              </span>
              <span className={isCaseSolved ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-amber-700 font-bold'}>
                {isCaseSolved ? '✅ Case Solved!' : '🔍 Clue Hunting'}
              </span>
            </div>

            <p className="text-sm font-dmsans text-[#0A2947] leading-relaxed">
              <strong>Curator's Mission Brief:</strong> {activeCase.missionBrief}
            </p>
          </div>

          {/* Authentic 3D Mahogany Bookshelf */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-[#C89D56]" />
                Click Any Leather Book Spine to Pull and Examine Rare Marginalia:
              </span>
              <span className="hidden sm:inline text-[#8B5E3C]/80">Rajgruha Collection Bay</span>
            </div>

            {/* Mahogany Shelf Container */}
            <div className="mahogany-shelf p-6 sm:p-8 rounded-2xl border-4 border-[#3e220e] shadow-2xl relative">
              {/* Brass Nameplate on Shelf */}
              <div className="brass-plate px-4 py-1.5 rounded-md inline-block text-[11px] font-mono font-bold tracking-widest uppercase mb-6 mx-auto shadow-md">
                🏷️ {activeCase.bayName}
              </div>

              {/* The Books on the Shelf */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end pt-4 border-b-8 border-[#3e220e]">
                {activeCase.bookshelf.map((book) => {
                  const isSelected = inspectedBookId === book.id;
                  const spineClass = getSpineClass(book.spineColor);

                  return (
                    <button
                      key={book.id}
                      onClick={() => handleInspectBook(book.id)}
                      className={`h-56 sm:h-64 rounded-t-xl p-3.5 flex flex-col justify-between text-left transition-all duration-300 cursor-pointer border-x-2 border-t-2 relative overflow-hidden group shadow-2xl ${spineClass} ${
                        isSelected
                          ? '-translate-y-6 ring-4 ring-amber-400 border-amber-300 shadow-amber-500/30'
                          : 'border-white/10 hover:-translate-y-3 hover:border-amber-300/60'
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
                          <span>{isSelected ? 'Opened' : 'Pull Book'}</span>
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Wooden Shelf Base Plinth */}
              <div className="w-full h-4 bg-gradient-to-r from-[#201005] via-[#4d280e] to-[#201005] rounded-b-lg mt-0.5 shadow-inner" />
            </div>
          </div>

          {/* Inspected Book Open Double-Page Presentation */}
          {inspectedBook && (
            <div className="bg-white border-2 border-[#C89D56] rounded-2xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in zoom-in-95 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#F4EBD9] pb-3 text-xs font-mono">
                <span className="font-bold text-[#0A2947] flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#C89D56]" />
                  Examining Volume: {inspectedBook.title} ({inspectedBook.year})
                </span>
                <span className={inspectedBook.isTarget ? 'text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300' : 'text-[#8B5E3C]'}>
                  {inspectedBook.isTarget ? '🎯 HISTORIC TARGET CLUE UNLOCKED!' : 'General Reference Volume'}
                </span>
              </div>

              {/* 2-Page Open Spread */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF7F0] p-6 rounded-2xl border border-[#E2D9C8]">
                {/* Left Page: Published Text */}
                <div className="space-y-3 border-r md:border-r-[#E2D9C8] pr-0 md:pr-6">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8B5E3C]">
                    <span>Original Printed Text:</span>
                    <span>By {inspectedBook.author}</span>
                  </div>
                  <p className="text-sm font-serif-editorial text-[#0A2947] leading-relaxed">
                    "{inspectedBook.excerpt}"
                  </p>
                </div>

                {/* Right Page: Dr. Ambedkar's Handwritten Marginalia in Blue Fountain Pen */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase text-blue-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Feather className="w-3.5 h-3.5 text-blue-700" />
                      Babasaheb’s Marginalia (Blue Ink):
                    </span>
                    <span>Rare Archive</span>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50/60 border-l-4 border-l-blue-600 font-serif-editorial italic text-blue-950 text-sm leading-relaxed">
                    {inspectedBook.marginalia}
                  </div>
                </div>
              </div>

              {/* Target Solved Banner */}
              {inspectedBook.isTarget && (
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 text-emerald-950 space-y-3 animate-in fade-in">
                  <div className="font-serif-editorial font-bold text-base flex items-center gap-2 text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Historic Clue Verified: Mystery Solved!
                  </div>
                  <p className="text-xs sm:text-sm font-dmsans leading-relaxed">
                    {activeCase.solutionSummary}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextCase}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A2947] text-[#FAF7F0] font-serif-editorial font-bold text-xs uppercase tracking-wider hover:bg-[#C89D56] hover:text-[#0A2947] transition-colors cursor-pointer shadow"
                    >
                      <span>{currentCaseIndex + 1 < CASES.length ? 'Investigate Next Mystery' : 'View Detective Graduation'}</span>
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
        <div className="bg-white border-2 border-[#C89D56] rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-[#C89D56] text-[#0A2947] flex items-center justify-center mx-auto shadow-2xl">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-mono text-xs font-bold uppercase tracking-wider">
              🏆 Master Archival Detective Certified
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947]">
              Rajgruha’s Greatest Mysteries Unlocked!
            </h3>
            <p className="text-sm font-dmsans text-[#8B5E3C] leading-relaxed">
              You uncovered Dr. Ambedkar's private marginalia across economics, social reform, and religion. You've earned the title of <strong>Curatorial Scholar & Rajgruha Master Sleuth</strong>!
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A2947] text-[#FAF7F0] hover:bg-[#C89D56] hover:text-[#0A2947] font-serif-editorial font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Re-examine All Rajgruha Cases</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RajgruhaDetectiveGame;
