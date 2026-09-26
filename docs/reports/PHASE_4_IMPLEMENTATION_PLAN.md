# PHASE 4 IMPLEMENTATION PLAN
## Ambedkar Heritage Intelligence & Digital Preservation System

**Phase**: 4 — Corpus Ingestion · Text Processing · Embeddings · Hybrid Search · RAG Pipeline
**Date**: 2026-09-23
**Status**: IN PLANNING

---

## Corpus Reality (from live inventory)

> Source: `c:\dr ambedkar\incoming_documents\books_and_writings\`
> These are the ONLY real corpus files. No external material is used.

| Metric | Measured Value |
|---|---|
| **File count** | 19 TXT files (Vol 1 – Vol 17, with 14 and 17 split into parts) |
| **Total size** | 27.26 MB |
| **Document type** | Born-digital extracted text from DjVu scans |
| **Source** | Dr. Babasaheb Ambedkar: Writings and Speeches — Government of Maharashtra |
| **Total words** | 4,797,414 |
| **Total lines** | 987,494 |
| **Estimated pages** | ~24,678 (line-count heuristic; 40 lines/page) |
| **Language** | Primarily English; typographic Unicode only |
| **Non-ASCII chars** | Em dash (U+2014), curly quotes, bullet — typographic only |
| **Encoding issues** | None — UTF-8 clean, zero replacement chars |
| **Exact duplicates** | 0 (all 19 SHA-256 digests unique) |
| **Corrupted files** | 0 |
| **Handwritten pages** | 0 — no image data exists |
| **Born-digital text** | Yes — DjVu OCR text exports |
| **OCR needed** | NO — text already extracted |

> KEY INSIGHT: These .djvu.txt files are pre-extracted text. PaddleOCR is NOT applicable.
> PaddleOCR is reserved for Phase 5 when original page scans (PDF/TIFF) are provided.

---

## Phase 4 Tasks

### Task 1: Corpus Report — CORPUS_REPORT.md
### Task 2: Turso Schema Extension (chunks, embeddings, FTS5, DiskANN)
### Task 3: Text Ingestion & Provenance Service
### Task 4: Structure Parser (chapters, headings, paragraphs, footnotes, page numbers)
### Task 5: Structure-Aware Chunker (512 token, 64 overlap, boundary-respecting)
### Task 6: GPU Embedding (BAAI/bge-m3, CUDA, 1024-dim, batch=32)
### Task 7: Hybrid Search (DiskANN + FTS5 + RRF merge)
### Task 8: RAG API Endpoint (POST /api/v1/ai/ask, Gemini 1.5 Flash, SSE streaming)
### Task 9: RAG Frontend Component (AskAmbedkar.tsx, streaming, citations)
### Task 10: OCR Baseline Report — OCR_BASELINE_REPORT.md
### Task 11: Phase 4 Completion Report — PHASE_4_COMPLETION_REPORT.md

---

## Dependencies

```
pip install google-generativeai>=0.8.0
pip install sentence-transformers>=3.3.0
pip install sse-starlette>=2.1.0
pip install tiktoken>=0.8.0
```

---

## Configuration

```
GEMINI_MODEL=gemini-1.5-flash
AI_EMBEDDING_MODEL=BAAI/bge-m3
AI_EMBEDDING_DIMENSION=1024
AI_EMBEDDING_BATCH_SIZE=32
CORPUS_SOURCE_DIR=incoming_documents/books_and_writings
RAG_TOP_K=10
RAG_RRF_K=60
```

---

STATUS: READY TO EXECUTE
