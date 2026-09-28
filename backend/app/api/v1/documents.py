"""Documents (Archival Objects) API routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.security import get_current_user, UserSession, log_audit_event
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
    try:
        chunk_res = await db.execute(
            "SELECT text, section_title AS chapter FROM document_chunks WHERE object_id = ? AND page_number = ? ORDER BY chunk_index ASC",
            [actual_id, page_number],
        )
    except Exception:
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


@router.get("/{document_id}/citations")
async def get_document_citations(document_id: str) -> dict:
    """Generate peer-reviewed academic citations in APA, MLA, Chicago, BibTeX, and RIS formats."""
    db = get_db_client()
    repo = ArchivalObjectRepository(db)
    obj = await repo.get_by_id(document_id)
    if not obj:
        obj = await repo.get_by_stable_id(document_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")

    title = obj.get("title", "Writings and Speeches")
    stable_id = obj.get("stable_id") or obj.get("id")
    date = obj.get("publication_date") or "1936"
    inst = obj.get("source_institution") or "Dr. Ambedkar Foundation, Government of India"

    apa = f"Ambedkar, B. R. ({date}). {title}. In Dr. Babasaheb Ambedkar: Writings and Speeches. {inst}. Archive Stable ID: {stable_id}."
    mla = f'Ambedkar, Bhimrao Ramji. "{title}." Dr. Babasaheb Ambedkar: Writings and Speeches, {inst}, {date}. Archive Stable ID: {stable_id}.'
    chicago = f'Ambedkar, Bhimrao Ramji. "{title}." In Dr. Babasaheb Ambedkar: Writings and Speeches. New Delhi: {inst}, {date}. Stable ID: {stable_id}.'
    bibtex = f"""@book{{ambedkar_{stable_id.lower().replace('-', '_')},
  author    = {{Ambedkar, Bhimrao Ramji}},
  title     = {{{title}}},
  year      = {{{date}}},
  publisher = {{{inst}}},
  note      = {{Archive Stable ID: {stable_id}}},
  url       = {{https://ambedkar-archive.gov.in/documents/{stable_id}}}
}}"""
    ris = f"""TY  - BOOK
AU  - Ambedkar, Bhimrao Ramji
TI  - {title}
PY  - {date}
PB  - {inst}
ID  - {stable_id}
UR  - https://ambedkar-archive.gov.in/documents/{stable_id}
ER  - """

    return {
        "document_id": stable_id,
        "title": title,
        "date": date,
        "citations": {
            "apa": apa,
            "mla": mla,
            "chicago": chicago,
            "bibtex": bibtex,
            "ris": ris,
        },
    }


@router.get("/{document_id}/export")
async def export_document(
    document_id: str,
    format: str = Query("text", pattern="^(text|json|csv|pdf|citations)$"),
    user: UserSession = Depends(get_current_user),
    request: Request = None,
):
    """
    Export archival document in multiple machine-readable and academic formats.
    Citation format is public to all visitors.
    Bulk data export (text, json, csv, pdf) requires verified researcher, archivist, or admin role.
    """
    if format in ("text", "json", "csv", "pdf"):
        if user.role not in ("researcher", "archivist", "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Bulk analytical export in '{format}' format requires verified Researcher, Archivist, or Administrator role. Current role: '{user.role}'.",
            )

    import io
    import csv
    import json
    from pathlib import Path
    from fastapi.responses import Response
    from app.core.config import settings

    db = get_db_client()
    repo = ArchivalObjectRepository(db)
    obj = await repo.get_by_id(document_id)
    if not obj:
        obj = await repo.get_by_stable_id(document_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")

    actual_id = obj["id"]
    stable_id = obj.get("stable_id") or actual_id
    title = obj.get("title", "Writings and Speeches")

    # Log audit event
    client_ip = request.client.host if request and request.client else "unknown"
    await log_audit_event(
        db,
        user_id=user.user_id,
        action="EXPORT_DOCUMENT",
        resource="documents",
        resource_id=actual_id,
        details=f"Exported format '{format}' by user '{user.username}' (role: {user.role})",
        ip_address=client_ip,
    )

    # Fetch all chunks
    chunk_res = await db.execute(
        "SELECT chunk_index, page_number, section_title, text FROM document_chunks WHERE object_id = ? ORDER BY chunk_index ASC",
        [actual_id],
    )
    chunks = chunk_res.rows

    if format == "citations":
        cits = await get_document_citations(actual_id)
        content = "\n\n".join(
            f"=== {fmt.upper()} ===\n{val}"
            for fmt, val in cits["citations"].items()
        )
        return Response(
            content=content,
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{stable_id}_citations.txt"'},
        )

    elif format == "json":
        data = {
            "document": dict(obj),
            "total_chunks": len(chunks),
            "chunks": [dict(c) for c in chunks],
            "exported_at": "2026-09-27T08:00:00Z",
            "provenance": "Ambedkar Digital Heritage Archive & Digital Preservation System",
        }
        return Response(
            content=json.dumps(data, indent=2, ensure_ascii=False),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{stable_id}_metadata.json"'},
        )

    elif format == "csv":
        out = io.StringIO()
        writer = csv.writer(out)
        writer.writerow(["document_id", "title", "chunk_index", "page_number", "section_title", "text"])
        for c in chunks:
            writer.writerow([
                stable_id,
                title,
                c.get("chunk_index", ""),
                c.get("page_number", ""),
                c.get("section_title", ""),
                c.get("text", "").replace("\n", " "),
            ])
        return Response(
            content=out.getvalue(),
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{stable_id}_extract.csv"'},
        )

    elif format == "pdf":
        # Check if original PDF exists
        storage_root = Path(settings.storage_local_root)
        pdf_candidates = [
            storage_root / "originals" / actual_id / f"{actual_id}.pdf",
            storage_root / "originals" / f"{actual_id}.pdf",
        ]
        for candidate in pdf_candidates:
            if candidate.exists():
                return Response(
                    content=candidate.read_bytes(),
                    media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="{candidate.name}"'},
                )
        # Fallback to structured text document if PDF binary not yet ingested
        text_lines = [
            f"DR. B.R. AMBEDKAR DIGITAL HERITAGE ARCHIVE",
            f"Title: {title}",
            f"Archive ID: {stable_id}",
            f"Institution: {obj.get('source_institution', 'BAWS')}",
            f"Date: {obj.get('publication_date', '1936')}",
            "=" * 70,
            "",
        ]
        for c in chunks:
            if c.get("section_title"):
                text_lines.append(f"\n--- {c['section_title']} (Page ~{c.get('page_number', '')}) ---")
            text_lines.append(c.get("text", ""))

        return Response(
            content="\n".join(text_lines),
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{stable_id}_archival_transcript.txt"'},
        )

    else:  # text
        # Full text compilation
        text_lines = [
            f"ARCHIVAL TRANSCRIPT: {title.upper()}",
            f"Stable ID: {stable_id}",
            f"Source: {obj.get('source_institution', 'Dr. Ambedkar Foundation')}",
            "=" * 70,
            "",
        ]
        for c in chunks:
            text_lines.append(c.get("text", ""))

        return Response(
            content="\n\n".join(text_lines),
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{stable_id}_full_text.txt"'},
        )


@router.post("", response_model=ArchivalObjectResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    data: ArchivalObjectCreate,
    user: UserSession = Depends(get_current_user),
    request: Request = None,
) -> dict:
    if user.role not in ("archivist", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Document creation requires Archivist credentials.",
        )
    db = get_db_client()
    repo = ArchivalObjectRepository(db)
    obj_id = await repo.create(data.model_dump())
    obj = await repo.get_by_id(obj_id)

    client_ip = request.client.host if request and request.client else "unknown"
    await log_audit_event(
        db,
        user_id=user.user_id,
        action="CREATE_DOCUMENT",
        resource="documents",
        resource_id=obj_id,
        details=f"Created document '{data.title}'",
        ip_address=client_ip,
    )
    return obj
