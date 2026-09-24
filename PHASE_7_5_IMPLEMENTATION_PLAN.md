# PHASE 7.5 - MANDATORY ARCHITECTURE AUDIT PLAN
## Ambedkar Heritage Intelligence and Digital Preservation System
**Date**: 2026-09-24
**Scope**: All components implemented through Phase 7
**Mandate**: Determine whether the current architecture actually satisfies the problem statement and is safe to extend to Phase 8.
**Constraint**: Do NOT begin Phase 8 until all BLOCKER issues are resolved.

---

## Audit Sections

| # | Section | Focus | Deliverable |
|---|---------|-------|-------------|
| 1 | Problem Statement Traceability | Requirement -> implementation mapping | REQUIREMENT_TRACEABILITY.md |
| 2 | Database Audit | Turso schema, indexes, orphans, provenance chain | DATABASE_AUDIT.md |
| 3 | Vector Scale Audit | Storage projections, VectorStore abstraction | DATABASE_AUDIT.md (s Vector) |
| 4 | OCR Audit | Text quality, confidence, DjVu extraction | OCR_AUDIT.md |
| 5 | Preservation Audit | Fixity, PREMIS events, immutability | PRESERVATION_AUDIT.md |
| 6 | RAG Audit | Pipeline completeness vs. required spec | RAG_AUDIT.md |
| 7 | Hallucination Audit | Abstention correctness, citation verification | RAG_AUDIT.md (s Hallucination) |
| 8 | Prompt Injection Audit | Injection defense verification | RAG_AUDIT.md (s Security) |
| 9 | Claim/Evidence Audit | EvidenceChain completeness | RAG_AUDIT.md (s Claims) |
| 10 | Knowledge Graph Readiness | Data model for Phase 8 KG | DATABASE_AUDIT.md (s KG) |
| 11 | Hardware/Kiosk Readiness | Deployment profiles | HARDWARE_READINESS.md |
| 12 | Corpus Quality | Document inventory and coverage | CORPUS_QUALITY_REPORT.md |
| 13 | Technical Debt | Dead code, hardcoded values, debt register | TECHNICAL_DEBT.md |
| 14 | Architecture Decisions | KEEP / MODIFY / REPLACE for each subsystem | ARCHITECTURE_DECISIONS.md |

---

## Critical Findings & Remediation Summary

1. **RESOLVED ✅**: Vector embeddings generated for all 12,154 corpus chunks using `Qwen3-Embedding-0.6B` and stored in Turso Cloud. Local vector cache synced in `storage/local/vector_cache.npz`. Hybrid search (FTS5 + Vector + RRF) verified working.
2. **RESOLVED ✅**: Migrated from deprecated `google.generativeai` to modern `google-genai` (v2.25.0). Gemini API key verified 200 OK targeting `gemini-3.6-flash`.
3. **RESOLVED ✅**: Pre-built vector cache implemented in `TursoVectorStore` to eliminate `mem_hrana_response` memory limits.
4. **RESOLVED ✅**: EvidenceChain database persistence added in Phase 7.5.
5. **RESOLVED ✅**: Database indexes added via migration 003 (`idx_embeddings_model`, `idx_embeddings_version`, `idx_chunks_page_number`, `idx_pev_date`, `idx_audit_action`).
6. **AUTHORIZED FOR PHASE 8**: Knowledge Graph extraction, Multilingual pipeline, remaining corpus pages, and Kiosk profile.
