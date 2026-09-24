"""
Tests: Storage service (LocalStorageBackend).
Tests put, get, exists, delete, list_prefix, get_size, and path-traversal prevention.
"""
import pytest
import tempfile
from pathlib import Path
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.storage.local import LocalStorageBackend


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest.fixture
def temp_storage():
    with tempfile.TemporaryDirectory() as tmpdir:
        backend = LocalStorageBackend(Path(tmpdir))
        yield backend


@pytest.mark.anyio
async def test_put_and_get(temp_storage):
    key = "documents/test.txt"
    content = b"Knowledge is the foundation of emancipation."
    url = await temp_storage.put(key, content)
    assert url == f"/api/v1/storage/{key}"

    fetched = await temp_storage.get(key)
    assert fetched == content


@pytest.mark.anyio
async def test_exists_and_delete(temp_storage):
    key = "books/volume_1.pdf"
    assert not await temp_storage.exists(key)

    await temp_storage.put(key, b"fake pdf content")
    assert await temp_storage.exists(key)

    size = await temp_storage.get_size(key)
    assert size == len(b"fake pdf content")

    await temp_storage.delete(key)
    assert not await temp_storage.exists(key)


@pytest.mark.anyio
async def test_path_traversal_prevention(temp_storage):
    traversal_keys = [
        "../../etc/passwd",
        "..\\..\\windows\\system32\\calc.exe",
        "nested/../../../secret.txt",
    ]
    for bad_key in traversal_keys:
        with pytest.raises(ValueError, match="escapes storage root"):
            await temp_storage.put(bad_key, b"bad")


@pytest.mark.anyio
async def test_list_prefix(temp_storage):
    await temp_storage.put("archive/baws/vol1.txt", b"vol1")
    await temp_storage.put("archive/baws/vol2.txt", b"vol2")
    await temp_storage.put("archive/letters/doc1.txt", b"letter")

    all_baws = await temp_storage.list_prefix("archive/baws")
    assert len(all_baws) == 2
    assert "archive/baws/vol1.txt" in all_baws
    assert "archive/baws/vol2.txt" in all_baws
