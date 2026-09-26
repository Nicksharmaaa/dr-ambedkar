"""
Base interfaces, data transfer models, and exceptions for TTS providers.
"""
from __future__ import annotations

import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional


class TTSProviderError(Exception):
    """
    Raised when a TTS provider fails to generate speech.
    Explicit error — prevents silent fallback between providers.
    """

    def __init__(
        self,
        message: str,
        provider: str = "unknown",
        status_code: Optional[int] = None,
        details: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(f"[{provider}] {message}")
        self.provider = provider
        self.message = message
        self.status_code = status_code
        self.details = details or {}


@dataclass
class TTSAudioResult:
    """
    Provider-neutral normalized audio result.
    Shields API routes and frontend from provider-specific response formats.
    """

    audio_bytes: bytes
    content_type: str = "audio/wav"
    provider: str = "sarvam"
    model: str = "bulbul:v3"
    language: str = "en"
    speaker: str = ""
    duration_seconds: Optional[float] = None
    request_id: Optional[str] = None
    is_cached: bool = False
    dict_id: Optional[str] = None
    extra_metadata: dict[str, Any] = field(default_factory=dict)

    def to_neutral_dict(self, audio_url: str = "") -> dict[str, Any]:
        """Convert to standardized provider-neutral dictionary for API responses."""
        return {
            "audio_url": audio_url,
            "language": self.language,
            "voice": self.speaker,
            "speaker": self.speaker,
            "provider": self.provider,
            "model": self.model,
            "duration_seconds": self.duration_seconds or 0.0,
            "request_id": self.request_id,
            "is_cached": self.is_cached,
            "generation_type": "AI_NARRATION",
        }


def split_text_into_safe_segments(text: str, max_chars: int = 2400) -> list[str]:
    """
    Split text into safe speech segments below max_chars (e.g., 2500 char REST limit).
    Preserves exact archival wording, punctuation, and order.
    Splits along sentence boundaries (Purna Viram '।', full stop '.', question '?', exclamation '!', newline).
    """
    clean_text = text.strip()
    if not clean_text:
        return []

    if len(clean_text) <= max_chars:
        return [clean_text]

    # Split by major sentence terminators preserving delimiters
    # Matches Purna Viram '।', '.', '?', '!', '\n+'
    sentence_regex = re.compile(r"([^।?!.\n]+[।?!.\n]+|[^।?!.\n]+$)")
    matches = sentence_regex.findall(clean_text)

    if not matches:
        # Fallback to word splitting if no sentence terminators exist
        words = clean_text.split()
        chunks: list[str] = []
        current: list[str] = []
        curr_len = 0
        for w in words:
            if curr_len + len(w) + 1 > max_chars and current:
                chunks.append(" ".join(current))
                current = [w]
                curr_len = len(w)
            else:
                current.append(w)
                curr_len += len(w) + 1
        if current:
            chunks.append(" ".join(current))
        return chunks

    segments: list[str] = []
    current_chunk = ""

    for s in matches:
        trimmed = s.strip()
        if not trimmed:
            continue

        if len(trimmed) > max_chars:
            # Flush any accumulated current_chunk first
            if current_chunk:
                segments.append(current_chunk.strip())
                current_chunk = ""

            # A single sentence is longer than max_chars: split by words
            words = trimmed.split()
            sub_chunk = ""
            for w in words:
                if len(sub_chunk) + len(w) + 1 > max_chars and sub_chunk:
                    segments.append(sub_chunk.strip())
                    sub_chunk = w
                else:
                    sub_chunk = f"{sub_chunk} {w}".strip()
            if sub_chunk:
                segments.append(sub_chunk.strip())
            continue

        if len(current_chunk) + len(trimmed) + 1 > max_chars:
            if current_chunk:
                segments.append(current_chunk.strip())
            current_chunk = trimmed
        else:
            current_chunk = f"{current_chunk} {trimmed}".strip()

    if current_chunk:
        segments.append(current_chunk.strip())

    return segments


class BaseTTSProvider(ABC):
    """
    Abstract interface that all TTS providers (Sarvam, ElevenLabs, etc.) must implement.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the provider, e.g. 'sarvam' or 'elevenlabs'."""
        ...

    @property
    @abstractmethod
    def supported_languages(self) -> set[str]:
        """Set of supported ISO / BCP-47 short language codes (e.g. {'bn', 'ta'})."""
        ...

    @abstractmethod
    async def synthesize(
        self,
        text: str,
        language: str,
        speaker: Optional[str] = None,
        dict_id: Optional[str] = None,
    ) -> TTSAudioResult:
        """
        Synthesize text into speech.
        Returns normalized TTSAudioResult.
        Raises TTSProviderError on failure.
        """
        ...
