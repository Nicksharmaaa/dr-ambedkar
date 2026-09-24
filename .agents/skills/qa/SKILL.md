---
name: qa
description: QA and testing strategy. Unit, integration, and end-to-end tests. AI output quality evaluation. Accessibility testing. Performance benchmarks.
---

# QA Skill

## Purpose
Verify that every feature is: implemented → tested → executed → verified.

## Test Pyramid

### Unit Tests (pytest)
- All repository methods (with SQLite in-memory DB)
- All service methods (mocked dependencies)
- All Pydantic schemas (validation edge cases)
- All storage backend methods (with temp directory)
- Target: >80% coverage

### Integration Tests (pytest + test DB)
- OCR pipeline: real image input → ALTO XML + text output
- Embedding: real text input → vector dimensions verified
- Turso FTS5: insert text → FTS5 query → verify results
- Turso vector: insert embedding → ANN query → verify top results
- RAG pipeline: mock retrieval → generation → verify citation format

### End-to-End Tests (Playwright)
- Document upload → OCR → search → retrieve
- Search query → results display → document viewer open
- AI assistant query → response with citations
- Admin: ingest document → verify in archive
- Kiosk: offline mode → search in local DB

## AI Quality Evaluation
- OCR: CER/WER on 20 test pages (manual ground truth)
- Retrieval: Recall@10, MRR on 50 test queries
- RAG faithfulness: manual audit of 20 responses
- Hallucination audit: verify no fabricated citations

## Accessibility Testing
- Target: WCAG 2.1 AA
- Tools: axe-core (automated), manual screen reader test
- Kiosk: touch target size >48px, contrast ratio >4.5:1

## Performance Benchmarks
- Search latency: p95 < 2s (lexical), p95 < 5s (semantic + rerank)
- OCR throughput: >10 pages/minute
- IIIF tile delivery: <200ms per tile
- API health check: <50ms

## Test Execution Commands
```bash
# Backend unit + integration
pytest backend/tests/ -v --cov=backend/app --cov-report=html

# Frontend
cd frontend && npx playwright test

# Specific: retrieval
pytest backend/tests/integration/test_retrieval.py -v
```

## CI Enforcement
- All tests must pass before merge
- Coverage < 80% = merge blocked
- Playwright e2e must pass on main branch
