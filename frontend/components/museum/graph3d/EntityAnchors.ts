import * as THREE from 'three';
import { Graph3DNode, MUSEUM_PALETTE } from './types';

// Subtle, sophisticated museum palette for entity categories (NO neon)
const CATEGORY_TINTS: Record<string, string> = {
  person: '#A47745',       // Antique Brass / Portrait
  work: '#3D4A54',         // Slate Bronze / Treatises & Books
  book: '#3D4A54',
  document: '#3D4A54',
  organization: '#4A6B63', // Verdigris Patina / Civic Institutions
  institution: '#4A6B63',
  event: '#8B4836',        // Deep Terracotta / Movements & Satyagrahas
  movement: '#8B4836',
  concept: '#7A6B48',      // Olive Bronze / Constitutional Philosophy
  idea: '#7A6B48',
  place: '#6D5B4F',        // Historic Earth / Memorials & Places
  media: '#9A6B3D',        // Warm Amber / Speeches & Periodicals
};

/**
 * EntityAnchors
 * Manages the 30-45 real interactive archival entities.
 * Generates deterministic 3D anchor positions and lightweight interactive meshes
 * specifically optimized for high-performance raycasting without touching the decorative particle field.
 */
export class EntityAnchors {
  public group: THREE.Group;
  public interactiveMeshes: THREE.Mesh[] = [];
  public nodeMap: Map<string, { node: Graph3DNode; mesh: THREE.Mesh; labelSprite?: THREE.Sprite; position: THREE.Vector3 }> = new Map();
  private sphereRadius: number = 72;

  constructor(radius: number = 72) {
    this.group = new THREE.Group();
    this.sphereRadius = radius;
  }

  /**
   * Set up deterministic positions for the 40 entities
   */
  public buildAnchors(nodes: Graph3DNode[]) {
    // Clear previous
    this.dispose();

    const nodeCount = nodes.length;
    // Central anchor is Dr. Ambedkar (id: 'node-ambedkar' or 'person-ambedkar')
    const centerNode = nodes.find(n => n.id === 'node-ambedkar' || n.id === 'person-ambedkar') || nodes[0];
    const peripheralNodes = nodes.filter(n => n.id !== centerNode?.id);

    // 1. Central Anchor: slightly forward/center
    if (centerNode) {
      const centerPos = new THREE.Vector3(0, 0, 8);
      this.createNodeMesh(centerNode, centerPos, true);
    }

    // 2. Peripheral entities distributed deterministically around the sphere
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    peripheralNodes.forEach((node, idx) => {
      // Stratified spherical distribution
      const y = 1 - (idx / Math.max(1, peripheralNodes.length - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * (idx + 1);

      // Deterministic slight clustering by category
      const catCode = (node.category || 'concept').charCodeAt(0) % 5;
      const catRShift = (catCode - 2) * 2.5;

      const r = (this.sphereRadius * 0.88) + catRShift;
      const x = Math.cos(theta) * radiusAtY * r;
      const py = y * r * 0.9; // slight vertical compression for elegant oval
      const z = Math.sin(theta) * radiusAtY * r;

      const pos = new THREE.Vector3(x, py, z);
      this.createNodeMesh(node, pos, false);
    });
  }

  private createNodeMesh(node: Graph3DNode, position: THREE.Vector3, isCenter: boolean) {
    const colorHex = isCenter
      ? MUSEUM_PALETTE.accentBrass
      : CATEGORY_TINTS[node.category?.toLowerCase()] || MUSEUM_PALETTE.particleGold2;

    const baseRadius = isCenter ? 2.4 : 1.35;

    // Core mesh (used for Raycasting)
    const coreGeo = new THREE.SphereGeometry(baseRadius, 16, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      emissive: new THREE.Color(colorHex),
      emissiveIntensity: isCenter ? 0.6 : 0.3,
      roughness: 0.35,
      metalness: 0.4,
      transparent: true,
      opacity: 0.95,
    });

    const mesh = new THREE.Mesh(coreGeo, coreMat);
    mesh.position.copy(position);
    mesh.userData = {
      nodeId: node.id,
      node,
      isCenter,
      baseRadius,
      baseColor: colorHex,
    };

    // Subtle outer halo ring for major landmarks
    if (isCenter || (node.degree && node.degree >= 4)) {
      const haloGeo = new THREE.RingGeometry(baseRadius * 1.3, baseRadius * 1.55, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.userData = { isHalo: true };
      mesh.add(halo);
    }

    // Billboard Text Label (appears on hover or when central)
    const labelSprite = this.createLabelSprite(node.label, colorHex, isCenter, node.category);
    labelSprite.position.set(0, -(baseRadius + (isCenter ? 4.2 : 3.0)), 0);
    labelSprite.visible = isCenter;
    mesh.add(labelSprite);

    this.group.add(mesh);
    this.interactiveMeshes.push(mesh);
    this.nodeMap.set(node.id, { node, mesh, labelSprite, position });
  }

  private createLabelSprite(text: string, color: string, isCenter: boolean, category?: string): THREE.Sprite {
    // 1024x256 high-resolution canvas for crisp retina rendering
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 256);

      // Outer glow / shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;

      // Dark, high-contrast museum pill plaque
      ctx.fillStyle = isCenter ? 'rgba(10, 41, 71, 0.96)' : 'rgba(15, 23, 42, 0.94)';
      ctx.beginPath();
      ctx.roundRect(24, 28, 976, 200, 36);
      ctx.fill();

      // Reset shadow for crisp borders and text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Elegant gold / accent border
      ctx.strokeStyle = isCenter ? '#C59A45' : color;
      ctx.lineWidth = isCenter ? 5 : 4;
      ctx.stroke();

      // Top Category / Heritage Tag
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = isCenter ? '#C59A45' : color;
      const tagText = isCenter
        ? 'ARCHIVAL CENTERPIECE'
        : (category || 'HISTORICAL ENTITY').toUpperCase();
      ctx.fillText(tagText, 512, 78);

      // Main Entity Name — large, ultra-clear, high-contrast
      ctx.font = isCenter
        ? 'bold 52px "Playfair Display", Georgia, serif'
        : 'bold 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      
      const maxLen = isCenter ? 32 : 28;
      const displayStr = text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
      ctx.fillText(displayStr, 512, 146);

      // Bottom subtle ornament line for center entity
      if (isCenter) {
        ctx.strokeStyle = 'rgba(197, 154, 69, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(360, 192);
        ctx.lineTo(664, 192);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.98,
      depthTest: false,
      depthWrite: false,
    });

    const sprite = new THREE.Sprite(spriteMat);
    // Scaled for comfortable readability from default camera distance
    if (isCenter) {
      sprite.scale.set(22, 5.5, 1);
    } else {
      sprite.scale.set(16, 4, 1);
    }
    return sprite;
  }

