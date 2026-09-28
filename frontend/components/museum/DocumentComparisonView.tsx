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
      <div className="space-y-3">
        <span className="text-xs font-montserrat uppercase tracking-wider font-bold text-[#8B5E3C] block">
          Curated Historical Case Studies
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOC_COMPARISON_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-5 text-left rounded-3xl border-2 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-[#FAF7F0] border-[#0A2947] ring-2 ring-[#C89D56]/40 shadow-sm'
                    : 'bg-white border-[#D3D4C0] hover:border-[#C59A45]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 bg-[#FAF7F0] text-[#8B5E3C] border border-[#D3D4C0] rounded-md">
                      Case Study
                    </span>
                    <span className="text-sm font-serif-editorial font-bold text-[#0A2947]">
                      {preset.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#0A2947]/75 font-dmsans leading-relaxed">
                    {preset.historicalEvolution}
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 mt-1 transition-colors ${isSelected ? 'text-[#8B5E3C]' : 'text-[#0A2947]/40'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Document Selectors (Dropdowns for Custom Pairings) */}
      <div className="bg-gradient-to-b from-white to-[#FDFBF7] border border-[#D3D4C0] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5E3C] via-[#C59A45] to-[#0A2947]" />

        <span className="text-xs font-montserrat uppercase tracking-wider font-bold text-[#8B5E3C] block">
          Or Select Any Two Historical Texts to Compare:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="doc-comparison-select-a" className="text-xs font-montserrat font-bold uppercase text-[#0A2947] block mb-1.5">
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
              className="w-full p-3 bg-[#FAF7F0] border-2 border-[#D3D4C0] focus:border-[#0A2947] rounded-2xl text-xs font-montserrat font-bold text-[#0A2947] focus:outline-none cursor-pointer"
            >
              {ARCHIVE_DOCUMENTS.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc-comparison-select-b" className="text-xs font-montserrat font-bold uppercase text-[#8B5E3C] block mb-1.5">
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
              className="w-full p-3 bg-[#FAF7F0] border-2 border-[#D3D4C0] focus:border-[#8B5E3C] rounded-2xl text-xs font-montserrat font-bold text-[#0A2947] focus:outline-none cursor-pointer"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Document A Column */}
        <div className="bg-white border-2 border-[#D3D4C0] hover:border-[#C59A45] rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C59A45] via-[#8B5E3C] to-[#0A2947]" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#D3D4C0] pb-3 text-xs font-mono">
              <span className="font-bold text-[#8B5E3C] uppercase px-2 py-0.5 bg-[#FAF7F0] rounded-md border border-[#D3D4C0]">
                Document A · {docA.year}
              </span>
              <span className="text-[#0A2947]/70 font-semibold">
                {docA.accessionNo}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif-editorial text-[#0A2947] font-bold leading-snug">
              {docA.title}
            </h3>

            <div className="text-xs font-mono text-[#8B5E3C] uppercase font-bold">
              {docA.categoryLabel} · Source: {docA.source}
            </div>

            <div className="p-4 bg-[#F3E4C9]/70 border border-[#D3D4C0] rounded-2xl">
              <span className="text-[10px] font-cinzel uppercase tracking-wider font-bold text-[#8B5E3C] block mb-1">
                Archival Excerpt:
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-[#0A2947]/90 line-clamp-4 leading-relaxed">
                &quot;{docA.fullText.substring(0, 320)}...&quot;
              </p>
            </div>

            <p className="text-xs text-[#0A2947]/75 font-dmsans line-clamp-3 leading-relaxed">
              {docA.shortDescription}
            </p>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenDocument(docA);
            }}
            className="mt-6 w-full py-3 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span>Open Full Folio A in Viewer</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C89D56]" />
          </button>
        </div>

        {/* Document B Column */}
        <div className="bg-white border-2 border-[#D3D4C0] hover:border-[#C59A45] rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C59A45] via-[#8B5E3C] to-[#0A2947]" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#D3D4C0] pb-3 text-xs font-mono">
              <span className="font-bold text-[#8B5E3C] uppercase px-2 py-0.5 bg-[#FAF7F0] rounded-md border border-[#D3D4C0]">
                Document B · {docB.year}
              </span>
              <span className="text-[#0A2947]/70 font-semibold">
                {docB.accessionNo}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif-editorial text-[#0A2947] font-bold leading-snug">
              {docB.title}
            </h3>

            <div className="text-xs font-mono text-[#8B5E3C] uppercase font-bold">
              {docB.categoryLabel} · Source: {docB.source}
            </div>

            <div className="p-4 bg-[#F3E4C9]/70 border border-[#D3D4C0] rounded-2xl">
              <span className="text-[10px] font-cinzel uppercase tracking-wider font-bold text-[#8B5E3C] block mb-1">
                Archival Excerpt:
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-[#0A2947]/90 line-clamp-4 leading-relaxed">
                &quot;{docB.fullText.substring(0, 320)}...&quot;
              </p>
            </div>

            <p className="text-xs text-[#0A2947]/75 font-dmsans line-clamp-3 leading-relaxed">
              {docB.shortDescription}
            </p>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenDocument(docB);
            }}
            className="mt-6 w-full py-3 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#FAF7F0] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span>Open Full Folio B in Viewer</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C89D56]" />
          </button>
        </div>

      </div>

      {/* AI Comparative Insights Breakdown */}
      <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5E3C] via-[#C89D56] to-[#0A2947]" />

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-[#D3D4C0] flex items-center justify-center text-[#8B5E3C]">
            <Sparkles className="w-5 h-5 text-[#C89D56]" />
          </div>
          <h2 className="text-2xl font-serif-editorial text-[#0A2947] font-bold">
            Curatorial Synthesis &amp; Thematic Analysis
          </h2>
        </div>

        {/* Young Scholar Friendly Box */}
        <div className="p-4 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl">
          <div className="flex items-center gap-2 text-[#8B5E3C] font-montserrat font-bold text-xs uppercase mb-1">
            <Lightbulb className="w-4 h-4 text-[#C89D56]" />
            <span>Curatorial Synopsis (Plain Words)</span>
          </div>
          <p className="text-sm font-dmsans text-[#0A2947] font-medium leading-relaxed">
            {currentPreset 
              ? currentPreset.kidFriendlyLesson 
              : `Comparing "${docA.title}" with "${docB.title}" shows how Dr. Ambedkar consistently stood up for human dignity: first through analytical critique of discrimination, and later by establishing constitutional legal safeguards.`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Common Core Themes */}
          <div className="p-5 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl space-y-3">
            <h3 className="font-serif-editorial text-base text-[#0A2947] font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              Shared Core Themes &amp; Principles
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-dmsans text-[#0A2947]/85">
              {currentPreset ? (
                currentPreset.commonThemes.map((theme, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] shrink-0 mt-2" />
                    <span>{theme}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] shrink-0 mt-2" />
                    <span>Primacy of human dignity over traditional custom.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] shrink-0 mt-2" />
                    <span>Rejection of social hierarchy and caste discrimination.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Key Differences / Evolution of Thought */}
          <div className="p-5 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl space-y-3">
            <h3 className="font-serif-editorial text-base text-[#0A2947] font-bold flex items-center gap-2">
              <Milestone className="w-4 h-4 text-[#8B5E3C]" />
              Key Differences &amp; Evolution
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-dmsans text-[#0A2947]/85">
              {currentPreset ? (
                currentPreset.keyDifferences.map((diff, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C89D56] shrink-0 mt-2" />
                    <span>{diff}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C89D56] shrink-0 mt-2" />
                    <span>Difference in historical timing ({docA.year} vs {docB.year}).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C89D56] shrink-0 mt-2" />
                    <span>Contextual adaptation from colonial-era critique to constitutional governance.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

        </div>

      </div>

    </div>
  </div>
  );
};
