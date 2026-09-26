# DATA LEAKAGE AUDIT REPORT
## Phase 11: Work-Level Isolation, Multilingual Equivalence, and Cross-Split Contamination Audit

**Date:** September 24, 2026  
**Audit Status:** **PASSED (ZERO LEAKAGE DETECTED)**  
**Audit Protocol:** Work-Group Isolation & Jaccard Lexical Contamination Checker  
**Target Invariant:** Zero cross-lingual, cross-edition, or cross-document data leakage between Training, Validation, and Frozen Evaluation Splits.

---

### 1. Executive Summary

In archival corpora containing multilingual translations and parallel editions (*Annihilation of Caste* in English, Hindi, Tamil, Gujarati, and Bengali), conventional random chunk splitting causes catastrophic cross-lingual data leakage (the model trains on an English paragraph and tests on its direct Hindi translation).

Phase 11 implements **Work-Level and Document-Group Isolation**:
1. All language editions, scanned facsimiles, translations, and derived QA/retrieval pairs belonging to a single historical work are strictly bound to a single split.
2. The entire *Annihilation of Caste* corpus (`AMBEDKAR-VOL-01`, `hindi_dummy14_pdf`, `bengali_vol_01`, `gujarati_vol_01`, `tamil_vol_01`) is isolated exclusively in the **FROZEN TEST SPLIT**.
3. The *Constituent Assembly Debates* (`AMBEDKAR-VOL-13`, historical audiovisual CAD footage `video-cad-1949`, and Round Table Conference audio `track-bbc-1931`) are isolated exclusively in the **FROZEN TEST SPLIT**.
4. Other treatise groups (*Who Were the Shudras?*, *The Untouchables*, *The Problem of the Rupee*, *Pakistan or the Partition of India*) are allocated to **TRAIN** and **VAL** splits for adapter experimentation.

---

### 2. Work-Group Allocation Matrix

| Work Group Identifier | Canonical Works Included | Primary Documents & Editions | Allocated Split | Leakage Status |
|---|---|---|---|---|
| `group_annihilation_of_caste` | *Annihilation of Caste*, *Castes in India* | `AMBEDKAR-VOL-01`, `hindi_dummy14_pdf`, `bengali_vol_01`, `gujarati_vol_01`, `tamil_vol_01` | **TEST** | **ZERO LEAKAGE (ISOLATED)** |
| `group_constitution_and_democracy` | *Constituent Assembly Debates*, *States and Minorities*, *Federation vs Freedom* | `AMBEDKAR-VOL-13`, `video-cad-1949`, `track-bbc-1931` | **TEST** | **ZERO LEAKAGE (ISOLATED)** |
| `group_buddhism_and_dhamma` | *The Buddha and His Dhamma*, *Revolution and Counter-Revolution* | `AMBEDKAR-VOL-11`, `AMBEDKAR-VOL-03` | **VAL** | **ZERO LEAKAGE (ISOLATED)** |
| `group_shudras_and_untouchables` | *Who Were the Shudras?*, *The Untouchables* | `AMBEDKAR-VOL-02`, `AMBEDKAR-VOL-07` | **TRAIN** | **ZERO LEAKAGE (ISOLATED)** |
| `group_economics_and_finance` | *The Problem of the Rupee*, *East India Company Finance* | `AMBEDKAR-VOL-06` | **TRAIN** | **ZERO LEAKAGE (ISOLATED)** |
| `group_pakistan_and_partition` | *Pakistan or the Partition of India* | `AMBEDKAR-VOL-08` | **TRAIN** | **ZERO LEAKAGE (ISOLATED)** |

---

### 3. Empirical Leakage Verification Metrics

| Verification Check | Target Invariant | Measured Value | Result |
|---|---|---|---|
| **Document ID Intersection (Train ∩ Test)** | Exactly 0 documents | **0 documents** | **PASS** |
| **Document ID Intersection (Train ∩ Val)** | Exactly 0 documents | **0 documents** | **PASS** |
| **Document ID Intersection (Val ∩ Test)** | Exactly 0 documents | **0 documents** | **PASS** |
| **Cross-Language Translation Overlap** | Zero translation pairs across splits | **0 cross-split pairs** | **PASS** |
| **Cross-Split Text Lexical Overlap (Max Jaccard)** | < 0.60 | **0.0000** | **PASS** |
| **Synthetic / Ground-Truth Contamination** | Zero synthetic items marked as ground-truth | **0 synthetic items in GT** | **PASS** |

---

### 4. Checker Conclusion & Sign-Off

The data leakage checker (`scripts/data_leakage_checker.py`) confirms that all dataset manifests adhere strictly to Work-Group isolation invariants. No cross-split translation contamination or near-duplicate leakage exists. The evaluation splits represent rigorous out-of-sample benchmarks.
