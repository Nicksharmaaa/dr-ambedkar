-- ============================================================
-- Migration 004: Phase 8 Knowledge Graph, Timeline & Story Engine
-- ============================================================

-- ── 1. Master Polymorphic Entities Table ───────────────────────
CREATE TABLE IF NOT EXISTS entities (
    id                   TEXT PRIMARY KEY,
    entity_type          TEXT NOT NULL,
    canonical_name       TEXT NOT NULL,
    description          TEXT,
    source               TEXT NOT NULL DEFAULT 'archival_corpus',
    status               TEXT NOT NULL DEFAULT 'CANDIDATE',
    date                 TEXT,
    date_precision       TEXT DEFAULT 'YEAR',
    language             TEXT DEFAULT 'en',
    location             TEXT,
    aliases              TEXT,
    external_identifiers TEXT,
    rights               TEXT DEFAULT 'public_domain',
    object_id            TEXT REFERENCES archival_objects(id),
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_entities_type_status ON entities(entity_type, status);
CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(canonical_name);
CREATE INDEX IF NOT EXISTS idx_entities_object ON entities(object_id);

-- ── 2. Entity Aliases (for Resolution & OCR Normalization) ────
CREATE TABLE IF NOT EXISTS entity_aliases (
    id         TEXT PRIMARY KEY,
    entity_id  TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    alias      TEXT NOT NULL,
    alias_type TEXT DEFAULT 'variant',
    language   TEXT DEFAULT 'en',
    confidence REAL DEFAULT 1.0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_aliases_lookup ON entity_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_aliases_entity ON entity_aliases(entity_id);

-- ── 3. Entity Reviews (Curator / Archivist Audit Trail) ───────
CREATE TABLE IF NOT EXISTS entity_reviews (
    id                  TEXT PRIMARY KEY,
    entity_id           TEXT REFERENCES entities(id),
    original_mention    TEXT NOT NULL,
    suggested_entity_id TEXT,
    reviewer            TEXT NOT NULL DEFAULT 'curator',
    action              TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'PENDING',
    supporting_chunk_id TEXT REFERENCES document_chunks(id),
    review_notes        TEXT,
    created_at          TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_entity ON entity_reviews(entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON entity_reviews(status);

-- ── 4. Enhanced Relationships Schema ──────────────────────────
-- Ensure relationships table has all provenance columns
ALTER TABLE relationships ADD COLUMN source_document_id TEXT;
ALTER TABLE relationships ADD COLUMN source_page_id INTEGER;
ALTER TABLE relationships ADD COLUMN evidence_text TEXT;
ALTER TABLE relationships ADD COLUMN extraction_method TEXT;
ALTER TABLE relationships ADD COLUMN created_by TEXT;
ALTER TABLE relationships ADD COLUMN status TEXT DEFAULT 'CANDIDATE';

CREATE INDEX IF NOT EXISTS idx_rel_status ON relationships(status);
CREATE INDEX IF NOT EXISTS idx_rel_evidence ON relationships(evidence_chunk_id);
CREATE INDEX IF NOT EXISTS idx_rel_predicate ON relationships(predicate);

-- ── 5. Relationship Evidence Mapping ───────────────────────────
CREATE TABLE IF NOT EXISTS relationship_evidence (
    id              TEXT PRIMARY KEY,
    relationship_id TEXT NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    chunk_id        TEXT NOT NULL REFERENCES document_chunks(id),
    document_id     TEXT REFERENCES archival_objects(id),
    page_number     INTEGER,
    excerpt         TEXT NOT NULL,
    confidence      REAL DEFAULT 1.0,
    verified_by     TEXT DEFAULT 'curator',
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_relev_rel ON relationship_evidence(relationship_id);
CREATE INDEX IF NOT EXISTS idx_relev_chunk ON relationship_evidence(chunk_id);

-- ── 6. Historical Timeline Events ─────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_events (
    id                 TEXT PRIMARY KEY,
    title              TEXT NOT NULL,
    description        TEXT NOT NULL,
    start_date         TEXT NOT NULL,
    end_date           TEXT,
    date_precision     TEXT NOT NULL DEFAULT 'DAY',
    category           TEXT NOT NULL DEFAULT 'HISTORICAL',
    location           TEXT,
    related_people     TEXT,
    related_documents  TEXT,
    related_topics     TEXT,
    source             TEXT NOT NULL,
    evidence_chunk_id  TEXT REFERENCES document_chunks(id),
    evidence_text      TEXT,
    document_id        TEXT REFERENCES archival_objects(id),
    page_number        INTEGER,
    publication_status TEXT NOT NULL DEFAULT 'APPROVED',
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_events(start_date);
CREATE INDEX IF NOT EXISTS idx_timeline_category ON timeline_events(category);
CREATE INDEX IF NOT EXISTS idx_timeline_status ON timeline_events(publication_status);

-- ── 7. Heritage Story Engine Collections & Items ──────────────
CREATE TABLE IF NOT EXISTS story_collections (
    id              TEXT PRIMARY KEY,
    slug            TEXT UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    subtitle        TEXT,
    summary         TEXT NOT NULL,
    cover_image_url TEXT,
    category        TEXT NOT NULL DEFAULT 'MEMORIAL',
    published       INTEGER NOT NULL DEFAULT 1,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stories_slug ON story_collections(slug);
CREATE INDEX IF NOT EXISTS idx_stories_published ON story_collections(published);

CREATE TABLE IF NOT EXISTS story_items (
    id                       TEXT PRIMARY KEY,
    story_id                 TEXT NOT NULL REFERENCES story_collections(id) ON DELETE CASCADE,
    sequence                 INTEGER NOT NULL DEFAULT 1,
    title                    TEXT NOT NULL,
    narrative_text           TEXT NOT NULL,
    media_url                TEXT,
    media_type               TEXT DEFAULT 'document',
    document_id              TEXT REFERENCES archival_objects(id),
    page_number              INTEGER,
    chunk_id                 TEXT REFERENCES document_chunks(id),
    evidence_quote           TEXT,
    interactive_graph_config TEXT,
    created_at               TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_story_items_story ON story_items(story_id, sequence);
