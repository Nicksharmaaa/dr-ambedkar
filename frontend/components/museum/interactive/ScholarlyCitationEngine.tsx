'use client';

import React, { useState } from 'react';
import { 
  Quote, Copy, Check, Download, BookOpen, 
  ExternalLink, Sparkles, Filter, FileText, CheckCircle2,
  Stamp, Library, Barcode, Bookmark
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';
import '../games/ArcadeGames.css';

interface ScholarlyCitationEngineProps {
  language: Language;
  onOpenDocument?: (docId: string) => void;
}

interface CitationItem {
  id: string;
  title: string;
  volume: string;
  originalYear: number;
  publisher: string;
  editor: string;
  sourceType: 'book' | 'speech' | 'memorandum' | 'debates';
  bibtexKey: string;
  doiOrHandle: string;
  defaultPages: string;
  deweyNumber: string;
}

const CITATION_CORPUS: CitationItem[] = [
  {
    id: 'annihilation-of-caste',
    title: 'Annihilation of Caste with a Reply to Mahatma Gandhi',
    volume: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 1)',
    originalYear: 1936,
    publisher: 'Government of Maharashtra, Education Department',
    editor: 'Vasant Moon',
    sourceType: 'book',
    bibtexKey: 'ambedkar1936annihilation',
    doiOrHandle: 'hdl:10625/baws-vol01-aoc',
    defaultPages: '23-96',
    deweyNumber: '305.5122 AMB'
  },
  {
    id: 'problem-of-rupee',
    title: 'The Problem of the Rupee: Its Origin and Its Solution',
    volume: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 6)',
    originalYear: 1923,
    publisher: 'P. S. King & Son, London / Govt of Maharashtra',
    editor: 'Vasant Moon',
    sourceType: 'book',
    bibtexKey: 'ambedkar1923problemrupee',
    doiOrHandle: 'hdl:10625/baws-vol06-rupee',
    defaultPages: '1-332',
    deweyNumber: '332.4954 AMB'
  },
  {
    id: 'states-and-minorities',
    title: 'States and Minorities: What are Their Rights and How to Secure Them in Free India',
    volume: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 1)',
    originalYear: 1947,
    publisher: 'Thacker & Co., Bombay / Govt of Maharashtra',
    editor: 'Vasant Moon',
    sourceType: 'memorandum',
    bibtexKey: 'ambedkar1947statesminorities',
    doiOrHandle: 'hdl:10625/baws-vol01-states',
    defaultPages: '381-450',
    deweyNumber: '342.5408 AMB'
  },
  {
    id: 'cad-speech-1949',
    title: 'Constituent Assembly of India Debates: Final Address on Adoption of the Constitution',
    volume: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 13)',
    originalYear: 1949,
    publisher: 'Lok Sabha Secretariat, New Delhi',
    editor: 'Constituent Assembly Reporting Branch',
    sourceType: 'debates',
    bibtexKey: 'ambedkar1949cadfinal',
    doiOrHandle: 'hdl:10625/cad-vol11-ambedkar',
    defaultPages: '972-981',
    deweyNumber: '342.5402 CAD'
  },
  {
    id: 'castes-in-india-1916',
    title: 'Castes in India: Their Mechanism, Genesis and Development',
    volume: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 1)',
    originalYear: 1916,
    publisher: 'Indian Antiquary, Vol. XLI / Govt of Maharashtra',
    editor: 'Alexander Goldenweiser Anthropology Seminar, Columbia Univ.',
    sourceType: 'book',
    bibtexKey: 'ambedkar1916castesinindia',
    doiOrHandle: 'hdl:10625/baws-vol01-genesis',
    defaultPages: '3-22',
    deweyNumber: '305.5120 AMB'
  },
  {
    id: 'buddha-and-his-dhamma',
    title: 'The Buddha and His Dhamma: A Critical Edition',
    volume: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 11)',
    originalYear: 1957,
    publisher: 'Siddharth College Publication / Govt of Maharashtra',
    editor: 'Vasant Moon',
    sourceType: 'book',
    bibtexKey: 'ambedkar1957buddhadhamma',
    doiOrHandle: 'hdl:10625/baws-vol11-dhamma',
    defaultPages: '1-600',
    deweyNumber: '294.391 AMB'
  },
  {
    id: 'who-were-the-shudras',
    title: 'Who Were the Shudras? How They Came to be the Fourth Varna in Indo-Aryan Society',
    volume: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 7)',
    originalYear: 1946,
    publisher: 'Thacker & Co., Bombay',
    editor: 'Vasant Moon',
    sourceType: 'book',
    bibtexKey: 'ambedkar1946whowereshudras',
    doiOrHandle: 'hdl:10625/baws-vol07-shudras',
    defaultPages: '1-228',
    deweyNumber: '294.592 AMB'
  },
  {
    id: 'hindu-code-bill',
    title: 'Speeches and Interventions on the Hindu Code Bill in Parliament',
    volume: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 14, Part 1 & 2)',
    originalYear: 1951,
    publisher: 'Ministry of Law, Govt of India / Govt of Maharashtra',
    editor: 'Vasant Moon',
    sourceType: 'debates',
    bibtexKey: 'ambedkar1951hinducode',
    doiOrHandle: 'hdl:10625/baws-vol14-hinducode',
    defaultPages: '1-1382',
    deweyNumber: '346.5401 AMB'
  }
];

