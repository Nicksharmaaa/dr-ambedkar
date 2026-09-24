# Complete System Data Model — Phase 9.5
## Ambedkar Heritage Intelligence & Digital Preservation System

## Overview
The Ambedkar Heritage Platform operates an authoritative relational schema hosted on Turso Cloud (`libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io`).

---

## 1. Archival & Preservation Core Tables (Migrations 001–003)
- `collections`: Curated institutional groupings (Writings, Speeches, Debates, Photographs, Audio).
- `archival_objects`: Master bibliographic object record (Dublin Core + PREMIS provenance).
- `pages`: Physical digital facsimile representations with dimensions, DPI, and image links.
- `document_chunks`: Primary textual chunks (token count, OCR text, char count, page reference).
- `embeddings`: High-density semantic vector representations (1024-dim Qwen3).
- `preservation_events`: Immutable audit trail tracking fixity checks, SHA-256 digests, and format migrations.

---

## 2. Knowledge Graph & Resolution Tables (Migration 004)
- `entities`: Master polymorphic registry for 18 supported entity types (`PERSON`, `WORK`, `CONCEPT`, `EVENT`, `PLACE`, `ORGANIZATION`, etc.).
- `entity_aliases`: Variant spellings, honorific variants, and OCR error normalization.
- `relationships`: Semantic edges with predicates (`AUTHORED`, `DELIVERED`, `PARTICIPATED_IN`, `DISCUSSED`, `SUPPORTS`), confidence scores, and verification status (`CANDIDATE`, `VERIFIED`, `REJECTED`).
- `relationship_evidence`: Archival citations anchoring edges to physical pages and verbatim excerpt quotes.
- `entity_reviews`: Archivist decision log capturing curation notes, timestamps, and promotion actions.

---

## 3. Historical Timeline & Heritage Story Tables (Migration 004)
- `timeline_events`: Precision-aware milestones (`DAY`, `MONTH`, `YEAR`, `RANGE`, `APPROXIMATE`, `UNKNOWN`) categorized into 12 historical domains with primary source links.
- `story_collections`: High-level narrative journeys with metadata, cover art, and taxonomy.
- `story_items`: Ordered narrative chapters linking primary facsimile images, verbatim quotes, and RAG inquiry context.

---

## 4. Multilingual & Multimodal Accessibility Tables (Migration 005)
- `translations_cache`: SHA-256 keyed cache of derivative translations (`en`, `hi`, `mr`, `bn`, `gu`, `ta`).
- `tts_cache`: Audio paths and parameters for neural narration recordings (`AI_NARRATION`).
- `transcript_segments`: Timestamped spoken word segments for historical audio/video archives (`Dr. B.R. Ambedkar`, `Archival Announcer`).
- `multimodal_page_analyses`: Layout analysis, visual structure reasoning, and OCR conflict detections.
- `entity_localizations`: Localized display names and descriptions in Devanagari Hindi and Marathi for knowledge graph entities.
- `timeline_localizations`: Localized event titles and descriptions for chronology milestones.

---

## 5. Multilingual Books & Writings Corpus Tables (Migration 006 — Phase 9.5)
- `multilingual_works`: Master catalog of Dr. B.R. Ambedkar's creative and philosophical works (*Annihilation of Caste*, *Who Were the Shudras?*, *The Buddha and His Dhamma*, etc.).
- `work_manifests`: File-level catalog for all 112 documents across 5 languages (English, Hindi, Bengali, Gujarati, Tamil) with streaming SHA-256 checksums, page counts, file sizes, and text authority labels.
- `work_relationships`: Inter-document relationships (`same_work`, `edition_of`, `translation_of`, `related_work`) with confidence scores and verification statuses (`CANDIDATE`, `VERIFIED`, `REJECTED`).
- `work_alignments`: Cross-lingual segment alignments at Work, Section, Paragraph, and Page granularities.
- `ocr_pages`: Page-level OCR text, preserving `raw_ocr_text` separately from `reviewed_ocr_text` with curator audit metadata.
- `eval_dataset_items`: Isolated evaluation benchmark items, positive pairs, and hard negatives mined from the archival corpus.

---

## 6. Institutional Experience & User Modes Schema Mapping (Phase 10)
- **User Mode State (`localStorage: ambedkar_user_mode`)**:
  - `visitor`: High visual discovery, museum spacing, technical ID suppression, 60s inactivity session reset.
  - `student`: Pedagogical concept explorer (`mode=explain`), progressive vocabulary scaffolding, grounded synthesis citations.
  - `researcher`: Advanced hybrid search, multi-faceted filtering (date, language, volume), dual-source comparison (`/compare`), citation audit telemetry.
  - `archivist`: Curation studio (`/admin`), non-destructive OCR review (`raw_ocr_text` vs `reviewed_ocr_text`), certification API (`api.reviewOCRPage`).
- **Four-Tier Evidence Data Flow**:
  1. *Answer*: Grounded textual response strictly bounded by `<ARCHIVAL_EVIDENCE>` tags.
  2. *Claims*: Factually atomic claims verified as `SUPPORTED`, `PARTIAL`, `UNSUPPORTED`, `CONFLICTING`.
  3. *Citations*: Structured provenance tuples (`chunk_id`, `object_id`, `volume_number`, `page_number`, `excerpt`, `viewer_url`).
  4. *Page Deep-Link*: Deterministic deep-link to physical facsimile coordinates (`/documents/[id]?page=[n]`).
- **Audiovisual Media Synchronization**:
  - `media_assets`: Metadata, storage keys, MIME types, and duration seconds.
  - `transcript_segments`: Bounded millisecond intervals (`start_time`, `end_time`), speaker provenance, and search indexing for seek-to-timestamp interaction.

