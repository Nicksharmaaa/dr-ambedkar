# User Modes Architecture & Experience Guidelines

**System:** Ambedkar Heritage Intelligence & Digital Preservation System  
**Version:** 1.0.0 (Phase 10)  
**Standard:** One unified platform dynamically adapting complexity, metadata density, and action priorities across four distinct personas.

---

## 1. Unified Persona Architecture

Rather than building fragmented standalone applications, the platform shares:
* Unified design system tokens (`slate-950`, `amber-500`, serif typography)
* Single authoritative Turso database & hybrid search backend
* Grounded RAG assistant pipeline with citation guarantees
* Knowledge Graph & Timeline data structures
* Media audio/video catalog and facsimile deep-zoom engine

The active mode controls **presentation density, jargon visibility, interactive tooling, and cognitive load**.

---

## 2. Mode Specifications

### 2.1 VISITOR MODE
* **Primary Target:** Museum visitors, tourist exhibition attendees, school groups, general public, first-time users.
* **UX Priorities:**
  * Visual discovery & curated storytelling
  * Large touch targets ($\ge 48\text{px}$, $\ge 56\text{px}$ on kiosk)
  * Voice query enablement (minimal typing required)
  * Audio narration & video documentary prominence
  * Simple, elegant language (zero technical jargon)
* **What is Hidden:**
  * Database UUIDs, chunk hashes, SHA-256 fixity digests
  * Embedding dimensions, vector distances, OCR confidence scores
  * Raw PREMIS XML data and technical schema indicators
* **Key Navigation:** Explore, Timeline, Stories, Writings & Speeches, Photographs, Audio, Video, Ask the Archive.

---

### 2.2 STUDENT MODE
* **Primary Target:** Secondary and university students, educators, history learners.
* **UX Priorities:**
  * Conceptual pedagogical breakdown without sacrificing historical rigor
  * Direct action buttons: *"Explain this simply"*, *"What does this mean?"*, *"Show me the source"*, *"Show related material"*
  * Topic explorer & contextual timelines
  * Multilingual reading & neural audio speech narration
* **Grounded Invariance:**
  * Simplified explanations are generated exclusively from the grounded RAG engine referencing actual archival text.
  * Zero fabricated "educational" facts or trivia.

---

### 2.3 RESEARCHER MODE
* **Primary Target:** Historians, constitutional scholars, legal researchers, political scientists, archivists.
* **UX Priorities:**
  * Complete archival depth and granular precision
  * Multi-parameter metadata filtering (language, source institution, document type, year range, person, topic, place, original vs translation)
  * Four search modes: Exact Phrase, Lexical BM25, Semantic Vector, Hybrid RRF
  * Exact page jumping (zero approximate scrolling)
  * Claim-level verification badges (`SUPPORTED`, `PARTIAL`, `UNSUPPORTED`)
  * Side-by-side Source Comparison (`/compare`)
  * APA, Chicago, and BibTeX scholarly citation export with immutable stable IDs.

---

### 2.4 ARCHIVIST / CURATOR MODE
* **Primary Target:** Digital preservationists, institutional librarians, museum curators, system auditors.
* **UX Priorities:**
  * System integrity telemetry (Turso cloud health, fixity status, storage nodes)
  * Non-destructive OCR review interface: side-by-side view of immutable `raw_ocr_text` and editable `reviewed_ocr_text` with one-click approval
  * Fixity audit log & PREMIS 3.0 event tracking
  * Publication status controls (`DRAFT`, `PUBLISHED`, `REVIEW_REQUIRED`)
  * Cross-lingual relationship and structural alignment curation.

---

## 3. State Management & Persistence

User mode is tracked via `UserModeContext.tsx` in `frontend/lib/UserModeContext.tsx` and persisted to browser `localStorage` under `ambedkar_heritage_user_mode`. Switching modes takes immediate effect across all views without reloading the application.
