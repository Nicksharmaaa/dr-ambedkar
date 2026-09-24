"""
Phase 9: Indic Multilingual & Speech Synthesis API Endpoints
Provides translation, neural text-to-speech audio streaming, and localized metadata.
"""
from __future__ import annotations

import os
from fastapi import APIRouter, HTTPException, Query, Path, Body
from fastapi.responses import FileResponse

from app.db.database import get_db_client
from app.services.multilingual.models import (
    TranslationRequest,
    TranslationResponse,
)
from app.services.multilingual.translator import TranslationService
from app.services.media.tts_service import TTSService, NARRATION_DIR

router = APIRouter(prefix="/indic", tags=["indic-multilingual"])


@router.post("/translate", response_model=TranslationResponse)
async def translate_text(req: TranslationRequest) -> TranslationResponse:
    """
    Translate archival text between English, Hindi, and Marathi.
    Results are cached with SHA-256 hash in translations_cache table.
    """
    db = get_db_client()
    service = TranslationService(db)
    return await service.translate(
        text=req.text,
        target_language=req.target_language,
        source_language=req.source_language,
        chunk_id=req.chunk_id,
    )


@router.post("/tts/synthesize")
async def synthesize_speech(
    text: str = Body(..., embed=True),
    language: str = Body("en", embed=True),
    gender: str = Body("female", embed=True),
) -> dict:
    """
    Synthesize high-fidelity neural speech narration in English, Hindi, or Marathi.
    Caches audio in tts_cache and storage/local/audio/narration/.
    """
    db = get_db_client()
    service = TTSService(db)
    result = await service.synthesize(text=text, language=language, gender=gender)
    if "error" in result and not result.get("audio_url"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/tts/audio/{filename}")
async def stream_narration_audio(filename: str = Path(...)):
    """Stream generated narration MP3 file."""
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(NARRATION_DIR, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/mpeg", filename=safe_filename)


@router.get("/localizations/entities/{id}")
async def get_entity_localizations(id: str = Path(...)) -> dict:
    """Fetch localized names in Hindi and Marathi for a knowledge graph entity."""
    db = get_db_client()
    res = await db.execute(
        "SELECT language, localized_name, localized_description FROM entity_localizations WHERE entity_id = ?",
        [id],
    )
    return {
        "entity_id": id,
        "localizations": [dict(r) for r in res.rows],
    }


@router.get("/localizations/timeline/{id}")
async def get_timeline_localizations(id: str = Path(...)) -> dict:
    """Fetch localized titles in Hindi and Marathi for a timeline event."""
    db = get_db_client()
    res = await db.execute(
        "SELECT language, localized_title, localized_description FROM timeline_localizations WHERE event_id = ?",
        [id],
    )
    return {
        "event_id": id,
        "localizations": [dict(r) for r in res.rows],
    }
