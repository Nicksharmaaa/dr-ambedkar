'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Graph3DData, Graph3DNode, Graph3DLink } from './types';

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
}

// Category color palette for high-contrast museum lighting
const CATEGORY_COLORS: Record<string, string> = {
  person: '#3b82f6',        // Intellectual Cobalt
  work: '#6366f1',          // Treatises / Indigo
  book: '#6366f1',
  document: '#6366f1',
  organization: '#0284c7',  // Civic Blue
  institution: '#0284c7',
  event: '#f97316',         // Historical Movement Saffron
  concept: '#10b981',       // Constitutional Emerald
  idea: '#10b981',
  article: '#14b8a6',       // Constitutional Articles
  place: '#8B5E3C',         // Terrestrial Sage / Earth
  media: '#f59e0b',         // Audio / Broadcast Amber
  figure: '#3b82f6',
};

// Texture cache to prevent recreating textures on every render
const textureCache = new Map<string, THREE.Texture>();

function getOrCreateCircularTexture(imageUrl: string, borderColor: string): THREE.Texture {
  if (typeof window === 'undefined') {
    return new THREE.Texture();
  }

  if (textureCache.has(imageUrl)) {
    return textureCache.get(imageUrl)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#0A2947';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 10;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, 256, 256);
      ctx.save();
      ctx.beginPath();
      ctx.arc(128, 128, 118, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, 256, 256);
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = borderColor;
      ctx.beginPath();
      ctx.arc(128, 128, 120, 0, Math.PI * 2);
      ctx.stroke();

      texture.needsUpdate = true;
    };
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(imageUrl, texture);
  return texture;
}

