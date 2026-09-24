"""Pydantic schemas for Archival Objects and Pages."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ArchivalObjectBase(BaseModel):
    title: str
    subtitle: str | None = None
    object_type: str = "book"
    language: str = "en"
    source_institution: str = ""
    provenance: str = ""
    rights_status: str = "unknown"
    creator: str | None = None
    publisher: str | None = None
    publication_date: str | None = None
    description: str | None = None
    subject_keywords: str | None = None


class ArchivalObjectCreate(ArchivalObjectBase):
    collection_id: str | None = None
    stable_id: str | None = None


class ArchivalObjectResponse(ArchivalObjectBase):
    id: str
    stable_id: str
    collection_id: str | None = None
    review_status: str
    publication_status: str
    page_count: int | None = None
    file_hash: str | None = None
    file_size_bytes: int | None = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class PageResponse(BaseModel):
    id: str
    object_id: str
    page_number: int
    label: str | None = None
    image_file_key: str | None = None
    thumbnail_key: str | None = None
    ocr_confidence: float | None = None
    processing_status: str
    created_at: str

    model_config = {"from_attributes": True}
