"""
Sarvam AI Bulbul v3 Text-to-Speech Provider Adapter.

Official References:
- Model: bulbul:v3
- Supported Indic Languages: bn-IN, ta-IN, gu-IN, te-IN, kn-IN, ml-IN, mr-IN, pa-IN, od-IN (and en-IN, hi-IN)
- Character limit: 2,500 chars per REST request (segmented safely at 2,400 chars)
- Auth: api-subscription-key / SARVAM_API_KEY
- Pronunciation dictionary: optional dict_id for historical names & terminology
"""
from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
import wave
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.services.media.tts_providers.base import (
    BaseTTSProvider,
    TTSAudioResult,
    TTSProviderError,
    split_text_into_safe_segments,
)

logger = logging.getLogger("ambedkar.media.tts.sarvam")

# Mapping from internal/short language code to Sarvam BCP-47 language_code
SARVAM_LANGUAGE_MAP: dict[str, str] = {
    "bn": "bn-IN",
    "ta": "ta-IN",
    "gu": "gu-IN",
    "te": "te-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "mr": "mr-IN",
    "pa": "pa-IN",
    "od": "od-IN",
    "en": "en-IN",
    "hi": "hi-IN",
}

# Reverse mapping from BCP-47 to short code
REVERSE_SARVAM_MAP: dict[str, str] = {v.lower(): k for k, v in SARVAM_LANGUAGE_MAP.items()}


def _combine_wav_bytes(wav_chunks: list[bytes]) -> bytes:
    """
    Concatenate multiple WAV byte chunks into a single valid WAV stream,
    recalculating header length and combining audio frames without noise.
    """
    if not wav_chunks:
        return b""
    if len(wav_chunks) == 1:
        return wav_chunks[0]

    out_buf = io.BytesIO()
    try:
        with wave.open(io.BytesIO(wav_chunks[0]), "rb") as first_wav:
            params = first_wav.getparams()
            with wave.open(out_buf, "wb") as out_wav:
                out_wav.setparams(params)
                out_wav.writeframes(first_wav.readframes(first_wav.getnframes()))
                for chunk in wav_chunks[1:]:
                    try:
                        with wave.open(io.BytesIO(chunk), "rb") as next_wav:
                            out_wav.writeframes(next_wav.readframes(next_wav.getnframes()))
                    except Exception as inner_err:
                        logger.warning("Could not append wav chunk: %s", inner_err)
        return out_buf.getvalue()
    except Exception as e:
        logger.warning("Failed to merge WAV headers cleanly, returning raw concatenation: %s", e)
        return b"".join(wav_chunks)


def _compute_wav_duration(wav_bytes: bytes) -> Optional[float]:
    """Calculate duration in seconds from WAV header."""
    try:
        with wave.open(io.BytesIO(wav_bytes), "rb") as w:
            frames = w.getnframes()
            rate = w.getframerate()
            if rate > 0:
                return round(frames / float(rate), 2)
    except Exception:
        pass
    return None


