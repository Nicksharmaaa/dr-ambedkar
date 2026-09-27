'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Graph3DData, Graph3DNode, Graph3DLink, ConnectedEntitySummary, MapState } from './types';
import { KnowledgeMapScene } from './KnowledgeMapScene';
import { ArchivalDossier } from './ArchivalDossier';
import { ArchivalDocument } from '@/types/museum';
import { soundEffects } from '@/utils/soundEffects';

interface Graph3DCanvasProps {
  data: Graph3DData;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (node: Graph3DNode) => void;
  onHoverNode: (node: Graph3DNode | null) => void;
  onBackgroundClick: () => void;
  autoRotate: boolean;
  highlightedNodeIds: Set<string>;
  highlightedLinkIds: Set<string>;
  dimensions: { width: number; height: number };
  fgRef: React.MutableRefObject<any>;
  onOpenDocument?: (doc: ArchivalDocument) => void;
  onAskAI?: (query: string) => void;
}

export const Graph3DCanvas: React.FC<Graph3DCanvasProps> = ({
  data,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onBackgroundClick,
  autoRotate,
  dimensions,
  fgRef,
  onOpenDocument,
  onAskAI,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<KnowledgeMapScene | null>(null);

  // Derive active selected node object from data
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return data.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, data.nodes]);

  // Derive 1-hop connected neighbors for the selected entity
  const connectedEntities = useMemo<ConnectedEntitySummary[]>(() => {
    if (!selectedNodeId) return [];

    const summaries: ConnectedEntitySummary[] = [];
    data.links.forEach((l) => {
      const srcId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgtId = typeof l.target === 'string' ? l.target : (l.target as any).id;

      if (srcId === selectedNodeId) {
        const neighbor = data.nodes.find((n) => n.id === tgtId);
        if (neighbor) {
          summaries.push({
            node: neighbor,
            relation: l.relation || 'connected to',
            isOutgoing: true,
            notes: l.notes,
          });
        }
      } else if (tgtId === selectedNodeId) {
        const neighbor = data.nodes.find((n) => n.id === srcId);
        if (neighbor) {
          summaries.push({
            node: neighbor,
            relation: l.relation || 'connected from',
            isOutgoing: false,
            notes: l.notes,
          });
        }
      }
    });

    return summaries;
  }, [selectedNodeId, data.links, data.nodes]);

  // 1. Initialize persistent direct Three.js scene ONCE
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    if (!sceneRef.current) {
      const scene = new KnowledgeMapScene(
        containerRef.current,
        {
          onSelectNode: (node) => {
            soundEffects.playClick();
            onSelectNode(node);
          },
          onHoverNode: (node) => {
            onHoverNode(node);
          },
          onBackgroundClick: () => {
            onBackgroundClick();
          },
          onStateChange: (state: MapState) => {
            // Can expose state to parent if needed
          },
        },
        'HIGH'
      );

      sceneRef.current = scene;
      if (fgRef) fgRef.current = scene;
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, []);

  // 2. Feed or update graph data to Three.js scene
  useEffect(() => {
    if (sceneRef.current && data.nodes.length > 0) {
      sceneRef.current.setData(data);
    }
  }, [data]);

  // 3. Synchronize selected node with Three.js scene
  useEffect(() => {
    if (!sceneRef.current) return;

    if (selectedNode) {
      sceneRef.current.selectEntity(selectedNode);
    } else {
      sceneRef.current.deselect();
    }
  }, [selectedNode]);

  // 4. Update auto-rotate
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setAutoRotate(autoRotate);
    }
  }, [autoRotate]);

  // 5. Handle dimensions resize
  useEffect(() => {
    if (sceneRef.current && dimensions.width > 0 && dimensions.height > 0) {
      sceneRef.current.resize(dimensions.width, dimensions.height);
    }
  }, [dimensions.width, dimensions.height]);

  // 6. Keyboard navigation (ESC to close selection)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedNodeId) {
        onBackgroundClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, onBackgroundClick]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none" style={{ background: '#F4EBDD' }}>
      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-default"
        aria-label="3D Knowledge Universe Viewport"
      />

      {/* Archival Museum Dossier (Right Side) */}
      <ArchivalDossier
        node={selectedNode}
        connectedEntities={connectedEntities}
        onClose={onBackgroundClick}
        onSelectConnectedNode={(nodeId) => {
          const target = data.nodes.find((n) => n.id === nodeId);
          if (target) onSelectNode(target);
        }}
        onOpenDocument={onOpenDocument}
        onAskAI={onAskAI}
        isOpen={selectedNode !== null}
      />
    </div>
  );
};
