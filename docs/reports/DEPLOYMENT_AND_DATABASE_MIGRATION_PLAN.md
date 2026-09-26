# Deployment and Database Migration Plan: Turso Cloud to Local PostgreSQL

> **Project:** SIH Dr. B. R. Ambedkar Digital Heritage Archive  
> **Target Architecture:** Hybrid Cloud-Edge (Vercel Frontend + Secure HTTPS Tunnel + Local FastAPI + Local PostgreSQL 18 + Local AI/ML)  
> **Status:** EXECUTING & VALIDATING  

---

## 1. Executive Summary & Objectives

The Dr. B. R. Ambedkar Digital Heritage Archive was initially architected to utilize Turso Cloud (libSQL/SQLite over HTTP). Due to reaching the free quota threshold on Turso Cloud and preparing for high-throughput, latency-sensitive Smart India Hackathon (SIH) live judging demonstrations, the primary database layer is migrated to **Local PostgreSQL 18** running natively on the host workstation (`localhost:5432`).

### Core Objectives
1. **Unbounded Capacity:** Eliminate cloud storage and row query quota limitations by utilizing high-performance native local storage.
2. **Zero Code Disruption:** Maintain complete backwards compatibility for existing FastAPI routers, service layers, and Next.js frontend components without API contract breaking changes.
3. **Security by Isolation:** Ensure PostgreSQL (`5432`) is bound strictly to `127.0.0.1` and never exposed over the public internet. Only the hardened FastAPI backend (`8000`) is accessible via an encrypted HTTPS tunnel.
4. **Resilience & Fallback:** Preserve full rollback capability using pre-migration baseline backups.

---

## 2. Target SIH Demo Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                 PUBLIC INTERNET                        │
       └────────────────────────┬───────────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │            VERCEL DEPLOYED FRONTEND                    │
       │       - Next.js 14 App Router (React, Tailwind)        │
       │       - IIIF Universal Viewer & Audio/Visual Players   │
       │       - 3D Force-Directed Knowledge Graph (Three.js)   │
       │       - Interactive Scholarly Assistant UI             │
       └────────────────────────┬───────────────────────────────┘
                                │
                                │ HTTPS Requests via NEXT_PUBLIC_API_URL
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │           SECURE PUBLIC HTTPS TUNNEL                   │
       │        (Cloudflare Tunnel / ngrok / Bore)              │
       │        - TLS Termination, DDoS Mitigation              │
       │        - Routes only to http://127.0.0.1:8000          │
       └────────────────────────┬───────────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │             LOCAL WORKSTATION (EDGE HOST)              │
       │                                                        │
       │   ┌────────────────────────────────────────────────┐   │
       │   │           FASTAPI BACKEND (Port 8000)          │   │
       │   │  - RESTful API Contract (/api/v1/*)            │   │
       │   │  - Hybrid Search (Lexical + Vector + RRF)      │   │
       │   │  - Scholarly RAG Assistant Service             │   │
       │   │  - Database Connection Pool (PostgresClient)   │   │
       │   └───────────────┬─────────────────┬──────────────┘   │
       │                   │                 │                  │
       │                   ▼                 ▼                  │
       │   ┌───────────────────────┐ ┌──────────────────────┐   │
       │   │ LOCAL POSTGRESQL 18   │ │ LOCAL ARCHIVAL STORE │   │
       │   │ - Port 5432 (127.0.0.1│ │ - ALTO XML / IIIF    │   │
       │   │ - ambedkar_db         │ │ - Audio/Video media  │   │
       │   │ - 52 Canonical Tables │ │ - Vector Cache (.npz)│   │
       │   │ - Full GIN FTS TSV    │ └──────────────────────┘   │
       │   └───────────────────────┘                            │
       │                   │                                    │
       │                   ▼                                    │
       │   ┌────────────────────────────────────────────────┐   │
       │   │        LOCAL / REMOTE AI/ML SERVICES           │   │
       │   │  - IndicTrans2 & IndicConformer (Port 8001)    │   │
       │   │  - PaddleOCR PP-OCRv5 Microservice (Port 8002) │   │
       │   │  - Qwen3-Embedding & Reranker Engine           │   │
       │   └────────────────────────────────────────────────┘   │
       └────────────────────────────────────────────────────────┘
```

---

## 3. Phased Execution Roadmap

### Phase 1: Pre-Migration Inventory & Safeguards (Complete)
- Created isolated Git branch `sih-postgres-migration` and tag `checkpoint-before-turso-postgres-migration`.
- Cataloged all 52 tables, foreign keys, row counts, and virtual tables in [`TURSO_DATABASE_INVENTORY.md`](file:///c:/dr%20ambedkar/TURSO_DATABASE_INVENTORY.md).
- Created offline binary snapshot, full SQL dump, and table JSON dumps in `turso_migration_backup/`.

### Phase 2: PostgreSQL Database Instance Provisioning (Complete)
- Verified active Windows service `postgresql-x64-18` on `localhost:5432`.
- Created dedicated database `ambedkar_db` and dedicated non-superuser role `ambedkar_user`.
- Applied exact PostgreSQL DDL schema [`app/db/postgres_schema_exact.sql`](file:///c:/dr%20ambedkar/backend/app/db/postgres_schema_exact.sql), including GIN full-text search indexes (`idx_fts_chunks_tsv`).

### Phase 3: Core Relational Data Ingestion (Complete)
- Migrated primary archival objects (19 volumes), knowledge graph entities (30 canonical items, 71 aliases), relationships (20 items with provenance evidence), timeline events (15 historical milestones), curated stories (3 collections, 9 chapters), and multilingual work manifests (112 items).

### Phase 4: Granular Document Chunks & Full-Text Search Ingestion (Executing)
- Parsed ALTO XML derivatives for all 19 volumes (~11,000 pages).
- Generated overlapping sentence-aware chunks and indexed into `document_chunks`.
- Synced `fts_chunks` with auto-generated PostgreSQL tsvectors for high-speed BM25-equivalent lexical matching.
- Loaded 12,154 Qwen embeddings into `embeddings` table and vector cache.

### Phase 5: Database Client & Compatibility Layer (Complete)
- Implemented `PostgresClient` using `psycopg_pool.ConnectionPool` + `asyncio.to_thread` for non-blocking Windows execution.
- Added transparent SQL dialect translation:
  - SQLite parameter syntax (`?` → `%s`)
  - Timestamp functions (`datetime('now')` → `CURRENT_TIMESTAMP`)
  - Upsert patterns (`INSERT OR IGNORE` → `ON CONFLICT DO NOTHING`)
  - FTS queries (`fts_chunks MATCH ?` → `tsv @@ plainto_tsquery('english', %s)`)
- Updated `get_db_client()` factory in [`backend/app/db/database.py`](file:///c:/dr%20ambedkar/backend/app/db/database.py) to automatically route `postgresql://` and `postgres://` URIs.

### Phase 6: Live API & Regression Verification (Next)
- Run comprehensive endpoint validation against local PostgreSQL backend:
  - Health check & database connection
  - Archival document catalog & single document retrieval
  - Knowledge graph entity neighborhood queries
  - Curated timeline and storytelling collections
  - Lexical, semantic, and hybrid search
  - Scholarly RAG assistant grounded queries

### Phase 7: Public Tunnel & Vercel Frontend Configuration (Next)
- Launch secure Cloudflare Tunnel / ngrok tunnel pointing to `http://127.0.0.1:8000`.
- Configure Vercel production deployment environment variable `NEXT_PUBLIC_API_URL` with public tunnel URL.
- Validate end-to-end user journeys from public Vercel URL to edge backend.
