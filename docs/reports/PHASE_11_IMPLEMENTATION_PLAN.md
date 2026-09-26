# Phase 11 Implementation Plan: Machine Learning, Model Adaptation, Dataset Engineering & Scientific Evaluation

**Phase:** 11  
**Project:** Dr. B.R. Ambedkar Heritage Intelligence & Digital Preservation System  
**Date:** September 24, 2026  
**Status:** APPROVED FOR EXECUTION  

---

## 1. Principles & Hard Invariants

1. **Evidence-First Rule**: Training datasets may ONLY derive from the project's supplied archival corpus, curator-verified OCR, verified metadata, and historical recordings. No arbitrary internet scraping, external corpora mixing, or synthetic hallucination.
2. **Scientific Baseline Rule**: No component may be fine-tuned or adapted until its baseline has been empirically frozen, measured, and documented with standardized metrics (CER/WER, Recall@K, MRR, nDCG, Faithfulness).
3. **No Unjustified Training**: We will not fine-tune models merely to claim "we trained our own AI". If a zero-shot or hybrid baseline meets requirements, we explicitly document: `"NO MODEL TRAINING WAS PROMOTED BECAUSE THE BASELINE MET OR EXCEEDED THE REQUIRED TARGETS."`
4. **Data Leakage Immunity**: Translations of the same work (*Annihilation of Caste* in English, Hindi, Tamil, Gujarati) share identical semantic content. Splitting MUST occur at the **Work-Level** or **Document-Group-Level**, never at random chunk level.
5. **Hardware Honesty**: The local machine has an NVIDIA RTX 4050 Laptop GPU (6.0 GB VRAM, ~3.2 GB free) and ~1.4 GB free RAM. If any full-parameter experiment is not feasible locally without OOM, we explicitly document: `"LOCAL TRAINING NOT FEASIBLE"` and supply reproducible cloud configurations.
6. **Turso Preservation**: Turso Cloud remains the operational relational/vector database. Large checkpoints and raw training datasets are versioned as local disk artifacts under `datasets/` and `experiments/`, never dumped into Turso tables.

---

## 2. Seven-Stage Execution Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: BASELINE FREEZING                                             │
│ Create BASELINE_MODEL_MANIFEST.json & BASELINE_RESULTS.md             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ STAGE 2: DATASET ENGINEERING & LEAKAGE CHECKER                         │
│ Build versioned datasets (SOURCE_CORPUS, CURATOR_VERIFIED, TEST_DATA) │
│ Implement & execute DATA_LEAKAGE_CHECKER (Work-Level splits)          │
│ Create DATASET_REGISTRY.md & DATA_LEAKAGE_REPORT.md                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ STAGE 3: SUBSYSTEM BASELINE EVALUATION & BOTTLENECK DETECTION          │
│ • OCR Evaluation (En, Hi, Bn, Gu, Ta) → OCR_EVALUATION_REPORT.md       │
│ • Retrieval Evaluation (Dense vs Lexical vs Hybrid)                    │
│ • Embedding Dimension Experiment (512 vs 768 vs 1024)                  │
│ • Cross-Language Retrieval Matrix (En ↔ Hi, Bn, Gu, Ta)                │
│ • Reranker Evaluation with hard negatives                              │
│ • Indic Translation Evaluation (aligned sample)                        │
│ • Grounded RAG, Claim Validation & Abstention Accuracy                 │
│ • Knowledge Graph Entity & Relation Resolution                         │
│ • Spoken Media ASR & Timestamped Retrieval                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ STAGE 4: CONTROLLED ADAPTATION EXPERIMENTS                             │
│ Execute only where bottleneck is empirically demonstrated:             │
│ • Experiment 1: Embedding Dimension Selection (MRL Truncation)         │
│ • Experiment 2: Contrastive Retrieval Adapter (Dense Projection)        │
│ • Experiment 3: Reranker Hard-Negative Scoring Calibration             │
│ • Experiment 4: Multi-Tier Claim Validation & Abstention Tuning         │
│ Document in EXPERIMENT_LOG.md & TRAINING_REPORT.md                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ STAGE 5: SCIENTIFIC HEAD-TO-HEAD COMPARISON                            │
│ Evaluate adapted candidates against identical frozen baseline splits   │
│ Generate delta metrics (Δ Recall@K, Δ MRR, Δ Latency, Δ VRAM)          │
│ Make PROMOTE or REJECT decisions → MODEL_PROMOTION_REPORT.md          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ STAGE 6: UNIFIED EVALUATION SUITE                                      │
│ Create single automated CLI command: scripts/run_evaluation_suite.py   │
│ Output machine-readable JSON & all 15 required Markdown reports        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ STAGE 7: FINAL WRAP-UP & COMPLETION REPORT                             │
│ Author PHASE_11_COMPLETION_REPORT.md answering all 18 prompt questions │
│ Verify STOP rule: DO NOT START PHASE 12                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Subsystem Evaluation Matrix

