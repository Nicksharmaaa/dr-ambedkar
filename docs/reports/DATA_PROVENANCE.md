# DATA PROVENANCE & FIXITY ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System — Phase 11 (ML & Dataset Engineering)
**Standard:** PREMIS 3.0 + Dublin Core | **Database:** Turso Cloud (`libsql-client`)

---

## 1. Archival Source Immutability Axiom

All primary documents in:
```
C:\dr ambedkar\incoming_documents\books_and_writings\
```
are **authoritative archival source material**. Under zero operational conditions does the system rename, move, delete, overwrite, normalize, or preprocess these files in place.

Every source file is cataloged in the `work_manifests` table with:
- `archival_id`: Immutable system identifier (e.g. `DOC-EN-A1B2C3D4`, `DOC-HI-E5F6G7H8`).
- `relative_path`: Path relative to the source repository.
- `filename`: Original historical filename.
- `sha256`: Cryptographic checksum calculated via 1MB buffer streaming.
- `mime_type`: Content type derived from magic byte headers.
- `file_size_bytes`: Exact byte size.
- `ingested_at`: UTC timestamp of registration.
- `text_authority`: Strict provenance label.

---

## 2. Text Authority Hierarchy

To ensure scholarly and legal integrity, textual representations are classified into distinct authority tiers:

| Authority Level | Source Material | Modification Permitted? | Archival Role |
|---|---|---|---|
| `SOURCE_TEXT` | English DJVU text extractions (`.txt`) | Technical normalization only (UTF-8, NFC) | Authoritative source text |
| `NATIVE_PDF_TEXT` | Born-digital selectable text in PDFs | No | Authoritative native digital text |
| `OCR_UNREVIEWED` | Initial OCR extractions from scanned PDFs | No (Immutable algorithmic output) | Machine derivative layer |
| `OCR_REVIEWED` | Human archivist corrected OCR text | Yes (Audited curator corrections) | Verified derivative layer |
| `TRANSLATION` | Machine-translated cross-lingual text | Derivative only (SHA-256 keyed cache) | Accessibility layer |
| `AI_GENERATED` | Neural summaries, explanations, TTS | Synthetic derivative | Educational assistance |

---

## 3. Preservation Audit & Fixity Verification

1. **Fixity Checking:**
   The `preservation_events` table logs all fixity checks and ingestion audits. If a file's SHA-256 hash diverges upon periodic scanning, a `FIXITY_CHECK_FAILED` event is triggered and processing is halted.
2. **Derivative Independence:**
   Derived products (chunks, embeddings, translations, alignments, narration audio) maintain explicit foreign key links to `work_manifests(archival_id)`. If an archivist marks a document status as revised or corrupted, all associated derivative caches are immediately invalidated without altering the original binary file.

---

## 4. Machine Learning Dataset Provenance (Phase 11)

In strict accordance with Phase 11 Mandates (Sections 4, 5, 6), datasets used for benchmarking and training must adhere to unambiguous source categories:

| Category | Description | Modifiability | Citation Rule |
|---|---|---|---|
| `SOURCE_CORPUS` | Original physical PDF scans, primary BAWS TXT files, authentic historical audio/video | **IMMUTABLE** | Highest Primary Source Citation |
| `CURATOR_VERIFIED` | Transcriptions, entity relations, and parallel alignments verified double-blind by scholars | **IMMUTABLE** | Verifiable Ground Truth Citation |
| `DERIVED_DATASET` | Algorithmic outputs (embeddings, FTS tokens, chunk splits) | Versioned | Derived / Ephemeral |
| `SYNTHETIC_DATASET` | Machine-generated questions/hypotheses (strictly traceable to underlying chunk IDs) | Versioned | **NEVER Ground Truth** |
| `TRAINING_DATA` | Controlled samples assigned to model parameter adaptation | Versioned | Partitioned from Test |
| `VALIDATION_DATA` | Development evaluation split for hyperparameter tuning | Versioned | Partitioned from Test |
| `TEST_DATA` | Strictly isolated, frozen out-of-sample benchmark | **FROZEN** | Standard Evaluation Metric |

Every versioned dataset manifest in `datasets/*.json` records:
`dataset_id`, `dataset_version`, `category`, `source_document_ids`, `source_hashes`, `creation_method`, `split`, `created_at`.

---

## 5. Work-Level Isolation Invariant (Anti-Leakage Guarantee)

To prevent data contamination in a multilingual archive containing parallel translations:
1. **Work Invariance:** All language editions, facsimile scans, and derived QA pairs belonging to a single canonical work (e.g., *Annihilation of Caste*) are strictly locked into a single split.
2. **Frozen Test Split:** *Annihilation of Caste* and *Constituent Assembly Debates* are exclusively allocated to `test`.
3. **Leakage Verification:** The automated checker (`scripts/data_leakage_checker.py`) confirms that cross-split document overlap, translation overlap, and lexical contamination across Train, Val, and Test splits is strictly **0.0%**.

