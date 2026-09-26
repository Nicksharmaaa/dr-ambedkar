"""
Populate pages and document_chunks in PostgreSQL from existing ALTO XML derivatives and originals.
"""
import xml.etree.ElementTree as ET
from pathlib import Path
import psycopg
import sys
import uuid
import json

sys.path.insert(0, ".")
from app.services.search.chunker import chunk_pages

def run():
    print("=" * 70)
    print("POPULATING PAGES, CHUNKS, AND FULL-TEXT SEARCH IN POSTGRESQL")
    print("=" * 70)

    pg_conn = psycopg.connect("host=localhost port=5432 user=ambedkar_user password=ambedkar_local_sih_2026_sec! dbname=ambedkar_db")
    pg_conn.autocommit = True
    pg_cur = pg_conn.cursor()

    alto_base = Path("storage/local/derivatives/alto")
    if not alto_base.exists():
        print(f"{alto_base} not found!")
        return

    vol_dirs = sorted(alto_base.glob("AMBEDKAR-VOL-*"))
    print(f"Found {len(vol_dirs)} volume directories.")

    total_pages = 0
    total_chunks = 0

    # Load vector cache chunk IDs if available
    vec_cache = Path("storage/local/vector_cache.npz")
    cached_ids = []
    if vec_cache.exists():
        import numpy as np
        data = np.load(vec_cache, allow_pickle=True)
        cached_ids = [str(x) for x in data["chunk_ids"]]
        print(f"Loaded {len(cached_ids)} pre-calculated vector cache IDs.")

    global_chunk_idx = 0

    for v_dir in vol_dirs:
        vol_id = v_dir.name
        xml_files = sorted(v_dir.glob("*.xml"), key=lambda p: int(p.stem) if p.stem.isdigit() else 0)
        
        pages_to_insert = []
        parsed_pages = []

        for f in xml_files:
            try:
                tree = ET.parse(f)
                words = [n.attrib.get("CONTENT", "") for n in tree.getroot().iter() if n.tag.endswith("String")]
                page_text = " ".join(words)
                p_num = int(f.stem) if f.stem.isdigit() else 1
                page_id = f"{vol_id}_p{p_num:04d}"

                page_row = (
                    page_id, vol_id, p_num, f"Page {p_num}", page_text,
                    f"derivatives/alto/{vol_id}/{f.name}", 0.98
                )
                pages_to_insert.append(page_row)

                parsed_pages.append({
                    "id": page_id,
                    "object_id": vol_id,
                    "page_number": p_num,
                    "label": f"Page {p_num}",
                    "ocr_text": page_text,
                    "alto_xml_key": f"derivatives/alto/{vol_id}/{f.name}",
                    "language": "en"
                })
            except Exception as e:
                continue

        # Insert pages batch
        if pages_to_insert:
            pg_cur.executemany(
                """
                INSERT INTO pages (id, object_id, page_number, label, ocr_text, alto_xml_key, ocr_confidence)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET ocr_text = EXCLUDED.ocr_text
                """,
                pages_to_insert
            )
            total_pages += len(pages_to_insert)

        # Chunk pages
        chunks = chunk_pages(parsed_pages, vol_id)
        chunks_to_insert = []
        fts_to_insert = []

        for c_idx, c in enumerate(chunks):
            # Prefer deterministic cached ID if in range
            if global_chunk_idx < len(cached_ids):
                cid = cached_ids[global_chunk_idx]
            else:
                cid = str(uuid.uuid4())
            global_chunk_idx += 1

            chunk_row = (
                cid, vol_id, c.get("page_id"), None, c.get("chunk_index", c_idx),
                c["text"], c.get("language", "en"), c.get("token_count", len(c["text"].split())),
                c.get("char_count", len(c["text"])), vol_id, c.get("page_number", 1),
                c.get("section_title"), 0, 0
            )
            chunks_to_insert.append(chunk_row)
            fts_to_insert.append((cid, c["text"], vol_id))

        if chunks_to_insert:
            pg_cur.executemany(
                """
                INSERT INTO document_chunks (
                    id, object_id, page_id, section_id, chunk_index,
                    text, language, token_count, char_count,
                    volume_number, page_number, section_title,
                    is_header, is_footnote
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                chunks_to_insert
            )
            pg_cur.executemany(
                """
                INSERT INTO fts_chunks (chunk_id, text, object_id)
                VALUES (%s, %s, %s)
                ON CONFLICT (chunk_id) DO NOTHING
                """,
                fts_to_insert
            )
            total_chunks += len(chunks_to_insert)

        print(f"  [OK] {vol_id:<18}: {len(pages_to_insert):>4} pages | {len(chunks_to_insert):>4} chunks")

    # Populate embeddings table if cache exists
    if cached_ids and "matrix" in data:
        print("Populating embeddings table from vector cache...")
        matrix = data["matrix"]
        emb_batch = []
        for i, cid in enumerate(cached_ids):
            emb_id = str(uuid.uuid4())
            vec_json = json.dumps(matrix[i].tolist())
            emb_batch.append((emb_id, cid, "Qwen/Qwen3-Embedding-0.6B", "v1", 1024, vec_json))
            if len(emb_batch) >= 1000:
                pg_cur.executemany(
                    """
                    INSERT INTO embeddings (id, chunk_id, model_name, embedding_version, dimension, embedding_json)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    emb_batch
                )
                emb_batch = []
        if emb_batch:
            pg_cur.executemany(
                """
                INSERT INTO embeddings (id, chunk_id, model_name, embedding_version, dimension, embedding_json)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                emb_batch
            )
        print(f"Populated {len(cached_ids)} embeddings into PostgreSQL.")

    pg_conn.close()
    print("=" * 70)
    print(f"Completed! Total pages: {total_pages:,} | Total chunks: {total_chunks:,}")

if __name__ == "__main__":
    run()
