r"""
Phase 7.5 — BLOCKER Fix: Generate Embeddings for All Corpus Chunks
Reads all document_chunks from Turso and generates Qwen3-Embedding-0.6B
vectors, storing them in the embeddings table.

Run:
    cd c:\dr ambedkar\backend
    python scripts/generate_embeddings.py [--batch-size 32] [--limit N] [--dry-run]

Expected time:
    CPU: ~3-4 hours for 12,154 chunks
    GPU (RTX series): ~5-10 minutes for 12,154 chunks

The script is idempotent: it skips chunks that already have embeddings.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import sys
import os
import time
import uuid
from datetime import datetime, timezone

# Ensure backend app is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ambedkar.embed_generation")

EMBEDDING_VERSION = "v1"


async def fetch_chunks_by_ids(db, chunk_ids: list[str]) -> list[dict]:
    """Fetch chunk texts by primary key in a single fast indexed query."""
    if not chunk_ids:
        return []
    placeholders = ",".join("?" for _ in chunk_ids)
    for attempt in range(5):
        try:
            result = await db.execute(
                f"SELECT id AS chunk_id, text FROM document_chunks WHERE id IN ({placeholders})",
                chunk_ids,
            )
            return [dict(r) for r in (result.rows or [])]
        except Exception as exc:
            if attempt == 4:
                raise
            logger.warning("Fetching chunks by PK failed (%s); retrying in %ds...", exc, attempt * 2 + 1)
            await asyncio.sleep(attempt * 2 + 1)
    return []


async def embed_and_store(db, engine, chunks: list[dict], dry_run: bool = False) -> int:
    """Embed a batch of chunks and store in embeddings table using Turso batch pipeline."""
    if not chunks:
        return 0

    texts = [c["text"] for c in chunks]

    # Generate embeddings (batch on GPU)
    embeddings = engine.embed_passages(texts, batch_size=len(texts))

    if dry_run:
        for chunk, embedding in zip(chunks, embeddings):
            logger.info("[DRY-RUN] Would embed chunk_id=%s (dim=%d)", chunk["chunk_id"], len(embedding))
        return len(chunks)

    statements = []
    now = datetime.now(timezone.utc).isoformat()
    for chunk, embedding in zip(chunks, embeddings):
        emb_id = str(uuid.uuid4())
        emb_json = json.dumps(embedding)
        dim = len(embedding)
        sql = """
            INSERT OR REPLACE INTO embeddings (
                id, chunk_id, model_name, dimension, embedding_json, created_at, embedding_version
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        params = [emb_id, chunk["chunk_id"], engine.model_name, dim, emb_json, now, EMBEDDING_VERSION]
        statements.append((sql, params))

    for attempt in range(5):
        try:
            await db.batch(statements)
            return len(statements)
        except Exception as exc:
            if attempt == 4:
                logger.warning("Batch pipeline insert failed (%s); falling back to individual inserts...", exc)
                stored = 0
                for sql, params in statements:
                    try:
                        await db.execute(sql, params)
                        stored += 1
                    except Exception as single_exc:
                        logger.error("Failed single insert: %s", single_exc)
                return stored
            logger.warning("Batch insert failed (%s); retrying in %ds...", exc, attempt * 2 + 1)
            await asyncio.sleep(attempt * 2 + 1)
    return 0


async def main(args: argparse.Namespace) -> None:
    from app.db.database import get_db_client
    from app.services.search.embedder import EmbeddingEngine

    logger.info("=== PHASE 7.5 EMBEDDING GENERATION ===")
    logger.info("Model: %s", "Qwen/Qwen3-Embedding-0.6B (from settings)")
    logger.info("Batch size: %d", args.batch_size)
    logger.info("Dry run: %s", args.dry_run)

    db = get_db_client()

    # 1. Fetch all chunk IDs
    all_chunks_res = await db.execute("SELECT id FROM document_chunks")
    all_ids = [r["id"] for r in (all_chunks_res.rows or [])]

    # 2. Fetch already embedded chunk IDs
    emb_res = await db.execute(
        "SELECT chunk_id FROM embeddings WHERE embedding_version = ?",
        [EMBEDDING_VERSION],
    )
    already_embedded_ids = set(r["chunk_id"] for r in (emb_res.rows or []))

    # 3. Compute remaining
    remaining_ids = [cid for cid in all_ids if cid not in already_embedded_ids]
    total_chunks = len(all_ids)
    already_embedded = len(already_embedded_ids)
    remaining = len(remaining_ids)

    logger.info("Total chunks in DB: %d", total_chunks)
    logger.info("Already embedded: %d", already_embedded)
    logger.info("To embed now: %d", remaining)

    if remaining == 0:
        logger.info("All chunks already embedded. Nothing to do.")
        await db.close()
        return

    if args.limit:
        remaining_ids = remaining_ids[:args.limit]
        remaining = len(remaining_ids)
        logger.info("Limited to first %d chunks (--limit flag)", remaining)

    # Load embedding engine (lazy: loads on first call)
    logger.info("Loading embedding model (this may take 30-60s on first load)...")
    engine = EmbeddingEngine.get()
    engine._ensure_loaded()
    logger.info("Embedding model ready. Dimension: %d, Device: %s", engine.dimension, engine.device)

    # Generate in batches
    total_stored = 0
    batch_num = 0
    t_start = time.monotonic()

    while total_stored < remaining:
        chunk_slice_ids = remaining_ids[total_stored : total_stored + args.batch_size]
        if not chunk_slice_ids:
            break

        chunks = await fetch_chunks_by_ids(db, chunk_slice_ids)
        if not chunks:
            logger.warning("No chunks returned for slice; stopping.")
            break

        batch_num += 1
        t_batch = time.monotonic()
        stored = await embed_and_store(db, engine, chunks, dry_run=args.dry_run)
        elapsed = time.monotonic() - t_batch

        total_stored += stored
        pct = round((already_embedded + total_stored) / max(total_chunks, 1) * 100, 1)

        logger.info(
            "Batch %d: stored %d embeddings in %.2fs | total=%d/%d (%.1f%%)",
            batch_num, stored, elapsed, already_embedded + total_stored, total_chunks, pct,
        )

        if stored == 0:
            logger.warning("No embeddings stored in batch — stopping.")
            break

    total_elapsed = time.monotonic() - t_start
    logger.info("=== COMPLETE ===")
    logger.info("Embeddings generated: %d", total_stored)
    logger.info("Total time: %.1f seconds (%.1f min)", total_elapsed, total_elapsed / 60)

    if not args.dry_run:
        # Update search_index_meta
        try:
            await db.execute(
                """
                INSERT OR REPLACE INTO search_index_meta (id, index_type, model_name, embedding_version,
                    total_chunks, last_run_at, run_duration_s, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    "vector-index-v1",
                    "vector",
                    engine.model_name,
                    EMBEDDING_VERSION,
                    already_embedded + total_stored,
                    datetime.now(timezone.utc).isoformat(),
                    round(total_elapsed, 2),
                    "complete",
                ],
            )
            logger.info("search_index_meta updated.")
        except Exception as exc:
            logger.warning("Could not update search_index_meta: %s", exc)

    await db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Qwen3 embeddings for all corpus chunks")
    parser.add_argument("--batch-size", type=int, default=32, help="Chunks per embedding batch (default: 32)")
    parser.add_argument("--limit", type=int, default=0, help="Stop after N embeddings (0=all)")
    parser.add_argument("--dry-run", action="store_true", help="Do not write to DB, just test model loading")
    args = parser.parse_args()

    asyncio.run(main(args))
