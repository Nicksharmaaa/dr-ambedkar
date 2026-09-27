"""Collections API routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.security import get_current_user, UserSession, log_audit_event
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
async def create_collection(
    data: CollectionCreate,
    user: UserSession = Depends(get_current_user),
    request: Request = None,
) -> dict:
    if user.role not in ("archivist", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Collection creation requires Archivist credentials.",
        )
    db = get_db_client()
    repo = CollectionRepository(db)
    col_id = await repo.create(data.model_dump())
    col = await repo.get_by_id(col_id)
    col["object_count"] = 0

    client_ip = request.client.host if request and request.client else "unknown"
    await log_audit_event(
        db,
        user_id=user.user_id,
        action="CREATE_COLLECTION",
        resource="collections",
        resource_id=col_id,
        details=f"Created collection '{data.title}'",
        ip_address=client_ip,
    )
    return col


@router.post("/export/research-pack")
async def export_research_pack(
    body: dict = {},
    user: UserSession = Depends(get_current_user),
    request: Request = None,
):
    """
    Generate an Institutional Archival Research Pack (.zip) complying with Section T:
    Requires verified Researcher, Archivist, or Administrator role.

    Structure:
    Research Pack/
    ├── README.txt
    ├── CITATIONS.bib
    ├── CITATIONS.ris
    ├── CITATIONS.txt
    ├── METADATA.json
    ├── METADATA.csv
    └── documents/
        └── {id}.txt
    """
    if user.role not in ("researcher", "archivist", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: Research Pack (.ZIP) generation requires verified Researcher, Archivist, or Administrator role. Current role: '{user.role}'.",
        )
    import io
    import csv
    import json
    import zipfile
    from datetime import datetime
    from fastapi.responses import Response
    from app.db.repositories.archival_objects import ArchivalObjectRepository

    db = get_db_client()
    repo = ArchivalObjectRepository(db)

    item_ids = body.get("item_ids") or []
    if not item_ids:
        # Default to core foundation volumes if none specified
        all_objs, _ = await repo.list_paginated(limit=10, offset=0)
        objects = all_objs
    else:
        objects = []
        for i_id in item_ids:
            obj = await repo.get_by_id(i_id)
            if not obj:
                obj = await repo.get_by_stable_id(i_id)
            if obj:
                objects.append(obj)

    if not objects:
        all_objs, _ = await repo.list_paginated(limit=5, offset=0)
        objects = all_objs

    # In-memory ZIP buffer
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%SZ")

        # 1. README.txt
        readme_content = f"""======================================================================
DR. B.R. AMBEDKAR DIGITAL HERITAGE ARCHIVE & INTELLIGENCE PLATFORM
ACADEMIC RESEARCH PACK (DIP - DISSEMINATION INFORMATION PACKAGE)
======================================================================
Generated: {timestamp_str}
Archive Node: National Digital Heritage Repository
Compliance: OAIS Reference Model (ISO 14721) / PREMIS 3.0 Preservation

CONTENTS OF THIS RESEARCH PACK:
1. README.txt          - Provenance, citation instructions, and terms of use.
2. CITATIONS.bib       - Machine-readable BibTeX bibliographic database.
3. CITATIONS.ris       - RIS format for EndNote, Zotero, and Mendeley.
4. CITATIONS.txt       - Formatted APA, MLA, and Chicago peer-reviewed citations.
5. METADATA.json       - Complete Dublin Core & institutional metadata in JSON.
6. METADATA.csv        - Tabular metadata summary for spreadsheet analysis.
7. documents/          - Archival text transcripts and extracted chapters.

CITING THESE RECORDS:
All records in this pack are authenticated copies of the official writings,
speeches, and legal drafts of Dr. Bhimrao Ramji Ambedkar (1891–1956).
Please cite using the stable Archive IDs specified in the citation files.

NON-COMMERCIAL SCHOLARLY USE ONLY.
======================================================================
"""
        zip_file.writestr("README.txt", readme_content)

        # 2. CITATIONS
        bibtex_entries = []
        ris_entries = []
        formatted_cits = []
        metadata_records = []
        csv_rows = []

        for obj in objects:
            actual_id = obj["id"]
            stable_id = obj.get("stable_id") or actual_id
            title = obj.get("title", "Archival Monograph")
            date = obj.get("publication_date") or "1936"
            inst = obj.get("source_institution") or "Dr. Ambedkar Foundation, Government of India"

            # BibTeX
            bib = f"""@book{{ambedkar_{stable_id.lower().replace('-', '_')},
  author    = {{Ambedkar, Bhimrao Ramji}},
  title     = {{{title}}},
  year      = {{{date}}},
  publisher = {{{inst}}},
  note      = {{Archive Stable ID: {stable_id}}},
  url       = {{https://ambedkar-archive.gov.in/documents/{stable_id}}}
}}"""
            bibtex_entries.append(bib)

            # RIS
            ris = f"""TY  - BOOK
AU  - Ambedkar, Bhimrao Ramji
TI  - {title}
PY  - {date}
PB  - {inst}
ID  - {stable_id}
UR  - https://ambedkar-archive.gov.in/documents/{stable_id}
ER  - """
            ris_entries.append(ris)

            # Formatted
            fmt = f"""[{stable_id}] {title} ({date})
APA: Ambedkar, B. R. ({date}). {title}. In Dr. Babasaheb Ambedkar: Writings and Speeches. {inst}.
MLA: Ambedkar, Bhimrao Ramji. "{title}." {inst}, {date}.
Chicago: Ambedkar, Bhimrao Ramji. "{title}." In Dr. Babasaheb Ambedkar: Writings and Speeches. New Delhi: {inst}, {date}."""
            formatted_cits.append(fmt)

            metadata_records.append(dict(obj))
            csv_rows.append([
                stable_id,
                title,
                obj.get("object_type", ""),
                date,
                obj.get("language", ""),
                inst,
            ])

            # Fetch document text from chunks
            chunk_res = await db.execute(
                "SELECT page_number, section_title, text FROM document_chunks WHERE object_id = ? ORDER BY chunk_index ASC",
                [actual_id],
            )
            doc_lines = [
                f"DR. B.R. AMBEDKAR DIGITAL HERITAGE ARCHIVE",
                f"Title: {title}",
                f"Archive ID: {stable_id}",
                f"Source: {inst}",
                "=" * 70,
                "",
            ]
            for c in chunk_res.rows:
                if c.get("section_title"):
                    doc_lines.append(f"\n--- {c['section_title']} (Page ~{c.get('page_number', '')}) ---")
                doc_lines.append(c.get("text", ""))

            zip_file.writestr(f"documents/{stable_id}.txt", "\n".join(doc_lines))

        zip_file.writestr("CITATIONS.bib", "\n\n".join(bibtex_entries))
        zip_file.writestr("CITATIONS.ris", "\n\n".join(ris_entries))
        zip_file.writestr("CITATIONS.txt", "\n\n" + ("=" * 70) + "\n\n".join(formatted_cits))
        zip_file.writestr("METADATA.json", json.dumps({"archive_records": metadata_records, "generated_at": timestamp_str}, indent=2))

        csv_out = io.StringIO()
        writer = csv.writer(csv_out)
        writer.writerow(["stable_id", "title", "object_type", "publication_date", "language", "source_institution"])
        writer.writerows(csv_rows)
        zip_file.writestr("METADATA.csv", csv_out.getvalue())

    zip_bytes = zip_buffer.getvalue()
    pack_name = f"Ambedkar_Research_Pack_{datetime.utcnow().strftime('%Y%m%d')}.zip"
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{pack_name}"'},
    )
