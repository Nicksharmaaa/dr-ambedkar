# Data Directory — Ambedkar Heritage Intelligence & Digital Preservation System

## Overview

This directory contains the archival data lifecycle infrastructure. All files follow  
the OAIS (ISO 14721) model with PREMIS 3.0 preservation event logging.

---

## Directory Structure

```
data/
├── inbox/                   # Stage 1: Incoming source files (place files here)
│   ├── speeches/
│   ├── writings/
│   ├── debates/
│   ├── manuscripts/
│   ├── photographs/
│   ├── audio/
│   └── video/
│
├── raw/                     # Stage 2: Immutable raw ingest copies (system-managed)
│
├── processed/               # Stage 3: Validated & normalised assets
│
├── derived/                 # Stage 4: Generated derivatives
│   │                        #   e.g. thumbnails, ALTO XML, transcription txt
│
├── manifests/               # METS, Dublin Core XML & IIIF manifest JSON files
│
├── evaluation/              # QA metrics, evaluation benchmark outputs
│
└── exports/                 # AIP / DIP dissemination packages for external delivery
```

---

## Lifecycle States

| Stage | Directory | Description |
|---|---|---|
| PENDING | `inbox/` | File awaiting pipeline pickup |
| INGESTING | (in-progress) | Actively being analysed by ingestion pipeline |
| RAW | `raw/` | Immutable copy of original, hash-verified |
| PROCESSED | `processed/` | Validated, indexed, stored in Turso |
| DERIVED | `derived/` | Machine-generated derivatives |
| EXPORTED | `exports/` | Packaged for dissemination |

---

## Immutability Rule

Once a file is moved from `inbox/` to `raw/`, it is **immutable**. No process  
may overwrite, rename, or delete a file in `raw/` except the archive administrator  
following a documented PREMIS `DELETION` preservation event.

---

## Companion Metadata Sidecar Format

Place a `.json` file alongside each source file with the same base name:

```json
{
  "title": "Annihilation of Caste",
  "subtitle": "Undelivered speech at Lahore",
  "creator": "Dr. B.R. Ambedkar",
  "source_institution": "Government of Maharashtra (BAWS Archive)",
  "rights_status": "public_domain",
  "publication_date": "1936",
  "object_type": "book",
  "language": "en",
  "provenance": "BAWS Volume 1, Part 1",
  "description": "Critical speech on annihilation of the caste system"
}
```

Use `"UNKNOWN"` for any field where provenance cannot be confirmed.  
Never fabricate metadata.

---

*See `DATA_CHECKPOINT.md` for full archival intake policy.*
