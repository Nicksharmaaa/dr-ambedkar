# UX Architecture & Institutional Heritage Experience Specification

**System:** Ambedkar Heritage Intelligence & Digital Preservation System  
**Version:** 1.0.0 (Phase 10 Institutional Standard)  
**Scope:** Architecture governing user navigation, persona routing, progressive disclosure, touch-first accessibility, and grounded evidence presentation.

---

## 1. Core Architectural Pillars

The platform reconciles four distinct institutional functions within one unified web application:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED INSTITUTIONAL SHELL                       │
│      Shared: Design System • Turso Cloud DB • RAG • IIIF • KG • Timeline│
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. DIGITAL MUSEUM │ Visual Discovery  │ 2. RESEARCH ARCHIVE            │
│    Visitor Mode   │ Stories & Media   │    Researcher Mode             │
│    Kiosk Attract  │ Timeline & Voice  │    Hybrid Search & Citations   │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 3. LEARNING HUB   │ Pedagogical RAG   │ 4. PRESERVATION SUITE          │
│    Student Mode   │ "Explain Simply"  │    Archivist / Curator Mode    │
│    Topic Explorer │ Source Deep-Links │    Non-Destructive OCR Review  │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 2. Navigation Routing & Page Hierarchy

| Route | Primary Persona | Purpose & Key Features |
|:---|:---:|:---|
| `/` | Visitor / All | Museum Homepage: Hero search, theme explorer, timeline highlights, multilingual preview, media carousel. |
| `/documents` | Researcher / Student | Archival Catalog: 112 multi-lingual volumes, filterable by language, format nature, and authority tier. |
| `/documents/[id]` | All Modes | Document Detail Page: Title, author, date, language versions, knowledge graph neighbors, and progressive metadata. |
| `/documents/[id]/viewer` | Researcher / Visitor | Deep-Zoom Facsimile Viewer: IIIF SVG canvas, OCR text overlays, PREMIS fixity drawer, Ask This Page drawer. |
| `/timeline` | Student / Visitor | Interactive Chronology: 1891–1956 historical eras, filtering by era, category, and person. |
| `/stories` | Visitor / Student | Curated Narrative Exhibits: Chapter-based historical walkthroughs with embedded media and archival sources. |
| `/knowledge-map` | Researcher / Student | Interactive Graph: Co-occurrence network of people, organizations, places, legal concepts, and treatises. |
| `/compare` | Researcher / Student | Source Comparison Engine: Side-by-side selection of two works, grounded AI synthesis of common themes & divergences. |
| `/media` | Visitor / All | Audiovisual Explorer: Historic BBC 1931 audio, Constituent Assembly 1949 video, archival photographs, and spoken search. |
| `/media/video/[id]` | All Modes | Video Player: Interactive timestamp-synchronized transcript that seeks video playback on segment click. |
| `/media/audio/[id]` | All Modes | Audio Player: Waveform progress scrubber, timestamped transcript, and "Ask about this recording" RAG inquiry. |
| `/search` | Researcher / All | Hybrid Search: Typed and voice input, BM25 + Vector + RRF + Cross-encoder reranking with claim-level evidence badges. |
| `/assistant` | Researcher / Student | AI Research Assistant: 8 research modes (`ask`, `explain`, `summarize`, `compare`, `find_evidence`, `ask_document`, `ask_page`, `research`). |
| `/kiosk` | Museum Visitor | Fullscreen Touch Shell: Inactivity countdown timer, attract screen with rotating quotes, touch targets $\ge 56\text{px}$, session privacy reset. |
| `/admin` | Archivist | Curation & Ingestion Portal: System telemetry, PREMIS audit trail, and Non-Destructive OCR Review Studio. |

---

## 3. Progressive Disclosure Architecture

To prevent cognitive overload for visitors while offering complete technical rigor to researchers:
1. **Visitor Layer (Level 1):** Clean typography, author, publication date, historical context, voice search, and large play/read triggers. Technical IDs, embeddings, and raw XML are hidden.
2. **Student Layer (Level 2):** Explanatory popovers, *"Explain this simply"* triggers, vocabulary definitions, and links to chronological context.
3. **Researcher Layer (Level 3):** Canonical work stable IDs, exact page citations, volume partitioning notes, claim validation audits, and cross-edition alignment links.
4. **Archivist Layer (Level 4):** PREMIS 3.0 fixity hashes (SHA-256), cryptographic event logs, raw machine OCR vs reviewed OCR, and administrative review actions (`VERIFY`, `EDIT`, `PUBLISH`).

---

## 4. Cross-Platform Responsive Standards

* **Touch-First Philosophy:** All primary controls are designed with generous bounding boxes ($\ge 48\text{px}$ on mobile/tablet, $\ge 56\text{px}$ on kiosk displays).
* **Viewport Adaptability:**
  * Phone (375px–767px): Vertical single-column stack, collapsible drawer navigation, swipeable carousels.
  * Tablet (768px–1023px): Two-column adaptive grid, persistent header controls, high-density touch surfaces.
  * Desktop (1024px–1920px): Full dual-pane research layouts (facsimile canvas + transcript / chat drawer).
  * Institutional Touchscreen (27"–32" Kiosk): Dedicated `/kiosk` shell with large typography and automatic attract timeout.
