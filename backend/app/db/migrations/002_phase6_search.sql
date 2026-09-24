-- ============================================================
-- AMBEDKAR HERITAGE - Phase 6: Hybrid Search Schema
-- Migration 002: Search index tracking
-- ============================================================

-- Search index tracking table
CREATE TABLE IF NOT EXISTS search_index_meta (
    id             TEXT PRIMARY KEY,
    index_type     TEXT NOT NULL,
    model_name     TEXT,
    embedding_version TEXT,
    total_chunks   INTEGER DEFAULT 0,
    last_run_at    TEXT,
    run_duration_s REAL,
    status         TEXT NOT NULL DEFAULT 'idle'
);

CREATE INDEX IF NOT EXISTS idx_sim_type ON search_index_meta(index_type);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('002_phase6_search');
