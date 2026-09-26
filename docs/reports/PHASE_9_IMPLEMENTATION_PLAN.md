# PHASE 9 IMPLEMENTATION PLAN
## Multilingual & Multimodal Accessibility System
### Ambedkar Heritage Intelligence & Digital Preservation System

**Author**: Antigravity Pair Programmer  
**Date**: September 24, 2026  
**Status**: APPROVED FOR EXECUTION  
**Scope**: PHASE 9 ONLY (Phase 10 shall NOT be started)

---

## 1. Objectives & Architectural Principles

1. **Multilingual Reading & Search**:
   - Primary languages: English (`en`), Hindi (`hi`), Marathi (`mr`).
   - The archive remains the sole source of truth; original archival text is never overwritten.
   - Every translation is a derivative product stored with provenance (`source_language`, `target_language`, `model_name`, `review_status`).
   - Cross-lingual retrieval: queries in Hindi/Marathi accurately retrieve English primary sources and vice-versa.
   - Grounded multilingual AI answers: responses match user's language while citations remain uncorrupted.

2. **Voice Search & Speech Recognition (ASR)**:
   - Provide `ASRProvider` abstraction.
   - Groq Whisper Large v3 (ultra-low latency with word-level timestamps) + browser Web Speech API.
   - Voice search overlay: `[ 🎤 Ask the Archive ]` -> "Listening..." -> Editable transcript -> Search.

3. **Audio Narration (TTS)**:
   - High-fidelity Indic neural speech synthesis (`edge-tts` supporting Hindi `hi-IN-SwaraNeural`, Marathi `mr-IN-AarohiNeural`, English `en-IN-NeerjaNeural`).
   - Distinguish `ORIGINAL_RECORDING` vs `AI_NARRATION`.
   - Audio caching in `tts_cache` and `storage/local/audio/narration/`.

4. **Audio & Video Archive with Searchable Transcripts**:
   - Timestamped transcripts for audio and video media assets.
   - Full-text and semantic search across spoken transcript segments.
   - Clicking search results seeks media player directly to exact timestamp (e.g. `12:43`).

5. **Multimodal Page Understanding & "Ask This Page" (Signature Feature)**:
   - Visual layout analysis and OCR conflict detection.
   - Interactive Ask This Page options:
     - Summarize this page
     - Explain in simple language
     - Translate this page (Hi/Mr/En)
     - Read page aloud (Audio narration)
     - Identify people & concepts
     - Custom grounded inquiry
   - Citation taxonomy: explicitly distinguishes "Source: Current Page" from retrieved related documents.

---

## 2. Workstream Breakdown

### Workstream A: Database Schema & Migration 005
- Create `backend/app/db/migrations/005_phase9_multilingual_multimodal.sql`:
  - `translations_cache`: Derivative translations with model metadata.
  - `tts_cache`: Generated narration audio paths, hashes, and generation type.
  - `transcript_segments`: Timestamped words/sentences (`media_asset_id`, `start_time`, `end_time`, `text`, `language`, `speaker_name`).
  - `multimodal_page_analyses`: Visual reasoning results and OCR conflict detection.
  - `entity_localizations` & `timeline_localizations`: Localized display titles in Hindi and Marathi.
- Apply migration to Turso Cloud database.

### Workstream B: Backend Multilingual & Translation Service
- Implement `backend/app/services/multilingual/translator.py`:
  - Language detection (Devanagari vs Latin, Indic scripts).
  - High-accuracy translation via Groq `qwen/qwen3.8-27b` with academic/legal domain instructions.
  - Persistent caching in Turso `translations_cache`.
- Implement cross-lingual search in `backend/app/services/search/multilingual_search.py`:
  - Translates query to English if non-English, embeds with multilingual Qwen3, fuses with FTS5.

### Workstream C: Voice & Media Processing Service
- Implement `backend/app/services/media/asr_service.py`:
  - ASR abstraction for Groq Whisper Large v3 audio transcription.
  - Fallback handling for silent, low-confidence, or noisy audio.
- Implement `backend/app/services/media/tts_service.py`:
  - Neural text-to-speech for Hindi, Marathi, and English.
  - Audio file caching and disk streaming.
- Implement `backend/app/services/media/media_service.py`:
  - Seed canonical archival audio (`track-bbc-1931`, `track-air-1950`) and video (`video-cad-1949`) with timestamped segments in Turso.
  - Search spoken media transcripts with seek-to-timestamp links.

### Workstream D: Multimodal Page Understanding & "Ask This Page"
- Implement `backend/app/services/multimodal/page_analyzer.py`:
  - Visual layout interpretation and OCR conflict detector.
- Implement `backend/app/services/assistant/ask_page.py`:
  - Signature Ask This Page engine with structured options: Summarize, Explain, Translate, Read Aloud, Entity Extraction, and Custom Q&A.
  - Enforces strict distinction between "Source: Current Page" and related external citations.

### Workstream E: API Endpoints (`/api/v1`)
- `POST /api/v1/indic/translate`: Translate text chunk or page.
- `POST /api/v1/indic/tts/synthesize`: Synthesize narration audio.
- `POST /api/v1/voice/transcribe`: Audio speech-to-text.
- `GET /api/v1/media/tracks`: Media catalog with metadata.
- `GET /api/v1/media/tracks/{id}`: Detailed media with timestamped transcripts.
- `GET /api/v1/media/search`: Search spoken audio/video segments.
- `POST /api/v1/multimodal/analyze-page`: Visual reasoning and OCR conflict audit.
- `POST /api/v1/assistant/ask-page`: Enhanced Ask This Page endpoint.

### Workstream F: Next.js Frontend Integration
- Create `frontend/components/voice/VoiceSearchModal.tsx`:
  - Microphone activation, listening animation, transcript review/edit, and instant search trigger.
- Enhance `frontend/components/viewer/ArchivalViewer.tsx`:
  - Mode switcher: `ORIGINAL (Facsimile)` | `OCR TEXT` | `TRANSLATION (Hi/Mr/En)` | `ASK THIS PAGE`.
  - Language dropdown: English, Hindi, Marathi (preserves current page number!).
  - Audio narration toolbar: Play/Pause generated reading.
- Create `frontend/components/viewer/AskThisPageDrawer.tsx`:
  - Dedicated Ask This Page interactive panel with quick action pills and citation inspector.
- Rebuild `frontend/app/media/page.tsx`:
  - Interactive media player with synchronized timestamp transcript scrolling, speaker tags, and search.

### Workstream G: Validation, Performance & Documentation
- Pytest test suites:
  - `test_phase9_multilingual.py`
  - `test_phase9_voice_media.py`
  - `test_phase9_ask_page.py`
- Latency benchmarks (ASR, translation, TTS, media search, Ask This Page).
- Deliver documentation:
  - `MULTILINGUAL_ARCHITECTURE.md`
  - `VOICE_ARCHITECTURE.md`
  - `AUDIO_VIDEO_ARCHITECTURE.md`
  - `MULTIMODAL_ARCHITECTURE.md`
  - `LANGUAGE_DATA_MODEL.md`
  - Update `MODEL_REGISTRY.md`, `SYSTEM_ARCHITECTURE.md`, `API_CONTRACT.md`
  - `PHASE_9_COMPLETION_REPORT.md`
- Conclude and STOP.
