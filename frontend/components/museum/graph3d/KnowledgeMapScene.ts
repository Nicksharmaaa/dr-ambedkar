import * as THREE from 'three';
import { Graph3DData, Graph3DNode, MapState, QualityTier, MUSEUM_PALETTE } from './types';
import { ParticleField } from './ParticleField';
import { EntityAnchors } from './EntityAnchors';
import { SelectedArtifact } from './SelectedArtifact';
import { RelationshipSystem } from './RelationshipSystem';

export interface SceneCallbacks {
  onSelectNode: (node: Graph3DNode) => void;
  onHoverNode: (node: Graph3DNode | null) => void;
  onBackgroundClick: () => void;
  onStateChange: (state: MapState) => void;
}

/**
 * KnowledgeMapScene
 * Direct, imperative Three.js orchestration engine for the 3D Museum Installation.
 * Manages the persistent WebGL scene, lighting, camera choreography, raycasting,
 * and state transitions between IDLE and SELECTED states.
 */
export class KnowledgeMapScene {
  private container: HTMLElement;
  private callbacks: SceneCallbacks;

  // Three.js Core
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;

  // Scene Subsystems
  private particleField: ParticleField;
  private entityAnchors: EntityAnchors;
  private selectedArtifact: SelectedArtifact;
  private relationshipSystem: RelationshipSystem;

  // Interaction & Raycasting
  private raycaster: THREE.Raycaster;
  private mousePos: THREE.Vector2;
  private hoveredMesh: THREE.Mesh | null = null;
  private isPointerDown: boolean = false;
  private pointerDownTime: number = 0;
  private pointerDownPos: { x: number; y: number } = { x: 0, y: 0 };

