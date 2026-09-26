'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, MicOff, X, Sparkles, Compass, ArrowRight, Volume2, 
  VolumeX, Check, HelpCircle, Navigation, Loader2, BookOpen
} from 'lucide-react';
import { Language, ArchivalDocument } from '@/types/museum';
import { voiceRecognitionController, speechController } from '@/utils/speechUtils';
import { soundEffects } from '@/utils/soundEffects';
import { RESEARCH_ANSWERS_DB, ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import VoicePill from '@/components/ui/VoicePill';

interface VoiceNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onNavigateTab: (tab: string) => void;
  onAskAIWithQuery: (query: string) => void;
  onOpenDocument?: (doc: ArchivalDocument) => void;
}

export const VoiceNavigatorModal: React.FC<VoiceNavigatorModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigateTab,
  onAskAIWithQuery,
  onOpenDocument
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [aiAnswer, setAiAnswer] = useState<{ text: string; source?: string; navTarget?: string } | null>(null);
  const [isSpeakingAnswer, setIsSpeakingAnswer] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('Click the microphone and speak your request');

  useEffect(() => {
    setSelectedLang(language);
  }, [language]);

  useEffect(() => {
    if (!isOpen) {
      voiceRecognitionController.stopListening();
      speechController.stop();
      setIsListening(false);
      setIsSpeakingAnswer(false);
    } else {
      setTranscript('');
      setAiAnswer(null);
      setFeedbackMessage('Click the microphone and speak in English, Hindi, or Marathi...');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    soundEffects.playClick();
    speechController.stop();
    setIsSpeakingAnswer(false);

    if (isListening) {
      voiceRecognitionController.stopListening();
      setIsListening(false);
      setFeedbackMessage('Microphone paused. Processing your speech...');
      if (transcript) {
        processVoiceCommand(transcript);
      }
    } else {
      setTranscript('');
      setAiAnswer(null);
      setFeedbackMessage('Listening... Speak now!');

      const started = voiceRecognitionController.startListening({
        lang: selectedLang,
        onStart: () => {
          setIsListening(true);
        },
        onResult: (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            setFeedbackMessage('Understood! Processing your request...');
            setTimeout(() => {
              voiceRecognitionController.stopListening();
              setIsListening(false);
              processVoiceCommand(text);
            }, 600);
          }
        },
        onError: (err) => {
          setIsListening(false);
          setFeedbackMessage(err || 'Could not understand speech. Please try again or click a suggestion.');
        },
        onEnd: () => {
          setIsListening(false);
        }
      });

      if (!started) {
        setFeedbackMessage('Microphone access unavailable. You can tap any suggestion below.');
      }
    }
  };

  const processVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    if (!text) return;

    soundEffects.playClick();

    // 1. NAVIGATION INTENTS
    if (text.includes('timeline') || text.includes('कालक्रम') || text.includes('time line') || text.includes('history') || text.includes('chronology') || text.includes('साल') || text.includes('वर्ष')) {
      executeNavigation('timeline', 'Navigating to the Historical Timeline Corridor...');
      return;
    }

    if (text.includes('stories') || text.includes('story') || text.includes('कहानी') || text.includes('कहानियां') || text.includes('कथा') || text.includes('storybook') || text.includes('comic')) {
      executeNavigation('stories', 'Opening Illustrated Visual Stories & Reels...');
      return;
    }

    if (text.includes('knowledge') || text.includes('map') || text.includes('graph') || text.includes('network') || text.includes('मानचित्र') || text.includes('ग्राफ') || text.includes('संबंध')) {
      executeNavigation('graph', 'Opening Intelligent Knowledge Map...');
      return;
    }

    if (text.includes('archive') || text.includes('book') || text.includes('document') || text.includes('writings') || text.includes('ग्रंथ') || text.includes('किताब') || text.includes('अभिलेख')) {
      executeNavigation('archive', 'Opening Digital Heritage Archives...');
      return;
    }

    if (text.includes('photo') || text.includes('gallery') || text.includes('picture') || text.includes('image') || text.includes('फोटो') || text.includes('तस्वीर') || text.includes('छायाचित्र')) {
      executeNavigation('gallery', 'Opening Historical Photo Folio...');
      return;
    }

    if (text.includes('voice') || text.includes('media') || text.includes('speech') || text.includes('radio') || text.includes('broadcast') || text.includes('ऑडियो') || text.includes('भाषण') || text.includes('आवाज')) {
      executeNavigation('media', 'Opening Voice of Babasaheb Audio Broadcasts...');
      return;
    }

    if (text.includes('quest') || text.includes('quiz') || text.includes('trivia') || text.includes('game') || text.includes('प्रश्नोत्तरी')) {
      executeNavigation('quest', 'Starting Constitutional Quest Trivia...');
      return;
    }

    if (text.includes('compare') || text.includes('synthesis') || text.includes('तुलना')) {
      executeNavigation('compare', 'Opening Comparative Synthesis View...');
      return;
    }

    if (text.includes('home') || text.includes('discover') || text.includes('start') || text.includes('होम') || text.includes('शुरुआत')) {
      executeNavigation('home', 'Taking you to Discover Home...');
      return;
    }

    if (text.includes('notebook') || text.includes('saved') || text.includes('नोटबुक') || text.includes('संग्रह')) {
      executeNavigation('collection', 'Opening your Saved Research Notebook...');
      return;
    }

    // 2. QUESTION ANSWERING INTENT
    answerQuestionDirectly(rawText);
  };

  const executeNavigation = (tab: string, message: string) => {
    soundEffects.playSuccess();
    setFeedbackMessage(message);
    setAiAnswer({
      text: `${message} Directing you right now.`,
      navTarget: tab
    });

    speechController.speak(message, selectedLang);

    setTimeout(() => {
      onNavigateTab(tab);
      onClose();
    }, 1200);
  };

  const answerQuestionDirectly = (query: string) => {
    const qLower = query.toLowerCase();
    let matchedAnswer: string = '';
    let sourceCitation: string = '';
    let targetDocId: string | undefined;

    if (qLower.includes('article 32') || qLower.includes('heart and soul') || qLower.includes('अनुच्छेद 32')) {
      const db = RESEARCH_ANSWERS_DB['fundamental-rights'];
      matchedAnswer = db.answer[selectedLang] || db.answer.en;
      sourceCitation = 'CAD Vol. VII (Article 32 Debate)';
      targetDocId = 'article-32-debate-1948';
    } else if (qLower.includes('constitution') || qLower.includes('drafting') || qLower.includes('संविधान') || qLower.includes('मसुदा')) {
      const db = RESEARCH_ANSWERS_DB['constitution-drafting'];
      matchedAnswer = db.answer[selectedLang] || db.answer.en;
      sourceCitation = 'Constituent Assembly Proceedings, New Delhi';
      targetDocId = 'constituent-assembly-speech-1949';
    } else if (qLower.includes('mahad') || qLower.includes('water') || qLower.includes('महाड') || qLower.includes('पानी')) {
      matchedAnswer = selectedLang === 'hi' 
        ? "महाड सत्याग्रह 20 मार्च 1927 को डॉ. आंबेडकर के नेतृत्व में हुआ, जिसमें चवदार तालाब से जल ग्रहण कर बुनियादी मानवीय अधिकारों और नागरिक समानता की स्थापना की गई।"
        : selectedLang === 'mr'
          ? "महाडचा सत्याग्रह २० मार्च १९२७ रोजी चवदार तळ्यावर पिण्याच्या पाण्याचा मानवी हक्क प्रस्थापित करण्यासाठी डॉ. बाबासाहेब आंबेडकरांच्या नेतृत्वाखाली झाला."
          : "The Mahad Satyagraha of March 20, 1927, led by Dr. Ambedkar, asserted universal human rights and civic equality by reclaiming public drinking water at Chavdar Tank.";
      sourceCitation = 'BAWS Vol. 17 (Part 1)';
      targetDocId = 'mahad-satyagraha-1927';
    } else if (qLower.includes('caste') || qLower.includes('annihilation') || qLower.includes('जाति')) {
      const db = RESEARCH_ANSWERS_DB['social-equality'];
      matchedAnswer = db.answer[selectedLang] || db.answer.en;
      sourceCitation = 'Annihilation of Caste (1936)';
      targetDocId = 'annihilation-of-caste';
    } else if (qLower.includes('education') || qLower.includes('agitate') || qLower.includes('शिक्षा') || qLower.includes('शिका')) {
      const db = RESEARCH_ANSWERS_DB['education-empowerment'];
      matchedAnswer = db.answer[selectedLang] || db.answer.en;
      sourceCitation = 'Bahishkrit Hitakarini Sabha Records (1924)';
    } else {
      matchedAnswer = selectedLang === 'hi'
        ? `डॉ. बी. आर. आंबेडकर ने समानता, बंधुता और सामाजिक लोकतंत्र पर बल दिया। आपके प्रश्न "${query}" पर अधिक शोध के लिए AI Scholar में विस्तृत विश्लेषण उपलब्ध है।`
        : selectedLang === 'mr'
          ? `डॉ. बाबासाहेब आंबेडकरांनी समता, स्वातंत्र्य आणि बंधुतेचा मार्ग दाखवला. आपल्या "${query}" या प्रश्नाचे अधिक सखोल विश्लेषण AI Scholar मध्ये पाहू शकता.`
          : `Dr. B. R. Ambedkar championed constitutional democracy, social justice, and equality. Based on archival records regarding "${query}", comprehensive treatises are accessible in our Digital Archives.`;
      sourceCitation = 'Dr. Babasaheb Ambedkar: Writings and Speeches';
    }

    setAiAnswer({
      text: matchedAnswer,
      source: sourceCitation
    });
    setFeedbackMessage('Answer retrieved from verified archival records.');
    soundEffects.playSuccess();

    // Read answer out loud
    setIsSpeakingAnswer(true);
    speechController.speak(matchedAnswer, selectedLang, () => {
      setIsSpeakingAnswer(false);
    });
  };

  const handleStopSpeaking = () => {
    speechController.stop();
    setIsSpeakingAnswer(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2947]/75 backdrop-blur-md animate-in fade-in duration-200 font-dmsans"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border-2 border-[#C59A45] shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B5E3C] via-[#C59A45] to-[#0A2947]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#D3D4C0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0A2947] text-[#F3E4C9] border border-[#C59A45] flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-[#C59A45]" />
            </div>
            <div>
              <span className="text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase tracking-wider block">
                INTELLIGENT VOICE NAVIGATOR
              </span>
              <h3 className="font-serif-editorial font-bold text-lg text-[#0A2947]">
                Voice of Wisdom & Navigation
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              id="voice-navigator-language-select"
              name="voice_navigator_language"
              aria-label="Select voice interface language"
              value={selectedLang}
              onChange={(e) => {
                soundEffects.playClick();
                setSelectedLang(e.target.value as Language);
              }}
              className="px-2.5 py-1 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-bold text-[#0A2947] cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-[#D3D4C0] hover:bg-[#FAF7F0] text-[#0A2947] cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Pulse Microphone Button */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative">
            {/* Glowing Wave Rings When Listening */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-[#C59A45]/30 animate-ping scale-150" />
                <div className="absolute inset-0 rounded-full bg-[#C59A45]/20 animate-pulse scale-125" />
              </>
            )}

            {/* Dynamic Voice Recording Pill */}
            <div className="flex items-center justify-center p-3 relative z-10">
              <VoicePill
                accentColor="#C59A45"
                iconColor="#F3E4C9"
                background="#0A2947"
                size={72}
                shape="pill"
                showTime
                waveform
                slideToCancel
                mode="toggle"
                reactive="mic"
                isListening={isListening}
                onStart={() => {
                  if (!isListening) handleToggleListening();
                }}
                onStop={() => {
                  if (isListening) handleToggleListening();
                }}
                ariaLabel={isListening ? "Listening... Click to finish" : "Click to speak"}
              />
            </div>
          </div>

          <div className="text-center space-y-1">
            <span className={`text-xs font-montserrat font-bold uppercase tracking-wider block ${
              isListening ? 'text-red-600 animate-pulse' : 'text-[#8B5E3C]'
            }`}>
              {isListening ? 'Listening to your voice...' : 'Tap Mic to Speak'}
            </span>
            <p className="text-xs text-[#0A2947]/75 font-dmsans max-w-sm">
              {feedbackMessage}
            </p>
          </div>
        </div>

        {/* Live Transcription Box */}
        {transcript && (
          <div className="p-4 bg-[#FAF7F0] border border-[#C59A45] rounded-2xl space-y-1 animate-in fade-in">
            <span className="text-[10px] font-cinzel font-bold text-[#8B5E3C] uppercase block">
              You Spoke:
            </span>
            <p className="text-sm sm:text-base font-serif-editorial italic text-[#0A2947] font-semibold">
              "{transcript}"
            </p>
          </div>
        )}

        {/* AI Answer & Action Panel */}
        {aiAnswer && (
          <div className="p-5 bg-white border-2 border-[#C59A45] rounded-2xl shadow-sm space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C59A45]" />
                Archival Response:
              </span>
              {isSpeakingAnswer && (
                <button
                  onClick={handleStopSpeaking}
                  className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <VolumeX className="w-3 h-3" />
                  <span>Stop Audio</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#0A2947] leading-relaxed font-dmsans">
              {aiAnswer.text}
            </p>

            {aiAnswer.source && (
              <div className="text-[10px] font-mono text-[#8B5E3C] pt-1">
                Source: {aiAnswer.source}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D3D4C0]">
              <button
                onClick={() => {
                  onClose();
                  onAskAIWithQuery(transcript);
                }}
                className="px-3.5 py-1.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C59A45]" />
                <span>Examine with AI Scholar</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="space-y-2 pt-2 border-t border-[#D3D4C0]">
          <span className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C] block">
            Or tap any voice command:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '🗺️ Knowledge Map', query: 'Open Knowledge Map' },
              { label: '⏳ Historical Timeline', query: 'Take me to Timeline' },
              { label: '📖 Visual Stories', query: 'Open Stories' },
              { label: '📜 What is Article 32?', query: 'What is Article 32 of the Constitution?' },
              { label: '💧 Mahad Satyagraha', query: 'Tell me about Mahad Satyagraha' },
              { label: '🎙️ Voice Broadcasts', query: 'Open Voice Broadcasts' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundEffects.playClick();
                  setTranscript(chip.query);
                  processVoiceCommand(chip.query);
                }}
                className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] hover:border-[#8B5E3C] text-[#0A2947] rounded-xl text-xs font-montserrat font-semibold transition-all cursor-pointer shadow-2xs hover:scale-105"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
