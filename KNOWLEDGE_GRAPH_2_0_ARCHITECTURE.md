# Architecture Specification: Knowledge Graph Museum Experience 2.0
**Dr. B. R. Ambedkar Digital Heritage Archive**  
**Document Code:** `ARCH-KG-2.0-TECHNICAL`  
**Platform Architecture:** WebGL / Three.js / Next.js 16 App Router / React 19 / 3D Force Graph Engine  
**Visual Aesthetic:** Warm Archival Espresso (`#120B07`), Muted Brass (`#C89D56`), Aged Ivory (`#F3E4C9`), Frosted Warm Glass

---

## 1. System Overview

Knowledge Graph Museum Experience 2.0 transforms the data visualization layer of the Dr. B. R. Ambedkar Digital Heritage Archive into a flagship, artifact-first digital museum exhibition. Inspired by Google Arts & Culture's tactile museum explorations, the interface allows visitors to explore the semantic universe of Dr. Ambedkar, select an archival memory orb, bring it into focused cinematic composition, inspect its provenance in an archival dossier, browse connected historical lineages sequentially, and question the archive using a grounded AI assistant.

```
+---------------------------------------------------------------------------------------------------+
|                                  THE AMBEDKAR KNOWLEDGE UNIVERSE                                  |
|                                                                                                   |
|  [ Top Controls: Search Entity | Accessible Directory | Zoom | Fit | Reset | Orbit | Audio | Full ]|
|  [ Category Filter Tabs: All | People | Works | Institutions | Events | Concepts | Places | Media ]|
|                                                                                                   |
|  +-------------------------------------+-------------------------------------------------------+  |
|  | LEFT 35%: HERO FOCUS ARTIFACT       | RIGHT 45%: GLASS ARCHIVAL DOSSIER                     |  |
|  |                                     |                                                       |  |
|  |      /=============\                | +---------------------------------------------------+ |  |
|  |     /   (HERO)      \               | | ENTITY: John Dewey          [TYPE: PERSON]        | |  |
|  |    |  ARCHIVAL ORB   |              | | SPECIMEN: Verified Archival Specimen (Circa 1914) | |  |
|  |     \   + AURA      /               | +---------------------------------------------------+ |  |
|  |      \=============/                | | SUMMARY: Pragmatist philosopher at Columbia...    | |  |
|  |                                     | | KEY FACTS: Supervised doctoral seminars...        | |  |
|  |                                     | | HISTORICAL CONTEXT: Ethical democracy principles. | |  |
|  | CENTER 20%: 1-HOP LINEAGE RAYS      | | WHY IT MATTERS: Inoculation against dogmatism.    | |  |
|  |                                     | +---------------------------------------------------+ |  |
|  |   --- (STUDIED UNDER) --->          | | CONNECTIONS [ 01 / 04 ]                           | |  |
|  |   <-- (INFLUENCED BY) ---           | | [ <-- PREVIOUS ]  Columbia University  [ NEXT --> ]| |  |
|  |                                     | +---------------------------------------------------+ |  |
|  |                                     | | ARCHIVAL PROVENANCE: BAWS Vol. 22; Columbia Arch. | |  |
|  |                                     | | [ OPEN ARCHIVAL VOLUME ↗ ]                        | |  |
|  |                                     | | [ ASK THE ARCHIVE ABOUT THIS (Grounded AI) ]      | |  |
|  +-------------------------------------+-------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. 3D WebGL Rendering & Graph Engine

### 2.1 Engine Stack
- **Underlying WebGL Core:** Three.js (`^0.186.1`).
- **Graph Force Simulation:** `3d-force-graph` (`^1.80.0`) wrapped in dynamic client-side loading to prevent SSR hydration mismatches.
- **Dimensionality:** Full 3D Cartesian coordinates `(x, y, z)`. No 2D projection locks.

### 2.2 Force Physics & Spatial Clustering
To completely eliminate the artificial "atom" or "solar system" look of radial layouts, the force simulation runs in unconstrained 3D space with high repulsion and tuned link distances:
```typescript
const d3Force = graph.d3Force;
if (d3Force) {
  // Enhanced charge strength prevents node collision and encourages organic cluster formation
  d3Force('charge')?.strength(-260);

  // Link distance balances structural proximity with cluster definition
  d3Force('link')?.distance(75);
}
```
This enables natural spatial depth across the 8 historical clusters:
1. Primary Anchor (`person-ambedkar`)
2. Intellectual Influences (`person-dewey`, `person-seligman`, `person-cannan`, `person-phule`)
3. Higher Education (`inst-columbia`, `inst-lse`, `inst-graysinn`, `inst-elphinstone`, `inst-univ-bombay`)
4. Constitution & Republic (`org-drafting-comm`, `org-const-assembly`, `concept-constitutional-morality`, `concept-social-democracy`)
5. Foundational Treatises (`work-annihilation`, `work-castes-in-india`, `work-problem-of-rupee`, `work-states-minorities`, `work-shudras`, `work-buddha-dhamma`)
6. Social Resistance & Movements (`org-bahishkrit-sabha`, `event-mahad`, `event-kalaram`, `place-chhadar-tank`)
7. Civic Institutions & Parties (`org-ilp`, `org-scf`, `org-pes`, `pub-mooknayak`, `pub-bahishkrit-bharat`)
8. Spiritual Renaissance (`event-conversion-1956`, `place-deekshabhoomi`)

---

## 3. Node Visual System: Archival Memory Orbs

### 3.1 Geometric & Material Construction
Nodes are rendered as genuine 3D spheres (`THREE.SphereGeometry(radius, 32, 32)`).
- **Central Anchor (`person-ambedkar`):** Radius 12.0 units, circular archival portrait texture mapped with an aged brass bezel (`#C89D56`), surrounded by an outer wireframe celestial halo (`THREE.SphereGeometry(radius * 1.35, 24, 24)`).
- **Archival Nodes:** Bounded scale formula `radius = Math.min(8.5, Math.max(4.5, 4.2 + degree * 0.38))`.
- **Texture Generation:** `getOrCreateCircularTexture(imageUrl, borderColor)` renders images onto a high-resolution 256×256 canvas with circular masking and a metallic bezel, cached in a client-side `Map<string, THREE.Texture>` to avoid GPU allocation churn.
- **Procedural Material Fallback:** `THREE.MeshStandardMaterial` with `roughness: 0.38`, `metalness: 0.22`, and category-specific warm emissive tones.

