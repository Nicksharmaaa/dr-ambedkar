'use client';

import React, { useState } from 'react';
import { 
  FileText, Plus, Trash2, Download, Copy, Check, 
  Tag, BookOpen, Sparkles, Bookmark, Search, Filter,
  Share2, Award, Paperclip, Clock, CheckCircle2, Quote
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';

interface ResearchDossierNotebookProps {
  language: Language;
}

interface ResearchNote {
  id: string;
  title: string;
  volumeRef: string;
  tags: string[];
  excerpt: string;
  scholarlyAnalysis: string;
  dateAdded: string;
  folioNumber: string;
}

const PRESET_EXCERPTS = [
  {
    title: 'Grammar of Anarchy & Dangers of Hero Worship',
    volumeRef: 'BAWS Vol. 13 (CAD Nov 25, 1949)',
    tags: ['ConstitutionalLaw', 'Democracy', 'HeroWorship'],
    excerpt: 'Bhakti in religion may be a road to the salvation of the soul. But in politics, Bhakti or hero-worship is a sure road to degradation and to eventual dictatorship.',
    scholarlyAnalysis: 'Ambedkar’s final address to the Constituent Assembly establishing that democracy cannot endure under cult of personality; institutional fidelity must precede individual veneration.'
  },
  {
    title: 'State Ownership of Key Industries & Agricultural Land',
    volumeRef: 'BAWS Vol. 1 (States & Minorities, 1947, Article II)',
    tags: ['Economics', 'StateSocialism', 'FundamentalRights'],
    excerpt: 'Key industries shall be owned and run by the State... Insurance shall be a monopoly of the State... Agriculture shall be a State industry.',
    scholarlyAnalysis: 'Ambedkar’s memorandum on Fundamental Rights submitting that economic democracy must be constitutionalized so that changing majorities cannot repeal social security.'
  },
  {
    title: 'Annihilation of Caste as Intellectual Emancipation',
    volumeRef: 'BAWS Vol. 1 (Annihilation of Caste, 1936)',
    tags: ['Philosophy', 'SocialReform', 'Fraternity'],
    excerpt: 'Caste is not a division of labour, it is a division of labourers... It is a hierarchy in which the divisions are graded one above the other.',
    scholarlyAnalysis: 'Ambedkar’s foundational economic and sociological critique of the Hindu social order, arguing that social reform must precede political independence.'
  }
];

const INITIAL_NOTES: ResearchNote[] = [
  {
    id: 'note-1',
    title: 'Constitutional Morality vs Majority Rule',
    volumeRef: 'BAWS Vol. 13 (CAD Nov 4, 1948)',
    tags: ['ConstitutionalLaw', 'Democracy', 'Morality'],
    excerpt: 'Constitutional morality is not a natural sentiment. It has to be cultivated. We must realize that our people have yet to learn it. Democracy in India is only a top-dressing on an Indian soil, which is essentially undemocratic.',
    scholarlyAnalysis: 'Ambedkar borrows Grote’s concept of constitutional morality to argue that a written constitution is ineffective without democratic temper and adherence to institutional conventions over personal cult worship.',
    dateAdded: '2026-09-28',
    folioNumber: 'FOLIO-0142'
  },
  {
    id: 'note-2',
    title: 'Labour as Co-Equal Partner in National Production',
    volumeRef: 'BAWS Vol. 10 (Speech to Standing Labour Committee, 1943)',
    tags: ['LabourEconomics', 'SocialSecurity', 'TripartiteDialogue'],
    excerpt: 'Labour must not only have the right to organize; it must have a voice in the government and management of industry. Fair wages, social security, and standard hours are prerequisites for civilization.',
    scholarlyAnalysis: 'Introduced the 8-hour workday (down from 12 hours), the Employees State Insurance (ESI) framework, maternity benefits, and the tripartite labour conference system in wartime India.',
    dateAdded: '2026-09-27',
    folioNumber: 'FOLIO-0143'
  },
  {
    id: 'note-3',
    title: 'Endogamy as the Biological Mechanism of Caste',
    volumeRef: 'BAWS Vol. 1 (Castes in India, 1916)',
    tags: ['Anthropology', 'SocialStructure', 'Endogamy'],
    excerpt: 'Endogamy or the practice of marriage strictly within a group is the only one characteristic that is peculiar to caste... Caste is an enclosed class.',
    scholarlyAnalysis: 'Presented at Alexander Goldenweiser’s anthropology seminar at Columbia University at age 25. Dr. Ambedkar demonstrates that exogamy was the original norm of Indian tribes, and caste was artificially created when dominant groups enclosed themselves through compulsory endogamy.',
    dateAdded: '2026-09-26',
    folioNumber: 'FOLIO-0144'
  }
];

export const ResearchDossierNotebook: React.FC<ResearchDossierNotebookProps> = ({
  language
}) => {
  const [notes, setNotes] = useState<ResearchNote[]>(INITIAL_NOTES);
  const [newTitle, setNewTitle] = useState('');
  const [newVolume, setNewVolume] = useState('BAWS Vol. 1');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newAnalysis, setNewAnalysis] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [recentlySavedId, setRecentlySavedId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExcerpt.trim()) return;

    soundEffects.playStampSlam();
    const newId = `note-${Date.now()}`;
    const createdNote: ResearchNote = {
      id: newId,
      title: newTitle.trim(),
      volumeRef: newVolume.trim(),
      tags: newTag ? newTag.split(',').map(t => t.trim()) : ['ArchivalResearch'],
      excerpt: newExcerpt.trim(),
      scholarlyAnalysis: newAnalysis.trim() || 'Scholarly working note pending peer review.',
      dateAdded: new Date().toISOString().split('T')[0],
      folioNumber: `FOLIO-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setNotes([createdNote, ...notes]);
    setRecentlySavedId(newId);
    setNewTitle('');
    setNewExcerpt('');
    setNewAnalysis('');
    setNewTag('');
    setIsAdding(false);

    setTimeout(() => setRecentlySavedId(null), 3000);
  };

  const handleLoadPreset = (preset: typeof PRESET_EXCERPTS[0]) => {
    soundEffects.playClick();
    setNewTitle(preset.title);
    setNewVolume(preset.volumeRef);
    setNewExcerpt(preset.excerpt);
    setNewAnalysis(preset.scholarlyAnalysis);
    setNewTag(preset.tags.join(', '));
  };

  const handleDeleteNote = (id: string) => {
    soundEffects.playClick();
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleExportMarkdown = () => {
    soundEffects.playCoinDrop();
    let md = `# DR. B. R. AMBEDKAR SCHOLARLY RESEARCH DOSSIER\nGenerated: ${new Date().toLocaleDateString('en-GB')}\nTotal Curated Excerpts: ${notes.length}\nArchival Repository: Dr. B. R. Ambedkar Digital Museum & OAIS Archives\n\n---\n\n`;

    notes.forEach((n, idx) => {
      md += `## ${idx + 1}. [${n.folioNumber}] ${n.title}\n`;
      md += `**Primary Source Citation:** ${n.volumeRef}  \n`;
      md += `**Thematic Index:** ${n.tags.map(t => `#${t}`).join(' ')}  \n`;
      md += `**Date Ingested:** ${n.dateAdded}  \n\n`;
      md += `> "${n.excerpt}"\n\n`;
      md += `### Scholarly Commentary & Doctrinal Analysis\n${n.scholarlyAnalysis}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ambedkar_Research_Dossier_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyDossier = () => {
    soundEffects.playStampSlam();
    let text = `DR. B. R. AMBEDKAR RESEARCH DOSSIER (${notes.length} ARCHIVAL FOLIOS)\n\n`;
    notes.forEach(n => {
      text += `[${n.folioNumber}] ${n.title} — ${n.volumeRef}\n"${n.excerpt}"\nAnalysis: ${n.scholarlyAnalysis}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.volumeRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || n.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="relative bg-[#2A1E17] border-4 border-[#8B5E3C] rounded-3xl p-4 sm:p-8 shadow-2xl space-y-6 text-[#FAF7F0] overflow-hidden">
      
      {/* Decorative Leather Dossier Texture Background */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/70 pointer-events-none" />
      
      {/* Brass Binder Rings along top/left edge */}
      <div className="hidden sm:flex items-center justify-around absolute top-2 left-16 right-16 pointer-events-none opacity-80">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#E2B755] via-[#C89D56] to-[#7A551A] shadow-md border border-[#FDE08B]/60" />
            <div className="w-1.5 h-3 bg-gradient-to-r from-[#7A551A] to-[#E2B755]" />
          </div>
        ))}
      </div>

      {/* Header Bar */}
      <div className="relative z-10 pt-4 border-b border-[#C89D56]/30 pb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C89D56]/20 border border-[#C89D56]/50 rounded-full text-xs font-mono font-bold text-[#F3E4C9] uppercase tracking-wider mb-2">
            <Bookmark className="w-3.5 h-3.5 text-[#E2B755]" />
            <span>Collegiate Archive Folio · Fellow Notebook</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif-editorial font-bold text-[#FAF7F0] tracking-tight flex items-center gap-3">
            <span>Research Dossier Binder</span>
            <span className="text-xs px-2.5 py-1 bg-[#C89D56] text-[#0A2947] font-mono font-bold rounded-lg uppercase tracking-wide">
              {notes.length} Folios
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#E2D9C8]/80 mt-1 max-w-2xl font-dmsans">
            Curate primary source citations from Babasaheb’s 22 volumes, attach doctoral annotations, and generate academic research digests in Markdown.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyDossier}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C89D56]/40 bg-white/10 hover:bg-white/20 text-[#FAF7F0] text-xs font-montserrat font-bold cursor-pointer transition-all shadow-sm"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#E2B755]" />}
            <span>{isCopied ? 'Dossier Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59A45] to-[#B8860B] hover:brightness-110 text-[#0A2947] font-montserrat font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all"
          >
            <Download className="w-4 h-4 text-[#0A2947]" />
            <span>Export .md Dossier</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/30 p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#C89D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search folios by volume, keyword, or doctrine..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C89D56]"
          />
        </div>

        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedTag('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
              selectedTag === 'all'
                ? 'bg-[#C89D56] text-[#0A2947]'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            All Tags
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                soundEffects.playClick();
                setSelectedTag(tag);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-[#C89D56] text-[#0A2947] font-bold'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Note Section */}
      {!isAdding ? (
        <button
          onClick={() => {
            soundEffects.playBookOpen();
            setIsAdding(true);
          }}
          className="relative z-10 w-full py-4 border-2 border-dashed border-[#C89D56]/60 rounded-2xl bg-gradient-to-r from-white/5 via-[#C89D56]/10 to-white/5 hover:from-white/10 hover:to-white/10 text-[#F3E4C9] font-serif-editorial font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md group hover:border-[#E2B755]"
        >
          <div className="w-8 h-8 rounded-full bg-[#C89D56]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-[#E2B755]" />
          </div>
          <span>Insert New Archival Research Folio</span>
        </button>
      ) : (
        <form onSubmit={handleAddNote} className="relative z-10 bg-[#FAF7F0] text-[#0A2947] border-2 border-[#C89D56] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between border-b border-[#D3D4C0] pb-3">
            <div className="flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-[#8B5E3C]" />
              <h4 className="font-serif-editorial font-bold text-lg text-[#0A2947]">
                New Folio Entry · Historical Ingestion Form
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs font-mono text-[#8B5E3C] hover:text-[#0A2947] font-bold px-2 py-1 rounded bg-[#EAE0D0] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Quick Preset Selector */}
          <div className="bg-[#F3E4C9]/60 p-3 rounded-xl border border-[#D3D4C0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-[#8B5E3C] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C89D56]" />
              <span>Autofill Famous Primary Excerpt:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_EXCERPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadPreset(preset)}
                  className="px-2.5 py-1 bg-white hover:bg-[#FAF7F0] border border-[#D3D4C0] text-[#0A2947] rounded-lg text-xs font-mono transition-colors cursor-pointer"
                >
                  {preset.title.split('&')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono uppercase text-[#8B5E3C] font-bold block mb-1">
                Note Title / Research Hypothesis:
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. State Socialism in States & Minorities"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D3D4C0] rounded-xl text-sm font-serif-editorial text-[#0A2947] focus:outline-none focus:ring-2 focus:ring-[#C89D56]"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-[#8B5E3C] font-bold block mb-1">
                Primary Volume Reference:
              </label>
              <input
                type="text"
                required
                value={newVolume}
                onChange={e => setNewVolume(e.target.value)}
                placeholder="e.g. BAWS Vol. 1, p. 392"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D3D4C0] rounded-xl text-sm font-mono text-[#0A2947] focus:outline-none focus:ring-2 focus:ring-[#C89D56]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-[#8B5E3C] font-bold block mb-1">
              Verbatim Archival Excerpt (Dr. Ambedkar’s words):
            </label>
            <textarea
              required
              rows={3}
              value={newExcerpt}
              onChange={e => setNewExcerpt(e.target.value)}
              placeholder="Paste or transcribe Dr. Ambedkar's primary source quotation..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#D3D4C0] rounded-xl text-sm font-serif-editorial text-[#0A2947] focus:outline-none focus:ring-2 focus:ring-[#C89D56]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono uppercase text-[#8B5E3C] font-bold block mb-1">
                Scholarly Commentary & Doctrinal Impact:
              </label>
              <input
                type="text"
                value={newAnalysis}
                onChange={e => setNewAnalysis(e.target.value)}
                placeholder="How does this excerpt advance your thesis or paper?"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D3D4C0] rounded-xl text-sm font-dmsans text-[#0A2947] focus:outline-none focus:ring-2 focus:ring-[#C89D56]"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-[#8B5E3C] font-bold block mb-1">
                Thematic Tags (comma separated):
              </label>
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="e.g. Economics, Law, Rights"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D3D4C0] rounded-xl text-sm font-mono text-[#0A2947] focus:outline-none focus:ring-2 focus:ring-[#C89D56]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D3D4C0]">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0A2947] text-[#FAF7F0] font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#041424] cursor-pointer shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-[#C89D56]" />
              <span>Slam Folio into Binder</span>
            </button>
          </div>
        </form>
      )}

      {/* Folios / Notes Display List */}
      <div className="relative z-10 space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/60">
            <p className="font-serif-editorial text-lg">No folios matched your query.</p>
            <p className="text-xs font-mono mt-1">Try another keyword or add a new primary excerpt.</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isRecent = recentlySavedId === note.id;

            return (
              <div
                key={note.id}
                className={`bg-[#FAF7F0] text-[#0A2947] border-2 rounded-2xl p-5 sm:p-6 shadow-md transition-all relative overflow-hidden group ${
                  isRecent
                    ? 'border-emerald-600 ring-4 ring-emerald-500/20'
                    : 'border-[#D3D4C0] hover:border-[#C89D56]'
                }`}
              >
                {/* Paperclip graphic accent in top-right */}
                <div className="absolute top-3 right-4 opacity-30 group-hover:opacity-100 transition-opacity">
                  <Paperclip className="w-5 h-5 text-[#8B5E3C]" />
                </div>

                {/* Top Folio Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D3D4C0] pb-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-[#0A2947] text-[#F3E4C9] px-2 py-0.5 rounded">
                        {note.folioNumber}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#8B5E3C] bg-[#F3E4C9] px-2.5 py-0.5 rounded border border-[#D3D4C0]">
                        📖 {note.volumeRef}
                      </span>
                    </div>
                    <h4 className="font-serif-editorial font-bold text-lg sm:text-xl text-[#0A2947]">
                      {note.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-[#8B5E3C] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C89D56]" />
                      {note.dateAdded}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                      title="Remove note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Excerpt */}
                <blockquote className="my-3 bg-white border-l-4 border-[#C89D56] p-4 rounded-r-xl shadow-2xs font-serif-editorial italic text-sm sm:text-base text-[#0A2947] leading-relaxed">
                  &quot;{note.excerpt}&quot;
                </blockquote>

                {/* Scholarly Analysis */}
                <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-[#D3D4C0] text-xs sm:text-sm font-dmsans text-[#0A2947] space-y-1">
                  <span className="font-mono text-[#8B5E3C] uppercase text-[10px] font-bold tracking-wider block">
                    Scholarly Commentary & Doctrinal Analysis:
                  </span>
                  <p className="leading-relaxed">{note.scholarlyAnalysis}</p>
                </div>

                {/* Tag Chips and Cite Helper */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#D3D4C0]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {note.tags.map(t => (
                      <span
                        key={t}
                        className="text-[10px] font-mono text-[#0A2947] bg-[#EAE0D0] px-2 py-0.5 rounded font-semibold"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      soundEffects.playStampSlam();
                      const citation = `Ambedkar, B. R. "${note.title}." ${note.volumeRef}. In Dr. Babasaheb Ambedkar: Writings and Speeches. New Delhi: Ministry of Social Justice.`;
                      navigator.clipboard.writeText(citation);
                    }}
                    className="text-[11px] font-mono font-bold text-[#8B5E3C] hover:text-[#0A2947] flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#D3D4C0] hover:bg-[#F3E4C9] transition-colors"
                    title="Copy APA/BibTeX Citation"
                  >
                    <Quote className="w-3 h-3 text-[#C89D56]" />
                    <span>Copy Citation</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default ResearchDossierNotebook;

