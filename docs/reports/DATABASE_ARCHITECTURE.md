# DATABASE ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System

**Version**: 1.0.0
**Date**: 2026-09-22

---

## 1. Database Selection: Turso (libSQL/SQLite)

### Why Turso

| Factor | Decision |
|---|---|
| **No PostgreSQL install required** | Meets project requirement |
| **SQLite-compatible** | Standard SQL; no ORM lock-in |
| **Built-in FTS5** | Lexical search without Elasticsearch |
| **Built-in vector search** | DiskANN up to 65,536 dims |
| **Python driver** | `libsql-client` (pure Python; no Rust required) |
| **Managed cloud** | Turso Cloud for production; local file for dev |
| **Edge-deployable** | SQLite file for kiosk offline use |

### Rejected Alternatives

| Option | Reason Rejected |
|---|---|
| PostgreSQL | Explicitly excluded by project requirement |
| pgvector | Requires PostgreSQL |
| Supabase | Explicitly excluded by project requirement |
| MongoDB | Not a relational store; poor archival metadata support |
| Weaviate/Qdrant | Separate vector DB infrastructure not needed yet |

---

## 2. Python Client Strategy

### Primary Client: `libsql-client` 0.3.1

```python
# Pure Python; no Rust; Windows-compatible
# Install: pip install libsql-client
from libsql_client import create_client

# Local development (file-based)
client = create_client(url="file:data/ambedkar.db")

# Remote Turso Cloud
client = create_client(
    url="libsql://your-db.turso.io",
    auth_token=os.environ["TURSO_AUTH_TOKEN"]
)
```

### Why NOT `libsql` 0.1.11
- Requires Rust toolchain and maturin to build from source
- No pre-built Windows wheel on PyPI
- Rust is not installed on this machine
- `libsql-client` provides the same async API without Rust dependency

### Why NOT SQLAlchemy + `sqlalchemy-libsql`
- `sqlalchemy-libsql` 0.2.0 compatibility with Python 3.14 is unverified
- Project constitution states: do not use SQLAlchemy unless compatibility verified
- Repository/service pattern provides equivalent abstraction without ORM risk

### Database Abstraction Layer

```python
# backend/app/db/database.py
from abc import ABC, abstractmethod
from typing import Any, Sequence

class DatabaseClient(ABC):
    """Abstract database client. Can be backed by Turso, SQLite, or any SQL store."""

    @abstractmethod
    async def execute(self, sql: str, params: Sequence[Any] = ()) -> Any: ...

    @abstractmethod
    async def batch(self, statements: list[tuple[str, Sequence[Any]]]) -> list[Any]: ...

    @abstractmethod
    async def close(self) -> None: ...


class TursoClient(DatabaseClient):
    """libsql-client backed Turso/libSQL implementation."""
    ...

class SQLiteClient(DatabaseClient):
    """Standard sqlite3 fallback for testing/kiosk offline mode."""
    ...
```

---

## 3. Schema Design

### 3.1 Collections & Archive Objects

```sql
-- Top-level collections (e.g., "Writings", "Speeches", "Correspondence")
CREATE TABLE IF NOT EXISTS collections (
    id          TEXT PRIMARY KEY,          -- UUID
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,                      -- storage path
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- Archival objects (books, manuscripts, speeches, photographs, etc.)
CREATE TABLE IF NOT EXISTS archival_objects (
    id              TEXT PRIMARY KEY,      -- UUID
    collection_id   TEXT NOT NULL REFERENCES collections(id),
    slug            TEXT UNIQUE NOT NULL,
    object_type     TEXT NOT NULL,         -- MANUSCRIPT | BOOK | SPEECH | LETTER | PHOTO | VIDEO | AUDIO
    title           TEXT NOT NULL,
    subtitle        TEXT,
    creator         TEXT,                  -- JSON array of creator names
    date_created    TEXT,                  -- ISO 8601 or approximate (e.g., "1936")
    date_precision  TEXT,                  -- EXACT | YEAR | DECADE | CIRCA
    language        TEXT,                  -- JSON array: ["en","mr","hi"]
    script          TEXT,                  -- DEVANAGARI | LATIN | MIXED
    physical_desc   TEXT,                  -- physical description
    provenance      TEXT,                  -- chain of custody
    rights_status   TEXT,                  -- PUBLIC_DOMAIN | COPYRIGHT | RESTRICTED
    storage_path    TEXT,                  -- path in object storage
    file_hash       TEXT,                  -- SHA-256 of original file
    file_size_bytes INTEGER,
    mime_type       TEXT,
    page_count      INTEGER,
    processing_status TEXT DEFAULT 'pending', -- pending | processing | completed | error
    iiif_manifest   TEXT,                  -- JSON: IIIF manifest
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_archival_objects_collection ON archival_objects(collection_id);
CREATE INDEX IF NOT EXISTS idx_archival_objects_type ON archival_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_archival_objects_status ON archival_objects(processing_status);
```

