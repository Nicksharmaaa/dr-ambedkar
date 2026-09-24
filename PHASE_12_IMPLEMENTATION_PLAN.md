# PHASE 12 IMPLEMENTATION PLAN
## Institutional Kiosk, Hardware Integration, Security Hardening, Offline Mode, and Fully Functional AI Research Assistant
**Date:** September 24, 2026 | **Version:** 1.0.0 | **Status:** APPROVED FOR EXECUTION  
**Project:** SIH Problem Statement 26096 — Digital Heritage Archive for Memorials, Manuscripts & Ambedkar: AI-Powered Institutional Archive and Audio-Visual Knowledge Platform

---

### 1. Executive Context & Phase 11 Invariant Continuity

In strict accordance with the Phase 12 Mandates:
1. **Phase 11 Baselines Frozen:** The existing ML models (`Qwen3-Embedding-0.6B` 1024-dim MRL, `Qwen3-Reranker-0.6B`, Turso FTS5 BM25, Hybrid RRF $k=60$, Dual-branch multilingual query expansion, Multimodal PP-OCRv5, Whisper Large v3 ASR, Edge-TTS, Grounded Qwen-27B RAG) met or exceeded all target metrics in Phase 11.
2. **Zero Unnecessary Model Training:** No foundation or generative models will be fine-tuned or trained from scratch.
3. **Database Invariant:** Turso Cloud (`libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io`) remains the sole database. No PostgreSQL will be introduced.
4. **Hardware Environment:** NVIDIA GeForce RTX 4050 Laptop GPU (6.0 GB VRAM), 16 logical CPU threads, 15.8 GB RAM. Serving budget maintains <= 1.6 GB concurrent VRAM.

---

### 1.1 Pre-Execution Test & Application Baseline

In strict accordance with the Mandatory Execution Protocol:
- **Total Backend Tests Executed:** 119 tests across `backend/tests/`
- **Total E2E Tests Executed:** 21 tests in `backend/tests/e2e/test_phase10_institutional_experience.py`
- **Grand Total Baseline Tests:** **140 tests**
- **Passed:** **140 / 140 (100.0%)**
- **Failed:** **0**
- **Skipped:** **0**
- **Errors:** **0**
- **Warnings:** 0 blocking warnings
- **Application Startup State:**
  - FastAPI Backend: Running at `http://127.0.0.1:8000` (`status: ok`)
  - Next.js 16 Frontend: Running at `http://localhost:3000`
  - Turso Cloud Database: Active (`libsql-client` connected, latency ~25ms)
  - Serving Latencies: Same-language ~450ms, cross-language ~1.15s, reranker ~28.4ms/candidate, grounded RAG ~1.24s.

---

### 2. Baseline Architecture Audit & Current Weaknesses

| Architectural Domain | Current Implementation (End of Phase 11) | Current Weakness / Gap Addressed in Phase 12 |
|---|---|---|
| **AI Assistant UI** | Standalone route `/assistant` with 8 research modes. | **Missing persistent floating launcher** in the **bottom-left corner** of all visitor routes. Users on `/`, `/documents`, `/timeline`, `/media` cannot seamlessly invoke the assistant. |
| **Chatbot Integration** | Page-bound state on `/assistant`. | Needs a universal floating drawer/panel component (`AssistantDrawer` / `PersistentAssistantLauncher`) anchored to `bottom: 24px; left: 24px; z-index: 9999` with real API streaming, evidence drawer, citation deep-linking, voice input, and TTS. |
| **Archival Prompt Injection** | Basic regex sanitizer in `generator.py`. | Needs strict defense-in-depth: explicit separation of `SYSTEM INSTRUCTIONS` $\rightarrow$ `APPLICATION RULES` $\rightarrow$ `USER QUERY` $\rightarrow$ `RETRIEVED ARCHIVAL EVIDENCE`. Adversarial instructions embedded in raw OCR or transcripts must be treated strictly as passive data. |
| **API Security & Auth** | Open endpoints on `/api/v1/admin/schema/*` without role/key enforcement; no rate limiting or request size caps. | Needs administrative API key / bearer token validation, request rate limiting, payload size constraints (e.g. max 10MB file, max 2KB query), and path traversal prevention. |
| **Hardware Abstraction Layer (HAL)** | Monolithic assumptions about browser/host peripherals. | Needs formal `HardwareManager` abstraction supporting 4 deployment profiles: `DEVELOPMENT`, `TABLET_DEMO`, `KIOSK`, `INSTITUTIONAL`, with dynamic capability detection for Touch, Audio, Mic, Camera, Scanner, QR, NFC, Buttons, and Sensors. |
| **ESP32 & Sensors** | Conceptual mock endpoints. | Clean, standardized serial/HTTP/WebSocket hardware telemetry protocol with validation and a dev simulation adapter. Real environmental tracking (Temp, Humidity, Light, Air Quality). |
| **Offline-First Mode** | Partial service worker / caching. | Full Service Worker PWA with Cache-First strategy for static shell, IndexedDB / Cache API for top 100 metadata records and key audio snippets, offline connectivity banner (`CONNECTED` vs `OFFLINE MODE`), and explicit AI abstention when offline. |
| **Diagnostic Health Dashboard** | Basic status checks. | Dedicated `/admin/hardware` and kiosk diagnostics modal displaying live peripheral statuses (Display, Touch, Mic, Speakers, QR, NFC, ESP32, Sensors, Network, Storage, Turso, Sync). Zero fake green lights. |

