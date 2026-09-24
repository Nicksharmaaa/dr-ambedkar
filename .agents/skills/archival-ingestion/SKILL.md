---
name: archival-ingestion
description: Handles the full document ingest pipeline for the Ambedkar Heritage archive. Covers upload validation, provenance metadata capture, file hashing, staging, format-specific extraction, and audit logging. Ensures only user-provided documents enter the archive.
---

# Archival Ingestion Skill

## Purpose
Implement and maintain the document ingest pipeline for the Ambedkar Heritage archive.

## Key Responsibilities
- Validate uploaded files (format, MIME type, magic bytes)
- Compute SHA-256 hash for fixity (stored in archival_objects.file_hash)
- Capture provenance metadata (title, creator, date, rights, source institution)
- Write original to storage/local/originals/{type}/{object_id}/original.{ext}
- Create archival_object record in Turso with status=pending
- Enqueue processing_job records: OCR, EMBED, IIIF
- Log INGEST event in preservation_events

## Data Policy (BINDING)
- Accept ONLY user-provided documents
- Never fetch external content into the archive
- Required provenance fields: title, creator or unknown, rights_status, source_institution
- Reject files without provenance metadata

## File Types Supported
- PDF (manuscripts, books, letters)
- JPEG/PNG/TIFF (photographs, scans)
- MP3/WAV/FLAC (speeches, recordings)
- MP4/MKV (video recordings)

## API Endpoints
POST /api/v1/admin/ingest - Upload and ingest
GET /api/v1/admin/ingest/{job_id}/status - Ingest job status

## Storage Keys
originals/{object_type}/{object_id}/original.{ext}
uploads-staging/{upload_id}.{ext}  ← temporary, deleted after validation

## Turso Tables Used
- archival_objects (create record)
- processing_jobs (enqueue tasks)
- preservation_events (log INGEST)
- audit_log (log admin action)
