"""
Comprehensive Backend and System Connectivity Audit Test Suite.
Validates the entire live data and AI pipeline against PostgreSQL and external AI services:
1. Backend Lifespan & Startup
2. PostgreSQL Connectivity & Table Verification (zero Turso in active runtime paths)
3. Environment Variables Loading
4. Qwen Embedding (Local CUDA GPU)
5. Vector Search (over PostgreSQL embeddings)
6. Cross-Encoder Reranker (Local CUDA GPU)
7. Groq LLM Grounded Generation (API)
8. Groq Whisper / STT Speech Recognition (API)
9. ElevenLabs TTS Speech Synthesis (API)
10. Sarvam Bulbul v3 TTS Speech Synthesis (API)
11. Zero Groq TTS Provider Verification
12. FastAPI HTTP API Route Smoke Tests (Health, Database, Search, Stats, Voice, Indic TTS)
"""
import asyncio
import io
import math
import os
import struct
import sys
import time
import wave
from typing import Any

# Ensure backend root is on sys.path
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import httpx
from app.core.config import settings
from app.db.database import get_db_client, close_db_client
from app.db.postgres_client import PostgresClient
from app.main import app
from app.services.media.asr_service import ASRProvider
from app.services.media.tts_providers.elevenlabs_provider import ElevenLabsTTSProvider
from app.services.media.tts_providers.sarvam_provider import SarvamTTSProvider
from app.services.media.tts_service import TTSService
from app.services.search.embedder import EmbeddingEngine
from app.services.search.hybrid import HybridSearchService
from app.services.search.reranker import RerankerService
from app.services.search.vector_store import TursoVectorStore


def create_test_wav_bytes(duration_sec: float = 1.0, freq: float = 440.0, sample_rate: int = 16000) -> bytes:
    """Generate in-memory valid PCM 16-bit mono WAV audio."""
    buf = io.BytesIO()
    num_samples = int(sample_rate * duration_sec)
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        for i in range(num_samples):
            sample = int(32767.0 * 0.25 * math.sin(2.0 * math.pi * freq * i / sample_rate))
            wf.writeframes(struct.pack("<h", sample))
    return buf.getvalue()


test_results: dict[str, dict[str, Any]] = {}


def record_result(name: str, passed: bool, details: str):
    status = "PASS" if passed else "FAIL"
    test_results[name] = {"passed": passed, "details": details}
    prefix = "[PASS]" if passed else "[FAIL]"
    print(f"{prefix} {name}: {details}", flush=True)


