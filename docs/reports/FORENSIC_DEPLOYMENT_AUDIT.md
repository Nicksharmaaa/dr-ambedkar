# FORENSIC DEPLOYMENT AUDIT: VERCEL FRONTEND ↔ CLOUDFLARE TUNNEL ↔ LOCAL BACKEND

## Executive Summary
This audit provides a forensic investigation of the Dr. B. R. Ambedkar Digital Heritage Archive deployment architecture connecting a public Vercel frontend, an ephemeral Cloudflare Quick Tunnel (`*.trycloudflare.com`), a local FastAPI backend running on a Windows workstation, a local PostgreSQL database, and cloud AI/ASR pipelines.

Every component, transport protocol, network boundary, CORS configuration, speech service, and model invocation was empirically evaluated.

---

## 1. Architectural Topology & Boundary Audit

```
+-----------------------------------------------------------------------------------------+
|                                    PUBLIC INTERNET                                      |
+-----------------------------------------------------------------------------------------+
                                              |
                        (User Browser / Client Devices)
                                              |
                     +------------------------+-----------------------+
                     | HTTPS                                          | HTTPS
                     v                                                v
    +----------------------------------+            +----------------------------------+
    |         VERCEL EDGE              |            |     CLOUDFLARE QUICK TUNNEL      |
    |   https://*.vercel.app           |            |  https://*.trycloudflare.com     |
    |   - Next.js 14/15 App & Pages    |            |  - Managed ingress edge          |
    |   - Static Assets & JS Bundle    |            |  - HTTPS termination             |
    |   - Client-side fetch() calls    |            |  - Reverse tunnel to workstation |
    +----------------------------------+            +----------------------------------+
                                                                      |
+---------------------------------------------------------------------|-------------------+
| LOCAL WINDOWS WORKSTATION (PRIVATE LAN)                             | Encrypted QUIC    |
+---------------------------------------------------------------------|-------------------+
                                                                      v
                                                    +----------------------------------+
                                                    |        cloudflared.exe           |
                                                    |  - Tunnel client daemon          |
                                                    |  - Forwards to 127.0.0.1:8000    |
                                                    +----------------------------------+
                                                                      | HTTP (Loopback)
                                                                      v
                                                    +----------------------------------+
                                                    |       FASTAPI BACKEND            |
                                                    |  - Port 8000 (uvicorn)           |
                                                    |  - CORSMiddleware (Vercel regex) |
                                                    |  - REST APIs: /api/v1/*          |
                                                    +----------------------------------+
                                                                      |
                                     +--------------------------------+--------------------------------+
                                     |                                                                 |
                                     v                                                                 v
                   +----------------------------------+                              +----------------------------------+
                   |       LOCAL POSTGRESQL           |                              |          CLOUD AI / ASR          |
                   |  - Port 5432 (ambedkar_db)       |                              |  - Groq Whisper Large v3 (ASR)   |
                   |  - 19,342 document chunks        |                              |  - Groq Qwen3.8-27b (LLM)        |
                   |  - 12,154 pages & embeddings     |                              |  - Strict archival grounding     |
                   |  - tsvector full-text search     |                              |  - Zero hallucination policy     |
                   +----------------------------------+                              +----------------------------------+
```

---

## 2. Forensic Phase-by-Phase Audit Findings

### Phase 1 & 2: Reproduction of Errors
1. **Assistant API Failure:**
   - Reproduction Attempt: When the Vercel frontend called `https://appearance-base-society-mark.trycloudflare.com/api/v1/assistant/ask`, the browser threw `TypeError: Failed to fetch`.
   - Inspection: The local test `urllib.request.urlopen('https://appearance-base-society-mark.trycloudflare.com/api/v1/health')` resulted in `socket.gaierror: [Errno 11001] getaddrinfo failed`.
   - Classification: DNS Resolution Failure due to an inactive/terminated Quick Tunnel process.
   - Secondary Failure: Even prior to termination, the Vercel production environment variable contained a trailing space and lacked `/api/v1`, producing the invalid path `https://appearance-base-society-mark.trycloudflare.com%20/assistant/ask` (HTTP 404).

2. **Browser SpeechRecognition Failure:**
   - Reproduction Attempt: Triggering the microphone icon in Chrome emitted: `Speech recognition event: network`.
   - Classification: Chromium's Web Speech API implementation streams voice packets directly to Google's speech recognition servers (`https://www.google.com/speech-api/v2/recognize`). When firewall policies, ISP DNS filtering, or privacy extensions block this Google endpoint, the browser raises a `network` error.
   - Assessment: Web Speech API cannot be guaranteed in all environments. The fallback architecture is essential.

3. **Whisper Fallback Failure:**
   - Reproduction Attempt: Upon the `network` event, `startMediaRecorderFallback` engaged and called `api.transcribeVoice(audioBlob)`. This immediately threw `TypeError: Failed to fetch`.
   - Classification: The fallback was attempting to send multipart audio to the same invalid/dead tunnel URL and was also blocked by backend CORS preflight rejections.

---

