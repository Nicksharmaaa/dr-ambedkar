# STORAGE ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System

**Version**: 1.0.0
**Date**: 2026-09-22

---

## 1. Storage Strategy

### Development / Hackathon Stage: Local Filesystem

The initial implementation uses the **local filesystem** as the primary object store.
This is sufficient for the hackathon prototype and eliminates infrastructure dependencies.

A clean **StorageBackend** abstraction ensures that swapping to S3-compatible or R2 storage
requires only a new backend implementation — no application-layer changes.

### Storage Abstraction Design

```python
# backend/app/services/storage/base.py

from abc import ABC, abstractmethod
from pathlib import Path

class StorageBackend(ABC):
    """Abstract storage backend. Switch implementations without changing callers."""

    @abstractmethod
    async def put(self, key: str, data: bytes, content_type: str) -> str:
        """Store bytes at key. Returns the access URL/path."""
        ...

    @abstractmethod
    async def get(self, key: str) -> bytes:
        """Retrieve bytes at key."""
        ...

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Delete object at key."""
        ...

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        ...

    @abstractmethod
    async def list_prefix(self, prefix: str) -> list[str]:
        """List all keys with given prefix."""
        ...

    @abstractmethod
    def public_url(self, key: str) -> str:
        """Return URL for serving this object to clients."""
        ...
```

### Backend Implementations

```python
# LOCAL (initial implementation)
class LocalStorageBackend(StorageBackend):
    """Local filesystem; no external dependencies."""
    def __init__(self, root: Path): ...

# S3-COMPATIBLE (future)
class S3StorageBackend(StorageBackend):
    """boto3-based; works with AWS S3, Cloudflare R2, MinIO, Backblaze B2."""
    def __init__(self, bucket: str, endpoint_url: str | None = None): ...

# R2 (future — Cloudflare Workers-compatible)
class R2StorageBackend(S3StorageBackend):
    """Cloudflare R2 via S3-compatible API."""
    ...
```

### Configuration

```python
# Controlled via environment variable
STORAGE_BACKEND = "LOCAL"         # or "S3_COMPATIBLE"

# Local settings
STORAGE_LOCAL_ROOT = "storage/local"

# S3-compatible settings (future)
STORAGE_S3_BUCKET = "ambedkar-archive"
STORAGE_S3_ENDPOINT = ""          # Empty = AWS; set for R2/MinIO
STORAGE_S3_ACCESS_KEY = ""
STORAGE_S3_SECRET_KEY = ""
STORAGE_S3_REGION = "auto"
```

---

## 2. Directory Structure (Local Backend)

```
storage/
└── local/
    ├── originals/              # Original uploaded files — IMMUTABLE after ingest
    │   ├── manuscripts/
    │   │   └── {object_id}/
    │   │       └── original.{ext}
    │   ├── books/
    │   ├── speeches/
    │   ├── letters/
    │   ├── photographs/
    │   └── audio-video/
    │
    ├── derivatives/            # Processed versions (generated; reproducible)
    │   ├── pdf-searchable/
    │   │   └── {object_id}/searchable.pdf
    │   ├── thumbnails/
    │   │   └── {object_id}/
    │   │       └── page_{n}_thumb.jpg
    │   ├── alto-xml/
    │   │   └── {object_id}/
    │   │       └── page_{n}.alto.xml
    │   └── normalized-images/
    │       └── {object_id}/
    │           └── page_{n}.jpg
    │
    ├── iiif-tiles/             # IIIF image pyramid tiles
    │   └── {object_id}/
    │       └── {page_id}/
    │           └── {z}/{x}_{y}.jpg
    │
    ├── audio/                  # Audio files + transcripts
    │   └── {object_id}/
    │       ├── audio.{ext}
    │       └── transcript.json
    │
    ├── video/                  # Video files + transcripts
    │   └── {object_id}/
    │       ├── video.{ext}
    │       ├── frames/
    │       └── transcript.json
    │
    ├── exports/                # User-generated export packages
    │   └── {export_id}/
    │       └── package.zip
    │
    └── uploads-staging/        # Temporary upload buffer (pre-validation)
        └── {upload_id}.{ext}
```

---

## 3. File Key Convention

All storage keys follow a consistent scheme for backend portability:

```
{bucket}/{object_id}/{version}/{filename}

Examples:
  originals/a1b2c3d4/v1/original.pdf
  derivatives/a1b2c3d4/v1/page_001_thumb.jpg
  iiif-tiles/a1b2c3d4/page_001/0/0_0.jpg
  audio/a1b2c3d4/v1/speech.mp3
```

This scheme is fully S3-compatible: each top-level segment maps to a bucket prefix.

---

## 4. Digital Preservation Requirements

### File Integrity
- SHA-256 hash computed at ingest and stored in `archival_objects.file_hash`
- Fixity checks run periodically; recorded in `preservation_events`
- Original files are NEVER modified after ingest

### Derivatives Policy
- Derivatives are **reproducible** from originals
- Derivatives are **not** preservation copies
- Preservation events logged for all derivative generation

### Backup Strategy
- Development: manual backup of `storage/local/originals/`
- Production: Storage backend provides replication (R2 = 3× geo-redundancy)

### PREMIS Compliance
- All preservation events recorded in `preservation_events` table
- Event types: INGEST | FIXITY_CHECK | MIGRATION | REPLICATION | DELETION
- Agent recorded (human user or automated service)

---

## 5. Media Serving Architecture

### IIIF Image API (Tiled Image Delivery)

```
Client request: /iiif/3/{identifier}/{region}/{size}/{rotation}/{quality}.{format}
    ↓
FastAPI IIIF endpoint
    ↓
Check tile cache (storage/local/iiif-tiles/{object_id}/{page_id}/)
    ↓
Cache hit  → serve tile from storage
Cache miss → generate tile from normalized image → cache → serve
```

### Audio/Video Serving

```
Client request: /api/v1/media/{object_id}/stream
    ↓
FastAPI range-request handler
    ↓
Read from storage/local/audio/ or storage/local/video/
    ↓
Serve with HTTP Range support (streaming)
```

---

## 6. Future R2 Migration Path

When ready to migrate from local to R2:

1. Set `STORAGE_BACKEND=S3_COMPATIBLE`
2. Set `STORAGE_S3_ENDPOINT=https://{account_id}.r2.cloudflarestorage.com`
3. Set R2 credentials
4. Run migration script: `scripts/migrate_storage_to_r2.py`
   - Script reads all files from local
   - Uploads to R2 with same key structure
   - Verifies hash integrity
   - Updates no application code

**Zero application-layer changes required** — all code calls `StorageBackend` interface.
