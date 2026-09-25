"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Clock,
  Calendar,
  Languages,
  Film,
  Building,
  Sparkles,
  Share2,
  Users,
  Search,
  BookOpen,
} from "lucide-react";
import { api } from "@/lib/api";
import { MediaTrack, TranscriptSegment } from "@/lib/types";

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const videoId = resolvedParams.id;

  const [track, setTrack] = useState<MediaTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(763);
  const [searchTranscript, setSearchTranscript] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTrack = async () => {
      try {
        const res = await api.getMediaTrack(videoId).catch(() => null);
        if (mounted && res) {
          setTrack(res);
          const d = res.duration_seconds || res.duration_secs;
          if (d) setDuration(d);
        } else if (mounted) {
          // Fallback canonical video track
          setTrack({
            id: videoId,
            object_id: "AMBEDKAR-VOL-13",
            asset_type: "video",
            title: "Constituent Assembly: The Final Presentation of the Constitution",
            storage_key: "storage/local/video/cad_november_1949.mp4",
            mime_type: "video/mp4",
            duration_secs: 763.0,
            transcript_language: "en",
            description: "Documentary footage capturing Dr. B.R. Ambedkar presenting the final draft of the Indian Constitution to Assembly President Dr. Rajendra Prasad on 25 November 1949, setting forth the warning against hero-worship and the social democracy imperative.",
            segments: [
              {
                start_time: 15.0,
                end_time: 75.0,
                speaker_name: "Dr. B.R. Ambedkar",
                text: "The Constitution can provide only the organs of State such as the Legislature, the Executive and the Judiciary. The factors on which the working of those organs of State depend are people and the political parties.",
              },
              {
                start_time: 120.0,
                end_time: 195.0,
                speaker_name: "Dr. B.R. Ambedkar",
                text: "Bhakti in religion may be a road to the salvation of the soul. But in politics, Bhakti or hero-worship is a sure road to degradation and to eventual dictatorship.",
              },
              {
                start_time: 250.0,
                end_time: 340.0,
                speaker_name: "Dr. B.R. Ambedkar",
                text: "We must make our political democracy a social democracy as well. Political democracy cannot last unless there lies at the base of it social democracy.",
              },
            ],
          });
        }
      } catch (err) {
        console.warn("Failed to load video track", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTrack();
    return () => {
      mounted = false;
    };
  }, [videoId]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
  };

  const filteredSegments = (track?.segments || []).filter((seg) =>
    searchTranscript.trim() ? seg.text.toLowerCase().includes(searchTranscript.toLowerCase()) : true
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Top Navigation ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
        <Link
          href="/media"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Media Archive</span>
        </Link>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/15 border border-purple-500/30 text-purple-300 uppercase">
          Archival Video Documentary
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Video Player & Metadata (Left 7 Cols) ─────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Video Player Canvas */}
          <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group">
            <video
              ref={videoRef}
              src={`http://localhost:8000/${track?.storage_key || "storage/local/video/cad_november_1949.mp4"}`}
              onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />

            {/* Play/Pause Overlay Button */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-2xl backdrop-blur-md"
              aria-label={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1 fill-current" />}
            </button>

            {/* Bottom Scrubber */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center gap-3 text-xs font-mono text-white">
              <span className="text-[11px]">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Video Metadata Header */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono text-amber-400">
                <Calendar className="h-3.5 w-3.5" />
                25 November 1949
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                Constituent Assembly of India (New Delhi)
              </span>
              <span>•</span>
              <span className="font-mono text-[10px] text-slate-500">{track?.id || videoId}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
              {track?.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {track?.description}
            </p>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <Link
                href="/documents/AMBEDKAR-VOL-13"
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Read Full Constituent Assembly Debates (Vol 13)</span>
              </Link>
              <Link
                href="/knowledge-map?entity=Constituent%20Assembly"
                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Knowledge Graph</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Timestamped Synchronized Transcript (Right 5 Cols) ────────────────────── */}
        <div className="lg:col-span-5 flex flex-col h-[650px] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-serif font-bold text-white">Timestamped Transcript</h2>
              <p className="text-[10px] text-slate-400 font-mono">Click segment to seek video directly</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 font-mono text-[10px] text-blue-300">
              Verified Speech
            </span>
          </div>

          {/* Search within transcript */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/30">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTranscript}
                onChange={(e) => setSearchTranscript(e.target.value)}
                placeholder="Search words within spoken transcript..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Transcript Segment List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredSegments.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 font-mono">
                No matching spoken segments found.
              </div>
            ) : (
              filteredSegments.map((seg, idx) => {
                const isCurrent = currentTime >= seg.start_time && currentTime <= seg.end_time;
                return (
                  <div
                    key={idx}
                    onClick={() => seekTo(seg.start_time)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isCurrent
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-sm"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1.5">
                      <span className="text-amber-400 font-semibold">{seg.speaker_name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {formatTime(seg.start_time)} – {formatTime(seg.end_time)}
                      </span>
                    </div>
                    <p className="font-serif leading-relaxed">{seg.text}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
