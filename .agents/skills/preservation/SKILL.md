---
name: preservation
description: Digital preservation workflow following PREMIS 3.0. Handles fixity checking, preservation event logging, METS/Dublin Core metadata generation, and format migration tracking.
---

# Preservation Skill

## Purpose
Ensure long-term digital preservation compliance for the Ambedkar archive.

## Standards
- PREMIS 3.0 (preservation metadata)
- Dublin Core (descriptive metadata)
- METS 2.x (metadata encoding and transmission)
- BagIt (transfer and packaging)

## Preservation Events (Record All in Turso)
- INGEST: file received + hash verified
- FIXITY_CHECK: periodic SHA-256 re-verification
- MIGRATION: format conversion (e.g., proprietary → PDF/A)
- REPLICATION: backup to second storage location
- DELETION: authorized removal with reason

## Fixity Checking
- On ingest: compute SHA-256, store in archival_objects.file_hash
- Scheduled: re-verify hash monthly
- On access: optional verification flag

## Key Rules
- Original files are IMMUTABLE after ingest
- All format conversions produce new derivatives (not overwrite originals)
- Every preservation action is logged in preservation_events

## Turso Tables
- archival_objects (file_hash, file_size_bytes)
- preservation_events (all events)
- audit_log (all admin actions)

## API Endpoints
POST /api/v1/admin/preservation/fixity-check/{object_id}
GET /api/v1/admin/preservation/events/{object_id}
GET /api/v1/admin/preservation/report
