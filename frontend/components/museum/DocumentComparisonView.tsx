'use client';

import React, { useState } from 'react';
import { 
  GitCompare, Sparkles, BookOpen, Layers, ArrowRight, Check, Copy, 
  HelpCircle, Scale, Milestone, FileText, ExternalLink, Lightbulb, ShieldCheck
} from 'lucide-react';
import { ArchivalDocument, DocComparisonPreset, Language } from '@/types/museum';
import { ARCHIVE_DOCUMENTS, DOC_COMPARISON_PRESETS } from '@/data/archiveData';
import { MuseumGrandPavilion } from './MuseumGrandPavilion';
import { soundEffects } from '@/utils/soundEffects';

interface DocumentComparisonViewProps {
  language: Language;
  onOpenDocument: (doc: ArchivalDocument) => void;
  kidMode?: boolean;
}

export const DocumentComparisonView: React.FC<DocumentComparisonViewProps> = ({
  language,
  onOpenDocument,
  kidMode = false
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DOC_COMPARISON_PRESETS[0].id);
  const [docAId, setDocAId] = useState<string>(DOC_COMPARISON_PRESETS[0].docAId);
  const [docBId, setDocBId] = useState<string>(DOC_COMPARISON_PRESETS[0].docBId);
  const [isCopied, setIsCopied] = useState(false);

  const docA = ARCHIVE_DOCUMENTS.find(d => d.id === docAId) || ARCHIVE_DOCUMENTS[0];
  const docB = ARCHIVE_DOCUMENTS.find(d => d.id === docBId) || ARCHIVE_DOCUMENTS[1];

  const currentPreset = DOC_COMPARISON_PRESETS.find(p => p.id === selectedPresetId);

  const handleSelectPreset = (preset: DocComparisonPreset) => {
    soundEffects.playClick();
    setSelectedPresetId(preset.id);
    setDocAId(preset.docAId);
    setDocBId(preset.docBId);
  };

  const handleCopyAnalysis = () => {
    soundEffects.playClick();
    const analysisText = `
Historical Comparison: "${docA.title}" (${docA.year}) vs "${docB.title}" (${docB.year})
Source: Dr. B. R. Ambedkar Archival Digital Museum

COMMON THEMES:
${currentPreset ? currentPreset.commonThemes.map(t => `- ${t}`).join('\n') : '- Human dignity and constitutional equality'}

KEY EVOLUTION & DIFFERENCES:
${currentPreset ? currentPreset.keyDifferences.map(d => `- ${d}`).join('\n') : '- Evolution from polemic critique to constitutional codification'}

HISTORICAL CONTEXT:
${currentPreset ? currentPreset.historicalEvolution : 'Traces Dr. Ambedkar’s lifelong mission to establish social democracy.'}
    `.trim();

    navigator.clipboard.writeText(analysisText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] font-dmsans py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* =========================================================================
            1. MUSEUM ARCHIVAL GRAND PAVILION
            ========================================================================= */}
        <MuseumGrandPavilion
          title={
            language === 'en' ? (
              <>
                Comparative &amp;{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
                  Synthesis
                </span>{' '}
                Engine
              </>
            ) : (
              <span className="bg-gradient-to-r from-white via-[#FAF7F0] to-[#EAD8B1] bg-clip-text text-transparent">
                तुलनात्मक ऐतिहासिक शोध दालन
              </span>
            )
          }
          watermarkIcon={Scale}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-2">
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-3xl">
              Compare two historical treatises side-by-side. Trace theological transitions, conceptual evolution, and constitutional codification across Dr. Ambedkar&apos;s lifelong scholarship.
            </p>

            <button
              onClick={handleCopyAnalysis}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#FAF7F0] border border-white/20 rounded-2xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm shrink-0"
            >
              {isCopied ? <Check className="w-4 h-4 text-[#F5D061]" /> : <Copy className="w-4 h-4 text-[#FAF7F0]" />}
              <span>{isCopied ? 'Analysis Copied!' : 'Copy Comparative Report'}</span>
            </button>
          </div>
        </MuseumGrandPavilion>


      {/* Preset Pickers */}
      <div className="mb-8">
        <span className="text-xs font-montserrat uppercase tracking-wider font-bold text-neutral-500 block mb-2">
          Curated Historical Case Studies
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DOC_COMPARISON_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 text-left rounded-lg border-2 transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white border-neutral-200 hover:border-black/30'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-montserrat font-bold uppercase px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
                      Case Study
                    </span>
                    <span className="text-xs font-montserrat font-semibold text-blue-700">
                      {preset.title}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 font-dmsans">
                    {preset.historicalEvolution}
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 mt-1 ${isSelected ? 'text-blue-700' : 'text-neutral-400'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Document Selectors (Dropdowns for Custom Pairings) */}
      <div className="bg-white border-2 border-black/10 rounded-xl p-5 mb-8 shadow-sm">
        <span className="text-xs font-montserrat uppercase tracking-wider font-bold text-neutral-500 block mb-3">
          Or Select Any Two Historical Texts to Compare:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="doc-comparison-select-a" className="text-xs font-montserrat font-bold uppercase text-blue-800 block mb-1">
              Document A (Primary / Baseline):
            </label>
            <select
              id="doc-comparison-select-a"
              name="doc_comparison_a"
              value={docAId}
              onChange={(e) => {
                setDocAId(e.target.value);
                setSelectedPresetId('');
              }}
              className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-xs font-montserrat font-bold text-black focus:outline-none focus:border-blue-600"
            >
              {ARCHIVE_DOCUMENTS.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc-comparison-select-b" className="text-xs font-montserrat font-bold uppercase text-amber-800 block mb-1">
              Document B (Comparative Counterpart):
            </label>
            <select
              id="doc-comparison-select-b"
              name="doc_comparison_b"
              value={docBId}
              onChange={(e) => {
                setDocBId(e.target.value);
                setSelectedPresetId('');
              }}
              className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-xs font-montserrat font-bold text-black focus:outline-none focus:border-amber-600"
            >
              {ARCHIVE_DOCUMENTS.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.year})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Dossier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Document A Column */}
        <div className="bg-white border-2 border-blue-600/30 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-3 mb-4">
              <span className="text-[11px] font-montserrat uppercase tracking-wider font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                Document A · {docA.year}
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {docA.accessionNo}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-archivo text-black mb-2">
              {docA.title}
            </h3>

            <div className="text-xs font-montserrat text-neutral-500 mb-4 uppercase">
              {docA.categoryLabel} · Source: {docA.source}
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg mb-4">
              <span className="text-[10px] font-montserrat uppercase tracking-wider font-bold text-blue-900 block mb-1">
                Archival Excerpt
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-neutral-800 line-clamp-4 leading-relaxed">
                "{docA.fullText.substring(0, 320)}..."
              </p>
            </div>

            <p className="text-xs text-neutral-600 font-dmsans line-clamp-3">
              {docA.shortDescription}
            </p>
          </div>

          <button
            onClick={() => onOpenDocument(docA)}
            className="mt-6 w-full p-2.5 bg-white hover:bg-neutral-50 border-2 border-neutral-300 hover:border-black text-black rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <span>Open Full Folio A</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Document B Column */}
        <div className="bg-white border-2 border-amber-600/30 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-3 mb-4">
              <span className="text-[11px] font-montserrat uppercase tracking-wider font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                Document B · {docB.year}
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {docB.accessionNo}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-archivo text-black mb-2">
              {docB.title}
            </h3>

            <div className="text-xs font-montserrat text-neutral-500 mb-4 uppercase">
              {docB.categoryLabel} · Source: {docB.source}
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg mb-4">
              <span className="text-[10px] font-montserrat uppercase tracking-wider font-bold text-amber-900 block mb-1">
                Archival Excerpt
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-neutral-800 line-clamp-4 leading-relaxed">
                "{docB.fullText.substring(0, 320)}..."
              </p>
            </div>

            <p className="text-xs text-neutral-600 font-dmsans line-clamp-3">
              {docB.shortDescription}
            </p>
          </div>

          <button
            onClick={() => onOpenDocument(docB)}
            className="mt-6 w-full p-2.5 bg-white hover:bg-neutral-50 border-2 border-neutral-300 hover:border-black text-black rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <span>Open Full Folio B</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* AI Comparative Insights Breakdown */}
      <div className="bg-white border-2 border-black/20 rounded-xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-archivo uppercase text-black">
            AI Comparative Synthesis & Thematic Analysis
          </h2>
        </div>

        {/* Kid / Student Friendly Box */}
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
          <div className="flex items-center gap-2 text-green-900 font-montserrat font-bold text-xs uppercase mb-1">
            <Lightbulb className="w-4 h-4 text-green-700" />
            <span>Student & Young Scholar Summary (In Plain Words)</span>
          </div>
          <p className="text-sm font-dmsans text-green-950 font-medium leading-relaxed">
            {currentPreset 
              ? currentPreset.kidFriendlyLesson 
              : `Comparing "${docA.title}" with "${docB.title}" shows how Dr. Ambedkar consistently stood up for fairness: first by speaking truth about unfairness, and then by writing the rules so all people are protected.`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Common Core Themes */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
            <h3 className="font-archivo text-base uppercase text-black mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Shared Core Themes & Principles
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-dmsans text-neutral-800">
              {currentPreset ? (
                currentPreset.commonThemes.map((theme, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                    <span>{theme}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                    <span>Primacy of human dignity over traditional custom.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                    <span>Rejection of social hierarchy and caste discrimination.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Key Differences / Evolution of Thought */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
            <h3 className="font-archivo text-base uppercase text-black mb-3 flex items-center gap-2">
              <Milestone className="w-4 h-4 text-amber-600" />
              Key Differences & Evolution
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-dmsans text-neutral-800">
              {currentPreset ? (
                currentPreset.keyDifferences.map((diff, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2" />
                    <span>{diff}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2" />
                    <span>Difference in historical timing ({docA.year} vs {docB.year}).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2" />
                    <span>Contextual adaptation from colonial-era critique to constitutional governance.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
