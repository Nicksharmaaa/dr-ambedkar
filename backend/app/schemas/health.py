"""Pydantic schemas for health endpoints."""
from __future__ import annotations

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


class DatabaseHealthResponse(BaseModel):
    status: str
    database_url: str       # masked — no auth token shown
    latency_ms: float | None = None
    tables_verified: list[str] | None = None
    error: str | None = None


class StorageHealthResponse(BaseModel):
    status: str
    backend: str
    root: str | None = None
    write_test: bool = False
    read_test: bool = False
    delete_test: bool = False
    error: str | None = None
