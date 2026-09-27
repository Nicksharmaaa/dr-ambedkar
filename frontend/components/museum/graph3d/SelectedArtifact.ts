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

    // 4. Portrait Plane Container (created on demand)
    const portraitGeo = new THREE.PlaneGeometry(6.4, 6.4);
    const portraitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
    this.portraitMesh.position.z = 0.05;
    this.group.add(this.portraitMesh);

    // Start hidden
    this.group.scale.set(0.001, 0.001, 0.001);
    this.group.visible = false;
  }

  /**
   * Set or update active entity
   */
  public activate(position: THREE.Vector3, imageUrl?: string) {
    this.group.position.copy(position);
    this.group.visible = true;
    this.targetScale = 1.0;

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

    // Create a circular masked canvas texture to prevent raw rectangle edges
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, 512, 512);

      // Radial vignette / feathered circular mask
      const gradient = ctx.createRadialGradient(256, 256, 170, 256, 256, 250);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.85, 'rgba(0,0,0,0.9)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.beginPath();
      ctx.arc(256, 256, 240, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, 512, 512);
      ctx.restore();

      // Apply warm sepia/museum tint
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#FAF2E4';
      ctx.fillRect(0, 0, 512, 512);
      ctx.globalCompositeOperation = 'source-over';

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      if (this.portraitMesh) {
        const mat = this.portraitMesh.material as THREE.MeshBasicMaterial;
        mat.map = texture;
        mat.opacity = 0.84;
        mat.needsUpdate = true;
      }
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
