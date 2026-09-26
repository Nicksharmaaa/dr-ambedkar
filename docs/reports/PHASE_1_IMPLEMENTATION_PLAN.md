# PHASE 1 IMPLEMENTATION PLAN
## Ambedkar Heritage Intelligence & Digital Preservation System

**Phase**: 1 — Environment Inspection · Architecture Design · Foundation Scaffold
**Date**: 2026-09-22
**Status**: IN EXECUTION

---

## Context

Prompt 0 established the project constitution. This is Phase 1 execution.
Previous Phase 1 documents are superseded by this prompt's updated architecture requirements.

**Key architectural changes from prior spec:**
- Database: Turso (libSQL/SQLite-based managed DB) — NOT PostgreSQL
- Storage: Local filesystem first (S3-compatible abstraction layer)
- Vector search: Turso-native vector retrieval (evaluated in this phase)
- No pgvector, no PostgreSQL, no MinIO required for initial prototype

---

## Objectives

1. Full machine inspection (hardware + software)
2. Research and verify Turso Python client compatibility on Windows
3. Evaluate Turso vector search capabilities for planned corpus
4. Design system architecture for Turso + local storage
5. Research and validate all AI model compatibility
6. Create all required architecture documents
7. Create workspace `.agents/skills/` scaffold
8. Create project directory scaffold
9. Run foundation verification
10. Produce Phase 1 Completion Report

---

## Task Checklist

### 1. Machine Inspection
- [x] OS: Windows 11 Home (Build 10.0.26200)
- [x] CPU: Intel i5-13450HX (16 logical cores)
- [x] RAM: 16.9 GB total, 4.2 GB available at inspection
- [x] GPU: NVIDIA RTX 4050 Laptop (Ada Lovelace, CC 8.9)
- [x] VRAM: 6,141 MiB total, 4,593 MiB free at inspection
- [x] CUDA: Driver 610.62, PyTorch reports CUDA 12.8
- [x] Python: 3.14.5
- [x] Node.js: v24.14.1
- [x] npm: 11.11.0
- [x] pnpm: 12.5.1 (INSTALLED — available)
- [x] Docker: 29.8.0 (installed; daemon not running)
- [x] Docker Compose: v5.5.1
- [x] Git: 2.53.0
- [x] Disk: 113 GB free
- [x] Network: Online (PyPI reachable)
- [x] Browsers: Brave + Edge both installed
- [x] PyTorch: 2.11.0+cu128, CUDA: True, GPU verified

### 2. Turso/libSQL Research
- [x] `libsql` 0.1.11 — requires Rust/maturin; no pre-built Windows wheel; BLOCKED
- [x] Rust NOT installed on machine
- [x] `libsql-client` 0.3.1 — pure Python wheel; Windows-compatible; VIABLE
- [x] `sqlalchemy-libsql` 0.2.0 — exists; compatibility unverified with Python 3.14
- [x] Turso HTTP API — REST endpoint approach via httpx; no Rust needed; VIABLE
- [x] Turso vector search — up to 65,536 dims; DiskANN; cosine/euclidean; VIABLE
- [x] Turso FTS5 — built-in SQLite FTS5; VIABLE
- [x] Decision: Use `libsql-client` (async, pure Python) as primary Turso driver

### 3. AI Model Research
- [x] Qwen3-Embedding-0.6B — 0.8 GB VRAM; LOCAL VIABLE
- [x] Qwen3-Reranker-0.6B — 0.8 GB VRAM; LOCAL VIABLE
- [x] Qwen3-VL-2B INT4 — ~2.0 GB VRAM; LOCAL VIABLE
- [x] PaddleOCR PP-OCRv5 — Python 3.13 max officially; requires separate venv
- [x] IndicTrans2 — Python 3.10–3.13; separate venv needed
- [x] IndicConformer — NeMo-based; Python 3.10 venv
- [x] IndicF5 — Python 3.10 venv

### 4. Architecture Documents
- [x] SYSTEM_ARCHITECTURE.md
- [x] DATA_ARCHITECTURE.md
- [x] TECH_STACK.md
- [x] HARDWARE_CAPABILITY.md
- [x] DATABASE_ARCHITECTURE.md
- [x] STORAGE_ARCHITECTURE.md
- [x] MODEL_SELECTION.md
- [x] RISK_REGISTER.md

### 5. Skill Scaffold
- [x] .agents/skills/archival-ingestion/SKILL.md
- [x] .agents/skills/document-ai/SKILL.md
- [x] .agents/skills/preservation/SKILL.md
- [x] .agents/skills/retrieval/SKILL.md
- [x] .agents/skills/rag/SKILL.md
- [x] .agents/skills/ml-evaluation/SKILL.md
- [x] .agents/skills/knowledge-graph/SKILL.md
- [x] .agents/skills/multilingual/SKILL.md
- [x] .agents/skills/media-processing/SKILL.md
- [x] .agents/skills/kiosk/SKILL.md
- [x] .agents/skills/security/SKILL.md
- [x] .agents/skills/qa/SKILL.md

### 6. Foundation Verification
- [x] Directory scaffold verified
- [x] Git initialized + committed
- [x] Network verified
- [x] PyTorch+CUDA verified
- [x] Turso client verified installable

### 7. Completion Report
- [x] PHASE_1_COMPLETION_REPORT.md

---

## Key Engineering Decisions

| Decision | Rationale |
|---|---|
| Use `libsql-client` not `libsql` | `libsql` requires Rust (not installed, Windows no pre-built wheel); `libsql-client` is pure Python |
| No SQLAlchemy for Turso | `sqlalchemy-libsql` 0.2.0 unverified on Python 3.14; use repository pattern with direct DB-API |
| Local filesystem for storage | Sufficient for hackathon; abstraction layer allows future R2/S3 swap |
| Turso vector search evaluated VIABLE | 65,536-dim support; DiskANN indexing; cosine similarity; adequate for planned corpus |
| Turso FTS5 for lexical search | Built into SQLite/libSQL; no additional infrastructure |
| Separate Python 3.12 venv for OCR | PaddleOCR officially supports up to Python 3.13; isolated venv prevents system conflicts |
| Separate Python 3.10 venv for Indic | IndicConformer (NeMo) requires Python 3.10 |
| Qwen3-Embedding-0.6B for local embed | VRAM budget: 0.8 GB; fits with other models; 32K context |
| Qwen3-VL-2B INT4 for local multimodal | ~2.0 GB quantized; document understanding |
| Repository/service pattern over ORM | Keeps DB layer swappable; clean abstraction |
