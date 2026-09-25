"""
Storage Provider Factory.
Returns the correct StorageBackend based on STORAGE_BACKEND env var.
The application only ever calls get_storage_backend() — never constructs backends directly.
"""
from __future__ import annotations

from app.services.storage.base import StorageBackend

_storage_instance: StorageBackend | None = None


def get_storage_backend() -> StorageBackend:
    """Return singleton storage backend based on config."""
    global _storage_instance
    if _storage_instance is not None:
        return _storage_instance

    from app.core.config import settings

    backend_type = settings.storage_backend.upper()

    if backend_type == "LOCAL":
        from app.services.storage.local import LocalStorageBackend
        _storage_instance = LocalStorageBackend(root=settings.storage_local_root)

    elif backend_type == "S3_COMPATIBLE":
        from app.services.storage.s3 import S3StorageBackend
        _storage_instance = S3StorageBackend(
            bucket=settings.storage_s3_bucket,
            endpoint_url=settings.storage_s3_endpoint or None,
            access_key=settings.storage_s3_access_key,
            secret_key=settings.storage_s3_secret_key,
            region=settings.storage_s3_region,
        )

    else:
        raise ValueError(
            f"Unknown STORAGE_BACKEND: '{backend_type}'. "
            f"Valid options: LOCAL, S3_COMPATIBLE"
        )

    return _storage_instance