  public setHovered(hoveredNodeId: string | null) {
    this.nodeMap.forEach(({ mesh, labelSprite, node }) => {
      const isHovered = node.id === hoveredNodeId;
      const isCenter = mesh.userData.isCenter;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (isHovered) {
        mat.emissiveIntensity = 0.9;
        const targetScale = mesh.userData.baseRadius * 1.35 / mesh.userData.baseRadius;
        mesh.scale.set(targetScale, targetScale, targetScale);
        if (labelSprite) labelSprite.visible = true;
      } else {
        mat.emissiveIntensity = isCenter ? 0.6 : 0.3;
        mesh.scale.set(1, 1, 1);
        if (labelSprite && !isCenter) labelSprite.visible = false;
      }
    });
  }

  public setSelectionHighlight(selectedNodeId: string | null, connectedNodeIds: Set<string>) {
    const isAnySelected = selectedNodeId !== null;

    this.nodeMap.forEach(({ mesh, labelSprite, node }) => {
      const isSelected = node.id === selectedNodeId;
      const isConnected = connectedNodeIds.has(node.id);
      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (!isAnySelected) {
        // Normal Idle appearance
        mat.opacity = 0.95;
        mat.emissiveIntensity = mesh.userData.isCenter ? 0.6 : 0.3;
        mesh.visible = true;
      } else if (isSelected) {
        // Hide the small anchor mesh since the large SelectedArtifact orb replaces it!
        mesh.visible = false;
        if (labelSprite) labelSprite.visible = false;
      } else if (isConnected) {
        // Connected 1-hop secondary entities
        mesh.visible = true;
        mat.opacity = 0.9;
        mat.emissiveIntensity = 0.7;
        if (labelSprite) labelSprite.visible = true;
      } else {
        // De-emphasized entities
        mesh.visible = true;
        mat.opacity = 0.15;
        mat.emissiveIntensity = 0.05;
        if (labelSprite) labelSprite.visible = false;
      }
    });
  }

  public getNodePosition(nodeId: string): THREE.Vector3 | null {
    const entry = this.nodeMap.get(nodeId);
    return entry ? entry.position.clone() : null;
  }

  public update(time: number, cameraPosition: THREE.Vector3) {
    // Ambient slow drift on halos
    this.nodeMap.forEach(({ mesh }) => {
      mesh.children.forEach(child => {
        if (child.userData.isHalo) {
          child.lookAt(cameraPosition);
        }
      });
    });
  }

  public dispose() {
    this.interactiveMeshes.forEach(mesh => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      mesh.children.forEach(c => {
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
        if ((c as THREE.Mesh).material) ((c as THREE.Mesh).material as THREE.Material).dispose();
      });
    });
    this.group.clear();
    this.interactiveMeshes = [];
    this.nodeMap.clear();
  }
}
