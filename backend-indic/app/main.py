"""
Ambedkar Heritage — Indic AI Microservice
Python 3.10 venv-indic | FastAPI | Port 8001
Services: IndicTrans2 (translation), IndicConformer (ASR), IndicF5 (TTS)
"""
from fastapi import FastAPI

app = FastAPI(
    title="Ambedkar Heritage Indic AI Service",
    description="Indic language services: Translation, ASR, TTS",
    version="0.1.0-phase1",
)


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "ambedkar-indic-service",
        "phase": "1-scaffold",
        "models": {
            "translation": "not-loaded (IndicTrans2)",
            "asr": "not-loaded (IndicConformer)",
            "tts": "not-loaded (IndicF5)",
        },
    }
