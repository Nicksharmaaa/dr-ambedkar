"use client";

import { useState } from "react";
import {
  Mic,
  Play,
  Pause,
  Volume2,
  Calendar,
  Clock,
  Languages,
  FileAudio,
  Radio,
  Share2,
  CheckCircle2,
} from "lucide-react";

interface MediaTrack {
  id: string;
  title: string;
  date: string;
  duration: string;
  source: string;
  format: string;
  language: string;
  description: string;
  transcript: {
    time: string;
    speaker: string;
    textEn: string;
    textHi?: string;
    textMr?: string;
  }[];
}

const MEDIA_TRACKS: MediaTrack[] = [
  {
    id: "track-bbc-1931",
    title: "BBC Radio Address on Constitutional Safeguards",
    date: "1931",
    duration: "04:18",
    source: "BBC Sound Archive / British Library",
    format: "FLAC / 44.1kHz (PREMIS Archived)",
    language: "English",
    description:
      "Recorded during Dr. Ambedkar's participation in the Second Round Table Conference in London, delineating the human rights imperative of political representation for the Depressed Classes.",
    transcript: [
      {
        time: "00:05",
        speaker: "Dr. B.R. Ambedkar",
        textEn:
          "The Depressed Classes must be provided with constitutional safeguards that will guarantee their emancipation from social tyranny.",
        textHi:
          "दलित वर्गों को संवैधानिक सुरक्षा प्रदान की जानी चाहिए जो सामाजिक अत्याचार से उनकी मुक्ति की गारंटी दे।",
        textMr:
          "शोषित वर्गांना सामाजिक अत्याचारापासून मुक्ततेची हमी देणारी घटनात्मक संरक्षणे दिलीच पाहिजेत.",
      },
      {
        time: "01:12",
        speaker: "Dr. B.R. Ambedkar",
        textEn:
          "We do not seek favours; we claim rights as equal citizens of a free India.",
        textHi: "हम कोई कृपा नहीं मांगते; हम एक स्वतंत्र भारत के समान नागरिक के रूप में अपने अधिकारों का दावा करते हैं।",
        textMr: "आम्ही उपकार मागत नाही; स्वतंत्र भारताचे समान नागरिक म्हणून आम्ही आमच्या हक्कांचा दावा करतो.",
      },
      {
        time: "02:45",
        speaker: "Dr. B.R. Ambedkar",
        textEn:
          "Political democracy cannot last unless there lies at the base of it social democracy.",
        textHi: "राजनीतिक लोकतंत्र तब तक जीवित नहीं रह सकता जब तक कि इसके आधार में सामाजिक लोकतंत्र न हो।",
        textMr: "राजकीय लोकशाही तोपर्यंत टिकू शकत नाही जोपर्यंत तिच्या पायाशी सामाजिक लोकशाही नसेल.",
      },
    ],
  },
  {
    id: "track-air-1950",
    title: "All India Radio: Voice of the Republic",
    date: "26 January 1950",
    duration: "06:45",
    source: "All India Radio National Archives",
    format: "WAV Broadcast Master",
    language: "English",
    description:
      "Dr. Ambedkar's radio message on the inauguration of the Republic of India, emphasizing constitutional morality, secularism, and fraternity.",
    transcript: [
      {
        time: "00:10",
        speaker: "Dr. B.R. Ambedkar",
        textEn:
          "Today we enter into an era where the law knows no caste, no creed, and no privilege. The Constitution is our supreme covenant.",
      },
      {
        time: "02:15",
        speaker: "Dr. B.R. Ambedkar",
        textEn:
          "Fraternity means a sense of common brotherhood of all Indians — of Indians being one people.",
      },
    ],
  },
  {
    id: "track-nagpur-1956",
    title: "Nagpur Deeksha Historic Address",
    date: "14 October 1956",
    duration: "18:22",
    source: "People's Education Society Archival Recording",
    format: "Archival Reel-to-Reel",
    language: "Marathi",
    description:
      "Historic speech delivered at Deekshabhoomi, Nagpur, explaining the philosophical necessity of embracing Buddhism for the realization of liberty, equality, and fraternity.",
    transcript: [
      {
        time: "00:20",
        speaker: "Dr. B.R. Ambedkar",
        textEn:
          "I have undertaken this historic step not for political power, but for human dignity, self-respect, and moral elevation.",
        textMr: "मी हे ऐतिहासिक पाऊल राजकीय सत्तेसाठी उचललेले नाही, तर मानवी प्रतिष्ठा, स्वाभिमान आणि नैतिक उन्नतीसाठी उचललेले आहे.",
      },
    ],
  },
];

export default function MediaPage() {
  const [selectedTrack, setSelectedTrack] = useState<MediaTrack>(MEDIA_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "mr">("en");

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
          <Mic className="h-3.5 w-3.5" />
          <span>Audio Heritage & Spoken Word</span>
        </div>
        <h1 className="mt-1 text-3xl font-serif font-bold text-slate-100">
          Historical Audio & Speeches
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Archival voice recordings of Dr. Ambedkar synchronized with IndicConformer ASR & IndicTrans2
          multilingual transcriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Track Selection List */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400 pb-2 border-b border-slate-800">
            Archival Recordings ({MEDIA_TRACKS.length})
          </div>

          <div className="space-y-2">
            {MEDIA_TRACKS.map((track) => {
              const isSelected = selectedTrack.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    setSelectedTrack(track);
                    setIsPlaying(false);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/50 text-slate-100 shadow-md"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-amber-400">{track.date}</span>
                    <span className="font-mono text-slate-500">{track.duration}</span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-slate-100 line-clamp-1">
                    {track.title}
                  </h3>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono truncate">
                    {track.source}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Player & Synchronized Transcript */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Player Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
              <span className="px-2.5 py-0.5 rounded bg-slate-800 font-mono text-amber-400 text-[10px]">
                {selectedTrack.format}
              </span>
              <span className="font-mono text-slate-400 text-[11px]">{selectedTrack.date}</span>
            </div>

            <h2 className="text-xl font-serif font-bold text-slate-100">{selectedTrack.title}</h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              {selectedTrack.description}
            </p>

            {/* Custom Audio Controls Bar */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center font-bold transition-transform active:scale-95 shadow-md shadow-amber-500/30"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-amber-500 rounded-full ${
                      isPlaying ? "w-1/3 animate-pulse" : "w-0"
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{isPlaying ? "01:24" : "00:00"}</span>
                  <span>{selectedTrack.duration}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-slate-400">
                <Volume2 className="h-4 w-4 text-slate-500" />
                <div className="h-1.5 w-16 bg-slate-800 rounded-full">
                  <div className="h-full bg-slate-400 w-3/4 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Viewer with Multilingual Tabs */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-slate-100">
                  Synchronized Archival Transcript
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <Languages className="h-3 w-3 text-slate-400 ml-1 mr-1" />
                {[
                  { id: "en", label: "English" },
                  { id: "hi", label: "Hindi (हिंदी)" },
                  { id: "mr", label: "Marathi (मराठी)" },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setActiveLang(l.id as any)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      activeLang === l.id
                        ? "bg-amber-500 text-slate-950 font-semibold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {selectedTrack.transcript.map((line, idx) => {
                const textToShow =
                  activeLang === "hi" && line.textHi
                    ? line.textHi
                    : activeLang === "mr" && line.textMr
                    ? line.textMr
                    : line.textEn;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-[11px] mb-1 font-mono">
                      <span className="text-amber-400">{line.time}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-semibold">{line.speaker}</span>
                    </div>
                    <p className="font-serif text-slate-200 text-sm leading-relaxed">
                      {textToShow}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
