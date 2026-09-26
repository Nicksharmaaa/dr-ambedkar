# PHASE: KNOWLEDGE GRAPH MUSEUM EXPERIENCE 2.0
## 3D Archival Knowledge Universe — Implementation & Architecture Plan

---

### 1. Current Implementation Analysis
- **Framework & Libraries**: Next.js 15.5.25 (App Router), React 19, `three` (`^0.186.1`), `3d-force-graph` (`^1.80.0`), `react-force-graph-3d` (`^1.29.1`).
- **Core Components**:
  - `frontend/components/museum/KnowledgeGraphView.tsx`: Wrapper hosting header, statistics, and 3D graph container.
  - `frontend/components/museum/graph3d/KnowledgeGraph3D.tsx`: State orchestrator for node selection, hover, category filters, and drawer visibility.
  - `frontend/components/museum/graph3d/Graph3DCanvas.tsx`: WebGL canvas managing 3D force simulation, sphere geometry, canvas textures, and link particles.
  - `frontend/components/museum/graph3d/NodeDetailDrawer.tsx`: Right-side metadata inspector.
  - `frontend/components/museum/graph3d/GraphControls.tsx`, `GraphFilters.tsx`, `GraphSearch.tsx`, `AccessibleEntityList.tsx`.
- **Backend Services & APIs**:
  - `backend/app/api/v1/graph.py`: Endpoints for `/entities/{id}`, `/entities/{id}/neighbors`, `/search`, `/why-connected`.
  - `backend/app/services/knowledge_graph/`: `graph_service.py`, `resolution.py`, `models.py`, `seed_data.py`.
  - Database: Turso SQLite (`entities`, `entity_aliases`, `relationships`, `relationship_evidence`, `timeline_events`).

---

