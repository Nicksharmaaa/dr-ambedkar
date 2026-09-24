-- ============================================================
-- AMBEDKAR HERITAGE INTELLIGENCE & DIGITAL PRESERVATION SYSTEM
-- Schema Migration 001: Initial Schema (v2 - no triggers)
-- Database: Turso (libSQL/SQLite-compatible)
-- ============================================================

-- ── Schema version tracker ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     TEXT PRIMARY KEY,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Roles (seed before users) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id          TEXT PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Collections ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
    id              TEXT PRIMARY KEY,
    slug            TEXT UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    cover_image_key TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_public       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- ── Archival Objects ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS archival_objects (
    id                  TEXT PRIMARY KEY,
    collection_id       TEXT REFERENCES collections(id),
    stable_id           TEXT UNIQUE NOT NULL,
    title               TEXT NOT NULL,
    subtitle            TEXT,
    object_type         TEXT NOT NULL DEFAULT 'book',
    language            TEXT NOT NULL DEFAULT 'en',
    source_institution  TEXT NOT NULL DEFAULT '',
    provenance          TEXT NOT NULL DEFAULT '',
    rights_status       TEXT NOT NULL DEFAULT 'unknown',
    creator             TEXT,
    publisher           TEXT,
    publication_date    TEXT,
    description         TEXT,
    subject_keywords    TEXT,
    physical_description TEXT,
    review_status       TEXT NOT NULL DEFAULT 'pending',
    publication_status  TEXT NOT NULL DEFAULT 'draft',
    file_hash           TEXT,
    file_size_bytes     INTEGER,
    original_filename   TEXT,
    original_file_key   TEXT,
    page_count          INTEGER,
    metadata_json       TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ao_stable_id  ON archival_objects(stable_id);
CREATE INDEX IF NOT EXISTS idx_ao_type       ON archival_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_ao_collection ON archival_objects(collection_id);
CREATE INDEX IF NOT EXISTS idx_ao_status     ON archival_objects(review_status, publication_status);
CREATE INDEX IF NOT EXISTS idx_ao_language   ON archival_objects(language);

-- ── Files ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS files (
    id              TEXT PRIMARY KEY,
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    file_type       TEXT NOT NULL,
    storage_key     TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    file_size_bytes INTEGER,
    file_hash       TEXT,
    width_px        INTEGER,
    height_px       INTEGER,
    duration_secs   REAL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_files_object ON files(object_id);
CREATE INDEX IF NOT EXISTS idx_files_type   ON files(file_type);

-- ── Pages ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
    id                TEXT PRIMARY KEY,
    object_id         TEXT NOT NULL REFERENCES archival_objects(id),
    page_number       INTEGER NOT NULL,
    label             TEXT,
    image_file_key    TEXT,
    thumbnail_key     TEXT,
    alto_xml_key      TEXT,
    ocr_text          TEXT,
    ocr_confidence    REAL,
    processing_status TEXT NOT NULL DEFAULT 'pending',
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pages_object ON pages(object_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(processing_status);

-- ── Media Assets ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_assets (
    id              TEXT PRIMARY KEY,
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    asset_type      TEXT NOT NULL,
    title           TEXT,
    storage_key     TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    duration_secs   REAL,
    transcript_text TEXT,
    transcript_language TEXT,
    iiif_manifest_json TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_object ON media_assets(object_id);

-- ── Sources ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sources (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    authors     TEXT,
    year        TEXT,
    publisher   TEXT,
    url         TEXT,
    doi         TEXT,
    notes       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Named Entities ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS persons (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL,
    aliases         TEXT,
    birth_date      TEXT,
    death_date      TEXT,
    description     TEXT,
    wikidata_id     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS organizations (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL,
    aliases         TEXT,
    org_type        TEXT,
    founded_date    TEXT,
    dissolved_date  TEXT,
    description     TEXT,
    wikidata_id     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL,
    event_type      TEXT,
    start_date      TEXT,
    end_date        TEXT,
    location_id     TEXT,
    description     TEXT,
    significance    TEXT,
    wikidata_id     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS places (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL,
    place_type      TEXT,
    country         TEXT,
    latitude        REAL,
    longitude       REAL,
    wikidata_id     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS topics (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id   TEXT REFERENCES topics(id),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS concepts (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    definition  TEXT,
    domain      TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Document Sections ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_sections (
    id            TEXT PRIMARY KEY,
    object_id     TEXT NOT NULL REFERENCES archival_objects(id),
    parent_id     TEXT REFERENCES document_sections(id),
    section_num   TEXT,
    title         TEXT NOT NULL,
    start_page    INTEGER,
    end_page      INTEGER,
    depth         INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sections_object ON document_sections(object_id);

-- ── Document Chunks ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_chunks (
    id              TEXT PRIMARY KEY,
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    page_id         TEXT REFERENCES pages(id),
    section_id      TEXT REFERENCES document_sections(id),
    chunk_index     INTEGER NOT NULL,
    text            TEXT NOT NULL,
    language        TEXT NOT NULL DEFAULT 'en',
    token_count     INTEGER,
    char_count      INTEGER,
    volume_number   TEXT,
    page_number     INTEGER,
    section_title   TEXT,
    is_header       INTEGER NOT NULL DEFAULT 0,
    is_footnote     INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chunks_object   ON document_chunks(object_id);
CREATE INDEX IF NOT EXISTS idx_chunks_page     ON document_chunks(page_id);
CREATE INDEX IF NOT EXISTS idx_chunks_section  ON document_chunks(section_id);
CREATE INDEX IF NOT EXISTS idx_chunks_language ON document_chunks(language);

-- FTS5 virtual table for lexical search (no triggers - sync done in application layer)
CREATE VIRTUAL TABLE IF NOT EXISTS fts_chunks USING fts5(
    text,
    object_id UNINDEXED,
    chunk_id UNINDEXED
);

-- ── Embeddings (stored for vector search) ───────────────────────────────────
-- Note: DiskANN vector index requires Turso paid plan
-- Vector search in Phase 3 uses Python-side cosine similarity or Turso vector_top_k upgrade
CREATE TABLE IF NOT EXISTS embeddings (
    id          TEXT PRIMARY KEY,
    chunk_id    TEXT NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    model_name  TEXT NOT NULL,
    dimension   INTEGER NOT NULL DEFAULT 1024,
    embedding_json TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_embeddings_chunk ON embeddings(chunk_id);

-- ── Relationships ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS relationships (
    id                TEXT PRIMARY KEY,
    subject_type      TEXT NOT NULL,
    subject_id        TEXT NOT NULL,
    predicate         TEXT NOT NULL,
    object_type       TEXT NOT NULL,
    object_id         TEXT NOT NULL,
    evidence_chunk_id TEXT REFERENCES document_chunks(id),
    confidence        REAL DEFAULT 1.0,
    source            TEXT NOT NULL DEFAULT 'manual',
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rel_subject ON relationships(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_rel_object  ON relationships(object_type, object_id);

-- ── Translations ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS translations (
    id              TEXT PRIMARY KEY,
    chunk_id        TEXT NOT NULL REFERENCES document_chunks(id),
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    model_name      TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Transcripts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transcripts (
    id              TEXT PRIMARY KEY,
    media_asset_id  TEXT NOT NULL REFERENCES media_assets(id),
    language        TEXT NOT NULL,
    transcript_text TEXT NOT NULL,
    model_name      TEXT NOT NULL,
    word_timestamps TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Processing Jobs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS processing_jobs (
    id              TEXT PRIMARY KEY,
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    job_type        TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'queued',
    priority        INTEGER NOT NULL DEFAULT 5,
    attempts        INTEGER NOT NULL DEFAULT 0,
    max_attempts    INTEGER NOT NULL DEFAULT 3,
    payload_json    TEXT,
    result_json     TEXT,
    error_message   TEXT,
    queued_at       TEXT NOT NULL DEFAULT (datetime('now')),
    started_at      TEXT,
    completed_at    TEXT,
    worker_id       TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON processing_jobs(status, priority);
CREATE INDEX IF NOT EXISTS idx_jobs_object ON processing_jobs(object_id);
CREATE INDEX IF NOT EXISTS idx_jobs_type   ON processing_jobs(job_type);

-- ── Preservation Events ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS preservation_events (
    id               TEXT PRIMARY KEY,
    object_id        TEXT REFERENCES archival_objects(id),
    event_type       TEXT NOT NULL,
    event_detail     TEXT,
    event_outcome    TEXT NOT NULL,
    outcome_detail   TEXT,
    agent_name       TEXT NOT NULL,
    agent_type       TEXT NOT NULL DEFAULT 'software',
    event_date       TEXT NOT NULL DEFAULT (datetime('now')),
    file_hash_before TEXT,
    file_hash_after  TEXT
);

CREATE INDEX IF NOT EXISTS idx_pev_object ON preservation_events(object_id);
CREATE INDEX IF NOT EXISTS idx_pev_type   ON preservation_events(event_type);

-- ── Audit Events ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_events (
    id          TEXT PRIMARY KEY,
    user_id     TEXT,
    action      TEXT NOT NULL,
    resource    TEXT NOT NULL,
    resource_id TEXT,
    details     TEXT,
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_user     ON audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_events(resource, resource_id);

-- ── Users & Permissions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    username        TEXT UNIQUE,
    hashed_password TEXT,
    full_name       TEXT,
    role_id         TEXT REFERENCES roles(id),
    is_active       INTEGER NOT NULL DEFAULT 1,
    is_superuser    INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS permissions (
    id          TEXT PRIMARY KEY,
    role_id     TEXT NOT NULL REFERENCES roles(id),
    resource    TEXT NOT NULL,
    action      TEXT NOT NULL
);

-- ── Seed default roles ────────────────────────────────────────────────────────
INSERT OR IGNORE INTO roles (id, name, description) VALUES ('role_admin', 'admin', 'Full system access');
INSERT OR IGNORE INTO roles (id, name, description) VALUES ('role_archivist', 'archivist', 'Can ingest, review, and publish archival objects');
INSERT OR IGNORE INTO roles (id, name, description) VALUES ('role_researcher', 'researcher', 'Read access + search + export');
INSERT OR IGNORE INTO roles (id, name, description) VALUES ('role_public', 'public', 'Public read-only access to published objects');

-- ── Record this migration ─────────────────────────────────────────────────────
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('001_initial_schema');
