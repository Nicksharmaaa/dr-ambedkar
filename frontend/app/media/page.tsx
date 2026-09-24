"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Play,
  Pause,
  Volume2,
  Calendar,
  Clock,
  Languages,
  FileAudio,
  Film,
  Radio,
  Share2,
  Search,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { MediaTrack, TranscriptSegment, SpokenSearchResult } from "@/lib/types";

export default function MediaPage() {
  const [tracks, setTracks] = useState<MediaTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<MediaTrack | null>(null);
  const [selectedTrackDetails, setSelectedTrackDetails] = useState<MediaTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "mr">("en");
  const [assetFilter, setAssetFilter] = useState<"all" | "audio" | "video">("all");

  // Spoken Media Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpokenSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load tracks on mount
  useEffect(() => {
    let mounted = true;
    const fetchTracks = async () => {
      try {
        const filter = assetFilter === "all" ? undefined : assetFilter;
        const res = await api.getMediaTracks(filter);
        if (mounted && res.length > 0) {
          setTracks(res);
          if (!selectedTrack) {
            setSelectedTrack(res[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch media tracks:", err);
      }
    };
    fetchTracks();
    return () => {
      mounted = false;
    };
  }, [assetFilter]);

  // Load selected track details with segments
  useEffect(() => {
    if (!selectedTrack) return;
    let mounted = true;
    const fetchTrackDetails = async () => {
      try {
        const details = await api.getMediaTrack(selectedTrack.id);
        if (mounted) {
          setSelectedTrackDetails(details);
        }
      } catch (err) {
        console.error("Failed to fetch track details:", err);
      }
    };
    fetchTrackDetails();
    return () => {
      mounted = false;
    };
  }, [selectedTrack?.id]);

  // Handle Spoken Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.searchSpokenMedia(searchQuery.trim());
      setSearchResults(res.matches || []);
    } catch (err) {
      console.error("Spoken search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    if (selectedTrack?.asset_type === "video" && videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    const el = selectedTrack?.asset_type === "video" ? videoRef.current : audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-slate-100">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
          <Mic className="h-3.5 w-3.5" />
          <span>Audio & Video Heritage (Phase 9)</span>
        </div>
        <h1 className="mt-1 text-3xl font-serif font-bold text-white">
          Historical Audio, Speeches & Video Archive
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Synchronized timestamped transcripts, speaker segmentation, and seek-to-timestamp search.
        </p>
      </div>

      {/* Spoken Word Search Bar (Section 8 & 9) */}
      <div className="my-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spoken words across audio and video recordings (e.g. 'Constitutional morality', 'Constitution', 'Water')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-amber-500/20"
          >
            {isSearching ? "Searching..." : "Search Spoken Words"}
          </button>
        </form>

        {/* Search Results Drawer */}
        {searchResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="text-xs font-mono text-slate-400">
              Found {searchResults.length} spoken occurrences:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {searchResults.map((hit) => (
                <div
                  key={hit.segment_id}
                  onClick={() => {
                    const tr = tracks.find((t) => t.id === hit.media_id);
                    if (tr) setSelectedTrack(tr);
                    seekTo(hit.timestamp_seconds);
                  }}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-300 truncate max-w-[200px]">
                      {hit.media_title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-mono text-[10px]">
                      {hit.timestamp_str}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Speaker: <span className="text-slate-200">{hit.speaker_name}</span>
                  </div>
                  <p className="text-xs text-slate-300 italic line-clamp-2">
                    "{hit.matching_text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Track Selection Catalog */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400">
              Recordings ({tracks.length})
            </span>
            <div className="flex gap-1">
              {(["all", "audio", "video"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAssetFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                    assetFilter === filter
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {tracks.map((track) => {
              const isSelected = selectedTrack?.id === track.id;
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
                    <span className="flex items-center gap-1 font-mono text-amber-400">
                      {track.asset_type === "video" ? (
                        <Film className="w-3 h-3" />
                      ) : (
                        <FileAudio className="w-3 h-3" />
                      )}
                      {(track.asset_type || "audio").toUpperCase()}
                    </span>
                    <span className="font-mono text-slate-500">
                      {formatSeconds(track.duration_seconds || 0)}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-slate-100 line-clamp-1">
                    {track.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{track.codec || "MP3"}</span>
                    <span>{(track.language || "en").toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Media Player & Interactive Synchronized Transcripts */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTrack && (
            <>
              {/* Media Player Card */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 font-mono text-amber-400 text-[10px]">
                      {selectedTrack.codec}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-800">
                      ORIGINAL_RECORDING
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {selectedTrack.recording_date || "Archival Date Verified"}
                  </span>
                </div>

                <h2 className="text-xl font-serif font-bold text-white">
                  {selectedTrack.title}
                </h2>

                {/* Player Element */}
                {selectedTrack.asset_type === "video" ? (
                  <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                    <video
                      ref={videoRef}
                      controls
                      src="/videos/cad_speech_1949.mp4"
                      className="w-full h-full"
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onError={() => console.log("Archival video demonstration placeholder")}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <audio
                      ref={audioRef}
                      src={`/audio/${selectedTrack.id}.mp3`}
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onEnded={() => setIsPlaying(false)}
                      onError={() => console.log("Archival audio demonstration placeholder")}
                      className="hidden"
                    />
                    {/* Visual Player Controls */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
                      <button
                        onClick={togglePlay}
                        className="h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center font-bold transition-transform active:scale-95 shadow-md shadow-amber-500/30"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </button>

                      <div className="flex-1 space-y-1">
                        <input
                          type="range"
                          min={0}
                          max={selectedTrack.duration_seconds}
                          value={currentTime}
                          onChange={(e) => seekTo(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>{formatSeconds(currentTime)}</span>
                          <span>{formatSeconds(selectedTrack.duration_seconds)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamped Transcripts (Section 8 & 9: Seek to Timestamp) */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-amber-400" />
                    <h3 className="font-serif font-bold text-sm text-white">
                      Synchronized Spoken Transcript ({selectedTrackDetails?.segments?.length || 0} segments)
                    </h3>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    <Languages className="h-3.5 w-3.5 text-slate-400 ml-1 mr-1" />
                    {(["en", "hi", "mr"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                          activeLang === lang
                            ? "bg-amber-500 text-slate-950 font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "मराठी"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Segments List */}
                <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {selectedTrackDetails?.segments?.map((seg) => {
                    const isActive =
                      currentTime >= seg.start_time && currentTime <= seg.end_time;

                    return (
                      <div
                        key={seg.id}
                        onClick={() => seekTo(seg.start_time)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? "bg-amber-500/15 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30"
                            : "bg-slate-900/50 border-slate-800/60 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-semibold">
                              {formatSeconds(seg.start_time)} - {formatSeconds(seg.end_time)}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-200 font-semibold">
                              {seg.speaker_name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">Click to seek</span>
                        </div>
                        <p className="font-serif text-slate-200 text-sm leading-relaxed">
                          "{seg.text}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
