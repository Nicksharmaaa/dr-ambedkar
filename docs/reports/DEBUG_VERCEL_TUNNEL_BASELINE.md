# Phase 0 — Baseline Forensic Inspection Document

## 1. System Topology & Architecture Baseline

| Component | Technology | Current Configuration / Binding | Public Visibility |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 14.x (React 18, TypeScript) | Deployed on Vercel (`Nicksharmaaa/dr-ambedkar`) | Public (`https://*.vercel.app`) |
| **Backend** | FastAPI 0.141+ (Python 3.14, Uvicorn) | Running locally on laptop: `127.0.0.1:8000` | Local only (private) |
| **Database** | PostgreSQL 16 (`ambedkar_db`) | `localhost:5432` | Local only (private) |
| **Vector Store** | In-memory DiskANN / NumPy + PostgreSQL | 12,154 embeddings (1024-dim Qwen3) | Local only (private) |
| **Tunnel Proxy** | Cloudflare Quick Tunnel (`cloudflared`) | Target: `http://127.0.0.1:8000` | Intended public HTTPS ingress |
| **ASR Service** | Groq Whisper Large v3 | Cloud API (`https://api.groq.com`) | Outbound HTTPS from backend |
| **LLM Service** | Groq `qwen/qwen3.8-27b` | Cloud API (`https://api.groq.com`) | Outbound HTTPS from backend |

---

## 2. API Endpoint Forensics

### A. AI Research Assistant
- **Endpoint Route:** `POST /api/v1/assistant/ask`
- **Controller File:** `backend/app/api/v1/assistant.py` (`ask_assistant`)
- **Service Orchestrator:** `backend/app/services/assistant/service.py` (`ResearchAssistantService`)
- **Request Method:** `POST`
- **Request Content-Type:** `application/json`
- **Request Payload Schema:**
  ```json
  {
    "question": "string",
    "mode": "ask | explain | summarize | compare | find_evidence | ask_document | ask_page | research",
    "object_id": "optional string",
    "page_number": "optional integer",
    "top_k": 5
  }
  ```
- **Response Format:** Normal `application/json` (`AssistantResponse`).
- **Streaming / SSE Status:**
  - **Does NOT use SSE** (`text/event-stream`).
  - **Does NOT use WebSockets**.
  - **Does NOT use chunked streaming responses**.
  - Returns a single, atomic, verified JSON payload containing `answer`, `citations`, `claims`, `confidence`, `took_ms`, and `evidence_chain`.
  - **Cloudflare Quick Tunnel SSE Limitation Impact:** None. Since this endpoint uses standard JSON, Quick Tunnels do not block its response format.

### B. Voice Speech-to-Text Transcription
- **Endpoint Route:** `POST /api/v1/voice/transcribe`
- **Controller File:** `backend/app/api/v1/voice.py` (`transcribe_voice_query`)
- **Service Orchestrator:** `backend/app/services/media/asr_service.py` (`ASRProvider`)
- **Request Method:** `POST`
- **Request Content-Type:** `multipart/form-data`
- **Request Fields:**
  - `audio`: Binary audio file (`UploadFile`)
  - `language`: Optional language code (`en`, `hi`, `mr`)
- **Response Format:** `application/json` (`VoiceTranscriptionResponse`) with fields `text`, `language`, `duration`, `segments`.

---

## 3. Frontend Speech Recognition & MediaRecorder Analysis

### A. Browser Web Speech API
- **Implementation:** `frontend/utils/speechUtils.ts` and `frontend/lib/utils/speechUtils.ts` (`VoiceRecognitionController`).
- **Engine:** `window.SpeechRecognition || window.webkitSpeechRecognition`.
- **Mode:** `continuous: true`, `interimResults: true`, locales `en-IN`, `hi-IN`, `mr-IN`.
- **Observed Behavior:**
  - On Chromium (Chrome / Edge), Web Speech API sends audio packets to Google's public cloud speech servers (`https://www.google.com/speech-api/v2/recognize`).
  - In certain network conditions (e.g. university networks, Indian ISPs, VPNs, ad-blockers, strict privacy firewalls), Google's endpoint fails or is blocked, triggering `event.error = "network"`.
  - The controller detects `event.error === 'network'` and initiates `startMediaRecorderFallback(options)`.

### B. MediaRecorder Whisper Fallback
- **Implementation:** `VoiceRecognitionController.startMediaRecorderFallback(...)`
- **Audio Capture:** `navigator.mediaDevices.getUserMedia({ audio: true })`
- **Audio Buffer:** Collects chunks in `this.audioChunks`.
- **Stop Handler:** Packages `Blob(this.audioChunks, ...)` and invokes `api.transcribeVoice(audioBlob, options.lang)`.
- **API Invocation:** `fetch(`${API_BASE}/voice/transcribe`, { method: "POST", body: formData })`.
- **Observed Failure:** Threw `TypeError: Failed to fetch`.

---

## 4. Network, DNS, Tunnel & CORS Forensics

### A. Tunnel DNS & Reachability Status
- **Target URL Reported in Error:** `https://appearance-base-society-mark.trycloudflare.com`
- **Local Reachability Test:**
  ```python
  urllib.request.urlopen('https://appearance-base-society-mark.trycloudflare.com/api/v1/health')
  # Result: socket.gaierror: [Errno 11001] getaddrinfo failed
  ```
- **Process Audit:**
  ```powershell
  Get-Process -Name "*cloudflared*"
  # Result: No process running
  ```
- **Conclusion:** The previous TryCloudflare Quick Tunnel was terminated when the terminal closed. Quick Tunnel URLs are ephemeral: when terminated, their DNS records are instantly destroyed.

### B. Vercel Environment Configuration
- In the user's Vercel deployment:
  - `NEXT_PUBLIC_API_URL` was saved with an accidental trailing space and without the `/api/v1` prefix: `"https://appearance-base-society-mark.trycloudflare.com "`
  - The URL was rendered by the browser as:
    `https://appearance-base-society-mark.trycloudflare.com%20/assistant/ask`
  - The `%20` space and missing `/api/v1` caused 404 / malformed URI errors even if the tunnel had been alive.

### C. Backend CORS Configuration
- In `backend/app/main.py`:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=settings.cors_origins,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- In `backend/.env`:
  `CORS_ORIGINS=["http://localhost:3000"]`
- **Vercel Origin Missing:** The Vercel production origin (`https://*.vercel.app`) was NOT in `CORS_ORIGINS`.
- **Preflight Outcome:** Any browser request from Vercel triggers an `OPTIONS` preflight. Since `allow_credentials=True` and the origin is not matched, FastAPI rejects the preflight and withholds `Access-Control-Allow-Origin`. The browser blocks the request with `TypeError: Failed to fetch`.

---

## 5. Summary of Baseline State

| Layer | Status | Root Issue Identified |
| :--- | :--- | :--- |
| **Backend Service** | Healthy (`127.0.0.1:8000`) | Operational locally; all models initialized |
| **Cloudflare Tunnel** | Offline / Terminated | Process exited, DNS entry expired (`gaierror 11001`) |
| **Vercel Environment** | Stale / Misconfigured | Contains dead tunnel URL with trailing space `%20` |
| **Backend CORS** | Restrictive | Only permits `localhost:3000`; blocks `*.vercel.app` |
| **Browser Speech** | Network Error | Google Speech API blocked; fallback triggered |
| **Whisper Fallback** | Blocked | Failed to fetch due to dead tunnel URL & CORS rejection |