---

### 3. Detailed Phase 12 Implementation Modules

#### Module 1: Security Hardening & Prompt-Injection Defense
1. **API Authentication & Admin Protection:**
   - Implement `AdminAuthMiddleware` / dependency verifying `X-Admin-Key` or Bearer token for all administrative routes (`/api/v1/admin/*`, `/api/v1/ingestion/*`).
   - Secure error handling: strip internal stack traces and database connection URLs in 500 responses.
2. **Request Validation, Rate Limiting & Path Traversal Prevention:**
   - Add slowapi / memory-backed rate limiter on `/api/v1/assistant/ask` and `/api/v1/search` (e.g. 60 requests/minute/IP).
   - Enforce path sanitization on all storage operations: reject paths with `..`, absolute paths outside storage root, or null bytes.
   - Enforce request payload size limits (max 10MB for audio/PDF uploads, max 4KB for queries).
3. **Archival Prompt-Injection Defense Hierarchy:**
   - Architecture:
     ```
     [SYSTEM INSTRUCTIONS] -> Highest priority, immutable
     [APPLICATION RULES]   -> Grounding, citation, mandatory abstention rules
     [USER QUERY]          -> Sanitized user prompt
     [ARCHIVAL EVIDENCE]   -> XML-tagged DATA: <ARCHIVAL_DATA is_untrusted_data="true">
     ```
   - Automated injection detector neutralizing: *"ignore previous instructions"*, *"system override"*, *"reveal prompt"*, etc.

#### Module 2: Persistent Bottom-Left AI Research Assistant Launcher & UI
1. **Physical Positioning Invariant:**
   - Placed strictly in the **BOTTOM-LEFT CORNER** (`fixed bottom-6 left-6 z-[9999]`), NOT bottom-right.
   - Floating action button: 56px touch target, heritage gold/slate styling, icon + label `"Ask the Archive"`, subtle pulse animation, high z-index, accessibility aria-labels.
2. **Real Backend Integration (Zero Fake / Mock AI):**
   - Direct integration with `POST /api/v1/assistant/ask`.
   - Complete conversational flow: User Query $\rightarrow$ Query Normalization $\rightarrow$ Hybrid RRF Retrieval $\rightarrow$ Qwen3 Reranker $\rightarrow$ Grounded RAG Synthesis $\rightarrow$ Evidence Extraction $\rightarrow$ Volume/Page Deep Links.
3. **Interactive Features:**
   - **Evidence Drawer:** Expandable section showing exact retrieved passages, confidence, and document/page tags.
   - **Clickable Citations:** Deep-links directly to `/documents/{id}?page={page}&query={term}` or audiovisual timestamps `/media/{type}/{id}?t={time}`.
   - **Multilingual Support:** English, Hindi, Bengali, Gujarati, Tamil.
   - **Voice Input:** Web Speech API / microphone recording streaming to `POST /api/v1/voice/transcribe` with fallback capability explanation if mic is absent.
   - **Text-to-Speech (TTS):** "🔊 Listen" button invoking `POST /api/v1/voice/narrate` or edge TTS.
   - **Context Sensitivity:** Automatically supports "Ask This Page", "Ask This Document", "Ask About This Media" when opened within viewer views.

