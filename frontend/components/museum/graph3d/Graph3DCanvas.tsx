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
  media: '#C2410C',         // Warm Copper / Speeches & Media
  figure: '#8B5E3C',
};

// Texture cache to prevent recreating textures on every render
const textureCache = new Map<string, THREE.Texture>();
const spriteCache = new Map<string, THREE.Sprite>();

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

// Generate crisp 3D canvas billboard text tag for landmarks
function createBillboardSprite(text: string, color: string, isCenter = false): THREE.Sprite {
  const cacheKey = `${text}-${color}-${isCenter}`;
  if (spriteCache.has(cacheKey)) {
    return spriteCache.get(cacheKey)!.clone();
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.font = isCenter
      ? 'bold 40px "Cinzel", "DM Sans", serif'
      : 'bold 32px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textMetrics = ctx.measureText(text);
    const pillWidth = Math.min(480, Math.max(160, textMetrics.width + 48));
    const pillHeight = isCenter ? 68 : 56;
    const x = 256 - pillWidth / 2;
    const y = 64 - pillHeight / 2;

    // Soft parchment pill with subtle shadow
    ctx.fillStyle = isCenter ? 'rgba(243, 228, 201, 0.95)' : 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.roundRect(x, y, pillWidth, pillHeight, 18);
    ctx.fill();

    ctx.strokeStyle = isCenter ? '#C59A45' : '#D3D4C0';
    ctx.lineWidth = isCenter ? 4 : 2;
    ctx.stroke();

    ctx.fillStyle = isCenter ? '#0A2947' : color;
    ctx.fillText(text, 256, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    depthWrite: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(isCenter ? 38 : 30, isCenter ? 9.5 : 7.5, 1);
  spriteCache.set(cacheKey, sprite);
  return sprite;
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
  const nodeGroupsMap = useRef<Map<string, THREE.Group>>(new Map());

  // Ref tracking to avoid re-instantiating 3D scene when state changes
  const selectedNodeIdRef = useRef(selectedNodeId);
  const highlightedNodeIdsRef = useRef(highlightedNodeIds);
  const highlightedLinkIdsRef = useRef(highlightedLinkIds);

  selectedNodeIdRef.current = selectedNodeId;
  highlightedNodeIdsRef.current = highlightedNodeIds;
  highlightedLinkIdsRef.current = highlightedLinkIds;

  // Single, stable Three.js Object Generator for nodes
  const nodeThreeObject = useCallback((node: any) => {
    const gNode = node as Graph3DNode;
    const isCenter = gNode.isCenter || gNode.id === 'person-ambedkar' || gNode.id === 'node-ambedkar';

    const group = new THREE.Group();
    group.name = `node-${gNode.id}`;

    // Bounded radius
    const baseRadius = isCenter ? 12 : Math.min(8.5, Math.max(4.5, 4.2 + (gNode.degree || 1) * 0.38));
    const nodeColor = isCenter
      ? '#C59A45'
      : CATEGORY_COLORS[gNode.category?.toLowerCase()] || gNode.color || '#C5A880';

    // 1. Core Sphere
    const sphereGeo = new THREE.SphereGeometry(baseRadius, 32, 32);
    let material: THREE.MeshStandardMaterial;

    if (isCenter && gNode.imageUrl) {
      const portraitTexture = getOrCreateCircularTexture(gNode.imageUrl, '#C59A45');
      material = new THREE.MeshStandardMaterial({
        map: portraitTexture,
        roughness: 0.35,
        metalness: 0.3,
        emissive: new THREE.Color('#3A2414'),
        emissiveIntensity: 0.25,
      });
    } else if (gNode.imageUrl) {
      const portraitTexture = getOrCreateCircularTexture(gNode.imageUrl, nodeColor);
      material = new THREE.MeshStandardMaterial({
        map: portraitTexture,
        roughness: 0.4,
        metalness: 0.2,
        emissive: new THREE.Color(nodeColor),
        emissiveIntensity: 0.15,
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(nodeColor),
        roughness: 0.38,
        metalness: 0.25,
        emissive: new THREE.Color(nodeColor),
        emissiveIntensity: 0.15,
      });
    }

    const sphereMesh = new THREE.Mesh(sphereGeo, material);
    sphereMesh.userData = { isCore: true, baseRadius, nodeColor };
    group.add(sphereMesh);

    // 2. Outer Rotating Halo / Armillary Ring for Selected or Central Node
    const ringGeo = new THREE.TorusGeometry(baseRadius * 1.4, baseRadius * 0.045, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc59a45,
      emissive: 0xc59a45,
      emissiveIntensity: 0.85,
      roughness: 0.3,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    ringMesh.rotation.y = Math.PI / 6;
    ringMesh.visible = isCenter; // Initially visible on central Ambedkar
    ringMesh.userData = { isRing: true };
    group.add(ringMesh);

    // 3. Crisp 3D Billboard Label for central node & major landmark entities
    const isLandmark = isCenter || (gNode.degree && gNode.degree >= 5);
    if (isLandmark) {
      const sprite = createBillboardSprite(gNode.label, nodeColor, isCenter);
      sprite.position.set(0, -(baseRadius + 7.5), 0);
      sprite.userData = { isLabel: true, isLandmark };
      group.add(sprite);
    }

    nodeGroupsMap.current.set(gNode.id, group);
    return group;
  }, []);

  // Update visual node properties smoothly when selection changes (Zero scene rebuild!)
  useEffect(() => {
    const isAnySelected = selectedNodeId !== null;
    const hNodes = highlightedNodeIds;

    nodeGroupsMap.current.forEach((group, nodeId) => {
      const isSelected = nodeId === selectedNodeId;
      const isConnected = hNodes.has(nodeId);
      const isDimmed = isAnySelected && !isSelected && !isConnected;

      group.children.forEach((child) => {
        // Core Sphere updates
        if (child.userData?.isCore && (child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          mat.transparent = isDimmed;
          mat.opacity = isDimmed ? 0.12 : 1.0;
          mat.emissiveIntensity = isSelected ? 0.75 : isConnected ? 0.45 : isDimmed ? 0.04 : 0.15;

          const baseScale = isSelected ? 1.3 : isConnected ? 1.12 : isDimmed ? 0.82 : 1.0;
          child.scale.set(baseScale, baseScale, baseScale);
        }

        // Ring Halo updates
        if (child.userData?.isRing) {
          child.visible = isSelected || (!isAnySelected && (nodeId === 'person-ambedkar' || nodeId === 'node-ambedkar'));
          if (isSelected) {
            child.scale.set(1.15, 1.15, 1.15);
          }
        }

        // Billboard Label updates
        if (child.userData?.isLabel) {
          child.visible = !isDimmed;
          const spriteMat = (child as THREE.Sprite).material;
          if (spriteMat) {
            spriteMat.opacity = isDimmed ? 0.05 : 1.0;
          }
        }
      });
    });

    // Update link styling in the graph instance directly
    if (graphInstanceRef.current) {
      graphInstanceRef.current
        .linkColor((link: any) => {
          const gLink = link as Graph3DLink;
          const isHighlighted = highlightedLinkIdsRef.current.has(gLink.id);
          if (selectedNodeIdRef.current !== null) {
            return isHighlighted ? '#0A2947' : 'rgba(10, 41, 71, 0.015)';
          }
          return 'rgba(10, 41, 71, 0.08)';
        })
        .linkWidth((link: any) => {
          const gLink = link as Graph3DLink;
          return highlightedLinkIdsRef.current.has(gLink.id) ? 2.5 : 0.6;
        })
        .linkDirectionalParticles((link: any) => {
          const gLink = link as Graph3DLink;
          return highlightedLinkIdsRef.current.has(gLink.id) ? 4 : 0;
        })
        .linkDirectionalParticleColor(() => '#C59A45');
    }
  }, [selectedNodeId, highlightedNodeIds, highlightedLinkIds]);

  // Clean, zero-clutter Tooltip on hover
  const getNodeLabel = useCallback((node: any) => {
    const gNode = node as Graph3DNode;
    const catLabel = gNode.category ? gNode.category.toUpperCase() : 'ENTITY';
    const yearStr = gNode.year ? ` · ${gNode.year}` : '';

    return `
      <div style="
        background: #FFFFFF;
        color: #0A2947;
        padding: 9px 14px;
        border-radius: 14px;
        border: 1px solid #D3D4C0;
        box-shadow: 0 12px 30px rgba(10, 41, 71, 0.12);
        font-family: 'DM Sans', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        pointer-events: none;
        max-width: 260px;
        backdrop-filter: blur(8px);
      ">
        <div style="font-size: 9px; font-family: 'Cinzel', serif; letter-spacing: 0.15em; color: #8B5E3C; font-weight: bold; margin-bottom: 2px;">
          ${catLabel}${yearStr}
        </div>
        <div style="font-weight: 700; font-size: 13px; color: #0A2947; margin-bottom: 4px;">
          ${gNode.label}
        </div>
        ${gNode.shortDesc ? `<div style="font-size: 11px; color: rgba(10, 41, 71, 0.7); line-height: 1.35;">${gNode.shortDesc}</div>` : ''}
      </div>
    `;
  }, []);

  // Initialize 3d-force-graph ONCE
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
          // Generous repulsion and link distance to create organic spatial depth and stop clutter
          const charge = d3Force('charge');
          if (charge) charge.strength(-240);

          const link = d3Force('link');
          if (link) link.distance(90);
        }

        const scene = graph.scene();
        if (scene && !scene.userData.lightsConfigured) {
          scene.userData.lightsConfigured = true;

          // Museum warm 3-point illumination
          const ambient = new THREE.AmbientLight(0xffffff, 0.95);
          scene.add(ambient);

          const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
          dirLight.position.set(160, 240, 200);
          scene.add(dirLight);

          const fillLight = new THREE.DirectionalLight(0xe5d8ca, 0.5);
          fillLight.position.set(-160, -100, -120);
          scene.add(fillLight);

          const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd3d4c0, 0.65);
          scene.add(hemiLight);

          // Concentric archival orbital guide rings on equatorial plane
          const ringGroup = new THREE.Group();
          ringGroup.rotation.x = Math.PI / 2;
          const ringRadii = [90, 180, 270, 360];
          ringRadii.forEach((radius, i) => {
            const ringGeo = new THREE.RingGeometry(radius - 0.45, radius + 0.45, 128);
            const ringMat = new THREE.MeshBasicMaterial({
              color: 0xc59a45,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.16 - i * 0.03,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ringGroup.add(ring);
          });
          scene.add(ringGroup);
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
        .linkColor(() => 'rgba(10, 41, 71, 0.08)')
        .linkWidth(() => 0.6)
        .linkDirectionalParticles(() => 0)
        .linkDirectionalParticleWidth(2.6)
        .linkDirectionalParticleSpeed(0.006)
        .linkDirectionalParticleColor(() => '#C59A45')
        .linkCurvature(0.06)
        .linkOpacity(0.7)
        .onNodeClick((node: any) => onSelectNode(node as Graph3DNode))
        .onNodeHover((node: any) => onHoverNode(node ? (node as Graph3DNode) : null))
        .onBackgroundClick(onBackgroundClick);

      const controls = graph.controls?.();
      if (controls && controls.autoRotate !== undefined) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.4;
      }
    };

    setupGraph();

    return () => {
      isCancelled = true;
    };
  }, [data, dimensions, autoRotate, nodeThreeObject, getNodeLabel, onSelectNode, onHoverNode, onBackgroundClick, fgRef]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (graphInstanceRef.current) {
        try {
          const dom = graphInstanceRef.current._destructor?.();
          if (dom && dom.parentNode) {
            dom.parentNode.removeChild(dom);
          }
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
    />
  );
};
