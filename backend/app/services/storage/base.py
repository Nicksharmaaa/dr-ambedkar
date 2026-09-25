"""
Storage Backend — Abstract Base Class.
The application NEVER knows whether files live locally or in cloud storage.
All access goes through this interface.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path


class StorageBackend(ABC):
    """
    Abstract storage backend.
    Implement LocalStorageBackend for filesystem, S3StorageBackend for cloud.
    """

    @abstractmethod
    async def put(
        self,
        key: str,
        data: bytes,
        content_type: str = "application/octet-stream",
    ) -> str:
        """
        Store bytes at key.
        Returns the canonical URL/path for serving the object.
        """
        ...

    @abstractmethod
    async def get(self, key: str) -> bytes:
        """Retrieve bytes at key. Raises FileNotFoundError if not found."""
        ...

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Delete object at key. No-op if not found."""
        ...

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Return True if object at key exists."""
        ...

    @abstractmethod
    async def list_prefix(self, prefix: str) -> list[str]:
        """List all keys with the given prefix."""
        ...

    @abstractmethod
    def public_url(self, key: str) -> str:
        """Return the URL for serving this object to clients."""
        ...

    @abstractmethod
    async def get_size(self, key: str) -> int:
        """Return size of object in bytes. Raises FileNotFoundError if not found."""
        ...
