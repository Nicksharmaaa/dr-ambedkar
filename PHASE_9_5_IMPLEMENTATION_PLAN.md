# PHASE 9.5 IMPLEMENTATION PLAN
## Multilingual Books & Writings Corpus Ingestion, Reconciliation, OCR, Alignment and Cross-Lingual Retrieval Preparation

**Status:** APPROVED FOR EXECUTION  
**Author:** AI Agentic Architecture Team  
**Scope:** `c:\dr ambedkar\incoming_documents\books_and_writings\`  
**Target Languages:** English (`en`), Hindi (`hi`), Bengali (`bn`), Gujarati (`gu`), Tamil (`ta`)  
**Database:** Turso Cloud (`libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io`)

---

## 1. Executive Summary & Core Principles

Phase 9.5 operationalizes the multilingual **Books & Writings** collection of Dr. B.R. Ambedkar. The collection spans 112 documents: 19 clean English text volumes (BAWS) and 93 scanned PDF editions in Bengali, Gujarati, Hindi, and Tamil, comprising over 35,000 scanned archival facsimile pages.

### Architectural Invariance Axioms
1. **Source Immutability:** Original files in `incoming_documents\books_and_writings\` are strictly read-only. They will never be moved, renamed, deleted, modified, or preprocessed in place.
2. **Text Authority Separation:** Derivative text representations are strictly isolated and assigned authoritative provenance labels:
   - `SOURCE_TEXT`: English original text layer.
   - `NATIVE_PDF_TEXT`: Born-digital selectable text from PDFs (0 pages in current corpus).
   - `OCR_UNREVIEWED`: Initial OCR extraction from scanned facsimiles.
   - `OCR_REVIEWED`: Human-verified and corrected OCR transcriptions.
   - `TRANSLATION`: Derived cross-lingual translation layer.
   - `AI_GENERATED`: Synthetic explanations and summaries (never archival source).
3. **No Blind Translation Assumptions:** Matching filenames or volume numbers do NOT imply identical content. Relationships (`same_work`, `translation_of`, `edition_of`) must be backed by verifiable bibliographic and textual evidence. Page numbers do not correspond 1:1 across language editions.
4. **Baseline First — Zero Automatic Fine-Tuning:** In strict accordance with project rules, models will not be fine-tuned in this phase. The objective is to establish robust empirical baselines for OCR, retrieval, and alignment.

---

## 2. Corpus Inventory & Format Breakdown

A complete recursive scan of `incoming_documents\books_and_writings\` reveals:

| Language Folder | File Count | Format | Total Size (MB) | Total Pages | Nature of Pages |
|---|---|---|---|---|---|
| `English` | 19 | `.txt` | 27.26 MB | 12,154 (est.) | Born-digital / DjVu text extraction (`SOURCE_TEXT`) |
| `bengali` | 14 | `.pdf` | 143.03 MB | 4,863 | 100% Scanned image facsimiles (`SCANNED`) |
| `gujrati` | 9 | `.pdf` | 91.02 MB | 3,353 | 100% Scanned image facsimiles (`SCANNED`) |
| `hindi` | 39 | `.pdf` | 444.62 MB | 14,431 | 100% Scanned image facsimiles (`SCANNED`) |
| `tamil` | 31 | `.pdf` | 439.44 MB | 12,724 | 100% Scanned image facsimiles (`SCANNED`) |
| **Total** | **112** | **TXT/PDF** | **1,145.37 MB** | **35,371** (scanned) | **Pure Scanned Facsimiles + Clean English TXT** |

Deliverables:
- [`MULTILINGUAL_BOOKS_WRITINGS_INVENTORY.md`](file:///c:/dr%20ambedkar/MULTILINGUAL_BOOKS_WRITINGS_INVENTORY.md)
- [`multilingual_books_writings_manifest.json`](file:///c:/dr%20ambedkar/multilingual_books_writings_manifest.json)

---

## 3. Pipeline Architecture & Execution Steps

### Step 1: Ingestion & Metadata Manifestation
- Stream compute cryptographic SHA-256 fixity hashes for all 112 files.
- Record file size, MIME type (`text/plain`, `application/pdf`), page counts, and storage locations.
- Verify folder candidate language against content scripts:
  - English: ASCII / Latin-1 script
  - Bengali: Bengali script (`\u0980-\u09FF`)
  - Gujarati: Gujarati script (`\u0A80-\u0AFF`)
  - Hindi: Devanagari script (`\u0900-\u097F`)
  - Tamil: Tamil script (`\u0B80-\u0BFF`)
- Detect any `LANGUAGE_CONFLICT` if detected script disagrees with folder name.

### Step 2: Source Format Processing
1. **English TXT (`SOURCE_TEXT`):**
   - No OCR.
   - Encoding detection and Unicode normalization (NFC).
   - Clean line endings and structure preservation.
   - Structure parser: extract Chapters, Sections, Headings, Paragraphs, Footnotes.
   - Structure-aware chunking (512 token target, 64 token overlap).
   - Existing 12,154 chunks and Qwen3 embeddings in Turso Cloud remain authoritative.
2. **Scanned PDFs (Hindi, Bengali, Gujarati, Tamil):**
   - Extract page dimensions and DPI via PyMuPDF.
   - Classify as `SCANNED` (0 native text pages detected).
   - Document intelligence & OCR pipeline extracts page text, bounding boxes, reading order, and confidence scores.
   - Output stored as `OCR_UNREVIEWED`.
   - Curator review interface records `OCR_REVIEWED` corrections without overwriting raw OCR.

### Step 3: Same-Work Model & Translation Relationship Discovery
Implement relational mapping in Turso database:
- `WORK`: Abstract creative work (e.g. *Annihilation of Caste*, *Who Were the Shudras?*, *The Buddha and His Dhamma*, *Castes in India*).
- `EDITION`: Specific publication edition (e.g. Maharashtra Govt BAWS 1st Edition, Ambedkar Foundation Hindi Sampurna Vangmaya).
- `LANGUAGE_VERSION`: Specific linguistic manifestation.
- `TRANSLATION`: Explicit translator attribution and translation relationship.
- `DOCUMENT`: Physical digital asset (TXT file or PDF file).
- Relationship types: `same_work`, `edition_of`, `translation_of`, `related_work` with statuses:
  - `CANDIDATE`
  - `VERIFIED`
  - `REJECTED`

### Step 4: Cross-Language Alignment Engine
- Alignment hierarchy: Work → Section → Paragraph → Page.
- Build `work_alignments` table in Turso:
  - `id`: UUIDv4
  - `source_chunk_id`: English source chunk FK
  - `target_chunk_id`: Indic translated chunk FK
  - `work_id`: Canonical Work FK
  - `alignment_method`: `TITLE_MATCH`, `SECTION_STRUCTURE`, `SEMANTIC_SIMILARITY`, `MANUAL_CURATION`
  - `alignment_score`: Float (0.0 to 1.0)
  - `alignment_status`: `CANDIDATE`, `VERIFIED`, `REJECTED`, `NEEDS_REVIEW`
- Strict rule: Never assume page alignment equivalence across languages.

### Step 5: Embeddings & Vector Indexing
- Generate 1024-dimensional dense vectors using resident `Qwen/Qwen3-Embedding-0.6B`.
- Index multilingual chunks into Turso Cloud `embeddings` table and FTS5 lexical index.
- Metadata: `document_id`, `page_id`, `chunk_id`, `language`, `embedding_model`, `dimension`, `content_hash`.

### Step 6: Multilingual Cross-Lingual Hybrid Retrieval & Reranking
- Same-language retrieval: En→En, Hi→Hi, Bn→Bn, Gu→Gu, Ta→Ta.
- Cross-language retrieval: Hi→En, Ta→En, Gu→En, Bn→En, En→Hi, En→Ta, En→Gu, En→Bn.
- Dual-branch query expansion with RRF merging (k=60) and Qwen3-Reranker-0.6B cross-encoder scoring.
- Measure and document baselines: Recall@5, Recall@10, MRR, nDCG in [`MULTILINGUAL_RETRIEVAL_BASELINE.md`](file:///c:/dr%20ambedkar/MULTILINGUAL_RETRIEVAL_BASELINE.md).

### Step 7: Multilingual Evidence-Based RAG
- Enable multilingual question answering where:
  - Question language = Hindi / Tamil / Bengali / Gujarati
  - Evidence language = English / Hindi / etc.
  - Answer language = Question language
- Explicit provenance formatting:
  ```text
  Evidence Language: English
  Answer Language: Hindi
  Source Document: AMBEDKAR-VOL-01 (Castes in India)
  Page: 14
  Authority: SOURCE_TEXT
  ```
- Strict zero-hallucination policy.

### Step 8: Dataset Preparation & ML Opportunities Analysis
- Establish two isolated datasets:
  - `EVALUATION_DATASET`: Uncontaminated benchmark questions, positive passage pairs, and hard negatives generated from actual archival corpus.
  - `TRAINING_CANDIDATE_DATASET`: Clean, verified parallel segments suitable for future fine-tuning.
- Data leakage prevention: Work-level splits (no cross-contamination between train and evaluation sets).
- Create `ML_TRAINING_OPPORTUNITY_REPORT.md` analyzing whether to fine-tune OCR, Reranker, or IndicTrans2 in future phases.

### Step 9: Corpus Dashboard & Frontend Integration
- Build a dedicated `/corpus` dashboard displaying:
  - Document & page counts by language.
  - Scanned vs digital breakdowns.
  - OCR confidence distributions.
  - Candidate vs verified translation pairs.
  - Aligned segment counts.
- Add language filters to Search UI (`English`, `Hindi`, `Bengali`, `Gujarati`, `Tamil`) and Original/Translation toggles.
- Add Multilingual Edition comparison to the Document Viewer.

---

## 4. Database Schema Migration (006)

Create `backend/app/db/migrations/006_phase9_5_multilingual_corpus.sql` adding:
1. `multilingual_works`: Canonical master works.
2. `work_manifests`: Per-file archival catalog and fixity logs.
3. `work_relationships`: Relationships between works and documents (`translation_of`, `edition_of`).
4. `work_alignments`: Segment-level cross-lingual alignments.
5. `ocr_pages`: Page-level OCR text, bounding boxes, confidence, and authority labels.
6. `eval_dataset_items`: Benchmark query-passage pairs and hard negatives.

---

## 5. Verification & Testing Plan
- Test inventory generation and fixity checks across all 112 files.
- Test language detection and conflict flagging.
- Test PDF analysis (scanned vs native text).
- Test work relationship linking and alignment heuristics.
- Test hybrid search with language filters across all 5 languages.
- Test cross-lingual retrieval and reranking.
- Test multilingual RAG generation and citation attribution.
- Test dashboard API and frontend rendering.
- Verify zero regression on Phase 8 and Phase 9 features.