### 3.2 Curated Warm Archival Palette
| Category | Hex Tone | Semantic Role |
| :--- | :--- | :--- |
| `person` | `#C88A58` | Terracotta / Archival Portraiture |
| `work` / `book` / `document` | `#C5A880` | Aged Parchment / Treatises & Manuscripts |
| `organization` / `institution` | `#5C7873` | Aged Patina Teal / Civic Institutions |
| `event` / `movement` | `#B45339` | Historical Rust-Saffron / Movements |
| `concept` / `article` | `#657D5A` | Olive Sage / Constitutional Morality |
| `place` | `#8B5E3C` | Muted Bronze Earth / Historic Sites |
| `media` | `#D4A373` | Archival Amber / Periodicals & Audio-Visual |
| `anchor` | `#C89D56` | Muted Brass / Babasaheb Ambedkar |

---

## 4. Visual Activation: The Rotating Flare / Aura

When an entity is selected, it transitions into a Hero Artifact:
1. **Primary Armillary Ring:** A `THREE.TorusGeometry(radius * 1.42, radius * 0.045, 16, 64)` with `THREE.MeshStandardMaterial` (`emissive: 0xC89D56`, `emissiveIntensity: 0.8`) is attached to the node group at a 45° tilt (`rotation.x = PI / 3`, `rotation.y = PI / 6`).
2. **Soft Outer Halo:** A double-sided `THREE.RingGeometry(radius * 1.3, radius * 1.6, 32)` with 35% opacity creates a warm museum specimen disc.
3. **Scale Expansion:** Focused node expands by 25% (`baseRadius * 1.25`).
4. **Graph Attenuation:** Unrelated nodes attenuate to 22% opacity (`opacity: 0.22`), while 1-hop connected nodes brighten with increased emissive glow.

---

## 5. Camera Choreography & Left-Side Composition

