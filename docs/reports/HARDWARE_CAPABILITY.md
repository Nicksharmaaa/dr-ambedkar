# HARDWARE CAPABILITY ASSESSMENT
## Ambedkar Heritage Intelligence & Digital Preservation System

**Assessed**: 2026-09-22T21:00:00+05:30
**Machine**: LAPTOP-OOT5E65S
**Status**: VERIFIED

---

## 1. System Specifications

| Component | Verified Value |
|---|---|
| **OS** | Microsoft Windows 11 Home Single Language (Build 10.0.26200) |
| **CPU** | Intel Core i5-13450HX (13th Gen, Raptor Lake-HX) |
| **Logical Cores** | 16 (6P-core + 4E-core architecture) |
| **RAM Total** | 16.9 GB |
| **RAM Available** | 4.2 GB (at inspection; apps running) |
| **GPU** | NVIDIA GeForce RTX 4050 Laptop GPU |
| **GPU Architecture** | Ada Lovelace, Compute Capability 8.9 |
| **VRAM Total** | 6,141 MiB (6 GB) |
| **VRAM Free** | 4,593 MiB (~4.5 GB at inspection) |
| **NVIDIA Driver** | 610.62 |
| **CUDA (PyTorch)** | 12.8 (verified: CUDA available = True) |
| **Disk C: Free** | 113 GB |

---

## 2. Software Environment

| Tool | Version | Status |
|---|---|---|
| Python | 3.14.5 | System (C:\Python314\) |
| pip | 26.2.1 | Installed |
| Node.js | v24.14.1 | Active LTS |
| npm | 11.11.0 | Installed |
| pnpm | 12.5.1 | Installed |
| Git | 2.53.0 | Installed |
| Docker | 29.8.0 | Installed (daemon not running) |
| Docker Compose | v5.5.1 | Installed |
| CUDA toolkit (nvcc) | NOT IN PATH | Driver-only; PyTorch bundled CUDA sufficient |
| Rust/Cargo | NOT INSTALLED | Affects `libsql` pkg build |
| Brave Browser | Installed | Demo/testing |
| Edge Browser | Installed | Demo/testing |

### Pre-installed Python Packages (Relevant)
| Package | Version | Relevance |
|---|---|---|
| torch | 2.11.0+cu128 | GPU-accelerated AI; CUDA 12.8 |
| torchvision | 0.26.0+cu128 | Computer vision |
| torchaudio | 2.11.0+cu128 | Audio processing |
| numpy | 2.4.4 | Numerics |
| opencv-python | 4.13.0.92 | Image processing |
| pillow | 12.2.0 | Image handling |
| scikit-learn | 1.9.1 | ML utilities |
| networkx | 3.7 | Graph algorithms |
| scipy | 1.18.1 | Scientific computing |
| sounddevice | 0.5.5 | Audio I/O |
| psutil | 7.2.2 | System monitoring |
| pytest | 9.1.1 | Testing |
| keras | 3.14.0 | Deep learning |
| mediapipe | 0.10.33 | Vision pipeline |

---

## 3. VRAM Budget Analysis

**Available for AI**: ~4.5 GB (inspection time; 6 GB total minus ~1.5 GB desktop overhead)

| Model | VRAM (Est.) | Mode | Decision |
|---|---|---|---|
| Qwen3-Embedding-0.6B | ~0.8 GB FP16 | Always resident | VIABLE — primary embedding |
| Qwen3-Reranker-0.6B | ~0.8 GB FP16 | On-demand | VIABLE — primary reranker |
| Qwen3-VL-2B (INT4) | ~2.0 GB | On-demand | VIABLE — multimodal/OCR assist |
| PaddleOCR PP-OCRv5 | ~0.5 GB | On-demand | VIABLE — primary OCR |
| IndicTrans2 | ~1.5 GB | On-demand, separate venv | VIABLE with model swapping |
| **Sum (embedding + rerank + VL)** | **~3.6 GB** | Concurrent | FITS in 4.5 GB budget |

---

## 4. Local AI Suitability Matrix

| Workload | Local Viable? | Constraint |
|---|---|---|
| OCR (PaddleOCR PP-OCRv5) | YES | Python 3.12/3.13 venv required |
| Layout analysis (PP-StructureV3) | YES | Same venv as OCR |
| Text embedding (Qwen3-0.6B) | YES | 0.8 GB VRAM |
| Reranking (Qwen3-Reranker-0.6B) | YES | 0.8 GB VRAM |
| VL inference (Qwen3-VL-2B INT4) | YES | ~2 GB VRAM; INT4 required |
| Translation (IndicTrans2) | YES (constrained) | Python 3.10 venv; swap |
| ASR (IndicConformer) | YES (constrained) | Python 3.10 venv; NeMo |
| TTS (IndicF5) | YES (constrained) | Python 3.10 venv |
| LLM generation (>7B) | NO | Exceeds 6 GB VRAM |
| Concurrent all models | NO | Requires model-swap manager |

---

## 5. Infrastructure Gaps

| Gap | Priority | Phase |
|---|---|---|
| Rust not installed (affects `libsql` wheel build) | HIGH | Documented; using `libsql-client` instead |
| Docker daemon not running | MEDIUM | Start Docker Desktop before container use |
| CUDA toolkit (nvcc) not in PATH | LOW | PyTorch bundled CUDA sufficient for inference |
| Python 3.12 venv for OCR not created | HIGH | Phase 2 |
| Python 3.10 venv for Indic models not created | HIGH | Phase 2 |
| FastAPI + core backend not installed | HIGH | Phase 2 |
| transformers/accelerate not installed | HIGH | Phase 2 |

---

## 6. Conclusion

**The machine is fully suitable for this project's development and hackathon demonstration.**

Key capabilities confirmed:
- PyTorch 2.11 with CUDA 12.8 is operational and GPU-verified
- 6 GB VRAM supports: embedding + reranking + small VL model concurrently
- 113 GB disk is adequate for models + document archive
- All required runtimes installed (Python, Node, Git, Docker, pnpm)
- Network is online

Key limitations to manage:
- Model swapping required (cannot load all AI models simultaneously)
- Separate venvs needed for OCR (Python 3.12/3.13) and Indic (Python 3.10)
- Rust not installed — `libsql` (Rust-built) unusable; use `libsql-client` instead
- Docker daemon must be started before container-based services
