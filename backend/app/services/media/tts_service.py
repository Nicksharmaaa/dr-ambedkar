"""
Phase 9: Text-to-Speech (TTS) Narration Service
Generates high-fidelity neural audio narration for archival passages and translations in English, Hindi, and Marathi.
Maintains strict separation between original recordings and AI-generated narrations with persistent caching.
"""
from __future__ import annotations

import hashlib
import logging
import os
import uuid
from typing import Any
import edge_tts

from app.db.database import DatabaseClient

logger = logging.getLogger("ambedkar.media.tts")

NARRATION_VOICES = {
    "hi": {"female": "hi-IN-SwaraNeural", "male": "hi-IN-MadhurNeural"},
    "mr": {"female": "mr-IN-AarohiNeural", "male": "mr-IN-ManoharNeural"},
    "en": {"female": "en-IN-NeerjaNeural", "male": "en-IN-PrabhatNeural"},
}

NARRATION_DIR = os.path.join("storage", "local", "audio", "narration")
os.makedirs(NARRATION_DIR, exist_ok=True)


class TTSService:
    """Audio narration synthesizer with disk & Turso database caching."""

    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def synthesize(
        self,
        text: str,
        language: str = "en",
        gender: str = "female",
    ) -> dict[str, Any]:
        """
        Synthesize speech from text.
        Returns audio stream path, duration, and provenance metadata.
        """
        clean_text = text.strip()
        if not clean_text:
            return {"error": "Empty text for narration"}

        lang = language.lower() if language.lower() in ("hi", "mr", "en") else "en"
        voice_dict = NARRATION_VOICES.get(lang, NARRATION_VOICES["en"])
        voice_name = voice_dict.get(gender, voice_dict["female"])

        # 1. Compute hash of text + voice
        cache_key = f"{lang}:{voice_name}:{clean_text}"
        text_hash = hashlib.sha256(cache_key.encode("utf-8")).hexdigest()
        file_name = f"{text_hash}.mp3"
        audio_file_path = os.path.join(NARRATION_DIR, file_name)

        # 2. Check if already exists in cache and on disk
        if os.path.exists(audio_file_path) and os.path.getsize(audio_file_path) > 1000:
            cached_row = await self.db.execute(
                "SELECT * FROM tts_cache WHERE source_text_hash = ? AND language = ? LIMIT 1",
                [text_hash, lang],
            )
            if cached_row.rows:
                return {
                    "audio_path": audio_file_path,
                    "audio_url": f"/api/v1/indic/tts/audio/{file_name}",
                    "language": lang,
                    "voice": voice_name,
                    "model": "edge-tts-neural",
                    "is_cached": True,
                    "generation_type": "AI_NARRATION",
                }

        # 3. Generate audio using edge-tts
        try:
            communicate = edge_tts.Communicate(clean_text, voice_name)
            await communicate.save(audio_file_path)

            # 4. Save to tts_cache
            tts_id = str(uuid.uuid4())
            await self.db.execute(
                """
                INSERT OR REPLACE INTO tts_cache (
                    id, source_text_hash, source_text, language, model,
                    audio_path, generation_type, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'AI_NARRATION', datetime('now'))
                """,
                [tts_id, text_hash, clean_text[:500], lang, voice_name, audio_file_path],
            )

            return {
                "audio_path": audio_file_path,
                "audio_url": f"/api/v1/indic/tts/audio/{file_name}",
                "language": lang,
                "voice": voice_name,
                "model": "edge-tts-neural",
                "is_cached": False,
                "generation_type": "AI_NARRATION",
            }
        except Exception as e:
            logger.error("TTS generation failed: %s", e)
            return {"error": str(e), "fallback": "Use browser Web Speech API"}
