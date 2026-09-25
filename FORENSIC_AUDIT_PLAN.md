# FORENSIC AUDIT PLAN
## Post-Completion Forensic Audit, Critical Bug Hunt, Hardcode Audit, AI/ML Audit, Data Integrity Audit & Training Readiness Review
**Project:** Dr. B. R. Ambedkar Digital Heritage Archive (SIH Problem Statement 26096)  
**Date:** September 25, 2026 | **Classification:** COMPREHENSIVE FORENSIC AUDIT  
**Status:** ACTIVE EXECUTION  

---

## 1. Executive Mission & Audit Mandate

The Dr. B. R. Ambedkar Digital Heritage Archive is documented as feature-complete across Phases 1 through 13. Previous reports document high benchmarks:
- Qwen3-Embedding-0.6B (1024-dimensional normalized dense vectors)
- Qwen3-Reranker-0.6B
- Turso FTS5 / BM25 lexical search
- Hybrid RRF $k=60$ retrieval
- Multilingual query translation
- Grounded RAG with 4-tier XML structured prompt
- OCR, ASR, TTS, audio/video transcription, timeline, knowledge graph, and museum kiosk HAL
- Documented baseline claims: 97.5% Recall@10, 0.684 MRR, 100% cross-lingual Recall@10, 100% citation correctness, 0% unsupported claims, 100% abstention on ungrounded/out-of-domain queries.

**Audit Directive:**
Do not trust documented claims blindly. We must rigorously test, reproduce, and verify every claim against the actual runtime code, benchmark files, database records, file systems, and hardware behavior.

---

## 2. Areas to Inspect (35 Core Dimensions)

1. **Frontend Application:** Next.js 14/15 App Router, React Server Components, hydration integrity, dead links, route correctness, responsive layout, modal z-index/anchoring, voice recording, TTS playback, and WebSocket/SSE connectivity.
2. **Backend Services & API Contracts:** FastAPI routes, Pydantic schemas vs TypeScript interfaces, request/response validation, error masking, exception swallowing, rate limiting, and session lifecycle.
3. **Database & Persistence:** Turso Cloud (libSQL), SQLite FTS5 index, foreign keys, transaction rollbacks, orphan chunks, and connection pooling.
4. **Local Storage & Cache:** Master archival facsimiles, `vector_cache.npz`, IIIF manifests, thumbnail caches, and memory-mapped file descriptors.
5. **AI / ML Models & Device Placement:** Exact model weights, revisions, CUDA / RTX 4050 Laptop GPU placement vs silent CPU fallback, VRAM footprint ($\le 6\text{ GB}$ limit), and batch sizes.
6. **Dense Embeddings & Reranking:** 1024-dim normalization, pooling strategy, truncation length (512 vs 8192 tokens), instruction prefix formatting, and reranker score calibration.
7. **RAG Orchestration & Zero-Hallucination Guardrails:** Prompt structure, context assembly, candidate chunk leakage, post-synthesis verification, cross-encoder threshold ($0.20$), and mandatory abstention.
8. **Forensic Citation Integrity:** Tracing Answer Claim $\to$ Retrieved Chunk $\to$ Document Record $\to$ Physical Page Number $\to$ Original Facsimile File.
9. **Prompt Injection & Security Red-Team:** Untrusted document content attacks (`ignore instructions`, `reveal system prompt`), directory traversal (`../../`), unauthorized admin endpoints, and CORS origins.
10. **Multilingual Cross-Lingual Search:** 5 Indic scripts (English, Hindi, Bengali, Gujarati, Tamil), translation fidelity, and language detection errors.
11. **OCR & Historical Typography:** Character Error Rate (CER), Word Error Rate (WER), 1920s Gujarati letterpress typography degradation, broken ligatures, and ALTO XML bounding boxes.
12. **Audiovisual Sync & ASR:** Timestamp alignment on BBC 1931 and AIR 1950 recordings, speaker identity verification (no voice-based assumptions), and second-level URL deep-linking.
13. **Knowledge Graph Provenance:** Master entity registry, 1,480+ relation triples, confidence scores, and distinguishing source-verified from derived relations.
14. **Hardware Abstraction Layer (HAL) & Kiosk:** 10-peripheral capability matrix, physical vs simulated drivers, offline sync manifest, touch targets ($\ge 80\text{px}$), and kiosk lockdown.
15. **Code Cleanliness & Hardcoding:** Repository-wide audit for IP addresses, URLs, credentials, tokens, demo users, hardcoded answers, and static mock branches.

---

## 3. Forensic Test & Verification Strategy

