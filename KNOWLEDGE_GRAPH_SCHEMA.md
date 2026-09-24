# Knowledge Graph Schema Specification — Phase 8

## Migration 004 Applied Schema (Turso Cloud)

### 1. `entities` Table (Master Polymorphic Entity Registry)
```sql
CREATE TABLE IF NOT EXISTS entities (
    id                   TEXT PRIMARY KEY,
    entity_type          TEXT NOT NULL,
    canonical_name       TEXT NOT NULL,
    description          TEXT,
    source               TEXT NOT NULL DEFAULT 'archival_corpus',
    status               TEXT NOT NULL DEFAULT 'CANDIDATE',  -- CANDIDATE | VERIFIED | REJECTED
    date                 TEXT,
    date_precision       TEXT DEFAULT 'YEAR',                -- DAY | MONTH | YEAR | RANGE | APPROXIMATE | UNKNOWN
    language             TEXT DEFAULT 'en',
    location             TEXT,
    aliases              TEXT,                               -- JSON array of variants
    external_identifiers TEXT,                               -- JSON dictionary (Wikidata, VIAF, LOC)
    rights               TEXT DEFAULT 'public_domain',
    object_id            TEXT REFERENCES archival_objects(id),
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_entities_type_status ON entities(entity_type, status);
CREATE INDEX idx_entities_name ON entities(canonical_name);
CREATE INDEX idx_entities_object ON entities(object_id);
```

---

### 2. `entity_aliases` Table (OCR Normalization & Variant Resolution)
```sql
CREATE TABLE IF NOT EXISTS entity_aliases (
    id         TEXT PRIMARY KEY,
    entity_id  TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    alias      TEXT NOT NULL,
    alias_type TEXT DEFAULT 'variant',                       -- honorific | abbreviation | ocr_variant | translation
    language   TEXT DEFAULT 'en',
    confidence REAL DEFAULT 1.0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_aliases_lookup ON entity_aliases(alias);
CREATE INDEX idx_aliases_entity ON entity_aliases(entity_id);
```

---

### 3. `relationships` Table (Provenance-Backed Semantic Graph Edges)
```sql
CREATE TABLE IF NOT EXISTS relationships (
    id                 TEXT PRIMARY KEY,
    subject_type       TEXT NOT NULL,
    subject_id         TEXT NOT NULL,
    predicate          TEXT NOT NULL,
    object_type        TEXT NOT NULL,
    object_id          TEXT NOT NULL,
    evidence_chunk_id  TEXT REFERENCES document_chunks(id),
    confidence         REAL DEFAULT 1.0,
    source             TEXT NOT NULL DEFAULT 'archival_corpus',
    source_document_id TEXT,
    source_page_id     INTEGER,
    evidence_text      TEXT,
    extraction_method  TEXT,                                  -- manual_seed | groq_qwen3 | ocr_rule
    created_by         TEXT,                                  -- archivist | ai_pipeline
    status             TEXT DEFAULT 'CANDIDATE',              -- CANDIDATE | VERIFIED | REJECTED
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_rel_subject ON relationships(subject_type, subject_id);
CREATE INDEX idx_rel_object  ON relationships(object_type, object_id);
CREATE INDEX idx_rel_status  ON relationships(status);
CREATE INDEX idx_rel_evidence ON relationships(evidence_chunk_id);
CREATE INDEX idx_rel_predicate ON relationships(predicate);
```

---

### 4. `relationship_evidence` Table (Direct Chunk-to-Edge Provenance)
```sql
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

CREATE INDEX idx_relev_rel ON relationship_evidence(relationship_id);
CREATE INDEX idx_relev_chunk ON relationship_evidence(chunk_id);
```

---

### 5. `entity_reviews` Table (Curator Audit Trail)
```sql
CREATE TABLE IF NOT EXISTS entity_reviews (
    id                  TEXT PRIMARY KEY,
    entity_id           TEXT REFERENCES entities(id),
    original_mention    TEXT NOT NULL,
    suggested_entity_id TEXT,
    reviewer            TEXT NOT NULL DEFAULT 'curator',
    action              TEXT NOT NULL,                         -- VERIFY | REJECT | EDIT | MERGE
    status              TEXT NOT NULL DEFAULT 'PENDING',
    supporting_chunk_id TEXT REFERENCES document_chunks(id),
    review_notes        TEXT,
    created_at          TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_reviews_entity ON entity_reviews(entity_id);
CREATE INDEX idx_reviews_status ON entity_reviews(status);
```
