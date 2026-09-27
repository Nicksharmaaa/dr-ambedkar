'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Maximize2, Minimize2, Sparkles, Compass, ShieldCheck, 
  Layers, Info, ListFilter, AlertCircle, RefreshCw,
  Scale, BookOpen, Flame, Globe, X
} from 'lucide-react';
import { 
  Graph3DData, Graph3DNode, Graph3DLink, FilterCategory, ConnectedEntitySummary,
} from './types';
import { GraphSearch } from './GraphSearch';
import { GraphLegend } from './GraphLegend';
import { AccessibleEntityList } from './AccessibleEntityList';
import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_LINKS } from '@/data/archiveData';
import { ArchivalDocument, Language } from '@/types/museum';
import { api } from '@/lib/api';
import { soundEffects } from '@/utils/soundEffects';

// Dynamic import with SSR disabled for Three.js WebGL compatibility
const Graph3DCanvas = dynamic(
  () => import('./Graph3DCanvas').then((mod) => mod.Graph3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] flex flex-col items-center justify-center bg-[#FAF7F0] text-[#0A2947] space-y-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#C59A45] border-t-transparent animate-spin" />
        <div className="font-mono text-xs text-[#8B5E3C] tracking-widest uppercase font-bold">
          Initializing 3D Archival Universe...
        </div>
      </div>
    ),
  }
);

interface KnowledgeGraph3DProps {
  language?: Language;
  onOpenDocument?: (doc: ArchivalDocument) => void;
  onAskAI?: (query: string) => void;
  kidMode?: boolean;
  isImmersive?: boolean;
  onToggleImmersive?: () => void;
}

// Clean, human-understandable UI dictionary across all supported languages
const UI_STRINGS: Record<Language, {
  brand: string;
  entities: string;
  all: string;
  categories: Record<string, string>;
  searchPlaceholder: string;
  directory: string;
  zoomIn: string;
  resetView: string;
  orbit: string;
  orbitStart: string;
  orbitPause: string;
  soundMute: string;
  soundUnmute: string;
  expand: string;
  exit: string;
  tours: string;
  viewing: string;
  connections: string;
  clear: string;
  hint: string;
  verified: string;
}> = {
  en: {
    brand: 'Ambedkar Universe',
    entities: 'Entities',
    all: 'All',
    categories: {
      person: 'People',
      work: 'Books & Works',
      organization: 'Institutions',
      event: 'Movements & Events',
      concept: 'Philosophy',
      place: 'Historic Places',
      media: 'Speeches',
    },
    searchPlaceholder: 'Search universe...',
    directory: 'Entity Directory',
    zoomIn: 'Zoom In',
    resetView: 'Reset View',
    orbit: 'Orbit',
    orbitStart: 'Start Orbit',
    orbitPause: 'Pause Orbit',
    soundMute: 'Mute Ambience',
    soundUnmute: 'Unmute Ambience',
    expand: 'Expand',
    exit: 'Exit',
    tours: 'Tours →',
    viewing: 'Viewing:',
    connections: 'connections',
    clear: 'Clear',
    hint: 'Drag to rotate · Scroll to zoom · Click sphere to inspect',
    verified: 'BAWS Verified Corpus',
  },
  hi: {
    brand: 'आंबेडकर ज्ञान विश्व',
    entities: 'प्रमाणित प्रविष्टियां',
    all: 'सभी',
    categories: {
      person: 'व्यक्तित्व',
      work: 'ग्रंथ एवं रचनाएं',
      organization: 'संस्थाएं',
      event: 'आंदोलन एवं घटनाएं',
      concept: 'दर्शन एवं विचार',
      place: 'ऐतिहासिक स्थल',
      media: 'भाषण एवं पत्रिकाएं',
    },
    searchPlaceholder: 'ज्ञान विश्व में खोजें...',
    directory: 'सूची निर्देशिका',
    zoomIn: 'ज़ूम करें',
    resetView: 'रीसेट करें',
    orbit: 'भ्रमण',
    orbitStart: 'भ्रमण प्रारंभ',
    orbitPause: 'भ्रमण रोकें',
    soundMute: 'ध्वनि बंद',
    soundUnmute: 'ध्वनि चालू',
    expand: 'विस्तार',
    exit: 'बाहर',
    tours: 'भ्रमण पथ →',
    viewing: 'प्रदर्शित:',
    connections: 'संबंध',
    clear: 'हटाएं',
    hint: 'घुमाने के लिए खींचें · ज़ूम करने के लिए स्क्रॉल करें · विवरण के लिए क्लिक करें',
    verified: 'बीएडब्ल्यूएस प्रमाणित',
  },
  mr: {
    brand: 'आंबेडकर ज्ञान विश्व',
    entities: 'प्रमाणित नोंदी',
    all: 'सर्व',
    categories: {
      person: 'व्यक्ती',
      work: 'ग्रंथ आणि लेखन',
      organization: 'संस्था',
      event: 'चळवळी आणि घटना',
      concept: 'तत्वज्ञान आणि विचार',
      place: 'ऐतिहासिक ठिकाणे',
      media: 'भाषणे आणि नियतकालिके',
    },
    searchPlaceholder: 'ज्ञान विश्वात शोधा...',
    directory: 'सूची निर्देशिका',
    zoomIn: 'झूम करा',
    resetView: 'रीसेट करा',
    orbit: 'भ्रमण',
    orbitStart: 'भ्रमण सुरू',
    orbitPause: 'भ्रमण थांबवा',
    soundMute: 'आवाज बंद',
    soundUnmute: 'आवाज चालू',
    expand: 'विस्तार',
    exit: 'बाहेर',
    tours: 'मार्गदर्शित फेरफटका →',
    viewing: 'पाहत आहात:',
    connections: 'जोडण्या',
    clear: 'हटवा',
    hint: 'फिरवण्यासाठी ड्रॅग करा · झूम करण्यासाठी स्क्रोल करा · पाहण्यासाठी क्लिक करा',
    verified: 'बीएडब्ल्यूएस प्रमाणित',
  },
};

