# REQUIREMENTS TRACEABILITY MATRIX (RTM)
## Digital Heritage Archive for Memorials, Manuscripts & Ambedkar
**SIH Problem Statement 26096: AI-Powered Institutional Archive and Audio-Visual Knowledge Platform**  
**Final Validation Phase — Complete Compliance Matrix**  
**Date:** September 2026 | **Scope:** 17 Mandatory Requirements

---

## 1. Compliance Matrix Overview

This matrix establishes 100% bi-directional traceability between every functional and non-functional requirement mandated under SIH Problem Statement 26096, the underlying source code implementation, and the automated verification test suites.

| Req ID | Requirement Category & Summary | Implementing Modules & Components | Test Suite & Validation Step | Compliance Status |
| :---: | :--- | :--- | :--- | :---: |
| **REQ-01** | **Institutional Archival Catalog**<br>Structured metadata, volume indexing, multi-tier archival organization. | `backend/app/services/corpus/`<br>`backend/app/api/v1/endpoints/corpus.py`<br>`frontend/app/catalog/` | `tests/test_corpus.py`<br>`phase13_final_validation_suite.py` (Sec 2) | **VERIFIED (100%)** |
| **REQ-02** | **High-Resolution Facsimile Preservation**<br>Immutable archival scans, ALTO XML layout, book flip viewer. | `backend/app/services/preservation/`<br>`backend/app/services/document_ai/`<br>`frontend/app/documents/[id]/viewer/` | `tests/test_preservation.py`<br>`test_phase10_institutional_experience.py` | **VERIFIED (100%)** |
| **REQ-03** | **Hybrid Lexical-Semantic Search**<br>FTS5 BM25 + Turso DiskANN vector search with Reciprocal Rank Fusion ($k=60$). | `backend/app/services/search/hybrid_search.py`<br>`backend/app/services/search/vector_store.py` | `tests/test_search.py`<br>`phase13_final_validation_suite.py` (Sec 2, 10) | **VERIFIED (100%)** |
| **REQ-04** | **Cross-Encoder Relevance Reranking**<br>`Qwen3-Reranker-0.6B` cross-encoder for precision candidate scoring. | `backend/app/services/search/reranker.py`<br>`backend/app/services/assistant/generator.py` | `tests/test_reranker.py`<br>`phase13_final_validation_suite.py` (Sec 4) | **VERIFIED (100%)** |
| **REQ-05** | **Zero-Hallucination AI Research Assistant**<br>4-tier XML structured prompt, strict grounding, mandatory abstention. | `backend/app/services/assistant/generator.py`<br>`backend/app/api/v1/endpoints/assistant.py` | `tests/test_assistant.py`<br>`phase13_final_validation_suite.py` (Sec 3) | **VERIFIED (100%)** |
| **REQ-06** | **Deep Forensic Source Citations**<br>Volume, page number, excerpt, and deep-link facsimile viewer URL. | `backend/app/services/assistant/generator.py`<br>`frontend/components/assistant/` | `tests/test_citations.py`<br>`phase13_final_validation_suite.py` (Sec 4) | **VERIFIED (100%)** |
| **REQ-07** | **Persistent UI Assistant Launcher (Bottom-Left)**<br>Invariant placement on bottom-left across all user interfaces. | `frontend/components/assistant/PersistentAssistantLauncher.tsx`<br>`frontend/app/layout.tsx` | Visual Inspection & DOM Test<br>`phase13_final_validation_suite.py` | **VERIFIED (100%)** |
| **REQ-08** | **Multilingual & Cross-Lingual Search**<br>IndicTrans2 translation, 5 Indic languages (EN, HI, BN, GU, TA). | `backend/app/services/multilingual/`<br>`backend-indic/` | `tests/test_multilingual.py`<br>`phase13_final_validation_suite.py` (Sec 5) | **VERIFIED (100%)** |
| **REQ-09** | **Audio-Visual Archive & Synchronized Player**<br>BBC 1931 recordings, speeches, WebVTT synced transcripts. | `backend/app/services/media/`<br>`frontend/app/media/`<br>`frontend/components/media/` | `tests/test_media.py`<br>`phase13_final_validation_suite.py` (Sec 6) | **VERIFIED (100%)** |
| **REQ-10** | **Spoken Transcript Timestamp Seeking**<br>Keyword search within transcripts with instantaneous time-seek. | `backend/app/services/media/transcription.py`<br>`frontend/components/media/TranscriptViewer.tsx`| `tests/test_media_search.py`<br>`phase13_final_validation_suite.py` (Sec 6) | **VERIFIED (100%)** |
| **REQ-11** | **Chronological Historical Timeline**<br>Biographical milestones, historic events, social movements. | `backend/app/services/timeline/service.py`<br>`frontend/app/timeline/` | `tests/test_timeline.py`<br>`phase13_final_validation_suite.py` (Sec 7) | **VERIFIED (100%)** |
| **REQ-12** | **Archival Knowledge Graph (KG)**<br>1,480+ entities & relations, mentor-peer links, graph traversal. | `backend/app/services/knowledge_graph/`<br>`frontend/app/graph/` | `tests/test_knowledge_graph.py`<br>`phase13_final_validation_suite.py` (Sec 7) | **VERIFIED (100%)** |
| **REQ-13** | **Museum Kiosk Fullscreen Touch Mode**<br>Target sizes $\ge 80\text{px}$, lockdown view, accessibility tokens. | `frontend/app/kiosk/page.tsx`<br>`frontend/components/kiosk/` | `tests/test_kiosk.py`<br>`test_phase10_institutional_experience.py` | **VERIFIED (100%)** |
| **REQ-14** | **Hardware Abstraction Layer (HAL)**<br>10 peripherals across Development, Tablet, Kiosk, Institutional. | `backend/app/services/hardware/hal_service.py`<br>`backend/app/api/v1/endpoints/hardware.py` | `tests/test_hardware_hal.py`<br>`phase13_final_validation_suite.py` (Sec 8) | **VERIFIED (100%)** |
| **REQ-15** | **Offline PWA Resilience & Caching**<br>ServiceWorker caching, manifest sync, mandatory offline abstention. | `backend/app/services/offline/sync_service.py`<br>`frontend/public/sw.js` | `tests/test_offline.py`<br>`phase13_final_validation_suite.py` (Sec 8) | **VERIFIED (100%)** |
| **REQ-16** | **Security Boundary & Injection Defense**<br>Path traversal block, sanitized prompt inputs, token authentication. | `backend/app/core/security.py`<br>`backend/app/api/middleware/` | `tests/test_security.py`<br>`phase13_final_validation_suite.py` (Sec 9) | **VERIFIED (100%)** |
| **REQ-17** | **Sub-Second Search & Edge-Cloud Performance**<br>Turso Cloud libSQL AWS ap-south-1, in-memory vector cache. | `backend/app/services/search/vector_store.py`<br>`backend/storage/local/vector_cache.npz` | `phase13_final_validation_suite.py` (Sec 10 Latency Benchmarks) | **VERIFIED (100%)** |

---

## 2. Requirement Verification Sign-off

- **Mandated Requirements:** 17
- **Implemented Requirements:** 17
- **Verified Requirements:** 17 (100.0%)
- **Gaps / Deficiencies:** None
