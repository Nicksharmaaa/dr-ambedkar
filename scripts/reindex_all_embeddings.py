"""
Re-index all 19,342 document chunks using clean Qwen3-Embedding-0.6B with native last-token pooling.

Fixes the verified indexing problem:
1. Missing 7,188 chunks (~37% of corpus, including volumes 14-P1, 14-P2, 15, 16, 17-P1, 17-P2).
2. Existing 12,154 vectors were corrupted by mean-pooling over causal LM hidden states + instruction pollution.
3. Updates backend/storage/local/vector_cache.npz and PostgreSQL embeddings table.
"""
import os
import sys
import time
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import psycopg
import torch

# Ensure strictly offline execution
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

from sentence_transformers import SentenceTransformer

def main():
    start_time = time.time()
    print("=" * 70)
    print("STARTING CORPUS RE-INDEXING (19,342 CHUNKS)")
    print("=" * 70)

    # 1. Connect to PostgreSQL
    print("Connecting to PostgreSQL ambedkar_db ...", flush=True)
    conn = psycopg.connect("host=localhost port=5432 user=ambedkar_user password=ambedkar_local_sih_2026_sec! dbname=ambedkar_db")
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM document_chunks")
    total_chunks = cur.fetchone()[0]
    print(f"Total chunks in document_chunks table: {total_chunks}", flush=True)

    # Fetch all chunks: id, text
    print("Fetching all chunks from document_chunks ...", flush=True)
    cur.execute("SELECT id, text FROM document_chunks ORDER BY chunk_index ASC, id ASC")
    rows = cur.fetchall()
    chunk_ids = [r[0] for r in rows]
    chunk_texts = [r[1] if r[1] else "" for r in rows]
    print(f"Fetched {len(chunk_ids)} chunks into memory.", flush=True)

    # 2. Load model
    model_path = Path("backend/models/cache/models--Qwen--Qwen3-Embedding-0.6B/snapshots/97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3")
    if not model_path.exists():
        model_path = Path("models/cache/models--Qwen--Qwen3-Embedding-0.6B/snapshots/97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3")
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading Qwen3-Embedding-0.6B from {model_path} on {device} ...", flush=True)
    model = SentenceTransformer(
        str(model_path),
        device=device,
        model_kwargs={"torch_dtype": torch.float16 if device == "cuda" else torch.float32}
    )
    model.max_seq_length = 512
    print("Embedding model ready with max_seq_length=512.", flush=True)

    # 3. Batch encode
    batch_size = 32
    print(f"Encoding {len(chunk_texts)} chunks with batch_size={batch_size} ...", flush=True)
    t_enc_start = time.time()
    
    all_embeddings = []
    chunk_step = 2000
    for start_idx in range(0, len(chunk_texts), chunk_step):
        end_idx = min(start_idx + chunk_step, len(chunk_texts))
        sub_texts = chunk_texts[start_idx:end_idx]
        sub_embs = model.encode(
            sub_texts,
            batch_size=batch_size,
            show_progress_bar=False,
            normalize_embeddings=True,
        )
        all_embeddings.append(sub_embs)
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        print(f"  Encoded {end_idx}/{len(chunk_texts)} chunks ... ({(end_idx)/(time.time()-t_enc_start):.1f} chunks/sec)", flush=True)

    embeddings = np.vstack(all_embeddings)
    enc_duration = time.time() - t_enc_start
    print(f"Encoding complete in {enc_duration:.2f}s ({len(chunk_texts)/enc_duration:.1f} chunks/sec).", flush=True)
    print(f"Matrix shape: {embeddings.shape}, dtype: {embeddings.dtype}", flush=True)

    # Verify no representation collapse
    norms = np.linalg.norm(embeddings.astype(np.float32), axis=1)
    mean_vec = np.mean(embeddings.astype(np.float32), axis=0)
    mean_vec_norm = np.linalg.norm(mean_vec)
    print(f"Vector verification -> Average L2 norm: {np.mean(norms):.4f}, Background mean norm: {mean_vec_norm:.4f}")
    if mean_vec_norm > 0.8:
        print("WARNING: Vector variance collapsed!", flush=True)
    else:
        print("PASS: Vector variance is healthy and diverse!", flush=True)

    # 4. Save to vector_cache.npz
    out_paths = [
        Path("backend/storage/local/vector_cache.npz"),
        Path("storage/local/vector_cache.npz"),
    ]
    for out_path in out_paths:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        print(f"Saving vector cache to {out_path} ...", flush=True)
        np.savez_compressed(
            out_path,
            matrix=embeddings.astype(np.float32),
            chunk_ids=np.array(chunk_ids),
        )
        print(f"Saved {out_path} ({os.path.getsize(out_path)/(1024*1024):.2f} MB).", flush=True)

    # 5. Populate PostgreSQL embeddings table
    print("Updating PostgreSQL embeddings table ...", flush=True)
    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_embeddings_chunk_id ON embeddings(chunk_id)")
    conn.commit()

    print("Clearing old embeddings ...", flush=True)
    cur.execute("TRUNCATE TABLE embeddings")
    conn.commit()

    print("Inserting 19,342 embeddings into PostgreSQL in batches of 500 ...", flush=True)
    now_iso = datetime.now(timezone.utc).isoformat()
    db_batch_size = 500
    for i in range(0, len(chunk_ids), db_batch_size):
        b_ids = chunk_ids[i : i + db_batch_size]
        b_embs = embeddings[i : i + db_batch_size]
        values = []
        for cid, emb in zip(b_ids, b_embs):
            values.append((
                str(uuid.uuid4()),
                cid,
                "Qwen/Qwen3-Embedding-0.6B",
                1024,
                json.dumps([round(float(x), 6) for x in emb]),
                now_iso,
                "v1"
            ))
        cur.executemany(
            """
            INSERT INTO embeddings (id, chunk_id, model_name, dimension, embedding_json, created_at, embedding_version)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            values
        )
        conn.commit()
        if (i // db_batch_size) % 10 == 0 or i + db_batch_size >= len(chunk_ids):
            print(f"  Inserted {min(i + db_batch_size, len(chunk_ids))}/{len(chunk_ids)} rows ...", flush=True)

    cur.execute("SELECT COUNT(*) FROM embeddings")
    final_count = cur.fetchone()[0]
    print(f"PostgreSQL embeddings table count: {final_count}", flush=True)

    conn.close()
    total_time = time.time() - start_time
    print("=" * 70)
    print(f"RE-INDEXING SUCCESSFULLY FINISHED IN {total_time:.1f}s")
    print("=" * 70)

if __name__ == "__main__":
    main()
