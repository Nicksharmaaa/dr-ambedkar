"""
Phase 9: Text-to-Speech (TTS) Narration & Routing Service.

Routes requests between configured TTS providers based on language:
- English & Hindi -> ElevenLabs
- Indic Languages (bn, ta, gu, te, kn, ml, mr, pa, od) -> Sarvam Bulbul v3
- Unknown / unconfigured -> Explicit TTSProviderError (no silent fallback)

Normalizes audio outputs, persists to local disk and caches in Turso DB (tts_cache).
Maintains strict provenance separation between original archival recordings and AI narrations.
"""
from __future__ import annotations

import hashlib
import logging
import os
import uuid
from typing import Any, Optional

from app.core.config import settings
from app.db.database import DatabaseClient
from app.services.media.tts_providers.base import (
    BaseTTSProvider,
    TTSAudioResult,
    TTSProviderError,
)
from app.services.media.tts_providers.sarvam_provider import (
    SARVAM_LANGUAGE_MAP,
    SarvamTTSProvider,
)
from app.services.media.tts_providers.elevenlabs_provider import ElevenLabsTTSProvider

logger = logging.getLogger("ambedkar.media.tts")

NARRATION_DIR = os.path.join("storage", "local", "audio", "narration")
os.makedirs(NARRATION_DIR, exist_ok=True)


