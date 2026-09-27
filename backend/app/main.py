"""
Ambedkar Heritage Intelligence & Digital Preservation System
FastAPI Main Application — Phase 2
Python 3.14 | FastAPI 0.141+ | Pydantic v2 | Turso (libsql-client 0.3.1)
Phase 3: Archival Ingestion Pipeline
"""
from __future__ import annotations

import re
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.db.database import close_db_client, get_db_client
from app.api.v1 import (
    health, collections, documents, search, admin, storage,
    ingestion, corpus, preservation, iiif, assistant,
    graph, timeline, stories,
    indic, voice, media, multimodal,
    ocr, multilingual_corpus,
    hardware, kiosk, auth,
)

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle."""
    # Safe URL masking for logging
    safe_db_url = re.sub(r"://([^:]+):([^@]+)@", r"://\1:***@", settings.turso_db_url).split("?")[0]
    logger.info(
        "Starting Ambedkar Heritage API",
        env=settings.app_env,
        db_url=safe_db_url,
        storage=settings.storage_backend,
    )

    # Pre-initialize DB client at startup to surface connection errors early
    try:
        db = get_db_client()
        await db.execute("SELECT 1")
        logger.info("Database connection OK")
    except Exception as e:
        logger.error("Database connection FAILED at startup", error=str(e))
        # Continue anyway — health endpoint will report the error

    yield

    # Shutdown
    logger.info("Shutting down Ambedkar Heritage API")
    await close_db_client()


app = FastAPI(
    title="Ambedkar Heritage Intelligence API",
    description=(
        "AI-powered institutional archive for Dr. B.R. Ambedkar's writings and speeches. "
        "Archival corpus is the source of truth. Zero hallucination policy."
    ),
    version="0.9.5-phase9.5",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Router (v1) ────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(health.router,       prefix=PREFIX)
app.include_router(auth.router,         prefix=PREFIX)
app.include_router(collections.router,  prefix=PREFIX)
app.include_router(documents.router,    prefix=PREFIX)
app.include_router(search.router,       prefix=PREFIX)
app.include_router(admin.router,        prefix=PREFIX)
app.include_router(storage.router,      prefix=PREFIX)
app.include_router(ingestion.router,    prefix=PREFIX)
app.include_router(corpus.router,       prefix=PREFIX)
app.include_router(preservation.router, prefix=PREFIX)
app.include_router(iiif.router,         prefix=PREFIX)
app.include_router(assistant.router,    prefix=PREFIX)
app.include_router(graph.router,        prefix=PREFIX)
app.include_router(timeline.router,     prefix=PREFIX)
app.include_router(stories.router,      prefix=PREFIX)
app.include_router(indic.router,        prefix=PREFIX)
app.include_router(voice.router,        prefix=PREFIX)
app.include_router(media.router,               prefix=PREFIX)
app.include_router(multimodal.router,          prefix=PREFIX)
app.include_router(ocr.router,                 prefix=PREFIX)
app.include_router(multilingual_corpus.router, prefix=PREFIX)
app.include_router(hardware.router,            prefix=PREFIX)
app.include_router(kiosk.router,               prefix=PREFIX)

# Mount local storage for direct media streaming
from fastapi.staticfiles import StaticFiles
from pathlib import Path
_storage_dir = Path(__file__).resolve().parent.parent / "storage" / "local"
if _storage_dir.exists():
    app.mount("/storage/local", StaticFiles(directory=str(_storage_dir)), name="storage_local")


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception", path=str(request.url), error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


# ── Root redirect ─────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root() -> dict:
    return {
        "service": "ambedkar-heritage-api",
        "version": "0.9.5-phase9.5",
        "docs": "/api/docs",
        "health": "/api/v1/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.is_development,
        log_level=settings.log_level.lower(),
    )
