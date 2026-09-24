"""
Phase 4 Schema Migration — Turso (libSQL / SQLite)
Adds: archival_objects, chunks, chunks_fts (FTS5), embeddings (DiskANN), processing_jobs

Run:  python -m app.db.schema_phase4
"""
from __future__ import annotations

import asyncio
import sys

PHASE4_DDL: list[str] = [
    # ── Archival Objects ─────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS archival_objects (
        id              TEXT PRIMARY KEY,
        filename        TEXT NOT NULL,
        original_path   TEXT NOT NULL,
        storage_path    TEXT NOT NULL,
        vol_num         INTEGER,
        part_num        INTEGER,
        title           TEXT,
        sha256          TEXT NOT NULL,
        size_bytes      INTEGER NOT NULL,
        mime_type       TEXT NOT NULL DEFAULT 'text/plain',
        doc_type        TEXT NOT NULL DEFAULT 'writings',
        language        TEXT NOT NULL DEFAULT 'en',
        word_count      INTEGER,
        line_count      INTEGER,
        estimated_pages INTEGER,
        ingested_at     TEXT NOT NULL,
        provenance_json TEXT,
        status          TEXT NOT NULL DEFAULT 'ingested'
    )
    """,

    # ── Chunks ───────────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS chunks (
        id              TEXT PRIMARY KEY,
        doc_id          TEXT NOT NULL,
        vol_num         INTEGER,
        part_num        INTEGER,
        chapter         TEXT,
        section         TEXT,
        page_est        INTEGER,
        chunk_index     INTEGER NOT NULL,
        char_start      INTEGER NOT NULL,
        char_end        INTEGER NOT NULL,
        text            TEXT NOT NULL,
        token_count     INTEGER,
        language        TEXT NOT NULL DEFAULT 'en',
        needs_review    INTEGER NOT NULL DEFAULT 0,
        created_at      TEXT NOT NULL,
        FOREIGN KEY (doc_id) REFERENCES archival_objects(id)
    )
    """,

    # ── FTS5 Full-Text Index ──────────────────────────────────────────────────
    # NOTE: Turso/libSQL supports FTS5 standalone table
    """
    CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
        chunk_id UNINDEXED,
        doc_id UNINDEXED,
        text,
        chapter
    )
    """,

    # ── Embeddings with DiskANN Vector Index ─────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS embeddings (
        id          TEXT PRIMARY KEY,
        chunk_id    TEXT NOT NULL UNIQUE,
        doc_id      TEXT NOT NULL,
        embedding   F32_BLOB(1024),
        model       TEXT NOT NULL DEFAULT 'BAAI/bge-m3',
        created_at  TEXT NOT NULL,
        FOREIGN KEY (chunk_id) REFERENCES chunks(id)
    )
    """,

    # ── DiskANN Vector Index ──────────────────────────────────────────────────
    """
    CREATE INDEX IF NOT EXISTS embeddings_vec_idx
    ON embeddings (libsql_vector_idx(embedding, 'metric=cosine'))
    """,

    # ── Processing Jobs ───────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS processing_jobs (
        id          TEXT PRIMARY KEY,
        doc_id      TEXT,
        job_type    TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'pending',
        progress    INTEGER DEFAULT 0,
        total       INTEGER DEFAULT 0,
        error       TEXT,
        started_at  TEXT,
        finished_at TEXT,
        created_at  TEXT NOT NULL
    )
    """,

    # ── OCR Review Queue ──────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS ocr_reviews (
        id              TEXT PRIMARY KEY,
        chunk_id        TEXT NOT NULL,
        original_text   TEXT NOT NULL,
        corrected_text  TEXT,
        reviewer        TEXT,
        reviewed_at     TEXT,
        confidence      REAL,
        needs_review    INTEGER NOT NULL DEFAULT 1,
        created_at      TEXT NOT NULL
    )
    """,
]

PHASE4_INDICES: list[str] = [
    "CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON chunks(doc_id)",
    "CREATE INDEX IF NOT EXISTS idx_chunks_vol ON chunks(vol_num, chunk_index)",
    "CREATE INDEX IF NOT EXISTS idx_embeddings_doc_id ON embeddings(doc_id)",
    "CREATE INDEX IF NOT EXISTS idx_jobs_doc_id ON processing_jobs(doc_id)",
    "CREATE INDEX IF NOT EXISTS idx_jobs_status ON processing_jobs(status)",
]


async def run_migration() -> None:
    import sys
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

    from app.db.database import get_db_client

    db = get_db_client()
    all_statements = PHASE4_DDL + PHASE4_INDICES

    print(f"Running Phase 4 schema migration ({len(all_statements)} statements)...")
    for i, stmt in enumerate(all_statements, 1):
        stmt = stmt.strip()
        if not stmt:
            continue
        try:
            await db.execute(stmt)
            label = stmt.split('\n')[0].strip()[:60]
            print(f"  [{i:02d}] OK  {label}")
        except Exception as exc:
            print(f"  [{i:02d}] ERR {str(exc)[:80]}")

    await db.close()
    print("\nPhase 4 migration complete.")


if __name__ == "__main__":
    asyncio.run(run_migration())
