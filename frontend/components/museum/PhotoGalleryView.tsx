'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, Maximize2, ZoomIn, ZoomOut, Eye, BookOpen, 
  Copy, Check, ChevronLeft, ChevronRight, X, Search, 
  MapPin, Calendar, Layers, Grid3X3, SlidersHorizontal, 
  ExternalLink, FileText, ArrowRight, Info, EyeOff, Sparkles
} from 'lucide-react';
import { Language, HistoricalPhoto, ArchivalDocument } from '@/types/museum';
import { UI_STRINGS } from '@/utils/i18n';
import { HISTORICAL_PHOTOS, ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';
import { Masonry, MasonryItem } from '@/components/ui/Masonry';

interface PhotoGalleryViewProps {
  language: Language;
  onOpenDocument?: (doc: ArchivalDocument) => void;
  onAskAIWithPhoto?: (query: string) => void;
}

export const PhotoGalleryView: React.FC<PhotoGalleryViewProps> = ({
  language,
  onOpenDocument,
  onAskAIWithPhoto
}) => {
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const [selectedPhoto, setSelectedPhoto] = useState<HistoricalPhoto | null>(null);
  const [activeEra, setActiveEra] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'masonry' | 'contact_sheet'>('masonry');
  const [alwaysShowCaptions, setAlwaysShowCaptions] = useState<boolean>(false);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [lightboxTone, setLightboxTone] = useState<'original' | 'high_contrast' | 'sepia'>('original');

  // Multi-dimensional filter lists
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(HISTORICAL_PHOTOS.map(p => p.year))).sort((a, b) => a - b);
    return years;
  }, []);

  const availableLocations = useMemo(() => {
    const locs = Array.from(new Set(HISTORICAL_PHOTOS.map(p => p.location.split(',')[0].trim())));
    return locs;
  }, []);

  const availableSources = useMemo(() => {
    const sources = Array.from(new Set(HISTORICAL_PHOTOS.map(p => p.archiveProvenance.split('/')[0].trim())));
    return sources;
  }, []);

  // Filter photos based on era, year, location, source, and search query
  const filteredPhotos = useMemo(() => {
    return HISTORICAL_PHOTOS.filter(photo => {
      // Era filter
      const matchesEra = activeEra === 'all' || 
        photo.era === activeEra ||
        (activeEra === 'Early Life & Education' && (photo.era === 'Early Life & Studies' || photo.era === 'Early Life & Education')) ||
        (activeEra === 'Social Movements' && (photo.era === 'Civil Rights & Movements' || photo.era === 'Social Movements'));

      // Year filter
      const matchesYear = selectedYear === 'all' || photo.year.toString() === selectedYear;

      // Location filter
      const matchesLocation = selectedLocation === 'all' || photo.location.toLowerCase().includes(selectedLocation.toLowerCase());

      // Archival Source filter
      const matchesSource = selectedSource === 'all' || photo.archiveProvenance.toLowerCase().includes(selectedSource.toLowerCase());

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        photo.title.toLowerCase().includes(q) ||
        (photo.titleLocal?.hi && photo.titleLocal.hi.toLowerCase().includes(q)) ||
        (photo.titleLocal?.mr && photo.titleLocal.mr.toLowerCase().includes(q)) ||
        photo.location.toLowerCase().includes(q) ||
        photo.caption.toLowerCase().includes(q) ||
        photo.historicalContext.toLowerCase().includes(q) ||
        photo.year.toString().includes(q) ||
        photo.accessionNumber.toLowerCase().includes(q) ||
        photo.archiveProvenance.toLowerCase().includes(q);
      
      return matchesEra && matchesYear && matchesLocation && matchesSource && matchesQuery;
    });
  }, [activeEra, selectedYear, selectedLocation, selectedSource, searchQuery]);

  // Convert filtered historical photos to React Bits Masonry items with organic heights
  const masonryItems: MasonryItem[] = useMemo(() => {
    return filteredPhotos.map((photo, index) => {
      let height = 540;
      if (photo.aspectRatio === 'portrait') {
        height = 740;
      } else if (photo.aspectRatio === 'square') {
        height = 600;
      } else if (photo.aspectRatio === 'landscape') {
        height = 460;
      } else {
        height = index % 3 === 0 ? 700 : index % 3 === 1 ? 480 : 580;
      }

      return {
        id: photo.id,
        img: photo.imageUrl,
        url: '#',
        height,
        photo,
      };
    });
  }, [filteredPhotos]);

  // Handle keyboard navigation for Lightbox modal
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
        setIsZoomed(false);
      } else if (e.key === 'ArrowRight') {
        navigatePhoto(1);
      } else if (e.key === 'ArrowLeft') {
        navigatePhoto(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, filteredPhotos]);

  const navigatePhoto = (direction: number) => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex === -1) return;
    
    soundEffects.playClick();
    const nextIndex = (currentIndex + direction + filteredPhotos.length) % filteredPhotos.length;
    setSelectedPhoto(filteredPhotos[nextIndex]);
    setIsZoomed(false);
  };

  const handleCopyCitation = (photo: HistoricalPhoto) => {
    soundEffects.playClick();
    const citation = `"${photo.title}" (${photo.dateString}, ${photo.location}). Provenance: ${photo.archiveProvenance}. Accession: ${photo.accessionNumber}. Dr. B. R. Ambedkar Digital Heritage Archive.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitationId(photo.id);
    setTimeout(() => setCopiedCitationId(null), 2500);
  };

  const eras = [
    { id: 'all', label: 'All Photographs', count: HISTORICAL_PHOTOS.length },
    { id: 'Early Life & Education', label: 'Early Life & Education', count: HISTORICAL_PHOTOS.filter(p => p.era === 'Early Life & Education' || p.era === 'Early Life & Studies').length },
    { id: 'Social Movements', label: 'Social Movements', count: HISTORICAL_PHOTOS.filter(p => p.era === 'Social Movements' || p.era === 'Civil Rights & Movements').length },
    { id: 'Constitution & Governance', label: 'Constitution & Governance', count: HISTORICAL_PHOTOS.filter(p => p.era === 'Constitution & Governance').length },
    { id: 'Public Life', label: 'Public Life', count: HISTORICAL_PHOTOS.filter(p => p.era === 'Public Life').length },
    { id: 'Later Life & Philosophy', label: 'Later Life & Philosophy', count: HISTORICAL_PHOTOS.filter(p => p.era === 'Later Life & Philosophy').length },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-10 px-4 sm:px-6 lg:px-8 font-dmsans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Curatorial Header */}
        <div className="border-b-2 border-[#D3D4C0] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B5E3C] uppercase tracking-widest">
              <Camera className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>VISUAL DOCUMENTARY COLLECTION</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#0A2947]">1891–1956</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums font-semibold text-[#0A2947] font-mono">{HISTORICAL_PHOTOS.length} Archived Photographic Plates</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial font-bold tracking-tight text-[#0A2947] leading-tight">
              {t.wingGalleryTitle || "Photographic Folio & Visual History"}
            </h1>

            <p className="text-xs sm:text-sm text-[#0A2947]/75 leading-relaxed font-dmsans">
              {t.wingGallerySub ? `${t.wingGallerySub} — 1916–1956` : "Curated archival plates from 1916 to 1956 — historic assemblies, university research, and constitutional sessions."}
            </p>
          </div>

          {/* Quick Stats & Exhibition Provenance */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-1.5 text-xs text-[#0A2947]/70">
            <span className="font-montserrat text-[#8B5E3C] font-bold uppercase tracking-wider text-[11px]">
              Archival Repositories
            </span>
            <span className="text-[#0A2947]/80 text-right">
              National Archives · Parliamentary Museum · Bombay State Archives
            </span>
          </div>
        </div>

        {/* Curatorial Controls & Filter Bar */}
        <div className="bg-white border-2 border-[#D3D4C0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="gallery-search-input"
                name="gallery_search_query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by location, year, keywords (e.g. Mahad, Rajgruha)..."
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2 bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-stone-900 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Layout & Presentation Toggles */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Toggle Always Show Captions */}
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setAlwaysShowCaptions(!alwaysShowCaptions);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  alwaysShowCaptions
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
                title={alwaysShowCaptions ? "Captions pinned visible" : "Captions appear on hover"}
              >
                {alwaysShowCaptions ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{alwaysShowCaptions ? "Captions Visible" : "Hover Captions"}</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('masonry');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'masonry'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Masonry</span>
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('contact_sheet');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'contact_sheet'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  <span>Contact Sheet</span>
                </button>
              </div>
            </div>

          </div>

          {/* Segmented Era Selector & Secondary Filters */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            {/* Primary Era Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {eras.map(era => (
                <button
                  key={era.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveEra(era.id);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeEra === era.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <span>{era.label}</span>
                  <span className={`text-[11px] tabular-nums font-mono ${activeEra === era.id ? 'text-stone-300' : 'text-stone-400'}`}>
                    ({era.count})
                  </span>
                </button>
              ))}
            </div>

            {/* Secondary Multi-Dimensional Filters: Year, Location, Source */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs font-mono text-stone-600">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Refine:</span>

              {/* Year Select */}
              <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3 h-3 text-stone-400" />
                <select
                  id="gallery-filter-year"
                  name="gallery_filter_year"
                  aria-label="Filter by Year"
                  value={selectedYear}
                  onChange={(e) => {
                    soundEffects.playClick();
                    setSelectedYear(e.target.value);
                  }}
                  className="bg-transparent text-stone-700 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">All Years</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr.toString()}>{yr}</option>
                  ))}
                </select>
              </div>

              {/* Location Select */}
              <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg">
                <MapPin className="w-3 h-3 text-stone-400" />
                <select
                  id="gallery-filter-location"
                  name="gallery_filter_location"
                  aria-label="Filter by Location"
                  value={selectedLocation}
                  onChange={(e) => {
                    soundEffects.playClick();
                    setSelectedLocation(e.target.value);
                  }}
                  className="bg-transparent text-stone-700 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  {availableLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Archival Source Select */}
              <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg">
                <BookOpen className="w-3 h-3 text-stone-400" />
                <select
                  id="gallery-filter-source"
                  name="gallery_filter_source"
                  aria-label="Filter by Archival Repository"
                  value={selectedSource}
                  onChange={(e) => {
                    soundEffects.playClick();
                    setSelectedSource(e.target.value);
                  }}
                  className="bg-transparent text-stone-700 text-xs focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option value="all">All Repositories</option>
                  {availableSources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              {/* Reset Secondary Filters */}
              {(selectedYear !== 'all' || selectedLocation !== 'all' || selectedSource !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedYear('all');
                    setSelectedLocation('all');
                    setSelectedSource('all');
                    setSearchQuery('');
                    setActiveEra('all');
                  }}
                  className="text-amber-700 hover:text-amber-900 underline text-[11px] cursor-pointer ml-1"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Photographic Count Indicator */}
        <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>Displaying {filteredPhotos.length} of {HISTORICAL_PHOTOS.length} photographs</span>
          {activeEra !== 'all' && (
            <span>Filtered by Era: {activeEra}</span>
          )}
        </div>

        {/* 1. REACT BITS MASONRY GRID LAYOUT */}
        {viewMode === 'masonry' && (
          <div className="w-full">
            <Masonry
              items={masonryItems}
              ease="sine.out"
              duration={0.6}
              stagger={0.05}
              animateFrom="random"
              scaleOnHover={true}
              hoverScale={0.95}
              blurToFocus={true}
              colorShiftOnHover={false}
              onItemClick={(item) => {
                soundEffects.playClick();
                const photo = item.photo || filteredPhotos.find(p => p.id === item.id);
                if (photo) setSelectedPhoto(photo);
              }}
              renderItem={(item) => {
                const photo = (item.photo || filteredPhotos.find(p => p.id === item.id)) as HistoricalPhoto;
                if (!photo) return null;
                const displayTitle = language !== 'en' && photo.titleLocal?.[language] 
                  ? photo.titleLocal[language] 
                  : photo.title;

                return (
                  <div className="relative w-full h-full flex flex-col justify-between overflow-hidden group/card select-none">
                    {/* Top Metadata Strip */}
                    <div className="p-3 flex items-center justify-between text-[11px] font-mono text-white/95 z-10 pointer-events-none drop-shadow-md">
                      <div className="flex items-center gap-1.5 bg-black/65 px-2.5 py-1 rounded-lg border border-white/10 shadow-xs">
                        <Calendar className="w-3 h-3 text-[#C59A45]" />
                        <span className="font-semibold tabular-nums text-white">{photo.year}</span>
                      </div>
                      <div className="bg-black/65 px-2 py-1 rounded-lg text-[10px] text-stone-300 border border-white/10 shadow-xs">
                        {photo.accessionNumber}
                      </div>
                    </div>

                    {/* Gradient Bottom Vignette & Captions */}
                    <div
                      className={`mt-auto bg-gradient-to-t from-stone-950/95 via-stone-950/75 to-transparent p-3.5 sm:p-4 text-white transition-opacity duration-300 z-10 ${
                        alwaysShowCaptions 
                          ? 'opacity-100' 
                          : 'opacity-0 group-hover/card:opacity-100'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#C59A45]">
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-[#C59A45] shrink-0" />
                            {photo.year} · {photo.location}
                          </span>
                          <span className="text-stone-300 shrink-0 text-[9px] uppercase tracking-wider">{photo.era}</span>
                        </div>
                        <h4 className="font-serif-editorial text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-sm">
                          {displayTitle}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-300 pt-1.5 border-t border-white/15">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Archival Specimen
                          </span>
                          <span className="text-[#C59A45] font-sans font-bold flex items-center gap-1 bg-[#C59A45]/20 px-2 py-0.5 rounded-md hover:bg-[#C59A45] hover:text-[#0A2947] transition-colors">
                            <span>Deep View</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        )}

        {/* 2. CONTACT SHEET / CURATORIAL LIST VIEW */}
        {viewMode === 'contact_sheet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPhotos.map((photo) => {
              const displayTitle = language !== 'en' && photo.titleLocal?.[language] 
                ? photo.titleLocal[language] 
                : photo.title;
              const displayCaption = language !== 'en' && photo.captionLocal?.[language]
                ? photo.captionLocal[language]
                : photo.caption;

              return (
                <div
                  key={photo.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedPhoto(photo);
                  }}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-400 transition-all p-4 flex flex-col sm:flex-row gap-5 cursor-pointer group shadow-xs hover:shadow-md"
                >
                  <div className="sm:w-48 sm:h-44 shrink-0 overflow-hidden rounded-xl bg-stone-950 relative">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white font-mono text-[10px] rounded">
                      {photo.year}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500">
                        <span>{photo.accessionNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>{photo.location}</span>
                      </div>
                      <h3 className="font-serif font-bold text-stone-900 text-base group-hover:text-blue-700 transition-colors">
                        {displayTitle}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {displayCaption}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono">
                      <span className="truncate max-w-[180px]">{photo.archiveProvenance}</span>
                      <span className="text-stone-800 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1 font-sans">
                        <span>View plate</span>
                        <ArrowRight className="w-3 h-3 text-stone-400" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty Search Result */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl p-8 space-y-4">
            <Camera className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-stone-800">
              No archival plates found
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              No photographs match your query "{searchQuery}". Try broadening your search or selecting "All Photographs".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveEra('all');
              }}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* LIGHTBOX MODAL: DEEP CURATORIAL INSPECTION */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={selectedPhoto.title}
          >
            <div className="relative w-full max-w-6xl max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row text-white">
              
              {/* Close Button */}
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedPhoto(null);
                  setIsZoomed(false);
                }}
                className="absolute top-4 right-4 z-30 p-2.5 bg-black/60 hover:bg-black text-stone-300 hover:text-white rounded-full transition-colors cursor-pointer border border-white/10"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation Left */}
              <button
                onClick={() => navigatePhoto(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors cursor-pointer border border-white/10"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Navigation Right */}
              <button
                onClick={() => navigatePhoto(1)}
                className="absolute right-4 lg:right-[430px] top-1/2 -translate-y-1/2 z-20 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors cursor-pointer border border-white/10"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* LEFT VIEWPORT: PHOTOGRAPH CANVAS */}
              <div className="flex-1 bg-stone-950 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden relative min-h-[350px] lg:min-h-[600px]">
                
                {/* Image Element */}
                <div className={`transition-all duration-300 max-h-[70vh] flex items-center justify-center ${
                  isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}>
                  <img
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.title}
                    onClick={() => setIsZoomed(!isZoomed)}
                    className={`max-h-[65vh] w-auto object-contain rounded-lg shadow-2xl transition-all ${
                      lightboxTone === 'high_contrast' ? 'contrast-150 grayscale' :
                      lightboxTone === 'sepia' ? 'sepia contrast-110' : ''
                    }`}
                  />
                </div>

                {/* Bottom Canvas Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-y-0 -translate-x-1/2 flex items-center gap-2 bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-stone-800 text-xs">
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-1.5 text-stone-300 hover:text-white transition-colors"
                    title={isZoomed ? "Zoom Out" : "Zoom In"}
                  >
                    {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                  </button>

                  <span className="w-px h-4 bg-stone-800" />

                  {/* Archival Print Tone Selector */}
                  <div className="flex items-center gap-1 text-[11px] font-mono text-stone-400">
                    <span>Tone:</span>
                    <button
                      onClick={() => setLightboxTone('original')}
                      className={`px-2 py-0.5 rounded ${lightboxTone === 'original' ? 'bg-stone-700 text-white font-bold' : 'hover:text-white'}`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setLightboxTone('high_contrast')}
                      className={`px-2 py-0.5 rounded ${lightboxTone === 'high_contrast' ? 'bg-stone-700 text-white font-bold' : 'hover:text-white'}`}
                    >
                      High-Contrast B&W
                    </button>
                    <button
                      onClick={() => setLightboxTone('sepia')}
                      className={`px-2 py-0.5 rounded ${lightboxTone === 'sepia' ? 'bg-stone-700 text-white font-bold' : 'hover:text-white'}`}
                    >
                      Sepia
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT PANE: CURATORIAL DOCKET & ARCHIVAL RECORD */}
              <div className="lg:w-[420px] bg-stone-900 border-t lg:border-t-0 lg:border-l border-stone-800 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[45vh] lg:max-h-[92vh] space-y-6">
                
                <div className="space-y-5">
                  {/* Accession & Year Kicker */}
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400 pb-3 border-b border-stone-800">
                    <span className="text-amber-400 font-bold">{selectedPhoto.accessionNumber}</span>
                    <span>{selectedPhoto.dateString}</span>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-white leading-tight">
                      {language !== 'en' && selectedPhoto.titleLocal?.[language]
                        ? selectedPhoto.titleLocal[language]
                        : selectedPhoto.title}
                    </h2>
                    {language !== 'en' && (
                      <p className="text-xs text-stone-400 mt-1 italic font-serif">
                        {selectedPhoto.title}
                      </p>
                    )}
                  </div>

                  {/* SECTION 1: VERIFIED SOURCE INFORMATION */}
                  <div className="space-y-4 border-b border-stone-800 pb-5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>SOURCE INFORMATION & PROVENANCE</span>
                    </div>

                    {/* Curatorial Annotation */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold">
                        Curatorial Annotation
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
                        {language !== 'en' && selectedPhoto.captionLocal?.[language]
                          ? selectedPhoto.captionLocal[language]
                          : selectedPhoto.caption}
                      </p>
                    </div>

                    {/* Archival Technical Metadata */}
                    <div className="space-y-1.5 text-xs font-mono text-stone-400 pt-2 border-t border-stone-800/80">
                      <div className="flex justify-between py-1">
                        <span className="text-stone-500">Accession No:</span>
                        <span className="text-stone-200 text-right">{selectedPhoto.accessionNumber}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-stone-500">Location:</span>
                        <span className="text-stone-200 text-right">{selectedPhoto.location}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-stone-500">Medium & Technique:</span>
                        <span className="text-stone-200 text-right">{selectedPhoto.medium || 'Gelatin silver print'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-stone-500">Dimensions:</span>
                        <span className="text-stone-200 text-right tabular-nums">{selectedPhoto.dimensions || '25.4 × 20.3 cm'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-stone-500">Archive Provenance:</span>
                        <span className="text-stone-200 text-right">{selectedPhoto.archiveProvenance}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-stone-500">Photographer / Agency:</span>
                        <span className="text-stone-200 text-right">{selectedPhoto.photographerOrAgency}</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: AI-GENERATED EXPLANATION & RESEARCH CONTEXT */}
                  <div className="space-y-3 bg-stone-950/70 p-4 rounded-2xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>AI-GENERATED SCHOLARLY EXPLANATION</span>
                      </h4>
                      <span className="text-[9px] font-mono text-stone-400 border border-stone-800 px-1.5 py-0.5 rounded">
                        Grounded in BAWS
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed font-sans">
                      {selectedPhoto.historicalContext}
                    </p>
                    <div className="text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-800/80">
                      Analysis generated by Babasaheb AI Scholar cross-referenced against historical archives.
                    </div>
                  </div>

                  {/* Linked Primary Archive Documents */}
                  {selectedPhoto.relatedDocIds && selectedPhoto.relatedDocIds.length > 0 && onOpenDocument && (
                    <div className="pt-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold mb-2">
                        Connected Archival Text
                      </h4>
                      {selectedPhoto.relatedDocIds.map((docId) => {
                        const doc = ARCHIVE_DOCUMENTS.find(d => d.id === docId);
                        if (!doc) return null;
                        return (
                          <button
                            key={doc.id}
                            onClick={() => {
                              setSelectedPhoto(null);
                              onOpenDocument(doc);
                            }}
                            className="w-full text-left p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-mono text-amber-400 block">{doc.categoryLabel}</span>
                              <span className="text-xs font-medium text-stone-200 group-hover:text-white line-clamp-1">
                                {doc.title}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 shrink-0 ml-2" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* Bottom Actions: Copy Citation & Ask AI */}
                <div className="pt-4 border-t border-stone-800 flex flex-col gap-2">
                  <button
                    onClick={() => handleCopyCitation(selectedPhoto)}
                    className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedCitationId === selectedPhoto.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Citation Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-stone-400" />
                        <span>Copy Academic Citation</span>
                      </>
                    )}
                  </button>

                  {onAskAIWithPhoto && (
                    <button
                      onClick={() => {
                        setSelectedPhoto(null);
                        onAskAIWithPhoto(`Provide detailed historical context on the photograph: "${selectedPhoto.title}" (${selectedPhoto.year}, ${selectedPhoto.location}).`);
                      }}
                      className="w-full py-2 px-4 text-stone-400 hover:text-white text-xs font-sans transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F3E4C9]" />
                      <span className="font-montserrat font-bold text-[#F3E4C9]">Ask Babasaheb AI Scholar about this event</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
