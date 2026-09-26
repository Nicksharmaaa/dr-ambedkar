# Architecture Specification: The Ambedkar Knowledge Universe (3D WebGL)

## 1. Executive Summary

This document specifies the architectural redesign of the **Dr. B. R. Ambedkar Digital Heritage Archive's Knowledge Graph** from a cluttered 2D radial diagram into an immersive, museum-grade 3D WebGL knowledge universe.

The system transforms raw archival metadata and semantic relationships into a spatial constellation centered on **Dr. B. R. Ambedkar**, adhering strictly to:
- Evidence-first archival provenance grounded in *Babasaheb Ambedkar: Writings and Speeches* (BAWS Vols 1–22).
- Zero hallucination and zero synthetic mock entities.
- Low cognitive visual clutter: no permanent labels on every edge or node; information is revealed dynamically upon hover, selection, and drawer inspection.
- True 100vw × 100vh immersive mode with instant Escape key restoration.

---

## 2. Graph Technology Stack

| Layer | Technology | Version | Architectural Role |
| :--- | :--- | :--- | :--- |
| **Rendering Engine** | Three.js / WebGL | `^0.186.1` | Native 3D geometry, PBR lighting, custom sphere shaders, texture mapping |
| **Force Layout Engine** | `3d-force-graph` / `d3-force-3d` | `^1.80.0` | Physical repulsion (`charge: -220`), link distance constraints (`link: 65`), collision avoidance |
| **Frontend Framework** | Next.js / React | `15.5.25` / `19.3.0` | Client-side dynamic evaluation, component lifecycle orchestration |
| **Styling & Design System** | Vanilla Tailwind CSS | `3.4.1` | Museum navy (`#08192A`, `#0A2947`), archival gold (`#C89D56`), DM Sans & Cinzel typography |
| **Backend Integration** | FastAPI / SQLite FTS5 + DiskANN | `0.115.0` | Live graph neighborhood querying (`/api/v1/graph/entities/{id}/neighbors`), why-connected evidence, AI assistant grounding |

---

## 3. Graph Data & Schema Models

### 3.1 Node Data Model (`Graph3DNode`)
```typescript
export interface Graph3DNode {
  id: string;                      // Unique stable identifier (e.g., 'person-ambedkar', 'book-annihilation-of-caste')
  label: string;                   // Official display name
  category: GraphCategory | string; // person | work | organization | event | concept | place | media
  shortDesc: string;               // Concise archival abstract
  year?: number | string;          // Year of publication, event, or foundation
  date?: string;                   // Exact ISO or historical date (e.g., '1936-05-15')
  linkedDocId?: string;            // Deep link identifier to primary archival treatise in ARCHIVE_DOCUMENTS
  imageUrl?: string;               // High-resolution verified archival plate / portrait
  significance: string;            // Comprehensive historical significance analysis
  color: string;                   // Category hex color token
  aliases?: string[];              // Historical variations, acronyms, and registry designations
  bawsVolume?: string;             // Exact BAWS volume citation (e.g., 'BAWS Vol. 1')
  provenanceCitation?: string;     // Exact primary source locator (e.g., 'CAD Vol. VII (Nov 4, 1948)')
  status?: 'VERIFIED' | 'CANDIDATE' | 'REJECTED' | string;
  degree?: number;                 // Number of incident verified relationships (bounded scale 4.5px–8.5px)
  isCenter?: boolean;              // True for Dr. B. R. Ambedkar (radius 12px + wireframe halo)
  x?: number; y?: number; z?: number; // 3D coordinates in WebGL space
}
```

### 3.2 Edge Data Model (`Graph3DLink`)
```typescript
export interface Graph3DLink {
  id: string;                      // Stable link ID
  source: string | Graph3DNode;    // Source entity ID or node reference
  target: string | Graph3DNode;    // Target entity ID or node reference
  relation: string;                // Archival predicate (e.g., 'authored', 'chaired', 'argued')
  confidence?: number;             // Extraction confidence (1.0 for verified corpus)
  status?: string;                 // 'VERIFIED' | 'CANDIDATE'
  has_evidence?: boolean;          // Requires verified primary textual backing
  notes?: string;                  // Contextual historical commentary
}
```

---

## 4. Visual & Rendering Architecture

### 4.1 Atmospheric Museum Lighting
The Three.js scene initializes with a 3-point museum lighting system:
1. **Soft Ambient Light**: `THREE.AmbientLight(0xffffff, 0.7)` provides clean neutral illumination across all spheres without crushing dark contrast.
2. **Directional Key/Rim Light**: `THREE.DirectionalLight(0xfef3c7, 1.2)` positioned at `(200, 300, 200)` casts warm archival gold highlights on spherical crests.
3. **Hemisphere Ground Bounce**: `THREE.HemisphereLight(0xffffff, 0x08192a, 0.5)` simulates soft museum gallery floor bounce.

### 4.2 Entity Spherical Geometry & Material System
- **Central Ambedkar Node**:
  - Base radius: `12.0` units.
  - Geometry: `THREE.SphereGeometry(12, 32, 32)` mapped with a circular canvas-clipped archival portrait texture of Dr. Ambedkar in his library (`HERO_IMAGE`).
  - Emissive core: `#C89D56` (intensity `0.6` when selected, `0.25` idle).
  - Outer Orbital Halo: `THREE.SphereGeometry(16.2, 24, 24)` wireframe mesh with subtle rotation.
- **Archival Work & Portrait Spheres**:
  - Entities with verified portraits or book covers (e.g., *John Dewey*, *Annihilation of Caste*, *Columbia University*) receive custom circular medallion textures with category-coded border rings.
