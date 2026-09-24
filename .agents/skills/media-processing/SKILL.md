---
name: media-processing
description: Processing pipeline for audio recordings and video files. Transcription via IndicConformer, frame extraction for OCR, IIIF A/V manifest generation, searchable media.
---

# Media Processing Skill

## Purpose
Process audio speeches and video recordings to make them searchable and IIIF-compatible.

## Audio Processing Pipeline
1. Receive audio file (MP3/WAV/FLAC)
2. Format normalization (16kHz mono WAV for IndicConformer)
3. Speaker diarization (optional; detect speaker changes)
4. Transcription: IndicConformer (Indic) or Whisper (general)
5. Word-level timestamps (for synchronization)
6. Store: transcript JSON in storage/local/audio/{object_id}/
7. Store: transcript text in Turso (transcript text + chunks)
8. Index: chunk text in FTS5 + embed in Turso vector store

## Video Processing Pipeline
1. Receive video file (MP4/MKV)
2. Extract keyframes (1 per 5 seconds)
3. OCR frames (PP-OCRv5) for on-screen text
4. Extract audio track → transcription (same as audio pipeline)
5. Generate IIIF A/V manifest with time coordinates
6. Store transcript + frame OCR in Turso

## IIIF A/V Manifest
- IIIF Presentation API 3.0 with duration on Canvas
- Annotations: transcript segments synchronized to time codes
- Accessible via IIIF viewer (Clover IIIF)

## Searchable Media
- Transcript chunks indexed in FTS5 → user can search spoken words
- Transcript chunks embedded → semantic search finds spoken concepts
- Search result links to specific timestamp in audio/video player

## API Endpoints
POST /api/v1/media/process-audio/{object_id}
POST /api/v1/media/process-video/{object_id}
GET /api/v1/media/{object_id}/transcript
GET /api/v1/media/{object_id}/stream
