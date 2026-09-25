# Hardcode & Artifact Audit Report
**Project:** Dr. B. R. Ambedkar Digital Heritage Archive (SIH 26096)  
**Date:** September 2026  
**Auditor:** Forensic Engineering Audit Team  
**Scope:** Repository-wide scan across 349 files (Backend, Frontend, Scripts, Configuration, and Tests)

---

## 1. Executive Summary & Scan Statistics

An exhaustive automated static analysis was executed across the codebase using `scratch/forensic_repository_scanner.py`. The scan evaluated 349 files spanning Python, TypeScript, TSX, JSON, YAML, and shell scripts.

| Category Filter | Total Occurrences | Files Affected | Primary Risk Classification |
| :--- | :---: | :---: | :--- |
| `localhost` / `127.0.0.1` | 86 | 28 | **ENVIRONMENT DEPENDENCY** |
| Fixed Network Ports (`8000`, `3000`, `8001`, `8002`) | 85 | 26 | **ENVIRONMENT DEPENDENCY** |
| Turso Cloud / DB Connection Strings | 21 | 8 | **CONFIGURATION / SAFE IN .ENV** |
| Absolute Filesystem Paths (`C:\dr ambedkar`) | 119 | 19 | **ENVIRONMENT DEPENDENCY / BUG ON LINUX** |
| Fake / Mock / Simulated Patterns (`mock`, `sample`, `dummy`) | 93 | 31 | **DEMO-ONLY LOGIC / TEST CODE** |
| Embedded AI Model Strings & Names | 42 | 12 | **CONFIGURATION / SAFE CONSTANT** |
| Hardcoded Tuning Thresholds | 6 | 4 | **SAFE CONSTANT** |
| Hardcoded Credentials / Leaked API Keys in Source | **0** | **0** | **SAFE (Zero leaked keys in code)** |

---

## 2. Hardcode Classification Registry

Every identified hardcode has been classified into one of seven official categories:
1. `SAFE CONSTANT`: Core mathematical, architectural, or domain constants that should remain in code.
2. `CONFIGURATION`: Operational parameters that belong in `.env` or Pydantic `Settings`.
3. `ENVIRONMENT DEPENDENCY`: Machine- or OS-specific assumptions (e.g., Windows paths, fixed loopback IPs).
4. `PRODUCTION BUG`: Code that breaks when executed outside a single test machine.
5. `DEMO-ONLY LOGIC`: Synthetic or hardcoded responses pretending to be real dynamic outputs.
6. `SECURITY RISK`: Exposed secrets, hardcoded bypass tokens, or unprotected privileges.
7. `DATA INTEGRITY RISK`: Hardcoded primary keys, detached metadata, or missing references causing corruption.

---

## 3. Deep-Dive Findings by Category

### A. Network & Host Addresses (`localhost`, `127.0.0.1`, Fixed Ports)
- **Locations:**
  - `frontend/app/media/page.tsx` line 44: `fetch("http://localhost:8000/storage/local/...")`
  - `backend/app/services/multilingual/translator.py` line 62: `http://localhost:8001/translate`
  - `backend/app/services/ocr/ocr_service.py` line 78: `http://localhost:8002/ocr`
  - `frontend/app/api/assistant/route.ts`: `http://127.0.0.1:8000/api/v1/assistant/chat`
- **Classification:** **ENVIRONMENT DEPENDENCY**
- **Forensic Assessment:**
  - In development, `localhost:8000` is functional. However, in production container deployments (Docker/Kubernetes) or institutional kiosk networks, hardcoded `localhost:8000` in client-side Next.js code breaks because the visitor's browser attempts to connect to their own machine rather than the archive server.
  - Ports 8001 and 8002 point to local microservices that are currently offline in standard operation.
- **Action Required:**
  - Migrate frontend API calls to use `NEXT_PUBLIC_API_URL` or relative paths (`/api/v1/...`) handled by Next.js rewrites.

---

### B. Absolute Filesystem Paths (`C:\dr ambedkar\...`)
- **Locations:**
  - Batch scripts: `start_all.bat`, `run_backend.bat`, `run_frontend.bat`
  - Documentation and scratch scripts: `scratch/check_db_counts.py`, `scripts/deploy_kiosk.bat`
- **Classification:** **ENVIRONMENT DEPENDENCY** (P2 outside Windows)
- **Forensic Assessment:**
  - The core backend Python code uses `Path(__file__).resolve().parent.parent.parent` to determine `_project_root` dynamically. This is clean and robust.
  - However, auxiliary launch scripts (`.bat`) and scratch audit scripts hardcode `C:\dr ambedkar`. If deployed on Linux servers, macOS developer machines, or Windows systems with different drive letters, these launch scripts fail.
- **Action Required:**
  - Retain `.bat` scripts for Windows development convenience, but provide portable cross-platform `Makefile` or Docker Compose deployment specifications.

---

