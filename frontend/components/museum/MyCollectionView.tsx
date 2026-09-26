'use client';

import React, { useState } from 'react';
import { 
  Bookmark, Trash2, Download, Plus, BookOpen, ExternalLink, 
  FileText, Share2, Sparkles, Check, Edit3, Save, Landmark, X 
} from 'lucide-react';
import { Language, SavedCollectionItem, ArchivalDocument } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';

interface MyCollectionViewProps {
  language: Language;
  savedItems: SavedCollectionItem[];
  onRemoveItem: (id: string) => void;
  onOpenDocument: (doc: ArchivalDocument) => void;
  onUpdateNote: (id: string, note: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const MyCollectionView: React.FC<MyCollectionViewProps> = ({
  language,
  savedItems,
  onRemoveItem,
  onOpenDocument,
  onUpdateNote,
  onNavigateTab
}) => {
  const t = UI_STRINGS[language];
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [citationFormat, setCitationFormat] = useState<'APA' | 'Chicago' | 'BibTeX'>('APA');
  const [isCopied, setIsCopied] = useState(false);

  const filteredItems = savedItems.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.itemType === selectedFilter;
  });

  const handleStartEditNote = (item: SavedCollectionItem) => {
    soundEffects.playClick();
    setEditingNoteId(item.id);
    setTempNoteText(item.note || '');
  };

  const handleSaveNote = (id: string) => {
    soundEffects.playClick();
    onUpdateNote(id, tempNoteText);
    setEditingNoteId(null);
  };

  const generateCitation = () => {
    return savedItems.map(item => {
      if (citationFormat === 'APA') {
        return `Ambedkar, B. R. (${item.title}). In Dr. Babasaheb Ambedkar: Writings and Speeches. Ministry of Social Justice & Empowerment, Govt of India. Retrieved from Ambedkar National Digital Heritage Archive.`;
      } else if (citationFormat === 'Chicago') {
        return `Ambedkar, Bhimrao Ramji. "${item.title}." In Dr. Babasaheb Ambedkar: Writings and Speeches. New Delhi: Ministry of Social Justice & Empowerment, Government of India.`;
      } else {
        return `@archive{ambedkar_${item.itemId},\n  author = {Ambedkar, B. R.},\n  title = {${item.title}},\n  publisher = {Dr. Ambedkar Foundation / National Archives of India},\n  url = {https://ambedkar-archive.gov.in}\n}`;
      }
    }).join('\n\n');
  };

