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

// Warm Archival Category palette optimized for light parchment ivory canvas
const CATEGORY_COLORS: Record<string, string> = {
  person: '#8B5E3C',        // Warm Walnut Bronze
  work: '#0A2947',          // Deep Bhim Blue / Archival Treatises
  book: '#0A2947',
  document: '#0A2947',
  organization: '#0D6E57',  // Deep Patina Teal / Civic Institutions
  institution: '#0D6E57',
  event: '#B91C1C',         // Historical Saffron Crimson / Movements
  movement: '#B91C1C',
  concept: '#B45309',       // Deep Amber / Constitutional Morality
  idea: '#B45309',
  article: '#B45309',
  place: '#6D28D9',         // Royal Violet / Historic Places
  media: '#C2410C',         // Warm Copper / Media & Speeches
  figure: '#8B5E3C',
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
    ctx.fillStyle = '#FAF7F0';
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
  const auraRingsRef = useRef<THREE.Mesh[]>([]);

  // Custom 3D Object Generator for each node (Archival Memory Orbs)
  const nodeThreeObject = useCallback(
    (node: any) => {
      const gNode = node as Graph3DNode;
      const isSelected = selectedNodeId === gNode.id;
      const isHovered = hoveredNodeId === gNode.id;
      const isConnected = highlightedNodeIds.has(gNode.id);
      const isCenter = gNode.isCenter || gNode.id === 'person-ambedkar' || gNode.id === 'node-ambedkar';

      const group = new THREE.Group();

      // Bounded node scaling based on degree
      const baseRadius = isCenter ? 12 : Math.min(8.5, Math.max(4.5, 4.2 + (gNode.degree || 1) * 0.38));
      const radius = isSelected ? baseRadius * 1.25 : isHovered ? baseRadius * 1.15 : baseRadius;

      const nodeColor = isCenter
        ? '#C89D56'
        : CATEGORY_COLORS[gNode.category?.toLowerCase()] || gNode.color || '#C5A880';

      // 1. Core Archival Sphere
      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);

      let material: THREE.Material;

      if (isCenter && gNode.imageUrl) {
        // Central Ambedkar Node with circular archival portrait and brass rim
        const portraitTexture = getOrCreateCircularTexture(gNode.imageUrl, '#C89D56');
        material = new THREE.MeshStandardMaterial({
          map: portraitTexture,
          roughness: 0.35,
          metalness: 0.3,
          emissive: isSelected ? new THREE.Color('#C89D56') : new THREE.Color('#3A2414'),
          emissiveIntensity: isSelected ? 0.65 : 0.25,
        });
      } else if (gNode.imageUrl) {
        // High-res archival portrait or document cover texture
        const portraitTexture = getOrCreateCircularTexture(gNode.imageUrl, nodeColor);
        material = new THREE.MeshStandardMaterial({
          map: portraitTexture,
          roughness: 0.4,
          metalness: 0.2,
          emissive: new THREE.Color(nodeColor),
          emissiveIntensity: isSelected ? 0.55 : isHovered ? 0.35 : 0.12,
        });
      } else {
        // Refined procedural physical material with warm archival illumination
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(nodeColor),
          roughness: 0.38,
          metalness: 0.22,
          emissive: new THREE.Color(nodeColor),
          emissiveIntensity: isSelected ? 0.65 : isHovered ? 0.45 : isConnected ? 0.28 : 0.1,
          transparent: selectedNodeId !== null && !isSelected && !isConnected,
          opacity: selectedNodeId !== null && !isSelected && !isConnected ? 0.22 : 1.0,
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
          opacity: isSelected ? 0.5 : 0.2,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        group.add(haloMesh);
      }

      // 3. Rotating Flare / Aura when Selected (Sophisticated Archival Activation)
      if (isSelected) {
        // Tilted primary brass armillary ring
        const ringGeo = new THREE.TorusGeometry(radius * 1.42, radius * 0.045, 16, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xc89d56,
          emissive: 0xc89d56,
          emissiveIntensity: 0.8,
          roughness: 0.3,
          metalness: 0.8,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 3;
        ringMesh.rotation.y = Math.PI / 6;
        group.add(ringMesh);

        // Soft outer glowing disc
        const glowGeo = new THREE.RingGeometry(radius * 1.3, radius * 1.6, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0xc89d56,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        group.add(glowMesh);
      }

      // 4. Subtle hover indicator
      if (isHovered && !isSelected) {
        const hoverRingGeo = new THREE.RingGeometry(radius * 1.15, radius * 1.28, 32);
        const hoverRingMat = new THREE.MeshBasicMaterial({
          color: 0xf3e4c9,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const hoverRingMesh = new THREE.Mesh(hoverRingGeo, hoverRingMat);
        group.add(hoverRingMesh);
      }

      return group;
    },
    [selectedNodeId, hoveredNodeId, highlightedNodeIds]
  );

  // Link styling rules for zero-clutter on light parchment
  const getLinkColor = useCallback(
    (link: any) => {
      const gLink = link as Graph3DLink;
      const isHighlighted = highlightedLinkIds.has(gLink.id);

      if (selectedNodeId !== null) {
        return isHighlighted ? '#0A2947' : 'rgba(10, 41, 71, 0.06)';
      }
      return 'rgba(10, 41, 71, 0.28)';
    },
    [selectedNodeId, highlightedLinkIds]
  );

  const getLinkWidth = useCallback(
    (link: any) => {
      const gLink = link as Graph3DLink;
      return highlightedLinkIds.has(gLink.id) ? 2.4 : 0.75;
    },
    [highlightedLinkIds]
  );

  // Directional particles only on selected relationships
  const getLinkParticles = useCallback(
    (link: any) => {
      const gLink = link as Graph3DLink;
      return highlightedLinkIds.has(gLink.id) ? 3 : 0;
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
        background: #FFFFFF;
        color: #0A2947;
        padding: 9px 13px;
        border-radius: 14px;
        border: 1px solid #D3D4C0;
        box-shadow: 0 10px 25px rgba(10, 41, 71, 0.15);
        font-family: 'DM Sans', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        pointer-events: none;
        max-width: 250px;
        backdrop-filter: blur(8px);
      ">
        <div style="font-size: 9px; font-family: 'Cinzel', serif; letter-spacing: 0.12em; color: #8B5E3C; font-weight: bold; margin-bottom: 3px;">
          ${catLabel}${yearStr}
        </div>
        <div style="font-weight: 700; font-size: 13px; color: #0A2947;">
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
          .backgroundColor('#FAF7F0')
          .showNavInfo(false)
          .enableNodeDrag(true)
          .enableNavigationControls(true);

        const d3Force = graph.d3Force;
        if (d3Force) {
          // Stronger repulsion and larger link distance to create organic spatial depth across 3D clusters
          const charge = d3Force('charge');
          if (charge) charge.strength(-260);

          const link = d3Force('link');
          if (link) link.distance(75);
        }

        const scene = graph.scene();
        if (scene && !scene.userData.lightsConfigured) {
          scene.userData.lightsConfigured = true;

          // Museum 3-point warm illumination tuned for light ivory exhibition
          const ambient = new THREE.AmbientLight(0xffffff, 0.9);
          scene.add(ambient);

          const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.15);
          dirLight.position.set(160, 240, 200);
          scene.add(dirLight);

          const fillLight = new THREE.DirectionalLight(0xe5d8ca, 0.45);
          fillLight.position.set(-160, -100, -120);
          scene.add(fillLight);

          const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd3d4c0, 0.6);
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
        .linkDirectionalParticleWidth(2.6)
        .linkDirectionalParticleSpeed(0.006)
        .linkDirectionalParticleColor(() => '#0A2947')
        .linkCurvature(0.08)
        .linkOpacity(0.65)
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
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #FFFFFF 0%, #FAF7F0 60%, #ECE6D8 100%)',
      }}
    />
  );
};