Rather than centering the selected node in the middle of the viewport where the right information drawer would obscure it, `flyToNode` executes a cinematic left-side composition:
```typescript
const targetOffsetX = 35; // Shifts lookAt target rightward
const camDistance = 165;  // Preserves comfortable focal perspective

const lookAtTarget = {
  x: (node.x || 0) + targetOffsetX,
  y: node.y || 0,
  z: node.z || 0,
};

const newPos = {
  x: (node.x || 0) - 25,
  y: (node.y || 0) + 12,
  z: (node.z || 0) + camDistance,
};

fgRef.current.cameraPosition(newPos, lookAtTarget, 1400);
```
**Resulting Tripartite Viewport Composition:**
- **LEFT (30–35%):** Selected Archival Sphere with rotating brass aura.
- **CENTER (20–25%):** Active relationship rays with animated directional particle flows.
- **RIGHT (40–45%):** Frosted warm glass archival dossier (`NodeDetailDrawer`).

---

## 6. Sound Architecture (Web Audio API)

Tactile audio feedback reinforces the museum physical exhibition metaphor without distracting sound loops:
- **Engine:** Synthesized procedural Web Audio API nodes (`AudioContext`) with zero external MP3/WAV download dependencies.
- **Node Selection Sound (`playNodeSelectSound`):** 440 Hz (A4) primary sine wave with an 880 Hz overtone, decaying over 600ms through an exponential gain envelope.
- **Sequential Lineage Transition (`playLineageTransition`):** Gentle musical fifth interval (554.37 Hz $\to$ 659.25 Hz) over 450ms.
- **Autoplay & Mute Policy:** Audio context only initializes upon explicit user gesture (click/tap). The UI includes a Sound ON/OFF toggle in `GraphControls` respecting browser policies.

---

## 7. Sequential Connected Node Navigation

The dossier contains a first-class connection carousel:
```
+-------------------------------------------------------+
| CONNECTED THROUGH                           01 / 04   |
| STUDIED UNDER                                         |
| John Dewey                                            |
| Pragmatist philosopher at Columbia University...      |
| [ <-- PREVIOUS ]                    [ NEXT --> ]      |
+-------------------------------------------------------+
```
- **State Machine:** Maintained by `currentConnIndex` (0 to $N-1$) and an immutable `historyStack: string[]`.
- **Navigation Action:** Clicking `NEXT →` or `← PREVIOUS` triggers `soundEffects.playLineageTransition()`, pushes the current node ID onto `historyStack`, selects the next connected entity, smoothly moves the camera to the new node, enlarges it, activates its aura, and refreshes the dossier.

---

## 8. Progressive Disclosure Archival Dossier

The right-side drawer strictly follows the 10-layer information hierarchy:
1. **Entity Name (`node.label`)** in classic serif typography.
2. **Entity Type & Verification Plate** with specimen status.
3. **Archival Summary (`node.shortDesc`)**.
4. **Key Facts (`node.keyFacts`)** formatted as gold-bulleted points.
5. **Historical Context (`node.historicalContext`)**.
6. **Why It Matters (`node.whyItMatters`)**.
7. **Connected Lineages** with sequential navigation carousel and full relational directory.
8. **Archival Sources & Citations** with volume citations (BAWS 1–22) and archival aliases.
9. **Primary Document Transition (`Open Archival Volume ↗`)** deep-linking directly to full-text documents.
10. **Grounded AI Scholar Synthesis (`Ask The Archive About This`)**.

---

## 9. Grounded AI Scholar Assistant Integration

- **API Endpoint:** `/api/v1/assistant/ask` (invoked via `api.askAssistant`).
- **Context Grounding:** Selected entity label, category, verified summary, and BAWS volume citations are injected into the prompt.
- **Zero Hallucination Standard:** Visual proximity in 3D is explicitly isolated from historical evidence. Edges require documented textual evidence. Responses display exact citation badges linking to primary archive texts.

---

## 10. Accessibility & Universal Access (WCAG 2.1 AA)

- **Accessible Archival Directory:** A modal dialog (`AccessibleEntityList`) accessible via keyboard shortcut or directory button provides full access to all 36 entities and their connections without requiring 3D canvas interaction.
- **Keyboard Traps & ARIA:** Proper `role="toolbar"`, `role="tablist"`, `aria-label`, and `Escape` key handling across immersive mode, dossiers, and directories.
- **Reduced Motion:** When `prefers-reduced-motion` is detected, auto-rotation is disabled and camera transition durations are minimized.
