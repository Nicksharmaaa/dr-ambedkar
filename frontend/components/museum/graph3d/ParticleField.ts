import * as THREE from 'three';
import { MUSEUM_PALETTE, QualityTier } from './types';

/**
 * ParticleField
 * Generates an organic, breathing spherical cloud of thousands of tiny archival fragments.
 * Uses GPU BufferGeometry and ShaderMaterial with depth attenuation, subtle rotation,
 * and seamless focus transition when an entity is selected.
 */
export class ParticleField {
  public group: THREE.Group;
  private points: THREE.Points | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private particleCount: number = 4500;
  private radius: number = 75;

  constructor(quality: QualityTier = 'HIGH', radius: number = 75) {
    this.group = new THREE.Group();
    this.radius = radius;
    this.particleCount = quality === 'HIGH' ? 5000 : quality === 'MEDIUM' ? 3200 : 1800;
    this.init();
  }

  private init() {
    // 1. Build deterministic Fibonacci spherical distribution with low-frequency noise
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    const alphas = new Float32Array(this.particleCount);
    const phases = new Float32Array(this.particleCount);

    const gold1 = new THREE.Color(MUSEUM_PALETTE.particleGold);
    const gold2 = new THREE.Color(MUSEUM_PALETTE.particleGold2);
    const parchment = new THREE.Color(MUSEUM_PALETTE.parchment);
    const faded = new THREE.Color(MUSEUM_PALETTE.particleFaded);
    const accent = new THREE.Color(MUSEUM_PALETTE.accentBrass);

    const paletteSamples = [gold1, gold2, parchment, faded, accent];

    // Golden ratio for Fibonacci sphere
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < this.particleCount; i++) {
      // Deterministic spherical distribution
      const y = 1 - (i / (this.particleCount - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      // Pseudo-random deterministic noise based on index
      const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      const noiseR = (seed - Math.floor(seed)) * 0.35 - 0.175; // -0.175 to +0.175 radial variation
      const shellVariation = Math.sin(theta * 3.0 + y * 5.0) * 0.12;

      // Radial distribution has depth: hollower inside, denser on the organic shell
      const rScale = this.radius * (0.82 + noiseR + shellVariation);

      const x = Math.cos(theta) * radiusAtY * rScale;
      const py = y * rScale;
      const z = Math.sin(theta) * radiusAtY * rScale;

      positions[i * 3] = x;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = z;

      // Color variation across museum palette
      const colorIndex = Math.floor((seed - Math.floor(seed)) * paletteSamples.length) % paletteSamples.length;
      const col = paletteSamples[colorIndex];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      // Multiple fragment sizes (small dust shards to miniature paper fragments)
      const sizeSample = (seed * 10 - Math.floor(seed * 10));
      sizes[i] = sizeSample > 0.85 ? 4.5 : sizeSample > 0.4 ? 2.8 : 1.6;

      // Opacity variation
      alphas[i] = 0.35 + sizeSample * 0.55;

      // Individual breathing phase offset
      phases[i] = (i / this.particleCount) * Math.PI * 2.0;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    this.geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    // Custom Shader for soft archival fragments with depth attenuation
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDimFactor: { value: 0.0 }, // 0.0 = full idle brightness, 1.0 = dimmed during selection
        uFocusPoint: { value: new THREE.Vector3(0, 0, 0) },
        uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.75) : 1.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uDimFactor;
        uniform vec3 uFocusPoint;
        uniform float uPixelRatio;

        attribute vec3 customColor;
        attribute float size;
        attribute float alpha;
        attribute float phase;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = customColor;

          // Organic breathing & gentle drift
          vec3 pos = position;
          float breathe = sin(uTime * 0.8 + phase) * 1.5;
          float swayX = cos(uTime * 0.35 + pos.y * 0.04) * 1.2;
          float swayZ = sin(uTime * 0.35 + pos.x * 0.04) * 1.2;
          pos += normalize(pos) * breathe + vec3(swayX, 0.0, swayZ);

          // If an entity is selected, particles further from focus dim out
          float distToFocus = length(pos - uFocusPoint);
          float proximityBoost = clamp(1.0 - distToFocus / 40.0, 0.0, 1.0);
          float targetAlpha = alpha * mix(1.0, 0.18 + proximityBoost * 0.5, uDimFactor);
          vAlpha = targetAlpha;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Depth attenuation on point size
          gl_PointSize = size * uPixelRatio * (60.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Render soft rectangular / circular paper fragment
          vec2 coord = gl_PointCoord - vec2(0.5);
          float distSq = dot(coord, coord);
          if (distSq > 0.25) discard;

          // Soft feathered edge resembling archival dust/paper shard
          float edgeAlpha = smoothstep(0.25, 0.08, distSq);
          gl_FragColor = vec4(vColor, vAlpha * edgeAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);
  }

  public update(time: number, isSelected: boolean, focusPos?: THREE.Vector3) {
    if (!this.material) return;
    this.material.uniforms.uTime.value = time;

    // Smooth lerp dim factor
    const targetDim = isSelected ? 0.78 : 0.0;
    this.material.uniforms.uDimFactor.value = THREE.MathUtils.lerp(
      this.material.uniforms.uDimFactor.value,
      targetDim,
      0.06
    );

    if (focusPos) {
      this.material.uniforms.uFocusPoint.value.copy(focusPos);
    }

    // Ambient slow rotation (~0.035 rad/s)
    if (this.points) {
      this.points.rotation.y = time * 0.032;
      this.points.rotation.x = Math.sin(time * 0.015) * 0.04;
    }
  }

  public setPixelRatio(ratio: number) {
    if (this.material) {
      this.material.uniforms.uPixelRatio.value = Math.min(ratio, 1.75);
    }
  }

  public dispose() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.points) this.group.remove(this.points);
    this.geometry = null;
    this.material = null;
    this.points = null;
  }
}
