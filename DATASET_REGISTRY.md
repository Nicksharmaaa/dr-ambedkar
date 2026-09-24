# DATASET REGISTRY
## Phase 11: Machine Learning & Scientific Evaluation Dataset Catalog
**Date:** September 24, 2026 | **Version:** 1.0.0 | **Status:** APPROVED & FROZEN  
**Corpus Authority:** Dr. B.R. Ambedkar Complete Works (BAWS English TXT, Hindi/Bengali/Gujarati/Tamil PDFs, Audio/Video Recordings)

---

### 1. Data Categorization & Preservation Hierarchy

In strict compliance with Phase 11 Mandates (Sections 4, 5, 6), datasets are strictly categorized:

| Category | Definition | Modifiable? | Ground Truth Authority |
|---|---|---|---|
| `SOURCE_CORPUS` | Original physical PDF scans, primary TXT files, original audio/video | **IMMUTABLE** | Highest Archival Authority |
| `CURATOR_VERIFIED` | Transcriptions, alignments, entities, and citations manually verified by domain scholars | **IMMUTABLE** | High Historical Authority |
| `DERIVED_DATASET` | Algorithmic extractions (embeddings, FTS tokens, chunk splits) | Versioned | Derived / Ephemeral |
| `SYNTHETIC_DATASET` | Machine-generated questions/hypotheses (traceable to source chunks) | Versioned | **NEVER Ground Truth** |
| `TRAINING_DATA` | Controlled samples assigned to model parameter adaptation | Versioned | Partitioned from Test |
| `VALIDATION_DATA` | Development evaluation split for hyperparameter tuning | Versioned | Partitioned from Test |
| `TEST_DATA` | Strictly isolated, frozen out-of-sample benchmark | **FROZEN** | Standard Evaluation Metric |

---

### 2. Active Versioned Datasets

All dataset manifests are serialized in `datasets/` with complete provenance hashes, source IDs, and work-group isolation.

| Dataset Identifier | Version | Category | Split | Language Coverage | Total Items | Primary Source Documents | Purpose |
|---|---|---|---|---|---|---|---|
| `ambedkar_retrieval_benchmark` | `1.0.0` | `TEST_DATA` | **TEST** | Multilingual (`en`, `hi`, `bn`, `gu`, `ta`) | 12 | `AMBEDKAR-VOL-01`, `AMBEDKAR-VOL-02`, `AMBEDKAR-VOL-13`, `hindi_dummy14_pdf` | Benchmark Recall@5, Recall@10, MRR, nDCG across monolingual and cross-lingual queries with hard negatives. |
| `ambedkar_rag_abstention_benchmark` | `1.0.0` | `TEST_DATA` | **TEST** | Multilingual (`en`, `hi`, `bn`, `ta`) | 10 | `AMBEDKAR-VOL-01`, `AMBEDKAR-VOL-13` | Evaluate factual groundedness, exact citation accuracy, and mandatory zero-hallucination abstention. |
| `ambedkar_claim_entailment_benchmark` | `1.0.0` | `TEST_DATA` | **TEST** | English (`en`) | 4 | `AMBEDKAR-VOL-01`, `AMBEDKAR-VOL-13` | Measure atomic claim validation against archival source passages (`SUPPORTED`, `UNSUPPORTED`, `CONFLICTING`). |
| `ambedkar_ocr_groundtruth_benchmark` | `1.0.0` | `CURATOR_VERIFIED` | **TEST** | Multilingual (`en`, `hi`, `bn`, `gu`, `ta`) | 5 | `AMBEDKAR-VOL-01`, `hindi_dummy14_pdf`, `bengali_vol_01`, `gujarati_vol_01`, `tamil_vol_01` | Measure CER, WER, and confidence across Devanagari, Bengali, Gujarati, Tamil, and Latin scripts. |
| `ambedkar_translation_aligned_benchmark` | `1.0.0` | `CURATOR_VERIFIED` | **TEST** | Multilingual (`en`, `hi`, `ta`, `bn`, `gu`) | 5 | `AMBEDKAR-VOL-01`, `AMBEDKAR-VOL-13` | Evaluate IndicTrans2 and Groq translation fidelity on verified parallel philosophical and legal passages. |
| `ambedkar_kg_entity_benchmark` | `1.0.0` | `CURATOR_VERIFIED` | **TEST** | English (`en`) | 8 | `AMBEDKAR-VOL-01`, `AMBEDKAR-VOL-13` | Evaluate precision, recall, and F1 across People, Places, Works, Events, and Concepts in the Knowledge Graph. |
| `ambedkar_asr_eval_benchmark` | `1.0.0` | `CURATOR_VERIFIED` | **TEST** | English (`en`) | 3 | `video-cad-1949`, `track-bbc-1931` | Measure Whisper Large v3 WER/CER and timestamp seek accuracy on archival historical speech. |

---

### 3. Work-Group Splitting Policy (Anti-Leakage Guarantee)

In accordance with Phase 11 Mandate Section 7:
1. **Work Isolation:** All multi-lingual translations and editions of a canonical work share the exact same split assignment.
2. **Test Splitting:** *Annihilation of Caste* and *Constituent Assembly Debates* are exclusively in `test`.
3. **Train Splitting:** *Who Were the Shudras?*, *The Untouchables*, *The Problem of the Rupee*, and *Pakistan or the Partition of India* are designated for adapter training experiments.
4. **Validation Splitting:** *The Buddha and His Dhamma* is designated for validation tuning.

Manifest files are stored locally in `c:\dr ambedkar\datasets\`. Large raw blobs remain outside Git in local preservation storage.
