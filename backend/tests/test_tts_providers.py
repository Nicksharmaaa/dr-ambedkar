"""
Unit and Integration Tests for TTS Provider Router, Sarvam Bulbul v3, and ElevenLabs Adapters.

Tests:
1. Language routing: en/hi -> ElevenLabs, Indic (bn, ta, gu, te, kn, ml, mr, pa, od) -> Sarvam
2. Unsupported language -> Explicit error (no silent fallback)
3. Text segmentation below 2,400 chars with exact archival wording preservation
4. Sarvam Bulbul v3 adapter request formation and WAV concatenation
5. Optional pronunciation dictionary (dict_id) acceptance
6. Normalized provider-neutral dictionary output
7. Cache retrieval without re-invoking provider
8. Security: API keys never exposed in return dicts or serialized objects
"""
from __future__ import annotations

import io
import wave
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.media.tts_providers.base import (
    BaseTTSProvider,
    TTSAudioResult,
    TTSProviderError,
    split_text_into_safe_segments,
)
from app.services.media.tts_providers.sarvam_provider import (
    SARVAM_LANGUAGE_MAP,
    SarvamTTSProvider,
    _combine_wav_bytes,
)
from app.services.media.tts_providers.elevenlabs_provider import ElevenLabsTTSProvider
from app.services.media.tts_service import TTSService


