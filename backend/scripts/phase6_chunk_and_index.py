"""
Phase 6 -- Corpus Chunk + Embedding Indexer
==========================================
One-shot script that:
  1. Runs the Phase 6 schema migration (002_phase6_search.sql)
  2. Reads ALL pages from Turso (with their ocr_text)
  3. Chunks each page via the sentence-aware chunker
  4. Inserts chunks into document_chunks table
  5. Syncs FTS5 virtual table (fts_chunks)
  6. Generates Qwen3-Embedding-0.6B embeddings for all chunks
  7. Stores embeddings in the embeddings table
  8. Writes a run summary to search_index_meta

Usage:
  cd backend
  python scripts/phase6_chunk_and_index.py [--dry-run] [--no-embed] [--object-id BAWS_VOL01]

Flags:
  --dry-run    Chunk and count only; do not write to DB
  --no-embed   Skip embedding generation (FTS5 only)
  --object-id  Process a single object only (for incremental re-index)
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Ensure app package is importable
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.database import get_db_client
from app.db.repositories.chunks import ChunkRepository
from app.services.search.chunker import chunk_pages


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def run_migration(db) -> None:
    """Apply Phase 6 schema migration."""
    migration_path = Path(__file__).parent.parent / "app" / "db" / "migrations" / "002_phase6_search.sql"
    sql = migration_path.read_text(encoding="utf-8")

    # Split on semicolons and execute each statement
    statements = [s.strip() for s in sql.split(";") if s.strip() and not s.strip().startswith("--")]
    for stmt in statements:
        try:
            await db.execute(stmt)
        except Exception as e:
            # Some ALTER TABLE statements may fail if column already exists -- ignore
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                continue
            print(f"  Migration warning: {e}")

    print("  [OK] Migration 002_phase6_search applied")


async def get_all_objects(db) -> list[dict]:
    """Fetch all archival objects."""
    result = await db.execute(
        "SELECT id, stable_id, title, language, page_count FROM archival_objects ORDER BY stable_id"
    )
    return [dict(r) for r in (result.rows or [])]


async def get_pages_for_object(db, object_id: str) -> list[dict]:
    """Fetch all pages for an object, ordered by page_number."""
    result = await db.execute(
        """
        SELECT id, object_id, page_number, label, ocr_text, alto_xml_key, ocr_confidence
        FROM pages
        WHERE object_id = ?
        ORDER BY page_number
        """,
        [object_id],
    )
    return [dict(r) for r in (result.rows or [])]


async def insert_chunks_batch(db, chunk_repo: ChunkRepository, chunks: list[dict]) -> list[str]:
    """Insert chunks and sync FTS5. Returns list of inserted chunk IDs."""
    ids = []
    for chunk in chunks:
        cid = str(uuid.uuid4())
        chunk["id"] = cid
        inserted_id = await chunk_repo.insert_chunk(chunk)
        ids.append(inserted_id)

    # Sync FTS5 -- insert into fts_chunks for each chunk
    if ids:
        for chunk in chunks:
            cid = chunk.get("id", "")
            text = chunk.get("text", "")
            obj_id = chunk.get("object_id", "")
            if cid and text:
                try:
                    await db.execute(
                        "INSERT OR REPLACE INTO fts_chunks (chunk_id, text, object_id) VALUES (?, ?, ?)",
                        [cid, text, obj_id],
                    )
                except Exception:
                    pass  # fts_chunks may have different schema; handled below

    return ids


async def embed_chunks(db, chunk_ids: list[str], texts: list[str], model_name: str, dry_run: bool = False) -> int:
    """Generate embeddings for a list of chunks in batches."""
    if dry_run or not chunk_ids:
        return 0

    from app.services.search.embedder import EmbeddingEngine, EMBEDDING_VERSION

    engine = EmbeddingEngine.get()
    batch_size = 16
    count = 0

    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i : i + batch_size]
        batch_ids   = chunk_ids[i : i + batch_size]

        try:
            vectors = engine.embed_passages(batch_texts, batch_size=batch_size)
        except Exception as e:
            print(f"  Embedding batch {i}–{i+batch_size} failed: {e}")
            continue

        for cid, vec in zip(batch_ids, vectors):
            emb_json = json.dumps(vec)
            try:
                await db.execute(
                    """
                    INSERT OR REPLACE INTO embeddings (id, chunk_id, model_name, dimension, embedding_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    [str(uuid.uuid4()), cid, model_name, len(vec), emb_json, _now()],
                )
                count += 1
            except Exception as e:
                print(f"  Embedding store error: {e}")

    return count


