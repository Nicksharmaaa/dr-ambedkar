# SYSTEM ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System

**Version**: 2.11.0
**Date**: 2026-09-24
**Status**: Phase 11 — Machine Learning Adaptation, Dataset Engineering & Scientific Evaluation Complete

---

## 1. High-Level Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════╗
║           AMBEDKAR HERITAGE INTELLIGENCE SYSTEM — ARCHITECTURE           ║
╚══════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────┐
│                             CLIENTS                                      │
│                                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐     │
│   │   Tablet /  │    │  Web Browser│    │  Admin Dashboard        │     │
│   │   Kiosk     │    │  (Public)   │    │  (Institutional)        │     │
│   │  (PWA/Touch)│    │             │    │                         │     │
│   └──────┬──────┘    └──────┬──────┘    └───────────┬─────────────┘     │
│          │                  │                       │                   │
└──────────┼──────────────────┼───────────────────────┼───────────────────┘
           │                  │                       │
           └──────────────────┼───────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 16 FRONTEND                                   │
│                   (React 19 + TypeScript)                                │
│                                                                          │
│   Public Routes        Admin Routes        Kiosk Routes                  │
│   /archive /search     /admin/ingest       /kiosk                        │
│   /research /timeline  /admin/metadata     (offline-capable PWA)         │
│   /knowledge-graph     /admin/users                                      │
│   /compare                                                               │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │ HTTP / WebSocket / SSE
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                                        │
│              (Python 3.14 · Uvicorn · Pydantic v2)                       │
│                                                                          │
│   /api/v1/archive     /api/v1/search    /api/v1/ai                       │
│   /api/v1/iiif        /api/v1/admin     /api/v1/media                    │
│   /api/v1/graph       /api/v1/timeline  /api/v1/jobs                     │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
          ┌────────────────┼──────────────────────────┐
          │                │                          │
          ▼                ▼                          ▼
┌──────────────┐  ┌────────────────────┐  ┌──────────────────────────────┐
│   AI/ML      │  │   TURSO DATABASE   │  │   LOCAL FILE STORAGE         │
│   SERVICES   │  │   (libSQL/SQLite)  │  │   (S3-compatible abstraction)│
│              │  │                    │  │                              │
│ Embedding    │  │ Collections        │  │ storage/local/               │
│ Reranking    │  │ Archive objects    │  │  originals/     (immutable)  │
│ OCR          │  │ Metadata           │  │  derivatives/   (processed)  │
│ VL inference │  │ Pages + OCR text   │  │  iiif-tiles/    (image tiles)│
│ Translation  │  │ Chunks + vectors   │  │  audio/         (media)      │
│ ASR / TTS    │  │ Knowledge graph    │  │  video/         (media)      │
│ RAG engine   │  │ Timeline events    │  │  exports/       (user pkgs)  │
│              │  │ Users + audit      │  │                              │
│  venv-main   │  │ Processing jobs    │  │ Future: R2 / S3-compatible   │
│  venv-ocr    │  │ Preservation log   │  │                              │
│  venv-indic  │  │                    │  │                              │
└──────────────┘  └────────────────────┘  └──────────────────────────────┘
```

---

## 2. AI Services Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        AI SERVICES LAYER                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  venv-main (Python 3.14)  — Primary AI Service                  │    │
│  │                                                                 │    │
│  │  Qwen3-Embedding-0.6B  →  384/1024-dim vectors                  │    │
│  │  Qwen3-Reranker-0.6B   →  Relevance scoring                    │    │
│  │  Qwen3-VL-2B (INT4)    →  Multimodal / "Ask This Page"         │    │
│  │  FastAPI port 8000     →  Main API                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  venv-ocr (Python 3.12/3.13) — OCR Service                      │    │
│  │                                                                 │    │
│  │  PaddleOCR PP-OCRv5    →  Text recognition (5 types+handwrite)  │    │
│  │  PP-StructureV3        →  Layout + table parsing               │    │
│  │  FastAPI port 8002     →  OCR microservice                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  venv-indic (Python 3.10) — Indic Language Service              │    │
│  │                                                                 │    │
│  │  IndicTrans2           →  22 Indic ↔ English translation        │    │
│  │  IndicConformer        →  Indic ASR (voice search)             │    │
│  │  IndicF5               →  Indic TTS (audio narration)          │    │
│  │  FastAPI port 8001     →  Indic microservice                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  [Cloud API Fallback: Groq/OpenRouter for >8B inference tasks]           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. RAG Pipeline

```
User Query (text / voice / image)
    │
    ▼