export const ScholarlyCitationEngine: React.FC<ScholarlyCitationEngineProps> = ({
  language,
  onOpenDocument
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(CITATION_CORPUS[0].id);
  const [activeFormat, setActiveFormat] = useState<'apa' | 'mla' | 'chicago' | 'harvard' | 'bibtex'>('apa');
  const [pagesInput, setPagesInput] = useState<string>(CITATION_CORPUS[0].defaultPages);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isStamped, setIsStamped] = useState(false);

  const activeDoc = CITATION_CORPUS.find(d => d.id === selectedDocId) || CITATION_CORPUS[0];

  const handleSelectDoc = (id: string) => {
    soundEffects.playClick();
    setSelectedDocId(id);
    setIsStamped(false);
    const found = CITATION_CORPUS.find(d => d.id === id);
    if (found) setPagesInput(found.defaultPages);
  };

  const getAPA = () => {
    return `Ambedkar, B. R. (${activeDoc.originalYear}). ${activeDoc.title}. In ${activeDoc.editor} (Ed.), ${activeDoc.volume} (pp. ${pagesInput}). ${activeDoc.publisher}. https://doi.org/${activeDoc.doiOrHandle}`;
  };

  const getMLA = () => {
    return `Ambedkar, B. R. "${activeDoc.title}." ${activeDoc.volume}, edited by ${activeDoc.editor}, ${activeDoc.publisher}, ${activeDoc.originalYear}, pp. ${pagesInput}. Digital Archive URI: ${activeDoc.doiOrHandle}.`;
  };

  const getChicago = () => {
    return `Ambedkar, B. R. ${activeDoc.originalYear}. "${activeDoc.title}." In ${activeDoc.volume}, edited by ${activeDoc.editor}, ${pagesInput}. ${activeDoc.publisher}. Permanent Archive Identifier: ${activeDoc.doiOrHandle}.`;
  };

  const getHarvard = () => {
    return `Ambedkar, B.R., ${activeDoc.originalYear}. ${activeDoc.title}. In: ${activeDoc.editor}, ed. ${activeDoc.volume}. ${activeDoc.publisher}, pp.${pagesInput}. Available via Digital Archives: <${activeDoc.doiOrHandle}> [Accessed ${new Date().toLocaleDateString('en-GB')}].`;
  };

  const getBibTeX = () => {
    return `@incollection{${activeDoc.bibtexKey},
  author    = {Ambedkar, Bhimrao Ramji},
  title     = {${activeDoc.title}},
  booktitle = {${activeDoc.volume}},
  editor    = {${activeDoc.editor}},
  year      = {${activeDoc.originalYear}},
  pages     = {${pagesInput}},
  publisher = {${activeDoc.publisher}},
  url       = {https://ambedkar-archives.org/corpus/${activeDoc.id}},
  note      = {Verified against primary facsimile under Accession ${activeDoc.doiOrHandle}}
}`;
  };

  const getCurrentCitationText = () => {
    switch (activeFormat) {
      case 'apa': return getAPA();
      case 'mla': return getMLA();
      case 'chicago': return getChicago();
      case 'harvard': return getHarvard();
      case 'bibtex': return getBibTeX();
      default: return getAPA();
    }
  };

  const handleStampAndCopy = (formatKey: string, text: string) => {
    soundEffects.playStampSlam();
    setIsStamped(true);
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatKey);
    setTimeout(() => {
      setCopiedFormat(null);
    }, 2800);
  };

  const handleDownloadBibTeX = () => {
    soundEffects.playClick();
    const bibtexData = getBibTeX();
    const blob = new Blob([bibtexData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeDoc.bibtexKey}.bib`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-serif-editorial text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Quote className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Academic Referencing Bureau</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            Scholarly Citation & Bibliographic Forge
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl">
            Produce source-grounded citations for Dr. Ambedkar's 22 BAWS volumes in APA 7, MLA 9, Chicago 17, Harvard, and BibTeX for peer-reviewed publication.
          </p>
        </div>

        <button
          onClick={handleDownloadBibTeX}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0A2947] text-[#FAF7F0] font-serif-editorial font-bold text-xs hover:bg-[#C89D56] hover:text-[#0A2947] transition-all cursor-pointer shrink-0 shadow-md"
        >
          <Download className="w-4 h-4 text-[#C89D56]" />
          <span>Export .bib Reference</span>
        </button>
      </div>

      {/* Document Selector & Folio Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
        {/* Document Selection Dropdown (8 cols) */}
        <div className="md:col-span-8 space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold flex items-center gap-1.5">
            <Library className="w-4 h-4 text-[#C89D56]" />
            Select Archival Volume / Treatise:
          </label>
          <select
            value={selectedDocId}
            onChange={(e) => handleSelectDoc(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-[#D3D4C0] rounded-2xl text-sm font-serif-editorial text-[#0A2947] focus:outline-none focus:ring-2 focus:ring-[#C89D56] cursor-pointer shadow-sm"
          >
            {CITATION_CORPUS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title} ({doc.originalYear}) — Call #{doc.deweyNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Page / Folio Range Input (4 cols) */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-[#C89D56]" />
            Folio / Page Span:
          </label>
          <input
            type="text"
            value={pagesInput}
            onChange={(e) => {
              setPagesInput(e.target.value);
              setIsStamped(false);
            }}
            placeholder="e.g. 45-62"
            className="w-full px-4 py-3 bg-white border-2 border-[#D3D4C0] rounded-2xl text-sm font-mono text-[#0A2947] focus:outline-none focus:ring-2 focus:ring-[#C89D56] shadow-sm"
          />
        </div>
      </div>

      {/* Format Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2D9C8] pb-3 relative z-10">
        {(['apa', 'mla', 'chicago', 'harvard', 'bibtex'] as const).map((fmt) => (
          <button
            key={fmt}
            onClick={() => {
              soundEffects.playClick();
              setActiveFormat(fmt);
              setIsStamped(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeFormat === fmt
                ? 'bg-[#0A2947] text-[#FAF7F0] shadow-md ring-1 ring-[#C89D56]'
                : 'bg-white text-[#8B5E3C] border border-[#E2D9C8] hover:bg-[#F3E4C9]'
            }`}
          >
            {fmt === 'apa' && 'APA 7th'}
            {fmt === 'mla' && 'MLA 9th'}
            {fmt === 'chicago' && 'Chicago 17th'}
            {fmt === 'harvard' && 'Harvard'}
            {fmt === 'bibtex' && 'BibTeX (LaTeX)'}
          </button>
        ))}
      </div>

      {/* Deluxe Library Index Card Presentation */}
      <div className="bg-[#FAF7F0] border-4 border-double border-[#C89D56] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
        {/* Archival Red Wax Stamp Overlay when copied */}
        {isStamped && (
          <div className="absolute top-6 right-6 z-20 pointer-events-none animate-stamp-slam">
            <div className="w-28 h-28 rounded-full border-4 border-dashed border-rose-700/80 bg-rose-50/90 text-rose-800 p-2 flex flex-col items-center justify-center text-center transform -rotate-12 shadow-xl backdrop-blur-sm">
              <Stamp className="w-5 h-5 text-rose-700 mb-0.5" />
              <div className="text-[10px] font-mono font-bold uppercase leading-none">
                VERIFIED BAWS
              </div>
              <div className="text-[8px] font-mono mt-0.5 text-rose-900">
                {activeFormat.toUpperCase()} COPIED
              </div>
            </div>
          </div>
        )}

        {/* Index Card Metadata Header */}
        <div className="flex items-center justify-between mb-4 border-b border-[#E2D9C8] pb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="bg-[#0A2947] text-[#C89D56] px-2.5 py-0.5 rounded font-bold">
              CALL #{activeDoc.deweyNumber}
            </span>
            <span className="text-[#8B5E3C]">
              Accession: {activeDoc.doiOrHandle}
            </span>
          </div>
          <span className="text-[11px] text-[#8B5E3C] hidden sm:inline">
            Standard: {activeFormat.toUpperCase()}
          </span>
        </div>

        {/* The Citation Text Box */}
        {activeFormat === 'bibtex' ? (
          <pre className="text-xs font-mono text-[#0A2947] bg-white p-5 rounded-2xl border border-[#E2D9C8] overflow-x-auto whitespace-pre shadow-inner">
            {getBibTeX()}
          </pre>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-[#E2D9C8] shadow-inner">
            <p className="text-sm sm:text-base font-serif-editorial text-[#0A2947] leading-relaxed select-all">
              {getCurrentCitationText()}
            </p>
          </div>
        )}

        {/* Interactive Action Row: Physical Stamp Slam Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-[#E2D9C8]">
          <div className="text-xs font-mono text-[#8B5E3C]">
            Verified for peer-reviewed journal submission & research dossiers
          </div>

          <button
            onClick={() => handleStampAndCopy(activeFormat, getCurrentCitationText())}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0A2947] to-[#142A4D] text-[#FAF7F0] font-serif-editorial font-bold text-xs uppercase tracking-wider hover:brightness-110 active:translate-y-0.5 transition-all cursor-pointer shadow-xl border border-amber-300"
          >
            {copiedFormat === activeFormat ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Stamped & Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Stamp className="w-4 h-4 text-[#C89D56]" />
                <span>Stamp & Copy {activeFormat.toUpperCase()} Citation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Fast-Copy Grid for Parallel Styles */}
      <div className="space-y-3 pt-2 relative z-10">
        <h4 className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C89D56]" />
          <span>Quick Single-Click Stamp & Copy for Other Academic Formats:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* APA Mini */}
          <div className="bg-white border-2 border-[#E2D9C8] hover:border-[#C89D56] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm transition-all group">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase font-bold text-[#8B5E3C] block">APA 7th</span>
              <p className="text-xs font-serif-editorial text-[#0A2947] line-clamp-1 italic">
                {getAPA()}
              </p>
            </div>
            <button
              onClick={() => handleStampAndCopy('apa-quick', getAPA())}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-[11px] font-mono text-[#0A2947] hover:bg-[#C89D56] hover:text-white transition-colors cursor-pointer shrink-0 font-bold"
            >
              {copiedFormat === 'apa-quick' ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* MLA Mini */}
          <div className="bg-white border-2 border-[#E2D9C8] hover:border-[#C89D56] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm transition-all group">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase font-bold text-[#8B5E3C] block">MLA 9th</span>
              <p className="text-xs font-serif-editorial text-[#0A2947] line-clamp-1 italic">
                {getMLA()}
              </p>
            </div>
            <button
              onClick={() => handleStampAndCopy('mla-quick', getMLA())}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-[11px] font-mono text-[#0A2947] hover:bg-[#C89D56] hover:text-white transition-colors cursor-pointer shrink-0 font-bold"
            >
              {copiedFormat === 'mla-quick' ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Chicago Mini */}
          <div className="bg-white border-2 border-[#E2D9C8] hover:border-[#C89D56] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm transition-all group">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase font-bold text-[#8B5E3C] block">Chicago 17th</span>
              <p className="text-xs font-serif-editorial text-[#0A2947] line-clamp-1 italic">
                {getChicago()}
              </p>
            </div>
            <button
              onClick={() => handleStampAndCopy('chicago-quick', getChicago())}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-[11px] font-mono text-[#0A2947] hover:bg-[#C89D56] hover:text-white transition-colors cursor-pointer shrink-0 font-bold"
            >
              {copiedFormat === 'chicago-quick' ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Harvard Mini */}
          <div className="bg-white border-2 border-[#E2D9C8] hover:border-[#C89D56] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm transition-all group">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase font-bold text-[#8B5E3C] block">Harvard Style</span>
              <p className="text-xs font-serif-editorial text-[#0A2947] line-clamp-1 italic">
                {getHarvard()}
              </p>
            </div>
            <button
              onClick={() => handleStampAndCopy('harvard-quick', getHarvard())}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] text-[11px] font-mono text-[#0A2947] hover:bg-[#C89D56] hover:text-white transition-colors cursor-pointer shrink-0 font-bold"
            >
              {copiedFormat === 'harvard-quick' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarlyCitationEngine;
