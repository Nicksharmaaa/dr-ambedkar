# Knowledge Graph Redesign Plan: "The Ambedkar Knowledge Universe"
**Project**: Dr. B. R. Ambedkar Digital Heritage Archive  
**Document**: `KNOWLEDGE_GRAPH_REDESIGN_PLAN.md`  
**Target Experience**: Full-Screen, 3D, Interactive, Cinematic, Museum-Quality WebGL Knowledge Space  

---

## 1. Current Architecture & Implementation

### A. Current Data Flow Pipeline
```
[Turso SQLite Database]
  ├── entities table (id, entity_type, canonical_name, aliases, description, status)
  ├── relationships table (id, subject_id, object_id, predicate, confidence, status)
  └── relationship_evidence table (relationship_id, document_id, page_number, chunk_id, excerpt, viewer_url)
         │
         ▼
[FastAPI Backend :8000]
  ├── GET /api/v1/graph/entities/{id}
  ├── GET /api/v1/graph/entities/{id}/neighbors?depth={depth}&limit={limit}
  ├── GET /api/v1/graph/search?q={query}&entity_type={type}
  ├── GET /api/v1/graph/relationships/{id}
  └── GET /api/v1/graph/why-connected?source_id={src}&target_id={tgt}
         │
         ▼
[Frontend API Client (`frontend/lib/api.ts`)]
  ├── api.getGraphNeighborhood(id, depth, limit)
  ├── api.getEntity(id)
  ├── api.searchGraph(query, entityType, limit)
  ├── api.whyConnected(sourceId, targetId)
  └── api.askAssistant({ question, mode: 'ask' })  <-- Grounded AI
         │
         ▼
[Curated Archival Corpus (`frontend/data/archiveData.ts`)]
  ├── KNOWLEDGE_GRAPH_NODES (50+ verified historical entities with categories, citations, high-res portraits)
  └── KNOWLEDGE_GRAPH_LINKS (authenticated relations)
```

### B. Current Frontend Graph Implementation
* **Components**:
  - `frontend/components/museum/KnowledgeGraphView.tsx` (Current 2D SVG/HTML canvas implementation)
  - `frontend/components/graph/CytoscapeCanvas.tsx` (Legacy Cytoscape 2D force layout)
  - `frontend/app/knowledge-map/page.tsx` & `frontend/app/graph/page.tsx` (App Router routes)
* **Current Visual Schema**:
  - 2D layout with static coordinate positions ($x, y$).
  - Central Dr. B. R. Ambedkar medallion with radial spokes.

---

## 2. Current UX Problems Identified
1. **Severe Visual Clutter**:
   - Too many entity text labels rendered simultaneously across every single node.
   - Relationship predicate text annotations ("published by", "member of", "participated in", "argued") are displayed permanently along lines, causing overlap and collision.
2. **Flat Software Diagram Feel**:
   - 2D planar rendering resembles an entity-relationship diagram or IT schema rather than a museum exhibition.
   - Lack of depth, perspective, lighting, and spatial immersion.
3. **No True Fullscreen Immersive Mode**:
   - Graph is constrained within standard page containers with headers and margins.
4. **Information Density Imbalance**:
   - The graph itself tries to display too much data at once, instead of acting as a visual gateway to a high-density detail panel.
5. **Camera & Spatial Mechanics**:
   - Lacks orbit, smooth camera fly-to transitions, and spatial depth layering.

---

## 3. Proposed 3D Architecture: "The Ambedkar Knowledge Universe"

### A. Technology Decision
* **Engine**: `Three.js` (r186) + WebGL via `3d-force-graph` / `react-force-graph-3d`.
* **Physics Simulation**: D3 3D force simulation (n-body charge repulsion, link force, bounded collision force, centering force).
* **True 3D Spatial Geometry**:
  - Spherical 3D nodes (`SphereGeometry` with 32 segments).
  - PBR / Phong materials (`MeshPhongMaterial` / `MeshStandardMaterial`) with subtle specular highlight, depth shading, and emissive glow.
  - Image-textured spheres for Dr. B. R. Ambedkar (central node) and verified archival portraits/facsimiles using canvas texture generation or `TextureLoader`.