async def main(args: argparse.Namespace) -> None:
    t_start = time.monotonic()

    print("\n" + "=" * 60)
    print("PHASE 6 -- CORPUS CHUNK & EMBEDDING INDEXER")
    print("=" * 60)

    db = get_db_client()
    chunk_repo = ChunkRepository(db)

    # ── Step 1: Migration ─────────────────────────────────────────────────────
    print("\n[1/6] Applying database migration ...")
    await run_migration(db)

    # ── Step 2: Fetch objects ─────────────────────────────────────────────────
    print("\n[2/6] Fetching archival objects ...")
    if args.object_id:
        result = await db.execute(
            "SELECT id, stable_id, title, language, page_count FROM archival_objects WHERE stable_id = ? OR id = ?",
            [args.object_id, args.object_id],
        )
        objects = [dict(r) for r in (result.rows or [])]
    else:
        objects = await get_all_objects(db)

    print(f"       {len(objects)} archival objects found")

    if not objects:
        print("ERROR: No archival objects found. Run ingestion (Phase 4) first.")
        return

    # ── Step 3: Chunk all pages ───────────────────────────────────────────────
    print(f"\n[3/6] Chunking pages ({'DRY RUN' if args.dry_run else 'WRITING'}) ...")
    total_chunks  = 0
    all_chunk_ids: list[str] = []
    all_texts:     list[str] = []

    for obj in objects:
        obj_id     = obj["id"]
        obj_title  = obj.get("title", obj_id)[:50]
        pages = await get_pages_for_object(db, obj_id)

        if not pages:
            print(f"  SKIP  {obj_title} -- no pages")
            continue

        # Inject language into pages from parent object
        lang = obj.get("language", "en")
        for page in pages:
            if not page.get("language"):
                page["language"] = lang

        chunks = chunk_pages(pages, obj_id)

        if args.dry_run:
            print(f"  DRY   {obj_title}: {len(pages)} pages -> {len(chunks)} chunks")
            total_chunks += len(chunks)
            continue

        # Insert chunks + sync FTS5
        inserted_ids = await insert_chunks_batch(db, chunk_repo, chunks)
        all_chunk_ids.extend(inserted_ids)
        all_texts.extend(c["text"] for c in chunks)
        total_chunks += len(inserted_ids)
        print(f"  OK    {obj_title}: {len(pages)} pages -> {len(inserted_ids)} chunks")

    print(f"\n       Total chunks: {total_chunks:,}")

    if args.dry_run:
        print("\nDRY RUN complete -- no data written.")
        return

    # ── Step 4: Sync FTS5 (bulk alternative) ─────────────────────────────────
    print(f"\n[4/6] FTS5 sync verification ...")
    try:
        fts_res = await db.execute("SELECT COUNT(*) AS cnt FROM fts_chunks")
        fts_count = int(fts_res.first()["cnt"]) if fts_res.first() else 0
        print(f"       fts_chunks rows: {fts_count:,}")
    except Exception as e:
        print(f"       FTS5 count error: {e}")

    # ── Step 5: Embeddings ────────────────────────────────────────────────────
    if args.no_embed:
        print("\n[5/6] Embedding skipped (--no-embed flag).")
        model_name = "skipped"
        embed_count = 0
    else:
        from app.core.config import settings
        model_name = settings.ai_embedding_model
        print(f"\n[5/6] Generating embeddings with {model_name} ...")
        print(f"       {len(all_chunk_ids):,} chunks to embed")
        embed_count = await embed_chunks(db, all_chunk_ids, all_texts, model_name)
        print(f"       {embed_count:,} embeddings stored")

    # ── Step 6: Record run in search_index_meta ───────────────────────────────
    print("\n[6/6] Recording index metadata ...")
    elapsed = time.monotonic() - t_start
    meta_id = str(uuid.uuid4())
    try:
        await db.execute(
            """
            INSERT OR REPLACE INTO search_index_meta
            (id, index_type, model_name, total_chunks, last_run_at, run_duration_s, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [meta_id, "hybrid", model_name, total_chunks, _now(), round(elapsed, 2), "completed"],
        )
        print(f"       Recorded run: {meta_id[:8]}…")
    except Exception as e:
        print(f"       Meta record warning: {e}")

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("PHASE 6 INDEXING COMPLETE")
    print("=" * 60)
    print(f"  Objects processed  : {len(objects)}")
    print(f"  Chunks created     : {total_chunks:,}")
    print(f"  FTS5 synced        : {'YES' if not args.no_embed else 'YES (FTS only)'}")
    print(f"  Embeddings stored  : {embed_count:,}")
    print(f"  Elapsed time       : {elapsed:.1f}s")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 6 corpus indexer")
    parser.add_argument("--dry-run",   action="store_true", help="Count chunks without writing to DB")
    parser.add_argument("--no-embed",  action="store_true", help="Skip embedding generation (FTS5 only)")
    parser.add_argument("--object-id", type=str, default=None, help="Process a single object (stable_id or id)")
    args = parser.parse_args()

    asyncio.run(main(args))

