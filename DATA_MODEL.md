# Complete System Data Model — Phase 8

## Overview
The Ambedkar Heritage Platform operates an authoritative relational schema hosted on Turso Cloud (`libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io`).

---

## 1. Archival & Preservation Core Tables (Migrations 001–003)
- `collections`: Curated institutional groupings (Writings, Speeches, Debates, Photographs, Audio).
- `archival_objects`: Master bibliographic object record (Dublin Core + PREMIS provenance).
- `pages`: Physical digital facsimile representations with dimensions, DPI, and image links.
- `document_chunks`: Primary textual chunks (token count, OCR text, char count, page reference).
- `embeddings`: High-density semantic vector representations.
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
