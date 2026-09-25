"""
Local Filesystem Storage Backend.
Stores files under STORAGE_LOCAL_ROOT with path sanitization.
Uses aiofiles for non-blocking async I/O.
"""
from __future__ import annotations

from pathlib import Path

import aiofiles
import aiofiles.os

from app.services.storage.base import StorageBackend


class LocalStorageBackend(StorageBackend):
    """
    Filesystem-backed storage.
    All keys map to paths under self.root.
    Keys must be relative paths (no leading slash, no ..).
    """

    def __init__(self, root: Path) -> None:
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _resolve(self, key: str) -> Path:
        """Resolve a storage key to an absolute path, preventing path traversal."""
        # Normalize slashes, strip leading slash
        clean_key = key.lstrip("/").replace("\\", "/")
        resolved = (self.root / clean_key).resolve()
        if not str(resolved).startswith(str(self.root)):
            raise ValueError(f"Storage key '{key}' escapes storage root")
        return resolved

    async def put(
        self,
        key: str,
        data: bytes,
        content_type: str = "application/octet-stream",
    ) -> str:
        clean_key = key.lstrip("/").replace("\\", "/")
        dest = self._resolve(clean_key)
        if clean_key.startswith("originals/") and dest.exists():
            raise PermissionError(
                f"Archival Immutability Violation: Cannot overwrite original object '{key}'"
            )
        await aiofiles.os.makedirs(str(dest.parent), exist_ok=True)
        async with aiofiles.open(dest, "wb") as f:
            await f.write(data)
        return self.public_url(key)

    async def get(self, key: str) -> bytes:
        src = self._resolve(key)
        if not src.exists():
            raise FileNotFoundError(f"Storage key not found: {key}")
        async with aiofiles.open(src, "rb") as f:
            return await f.read()

    async def delete(self, key: str) -> None:
        clean_key = key.lstrip("/").replace("\\", "/")
        if clean_key.startswith("originals/"):
            raise PermissionError(
                f"Archival Immutability Violation: Cannot delete original object '{key}'"
            )
        path = self._resolve(clean_key)
        if path.exists():
            await aiofiles.os.remove(str(path))

    async def exists(self, key: str) -> bool:
        try:
            path = self._resolve(key)
            return path.exists()
        except (ValueError, OSError):
            return False

    async def list_prefix(self, prefix: str) -> list[str]:
        prefix_path = self._resolve(prefix)
        if not prefix_path.exists():
            return []
        results = []
        for p in prefix_path.rglob("*"):
            if p.is_file():
                # Return key relative to storage root
                rel = p.relative_to(self.root)
                results.append(str(rel).replace("\\", "/"))
        return sorted(results)

    def public_url(self, key: str) -> str:
        """Returns a URL path for the file API endpoint."""
        clean_key = key.lstrip("/")
        return f"/api/v1/storage/{clean_key}"

    async def get_size(self, key: str) -> int:
        path = self._resolve(key)
        if not path.exists():
            raise FileNotFoundError(f"Storage key not found: {key}")
        stat = await aiofiles.os.stat(str(path))
        return stat.st_size
