# Phase 10 Implementation Plan: Institutional Heritage Experience, Multi-Mode Interaction & Kiosk Deployment

**Document Version:** 1.0.0  
**Phase:** 10 (Institutional Heritage Presentation & Experience)  
**Target:** Turn the verified technical foundation (Phases 1–9.5) into a world-class Digital Museum, Research Archive, Interactive Learning Platform, and Grounded AI Research System.  
**Constraint:** Do not rebuild ingestion, OCR, multilingual, or media pipelines. Do not fine-tune models. Do not start Phase 11.

---

## 1. System Inspection & Gap Analysis

### 1.1 Existing Working Backend & Data Features
* **Turso Cloud Database:** All migrations 001–006 live with archival objects, pages, chunks, vectors, knowledge graph (entities, relations), timeline events, story collections, media tracks, multilingual manifests (112 files), and OCR pages.
* **Hybrid Search Engine:** FTS5 BM25 + Qwen3-Embedding (DiskANN cosine) + Reciprocal Rank Fusion + Qwen3-Reranker cross-encoder.
* **Grounded AI Assistant:** 8 research modes (`ask`, `explain`, `summarize`, `compare`, `find_evidence`, `ask_document`, `ask_page`, `research`) with ClaimValidator, evidence chain tracking, and strict citation requirements.
* **Multilingual Translation & Script Detection:** Support for English, Hindi, Bengali, Gujarati, Tamil, and Marathi via IndicTrans2/Groq with caching.
* **Media & Spoken Search:** Timestamped audio/video tracks with seek-to-timestamp search and speaker segmentation.
* **Archival Page Facsimile & IIIF:** SVG facsimile raster generation, page annotation coordinates, and PREMIS audit trail.
* **OCR Service:** Non-destructive storage (`raw_ocr_text` vs `reviewed_ocr_text`) with per-language baseline reporting.

### 1.2 Identified UI & UX Gaps
* **Gap 1: Absence of Distinct User Modes:** Current UI serves a single generic perspective. Need unified 4-mode experience (**Visitor**, **Student**, **Researcher**, **Archivist**) dynamically adjusting layout, complexity, and controls.
* **Gap 2: Missing Dedicated Source Comparison Page (`/compare`):** Mode exists in the assistant API, but no dedicated side-by-side archival comparison interface exists in the frontend.
* **Gap 3: Missing Media Detail Pages (`/media/video/[id]`, `/media/audio/[id]`):** Only a basic list at `/media` exists without dedicated timestamp-scrubbing detail views.
* **Gap 4: Missing Kiosk Route & Attract Screen (`/kiosk`):** The folder `app/(kiosk)/kiosk` is currently empty. Need touch-first, fullscreen, attract screen, and privacy reset.
* **Gap 5: Fragmented Multilingual Edition Navigation:** On document detail pages, cross-edition links (e.g., English Vol 1 <-> Hindi Vol 1 <-> Tamil Vol 2) are not visually surfaced to researchers.
* **Gap 6: Evidence Presentation Hierarchy:** Assistant responses currently display citations, but lack the prominent **ANSWER -> EVIDENCE -> SOURCES -> OPEN EXACT PAGE** visual hierarchy requested in Section 12.
* **Gap 7: Archivist Review Workflow:** Admin page lacks an interactive non-destructive OCR curation tool directly updating `ocr_pages`.

---

## 2. Implementation Architecture & Phased Execution

### Phase 10.1: Design System & User Mode Infrastructure
1. Create `frontend/lib/UserModeContext.tsx` providing persistent user mode state (`visitor`, `student`, `researcher`, `archivist`).
2. Update `frontend/components/Navbar.tsx` with an elegant, museum-grade Mode Switcher and tablet-friendly navigation.
3. Author `DESIGN_SYSTEM.md` and `USER_MODES.md` formalizing typographic hierarchy, colors, spacing, and mode-specific presentation rules.

### Phase 10.2: Museum-Style Homepage Enhancement
1. Upgrade `frontend/app/page.tsx`:
   - Hero search bar supporting typed and voice queries.
   - Mode-aware quick actions.
   - **Explore Ambedkar** theme selector (Constitution, Social Democracy, Caste, Economics).
   - **Historical Eras Timeline** highlight strip.
   - **Featured Stories** carousel.
   - **Multilingual Corpus** showcase (112 volumes across 5 languages).
   - **Media Explorer** preview (historical audio, video, and photographs).
   - Full tablet/touch target optimization ($\ge 48\text{px}$).