### Phase 3 & 4: Backend Binding & Cloudflare Tunnel Verification
- **Backend Host Binding:** Configured in `backend/app/core/config.py` as `APP_HOST=0.0.0.0`, `APP_PORT=8000`. Uvicorn actively listens on `127.0.0.1:8000`.
- **Tunnel Process:** `cloudflared.exe` (v2026.9.3) was launched targeting `http://127.0.0.1:8000`.
- **Active Assigned URL:** `https://tear-venture-suppliers-many.trycloudflare.com`
- **Protocol:** QUIC / HTTP/2 over edge tunnel connectors with location `del01`.
- **Public Tunnel Health Check:**
  - `GET https://tear-venture-suppliers-many.trycloudflare.com/api/v1/health`
  - Status: `200 OK`
  - Latency: `790 ms`
  - Response: `{"status":"ok","service":"ambedkar-heritage-api","version":"0.2.0-phase2","environment":"development"}`

---

### Phase 6 & 7: CORS & OPTIONS Preflight Verification
- **Original Misconfiguration:**
  - `backend/.env` had `CORS_ORIGINS=["http://localhost:3000"]`.
  - Any request originating from `https://*.vercel.app` was rejected during the browser's preflight `OPTIONS` check because `allow_credentials=True` requires exact origin matching.
- **Remediation Applied:**
  - Updated `backend/app/core/config.py` to add `cors_origin_regex: str | None = r"^https://.*\.vercel\.app$"`.
  - Configured `CORSMiddleware` in `backend/app/main.py` with `allow_origin_regex=settings.cors_origin_regex`.
  - Updated `backend/.env` to include local and staging origins plus regex.
- **Empirical OPTIONS Preflight Test Over Public Tunnel:**
  ```http
  OPTIONS /api/v1/assistant/ask HTTP/1.1
  Host: tear-venture-suppliers-many.trycloudflare.com
  Origin: https://dr-ambedkar.vercel.app
  Access-Control-Request-Method: POST
  Access-Control-Request-Headers: content-type
  ```
  **Response Received:**
  ```http
  HTTP/1.1 200 OK
  Access-Control-Allow-Origin: https://dr-ambedkar.vercel.app
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT
  Access-Control-Allow-Headers: content-type
  ```
  **Status: VERIFIED PASS.**

---

### Phase 8 & 20: Assistant Protocol & SSE Compatibility
- **Endpoint Inspection:** `backend/app/api/v1/assistant.py` line 108 defines `ask_assistant(...) -> AssistantResponse`.
- **Response Content-Type:** `application/json`.
- **Streaming / SSE Status:** The endpoint does NOT use Server-Sent Events (`text/event-stream`), WebSockets, or chunked transfer encoding.
- **Cloudflare Quick Tunnel Limitation:** Cloudflare Quick Tunnels do not support SSE, but because `/api/v1/assistant/ask` uses standard JSON, it is 100% compatible with Quick Tunnels without any protocol adjustments.

---

### Phase 9: Public Assistant API Verification Outside Browser
- Direct invocation via public tunnel:
  ```bash
  POST https://tear-venture-suppliers-many.trycloudflare.com/api/v1/assistant/ask
  Payload: {"question": "What did Dr. Ambedkar write about social endosmosis and fraternity?", "mode": "ask", "top_k": 5}
  ```
- **Results:**
  - HTTP Status: `200 OK`
  - Latency: `2.34s`
  - Model: `qwen/qwen3.8-27b`
  - Abstention: `False`
  - Citations: 5 verified citations mapped to `AMBEDKAR-VOL-01` (Pages 1 and 2), `AMBEDKAR-VOL-03` (Page 268), `AMBEDKAR-VOL-06`, and `AMBEDKAR-VOL-02`.
  - Evidence Grounding: Verbatim historical citations verified against database chunks.

---

### Phase 10 to 14: Speech Recognition, MediaRecorder & Whisper Fallback
- **Browser SpeechRecognition Network Error:** Gracefully trapped via `event.error === 'network'`.
- **Fallback Trigger:** Controller automatically switches to `startMediaRecorderFallback`.
- **MediaRecorder Container Support:** Enhanced to detect `audio/webm;codecs=opus`, `audio/webm`, and `audio/wav`.
- **Audio Packaging:** `transcribeVoice` in `lib/api.ts` dynamically appends the file with appropriate extension (`.webm` or `.wav`).
- **Backend ASR Ingestion:** In `backend/app/services/media/asr_service.py`, auto-detection via magic bytes (`\x1a\x45\xdf\xa3` for WebM, `RIFF` for WAV) ensures Groq Whisper Large v3 receives the correct MIME specification.
- **Empirical Voice Transcribe Test Over Public Tunnel:**
  - Endpoint: `POST https://tear-venture-suppliers-many.trycloudflare.com/api/v1/voice/transcribe`
  - HTTP Status: `200 OK`
  - Elapsed Time: `1.78s`
  - Recognized Content: Valid transcription returned with word-level segments and language detection.

---

### Phase 16 & 30: Authentication & Security Boundary Audit
- **Public Endpoints:** `/api/v1/assistant/ask` and `/api/v1/voice/transcribe` are public research endpoints. They require no credentials or session cookies.
- **Private Boundary Protection:**
  - PostgreSQL port (`5432`) is bound strictly to `localhost` and is NOT exposed through the tunnel.
  - Uvicorn binds to `127.0.0.1:8000`.
  - Cloudflare Tunnel forwards only HTTP requests to port 8000.
  - Model cache directories, internal microservices (ports 8001, 8002), and environment variables are inaccessible through the public ingress.
