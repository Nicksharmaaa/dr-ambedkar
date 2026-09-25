'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { 
  Maximize2, Minimize2, Sparkles, Compass, ShieldCheck, 
  Layers, Search, Filter, Info, ListFilter, AlertCircle, RefreshCw
} from 'lucide-react';
import { Graph3DData, Graph3DNode, Graph3DLink, FilterCategory, ConnectedEntitySummary } from './types';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { GraphControls } from './GraphControls';
import { GraphSearch } from './GraphSearch';
import { GraphFilters } from './GraphFilters';
import { GraphLegend } from './GraphLegend';
import { AccessibleEntityList } from './AccessibleEntityList';
import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_LINKS } from '@/data/archiveData';
import { ArchivalDocument, Language } from '@/types/museum';
import { api } from '@/lib/api';

// Dynamic import with SSR disabled for Three.js WebGL compatibility
const Graph3DCanvas = dynamic(
  () => import('./Graph3DCanvas').then((mod) => mod.Graph3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] flex flex-col items-center justify-center bg-[#08192A] text-[#FAF7F0] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#C89D56] border-t-transparent animate-spin" />
        <div className="font-mono text-xs text-[#C89D56] tracking-widest uppercase">
          Initializing 3D Knowledge Universe...
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

  // Data Loading State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawNodes, setRawNodes] = useState<Graph3DNode[]>([]);
  const [rawLinks, setRawLinks] = useState<Graph3DLink[]>([]);

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
          color: n.color || '#3D5A80',
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

      // Default select the central Ambedkar node for initial view
      const ambedkarNode = allNodes.find((n) => n.isCenter);
      if (ambedkarNode) {
        setSelectedNode(ambedkarNode);
      }
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

  // 7. Cinematic Camera Fly-to on Node Selection
  const flyToNode = useCallback(
    (node: Graph3DNode) => {
      setSelectedNode(node);
      setAutoRotate(false); // Stop rotation to let visitor explore

      if (fgRef.current && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        const distance = 160;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        const newPos =
          node.x || node.y || node.z
            ? { x: node.x * distRatio, y: node.y * distRatio, z: (node.z || 0) * distRatio }
            : { x: 0, y: 0, z: distance };

        fgRef.current.cameraPosition(
          newPos, // new position
          { x: node.x, y: node.y, z: node.z }, // lookAt target
          1400 // transition duration in ms
        );
      }
    },
    [fgRef]
  );

  // 8. Navigation Handlers
  const handleZoomIn = () => {
    if (fgRef.current) {
      const currentPos = fgRef.current.cameraPosition();
      fgRef.current.cameraPosition(
        { x: currentPos.x * 0.75, y: currentPos.y * 0.75, z: currentPos.z * 0.75 },
        undefined,
        600
      );
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      const currentPos = fgRef.current.cameraPosition();
      fgRef.current.cameraPosition(
        { x: currentPos.x * 1.35, y: currentPos.y * 1.35, z: currentPos.z * 1.35 },
        undefined,
        600
      );
    }
  };

  const handleResetView = () => {
    const ambedkarNode = rawNodes.find((n) => n.isCenter);
    if (ambedkarNode) {
      flyToNode(ambedkarNode);
    } else if (fgRef.current) {
      fgRef.current.cameraPosition({ x: 0, y: 0, z: 420 }, { x: 0, y: 0, z: 0 }, 1400);
    }
  };

  const handleFitGraph = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(900, 60);
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
      className={`relative w-full overflow-hidden transition-all duration-300 ${
        isImmersive
          ? 'w-full h-full bg-[#08192A] m-0 rounded-none'
          : 'h-[750px] sm:h-[820px] rounded-3xl border-2 border-[#C89D56]/40 bg-[#08192A] shadow-2xl my-6'
      }`}
    >
      {/* 1. Header Bar & Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-3 pointer-events-none">
        
        {/* Top Navigation Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Brand */}
          <div className="pointer-events-auto bg-[#0A2947]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#C89D56]/40 shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C89D56] to-[#8B5E3C] flex items-center justify-center text-[#0A2947] font-bold shadow-md">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                The Ambedkar Knowledge Universe
              </h1>
              <p className="text-[10px] font-mono text-[#C89D56] tracking-wider uppercase">
                3D Archival Lineage · {rawNodes.length} Verified Entities
              </p>
            </div>
          </div>

          {/* Search, Accessible Directory & Controls Cluster */}
          <div className="pointer-events-auto flex items-center flex-wrap gap-2">
            <GraphSearch
              nodes={rawNodes}
              onSelectNode={flyToNode}
              selectedNodeId={selectedNode?.id || null}
            />

            <button
              onClick={() => setIsAccessibleListOpen(true)}
              className="px-3 py-2 rounded-2xl bg-[#0A2947]/90 backdrop-blur-md border border-[#C89D56]/40 hover:bg-[#C89D56] hover:text-[#0A2947] text-white/90 text-xs font-mono transition-all flex items-center gap-1.5 shadow-xl cursor-pointer"
              title="Open Screen-Reader Accessible Directory"
            >
              <ListFilter className="w-3.5 h-3.5 text-[#C89D56]" />
              <span className="hidden md:inline font-semibold">Directory</span>
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
            />
          </div>
        </div>

        {/* Minimal Category Filter Pills Row */}
        <div className="flex justify-center pointer-events-none pt-1">
          <div className="pointer-events-auto max-w-full">
            <GraphFilters
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              categoryCounts={categoryCounts}
            />
          </div>
        </div>

      </div>

      {/* 3. Bottom-Left Information & Interaction Hint */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          <GraphLegend />
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-[#0A2947]/80 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-white/60 pointer-events-auto select-none shadow-md hidden sm:block">
          <span className="text-[#C89D56] font-semibold">Explore:</span> Drag to orbit · Scroll to zoom · Click sphere to focus & inspect
        </div>
      </div>

      {/* 4. Bottom-Right Status Indicator */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-[#0A2947]/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-md">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>BAWS Primary Authority Verified</span>
        </div>
      </div>

      {/* 5. 3D WebGL Canvas Layer */}
      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#FAF7F0] space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400" />
          <h2 className="text-xl font-serif font-bold">Knowledge Graph Unavailable</h2>
          <p className="text-xs text-white/60 max-w-md">{error}</p>
          <button
            onClick={loadGraphData}
            className="px-4 py-2 rounded-xl bg-[#C89D56] text-[#0A2947] font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
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
          onSelectNode={flyToNode}
          onHoverNode={setHoveredNode}
          onBackgroundClick={() => setSelectedNode(null)}
          autoRotate={autoRotate}
          highlightedNodeIds={highlightedNodeIds}
          highlightedLinkIds={highlightedLinkIds}
          dimensions={dimensions}
          fgRef={fgRef}
        />
      )}

      {/* 6. Right-Side Inspector Drawer */}
      <NodeDetailDrawer
        node={selectedNode}
        connectedEntities={connectedEntities}
        onClose={() => setSelectedNode(null)}
        onSelectConnectedNode={(nodeId) => {
          const nextNode = rawNodes.find((n) => n.id === nodeId);
          if (nextNode) flyToNode(nextNode);
        }}
        onOpenDocument={onOpenDocument}
        onAskAI={onAskAI}
        onExpandConnections={(nodeId) => setIs2HopExpanded(!is2HopExpanded)}
        isExpanded={is2HopExpanded}
      />

      {/* 7. Screen-Reader / Keyboard Accessible Entity Directory */}
      {isAccessibleListOpen && (
        <AccessibleEntityList
          nodes={rawNodes}
          onSelectNode={flyToNode}
          onOpenDocument={onOpenDocument}
          onClose={() => setIsAccessibleListOpen(false)}
        />
      )}
    </div>
  );
};