### 2. Current Visual & Interaction Weaknesses
1. **Generic Tech / SaaS Visual Language**: Background is dark navy (`#08192A`) with high-saturation cobalt, emerald, indigo, and orange nodes. It resembles a network diagnostic dashboard rather than a quiet, dignified archival gallery.
2. **"Atom" / Radial Feeling**: Nodes tend to settle radially around the central Ambedkar node in a flat plane rather than forming organic, deep spatial clusters.
3. **Node Rendering**: Nodes are mostly plain colored spheres with simple 2D canvas texture overlays and basic selection rings.
4. **Lack of Left-Side Hero Artifact Composition**: When a node is selected, camera moves toward it without deliberate left-offset framing, causing the right dossier to obscure connected nodes.
5. **No Rotating Flare / Aura**: The selected node lacks the distinctive, museum-grade atmospheric aura and orbital light sweep.
6. **No Sound Feedback**: Node selection and relationship navigation are silent.
7. **Missing Deterministic Sequential Navigation**: Connected nodes in the drawer are listed as simple links, but there is no `[ ← PREVIOUS ]` `[ NEXT → ]` (`01 / 05`) guided exploration flow.
8. **Limited Node Coverage**: Only 18 nodes currently exist in `archiveData.ts`, leaving out major verified historical touchpoints (e.g., LSE, Gray's Inn, Sayajirao Gaekwad III, Edwin Seligman, Kalaram Temple Satyagraha, Article 32, Fundamental Rights, Mooknayak, Bahishkrit Bharat).

---

### 3. Current Graph Data Model & Expansion Schema
- **Node Interface (`Graph3DNode`)**:
  - `id`, `label`, `category` (`person | work | organization | event | concept | place | media`), `shortDesc`, `year`, `date`, `linkedDocId`, `imageUrl`, `significance`, `color`, `aliases`, `bawsVolume`, `provenanceCitation`, `degree`, `isCenter`, `cluster`.
- **Edge Interface (`Graph3DLink`)**:
  - `id`, `source`, `target`, `relation`, `confidence`, `status`, `has_evidence`, `notes`.
- **Expansion Target**:
  - 36 verified archival entities (expanded from 18 to 36) organized into 8 spatial clusters.
  - 45+ precise, source-grounded relationship edges backed by BAWS Volumes 1–22, Constituent Assembly Debates, Columbia University Archives, and LSE Archives.

---

### 4. Proposed 3D Architecture & Atmospheric Direction
- **Curated Color Palette**:
  - **Background**: Deep Warm Espresso (`#120B07` to `#1E130B` radial gradient with subtle warm vignette).
  - **Panels & Overlays**: Warm frosted glass (`rgba(35, 24, 17, 0.78)` with `backdrop-blur-xl`, border `rgba(200, 157, 86, 0.28)`, subtle amber inner glow).
  - **Typography**: Parchment / Aged Ivory (`#FAF7F0`, `#F3E4C9`), Cinzel serif headings, DM Sans body text, DM Mono metadata.
  - **Muted Archival Category Palette**:
    - **PEOPLE**: Warm Terracotta Amber (`#C88A58`)
    - **WORKS**: Archival Parchment Buff (`#C5A880`)
    - **INSTITUTIONS**: Mineral Sage / Muted Teal (`#5C7873`)
    - **EVENTS & MOVEMENTS**: Restrained Ochre / Rust (`#B45339`)
    - **CONCEPTS & PHILOSOPHY**: Deep Olive Earth (`#657D5A`)
    - **PLACES**: Muted Antique Bronze (`#8B5E3C`)
    - **MEDIA**: Warm Imperial Brass (`#C89D56`)
- **Three.js Lighting System**:
  - Warm Key Light: `THREE.DirectionalLight(0xffeedd, 1.4)` at `(250, 320, 200)`.
  - Soft Gallery Fill: `THREE.AmbientLight(0xf5ebe0, 0.65)`.
  - Ground Gallery Bounce: `THREE.HemisphereLight(0xf5ebe0, 0x120b07, 0.45)`.
- **Force Simulation Clustering (Non-Radial)**:
  - 3D force simulation using `d3-force-3d`:
  - `charge` strength: `-260` (prevents crowding).
  - `link` distance: `75` (allows organic cluster separation).
  - Multi-focal cluster centers along the Z-axis, creating natural spatial depth.

---

### 5. Node Visual System (Archival Memory Orbs)
- **Central Ambedkar Node**:
  - Diameter: `13.5` units.
  - Material: `THREE.MeshStandardMaterial` with `roughness: 0.3`, `metalness: 0.25`, emissive gold core (`#C89D56`).
  - Texture: High-resolution circular archival portrait (`HERO_IMAGE`) with brass rim border.
  - Outer Orbital Halo: Thin dual wireframe rings with slow counter-rotation.
- **Image-Textured Specimen Nodes**:
  - Entities with verified archival images (e.g., *Drafting Committee*, *Mahad Satyagraha*, *Constituent Assembly*, *Rajgruha Library*, *Columbia*, *Round Table Conference*, *Nagpur Deeksha*) receive circular medallion textures with category-toned brass bezels.
- **Procedural Archival Nodes**:
  - `THREE.MeshStandardMaterial` with subtle noise texture, physically modeled specular highlights, and soft rim illumination (`emissive: categoryColor`).
- **Rotating Flare / Aura (Selected Node)**:
  - Thin elliptical orbital ring `THREE.RingGeometry` angled at 45° with an animated shader/rotation matrix.
  - Soft point light source at the center of the selected node casting a warm glow onto adjacent connected spheres.
  - Smooth scale animation from 1.0× to 1.35× upon selection.

---

### 6. Node Selection & Viewport Composition
- When a node is clicked:
  - **Camera Offset**: Smoothly flies to position the selected sphere in the **LEFT third** of the screen (`x: node.x - 45, y: node.y + 10, z: node.z + 130`) with `lookAt(node.x + 25, node.y, node.z)`.
  - **Center Field**: The 1-hop connected neighborhood is highlighted and clearly visible in the center.
  - **Right Field**: The glass archival dossier smoothly opens on the right.
  - **Unrelated Nodes**: Dim to `opacity: 0.18`, edges dim to `opacity: 0.03`.
  - **Connected Edges**: Warm gold (`#C89D56`, width `2.2px`) with gentle flowing light particles.

---

### 7. Right-Side Glass Information Dossier
- Order of Presentation:
  1. **Entity Name & Aliases** (Cinzel typography, verification badge).
  2. **Entity Type & Historical Date/Lifespan**.
  3. **Verified Archival Specimen Plate** (if image available).
  4. **Short Description**.
  5. **Key Historical Facts** (bulleted archival points).
  6. **Historical Context & Significance** (gold callout card).
  7. **Why It Matters** (philosophical / constitutional impact).
  8. **Connected Archival Lineages** with `[ ← PREVIOUS ]` `[ NEXT → ]` sequential navigator.
  9. **Archival Provenance & Citations** (BAWS Volume, CAD citations, archive record).
  10. **Open in Primary Archive** (deep link to document viewer / media viewer).
  11. **Grounded AI Assistant** ("Ask the Archive About This").

---

### 8. Connected Node Navigation (`[ ← PREVIOUS ]` `[ NEXT → ]`)
- State tracks: `currentIndex`, `totalConnections`, `navigationHistory: string[]`.
- Clicking `NEXT →` or `← PREVIOUS`:
  - Triggers museum click sound.
  - Advances to the next connected entity deterministically.
  - Flies the camera smoothly to frame the new node.
  - Activates its flare/aura.
  - Updates the right dossier instantly with zero page reload.

---

### 9. Tactile Museum Sound System (Web Audio API)
- Zero external audio files required — synthesized via browser `AudioContext` for instantaneous, zero-latency feedback:
  - **Orb Select**: Soft warm resonant chime (`440Hz` sine oscillator with gentle low-pass filter and `180ms` exponential decay).
  - **Next Lineage**: Softer ascending interval (`554.37Hz` C#5 harmonic).
- Controlled by a persistent **Sound ON / Sound OFF** toggle in the controls toolbar.
- Fully respects browser autoplay policies (initialized on first user click).

---

### 10. Grounded AI Assistant Integration
- Embedded "Ask the Archive About This" panel inside the dossier.
- Integrates directly with the existing backend (`/api/v1/assistant/ask` or `useMuseum().askAssistant`).
- Grounded strictly in archival text chunks, enforcing evidence citations and the zero-hallucination policy.

---

### 11. Search, Filters & Controls
- **Glass Autocomplete Search**: Substring and alias search with keyboard selection (Arrow keys, Enter, Esc).
- **Refined Category Pills**: Glassmorphic pills for `ALL`, `PEOPLE`, `WORKS`, `INSTITUTIONS`, `EVENTS`, `CONCEPTS`, `PLACES`.
- **Compact Controls Toolbar**: `ZOOM +`, `ZOOM -`, `RESET`, `FIT`, `ORBIT`, `SOUND ON/OFF`, `ENTER IMMERSIVE`.

---

### 12. Accessibility & Touchscreen / Mobile Optimization
- **Accessible Entity Directory**: Full-screen semantic modal providing instant search, filtering, detailed dossier reading, and document opening without requiring WebGL/3D canvas.
- **Keyboard Navigation**: Focus rings, tab order, Escape to exit/deselect.
- **Reduced Motion**: Disables auto-rotation, eases camera transitions, and minimizes particle speeds.
- **Responsive Layout**:
  - Desktop / 32" Kiosk: 3-column composition (Left hero orb, Center graph, Right dossier).
  - Tablet: Right drawer (380px).
  - Mobile: Interactive bottom-sheet dossier with drag-to-dismiss.

---

### 13. Test Plan & Rollback Strategy
- **Pre-Execution Check**: Run pytest on backend graph suite (`pytest backend/tests/test_phase8_graph.py`).
- **Build Validation**: Verify Next.js production build (`npm run build`).
- **Runtime Verification**: Test 3D rendering, sphere textures, sound synthesis, camera fly-to, sequential navigation, and dossier responsiveness.
- **Rollback Strategy**: Git commits checkpointed before each major step.
