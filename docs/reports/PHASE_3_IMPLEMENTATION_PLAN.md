# PHASE 3 IMPLEMENTATION PLAN
## Controlled Archival Ingestion System & Data Checkpoint
### Ambedkar Heritage Intelligence & Digital Preservation System

**Date**: 2026-09-23  
**Status**: APPROVED & READY TO EXECUTE  
**Binding Constitution**: Zero Hallucination, Source Immutability, Strict Metadata Provenance, No Ingestion of Real Ambedkar Data in Phase 3.

---

## 1. Objectives

1. Build a controlled, robust, fault-tolerant archival ingestion pipeline for incoming preservation assets.
2. Establish formal directory structures (`data/inbox/`, `data/raw/`, `data/processed/`, `data/derived/`, `data/manifests/`, `data/evaluation/`, `data/exports/`).
3. Enforce **Source File Immutability**: original files are never altered or overwritten.
4. Extract and calculate cryptographic fixity (SHA-256), MIME type, byte size, page counts (PDF), duration/codecs (audio/video).
5. Detect and handle edge cases without pipeline failure:
   - Exact duplicates (hash matching)
   - Corrupt files (invalid header / unparseable binary)
   - Unsupported file formats
   - Missing metadata (strictly set to `UNKNOWN` and flagged `NEEDS_REVIEW`; zero metadata fabrication)
   - Large files
6. Store metadata and PREMIS events in Turso Cloud; store binary assets locally via `LocalStorageBackend` abstraction (no large binaries in Turso).
7. Implement an Ingestion Dashboard exposing: Total Files, Processed, Pending, Failed, Duplicate, Needs Review.
8. Establish comprehensive test fixtures and automated tests for all 5 edge cases.
9. Formalize `DATA_CHECKPOINT.md` and `data/README.md` and halt with explicit declaration: `DATA CHECKPOINT REACHED. STOP.`

---

## 2. Directory Architecture

```
data/
├── inbox/                        # Monitored staging area for incoming files
│   ├── speeches/
│   ├── writings/
│   ├── debates/
│   ├── manuscripts/
│   ├── photographs/
│   ├── audio/
│   └── video/
├── raw/                          # Immutable raw archive storage copy
├── processed/                    # Normalised & verified ingest assets
├── derived/                      # Generated derivatives (thumbnails, extracts, ALTO XML)
├── manifests/                    # METS, Dublin Core & IIIF manifest files
├── evaluation/                   # Ingestion QA & evaluation benchmark logs
├── exports/                      # AIP / DIP archival dissemination packages
└── README.md                     # Directory guidelines & archival policy
```

---

## 3. Data Checkpoint Policy (`DATA_CHECKPOINT.md`)

- Explicit notification defining `data/inbox/` as the approved drop location for institutional source files.
- Supported file types: `PDF`, `TIFF`, `PNG`, `JPEG`, `WAV`, `MP3`, `MP4`, `MOV`.
- Supported subdirectories: `speeches/`, `writings/`, `debates/`, `manuscripts/`, `photographs/`, `audio/`, `video/`.
- Strict prohibition of file modification.
- Explicit requirement that real Ambedkar data in `incoming_documents` will not be ingested until human checkpoint approval.

---

## 4. Ingestion Engine Implementation

### 4.1 Backend Service: `backend/app/services/ingestion/`
- `analyzer.py`:
  - Format detection via magic bytes and mimetypes (no reliance solely on file extensions).
  - SHA-256 fixity calculation with chunked streaming.
  - PDF integrity check & page count extraction (using `pypdf` or pure-python PDF parser).
  - Audio/Video metadata extraction (using `wave` / `mutagen` / standard library / audio headers).
  - Image integrity check (`PIL` / magic bytes).
  - Duplicate detection against Turso `archival_objects.file_hash` and `files.file_hash`.
  - Metadata validator: enforces `UNKNOWN` for missing values and sets `review_status="needs_review"`. Zero invention.
- `pipeline.py`:
  - Resumable ingestion orchestrator.
  - Generates immutable `archival ID` (`AH-{YYYYMMDD}-{sha256[:8]}`).
  - Copies original file to storage backend (`originals/{object_type}/{object_id}/original.{ext}`).
  - Records object in Turso (`archival_objects`, `files`).
  - Logs `INGEST` event in Turso `preservation_events`.
  - Enqueues downstream tasks in Turso `processing_jobs` (`OCR`, `THUMBNAIL`, `METADATA_EXTRACTION`).
  - Per-file exception isolation: failure on a single file logs error and increments failed counter; does NOT halt pipeline.
- `scanner.py`:
  - Scans `data/inbox/` recursively, processes new files, produces batch ingestion summary report.

### 4.2 API Routes: `backend/app/api/v1/ingestion.py`
- `POST /api/v1/admin/ingest/scan` — trigger inbox scan & ingestion process.
- `POST /api/v1/admin/ingest/file` — upload single file with optional metadata payload.
- `GET /api/v1/admin/ingestion/stats` — metrics: total, processed, pending, failed, duplicate, needs_review.
- `GET /api/v1/admin/ingestion/jobs` — list of recent ingestion processing jobs.

### 4.3 Frontend Ingestion Dashboard:
- Update `frontend/app/admin/page.tsx` with dedicated Ingestion Control Center:
  - Metric counters (Total, Processed, Pending, Failed, Duplicate, Needs Review).
  - Inbox scan trigger button with progress state.
  - Detailed table of ingested files, archival IDs, fixity hashes, and review status badges.
- Update `frontend/lib/api.ts` and `frontend/lib/types.ts` with typed models.

---

## 5. Test Fixtures & Automated Test Suite

### 5.1 Test Fixtures (`backend/tests/fixtures/ingestion/`):
1. `corrupt.pdf` — Invalid/truncated binary payload simulating corrupt PDF.
2. `valid_sample.pdf` & `valid_sample_duplicate.pdf` — Byte-identical PDFs for duplicate detection.
3. `unsupported.exe` / `unsupported.bin` — Binary file in disallowed format.
4. `no_metadata_sample.png` — Valid image with zero descriptive metadata (verifying `UNKNOWN` + `needs_review`).
5. `large_simulated.bin` / `large_sample.pdf` — Safe multi-megabyte simulated file for size and streaming validation.

### 5.2 Automated Pytest Suite (`backend/tests/test_ingestion.py`):
- Test duplicate file rejection/detection.
- Test corrupt PDF detection & error reporting.
- Test unsupported MIME type rejection.
- Test missing metadata fallback (`UNKNOWN` / `needs_review`).
- Test source file immutability (original remains unchanged).
- Test storage abstraction integration (binary in storage, metadata in Turso).
- Test resumable jobs and fault isolation (corrupt file does not abort remaining files).

---

## 6. Execution Phases

1. Create directory structure (`data/inbox/` + subdirectories, `data/raw/`, `data/processed/`, etc.).
2. Write `data/README.md` and `DATA_CHECKPOINT.md`.
3. Implement `backend/app/services/ingestion/` (`analyzer.py`, `pipeline.py`, `scanner.py`).
4. Implement API routes in `backend/app/api/v1/ingestion.py` and mount in `main.py`.
5. Update frontend with Ingestion Dashboard and typed client methods.
6. Create test fixtures in `backend/tests/fixtures/ingestion/`.
7. Write and run comprehensive automated test suite `backend/tests/test_ingestion.py`.
8. Verify end-to-end via API and browser.
9. Deliver `PHASE_3_COMPLETION_REPORT.md` with explicit declaration: `DATA CHECKPOINT REACHED. STOP.`
