import * as THREE from 'three';
import { MUSEUM_PALETTE } from './types';

/**
 * SelectedArtifact
 * Renders the prominent 3D museum glass object when an entity is selected.
 * Features:
 * - Translucent ivory glass body with Fresnel illumination & interior warm glow
 * - Counter-rotating antique brass (#A47745) archival ring with fragmented tick marks
 * - Circular masked archival portrait suspended inside the orb when image is present
 * - Gentle floating breathing oscillation
 */
export class SelectedArtifact {
  public group: THREE.Group;
  private orbMesh: THREE.Mesh | null = null;
  private ringGroup: THREE.Group;
  private ringMesh: THREE.Mesh | null = null;
  private tickMesh: THREE.LineSegments | null = null;
  private portraitMesh: THREE.Mesh | null = null;
  private interiorLight: THREE.PointLight | null = null;
  private titleSprite: THREE.Sprite | null = null;
  private textureLoader: THREE.TextureLoader;
  private activeImageUrl: string | null = null;
  private targetScale: number = 0;
  private currentScale: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.ringGroup = new THREE.Group();
    this.textureLoader = new THREE.TextureLoader();
    this.init();
  }

  private init() {
    // 1. Translucent Ivory Glass Orb (Physical Material)
    const orbGeo = new THREE.SphereGeometry(6.5, 48, 48);
    const orbMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFDF8'),
      emissive: new THREE.Color(MUSEUM_PALETTE.particleGold),
      emissiveIntensity: 0.15,
      roughness: 0.18,
      metalness: 0.05,
      transmission: 0.88,
      thickness: 3.0,
      ior: 1.48,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });

    this.orbMesh = new THREE.Mesh(orbGeo, orbMat);
    this.group.add(this.orbMesh);

    // 2. Warm interior point light
    this.interiorLight = new THREE.PointLight(0xffeed6, 1.4, 25, 1.2);
    this.group.add(this.interiorLight);

    // 3. Antique Brass Archival Rings with Tick Marks
    const ringGeo = new THREE.TorusGeometry(9.6, 0.08, 16, 128);
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(MUSEUM_PALETTE.accentBrass),
      roughness: 0.28,
      metalness: 0.85,
      emissive: new THREE.Color(MUSEUM_PALETTE.accentBrass),
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.85,
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = Math.PI / 2.3;
    this.ringGroup.add(this.ringMesh);

    // Inner delicate secondary ring
    const innerRingGeo = new THREE.TorusGeometry(8.2, 0.04, 16, 96);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(MUSEUM_PALETTE.particleGold2),
      transparent: true,
      opacity: 0.5,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2.1;
    innerRing.rotation.y = Math.PI / 8;
    this.ringGroup.add(innerRing);

    // Archival ticks on the ring
    const tickCount = 24;
    const tickPositions: number[] = [];
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2;
      const rInner = 9.2;
      const rOuter = 9.9;
      tickPositions.push(
        Math.cos(angle) * rInner,
        0,
        Math.sin(angle) * rInner,
        Math.cos(angle) * rOuter,
        0,
        Math.sin(angle) * rOuter
      );
    }
    const tickGeo = new THREE.BufferGeometry();
    tickGeo.setAttribute('position', new THREE.Float32BufferAttribute(tickPositions, 3));
    const tickMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(MUSEUM_PALETTE.accentBrass),
      transparent: true,
      opacity: 0.6,
    });
    this.tickMesh = new THREE.LineSegments(tickGeo, tickMat);
    this.tickMesh.rotation.x = Math.PI / 2.3;
    this.ringGroup.add(this.tickMesh);

    this.group.add(this.ringGroup);

    // 4. Portrait Plane Container (created on demand) — sized to fill orb interior
    const portraitGeo = new THREE.PlaneGeometry(8.5, 8.5);
    const portraitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
    this.portraitMesh.position.z = 0.2;
    this.group.add(this.portraitMesh);

    // 5. Billboard Title Plaque below orb
    this.titleSprite = this.createTitleSprite();
    this.titleSprite.position.set(0, -9.6, 0);
    this.group.add(this.titleSprite);

    // Start hidden
    this.group.scale.set(0.001, 0.001, 0.001);
    this.group.visible = false;
  }

  private createTitleSprite(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.98,
      depthTest: false,
      depthWrite: false,
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(24, 6, 1);
    return sprite;
  }

  private updateTitlePlaque(title?: string, category?: string) {
    if (!this.titleSprite) return;
    const mat = this.titleSprite.material as THREE.SpriteMaterial;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 256);

      // Outer drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;

      // Dark obsidian plaque background
      ctx.fillStyle = 'rgba(10, 41, 71, 0.96)';
      ctx.beginPath();
      ctx.roundRect(24, 28, 976, 200, 36);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Gold frame
      ctx.strokeStyle = '#C59A45';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Category Pill / Tag
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#C59A45';
      const catText = (category || 'SELECTED ENTITY').toUpperCase();
      ctx.fillText(`• ${catText} •`, 512, 78);

      // Main Entity Title
      ctx.font = 'bold 50px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#FFFFFF';
      const entityTitle = title || 'Selected Archival Node';
      const maxLen = 32;
      const displayStr = entityTitle.length > maxLen ? entityTitle.slice(0, maxLen - 1) + '…' : entityTitle;
      ctx.fillText(displayStr, 512, 146);
    }

    mat.map?.dispose();
    const newTexture = new THREE.CanvasTexture(canvas);
    newTexture.generateMipmaps = false;
    mat.map = newTexture;
    mat.needsUpdate = true;
  }

  /**
   * Set or update active entity
   */
  public activate(position: THREE.Vector3, imageUrl?: string, title?: string, category?: string) {
    this.group.position.copy(position);
    this.group.visible = true;
    this.targetScale = 1.0;
    this.updateTitlePlaque(title, category);

    // Load or clear circular archival image
    if (imageUrl && imageUrl !== this.activeImageUrl) {
      this.activeImageUrl = imageUrl;
      this.loadArchivalPortrait(imageUrl);
    } else if (!imageUrl && this.portraitMesh) {
      this.activeImageUrl = null;
      (this.portraitMesh.material as THREE.MeshBasicMaterial).opacity = 0.0;
    }
  }

  public deactivate() {
    this.targetScale = 0.0;
  }

  private loadArchivalPortrait(url: string) {
    if (!this.portraitMesh) return;

    const SIZE = 512;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      if (!ctx || !this.portraitMesh) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // 1. Clip to circle FIRST
      ctx.save();
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // 2. Center-crop draw (object-fit: cover equivalent)
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const scale = Math.max(SIZE / imgW, SIZE / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const offsetX = (SIZE - drawW) / 2;
      const offsetY = (SIZE - drawH) / 2;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      // 3. Subtle warm overlay — very light sepia tint (not a wash)
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#D4A96A';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';

      ctx.restore(); // end clip

      // 4. Feathered vignette edge using destination-out (cuts alpha, not colour)
      const vignette = ctx.createRadialGradient(
        SIZE / 2, SIZE / 2, SIZE * 0.38,
        SIZE / 2, SIZE / 2, SIZE / 2 - 2
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.75, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'source-over';

      // 5. Antique brass inner border ring
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(196, 154, 69, 0.55)';
      ctx.lineWidth = 4;
      ctx.stroke();

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const mat = this.portraitMesh.material as THREE.MeshBasicMaterial;
      mat.map = texture;
      mat.opacity = 0.97;
      mat.transparent = true;
      mat.needsUpdate = true;
    };

    img.onerror = () => {
      // On load failure: show a placeholder brass disc
      if (!ctx || !this.portraitMesh) return;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(164, 119, 69, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(196, 154, 69, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
      const texture = new THREE.CanvasTexture(canvas);
      const mat = this.portraitMesh.material as THREE.MeshBasicMaterial;
      mat.map = texture;
      mat.opacity = 0.7;
      mat.needsUpdate = true;
    };
  }

  public update(time: number, cameraPosition: THREE.Vector3) {
    // Smooth scaling transition
    this.currentScale = THREE.MathUtils.lerp(this.currentScale, this.targetScale, 0.1);
    if (this.currentScale < 0.01 && this.targetScale === 0) {
      this.group.visible = false;
      return;
    }

    const s = this.currentScale;
    this.group.scale.set(s, s, s);

    // Gentle vertical floating oscillation
    const floatOffset = Math.sin(time * 1.6) * 0.45;
    if (this.orbMesh) {
      this.orbMesh.position.y = floatOffset;
    }
    if (this.portraitMesh) {
      this.portraitMesh.position.y = floatOffset;
      // Billboard face towards camera
      this.portraitMesh.lookAt(cameraPosition);
    }
    if (this.interiorLight) {
      this.interiorLight.position.y = floatOffset;
    }

    // Counter-rotating antique brass ring
    this.ringGroup.rotation.y = time * 0.22;
    this.ringGroup.rotation.z = Math.sin(time * 0.12) * 0.1;
  }

  public dispose() {
    if (this.orbMesh) {
      this.orbMesh.geometry.dispose();
      (this.orbMesh.material as THREE.Material).dispose();
    }
    if (this.ringMesh) {
      this.ringMesh.geometry.dispose();
      (this.ringMesh.material as THREE.Material).dispose();
    }
    if (this.portraitMesh) {
      this.portraitMesh.geometry.dispose();
      (this.portraitMesh.material as THREE.Material).dispose();
    }
    this.group.clear();
  }
}
