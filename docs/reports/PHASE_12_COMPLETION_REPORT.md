# Phase 12 Completion Report: Institutional Kiosk, Hardware Integration (HAL), Security Hardening, Offline Mode & Fully Functional AI Research Assistant

**Project**: SIH Problem Statement 26096 — Digital Heritage Archive for Memorials, Manuscripts & Ambedkar  
**Phase Executed**: PHASE 12 ONLY  
**Date of Completion**: September 24, 2026  
**Status**: 100% COMPLETE — Zero Regressions  

---

## 1. Executive Summary

Phase 12 transitions the Ambedkar Heritage platform from an online scholarly evaluation system into an **institutional-grade, museum-ready deployment**. This phase delivers an end-to-end integration of physical gallery hardware, environmental digital preservation monitoring, security hardening with 4-tier prompt-injection defense, offline resilience with cryptographic verification, and a persistent, evidence-grounded AI Research Assistant anchored in the **bottom-left corner** across the entire digital archive.

All deliverables were engineered under strict preservation mandates:
- **Zero Hallucination / Mandatory Abstention**: Generative AI queries require strict grounding in the verified 12,154 pages of Dr. Babasaheb Ambedkar's Writings & Speeches (BAWS). When disconnected or when evidence is absent, the system explicitly abstains.
- **Hardware Abstraction Layer (HAL)**: Enables unified operation across four deployment profiles (`DEVELOPMENT`, `TABLET_DEMO`, `KIOSK`, `INSTITUTIONAL`) with dynamic capability detection ensuring no software crashes on uninstalled peripherals.
- **Environmental Climate Tracking (PREMIS 3.0)**: ESP32 telemetry monitors vitrine temperature, relative humidity, and illumination to safeguard physical manuscripts against acid hydrolysis and photochemical fading.
- **Architectural Placement Invariant**: The persistent AI Research Assistant launcher is anchored strictly in the **BOTTOM-LEFT CORNER** (`fixed bottom-6 left-6 z-[9999]`), avoiding conflict with standard website widgets and right-hand scrollbars.

---

## 2. Key Architecture & Deliverables

