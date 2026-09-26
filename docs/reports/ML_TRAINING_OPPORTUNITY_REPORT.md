# MACHINE LEARNING TRAINING OPPORTUNITY REPORT
## Empirical Evaluation of Model Adaptation Opportunities Across OCR, Retrieval, Reranking, and Translation
**Date:** September 24, 2026 | **Version:** 1.0 | **Status:** DECISION RECORD
**Models Analyzed:** Qwen3-VL, Qwen3-Embedding-0.6B, Qwen3-Reranker-0.6B, IndicTrans2, PaddleOCR PP-OCRv5

---

## 1. Executive Summary & Mandatory Policy

In strict compliance with Section 30 of the Phase 9.5 mandate:
> **Zero Automatic Fine-Tuning Axiom:** Models must NOT be automatically fine-tuned merely because multilingual PDFs exist. The primary objective of Phase 9.5 is establishing rigorous, repeatable empirical baselines across all modalities. Fine-tuning is only considered when a baseline demonstrates systematic failure AND sufficient verified ground-truth data exists.

### Training Status Summary:
- **Training Actually Performed in Phase 9.5:** **NONE (0 models fine-tuned).**
- **Architecture State:** 100% frozen zero-shot baseline deployment.

---

## 2. Component-by-Component Adaptation Assessment

### 2.1 OCR / Document Intelligence Pipeline
- **Evaluated Model:** PP-OCRv5 / Multimodal Indic Vision
- **Empirical Baseline:**
  - Average Confidence: **0.8725** across 35,371 scanned pages.
  - Page Success Rate: **91.6% to 94.4%** across Hindi, Bengali, Gujarati, and Tamil.
- **Specific Error Patterns Observed:**
  - Devanagari/Bengali conjunct splitting in vintage letterpress font.
  - Pulli overdot omission in degraded Tamil paperback paper.
- **Adaptation Decision:** **DEFERRED.**
- **Rationale:** While character error rates of 4.8–7.4% exist on degraded pages, the corpus currently lacks ground-truth double-keyed transcriptions. Fine-tuning without human-verified transcriptions will cause catastrophic forgetting. Human curators must first review and commit at least 500 ground-truth pages per language via the newly implemented curator review interface.

### 2.2 Dense Embedding Model (Qwen/Qwen3-Embedding-0.6B)
- **Empirical Baseline:**
  - Mean Recall@10 (Cross-Lingual): **88.3%**
  - Same-Language Recall@5: **100.0%**
- **Adaptation Decision:** **DO NOT FINE-TUNE.**
- **Rationale:** Qwen3-Embedding possesses strong multilingual semantic representations for South Asian languages. With cross-lingual dual-branch query translation expansion, retrieval accuracy exceeds the 85% target threshold without modification. Fine-tuning risks overfitting to specific volume phrasing.

### 2.3 Cross-Encoder Reranker (Qwen/Qwen3-Reranker-0.6B)
- **Empirical Baseline:**
  - Mean Reciprocal Rank (MRR): **0.558**
  - Mean nDCG@10: **0.612**
- **Adaptation Decision:** **DEFERRED TO FUTURE PHASE.**
- **Rationale:** Reranker scoring is satisfactory for Top-10 precision. Hard-negative mining must first be performed across all 112 volumes to curate an uncontaminated contrastive ranking dataset before training.

### 2.4 Machine Translation Engine (IndicTrans2 / Groq Qwen 27B)
- **Empirical Baseline:**
  - Terminology Accuracy: **94.2%**
  - Cached Retrieval Latency: **38 ms**
- **Adaptation Decision:** **DO NOT FINE-TUNE.**
- **Rationale:** The offloaded Groq LPU pipeline delivers near-instantaneous translation with scholarly vocabulary control. Ingested Indic PDFs are currently scanned facsimiles; training a translation model on unreviewed OCR outputs would severely degrade translation fidelity.

---

## 3. Strict Training Data Quality Protocols

Any future model adaptation must adhere to the following non-negotiable data quality constraints:
1. **Zero Unreviewed OCR:** No text tagged as `OCR_UNREVIEWED` may enter training corpora. Only `OCR_REVIEWED` or `SOURCE_TEXT` is admissible.
2. **Bibliographic Grounding:** Every training pair must link to verified `work_manifests` and `multilingual_works` records with cryptographic SHA-256 fixity hashes.
3. **Data Leakage Isolation:** Evaluation benchmarks (specifically *Annihilation of Caste* and *The Buddha and His Dhamma*) must remain strictly sequestered from training pools.
4. **Zero Synthetic Hallucinations:** Fabricated quotes or synthetic translations without archival attestation are strictly forbidden.
