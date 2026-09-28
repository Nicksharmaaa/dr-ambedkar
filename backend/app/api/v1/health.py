"""
Health API Routes.
GET /api/v1/health          — basic service health
GET /api/v1/health/database — live Turso DB query
GET /api/v1/health/storage  — storage read/write smoke test
"""
from __future__ import annotations

import time
import uuid

from fastapi import APIRouter

from app.core.config import settings
from app.db.database import get_db_client
from app.schemas.health import DatabaseHealthResponse, HealthResponse, StorageHealthResponse
from app.services.storage.provider import get_storage_backend

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Basic service liveness check."""
    return HealthResponse(
        status="ok",
        service="ambedkar-heritage-api",
        version="0.2.0-phase2",
        environment=settings.app_env,
    )


@router.get("/database", response_model=DatabaseHealthResponse)
async def health_database() -> DatabaseHealthResponse:
    """
    Test live Turso database connection.
    Executes a trivial SELECT 1 and optionally checks for the schema_migrations table.
    """
    db = get_db_client()

    # Mask URL — remove auth token from display
    url_display = settings.turso_db_url.split("?")[0]
    if "@" in url_display:
        url_display = url_display.split("@")[-1]

    start = time.monotonic()
    try:
        # Ping
        await db.execute("SELECT 1")
        latency_ms = (time.monotonic() - start) * 1000

        # Verify critical tables exist (compatible with PostgreSQL and Turso/SQLite)
        is_postgres = hasattr(db, "_pool") or "postgres" in str(type(db)).lower()
        if is_postgres:
            tables_result = await db.execute(
                "SELECT table_name AS name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
            )
        else:
            try:
                tables_result = await db.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
                )
            except Exception:
                tables_result = await db.execute(
                    "SELECT table_name AS name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
                )
        table_names = [row["name"] for row in tables_result.rows]

        return DatabaseHealthResponse(
            status="ok",
            database_url=url_display,
            latency_ms=round(latency_ms, 2),
            tables_verified=table_names[:10],  # show up to 10 table names
        )
    except Exception as e:
        latency_ms = (time.monotonic() - start) * 1000
        return DatabaseHealthResponse(
            status="error",
            database_url=url_display,
            latency_ms=round(latency_ms, 2),
            error=str(e),
        )


@router.get("/storage", response_model=StorageHealthResponse)
async def health_storage() -> StorageHealthResponse:
    """
    Storage backend smoke test.
    Writes a tiny test file, reads it back, deletes it.
    """
    storage = get_storage_backend()
    backend_name = type(storage).__name__
    root_display = str(settings.storage_local_root) if settings.storage_backend == "LOCAL" else settings.storage_s3_bucket

    test_key = f"_health_check/{uuid.uuid4().hex}.txt"
    test_data = b"ambedkar-heritage-health-check"

    write_ok = False
    read_ok = False
    delete_ok = False
    error: str | None = None

    try:
        await storage.put(test_key, test_data, "text/plain")
        write_ok = True

        data = await storage.get(test_key)
        read_ok = data == test_data

        await storage.delete(test_key)
        delete_ok = not await storage.exists(test_key)

    except Exception as e:
        error = str(e)

    status = "ok" if (write_ok and read_ok and delete_ok) else "error"

    return StorageHealthResponse(
        status=status,
        backend=backend_name,
        root=root_display,
        write_test=write_ok,
        read_test=read_ok,
        delete_test=delete_ok,
        error=error,
    )