* **Atmospheric Lighting**:
  - Ambient illumination (`#3a4d6b`, intensity 0.8) for museum night atmosphere.
  - Directional key light (`#FAF7F0`, intensity 1.4) positioned at top-right for elegant specular rim highlights.
  - Point light anchored at central Ambedkar node (`#C89D56`, gold foil warmth) illuminating immediate neighborhood.

### B. Node Visual System & Hierarchy
| Entity Type | Material / Color | Texture / Treatment | Sphere Radius |
| :--- | :--- | :--- | :--- |
| **CENTRAL ANCHOR** (`person-ambedkar`) | Gold Foil Glow (`#C89D56` / `#FAF7F0`) | Archival Portrait Textured Sphere + Emissive Halo | $R = 12$ (Distinctive Anchor) |
| **PERSON** | Archival Portrait / Slate Navy (`#0A2947`) | Circular portrait medallion texture or smooth sphere | $R = 6 - 8$ (based on degree) |
| **WORK / BOOK** | Royal Archival Blue (`#1d4ed8`) | Treatise texture / parchment sheen | $R = 6 - 8$ |
| **ORGANIZATION / INSTITUTION**| Architectural Cobalt (`#0284c7`) | Subtle geometric facets / institutional emblem | $R = 6 - 8$ |
| **EVENT / MOVEMENT** | Saffron / Crimson Earth (`#E76F51`) | Emissive core / event marker | $R = 5 - 7$ |
| **CONCEPT / IDEA** | Emerald Stone (`#2A9D8F`) | Translucent glass / moral philosophy orb | $R = 5 - 7$ |
| **PLACE** | Earth Sage (`#8B5E3C`) | Terrestrial parchment tone | $R = 5 - 7$ |
| **MEDIA / RECORDING** | Archival Amber (`#d97706`) | Waveform inscribed sphere | $R = 5 - 7$ |

### C. Decluttering Strategy: Progressive Disclosure of Labels & Edges
* **Labels**:
  - **Default**: Zero clutter. No labels rendered permanently except subtle designation on Central Ambedkar.
  - **Hover**: 3D Sprite or crisp HTML tooltip displaying Canonical Name + Year.
  - **Selected Node**: Selected node label + immediate 1-hop neighbor labels fade in smoothly.
* **Edges**:
  - **Default**: Ultra-thin (0.5px), low opacity (0.18 - 0.22), neutral sage/navy tone (`#D3D4C0`).
  - **Selected Node**: Incident edges brighten to gold foil (`#C89D56`, opacity 0.85) with directional particle pulse. Unrelated edges dim to opacity 0.04.
  - **Relationship Text**: Completely removed from static edge lines. Displayed cleanly in the **Right-Side Detail Panel** upon selection.

---

## 4. Interaction Design & Spatial Mechanics

### A. Camera Choreography
* **Initial View**: Cinematic establishing framing ($Z = 380$, slightly elevated $Y = 40$) displaying the entire knowledge constellation with Dr. B. R. Ambedkar at the center.
* **Node Selection**: Smooth camera transition (tween over 800ms) flying towards the selected sphere, stopping at an optimal vantage distance while keeping the node centered.
* **Orbit Controls**: Smooth rotational inertia, zoom damping, clamp distance ($50 \le Z \le 1200$).
* **Auto-Rotation**: Very gentle idle orbit ($0.15^\circ/\text{sec}$) that immediately disengages upon touch, hover, pan, or node selection.

