# PHASE 2 IMPLEMENTATION PLAN
## Ambedkar Heritage Intelligence & Digital Preservation System

**Date**: 2026-09-22 / 2026-09-23  
**Status**: APPROVED & IN EXECUTION  
**Objective**: Build working application foundation (FastAPI + Turso libSQL + Storage Abstraction + Next.js 15 App Router + TypeScript + Tailwind)

---

## Architecture Alignment

1. **Frontend**:
   - Next.js 15 (App Router), React 19, TypeScript 5.9, Tailwind CSS 3.4.
   - Institutional scholarly aesthetic (sober, high trust, deep midnight palette with gold accents).
   - 10 core views:
     - `/` — Institutional Landing Page with Live System Metrics
     - `/documents` — Archival Objects & Monographs Catalog
     - `/documents/[id]` — Archival Viewer with Chunk Citations & PREMIS Fixity
     - `/search` — Multi-modal Hybrid Search Engine (FTS5 + Vector + Hybrid RRF)
     - `/timeline` — Historical Chronology (1891–1956) with Linked Records
     - `/assistant` — Grounded AI Research Assistant with Zero-Hallucination Policy
     - `/knowledge-map` — Archival Knowledge Map & Relational Entity Explorer
     - `/media` — Historical Speeches & Synchronized Multilingual Transcripts
     - `/preservation` — PREMIS 3.0 Preservation Dashboard & Storage Health
     - `/admin` — System Administration & Ingestion Pipeline Portal
   - Typed API Client in `frontend/lib/api.ts` with error handling and query parsing.

2. **Backend**:
   - Python 3.14.5, FastAPI 0.141, Pydantic v2, Uvicorn 0.41, structlog.
   - Database: Turso libSQL Cloud (`ambedkar-archive-deadrobo.aws-ap-south-1.turso.io`) via `libsql-client 0.3.1` (pure Python async client, verified on Windows).
   - Local fallback SQLite client for isolated in-memory unit tests.
   - Repository pattern: `ArchivalObjectRepository`, `CollectionRepository`, `ChunkRepository`, `JobRepository`.
   - Storage Abstraction: `StorageBackend` ABC with `LocalStorageBackend` implementation (async `aiofiles`, strict path traversal sanitization) and S3/R2 adapter stub.
   - REST API routes under `/api/v1`:
     - `/health`, `/health/database`, `/health/storage`
     - `/collections` (CRUD, object counts)
     - `/documents` (CRUD, pagination, pages, chunks)
     - `/search` (FTS5 BM25, semantic, hybrid)
     - `/admin` (schema status, migration runner)
     - `/storage` (authenticated file retrieval)

3. **Database Schema (Turso)**:
   - 23 tables defined in `001_initial_schema.sql`:
     - Collections, Archival Objects, Document Pages, Document Sections, Document Chunks.
     - SQLite FTS5 virtual table (`fts_chunks`) for full-text search.
     - Embeddings storage (768/1024 dims).
     - PREMIS 3.0 Preservation Fixity & Event Logging (`audit_events`).
     - Knowledge Graph: Entities, Relations, Concepts, Events.
     - Role-based Access Control: Roles (`admin`, `archivist`, `researcher`, `public`), Users, User Roles.
     - Asynchronous Processing Jobs (`processing_jobs`).

4. **Testing & Verification**:
   - `tests/test_health.py` — Health, database, and storage endpoints via httpx ASGI.
   - `tests/test_db.py` — In-memory SQLite CRUD tests across repositories.
   - `tests/test_storage.py` — Storage put, get, delete, list, and path traversal security.
   - `frontend` type checking (`tsc --noEmit`) and production compilation (`next build`).
