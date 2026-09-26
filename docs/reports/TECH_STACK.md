# TECHNOLOGY STACK
## Ambedkar Heritage Intelligence & Digital Preservation System

**Version**: 2.0.0
**Date**: 2026-09-22

---

## 1. Frontend

| Component | Technology | Version | Rationale |
|---|---|---|---|
| Framework | Next.js | 16.x | Current stable; App Router; React 19; Node 24 |
| UI Library | React | 19.x | Latest stable |
| Language | TypeScript | 5.x | Type safety |
| Styling | Vanilla CSS + CSS Variables | — | No framework lock-in |
| State | Zustand | 5.x | Lightweight |
| Data fetching | TanStack Query | 5.x | Async state + caching |
| IIIF Viewer | Clover IIIF | 3.x | IIIF 3.0 native; audio/video |
| Deep zoom | OpenSeadragon | 5.x | Industry standard |
| Knowledge graph | Sigma.js | 3.x | GPU-accelerated WebGL |
| Timeline | vis-timeline | 7.x | Archival timeline |
| Package manager | pnpm | 12.5.1 | Faster; disk-efficient |
| Node runtime | Node.js | 24.14.1 (LTS) | Active LTS |

---

## 2. Backend — Main API (Python 3.14)

| Component | Technology | Version | Rationale |
|---|---|---|---|
| API Framework | FastAPI | 0.136+ | Python 3.14 compatible; async; Pydantic v2 |
| Language | Python | 3.14.5 | Free-threading; main system Python |
| Validation | Pydantic | v2 | Required for Python 3.14 |
| ASGI Server | Uvicorn | 0.34+ | Production-grade |
| HTTP Client | httpx | 0.28+ | Async; used for Turso HTTP and cloud APIs |
| Auth | python-jose + passlib | — | JWT; bcrypt passwords |
| Rate limiting | slowapi | — | Per-endpoint rate limits |
| DB Client | libsql-client | 0.3.1 | Pure Python; no Rust; async |
| Logging | structlog | 24+ | Structured JSON logging |

---

## 3. Backend — OCR Microservice (Python 3.12)

| Component | Technology | Notes |
|---|---|---|
| OCR Engine | PaddleOCR PP-OCRv5 | GPU-accelerated; 5 text types + handwriting |
| Layout Analysis | PP-StructureV3 | Layout + table + formula |
| Framework | FastAPI | port 8002 |
| ALTO XML | lxml | Standard archival OCR output format |
| Python venv | venv-ocr (Python 3.12) | PaddleOCR requires 3.12/3.13 |

---

## 4. Backend — Indic AI Microservice (Python 3.10)

| Component | Technology | Notes |
|---|---|---|
| Translation | IndicTrans2 (AI4Bharat) | 22 Indic ↔ English |
| ASR | IndicConformer (AI4Bharat) | NeMo-based; Indic speech |
| TTS | IndicF5 (AI4Bharat) | Indic text-to-speech |
| Framework | FastAPI | port 8001 |
| Python venv | venv-indic (Python 3.10) | NeMo requires 3.10 |

---

## 5. Database

| Component | Technology | Version | Rationale |
|---|---|---|---|
| Primary DB | Turso (libSQL/SQLite) | Cloud | No PostgreSQL; managed; edge-ready |
| Dev DB | SQLite file (libSQL compatible) | — | Local file: `storage/turso/ambedkar_dev.db` |
| Python client | libsql-client | 0.3.1 | Pure Python; async; no Rust |
| FTS | SQLite FTS5 (built-in) | — | Lexical search; no extra infrastructure |
| Vector | Turso DiskANN (built-in) | — | Up to 65,536 dims; cosine similarity |
| Graph | SQL tables + CTEs | — | Entities + relations in Turso |
| Pattern | Repository/Service | — | No ORM; DB-agnostic abstraction |

### Rejected DB Technologies
| Technology | Reason |
|---|---|
| PostgreSQL | Explicitly excluded by project requirement |
| SQLAlchemy + sqlalchemy-libsql | Compatibility unverified on Python 3.14 |
| `libsql` 0.1.11 | Requires Rust (not installed; no Windows wheel) |
| pgvector | Requires PostgreSQL |
| Qdrant/Pinecone | External vector DB not needed at this scale |

---

## 6. Storage

| Component | Technology | Notes |
|---|---|---|
| Dev/Hackathon | Local filesystem | `storage/local/` |
| Abstraction | StorageBackend ABC | Swappable; S3-compatible interface |
| Future | Cloudflare R2 / AWS S3 | No code changes required |

---

## 7. AI / ML Stack

| Task | Model | Env | VRAM |
|---|---|---|---|
| Text Embedding | Qwen3-Embedding-0.6B | venv-main | ~0.8 GB |
| Reranking | Qwen3-Reranker-0.6B | venv-main | ~0.8 GB |
| Multimodal/VL | Qwen3-VL-2B (INT4) | venv-main | ~2.0 GB |
| OCR | PaddleOCR PP-OCRv5 | venv-ocr | ~0.5 GB |
| Layout/Structure | PP-StructureV3 | venv-ocr | ~0.5 GB |
| Translation | IndicTrans2 | venv-indic | ~1.5 GB |
| ASR | IndicConformer | venv-indic | ~1.0 GB |
| TTS | IndicF5 | venv-indic | ~0.5 GB |

---

## 8. Archive Standards

| Standard | Version | Role |
|---|---|---|
| IIIF Image API | 3.0 | Tiled image delivery |
| IIIF Presentation API | 3.0 | Manifest; collection; audio/video |
| ALTO XML | 4.x | OCR output with bounding boxes |
| PREMIS | 3.0 | Preservation metadata |
| Dublin Core | — | Basic descriptive metadata |
| JSON-LD | 1.1 | Knowledge graph linked data |
| W3C Web Annotations | — | IIIF annotation compatibility |

---

## 9. DevOps / Tooling

| Tool | Purpose | Version |
|---|---|---|
| Git | Version control | 2.53.0 |
| Docker | Containerization (Phase 2+) | 29.8.0 |
| Docker Compose | Multi-service dev | v5.5.1 |
| pytest | Python testing | 9.1.1 |
| Jest + Playwright | Frontend testing | — |
| black + ruff | Python formatting/linting | — |
| ESLint + Prettier | TypeScript linting | — |

---

## 10. Compatibility Matrix

| Component | Version | Compatible With |
|---|---|---|
| Python (main) | 3.14.5 | FastAPI 0.136+, Pydantic v2, libsql-client |
| Python (venv-ocr) | 3.12.x | PaddleOCR 3.x, PaddlePaddle-GPU |
| Python (venv-indic) | 3.10.x | IndicTrans2, IndicConformer (NeMo), IndicF5 |
| PyTorch | 2.11.0+cu128 | Qwen3 family, CUDA 12.8 |
| transformers | 4.57+ | Qwen3-Embedding, Qwen3-Reranker, Qwen3-VL |
| Node.js | 24.14.1 (LTS) | Next.js 16, React 19 |
| CUDA | 12.8 (PyTorch) | RTX 4050 (CC 8.9) |
