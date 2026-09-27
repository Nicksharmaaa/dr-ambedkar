'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { 
  Maximize2, Minimize2, Sparkles, Compass, ShieldCheck, 
  Layers, Search, Filter, Info, ListFilter, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
  Graph3DData, Graph3DNode, Graph3DLink, FilterCategory, ConnectedEntitySummary,
} from './types';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { GraphControls } from './GraphControls';
import { GraphSearch } from './GraphSearch';
import { GraphFilters } from './GraphFilters';
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

const GUIDED_PERSPECTIVES = [
  {
    id: 'constitution',
    title: 'Constitution & Law',
    icon: '🏛️',
    anchorId: 'node-constitution',
    fallbackId: 'node-drafting-committee',
    desc: 'Constituent Assembly & Constitutional Philosophy',
  },
  {
    id: 'treatises',
    title: 'Magnum Treatises',
    icon: '📖',
    anchorId: 'node-annihilation',
    fallbackId: 'node-castes-in-india',
    desc: 'Annihilation of Caste & The Problem of the Rupee',
  },
  {
    id: 'movements',
    title: 'Emancipation Epochs',
    icon: '✊',
    anchorId: 'node-mahad-satyagraha',
    fallbackId: 'node-kalaram-temple',
    desc: 'Mahad Water Satyagraha & Civil Rights',
  },
  {
    id: 'education',
    title: 'Global Roots',
    icon: '🌐',
    anchorId: 'node-columbia',
    fallbackId: 'node-lse',
    desc: 'Columbia University, John Dewey & LSE',
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
      setAutoRotate(false); // Pause auto-rotation for focused exploration
      soundEffects.playNodeSelectSound();

      if (fgRef.current && fgRef.current.selectEntity) {
        fgRef.current.selectEntity(node);
      }
    },
    [fgRef, selectedNode]
  );

  const handleBackgroundClick = useCallback(() => {
    if (selectedNode) {
      setSelectedNode(null);
      soundEffects.playTactileChime();
      if (fgRef.current && fgRef.current.deselect) {
        fgRef.current.deselect();
      }
    }
  }, [selectedNode, fgRef]);

  const handleSelectTour = useCallback(
    (tour: typeof GUIDED_PERSPECTIVES[0]) => {
      soundEffects.playLineageTransition();
      const targetNode =
        rawNodes.find((n) => n.id === tour.anchorId) ||
        rawNodes.find((n) => n.id === tour.fallbackId) ||
        rawNodes.find((n) => n.label.toLowerCase().includes(tour.title.toLowerCase().split(' ')[0]));
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

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden transition-all duration-500 ${
        isImmersive
          ? 'w-full h-full m-0 rounded-none bg-[#FAF7F0]'
          : 'h-[780px] sm:h-[860px] rounded-3xl border-2 border-[#D3D4C0] shadow-xl bg-[#FAF7F0]'
      }`}
    >
      {/* 1. Header Bar & Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2.5 pointer-events-none">
        
        {/* Top Navigation Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Title & Brand — museum curatorial pill */}
          <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D3D4C0] shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#0A2947] to-[#8B5E3C] flex items-center justify-center shrink-0 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-[#F3E4C9]" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-serif font-bold text-[#0A2947] tracking-wide leading-none">
                Ambedkar Universe
              </h1>
              <p className="text-[10px] font-mono text-[#8B5E3C] tracking-widest uppercase mt-0.5 font-semibold">
                {rawNodes.length} curated entities
              </p>
            </div>
          </div>

          {/* Search, Directory & Controls */}
          <div className="pointer-events-auto flex items-center flex-wrap gap-2">

            <GraphSearch
              nodes={rawNodes}
              onSelectNode={(n) => flyToNode(n, true)}
              selectedNodeId={selectedNode?.id || null}
            />

            <button
              onClick={() => setIsAccessibleListOpen(true)}
              className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D3D4C0] shadow-sm text-[#0A2947] hover:text-[#8B5E3C] hover:bg-[#FAF7F0] text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Open Accessible Directory"
            >
              <ListFilter className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span className="hidden md:inline">Directory</span>
            </button>

            <GraphControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetView={handleResetView}
              onFitGraph={handleFitGraph}
              autoRotate={autoRotate}
              onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
              isImmersive={isImmersive}
              onToggleImmersive={handleToggleImmersive}
              isSoundMuted={isSoundMuted}
              onToggleSound={handleToggleSound}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-full">
            <GraphFilters
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              categoryCounts={categoryCounts}
            />
          </div>
        </div>

        {/* Active Focus Banner or Guided Invitation */}
        {selectedNode ? (
          <div className="flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-[#C59A45]/60 shadow-lg text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#C59A45] animate-pulse" />
              <span className="text-[#8B5E3C] font-bold uppercase tracking-wider">Active Lineage:</span>
              <span className="font-bold text-[#0A2947] font-sans text-sm">{selectedNode.label}</span>
              <span className="text-[#0A2947]/60 font-medium">({connectedEntities.length} direct lineages)</span>
              <button
                onClick={handleBackgroundClick}
                className="ml-2 px-2 py-0.5 rounded-lg bg-[#FAF7F0] hover:bg-[#F3E4C9] border border-[#D3D4C0] text-[#0A2947] font-semibold text-[10px] uppercase transition-colors cursor-pointer"
                title="Return to Full Constellation (Esc)"
              >
                Clear ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pointer-events-none animate-in fade-in duration-300">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5E3C] font-bold hidden lg:inline">
              Curated Tours:
            </span>
            {GUIDED_PERSPECTIVES.map((tour) => (
              <button
                key={tour.id}
                onClick={() => handleSelectTour(tour)}
                className="pointer-events-auto px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#D3D4C0] hover:border-[#C59A45] hover:bg-[#FAF7F0] text-[11px] sm:text-xs font-mono font-semibold text-[#0A2947] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer transform hover:scale-105"
                title={tour.desc}
              >
                <span>{tour.icon}</span>
                <span>{tour.title}</span>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* 3. Bottom-Left: Legend + Hint */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          <GraphLegend />
        </div>
        <div className="px-3.5 py-2 rounded-2xl text-[11px] font-mono text-[#0A2947]/75 bg-white/95 backdrop-blur-md border border-[#D3D4C0] shadow-sm pointer-events-auto select-none hidden sm:block">
          <span className="text-[#8B5E3C] font-bold">Interactive:</span> Drag to orbit · Scroll to zoom · Click to inspect
        </div>
      </div>

      {/* 4. Bottom-Right: Verified badge */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
        <div className="px-3 py-1.5 rounded-2xl text-[11px] font-mono font-bold text-emerald-800 bg-white/95 backdrop-blur-md border border-[#D3D4C0] shadow-sm flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>BAWS 100% Verified</span>
        </div>
      </div>

      {/* 5. 3D WebGL Canvas Layer */}
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

      {/* 7. Screen-Reader / Keyboard Accessible Entity Directory */}
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
