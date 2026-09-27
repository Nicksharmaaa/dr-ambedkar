'use client';

import React from 'react';
import { 
  Landmark, BookOpen, Clock, Radio, Sparkles, 
  Camera, Network, Star, Zap, Bookmark, Search, ShieldCheck, MapPin
} from 'lucide-react';
import PillNav, { PillNavItem } from '@/components/ui/PillNav';

import { Language } from '@/types/museum';

export interface NavDestination {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface MuseumNavRailProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  savedCount?: number;
  language?: Language;
}

const NAV_LOCALIZATIONS: Record<Language, Record<string, { label: string; subtitle: string }>> = {
  en: {
    home: { label: 'Exhibition', subtitle: 'Grand Exhibition Hall' },
    archive: { label: 'The Archive', subtitle: 'BAWS Volumes 1–22' },
    search: { label: 'Search', subtitle: 'Corpus Hybrid RRF Search' },
    timeline: { label: 'Timeline', subtitle: 'Chronicle 1891–1956' },
    memorials: { label: 'Memorials', subtitle: 'Historical Geography & Map' },
    media: { label: 'Media & Voice', subtitle: 'Historical Audio & Speeches' },
    assistant: { label: 'AI Scholar', subtitle: 'Grounded Archival RAG' },
    gallery: { label: 'Folio', subtitle: 'Visual Archive & Photographs' },
    graph: { label: 'Knowledge', subtitle: '3D Semantic Lineage Graph' },
    stories: { label: 'Stories', subtitle: 'Audio-Narrative Journeys' },
    quest: { label: 'Quest', subtitle: 'Interactive Education Game' },
    collection: { label: 'Notebook', subtitle: 'Curated Archival Folio' },
    preservation: { label: 'Preservation', subtitle: 'PREMIS 3.0 & Fixity Audit' },
  },
  hi: {
    home: { label: 'प्रदर्शनी', subtitle: 'भव्य प्रदर्शनी हॉल' },
    archive: { label: 'अभिलेखागार', subtitle: 'बाबासाहेब 22 खंड समग्र वाङ्मय' },
    search: { label: 'खोजें', subtitle: 'हाइब्रिड अनुसंधान खोज' },
    timeline: { label: 'कालक्रम', subtitle: 'ऐतिहासिक जीवन-यात्रा 1891–1956' },
    memorials: { label: 'स्मारक', subtitle: 'ऐतिहासिक भूगोल एवं स्मारक मानचित्र' },
    media: { label: 'ऑडियो व भाषण', subtitle: 'ऐतिहासिक भाषण एवं ऑडियो रिकॉर्डिंग' },
    assistant: { label: 'एआई विद्वान', subtitle: 'स्रोत-प्रमाणित शोध सहायक' },
    gallery: { label: 'छायाचित्र', subtitle: 'दुर्लभ छायाचित्र एवं ऐतिहासिक दस्तावेज' },
    graph: { label: 'ज्ञान आलेख', subtitle: '3D ज्ञान संबंध एवं वैचारिक वंशवृक्ष' },
    stories: { label: 'जीवन गाथा', subtitle: 'श्रव्य-दृश्य ऐतिहासिक गाथा' },
    quest: { label: 'ज्ञान परीक्षा', subtitle: 'संवादात्मक क्विज़ एवं चुनौतियाँ' },
    collection: { label: 'शोध वही', subtitle: 'सहेजे गए दस्तावेज एवं व्यक्तिगत नोट्स' },
    preservation: { label: 'डिजिटल संरक्षण', subtitle: 'संरक्षण मानक एवं ऑडिट' },
  },
  mr: {
    home: { label: 'प्रदर्शन', subtitle: 'भव्य प्रदर्शन दालन' },
    archive: { label: 'अभिलेखागार', subtitle: 'बाबासाहेब २२ खंड समग्र वाङ्मय' },
    search: { label: 'शोध', subtitle: 'संकरित डिजिटल शोध' },
    timeline: { label: 'कालक्रम', subtitle: 'ऐतिहासिक जीवनपट १८९१–१९५६' },
    memorials: { label: 'स्मारके', subtitle: 'ऐतिहासिक भूगोल आणि नकाशा' },
    media: { label: 'ध्वनी व भाषणे', subtitle: 'ऐतिहासिक भाषणे व ध्वनीमुद्रणे' },
    assistant: { label: 'एआय विद्वान', subtitle: 'पुरावे-आधारित संशोधन सहाय्यक' },
    gallery: { label: 'छायाचित्रे', subtitle: 'दुर्लभ छायाचित्रे व ऐतिहासिक नोंदी' },
    graph: { label: 'ज्ञान आलेख', subtitle: '3D ज्ञान संबंध व वैचारिक आलेख' },
    stories: { label: 'जीवन गाथा', subtitle: 'दृकश्राव्य ऐतिहासिक जीवनगाथा' },
    quest: { label: 'ज्ञान परीक्षा', subtitle: 'संवादात्मक प्रश्नमंजूषा' },
    collection: { label: 'माझी वही', subtitle: 'जतन केलेले संदर्भ व संशोधन नोंदी' },
    preservation: { label: 'डिजिटल जतन', subtitle: 'जतन व ऑडिट प्रणाली' },
  },
};

