'use client';

import React, { useState } from 'react';
import { 
  Scale, X, Sparkles, ArrowRight, Quote, Volume2, 
  BookOpen, CheckCircle2, ChevronRight, Award
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { speechController } from '@/utils/speechUtils';

export interface EpochComparisonItem {
  id: string;
  milestoneId: string;
  epochName: string;
  years: string;
  age: string;
  role: string;
  location: string;
  quote: string;
  mission: string;
  highlights: string[];
  keyTreatise: string;
  legacyImpact: string;
}

export const COMPARISON_EPOCHS: EpochComparisonItem[] = [
  {
    id: 'columbia-scholar',
    milestoneId: 'columbia-lse-1913-1923',
    epochName: 'Scholarly Foundations',
    years: '1913–1923',
    age: 'Age 22–32',
    role: 'Columbia Scholar & LSE Barrister',
    location: 'New York & London',
    quote: 'Cultivation of mind should be the ultimate aim of human existence.',
    mission: 'Mastering economics, anthropology, and international jurisprudence to build the intellectual weaponry for emancipation.',
    highlights: [
      'Studied 18 hours daily at Columbia Low Library',
      'Defended "Castes in India" before Alexander Goldenweiser',
      'Earned M.A., Ph.D., M.Sc., D.Sc., and Barrister-at-Law'
    ],
    keyTreatise: 'The Problem of the Rupee (1923) / Castes in India (1916)',
    legacyImpact: 'Formulated the monetary principles that guided the Reserve Bank of India (RBI) Hilton Young Commission.'
  },
  {
    id: 'civil-rights-leader',
    milestoneId: 'mahad-satyagraha-1927-event',
    epochName: 'Civil Rights & Satyagrahas',
    years: '1924–1936',
    age: 'Age 33–45',
    role: 'Pioneer of Mass Human Rights Movements',
    location: 'Mahad, Bombay & Yerwada',
    quote: 'We are not going to the Chavdar Tale merely to drink water; we are going there to establish our human rights.',
    mission: 'Organizing the depressed classes into direct, non-violent civic assertions for equality and dignity.',
    highlights: [
      'Led 10,000 marchers at Mahad to drink from public tank',
      'Negotiated the Poona Pact, doubling reserved seats from 71 to 148',
      'Published "Annihilation of Caste" against religious orthodoxy'
    ],
    keyTreatise: 'Annihilation of Caste (1936) / Bahishkrit Bharat',
    legacyImpact: 'Turned a fragmented untouchability issue into India’s foremost constitutional and moral imperative.'
  },
  {
    id: 'labour-governance',
    milestoneId: 'labour-member-viceroy-1942',
    epochName: 'Statecraft & Labour Welfare',
    years: '1942–1946',
    age: 'Age 51–55',
    role: 'Labour Member of Viceroy’s Council',
    location: 'New Delhi & Nagpur',
    quote: 'I measure the progress of a community by the degree of progress which women have achieved.',
    mission: 'Institutionalizing worker protections, industrial peace, maternity benefits, and national river valley development.',
    highlights: [
      'Reduced statutory workday from 12 hours to 8 hours nationwide',
      'Pioneered the Central Waterways Commission (Damodar & Hirakud)',
      'Instituted statutory maternity benefits and equal pay principles'
    ],
    keyTreatise: 'States and Minorities (1947) / Labour Ministry Memoranda',
    legacyImpact: 'Established modern Indian labour code, factory welfare boards, and multipurpose hydroelectric infrastructure.'
  },
  {
    id: 'constitution-architect',
    milestoneId: 'drafting-committee-1947',
    epochName: 'Architect of the Sovereign Republic',
    years: '1947–1950',
    age: 'Age 56–59',
    role: 'Chairman, Constitution Drafting Committee & Law Minister',
    location: 'Constitution Hall, New Delhi',
    quote: 'Constitution is not a mere lawyers’ document, it is the vehicle of Life, and its spirit is always the spirit of Age.',
    mission: 'Drafting the foundational legal charter of modern India, guaranteeing universal adult suffrage, fundamental rights, and civil liberties.',
    highlights: [
      'Unanimously piloted 395 Articles and 8 Schedules through assembly',
      'Inscribed Article 32 as the "heart and soul" of the Constitution',
      'Abolished untouchability by constitutional law (Article 17)'
    ],
    keyTreatise: 'Draft Constitution of India / Constituent Assembly Debates',
    legacyImpact: 'Gave 350+ million citizens equal voting rights regardless of wealth, gender, or caste.'
  },
  {
    id: 'dhamma-renaissance',
    milestoneId: 'deekshabhoomi-1956',
    epochName: 'Dhamma Renaissance & Humanism',
    years: '1951–1956',
    age: 'Age 60–65',
    role: 'Bodhisattva & Reviver of Buddhist Humanism',
    location: 'Nagpur & New Delhi',
    quote: 'I like the religion that teaches liberty, equality and fraternity.',
    mission: 'Liberating millions from social servitude by reviving the Buddha’s rationalist, egalitarian Dhamma.',
    highlights: [
      'Resigned as Law Minister on moral grounds over the Hindu Code Bill',
      'Administered 22 rationalist vows to 500,000 people at Nagpur',
      'Completed the magnum opus "The Buddha and His Dhamma"'
    ],
    keyTreatise: 'The Buddha and His Dhamma (1957) / 22 Vows (1956)',
    legacyImpact: 'Spawned a worldwide cultural, spiritual, and literary renaissance for human dignity.'
  }
];

interface TimelineEpochComparatorProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToMilestone: (milestoneId: string) => void;
}