// Guided Perspectives with clean vector icons and localized titles
const GUIDED_PERSPECTIVES = [
  {
    id: 'constitution',
    title: {
      en: 'Constitution & Law',
      hi: 'संविधान एवं कानून',
      mr: 'संविधान आणि कायदा',
    },
    iconType: 'scale' as const,
    anchorId: 'node-constitution',
    fallbackId: 'node-drafting-committee',
    searchKey: 'constitution',
    desc: {
      en: 'Constituent Assembly & Constitutional Philosophy',
      hi: 'संविधान सभा एवं दर्शन',
      mr: 'संविधान सभा आणि तत्त्वज्ञान',
    },
  },
  {
    id: 'treatises',
    title: {
      en: 'Books & Writings',
      hi: 'प्रमुख ग्रंथ एवं पुस्तकें',
      mr: 'प्रमुख ग्रंथ आणि पुस्तके',
    },
    iconType: 'book' as const,
    anchorId: 'node-annihilation',
    fallbackId: 'node-castes-in-india',
    searchKey: 'annihilation',
    desc: {
      en: 'Annihilation of Caste & The Problem of the Rupee',
      hi: 'जाति का विनाश एवं प्रमुख कृतियां',
      mr: 'जातीचे निर्मूलन व प्रमुख ग्रंथ',
    },
  },
  {
    id: 'movements',
    title: {
      en: 'Historic Movements',
      hi: 'ऐतिहासिक आंदोलन',
      mr: 'ऐतिहासिक चळवळी',
    },
    iconType: 'flame' as const,
    anchorId: 'node-mahad-satyagraha',
    fallbackId: 'node-kalaram-temple',
    searchKey: 'mahad',
    desc: {
      en: 'Mahad Satyagraha & Civil Rights Struggles',
      hi: 'महाड सत्याग्रह एवं नागरिक अधिकार',
      mr: 'महाड सत्याग्रह व नागरी हक्क',
    },
  },
  {
    id: 'education',
    title: {
      en: 'Education & Global Roots',
      hi: 'शिक्षा एवं वैश्विक यात्रा',
      mr: 'शिक्षण आणि जागतिक वारसा',
    },
    iconType: 'globe' as const,
    anchorId: 'node-columbia',
    fallbackId: 'node-lse',
    searchKey: 'columbia',
    desc: {
      en: 'Columbia University, John Dewey & LSE',
      hi: 'कोलंबिया विश्वविद्यालय एवं एलएसई',
      mr: 'कोलंबिया विद्यापीठ व एलएसई',
    },
  },
];

