'use client';

import React, { useState } from 'react';
import { 
  Scale, Shield, Flame, BookOpen, Heart, Coins, 
  ArrowRight, Sparkles, Quote, BookCheck
} from 'lucide-react';
import { PHILOSOPHY_CONCEPTS } from '@/data/interactiveData';
import { soundEffects } from '@/utils/soundEffects';

interface ConceptExplorerProps {
  onOpenDocument?: (docId: string) => void;
  onAskAI?: (query: string) => void;
}

export const ConceptExplorer: React.FC<ConceptExplorerProps> = ({
  onOpenDocument,
  onAskAI
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(PHILOSOPHY_CONCEPTS[0].id);

  const selectedConcept = PHILOSOPHY_CONCEPTS.find(c => c.id === selectedConceptId) || PHILOSOPHY_CONCEPTS[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scale': return <Scale className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      case 'Coins': return <Coins className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Philosophy Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Ideas in Motion
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Explore the interconnected philosophical pillars of Dr. Ambedkar's democratic and humanitarian jurisprudence.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Click any concept to inspect
        </div>
      </div>

      {/* Interactive Concept Grid / Pill Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PHILOSOPHY_CONCEPTS.map((concept) => {
          const isSelected = concept.id === selectedConceptId;

          return (
            <button
              key={concept.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedConceptId(concept.id);
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-28 cursor-pointer group ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl w-fit transition-colors ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:text-blue-600'
              }`}>
                {getIcon(concept.iconName)}
              </div>

              <span className={`text-xs font-bold leading-tight ${
                isSelected ? 'text-blue-900' : 'text-slate-800'
              }`}>
                {concept.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Concept Deep Dive Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 animate-in fade-in duration-200 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
              Core Constitutional Doctrine
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {selectedConcept.title}
            </h3>
            <div className="text-sm font-medium text-slate-600 mt-0.5">
              {selectedConcept.tagline}
            </div>
          </div>

          {onOpenDocument && (
            <button
              onClick={() => onOpenDocument(selectedConcept.relatedDocId)}
              className="self-start md:self-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <BookCheck className="w-4 h-4" />
              <span>Read Primary Folio</span>
            </button>
          )}
        </div>

        {/* Detailed Philosophical Prose */}
        <p className="text-slate-700 text-base leading-relaxed">
          {selectedConcept.description}
        </p>

        {/* Famous Proverb Quote Box */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
          <Quote className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-serif italic text-slate-800 font-medium">
              "{selectedConcept.famousQuote}"
            </div>
            <div className="text-xs text-slate-500">
              — Dr. B. R. Ambedkar
            </div>
          </div>
        </div>

        {/* AI Assistant Deep Dive Inquiry */}
        {onAskAI && (
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={() => onAskAI(`Explain Dr. Ambedkar's concept of '${selectedConcept.title}' and how it applies to modern democracy.`)}
              className="text-xs text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Explore this doctrine with AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
