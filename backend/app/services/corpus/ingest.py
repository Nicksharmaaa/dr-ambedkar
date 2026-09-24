"""
Corpus Ingestion Service — Phase 4
Reads the approved archival corpus, calculates SHA-256 hashes,
stores originals in LocalStorageProvider, registers archival objects in Turso,
runs structure parser & chunker, and populates chunks + chunks_fts tables.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.db.database import get_db_client, DatabaseClient
from app.services.corpus.parser import parse_volume, CorpusDocument
from app.services.corpus.chunker import chunk_document, Chunk
from app.services.storage.local import LocalStorageBackend

logger = logging.getLogger("ambedkar.corpus.ingest")

VOLUME_METADATA: list[dict[str, Any]] = [
    {
        "filename": "Volume_01_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-01",
        "vol_num": 1,
        "part_num": None,
        "title": "Castes in India, Annihilation of Caste, Federation versus Freedom",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 1",
    },
    {
        "filename": "Volume_02_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-02",
        "vol_num": 2,
        "part_num": None,
        "title": "Who Were the Shudras? / Which Way Emancipation?",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 2",
    },
    {
        "filename": "Volume_03_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-03",
        "vol_num": 3,
        "part_num": None,
        "title": "Philosophy of Hinduism, India and the Pre-requisites of Communism, Revolution and Counter-Revolution",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 3",
    },
    {
        "filename": "Volume_04_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-04",
        "vol_num": 4,
        "part_num": None,
        "title": "Riddles in Hinduism",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 4",
    },
    {
        "filename": "Volume_05_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-05",
        "vol_num": 5,
        "part_num": None,
        "title": "Untouchables and the Pax Britannica / The Untouchables or the Children of India's Ghetto",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 5",
    },
    {
        "filename": "Volume_06_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-06",
        "vol_num": 6,
        "part_num": None,
        "title": "Administration and Finance of the East India Company, The Evolution of Provincial Finance in British India",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 6",
    },
    {
        "filename": "Volume_07_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-07",
        "vol_num": 7,
        "part_num": None,
        "title": "Who Were the Shudras? / The Untouchables: Who Were They and Why They Became Untouchables?",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 7",
    },
    {
        "filename": "Volume_08_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-08",
        "vol_num": 8,
        "part_num": None,
        "title": "Pakistan or the Partition of India",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 8",
    },
    {
        "filename": "Volume_09_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-09",
        "vol_num": 9,
        "part_num": None,
        "title": "What Congress and Gandhi Have Done to the Untouchables / Mr. Gandhi and the Emancipation of the Untouchables",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 9",
    },
    {
        "filename": "Volume_10_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-10",
        "vol_num": 10,
        "part_num": None,
        "title": "Dr. Ambedkar as Member of the Governor-General's Executive Council (1942-46)",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 10",
    },
    {
        "filename": "Volume_11_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-11",
        "vol_num": 11,
        "part_num": None,
        "title": "The Buddha and His Dhamma",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 11",
    },
    {
        "filename": "Volume_12_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-12",
        "vol_num": 12,
        "part_num": None,
        "title": "Unpublished Writings: Ancient Indian Commerce, The Untouchables and the Pax Britannica",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 12",
    },
    {
        "filename": "Volume_13_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-13",
        "vol_num": 13,
        "part_num": None,
        "title": "Dr. Ambedkar The Principal Architect of the Constitution of India",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 13",
    },
    {
        "filename": "Volume_14_01_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-14-P1",
        "vol_num": 14,
        "part_num": 1,
        "title": "Dr. Ambedkar and The Hindu Code Bill (Part 1)",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 14 Part 1",
    },
    {
        "filename": "Volume_14_02_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-14-P2",
        "vol_num": 14,
        "part_num": 2,
        "title": "Dr. Ambedkar and The Hindu Code Bill (Part 2)",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 14 Part 2",
    },
    {
        "filename": "Volume_15_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-15",
        "vol_num": 15,
        "part_num": None,
        "title": "Dr. Ambedkar as Free India's First Law Minister and Member of Opposition in Parliament",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 15",
    },
    {
        "filename": "Volume_16_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-16",
        "vol_num": 16,
        "part_num": None,
        "title": "Dr. B.R. Ambedkar and his Egalitarian Revolution - Speeches in Parliament & Public Addresses",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 16",
    },
    {
        "filename": "Volume_17_01_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-17-P1",
        "vol_num": 17,
        "part_num": 1,
        "title": "Dr. B.R. Ambedkar and his Egalitarian Revolution (Part 1)",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 17 Part 1",
    },
    {
        "filename": "Volume_17_02_djvu.txt",
        "archival_id": "AMBEDKAR-VOL-17-P2",
        "vol_num": 17,
        "part_num": 2,
        "title": "Dr. B.R. Ambedkar and his Egalitarian Revolution (Part 2)",
        "subtitle": "Dr. Babasaheb Ambedkar: Writings and Speeches Vol 17 Part 2",
    },
]


def _find_source_file(filename: str) -> Path:
    """Look in data/inbox/writings, data/inbox, or incoming_documents."""
    candidates = [
        Path("data/inbox/writings") / filename,
        Path("data/inbox") / filename,
        Path("incoming_documents/books_and_writings") / filename,
        Path("..") / "incoming_documents" / "books_and_writings" / filename,
        Path("c:/dr ambedkar/data/inbox/writings") / filename,
        Path("c:/dr ambedkar/incoming_documents/books_and_writings") / filename,
    ]
    for c in candidates:
        if c.exists():
            return c
    raise FileNotFoundError(f"Corpus file not found: {filename}")


class CorpusIngestionService:
    def __init__(self, db: DatabaseClient | None = None) -> None:
        self.db = db or get_db_client()
        self.storage = LocalStorageBackend(root=settings.storage_local_root)

    async def ingest_volume(self, meta: dict[str, Any]) -> dict[str, Any]:
        """Ingest a single volume: store original, register object, chunk, and index."""
        src_path = _find_source_file(meta["filename"])
        raw_bytes = src_path.read_bytes()
        text_content = raw_bytes.decode("utf-8", errors="replace")

        # 1. Hashing and file stats
        sha256 = hashlib.sha256(raw_bytes).hexdigest()
        file_size = len(raw_bytes)
        lines = text_content.splitlines()
        line_count = len(lines)
        word_count = len(text_content.split())
        est_pages = max(1, line_count // 40)
        now_iso = datetime.now(timezone.utc).isoformat()

        # 2. Store original binary with LocalStorageBackend
        storage_key = f"originals/{meta['archival_id']}/{meta['filename']}"
        await self.storage.put(storage_key, raw_bytes, content_type="text/plain; charset=utf-8")

        # 3. Insert or update archival_objects in Turso
        meta_json = json.dumps({
            "source_path": str(src_path),
            "line_count": line_count,
            "word_count": word_count,
            "sha256": sha256,
            "vol_num": meta["vol_num"],
            "part_num": meta["part_num"],
            "format": "djvu_text",
            "ingestion_phase": "Phase 4",
        })

        await self.db.execute(
            """
            INSERT OR REPLACE INTO archival_objects (
                id, stable_id, title, subtitle, object_type, language,
                source_institution, provenance, rights_status,
                creator, publisher, review_status, publication_status,
                file_hash, file_size_bytes, original_filename,
                original_file_key, page_count, metadata_json,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                meta["archival_id"],
                meta["archival_id"],
                meta["title"],
                meta["subtitle"],
                "writings",
                "en",
                "Government of Maharashtra / Dr. Babasaheb Ambedkar Source Material Publication Committee",
                "Original Dr. Babasaheb Ambedkar: Writings and Speeches collection",
                "public_domain",
                "Dr. B. R. Ambedkar",
                "Education Department, Government of Maharashtra",
                "approved",
                "published",
                sha256,
                file_size,
                meta["filename"],
                storage_key,
                est_pages,
                meta_json,
                now_iso,
                now_iso,
            ]
        )

        # 4. Parse text into structured document
        doc: CorpusDocument = parse_volume(
            content=text_content,
            archival_id=meta["archival_id"],
            vol_num=meta["vol_num"],
            part_num=meta["part_num"],
            title=meta["title"],
            filename=meta["filename"],
        )

        # 5. Chunk structured document
        chunks: list[Chunk] = chunk_document(doc)

        # 6. Delete existing chunks & FTS entries for this doc if re-ingesting
        await self.db.execute("DELETE FROM chunks WHERE doc_id = ?", [meta["archival_id"]])
        await self.db.execute("DELETE FROM chunks_fts WHERE doc_id = ?", [meta["archival_id"]])

        # 7. Batch insert chunks into chunks table and chunks_fts
        batch_size = 50
        for i in range(0, len(chunks), batch_size):
            batch_slice = chunks[i : i + batch_size]

            chunk_stmts: list[tuple[str, list[Any]]] = []
            fts_stmts: list[tuple[str, list[Any]]] = []

            for c in batch_slice:
                chunk_stmts.append((
                    """
                    INSERT INTO chunks (
                        id, doc_id, vol_num, part_num, chapter, section,
                        page_est, chunk_index, char_start, char_end,
                        text, token_count, language, needs_review, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    [
                        c.id, c.doc_id, c.vol_num, c.part_num, c.chapter, c.section,
                        c.page_est, c.chunk_index, c.char_start, c.char_end,
                        c.text, c.token_count, c.language, 0, c.created_at,
                    ],
                ))

                fts_stmts.append((
                    "INSERT INTO chunks_fts (chunk_id, doc_id, text, chapter) VALUES (?, ?, ?, ?)",
                    [c.id, c.doc_id, c.text, c.chapter or ""],
                ))

            # Execute chunk and FTS batches
            await self.db.batch(chunk_stmts)
            await self.db.batch(fts_stmts)

        return {
            "archival_id": meta["archival_id"],
            "filename": meta["filename"],
            "title": meta["title"],
            "sha256": sha256,
            "file_size": file_size,
            "word_count": word_count,
            "chapters_count": len(doc.chapters),
            "chunks_count": len(chunks),
            "status": "ingested",
        }

    async def ingest_all(self, max_volumes: int | None = None) -> list[dict[str, Any]]:
        """Ingest all volumes in the corpus, skipping already ingested ones."""
        results = []
        to_process = VOLUME_METADATA if max_volumes is None else VOLUME_METADATA[:max_volumes]

        # Check existing chunks to resume without repeating work
        try:
            chk_res = await self.db.execute("SELECT doc_id, count(*) as c FROM chunks GROUP BY doc_id")
            existing_counts = {row["doc_id"]: row["c"] for row in chk_res.rows}
        except Exception:
            existing_counts = {}

        print(f"\n=======================================================")
        print(f"Starting Phase 4 Corpus Ingestion: {len(to_process)} Volumes")
        print(f"=======================================================")

        for idx, meta in enumerate(to_process, 1):
            arch_id = meta["archival_id"]
            if arch_id in existing_counts and existing_counts[arch_id] > 50:
                print(f"\n[{idx:02d}/{len(to_process):02d}] Skipping {arch_id} (already ingested: {existing_counts[arch_id]:,} chunks)")
                results.append({
                    "archival_id": arch_id,
                    "filename": meta["filename"],
                    "title": meta["title"],
                    "chunks_count": existing_counts[arch_id],
                    "status": "already_ingested",
                })
                continue

            print(f"\n[{idx:02d}/{len(to_process):02d}] Ingesting {arch_id}: {meta['filename']}...")
            try:
                res = await self.ingest_volume(meta)
                print(
                    f"  [OK] {res['archival_id']} done! "
                    f"Size: {res['file_size']/1024/1024:.2f} MB | "
                    f"Words: {res['word_count']:,} | "
                    f"Chunks: {res['chunks_count']:,}"
                )
                results.append(res)
            except Exception as e:
                print(f"  [FAIL] {meta['archival_id']}: {e}")
                logger.exception("Failed ingesting %s", meta["archival_id"])

        print(f"\n=======================================================")
        print(f"Ingestion Finished: {len(results)}/{len(to_process)} successful.")
        total_chunks = sum(r.get("chunks_count", 0) for r in results)
        print(f"Total Chunks in Turso + FTS5: {total_chunks:,}")
        print(f"=======================================================\n")
        return results


async def main() -> None:
    service = CorpusIngestionService()
    try:
        await service.ingest_all()
    finally:
        await service.db.close()


if __name__ == "__main__":
    asyncio.run(main())