### 3.1 Automated Test Execution
- Run standard pytest suite: `backend/tests/` (134 baseline tests).
- Run Phase 13 comprehensive validation script: `scripts/phase13_final_validation_suite.py` (20 tests).
- Run benchmark evaluation suite: `scripts/run_evaluation_suite.py` across all 7 benchmark datasets in `datasets/`.
- Run data leakage checker: `scripts/data_leakage_checker.py`.

### 3.2 Dynamic Runtime Verification
- Execute actual HTTP requests against active FastAPI backend (`http://127.0.0.1:8000`) and Next.js frontend (`http://localhost:3000`).
- Measure real latencies using microsecond-precision timers.
- Check GPU device placement and VRAM allocation via `torch.cuda.memory_allocated()` and `torch.cuda.max_memory_allocated()`.
- Trace network calls to ensure third-party inference endpoints (Groq, Gemini) have working fallbacks and safe backoff.

### 3.3 Adversarial Red-Team Probing
- Test fictional historical inquiries (e.g. Abraham Lincoln, Bitcoin in 1923, social media in 1949).
- Test prompt injection vectors embedded in user queries and simulated archival passages.
- Test path traversal attempts against document streaming endpoints.
- Test unauthenticated requests against `/api/v1/admin/*` and `/api/v1/hardware/*`.

---

## 4. Hardcode Detection Strategy

Perform systematic grep scans across `.py`, `.ts`, `.tsx`, `.json`, `.sql`, `.sh`, `.env`:
1. **Network & Hostnames:** `localhost`, `127.0.0.1`, fixed ports (`8000`, `3000`, `8001`, `8002`), fixed domains.
2. **Secrets & Credentials:** Hardcoded tokens, API keys (`gsk_`, `AIza`, `Bearer`), private keys.
3. **Paths:** Absolute Windows paths (`C:\`, `C:/`), user profile directories (`C:\Users\Lenovo`).
4. **Mock / Fake Patterns:** `mock`, `dummy`, `fake`, `placeholder`, `sample`, `test response`, `hardcoded answer`.
5. **Fixed Hardware / Sensor Values:** Hardcoded temperature, humidity, RFID tags, printer status.

Every finding will be classified into:
- `SAFE CONSTANT`
- `CONFIGURATION`
- `ENVIRONMENT DEPENDENCY`
- `PRODUCTION BUG`
- `DEMO-ONLY LOGIC`
- `SECURITY RISK`
- `DATA INTEGRITY RISK`

---

## 5. AI / ML & Training Readiness Strategy

For each AI/ML component (OCR, Embedding, Reranker, Translation, ASR, Generator, KG):
1. **Identify Baseline Performance:** Measure on real dataset benchmarks.
2. **Observe Failure Modes:** Identify repeatably failing cases.
3. **Diagnose Root Cause:** Is it model capacity, token truncation, poor prompt, bad preprocessing, or data noise?
4. **Evaluate Fix Options:** Can preprocessing, retrieval, prompt design, or curator review resolve it without fine-tuning?
5. **Assess Training Readiness:** If fine-tuning is proposed, evaluate dataset size, split cleanliness, leakage risk, GPU compute budget, and expected gain.
6. **Classify Action:** `TRAIN NOW`, `EXPERIMENT FIRST`, `DO NOT TRAIN`, or `BLOCKED BY DATA`.

---

## 6. Expected Deliverables & Reports

Upon completion of this forensic audit, the following reports will be authored:
1. `FORENSIC_AUDIT_REPORT.md`: Comprehensive findings across all 35 dimensions with bug counts, security issues, and architecture assessment.
2. `CRITICAL_ISSUES.md`: Prioritized P0/P1 issues with root causes, reproduction steps, impact, and proposed fixes.
3. `AI_ML_AUDIT_REPORT.md`: Deep dive into model stack, actual versions, device placement, latency, grounding, and citation forensics.
4. `HARDCODE_AUDIT_REPORT.md`: Granular classification of every hardcoded constant, URL, path, and credential.
5. `TRAINING_READINESS_REPORT.md`: Subsystem-by-subsystem evaluation of whether fine-tuning or larger models are justified.
6. `REMEDIATION_ROADMAP.md`: Structured plan categorized into "Must Fix Before Demo", "Should Fix Before Submission", "Can Fix Later", and "Do Not Touch".

---

## 7. Execution Timeline & Gates

- **Phase A:** Repository Inspection & Baseline Benchmark Reproduction (Steps 1–2, 4–8)
- **Phase B:** Codebase Deep Bug Hunt & Hardcode Scan (Section 1–3)
- **Phase C:** AI/ML, Citation, and RAG Adversarial Audit (Section 10–19)
- **Phase D:** Security, Data Integrity, and Hardware HAL Audit (Section 6–9, 21–25)
- **Phase E:** Synthesis, Report Authoring & Explicit Answers (Section 30–35)
