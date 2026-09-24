---
name: security
description: Security architecture for the Ambedkar Heritage platform. Covers authentication, authorization, input validation, rate limiting, file upload safety, and AI output audit.
---

# Security Skill

## Purpose
Implement and maintain security across all system layers.

## Authentication
- JWT access tokens (15 min expiry) + refresh tokens (30 days)
- python-jose for JWT; passlib[bcrypt] for password hashing
- Roles: ADMIN | ARCHIVIST | RESEARCHER | PUBLIC

## Authorization (RBAC)
| Role | Capabilities |
|---|---|
| PUBLIC | Search, view public documents, use AI assistant |
| RESEARCHER | All PUBLIC + save searches, create annotations |
| ARCHIVIST | All RESEARCHER + ingest documents, edit metadata |
| ADMIN | All ARCHIVIST + manage users, system config |

## API Security
- slowapi rate limiting:
  - Public search: 100 req/min
  - AI queries: 20 req/min
  - OCR processing: 10 req/min
  - Admin endpoints: 30 req/min
- CORS: restrict to known frontend origins
- HTTPS required in production

## Input Validation
- All API inputs validated via Pydantic v2 models
- File uploads: MIME type check + magic byte verification
- SQL: parameterized queries only (via libsql-client); no string interpolation
- Vector inputs: dimension validation before Turso insert

## File Upload Safety
- Magic byte verification (not just extension)
- File size limits (configurable per type)
- Staging area: validate before moving to originals/
- Virus scan integration point (ClamAV hook)

## AI Output Audit
- All AI queries logged to audit_log (query text, user, response metadata)
- AI responses include source_chunk_ids (allows forensic review)
- Suspicious patterns (repeated unusual queries) flagged for admin

## Audit Trail
- Every document access logged
- Every ingest logged
- Every user creation/deletion logged
- Every AI query logged
- Logs stored in Turso audit_log; never deleted (append-only)

## Kiosk Security
- Kiosk mode: no auth required for public features
- PIN-protected admin mode
- Read-only access to archive documents
- No ingest capability on kiosk