- **Category PBR Spheres**:
  - Procedural spheres utilize `THREE.MeshStandardMaterial` (`roughness: 0.35`, `metalness: 0.25`).
  - Active selection adds an outer gold ring `THREE.RingGeometry`.
  - Hover adds a subtle translucent white pulse indicator `THREE.RingGeometry`.

### 4.3 Decluttering & Edge Strategy
- **Idle State**: Edges render as whisper-quiet translucent lines (`rgba(211, 212, 192, 0.22)`, width `0.6px`). Zero permanent text labels floating in the scene.
- **Hover State**: Hovering over any sphere dynamically mounts an HTML tooltip with category tag, year, and entity label.
- **Selected State**:
  - Selected node and its direct 1-degree connected neighbors remain 100% opaque.
  - All unrelated nodes dim to `opacity: 0.25`.
  - Unrelated edges dim to `rgba(211, 212, 192, 0.04)`.
  - Connected edges highlight in `#C89D56` (width `2.0px`) with animated gold directional particles traveling along the lineage vector (`linkDirectionalParticles: 2`, `speed: 0.005`).

---

## 5. Interaction & Camera Model

### 5.1 Cinematic Camera Fly-To
When a node is clicked or selected from search:
1. Target coordinates `(node.x, node.y, node.z)` are computed.
2. The camera smoothly transitions along a spherical offset vector:
   $$\vec{P}_{cam} = \vec{P}_{node} \times \left(1 + \frac{160}{\|\vec{P}_{node}\|}\right)$$
3. Duration is timed to a cinematic `1400ms` cubic ease, gently framing the entity without jarring cuts.
4. Auto-rotation instantly halts to allow visitor inspection.

### 5.2 Auto-Rotation & Controls Cluster
- **Auto-Rotation**: Slow, dignified idle orbit (`autoRotateSpeed: 0.5`) engages by default and automatically pauses upon user drag, pinch, or node selection.
- **Controls Toolbar**:
  - **Zoom In / Zoom Out**: Adjusts camera spherical distance by `0.75×` / `1.35×`.
  - **Reset View**: Flies camera back to framing the central Dr. Ambedkar node.
  - **Fit Graph**: Calculates bounding sphere of visible nodes and frames with `900ms` tween.
  - **Orbit Toggle**: Starts/stops subtle idle orbit.
  - **Immersive 3D Toggle**: Expands to full screen / exits.

---

## 6. Information Architecture & Detail Drawer

### 6.1 Progressive Disclosure (`NodeDetailDrawer`)
Detailed metadata is strictly segregated from the 3D canvas into a right-side drawer (`460px` desktop, responsive bottom sheet on mobile):
1. **Header**: Category tag, verification badge, close button.
2. **Specimen Plate**: Verified archival photograph or cover plate with historical date.
3. **Entity Identification**: Title, Lifespan/Year, Primary Archival Entity badge.
4. **Archival Summary**: High-density historical abstract.
5. **Historical Significance**: Highlighted callout with gold border.
6. **Interactive Connected Lineages**: List of direct connected entities with relationship verbs (`authored`, `chaired`, `argued`, etc.). Clicking any connected entity smoothly flies the camera to that node and updates the drawer.
7. **BAWS Provenance & Citations**: Official volume references, CAD citations, and archival aliases.
8. **Primary Source Deep Link**: "Open Archival Volume ↗" navigates directly to the high-resolution DocumentViewerModal or reader.
9. **Grounded AI Integration**: "Ask AI About This Entity" sends entity context to the archival RAG assistant.

---

## 7. Search, Filtering & Large Graph Strategy

### 7.1 Autocomplete Search (`GraphSearch`)
- Instant substring search across node labels, descriptions, and archival aliases.
- Keyboard navigation (Arrow keys + Enter + Escape).
- Selection triggers camera fly-to, highlights neighborhood, and opens the drawer.

### 7.2 Minimal Category Filters (`GraphFilters`)
- Minimalist pill tabs: `All Entities`, `People`, `Works & Treatises`, `Institutions`, `Events & Movements`, `Concepts`, `Places`, `Media`.
- Filtering adjusts D3 simulation visibility, smoothly subduing inactive categories while preserving the central anchor.

### 7.3 Large Graph Growth Strategy
When scaling beyond 50 nodes:
1. **1-Hop Neighborhood Partitioning**: The default view loads the 1-hop neighborhood of the central anchor.
2. **Progressive Expansion**: Clicking "Expand Network" queries `/api/v1/graph/entities/{id}/neighbors?depth=2` to stream and introduce 2-hop clusters into the existing 3D simulation.
3. **Collision Tuning**: Strong charge repulsion (`-220`) prevents dense clustering into unreadable spheres.

---

## 8. Accessibility & Responsive Strategy

### 8.1 Accessible Fallback Directory (`AccessibleEntityList`)
- For screen-reader visitors or users with reduced motion:
  - Accessible Directory dialog opened via the toolbar.
  - Full tabular search, category dropdown, verified citations, and direct links to archival volumes.
  - Keyboard accessible (`Tab`, `Enter`, `Escape`).

### 8.2 Responsive & Kiosk Layout
- **Desktop (1920×1080 / 1440×900)**: Full 3D canvas with 460px right slide-over inspector.
- **Tablet / Large Display (1024×768)**: Compact controls, responsive right drawer.
- **Mobile (412×915)**: Horizontal scrolling filter bar, full-screen inspector sheet on selection, touch-friendly orbit and pinch-to-zoom.