export const Graph3DCanvas: React.FC<Graph3DCanvasProps> = ({
  data,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onBackgroundClick,
  autoRotate,
  highlightedNodeIds,
  highlightedLinkIds,
  dimensions,
  fgRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphInstanceRef = useRef<any>(null);

  // Custom 3D Object Generator for each node
  const nodeThreeObject = useCallback(
    (node: any) => {
      const gNode = node as Graph3DNode;
      const isSelected = selectedNodeId === gNode.id;
      const isHovered = hoveredNodeId === gNode.id;
      const isConnected = highlightedNodeIds.has(gNode.id);
      const isCenter = gNode.isCenter || gNode.id === 'person-ambedkar' || gNode.id === 'node-ambedkar';

      const group = new THREE.Group();

      // Bounded node scaling based on degree
      const baseRadius = isCenter ? 12 : Math.min(8.5, Math.max(4.5, 4.2 + (gNode.degree || 1) * 0.4));
      const radius = isHovered ? baseRadius * 1.18 : isSelected ? baseRadius * 1.15 : baseRadius;

      const nodeColor = isCenter
        ? '#C89D56'
        : CATEGORY_COLORS[gNode.category?.toLowerCase()] || gNode.color || '#3D5A80';

      // 1. Core Sphere
      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);

      let material: THREE.Material;

      if (isCenter && gNode.imageUrl) {
        // Central Ambedkar Node with circular archival portrait
        const portraitTexture = getOrCreateCircularTexture(gNode.imageUrl, '#C89D56');
        material = new THREE.MeshStandardMaterial({
          map: portraitTexture,
          roughness: 0.3,
          metalness: 0.3,
          emissive: isSelected ? new THREE.Color('#C89D56') : new THREE.Color('#3A2A1A'),
          emissiveIntensity: isSelected ? 0.6 : 0.25,
        });
      } else if (gNode.imageUrl && (gNode.category === 'person' || gNode.category === 'work')) {
        // High-res archival portrait or document cover texture
        const portraitTexture = getOrCreateCircularTexture(gNode.imageUrl, nodeColor);
        material = new THREE.MeshStandardMaterial({
          map: portraitTexture,
          roughness: 0.4,
          metalness: 0.2,
          emissive: new THREE.Color(nodeColor),
          emissiveIntensity: isSelected ? 0.5 : isHovered ? 0.3 : 0.1,
        });
      } else {
        // High quality physical material with subtle museum illumination
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(nodeColor),
          roughness: 0.35,
          metalness: 0.25,
          emissive: new THREE.Color(nodeColor),
          emissiveIntensity: isSelected ? 0.6 : isHovered ? 0.45 : isConnected ? 0.25 : 0.08,
          transparent: selectedNodeId !== null && !isSelected && !isConnected,
          opacity: selectedNodeId !== null && !isSelected && !isConnected ? 0.25 : 1.0,
        });
      }

      const sphereMesh = new THREE.Mesh(sphereGeo, material);
      group.add(sphereMesh);

      // 2. Decorative Outer Halo for Central Ambedkar
      if (isCenter) {
        const haloGeo = new THREE.SphereGeometry(radius * 1.35, 24, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xc89d56,
          wireframe: true,
          transparent: true,
          opacity: isSelected ? 0.45 : 0.22,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        group.add(haloMesh);
      }

      // 3. Selection Ring when active
      if (isSelected) {
        const ringGeo = new THREE.RingGeometry(radius * 1.25, radius * 1.45, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xc89d56,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        group.add(ringMesh);
      }

      // 4. Subtle hover pulse indicator
      if (isHovered && !isSelected) {
        const hoverRingGeo = new THREE.RingGeometry(radius * 1.15, radius * 1.28, 32);
        const hoverRingMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const hoverRingMesh = new THREE.Mesh(hoverRingGeo, hoverRingMat);
        group.add(hoverRingMesh);
      }

      return group;
    },
    [selectedNodeId, hoveredNodeId, highlightedNodeIds]
  );

  // Link styling rules for zero-clutter
  const getLinkColor = useCallback(
    (link: any) => {
      const gLink = link as Graph3DLink;
      const isHighlighted = highlightedLinkIds.has(gLink.id);

      if (selectedNodeId !== null) {
        return isHighlighted ? '#C89D56' : 'rgba(211, 212, 192, 0.04)';
      }
      return 'rgba(211, 212, 192, 0.22)';
    },
    [selectedNodeId, highlightedLinkIds]
  );

  const getLinkWidth = useCallback(
    (link: any) => {
      const gLink = link as Graph3DLink;
      return highlightedLinkIds.has(gLink.id) ? 2.0 : 0.6;
    },
    [highlightedLinkIds]
  );

  // Directional particles only on selected relationships
  const getLinkParticles = useCallback(
    (link: any) => {
      const gLink = link as Graph3DLink;
      return highlightedLinkIds.has(gLink.id) ? 2 : 0;
    },
    [highlightedLinkIds]
  );

  // Tooltip content on hover (clean, zero permanent clutter)
  const getNodeLabel = useCallback((node: any) => {
    const gNode = node as Graph3DNode;
    const catLabel = gNode.category ? gNode.category.toUpperCase() : 'ENTITY';
    const yearStr = gNode.year ? ` · ${gNode.year}` : '';

    return `
      <div style="
        background: #0A2947;
        color: #FAF7F0;
        padding: 8px 12px;
        border-radius: 10px;
        border: 1px solid #C89D56;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        font-family: 'DM Sans', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        pointer-events: none;
        max-width: 220px;
      ">
        <div style="font-size: 9px; font-family: 'Cinzel', serif; letter-spacing: 0.12em; color: #C89D56; font-weight: bold; margin-bottom: 2px;">
          ${catLabel}${yearStr}
        </div>
        <div style="font-weight: 700; font-size: 13px; color: #FFFFFF;">
          ${gNode.label}
        </div>
      </div>
    `;
  }, []);

  // Initialize and maintain 3d-force-graph instance dynamically on client
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    let isCancelled = false;

    const setupGraph = async () => {
      let ForceGraph3D = (window as any).ForceGraph3D;
      if (!ForceGraph3D) {
        const mod = await import('3d-force-graph');
        ForceGraph3D = mod.default || mod;
      }

      if (isCancelled || !containerRef.current) return;

      let graph = graphInstanceRef.current;
      if (!graph) {
        graph = ForceGraph3D()(containerRef.current)
          .backgroundColor('#08192A')
          .showNavInfo(false)
          .enableNodeDrag(true)
          .enableNavigationControls(true);

        const d3Force = graph.d3Force;
        if (d3Force) {
          const charge = d3Force('charge');
          if (charge) charge.strength(-220);

          const link = d3Force('link');
          if (link) link.distance(65);
        }

        const scene = graph.scene();
        if (scene && !scene.userData.lightsConfigured) {
          scene.userData.lightsConfigured = true;

          const ambient = new THREE.AmbientLight(0xffffff, 0.7);
          scene.add(ambient);

          const dirLight = new THREE.DirectionalLight(0xfef3c7, 1.2);
          dirLight.position.set(200, 300, 200);
          scene.add(dirLight);

          const hemiLight = new THREE.HemisphereLight(0xffffff, 0x08192a, 0.5);
          scene.add(hemiLight);
        }

        graphInstanceRef.current = graph;
        if (fgRef) fgRef.current = graph;
      }

      graph
        .width(dimensions.width)
        .height(dimensions.height)
        .graphData(data)
        .nodeThreeObject(nodeThreeObject)
        .nodeLabel(getNodeLabel)
        .nodeVal((node: any) => (node as Graph3DNode).degree || 2)
        .linkColor(getLinkColor)
        .linkWidth(getLinkWidth)
        .linkDirectionalParticles(getLinkParticles)
        .linkDirectionalParticleWidth(2.4)
        .linkDirectionalParticleSpeed(0.005)
        .linkDirectionalParticleColor(() => '#C89D56')
        .linkCurvature(0.08)
        .linkOpacity(0.3)
        .onNodeClick((node: any) => onSelectNode(node as Graph3DNode))
        .onNodeHover((node: any) => onHoverNode(node ? (node as Graph3DNode) : null))
        .onBackgroundClick(onBackgroundClick);

      const controls = graph.controls?.();
      if (controls && controls.autoRotate !== undefined) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.5;
      }
    };

    setupGraph();

    return () => {
      isCancelled = true;
    };
  }, [
    data,
    dimensions,
    selectedNodeId,
    hoveredNodeId,
    highlightedNodeIds,
    highlightedLinkIds,
    autoRotate,
    nodeThreeObject,
    getLinkColor,
    getLinkWidth,
    getLinkParticles,
    getNodeLabel,
    onSelectNode,
    onHoverNode,
    onBackgroundClick,
    fgRef,
  ]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (graphInstanceRef.current) {
        try {
          graphInstanceRef.current._destructor?.();
        } catch (e) {
          // ignore cleanup errors
        }
        graphInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden select-none" 
    />
  );
};
