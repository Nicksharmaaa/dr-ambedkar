"""
Phase 9: Speech-to-Text (ASR) Provider & Voice Ingestion
Implements ASRProvider abstraction utilizing Groq Whisper Large v3 for ultra-low latency,
timestamped Indic and English speech recognition with resilience against silence and noise.
"""
from __future__ import annotations

import io
import json
import logging
from typing import Any, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger("ambedkar.media.asr")


class ASRProvider:
    """Speech recognition provider using Groq Whisper Large v3."""

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or settings.groq_api_key

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        language: str | None = None,
        prompt: str | None = None,
    ) -> dict[str, Any]:
        """
        Transcribes audio bytes with word and segment timestamps.
        Handles English, Hindi, and Marathi natively.
        """
        if not self.api_key:
            return {
                "text": "",
                "language": "en",
                "segments": [],
                "error": "Groq API key not configured",
            }

        if len(audio_bytes) < 500:
            return {
                "text": "",
                "language": "en",
                "segments": [],
                "error": "Audio stream too short or silent",
            }

        url = "https://api.groq.com/openai/v1/audio/transcriptions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }

        # Multi-part form data
        data = {
            "model": "whisper-large-v3-turbo",
            "response_format": "verbose_json",
            "temperature": "0.0",
        }
        if language and language in ("en", "hi", "mr"):
            data["language"] = language
        if prompt:
            data["prompt"] = prompt
        else:
            data["prompt"] = "Dr. B.R. Ambedkar, Constitution, Mahad Satyagraha, Dhamma, Annihilation of Caste"

        files = {
            "file": (filename, audio_bytes, "audio/wav"),
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, headers=headers, data=data, files=files)
                if res.status_code == 200:
                    resp_json = res.json()
                    transcribed_text = resp_json.get("text", "").strip()
                    detected_lang = resp_json.get("language", language or "en")
                    raw_segments = resp_json.get("segments", [])

                    segments = []
                    for s in raw_segments:
                        segments.append({
                            "start": round(s.get("start", 0.0), 2),
                            "end": round(s.get("end", 0.0), 2),
                            "text": s.get("text", "").strip(),
                        })

                    return {
                        "text": transcribed_text,
                        "language": detected_lang,
                        "segments": segments,
                        "duration": resp_json.get("duration", 0.0),
                    }
                else:
                    logger.warning("Groq Whisper returned HTTP %d: %s", res.status_code, res.text)
                    return {
                        "text": "",
                        "language": language or "en",
                        "segments": [],
                        "error": f"ASR provider error: HTTP {res.status_code}",
                    }
        except Exception as e:
            logger.error("ASR transcription error: %s", e)
            return {
                "text": "",
                "language": language or "en",
                "segments": [],
                "error": str(e),
            }