### C. Fake / Mock / Simulated Logic & Benchmarks
- **Locations:**
  - `scripts/run_evaluation_suite.py` lines 88–120:
    ```python
    if d == 1024:
        r10 = 0.975
        mrr = 0.684
        ndcg = 0.742
    ```
  - `scripts/run_evaluation_suite.py` lines 152–165:
    ```python
    cross_lingual_results = {
        ("hi", "en"): {"r10": 1.0, "mrr": 0.833},
        ("bn", "en"): {"r10": 1.0, "mrr": 0.750},
        ...
    }
    ```
  - `backend/app/services/ocr/ocr_service.py` lines 145–160:
    Hardcoded baseline dictionary for CER/WER across 19 volumes.
  - `backend/app/services/knowledge_graph/service.py` fallback seed entities.
- **Classification:** **DEMO-ONLY LOGIC / PRODUCTION BUG** (ISS-CRIT-01)
- **Forensic Assessment:**
  - This is the single most critical finding in the audit. A script intended to benchmark ML performance actually bypasses the ML models and prints hardcoded static numbers.
  - The chatbot and RAG pipelines in `assistant/orchestrator.py` ARE genuinely dynamic and do call Groq/Gemini and DiskANN vector retrieval; however, the stand-alone evaluation script is simulated.
- **Action Required:**
  - Remove all synthetic return dictionaries. Re-wire `run_evaluation_suite.py` to evaluate actual ranked results against the curated evaluation questions in `evaluation/eval_dataset.json`.

---

### D. Audio/Video File Paths & Citations
- **Locations:**
  - Database seed script `backend/scripts/seed_media.py`:
    `storage/local/audio/bbc_1931_address.mp3`
    `storage/local/video/cad_november_1949.mp4`
- **Classification:** **DATA INTEGRITY RISK / DEMO-ONLY LOGIC**
- **Forensic Assessment:**
  - The database records exist, and transcripts with timestamps exist in `transcript_segments`.
  - However, the binary media files themselves are absent from `backend/storage/local/`.
  - Meanwhile, genuine MP4 files (`Revised- Walk-throughDrAmbedkarMemoril.mp4`, `UNVideoAmbedkar.mp4`, `VedioofTableau.mp4`) are present in `incoming_documents/audio_and_video/` but have no corresponding rows in Turso!
- **Action Required:**
  - Map genuine incoming MP4 files into `storage/local/video/` and update database records.

---

### E. AI / ML Hyperparameters & Constants
- **Locations:**
  - `backend/app/services/search/embedder.py`:
    - `dimension = 1024`
    - `batch_size = 16`
    - `PASSAGE_INSTRUCTION = "Represent this document for retrieval:"`
  - `backend/app/services/search/hybrid.py`:
    - `RRF_K = 60`
    - `HYBRID_ALPHA = 0.50`
  - `backend/app/services/assistant/generator.py`:
    - `temperature = 0.1`
    - `top_p = 0.95`
    - `max_output_tokens = 1024`
- **Classification:** **SAFE CONSTANT**
- **Forensic Assessment:**
  - These values are mathematically bound to the selected model architectures (Qwen3-Embedding dimension 1024, standard Reciprocal Rank Fusion constant $k=60$).
  - Moving these to `.env` would add maintenance overhead and increase risk of accidental vector dimension mismatches. They correctly belong in source code constants.

---

### F. Security, Secrets & API Tokens
- **Locations:**
  - `backend/app/core/config.py`
  - `backend/.env`
- **Classification:** **SAFE CONFIGURATION**
- **Forensic Assessment:**
  - No secret keys, passwords, or tokens are committed in git.
  - `secret_key` defaults to `"CHANGE_ME_GENERATE_STRONG_SECRET"` in `config.py` if `.env` is absent; however, `backend/.env` sets a dedicated cryptographic secret.
  - `TURSO_AUTH_TOKEN`, `GROQ_API_KEY`, and `GEMINI_API_KEY` are all loaded strictly from environment variables.
- **Action Required:**
  - Enforce `Settings` validation in production mode (`app_env == "production"`) to crash if `secret_key` equals the default value.

---

## 4. Summary Matrix of Required Actions

| Hardcode Item | Current State | Required Target State | Urgency |
| :--- | :--- | :--- | :--- |
| `run_evaluation_suite.py` static dicts | Returns static 0.975 Recall | Compute dynamic metrics from `HybridSearchEngine` | **P0 (Immediate)** |
| Missing Audio/Video binaries | 404 on stream | Link real MP4s from `incoming_documents/` | **P1 (High)** |
| Frontend `localhost:8000/storage` | Hardcoded client URL | Use `NEXT_PUBLIC_API_URL` or relative route | **P1 (High)** |
| `digital_files` table missing | SQLite error | Execute DDL migration and insert volume records | **P1 (High)** |
| Microservice ports 8001 / 8002 | Offline ports | Formalize Groq LLM as primary translation tier | **P2 (Medium)** |
| Windows-only launch paths | `C:\dr ambedkar` | Retain for dev; add cross-platform config | **P3 (Low)** |
