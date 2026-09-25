-- ============================================================
-- AMBEDKAR HERITAGE INTELLIGENCE & DIGITAL PRESERVATION SYSTEM
-- Schema Migration 007: Create and Synchronize digital_files
-- Database: Turso (libSQL/SQLite-compatible)
-- ============================================================

CREATE TABLE IF NOT EXISTS digital_files (
    id TEXT PRIMARY KEY,
    archival_object_id TEXT REFERENCES archival_objects(id),
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    byte_size INTEGER,
    sha256_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_digital_files_object ON digital_files(archival_object_id);