class TTSService:
    """
    Central TTS router and synthesizer with Turso database & disk caching.
    """

    def __init__(
        self,
        db: DatabaseClient,
        sarvam_provider: Optional[SarvamTTSProvider] = None,
        elevenlabs_provider: Optional[ElevenLabsTTSProvider] = None,
    ) -> None:
        self.db = db
        self.sarvam_provider = sarvam_provider or SarvamTTSProvider()
        self.elevenlabs_provider = elevenlabs_provider or ElevenLabsTTSProvider()

    def normalize_language_code(self, language: str) -> str:
        """
        Normalize incoming language codes (e.g. 'hi-IN' -> 'hi', 'en-US' -> 'en', 'od-IN' -> 'od', 'or' -> 'od').
        """
        raw = (language or "en").strip().lower()
        if "-" in raw:
            raw = raw.split("-")[0]
        if "_" in raw:
            raw = raw.split("_")[0]
        if raw == "or":
            raw = "od"
        return raw

    def resolve_provider(self, language: str) -> BaseTTSProvider:
        """
        Determine provider for the requested language based on strict architectural rules:
        - English (en / en-IN) -> ElevenLabs
        - Hindi (hi / hi-IN) -> ElevenLabs
        - Configured Indic native languages (bn, ta, gu, te, kn, ml, mr, pa, od) -> Sarvam Bulbul v3
        - Unsupported languages -> Explicit TTSProviderError (status_code=400, no silent fallback)
        """
        lang = self.normalize_language_code(language)

        # 1. English & Hindi -> ElevenLabs
        if lang in self.elevenlabs_provider.supported_languages:
            return self.elevenlabs_provider

        # 2. Configured Indic native languages -> Sarvam Bulbul v3
        if lang in self.sarvam_provider.supported_languages:
            return self.sarvam_provider

        raise TTSProviderError(
            message=f"No TTS provider configured for language '{language}'. "
            f"Supported: ElevenLabs={sorted(self.elevenlabs_provider.supported_languages)}, "
            f"Sarvam={sorted(self.sarvam_provider.supported_languages)}",
            provider="router",
            status_code=400,
        )

    async def synthesize(
        self,
        text: str,
        language: str = "en",
        gender: str = "female",
        speaker: Optional[str] = None,
        dict_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Synthesize speech from archival text or assistant response.
        Returns provider-neutral dict with audio stream URL and provenance metadata.
        Never exposes API keys or provider credentials to the caller.
        """
        clean_text = text.strip()
        if not clean_text:
            return {"error": "Empty text for narration"}

        lang = self.normalize_language_code(language)

        # 1. Resolve configured provider via centralized router
        try:
            provider = self.resolve_provider(lang)
        except TTSProviderError as router_err:
            logger.error("TTS routing error: %s", router_err)
            return {"error": router_err.message, "provider": router_err.provider, "status_code": router_err.status_code or 400}

        # 2. Compute canonical cache key and check DB/disk cache
        # Cache key incorporates provider, language, chosen speaker, and exact text
        if speaker and speaker.strip():
            chosen_speaker = speaker.strip()
        elif provider.provider_name == "sarvam":
            chosen_speaker = (getattr(settings, "sarvam_speaker", None) or "shubh").strip()
        else:
            chosen_speaker = (gender or "default").strip()

        cache_key = f"{provider.provider_name}:{lang}:{chosen_speaker}:{clean_text}"
        text_hash = hashlib.sha256(cache_key.encode("utf-8")).hexdigest()

        # Audio file extension depends on provider output format (wav or mp3)
        ext = "mp3" if provider.provider_name == "elevenlabs" else "wav"
        file_name = f"{text_hash}.{ext}"
        audio_file_path = os.path.join(NARRATION_DIR, file_name)

        # Check existing cache row & file
        if os.path.exists(audio_file_path) and os.path.getsize(audio_file_path) > 500:
            try:
                cached_row = await self.db.execute(
                    "SELECT * FROM tts_cache WHERE source_text_hash = ? AND language = ? LIMIT 1",
                    [text_hash, lang],
                )
                if cached_row.rows:
                    row = cached_row.rows[0]
                    model_val = row["model"] if isinstance(row, dict) else row[4]
                    return {
                        "audio_path": audio_file_path,
                        "audio_url": f"/api/v1/indic/tts/audio/{file_name}",
                        "language": lang,
                        "voice": chosen_speaker,
                        "speaker": chosen_speaker,
                        "provider": provider.provider_name,
                        "model": model_val,
                        "duration_seconds": 0.0,
                        "is_cached": True,
                        "generation_type": "AI_NARRATION",
                    }
            except Exception as cache_read_err:
                logger.warning("Cache lookup error, proceeding with synthesis: %s", cache_read_err)

        # 3. Call routed provider adapter
        try:
            result: TTSAudioResult = await provider.synthesize(
                text=clean_text,
                language=lang,
                speaker=speaker,
                dict_id=dict_id,
            )

            # Determine actual file extension from content_type
            if "mpeg" in result.content_type or "mp3" in result.content_type:
                ext = "mp3"
            else:
                ext = "wav"
            file_name = f"{text_hash}.{ext}"
            audio_file_path = os.path.join(NARRATION_DIR, file_name)

            # 4. Save audio bytes to disk
            with open(audio_file_path, "wb") as f:
                f.write(result.audio_bytes)

            # 5. Persist to tts_cache in Turso DB
            tts_id = str(uuid.uuid4())
            stored_model_tag = f"{result.provider}:{result.model}"
            try:
                await self.db.execute(
                    """
                    INSERT OR REPLACE INTO tts_cache (
                        id, source_text_hash, source_text, language, model,
                        audio_path, generation_type, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, 'AI_NARRATION', datetime('now'))
                    """,
                    [
                        tts_id,
                        text_hash,
                        clean_text[:500],
                        lang,
                        stored_model_tag,
                        audio_file_path,
                    ],
                )
            except Exception as db_err:
                logger.warning("Failed to record audio to tts_cache: %s", db_err)

            audio_url = f"/api/v1/indic/tts/audio/{file_name}"
            response_payload = result.to_neutral_dict(audio_url=audio_url)
            response_payload["audio_path"] = audio_file_path
            return response_payload

        except TTSProviderError as prov_err:
            logger.error("TTS provider error (%s): %s", prov_err.provider, prov_err.message)
            return {
                "error": prov_err.message,
                "provider": prov_err.provider,
                "status_code": prov_err.status_code or 500,
            }
        except Exception as e:
            logger.error("TTS generation unexpected failure: %s", e)
            return {
                "error": f"TTS synthesis failed: {e}",
                "provider": provider.provider_name,
            }

