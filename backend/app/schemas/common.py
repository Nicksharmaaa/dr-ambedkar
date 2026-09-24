"""Common shared Pydantic schemas."""
from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int
    has_more: bool = Field(default=False)

    @classmethod
    def from_query(
        cls, items: list[T], total: int, limit: int, offset: int
    ) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            limit=limit,
            offset=offset,
            has_more=(offset + limit) < total,
        )


class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
    code: str | None = None


class MessageResponse(BaseModel):
    message: str
    success: bool = True
