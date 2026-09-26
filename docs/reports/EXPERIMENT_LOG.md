# EXPERIMENT LOG
## Phase 11: Machine Learning & Scientific Evaluation Experiment Ledger
**Date:** September 24, 2026 | **Version:** 1.0.0 | **Tracking Authority:** Phase 11 Scientific Committee

---

### Ledger of Controlled Experiments

---

#### Experiment 1: MRL Embedding Dimension Truncation
- **Experiment ID:** `EXP-P11-DIM-001`
- **Date:** September 24, 2026
- **Hypothesis:** Truncating Qwen3 embeddings from 1024 to 768 or 512 dimensions via Matryoshka Representation Learning (MRL) will reduce vector index storage by 25–50% with negligible (<2%) loss in Recall@10.
- **Dataset:** `ambedkar_retrieval_benchmark_v1.0.0.json` (Split: `test`)
- **Model:** `Qwen/Qwen3-Embedding-0.6B`
- **Model Version:** `v1.0`
- **Hardware:** RTX 4050 Laptop GPU (6.0 GB VRAM)
- **Parameters:** Dimensions: `[1024, 768, 512]`, Metric: Cosine Similarity, Normalization: L2
- **Baseline (1024-dim):** Recall@10 = 0.975, MRR = 0.684, Index Size (100k chunks) = 390.6 MB
- **Result:**
  - 768-dim: Recall@10 = 0.967 (-0.8%), MRR = 0.671, Index Size = 293.0 MB (-25.0%)
  - 512-dim: Recall@10 = 0.942 (-3.3%), MRR = 0.638, Index Size = 195.3 MB (-50.0%)
- **Decision:** **KEEP (RETAIN 1024-DIM BASELINE)**. 1024-dim index fits comfortably inside local RAM/Turso storage and preserves critical nuances between distinct legal and historical concepts.

---

#### Experiment 2: Cross-Encoder Reranking Discrimination
- **Experiment ID:** `EXP-P11-RERANK-002`
- **Date:** September 24, 2026
- **Hypothesis:** Applying cross-encoder joint attention (`Qwen/Qwen3-Reranker-0.6B`) over raw hybrid candidate passages will filter corpus-mined hard negatives and boost MRR by >15%.
- **Dataset:** `ambedkar_retrieval_benchmark_v1.0.0.json` (Split: `test`)
- **Model:** `Qwen/Qwen3-Reranker-0.6B`
- **Model Version:** `v1.0`
- **Hardware:** RTX 4050 Laptop GPU (6.0 GB VRAM, ~800 MB allocated)
- **Parameters:** Candidates: Top-50 RRF, Batch Size: 8, FP16
- **Baseline (Bi-Encoder / RRF):** MRR = 0.540, Recall@10 = 0.950, Hard-Negative Logit Diff = 0.240
- **Result:** MRR = 0.684 (+26.67% relative gain), Recall@10 = 0.975, Hard-Negative Separation Gap = 0.812 (Positive 0.884 vs Hard Negative 0.072), Latency = 28.4 ms / pair.
- **Decision:** **KEEP (RETAIN BASELINE RERANKER)**. Baseline zero-shot cross-encoder exceeds all performance thresholds without needing adapter adaptation.

---

#### Experiment 3: Multilingual OCR Adaptation Necessity Test
- **Experiment ID:** `EXP-P11-OCR-003`
- **Date:** September 24, 2026
- **Hypothesis:** Vintage letterpress Devanagari, Bengali, Gujarati, and Tamil scans will exhibit systematic recognition failures (CER > 10%) that necessitate parameter-efficient OCR fine-tuning.
- **Dataset:** `ambedkar_ocr_groundtruth_benchmark_v1.0.0.json` (Split: `test`, 1,430 audited facsimile pages)
- **Model:** Multimodal Indic Vision + PaddleOCR PP-OCRv5
- **Model Version:** `v5.0-indic`
- **Hardware:** Intel/AMD 16-thread CPU + RTX 4050 (1.2 GB VRAM)
- **Parameters:** 300 DPI Rendering, Deskew Angle Classification: ON, Polygon Text Detection
- **Baseline:** CER = 0.68% (Macro avg), Confidence = 0.903, Clean Recognition Pages = 94.2%
- **Result:** Hindi CER = 1.35%, Bengali CER = 2.08%, Gujarati CER = 0.00%, Tamil CER = 0.00%, English CER = 0.00%. No catastrophic systematic errors detected. Residual ambiguities are easily reviewed via the Curator Review UI (`POST /api/v1/ocr/review`).
- **Decision:** **REJECT ADAPTATION (KEEP BASELINE)**. Fine-tuning a vision-language model is scientifically unjustified given the low baseline error rate (<2.1% max).

---

#### Experiment 4: Cross-Lingual Dual-Branch Query Expansion vs Direct Embedding
- **Experiment ID:** `EXP-P11-CROSS-004`
- **Date:** September 24, 2026
- **Hypothesis:** Executing dual-branch RRF search (original Indic script branch + normalized English translated branch) will outperform direct zero-shot cross-lingual vector search by >10% Recall@10.
- **Dataset:** `ambedkar_retrieval_benchmark_v1.0.0.json` (Split: `test`, 5 Indic languages)
- **Model:** Groq Qwen-27B Normalizer + Turso Hybrid RRF
- **Hardware:** RTX 4050 (Dense branch) + Turso FTS5 (Lexical branch) + Groq LPU (Normalization)
- **Baseline (Direct Cross-Lingual Embedding):** Recall@10 = 0.862, MRR = 0.540
- **Result:** Recall@10 = 0.965 (+11.9% gain), MRR = 0.667 (+23.5% gain), Latency = 752 ms.
- **Decision:** **KEEP (RETAIN DUAL-BRANCH RRF BASELINE)**.

---

#### Experiment 5: Out-of-Domain Zero-Hallucination Abstention
- **Experiment ID:** `EXP-P11-RAG-005`
- **Date:** September 24, 2026
- **Hypothesis:** Strict prompt isolation with negative evidentiary constraints will achieve 100% abstention on unanswerable/out-of-domain historical queries without fine-tuning the base LLM.
- **Dataset:** `ambedkar_rag_abstention_benchmark_v1.0.0.json` (Split: `test`, 10 answerable/unanswerable queries)
- **Model:** Qwen-27B Scholarly RAG Engine
- **Hardware:** Groq Cloud LPU
- **Parameters:** Temperature = 0.1, Grounding Policy = Strict Archival Attribution
- **Baseline:** Unanswerable inquiries historically risk conversational hallucination without system prompts.
- **Result:** Abstention Rate = 4 / 4 (100.0%), Citation Accuracy = 6 / 6 (100.0%), Hallucination Rate = 0.0%, Unsupported Claims = 0.0%.
- **Decision:** **KEEP (RETAIN BASELINE RAG ARCHITECTURE)**. Fine-tuning the generator is rejected.

---

### Summary of Decisions
- **Total Experiments Conducted:** 5
- **Experiments Promoted:** 0 (Baseline met or exceeded all targets)
- **Experiments Retained as Baseline:** 5
- **Experiments Rejected for Fine-Tuning:** 5 (Fine-tuning unnecessary or local training not feasible)
