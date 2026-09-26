"""
Phase 9.5: Multilingual Corpus & Alignment API Router
Exposes:
- Corpus inventory and manifest access
- Master canonical works
- Translation & edition relationships
- Cross-language passage alignments
- Corpus Dashboard statistics
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from fastapi import APIRouter, Depends, Query, HTTPException

from app.db.database import DatabaseClient, get_db_client

router = APIRouter(prefix="/multilingual-corpus", tags=["Multilingual Corpus & Alignment"])
MANIFEST_PATH = Path(r"c:\dr ambedkar\multilingual_books_writings_manifest.json")


@router.get("/dashboard")
async def get_corpus_dashboard(
    db: DatabaseClient = Depends(get_db_client),
) -> dict[str, Any]:
    """Retrieve aggregate statistics for the multilingual Books & Writings corpus dashboard."""
    # Query Turso tables
    m_count = await db.execute("SELECT COUNT(*) as n FROM work_manifests")
    w_count = await db.execute("SELECT COUNT(*) as n FROM multilingual_works")
    r_count = await db.execute("SELECT COUNT(*) as n FROM work_relationships")
    a_count = await db.execute("SELECT COUNT(*) as n FROM work_alignments")
    o_count = await db.execute("SELECT COUNT(*) as n FROM ocr_pages")
    
    # By language counts
    lang_stats = await db.execute(
        """
        SELECT language, COUNT(*) as doc_count, SUM(page_count) as total_pages,
               SUM(file_size_bytes) as total_bytes, MAX(text_authority) as text_authority
        FROM work_manifests
        GROUP BY language
        ORDER BY language
        """
    )
    
    LANG_NAME_MAP = {"en": "english", "hi": "hindi", "bn": "bengali", "gu": "gujarati", "ta": "tamil"}
    languages_data = {}
    for row in lang_stats.rows:
        lang = row["language"]
        entry = {
            "document_count": row["doc_count"],
            "files": row["doc_count"],
            "total_pages": row["total_pages"],
            "total_size_mb": round(row["total_bytes"] / (1024 * 1024), 2),
            "text_authority": row["text_authority"]
        }
        languages_data[lang] = entry
        full_name = LANG_NAME_MAP.get(lang)
        if full_name and full_name != lang:
            languages_data[full_name] = entry
        
    return {
        "status": "ready",
        "corpus_name": "books_and_writings",
        "total_documents": m_count.first()["n"],
        "total_canonical_works": w_count.first()["n"],
        "total_relationships": r_count.first()["n"],
        "total_alignments": a_count.first()["n"],
        "total_ocr_reviewed_pages": o_count.first()["n"],
        "total_scanned_indic_pages": 35371,
        "languages": languages_data,
        "authority_counts": {
            "SOURCE_TEXT": 19,
            "SCANNED_FACSIMILE": 93
        },
        "format_breakdown": {
            "en": {"format": "TXT", "pages": 12154, "nature": "BORN_DIGITAL_TEXT"},
            "hi": {"format": "PDF", "pages": 14431, "nature": "SCANNED_FACSIMILE"},
            "bn": {"format": "PDF", "pages": 4863, "nature": "SCANNED_FACSIMILE"},
            "gu": {"format": "PDF", "pages": 3353, "nature": "SCANNED_FACSIMILE"},
            "ta": {"format": "PDF", "pages": 12724, "nature": "SCANNED_FACSIMILE"}
        }
    }


@router.get("/works")
async def list_canonical_works(
    db: DatabaseClient = Depends(get_db_client),
) -> list[dict[str, Any]]:
    """List canonical creative works of Dr. B.R. Ambedkar."""
    res = await db.execute("SELECT * FROM multilingual_works ORDER BY canonical_title")
    return [dict(r) for r in res.rows]


@router.get("/relationships")
async def list_work_relationships(
    work_id: str | None = None,
    relationship_type: str | None = None,
    verification_status: str | None = None,
    db: DatabaseClient = Depends(get_db_client),
) -> list[dict[str, Any]]:
    """List cross-document relationships (same_work, edition_of, translation_of)."""
    query = """
        SELECT r.*,
               sm.filename as source_filename, sm.language as source_language,
               tm.filename as target_filename, tm.language as target_language,
               w.canonical_title as work_title
        FROM work_relationships r
        LEFT JOIN work_manifests sm ON r.source_document_id = sm.archival_id
        LEFT JOIN work_manifests tm ON r.target_document_id = tm.archival_id
        LEFT JOIN multilingual_works w ON r.work_id = w.id
        WHERE 1=1
    """
    params = []
    if work_id:
        query += " AND r.work_id = ?"
        params.append(work_id)
    if relationship_type:
        query += " AND r.relationship_type = ?"
        params.append(relationship_type)
    if verification_status:
        query += " AND r.verification_status = ?"
        params.append(verification_status)
        
    res = await db.execute(query, params)
    return [dict(r) for r in res.rows]


@router.get("/alignments")
async def list_work_alignments(
    work_id: str | None = None,
    target_language: str | None = None,
    db: DatabaseClient = Depends(get_db_client),
) -> list[dict[str, Any]]:
    """List verified and candidate cross-lingual segment alignments."""
    query = "SELECT * FROM work_alignments WHERE 1=1"
    params = []
    if work_id:
        query += " AND work_id = ?"
        params.append(work_id)
    if target_language:
        query += " AND target_language = ?"
        params.append(target_language)
        
    res = await db.execute(query, params)
    return [dict(r) for r in res.rows]


@router.get("/documents")
async def list_manifest_documents(
    language: str | None = None,
    format_nature: str | None = None,
    db: DatabaseClient = Depends(get_db_client),
) -> list[dict[str, Any]]:
    """List documents in the multilingual books & writings corpus."""
    LANG_ALIAS = {
        "tamil": "ta", "bengali": "bn", "gujarati": "gu", "gujrati": "gu", "hindi": "hi", "english": "en",
        "ta": "tamil", "bn": "bengali", "gu": "gujarati", "hi": "hindi", "en": "english"
    }
    query = "SELECT * FROM work_manifests WHERE 1=1"
    params = []
    if language:
        l_norm = language.lower().strip()
        alt = LANG_ALIAS.get(l_norm)
        if alt:
            query += " AND (language = ? OR language = ?)"
            params.extend([l_norm, alt])
        else:
            query += " AND language = ?"
            params.append(l_norm)
    if format_nature:
        query += " AND format_nature = ?"
        params.append(format_nature)
    query += " ORDER BY language, filename"
    
    res = await db.execute(query, params)
    return [dict(r) for r in res.rows]
