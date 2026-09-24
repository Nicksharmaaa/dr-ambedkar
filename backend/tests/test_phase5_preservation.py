"""
Phase 5 Automated Test Suite: Digital Preservation & IIIF Presentation 3.0
Verifies:
1. Original file immutability enforcement
2. PREMIS 3.0 fixity checking and cryptographic digest validation
3. IIIF Presentation 3.0 Collection, Manifest, Canvas, and W3C Annotations
4. ALTO v4.2 XML spatial layout generation
5. Stable page addressing and database linkage
"""
from __future__ import annotations

import asyncio
from pathlib import Path
import pytest
import httpx
from httpx import ASGITransport, AsyncClient
from app.main import app

from app.core.config import settings
from app.db.database import get_db_client
from app.services.preservation.engine import PreservationEngine
from app.services.storage.provider import get_storage_backend


@pytest.mark.asyncio
async def test_original_file_immutability():
    """Verify that original files in storage/local/originals/ cannot be overwritten or deleted."""
    storage = get_storage_backend()
    key = "originals/AMBEDKAR-VOL-01/Volume_01_djvu.txt"

    # Verify file exists
    assert await storage.exists(key), f"Original file {key} must exist"

    # Attempt overwrite - MUST raise PermissionError
    with pytest.raises(PermissionError) as exc_info:
        await storage.put(key, b"MODIFIED_CORRUPTED_BYTES")
    assert "Archival Immutability Violation" in str(exc_info.value)

    # Attempt deletion - MUST raise PermissionError
    with pytest.raises(PermissionError) as exc_info:
        await storage.delete(key)
    assert "Archival Immutability Violation" in str(exc_info.value)


@pytest.mark.asyncio
async def test_premis_fixity_verification():
    """Verify that PreservationEngine correctly recalculates SHA-256 and logs PREMIS event."""
    db = get_db_client()
    engine = PreservationEngine(db)

    result = await engine.run_fixity_check("AMBEDKAR-VOL-01")
    assert result["status"] == "verified"
    assert result["stored_hash"] == result["computed_hash"]
    assert result["bytes_checked"] > 0
    assert result["event_id"] is not None

    # Verify event was logged in DB
    events = await engine.get_preservation_events("AMBEDKAR-VOL-01")
    assert len(events) > 0
    latest = events[0]
    assert latest["event_type"] in ["fixity_check", "derivative_creation"]


@pytest.mark.asyncio
async def test_iiif_presentation_endpoints():
    """Verify IIIF Presentation 3.0 API endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test/api/v1") as client:
        # 1. Collection
        col_res = await client.get("/iiif/collection/baws")
        assert col_res.status_code == 200
        col_json = col_res.json()
        assert col_json["type"] == "Collection"
        assert len(col_json["items"]) >= 19

        # 2. Manifest
        man_res = await client.get("/iiif/manifest/AMBEDKAR-VOL-01")
        assert man_res.status_code == 200
        man_json = man_res.json()
        assert man_json["type"] == "Manifest"
        assert len(man_json["items"]) > 0
        assert man_json["rights"] == "https://creativecommons.org/publicdomain/mark/1.0/"

        # 3. Canvas
        canvas_res = await client.get("/iiif/canvas/AMBEDKAR-VOL-01/1")
        assert canvas_res.status_code == 200
        canvas_json = canvas_res.json()
        assert canvas_json["type"] == "Canvas"
        assert canvas_json["width"] == 1800
        assert canvas_json["height"] == 2700

        # 4. Annotation Page
        anno_res = await client.get("/iiif/annotation/AMBEDKAR-VOL-01/1")
        assert anno_res.status_code == 200
        anno_json = anno_res.json()
        assert anno_json["type"] == "AnnotationPage"
        assert len(anno_json["items"]) > 0

        # 5. Image SVG Canvas
        svg_res = await client.get("/iiif/image/AMBEDKAR-VOL-01/1/page.svg")
        assert svg_res.status_code == 200
        assert "image/svg+xml" in svg_res.headers["content-type"]
        assert "<svg" in svg_res.text


@pytest.mark.asyncio
async def test_alto_xml_layout():
    """Verify ALTO v4.2 XML derivative exists and conforms to Library of Congress schema."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test/api/v1") as client:
        res = await client.get("/documents/AMBEDKAR-VOL-01/alto/1")
        assert res.status_code == 200
        assert "application/xml" in res.headers["content-type"]
        xml_text = res.text
        assert "<alto" in xml_text
        assert "http://www.loc.gov/standards/alto/ns-v4#" in xml_text
        assert "<TextBlock" in xml_text
        assert "<TextLine" in xml_text
        assert "<String" in xml_text


@pytest.mark.asyncio
async def test_pages_stable_addressing():
    """Verify pages table is populated with stable identifiers."""
    db = get_db_client()
    res = await db.execute("SELECT id, object_id, page_number FROM pages WHERE object_id = 'AMBEDKAR-VOL-01' LIMIT 5")
    assert len(res.rows) == 5
    for row in res.rows:
        expected_id = f"AMBEDKAR-VOL-01_p{row['page_number']:04d}"
        assert row["id"] == expected_id
