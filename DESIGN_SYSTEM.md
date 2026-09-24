# Ambedkar Heritage Design System & Visual Specification

**Version:** 1.0.0 (Phase 10 Institutional Heritage Standard)  
**Philosophy:** Digital Museum + Research Archive + Interactive Learning Platform + Evidence-Based AI System.  
**Core Aesthetic Invariant:** The archival historical content is the visual hero. Restrained palette, rich typography, deliberate hierarchy, zero frivolous AI holograms or distracting neon animations.

---

## 1. Typography & Hierarchy

The typography pairs a distinguished literary serif for historical titles and quotes with a high-readability sans-serif for interface controls and metadata, supported by an exact monospace font for citations, fixity hashes, and IDs.

* **Primary Historical & Editorial Font:** `font-serif` (Playfair Display / Georgia / Merriweather). Used for document titles, historical excerpts, quotes, chapter headings, and archival metadata captions.
* **Interface & Body Font:** `font-sans` (Inter / system-ui). Used for navigation, interactive buttons, form inputs, tooltips, and explanatory narratives.
* **Scholarly & Cryptographic Font:** `font-mono` (JetBrains Mono / Fira Code). Used for PREMIS SHA-256 fixity hashes, volume/page markers, timestamp coordinates, and API indicators.

### Scale:
* **Display (Hero Title):** `text-4xl sm:text-5xl lg:text-6xl`, line-height 1.15, `font-serif font-bold`
* **Section Heading (H2):** `text-2xl sm:text-3xl`, line-height 1.25, `font-serif font-bold`
* **Card/Article Heading (H3):** `text-lg sm:text-xl`, `font-serif font-semibold`
* **Body Text:** `text-sm sm:text-base`, line-height 1.65, `font-sans`
* **Metadata & Badges:** `text-[10px] sm:text-xs`, `font-mono uppercase tracking-wider`

---

## 2. Color Palette & Semantics

The palette draws inspiration from vintage archival parchment, Indian constitutional leather-bound folio bindings, and brass institutional fixtures:

### Core Backgrounds & Surfaces:
* **Background Canvas:** `bg-slate-950` (`#020617`) — deep, non-glare obsidian black preserving contrast for scanned facsimiles.
* **Surface Panel (Default):** `bg-slate-900/80` (`#0f172a`) — subtle slate structure.
* **Surface Glass/Translucent:** `bg-slate-900/60 backdrop-blur-md border border-white/10`.
* **Archival Canvas / Page Background:** `#fdfbf7` (off-white historic rag paper) with border `#d1c7b7`.

### Accents & Heritage Gold:
* **Heritage Gold/Amber (Primary Brand):** `amber-500` (`#f59e0b`), `amber-400` (`#fbbf24`), `amber-600` (`#d97706`). Used for brand identity, active tabs, timeline milestones, and highlighted quotes.
* **Deep Institutional Blue (Voice / Neural / Search):** `blue-600` (`#2563eb`), `blue-400` (`#60a5fa`). Used for voice input, translation layers, and search accents.

### Authority Tiers & Status Semantics:
* **`SOURCE_TEXT` / `SOURCE_ORIGINAL`:** Heritage Gold (`bg-amber-500/15 text-amber-300 border-amber-500/30`)
* **`CURATOR_VERIFIED` / `OCR_REVIEWED`:** Emerald (`bg-emerald-500/15 text-emerald-300 border-emerald-500/30`)
* **`SCANNED_FACSIMILE` / `OCR_UNREVIEWED`:** Slate (`bg-slate-800 text-slate-300 border-slate-700`)
* **`TRANSLATION`:** Royal Blue (`bg-blue-950 text-blue-300 border-blue-800`)
* **`AI_GENERATED`:** Violet / Purple (`bg-purple-950 text-purple-300 border-purple-800`) with mandatory explicit disclaimer.

---

## 3. Touch Targets & Museum Kiosk Accessibility

* **Minimum Touch Target Size:** $\ge 48 \times 48\text{px}$ on mobile/tablet viewports; $\ge 56 \times 56\text{px}$ in dedicated Kiosk Mode (`/kiosk`).
* **Visual Hover Fallback:** No critical feature requires a desktop mouse hover. All interactive elements have explicit click/touch feedback and visible keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-amber-500`).
* **High Contrast Compliance:** Minimum 4.5:1 text-to-background contrast ratio across all reading surfaces; $\ge 7:1$ for primary headings and facsimile overlays.

---

## 4. Spacing & Spatial Rhythm

* **Container Max Width:** `max-w-7xl` (1280px) for standard browsing; `max-w-screen-2xl` for document facsimile viewer.
* **Section Padding:** `py-12 sm:py-16 lg:py-20` for comfortable museum pacing.
* **Card Padding:** `p-5 sm:p-6 md:p-8` with rounded corners `rounded-2xl` for tactile elevation.

---

## 5. Animation Guidelines

* **Permitted:** Subtle opacity transitions (`duration-150 ease-out`), smooth timeline horizontal scrolling, gentle pulse on active microphone during voice search.
* **Prohibited:** Flashing holographic cards, rotating 3D gimmicks, autoplay video with unmuted audio, and rapid screen shakes.
