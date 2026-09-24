"""Collections API routes."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.db.database import get_db_client
from app.db.repositories.collections import CollectionRepository
from app.schemas.collection import CollectionCreate, CollectionResponse

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("", response_model=list[CollectionResponse])
async def list_collections() -> list[dict]:
    db = get_db_client()
    repo = CollectionRepository(db)
    collections = await repo.list_public()
    # Attach object counts
    result = []
    for col in collections:
        col["object_count"] = await repo.count_objects(col["id"])
        result.append(col)
    return result


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(collection_id: str) -> dict:
    db = get_db_client()
    repo = CollectionRepository(db)
    col = await repo.get_by_id(collection_id)
    if not col:
        col = await repo.get_by_slug(collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    col["object_count"] = await repo.count_objects(col["id"])
    return col


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(data: CollectionCreate) -> dict:
    db = get_db_client()
    repo = CollectionRepository(db)
    col_id = await repo.create(data.model_dump())
    col = await repo.get_by_id(col_id)
    col["object_count"] = 0
    return col
