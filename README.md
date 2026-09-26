---
title: Ambedkar Heritage Intelligence API
emoji: 🏛️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
pinned: false
---

# Ambedkar Heritage Intelligence & Digital Preservation System

AI-powered institutional archive for the digital preservation of Dr. B.R. Ambedkar's heritage.

**National-level hackathon prototype** for the problem:
"Digital Heritage Archive for Memorials, Manuscripts & Ambedkar: AI-Powered Institutional Archive and Audio-Visual Knowledge Platform"

---

## Architecture Overview

```
Tablet/Kiosk → Next.js → FastAPI → Turso (libSQL) → Local/S3 Storage
                                ↓
                    OCR (PaddleOCR) · Embedding (Qwen3)
                    Reranking (Qwen3) · VL (Qwen3-VL)
                    RAG · Knowledge Graph · IIIF · Media
                    IndicTrans2 · IndicConformer · IndicF5
```

## Core Principle

**The archival corpus is the source of truth. AI operates ON TOP of the archive.**

- Never fabricate: quotations, dates, citations, page numbers, document titles
- All AI responses must cite archival sources
- Never use model memory as historical evidence

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend API | FastAPI (Python 3.14) |
| Database | Turso (libSQL/SQLite) via `libsql-client` |
| Storage | Local filesystem (StorageBackend abstraction; R2-ready) |
| Embedding | Qwen3-Embedding-0.6B (local) |
| Reranking | Qwen3-Reranker-0.6B (local) |
| Multimodal | Qwen3-VL-2B INT4 (local) |
| OCR | PaddleOCR PP-OCRv5 + PP-StructureV3 (Python 3.12 venv) |
| Translation | IndicTrans2 (Python 3.10 venv) |
| ASR | IndicConformer (Python 3.10 venv) |
| TTS | IndicF5 (Python 3.10 venv) |

## Architecture Documents

- `SYSTEM_ARCHITECTURE.md` — High-level diagrams
- `DATA_ARCHITECTURE.md` — Data layers and flows
- `DATABASE_ARCHITECTURE.md` — Turso schema + vector strategy
- `STORAGE_ARCHITECTURE.md` — File storage design
- `TECH_STACK.md` — Full version matrix
- `HARDWARE_CAPABILITY.md` — Machine assessment + VRAM budget
- `MODEL_SELECTION.md` — AI model choices + deployment profiles
- `RISK_REGISTER.md` — Risks + mitigations

## Skills

See `.agents/skills/` for focused skill guides for each system domain.

## Phase Status

| Phase | Status |
|---|---|
| Phase 1 — Architecture | COMPLETE |
| Phase 2 — Foundation | NOT STARTED |
| Phase 3 — Core Features | NOT STARTED |

## Development Setup (Phase 2)

```bash
# 1. Create Python 3.14 virtual environment (main backend)
python -m venv venv-main
venv-main\Scripts\activate
pip install -r backend/requirements.txt

# 2. Create Python 3.12 virtual environment (OCR)
py -3.12 -m venv venv-ocr

# 3. Create Python 3.10 virtual environment (Indic)
py -3.10 -m venv venv-indic

# 4. Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 5. Start backend
cd backend && python -m app.main

# 6. Start frontend
cd frontend && pnpm install && pnpm dev
```
