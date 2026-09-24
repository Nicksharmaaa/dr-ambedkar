"""
Tests: Health endpoints.
Uses httpx AsyncClient to test the live FastAPI app.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="module")
async def client():
    import sys
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from app.main import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.anyio
async def test_health_basic(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "ambedkar-heritage-api"
    assert "version" in data


@pytest.mark.anyio
async def test_health_database(client):
    resp = await client.get("/api/v1/health/database")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("ok", "error")  # ok if DB reachable
    assert "database_url" in data


@pytest.mark.anyio
async def test_health_storage(client):
    resp = await client.get("/api/v1/health/storage")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("ok", "error")
    assert "backend" in data


@pytest.mark.anyio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    assert "service" in resp.json()
