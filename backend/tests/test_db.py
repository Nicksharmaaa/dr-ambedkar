"""
Tests: Database layer — SQLiteClient (in-memory) for fast isolated tests.
Does NOT require network access to Turso Cloud.
"""
import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db.database import SQLiteClient, ResultSet, Row
from app.db.repositories.archival_objects import ArchivalObjectRepository
from app.db.repositories.collections import CollectionRepository
from app.db.repositories.chunks import ChunkRepository
from app.db.repositories.jobs import JobRepository


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def db():
    """Fresh in-memory SQLite DB for each test."""
    client = SQLiteClient(":memory:")
    # Apply minimal schema for tests
    await client.execute("""
        CREATE TABLE IF NOT EXISTS collections (
            id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
            description TEXT, cover_image_key TEXT, display_order INTEGER DEFAULT 0,
            is_public INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)
    await client.execute("""
        CREATE TABLE IF NOT EXISTS archival_objects (
            id TEXT PRIMARY KEY, collection_id TEXT, stable_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL, subtitle TEXT, object_type TEXT DEFAULT 'book',
            language TEXT DEFAULT 'en', source_institution TEXT DEFAULT '',
            provenance TEXT DEFAULT '', rights_status TEXT DEFAULT 'unknown',
            creator TEXT, publisher TEXT, publication_date TEXT, description TEXT,
            subject_keywords TEXT, physical_description TEXT,
            review_status TEXT DEFAULT 'pending', publication_status TEXT DEFAULT 'draft',
            file_hash TEXT, file_size_bytes INTEGER, original_filename TEXT,
            original_file_key TEXT, page_count INTEGER, metadata_json TEXT,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        )
    """)
    await client.execute("""
        CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY, object_id TEXT NOT NULL, page_id TEXT, section_id TEXT,
            chunk_index INTEGER NOT NULL, text TEXT NOT NULL, language TEXT DEFAULT 'en',
            token_count INTEGER, char_count INTEGER, volume_number TEXT,
            page_number INTEGER, section_title TEXT, is_header INTEGER DEFAULT 0,
            is_footnote INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(object_id, chunk_index)
        )
    """)
    await client.execute("""
        CREATE TABLE IF NOT EXISTS processing_jobs (
            id TEXT PRIMARY KEY, object_id TEXT NOT NULL, job_type TEXT NOT NULL,
            status TEXT DEFAULT 'queued', priority INTEGER DEFAULT 5,
            attempts INTEGER DEFAULT 0, max_attempts INTEGER DEFAULT 3,
            payload_json TEXT, result_json TEXT, error_message TEXT,
            queued_at TEXT DEFAULT (datetime('now')), started_at TEXT,
            completed_at TEXT, worker_id TEXT
        )
    """)
    yield client
    await client.close()


@pytest.mark.anyio
async def test_sqlite_client_basic(db):
    result = await db.execute("SELECT 1 AS value")
    assert result.first()["value"] == 1


@pytest.mark.anyio
async def test_result_set_scalar(db):
    result = await db.execute("SELECT 42 AS n")
    assert result.scalar() == 42


@pytest.mark.anyio
async def test_collection_crud(db):
    repo = CollectionRepository(db)
    col_id = await repo.create({
        "slug": "test-collection",
        "title": "Test Collection",
        "description": "A test collection",
    })
    assert col_id

    col = await repo.get_by_id(col_id)
    assert col["title"] == "Test Collection"
    assert col["slug"] == "test-collection"

    col2 = await repo.get_by_slug("test-collection")
    assert col2["id"] == col_id


@pytest.mark.anyio
async def test_archival_object_crud(db):
    repo = ArchivalObjectRepository(db)
    obj_id = await repo.create({
        "title": "Annihilation of Caste",
        "object_type": "book",
        "language": "en",
        "source_institution": "Government of Maharashtra",
        "provenance": "BAWS Volume 1",
        "rights_status": "public_domain",
        "creator": "B.R. Ambedkar",
        "publication_date": "1936",
        "stable_id": "baws-annihilation-of-caste",
        "publication_status": "published",
    })
    assert obj_id

    obj = await repo.get_by_id(obj_id)
    assert obj["title"] == "Annihilation of Caste"
    assert obj["creator"] == "B.R. Ambedkar"

    obj2 = await repo.get_by_stable_id("baws-annihilation-of-caste")
    assert obj2["id"] == obj_id


@pytest.mark.anyio
async def test_chunk_crud(db):
    ao_repo = ArchivalObjectRepository(db)
    obj_id = await ao_repo.create({
        "title": "Test Book",
        "source_institution": "Test",
        "provenance": "Test",
        "stable_id": "test-book-chunks",
        "publication_status": "published",
    })

    chunk_repo = ChunkRepository(db)
    chunk_id = await chunk_repo.insert_chunk({
        "object_id": obj_id,
        "chunk_index": 0,
        "text": "The caste system is a vast one both theoretically and practically.",
        "language": "en",
        "volume_number": "1",
        "page_number": 6,
    })
    assert chunk_id

    count = await chunk_repo.count_for_object(obj_id)
    assert count == 1

    chunks = await chunk_repo.get_chunks_for_object(obj_id)
    assert len(chunks) == 1
    assert "caste" in chunks[0]["text"]


@pytest.mark.anyio
async def test_job_queue(db):
    ao_repo = ArchivalObjectRepository(db)
    obj_id = await ao_repo.create({
        "title": "Test for Jobs",
        "source_institution": "Test",
        "provenance": "Test",
        "stable_id": "test-book-jobs",
        "publication_status": "draft",
    })

    job_repo = JobRepository(db)
    job_id = await job_repo.enqueue(obj_id, "OCR", {"priority": "high"})
    assert job_id

    job = await job_repo.get_job(job_id)
    assert job["status"] == "queued"
    assert job["job_type"] == "OCR"

    await job_repo.mark_running(job_id, "worker-1")
    job = await job_repo.get_job(job_id)
    assert job["status"] == "running"

    await job_repo.mark_done(job_id, {"pages": 42})
    job = await job_repo.get_job(job_id)
    assert job["status"] == "done"
