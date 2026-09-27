import asyncio
import os
import sys
import time
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


from app.core.config import settings
from app.db.database import get_db_client

async def test_search():
    print("=" * 60)
    print("SEMANTIC SEARCH DIAGNOSTIC")
    print("=" * 60)

    # 1. Database Connection
    db = get_db_client()
    try:
        ver_res = await db.execute("SELECT version();")
        pg_ver = ver_res.rows[0]["version"] if ver_res.rows else "Unknown"
        print(f"Database: PostgreSQL ({pg_ver[:40]}...)")
        curr_db_res = await db.execute("SELECT current_database();")
        curr_db = curr_db_res.rows[0]["current_database"] if curr_db_res.rows else "Unknown"
        print(f"Current Database: {curr_db}")
    except Exception as e:
        print(f"Database connection: FAIL ({e})")
        return

    # 2. Check pgvector extension
    try:
        ext_res = await db.execute("SELECT * FROM pg_available_extensions WHERE name='vector';")
        installed_res = await db.execute("SELECT * FROM pg_extension WHERE extname='vector';")
        has_ext = len(installed_res.rows) > 0 if installed_res.rows else False
        avail_ext = len(ext_res.rows) > 0 if ext_res.rows else False
        print(f"pgvector available: {'YES' if avail_ext else 'NO'}")
        print(f"pgvector installed: {'PASS' if has_ext else 'NOT INSTALLED (using numpy accelerated vector cache)'}")
    except Exception as e:
        print(f"pgvector check: {e}")

    # 3. Check embeddings table & vector cache
    try:
        emb_cnt_res = await db.execute("SELECT count(*) as c FROM embeddings;")
        emb_cnt = emb_cnt_res.rows[0]["c"] if emb_cnt_res.rows else 0
        chunks_cnt_res = await db.execute("SELECT count(*) as c FROM document_chunks;")
        chunks_cnt = chunks_cnt_res.rows[0]["c"] if chunks_cnt_res.rows else 0
        print(f"document_chunks: {chunks_cnt}")
        print(f"embeddings in DB: {emb_cnt}")

        # Check sample embedding
        sample_res = await db.execute("SELECT id, chunk_id, model_name, dimension, length(embedding_json) as len_json FROM embeddings LIMIT 1;")
        if sample_res.rows:
            r = sample_res.rows[0]
            print(f"Sample DB embedding: chunk_id={r.get('chunk_id')}, model={r.get('model_name')}, dim={r.get('dimension')}, json_len={r.get('len_json')}")
    except Exception as e:
        print(f"Embeddings table check: FAIL ({e})")

    # Check vector cache file
    cache_path = backend_dir / "storage" / "local" / "vector_cache.npz"
    if cache_path.exists():
        import numpy as np
        data = np.load(cache_path, allow_pickle=True)
        mat = data["matrix"]
        cids = data["chunk_ids"]
        print(f"Vector cache file: EXISTS ({cache_path.name}) - Shape: {mat.shape}, Chunk IDs: {len(cids)}")
    else:
        print(f"Vector cache file: NOT FOUND at {cache_path}")

    # 4. Check Embedding Engine (Qwen3-Embedding-0.6B)
    from app.services.search.embedder import EmbeddingEngine
    t0 = time.monotonic()
    engine = EmbeddingEngine.get()
    print(f"Embedding model configured: {engine.model_name}")
    print(f"Embedding device: {engine.device}")
    
    test_query = "Poona Pact"
    print(f"\nTesting Query Embedding for: '{test_query}'")
    q_vec = engine.embed_query(test_query)
    q_dim = len(q_vec)
    import numpy as np
    norm = float(np.linalg.norm(q_vec))
    print(f"Query embedding: PASS (dimension: {q_dim}, L2 norm: {norm:.4f}, elapsed: {time.monotonic()-t0:.2f}s)")

    # 5. Test All Required Queries (Pure Vector & Hybrid)
    test_queries = [
        "Poona Pact",
        "Mahad Satyagraha",
        "Ambedkar's education",
        "Ambedkar's role in drafting the Constitution",
        "social reform and caste",
        "Columbia University",
        "constitutional morality",
        "Round Table Conferences",
        "education in economics",
        "the agreement between Ambedkar and Gandhi concerning separate electorates", # paraphrase
        # Multilingual tests
        "पुणे करार", # Hindi query for Poona Pact
        "महाडचा सत्याग्रह", # Marathi query for Mahad Satyagraha
    ]

    from app.services.search.vector_store import TursoVectorStore
    from app.services.search.hybrid import HybridSearchService

    vstore = TursoVectorStore(db)
    hybrid_svc = HybridSearchService(db)

    print("\n" + "=" * 60)
    print("RUNNING RETRIEVAL EVALUATION ON TEST QUERIES")
    print("=" * 60)

    for q in test_queries:
        t_start = time.monotonic()
        q_vec = engine.embed_query(q)
        v_hits = await vstore.search(query_embedding=q_vec, top_k=5, model_name=engine.model_name)
        top_v_score = v_hits[0].score if v_hits else 0.0
        
        h_res = await hybrid_svc.search(query=q, mode="hybrid", limit=5, enable_rerank=True)
        top_h_res = h_res["results"][0] if h_res["results"] else {}
        top_rerank = top_h_res.get("reranker_score")
        
        elapsed = time.monotonic() - t_start
        print(f"\nQuery: '{q}'")
        print(f"  Vector candidates: {len(v_hits)} | Top Cosine: {top_v_score:.4f}")
        print(f"  Hybrid results: {h_res['total']} (FTS: {h_res['fts_count']}, Vec: {h_res['vector_count']}) | Top Rerank: {top_rerank}")
        if top_h_res:
            print(f"  Top Match: [{top_h_res.get('object_title')}, p.{top_h_res.get('page_number')}]")
            print(f"  Snippet: {top_h_res.get('text', '')[:120]}...")


    await db.close()

if __name__ == "__main__":
    asyncio.run(test_search())
