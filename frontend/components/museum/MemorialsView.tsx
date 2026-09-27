'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Compass, Globe, Sparkles, BookOpen, ExternalLink, 
  ChevronRight, Landmark, Navigation, Award, Search, Info
} from 'lucide-react';
import { api } from '@/lib/api';
import { soundEffects } from '@/utils/soundEffects';

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

  // Fallback canonical locations in case backend is offline
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
          setSelectedLocation(res.locations[0]);
        } else {
          setLocations(fallbackLocations);
          setSelectedLocation(fallbackLocations[0]);
        }
      } catch (err) {
        console.warn('Could not load dynamic locations, using canonical registry:', err);
        setLocations(fallbackLocations);
        setSelectedLocation(fallbackLocations[0]);
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
    <div className="min-h-screen bg-[#FAF7F0] text-[#0A2947] font-dmsans pb-24">
      {/* Header Banner */}
      <div className="bg-[#0A2947] text-[#FAF7F0] border-b-2 border-[#C89D56] pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C89D56_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF7F0]/10 border border-[#C89D56]/60 text-[#F3E4C9] text-xs font-mono mb-4">
            <Compass className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>INSTITUTIONAL HERITAGE GEOGRAPHY</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF7F0] mb-4">
            Panchtirth & Memorials Map
          </h1>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-[#D3D4C0] font-dmsans leading-relaxed">
            Trace the life trajectory, constitutional labors, and civil rights landmarks of Dr. B. R. Ambedkar across India and the world, connected directly to verified primary source manuscripts.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Controls Toolbar */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#D3D4C0] p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5E3C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memorials, cities, or significance..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs text-[#0A2947] focus:outline-none focus:border-[#0A2947]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: 'All Memorials' },
              { id: 'panchtirth', label: 'Panchtirth (5 Shrines)' },
              { id: 'india', label: 'India Sites' },
              { id: 'international', label: 'International Alma Maters' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveFilter(f.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-[#0A2947] text-[#F3E4C9] shadow-sm'
                    : 'bg-[#FAF7F0] hover:bg-[#F3E4C9] text-[#0A2947] border border-[#D3D4C0]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Memorials List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase text-[#8B5E3C]">
                Archival Memorials ({filteredLocations.length})
              </span>
              <span className="text-[11px] font-mono text-[#0A2947]/60">Select to examine</span>
            </div>

            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedLocation(loc);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#C89D56] shadow-lg ring-2 ring-[#C89D56]/20'
                        : 'bg-white/80 hover:bg-white border-[#D3D4C0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-serif-editorial font-bold text-base text-[#0A2947] leading-snug">
                        {loc.name}
                      </h3>
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF7F0] border border-[#C89D56]/40 text-[#8B5E3C]">
                        {loc.country}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#8B5E3C] font-mono mb-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{loc.city}</span>
                    </div>

                    <p className="text-xs text-[#0A2947]/80 line-clamp-2 leading-relaxed">
                      {loc.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Memorial Dossier */}
          <div className="lg:col-span-7">
            {selectedLocation ? (
              <div className="bg-white rounded-3xl border-2 border-[#D3D4C0] shadow-2xl p-6 sm:p-8 space-y-6 sticky top-24">
                
                {/* Memorial Header */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0A2947] text-[#F3E4C9]">
                      {selectedLocation.type}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.coordinates.latitude},${selectedLocation.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-montserrat font-bold text-[#8B5E3C] hover:text-[#0A2947] hover:underline"
                    >
                      <span>Coordinates: {selectedLocation.coordinates.latitude.toFixed(4)}°, {selectedLocation.coordinates.longitude.toFixed(4)}°</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#0A2947]">
                    {selectedLocation.name}
                  </h2>
                  <div className="text-sm font-mono text-[#8B5E3C] mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedLocation.city}, {selectedLocation.country}</span>
                  </div>
                </div>

                {/* Spatial Radar Simulation Card */}
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#D3D4C0] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0A2947] text-[#C89D56] flex items-center justify-center font-bold">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[#0A2947] font-bold">Geographic Lineage Point</div>
                      <div className="text-[#8B5E3C]">National Digital Heritage Memorial Registry</div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-emerald-700 font-bold">● Active Memorial</div>
                    <div className="text-[#0A2947]/60">Verified Primary Site</div>
                  </div>
                </div>

                {/* Curatorial Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-[#8B5E3C]">
                    Curatorial Summary & History
                  </h4>
                  <p className="text-sm text-[#0A2947] leading-relaxed">
                    {selectedLocation.description}
                  </p>
                </div>

                {/* Historical Significance */}
                <div className="space-y-2 p-4 rounded-2xl bg-[#F3E4C9]/40 border border-[#C89D56]/40">
                  <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-[#0A2947]">
                    <Award className="w-4 h-4 text-[#C89D56]" />
                    <span>HISTORICAL & CONSTITUTIONAL SIGNIFICANCE</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#0A2947] leading-relaxed italic">
                    "{selectedLocation.historical_significance}"
                  </p>
                </div>

                {/* Related Archival Primary Sources */}
                {selectedLocation.related_documents && selectedLocation.related_documents.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-[#D3D4C0]">
                    <h4 className="text-xs font-mono font-bold uppercase text-[#8B5E3C] flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Linked Primary Archival Sources ({selectedLocation.related_documents.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.related_documents.map((docId) => (
                        <a
                          key={docId}
                          href={`/documents/${docId}`}
                          className="px-3 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] text-xs font-mono text-[#0A2947] flex items-center gap-2 transition-colors cursor-pointer group"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#8B5E3C] group-hover:text-[#0A2947]" />
                          <span className="font-bold">{docId}</span>
                          <span className="text-[10px] text-[#8B5E3C]">Read Volume ›</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Scholar Consultation Button */}
                <div className="pt-4 border-t border-[#D3D4C0] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-[#0A2947]/70 font-dmsans">
                    Explore this site's role in Dr. Ambedkar's philosophical development.
                  </div>
                  <a
                    href={`/assistant?q=${encodeURIComponent(`Explain the historical and political significance of ${selectedLocation.name} in Dr. B. R. Ambedkar's life and work.`)}`}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] text-xs font-montserrat font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F3E4C9]" />
                    <span>Consult AI Scholar</span>
                  </a>
                </div>

              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs font-mono text-[#0A2947]/50 bg-white rounded-3xl border border-[#D3D4C0]">
                Select a memorial to inspect its curatorial dossier
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemorialsView;