export const TimelineEpochComparator: React.FC<TimelineEpochComparatorProps> = ({
  isOpen,
  onClose,
  onJumpToMilestone
}) => {
  const [epochAId, setEpochAId] = useState<string>('columbia-scholar');
  const [epochBId, setEpochBId] = useState<string>('constitution-architect');
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  if (!isOpen) return null;

  const itemA = COMPARISON_EPOCHS.find(e => e.id === epochAId) || COMPARISON_EPOCHS[0];
  const itemB = COMPARISON_EPOCHS.find(e => e.id === epochBId) || COMPARISON_EPOCHS[3];

  const handleSpeak = (text: string, id: string) => {
    soundEffects.playClick();
    if (isSpeaking === id) {
      speechController.stop();
      setIsSpeaking(null);
      return;
    }
    setIsSpeaking(id);
    speechController.speak(text, 'en', () => {
      setIsSpeaking(null);
    });
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-[#0A2947]/85 backdrop-blur-md animate-in fade-in duration-200 font-dmsans">
      <div 
        className="bg-white rounded-3xl border-2 border-[#C59A45] shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2947] text-[#FAF7F0] px-6 py-4 flex items-center justify-between border-b-2 border-[#C59A45]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C59A45] text-[#0A2947] flex items-center justify-center font-bold shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-cinzel uppercase tracking-widest text-[#F3E4C9] font-bold">
                  CURATORIAL COMPARATIVE LENS
                </span>
                <span className="px-2 py-0.5 bg-[#8B5E3C] text-white rounded text-[10px] font-mono font-bold">
                  DAIC EXHIBIT
                </span>
              </div>
              <h3 className="font-serif-editorial font-bold text-base sm:text-lg text-white">
                {"Compare Babasaheb's Transformational Epochs"}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              speechController.stop();
              onClose();
            }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Epoch Selector Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
            {/* Selector A */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase block">
                Primary Epoch A:
              </label>
              <select
                value={epochAId}
                onChange={(e) => {
                  soundEffects.playClick();
                  setEpochAId(e.target.value);
                }}
                className="w-full bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-xl p-2.5 text-xs sm:text-sm font-dmsans text-[#0A2947] font-semibold focus:border-[#C59A45] focus:outline-none cursor-pointer"
              >
                {COMPARISON_EPOCHS.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.epochName} ({e.years}) — {e.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector B */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold text-[#8B5E3C] uppercase block">
                Comparative Epoch B:
              </label>
              <select
                value={epochBId}
                onChange={(e) => {
                  soundEffects.playClick();
                  setEpochBId(e.target.value);
                }}
                className="w-full bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-xl p-2.5 text-xs sm:text-sm font-dmsans text-[#0A2947] font-semibold focus:border-[#C59A45] focus:outline-none cursor-pointer"
              >
                {COMPARISON_EPOCHS.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.epochName} ({e.years}) — {e.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card A */}
            <div className="bg-[#FAF7F0] border-2 border-[#C59A45]/70 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#D3D4C0] pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#8B5E3C] font-bold">
                      {itemA.years} · {itemA.age}
                    </span>
                    <h4 className="text-xl font-serif-editorial font-bold text-[#0A2947]">
                      {itemA.epochName}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 bg-[#0A2947] text-[#F3E4C9] text-xs font-mono font-bold rounded-lg">
                    {itemA.location}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C]">Role & Calling</div>
                  <div className="text-sm font-bold text-[#0A2947]">{itemA.role}</div>
                </div>

                <div>
                  <div className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C]">Historical Mission</div>
                  <p className="text-xs text-[#0A2947]/85 leading-relaxed">{itemA.mission}</p>
                </div>

                {/* Historic Quote */}
                <div className="p-3 bg-white border-l-3 border-[#8B5E3C] rounded-r-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-cinzel font-bold text-[#8B5E3C] uppercase flex items-center gap-1">
                      <Quote className="w-3 h-3" />
                      Proclamation
                    </span>
                    <button
                      onClick={() => handleSpeak(itemA.quote, itemA.id)}
                      className="p-1 rounded text-[#8B5E3C] hover:text-[#0A2947] hover:bg-[#FAF7F0] cursor-pointer"
                      title="Listen to Quote"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking === itemA.id ? 'text-amber-700 animate-pulse' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs font-serif-editorial italic text-[#0A2947]">
                    "{itemA.quote}"
                  </p>
                </div>

                {/* Highlights */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C]">Key Achievements</div>
                  {itemA.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#0A2947]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Treatise & Legacy */}
                <div className="p-3 bg-white/70 rounded-xl border border-[#D3D4C0] space-y-1 text-xs">
                  <span className="font-mono text-[10px] text-[#8B5E3C] font-bold block">
                    📖 Key Treatise: {itemA.keyTreatise}
                  </span>
                  <p className="text-[11px] text-[#0A2947]/80">
                    🏛️ <strong className="text-[#0A2947]">Modern Impact:</strong> {itemA.legacyImpact}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D3D4C0]">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onClose();
                    onJumpToMilestone(itemA.milestoneId);
                  }}
                  className="w-full py-2 bg-white hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Jump to {itemA.years} Station</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8B5E3C]" />
                </button>
              </div>
            </div>

            {/* Card B */}
            <div className="bg-[#FAF7F0] border-2 border-[#0A2947]/40 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#D3D4C0] pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#8B5E3C] font-bold">
                      {itemB.years} · {itemB.age}
                    </span>
                    <h4 className="text-xl font-serif-editorial font-bold text-[#0A2947]">
                      {itemB.epochName}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 bg-[#0A2947] text-[#F3E4C9] text-xs font-mono font-bold rounded-lg">
                    {itemB.location}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C]">Role & Calling</div>
                  <div className="text-sm font-bold text-[#0A2947]">{itemB.role}</div>
                </div>

                <div>
                  <div className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C]">Historical Mission</div>
                  <p className="text-xs text-[#0A2947]/85 leading-relaxed">{itemB.mission}</p>
                </div>

                {/* Historic Quote */}
                <div className="p-3 bg-white border-l-3 border-[#8B5E3C] rounded-r-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-cinzel font-bold text-[#8B5E3C] uppercase flex items-center gap-1">
                      <Quote className="w-3 h-3" />
                      Proclamation
                    </span>
                    <button
                      onClick={() => handleSpeak(itemB.quote, itemB.id)}
                      className="p-1 rounded text-[#8B5E3C] hover:text-[#0A2947] hover:bg-[#FAF7F0] cursor-pointer"
                      title="Listen to Quote"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking === itemB.id ? 'text-amber-700 animate-pulse' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs font-serif-editorial italic text-[#0A2947]">
                    "{itemB.quote}"
                  </p>
                </div>

                {/* Highlights */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C]">Key Achievements</div>
                  {itemB.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#0A2947]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Treatise & Legacy */}
                <div className="p-3 bg-white/70 rounded-xl border border-[#D3D4C0] space-y-1 text-xs">
                  <span className="font-mono text-[10px] text-[#8B5E3C] font-bold block">
                    📖 Key Treatise: {itemB.keyTreatise}
                  </span>
                  <p className="text-[11px] text-[#0A2947]/80">
                    🏛️ <strong className="text-[#0A2947]">Modern Impact:</strong> {itemB.legacyImpact}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D3D4C0]">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onClose();
                    onJumpToMilestone(itemB.milestoneId);
                  }}
                  className="w-full py-2 bg-white hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Jump to {itemB.years} Station</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8B5E3C]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
