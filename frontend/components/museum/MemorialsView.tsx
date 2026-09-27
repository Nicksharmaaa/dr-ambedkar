'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin, Compass, Globe, Sparkles, BookOpen, ExternalLink,
  ChevronRight, Landmark, Navigation, Award, Search, Info, X, ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { soundEffects } from '@/utils/soundEffects';
import { MemorialGlobe } from './MemorialGlobe';

export interface HeritageLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: { latitude: number; longitude: number };
  type: string;
  description: string;
  historical_significance: string;
  related_documents: string[];
  related_events: string[];
}

interface MemorialsViewProps {
  onOpenDocument?: (docId: string) => void;
  onAskAIAboutLocation?: (locationName: string) => void;
}

export const MemorialsView: React.FC<MemorialsViewProps> = ({
  onOpenDocument,
  onAskAIAboutLocation,
}) => {
  const [locations, setLocations] = useState<HeritageLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<HeritageLocation | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'list' | 'details' | 'globe'>('list');

  // Canonical registry fallback in case backend is offline
  const fallbackLocations: HeritageLocation[] = [
    {
      id: "loc-mhow",
      name: "Bhim Janmabhoomi (Mhow / Dr. Ambedkar Nagar)",
      city: "Mhow, Madhya Pradesh",
      country: "India",
      coordinates: { latitude: 22.5539, longitude: 75.7644 },
      type: "Birthplace & Panchtirth National Memorial",
      description: "Birthplace of Dr. B. R. Ambedkar on 14 April 1891 in the military cantonment of Mhow. Now enshrined as the grand Bhim Janmabhoomi memorial complex.",
      historical_significance: "Cradle of the architect of modern India and leader of the subaltern emancipation movement.",
      related_documents: ["AMBEDKAR-VOL-01", "AMBEDKAR-VOL-17-01"],
      related_events: ["1891-birth"]
    },
    {
      id: "loc-london",
      name: "Dr. Ambedkar Memorial London (10 King Henry's Road)",
      city: "Camden, London",
      country: "United Kingdom",
      coordinates: { latitude: 51.5434, longitude: -0.1614 },
      type: "Panchtirth International Memorial",
      description: "Residence where Dr. Ambedkar lived while studying for his D.Sc. at London School of Economics and Bar-at-Law at Gray's Inn (1921-1922). Acquired by Government of Maharashtra as an international museum.",
      historical_significance: "Site of intense scholarship where 'The Problem of the Rupee' was researched and written.",
      related_documents: ["AMBEDKAR-VOL-06"],
      related_events: ["1923-problem-of-rupee"]
    },
    {
      id: "loc-mahad",
      name: "Chavdar Tale Water Reservoir (Mahad Satyagraha)",
      city: "Mahad, Raigad, Maharashtra",
      country: "India",
      coordinates: { latitude: 18.2323, longitude: 73.4219 },
      type: "Civil Rights & Satyagraha Memorial",
      description: "Site of the historic Mahad Satyagraha of 20 March 1927, where Dr. Ambedkar led thousands to assert their fundamental right to public drinking water.",
      historical_significance: "Often described as the Magna Carta of Dalit human rights in modern Indian history.",
      related_documents: ["AMBEDKAR-VOL-17-01"],
      related_events: ["1927-mahad"]
    },
    {
      id: "loc-delhi-ca",
      name: "Old Parliament House / Constituent Assembly Hall",
      city: "New Delhi",
      country: "India",
      coordinates: { latitude: 28.6172, longitude: 77.2081 },
      type: "Constitutional Landmark",
      description: "Historic Central Hall of Parliament where the Drafting Committee, chaired by Dr. Ambedkar, debated and finalized the Constitution of India between 1946 and 1949.",
      historical_significance: "Sanctum of modern constitutional democracy and universal adult franchise in India.",
      related_documents: ["AMBEDKAR-VOL-13", "AMBEDKAR-VOL-01"],
      related_events: ["1949-constitution-passed"]
    },
    {
      id: "loc-delhi-alipur",
      name: "Dr. Ambedkar National Memorial (26 Alipur Road)",
      city: "Civil Lines, New Delhi",
      country: "India",
      coordinates: { latitude: 28.6756, longitude: 77.2217 },
      type: "Panchtirth National Memorial (Mahaparinirvan)",
      description: "Residence where Dr. Ambedkar spent his final years, completed Buddha and His Dhamma, and attained Mahaparinirvan on 6 December 1956. Designed in the architectural form of an open book.",
      historical_significance: "National shrine dedicated to Babasaheb's intellectual legacy and constitutional philosophy.",
      related_documents: ["AMBEDKAR-VOL-11", "AMBEDKAR-VOL-17-01"],
      related_events: ["1956-mahaparinirvan"]
    },
    {
      id: "loc-nagpur",
      name: "Deekshabhoomi",
      city: "Nagpur, Maharashtra",
      country: "India",
      coordinates: { latitude: 21.1278, longitude: 79.0664 },
      type: "Panchtirth Religious Emancipation Memorial",
      description: "Sacred ground where Dr. Ambedkar embraced Buddhism alongside over 500,000 followers on Ashoka Vijaya Dashami, 14 October 1956, taking the 22 historic vows.",
      historical_significance: "Greatest mass peaceful religious and philosophical emancipation movement in modern world history.",
      related_documents: ["AMBEDKAR-VOL-11"],
      related_events: ["1956-buddhism-conversion"]
    },
    {
      id: "loc-chaitya",
      name: "Chaitya Bhoomi (Dadar)",
      city: "Mumbai, Maharashtra",
      country: "India",
      coordinates: { latitude: 19.0275, longitude: 72.8344 },
      type: "Panchtirth National Memorial & Resting Place",
      description: "Cremation and resting memorial of Dr. Ambedkar on the shores of Dadar Chowpatty, visited by millions annually on Mahaparinirvan Divas (6 December).",
      historical_significance: "Pilgrimage center of the democratic equality movement.",
      related_documents: ["AMBEDKAR-VOL-17-01"],
      related_events: ["1956-mahaparinirvan"]
    },
    {
      id: "loc-columbia",
      name: "Columbia University (Low Memorial Library & Philosophy Hall)",
      city: "New York City, New York",
      country: "United States",
      coordinates: { latitude: 40.8075, longitude: -73.9626 },
      type: "Intellectual Alma Mater",
      description: "Where young Bhimrao Ambedkar studied under John Dewey, Edwin Seligman, and Alexander Goldenweiser (1913-1916), writing 'Castes in India'. Awarded LL.D. in 1952 as 'Great American Alumnus'.",
      historical_significance: "Formative epicenter of pragmatist philosophy, social democracy, and constitutional thought.",
      related_documents: ["AMBEDKAR-VOL-01"],
      related_events: ["1916-castes-in-india"]
    }
  ];

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await api.getHeritageLocations();
        if (res && res.locations && res.locations.length > 0) {
          setLocations(res.locations);
          // By default no card is active
        } else {
          setLocations(fallbackLocations);
          // By default no card is active
        }
      } catch (err) {
        console.warn('Could not load dynamic locations, using canonical registry:', err);
        setLocations(fallbackLocations);
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, []);

  const filteredLocations = locations.filter(loc => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'panchtirth') return loc.type.toLowerCase().includes('panchtirth');
    if (activeFilter === 'india') return loc.country === 'India';
    if (activeFilter === 'international') return loc.country !== 'India';
    return true;
  });

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-dmsans pb-24">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Curatorial Header - Matches Gallery, Timeline, and Knowledge Map views */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B5E3C] via-[#C89D56] to-[#0A2947]" />

          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF7F0] border border-[#D3D4C0] rounded-full text-xs font-mono font-bold tracking-wider uppercase text-[#8B5E3C]">
              <Compass className="w-3.5 h-3.5 text-[#C89D56]" />
              <span>Sacred Cartography · National Memorial Registry</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial font-bold text-[#0A2947] tracking-tight leading-tight">
              Panchtirth & Heritage Memorials
            </h1>

            <p className="text-xs sm:text-sm text-[#0A2947]/75 font-normal leading-relaxed font-dmsans">
              Interactive 3D orbital projection of Dr. B. R. Ambedkar&apos;s sacred Panchtirth shrines and global academic landmarks, linked directly to verified primary source manuscripts.
            </p>
          </div>

          {/* Quick Metrics & Curatorial Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] text-center min-w-[76px] shadow-2xs">
              <div className="text-base sm:text-lg font-bold font-mono text-[#0A2947]">
                {locations.length}
              </div>
              <div className="text-[10px] text-[#8B5E3C] uppercase font-mono font-bold tracking-wider">
                Sites
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] text-center min-w-[76px] shadow-2xs">
              <div className="text-base sm:text-lg font-bold font-mono text-[#8B5E3C]">
                5
              </div>
              <div className="text-[10px] text-[#8B5E3C] uppercase font-mono font-bold tracking-wider">
                Panchtirth
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] text-center min-w-[76px] shadow-2xs">
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-800 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100%</span>
              </div>
              <div className="text-[10px] text-emerald-800 uppercase font-mono font-bold tracking-wider">
                Verified
              </div>
            </div>
          </div>
        </div>

        {/* ── 3D SPATIAL THEATER: Globe in Center, Left Locations, Right Descriptive Dossier ── */}
        <MemorialGlobe
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => {
            soundEffects.playClick();
            setSelectedLocation(loc);
          }}
          className="w-full h-[680px] sm:h-[720px] lg:h-[780px]"
        >
          {/* Spatial UI Overlays (Pointer events none on outer wrapper, auto on interactive panels) */}
          <div className="absolute inset-0 pointer-events-none p-2 sm:p-4 lg:p-5 flex flex-col justify-between z-10">

            {/* Mobile Top Segmented Tab Switcher (Visible on < lg only) */}
            <div className="lg:hidden flex items-center justify-center pointer-events-auto mb-2">
              <div className="inline-flex items-center gap-1 bg-[#061524]/95 border border-[#C89D56]/40 backdrop-blur-xl p-1 rounded-2xl shadow-xl text-xs font-mono text-white">
                <button
                  type="button"
                  onClick={() => setMobileTab('list')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${mobileTab === 'list'
                    ? 'bg-[#C89D56] text-[#0A2947] shadow-xs'
                    : 'text-[#F3E4C9] hover:bg-white/10'
                    }`}
                >
                  📍 Sites ({filteredLocations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('details')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${mobileTab === 'details'
                    ? 'bg-[#C89D56] text-[#0A2947] shadow-xs'
                    : 'text-[#F3E4C9] hover:bg-white/10'
                    }`}
                >
                  📜 Dossier
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('globe')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${mobileTab === 'globe'
                    ? 'bg-[#C89D56] text-[#0A2947] shadow-xs'
                    : 'text-[#F3E4C9] hover:bg-white/10'
                    }`}
                >
                  🌐 Earth
                </button>
              </div>
            </div>

            {/* Main Spatial Stage Layout: Left Panel, Center Globe, Right Panel */}
            <div className="w-full h-full flex justify-between items-start gap-4 overflow-hidden">

              {/* ── LEFT PANEL: Archival Memorials List (Curatorial Obsidian & Gold Glass) ────── */}
              <div className={`w-full sm:w-[350px] lg:w-[370px] xl:w-[400px] h-full flex flex-col pointer-events-auto bg-[#061524]/90 backdrop-blur-xl border border-[#C89D56]/40 shadow-2xl rounded-3xl p-4 sm:p-5 text-white overflow-hidden ${mobileTab === 'list' ? 'flex' : 'hidden lg:flex'}`}>

                {/* Header */}
                <div className="pb-3 border-b border-[#C89D56]/30 space-y-2.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#C89D56]" />
                      <h2 className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#F3E4C9]">
                        Archival Memorials ({filteredLocations.length})
                      </h2>
                    </div>
                  </div>

                  {/* Compact Search Box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#C89D56]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search memorials, cities..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#0A2947]/80 border border-[#C89D56]/30 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#C89D56] transition-colors"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'panchtirth', label: 'Panchtirth' },
                      { id: 'india', label: 'India' },
                      { id: 'international', label: 'Global' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setActiveFilter(f.id as any);
                        }}
                        className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${activeFilter === f.id
                          ? 'bg-[#C89D56] text-[#0A2947] font-bold shadow-xs'
                          : 'bg-[#0A2947]/60 hover:bg-[#0E355C] text-[#F3E4C9]/80 border border-[#C89D56]/20'
                          }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrollable Memorials Cards */}
                <div className="space-y-2.5 overflow-y-auto pr-1 pt-3 flex-1 custom-scrollbar">
                  {filteredLocations.map((loc) => {
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          soundEffects.playClick();
                          if (selectedLocation?.id === loc.id) {
                            setSelectedLocation(null);
                          } else {
                            setSelectedLocation(loc);
                            setMobileTab('details');
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${isSelected
                          ? 'bg-gradient-to-r from-[#124273] to-[#0A2947] border-2 border-[#C89D56] text-white shadow-lg shadow-[#C89D56]/25 ring-1 ring-[#C89D56]/50 scale-[1.01]'
                          : 'bg-[#0A2947]/45 hover:bg-[#0E355C]/80 border border-[#C89D56]/20 hover:border-[#C89D56]/60 text-white'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-serif-editorial font-bold text-sm leading-snug line-clamp-1 text-white">
                            {loc.name}
                          </h3>
                          <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isSelected
                            ? 'bg-[#C89D56] text-[#0A2947]'
                            : 'bg-[#0A2947]/80 text-[#C89D56] border border-[#C89D56]/30'
                            }`}>
                            {loc.country}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono mb-1.5 text-[#C89D56]">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C89D56]" />
                          <span className="truncate text-[#F3E4C9]/85">{loc.city}</span>
                          {isSelected && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              Active Pin
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-white/75 line-clamp-2 leading-relaxed font-dmsans">
                          {loc.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── RIGHT PANEL: Selected Memorial Descriptive Card (Curatorial Obsidian & Gold Glass) ── */}
              {selectedLocation && (
                <div className={`w-full sm:w-[380px] lg:w-[410px] xl:w-[440px] h-full pointer-events-auto bg-[#061524]/90 backdrop-blur-xl border border-[#C89D56]/40 shadow-2xl rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300 ${mobileTab === 'details' ? 'flex' : 'hidden lg:flex'}`}>
                  <div className="space-y-4">

                    {/* Header with Type & Coordinates */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#C89D56] text-[#0A2947] shadow-xs truncate">
                          {selectedLocation.type}
                        </span>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.coordinates.latitude},${selectedLocation.coordinates.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-montserrat font-bold text-[#F3E4C9] hover:text-[#C89D56] transition-colors"
                            title="Open in Google Maps"
                          >
                            <span>{selectedLocation.coordinates.latitude.toFixed(2)}°, {selectedLocation.coordinates.longitude.toFixed(2)}°</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#C89D56]" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedLocation(null);
                              setMobileTab('list');
                            }}
                            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Close Dossier"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-white leading-tight">
                        {selectedLocation.name}
                      </h2>
                      <div className="text-xs font-mono text-[#C89D56] mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C89D56]" />
                        <span className="text-[#F3E4C9]/90">{selectedLocation.city}, {selectedLocation.country}</span>
                      </div>
                    </div>

                    {/* Verified Memorial Status Line */}
                    <div className="p-3.5 rounded-2xl bg-[#0A2947]/70 border border-[#C89D56]/30 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#C89D56]/20 border border-[#C89D56]/40 text-[#F3E4C9] flex items-center justify-center font-bold">
                          <Landmark className="w-4 h-4 text-[#C89D56]" />
                        </div>
                        <div>
                          <div className="text-white font-bold text-xs">Geographic Lineage Point</div>
                          <div className="text-[#C89D56] text-[10px]">National Digital Heritage Registry</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active Site</span>
                        </div>
                      </div>
                    </div>

                    {/* Curatorial Summary & History */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-bold uppercase text-[#C89D56] tracking-wider">
                        Curatorial Summary & History
                      </h4>
                      <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-dmsans">
                        {selectedLocation.description}
                      </p>
                    </div>

                    {/* Historical Significance Callout */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#C89D56]/15 via-[#8B5E3C]/10 to-transparent border border-[#C89D56]/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-[#F3E4C9] uppercase">
                        <Award className="w-3.5 h-3.5 text-[#C89D56]" />
                        <span>Historical & Constitutional Significance</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#FAF7F0] italic leading-relaxed font-dmsans">
                        &quot;{selectedLocation.historical_significance}&quot;
                      </p>
                    </div>

                    {/* Linked Primary Archival Volumes */}
                    {selectedLocation.related_documents && selectedLocation.related_documents.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#C89D56]/30">
                        <h4 className="text-xs font-mono font-bold uppercase text-[#C89D56] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#C89D56]" />
                          <span>Linked Primary Sources ({selectedLocation.related_documents.length})</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedLocation.related_documents.map((docId) => (
                            <a
                              key={docId}
                              href={`/documents/${docId}`}
                              onClick={(e) => {
                                if (onOpenDocument) {
                                  e.preventDefault();
                                  onOpenDocument(docId);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#0A2947]/80 hover:bg-[#124273] border border-[#C89D56]/30 hover:border-[#C89D56] text-xs font-mono font-bold text-[#F3E4C9] flex items-center gap-1.5 transition-colors cursor-pointer group"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#C89D56] group-hover:text-white" />
                              <span>{docId}</span>
                              <span className="text-[10px] text-[#C89D56]">›</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Bottom AI Consultation Button */}
                  <div className="pt-3 mt-3 border-t border-[#C89D56]/30">
                    <a
                      href={`/assistant?q=${encodeURIComponent(`Explain the historical and political significance of ${selectedLocation.name} in Dr. B. R. Ambedkar's life and work.`)}`}
                      onClick={(e) => {
                        if (onAskAIAboutLocation) {
                          e.preventDefault();
                          onAskAIAboutLocation(selectedLocation.name);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C89D56] via-[#D4A373] to-[#8B5E3C] hover:brightness-110 text-[#0A2947] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#0A2947]" />
                      <span>Consult AI Scholar</span>
                    </a>
                  </div>

                </div>
              )}

            </div>

          </div>
        </MemorialGlobe>

      </div>
    </div>
  );
};

export default MemorialsView;
