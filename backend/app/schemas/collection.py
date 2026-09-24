"""Pydantic schemas for Collections."""
from __future__ import annotations

from pydantic import BaseModel


class CollectionBase(BaseModel):
    title: str
    slug: str
    description: str | None = None
    display_order: int = 0
    is_public: bool = True


class CollectionCreate(CollectionBase):
    pass


class CollectionResponse(CollectionBase):
    id: str
    cover_image_key: str | None = None
    object_count: int = 0
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