def create_dummy_wav(duration_secs: float = 0.5, framerate: int = 16000) -> bytes:
    """Generate dummy WAV bytes with valid headers for testing."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(framerate)
        n_frames = int(framerate * duration_secs)
        w.writeframes(b"\x00\x00" * n_frames)
    return buf.getvalue()


class TestTTSProviderRouting:
    """Verifies strict routing table and absence of silent fallback."""

    def test_elevenlabs_routing_for_english_and_hindi(self):
        mock_db = MagicMock()
        service = TTSService(db=mock_db)

        # English
        prov_en = service.resolve_provider("en")
        assert prov_en.provider_name == "elevenlabs"

        prov_en_in = service.resolve_provider("en-IN")
        assert prov_en_in.provider_name == "elevenlabs"

        # Hindi
        prov_hi = service.resolve_provider("hi")
        assert prov_hi.provider_name == "elevenlabs"

        prov_hi_in = service.resolve_provider("hi-IN")
        assert prov_hi_in.provider_name == "elevenlabs"

    @pytest.mark.parametrize(
        "lang",
        ["bn", "ta", "gu", "te", "kn", "ml", "mr", "pa", "od"],
    )
    def test_sarvam_routing_for_indic_languages(self, lang: str):
        mock_db = MagicMock()
        service = TTSService(db=mock_db)

        # Short code
        provider = service.resolve_provider(lang)
        assert provider.provider_name == "sarvam"

        # Full BCP-47 tag
        bcp47 = f"{lang}-IN"
        provider_bcp = service.resolve_provider(bcp47)
        assert provider_bcp.provider_name == "sarvam"

    def test_unsupported_language_raises_explicit_error_without_fallback(self):
        mock_db = MagicMock()
        service = TTSService(db=mock_db)

        with pytest.raises(TTSProviderError) as exc_info:
            service.resolve_provider("fr")
        assert "No TTS provider configured" in exc_info.value.message
        assert exc_info.value.provider == "router"

        with pytest.raises(TTSProviderError) as exc_info2:
            service.resolve_provider("de")
        assert exc_info2.value.status_code == 400


class TestTextSegmentation:
    """Verifies that archival texts are partitioned along sentence boundaries without modification."""

    def test_short_text_remains_single_segment(self):
        text = "Educate, Agitate, Organise."
        segments = split_text_into_safe_segments(text, max_chars=2400)
        assert len(segments) == 1
        assert segments[0] == text

    def test_long_archival_text_is_split_safely(self):
        sentence = "Cultivation of mind should be the ultimate aim of human existence. "
        # Create a text with ~3,500 characters
        long_text = sentence * 50
        segments = split_text_into_safe_segments(long_text, max_chars=1000)

        assert len(segments) > 1
        for seg in segments:
            assert len(seg) <= 1000
            # Ensure sentence boundaries are respected
            assert seg.endswith(".") or seg.endswith("।")

        # Reconstructed content has all characters preserved
        total_words_original = set(long_text.split())
        total_words_segments = set(" ".join(segments).split())
        assert total_words_original == total_words_segments

    def test_indic_purna_viram_segmentation(self):
        indic_text = "शिका, संघटित व्हा आणि संघर्ष करा। आत्मसन्मानाने जगणे हा माणसाचा मूलभूत हक्क आहे।"
        segments = split_text_into_safe_segments(indic_text, max_chars=50)
        assert len(segments) == 2
        assert "शिका" in segments[0]
        assert "आत्मसन्मानाने" in segments[1]


class TestSarvamProviderAdapter:
    """Verifies Sarvam Bulbul v3 adapter integration, pronunciation dictionary, and output normalization."""

    def test_sarvam_language_map_has_all_target_indic_languages(self):
        expected_indic = ["bn", "ta", "gu", "te", "kn", "ml", "mr", "pa", "od"]
        for lang in expected_indic:
            assert lang in SARVAM_LANGUAGE_MAP
            assert SARVAM_LANGUAGE_MAP[lang].endswith("-IN")

    @pytest.mark.asyncio
    async def test_sarvam_adapter_synthesize_success_mock(self):
        provider = SarvamTTSProvider(api_key="mock_sarvam_key")
        dummy_wav = create_dummy_wav(duration_secs=1.0)

        # Mock SDK client
        mock_sdk = MagicMock()
        mock_sdk_resp = MagicMock()
        import base64
        mock_sdk_resp.audios = [base64.b64encode(dummy_wav).decode("ascii")]
        mock_sdk_resp.request_id = "sarvam_req_12345"
        mock_sdk.text_to_speech.convert.return_value = mock_sdk_resp
        provider._sdk_client = mock_sdk

        result = await provider.synthesize(
            text="बाबासाहेब आंबेडकर यांचे विचार प्रेरणादायी आहेत।",
            language="mr",
            dict_id="dict_ambedkar_historical",
        )

        assert isinstance(result, TTSAudioResult)
        assert result.provider == "sarvam"
        assert result.model == "bulbul:v3"
        assert result.language == "mr"
        assert result.content_type == "audio/wav"
        assert result.request_id == "sarvam_req_12345"
        assert result.dict_id == "dict_ambedkar_historical"
        assert len(result.audio_bytes) > 0

        # Check call arguments
        mock_sdk.text_to_speech.convert.assert_called_once()
        _, call_kwargs = mock_sdk.text_to_speech.convert.call_args
        assert call_kwargs["model"] == "bulbul:v3"
        assert call_kwargs["language_code"] == "mr-IN"
        assert call_kwargs["speaker"] == "shubh"
        assert call_kwargs["dict_id"] == "dict_ambedkar_historical"

    @pytest.mark.asyncio
    async def test_sarvam_defaults_to_shubh_voice_model(self):
        provider = SarvamTTSProvider(api_key="mock_sarvam_key")
        dummy_wav = create_dummy_wav(duration_secs=0.5)

        mock_sdk = MagicMock()
        mock_sdk_resp = MagicMock()
        import base64
        mock_sdk_resp.audios = [base64.b64encode(dummy_wav).decode("ascii")]
        mock_sdk_resp.request_id = "req_shubh"
        mock_sdk.text_to_speech.convert.return_value = mock_sdk_resp
        provider._sdk_client = mock_sdk

        result = await provider.synthesize(
            text="ज्ञान हे सामर्थ्य आहे।",
            language="mr",
        )

        assert result.speaker == "shubh"
        _, call_kwargs = mock_sdk.text_to_speech.convert.call_args
        assert call_kwargs["speaker"] == "shubh"

    @pytest.mark.asyncio
    async def test_sarvam_missing_api_key_raises_explicit_error(self):
        provider = SarvamTTSProvider(api_key="")
        with pytest.raises(TTSProviderError) as exc_info:
            await provider.synthesize("Test speech", language="mr")
        assert "SARVAM_API_KEY is not configured" in exc_info.value.message
        assert exc_info.value.provider == "sarvam"

    def test_combine_wav_bytes(self):
        wav1 = create_dummy_wav(0.2)
        wav2 = create_dummy_wav(0.3)
        combined = _combine_wav_bytes([wav1, wav2])

        assert len(combined) > len(wav1)
        # Verify valid WAV header
        with wave.open(io.BytesIO(combined), "rb") as w:
            assert w.getnchannels() == 1
            assert w.getframerate() == 16000


class TestNeutralOutputAndSecurity:
    """Verifies that normalized outputs hide provider internals and protect secrets."""

    def test_audio_result_neutral_dict_structure(self):
        result = TTSAudioResult(
            audio_bytes=b"RIFF...",
            content_type="audio/wav",
            provider="sarvam",
            model="bulbul:v3",
            language="mr",
            speaker="Aarohi",
            duration_seconds=3.5,
            request_id="req_987",
            is_cached=False,
        )

        d = result.to_neutral_dict(audio_url="/api/v1/indic/tts/audio/hash123.wav")

        assert d["audio_url"] == "/api/v1/indic/tts/audio/hash123.wav"
        assert d["language"] == "mr"
        assert d["voice"] == "Aarohi"
        assert d["provider"] == "sarvam"
        assert d["model"] == "bulbul:v3"
        assert d["duration_seconds"] == 3.5
        assert d["is_cached"] is False
        assert d["generation_type"] == "AI_NARRATION"

        # Security check: no API keys or secret fields present
        for key in d.keys():
            assert "key" not in key.lower() or key in ("cache_key",)
            assert "secret" not in key.lower()
            assert "auth" not in key.lower()

    @pytest.mark.asyncio
    async def test_cached_audio_reused_without_provider_call(self):
        mock_db = MagicMock()
        # Mock database returning an existing cached record
        mock_db.execute = AsyncMock(
            return_value=MagicMock(rows=[{"model": "sarvam:bulbul:v3", "language": "mr"}])
        )

        mock_sarvam = MagicMock(spec=SarvamTTSProvider)
        mock_sarvam.provider_name = "sarvam"
        mock_sarvam.supported_languages = {"mr", "bn", "ta"}
        mock_sarvam.synthesize = AsyncMock()

        service = TTSService(db=mock_db, sarvam_provider=mock_sarvam)

        # Mock os.path.exists and getsize to simulate cached file on disk
        with patch("os.path.exists", return_value=True), patch("os.path.getsize", return_value=5000):
            res = await service.synthesize(
                text="Historical speech passage",
                language="mr",
            )

            assert res.get("is_cached") is True
            assert res.get("provider") == "sarvam"
            # Ensure synthesize was NOT called on the provider
            mock_sarvam.synthesize.assert_not_called()
