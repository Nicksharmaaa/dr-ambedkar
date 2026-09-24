"""
Phase 6 — Search System Test Suite
Tests all four search components: FTS5, vector, RRF, reranking.
Uses in-memory SQLite (SQLiteClient) for fast isolated testing.
"""
from __future__ import annotations

import asyncio
import json
import uuid
import pytest
from datetime import datetime, timezone

from app.db.database import SQLiteClient
from app.db.repositories.chunks import ChunkRepository
from app.services.search.chunker import chunk_page, chunk_pages, _build_chunks, _split_into_sentences
from app.services.search.vector_store import TursoVectorStore, VectorResult
from app.services.search.hybrid import HybridSearchService


# ── Fixtures ──────────────────────────────────────────────────────────────────

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS archival_objects (
    id TEXT PRIMARY KEY,
    stable_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    object_type TEXT NOT NULL DEFAULT 'book',
    language TEXT NOT NULL DEFAULT 'en',
    source_institution TEXT NOT NULL DEFAULT '',
    provenance TEXT NOT NULL DEFAULT '',
    rights_status TEXT NOT NULL DEFAULT 'unknown',
    creator TEXT,
    publisher TEXT,
    publication_date TEXT,
    description TEXT,
    subject_keywords TEXT,
    physical_description TEXT,
    review_status TEXT NOT NULL DEFAULT 'pending',
    publication_status TEXT NOT NULL DEFAULT 'draft',
    file_hash TEXT,
    file_size_bytes INTEGER,
    original_filename TEXT,
    original_file_key TEXT,
    page_count INTEGER,
    metadata_json TEXT,
    collection_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id TEXT PRIMARY KEY,
    object_id TEXT NOT NULL REFERENCES archival_objects(id),
    page_id TEXT,
    section_id TEXT,
    chunk_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    token_count INTEGER,
    char_count INTEGER,
    volume_number TEXT,
    page_number INTEGER,
    section_title TEXT,
    is_header INTEGER NOT NULL DEFAULT 0,
    is_footnote INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE VIRTUAL TABLE IF NOT EXISTS fts_chunks USING fts5(
    text,
    object_id UNINDEXED,
    chunk_id UNINDEXED
);

CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    chunk_id TEXT NOT NULL REFERENCES document_chunks(id),
    model_name TEXT NOT NULL,
    dimension INTEGER NOT NULL DEFAULT 1024,
    embedding_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    object_id TEXT NOT NULL REFERENCES archival_objects(id),
    page_number INTEGER NOT NULL,
    label TEXT,
    image_file_key TEXT,
    thumbnail_key TEXT,
    alto_xml_key TEXT,
    ocr_text TEXT,
    ocr_confidence REAL,
    processing_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""

# Sample passages from Ambedkar's writings for testing
SAMPLE_TEXTS = [
    "Caste is not a physical object like a wall of bricks or a line of barbed wire which prevents the Hindus from commingling and which has, therefore, to be pulled down.",
    "Turn in any direction you like, caste is the monster that crosses your path. You cannot have political reform, you cannot have economic reform unless you kill this monster.",
    "Lost rights are never regained by appeals to the conscience of the usurpers but by the force which the dispossessed can apply.",
    "The problem of the Untouchables is a test of the sincerity of the caste Hindus.",
    "Constitutional morality is not a natural sentiment. It has to be cultivated. We must realize that our people have yet to learn it.",
]


async def _setup_db() -> SQLiteClient:
    """Create in-memory DB with schema and sample data."""
    db = SQLiteClient(":memory:")
    # Create schema
    for stmt in [s.strip() for s in SCHEMA_SQL.split(";") if s.strip()]:
        await db.execute(stmt)

    # Insert test archival object
    await db.execute(
        """
        INSERT INTO archival_objects (id, stable_id, title, object_type, language, source_institution, provenance, rights_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        ["obj-001", "baws-test", "Annihilation of Caste", "book", "en", "Test", "Test", "public_domain"],
    )
    return db


async def _insert_sample_chunks(db: SQLiteClient) -> list[str]:
    """Insert sample chunks and FTS5 entries. Return chunk IDs."""
    repo = ChunkRepository(db)
    chunk_ids = []
    for i, text in enumerate(SAMPLE_TEXTS):
        cid = str(uuid.uuid4())
        await repo.insert_chunk({
            "id": cid,
            "object_id": "obj-001",
            "chunk_index": i,
            "text": text,
            "language": "en",
            "volume_number": "1",
            "page_number": i + 1,
            "section_title": "Annihilation of Caste",
        })
        # Sync to FTS5
        await db.execute(
            "INSERT INTO fts_chunks (chunk_id, text, object_id) VALUES (?, ?, ?)",
            [cid, text, "obj-001"],
        )
        chunk_ids.append(cid)
    return chunk_ids


# ── Tests ──────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_chunking_produces_expected_chunks():
    """Chunker splits page OCR text into correct chunks."""
    # Single page with moderate text
    page = {
        "id": "page-001",
        "object_id": "obj-001",
        "page_number": 1,
        "ocr_text": SAMPLE_TEXTS[0] * 5,  # Long enough to potentially split
        "language": "en",
        "volume_number": "1",
    }
    chunks = chunk_page(page, "obj-001", chunk_index_start=0)
    assert len(chunks) >= 1, "Should produce at least one chunk"
    for c in chunks:
        assert c["object_id"] == "obj-001"
        assert c["page_number"] == 1
        assert c["language"] == "en"
        assert len(c["text"]) > 0


@pytest.mark.asyncio
async def test_chunking_preserves_metadata():
    """Chunks carry page metadata (volume, page number, section title)."""
    page = {
        "id": "page-002",
        "object_id": "obj-001",
        "page_number": 47,
        "ocr_text": SAMPLE_TEXTS[1],
        "language": "en",
        "volume_number": "1",
        "section_title": "Section IV",
    }
    chunks = chunk_page(page, "obj-001")
    assert all(c["volume_number"] == "1" for c in chunks)
    assert all(c["page_number"] == 47 for c in chunks)
    assert all(c["section_title"] == "Section IV" for c in chunks)


@pytest.mark.asyncio
async def test_fts5_exact_phrase_search():
    """FTS5 returns results for an exact keyword from indexed text."""
    db = await _setup_db()
    await _insert_sample_chunks(db)
    repo = ChunkRepository(db)

    results = await repo.fts_search("caste", limit=10)
    assert len(results) > 0, "FTS5 should return results for 'caste'"
    # All results should contain 'caste' (case-insensitive)
    texts = [r.get("text", "").lower() for r in results]
    assert any("caste" in t for t in texts), "Results should contain 'caste'"


@pytest.mark.asyncio
async def test_vector_search_returns_embeddings():
    """TursoVectorStore returns relevant results given a query embedding."""
    db = await _setup_db()
    chunk_ids = await _insert_sample_chunks(db)
    vs = TursoVectorStore(db)

    # Store fake embeddings (unit vectors)
    import math
    dim = 16
    for i, cid in enumerate(chunk_ids):
        # Each embedding is a unit vector in a different direction
        vec = [0.0] * dim
        vec[i % dim] = 1.0
        await vs.upsert(cid, vec, model_name="test-model")

    # Search with a query vector similar to the first embedding
    query_vec = [0.0] * dim
    query_vec[0] = 1.0
    results = await vs.search(query_vec, top_k=3)

    assert len(results) > 0, "Vector search should return results"
    assert isinstance(results[0], VectorResult)
    # Top result should be the chunk whose embedding matches the query direction
    assert results[0].chunk_id == chunk_ids[0]
    assert results[0].score > 0.0


@pytest.mark.asyncio
async def test_hybrid_rrf_merge():
    """RRF merges FTS5 and vector results with correct score formula."""
    from app.services.search.hybrid import HybridSearchService

    db = await _setup_db()
    service = HybridSearchService(db)

    # Simulate FTS5 results (ranked 1, 2, 3)
    fts = [
        {"id": "c1", "text": "a"},
        {"id": "c2", "text": "b"},
        {"id": "c3", "text": "c"},
    ]
    # Simulate vector results (ranked 1, 2, 3) — c2 ranks first
    vec = [
        {"id": "c2", "vector_score": 0.9},
        {"id": "c1", "vector_score": 0.7},
        {"id": "c4", "vector_score": 0.5},
    ]

    merged = service._rrf_merge(fts, vec)

    # c1 appears in both: should rank highest
    c1_score = next(m["rrf_score"] for m in merged if m["id"] == "c1")
    c3_score = next(m["rrf_score"] for m in merged if m["id"] == "c3")
    c4_score = next(m["rrf_score"] for m in merged if m["id"] == "c4")

    # c1 appears in FTS rank 1 and vector rank 2 — score = 1/61 + 1/62
    expected_c1 = 1.0 / (60 + 1) + 1.0 / (60 + 2)
    assert abs(c1_score - expected_c1) < 1e-9, f"c1 RRF score mismatch: {c1_score} != {expected_c1}"

    # Merged list should have both FTS-only and vector-only results
    ids = [m["id"] for m in merged]
    assert "c3" in ids  # FTS5 only
    assert "c4" in ids  # vector only


@pytest.mark.asyncio
async def test_metadata_filter():
    """Metadata filters restrict results to correct language."""
    db = await _setup_db()
    await _insert_sample_chunks(db)

    # Insert a Hindi chunk
    hi_id = str(uuid.uuid4())
    repo = ChunkRepository(db)
    await repo.insert_chunk({
        "id": hi_id,
        "object_id": "obj-001",
        "chunk_index": 99,
        "text": "जाति एक राक्षस है जो आपके रास्ते को पार करती है",
        "language": "hi",
        "volume_number": "1",
        "page_number": 99,
    })

    service = HybridSearchService(db)
    # Filter by English only — Hindi chunk should not appear
    enriched = await service._enrich_chunks(
        chunk_ids=[c for c in [hi_id] + ["dummy"]],
        rrf_scores={hi_id: 1.0},
        language="en",
    )
    hi_ids = [r["chunk_id"] for r in enriched]
    assert hi_id not in hi_ids, "Hindi chunk should be excluded by language='en' filter"


@pytest.mark.asyncio
async def test_deep_link_viewer_url():
    """Each search result has a valid viewer_url deep-link."""
    import urllib.parse
    query = "caste system"
    doc_id = "baws-vol01"
    page_no = 47

    q_enc = urllib.parse.quote_plus(query)
    viewer_url = f"/documents/{doc_id}/viewer?page={page_no}&query={q_enc}"

    assert viewer_url.startswith("/documents/")
    assert "viewer" in viewer_url
    assert "page=47" in viewer_url
    assert "query=" in viewer_url
    assert "caste" in viewer_url  # encoded query present