export const NAV_DESTINATIONS: NavDestination[] = [
  { id: 'home', label: 'Exhibition', subtitle: 'Grand Exhibition Hall', icon: Landmark },
  { id: 'archive', label: 'The Archive', subtitle: 'BAWS Volumes 1–22', icon: BookOpen },
  { id: 'search', label: 'Search', subtitle: 'Corpus Hybrid RRF Search', icon: Search },
  { id: 'timeline', label: 'Timeline', subtitle: 'Chronicle 1891–1956', icon: Clock },
  { id: 'memorials', label: 'Memorials', subtitle: 'Historical Geography & Map', icon: MapPin },
  { id: 'media', label: 'Media & Voice', subtitle: 'Historical Audio & Speeches', icon: Radio },
  { id: 'assistant', label: 'AI Scholar', subtitle: 'Grounded Archival RAG', icon: Sparkles },
  { id: 'gallery', label: 'Folio', subtitle: 'Visual Archive & Photographs', icon: Camera },
  { id: 'graph', label: 'Knowledge', subtitle: '3D Semantic Lineage Graph', icon: Network },
  { id: 'stories', label: 'Stories', subtitle: 'Audio-Narrative Journeys', icon: Star },
  { id: 'quest', label: 'Quest', subtitle: 'Interactive Education Game', icon: Zap },
  { id: 'collection', label: 'Notebook', subtitle: 'Curated Archival Folio', icon: Bookmark },
  { id: 'preservation', label: 'Preservation', subtitle: 'PREMIS 3.0 & Fixity Audit', icon: ShieldCheck },
];

export const MuseumNavRail: React.FC<MuseumNavRailProps> = ({
  currentTab,
  onSelectTab,
  savedCount = 0,
  language = 'en',
}) => {
  const getHref = (id: string) => {
    switch (id) {
      case 'home': return '/';
      case 'archive': return '/archive';
      case 'graph': return '/knowledge-map';
      default: return `/${id}`;
    }
  };

  const loc = NAV_LOCALIZATIONS[language] || NAV_LOCALIZATIONS.en;

  const items: PillNavItem[] = NAV_DESTINATIONS.map((d) => {
    const itemLoc = loc[d.id] || { label: d.label, subtitle: d.subtitle };
    return {
      id: d.id,
      label: itemLoc.label,
      subtitle: itemLoc.subtitle,
      href: getHref(d.id),
      icon: d.icon,
      badge: d.id === 'collection' && savedCount > 0 ? savedCount : undefined,
      ariaLabel: `${itemLoc.label} - ${itemLoc.subtitle}`,
    };
  });

  return (
    <PillNav
      items={items}
      activeId={currentTab}
      onSelectTab={onSelectTab}
      orientation="vertical"
      baseColor="#0A2947"
      pillColor="#FAF7F0"
      hoveredPillTextColor="#C89D56"
      pillTextColor="#0A2947"
      ease="power3.easeOut"
      initialLoadAnimation={true}
      enableGooeyParticles={true}
    />
  );
};

export default MuseumNavRail;
