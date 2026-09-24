"""
Phase 9: Multimodal Page Understanding API Endpoints
Provides visual structure analysis and OCR conflict detection for difficult page scans.
"""
from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Body

from app.db.database import get_db_client
from app.services.multimodal.page_analyzer import MultimodalPageService

router = APIRouter(prefix="/multimodal", tags=["multimodal-vision"])


@router.post("/analyze-page")
async def analyze_page_facsimile(
    object_id: str = Body(..., embed=True),
    page_number: int = Body(..., embed=True),
) -> dict:
    """
    Perform visual reasoning and OCR conflict detection on an archival page scan.
    Examines layout structure, footnotes, signatures, and transcription conflicts.
    """
    db = get_db_client()
    service = MultimodalPageService(db)
    return await service.analyze_page(object_id=object_id, page_number=page_number)