### B. Full-Screen / Immersive Mode
* Dedicated **ENTER IMMERSIVE MODE** button in header and on graph canvas.
* Toggles full viewport ($100\text{vw} \times 100\text{vh}$) overlay with deep museum backdrop (`#08192A`), hiding non-essential page chrome.
* Includes **EXIT IMMERSIVE MODE** floating button and `Escape` key handler.
* Preserves camera coordinates, selected entity, and filter state.

### C. Right-Side Archival Information Drawer
* Slides in smoothly from the right (420px desktop width, full bottom sheet on mobile).
* **Information Structure**:
  1. *Entity Banner*: Type badge, Canonical Title, Historical Years, Provenance status ("VERIFIED").
  2. *Archival Media*: Portrait / Facsimile document thumbnail with caption.
  3. *Short Summary & Significance*: Core contextual role in Babasaheb's mission.
  4. *Connected Entities List*: First-degree connections with relationship labels. Clicking any connected entity immediately selects it and flies the camera to it!
  5. *Archival Evidence & BAWS Volume*: Volume citations, accession codes, verified primary texts.
  6. *Actions*:
     - **Open in Archive**: Deep-links to DocumentViewerModal, Media Player, or Timeline.
     - **Ask About This Node**: Directly invokes `api.askAssistant` with verified entity context for zero-hallucination RAG answers!

---

## 5. Mobile, Tablet, Kiosk & Accessibility Strategy

1. **Touch & Kiosk Optimization**:
   - Single tap: Select node and open detail drawer.
   - Drag: Rotate 3D universe.
   - Pinch: Zoom camera.
   - Minimum touch target: 48px touch radius hitboxes.
2. **Mobile Layout**:
   - Detail drawer renders as a draggable bottom sheet with swipe-to-dismiss.
   - Compact control cluster positioned at top-right.
3. **Accessibility Fallback (`AccessibleEntityList.tsx`)**:
   - Complementary searchable, keyboard-navigable directory of all entities, categories, and relationships for screen readers and reduced-motion users.
   - `prefers-reduced-motion`: Automatically disables auto-rotation, dampens camera fly transitions, and provides a direct list-view toggle.

---

## 6. Implementation Architecture & Modular File Breakdown

We will build modular, reusable TypeScript components under `frontend/components/museum/graph3d/`:

1. `KnowledgeGraph3D.tsx`: Root interactive orchestrator (manages state, camera, live API sync, filter, search, drawer).
2. `Graph3DCanvas.tsx`: WebGL canvas encapsulating `react-force-graph-3d` / `Three.js` scene, materials, lighting, sphere geometry, and particle flow.
3. `NodeDetailDrawer.tsx`: Museum-grade sliding detail panel with provenance, BAWS citations, connected neighbor exploration, and "Open in Archive".
4. `GraphControls.tsx`: Zoom (+/-), Fit to Screen, Reset View, Auto-Rotate Toggle, Immersive Mode expand/exit.
5. `GraphSearch.tsx`: Real-time auto-completing search for entities, focusing camera upon selection.
6. `GraphFilters.tsx`: Minimalist category filter pills (All, People, Works, Institutions, Events, Ideas, Places).
7. `GraphLegend.tsx`: Collapsible, elegant museum category indicator.
8. `AccessibleEntityList.tsx`: Complete accessible directory with full keyboard navigation and screen reader support.

---

## 7. Verification & Testing Strategy
* **Functional Tests**: Verify node click, hover, drag, selection, and connection highlighting.
* **API Validation**: Confirm live data integration via `/api/v1/graph/entities/.../neighbors` and `/why-connected`.
* **Visual QA**: Capture browser screenshots of overview, selected node focus, detail drawer, search, and immersive mode.
* **Performance Benchmark**: Measure 60 FPS rendering, camera tween smoothness, and memory stability.
* **Documentation**: Produce `KNOWLEDGE_GRAPH_3D_ARCHITECTURE.md` and `KNOWLEDGE_GRAPH_TEST_REPORT.md`.