### 3.2 Pages & OCR

```sql
-- Individual pages within an archival object
CREATE TABLE IF NOT EXISTS pages (
    id              TEXT PRIMARY KEY,      -- UUID
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    page_number     INTEGER NOT NULL,
    storage_path    TEXT,                  -- path to page image
    thumbnail_path  TEXT,
    width_px        INTEGER,
    height_px       INTEGER,
    rotation        INTEGER DEFAULT 0,
    created_at      TEXT NOT NULL
);

-- OCR results per page
CREATE TABLE IF NOT EXISTS ocr_output (
    id              TEXT PRIMARY KEY,      -- UUID
    page_id         TEXT NOT NULL REFERENCES pages(id),
    engine          TEXT NOT NULL,         -- PADDLEOCR_V5 | TESSERACT | MANUAL
    full_text       TEXT,                  -- complete extracted text
    alto_xml        TEXT,                  -- ALTO XML with bounding boxes
    confidence_avg  REAL,                  -- 0.0 to 1.0
    language_detected TEXT,
    script_detected TEXT,
    processing_time_ms INTEGER,
    model_version   TEXT,
    needs_review    INTEGER DEFAULT 0,     -- flag for low-confidence pages
    reviewed_at     TEXT,
    reviewed_by     TEXT,
    created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ocr_page ON ocr_output(page_id);
CREATE INDEX IF NOT EXISTS idx_ocr_review ON ocr_output(needs_review);
```

### 3.3 Full-Text Search (FTS5)

```sql
-- FTS5 virtual table for lexical search
CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
    chunk_id    UNINDEXED,
    object_id   UNINDEXED,
    page_id     UNINDEXED,
    title,
    content,
    tokenize    = 'unicode61 remove_diacritics 2'
);
```

### 3.4 Chunks & Embeddings (Vector)

```sql
-- Text chunks for RAG retrieval
CREATE TABLE IF NOT EXISTS chunks (
    id              TEXT PRIMARY KEY,      -- UUID
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    page_id         TEXT REFERENCES pages(id),
    chunk_index     INTEGER NOT NULL,
    content         TEXT NOT NULL,
    token_count     INTEGER,
    language        TEXT,
    char_start      INTEGER,
    char_end        INTEGER,
    created_at      TEXT NOT NULL
);

-- Embedding vectors stored in Turso
CREATE TABLE IF NOT EXISTS embeddings (
    id              TEXT PRIMARY KEY,      -- UUID
    chunk_id        TEXT NOT NULL REFERENCES chunks(id),
    model           TEXT NOT NULL,         -- e.g., "Qwen/Qwen3-Embedding-0.6B"
    embedding       F32_BLOB(1024),         -- Turso native vector type
    dimension       INTEGER NOT NULL DEFAULT 1024,
    created_at      TEXT NOT NULL
);

-- DiskANN index for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS embeddings_vec_idx
    ON embeddings (libsql_vector_idx(embedding, 'metric=cosine'));
```

### 3.5 Knowledge Graph

```sql
-- Entity registry
CREATE TABLE IF NOT EXISTS entities (
    id              TEXT PRIMARY KEY,      -- UUID
    entity_type     TEXT NOT NULL,         -- PERSON | PLACE | ORG | CONCEPT | WORK | EVENT
    canonical_name  TEXT NOT NULL,
    aliases         TEXT,                  -- JSON array
    description     TEXT,
    birth_date      TEXT,
    death_date      TEXT,
    wikidata_id     TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

-- Relationships between entities
CREATE TABLE IF NOT EXISTS relations (
    id              TEXT PRIMARY KEY,
    source_id       TEXT NOT NULL REFERENCES entities(id),
    target_id       TEXT NOT NULL REFERENCES entities(id),
    relation_type   TEXT NOT NULL,
    description     TEXT,
    confidence      REAL,
    evidence_chunk_id TEXT REFERENCES chunks(id),
    source_doc_id   TEXT REFERENCES archival_objects(id),
    created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_relations_source ON relations(source_id);
CREATE INDEX IF NOT EXISTS idx_relations_target ON relations(target_id);
```

### 3.6 Timeline

```sql
CREATE TABLE IF NOT EXISTS timeline_events (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    event_date      TEXT NOT NULL,         -- ISO 8601
    date_precision  TEXT,                  -- EXACT | MONTH | YEAR | DECADE
    event_type      TEXT,                  -- BIOGRAPHICAL | POLITICAL | LEGAL | LITERARY | ...
    location_id     TEXT REFERENCES entities(id),
    entity_ids      TEXT,                  -- JSON array of related entity IDs
    source_doc_ids  TEXT,                  -- JSON array of source document IDs
    evidence_chunk_ids TEXT,               -- JSON array of chunk IDs
    created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_events(event_date);
```

