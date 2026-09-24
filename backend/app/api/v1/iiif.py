"""
IIIF Presentation API 3.0 & Image API Router.
Compliant endpoints providing IIIF Collections, Manifests, Canvases,
W3C Annotation Pages, and Image API descriptors for Dr. B.R. Ambedkar's archive.
"""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException, Request, Response, status
from fastapi.responses import Response

from app.db.database import get_db_client
from app.services.iiif.manifest import IIIFService

router = APIRouter(prefix="/iiif", tags=["iiif"])


def _get_service(request: Request) -> IIIFService:
    # Use request base url to ensure links match client host
    base_url = str(request.base_url).rstrip("/") + "/api/v1"
    return IIIFService(base_url=base_url, db=get_db_client())


@router.get("/collection/baws", summary="IIIF 3.0 Collection for Dr. Ambedkar Archive")
async def get_collection(request: Request) -> dict[str, Any]:
    """Retrieve top-level IIIF 3.0 Collection for the 19 Ambedkar Volumes."""
    service = _get_service(request)
    return await service.get_collection()


@router.get("/manifest/{object_id}", summary="IIIF 3.0 Manifest for Archival Volume")
async def get_manifest(object_id: str, request: Request) -> dict[str, Any]:
    """Retrieve IIIF 3.0 Manifest for a specific volume."""
    service = _get_service(request)
    manifest = await service.get_manifest(object_id)
    if not manifest:
        raise HTTPException(status_code=404, detail=f"Archival object '{object_id}' not found")
    return manifest


@router.get("/canvas/{object_id}/{page_number}", summary="IIIF 3.0 Canvas for Page")
async def get_canvas(object_id: str, page_number: int, request: Request) -> dict[str, Any]:
    """Retrieve IIIF 3.0 Canvas representing an individual archival page."""
    service = _get_service(request)
    canvas = await service.get_canvas(object_id, page_number)
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return canvas


@router.get("/annotation/{object_id}/{page_number}", summary="W3C / IIIF Annotation Page")
async def get_annotations(object_id: str, page_number: int, request: Request) -> dict[str, Any]:
    """
    Retrieve W3C / IIIF Annotation Page containing word-level OCR bounding boxes
    and spatial coordinates derived from ALTO XML.
    """
    service = _get_service(request)
    return await service.get_annotations(object_id, page_number)


@router.get("/image/{object_id}/{page_number}/info.json", summary="IIIF Image API info descriptor")
async def get_image_info(object_id: str, page_number: int, request: Request) -> dict[str, Any]:
    """Retrieve IIIF Image API 3.0 info descriptor."""
    service = _get_service(request)
    return await service.get_image_info(object_id, page_number)


@router.get("/image/{object_id}/{page_number}/page.svg", summary="Vector Page Canvas SVG")
async def get_page_svg(object_id: str, page_number: int, request: Request) -> Response:
    """
    Retrieve crisp vector SVG archival page canvas at 1800 x 2700 px resolution.
    Rendered directly from original archival text layout and ALTO bounds.
    """
    service = _get_service(request)
    svg_content = await service.generate_page_svg(object_id, page_number)
    return Response(content=svg_content, media_type="image/svg+xml")
