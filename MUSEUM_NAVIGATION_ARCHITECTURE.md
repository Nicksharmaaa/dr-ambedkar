# Architecture Specification: Museum Navigation Rail 2.0
**Dr. B. R. Ambedkar Digital Heritage Archive**  
**Document Code:** `ARCH-NAV-2.0-TECHNICAL`  
**Platform Architecture:** Next.js 15 / React 19 / Tailwind CSS / Web Audio API  
**Design Paradigm:** Apple Liquid-Glass-Inspired Floating Layer · Left-Side Compact Icon Rail · Fan / Arc Circular Reveal

---

## 1. System Overview

Museum Navigation Rail 2.0 replaces the legacy overcrowded horizontal top navigation bar with a modern, floating, left-side museum navigation rail. By removing the 80px high top navigation bar, the entire visual field opens up, providing breathing room for typography, full-width hero imagery, archive document grids, and the 3D Knowledge Universe.

```
+---------------------------------------------------------------------------------------------------------+
|                                                                     [ Top Utility Dock: Search | Voice ]|
|                                                                     [ Language | Sound | Accessibility ]|
|                                                                                                         |
|  [Left Rail: Collapsed]          [Left Rail: Activated Fan/Arc Reveal]                                  |
|  +--------------------+          +-------------------------------------------------------------+        |
|  |       [ A ]        |          | [ A ]  MUSEUM WINGS                                     [X] |        |
|  +--------------------+          +-------------------------------------------------------------+        |
|  |        (o)         |          |       (o)  Exhibition           Grand Exhibition Hall       |        |
|  |        [=]         |          |     [=]    The Archive          BAWS Volumes 1–22           |        |
|  |        (@)         |          |    (@)     Timeline             Chronicle 1891–1956         |        |
|  |        [>]         |          |   [>]      Media & Voice        Historical Audio & Speeches |        |
|  |        (*)         | -------> |  (*)       AI Scholar           Grounded Archival RAG       |        |
|  |        [#]         |          |   [#]      Folio                Visual Archive & Photos     |        |
|  |        <o>         |          |    <o>     Knowledge Universe   3D Semantic Lineage Graph   |        |
|  |        (S)         |          |     (S)    Curated Stories      Audio-Narrative Journeys    |        |
|  |        (Z)         |          |       (Z)  Constitutional Quest Interactive Knowledge Game  |        |
|  |        [B] (2)     |          |        [B] Notebook (2)         Curated Archival Folio      |        |
|  +--------------------+          +-------------------------------------------------------------+        |
|                                                                                                         |
|                                          FULL-WIDTH MUSEUM CONTENT                                      |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Structural & Spatial Layout

### 2.1 Placement
- **Viewport Anchor:** Fixed to the left edge of the viewport:
  ```css
  position: fixed;
  left: 16px; /* 20px on sm/lg screens */
  top: 50%;
  transform: translateY(-50%);
  z-index: 9000;
  ```
- **Collapsed Dimensions:** Width 58px–62px. Minimal horizontal intrusion (<4% of typical 1440px desktop viewport).
- **Expanded Dimensions:** Width 320px–350px. Gracefully floats above content without causing page reflow or horizontal scrollbars.

### 2.2 Z-Index Stacking Model
A clear, deterministic hierarchy eliminates stacking conflicts across all views:
1. `z-0`: Base Page Content (Hero, Grids, 3D Canvas, Timeline)
2. `z-[8900]`: Top Utility Bar (Search, Voice, Language, Accessibility, User Mode)
3. `z-[8990]`: Nav Rail Atmospheric Backdrop Dim (visible only when rail is expanded)
4. `z-[9000]`: Left-Side Museum Navigation Rail
5. `z-[10000]`: Global Search, Voice Navigator, and Accessibility Dialogs
6. `z-[10001]`: Document Viewer Modal
7. `z-[99999]`: 5-Second Exhibition Prologue Video (100vw × 100vh)

---

## 3. The Fan / Arc Circular Reveal Interaction

### 3.1 Interaction Model
- **Trigger:** Touching or clicking the top "A" museum seal anchor or any item button.
- **Atmospheric Dim:** A soft `bg-[#0B0604]/45 backdrop-blur-[2px]` overlay activates beneath the rail, drawing subtle focus to the navigation without obscuring the underlying museum exhibits.

### 3.2 Arc Fan Geometry Formula
Rather than a boxy drawer expansion, the navigation unfolds in an organic bow/fan curve. Each item's horizontal translation is calculated via an arc trigonometric function:
```typescript
const totalItems = NAV_DESTINATIONS.length;
const normalizedIndex = idx / (totalItems - 1); // Range: 0.0 to 1.0
const arcOffset = Math.sin(normalizedIndex * Math.PI) * 16; // Bowed fan curve up to 16px
const staggerDelay = idx * 30; // 0ms, 30ms, 60ms, 90ms, 120ms...
```
- Items in the middle of the vertical stack curve outward horizontally by up to 16px, evoking the geometry of an opening cultural fan or astrolabe.
- Text labels remain crisp, horizontal, and touch-optimized.

### 3.3 Collapse Triggers
The expanded fan returns smoothly to its collapsed state upon:
1. Clicking/tapping the "A" anchor mark again
2. Clicking outside the rail (onto the backdrop)
3. Selecting any navigation destination
4. Pressing the `Escape` key
5. Clicking the dedicated close button `[X]`

---

## 4. Destination & Route Registry

All destinations directly connect to verified routes in `MuseumContext` (`navigateToTab`) without duplicate routing systems:

| Identifier | Destination Label | Subtitle | Semantic Icon | Target Route |
| :--- | :--- | :--- | :--- | :--- |
| `home` | Exhibition | Grand Exhibition Hall | `Landmark` | `/` |
| `archive` | The Archive | BAWS Volumes 1–22 | `BookOpen` | `/archive` |
| `timeline` | Timeline | Chronicle 1891–1956 | `Clock` | `/timeline` |
| `media` | Media & Voice | Historical Audio & Speeches | `Radio` | `/media` |
| `assistant` | AI Scholar | Grounded Archival RAG | `Sparkles` | `/assistant` |
| `gallery` | Folio | Visual Archive & Photographs | `Camera` | `/gallery` |
| `graph` | Knowledge Universe | 3D Semantic Lineage Graph | `Network` | `/knowledge-map` |
| `stories` | Curated Stories | Audio-Narrative Journeys | `Star` | `/stories` |
| `quest` | Constitutional Quest | Interactive Knowledge Game | `Zap` | `/quest` |
| `collection`| Notebook | Curated Archival Folio | `Bookmark` | `/collection` |

---

## 5. Secondary Utility Dock (`TopUtilityBar`)

To avoid overcrowding the vertical rail, secondary actions are placed in a floating warm frosted glass micro-dock in the top right corner (`fixed top-3 right-3 sm:top-5 sm:right-6 z-[8900]`):
- **Search Trigger:** Opens `GlobalSearchModal` (supports `Ctrl+K` and `/` shortcuts).
- **Voice Navigator:** Opens `VoiceNavigatorModal` with trilingual speech recognition.
- **Language Switcher:** Select dropdown (`EN`, `HI`, `MR`) updating `UI_STRINGS`.
- **Sound Toggle:** Controls synthesized Web Audio effects (`Volume2` / `VolumeX`).
- **Accessibility Settings:** Opens `AccessibilityModal` (Text size, High contrast, Audio narration).
- **Curatorial User Mode:** Dropdown for Visitor, Student, Researcher, and Archivist.
- **Exhibition Prologue:** Replays the 5-second cinematic intro video.
- **Admin Lock:** Direct access to curatorial ingestion console (`/admin`).

---

## 6. Visual Language & Surface Material

- **Material:** Warm Frosted Glass (`rgba(22, 14, 10, 0.94)` with `backdrop-blur-2xl`).
- **Borders & Highlights:** Restrained muted brass borders (`rgba(200, 157, 86, 0.35)`).
- **Drop Shadows:** Soft diffusion `0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(200, 157, 86, 0.12)`.
- **Selected State:** Warm brass glow (`bg-[#C89D56]/25 border-[#C89D56] text-[#FAF7F0]`), with a micro-indicator dot on the right edge of the button.

---

## 7. Accessibility & Touch Optimization

- **Touch Kiosks:** Large interaction targets (minimum 44×44px, standard 48×48px), comfortable for 27" and 32" museum kiosks.
- **ARIA Semantics:** `role="navigation"`, `aria-label="Museum Navigation Rail"`, `aria-expanded={isExpanded}`, `aria-current={isActive ? "page" : undefined}`.
- **Keyboard Navigation:** Full `Tab` focus ring support, `Enter`/`Space` activation, and `Escape` collapse.
- **Reduced Motion:** When `prefers-reduced-motion: reduce` is enabled, arc translations and staggered timing delays are disabled in favor of instant opacity transitions.