  const handleCopyCitation = () => {
    soundEffects.playClick();
    navigator.clipboard?.writeText(generateCitation());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-10 px-4 sm:px-6 lg:px-8 font-dmsans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>RESEARCHER CURATORIAL NOTEBOOK & DESK</span>
            </div>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A2947] tracking-tight">
              My Archival Folios & Citations
            </h1>
            <p className="text-sm text-[#0A2947]/75 max-w-2xl font-dmsans">
              Your personalized academic workspace for cross-referencing primary treatises, annotating legal passages, and generating peer-reviewed citations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsExportModalOpen(true);
              }}
              disabled={savedItems.length === 0}
              className="px-5 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] disabled:opacity-40 text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Citations</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#D3D4C0] pb-4 text-xs">
          <span className="text-[#8B5E3C] font-montserrat font-bold uppercase tracking-wider mr-2 text-[11px]">
            Filter Folios:
          </span>
          {[
            { id: 'all', label: `All Records (${savedItems.length})` },
            { id: 'document', label: 'Primary Manuscripts' },
            { id: 'qa', label: 'AI Scholarly Syntheses' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedFilter(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-colors font-montserrat font-bold text-xs cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-[#0A2947] text-[#F3E4C9]'
                  : 'bg-white text-[#0A2947] hover:bg-[#F3E4C9] border border-[#D3D4C0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Saved List */}
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map(item => {
              const matchedDoc = ARCHIVE_DOCUMENTS.find(d => d.id === item.itemId);

              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-[#D3D4C0] rounded-2xl p-6 shadow-xs space-y-4 hover:border-[#8B5E3C] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-[#8B5E3C]">
                        <span className="font-bold uppercase tracking-wider">{item.category}</span>
                        <span>·</span>
                        <span>Archived: {item.dateSaved}</span>
                      </div>
                      <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#0A2947]">
                        {item.title}
                      </h3>
                      {matchedDoc && (
                        <p className="text-xs text-[#0A2947]/70 font-dmsans">
                          {matchedDoc.collection} · {matchedDoc.source} · Year {matchedDoc.year}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {matchedDoc && (
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            onOpenDocument(matchedDoc);
                          }}
                          className="px-3.5 py-1.5 bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] text-xs font-montserrat font-bold rounded-xl border border-[#D3D4C0] transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#8B5E3C]" />
                          <span>Examine Folio</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          onRemoveItem(item.id);
                        }}
                        className="p-2 text-[#0A2947]/50 hover:text-red-600 hover:bg-[#FAF7F0] rounded-xl transition-colors cursor-pointer"
                        title="Remove from notebook"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scholarly Notes Section */}
                  <div className="pt-3 border-t border-[#D3D4C0] text-xs">
                    {editingNoteId === item.id ? (
                      <div className="space-y-2">
                        <label htmlFor="collection-researcher-note-textarea" className="text-[11px] uppercase font-mono font-bold text-[#8B5E3C]">Researcher Marginalia & Notes:</label>
                        <textarea
                          id="collection-researcher-note-textarea"
                          name="collection_researcher_note"
                          value={tempNoteText}
                          onChange={(e) => setTempNoteText(e.target.value)}
                          placeholder="Add research observations, thesis references, or archival quotes..."
                          rows={3}
                          className="w-full p-3 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-[#0A2947] text-xs focus:outline-none focus:border-[#0A2947]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3.5 py-1.5 bg-[#FAF7F0] hover:bg-[#D3D4C0] rounded-xl text-[#0A2947] text-xs font-montserrat font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(item.id)}
                            className="px-3.5 py-1.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] font-montserrat font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Marginalia</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between bg-[#FAF7F0] p-3.5 rounded-xl border border-[#D3D4C0]">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#8B5E3C] font-bold uppercase tracking-wider block">
                            Curatorial Marginalia:
                          </span>
                          <p className="text-[#0A2947] font-serif-editorial italic text-xs leading-relaxed">
                            {item.note || "No personal marginalia recorded yet. Click annotate to add thesis notes or cross-references."}
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartEditNote(item)}
                          className="text-[#8B5E3C] hover:text-[#0A2947] ml-4 shrink-0 flex items-center gap-1 text-[11px] font-montserrat font-bold cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Annotate</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-[#D3D4C0] rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] flex items-center justify-center mx-auto text-[#8B5E3C]">
              <Bookmark className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-serif-editorial text-2xl font-bold text-[#0A2947]">
                Your Research Desk is Empty
              </h3>
              <p className="text-xs text-[#0A2947]/70 font-dmsans">
                Browse through the 22 digitized BAWS volumes and click "Save to Notebook" on any primary manuscript or AI scholarly response to build your research dossier.
              </p>
            </div>
            <button
              onClick={() => {
                soundEffects.playClick();
                onNavigateTab('archive');
              }}
              className="px-6 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Explore Archival Corpus
            </button>
          </div>
        )}

      </div>

      {/* Export Citations Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2947]/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D3D4C0]">
              <h3 className="font-serif-editorial text-xl font-bold text-[#0A2947]">
                Export Academic Citations
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#FAF7F0] text-[#0A2947]/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              {(['APA', 'Chicago', 'BibTeX'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setCitationFormat(fmt)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-montserrat font-bold cursor-pointer ${
                    citationFormat === fmt
                      ? 'bg-[#0A2947] text-[#F3E4C9]'
                      : 'bg-[#FAF7F0] text-[#0A2947] border border-[#D3D4C0]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <pre className="p-4 bg-[#FAF7F0] border border-[#D3D4C0] rounded-2xl text-[11px] font-mono text-[#0A2947] max-h-56 overflow-y-auto whitespace-pre-wrap">
              {generateCitation()}
            </pre>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D3D4C0]">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 bg-[#FAF7F0] text-[#0A2947] text-xs font-montserrat font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleCopyCitation}
                className="px-5 py-2 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] text-xs font-montserrat font-bold uppercase rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied to Clipboard' : 'Copy Formatted Citations'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
