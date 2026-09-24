# DIGITAL PRESERVATION POLICY & ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System

**Standard**: PREMIS 3.0 (Preservation Metadata: Implementation Strategies)  
**Model**: OAIS (Open Archival Information System — ISO 14721)  
**Presentation**: IIIF Presentation API 3.0 · IIIF Image API 3.0  
**Spatial OCR Layout**: Library of Congress ALTO XML v4.2  
**Database**: Turso (libSQL Cloud) with DiskANN Vector Indices  
**Storage**: Content-Addressed Local Filesystem (`LocalStorageBackend`)  

---

## 1. Archival Ingestion & Original Immutability

### Zero-Overwrite Policy
Original archival binaries are registered under `storage/local/originals/` during initial ingestion.
Once committed, the storage backend strictly enforces immutability at the driver level (`backend/app/services/storage/local.py`):

```python
clean_key = key.lstrip("/").replace("\\", "/")
dest = self._resolve(clean_key)
if clean_key.startswith("originals/") and dest.exists():
    raise PermissionError(
        f"Archival Immutability Violation: Cannot overwrite original object '{key}'"
    )
```

Any attempt by software agents or external APIs to overwrite or delete files within `originals/` raises a `PermissionError` and is logged in the PREMIS audit log.

### Derivatives Separation
All post-ingestion conversions, layout analyses, downsampled thumbnails, and XML files must be written strictly to `storage/local/derivatives/`:
- `derivatives/alto/{object_id}/{page:04d}.xml`: Page-level Library of Congress ALTO v4.2 spatial layout models.
- `derivatives/svg/{object_id}/{page:04d}.svg`: Vector canvases for IIIF Image API.

---

## 2. PREMIS 3.0 Event Dictionary

Every digital preservation action performed across the archive is immutably recorded in the Turso `preservation_events` table:

| Event Type | PREMIS Semantic Unit | Description | Trigger |
|---|---|---|---|
| `ingestion` | 2.3.1.1 `eventType` | Initial registration and bitstream commit to archive | Archival ingest script / API |
| `validation` | 2.3.1.1 `eventType` | MIME type verification, bitstream integrity | Post-ingest format checks |
| `fixity_check` | 2.3.1.1 `eventType` | Cryptographic SHA-256 digest recalculation & comparison | On-demand API / Batch audits |
| `derivative_creation`| 2.3.1.1 `eventType` | Generation of ALTO v4.2 XML and vector SVG canvases | Batch derivation processor |
| `metadata_update` | 2.3.1.1 `eventType` | Modifications to Dublin Core or administrative attributes | Archival curation edits |
| `ocr` | 2.3.1.1 `eventType` | Optical character recognition & bounding box inference | AI OCR microservice |
| `ocr_correction` | 2.3.1.1 `eventType` | Human review and correction of text or coordinates | Scholar review interface |
| `translation` | 2.3.1.1 `eventType` | Neural translation across 22 Indic languages | Multilingual engine |
| `publication` | 2.3.1.1 `eventType` | Transition from draft/review to published access tier | Archival sign-off |

### PREMIS Event Schema (SQL)
```sql
CREATE TABLE IF NOT EXISTS preservation_events (
    id               TEXT PRIMARY KEY,
    object_id        TEXT REFERENCES archival_objects(id),
    event_type       TEXT NOT NULL,
    event_detail     TEXT,
    event_outcome    TEXT NOT NULL,          -- 'success' | 'failure'
    outcome_detail   TEXT,
    agent_name       TEXT NOT NULL,          -- Software or User ID
    agent_type       TEXT NOT NULL DEFAULT 'software',
    event_date       TEXT NOT NULL DEFAULT (datetime('now')),
    file_hash_before TEXT,
    file_hash_after  TEXT
);
```

---

## 3. Cryptographic Fixity & Audit Schedule

### Algorithm
- **Primary Digest**: SHA-256 (FIPS 180-4 standard)
- **Secondary / Speed**: BLAKE3

### Fixity Audit Workflow
1. Client or automated cron job invokes `POST /api/v1/preservation/fixity-check/{object_id}`.
2. `PreservationEngine` reads the stored original binary from disk.
3. Cryptographic SHA-256 digest is computed on the fly.
4. Value is compared against `archival_objects.file_hash`.
5. Event outcome is determined:
   - **Match**: `event_outcome = 'success'`, outcome detail records byte count and verification timestamp.
   - **Mismatch**: `event_outcome = 'failure'`, alerts logged, `outcome_detail` stores both digests for forensic triage.
6. A permanent row is inserted into `preservation_events`.

---

## 4. International Interoperability: IIIF Presentation 3.0

The Ambedkar Heritage Archive adheres to the **International Image Interoperability Framework (IIIF) Presentation API 3.0** specification.

### Hierarchy & Addressing
```
IIIF Collection:     /api/v1/iiif/collection/baws
  └── Manifest:      /api/v1/iiif/manifest/{object_id}
        └── Canvas:  /api/v1/iiif/canvas/{object_id}/{page_number}
              ├── Image:       /api/v1/iiif/image/{object_id}/{page_number}/page.svg
              ├── Image Info:  /api/v1/iiif/image/{object_id}/{page_number}/info.json
              └── Annotation:  /api/v1/iiif/annotation/{object_id}/{page_number}
```

### Stable Page Addressing & RAG Citations
Every page in the archive possesses an immutable, globally unique identifier:
`{stable_id}_p{page_number:04d}` (e.g. `AMBEDKAR-VOL-01_p0088`).

The Grounded RAG Assistant generates scholarly citations linking directly to exact canvas coordinates:
`/documents/{doc_id}/viewer?page={page_est}&query={encodeURIComponent(search_excerpt)}`

---

## 5. Spatial OCR Layout Fidelity: ALTO XML v4.2

Spatial text coordinates are preserved using the Library of Congress ALTO v4.2 standard:
- Document dimensions mapped to standard archival folio at 300 DPI: `1800 x 2700 px`.
- Content space: `1500 x 2340 px` inside proportional margins (`150px` left, `180px` top).
- Hierarchy preserved: `<Page>` → `<PrintSpace>` → `<TextBlock>` → `<TextLine>` → `<String HPOS="..." VPOS="..." WIDTH="..." HEIGHT="..." WC="..."/>`.
- Machine-readable endpoints serve ALTO XML directly via `GET /api/v1/documents/{id}/alto/{page}`.
