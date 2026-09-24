import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath("."))
from app.db.turso_http import TursoHTTPClient

TURSO_URL = os.environ.get("TURSO_DB_URL", "libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io")
TURSO_TOKEN = os.environ.get("TURSO_AUTH_TOKEN", "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAwOTcwNzIsImlkIjoiMDFhMGNhMTUtOGYwMS03MDk3LWE1ZWEtYTFmNzFjZmEzOTUyIiwia2lkIjoiamlaR0hIWHBzTkl3cVNDSzdfTUZYck1paDhITjhPbmJtUUhNT2VpdGpGOCIsInJpZCI6IjQwNWQ4YzJjLTNlZTktNDc4Ni1hN2E0LWEwNWY5ZjUwYzA5MCJ9.nxFifhVKMts334jGWudj26hZzsH6gs1s8UmWIQ5eb0dg7SJsE3P5b1KBkAt8bFRNMd_VFNKfA5rNVytOaZBTDA")

SQL = """
CREATE TABLE IF NOT EXISTS multilingual_works (
    id TEXT PRIMARY KEY,
    canonical_title TEXT NOT NULL,
    author TEXT DEFAULT 'Dr. B.R. Ambedkar',
    original_language TEXT DEFAULT 'en',
    description TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_manifests (
    archival_id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    language TEXT NOT NULL,
    script TEXT NOT NULL,
    source_format TEXT NOT NULL,
    format_nature TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    page_count INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    text_authority TEXT NOT NULL,
    ingested_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_relationships (
    id TEXT PRIMARY KEY,
    source_document_id TEXT NOT NULL,
    target_document_id TEXT NOT NULL,
    work_id TEXT,
    relationship_type TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    verification_status TEXT NOT NULL,
    evidence_notes TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_alignments (
    id TEXT PRIMARY KEY,
    work_id TEXT NOT NULL,
    source_segment_id TEXT NOT NULL,
    target_segment_id TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    alignment_level TEXT NOT NULL,
    alignment_method TEXT NOT NULL,
    alignment_status TEXT NOT NULL,
    source_text_snippet TEXT,
    target_text_snippet TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ocr_pages (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    language TEXT NOT NULL,
    ocr_engine TEXT NOT NULL,
    confidence_avg REAL NOT NULL,
    raw_ocr_text TEXT,
    reviewed_ocr_text TEXT,
    review_status TEXT DEFAULT 'OCR_UNREVIEWED',
    reviewer TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS eval_dataset_items (
    id TEXT PRIMARY KEY,
    dataset_type TEXT NOT NULL,
    query_text TEXT NOT NULL,
    query_language TEXT NOT NULL,
    positive_chunk_id TEXT,
    positive_doc_id TEXT,
    positive_language TEXT,
    negative_chunk_id TEXT,
    negative_doc_id TEXT,
    negative_type TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_work_manifests_lang ON work_manifests(language);
CREATE INDEX IF NOT EXISTS idx_work_relationships_src ON work_relationships(source_document_id);
CREATE INDEX IF NOT EXISTS idx_work_relationships_tgt ON work_relationships(target_document_id);
CREATE INDEX IF NOT EXISTS idx_work_alignments_work ON work_alignments(work_id);
CREATE INDEX IF NOT EXISTS idx_ocr_pages_doc_pno ON ocr_pages(document_id, page_number);
CREATE INDEX IF NOT EXISTS idx_eval_dataset_type ON eval_dataset_items(dataset_type);
"""

async def main():
    db = TursoHTTPClient(url=TURSO_URL, auth_token=TURSO_TOKEN)
    statements = [s.strip() for s in SQL.split(";") if s.strip()]
    for stmt in statements:
        try:
            await db.execute(stmt)
            print(f"Applied: {stmt[:50]}...")
        except Exception as e:
            print(f"Statement error (skipping if exists): {e}")

    await db.execute("INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES ('006_phase9_5_multilingual_corpus', datetime('now'))")
    print("Migration 006 recorded successfully!")
    await db.close()

if __name__ == "__main__":
    asyncio.run(main())
