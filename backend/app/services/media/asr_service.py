"""
Phase 9: Speech-to-Text (ASR) Provider & Voice Ingestion
Implements ASRProvider abstraction utilizing Sarvam AI (Saaras v3) and ElevenLabs (Scribe v1)
for ultra-low latency, timestamped Indic and English speech recognition with resilience against noise.
NO Groq dependency for voice.
"""
from __future__ import annotations

import io
import json
import logging
from typing import Any, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger("ambedkar.media.asr")

# BCP-47 language mappings for Sarvam Saaras
SARVAM_ASR_LANG_MAP: dict[str, str] = {
    "hi": "hi-IN",
    "mr": "mr-IN",
    "en": "en-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "pa": "pa-IN",
    "od": "od-IN",
}


class ASRProvider:
    """
    Speech recognition provider using Sarvam AI (Saaras v3) and ElevenLabs (Scribe v1).
    Routes Indic languages and Indian English to Sarvam Saaras v3;
    Routes English to ElevenLabs Scribe v1 when available, with automatic cross-fallback.
    """

    def __init__(
        self,
        sarvam_api_key: str | None = None,
        elevenlabs_api_key: str | None = None,
    ) -> None:
        self.sarvam_api_key = sarvam_api_key or settings.sarvam_api_key
        self.elevenlabs_api_key = elevenlabs_api_key or settings.elevenlabs_api_key

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        language: str | None = None,
        prompt: str | None = None,
    ) -> dict[str, Any]:
        """
        Transcribes audio bytes with word and segment timestamps using Sarvam AI or ElevenLabs.
        Zero Groq calls.
        """
        if len(audio_bytes) < 500:
            return {
                "text": "",
                "language": language or "en",
                "segments": [],
                "error": "Audio stream too short or silent",
            }

        # Determine MIME type from magic bytes or filename
        mime_type = "audio/wav"
        if audio_bytes[:4] == b"\x1a\x45\xdf\xa3":
            mime_type = "audio/webm"
            if not filename.endswith(".webm"):
                filename = "audio.webm"
        elif audio_bytes[:4] == b"OggS":
            mime_type = "audio/ogg"
            if not filename.endswith(".ogg"):
                filename = "audio.ogg"
        elif filename.endswith(".webm"):
            mime_type = "audio/webm"
        elif filename.endswith(".mp3"):
            mime_type = "audio/mpeg"

        norm_lang = (language or "en").strip().lower()
        if "-" in norm_lang:
            norm_lang = norm_lang.split("-")[0]

        # 1. Primary Strategy:
        # If language is English and ElevenLabs key is present, try ElevenLabs Scribe first,
        # otherwise use Sarvam AI Saaras v3 (which excels at Indic + Indian English).
        if norm_lang == "en" and self.elevenlabs_api_key:
            res = await self._transcribe_elevenlabs(audio_bytes, filename, mime_type, norm_lang)
            if res.get("text"):
                return res
            logger.info("ElevenLabs ASR failed or unavailable, falling back to Sarvam AI ASR...")

        # 2. Sarvam AI Saaras v3
        if self.sarvam_api_key:
            res = await self._transcribe_sarvam(audio_bytes, filename, mime_type, norm_lang)
            if res.get("text") or not res.get("error"):
                return res

        # 3. If Sarvam had an error and ElevenLabs is available, try ElevenLabs fallback
        if self.elevenlabs_api_key and norm_lang not in ("mr", "bn", "gu", "ta", "te", "kn", "ml", "pa", "od"):
            res = await self._transcribe_elevenlabs(audio_bytes, filename, mime_type, norm_lang)
            if res.get("text"):
                return res

        return {
            "text": "",
            "language": language or "en",
            "segments": [],
            "error": "Both Sarvam AI and ElevenLabs voice models failed to transcribe audio.",
        }

    async def _transcribe_sarvam(
        self,
        audio_bytes: bytes,
        filename: str,
        mime_type: str,
        lang: str,
    ) -> dict[str, Any]:
        """Transcribe using Sarvam AI Saaras v3 speech-to-text API."""
        url = "https://api.sarvam.ai/speech-to-text"
        headers = {
            "api-subscription-key": self.sarvam_api_key,
        }

        target_lang_code = SARVAM_ASR_LANG_MAP.get(lang, "unknown")
        data = {
            "model": "saaras:v3",
        }
        if target_lang_code != "unknown":
            data["language_code"] = target_lang_code

        files = {
            "file": (filename, audio_bytes, mime_type),
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, headers=headers, data=data, files=files)
                if res.status_code == 200:
                    resp_json = res.json()
                    transcript = resp_json.get("transcript", "").strip()
                    detected_code = resp_json.get("language_code", target_lang_code)
                    detected_lang = detected_code.split("-")[0] if "-" in detected_code else detected_code

                    timestamps = resp_json.get("timestamps", [])
                    segments = []
                    if timestamps:
                        for item in timestamps:
                            segments.append({
                                "start": round(item.get("start_time_seconds", 0.0), 2),
                                "end": round(item.get("end_time_seconds", 0.0), 2),
                                "text": item.get("word", "").strip(),
                            })

                    return {
                        "text": transcript,
                        "language": detected_lang,
                        "segments": segments,
                        "provider": "sarvam",
                        "model": "saaras:v3",
                    }
                else:
                    logger.warning("Sarvam Saaras ASR HTTP %d: %s", res.status_code, res.text)
                    return {"text": "", "error": f"Sarvam ASR HTTP {res.status_code}"}
        except Exception as e:
            logger.error("Sarvam ASR exception: %s", e)
            return {"text": "", "error": str(e)}

    async def _transcribe_elevenlabs(
        self,
        audio_bytes: bytes,
        filename: str,
        mime_type: str,
        lang: str,
    ) -> dict[str, Any]:
        """Transcribe using ElevenLabs Scribe v1 Speech-to-Text API."""
        url = "https://api.elevenlabs.io/v1/speech-to-text"
        headers = {
            "xi-api-key": self.elevenlabs_api_key,
        }
        data = {
            "model_id": "scribe_v1",
        }
        files = {
            "file": (filename, audio_bytes, mime_type),
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, headers=headers, data=data, files=files)
                if res.status_code == 200:
                    resp_json = res.json()
                    transcript = resp_json.get("text", "").strip()
                    detected_code = resp_json.get("language_code", lang)

                    words = resp_json.get("words", [])
                    segments = []
                    for w in words:
                        segments.append({
                            "start": round(w.get("start", 0.0), 2),
                            "end": round(w.get("end", 0.0), 2),
                            "text": w.get("text", "").strip(),
                        })

                    return {
                        "text": transcript,
                        "language": detected_code,
                        "segments": segments,
                        "provider": "elevenlabs",
                        "model": "scribe_v1",
                    }
                else:
                    logger.warning("ElevenLabs Scribe ASR HTTP %d: %s", res.status_code, res.text)
                    return {"text": "", "error": f"ElevenLabs ASR HTTP {res.status_code}"}
        except Exception as e:
            logger.error("ElevenLabs ASR exception: %s", e)
            return {"text": "", "error": str(e)}
