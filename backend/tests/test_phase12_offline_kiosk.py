"""
Phase 12 Test Suite — Museum Kiosk & Offline Synchronization Manifests
Validates:
  - Kiosk sync manifest metadata and version negotiation
  - Offline content package generation with cryptographic checksum
  - Mandatory offline AI abstention policy declaration
  - Offline route availability for museum deployment
"""
from __future__ import annotations

import hashlib
import json
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_kiosk_sync_manifest():
    """Verify kiosk manifest returns versioning, sync status, and mandatory abstention policy."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/kiosk/manifest")

    assert response.status_code == 200
    data = response.json()

    assert "content_version" in data
    assert "metadata_version" in data
    assert data["sync_status"] == "SYNCHRONIZED"
    assert data["offline_ai_policy"] == "MANDATORY_ABSTENTION_WHEN_DISCONNECTED"

    # Route declarations
    routes = data["critical_offline_routes"]
    assert "/kiosk" in routes
    assert "/documents" in routes
    assert "/timeline" in routes
    assert "/stories" in routes

    # Counts
    counts = data["counts"]
    assert "canonical_works" in counts
    assert "registered_documents" in counts
    assert counts["canonical_works"] >= 1


@pytest.mark.asyncio
async def test_kiosk_offline_package_generation():
    """Verify offline package generates valid bundle with cryptographic verification."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/kiosk/offline-package")

    assert response.status_code == 200
    payload = response.json()

    assert "bundle_sha256" in payload
    assert len(payload["bundle_sha256"]) == 64  # SHA-256 hex length
    assert payload["total_works"] >= 1
    assert payload["total_events"] >= 1
    assert payload["total_stories"] >= 1

    package_data = payload["data"]
    assert "works" in package_data
    assert "timeline_events" in package_data
    assert "stories" in package_data

    # Cryptographic integrity check: Verify SHA256 of JSON matches bundle_sha256
    raw_bytes = json.dumps(package_data, sort_keys=True).encode("utf-8")
    expected_hash = hashlib.sha256(raw_bytes).hexdigest()
    assert payload["bundle_sha256"] == expected_hash