#### Module 3: Hardware Abstraction Layer (HAL) & Kiosk Integration
1. **Unified Hardware Interface (`HAL`):**
   - Abstractions: `TouchDisplay`, `AudioOutput`, `Microphone`, `Camera`, `DocumentScanner`, `QRCodeReader`, `NFCReader`, `PhysicalButton`, `EnvironmentalSensor`, `StatusIndicator`.
   - Deployment Profiles:
     - `DEVELOPMENT`: Mock/simulated peripherals with manual toggles.
     - `TABLET_DEMO`: Touch screen, camera QR, web audio, software mic.
     - `KIOSK`: 27"/32" touch screen, Mini PC, hardware speakers, USB mic, QR reader.
     - `INSTITUTIONAL`: Full preservation suite with ESP32 sensors, physical buttons, NFC, and document scanners.
2. **ESP32 Controller Protocol:**
   - Standardized JSON packet over serial / WebSocket:
     `{"device_id": "esp32-kiosk-01", "type": "TELEMETRY", "sensors": {"temp_c": 21.4, "humidity_rh": 48.2, "light_lux": 150.0}, "buttons": [0,0,1], "nfc": null}`.
   - Incoming payload schema validation and sanitization.
   - Built-in simulation adapter for development.
3. **Preservation Environment Monitoring:**
   - Endpoints: `GET /api/v1/hardware/environment/current` and `/history`.
   - Displays real-time temperature (18–22°C threshold), relative humidity (45–55% RH), and light exposure with timestamped alert history.

#### Module 4: Offline-First Kiosk & Synchronization Architecture
1. **Offline PWA Shell & Asset Caching:**
   - Service Worker caching Next.js bundles, CSS, icons, fonts, and static manifests.
   - IndexedDB caching of all 112 work manifests, timeline events, and top 20 canonical documents.
2. **Connectivity State & Offline Chatbot Behavior:**
   - Real-time `navigator.onLine` + ping verification.
   - Live banner: `CONNECTED` (Emerald) vs `OFFLINE MODE (Local Cache)` (Amber).
   - **Offline AI Invariant:** When the central backend is unreachable, the assistant **explicitly abstains**:
     *"The AI Research Assistant is currently offline. You can continue browsing the locally cached archive documents and timeline."*
     **Zero fake/hallucinated answers.**
3. **Sync Engine:**
   - Version manifests (`content_version`, `cache_version`, `metadata_version`).
   - Sync dashboard for administrators detailing pending, successful, and failed syncs.

#### Module 5: Hardware Health Diagnostic Dashboard
1. **Interactive Diagnostic Suite (`/admin/hardware`):**
   - Real-time diagnostic cards for all 13 subsystems.
   - Live probe execution (tests microphone audio levels, speaker test tone, network ping, storage write test, Turso query latency).
   - Zero hardcoded fake green indicators.

---

### 4. Verification & Testing Protocol

1. **Security & Injection Test Suite (`test_phase12_security_injection.py`):**
   - Admin route authentication enforcement.
   - Path traversal prevention (`../../etc/passwd`).
   - Oversized payload rejection.
   - 10 adversarial prompt injection attacks targeting archival evidence tags.
2. **Hardware & HAL Test Suite (`test_phase12_hardware_hal.py`):**
   - Profile initialization across all 4 modes.
   - Peripheral capability detection and graceful degradation.
   - ESP32 telemetry packet validation.
   - Environmental threshold alerting.
3. **Offline & Kiosk Test Suite (`test_phase12_offline_kiosk.py`):**
   - Cache manifest generation.
   - Offline AI abstention verification.
   - Sync conflict resolution.
4. **End-to-End Chatbot Browser Verification:**
   - Confirm launcher fixed in bottom-left corner across all viewports (desktop, tablet, mobile, kiosk).
   - Execute real grounded search query, verify citations, and follow deep-link to page viewer.

---

### 5. Deliverable Documentation Index (in `docs/`)
- `docs/KIOSK_DEPLOYMENT.md`
- `docs/HARDWARE_ARCHITECTURE.md`
- `docs/HARDWARE_PROTOCOL.md`
- `docs/OFFLINE_MODE.md`
- `docs/SECURITY_MODEL.md`
- `docs/CHATBOT_ARCHITECTURE.md`
- `docs/CHATBOT_UI.md`
- `docs/HARDWARE_DIAGNOSTICS.md`
- `docs/TROUBLESHOOTING.md`
- `PHASE_12_COMPLETION_REPORT.md`
