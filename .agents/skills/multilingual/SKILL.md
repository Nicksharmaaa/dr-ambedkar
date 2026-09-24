---
name: multilingual
description: Multilingual support for the archive. Translation between 22 Indic languages and English using IndicTrans2. Voice input via IndicConformer (ASR). Audio narration via IndicF5 (TTS). All running in venv-indic (Python 3.10).
---

# Multilingual Skill

## Purpose
Enable full Indic language support across the archive.

## Languages Supported
- Primary: English (en), Hindi (hi), Marathi (mr)
- Extended (IndicTrans2): Bengali, Telugu, Tamil, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Urdu, Nepali, Sindhi, Maithili, Konkani, Santhali, Dogri, Meitei, Kashmiri, Bodo, Bhojpuri

## Stack (venv-indic, Python 3.10)
- IndicTrans2: translation
- IndicConformer: ASR (voice search input)
- IndicF5: TTS (audio narration of archive text)
- FastAPI microservice on port 8001

## Translation Pipeline
1. Detect source language (langdetect or Turso-stored language field)
2. Send to IndicTrans2: source → target language
3. Cache translation in Turso (translations_cache table)
4. Serve translated text to UI

## Voice Search Pipeline
1. User speaks query (browser audio capture)
2. Frontend sends audio to POST /indic/asr/transcribe
3. IndicConformer produces text transcript
4. Transcript passed to RAG query pipeline

## Audio Narration Pipeline
1. User requests narration of page text
2. Pull OCR text from Turso (ocr_output.full_text)
3. Send to IndicF5 with target language
4. Return audio stream to client

## Fallbacks
- Translation: NLLB-200 or Google Translate API
- ASR: Whisper (if NeMo/IndicConformer fails)
- TTS: Coqui TTS (if IndicF5 fails)

## API Endpoints (port 8001)
POST /indic/translate - Text translation
POST /indic/asr/transcribe - Speech to text
POST /indic/tts/synthesize - Text to speech
GET /indic/health - Service health