  // Camera & Orbit state
  private defaultCameraPos: THREE.Vector3;
  private targetCameraPos: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private currentLookAt: THREE.Vector3;
  private orbitAngle: number = 0;
  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };

  // FSM State
  private state: MapState = 'IDLE';
  private selectedNode: Graph3DNode | null = null;
  private autoRotate: boolean = true;
  private isReducedMotion: boolean = false;

  constructor(container: HTMLElement, callbacks: SceneCallbacks, quality: QualityTier = 'HIGH') {
    this.container = container;
    this.callbacks = callbacks;

    // Detect user motion preferences
    if (typeof window !== 'undefined') {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // 1. Persistent WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: quality !== 'LOW',
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // 2. Scene
    this.scene = new THREE.Scene();

    // 3. Perspective Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 1000);
    this.defaultCameraPos = new THREE.Vector3(0, 8, 145);
    this.camera.position.copy(this.defaultCameraPos);
    this.targetCameraPos = this.defaultCameraPos.clone();
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(this.currentLookAt);

    this.clock = new THREE.Clock();

    // 4. Museum Warm Lighting Setup
    this.setupLighting();

    // 5. Initialize Subsystems
    this.particleField = new ParticleField(quality, 72);
    this.scene.add(this.particleField.group);

    this.entityAnchors = new EntityAnchors(72);
    this.scene.add(this.entityAnchors.group);

    this.selectedArtifact = new SelectedArtifact();
    this.scene.add(this.selectedArtifact.group);

    this.relationshipSystem = new RelationshipSystem();
    this.scene.add(this.relationshipSystem.group);

    // 6. Raycaster
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points = { threshold: 1 };
    this.mousePos = new THREE.Vector2(-999, -999);

    // 7. Bind Events
    this.bindEvents();

    // 8. Start Controlled Render Loop
    this.startLoop();
  }

  private setupLighting() {
    // Soft museum parchment ambient illumination
    const ambient = new THREE.AmbientLight(0xfff7ed, 1.4);
    this.scene.add(ambient);

    // Primary warm directional light from high top-right
    const dirLight1 = new THREE.DirectionalLight(0xfff1dc, 1.6);
    dirLight1.position.set(120, 180, 140);
    this.scene.add(dirLight1);

    // Muted terracotta/brass bounce light from low-left
    const dirLight2 = new THREE.DirectionalLight(0xe8d2b8, 0.75);
    dirLight2.position.set(-140, -80, -90);
    this.scene.add(dirLight2);

    // Hemisphere light simulating warm ivory ceiling and soft parchment floor
    const hemiLight = new THREE.HemisphereLight(0xfffdfa, 0xeadeca, 0.7);
    this.scene.add(hemiLight);
  }

  public setData(data: Graph3DData) {
    this.entityAnchors.buildAnchors(data.nodes);

    // Build position map for relationships
    const posMap = new Map<string, THREE.Vector3>();
    this.entityAnchors.nodeMap.forEach((entry, id) => {
      posMap.set(id, entry.position);
    });

    this.relationshipSystem.setGraph(data.links, posMap);
  }

  // ── Interaction & Raycasting ──────────────────────────────────────────────

  private bindEvents() {
    const el = this.renderer.domElement;
    el.addEventListener('mousemove', this.onMouseMove);
    el.addEventListener('mousedown', this.onMouseDown);
    el.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('mouseleave', this.onMouseLeave);
    el.addEventListener('touchstart', this.onTouchStart, { passive: true });
    el.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  private unbindEvents() {
    const el = this.renderer.domElement;
    el.removeEventListener('mousemove', this.onMouseMove);
    el.removeEventListener('mousedown', this.onMouseDown);
    el.removeEventListener('mouseup', this.onMouseUp);
    el.removeEventListener('mouseleave', this.onMouseLeave);
    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchend', this.onTouchEnd);
  }

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (this.isDragging) {
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      // Subtle parallax drag if idle
      if (this.state === 'IDLE' || this.state === 'HOVERED') {
        this.orbitAngle -= deltaX * 0.005;
        this.targetCameraPos.y = THREE.MathUtils.clamp(
          this.targetCameraPos.y + deltaY * 0.15,
          -40,
          60
        );
      }
    }

    this.previousMousePosition = { x: e.clientX, y: e.clientY };

    // Check hover only when not dragging
    if (!this.isDragging) {
      this.checkHover();
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    this.isPointerDown = true;
    this.pointerDownTime = performance.now();
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.isDragging = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  private onMouseUp = (e: MouseEvent) => {
    this.isDragging = false;
    this.isPointerDown = false;

    // Check if this was a clean click rather than a drag
    const moveDist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    const duration = performance.now() - this.pointerDownTime;

    if (moveDist < 6 && duration < 350) {
      this.handleClick();
    }
  };

  private onMouseLeave = () => {
    this.isDragging = false;
    this.mousePos.set(-999, -999);
    if (this.hoveredMesh) {
      this.hoveredMesh = null;
      this.entityAnchors.setHovered(null);
      this.callbacks.onHoverNode(null);
      this.container.style.cursor = 'default';
      if (this.state === 'HOVERED') {
        this.setState('IDLE');
      }
    }
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = this.container.getBoundingClientRect();
      this.mousePos.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mousePos.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      this.pointerDownPos = { x: touch.clientX, y: touch.clientY };
      this.pointerDownTime = performance.now();
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const moveDist = Math.hypot(touch.clientX - this.pointerDownPos.x, touch.clientY - this.pointerDownPos.y);
      if (moveDist < 12) {
        this.handleClick();
      }
    }
  };

  private checkHover() {
    if (this.state === 'SELECTING' || this.state === 'TRANSITIONING') return;

    // CRITICAL PERFORMANCE RULE: Raycast ONLY against the 40 entity anchor meshes
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(this.entityAnchors.interactiveMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      if (hitMesh !== this.hoveredMesh) {
        this.hoveredMesh = hitMesh;
        const node = hitMesh.userData.node as Graph3DNode;
        this.entityAnchors.setHovered(node.id);
        this.callbacks.onHoverNode(node);
        this.container.style.cursor = 'pointer';

        if (this.state === 'IDLE') {
          this.setState('HOVERED');
        }
      }
    } else if (this.hoveredMesh) {
      this.hoveredMesh = null;
      this.entityAnchors.setHovered(null);
      this.callbacks.onHoverNode(null);
      this.container.style.cursor = 'default';

      if (this.state === 'HOVERED') {
        this.setState('IDLE');
      }
    }
  }

  private handleClick() {
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(this.entityAnchors.interactiveMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const node = hitMesh.userData.node as Graph3DNode;
      this.selectEntity(node);
    } else {
      // Clicked on empty space
      if (this.state === 'SELECTED') {
        this.deselect();
      }
      this.callbacks.onBackgroundClick();
    }
  }

  // ── State Transitions ─────────────────────────────────────────────────────

  public selectEntity(node: Graph3DNode) {
    if (this.selectedNode?.id === node.id && this.state === 'SELECTED') return;

    this.selectedNode = node;
    const isFirstSelection = this.state !== 'SELECTED';
    this.setState(isFirstSelection ? 'SELECTING' : 'TRANSITIONING');

    const nodePos = this.entityAnchors.getNodePosition(node.id);
    if (!nodePos) return;

    // 1. Activate large glass artifact orb
    this.selectedArtifact.activate(nodePos, node.imageUrl);

    // 2. Identify 1-hop connected neighbors
    const connectedIds = new Set<string>();
    // Add neighbors from relationship system
    this.relationshipSystem.highlightActiveConnections(node.id);

    // 3. Highlight anchors & dim unrelated
    this.entityAnchors.setSelectionHighlight(node.id, connectedIds);

    // 4. Choreograph Camera Approach
    // Position camera comfortably in front and slightly shifted left so the dossier on the right does not obscure it
    const offsetDirection = nodePos.clone().normalize();
    if (offsetDirection.lengthSq() < 0.001) offsetDirection.set(0, 0, 1);

    const cameraDistance = 34; // Close intimate museum view
    // Shift slightly to the left (-X in view plane) so the artifact sits on the left 55% of the screen
    const targetPos = nodePos.clone().add(offsetDirection.multiplyScalar(cameraDistance));
    targetPos.x -= 7.0; // Left-offset to accommodate right-side archival dossier
    targetPos.y += 2.5;

    this.targetCameraPos.copy(targetPos);
    this.targetLookAt.copy(nodePos);

    // Inform callback
    this.callbacks.onSelectNode(node);

    // Transition completion
    const duration = this.isReducedMotion ? 200 : 850;
    setTimeout(() => {
      this.setState('SELECTED');
    }, duration);
  }

  public deselect() {
    if (this.state === 'IDLE' || this.state === 'DESELECTING') return;

    this.setState('DESELECTING');
    this.selectedNode = null;

    // Deactivate glass artifact
    this.selectedArtifact.deactivate();

    // Reset relationship lines
    this.relationshipSystem.highlightActiveConnections(null);

    // Reset entity anchors
    this.entityAnchors.setSelectionHighlight(null, new Set());

    // Reset camera to default framing
    this.targetCameraPos.copy(this.defaultCameraPos);
    this.targetLookAt.set(0, 0, 0);

    const duration = this.isReducedMotion ? 150 : 750;
    setTimeout(() => {
      this.setState('IDLE');
    }, duration);
  }

  private setState(newState: MapState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  public zoomIn() {
    this.targetCameraPos.multiplyScalar(0.82);
  }

  public zoomOut() {
    this.targetCameraPos.multiplyScalar(1.22);
  }

  public fitGraph() {
    this.deselect();
  }

  public setAutoRotate(enabled: boolean) {
    this.autoRotate = enabled;
  }

  public resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.particleField.setPixelRatio(this.renderer.getPixelRatio());
  }

  // ── Render Loop ───────────────────────────────────────────────────────────

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.renderFrame();
    };
    loop();
  }

  private renderFrame() {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Ambient camera orbit during IDLE if autoRotate enabled
    if (this.state === 'IDLE' && this.autoRotate && !this.isReducedMotion) {
      this.orbitAngle += delta * 0.022;
      const radius = 145;
      this.targetCameraPos.x = Math.sin(this.orbitAngle) * radius;
      this.targetCameraPos.z = Math.cos(this.orbitAngle) * radius;
    }

    // 2. Smooth Camera Interpolation (Lerp with cubic easing feel)
    const lerpSpeed = this.isReducedMotion ? 0.25 : (this.state === 'SELECTING' || this.state === 'TRANSITIONING') ? 0.08 : 0.05;
    this.camera.position.lerp(this.targetCameraPos, lerpSpeed);

    this.currentLookAt.lerp(this.targetLookAt, lerpSpeed);
    this.camera.lookAt(this.currentLookAt);

    // 3. Subsystem Updates
    const isSelected = this.state === 'SELECTED' || this.state === 'SELECTING' || this.state === 'TRANSITIONING';
    const focusPos = this.selectedNode ? this.entityAnchors.getNodePosition(this.selectedNode.id) || undefined : undefined;

    this.particleField.update(elapsedTime, isSelected, focusPos);
    this.entityAnchors.update(elapsedTime, this.camera.position);
    this.selectedArtifact.update(elapsedTime, this.camera.position);

    // 4. Render
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.unbindEvents();

    this.particleField.dispose();
    this.entityAnchors.dispose();
    this.selectedArtifact.dispose();
    this.relationshipSystem.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