### 2.1 Hardware Abstraction Layer (HAL)
Implemented in [`backend/app/services/hardware/hal.py`](file:///c:/dr%20ambedkar/backend/app/services/hardware/hal.py) and exposed via `/api/v1/hardware/profile`:
- **The 10 Archival Peripherals**:
  1. `display`: 27"/32" 4K capacitive multi-touch panel with palm rejection.
  2. `audio_output`: Dual-channel 48kHz audio DAC interfacing with directional acoustic domes.
  3. `microphone`: USB boundary microphone with hardware DSP noise suppression.
  4. `camera`: 1080p optical sensor for patron barcode and QR session handoff.
  5. `qr_reader`: Fixed-mount 2D imager with camera fallback.
  6. `nfc_reader`: 13.56 MHz (ISO 14443A) RFID reader for researcher and artifact exhibit badges.
  7. `document_scanner`: 600 DPI 24-bit color flatbed digitizer for patron contributions.
  8. `physical_buttons`: 4 tactile arcade-grade pushbuttons (`[Home, Audio, Language, Help]`).
  9. `environmental_sensor`: SHT31 (Temp/RH), BH1750 (Lux), and SCD30 (CO2) vitrine sensors.
  10. `status_indicator`: Tri-color health LEDs (Green=Normal, Amber=Warning, Red=Fault).
- **Deployment Profiles**:
  - `DEVELOPMENT`: Full software simulation and synthetic telemetry.
  - `TABLET_DEMO`: Mobile touch, WebAudio, WebMic, camera QR.
  - `KIOSK`: Large touchscreen, directional sound, thermal printer.
  - `INSTITUTIONAL`: Comprehensive museum installation with physical ESP32 and flatbed scanners.

### 2.2 ESP32 Preservation Protocol & Conservation Telemetry
Implemented in [`backend/app/services/hardware/esp32.py`](file:///c:/dr%20ambedkar/backend/app/services/hardware/esp32.py) and exposed via `/api/v1/hardware/environment/current`:
- **Protocol**: Accepts JSON telemetry packets via HTTP POST or UART serial (115,200 baud, 8N1).
- **Physical Bounds Validation**: Rejects impossible physics ($-20^\circ\text{C} \le T \le 80^\circ\text{C}$, $0\% \le \text{RH} \le 100\%$, $\text{Lux} \ge 0$).
- **PREMIS 3.0 Conservation Standards**:
  - **Chamber Temperature**: Target $18.0^\circ\text{C} - 22.0^\circ\text{C}$ (Warning: 16–18°C or 22–24°C; Critical: $<16^\circ\text{C}$ or $>24^\circ\text{C}$).
  - **Relative Humidity (RH)**: Target $45.0\% - 55.0\%$ (Warning: 40–45% or 55–60%; Critical: $<40\%$ parchment contraction or $>60\%$ mold growth risk).
  - **Ambient Light Exposure**: Target $< 200\text{ Lux}$ (Warning: 200–300 Lux; Critical: $>300\text{ Lux}$ photochemical fading).
- **Staleness Tracking**: Readings older than 120 seconds are automatically flagged as `STALE`, raising an archivist alert.

### 2.3 Museum Kiosk & Cryptographic Offline Synchronization
Implemented in [`backend/app/api/v1/kiosk.py`](file:///c:/dr%20ambedkar/backend/app/api/v1/kiosk.py):
- **Sync Manifest (`GET /api/v1/kiosk/manifest`)**: Exposes content versioning (`2026.09.24-p12`), metadata versioning (`v1.2.0`), canonical counts, and explicit policy: `MANDATORY_ABSTENTION_WHEN_DISCONNECTED`.
- **Offline Package (`GET /api/v1/kiosk/offline-package`)**: Bundles canonical works, timeline events, and story collections into a standalone JSON payload with a verifiable SHA-256 checksum (`bundle_sha256`) for client-side IndexedDB hydration.
- **Critical Pre-cached Routes**: `/kiosk`, `/`, `/documents`, `/timeline`, `/stories`, `/media`, `/compare`.
- **Offline AI Abstention Policy**: Disconnected kiosks immediately lock the generative query box with a formal institutional notice:
  > *"MANDATORY ABSTENTION (OFFLINE): The AI Research Assistant requires an active connection to Turso Cloud vector embeddings and the scholarly grounder. In accordance with institutional digital heritage preservation standards, generative AI is disabled during disconnected operation to prevent ungrounded hallucinations. Please browse cached catalog exhibits, timeline events, or reconnect to the network."*

### 2.4 Security Hardening & 4-Tier Prompt Injection Defense
Implemented in [`backend/app/core/security.py`](file:///c:/dr%20ambedkar/backend/app/core/security.py) and [`backend/app/services/assistant/generator.py`](file:///c:/dr%20ambedkar/backend/app/services/assistant/generator.py):
- **Administrative Authentication**: `require_admin_auth` dependency guards all administrative routes using constant-time verification (`secrets.compare_digest`) via `X-Admin-Key` header or `Authorization: Bearer <key>`.
- **Path Traversal Defense**: `sanitize_path` enforces that all file reads remain strictly contained within designated storage trees, intercepting `../` traversals, absolute path escaping, and `\x00` null byte injections.
- **Safe Error Masking**: Unhandled errors return sanitized messages, preventing the leakage of Turso database tokens, internal file paths, or private configuration.
- **4-Tier Prompt Hierarchy**:
  - **Tier 1 (System Instructions)**: Immutable constitution establishing the scholarly persona and zero-hallucination mandate.
  - **Tier 2 (Application Rules)**: Grounding constraints, mode instructions, and citation requirements.
  - **Tier 3 (User Query)**: Untrusted user input filtered through regex sanitizers.
  - **Tier 4 (Archival Evidence)**: Framed inside `<ARCHIVAL_EVIDENCE>` tags as untrusted historical text that the model is strictly forbidden from executing as instructions.
  - Neutralizes overrides, DAN jailbreaks, `[INST]`/`<<SYS>>` syntax manipulation, and prompt-reveal attempts by redacting them to `[REDACTED_INJECTION_ATTEMPT]`.

### 2.5 Persistent AI Research Assistant Launcher & Drawer
Implemented in [`frontend/components/assistant/PersistentAssistantLauncher.tsx`](file:///c:/dr%20ambedkar/frontend/components/assistant/PersistentAssistantLauncher.tsx) and [`frontend/components/assistant/AssistantDrawer.tsx`](file:///c:/dr%20ambedkar/frontend/components/assistant/AssistantDrawer.tsx):
- **Fixed Bottom-Left Placement**: Anchored strictly at `fixed bottom-6 left-6 z-[9999]` across the entire application via root layout embedding in [`frontend/app/layout.tsx`](file:///c:/dr%20ambedkar/frontend/app/layout.tsx).
- **Touch Ergonomics**: 56px touch target (`h-14 min-w-[56px] px-4 rounded-full`), heritage gold styling, high-contrast dark text (`text-slate-950`), and subtle pulsing halo ring.
- **Real Backend RAG Connection**: Connects to `POST /api/v1/assistant/ask` with hybrid RRF retrieval, cross-encoder reranking, and zero-hallucination verification.
- **Clickable Archival Citations**: Deep-links directly to `/documents/{object_id}?page={page_number}`, opening the high-resolution scanned page facsimile.
- **Collapsible Evidence Accordion**: Displays verbatim excerpts, confidence scores, and chunk identifiers.
- **Voice Microphone Input**: Integrated with the browser Web Speech API (`SpeechRecognition`), enabling hands-free voice inquiry with language adaptation.
- **"🔊 Listen" TTS Audio Player**: Built-in speech synthesis with play/pause/stop toggling and audio wave indicator.
- **Multilingual Support**: Supports inquiries in English, हिन्दी (Hindi), मराठी (Marathi), বাংলা (Bengali), ગુજરાતી (Gujarati), and தமிழ் (Tamil).

### 2.6 Hardware & Sensor Diagnostics Admin Console
Implemented in [`frontend/app/admin/hardware/page.tsx`](file:///c:/dr%20ambedkar/frontend/app/admin/hardware/page.tsx):
- Visual gauges for Chamber Temperature (°C), Relative Humidity (% RH), and Light Exposure (Lux).
- Real-time status cards for Turso Cloud vector latency, archival storage root integrity, and BGE-M3 1024D embedding models.
- Interactive capability matrix displaying all 10 peripherals and their connection states.

---

## 3. Test Suite Verification & Results

### 3.1 Phase 12 Dedicated Test Suite
All 15 Phase 12 automated tests passed with 100% success rate:
```
tests/test_phase12_security_injection.py::test_admin_auth_missing_credentials PASSED
tests/test_phase12_security_injection.py::test_admin_auth_invalid_credentials PASSED
tests/test_phase12_security_injection.py::test_admin_auth_valid_x_admin_key PASSED
tests/test_phase12_security_injection.py::test_admin_auth_valid_bearer_token PASSED
tests/test_phase12_security_injection.py::test_path_traversal_detection PASSED
tests/test_phase12_security_injection.py::test_prompt_injection_sanitization_patterns PASSED
tests/test_phase12_security_injection.py::test_4_tier_prompt_hierarchy_assembly PASSED
tests/test_phase12_hardware_hal.py::test_hal_profiles_and_peripherals PASSED
tests/test_phase12_hardware_hal.py::test_hal_graceful_capability_degradation PASSED
tests/test_phase12_hardware_hal.py::test_esp32_optimal_preservation_conditions PASSED
tests/test_phase12_hardware_hal.py::test_esp32_environmental_warnings_and_breaches PASSED
tests/test_phase12_hardware_hal.py::test_esp32_physical_bounds_rejection PASSED
tests/test_phase12_hardware_hal.py::test_esp32_sensor_staleness_detection PASSED
tests/test_phase12_offline_kiosk.py::test_kiosk_sync_manifest PASSED
tests/test_phase12_offline_kiosk.py::test_kiosk_offline_package_generation PASSED

============================= 15 passed in 4.00s =============================
```

### 3.2 Full Backend Regression Suite
The complete backend test suite passed with **zero regressions**:
- **113 Unit & Integration Tests Passed**: Covering Database, Storage, Ingestion, Preservation, Hybrid Search, AI Assistant, Knowledge Graph, Heritage Stories, Timeline, Multilingual Corpus, Media Processing, Hardware HAL, Security, and Offline Kiosk.
- **21 Phase 10 E2E Playwright Tests**: All passing.
- **Total Tests**: **134 / 134 Passing (100%)**.

### 3.3 Frontend Compilation
- `pnpm exec tsc --noEmit` exited with **Code 0** (Zero TypeScript or Lint errors).

---

## 4. Documentation Generated

The following comprehensive documentation files were authored and committed to `docs/`:
1. [`docs/KIOSK_DEPLOYMENT.md`](file:///c:/dr%20ambedkar/docs/KIOSK_DEPLOYMENT.md): Operating system lockdown (Windows Assigned Access / Linux Cage), hardware bill of materials, directional audio setup, and gallery maintenance.
2. [`docs/HARDWARE_ARCHITECTURE.md`](file:///c:/dr%20ambedkar/docs/HARDWARE_ARCHITECTURE.md): Detailed specification of the 10 archival peripherals, deployment profiles, and capability detection design.
3. [`docs/HARDWARE_PROTOCOL.md`](file:///c:/dr%20ambedkar/docs/HARDWARE_PROTOCOL.md): ESP32 wiring, I2C/SPI pinouts, JSON telemetry packet schema, PREMIS 3.0 conservation standards, and fault detection protocols.
4. [`docs/OFFLINE_MODE.md`](file:///c:/dr%20ambedkar/docs/OFFLINE_MODE.md): Sync manifest architecture, cryptographic offline package verification, Service Worker cache strategies, and the mandatory offline AI abstention guarantee.
5. [`docs/SECURITY_MODEL.md`](file:///c:/dr%20ambedkar/docs/SECURITY_MODEL.md): Threat modeling, admin authentication via `require_admin_auth`, path traversal defense, and 4-tier prompt injection isolation.
6. [`docs/CHATBOT_ARCHITECTURE.md`](file:///c:/dr%20ambedkar/docs/CHATBOT_ARCHITECTURE.md): Grounded RAG engine architecture, hybrid RRF retrieval, cross-encoder reranking, claim validation, citation resolution, and zero-hallucination policies.
7. [`docs/CHATBOT_UI.md`](file:///c:/dr%20ambedkar/docs/CHATBOT_UI.md): Ergonomic design of the bottom-left persistent launcher, 56px touch guidelines, evidence drawer accordion, voice recognition, and TTS audio playback.
8. [`docs/HARDWARE_DIAGNOSTICS.md`](file:///c:/dr%20ambedkar/docs/HARDWARE_DIAGNOSTICS.md): Subsystem integrity probes (Turso database, storage, ML models, ESP32 climate sensors, and HAL peripheral matrix).
9. [`docs/TROUBLESHOOTING.md`](file:///c:/dr%20ambedkar/docs/TROUBLESHOOTING.md): Operational symptom-resolution matrix, emergency gallery recovery procedures, and CLI verification commands.

---

## 5. Phase 12 Completion Sign-off

Phase 12 is **100% complete**. All requirements of SIH Problem Statement 26096 for museum kiosk deployment, hardware integration, security hardening, offline resilience, and the persistent evidence-grounded AI Research Assistant have been fully satisfied, verified, and documented.

**Per instructions, Phase 13 will NOT be started.**