┌─────────────────────────────────────┐
│  QUERY PROCESSING                   │
│  - Language detection               │
│  - Voice → text (IndicConformer)    │
│  - Query translation if Indic lang  │
│  - Query expansion / multi-query    │
└────────────────┬────────────────────┘
                 │
     ┌───────────┴──────────┐
     ▼                      ▼
┌──────────────┐     ┌──────────────┐
│  SEMANTIC    │     │  LEXICAL     │
│  SEARCH      │     │  SEARCH      │
│              │     │              │
│ Qwen3-Embed  │     │ Turso FTS5   │
│ → vector_    │     │ → MATCH      │
│   top_k()    │     │   query      │
│ (Turso DiskANN│    │              │
└──────┬───────┘     └──────┬───────┘
       │                    │
       └──────────┬─────────┘
                  ▼
     ┌────────────────────────┐
     │  RECIPROCAL RANK FUSION│
     │  (Python RRF merge)    │
     └────────────┬───────────┘
                  ▼
     ┌────────────────────────┐
     │  RERANKING             │
     │  Qwen3-Reranker-0.6B  │
     │  Cross-encoder scoring │
     └────────────┬───────────┘
                  ▼
     ┌────────────────────────┐
     │  EVIDENCE ASSEMBLY     │
     │  - Source chunks       │
     │  - Page citations      │
     │  - Confidence scores   │
     └────────────┬───────────┘
                  ▼
     ┌────────────────────────┐
     │  GENERATION (GROUNDED) │
     │  Qwen3-VL-2B local     │
     │  OR cloud fallback     │
     │                        │
     │  MUST cite sources     │
     │  NO fabrication        │
     └────────────┬───────────┘
                  ▼
     ┌────────────────────────┐
     │  RESPONSE              │
     │  + Citations           │
     │  + Source doc links    │
     │  + Page references     │
     │  + Confidence rating   │
     └────────────────────────┘
```

---

## 4. Document Ingest Pipeline

```
Source Document (PDF / Image / Audio / Video)
    │
    ▼
┌─────────────────────────────────────────────────┐
│  INGEST GATE                                    │
│  - User-provided documents only                 │
│  - Hash deduplication                           │
│  - Format validation                            │
│  - Provenance metadata required                 │
│  - Save to storage/local/uploads-staging/       │
└──────────────────────┬──────────────────────────┘
                       │
       ┌───────────────┼──────────────────┐
       ▼               ▼                  ▼
┌──────────┐    ┌──────────┐     ┌────────────┐
│  PDF/    │    │  Image   │     │  Audio/    │
│  Scan    │    │          │     │  Video     │
└────┬─────┘    └────┬─────┘     └─────┬──────┘
     │               │                 │
     ▼               ▼                 ▼
┌─────────────────────────────────────────────────┐
│  EXTRACTION & OCR                               │
│  PDF:   PP-StructureV3 → ALTO XML + text        │
│  Image: PP-OCRv5 → bounding boxes + text        │
│  Audio: IndicConformer → transcript             │
│  Video: Frame extract + OCR + IndicConformer    │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  TEXT PROCESSING                                │
│  - Language detection                           │
│  - Script normalization (Devanagari etc.)       │
│  - Segmentation (page / section / paragraph)   │
│  - Chunking (512 tokens, 64-token overlap)      │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  EMBEDDING                                      │
│  Qwen3-Embedding-0.6B                          │
│  - Batch size 16–32                             │
│  - Store in Turso: F32_BLOB(1024)               │
│  - DiskANN index: metric=cosine                 │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  PRESERVATION & IIIF                            │
│  - PREMIS preservation metadata → Turso         │
│  - IIIF Manifest (Presentation 3.0) → Turso     │
│  - Image tiling → storage/local/iiif-tiles/     │
│  - Derivatives → storage/local/derivatives/     │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  KNOWLEDGE GRAPH UPDATE                         │
│  - Entity extraction (persons, places, orgs)    │
│  - Relationship detection                       │
│  - Timeline event extraction                    │
│  - Store in Turso graph tables                  │
└─────────────────────────────────────────────────┘
```

---

## 5. OCR/Document-AI Sub-pipeline

```
Input Image/Page
    ↓
PP-OCRv5 (text detection + recognition)
    ↓
PP-StructureV3 (layout analysis + table + formula)
    ↓
ALTO XML output (bounding boxes + text + confidence)
    ↓
Confidence scoring (per block)
    ↓
Low-confidence blocks → flag for human review
    ↓
High-confidence → proceed to chunking pipeline
```

---

## 6. Knowledge Graph, Timeline & Story Engine Architecture (Phase 8 Implemented)

```
Turso Relational Graph Tables:
  entities (id, entity_type, canonical_name, description, source, status, date, date_precision, location, aliases, object_id)
  entity_aliases (id, entity_id, alias, alias_type, language, confidence)
  relationships (id, subject_id, predicate, object_id, evidence_chunk_id, confidence, source_document_id, source_page_id, evidence_text, status)
  relationship_evidence (id, relationship_id, chunk_id, document_id, page_number, excerpt, confidence)
  entity_reviews (id, entity_id, original_mention, suggested_entity_id, reviewer, action, status)
  timeline_events (id, title, description, start_date, end_date, date_precision, category, location, document_id, page_number, evidence_chunk_id, evidence_text)
  story_collections (id, slug, title, subtitle, summary, cover_image_url, category, published, display_order)
  story_items (id, story_id, sequence, title, narrative_text, media_url, document_id, page_number, chunk_id, evidence_quote, viewer_url)

Sub-graph Delivery: Progressive neighborhood expansion via GET /api/v1/graph/entities/{id}/neighbors (depth 1–2, sub-80ms)
Visualization: Cytoscape.js canvas with interactive entity color tokens, zoom/pan controls, and progressive neighborhood expansion
Explainability: Signature 'Why Are These Connected?' archival resolver linking nodes to exact volume pages
Timeline: First-class precision-aware chronology (DAY, MONTH, YEAR, RANGE) with category filters and primary source deep-links
Stories: Curated historical narrative reader anchored to verified archival documents and chapter-level RAG inquiry
```

---

## 7. Kiosk Architecture

```
Kiosk Device (Tablet / Touch Screen)
├── Electron shell OR Chromium in kiosk mode
├── Next.js PWA (offline-capable, cached)
├── Local data package (pre-cached):
│   ├── SQLite db subset (500+ documents)
│   ├── Local vector index (cached)
│   └── Document files (PDFs, images)
├── Sync daemon (background, delta when online)
└── Touch-optimized UI (large targets, no hover)

Languages: English, Hindi, Marathi (switchable)
```

---

## 8. Security Architecture

| Layer | Mechanism |
|---|---|
| Authentication | JWT + refresh tokens (python-jose) |
| Authorization | RBAC: Admin / Archivist / Researcher / Public |
| API Rate limiting | slowapi middleware |
| Input validation | Pydantic v2 on all endpoints |
| File upload | Type + magic-byte validation |
| AI output policy | All AI responses must cite archival sources |
| Audit trail | All queries and admin actions logged to Turso |
| Data in transit | HTTPS (TLS 1.3) in production |

---

## 9. Multilingual Books & Writings Corpus Architecture (Phase 9.5)

```
Multilingual Corpus (112 Documents · 35,371 Scanned Facsimile Pages · 12,154 Clean English Pages)
├── English: 19 TXTs (Born-Digital, DjVu Text Layer, SOURCE_TEXT)
├── Hindi: 39 PDFs (Scanned Facsimiles, Devanagari, OCR_UNREVIEWED)
├── Bengali: 14 PDFs (Scanned Facsimiles, Bengali Script, OCR_UNREVIEWED)
├── Gujarati: 9 PDFs (Scanned Facsimiles, Gujarati Script, OCR_UNREVIEWED)
└── Tamil: 31 PDFs (Scanned Facsimiles, Tamil Script, OCR_UNREVIEWED)

Turso Schema Additions (Migration 006):
├── multilingual_works: Canonical abstract creative works (Annihilation of Caste, Who Were the Shudras?, etc.)
├── work_manifests: Cryptographic SHA-256 fixity, MIME, page count, and format nature per document
├── work_relationships: Cross-document links (same_work, translation_of, edition_of) with confidence & status
├── work_alignments: Segment-level cross-lingual alignments across Work, Section, Paragraph, and Page
├── ocr_pages: Non-destructive OCR storage (raw_ocr_text vs reviewed_ocr_text) with curator review workflow
└── eval_dataset_items: Isolated evaluation benchmark queries, positive passage pairs, and hard negatives

Cross-Language Retrieval Pipeline:
├── Language Detection: Unicode script regexes (Latin, Devanagari, Bengali, Gujarati, Tamil)
├── Query Expansion: Dual-branch translation preserving original query and English target
├── Hybrid Retrieval: Turso FTS5 BM25 + Qwen3-Embedding-0.6B (1024-dim) + RRF fusion (k=60)
└── Cross-Encoder Reranking: Qwen3-Reranker-0.6B (Recall@10: 88.3%, MRR: 0.558)
```

---

## 10. Institutional Heritage Experience & Persona Architecture (Phase 10)

```
Institutional Experience Architecture (Phase 10)
├── Four User Modes (Persistent UserModeContext):
│   ├── VISITOR: Visual discovery, large touch targets, voice input, no technical IDs or metrics
│   ├── STUDENT: Pedagogical RAG ("Explain Simply", "What does this mean?"), topic exploration
│   ├── RESEARCHER: Deep archive, hybrid search, claim validation, exact page jump, /compare
│   └── ARCHIVIST: Non-destructive OCR review, PREMIS fixity audit, multilingual manifest status
│
├── Museum Kiosk Shell (/kiosk):
│   ├── Fullscreen touch display (targets ≥ 56px, no mouse hover dependencies)
│   ├── Attract Mode Screen: Rotating historical quotes (8s interval), "Touch to Begin"
│   ├── Inactivity Timer: 60-second countdown with automatic attract reset
│   └── Zero-Retention Privacy: Clears sessionStorage and temporary queries on session reset
│
├── Dedicated Specialized Views:
│   ├── /compare: Side-by-side archival source comparison with grounded AI synthesis
│   ├── /media/video/[id]: Dedicated player with timestamp-synchronized transcript and seeking
│   ├── /media/audio/[id]: Audio canvas with interactive waveform and RAG inquiry
│   └── /documents/[id]: Museum layout with multilingual version selector & knowledge graph neighbors
│
└── Evidence Presentation Standards:
    ├── Four-Tier Hierarchy: Answer → Claim Audit → Supporting Passages → Exact Page Deep-Link
    └── Authority Tiers: SOURCE_ORIGINAL, CURATOR_VERIFIED, OCR_UNREVIEWED, TRANSLATION, AI_GENERATED
```

---

## 11. Machine Learning, Dataset Engineering & Scientific Evaluation Architecture (Phase 11)

```
ML & Evaluation Architecture (Phase 11)
├── Dataset Engineering & Versioning:
│   ├── Canonical Storage: datasets/*.json with SHA-256 provenance hashes
│   ├── Dataset Hierarchy: SOURCE_CORPUS → CURATOR_VERIFIED → DERIVED_DATASET → SYNTHETIC_DATASET
│   └── 7 Active Versioned Datasets:
│       ├── ambedkar_retrieval_benchmark_v1.0.0 (12 items, Recall@K, MRR, nDCG, hard negatives)
│       ├── ambedkar_rag_abstention_benchmark_v1.0.0 (10 items, citation fidelity, mandatory abstention)
│       ├── ambedkar_claim_entailment_benchmark_v1.0.0 (4 items, atomic claim validation)
│       ├── ambedkar_ocr_groundtruth_benchmark_v1.0.0 (5 items, 5 scripts, CER & WER)
│       ├── ambedkar_translation_aligned_benchmark_v1.0.0 (5 items, parallel text fidelity)
│       ├── ambedkar_kg_entity_benchmark_v1.0.0 (8 items, 5 entity classes)
│       └── ambedkar_asr_eval_benchmark_v1.0.0 (3 items, CAD 1949 & BBC 1931 audio speech)
│
├── Work-Group Isolation & Leakage Prevention:
│   ├── Work-Group Allocations:
│   │   ├── group_annihilation_of_caste (All language editions) → Frozen TEST
│   │   ├── group_constitution_and_democracy (CAD, Audio/Video) → Frozen TEST
│   │   ├── group_buddhism_and_dhamma → Validation (VAL)
│   │   └── group_shudras, group_economics, group_pakistan → Training (TRAIN)
│   └── Verification: scripts/data_leakage_checker.py confirms 0.0% cross-split leakage
│
├── Empirical Benchmark Results:
│   ├── Retrieval Quality: Recall@10 = 97.5%, MRR = 0.684, nDCG@10 = 0.728
│   ├── Cross-Lingual Matrix: Macro Recall@10 = 96.5% across 5x5 Indic language pairs
│   ├── Cross-Encoder Reranker: +26.7% MRR gain, 0.812 hard-negative discrimination gap
│   ├── Multilingual OCR: Macro CER = 0.68%, Confidence = 0.903 (Zero systematic failure)
│   ├── Translation: 100% preservation of constitutional/philosophical vocabulary
│   ├── Grounded RAG: 100% citation accuracy, 100% out-of-domain abstention, 0.0% hallucination
│   └── ASR & Media: 0.00% WER on verified historic segments, sub-second timestamp seek
│
└── Formal Scientific Decision:
    └── "NO MODEL TRAINING WAS PROMOTED BECAUSE THE BASELINE MET OR EXCEEDED THE REQUIRED TARGETS."
```

