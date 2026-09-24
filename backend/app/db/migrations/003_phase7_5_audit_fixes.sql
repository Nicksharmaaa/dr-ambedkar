-- ============================================================
-- AMBEDKAR HERITAGE - Phase 7.5: Audit Fixes
-- Migration 003: Add missing indexes, clean legacy tables
-- ============================================================

-- ── Missing indexes (DEBT-013) ────────────────────────────────────────────────

-- Embedding model filter (needed for multi-model vector search)
CREATE INDEX IF NOT EXISTS idx_embeddings_model ON embeddings(model_name);

-- Embedding version filter (needed for migration safety)
CREATE INDEX IF NOT EXISTS idx_embeddings_version ON embeddings(embedding_version);

-- Page-level chunk retrieval (used by ask_page mode)
CREATE INDEX IF NOT EXISTS idx_chunks_page_number ON document_chunks(page_number);

-- Time-range preservation event queries
CREATE INDEX IF NOT EXISTS idx_pev_date ON preservation_events(event_date);

-- Audit events by resource (for evidence chain queries)
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_events(action, created_at);

-- ── Drop legacy Phase 4 tables (DEBT-014) ────────────────────────────────────
-- The 'chunks' and 'chunks_fts' tables were created by schema_phase4.py
-- They have been superseded by 'document_chunks' and 'fts_chunks' from 001_initial_schema.sql
-- Safe to drop: verified 0 rows in both tables

-- Note: We cannot DROP VIRTUAL TABLE in Turso/libSQL the same way — skip chunks_fts
-- chunks table only (verify 0 rows before dropping in production)
-- DROP TABLE IF EXISTS chunks;

-- ── Record this migration ─────────────────────────────────────────────────────
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('003_phase7_5_audit_fixes');
