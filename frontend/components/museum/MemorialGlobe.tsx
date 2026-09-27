'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { HeritageLocation } from './MemorialsView';
import { Globe, RotateCcw, ZoomIn, ZoomOut, MapPin, Sparkles, Navigation } from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';

interface MemorialGlobeProps {
  locations: HeritageLocation[];
  selectedLocation: HeritageLocation | null;
  onSelectLocation: (location: HeritageLocation) => void;
  className?: string;
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
  className = ''
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
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Rotation & Targeting State
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
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
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (Orbital perspective)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14.5);
    cameraRef.current = camera;

    // WebGL Renderer with physical tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020813, 1); // Deep cosmic black-blue
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
      shininess: 28,
      emissive: new THREE.Color(0x030d18),
      emissiveIntensity: 0.12,
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
      opacity: 0.75,
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

    // 4. Subtle Cosmic Background Stars
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 80;
      starPositions[i + 2] = -25 - Math.random() * 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xc89d56, size: 0.45, transparent: true, opacity: 0.6 });
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

    // Cinematic Sunlight & Fill Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.9);
    sunLight.position.set(16, 9, 14);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1a2e48, 1.25);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x2a5298, 1.2);
    rimLight.position.set(-18, -6, -12);
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

      // Atmospheric clouds drift continuously and independently from Earth
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0004;
      }

      // Smooth targeting rotation towards selected location
      if (targetRotationRef.current && !isDraggingRef.current) {
        const { x: targetX, y: targetY } = targetRotationRef.current;
        
        let diffY = (targetY - earthGroup.rotation.y);
        while (diffY > Math.PI) diffY -= Math.PI * 2;
        while (diffY < -Math.PI) diffY += Math.PI * 2;

        earthGroup.rotation.y += diffY * 0.055;
        earthGroup.rotation.x += (targetX - earthGroup.rotation.x) * 0.055;

        // When close enough, seamlessly continue auto-rotation
        if (Math.abs(diffY) < 0.003 && Math.abs(targetX - earthGroup.rotation.x) < 0.003) {
          targetRotationRef.current = null;
        }
      } else if (!isDraggingRef.current && isAutoRotating) {
        // Continuous smooth Earth auto-rotation
        earthGroup.rotation.y += idleSpeedRef.current;
      }

      // Animate pulsing ground beacon rings on pins
      pinsGroup.children.forEach((pinObj: any) => {
        if (pinObj.userData && pinObj.userData.beaconRing) {
          const ring = pinObj.userData.beaconRing;
          const isSelected = pinObj.userData.isSelected;
          const speed = isSelected ? 3.5 : 2;
          const pulse = (Math.sin(elapsedTime * speed) + 1) / 2;
          ring.scale.set(1 + pulse * 0.7, 1 + pulse * 0.7, 1);
          ring.material.opacity = isSelected ? (0.85 - pulse * 0.45) : (0.45 - pulse * 0.3);
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

  // Update 3D Pins & Journey Arcs whenever locations or selection changes
  useEffect(() => {
    if (!pinsGroupRef.current || !arcsGroupRef.current) return;
    const pinsGroup = pinsGroupRef.current;
    const arcsGroup = arcsGroupRef.current;

    // Clear previous pins & arcs
    while (pinsGroup.children.length > 0) {
      const child: any = pinsGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      pinsGroup.remove(child);
    }

    while (arcsGroup.children.length > 0) {
      const child: any = arcsGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      arcsGroup.remove(child);
    }

    // Add Pins for each Heritage Location with EXACT Spherical Coordinates
    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const surfacePos = latLongToVector3(loc.coordinates.latitude, loc.coordinates.longitude, GLOBE_RADIUS);
      const normal = surfacePos.clone().normalize();

      // Pin Container Group (Oriented perpendicularly to Earth surface)
      const pinContainer = new THREE.Group();
      pinContainer.position.copy(surfacePos);
      pinContainer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      pinContainer.userData = { location: loc, isSelected };

      // 1. Slender Needle Stem (Cylinder extending out from surface)
      const stemHeight = isSelected ? 0.95 : 0.6;
      const stemGeo = new THREE.CylinderGeometry(0.025, 0.04, stemHeight, 16);
      stemGeo.translate(0, stemHeight / 2, 0);
      const stemMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xffea9f : 0xf3e4c9,
        roughness: 0.2,
        metalness: 0.85,
        emissive: isSelected ? 0xc89d56 : 0x000000,
        emissiveIntensity: isSelected ? 0.6 : 0,
      });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      pinContainer.add(stemMesh);

      // 2. Glowing Beacon Sphere
      const beadRadius = isSelected ? 0.22 : 0.15;
      const beadGeo = new THREE.SphereGeometry(beadRadius, 16, 16);
      const isIndia = loc.country === 'India';
      const beadMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xffffff : (isIndia ? 0xffb74d : 0x4fc3f7),
        emissive: isSelected ? 0xffd54f : (isIndia ? 0xff9800 : 0x0288d1),
        emissiveIntensity: isSelected ? 1.0 : 0.65,
        roughness: 0.1,
      });
      const beadMesh = new THREE.Mesh(beadGeo, beadMat);
      beadMesh.position.y = stemHeight + beadRadius;
      pinContainer.add(beadMesh);

      // 3. Ground Pulse Ring (Flat on Earth surface)
      const ringGeo = new THREE.RingGeometry(0.12, 0.32, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffd54f : (isIndia ? 0xffb74d : 0x4fc3f7),
        transparent: true,
        opacity: isSelected ? 0.85 : 0.5,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.02; // Slightly above sphere surface to avoid z-fighting
      pinContainer.add(ringMesh);
      pinContainer.userData.beaconRing = ringMesh;

      pinsGroup.add(pinContainer);
    });

    // Create Photorealistic Translucent Flight Arcs between Key Historical Milestones
    const arcPairs = [
      ['loc-mhow', 'loc-chaitya'],      // Mhow to Mumbai
      ['loc-chaitya', 'loc-columbia'],  // Mumbai to Columbia (New York)
      ['loc-columbia', 'loc-london'],   // New York to London
      ['loc-london', 'loc-chaitya'],    // London back to Mumbai
      ['loc-chaitya', 'loc-mahad'],     // Mumbai to Mahad
      ['loc-chaitya', 'loc-nagpur'],    // Mumbai to Deekshabhoomi Nagpur
      ['loc-chaitya', 'loc-delhi-ca'],  // Mumbai to Constituent Assembly New Delhi
    ];

    arcPairs.forEach(([idA, idB]) => {
      const locA = locations.find(l => l.id === idA);
      const locB = locations.find(l => l.id === idB);
      if (!locA || !locB) return;

      const pA = latLongToVector3(locA.coordinates.latitude, locA.coordinates.longitude, GLOBE_RADIUS);
      const pB = latLongToVector3(locB.coordinates.latitude, locB.coordinates.longitude, GLOBE_RADIUS);

      // Midpoint elevated above sphere
      const mid = pA.clone().add(pB).multiplyScalar(0.5);
      const dist = pA.distanceTo(pB);
      const elevation = GLOBE_RADIUS + Math.min(dist * 0.45, 2.6);
      mid.normalize().multiplyScalar(elevation);

      // Quadratic Curve
      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      const points = curve.getPoints(45);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const isLinkedToSelected = selectedLocation && (selectedLocation.id === idA || selectedLocation.id === idB);

      const arcMat = new THREE.LineBasicMaterial({
        color: isLinkedToSelected ? 0xffea9f : 0x64b5f6,
        transparent: true,
        opacity: isLinkedToSelected ? 0.9 : 0.35,
        linewidth: isLinkedToSelected ? 2 : 1,
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcsGroup.add(arcLine);
    });

  }, [locations, selectedLocation]);

  // Pivot and Auto-Rotate Globe when Selected Location changes
  useEffect(() => {
    if (!selectedLocation || !earthGroupRef.current) return;

    const lat = selectedLocation.coordinates.latitude;
    const lon = selectedLocation.coordinates.longitude;

    // Calculate rotation to place location directly in front of camera
    // Camera is at (0, 0, Z) looking at (0, 0, 0)
    // Formula derived from Three.js UV orientation:
    const targetY = -(lon * Math.PI / 180) - (Math.PI / 2);
    const targetX = (lat * Math.PI / 180) * 0.7; // Pleasant downward perspective tilt

    targetRotationRef.current = { x: targetX, y: targetY };
    setActivePinName(`${selectedLocation.name} · ${selectedLocation.city}`);
  }, [selectedLocation]);

  // Pointer Drag Orbit Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePosRef.current = { x: e.clientX, y: e.clientY };
    targetRotationRef.current = null; // Clear auto-targeting on manual drag
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!earthGroupRef.current) return;

    if (isDraggingRef.current) {
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
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
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

    isDraggingRef.current = false;
  };

  // Zoom Controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    soundEffects.playClick();
    const newZ = direction === 'in' ? Math.max(8.5, cameraRef.current.position.z - 2) : Math.min(22, cameraRef.current.position.z + 2);
    cameraRef.current.position.z = newZ;
    setZoomLevel(Number((14.5 / newZ).toFixed(1)));
  };

  // Reset to default Indian Peninsula orientation
  const handleResetView = () => {
    soundEffects.playClick();
    targetRotationRef.current = { 
      x: (22 * Math.PI / 180) * 0.7, 
      y: -(78 * Math.PI / 180) - (Math.PI / 2) 
    };
    if (cameraRef.current) cameraRef.current.position.z = 14.5;
    setZoomLevel(1);
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-[#D3D4C0] bg-[#020813] shadow-2xl ${className}`}>
      
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        style={{ minHeight: '440px', touchAction: 'none' }}
      />

      {/* Top Left: Memorial Stage HUD Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A2947]/90 backdrop-blur-md border border-[#C89D56]/60 text-[#F3E4C9] text-xs font-mono shadow-md">
          <Globe className="w-3.5 h-3.5 text-[#C89D56] animate-spin" style={{ animationDuration: '14s' }} />
          <span>Photorealistic Orbital Earth</span>
        </div>

        {selectedLocation && (
          <div className="mt-2 text-left bg-[#0A2947]/95 backdrop-blur-md border border-[#C89D56]/40 p-3.5 rounded-2xl max-w-sm shadow-xl animate-in fade-in duration-300">
            <div className="text-[10px] font-mono text-[#C89D56] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Target Pinpoint</span>
            </div>
            <div className="text-sm font-serif-editorial font-bold text-white leading-tight mt-1 truncate">
              {selectedLocation.name}
            </div>
            <div className="text-xs text-[#F3E4C9]/90 font-mono mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C89D56]" />
              <span>{selectedLocation.city}</span>
              <span>·</span>
              <span>{selectedLocation.coordinates.latitude.toFixed(2)}°, {selectedLocation.coordinates.longitude.toFixed(2)}°</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Hover Pin Tooltip */}
      {activePinName && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:block">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-[#FAF7F0] text-xs font-dmsans shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#C89D56]" />
            <span>{activePinName}</span>
          </div>
        </div>
      )}

      {/* Top Right: Globe Navigation & Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#0A2947]/90 backdrop-blur-md border border-[#D3D4C0]/40 p-1.5 rounded-2xl shadow-xl">
        <button
          type="button"
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-2 rounded-xl text-[#F3E4C9] hover:bg-[#C89D56]/20 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-2 rounded-xl text-[#F3E4C9] hover:bg-[#C89D56]/20 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetView}
          title="Reset to India View"
          className="p-2 rounded-xl text-[#F3E4C9] hover:bg-[#C89D56]/20 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setIsAutoRotating(!isAutoRotating);
          }}
          title={isAutoRotating ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
          className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer ${
            isAutoRotating 
              ? 'bg-[#C89D56] text-[#0A2947]' 
              : 'text-[#F3E4C9] hover:bg-[#C89D56]/20'
          }`}
        >
          {isAutoRotating ? 'Auto-Spin' : 'Paused'}
        </button>
      </div>

      {/* Bottom Center Indicator Tip */}
      <div className="absolute bottom-3 right-4 z-10 pointer-events-none hidden md:flex items-center gap-1.5 text-[10px] font-mono text-[#F3E4C9]/70 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
        <Navigation className="w-3 h-3 text-[#C89D56]" />
        <span>Click card to pivot · Drag to orbit · Scroll to zoom</span>
      </div>

    </div>
  );
};

export default MemorialGlobe;