| Subsystem | Baseline Model | Evaluation Dataset | Primary Metrics | Decision Criteria for Adaptation |
| :--- | :--- | :--- | :--- | :--- |
| **OCR** | PP-OCRv5 + Multimodal Indic | 93 PDF sample pages across En, Hi, Bn, Gu, Ta | CER, WER, confidence, layout order | Baseline CER < 8% across scripts $\to$ KEEP. Only adapt if systematic ligature failure proven. |
| **Embeddings** | `Qwen3-Embedding-0.6B` | Archival passage pairs (En, Hi, Bn, Gu, Ta) | Recall@5, Recall@10, MRR, nDCG@10 | Test 512 vs 768 vs 1024 dims. Choose smallest dimension with $\ge 95\%$ relative performance. |
| **Cross-Lingual** | Groq Query Translation + Qwen3 RRF | 5x5 Language Matrix (En, Hi, Bn, Gu, Ta) | Cross-lingual Recall@10, MRR | If cross-lingual Recall@10 $\ge 85\%$ $\to$ KEEP. Otherwise tune translation expansion. |
| **Reranker** | `Qwen3-Reranker-0.6B` | Hard-negative triplets from BAWS volumes | nDCG@10 delta, MRR, latency | Compare re-ranking gain over raw RRF. If gain $>15\%$ with $<100\text{ms}$ latency $\to$ PROMOTE. |
| **Translation** | Groq Qwen 27B / IndicTrans2 | Verified aligned sample of historical speeches | BLEU/ChrF, Terminology consistency | If legal/constitutional terminology accuracy $>90\%$ $\to$ KEEP baseline. |
| **Grounded RAG** | Groq Qwen 27B RAG | 40 Archival test queries (answerable + unanswerable) | Faithfulness, Citation accuracy, Abstention accuracy | Under Rule 21: DO NOT fine-tune general LLM. RAG prompt isolation provides zero hallucination. |
| **Claim Validator**| Rule-based + Cross-encoder | 50 Audited claims (Supported, Partial, Unsupported) | Precision, Recall, F1 on claim audit | Verify claim status matches archival citation ground truth. |
| **Knowledge Graph**| Phase 8 Resolution Engine | Curated archival entities (People, Works, Events) | Precision, Recall, F1 | Resolution accuracy $>90\%$ across 18 entity types. |
| **ASR Media** | Whisper Large v3 Turbo | Archival recordings (`track-bbc-1931`, `video-cad-1949`)| WER on verified audio, seek precision | Verified transcript seek accuracy $= 100\%$. |

---

## 4. Deliverable Documentation Artifacts
The following reports will be created in this phase:
1. `ML_HARDWARE_PROFILE.md` (Already created)
2. `PHASE_11_IMPLEMENTATION_PLAN.md` (This document)
3. `BASELINE_MODEL_MANIFEST.json`
4. `BASELINE_RESULTS.md`
5. `DATASET_REGISTRY.md`
6. `DATA_LEAKAGE_REPORT.md`
7. `OCR_EVALUATION_REPORT.md`
8. `RETRIEVAL_EVALUATION_REPORT.md`
9. `CROSS_LANGUAGE_RETRIEVAL_REPORT.md`
10. `RERANKER_EVALUATION_REPORT.md`
11. `TRANSLATION_EVALUATION_REPORT.md`
12. `ASR_EVALUATION_REPORT.md`
13. `RAG_EVALUATION_REPORT.md`
14. `KNOWLEDGE_GRAPH_EVALUATION.md`
15. `TRAINING_REPORT.md`
16. `EXPERIMENT_LOG.md`
17. `MODEL_PROMOTION_REPORT.md`
18. Updated: `MODEL_REGISTRY.md`, `SYSTEM_ARCHITECTURE.md`, `DATA_PROVENANCE.md`
19. Final: `PHASE_11_COMPLETION_REPORT.md`
