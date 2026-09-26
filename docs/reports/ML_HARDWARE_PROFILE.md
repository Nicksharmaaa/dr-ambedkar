# Machine Learning Hardware Profile & Execution Feasibility Audit
## Ambedkar Heritage Intelligence & Digital Preservation System — Phase 11
**Audit Date:** September 24, 2026 | **Operating System:** Windows 11 Home (Build 26200) | **Python:** 3.14.5

---

## 1. Physical Hardware Specifications

| Component | Specification | Operational Status |
| :--- | :--- | :--- |
| **CPU** | Intel / AMD 10 Physical Cores / 16 Logical Threads | Healthy, high multicore parallel throughput |
| **System RAM** | 15.8 GB Total (~1.4 GB Currently Available / Unreserved) | Constrained; heavy processes must guard against OOM |
| **Primary GPU** | NVIDIA GeForce RTX 4050 Laptop GPU (Ada Lovelace) | Active, CUDA Compute Capability 8.9 |
| **VRAM Total** | 6,141 MiB (6.0 GB GDDR6) | ~3.2 GB Free unallocated VRAM |
| **CUDA Runtime** | CUDA 12.8 / 13.3 Display Driver 610.62 | Active and verified via PyTorch 2.11.0+cu128 |
| **Disk Storage** | 374.7 GB Total SSD · 79.2 GB Free | Adequate for evaluation datasets and small checkpoints |

---

## 2. Software & ML Environment Inventory

| Package | Version | Status | Purpose in Phase 11 |
| :--- | :--- | :--- | :--- |
| **Python** | `3.14.5` (CPython 64-bit) | Active Runtime | Core system runtime |
| **PyTorch** | `2.11.0+cu128` | CUDA Enabled | Tensor operations, local neural inference & adapters |
| **Transformers** | `5.17.0` | Active | Model architectures, tokenization, config pipelines |
| **Sentence-Transformers** | `6.1.0` | Active | Dense bi-encoder embeddings & cross-encoder reranking |
| **Scikit-Learn** | `1.9.1` | Active | Ranking evaluation, clustering, leakage analysis |
| **SciPy** | `1.18.1` | Active | Scientific metrics, statistical tests |
| **NumPy** | `2.4.4` | Active | Vector cache manipulation, distance computations |
| **Httpx** | `0.28.1` | Active | High-speed async client for Groq LPU & Turso HTTP |
| **Turso / libSQL** | `libsql-client` (Cloud) | Connected | Primary archival metadata & vector database |
| **Groq LPU Engine** | Remote API | Connected | Sub-second generative inference (`qwen3.8-27b`, `gpt-oss-20b`) |

---

## 3. Workload Feasibility Matrix: Local vs. Cloud Architecture

In strict adherence to Phase 11 Rule 34 (*GPU Memory Management*) and Rule 2 (*Hardware Audit*):

| ML Task / Subsystem | Model / Candidate | Local Feasibility | Decision & Strategy |
| :--- | :--- | :--- | :--- |
| **Embedding Inference** | `Qwen/Qwen3-Embedding-0.6B` | **FEASIBLE (GPU)** | In-process GPU inference (~800 MB VRAM) with local NumPy caching |
| **Embedding Dimension Adaptation** | MRL / Dimension Truncation (512 vs 768 vs 1024) | **FEASIBLE (GPU/CPU)** | Empirical evaluation across archival corpus; choose optimal trade-off |
| **Embedding Adapter / Head Training** | Dense Projection Adapter (<5M params) | **FEASIBLE (GPU)** | Local training with batch size 16–32 on RTX 4050 |
| **Full 0.6B Bi-Encoder Fine-Tuning** | `Qwen3-Embedding-0.6B` (Full AdamW) | **LOCAL NOT FEASIBLE** | Requires 8–10 GB VRAM with optimizer states. Prepare cloud script. |
| **Reranker Inference** | `Qwen/Qwen3-Reranker-0.6B` | **FEASIBLE (GPU)** | In-process GPU cross-encoder (~800 MB VRAM) |
| **Reranker Adaptation** | Cross-Encoder Hard-Negative Tuning | **FEASIBLE (Adapter/CPU/GPU)** | Light contrastive adapter on real archival hard negatives |
| **Archival OCR Inference** | PP-OCRv5 + Vision-Language Engine | **FEASIBLE (CPU/GPU)** | Non-destructive page evaluation across En, Hi, Bn, Gu, Ta |
| **Full OCR Foundation Pre-training** | Large Vision-Language Pre-training | **NOT JUSTIFIED / PROHIBITED** | Prohibited by Phase 11 rules; baseline accuracy exceeds 92% |
| **Generative LLM Synthesis** | `qwen/qwen3.8-27b` / `openai/gpt-oss-20b` | **FEASIBLE (Groq LPU)** | Zero-VRAM offloading via Groq API (<2s latency) |
| **Full 27B Generative Fine-Tuning** | `Qwen 27B` Full Training | **LOCAL NOT FEASIBLE** | Requires multi-A100 GPU cluster. Not justified under Rule 21. |
| **ASR Inference & Evaluation** | `whisper-large-v3-turbo` | **FEASIBLE (LPU/Local)** | Cloud LPU / local review pipeline on verified audio assets |

---

## 4. Hardware Safety Constraints Enforced
1. **VRAM Safety Threshold**: Local operations must not allocate more than 4.0 GB VRAM concurrently (preserving 2.0 GB for OS window manager and display drivers).
2. **RAM Safety Guard**: In-memory dataset loaders must use streaming generators or chunked iteration to avoid exhausting the 1.4 GB available RAM headroom.
3. **No Phantom Downloads**: Large multi-gigabyte foundation model weights must not be downloaded automatically.
