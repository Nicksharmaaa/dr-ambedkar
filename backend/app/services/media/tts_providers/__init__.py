"""
TTS Provider Abstraction Layer
Exports the shared types, exception classes, and base provider interface.
"""
from app.services.media.tts_providers.base import (
    TTSAudioResult,
    TTSProviderError,
    BaseTTSProvider,
)
from app.services.media.tts_providers.sarvam_provider import SarvamTTSProvider
from app.services.media.tts_providers.elevenlabs_provider import ElevenLabsTTSProvider

__all__ = [
    "TTSAudioResult",
    "TTSProviderError",
    "BaseTTSProvider",
    "SarvamTTSProvider",
    "ElevenLabsTTSProvider",
]