### Phase 10.3: Document Detail & Deep-Link Viewer Refinement
1. Rebuild `frontend/app/documents/[id]/page.tsx` adhering to Section 9:
   - Header with title, author, date, language, document type, and source institution.
   - Controls: Original, OCR, Translation, Audio.
   - Actions: Ask This Page, Ask This Document, Compare, Find Related, Listen, Source.
   - Section 15: **Available Editions / Multilingual Versions** navigation.
   - Section 20: **Knowledge Map & Timeline Integration** (Related People, Works, Events, Places, Topics).
   - Progressively disclosed Dublin Core & PREMIS metadata.

### Phase 10.4: Source Comparison Interface (`/compare`)
1. Create `frontend/app/compare/page.tsx`:
   - Side-by-side selection of Source A and Source B from the archival corpus.
   - Direct comparison of metadata, original text, and OCR.
   - Grounded AI comparative analysis using `/api/v1/assistant/ask` mode=`compare`.
   - Common themes, differences, and cited supporting passages.

### Phase 10.5: Media Explorer & Dedicated Detail Pages
1. Upgrade `frontend/app/media/page.tsx`: Filterable gallery of Photographs, Audio, and Video with search across spoken transcripts.
2. Create `frontend/app/media/video/[id]/page.tsx`: Video player with interactive timestamp-synchronized transcript and seeking.
3. Create `frontend/app/media/audio/[id]/page.tsx`: Audio player with interactive transcript, waveform/time bar, and "Ask about this recording".
4. Add Photograph zoom modal with provenance and related entities.

### Phase 10.6: Dedicated Museum Kiosk Interface (`/kiosk`)
1. Create `frontend/app/kiosk/page.tsx`:
   - Fullscreen kiosk shell with high contrast, large touch targets ($\ge 56\text{px}$), and simplified UI.
   - **Attract Screen** featuring rotating archival photographs, quotes, and "Touch to Explore".
   - 60-second inactivity detection with countdown reset.
   - Visitor session privacy clearing (purging search history, active queries, and temporary state).

### Phase 10.7: AI Evidence Presentation & Claim UI Refinement
1. Enhance `frontend/app/assistant/page.tsx` and viewer drawers:
   - Visual structure: **ANSWER -> EVIDENCE -> SOURCES -> OPEN EXACT PAGE**.
   - Claim verification badges: `SUPPORTED`, `PARTIAL`, `UNSUPPORTED`.
   - Deep-link navigation jumping directly to exact document and page.

### Phase 10.8: Archivist / Curator Dashboard Enhancements
1. Upgrade `frontend/app/admin/page.tsx`:
   - System integrity dashboard (Turso, storage, fixity).
   - Dedicated Non-Destructive OCR Review tool allowing curators to view `raw_ocr_text` and save `reviewed_ocr_text`.
   - Manifest catalog browser with filtering by language and authority tier.

### Phase 10.9: Comprehensive Testing & Verification
1. Run `pnpm type-check` to guarantee zero TypeScript regressions.
2. Run backend pytest test suites (`test_phase9_5_multilingual_corpus.py`, etc.).
3. Execute browser subagent verification on tablet and desktop viewports, testing all four user modes and the kiosk experience.
4. Author all required documentation and `PHASE_10_COMPLETION_REPORT.md`.

---

## 3. Immediate Execution Steps

1. Create `frontend/lib/UserModeContext.tsx` and integrate it into `frontend/app/layout.tsx` and `Navbar.tsx`.
2. Update homepage `frontend/app/page.tsx` with museum-grade sections and mode adaptability.
3. Rebuild `frontend/app/documents/[id]/page.tsx` with Section 9 structure, Multilingual Versions, and Knowledge Map.
4. Create `frontend/app/compare/page.tsx`.
5. Create `frontend/app/media/video/[id]/page.tsx` and `frontend/app/media/audio/[id]/page.tsx`.
6. Create `frontend/app/kiosk/page.tsx`.
7. Upgrade `frontend/app/admin/page.tsx` with OCR curation.
8. Validate, test, and write completion report.
