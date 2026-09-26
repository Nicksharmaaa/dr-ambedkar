"""
ElevenLabs TTS Provider Adapter for English and Hindi narration.

Handles:
- en: English
- hi: Hindi
Normalizes to TTSAudioResult.
Raises TTSProviderError on configuration missing or API failure.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.services.media.tts_providers.base import (
    BaseTTSProvider,
    TTSAudioResult,
    TTSProviderError,
    split_text_into_safe_segments,
)

logger = logging.getLogger("ambedkar.media.tts.elevenlabs")


class ElevenLabsTTSProvider(BaseTTSProvider):
    """
    Adapter for ElevenLabs Text-to-Speech API.
    Routes English and Hindi requests using ElevenLabs Multilingual models.
    """

    DEFAULT_MODEL = "eleven_multilingual_v2"
    MAX_CHUNK_CHARS = 2400

    def __init__(
        self,
        api_key: Optional[str] = None,
        voice_id: Optional[str] = None,
    ) -> None:
        self.api_key = (api_key or settings.elevenlabs_api_key or "").strip()
        self.default_voice_id = (voice_id or settings.elevenlabs_voice_id or "21m00Tcm4TlvDq8ikWAM").strip()
        self._sdk_client: Any = None
        self._init_sdk_client()

    def _init_sdk_client(self) -> None:
        """Initialize official elevenlabs SDK if available."""
        if not self.api_key:
            return
        try:
            from elevenlabs.client import ElevenLabs  # type: ignore

            self._sdk_client = ElevenLabs(api_key=self.api_key)
        except (ImportError, Exception) as e:
            logger.debug("ElevenLabs SDK not initialized, using REST fallback: %s", e)
            self._sdk_client = None

    @property
    def provider_name(self) -> str:
        return "elevenlabs"

    @property
    def supported_languages(self) -> set[str]:
        configured = {
            code.strip().lower()
            for code in settings.tts_elevenlabs_languages.split(",")
            if code.strip()
        }
        return configured or {"en", "hi"}

    async def _call_sdk(self, segment: str, voice_id: str) -> bytes:
        """Execute ElevenLabs synthesis via SDK in background thread."""
        def _invoke() -> bytes:
            audio_generator = self._sdk_client.generate(
                text=segment,
                voice=voice_id,
                model=self.DEFAULT_MODEL,
            )
            # Generator yields bytes chunks
            return b"".join(audio_generator)

        return await asyncio.to_thread(_invoke)

    async def _call_rest(self, segment: str, voice_id: str) -> bytes:
        """Direct REST synthesis using ElevenLabs v1 TTS endpoint."""
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }
        payload = {
            "text": segment,
            "model_id": self.DEFAULT_MODEL,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
            },
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                err_text = resp.text
                logger.error("ElevenLabs error [%d]: %s", resp.status_code, err_text)
                raise TTSProviderError(
                    message=f"ElevenLabs returned HTTP {resp.status_code}: {err_text}",
                    provider=self.provider_name,
                    status_code=resp.status_code,
                )
            return resp.content

    async def synthesize(
        self,
        text: str,
        language: str,
        speaker: Optional[str] = None,
        dict_id: Optional[str] = None,
    ) -> TTSAudioResult:
        """
        Synthesize speech using ElevenLabs.
        Normalizes into MP3 TTSAudioResult.
        """
        if not self.api_key:
            raise TTSProviderError(
                message="ELEVENLABS_API_KEY is not configured on the server",
                provider=self.provider_name,
                status_code=500,
            )

        clean_text = text.strip()
        if not clean_text:
            raise TTSProviderError(
                message="Empty text submitted for TTS synthesis",
                provider=self.provider_name,
                status_code=400,
            )

        lang_short = language.split("-")[0].lower()
        if lang_short not in self.supported_languages:
            raise TTSProviderError(
                message=f"Language '{language}' is not supported by ElevenLabs adapter (expected {self.supported_languages})",
                provider=self.provider_name,
                status_code=400,
            )

        voice_id = (speaker or "").strip() or self.default_voice_id
        segments = split_text_into_safe_segments(clean_text, max_chars=self.MAX_CHUNK_CHARS)

        audio_parts: list[bytes] = []
        for idx, seg in enumerate(segments):
            try:
                if self._sdk_client is not None:
                    try:
                        part = await self._call_sdk(seg, voice_id)
                    except Exception as sdk_err:
                        logger.warning("ElevenLabs SDK error, falling back to REST: %s", sdk_err)
                        part = await self._call_rest(seg, voice_id)
                else:
                    part = await self._call_rest(seg, voice_id)

                audio_parts.append(part)
            except TTSProviderError:
                raise
            except Exception as e:
                logger.error("ElevenLabs synthesis error on segment %d: %s", idx + 1, e)
                raise TTSProviderError(
                    message=f"ElevenLabs synthesis error on segment {idx + 1}: {e}",
                    provider=self.provider_name,
                ) from e

        final_audio = b"".join(audio_parts)

        return TTSAudioResult(
            audio_bytes=final_audio,
            content_type="audio/mpeg",
            provider=self.provider_name,
            model=self.DEFAULT_MODEL,
            language=lang_short,
            speaker=voice_id,
            duration_seconds=None,
            request_id=None,
            is_cached=False,
            dict_id=dict_id,
            extra_metadata={"segments_count": len(segments)},
        )