class SarvamTTSProvider(BaseTTSProvider):
    """
    Adapter for Sarvam Bulbul v3 Text-to-Speech API.
    Uses official sarvamai Python SDK when available, with direct REST fallback.
    """

    MAX_CHUNK_CHARS = 2400  # REST API limit is 2500 characters

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None) -> None:
        self.api_key = (api_key if api_key is not None else (settings.sarvam_api_key or "")).strip()
        self.model_name = (model or getattr(settings, "sarvam_model", None) or "bulbul:v3").strip()
        # If configured model is set to "shubh", use official model bulbul:v3 with speaker shubh
        if self.model_name.lower() == "shubh":
            self.model_name = "bulbul:v3"
        self._sdk_client: Any = None
        self._init_sdk_client()

    def _init_sdk_client(self) -> None:
        """Initialize official sarvamai SDK if available."""
        if not self.api_key:
            return
        try:
            from sarvamai import SarvamAI  # type: ignore

            self._sdk_client = SarvamAI(api_key=self.api_key)
        except (ImportError, Exception) as e:
            logger.debug("sarvamai SDK not initialized, will use direct REST client: %s", e)
            self._sdk_client = None

    @property
    def provider_name(self) -> str:
        return "sarvam"

    @property
    def supported_languages(self) -> set[str]:
        configured = {
            code.strip().lower()
            for code in settings.tts_sarvam_languages.split(",")
            if code.strip()
        }
        return configured or {"bn", "ta", "gu", "te", "kn", "ml", "mr", "pa", "od"}

    def _resolve_language_code(self, lang: str) -> str:
        """Normalize language to Sarvam BCP-47 tag (e.g. 'bn' -> 'bn-IN')."""
        normalized = lang.strip().lower()
        if normalized in SARVAM_LANGUAGE_MAP:
            return SARVAM_LANGUAGE_MAP[normalized]
        if normalized in REVERSE_SARVAM_MAP:
            return normalized
        # Default fallback to hi-IN if unknown
        raise TTSProviderError(
            message=f"Unsupported language code '{lang}' for Sarvam TTS",
            provider=self.provider_name,
            status_code=400,
        )

    def _get_default_speaker(self, lang_short: str) -> str:
        """Resolve speaker according to configuration or Sarvam default voice ('shubh')."""
        if settings.tts_sarvam_speaker_map:
            try:
                speaker_map = json.loads(settings.tts_sarvam_speaker_map)
                if isinstance(speaker_map, dict) and lang_short in speaker_map:
                    return str(speaker_map[lang_short])
            except Exception:
                pass
        return (getattr(settings, "sarvam_speaker", None) or "shubh").strip()

    async def _convert_segment_sdk(
        self,
        segment: str,
        bcp47_lang: str,
        speaker: str,
        dict_id: Optional[str] = None,
    ) -> tuple[bytes, Optional[str]]:
        """Call Sarvam Bulbul v3 via official Python SDK."""
        def _call_sdk() -> tuple[bytes, Optional[str]]:
            kwargs: dict[str, Any] = {
                "model": self.model_name,
                "speaker": speaker,
            }
            if dict_id:
                kwargs["dict_id"] = dict_id

            # In sarvamai >= 0.1.29: text and language_code are used
            try:
                resp = self._sdk_client.text_to_speech.convert(
                    text=segment,
                    language_code=bcp47_lang,
                    **kwargs,
                )
            except TypeError:
                # Older SDK version fallback
                resp = self._sdk_client.text_to_speech.convert(
                    inputs=[segment],
                    target_language_code=bcp47_lang,
                    **kwargs,
                )

            req_id = getattr(resp, "request_id", None)
            audios = getattr(resp, "audios", None) or []
            if not audios:
                raise ValueError("No audio returned in Sarvam SDK response")
            audio_bytes = base64.b64decode(audios[0])
            return audio_bytes, req_id

        return await asyncio.to_thread(_call_sdk)

    async def _convert_segment_rest(
        self,
        segment: str,
        bcp47_lang: str,
        speaker: str,
        dict_id: Optional[str] = None,
    ) -> tuple[bytes, Optional[str]]:
        """Direct REST API call using official endpoint and api-subscription-key."""
        url = "https://api.sarvam.ai/text-to-speech"
        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }
        payload: dict[str, Any] = {
            "text": segment,
            "language_code": bcp47_lang,
            "speaker": speaker,
            "model": self.model_name,
        }
        if dict_id:
            payload["dict_id"] = dict_id

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                err_text = resp.text
                logger.error("Sarvam REST API error [%d]: %s", resp.status_code, err_text)
                raise TTSProviderError(
                    message=f"Sarvam API returned HTTP {resp.status_code}: {err_text}",
                    provider=self.provider_name,
                    status_code=resp.status_code,
                    details={"response": err_text},
                )

            data = resp.json()
            audios = data.get("audios") or []
            if not audios:
                raise TTSProviderError(
                    message="Sarvam response did not contain audio data",
                    provider=self.provider_name,
                    status_code=resp.status_code,
                )
            audio_bytes = base64.b64decode(audios[0])
            req_id = resp.headers.get("x-request-id") or data.get("request_id")
            return audio_bytes, req_id

    async def synthesize(
        self,
        text: str,
        language: str,
        speaker: Optional[str] = None,
        dict_id: Optional[str] = None,
    ) -> TTSAudioResult:
        """
        Synthesize speech using Sarvam Bulbul v3 with Shubh voice model.
        Handles text segmentation for texts exceeding 2,400 characters.
        """
        if not self.api_key:
            raise TTSProviderError(
                message="SARVAM_API_KEY is not configured on the server",
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

        bcp47_lang = self._resolve_language_code(language)
        short_lang = bcp47_lang.split("-")[0].lower()

        default_spk = self._get_default_speaker(short_lang)
        chosen_speaker = (speaker or "").strip() or default_spk
        if chosen_speaker.lower() in ("female", "male", "default"):
            chosen_speaker = default_spk

        # 1. Segment text if longer than safe REST limit
        segments = split_text_into_safe_segments(clean_text, max_chars=self.MAX_CHUNK_CHARS)
        if not segments:
            raise TTSProviderError(
                message="No valid text segments generated",
                provider=self.provider_name,
                status_code=400,
            )

        audio_chunks: list[bytes] = []
        last_req_id: Optional[str] = None

        for idx, seg in enumerate(segments):
            try:
                if self._sdk_client is not None:
                    try:
                        chunk_bytes, req_id = await self._convert_segment_sdk(
                            seg, bcp47_lang, chosen_speaker, dict_id=dict_id
                        )
                    except Exception as sdk_err:
                        logger.warning("SDK call failed, attempting direct REST fallback: %s", sdk_err)
                        chunk_bytes, req_id = await self._convert_segment_rest(
                            seg, bcp47_lang, chosen_speaker, dict_id=dict_id
                        )
                else:
                    chunk_bytes, req_id = await self._convert_segment_rest(
                        seg, bcp47_lang, chosen_speaker, dict_id=dict_id
                    )

                audio_chunks.append(chunk_bytes)
                if req_id:
                    last_req_id = req_id

            except TTSProviderError:
                raise
            except Exception as e:
                logger.error("Sarvam synthesis failed on segment %d/%d: %s", idx + 1, len(segments), e)
                raise TTSProviderError(
                    message=f"Sarvam synthesis failed on segment {idx + 1}: {e}",
                    provider=self.provider_name,
                    details={"segment_index": idx, "total_segments": len(segments)},
                ) from e

        final_wav_bytes = _combine_wav_bytes(audio_chunks)
        duration = _compute_wav_duration(final_wav_bytes)

        return TTSAudioResult(
            audio_bytes=final_wav_bytes,
            content_type="audio/wav",
            provider=self.provider_name,
            model=self.model_name,
            language=short_lang,
            speaker=chosen_speaker,
            duration_seconds=duration,
            request_id=last_req_id,
            is_cached=False,
            dict_id=dict_id,
            extra_metadata={
                "bcp47_language": bcp47_lang,
                "segments_count": len(segments),
            },
        )
