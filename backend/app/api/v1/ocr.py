"""
Phase 9.5: Multilingual OCR API Router
Exposes OCR baseline metrics, page OCR status, and curator review endpoints.
"""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field

from app.core.security import get_current_user, UserSession, log_audit_event
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
    user: UserSession = Depends(get_current_user),
    request: Request = None,
    db: DatabaseClient = Depends(get_db_client),
) -> dict[str, Any]:
    """Submit curator review of OCR text without overwriting the authoritative raw OCR text."""
    if user.role not in ("archivist", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: OCR review and correction requires Archivist or Administrator credentials.",
        )

    svc = MultilingualOCRService(db)
    res = await svc.save_review(
        document_id=body.document_id,
        page_number=body.page_number,
        reviewed_text=body.reviewed_text,
        reviewer=user.username or body.reviewer,
        review_status=body.review_status,
    )

    client_ip = request.client.host if request and request.client else "unknown"
    await log_audit_event(
        db,
        user_id=user.user_id,
        action="OCR_REVIEW",
        resource="ocr_pages",
        resource_id=f"{body.document_id}_p{body.page_number}",
        details=f"Reviewed OCR page {body.page_number} of {body.document_id} with status {body.review_status}",
        ip_address=client_ip,
    )
    return res
