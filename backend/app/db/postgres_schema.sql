-- ============================================================
-- AMBEDKAR HERITAGE INTELLIGENCE & DIGITAL PRESERVATION SYSTEM
-- PostgreSQL Unified Schema for Local Instance (PostgreSQL 18)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── 1. Schema version tracker ─────────────────────────────────
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     TEXT PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Roles ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id          TEXT PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. Collections ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
    id              TEXT PRIMARY KEY,
    slug            TEXT UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    cover_image_key TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_public       INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- ── 4. Archival Objects ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS archival_objects (
    id                  TEXT PRIMARY KEY,
    collection_id       TEXT REFERENCES collections(id) ON DELETE SET NULL,
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
    file_size_bytes     BIGINT,
    original_filename   TEXT,
    original_file_key   TEXT,
    page_count          INTEGER,
    metadata_json       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_archival_objects_stable_id ON archival_objects(stable_id);
CREATE INDEX IF NOT EXISTS idx_archival_objects_type ON archival_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_archival_objects_lang ON archival_objects(language);

-- ── 5. Files ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS files (
    id                  TEXT PRIMARY KEY,
    object_id           TEXT NOT NULL REFERENCES archival_objects(id) ON DELETE CASCADE,
    file_role           TEXT NOT NULL DEFAULT 'original',
    storage_key         TEXT UNIQUE NOT NULL,
    file_format         TEXT NOT NULL,
    mime_type           TEXT NOT NULL,
    file_size_bytes     BIGINT NOT NULL,
    sha256_hash         TEXT NOT NULL,
    page_count          INTEGER,
    is_primary          INTEGER NOT NULL DEFAULT 0,
    metadata_json       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. Pages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
    id                  TEXT PRIMARY KEY,
    object_id           TEXT NOT NULL REFERENCES archival_objects(id) ON DELETE CASCADE,
    page_number         INTEGER NOT NULL,
    label               TEXT,
    ocr_text            TEXT,
    alto_xml_key        TEXT,
    svg_overlay_key     TEXT,
    image_file_key      TEXT,
    ocr_confidence      DOUBLE PRECISION,
    width               INTEGER,
    height              INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (object_id, page_number)
);
CREATE INDEX IF NOT EXISTS idx_pages_object_page ON pages(object_id, page_number);

-- ── 7. Media Assets ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_assets (
    id                  TEXT PRIMARY KEY,
    object_id           TEXT NOT NULL REFERENCES archival_objects(id) ON DELETE CASCADE,
    asset_type          TEXT NOT NULL,
    duration_seconds    DOUBLE PRECISION,
    codec               TEXT,
    bitrate_kbps        INTEGER,
    sample_rate_hz      INTEGER,
    channels            INTEGER,
    resolution          TEXT,
    iiif_manifest_key   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 8. Document Chunks ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_chunks (
    id                  TEXT PRIMARY KEY,
    object_id           TEXT NOT NULL REFERENCES archival_objects(id) ON DELETE CASCADE,
    page_number         INTEGER,
    chunk_index         INTEGER NOT NULL,
    section_title       TEXT,
    text                TEXT NOT NULL,
    token_count         INTEGER,
    char_count          INTEGER,
    char_start          INTEGER,
    char_end            INTEGER,
    volume_number       INTEGER,
    language            TEXT NOT NULL DEFAULT 'en',
    chunk_type          TEXT NOT NULL DEFAULT 'prose',
    is_heading          INTEGER NOT NULL DEFAULT 0,
    metadata_json       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chunks_object ON document_chunks(object_id);
CREATE INDEX IF NOT EXISTS idx_chunks_page_number ON document_chunks(page_number);

-- ── 9. Embeddings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS embeddings (
    id                  TEXT PRIMARY KEY,
    chunk_id            TEXT NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    model_name          TEXT NOT NULL,
    embedding_version   TEXT NOT NULL DEFAULT 'v1',
    dimension           INTEGER NOT NULL DEFAULT 1024,
    embedding_json      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_embeddings_chunk ON embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_model ON embeddings(model_name);
CREATE INDEX IF NOT EXISTS idx_embeddings_version ON embeddings(embedding_version);

-- ── 10. Full-Text Search Table (fts_chunks) ───────────────────
CREATE TABLE IF NOT EXISTS fts_chunks (
    chunk_id            TEXT PRIMARY KEY,
    text                TEXT NOT NULL,
    object_id           TEXT,
    tsv                 tsvector GENERATED ALWAYS AS (to_tsvector('english', text)) STORED
);
CREATE INDEX IF NOT EXISTS idx_fts_chunks_tsv ON fts_chunks USING GIN(tsv);
CREATE INDEX IF NOT EXISTS idx_fts_chunks_obj ON fts_chunks(object_id);

-- ── 11. Search Index Metadata ─────────────────────────────────
CREATE TABLE IF NOT EXISTS search_index_meta (
    id                  TEXT PRIMARY KEY,
    index_type          TEXT NOT NULL,
    model_name          TEXT,
    embedding_version   TEXT,
    total_chunks        INTEGER DEFAULT 0,
    last_run_at         TEXT,
    run_duration_s      DOUBLE PRECISION,
    status              TEXT NOT NULL DEFAULT 'idle'
);

-- ── 12. Entities & Knowledge Graph ────────────────────────────
CREATE TABLE IF NOT EXISTS entities (
    id                  TEXT PRIMARY KEY,
    entity_type         TEXT NOT NULL,
    canonical_name      TEXT NOT NULL,
    description         TEXT,
    source              TEXT NOT NULL DEFAULT 'archival_corpus',
    status              TEXT NOT NULL DEFAULT 'VERIFIED',
    date                TEXT,
    date_precision      TEXT DEFAULT 'YEAR',
    location            TEXT,
    external_identifiers TEXT,
    object_id           TEXT REFERENCES archival_objects(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_entities_canonical ON entities(canonical_name);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);

CREATE TABLE IF NOT EXISTS entity_aliases (
    id                  TEXT PRIMARY KEY,
    entity_id           TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    alias               TEXT NOT NULL,
    language            TEXT DEFAULT 'en',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_aliases_entity ON entity_aliases(entity_id);
CREATE INDEX IF NOT EXISTS idx_aliases_alias ON entity_aliases(alias);

CREATE TABLE IF NOT EXISTS entity_reviews (
    id                  TEXT PRIMARY KEY,
    entity_id           TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    reviewer            TEXT NOT NULL,
    action              TEXT NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS relationships (
    id                  TEXT PRIMARY KEY,
    source_entity_id    TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id    TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relationship_type   TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'VERIFIED',
    confidence          DOUBLE PRECISION DEFAULT 1.0,
    source_chunk_id     TEXT,
    source_document_id  TEXT REFERENCES archival_objects(id) ON DELETE SET NULL,
    source_page_id      TEXT,
    evidence_text       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rel_source ON relationships(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_rel_target ON relationships(target_entity_id);

CREATE TABLE IF NOT EXISTS relationship_evidence (
    id                  TEXT PRIMARY KEY,
    relationship_id     TEXT NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    chunk_id            TEXT,
    document_id         TEXT REFERENCES archival_objects(id) ON DELETE SET NULL,
    page_number         INTEGER,
    excerpt             TEXT,
    confidence          DOUBLE PRECISION DEFAULT 1.0,
    verified_by         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 13. Timeline & Stories ────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_events (
    id                  TEXT PRIMARY KEY,
    title               TEXT NOT NULL,
    description         TEXT,
    start_date          TEXT NOT NULL,
    end_date            TEXT,
    date_precision      TEXT DEFAULT 'YEAR',
    category            TEXT NOT NULL DEFAULT 'HISTORICAL',
    location            TEXT,
    related_people      TEXT,
    related_documents   TEXT,
    related_topics      TEXT,
    source              TEXT,
    evidence_chunk_id   TEXT,
    evidence_text       TEXT,
    document_id         TEXT REFERENCES archival_objects(id) ON DELETE SET NULL,
    page_number         INTEGER,
    publication_status  TEXT NOT NULL DEFAULT 'APPROVED',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_timeline_start_date ON timeline_events(start_date);

CREATE TABLE IF NOT EXISTS story_collections (
    id                  TEXT PRIMARY KEY,
    slug                TEXT UNIQUE NOT NULL,
    title               TEXT NOT NULL,
    subtitle            TEXT,
    summary             TEXT,
    category            TEXT DEFAULT 'GENERAL',
    display_order       INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS story_items (
    id                  TEXT PRIMARY KEY,
    story_id            TEXT NOT NULL REFERENCES story_collections(id) ON DELETE CASCADE,
    sequence            INTEGER NOT NULL,
    title               TEXT NOT NULL,
    narrative_text      TEXT NOT NULL,
    document_id         TEXT REFERENCES archival_objects(id) ON DELETE SET NULL,
    page_number         INTEGER,
    chunk_id            TEXT,
    evidence_quote      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 14. Multilingual & Work Manifests ─────────────────────────
CREATE TABLE IF NOT EXISTS multilingual_works (
    id                  TEXT PRIMARY KEY,
    canonical_title     TEXT NOT NULL,
    author              TEXT NOT NULL,
    original_language   TEXT NOT NULL DEFAULT 'en',
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_manifests (
    archival_id         TEXT PRIMARY KEY,
    filename            TEXT NOT NULL,
    relative_path       TEXT NOT NULL,
    language            TEXT NOT NULL,
    script              TEXT NOT NULL,
    source_format       TEXT NOT NULL,
    format_nature       TEXT NOT NULL,
    file_size_bytes     BIGINT NOT NULL,
    page_count          INTEGER NOT NULL,
    sha256              TEXT NOT NULL,
    text_authority      TEXT NOT NULL,
    ingested_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS work_relationships (
    id                  TEXT PRIMARY KEY,
    work_id             TEXT REFERENCES multilingual_works(id) ON DELETE CASCADE,
    edition_archival_id TEXT REFERENCES work_manifests(archival_id) ON DELETE CASCADE,
    relationship_type   TEXT NOT NULL,
    source_segment_id   TEXT,
    target_segment_id   TEXT,
    confidence_score    DOUBLE PRECISION DEFAULT 1.0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_alignments (
    id                  TEXT PRIMARY KEY,
    canonical_work_id   TEXT REFERENCES multilingual_works(id) ON DELETE CASCADE,
    source_edition_id   TEXT REFERENCES work_manifests(archival_id) ON DELETE CASCADE,
    target_edition_id   TEXT REFERENCES work_manifests(archival_id) ON DELETE CASCADE,
    alignment_type      TEXT NOT NULL,
    source_segment_id   TEXT,
    target_segment_id   TEXT,
    confidence_score    DOUBLE PRECISION DEFAULT 1.0,
    curator_verified    INTEGER DEFAULT 0,
    verified_by         TEXT,
    verified_at         TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS translations_cache (
    id                  TEXT PRIMARY KEY,
    source_text_hash    TEXT NOT NULL,
    source_lang         TEXT NOT NULL,
    target_lang         TEXT NOT NULL,
    translated_text     TEXT NOT NULL,
    engine              TEXT NOT NULL DEFAULT 'IndicTrans2',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tts_cache (
    id                  TEXT PRIMARY KEY,
    text_hash           TEXT NOT NULL,
    language            TEXT NOT NULL,
    audio_path          TEXT NOT NULL,
    duration_s          DOUBLE PRECISION,
    engine              TEXT NOT NULL DEFAULT 'IndicF5',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transcript_segments (
    id                  TEXT PRIMARY KEY,
    media_asset_id      TEXT NOT NULL,
    start_time_s        DOUBLE PRECISION NOT NULL,
    end_time_s          DOUBLE PRECISION NOT NULL,
    language            TEXT NOT NULL,
    transcript_text     TEXT NOT NULL,
    confidence          DOUBLE PRECISION DEFAULT 1.0,
    engine              TEXT DEFAULT 'IndicConformer',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multimodal_page_analyses (
    id                  TEXT PRIMARY KEY,
    object_id           TEXT NOT NULL REFERENCES archival_objects(id) ON DELETE CASCADE,
    page_number         INTEGER NOT NULL,
    image_description   TEXT,
    layout_features_json TEXT,
    visual_elements_json TEXT,
    model_name          TEXT DEFAULT 'Qwen3-VL-2B',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_localizations (
    id                  TEXT PRIMARY KEY,
    entity_id           TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    language            TEXT NOT NULL,
    localized_name      TEXT NOT NULL,
    localized_bio       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline_localizations (
    id                  TEXT PRIMARY KEY,
    timeline_event_id   TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
    language            TEXT NOT NULL,
    localized_title     TEXT NOT NULL,
    localized_desc      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 15. Supporting / Preservation Tables ──────────────────────
CREATE TABLE IF NOT EXISTS preservation_events (
    id                  TEXT PRIMARY KEY,
    object_id           TEXT NOT NULL,
    event_type          TEXT NOT NULL,
    event_date          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_detail        TEXT,
    outcome             TEXT NOT NULL,
    agent               TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pev_date ON preservation_events(event_date);

CREATE TABLE IF NOT EXISTS audit_events (
    id                  TEXT PRIMARY KEY,
    user_id             TEXT,
    action              TEXT NOT NULL,
    resource_type       TEXT NOT NULL,
    resource_id         TEXT,
    ip_address          TEXT,
    metadata_json       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_events(action, created_at);

CREATE TABLE IF NOT EXISTS users (
    id                  TEXT PRIMARY KEY,
    email               TEXT UNIQUE NOT NULL,
    hashed_password     TEXT NOT NULL,
    full_name           TEXT,
    role_id             TEXT REFERENCES roles(id),
    is_active           INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id                  TEXT PRIMARY KEY,
    role_id             TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource            TEXT NOT NULL,
    action              TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processing_jobs (
    id                  TEXT PRIMARY KEY,
    job_type            TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'pending',
    object_id           TEXT,
    error_message       TEXT,
    progress_percent    DOUBLE PRECISION DEFAULT 0.0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS digital_files (
    id                  TEXT PRIMARY KEY,
    archival_object_id  TEXT REFERENCES archival_objects(id) ON DELETE CASCADE,
    file_path           TEXT NOT NULL,
    mime_type           TEXT NOT NULL,
    byte_size           BIGINT,
    sha256_hash         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ocr_pages (
    id                  TEXT PRIMARY KEY,
    document_id         TEXT NOT NULL REFERENCES archival_objects(id) ON DELETE CASCADE,
    page_number         INTEGER NOT NULL,
    language            TEXT NOT NULL,
    ocr_engine          TEXT NOT NULL,
    confidence          DOUBLE PRECISION,
    raw_ocr_text        TEXT,
    reviewed_ocr_text   TEXT,
    review_status       TEXT DEFAULT 'PENDING',
    reviewer            TEXT,
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eval_dataset_items (
    id                  TEXT PRIMARY KEY,
    benchmark_name      TEXT NOT NULL,
    item_id             TEXT NOT NULL,
    payload_json        TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sources (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    description         TEXT,
    url                 TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS persons (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    birth_year          INTEGER,
    death_year          INTEGER,
    bio                 TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    founded_year        INTEGER,
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    event_date          TEXT,
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS places (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id                  TEXT PRIMARY KEY,
    name                TEXT UNIQUE NOT NULL,
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS concepts (
    id                  TEXT PRIMARY KEY,
    name                TEXT UNIQUE NOT NULL,
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_sections (
    id                  TEXT PRIMARY KEY,
    object_id           TEXT NOT NULL REFERENCES archival_objects(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    order_index         INTEGER NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS translations (
    id                  TEXT PRIMARY KEY,
    chunk_id            TEXT NOT NULL,
    language            TEXT NOT NULL,
    translated_text     TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transcripts (
    id                  TEXT PRIMARY KEY,
    media_asset_id      TEXT NOT NULL,
    language            TEXT NOT NULL,
    transcript_text     TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
