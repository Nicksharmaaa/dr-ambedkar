"""
Phase 9: Voice Search & Speech-to-Text API Endpoints
Accepts audio file recordings, transcribes with word-level timestamps using Whisper Large v3,
and normalizes queries for the archive search engine.
"""
from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException

from app.services.media.asr_service import ASRProvider

router = APIRouter(prefix="/voice", tags=["voice-search"])


@router.post("/transcribe")
async def transcribe_voice_query(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
) -> dict:
    """
    Transcribe spoken query via Groq Whisper Large v3.
    Returns recognized text, language detection, duration, and timestamped segments.
    """
    contents = await audio.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty audio recording submitted.")

    provider = ASRProvider()
    result = await provider.transcribe(
        audio_bytes=contents,
        filename=audio.filename or "recording.wav",
        language=language,
    )

    if result.get("error") and not result.get("text"):
        raise HTTPException(status_code=500, detail=result["error"])

    return result
