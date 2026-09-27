'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { HeritageLocation } from './MemorialsView';
import { Globe, RotateCcw, ZoomIn, ZoomOut, MapPin, Sparkles, Navigation } from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';

interface MemorialGlobeProps {
  locations: HeritageLocation[];
  selectedLocation: HeritageLocation | null;
  onSelectLocation: (location: HeritageLocation | null) => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Mathematically exact Latitude & Longitude to 3D Cartesian coordinates
 * Perfectly aligned with Three.js SphereGeometry UV texture mapping:
 * - u goes from 0 (lon -180°) to 1.0 (lon +180°)
 * - v goes from 0 (lat +90° North Pole) to 1.0 (lat -90° South Pole)
 */
function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (lon + 180) * (Math.PI / 180);
  const theta = (90 - lat) * (Math.PI / 180);

  const x = -radius * Math.cos(phi) * Math.sin(theta);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

export const MemorialGlobe: React.FC<MemorialGlobeProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  className = '',
  children,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePinName, setActivePinName] = useState<string | null>(null);

  // Three.js State Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Rotation & Targeting State
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const activeBaseTargetRef = useRef<{ x: number; y: number } | null>(null);
  const selectedLocationRef = useRef<HeritageLocation | null>(null);
  const lastDragTimeRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const previousMousePosRef = useRef({ x: 0, y: 0 });
  const idleSpeedRef = useRef(0.0014);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const GLOBE_RADIUS = 5;

  // Initialize Photorealistic Three.js Earth Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (Orbital perspective)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 13.5);
    cameraRef.current = camera;

    // WebGL Renderer with physical tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030712, 1); // Deep Cosmic Night Sky
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Master Earth Group (Carries the Earth, clouds, pins, and journey arcs)
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Texture Loader for NASA Blue Marble Satellite Textures
    const textureLoader = new THREE.TextureLoader();

    // 1. Photorealistic Earth Sphere with Satellite Surface & Normal Topography
    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    
    // Load local satellite textures
    const dayTexture = textureLoader.load('/images/globe/earth_day.jpg');
    const normalTexture = textureLoader.load('/images/globe/earth_normal.jpg');
    const specularTexture = textureLoader.load('/images/globe/earth_specular.jpg');

    // Rich physical material simulating ocean glint, terrain relief and realistic daylight
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.85, 0.85),
      specularMap: specularTexture,
      specular: new THREE.Color(0x445566),
      shininess: 30,
      emissive: new THREE.Color(0x040810),
      emissiveIntensity: 0.1,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 2. Realistic Dynamic Cloud Layer (Drifts independently above surface)
    const cloudsGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.018, 64, 64);
    const cloudsTexture = textureLoader.load('/images/globe/earth_clouds.png');
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.38, // Soft, natural cloud opacity so satellite geography remains clear
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    earthGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 3. Ethereal Atmospheric Rayleigh Glow Halo (Soft cyan-blue haze)
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.35, 0.65, 1.0, 1.0) * intensity * 0.95;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 4. Multi-spectral Deep Cosmic Background Stars (Soft diamond, ice blue & subtle gold)
    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 90;
      starPositions[idx + 1] = (Math.random() - 0.5) * 90;
      starPositions[idx + 2] = -25 - Math.random() * 45;

      const roll = Math.random();
      if (roll < 0.65) {
        // Pure diamond white
        starColors[idx] = 0.95;
        starColors[idx + 1] = 0.96;
        starColors[idx + 2] = 1.0;
      } else if (roll < 0.85) {
        // Ice blue
        starColors[idx] = 0.65;
        starColors[idx + 1] = 0.82;
        starColors[idx + 2] = 1.0;
      } else {
        // Warm gold dust
        starColors[idx] = 0.96;
        starColors[idx + 1] = 0.85;
        starColors[idx + 2] = 0.55;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.42,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 5. Pins Group for Memorials
    const pinsGroup = new THREE.Group();
    earthGroup.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // 6. Flight / Journey Arcs Group
    const arcsGroup = new THREE.Group();
    earthGroup.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    // Balanced Cinematic Lighting: Daylight illuminating all continents naturally without blowout
    const ambientLight = new THREE.AmbientLight(0xdde8f5, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.45);
    sunLight.position.set(14, 10, 14);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x385575, 0.55);
    fillLight.position.set(-14, -6, 10);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc89d56, 0.65);
    rimLight.position.set(-16, 8, -12);
    scene.add(rimLight);

    // Initial View Position centered towards India (lon ~78° E, lat ~22° N)
    const initTargetY = -(78 * Math.PI / 180) - (Math.PI / 2);
    const initTargetX = (22 * Math.PI / 180) * 0.7;
    earthGroup.rotation.y = initTargetY;
    earthGroup.rotation.x = initTargetX;

    // Handle Window/Container Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 60fps Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Atmospheric clouds drift continuously across the surface of Earth
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.00042;
      }

      // Dynamic breathing atmospheric Rayleigh halo
      if (atmosphereMeshRef.current) {
        const atmScale = 1.0 + Math.sin(elapsedTime * 0.8) * 0.004;
        atmosphereMeshRef.current.scale.set(atmScale, atmScale, atmScale);
      }

      // Cinematic subtle camera breathing float for depth
      if (cameraRef.current) {
        cameraRef.current.position.y = Math.sin(elapsedTime * 0.4) * 0.035;
      }

      const isDragging = isDraggingRef.current;
      const timeSinceDrag = Date.now() - lastDragTimeRef.current;

      // Earth Positioning & Rotation Dynamics
      if (!isDragging && activeBaseTargetRef.current) {
        // --- SCENARIO 1: A MEMORIAL LOCATION IS SELECTED ---
        // Lock globe on this location, but provide subtle living movement (orbital sway & planetary float)
        // Allow a 1.2s inspection window if user was manually dragging
        if (timeSinceDrag > 1200) {
          // Living planetary hover / gentle orbital micro-sway (compound harmonic)
          // Keeps memorial pin centered in view while Earth feels physical, alive and floating
          const microSwayY = isAutoRotating
            ? (Math.sin(elapsedTime * 0.7) * 0.012 + Math.cos(elapsedTime * 0.35) * 0.005)
            : 0;
          const microSwayX = isAutoRotating
            ? (Math.cos(elapsedTime * 0.5) * 0.008 + Math.sin(elapsedTime * 0.25) * 0.004)
            : 0;

          const desiredTargetY = activeBaseTargetRef.current.y + microSwayY;
          const desiredTargetX = activeBaseTargetRef.current.x + microSwayX;

          // Shortest angular turn around the globe
          let diffY = (desiredTargetY - earthGroup.rotation.y) % (Math.PI * 2);
          if (diffY > Math.PI) diffY -= Math.PI * 2;
          if (diffY < -Math.PI) diffY += Math.PI * 2;

          // Smooth lerp: fast enough to glide into place, gentle enough to damp oscillation
          earthGroup.rotation.y += diffY * 0.048;
          earthGroup.rotation.x += (desiredTargetX - earthGroup.rotation.x) * 0.048;
        }
      } else if (!isDragging && targetRotationRef.current) {
        // --- SCENARIO 2: ONE-OFF TARGETING (e.g. Reset View when no location is active) ---
        const { x: targetX, y: targetY } = targetRotationRef.current;
        let diffY = (targetY - earthGroup.rotation.y) % (Math.PI * 2);
        if (diffY > Math.PI) diffY -= Math.PI * 2;
        if (diffY < -Math.PI) diffY += Math.PI * 2;

        earthGroup.rotation.y += diffY * 0.055;
        earthGroup.rotation.x += (targetX - earthGroup.rotation.x) * 0.055;

        // When arrived, clear one-off target and resume normal auto-rotation
        if (Math.abs(diffY) < 0.003 && Math.abs(targetX - earthGroup.rotation.x) < 0.003) {
          targetRotationRef.current = null;
        }
      } else if (!isDragging && isAutoRotating) {
        // --- SCENARIO 3: NO LOCATION SELECTED & AUTO-ROTATING ---
        // Continuous smooth 360° global rotation
        earthGroup.rotation.y += idleSpeedRef.current;
      }

      // Animate Active Map Pin Location Icon (Hover bounce, camera-facing yaw, jewel pulse, and ground ripple)
      pinsGroup.children.forEach((pinObj: any) => {
        const u = pinObj.userData;
        if (!u) return;

        // 1. Subtle, gentle breathing hover
        const hover = Math.sin(elapsedTime * 2.8) * 0.015;
        if (u.pinBodyGroup) {
          u.pinBodyGroup.position.y = 0.06 + hover;

          // 2. Rotate around normal axis so location beacon & eye face the camera directly
          const pinWorldPos = new THREE.Vector3();
          u.pinBodyGroup.getWorldPosition(pinWorldPos);
          const toCamWorld = camera.position.clone().sub(pinWorldPos);

          const worldQuat = pinObj.getWorldQuaternion(new THREE.Quaternion());
          const worldUp = new THREE.Vector3(0, 1, 0).applyQuaternion(worldQuat);
          const forward = toCamWorld.clone().projectOnPlane(worldUp).normalize();
          const invQuat = worldQuat.clone().invert();
          const localForward = forward.clone().applyQuaternion(invQuat);
          const targetYaw = Math.atan2(localForward.x, localForward.z);

          u.pinBodyGroup.rotation.y = targetYaw;
        }

        // 3. Glowing amber jewel eye pulse
        if (u.jewelMesh && u.jewelMesh.material) {
          u.jewelMesh.material.emissiveIntensity = 0.9 + Math.sin(elapsedTime * 3.5) * 0.45;
        }

        // 4. Expanding subtle radar ripple wave on Earth surface
        if (u.radarRing) {
          const progress = (elapsedTime * 0.75) % 1;
          const scale = 1 + progress * 2.2;
          u.radarRing.scale.set(scale, scale, 1);
          u.radarRing.material.opacity = (1 - progress) * 0.65;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      dayTexture.dispose();
      normalTexture.dispose();
      specularTexture.dispose();
      cloudsTexture.dispose();
    };
  }, []);

  // Update 3D Pin whenever selectedLocation changes
  // REQUIREMENT: Only the active location displays a pin; modeled as classic 3D location marker icon!
  useEffect(() => {
    if (!pinsGroupRef.current || !arcsGroupRef.current) return;
    const pinsGroup = pinsGroupRef.current;
    const arcsGroup = arcsGroupRef.current;

    // Helper to deeply dispose geometries and materials
    const disposeHierarchy = (obj: any) => {
      if (!obj) return;
      if (obj.children && obj.children.length > 0) {
        for (let i = obj.children.length - 1; i >= 0; i--) {
          disposeHierarchy(obj.children[i]);
          obj.remove(obj.children[i]);
        }
      }
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    };

    // Clean up previous 3D pin & any arcs
    while (pinsGroup.children.length > 0) {
      disposeHierarchy(pinsGroup.children[0]);
      pinsGroup.remove(pinsGroup.children[0]);
    }

    while (arcsGroup.children.length > 0) {
      disposeHierarchy(arcsGroup.children[0]);
      arcsGroup.remove(arcsGroup.children[0]);
    }

    // If no active location is selected, do NOT render any pin!
    if (!selectedLocation) {
      return;
    }

    // Construct the iconic 3D Location Marker Pin
    const loc = selectedLocation;
    const surfacePos = latLongToVector3(loc.coordinates.latitude, loc.coordinates.longitude, GLOBE_RADIUS);
    const normal = surfacePos.clone().normalize();

    // Pin Group (Oriented perpendicularly to Earth's surface)
    const pinContainer = new THREE.Group();
    pinContainer.position.copy(surfacePos);
    pinContainer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    pinContainer.userData = { location: loc, isSelected: true };

    // --- 1. Ground Surface Reticle & Contact Elements ---
    // Contact Target Needle Point Dot
    const contactGeo = new THREE.SphereGeometry(0.024, 16, 16);
    const contactMat = new THREE.MeshBasicMaterial({ color: 0xfcd34d });
    const contactDot = new THREE.Mesh(contactGeo, contactMat);
    contactDot.position.y = 0.015;
    pinContainer.add(contactDot);

    // Inner Target Reticle Ring
    const innerRingGeo = new THREE.RingGeometry(0.05, 0.075, 32);
    innerRingGeo.rotateX(-Math.PI / 2);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.position.y = 0.012;
    pinContainer.add(innerRing);

    // Expanding Pulse Radar Wave
    const radarGeo = new THREE.RingGeometry(0.08, 0.13, 32);
    radarGeo.rotateX(-Math.PI / 2);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const radarRing = new THREE.Mesh(radarGeo, radarMat);
    radarRing.position.y = 0.010;
    pinContainer.add(radarRing);
    pinContainer.userData.radarRing = radarRing;

    // --- 2. The Sculpted 3D Map Pin Body (Clean, Aesthetic & Fully 3D) ---
    const pinBodyGroup = new THREE.Group();
    pinBodyGroup.position.y = 0.06;

    // A. Slender Anchoring Stem Needle
    const stemGeo = new THREE.CylinderGeometry(0.009, 0.005, 0.14, 16);
    stemGeo.translate(0, 0.07, 0);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x78350f,
      emissiveIntensity: 0.2,
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    pinBodyGroup.add(stemMesh);

    // B. Inverted Tapered Lower Cone (smooth transition to head)
    const headRadius = 0.135;
    const coneHeight = 0.24;
    const coneCenterY = 0.14 + coneHeight / 2; // 0.26
    const coneGeo = new THREE.ConeGeometry(headRadius, coneHeight, 32);
    coneGeo.rotateX(Math.PI); // Point downwards to ground
    coneGeo.translate(0, coneCenterY, 0);

    // C. Upper Hemispherical Dome (caps the cone flawlessly)
    const sphereCenterY = 0.14 + coneHeight; // 0.38
    const domeGeo = new THREE.SphereGeometry(headRadius, 32, 24);
    domeGeo.translate(0, sphereCenterY, 0);

    // Pin Body Material (Royal Curatorial Satin Gold)
    const pinBodyMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.22,
      metalness: 0.8,
      emissive: 0x451a03,
      emissiveIntensity: 0.25,
    });

    const coneMesh = new THREE.Mesh(coneGeo, pinBodyMat);
    const domeMesh = new THREE.Mesh(domeGeo, pinBodyMat);
    pinBodyGroup.add(coneMesh);
    pinBodyGroup.add(domeMesh);

    // D. Inset Center Jewel Eye (through the center of the dome)
    const eyeBoreGeo = new THREE.CylinderGeometry(0.062, 0.062, headRadius * 2.05, 32);
    eyeBoreGeo.rotateX(Math.PI / 2);
    eyeBoreGeo.translate(0, sphereCenterY, 0);
    const eyeBoreMat = new THREE.MeshStandardMaterial({
      color: 0x061524,
      metalness: 0.5,
      roughness: 0.5,
    });
    const eyeBoreMesh = new THREE.Mesh(eyeBoreGeo, eyeBoreMat);
    pinBodyGroup.add(eyeBoreMesh);

    // E. Glowing Luminous Beacon Core (radiant warm jewel lens)
    const jewelGeo = new THREE.SphereGeometry(0.048, 24, 24);
    jewelGeo.translate(0, sphereCenterY, 0);
    const jewelMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfbbf24,
      emissiveIntensity: 1.1,
      roughness: 0.1,
      metalness: 0.1,
    });
    const jewelMesh = new THREE.Mesh(jewelGeo, jewelMat);
    pinBodyGroup.add(jewelMesh);
    pinContainer.userData.jewelMesh = jewelMesh;

    // F. Floating Curatorial Location Label Pill (Above the pin)
    try {
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512;
      labelCanvas.height = 120;
      const ctx = labelCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 512, 120);

        // Draw glassmorphic rounded capsule
        const padX = 24, padY = 16, w = 464, h = 88, r = 26;
        ctx.fillStyle = 'rgba(6, 21, 36, 0.92)';
        ctx.strokeStyle = '#C89D56';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(padX + r, padY);
        ctx.lineTo(padX + w - r, padY);
        ctx.arcTo(padX + w, padY, padX + w, padY + r, r);
        ctx.lineTo(padX + w, padY + h - r);
        ctx.arcTo(padX + w, padY + h, padX + w - r, padY + h, r);
        ctx.lineTo(padX + r, padY + h);
        ctx.arcTo(padX, padY + h, padX, padY + r, r);
        ctx.lineTo(padX, padY + r);
        ctx.arcTo(padX, padY, padX + r, padY, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Subtle gold glow
        ctx.shadowColor = '#C89D56';
        ctx.shadowBlur = 10;

        // Memorial Name Text
        const displayName = loc.name.length > 24 ? loc.name.substring(0, 22) + '...' : loc.name;
        ctx.font = 'bold 30px "DM Sans", -apple-system, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`📍 ${displayName}`, 256, 50);

        // City / Country subtitle
        ctx.font = '500 18px "DM Sans", sans-serif';
        ctx.fillStyle = '#C89D56';
        ctx.fillText(`${loc.city}, ${loc.country}`, 256, 78);

        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        labelTexture.needsUpdate = true;
        const labelMat = new THREE.SpriteMaterial({
          map: labelTexture,
          transparent: true,
          depthTest: false,
        });
        const labelSprite = new THREE.Sprite(labelMat);
        labelSprite.position.set(0, sphereCenterY + 0.24, 0);
        labelSprite.scale.set(0.72, 0.17, 1);
        pinBodyGroup.add(labelSprite);
      }
    } catch (e) {
      console.warn('Could not generate label sprite:', e);
    }

    pinContainer.add(pinBodyGroup);
    pinContainer.userData.pinBodyGroup = pinBodyGroup;

    pinsGroup.add(pinContainer);
  }, [selectedLocation]);

  // Pivot and Lock Globe when Selected Location changes
  useEffect(() => {
    selectedLocationRef.current = selectedLocation;

    if (!selectedLocation || !earthGroupRef.current) {
      activeBaseTargetRef.current = null;
      targetRotationRef.current = null;
      return;
    }

    const lat = selectedLocation.coordinates.latitude;
    const lon = selectedLocation.coordinates.longitude;

    // Calculate rotation to place location directly in front of camera
    // Camera is at (0, 0, Z) looking at (0, 0, 0)
    // Formula derived from Three.js UV orientation:
    const targetY = -(lon * Math.PI / 180) - (Math.PI / 2);
    const targetX = (lat * Math.PI / 180) * 0.7; // Pleasant downward perspective tilt

    activeBaseTargetRef.current = { x: targetX, y: targetY };
    targetRotationRef.current = { x: targetX, y: targetY };
    setActivePinName(`${selectedLocation.name} · ${selectedLocation.city}`);
  }, [selectedLocation]);

  // Pointer Drag Orbit Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastDragTimeRef.current = Date.now();
    previousMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!earthGroupRef.current) return;

    if (isDraggingRef.current) {
      lastDragTimeRef.current = Date.now();
      const deltaX = e.clientX - previousMousePosRef.current.x;
      const deltaY = e.clientY - previousMousePosRef.current.y;

      earthGroupRef.current.rotation.y += deltaX * 0.005;
      earthGroupRef.current.rotation.x = Math.max(
        -Math.PI / 2.5,
        Math.min(Math.PI / 2.5, earthGroupRef.current.rotation.x + deltaY * 0.005)
      );

      previousMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else if (mountRef.current && cameraRef.current && pinsGroupRef.current) {
      // Raycasting for hover tooltip
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);

      if (intersects.length > 0) {
        let rootGroup: any = intersects[0].object;
        while (rootGroup.parent && rootGroup.parent !== pinsGroupRef.current) {
          rootGroup = rootGroup.parent;
        }
        if (rootGroup.userData && rootGroup.userData.location) {
          setActivePinName(`${rootGroup.userData.location.name}`);
        }
      } else {
        setActivePinName(null);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    lastDragTimeRef.current = Date.now();

    // If it was a quick click without drag, raycast to select pin
    if (mountRef.current && cameraRef.current && pinsGroupRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
      const clickDist = Math.hypot(e.clientX - previousMousePosRef.current.x, e.clientY - previousMousePosRef.current.y);

      if (clickDist < 5) {
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);

        if (intersects.length > 0) {
          let rootGroup: any = intersects[0].object;
          while (rootGroup.parent && rootGroup.parent !== pinsGroupRef.current) {
            rootGroup = rootGroup.parent;
          }
          if (rootGroup.userData && rootGroup.userData.location) {
            soundEffects.playClick();
            onSelectLocation(rootGroup.userData.location);
          }
        }
      }
    }
  };

  // Zoom Controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    soundEffects.playClick();
    const newZ = direction === 'in' ? Math.max(8.5, cameraRef.current.position.z - 2) : Math.min(22, cameraRef.current.position.z + 2);
    cameraRef.current.position.z = newZ;
    setZoomLevel(Number((13.5 / newZ).toFixed(1)));
  };

  // Smooth Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const delta = e.deltaY * 0.005;
    const newZ = Math.max(7.5, Math.min(22, cameraRef.current.position.z + delta));
    cameraRef.current.position.z = newZ;
    setZoomLevel(Number((13.5 / newZ).toFixed(1)));
  };

  // Reset to default Indian Peninsula orientation
  const handleResetView = () => {
    soundEffects.playClick();
    activeBaseTargetRef.current = null;
    targetRotationRef.current = { 
      x: (22 * Math.PI / 180) * 0.7, 
      y: -(78 * Math.PI / 180) - (Math.PI / 2) 
    };
    if (cameraRef.current) cameraRef.current.position.z = 13.5;
    setZoomLevel(1);
    if (selectedLocation) {
      onSelectLocation(null);
    }
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border-2 border-[#D3D4C0] bg-[#030712] shadow-2xl ${className}`}>
      
      {/* 3D WebGL Canvas Mount (Earth Globe in Center) */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        style={{ width: '100%', height: '100%', minHeight: '560px', touchAction: 'none' }}
      />

      {/* Top Center: Orbital Navigation & Zoom Controls (Curatorial Glass HUD) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1.5 bg-[#061524]/90 backdrop-blur-md border border-[#C89D56]/40 p-1.5 rounded-2xl shadow-xl text-[#F3E4C9]">
        <div className="px-2.5 py-1 text-[11px] font-mono font-bold text-[#F3E4C9] flex items-center gap-1.5 border-r border-[#C89D56]/30 pr-2.5 mr-0.5">
          <Globe className="w-3.5 h-3.5 text-[#C89D56] animate-spin" style={{ animationDuration: '16s' }} />
          <span>Orbital Earth</span>
        </div>

        <button
          type="button"
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-1.5 rounded-xl text-[#F3E4C9] hover:bg-[#C89D56]/25 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-1.5 rounded-xl text-[#F3E4C9] hover:bg-[#C89D56]/25 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetView}
          title="Reset to India View"
          className="p-1.5 rounded-xl text-[#F3E4C9] hover:bg-[#C89D56]/25 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            if (selectedLocation) {
              onSelectLocation(null);
              setIsAutoRotating(true);
            } else {
              setIsAutoRotating(!isAutoRotating);
            }
          }}
          title={selectedLocation ? "Unlock location & resume 360° spin" : (isAutoRotating ? "Pause Auto-Rotation" : "Resume Auto-Rotation")}
          className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer ${
            selectedLocation 
              ? 'bg-[#C89D56] text-[#0A2947] hover:bg-white shadow-xs' 
              : (isAutoRotating 
                  ? 'bg-[#C89D56] text-[#0A2947] shadow-xs' 
                  : 'text-[#F3E4C9] hover:bg-[#C89D56]/20')
          }`}
        >
          {selectedLocation ? '📍 Locked (Free Spin)' : (isAutoRotating ? 'Spinning' : 'Paused')}
        </button>
      </div>

      {/* Spatial Overlays (Left Locations Panel & Right Descriptive Card) */}
      {children}

      {/* Bottom Center Indicator Tip */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden lg:flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#F3E4C9]/85 bg-[#061524]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#C89D56]/30 shadow-lg">
        <Navigation className="w-3.5 h-3.5 text-[#C89D56]" />
        <span>Click card to pinpoint · Drag Earth to rotate · Scroll to zoom</span>
      </div>

    </div>
  );
};

export default MemorialGlobe;
