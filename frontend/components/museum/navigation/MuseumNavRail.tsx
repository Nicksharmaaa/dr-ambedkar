'use client';

import React from 'react';
import { 
  Landmark, BookOpen, Clock, Radio, Sparkles, 
  Camera, Network, Star, Zap, Bookmark
} from 'lucide-react';
import PillNav, { PillNavItem } from '@/components/ui/PillNav';

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
}

export const NAV_DESTINATIONS: NavDestination[] = [
  { 
    id: 'home', 
    label: 'Exhibition', 
    subtitle: 'Grand Exhibition Hall', 
    icon: Landmark 
  },
  { 
    id: 'archive', 
    label: 'The Archive', 
    subtitle: 'BAWS Volumes 1–22', 
    icon: BookOpen 
  },
  { 
    id: 'timeline', 
    label: 'Timeline', 
    subtitle: 'Chronicle 1891–1956', 
    icon: Clock 
  },
  { 
    id: 'media', 
    label: 'Media & Voice', 
    subtitle: 'Historical Audio & Speeches', 
    icon: Radio 
  },
  { 
    id: 'assistant', 
    label: 'AI Scholar', 
    subtitle: 'Grounded Archival RAG', 
    icon: Sparkles 
  },
  { 
    id: 'gallery', 
    label: 'Folio', 
    subtitle: 'Visual Archive & Photographs', 
    icon: Camera 
  },
  { 
    id: 'graph', 
    label: 'Knowledge', 
    subtitle: '3D Semantic Lineage Graph', 
    icon: Network 
  },
  { 
    id: 'stories', 
    label: 'Stories', 
    subtitle: 'Audio-Narrative Journeys', 
    icon: Star 
  },
  { 
    id: 'quest', 
    label: 'Quest', 
    subtitle: 'Interactive Education Game', 
    icon: Zap 
  },
  { 
    id: 'collection', 
    label: 'Notebook', 
    subtitle: 'Curated Archival Folio', 
    icon: Bookmark 
  },
];

export const MuseumNavRail: React.FC<MuseumNavRailProps> = ({
  currentTab,
  onSelectTab,
  savedCount = 0,
}) => {
  const items: PillNavItem[] = NAV_DESTINATIONS.map((d) => ({
    id: d.id,
    label: d.label,
    subtitle: d.subtitle,
    href: d.id === 'home' ? '/' : `/${d.id === 'archive' ? 'archive' : d.id}`,
    icon: d.icon,
    badge: d.id === 'collection' && savedCount > 0 ? savedCount : undefined,
    ariaLabel: `${d.label} - ${d.subtitle}`,
  }));

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
