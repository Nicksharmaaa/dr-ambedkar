# SYSTEM ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System

**Version**: 2.0.0
**Date**: 2026-09-22
**Status**: Phase 1 — Approved Design

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

## 6. Knowledge Graph Architecture

```
Turso Graph Tables:
  entities (id, type, name, aliases, description, source_doc_id)
  entity_types: PERSON | PLACE | ORG | CONCEPT | WORK | EVENT | DATE | TOPIC
  relations (id, source_id, target_id, relation_type, evidence_chunk_id, confidence)
  relation_types: AUTHORED | DELIVERED_SPEECH_AT | MEMBER_OF | ...

Query via SQL JOINs + recursive CTEs
Visualization: Sigma.js / Cytoscape.js on frontend
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