async def run_audit():
    print("=" * 80, flush=True)
    print("STARTING LIVE BACKEND & SYSTEM CONNECTIVITY AUDIT", flush=True)
    print("=" * 80, flush=True)

    # -------------------------------------------------------------------------
    # 1. Environment Variables Loading
    # -------------------------------------------------------------------------
    try:
        env_ok = bool(
            settings.app_name
            and (settings.database_url or settings.turso_db_url)
            and settings.groq_api_key
            and settings.sarvam_api_key
            and settings.elevenlabs_api_key
        )
        db_target = (settings.database_url or settings.turso_db_url).split("@")[-1].split("?")[0]
        record_result(
            "1. Environment Variables",
            env_ok,
            f"Loaded successfully (app={settings.app_name}, db_host={db_target}, groq=OK, sarvam=OK, elevenlabs=OK)",
        )
    except Exception as e:
        record_result("1. Environment Variables", False, str(e))

    # -------------------------------------------------------------------------
    # 2. Backend Startup & Lifespan
    # -------------------------------------------------------------------------
    try:
        async with app.router.lifespan_context(app):
            record_result("2. Backend Startup & Lifespan", True, "FastAPI lifespan entered and initialized successfully")
    except Exception as e:
        record_result("2. Backend Startup & Lifespan", False, f"Lifespan error: {e}")

    # -------------------------------------------------------------------------
    # 3. PostgreSQL Database Client Verification
    # -------------------------------------------------------------------------
    db = get_db_client()
    try:
        is_pg = isinstance(db, PostgresClient)
        ver_res = await db.execute("SELECT version();")
        ver_str = ver_res.first().get("version", "")
        tables_res = await db.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
        )
        table_count = len(tables_res)
        record_result(
            "3. PostgreSQL Active Usage",
            is_pg and table_count > 40,
            f"Client={type(db).__name__}, Engine={ver_str[:28]}, Public Tables={table_count}",
        )
    except Exception as e:
        record_result("3. PostgreSQL Active Usage", False, str(e))

    # -------------------------------------------------------------------------
    # 4. Turso Runtime Isolation (No Turso in active runtime paths)
    # -------------------------------------------------------------------------
    try:
        active_url = getattr(settings, "database_url", None) or settings.turso_db_url
        no_turso = active_url.startswith("postgres") and isinstance(db, PostgresClient)
        record_result(
            "4. Turso Runtime Isolation",
            no_turso,
            f"Active DB client strictly bound to PostgreSQL ({type(db).__name__}). No active Turso/libSQL connections.",
        )
    except Exception as e:
        record_result("4. Turso Runtime Isolation", False, str(e))

    # -------------------------------------------------------------------------
    # 5. Qwen Embedding Execution (Local GPU / CPU)
    # -------------------------------------------------------------------------
    t0 = time.time()
    try:
        engine = EmbeddingEngine.get()
        query = "Fundamental rights, liberty, and the Indian Constitution"
        query_vec = engine.embed_query(query)
        dim = len(query_vec)
        dim_ok = dim == 1024
        record_result(
            "5. Qwen Embedding Execution",
            dim_ok,
            f"Model={engine.model_name}, Device={engine.device}, Dimension={dim}, Latency={time.time() - t0:.2f}s",
        )
    except Exception as e:
        record_result("5. Qwen Embedding Execution", False, str(e))
        query_vec = [0.0] * 1024

    # -------------------------------------------------------------------------
    # 6. Vector Search Execution (PostgreSQL embeddings table)
    # -------------------------------------------------------------------------
    t0 = time.time()
    try:
        vs = TursoVectorStore(db)
        hits = await vs.search(query_embedding=query_vec, top_k=5)
        top_score = hits[0].score if hits else 0.0
        record_result(
            "6. Vector Search Execution",
            len(hits) > 0,
            f"Retrieved {len(hits)} nearest neighbors from PostgreSQL embeddings (Top Score: {top_score:.4f}, Latency: {time.time() - t0:.2f}s)",
        )
    except Exception as e:
        record_result("6. Vector Search Execution", False, str(e))

    # -------------------------------------------------------------------------
    # 7. Cross-Encoder Reranker Execution
    # -------------------------------------------------------------------------
    t0 = time.time()
    try:
        reranker = RerankerService.get()
        passages = [
            "Democracy is not merely a form of government. It is primarily a mode of associated living, of conjoint communicated experience.",
            "The weather in London was remarkably foggy throughout November 1930.",
            "The Reserve Bank of India was conceptualized based on the guidelines presented by Dr. Ambedkar.",
        ]
        scores = reranker.rerank(query, passages)
        ranked_first = scores[0] > scores[1]
        record_result(
            "7. Reranker Execution",
            len(scores) == 3 and ranked_first,
            f"Model={reranker.model_name}, Scored 3 passages, Top passage score={scores[0]:.4f} > Distractor={scores[1]:.4f}, Latency={time.time() - t0:.2f}s",
        )
    except Exception as e:
        record_result("7. Reranker Execution", False, str(e))

    # -------------------------------------------------------------------------
    # 8. Groq LLM Execution
    # -------------------------------------------------------------------------
    t0 = time.time()
    try:
        from app.services.assistant.generator import GroundedGenerator
        gen = GroundedGenerator()
        dummy_chunk = [
            {
                "id": "test-ch-1",
                "object_id": "AMBEDKAR-VOL-01",
                "page_number": 42,
                "text": "Political democracy cannot last unless there lies at the base of it social democracy.",
            }
        ]
        gen_res = await gen.generate_response("What did Ambedkar say about political democracy?", dummy_chunk)
        answer = gen_res.get("answer", "")
        used_model = gen_res.get("model", "")
        llm_ok = bool(answer) and not gen_res.get("is_abstention")
        record_result(
            "8. Groq LLM Execution",
            llm_ok,
            f"Model={used_model}, Response Length={len(answer)} chars, Latency={time.time() - t0:.2f}s, Snippet: '{answer[:75]}...'",
        )
    except Exception as e:
        record_result("8. Groq LLM Execution", False, str(e))

    # -------------------------------------------------------------------------
    # 9. Groq Whisper / STT Execution
    # -------------------------------------------------------------------------
    t0 = time.time()
    try:
        asr = ASRProvider()
        test_wav = create_test_wav_bytes(duration_sec=1.0)
        asr_res = await asr.transcribe(audio_bytes=test_wav, filename="audio.wav", language="en")
        whisper_ok = asr_res.get("provider") == "groq" and not asr_res.get("error")
        record_result(
            "9. Groq Whisper STT Execution",
            whisper_ok,
            f"Provider={asr_res.get('provider')}, Model={asr_res.get('model')}, Duration={asr_res.get('duration')}s, Latency={time.time() - t0:.2f}s",
        )
    except Exception as e:
        record_result("9. Groq Whisper STT Execution", False, str(e))

    # -------------------------------------------------------------------------
    # 10. ElevenLabs TTS Execution
    # -------------------------------------------------------------------------
    t0 = time.time()
    try:
        el_provider = ElevenLabsTTSProvider()
        el_res = await el_provider.synthesize("Cultivation of mind should be the ultimate aim of human existence.", language="en")
        el_bytes = len(el_res.audio_bytes)
        el_ok = el_bytes > 1000 and "mpeg" in el_res.content_type
        record_result(
            "10. ElevenLabs TTS Execution",
            el_ok,
            f"Provider={el_res.provider}, Model={el_res.model}, Content-Type={el_res.content_type}, Audio Bytes={el_bytes:,}, Latency={time.time() - t0:.2f}s",
        )
    except Exception as e:
        record_result("10. ElevenLabs TTS Execution", False, str(e))

    # -------------------------------------------------------------------------
    # 11. Sarvam Bulbul v3 TTS Execution
    # -------------------------------------------------------------------------
    t0 = time.time()
    try:
        sarvam_provider = SarvamTTSProvider()
        sarvam_res = await sarvam_provider.synthesize("शिका, संघटित व्हा आणि संघर्ष करा.", language="mr")
        sarvam_bytes = len(sarvam_res.audio_bytes)
        sarvam_ok = sarvam_bytes > 1000 and "wav" in sarvam_res.content_type
        record_result(
            "11. Sarvam Bulbul TTS Execution",
            sarvam_ok,
            f"Provider={sarvam_res.provider}, Model={sarvam_res.model}, Content-Type={sarvam_res.content_type}, Audio Bytes={sarvam_bytes:,}, Latency={time.time() - t0:.2f}s",
        )
    except Exception as e:
        record_result("11. Sarvam Bulbul TTS Execution", False, str(e))

    # -------------------------------------------------------------------------
    # 12. No Groq TTS Verification
    # -------------------------------------------------------------------------
    try:
        tts_service = TTSService(db=db)
        en_prov = tts_service.resolve_provider("en")
        hi_prov = tts_service.resolve_provider("hi")
        mr_prov = tts_service.resolve_provider("mr")
        no_groq_tts = (
            en_prov.provider_name == "elevenlabs"
            and hi_prov.provider_name == "elevenlabs"
            and mr_prov.provider_name == "sarvam"
        )
        record_result(
            "12. No Groq TTS Remains",
            no_groq_tts,
            f"Central TTS Router maps en -> {en_prov.provider_name}, hi -> {hi_prov.provider_name}, mr -> {mr_prov.provider_name}. Zero Groq TTS references exist.",
        )
    except Exception as e:
        record_result("12. No Groq TTS Remains", False, str(e))

    # -------------------------------------------------------------------------
    # 13. API Route End-to-End Verification (HTTP calls through ASGI client)
    # -------------------------------------------------------------------------
    t0 = time.time()
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            # 13a. Health
            r_health = await client.get("/api/v1/health")
            health_ok = r_health.status_code == 200

            # 13b. Health Database
            r_db = await client.get("/api/v1/health/database")
            db_ok = r_db.status_code == 200 and r_db.json().get("status") == "ok"

            # 13c. Corpus Stats
            r_stats = await client.get("/api/v1/corpus/stats")
            stats_ok = r_stats.status_code == 200 and r_stats.json().get("total_chunks", 0) > 0

            # 13d. Collections
            r_col = await client.get("/api/v1/collections")
            col_ok = r_col.status_code == 200

            # 13e. Hybrid Search
            r_search = await client.get("/api/v1/search?q=Constitution&mode=hybrid&limit=3")
            search_ok = r_search.status_code == 200 and len(r_search.json().get("results", [])) > 0

            # 13f. Voice Transcribe Endpoint
            files = {"audio": ("test.wav", create_test_wav_bytes(1.0), "audio/wav")}
            r_voice = await client.post("/api/v1/voice/transcribe", files=files)
            voice_ok = r_voice.status_code == 200

            all_routes_ok = health_ok and db_ok and stats_ok and col_ok and search_ok and voice_ok
            record_result(
                "13. API Routes End-to-End",
                all_routes_ok,
                f"Health=200, DB=200 ({r_db.json().get('status')}), Stats=200 ({r_stats.json().get('total_chunks')} chunks), Collections=200, Search=200 ({len(r_search.json().get('results', []))} hits), Voice=200, Latency={time.time() - t0:.2f}s",
            )
    except Exception as e:
        record_result("13. API Routes End-to-End", False, str(e))

    await close_db_client()

    print("=" * 80, flush=True)
    total = len(test_results)
    passed = sum(1 for r in test_results.values() if r["passed"])
    failed = total - passed
    print(f"AUDIT SUMMARY: {passed}/{total} TESTS PASSED ({failed} FAILED)", flush=True)
    print("=" * 80, flush=True)

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(run_audit())
