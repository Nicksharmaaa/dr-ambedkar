---
name: retrieval
description: Hybrid search combining Turso vector search (DiskANN, cosine) and FTS5 lexical search. Implements Reciprocal Rank Fusion (RRF) merging. Outputs ranked candidate chunks for RAG.
---

# Retrieval Skill

## Purpose
Implement the hybrid search layer: vector + lexical + metadata filter + RRF merge.

## Architecture

### 1. Semantic Search (Turso Vector)
- Encode query with Qwen3-Embedding-0.6B
- Query: SELECT ... FROM vector_top_k('embeddings_vec_idx', vector(?), 50)
- Returns: top-50 semantically similar chunks with distance scores

### 2. Lexical Search (FTS5)
- Query: SELECT chunk_id, rank FROM search_index WHERE search_index MATCH ?
- Unicode-aware tokenization; diacritic removal
- Returns: BM25-ranked chunks

### 3. Metadata Filters
- Supported filters: object_type, date_range, language, collection_id, script
- Applied as SQL WHERE clauses in conjunction with vector/FTS results

### 4. Reciprocal Rank Fusion (RRF)
- rrf_score(d) = Σ 1 / (60 + rank_i(d))
- Merge vector results (rank by distance) + FTS results (rank by BM25)
- Output: unified ranked list

### 5. Reranking
- Input: top-50 from RRF
- Model: Qwen3-Reranker-0.6B
- Output: top-K with cross-encoder scores (default K=10)

## Turso Queries Used
- vector_top_k() for ANN search
- FTS5 MATCH for lexical
- SQL JOINs for metadata

## API Endpoints
POST /api/v1/search - Hybrid search
POST /api/v1/search/semantic - Semantic only
POST /api/v1/search/lexical - FTS5 only

## Key Config
RETRIEVAL_VECTOR_TOP_N = 50    # candidates from vector search
RETRIEVAL_FTS_TOP_N = 50       # candidates from FTS5
RETRIEVAL_RERANK_TOP_K = 10    # final results after reranking
