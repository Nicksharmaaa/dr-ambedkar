# PHASE 5 IMPLEMENTATION PLAN
## Ambedkar Heritage — Preservation-Aware Architecture

**Phase**: 5 — PREMIS 3.0 · IIIF Presentation 3.0 · ALTO XML · Deep-Zoom Archival Viewer  
**Date**: 2026-09-23  
**Status**: APPROVED & IN EXECUTION  

---

## 1. Objectives

Elevate the platform from a text repository to a **certified, preservation-aware digital archive** meeting international archival standards:

1. **Original Immutability** — Enforce at the storage backend level: no `PUT`/overwrite for `originals/` keys.
2. **PREMIS 3.0 Preservation Events** — Full event lifecycle tracking (ingestion → fixity → OCR → publication) stored in Turso `preservation_events`.
3. **IIIF Presentation API 3.0** — Machine-readable manifests (Collection → Manifest → Canvas → Annotation) for all 19 BAWS volumes.
4. **ALTO XML** — Spatial layout coordinates for every page derived from the chunked text ingested in Phase 4.
5. **Stable Page IDs** — Format `{stable_id}_p{page_num:04d}` (e.g. `AMBEDKAR-VOL-01_p0047`), immutable once created.
6. **Deep-Zoom Archival Viewer** — Full-featured web viewer: zoom/pan, page navigation, OCR overlay, in-document search, region highlighting, preservation inspector.
7. **RAG Citation Deep-Linking** — Assistant citation cards link directly to the exact page in the viewer.

---

## 2. Current State Assessment

From codebase inspection:

| Component | Status |
|---|---|
| `backend/app/services/preservation/` | **Empty** — only `__init__.py` |
| `backend/app/services/iiif/` | **Empty** — only `__init__.py` |
| `backend/app/db/repositories/preservation.py` | **Exists** — `log_preservation_event`, `get_preservation_events`, `log_audit_event` |
| `backend/app/db/repositories/archival_objects.py` | **Exists** — `create_page`, `get_pages` |
| `backend/app/api/v1/preservation.py` | **Does not exist** |
| `backend/app/api/v1/iiif.py` (or router) | **Does not exist** |
| `frontend/components/viewer/` | **Empty directory** |
| `frontend/app/documents/[id]/viewer/` | **Does not exist** |
| `frontend/app/preservation/page.tsx` | **Exists** — stub page |
| `backend/app/services/storage/local.py` | **Exists** — `put()` has no immutability guard |

**Key clarification**: Turso `pages` table will be populated from Phase 4 chunks. ALTO XML generation derives layout from existing `chunks` rows (which have `page_number`, `section_title`, `text`). Text-based SVG canvases with spatial layout will be rendered, providing crisp vector fidelity at all zoom levels.

---

## 3. Architecture

```
Frontend (Next.js)
│
├── /documents/[id]/viewer          ← Deep-Zoom Archival Viewer page
│   ├── ArchivalViewer.tsx          ← zoom/pan canvas, OCR overlay, search
│   └── PreservationDrawer.tsx      ← PREMIS events, SHA-256, rights
│
├── /preservation                   ← Upgraded with live data & fixity checks
│
└── /assistant                      ← Updated citation cards with deep-links
│
FastAPI Backend (/api/v1)
│
├── /iiif/collection/baws           ← IIIF Collection
├── /iiif/manifest/{id}             ← IIIF Manifest
├── /iiif/canvas/{id}/{page}        ← Canvas endpoint
├── /iiif/annotation/{id}/{page}    ← W3C Annotation Page
├── /iiif/image/{id}/{page}/info.json  ← IIIF Image info
├── /iiif/image/{id}/{page}/page.svg   ← SVG canvas from text layout
│
├── /preservation/fixity-check/{id} ← Checksum validation & PREMIS logging
├── /preservation/events/{id}       ← PREMIS event audit log
├── /preservation/report            ← Preservation health report
│
└── /documents/{id}/alto/{page}     ← ALTO XML for page
│
Services
├── backend/app/services/preservation/engine.py  ← fixity, event helpers
├── backend/app/services/iiif/manifest.py         ← IIIF 3.0 builders
├── backend/app/services/iiif/alto.py             ← ALTO XML generator
│
Storage
├── storage/local/originals/        ← IMMUTABLE (enforced in local.py)
└── storage/local/derivatives/alto/ ← Derivative ALTO XML storage
```

---

## 4. Execution Tasks

### Task 1 — Enforce Original Immutability in Storage Backend
- `backend/app/services/storage/local.py`: Guard against overwriting `originals/`

### Task 2 — Preservation Service Engine
- `backend/app/services/preservation/engine.py`: Event logging and fixity verification engine.

### Task 3 — Preservation API Endpoints
- `backend/app/api/v1/preservation.py`: Endpoints for fixity checks, events, and health report.

### Task 4 — Page Population & ALTO XML Generation
- `backend/app/services/iiif/alto.py`: ALTO v4.2 XML generator.
- `backend/scripts/generate_pages_and_alto.py`: Batch population script for all volumes.
- `backend/app/api/v1/documents.py`: Endpoint `GET /{document_id}/alto/{page_number}`.

### Task 5 — IIIF Presentation 3.0 API
- `backend/app/services/iiif/manifest.py`: Full IIIF 3.0 Manifest, Collection, Canvas, Annotation generators.
- `backend/app/api/v1/iiif.py`: IIIF router.
- `backend/app/main.py`: Register IIIF & Preservation routers.

### Task 6 — Deep-Zoom Archival Document Viewer
- `frontend/components/viewer/ArchivalViewer.tsx`
- `frontend/components/viewer/PreservationDrawer.tsx`
- `frontend/app/documents/[id]/viewer/page.tsx`

### Task 7 — RAG Citation Deep-Linking
- `frontend/app/assistant/page.tsx`: Link citation cards to `/documents/{id}/viewer?page={n}&query={q}`.

### Task 8 — Upgrade Preservation Dashboard
- `frontend/app/preservation/page.tsx`: Live stats, interactive fixity checks, PREMIS event log.
- `frontend/lib/api.ts`: API client functions for preservation and IIIF.

### Task 9 — Test Suite
- `backend/tests/test_phase5_preservation.py`: Immutability, fixity, IIIF, and ALTO test suite.

### Task 10 — Deliverables
- `PRESERVATION.md`
- `PHASE_5_COMPLETION_REPORT.md`
