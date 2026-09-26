# DATA CHECKPOINT
## Ambedkar Heritage Intelligence & Digital Preservation System

**Version**: 3.0  
**Date**: 2026-09-23  
**Status**: ACTIVE — Awaiting human-approved source file placement

---

## ⚠️ IMPORTANT: Read Before Placing Any Files

This document defines the formal **Data Checkpoint** for archival ingest.  
No real corpus files will be processed until a project team member places them here  
and explicitly approves ingestion.

---

## Approved Drop Location

Place approved source files in:

```
data/inbox/
```

### Recommended Subdirectory Structure

```
data/inbox/
├── speeches/         ← Text transcripts or audio recordings of speeches
├── writings/         ← Books, essays, articles in PDF or text
├── debates/          ← Parliamentary and Constituent Assembly debates
├── manuscripts/      ← Handwritten or typed primary manuscripts
├── photographs/      ← JPEG, PNG, TIFF archival photographs
├── audio/            ← WAV, MP3 audio recordings
└── video/            ← MP4, MOV video recordings
```

---

## Supported File Formats

| Format | Extension(s) | Object Type |
|---|---|---|
| Portable Document Format | `.pdf` | book, article, legal_document, manuscript |
| TIFF Image | `.tiff`, `.tif` | photograph, manuscript |
| PNG Image | `.png` | photograph, scan |
| JPEG Image | `.jpg`, `.jpeg` | photograph, scan |
| Waveform Audio | `.wav` | speech, audio |
| MPEG Audio (Layer 3) | `.mp3` | speech, audio |
| MPEG-4 Video | `.mp4` | speech, video |
| QuickTime Video | `.mov` | speech, video |

---

## Source File Rules

1. **Original files must NEVER be modified** after placement in `data/inbox/`.
2. The ingestion pipeline copies originals to storage. The original in `data/inbox/` remains **read-only and untouched**.
3. **Do NOT invent or fabricate metadata.** If provenance information is unknown, the system will record `UNKNOWN` and flag the object as `NEEDS_REVIEW`.
4. The following are **mandatory provenance fields** for each file. Provide them in a companion `.json` metadata sidecar or via the Admin API:
   - `title` (string, required)
   - `creator` (string — use `"UNKNOWN"` if not known)
   - `source_institution` (string — use `"UNKNOWN"` if not known)
   - `rights_status` (string: `public_domain`, `restricted`, `unknown`)
   - `publication_date` (string: `YYYY`, `YYYY-MM`, or `UNKNOWN`)
5. Files with **no accompanying metadata** will be ingested with all provenance fields set to `UNKNOWN` and immediately flagged `NEEDS_REVIEW`. They will not be published until a human archivist reviews and approves them.

---

## Ingestion Pipeline Steps

For every file placed in `data/inbox/`:

1. **Format Detection** — MIME type via magic bytes (not just file extension).
2. **Fixity Calculation** — SHA-256 cryptographic hash computed on the binary stream.
3. **Duplicate Detection** — Hash compared against all previously ingested `archival_objects.file_hash`. Duplicates are logged and skipped (not re-ingested).
4. **Integrity Check**:
   - PDF: parse header and page tree; extract page count.
   - Image: validate header/magic bytes; extract dimensions.
   - Audio: validate RIFF/ID3 header; extract duration and codec.
   - Video: validate MP4/MOV atoms; extract duration and codec.
5. **Metadata Capture** — Reads companion `.json` sidecar if present; falls back to `UNKNOWN`.
6. **Archival ID Generation** — Unique stable ID: `AH-{YYYYMMDD}-{sha256_prefix_8}`.
7. **Storage** — Binary written to `LocalStorageBackend` at `originals/{type}/{object_id}/original.{ext}`. Not stored in Turso.
8. **Turso Record** — `archival_objects`, `files`, and `preservation_events (INGEST)` records written to Turso Cloud.
9. **Job Queue** — `processing_jobs` enqueued: `OCR`, `THUMBNAIL`, `METADATA_EXTRACTION` (executed in Phase 4+).
10. **Report** — Per-file and batch manifest written to `data/manifests/`.

---

## Edge Case Handling

| Condition | Detection Method | Outcome |
|---|---|---|
| Duplicate file | SHA-256 hash match | Logged, skipped, `duplicate` status |
| Corrupt file | Parse error on format-specific header | Logged, skipped, `failed` status |
| Unsupported format | MIME type not in allowed list | Rejected, `failed` status |
| Missing metadata | No sidecar / empty fields | Accepted, all provenance → `UNKNOWN`, → `NEEDS_REVIEW` |
| Large file | >500 MB per file | Warning logged, continues streaming in chunks |

---

## Data Checkpoint Verification

Before running `POST /api/v1/admin/ingest/scan`, confirm:

- [ ] Files have been placed in appropriate `data/inbox/{subdirectory}/`
- [ ] Companion `.json` metadata sidecars have been created for each file
- [ ] Human archivist has reviewed the sidecar metadata for accuracy
- [ ] No sensitive, personally identifiable, or restricted information is present beyond stated rights status

---

## PHASE 3 SCOPE RESTRICTION

**In Phase 3, no real corpus files from `incoming_documents/` are ingested.**  
Phase 3 exclusively exercises the ingestion *pipeline mechanics* with synthetic test fixtures.  
Real corpus ingestion is reserved for **Phase 4**, following explicit human archivist sign-off.

---

*"The information given to the public must be true. It must be complete." — Dr. B.R. Ambedkar*
