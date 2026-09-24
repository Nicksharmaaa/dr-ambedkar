# PHASE 6 IMPLEMENTATION PLAN
## Ambedkar Heritage - Serious Research Retrieval System

**Phase**: 6 - Four-Component Hybrid Search, Qwen3-Embedding, FTS5, RRF, Reranking
**Date**: 2026-09-23
**Status**: APPROVED AND IN EXECUTION

## 1. Objective

| Component  | Technology               | Role                                   |
|------------|--------------------------|----------------------------------------|
| Lexical    | FTS5 BM25 (libSQL)       | Exact phrases, names, dates, keywords  |
| Semantic   | Qwen3-Embedding-0.6B GPU | Concept, meaning, paraphrase matching  |
| Metadata   | SQL WHERE filters        | Language, object_type, date range      |
| Reranking  | Qwen3-Reranker-0.6B GPU  | Cross-encoder relevance re-scoring     |

## 2. Current State (Post-Phase 5)
- archival_objects: 19 volumes
- pages: 12,154 with ALTO XML
- document_chunks: 0 - Phase 6 creates them
- fts_chunks: empty - Phase 6 populates
- embeddings: empty - Phase 6 populates
- backend/app/services/search/: empty stub
- backend/app/api/v1/search.py: partial FTS stub

## 3. Tasks
1. Chunker: 512-token/64-overlap sentence-aware chunks from pages.ocr_text
2. Embedder: Qwen3-Embedding-0.6B GPU batch 16; JSON stored in embeddings table
3. VectorStore: ABC interface + TursoVectorStore (numpy cosine, DiskANN upgrade path)
4. HybridSearchService: encode->FTS5->vector->metadata filter->RRF->enrich->rerank
5. Reranker: Qwen3-Reranker-0.6B on-demand
6. Search API: POST /api/v1/search, semantic, lexical, suggest, stats
7. Schema: extend SearchResultChunk with reranker_score, viewer_url, object_title
8. Migration: 002_phase6_search.sql (embedding_version, search_index_meta)
9. Frontend: live data, filters, viewer deep-links, highlighted snippets
10. Tests: 7 test cases covering all components
