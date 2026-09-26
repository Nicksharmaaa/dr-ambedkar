# RISK REGISTER
## Ambedkar Heritage Intelligence & Digital Preservation System

**Version**: 2.0.0
**Date**: 2026-09-22
**Review Frequency**: Per Phase

---

## Risk Matrix

| ID | Title | Likelihood | Impact | Severity | Status |
|---|---|---|---|---|---|
| R001 | libsql Rust build blocked on Windows | Confirmed | High | HIGH | MITIGATED |
| R002 | Python 3.14 AI library gaps | Likely | High | HIGH | MANAGED |
| R003 | VRAM exhaustion (6 GB ceiling) | Likely | High | HIGH | ARCHITECTURE MITIGATED |
| R004 | PaddleOCR Python 3.14 incompatible | Confirmed | High | HIGH | MANAGED |
| R005 | Indic model NeMo dependency fragility | Possible | High | MEDIUM-HIGH | OPEN |
| R006 | AI hallucination / fabrication | Likely (w/o mitigation) | Critical | CRITICAL | ARCHITECTURE MITIGATED |
| R007 | Turso vector performance ceiling | Possible | Medium | MEDIUM | MONITORED |
| R008 | Docker daemon not running | Current State | Medium | MEDIUM | MANAGED |
| R009 | Source documents not provided | Current State | Critical | HIGH | ACTION REQUIRED |
| R010 | OCR quality on historical scripts | Possible | High | MEDIUM-HIGH | OPEN |
| R011 | Turso Cloud connectivity for prod | Possible | Medium | MEDIUM | OPEN |
| R012 | libsql-client async API instability | Possible | Medium | MEDIUM | MONITORED |

---

## Detailed Risk Entries

---

**R001** — libsql Rust Build Blocked on Windows
| Field | Value |
|---|---|
| **Status** | MITIGATED |
| **Description** | `libsql` 0.1.11 requires Rust/maturin to build. No pre-built Windows wheel. Rust not installed. Build hangs. |
| **Mitigation** | Use `libsql-client` 0.3.1 (pure Python, no Rust, async). Same Turso API surface. |
| **Residual Risk** | `libsql-client` is deprecated in favour of `libsql`; may receive fewer updates |
| **Contingency** | Install Rust + build `libsql` if `libsql-client` proves insufficient; or use Turso HTTP API directly via httpx |

---

**R002** — Python 3.14 AI Library Compatibility Gaps
| Field | Value |
|---|---|
| **Status** | MANAGED |
| **Description** | Python 3.14 is very new. Some AI libraries (PaddleOCR, NeMo) do not support 3.14. `pkg_resources` removed in 3.12+ affects older packages. |
| **Mitigation** | Three isolated venvs: Python 3.14 (main), Python 3.12 (OCR), Python 3.10 (Indic). |
| **Residual Risk** | Even Python 3.12 venv may have gaps; monitor per-package |
| **Contingency** | Use Python 3.11 venv if 3.12 has issues |

---

**R003** — VRAM Exhaustion (6 GB Ceiling)
| Field | Value |
|---|---|
| **Status** | ARCHITECTURE MITIGATED |
| **Description** | 6 GB VRAM. Multiple AI models cannot be loaded simultaneously. Desktop apps consume ~1.5 GB. |
| **Mitigation** | ModelManager with LRU eviction. Always-resident: embedding (0.8 GB). On-demand: others. INT4 quantization. API fallback when VRAM < threshold. |
| **Residual Risk** | Model swap latency (3–10s); degrade UX for concurrent multimodal requests |
| **Contingency** | Route all generation to cloud API. Disable VL model in EDGE profile. |

---

**R004** — PaddleOCR Incompatible with Python 3.14
| Field | Value |
|---|---|
| **Status** | MANAGED |
| **Description** | PaddleOCR officially supports Python 3.11–3.13. Python 3.14 wheels not available for PaddlePaddle-GPU. |
| **Mitigation** | Dedicated venv-ocr at Python 3.12. OCR runs as separate FastAPI microservice on port 8002. |
| **Residual Risk** | Microservice adds latency; additional process to manage |
| **Contingency** | Tesseract 5 CPU fallback if PaddleOCR fails to install |

---

**R005** — Indic Model NeMo Dependency Fragility
| Field | Value |
|---|---|
| **Status** | OPEN |
| **Description** | IndicConformer requires NeMo. NeMo has deep dependency chains. PyTorch 2.11 may conflict with older pytorch-lightning versions. |
| **Mitigation** | Dedicated venv-indic at Python 3.10. NeMo installation attempted in Phase 2. Fallback to Whisper for ASR if NeMo fails. |
| **Residual Risk** | NeMo install may fail; 3-6 hours of dependency resolution |
| **Contingency** | Whisper (ASR), NLLB (translation), Coqui (TTS) as full Indic fallback stack |

