"""Documents (Archival Objects) API routes."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.db.database import get_db_client
from app.db.repositories.archival_objects import ArchivalObjectRepository
from app.db.repositories.chunks import ChunkRepository
from app.schemas.archival import ArchivalObjectCreate, ArchivalObjectResponse, PageResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=PaginatedResponse[ArchivalObjectResponse])
async def list_documents(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    object_type: str | None = Query(default=None),
    collection_id: str | None = Query(default=None),
) -> PaginatedResponse:
    db = get_db_client()
    repo = ArchivalObjectRepository(db)
    rows, total = await repo.list_paginated(
        limit=limit,
        offset=offset,
        object_type=object_type,
        collection_id=collection_id,
    )
    return PaginatedResponse.from_query(
        items=rows, total=total, limit=limit, offset=offset
    )


@router.get("/{document_id}", response_model=ArchivalObjectResponse)
async def get_document(document_id: str) -> dict:
    db = get_db_client()
    repo = ArchivalObjectRepository(db)
    obj = await repo.get_by_id(document_id)
    if not obj:
        obj = await repo.get_by_stable_id(document_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")
    return obj


@router.get("/{document_id}/pages", response_model=list[PageResponse])
async def get_document_pages(document_id: str) -> list[dict]:
    db = get_db_client()
    repo = ArchivalObjectRepository(db)
    obj = await repo.get_by_id(document_id)
    if not obj:
        obj = await repo.get_by_stable_id(document_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")
    return await repo.get_pages(obj["id"])


@router.get("/{document_id}/alto/{page_number}")
async def get_document_page_alto(document_id: str, page_number: int):
    """Serve ALTO v4.2 XML layout file for a specific document page."""
    from pathlib import Path
    from fastapi.responses import Response
    from app.core.config import settings
    from app.services.iiif.alto import generate_alto_xml

    db = get_db_client()
    repo = ArchivalObjectRepository(db)
    obj = await repo.get_by_id(document_id)
    if not obj:
        obj = await repo.get_by_stable_id(document_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")

    actual_id = obj["id"]
    alto_file = (
        Path(settings.storage_local_root)
        / "derivatives"
        / "alto"
        / actual_id
        / f"{page_number:04d}.xml"
    )

    if alto_file.exists():
        xml_content = alto_file.read_text(encoding="utf-8")
        return Response(content=xml_content, media_type="application/xml")

    # On-demand fallback generation from chunks
    chunk_res = await db.execute(
        "SELECT text, chapter FROM chunks WHERE doc_id = ? AND page_est = ? ORDER BY chunk_index ASC",
        [actual_id, page_number],
    )
    if not chunk_res.rows:
        raise HTTPException(status_code=404, detail=f"No content found for page {page_number}")

    combined = "\n\n".join(r["text"] for r in chunk_res.rows if r.get("text"))
    chapter = chunk_res.rows[0]["chapter"] if chunk_res.rows else actual_id
    xml_content = generate_alto_xml(
        doc_id=actual_id,
        page_number=page_number,
        page_id=f"{actual_id}_p{page_number:04d}",
        text=combined,
        chapter_title=chapter,
    )
    return Response(content=xml_content, media_type="application/xml")


@router.get("/{document_id}/chunks")
async def get_document_chunks(
    document_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> PaginatedResponse:
    db = get_db_client()
    obj_repo = ArchivalObjectRepository(db)
    obj = await obj_repo.get_by_id(document_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")

    chunk_repo = ChunkRepository(db)
    chunks = await chunk_repo.get_chunks_for_object(document_id, limit=limit, offset=offset)
    total = await chunk_repo.count_for_object(document_id)
    return PaginatedResponse.from_query(items=chunks, total=total, limit=limit, offset=offset)


@router.post("", response_model=ArchivalObjectResponse, status_code=status.HTTP_201_CREATED)
async def create_document(data: ArchivalObjectCreate) -> dict:
    db = get_db_client()
    repo = ArchivalObjectRepository(db)
    obj_id = await repo.create(data.model_dump())
    obj = await repo.get_by_id(obj_id)
    return obj