### 3.7 Preservation & Audit

```sql
-- PREMIS preservation events
CREATE TABLE IF NOT EXISTS preservation_events (
    id              TEXT PRIMARY KEY,
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    event_type      TEXT NOT NULL,         -- INGEST | FIXITY_CHECK | MIGRATION | REPLICATION
    event_date      TEXT NOT NULL,
    outcome         TEXT NOT NULL,         -- SUCCESS | FAILURE | WARNING
    outcome_detail  TEXT,
    agent           TEXT,                  -- who/what performed the action
    software        TEXT,
    created_at      TEXT NOT NULL
);

-- System-wide audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id              TEXT PRIMARY KEY,
    user_id         TEXT,
    action          TEXT NOT NULL,         -- SEARCH | VIEW | INGEST | EDIT | DELETE | AI_QUERY
    resource_type   TEXT,
    resource_id     TEXT,
    query_text      TEXT,                  -- for search/AI queries
    ip_address      TEXT,
    user_agent      TEXT,
    duration_ms     INTEGER,
    created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_log(created_at);
```

### 3.8 Users & Auth

```sql
CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    display_name    TEXT,
    role            TEXT NOT NULL DEFAULT 'RESEARCHER', -- ADMIN | ARCHIVIST | RESEARCHER | PUBLIC
    is_active       INTEGER DEFAULT 1,
    last_login      TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id),
    key_hash        TEXT NOT NULL,
    name            TEXT,
    scopes          TEXT,                  -- JSON array
    expires_at      TEXT,
    created_at      TEXT NOT NULL
);
```

### 3.9 Processing Jobs

```sql
CREATE TABLE IF NOT EXISTS processing_jobs (
    id              TEXT PRIMARY KEY,
    job_type        TEXT NOT NULL,         -- OCR | EMBED | IIIF | TRANSLATE | GRAPH_UPDATE
    object_id       TEXT REFERENCES archival_objects(id),
    status          TEXT NOT NULL DEFAULT 'queued', -- queued | running | completed | failed
    priority        INTEGER DEFAULT 5,
    attempts        INTEGER DEFAULT 0,
    max_attempts    INTEGER DEFAULT 3,
    payload         TEXT,                  -- JSON
    result          TEXT,                  -- JSON
    error_message   TEXT,
    started_at      TEXT,
    completed_at    TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON processing_jobs(job_type);
```

---

## 4. Vector Search Strategy

### Turso Vector Capabilities (Verified)
- **Max dimensions**: 65,536
- **Selected dimension**: 1024 (Qwen3-Embedding-0.6B output)
- **Index type**: DiskANN (approximate; best for large corpora)
- **Metric**: cosine similarity
- **Query**: `vector_top_k('embeddings_vec_idx', vector(?), k)`
- **Type**: `F32_BLOB(1024)` — 32-bit float, 1024 dims

### Capacity Assessment for Hackathon Corpus
```
Estimated corpus: 50–500 archival objects × avg 200 pages × avg 10 chunks/page
= 100,000 – 1,000,000 chunks maximum

Memory per embedding: 1024 dims × 4 bytes = 4 KB per vector
100K vectors = 400 MB  → VIABLE for local dev
1M vectors   = 4 GB    → Manageable with DiskANN (disk-based)

Verdict: Turso vector search is SUFFICIENT for hackathon corpus.
No external vector database needed at this stage.
```

### Fallback Architecture (If Turso vector proves insufficient)
```python
class VectorStore(ABC):
    """Pluggable vector store interface."""
    async def upsert(self, id: str, vector: list[float], metadata: dict) -> None: ...
    async def search(self, query_vector: list[float], top_k: int, filters: dict) -> list[SearchResult]: ...

# Implementations:
# TursoVectorStore     → current implementation
# SQLiteVecStore       → sqlite-vec extension (if Turso limit hit locally)
# QdrantVectorStore    → future scale-out
```

---

## 5. Database Environment Configuration

```
DEVELOPMENT:  file:storage/turso/ambedkar_dev.db  (local SQLite file)
TESTING:      :memory:  (in-memory SQLite for unit tests)
DEMO:         file:storage/turso/ambedkar_demo.db  (pre-populated)
PRODUCTION:   libsql://ambedkar-archive.turso.io  (Turso Cloud)
KIOSK:        file:kiosk/ambedkar_kiosk.db  (readonly, pre-populated subset)
```
