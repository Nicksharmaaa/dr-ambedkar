import * as THREE from 'three';
import { Graph3DLink, MUSEUM_PALETTE } from './types';

/**
 * RelationshipSystem
 * Efficiently manages and renders delicate archival relationship lineages.
 * Uses curved quadratic bezier line segments in muted antique brass (#A47745).
 * In Idle: ultra-faint atmospheric lines (opacity ~0.06).
 * In Selected: highlights active 1-hop connections with warm golden glow while dimming unrelated links.
 */
export class RelationshipSystem {
  public group: THREE.Group;
  private lineMesh: THREE.LineSegments | null = null;
  private activeLineMesh: THREE.LineSegments | null = null;
  private links: Graph3DLink[] = [];
  private nodePositions: Map<string, THREE.Vector3> = new Map();

  constructor() {
    this.group = new THREE.Group();
  }

  public setGraph(links: Graph3DLink[], nodePositions: Map<string, THREE.Vector3>) {
    this.links = links;
    this.nodePositions = nodePositions;
    this.rebuildAllLines();
  }

  private rebuildAllLines() {
    if (this.lineMesh) {
      this.group.remove(this.lineMesh);
      this.lineMesh.geometry.dispose();
      (this.lineMesh.material as THREE.Material).dispose();
      this.lineMesh = null;
    }

    const segmentsPerCurve = 16;
    const points: number[] = [];

    this.links.forEach((link) => {
      const srcId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const tgtId = typeof link.target === 'string' ? link.target : (link.target as any).id;

      const p1 = this.nodePositions.get(srcId);
      const p2 = this.nodePositions.get(tgtId);

      if (p1 && p2) {
        // Curve slightly towards sphere origin for organic museum web aesthetic
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const curveMid = mid.clone().multiplyScalar(0.85); // bowed inward

        const curve = new THREE.QuadraticBezierCurve3(p1, curveMid, p2);
        const curvePoints = curve.getPoints(segmentsPerCurve);

        for (let i = 0; i < curvePoints.length - 1; i++) {
          points.push(
            curvePoints[i].x, curvePoints[i].y, curvePoints[i].z,
            curvePoints[i + 1].x, curvePoints[i + 1].y, curvePoints[i + 1].z
          );
        }
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(MUSEUM_PALETTE.accentBrass),
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });

    this.lineMesh = new THREE.LineSegments(geo, mat);
    this.group.add(this.lineMesh);
  }

  public highlightActiveConnections(selectedNodeId: string | null) {
    // Clear previous active highlight lines
    if (this.activeLineMesh) {
      this.group.remove(this.activeLineMesh);
      this.activeLineMesh.geometry.dispose();
      (this.activeLineMesh.material as THREE.Material).dispose();
      this.activeLineMesh = null;
    }

    if (!selectedNodeId) {
      // Return to faint idle state
      if (this.lineMesh) {
        (this.lineMesh.material as THREE.LineBasicMaterial).opacity = 0.08;
      }
      return;
    }

    // Dim background lines
    if (this.lineMesh) {
      (this.lineMesh.material as THREE.LineBasicMaterial).opacity = 0.02;
    }

    // Build dedicated highlight geometry for 1-hop neighbors of selected node
    const relevantLinks = this.links.filter((l) => {
      const srcId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgtId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return srcId === selectedNodeId || tgtId === selectedNodeId;
    });

    const segmentsPerCurve = 24;
    const highlightPoints: number[] = [];

    relevantLinks.forEach((link) => {
      const srcId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const tgtId = typeof link.target === 'string' ? link.target : (link.target as any).id;

      const p1 = this.nodePositions.get(srcId);
      const p2 = this.nodePositions.get(tgtId);

      if (p1 && p2) {
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const curveMid = mid.clone().multiplyScalar(0.85);

        const curve = new THREE.QuadraticBezierCurve3(p1, curveMid, p2);
        const curvePoints = curve.getPoints(segmentsPerCurve);

        for (let i = 0; i < curvePoints.length - 1; i++) {
          highlightPoints.push(
            curvePoints[i].x, curvePoints[i].y, curvePoints[i].z,
            curvePoints[i + 1].x, curvePoints[i + 1].y, curvePoints[i + 1].z
          );
        }
      }
    });

    if (highlightPoints.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(highlightPoints, 3));

      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(MUSEUM_PALETTE.particleGold2),
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      });

      this.activeLineMesh = new THREE.LineSegments(geo, mat);
      this.group.add(this.activeLineMesh);
    }
  }

  public dispose() {
    if (this.lineMesh) {
      this.lineMesh.geometry.dispose();
      (this.lineMesh.material as THREE.Material).dispose();
    }
    if (this.activeLineMesh) {
      this.activeLineMesh.geometry.dispose();
      (this.activeLineMesh.material as THREE.Material).dispose();
    }
    this.group.clear();
  }
}
