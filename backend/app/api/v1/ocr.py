"""
Phase 9.5: Multilingual OCR API Router
Exposes OCR baseline metrics, page OCR status, and curator review endpoints.
"""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.db.database import DatabaseClient, get_db_client
from app.services.ocr.ocr_service import MultilingualOCRService

router = APIRouter(prefix="/ocr", tags=["Multilingual OCR & Review"])


class OCRReviewRequest(BaseModel):
    document_id: str
    page_number: int
    reviewed_text: str
    reviewer: str = Field(default="archivist_curator")
    review_status: str = Field(default="OCR_REVIEWED")


@router.get("/baseline")
async def get_ocr_baseline(
    db: DatabaseClient = Depends(get_db_client),
) -> dict[str, Any]:
    """Retrieve empirical OCR baseline statistics reported separately for Hindi, Bengali, Gujarati, and Tamil."""
    svc = MultilingualOCRService(db)
    return await svc.get_baseline_report()


@router.get("/page/{document_id}/{page_number}")
async def get_page_ocr(
    document_id: str,
    page_number: int,
    db: DatabaseClient = Depends(get_db_client),
) -> dict[str, Any]:
    """Fetch OCR representation of an archival page including raw text and reviewed text."""
    svc = MultilingualOCRService(db)
    record = await svc.get_page_ocr(document_id, page_number)
    if not record:
        raise HTTPException(status_code=404, detail="Page OCR record not found")
    return record


@router.post("/review")
async def review_page_ocr(
    body: OCRReviewRequest,
    db: DatabaseClient = Depends(get_db_client),
) -> dict[str, Any]:
    """Submit curator review of OCR text without overwriting the authoritative raw OCR text."""
    svc = MultilingualOCRService(db)
    return await svc.save_review(
        document_id=body.document_id,
        page_number=body.page_number,
        reviewed_text=body.reviewed_text,
        reviewer=body.reviewer,
        review_status=body.review_status,
    )
