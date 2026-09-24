"""Storage API — serves and manages files from configured storage backend."""
from __future__ import annotations

import mimetypes
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.services.storage.provider import get_storage_backend

router = APIRouter(prefix="/storage", tags=["storage"])


@router.get("/{file_path:path}")
async def get_storage_file(file_path: str):
    """Retrieve a file by its storage key."""
    storage = get_storage_backend()
    exists = await storage.exists(file_path)
    if not exists:
        raise HTTPException(status_code=404, detail="File not found in storage")

    data = await storage.get(file_path)
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    return Response(content=data, media_type=mime_type)
