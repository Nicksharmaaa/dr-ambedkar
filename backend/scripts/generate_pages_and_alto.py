"""
Batch script: Generate Pages and ALTO XML derivatives for all 19 Ambedkar Volumes.
Populates the Turso 'pages' table with stable IDs and stores ALTO v4.2 XML files in derivatives/alto/.
Logs PREMIS 3.0 derivative_creation events.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from pathlib import Path
import sys
import time

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from app.core.config import settings
from app.db.database import get_db_client
from app.services.iiif.alto import generate_alto_xml
from app.services.preservation.engine import PreservationEngine


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def generate_pages_for_corpus() -> None:
    db = get_db_client()
    engine = PreservationEngine(db)

    print("=" * 70)
    print("PHASE 5: ARCHIVAL PAGE ARCHITECTURE & ALTO XML GENERATOR")
    print("=" * 70)

    # 1. Fetch all documents
    doc_res = await db.execute("SELECT id, stable_id, title FROM archival_objects ORDER BY id")
    docs = [dict(r) for r in doc_res.rows]
    print(f"Discovered {len(docs)} archival volumes to process.")

    derivatives_root = Path(settings.storage_local_root) / "derivatives" / "alto"
    derivatives_root.mkdir(parents=True, exist_ok=True)

    total_pages_created = 0
    t0 = time.time()

    for doc in docs:
        doc_id = doc["id"]
        doc_dir = derivatives_root / doc_id
        doc_dir.mkdir(parents=True, exist_ok=True)

        print(f"\nProcessing [{doc_id}] {doc['title'][:50]}...")

        # Fetch all chunks for this doc, grouped by page_est
        chunk_res = await db.execute(
            """
            SELECT page_est, chapter, text, chunk_index
            FROM chunks
            WHERE doc_id = ?
            ORDER BY page_est ASC, chunk_index ASC
            """,
            [doc_id],
        )

        # Group chunks by page_est
        pages_dict: dict[int, list[dict]] = {}
        for r in chunk_res.rows:
            p_num = r["page_est"] or 1
            if p_num not in pages_dict:
                pages_dict[p_num] = []
            pages_dict[p_num].append(dict(r))

        print(f"  Found {len(pages_dict)} distinct pages in {len(chunk_res.rows)} chunks.")

        # Prepare batch insert rows for pages
        now_str = _now()
        batch_rows: list[tuple] = []
        doc_page_count = 0

        for page_num in sorted(pages_dict.keys()):
            chunks_on_page = pages_dict[page_num]
            combined_text = "\n\n".join(c["text"] for c in chunks_on_page if c.get("text"))
            chapter = chunks_on_page[0].get("chapter") or f"Volume {doc_id.split('-')[-1]}"

            page_id = f"{doc_id}_p{page_num:04d}"
            rel_alto_key = f"derivatives/alto/{doc_id}/{page_num:04d}.xml"

            # Generate ALTO XML
            alto_content = generate_alto_xml(
                doc_id=doc_id,
                page_number=page_num,
                page_id=page_id,
                text=combined_text,
                chapter_title=chapter,
            )

            # Write ALTO XML to local storage
            alto_file = doc_dir / f"{page_num:04d}.xml"
            alto_file.write_text(alto_content, encoding="utf-8")

            # Collect for DB batch insertion
            batch_rows.append((
                page_id,
                doc_id,
                page_num,
                f"Page {page_num}",
                rel_alto_key,
                combined_text[:500],  # preview
                0.98,
                "completed",
                now_str,
                now_str,
            ))
            doc_page_count += 1

        # Batch insert into pages table in chunks of 50
        batch_size = 50
        for i in range(0, len(batch_rows), batch_size):
            chunk = batch_rows[i : i + batch_size]
            placeholders = ", ".join(["(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"] * len(chunk))
            flattened = [item for sub in chunk for item in sub]
            sql = f"""
            INSERT OR REPLACE INTO pages (
                id, object_id, page_number, label, alto_xml_key,
                ocr_text, ocr_confidence, processing_status,
                created_at, updated_at
            ) VALUES {placeholders}
            """
            await db.execute(sql, flattened)

        # Log PREMIS derivative_creation event
        await engine.log_event(
            object_id=doc_id,
            event_type="derivative_creation",
            event_detail=f"Synthesized ALTO v4.2 spatial layout derivatives for {doc_page_count} pages",
            event_outcome="success",
            outcome_detail=f"Generated {doc_page_count} ALTO XML files stored in derivatives/alto/{doc_id}/",
        )

        total_pages_created += doc_page_count
        print(f"  [OK] Created {doc_page_count} pages and ALTO XML files for {doc_id}.")

    elapsed = round(time.time() - t0, 2)
    print("\n" + "=" * 70)
    print(f"COMPLETED: Generated {total_pages_created} pages across {len(docs)} volumes in {elapsed}s.")
    print("=" * 70)

    await db.close()


if __name__ == "__main__":
    asyncio.run(generate_pages_for_corpus())