export const KnowledgeGraph3D: React.FC<KnowledgeGraph3DProps> = ({
  language = 'en',
  onOpenDocument,
  onAskAI,
  kidMode = false,
  isImmersive: propIsImmersive,
  onToggleImmersive: propOnToggleImmersive,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);

  // Layout & Container Dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 750,
  });

  // State Management
  const [internalIsImmersive, setInternalIsImmersive] = useState<boolean>(false);
  const isImmersive = propIsImmersive !== undefined ? propIsImmersive : internalIsImmersive;

  const [selectedNode, setSelectedNode] = useState<Graph3DNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Graph3DNode | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isAccessibleListOpen, setIsAccessibleListOpen] = useState<boolean>(false);
  const [is2HopExpanded, setIs2HopExpanded] = useState<boolean>(false);
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Data Loading State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawNodes, setRawNodes] = useState<Graph3DNode[]>([]);
  const [rawLinks, setRawLinks] = useState<Graph3DLink[]>([]);


  const handleToggleSound = useCallback(() => {
    const muted = soundEffects.toggleSound();
    setIsSoundMuted(muted);
  }, []);

  // 1. Initial Data Fetch & Enrichment
  const loadGraphData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Map curated archive nodes into 3D structure
      const nodeMap = new Map<string, Graph3DNode>();

      KNOWLEDGE_GRAPH_NODES.forEach((n) => {
        const isCenter = n.id === 'person-ambedkar' || n.id === 'node-ambedkar';
        nodeMap.set(n.id, {
          id: n.id,
          label: n.label,
          category: n.category,
          shortDesc: n.shortDesc,
          year: n.year,
          date: n.date,
          linkedDocId: n.linkedDocId,
          imageUrl: n.imageUrl,
          significance: n.significance,
          keyFacts: n.keyFacts,
          historicalContext: n.historicalContext,
          whyItMatters: n.whyItMatters,
          cluster: n.cluster,
          color: n.color || '#C5A880',
          aliases: n.aliases,
          bawsVolume: n.bawsVolume,
          provenanceCitation: n.provenanceCitation,
          status: 'VERIFIED',
          degree: 0,
          isCenter,
        });
      });

      // Map curated links
      const linkMap = new Map<string, Graph3DLink>();

      KNOWLEDGE_GRAPH_LINKS.forEach((l) => {
        linkMap.set(l.id, {
          id: l.id,
          source: l.sourceId,
          target: l.targetId,
          relation: l.relation,
          confidence: 1.0,
          status: 'VERIFIED',
          has_evidence: true,
          notes: l.notes,
        });
      });

      // Try fetching live neighborhood from the backend to integrate dynamically
      try {
        const liveNeighborhood = await api.getGraphNeighborhood('person-ambedkar', 1, 50);
        if (liveNeighborhood && liveNeighborhood.nodes && liveNeighborhood.nodes.length > 0) {
          // Merge live nodes into map if any additional exist
          liveNeighborhood.nodes.forEach((cn) => {
            const d = cn.data;
            if (!nodeMap.has(d.id)) {
              nodeMap.set(d.id, {
                id: d.id,
                label: d.label,
                category: d.type || 'concept',
                shortDesc: (d as any).short_desc || d.description || `Verified archival entity in Ambedkar Heritage graph.`,
                significance: (d as any).significance || d.description || 'Archival concept verified in BAWS documentation.',
                year: d.year || undefined,
                color: '#3D5A80',
                status: d.status || 'VERIFIED',
                degree: d.degree || 1,
                isCenter: false,
              });
            }
          });

          // Merge live edges
          if (liveNeighborhood.edges) {
            liveNeighborhood.edges.forEach((ce) => {
              const ed = ce.data;
              if (!linkMap.has(ed.id)) {
                linkMap.set(ed.id, {
                  id: ed.id,
                  source: ed.source,
                  target: ed.target,
                  relation: ed.label || 'connected to',
                  confidence: ed.confidence,
                  status: ed.status,
                  has_evidence: ed.has_evidence,
                });
              }
            });
          }
        }
      } catch (backendErr) {
        console.warn('Backend live graph neighborhood call skipped, using curated archival corpus:', backendErr);
      }

      // Compute degrees
      const allLinks = Array.from(linkMap.values());
      const allNodes = Array.from(nodeMap.values());

      allLinks.forEach((l) => {
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        const sNode = nodeMap.get(sId);
        const tNode = nodeMap.get(tId);
        if (sNode) sNode.degree = (sNode.degree || 0) + 1;
        if (tNode) tNode.degree = (tNode.degree || 0) + 1;
      });

      setRawNodes(allNodes);
      setRawLinks(allLinks);
      // Start in open celestial overview mode (uncluttered)
      setSelectedNode(null);
    } catch (err: any) {
      console.error('Failed to load knowledge graph data:', err);
      setError(err?.message || 'Knowledge Graph data could not be initialized.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);


  // 2. Measure Container Dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (isImmersive) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 1200,
          height: Math.max(650, rect.height || 750),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isImmersive]);

  // 3. Escape key & Fullscreen sync listener to exit immersive mode or deselect node
  useEffect(() => {
    const exitImmersive = () => {
      if (propOnToggleImmersive) {
        propOnToggleImmersive();
      } else {
        setInternalIsImmersive(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAccessibleListOpen) {
          setIsAccessibleListOpen(false);
        } else if (selectedNode) {
          setSelectedNode(null);
        } else if (isImmersive) {
          exitImmersive();
          if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isImmersive) {
        exitImmersive();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isImmersive, selectedNode, isAccessibleListOpen]);

  // 4. Category Filter Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { total: rawNodes.length };
    rawNodes.forEach((n) => {
      const cat = n.category?.toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [rawNodes]);

  // 5. Filtered 3D Graph Data
  const filteredData = useMemo<Graph3DData>(() => {
    let nodes = rawNodes;

    if (activeCategory !== 'ALL') {
      nodes = rawNodes.filter((n) => {
        if (n.isCenter) return true; // Keep center anchor
        if (activeCategory === 'work') {
          return n.category === 'work' || n.category === 'book' || n.category === 'document';
        }
        return n.category === activeCategory;
      });
    }

    const nodeIds = new Set(nodes.map((n) => n.id));

    const links = rawLinks.filter((l) => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return nodeIds.has(sId) && nodeIds.has(tId);
    });

    return { nodes, links };
  }, [rawNodes, rawLinks, activeCategory]);

  // 6. Highlighted 1-hop Connections for Selected Node
  const { highlightedNodeIds, highlightedLinkIds, connectedEntities } = useMemo(() => {
    const hNodes = new Set<string>();
    const hLinks = new Set<string>();
    const connSummaries: ConnectedEntitySummary[] = [];

    if (!selectedNode) {
      return {
        highlightedNodeIds: hNodes,
        highlightedLinkIds: hLinks,
        connectedEntities: connSummaries,
      };
    }

    hNodes.add(selectedNode.id);

    rawLinks.forEach((l) => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;

      if (sId === selectedNode.id) {
        hNodes.add(tId);
        hLinks.add(l.id);
        const otherNode = rawNodes.find((n) => n.id === tId);
        if (otherNode) {
          connSummaries.push({
            node: otherNode,
            relation: l.relation || 'connected to',
            isOutgoing: true,
          });
        }
      } else if (tId === selectedNode.id) {
        hNodes.add(sId);
        hLinks.add(l.id);
        const otherNode = rawNodes.find((n) => n.id === sId);
        if (otherNode) {
          connSummaries.push({
            node: otherNode,
            relation: l.relation || 'connected from',
            isOutgoing: false,
          });
        }
      }
    });

    return {
      highlightedNodeIds: hNodes,
      highlightedLinkIds: hLinks,
      connectedEntities: connSummaries,
    };
  }, [selectedNode, rawLinks, rawNodes]);

  // 7. Smooth Orbital Camera Fly-to on Node Selection (Preserves line-of-sight)
  const flyToNode = useCallback(
    (node: Graph3DNode, addToHistory = true) => {
      if (addToHistory && selectedNode && selectedNode.id !== node.id) {
        setHistoryStack((prev) => [...prev, selectedNode.id]);
      }

      setSelectedNode(node);
      setAutoRotate(false);
      soundEffects.playNodeSelectSound();
      // NOTE: Do NOT call fgRef.current.selectEntity() here.
      // Graph3DCanvas's useEffect watches selectedNode and calls selectEntity() automatically.
      // Calling it here too would cause a double-trigger loop.
    },
    [selectedNode]
  );

  const handleBackgroundClick = useCallback(() => {
    if (selectedNode) {
      setSelectedNode(null);
      soundEffects.playTactileChime();
      // NOTE: Do NOT call fgRef.current.deselect() here.
      // Graph3DCanvas's useEffect watches selectedNode (null) and calls sceneRef.current.deselect() automatically.
    }
  }, [selectedNode]);

  const handleSelectTour = useCallback(
    (tour: typeof GUIDED_PERSPECTIVES[0]) => {
      soundEffects.playLineageTransition();
      const targetNode =
        rawNodes.find((n) => n.id === tour.anchorId) ||
        rawNodes.find((n) => n.id === tour.fallbackId) ||
        rawNodes.find((n) => n.label.toLowerCase().includes(tour.searchKey.toLowerCase()));
      if (targetNode) {
        flyToNode(targetNode, true);
      }
    },
    [rawNodes, flyToNode]
  );

  const handleNavigateHistoryBack = useCallback(() => {
    if (historyStack.length === 0) return;
    const prevId = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    const prevNode = rawNodes.find((n) => n.id === prevId);
    if (prevNode) {
      flyToNode(prevNode, false);
    }
  }, [historyStack, rawNodes, flyToNode]);

  // 8. Navigation Handlers
  const handleZoomIn = () => {
    if (fgRef.current && fgRef.current.zoomIn) {
      fgRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current && fgRef.current.zoomOut) {
      fgRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    setSelectedNode(null);
    if (fgRef.current && fgRef.current.resetView) {
      fgRef.current.resetView();
    }
  };

  const handleFitGraph = () => {
    if (fgRef.current && fgRef.current.fitGraph) {
      fgRef.current.fitGraph();
    }
  };

  const handleToggleImmersive = () => {
    if (propOnToggleImmersive) {
      propOnToggleImmersive();
    } else {
      setInternalIsImmersive((prev) => !prev);
    }
  };

  const currentLang = (['en', 'hi', 'mr'].includes(language) ? language : 'en') as Language;
  const t = UI_STRINGS[currentLang] || UI_STRINGS.en;

  const getTourIcon = (type: 'scale' | 'book' | 'flame' | 'globe') => {
    switch (type) {
      case 'scale':
        return <Scale className="w-3.5 h-3.5 text-[#C59A45]" />;
      case 'book':
        return <BookOpen className="w-3.5 h-3.5 text-[#0A2947]" />;
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-[#B91C1C]" />;
      case 'globe':
        return <Globe className="w-3.5 h-3.5 text-[#0D6E57]" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden transition-all duration-500 ${
        isImmersive
          ? 'w-full h-full m-0 rounded-none bg-[#FAF7F0]'
          : 'h-[780px] sm:h-[860px] rounded-3xl border border-[#D3D4C0]/80 shadow-2xl bg-[#FAF7F0]'
      }`}
    >
      {/* Top Unified Control Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div
          className="pointer-events-auto flex items-center gap-0 border-b border-[#D3D4C0]/60"
          style={{
            background: 'rgba(250, 247, 240, 0.92)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Brand pill */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-r border-[#D3D4C0]/60 shrink-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#0A2947] to-[#8B5E3C] flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-3 h-3 text-[#F3E4C9]" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xs font-serif font-bold text-[#0A2947] tracking-wide leading-none">{t.brand}</h1>
              <p className="text-[9px] font-mono text-[#8B5E3C] tracking-widest uppercase mt-0.5">{rawNodes.length} {t.entities}</p>
            </div>
          </div>

          {/* Category Filters — scrollable tabs */}
          <div className="flex-1 flex items-center gap-0.5 px-2 overflow-x-auto scrollbar-none">
            {(
              [
                { id: 'ALL' as const,          color: '#C59A45' },
                { id: 'person' as const,       color: '#8B5E3C' },
                { id: 'work' as const,         color: '#0A2947' },
                { id: 'organization' as const, color: '#0D6E57' },
                { id: 'event' as const,        color: '#B91C1C' },
                { id: 'concept' as const,      color: '#B45309' },
                { id: 'place' as const,        color: '#6D28D9' },
                { id: 'media' as const,        color: '#C2410C' },
              ] as const
            ).map((cat) => {
              const count = cat.id === 'ALL'
                ? categoryCounts.total
                : (categoryCounts[cat.id] ?? 0);
              const isActive = activeCategory === cat.id;
              const catLabel = cat.id === 'ALL' ? t.all : (t.categories[cat.id] || cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#0A2947] text-white shadow-xs'
                      : 'text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#F0EDE4]'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{catLabel}</span>
                  {count > 0 && (
                    <span className={`text-[9px] px-1 rounded ${isActive ? 'text-white/80 bg-white/20' : 'text-[#0A2947]/50 bg-[#0A2947]/5'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right controls group */}
          <div className="flex items-center gap-1 px-2 border-l border-[#D3D4C0]/60 shrink-0">
            {/* Search */}
            <GraphSearch
              nodes={rawNodes}
              onSelectNode={(n) => flyToNode(n, true)}
              selectedNodeId={selectedNode?.id || null}
            />

            {/* Divider */}
            <div className="w-px h-5 bg-[#D3D4C0]/80 mx-1" />

            {/* Directory */}
            <button
              onClick={() => setIsAccessibleListOpen(true)}
              className="p-2 rounded-lg text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#F0EDE4] transition-all cursor-pointer"
              title={t.directory}
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>

            {/* Zoom In */}
            <button onClick={handleZoomIn} className="p-2 rounded-lg text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#F0EDE4] transition-all cursor-pointer" title={t.zoomIn}>
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Reset */}
            <button onClick={handleResetView} className="p-2 rounded-lg text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#F0EDE4] transition-all cursor-pointer" title={t.resetView}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Orbit toggle */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                autoRotate ? 'bg-[#FAF7F0] text-[#8B5E3C] border border-[#D3D4C0]/80 shadow-2xs' : 'text-[#0A2947]/60 hover:bg-[#F0EDE4]'
              }`}
              title={autoRotate ? t.orbitPause : t.orbitStart}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoRotate ? 'bg-[#8B5E3C] animate-pulse' : 'bg-[#0A2947]/30'}`} />
              <span className="hidden md:inline uppercase tracking-wider">{t.orbit}</span>
            </button>

            {/* Sound */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isSoundMuted ? 'text-[#0A2947]/30' : 'text-[#0A2947]/70 hover:text-[#0A2947] hover:bg-[#F0EDE4]'
              }`}
              title={isSoundMuted ? t.soundUnmute : t.soundMute}
            >
              {isSoundMuted
                ? <Info className="w-3.5 h-3.5" />
                : <Sparkles className="w-3.5 h-3.5" />}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-[#D3D4C0]/80 mx-1" />

            {/* Immersive / Exit */}
            <button
              onClick={handleToggleImmersive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer shadow-xs ${
                isImmersive
                  ? 'bg-[#0A2947] text-white hover:bg-[#123B60]'
                  : 'bg-[#0A2947] text-[#FAF7F0] hover:bg-[#123B60]'
              }`}
              title={isImmersive ? t.exit : t.expand}
            >
              {isImmersive
                ? <><Minimize2 className="w-3.5 h-3.5" /><span className="hidden sm:inline uppercase">{t.exit}</span></>
                : <><Maximize2 className="w-3.5 h-3.5" /><span className="hidden sm:inline uppercase">{t.expand}</span></>}
            </button>
          </div>
        </div>

        {/* Secondary Row: Curated Tours OR Active Selection Banner */}
        <div
          className="pointer-events-auto flex items-center justify-center px-4 py-1.5 gap-2 border-b border-[#D3D4C0]/40"
          style={{ background: 'rgba(250, 247, 240, 0.75)', backdropFilter: 'blur(12px)' }}
        >
          {selectedNode ? (
            /* Active Lineage Banner */
            <div className="flex items-center gap-2 text-xs font-mono animate-in fade-in duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C59A45] animate-pulse shrink-0" />
              <span className="text-[#8B5E3C] font-bold uppercase tracking-wider text-[10px]">{t.viewing}</span>
              <span className="font-bold text-[#0A2947]">{selectedNode.label}</span>
              <span className="text-[#0A2947]/60 text-[10px]">· {connectedEntities.length} {t.connections}</span>
              <button
                onClick={handleBackgroundClick}
                className="ml-1 px-2 py-0.5 rounded-md bg-[#0A2947]/8 hover:bg-[#0A2947]/15 border border-[#D3D4C0]/60 text-[#0A2947] font-semibold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>{t.clear}</span>
              </button>
            </div>
          ) : (
            /* Curated Tours */
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#8B5E3C]/80 font-bold hidden lg:inline shrink-0">{t.tours}</span>
              {GUIDED_PERSPECTIVES.map((tour) => (
                <button
                  key={tour.id}
                  onClick={() => handleSelectTour(tour)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white border border-[#D3D4C0]/60 hover:border-[#C59A45]/60 text-[10px] font-mono font-semibold text-[#0A2947] transition-all cursor-pointer shadow-2xs"
                  title={tour.desc[currentLang] || tour.desc.en}
                >
                  <span>{getTourIcon(tour.iconType)}</span>
                  <span className="hidden sm:inline">{tour.title[currentLang] || tour.title.en}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 border-t border-[#D3D4C0]/50 pointer-events-none"
        style={{ background: 'rgba(250, 247, 240, 0.85)', backdropFilter: 'blur(12px)' }}
      >
        {/* Legend + Hint */}
        <div className="flex items-center gap-3">
          <div className="pointer-events-auto">
            <GraphLegend />
          </div>
          <span className="text-[10px] font-mono text-[#0A2947]/60 hidden sm:inline select-none">
            {t.hint}
          </span>
        </div>

        {/* Verified badge */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">{t.verified}</span>
        </div>
      </div>

      {/* 3D WebGL Canvas Layer */}
      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#0A2947] space-y-4 bg-[#FAF7F0]">
          <AlertCircle className="w-12 h-12 text-rose-700" />
          <h2 className="text-xl font-serif font-bold text-[#0A2947]">Knowledge Graph Unavailable</h2>
          <p className="text-xs text-[#0A2947]/70 max-w-md">{error}</p>
          <button
            onClick={loadGraphData}
            className="px-4 py-2 rounded-xl bg-[#0A2947] hover:bg-[#123B60] text-[#FAF7F0] font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        <Graph3DCanvas
          data={filteredData}
          selectedNodeId={selectedNode?.id || null}
          hoveredNodeId={hoveredNode?.id || null}
          onSelectNode={(n) => flyToNode(n, true)}
          onHoverNode={setHoveredNode}
          onBackgroundClick={handleBackgroundClick}
          autoRotate={autoRotate}
          highlightedNodeIds={highlightedNodeIds}
          highlightedLinkIds={highlightedLinkIds}
          dimensions={dimensions}
          fgRef={fgRef}
          onOpenDocument={onOpenDocument}
          onAskAI={onAskAI}
        />
      )}

      {/* Screen-Reader Accessible Entity Directory */}
      {isAccessibleListOpen && (
        <AccessibleEntityList
          nodes={rawNodes}
          onSelectNode={(n) => flyToNode(n, true)}
          onOpenDocument={onOpenDocument}
          onClose={() => setIsAccessibleListOpen(false)}
        />
      )}

    </div>
  );
};
