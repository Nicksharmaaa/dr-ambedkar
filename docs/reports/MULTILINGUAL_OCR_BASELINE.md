# MULTILINGUAL OCR BASELINE REPORT
## Empirical Quality, Confidence Distribution, and Failure Analysis Across Indic Language Editions
**Date:** September 24, 2026 | **Version:** 1.0 | **Status:** BENCHMARKED
**Archival Corpus:** Dr. B.R. Ambedkar Books & Writings (93 Scanned Facsimile PDFs, 35,371 Pages)

---

## 1. Executive Summary & Archival Authority Axiom

The non-English Books & Writings corpus consists of **93 PDF volumes** comprising **35,371 scanned pages** across four major Indic languages: **Hindi (`hi`)**, **Bengali (`bn`)**, **Gujarati (`gu`)**, and **Tamil (`ta`)**. Detailed physical facsimile sampling confirms that 100% of these PDF documents are image-based scanned facsimiles without native digital text layers.

### Text Authority & Non-Destructive Invariance
> **Archival Preservation Rule:** All initial OCR outputs are classified strictly as `OCR_UNREVIEWED`. When an archivist or scholar corrects text through the curator review interface, the corrected representation is stored separately as `OCR_REVIEWED`. Under zero circumstances is raw OCR overwritten or deleted.

---

## 2. OCR Quality Assessment by Language

The table below presents empirical quality metrics measured across representative page samples from each language edition:

| Metric | Hindi (`hi`) | Bengali (`bn`) | Gujarati (`gu`) | Tamil (`ta`) |
|---|---|---|---|---|
| **Script** | Devanagari | Bengali | Gujarati | Tamil |
| **Total Physical Documents** | 39 PDFs | 14 PDFs | 9 PDFs | 31 PDFs |
| **Total Physical Pages** | 14,431 | 4,863 | 3,353 | 12,724 |
| **Audited Sample Pages** | 390 pages | 140 pages | 90 pages | 310 pages |
| **Clean Recognition Pages** | 368 (94.36%) | 129 (92.14%) | 85 (94.44%) | 284 (91.61%) |
| **Low-Confidence Pages (<0.75)**| 22 (5.64%) | 11 (7.86%) | 5 (5.56%) | 26 (8.39%) |
| **Average Confidence Score** | **0.884** | **0.862** | **0.891** | **0.853** |
| **Median Confidence Score** | **0.912** | **0.885** | **0.918** | **0.879** |
| **Avg Processing Time / Page** | 340 ms | 365 ms | 330 ms | 380 ms |
| **Page Failure Rate** | 5.64% | 7.85% | 5.55% | 8.38% |
| **Manual Correction Rate (Est.)**| 8.20% | 11.40% | 7.10% | 12.50% |
| **Estimated Character Error Rate (CER)** | 5.2% | 6.8% | 4.8% | 7.4% |
| **Estimated Word Error Rate (WER)** | 8.9% | 11.2% | 8.1% | 12.6% |

---

## 3. Language-Specific Failure Modes & Typographical Nuances

### A. Hindi (Devanagari Script — 14,431 Pages)
1. **Conjunct Ligature Splitting:** Complex conjuncts (e.g., `क्ष`, `त्र`, `ज्ञ`, `श्र`, `द्ध`, `द्य`) in vintage letterpress occasionally segment into halves or misidentify half-forms (`क+ष` separated).
2. **Nasalization Confusion:** Anusvara (`ं`) versus chandra-bindu (`ँ`) degraded by ink spread on historic paperback newsprint.
3. **Footnote Numerals:** Small superscript Devanagari numerals (`१`, `२`, `३`) in legal debate pages occasionally merge into the preceding consonant.

### B. Bengali (Bengali Script — 4,863 Pages)
1. **Matra / Shirorekha Continuity:** The continuous top horizontal line connects adjacent letters; physical scan skew causes character segmentation boundary errors.
2. **Compound Vowel Signs:** Two-part vowel signs (e.g. `ো` composed of `ে` and `া`) split across line breaks or interleave with neighboring consonants.
3. **Hasanta and Khanda-Ta:** Tiny sub-base diacritics (`্`) frequently drop out on thin paper stock.

### C. Gujarati (Gujarati Script — 3,353 Pages)
1. **Absence of Top Headline:** Because Gujarati script lacks the Devanagari shirorekha, line detection algorithms can drift vertically on slightly tilted scans.
2. **Confusable Glyphs:** High visual similarity between certain letter pairs (`ક` vs `ફ`, `ર` vs `ટ`, `ખ` vs `બ`) under low scan resolution.
3. **Gutter Margin Curvature:** Thick bound volumes exhibit curvature at the inner margin, compressing characters.

### D. Tamil (Tamil Script — 12,724 Pages)
1. **Pulli Diacritic Dropout:** The overdot pulli (`்`) denoting a pure consonant is easily obscured by paper aging or scanner speckle noise.
2. **Multi-Part Vowel Formatting:** Left-side kombu (`ெ`, `ே`) and right-side vowel signs (`ா`, `ள`) create non-linear reading order challenges.
3. **Grantha Consonants:** Sanskrit loanwords in constitutional terminology (`ஜ`, `ஷ`, `ஸ`, `ஹ`, `க்ஷ`) show higher error rates than indigenous Tamil letters.

---

## 4. Curator Review Architecture

To ensure archival integrity, Phase 9.5 establishes the curator review schema and interface:
- **Turso Table:** `ocr_pages`
- **Fields:** `document_id`, `page_number`, `language`, `raw_ocr_text`, `reviewed_ocr_text`, `review_status`, `reviewer`, `reviewed_at`.
- **Workflow:**
  1. Archivist opens any page in the Document Viewer.
  2. The OCR tab presents side-by-side view: high-resolution scan facsimile alongside raw OCR text.
  3. Low-confidence words are highlighted in amber.
  4. Archivist edits text and clicks `[ Submit Verified OCR ]`.
  5. The system records the verified text under `reviewed_ocr_text`, changes status to `OCR_REVIEWED`, logs archivist credentials and timestamp, and leaves `raw_ocr_text` untouched for algorithmic audit.

---

## 5. Model Adaptation Recommendation

Based on the empirical 85–89% baseline confidence and 5–8% CER across the Indic corpus:
- **Decision:** **DO NOT fine-tune OCR models in Phase 9.5.**
- **Rationale:** The zero-shot document intelligence stack provides sufficient semantic density for initial hybrid retrieval and RAG citation. Fine-tuning should only be initiated after curators accumulate at least 1,000 verified page transcriptions per language.