---

**R006** — AI Hallucination / Fabrication (CRITICAL)
| Field | Value |
|---|---|
| **Status** | ARCHITECTURE MITIGATED |
| **Description** | LLMs will invent Ambedkar quotes, dates, citations if not constrained. Institutionally catastrophic. |
| **Mitigation** | 1. All generation must receive retrieved chunks as context. 2. Prompt strictly instructs: answer ONLY from provided context. 3. Response object includes mandatory `source_chunk_ids`. 4. UI shows sources alongside every AI response. 5. "Insufficient evidence" response when retrieval confidence < threshold. 6. Human review before publishing AI content. |
| **Residual Risk** | Sophisticated hallucination within retrieved context; requires human oversight |
| **Contingency** | Disable generation; show only retrieved documents. |

---

**R007** — Turso Vector Performance Ceiling
| Field | Value |
|---|---|
| **Status** | MONITORED |
| **Description** | Turso vector search performance unknown at hackathon corpus size (50K+ vectors). DiskANN I/O may bottleneck. |
| **Mitigation** | Measure ANN search latency in Phase 2 with real embeddings. Use `halfvec` (F16) if memory is tight. |
| **Residual Risk** | Latency > 2s for large corpus |
| **Contingency** | VectorStore abstraction allows dropping in sqlite-vec or Qdrant without changing API layer |

---

**R008** — Docker Daemon Not Running
| Field | Value |
|---|---|
| **Status** | MANAGED |
| **Description** | Docker Desktop installed but daemon stopped. Container-based services cannot start. |
| **Mitigation** | Start Docker Desktop manually before Phase 2. Document as Phase 2 prerequisite. Services run natively for now. |
| **Contingency** | All services designed to run natively (no container dependency for dev) |

---

**R009** — Source Documents Not Yet Provided
| Field | Value |
|---|---|
| **Status** | ACTION REQUIRED |
| **Description** | No Ambedkar documents have been provided. System has no corpus. Cannot test OCR, embedding, or RAG. |
| **Impact** | Cannot validate any AI feature without documents |
| **Action** | Team must provide source documents before Phase 2 OCR baseline |
| **Contingency** | Use publicly available Ambedkar writings (public domain) as placeholder corpus for technical testing |

---

**R010** — OCR Quality on Historical Devanagari Scripts
| Field | Value |
|---|---|
| **Status** | OPEN |
| **Description** | Historical manuscripts, degraded documents, mixed-script pages may produce poor OCR. Devanagari ligatures are challenging. |
| **Mitigation** | PP-OCRv5 trained for Devanagari. Confidence scoring per block. Low-confidence pages flagged for human review. Manual correction UI in admin. |
| **Contingency** | Human transcription workflow for critical documents |

---

**R011** — Turso Cloud Connectivity for Production
| Field | Value |
|---|---|
| **Status** | OPEN |
| **Description** | Production deployment requires Turso Cloud account and valid auth token. No Turso account created yet. |
| **Mitigation** | Dev uses local SQLite file (same libSQL API). Production migration requires only URL + token change. |
| **Contingency** | Self-hosted libSQL server (sqld) as alternative to Turso Cloud |

---

**R012** — libsql-client Async API Stability
| Field | Value |
|---|---|
| **Status** | MONITORED |
| **Description** | `libsql-client` 0.3.1 is marked as deprecated upstream. May receive fewer security fixes. |
| **Mitigation** | DatabaseClient abstraction means we can swap client without changing business logic. |
| **Contingency** | Implement TursoHTTPClient using httpx + Turso HTTP API directly |

---

## Action Items Before Phase 2

| # | Action | Owner | Priority |
|---|---|---|---|
| A1 | Provide Ambedkar source documents | Team | CRITICAL |
| A2 | Create Python 3.12 venv-ocr + install PaddleOCR | Engineer | HIGH |
| A3 | Create Python 3.10 venv-indic + attempt NeMo install | Engineer | HIGH |
| A4 | Start Docker Desktop daemon | Engineer | MEDIUM |
| A5 | Install `libsql-client` in venv-main | Engineer | HIGH |
| A6 | Install FastAPI + core deps in venv-main | Engineer | HIGH |
| A7 | Create Turso account (for production target) | Team | MEDIUM |
