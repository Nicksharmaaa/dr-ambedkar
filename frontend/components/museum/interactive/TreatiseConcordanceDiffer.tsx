'use client';

import React, { useState } from 'react';
import { 
  Scale, FileText, ArrowRight, GitCompare, 
  Sparkles, BookOpen, Copy, Check, ChevronRight, Info,
  Layers, Eye, Highlighter, CheckCircle2
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import '../games/ArcadeGames.css';

interface TreatiseConcordanceDifferProps {
  language: Language;
  onOpenDocument?: (docId: string) => void;
}

interface ConcordancePair {
  id: string;
  title: string;
  sourceA: {
    label: string;
    date: string;
    context: string;
    textSegments: Array<{ text: string; status: 'normal' | 'modified' | 'deleted' }>;
  };
  sourceB: {
    label: string;
    date: string;
    context: string;
    textSegments: Array<{ text: string; status: 'normal' | 'modified' | 'added' }>;
  };
  curatorialAnalysis: string;
  doctrinalImpact: string;
}

const CONCORDANCE_PAIRS: ConcordancePair[] = [
  {
    id: 'constitution-draft-vs-final',
    title: 'Draft Constitution (Feb 1948) vs. Final Enacted Constitution (Nov 1949)',
    sourceA: {
      label: 'Drafting Committee Draft Constitution',
      date: '21 February 1948',
      context: 'Presented by Dr. B. R. Ambedkar to the President of the Constituent Assembly, Dr. Rajendra Prasad.',
      textSegments: [
        { text: "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a ", status: 'normal' },
        { text: "SOVEREIGN DEMOCRATIC REPUBLIC", status: 'modified' },
        { text: " and to secure to all its citizens: ", status: 'normal' },
        { text: "JUSTICE, social, economic and political; ", status: 'normal' },
        { text: "LIBERTY of thought, expression, belief, faith and worship; ", status: 'normal' },
        { text: "EQUALITY of status and of opportunity; and to promote among them all ", status: 'normal' },
        { text: "FRATERNITY assuring the dignity of the individual and the unity of the Nation;", status: 'normal' },
        { text: " IN OUR CONSTITUENT ASSEMBLY this ", status: 'normal' },
        { text: "--- day of ---, 194--", status: 'deleted' },
        { text: " do HEREBY ADOPT, ENACT AND GIVE TO OURSELVES THIS CONSTITUTION.", status: 'normal' }
      ]
    },
    sourceB: {
      label: 'Final Enacted Constitution of India',
      date: '26 November 1949 / 26 Jan 1950',
      context: 'Signed by members of the Assembly; enacted after 11 sessions, 165 sittings, and 2,473 adopted amendments.',
      textSegments: [
        { text: "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a ", status: 'normal' },
        { text: "SOVEREIGN DEMOCRATIC REPUBLIC", status: 'modified' },
        { text: " and to secure to all its citizens: ", status: 'normal' },
        { text: "JUSTICE, social, economic and political; ", status: 'normal' },
        { text: "LIBERTY of thought, expression, belief, faith and worship; ", status: 'normal' },
        { text: "EQUALITY of status and of opportunity; and to promote among them all ", status: 'normal' },
        { text: "FRATERNITY assuring the dignity of the individual and the unity of the Nation;", status: 'normal' },
        { text: " IN OUR CONSTITUENT ASSEMBLY this ", status: 'normal' },
        { text: "twenty-sixth day of November, 1949,", status: 'added' },
        { text: " do HEREBY ADOPT, ENACT AND GIVE TO OURSELVES THIS CONSTITUTION.", status: 'normal' }
      ]
    },
    curatorialAnalysis: "During debates on November 15, 1948, Prof. K. T. Shah moved an amendment to insert the words 'Secular, Socialist'. Dr. Ambedkar rigorously argued that the Constitution should not tie future democratic generations to any singular socio-economic dogma, while ensuring that Part IV (Directive Principles) provided the structural substance of socialist welfare.",
    doctrinalImpact: "Affirmed the 'Basic Structure' doctrine that Indian democracy derives sovereignty directly from 'We, the People' and balances fundamental civil liberties with socialist welfare principles."
  },
  {
    id: 'aoc-first-vs-second',
    title: 'Annihilation of Caste (1936 Draft) vs. 2nd Edition with Gandhi Debate (1937)',
    sourceA: {
      label: 'First Edition (Lahore Conference Text)',
      date: 'May 1936',
      context: 'Self-published by Ambedkar after the Jat-Pat-Todak Mandal cancelled the conference in Lahore.',
      textSegments: [
        { text: "Caste is not just a division of labour, it is a division of labourers. ", status: 'normal' },
        { text: "It is a hierarchy in which the divisions of labourers are graded one above the other. ", status: 'normal' },
        { text: "The real remedy for breaking Caste is inter-marriage. Nothing else will serve as the solvent of Caste.", status: 'normal' }
      ]
    },
    sourceB: {
      label: 'Second Edition with Appendices & Rejoinders',
      date: '1937',
      context: 'Enriched with Mahatma Gandhi’s review in "Harijan" and Dr. Ambedkar’s line-by-line scholarly vindication.',
      textSegments: [
        { text: "Caste is not just a division of labour, it is a division of labourers. ", status: 'normal' },
        { text: "It is a hierarchy in which the divisions of labourers are graded one above the other. ", status: 'normal' },
        { text: "The real remedy for breaking Caste is inter-marriage. Nothing else will serve as the solvent of Caste. ", status: 'normal' },
        { text: "[Appendix I & II Added]: In response to Mahatma Gandhi's claim in Harijan that 'Caste has nothing to do with religion,' Ambedkar demonstrates that caste endogamy is sanctified by the Shastras and cannot be reformed without dynamiting religious sanction.", status: 'added' }
      ]
    },
    curatorialAnalysis: "The second edition represents one of the most celebrated intellectual exchanges in modern Indian history. Gandhi defended an idealized 'Varna' as division of duties without hierarchy, while Ambedkar exposed Varna as the ideological progenitor of untouchability, proving that idealizing Varna while condemning caste is a logical contradiction.",
    doctrinalImpact: "Established the intellectual separation between political nationalism and social emancipation, defining modern anti-caste jurisprudence."
  },
  {
    id: 'states-minorities-vs-dpsp',
    title: 'States and Minorities (1947 Memorandum) vs. Part IV Directive Principles',
    sourceA: {
      label: 'States and Minorities (Fundamental Rights Section)',
      date: 'March 1947',
      context: 'Ambedkar’s official memorandum on behalf of the All-India Scheduled Castes Federation.',
      textSegments: [
        { text: "Clause II, Section II: The State shall supply the capital necessary for agriculture and industry. ", status: 'normal' },
        { text: "Key industries shall be owned and run by the State. Basic industries shall be owned and run by the State. ", status: 'deleted' },
        { text: "Insurance shall be a monopoly of the State. The land shall belong to the State and be leased out to citizens without distinction of caste. ", status: 'deleted' },
        { text: "[Enforceable as Fundamental Rights in Court of Law]", status: 'deleted' }
      ]
    },
    sourceB: {
      label: 'Constitution of India, Part IV (Articles 38 & 39)',
      date: 'Adopted 1949',
      context: 'Compromise reached within the Constituent Assembly Advisory Committee on Fundamental Rights.',
      textSegments: [
        { text: "Article 38 & 39: The State shall strive to promote the welfare of the people... ", status: 'normal' },
        { text: "The State shall, in particular, direct its policy towards securing that the ownership and control of the material resources of the community are so distributed as best to subserve the common good; ", status: 'added' },
        { text: "that the operation of the economic system does not result in the concentration of wealth. ", status: 'added' },
        { text: "[Non-justiciable Directive Principles of State Policy]", status: 'modified' }
      ]
    },
    curatorialAnalysis: "In 1947, Ambedkar sought to constitutionalize State Socialism into the enforceable Chapter on Fundamental Rights so that future parliamentary majorities could not dismantle economic democracy. The Advisory Committee resisted mandatory nationalization, reclassifying these redistributive imperatives into non-justiciable Directive Principles.",
    doctrinalImpact: "Spawned India’s mixed economy model and the nationalization of life insurance (1956) and commercial banks (1969)."
  }
];

export const TreatiseConcordanceDiffer: React.FC<TreatiseConcordanceDifferProps> = ({
  language,
  onOpenDocument
}) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(CONCORDANCE_PAIRS[0].id);
  const [isCopied, setIsCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'changes'>('all');

  const activePair = CONCORDANCE_PAIRS.find(p => p.id === selectedPairId) || CONCORDANCE_PAIRS[0];

  const handleSelectPair = (id: string) => {
    soundEffects.playFlip();
    setSelectedPairId(id);
  };

  const handleCopyDiff = () => {
    soundEffects.playStampSlam();
    const textA = activePair.sourceA.textSegments.map(s => s.text).join('');
    const textB = activePair.sourceB.textSegments.map(s => s.text).join('');
    const digest = `--- TREATISE CONCORDANCE COMPARISON ---\nTITLE: ${activePair.title}\n\n[SOURCE A: ${activePair.sourceA.label} (${activePair.sourceA.date})]\n${textA}\n\n[SOURCE B: ${activePair.sourceB.label} (${activePair.sourceB.date})]\n${textB}\n\nCURATORIAL ANALYSIS:\n${activePair.curatorialAnalysis}\n\nDOCTRINAL IMPACT:\n${activePair.doctrinalImpact}`;
    navigator.clipboard.writeText(digest);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-serif-editorial text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <GitCompare className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Manuscript Variorum Light-Table</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            Treatise Concordance & Ideological Differ
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl">
            Compare historical draft evolutions, textual additions, and amendments across Babasaheb’s seminal legislative and philosophical drafts.
          </p>
        </div>

        <button
          onClick={handleCopyDiff}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0A2947] text-[#FAF7F0] font-serif-editorial font-bold text-xs hover:bg-[#C89D56] hover:text-[#0A2947] transition-all cursor-pointer shrink-0 shadow-md"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#C89D56]" />}
          <span>{isCopied ? 'Concordance Copied!' : 'Copy Concordance Diff'}</span>
        </button>
      </div>

      {/* Draft Pair Selector Cards */}
      <div className="space-y-2 relative z-10">
        <label className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#C89D56]" />
          Select Historical Draft Comparison Pair:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CONCORDANCE_PAIRS.map((pair) => {
            const isSelected = pair.id === selectedPairId;
            return (
              <button
                key={pair.id}
                onClick={() => handleSelectPair(pair.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#0A2947] to-[#041424] text-[#FAF7F0] border-[#C89D56] shadow-xl ring-2 ring-[#C89D56]/60 scale-[1.02]'
                    : 'bg-white text-[#0A2947] border-[#D3D4C0] hover:border-[#C89D56] hover:bg-[#F3E4C9]/40 shadow-sm'
                }`}
              >
                <div>
                  <div className={`text-[10px] font-mono uppercase tracking-wider mb-1 font-bold ${isSelected ? 'text-[#C89D56]' : 'text-[#8B5E3C]'}`}>
                    Historical Variorum
                  </div>
                  <div className="font-serif-editorial font-bold text-sm leading-snug line-clamp-2">
                    {pair.title}
                  </div>
                </div>
                <div className={`text-[11px] font-mono mt-3 flex items-center gap-1 font-semibold ${isSelected ? 'text-amber-200' : 'text-[#8B5E3C]'}`}>
                  <span>Inspect text diff</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Variorum Light-Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
        {/* Source A Leaf */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 shadow-md space-y-3 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between border-b border-[#F4EBD9] pb-3 text-xs font-mono">
              <span className="font-bold text-[#8B5E3C] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C89D56]" />
                Originating Draft (Source A)
              </span>
              <span className="bg-[#FAF7F0] px-2.5 py-0.5 rounded-lg border border-[#E2D9C8] text-[#0A2947] font-bold">
                {activePair.sourceA.date}
              </span>
            </div>
            <h4 className="font-serif-editorial font-bold text-base text-[#0A2947] mt-3 mb-1">
              {activePair.sourceA.label}
            </h4>
            <p className="text-xs text-[#8B5E3C] font-dmsans mb-4 italic">
              {activePair.sourceA.context}
            </p>

            {/* Rendered Text with Highlighting */}
            <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-2xl p-5 font-serif-editorial text-sm sm:text-base leading-relaxed text-[#0A2947] shadow-inner">
              {activePair.sourceA.textSegments.map((segment, idx) => {
                if (segment.status === 'deleted') {
                  return (
                    <span 
                      key={idx} 
                      className="bg-rose-100 text-rose-950 line-through decoration-rose-600 decoration-2 px-1.5 py-0.5 rounded mx-0.5 font-bold shadow-sm"
                      title="Omitted in subsequent constitutional revision"
                    >
                      {segment.text}
                    </span>
                  );
                }
                if (segment.status === 'modified') {
                  return (
                    <span 
                      key={idx} 
                      className="bg-amber-100/90 text-amber-950 border-b-2 border-amber-500 px-1.5 py-0.5 rounded mx-0.5 font-bold shadow-sm"
                      title="Rephrased during Assembly debates"
                    >
                      {segment.text}
                    </span>
                  );
                }
                return <span key={idx}>{segment.text}</span>;
              })}
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#8B5E3C] pt-3 border-t border-[#F4EBD9] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Yellow = Rephrased
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Red = Omitted in Revision
            </span>
          </div>
        </div>

        {/* Source B Leaf */}
        <div className="bg-white border-2 border-[#C89D56] rounded-3xl p-6 shadow-md space-y-3 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between border-b border-[#F4EBD9] pb-3 text-xs font-mono">
              <span className="font-bold text-[#0A2947] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Evolved Revision (Source B)
              </span>
              <span className="bg-[#0A2947] text-[#FAF7F0] px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm">
                {activePair.sourceB.date}
              </span>
            </div>
            <h4 className="font-serif-editorial font-bold text-base text-[#0A2947] mt-3 mb-1">
              {activePair.sourceB.label}
            </h4>
            <p className="text-xs text-[#8B5E3C] font-dmsans mb-4 italic">
              {activePair.sourceB.context}
            </p>

            {/* Rendered Text with Highlighting */}
            <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-2xl p-5 font-serif-editorial text-sm sm:text-base leading-relaxed text-[#0A2947] shadow-inner">
              {activePair.sourceB.textSegments.map((segment, idx) => {
                if (segment.status === 'added') {
                  return (
                    <span 
                      key={idx} 
                      className="bg-emerald-100 text-emerald-950 border-b-2 border-emerald-600 px-1.5 py-0.5 rounded mx-0.5 font-bold shadow-sm"
                      title="Newly introduced addition"
                    >
                      {segment.text}
                    </span>
                  );
                }
                if (segment.status === 'modified') {
                  return (
                    <span 
                      key={idx} 
                      className="bg-amber-100/90 text-amber-950 border-b-2 border-amber-500 px-1.5 py-0.5 rounded mx-0.5 font-bold shadow-sm"
                      title="Rephrased variant"
                    >
                      {segment.text}
                    </span>
                  );
                }
                return <span key={idx}>{segment.text}</span>;
              })}
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#8B5E3C] pt-3 border-t border-[#F4EBD9] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Green = Newly Enacted Clause
            </span>
            <span className="text-emerald-800 font-bold">
              ✓ Supreme Law of the Land
            </span>
          </div>
        </div>
      </div>

      {/* Curatorial & Doctrinal Analysis Banner */}
      <div className="bg-white border-2 border-l-8 border-l-[#C89D56] border-[#D3D4C0] rounded-2xl p-6 shadow-md space-y-3 relative z-10">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-[#0A2947]">
          <Info className="w-4 h-4 text-[#C89D56]" />
          <span>Curatorial Textual Variance Rationale</span>
        </div>
        <p className="text-sm font-dmsans text-[#0A2947] leading-relaxed">
          {activePair.curatorialAnalysis}
        </p>
        <div className="pt-3 border-t border-[#F4EBD9] flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-[#8B5E3C]">
          <span className="font-bold font-mono text-[#0A2947] shrink-0">Constitutional Jurisprudence Impact:</span>
          <span className="font-dmsans text-[#0A2947]/90">{activePair.doctrinalImpact}</span>
        </div>
      </div>
    </div>
  );
};

export default TreatiseConcordanceDiffer;
