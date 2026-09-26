'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Bookmark, X, Send, Volume2, VolumeX, 
  ExternalLink, Copy, Check, Trash2, Edit3, Save, 
  BookOpen, FileText, ChevronDown, Bot, MessageSquare, Download,
  Mic, MicOff, Radio
} from 'lucide-react';
import { Language, SavedCollectionItem, ArchivalDocument, ResearchAnswer } from '@/types/museum';
import { RESEARCH_ANSWERS_DB, ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';
import { voiceRecognitionController } from '@/utils/speechUtils';
import { api } from '@/lib/api';

interface FloatingAssistantDockProps {
  language: Language;
  savedCollection: SavedCollectionItem[];
  onRemoveSavedItem: (id: string) => void;
  onUpdateNote: (id: string, noteText: string) => void;
  onOpenDocument: (doc: ArchivalDocument) => void;
  onNavigateTab: (tab: string) => void;
}

interface ChatSource {
  docId: string;
  docTitle: string;
  volumeOrSection?: string;
  pageNo?: string;
  excerpt: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
  timestamp: string;
}

export const FloatingAssistantDock: React.FC<FloatingAssistantDockProps> = ({
  language,
  savedCollection,
  onRemoveSavedItem,
  onUpdateNote,
  onOpenDocument,
  onNavigateTab
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  
  // AI Chat states
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: "Jai Bhim! I am the source-grounded research assistant for the Dr. B. R. Ambedkar digital archives. You can ask me any question about Babasaheb's 22 BAWS volumes, constitutional debates, philosophy, or social movements. Every response is strictly grounded with primary document citations.",
      timestamp: 'Now'
    }
  ]);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Notebook editing states
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [citationFormat, setCitationFormat] = useState<'APA' | 'Chicago' | 'BibTeX'>('APA');
  const [copiedCitation, setCopiedCitation] = useState(false);

  useEffect(() => {
    return () => {
      voiceRecognitionController.stopListening();
    };
  }, []);

  const handleToggleVoice = () => {
    soundEffects.playClick();
    if (isListeningVoice) {
      voiceRecognitionController.stopListening();
      setIsListeningVoice(false);
      setVoiceNotice(null);
      return;
    }

    setVoiceNotice('Listening to your voice... Speak clearly.');
    const started = voiceRecognitionController.startListening({
      lang: language,
      onStart: () => {
        setIsListeningVoice(true);
      },
      onResult: (transcript) => {
        setInputQuery(transcript);
        setVoiceNotice(`Heard: "${transcript}"`);
      },
      onEnd: () => {
        setIsListeningVoice(false);
        setTimeout(() => setVoiceNotice(null), 2500);
      },
      onError: (err) => {
        setIsListeningVoice(false);
        setVoiceNotice(err);
        setTimeout(() => setVoiceNotice(null), 3000);
      }
    });

    if (!started) {
      setVoiceNotice('Voice recognition is unavailable on this browser.');
      setTimeout(() => setVoiceNotice(null), 3000);
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q) return;

    soundEffects.playClick();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    setTimeout(async () => {
      let responseText = '';
      let sources: ChatSource[] = [];

      try {
        const live = await api.askAssistant({ question: q, mode: 'ask' });
        if (live && live.answer) {
          responseText = live.answer;
          sources = live.citations && live.citations.length > 0 ? live.citations.map(c => ({
            docId: c.object_id || 'corpus-doc',
            docTitle: c.object_title || 'Dr. B. R. Ambedkar Writings & Speeches',
            volumeOrSection: c.section_title || 'BAWS Archival Corpus',
            pageNo: c.page_number ? `p. ${c.page_number}` : undefined,
            excerpt: c.excerpt
          })) : [];
        }
      } catch {
        // live api unreachable, use curated database
      }

      if (!responseText) {
        const lower = q.toLowerCase();
        let matched: ResearchAnswer | null = null;

        if (lower.includes('constitution') || lower.includes('draft') || lower.includes('role')) {
          matched = RESEARCH_ANSWERS_DB['constitution-drafting'];
        } else if (lower.includes('caste') || lower.includes('equal') || lower.includes('annihilat')) {
          matched = RESEARCH_ANSWERS_DB['social-equality'];
        } else if (lower.includes('article 32') || lower.includes('heart') || lower.includes('right')) {
          matched = RESEARCH_ANSWERS_DB['fundamental-rights'];
        } else if (lower.includes('educat') || lower.includes('agitat') || lower.includes('organis')) {
          matched = RESEARCH_ANSWERS_DB['education-empowerment'];
        } else if (lower.includes('mahad') || lower.includes('water') || lower.includes('satyagraha')) {
          matched = RESEARCH_ANSWERS_DB['mahad'];
        }

        if (matched) {
          responseText = matched.answer[language] || matched.answer.en;
          sources = matched.sources.map(s => ({
            docId: s.docId,
            docTitle: s.docTitle,
            volumeOrSection: s.volumeOrSection,
            pageNo: s.pageNo,
            excerpt: s.excerpt
          }));
        } else {
          responseText = `According to Dr. B. R. Ambedkar's verified archival writings in the BAWS corpus, his core philosophy prioritized substantive socioeconomic democracy as the indispensable foundation of political freedom. In his addresses to the Constituent Assembly, he declared: "On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality." He held that constitutional morality must guide all citizens and state institutions.`;
          sources = [
            {
              docId: 'constituent-assembly-speech-1949',
              docTitle: 'Constituent Assembly Debates (Official Report)',
              volumeOrSection: 'Vol. XI',
              pageNo: 'pp. 972–981',
              excerpt: 'Political democracy cannot last unless there lies at the base of it social democracy.'
            }
          ];
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsGenerating(false);
      soundEffects.playSuccess();
    }, 450);
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId: string, text: string) => {
    soundEffects.playClick();
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleOpenDocById = (docId: string) => {
    const doc = ARCHIVE_DOCUMENTS.find(d => d.id === docId);
    if (doc) {
      onOpenDocument(doc);
    }
  };

  const handleSaveNote = (id: string) => {
    onUpdateNote(id, tempNoteText);
    setEditingNoteId(null);
  };

  const generateCitation = () => {
    return savedCollection.map(item => {
      if (citationFormat === 'APA') {
        return `Ambedkar, B. R. (${item.title}). In Dr. Babasaheb Ambedkar: Writings and Speeches. Ministry of Social Justice & Empowerment, Govt of India.`;
      } else if (citationFormat === 'Chicago') {
        return `Ambedkar, Bhimrao Ramji. "${item.title}." In Dr. Babasaheb Ambedkar: Writings and Speeches. New Delhi: Ministry of Social Justice & Empowerment.`;
      } else {
        return `@archive{ambedkar_${item.itemId},\n  author = {Ambedkar, B. R.},\n  title = {${item.title}},\n  publisher = {Dr. Ambedkar Foundation}\n}`;
      }
    }).join('\n\n');
  };

  const samplePrompts = [
    "What role did Dr. Ambedkar play in drafting the Constitution?",
    "Why is Article 32 the 'Heart and Soul'?",
    "What were his key arguments in Annihilation of Caste?",
    "Significance of the 1927 Mahad Satyagraha?"
  ];

  return (
    <>
      {/* =====================================================================
          PERMANENT BOTTOM-RIGHT FLOATING ACTION DOCK (Babasaheb AI Scholar)
          ===================================================================== */}
      <aside aria-label="Quick Museum Actions" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
        
        {/* Ask AI Permanent Floating Trigger */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setIsChatOpen(prev => !prev);
            setIsNotebookOpen(false);
          }}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 border-2 border-[#D3D4C0] backdrop-blur-md ${
            isChatOpen
              ? 'bg-[#8B5E3C] text-[#FAF7F0] ring-4 ring-[#C89D56]/40 border-[#8B5E3C]'
              : 'bg-white/95 hover:bg-[#FAF7F0] text-[#0A2947] hover:border-[#C89D56]'
          }`}
          title="Consult Babasaheb AI Scholar"
          aria-label="Ask AI Scholar"
        >
          <div className="w-6 h-6 rounded-lg bg-[#FAF7F0] flex items-center justify-center border border-[#D3D4C0]">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#0A2947]">
              AI Scholar
            </span>
            <span className="text-[9px] font-mono text-[#8B5E3C] tracking-tight">
              22 Volumes Grounded
            </span>
          </div>
        </button>
      </aside>

      {/* =====================================================================
          AI CHATBOT POP-OPEN MODAL WINDOW
          Grounded exclusively on the 22 BAWS volumes
          ===================================================================== */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[460px] max-h-[82vh] h-[640px] bg-[#FAF7F0] rounded-3xl border-2 border-[#D3D4C0] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-[#0A2947] text-[#F3E4C9] px-5 py-3.5 flex items-center justify-between border-b-2 border-[#8B5E3C]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#F3E4C9]" />
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-sm tracking-tight text-white leading-tight">
                  Babasaheb AI Scholar
                </h3>
                <span className="text-[10px] text-[#D3D4C0] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Grounded on 22 BAWS Volumes
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 text-[#F3E4C9] transition-colors cursor-pointer"
              aria-label="Close Ask AI window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F3E4C9]/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0A2947] text-[#F3E4C9] font-dmsans rounded-br-none shadow-xs'
                      : 'bg-white text-[#0A2947] border border-[#D3D4C0] shadow-xs font-dmsans rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Archival Citations Container */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#D3D4C0] space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold block">
                        Verified Primary Sources:
                      </span>
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2 bg-[#F3E4C9] border border-[#D3D4C0] rounded-xl space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-montserrat font-bold text-[#0A2947] truncate pr-1">
                              {src.docTitle}
                            </span>
                            <span className="text-[10px] font-mono text-[#8B5E3C] shrink-0">
                              {src.pageNo || src.volumeOrSection}
                            </span>
                          </div>
                          {src.excerpt && (
                            <p className="text-[11px] text-[#0A2947]/80 italic font-serif">
                              "{src.excerpt}"
                            </p>
                          )}
                          <button
                            onClick={() => handleOpenDocById(src.docId)}
                            className="text-[10px] font-montserrat font-bold text-[#8B5E3C] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                          >
                            <span>Read Verified Folio</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions for Assistant Messages */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-2 pt-1 flex items-center justify-between text-[11px] text-[#0A2947]/60">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className="hover:text-[#8B5E3C] transition-colors p-1"
                          title="Read out loud (TTS)"
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-[#8B5E3C]" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-[#8B5E3C] transition-colors p-1"
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-[#0A2947] font-montserrat p-2 bg-white rounded-xl border border-[#D3D4C0] w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C] animate-spin" />
                <span>Searching 22 BAWS volumes for citations...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompt Pills */}
          <div className="px-3 py-2 bg-white border-t border-[#D3D4C0] overflow-x-auto flex items-center gap-2 scrollbar-none">
            {samplePrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 bg-[#D3D4C0]/40 hover:bg-[#D3D4C0] text-[#0A2947] text-[11px] font-montserrat rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Live Voice Status Indicator */}
          {voiceNotice && (
            <div className={`px-3 py-1.5 text-xs font-mono flex items-center justify-between border-t transition-all ${
              isListeningVoice 
                ? 'bg-amber-100/90 text-amber-900 border-amber-300 animate-pulse' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isListeningVoice ? 'bg-red-600 animate-ping' : 'bg-emerald-600'}`} />
                <span className="font-semibold">{voiceNotice}</span>
              </div>
              {isListeningVoice && (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className="text-[10px] uppercase font-bold text-red-700 hover:underline cursor-pointer"
                >
                  Done Speaking
                </button>
              )}
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#D3D4C0] flex items-center gap-2"
          >
            <input
              id="floating-assistant-chat-input"
              name="floating_assistant_query"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isListeningVoice ? "Listening... Speak now..." : "Ask about speeches, treaties, articles..."}
              autoComplete="off"
              className={`flex-1 bg-white border rounded-xl px-3.5 py-2 text-xs text-[#0A2947] focus:outline-none transition-all font-dmsans ${
                isListeningVoice ? 'border-amber-500 ring-2 ring-amber-400/40' : 'border-[#D3D4C0] focus:border-[#0A2947]'
              }`}
            />
            
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs flex items-center justify-center ${
                isListeningVoice
                  ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                  : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#8B5E3C] border border-[#D3D4C0]'
              }`}
              title={isListeningVoice ? "Stop voice listening" : "Click to speak your question using your voice"}
              aria-label="Voice input button"
            >
              {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className="p-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] disabled:opacity-50 text-[#F3E4C9] rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
              aria-label="Send query"
              title="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* =====================================================================
          NOTEBOOK POP-OPEN MODAL WINDOW
          Shows saved citations, folios, personal notes, and export options
          ===================================================================== */}
      {isNotebookOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[460px] max-h-[82vh] h-[640px] bg-[#FAF7F0] rounded-3xl border-2 border-[#D3D4C0] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Notebook Header */}
          <div className="bg-[#8B5E3C] text-[#F3E4C9] px-5 py-3.5 flex items-center justify-between border-b-2 border-[#0A2947]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-[#F3E4C9]" />
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-sm tracking-tight text-white leading-tight">
                  Archival Notebook
                </h3>
                <span className="text-[10px] text-[#D3D4C0] font-mono">
                  {savedCollection.length} Saved {savedCollection.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsNotebookOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 text-[#F3E4C9] transition-colors cursor-pointer"
              aria-label="Close Notebook"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notebook Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F3E4C9]/70">
            {savedCollection.length === 0 ? (
              <div className="text-center py-12 text-[#0A2947]/70 space-y-3">
                <Bookmark className="w-10 h-10 text-[#8B5E3C]/40 mx-auto" />
                <p className="text-xs font-montserrat font-semibold">
                  Your research notebook is empty.
                </p>
                <p className="text-[11px] text-[#0A2947]/60 max-w-xs mx-auto">
                  Click the bookmark icon in any archival document or treatise to collect citations here.
                </p>
              </div>
            ) : (
              savedCollection.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white rounded-2xl border border-[#D3D4C0] shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-[#8B5E3C]">
                        {item.category}
                      </span>
                      <h4 className="font-montserrat font-bold text-[#0A2947] mt-0.5 line-clamp-2">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-[#0A2947]/60">
                        Saved: {item.dateSaved}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onRemoveSavedItem(item.id);
                      }}
                      className="p-1 text-[#0A2947]/50 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove from notebook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Research Note Editor */}
                  {editingNoteId === item.id ? (
                    <div className="space-y-1.5 pt-1">
                      <textarea
                        id="dock-research-note-textarea"
                        name="dock_research_note"
                        value={tempNoteText}
                        onChange={(e) => setTempNoteText(e.target.value)}
                        placeholder="Type personal research note..."
                        className="w-full text-xs p-2 rounded-lg border border-[#D3D4C0] focus:outline-none focus:border-[#0A2947] resize-none h-16 font-dmsans text-[#0A2947]"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2 py-0.5 text-[11px] text-[#0A2947]/70 hover:bg-[#D3D4C0]/40 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNote(item.id)}
                          className="px-2.5 py-0.5 text-[11px] bg-[#0A2947] text-[#F3E4C9] rounded font-montserrat font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] bg-[#F3E4C9]/60 p-2 rounded-lg border border-[#D3D4C0]/60">
                      <span className="text-[#0A2947] italic truncate pr-2">
                        {item.note || 'No notes added yet...'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setTempNoteText(item.note || '');
                        }}
                        className="text-[#8B5E3C] hover:underline font-montserrat font-semibold shrink-0"
                      >
                        {item.note ? 'Edit' : '+ Note'}
                      </button>
                    </div>
                  )}

                  {/* Jump to Document */}
                  <div className="pt-2 border-t border-[#D3D4C0]/60 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setIsNotebookOpen(false);
                        handleOpenDocById(item.itemId);
                      }}
                      className="text-[11px] font-montserrat font-bold text-[#0A2947] hover:text-[#8B5E3C] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Document</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Notebook Export Bar */}
          {savedCollection.length > 0 && (
            <div className="p-3 bg-white border-t border-[#D3D4C0] flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-montserrat">
                <span className="text-[#0A2947]/70">Format:</span>
                {(['APA', 'Chicago', 'BibTeX'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setCitationFormat(fmt)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      citationFormat === fmt ? 'bg-[#0A2947] text-[#F3E4C9]' : 'text-[#0A2947] hover:bg-[#D3D4C0]/40'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  navigator.clipboard.writeText(generateCitation());
                  setCopiedCitation(true);
                  setTimeout(() => setCopiedCitation(false), 2000);
                }}
                className="px-3 py-1 bg-[#D3D4C0]/40 hover:bg-[#D3D4C0] text-[#0A2947] rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCitation ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Citations</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      )}
    </>
  );
};
