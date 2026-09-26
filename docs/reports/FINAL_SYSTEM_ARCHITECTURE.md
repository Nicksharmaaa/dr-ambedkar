# FINAL SYSTEM ARCHITECTURE
## Digital Heritage Archive for Memorials, Manuscripts & Ambedkar
**SIH Problem Statement 26096: AI-Powered Institutional Archive and Audio-Visual Knowledge Platform**  
**Final Validation Phase — Terminal Engineering Architecture**  
**Date:** September 2026 | **Status:** FROZEN & VERIFIED

---

## 1. Architectural Overview & System Topography

The Ambedkar Digital Heritage Platform is an institutional-grade, evidence-grounded archival system engineered for national memorials, research universities, museum kiosks, and global scholars. The system guarantees zero-hallucination research assistance, immutable preservation of primary historical records, sub-second hybrid retrieval across multilingual corpora, and responsive physical-digital exhibition synchronization via a Hardware Abstraction Layer (HAL).

```
 +----------------------------------------------------------------------------------------------------+
 |                                  CLIENT & INTERACTION LAYER                                        |
 |                                                                                                    |
 |  +--------------------------------+  +--------------------------------+  +----------------------+  |
 |  |    Next.js 14 App Shell        |  |   Museum Kiosk Touch PWA       |  |  Research Assistant  |  |
 |  |   - Server-Side Rendering      |  |  - Fullscreen Touch UI (80px+) |  |  - Bottom-Left Anchor|  |
 |  |   - TailwindCSS + Vanilla CSS  |  |  - ServiceWorker Offline Cache |  |  - Dual Voice/Speech |  |
 |  |   - Accessible High-Contrast   |  |  - Heartbeat & Telemetry Mon   |  |  - Citation DeepLink |  |
 |  +--------------------------------+  +--------------------------------+  +----------------------+  |
 +--------------------------------------------------+-------------------------------------------------+
                                                    | JSON / SSE / WebSocket / REST
                                                    v
 +----------------------------------------------------------------------------------------------------+
 |                                FASTAPI BACKEND SERVICES (Port 8000)                                |
 |                                                                                                    |
 |  +----------------------------------------------------------------------------------------------+  |
 |  | Middleware: CORSMiddleware, RequestLogging, SecurityHeaders, RateLimiting, SessionValidation   |  |
 |  +----------------------------------------------------------------------------------------------+  |
 |                                                                                                    |
 |  +-----------------------+  +-----------------------+  +------------------+  +------------------+  |
 |  | Corpus & Facsimile    |  | Search & Retrieval    |  | Assistant (RAG)  |  | Hardware HAL     |  |
 |  | - Metadata Registry   |  | - Lexical (FTS5 BM25) |  | - 4-Tier Prompt  |  | - 10 Peripherals |  |
 |  | - ALTO XML / IIIF     |  | - DiskANN / Cosine    |  | - Reranker Filter|  | - 4 Profiles    |  |
 |  | - Read-Only Safeguard |  | - Hybrid RRF (k=60)   |  | - Mandatory Abs. |  | - ESP32 Bridge   |  |
 |  +-----------------------+  +-----------------------+  +------------------+  +------------------+  |
 |                                                                                                    |
 |  +-----------------------+  +-----------------------+  +------------------+  +------------------+  |
 |  | Multilingual Engine   |  | Knowledge Graph (KG)  |  | Audiovisual Hub  |  | Offline Sync     |  |
 |  | - IndicTrans2 Dual Br.|  | - 1,480+ Triples      |  | - Spoken ASR     |  | - Manifest Gen   |  |
 |  | - Language Detection  |  | - Entity Graph API    |  | - Timestamp Seek |  | - Cache Registry |  |
 |  | - Cross-Lingual RRF   |  | - Path Discovery      |  | - WebVTT Sync    |  | - Offline Policy |  |
 |  +-----------------------+  +-----------------------+  +------------------+  +------------------+  |
 +--------------------------------------------------+-------------------------------------------------+
                                                    |
                         +--------------------------+--------------------------+
                         |                                                     |
                         v                                                     v
 +-------------------------------------------------+  +-----------------------------------------------+
 |            PRIMARY DATA PERSISTENCE             |  |           MODEL EXECUTION ENGINES             |
 |                                                 |  |                                               |
 |  +-------------------------------------------+  |  |  +-----------------------------------------+  |
 |  | Turso Cloud (libSQL Engine)               |  |  |  | In-Memory GPU/CPU Neural Models         |  |
 |  | - Primary Cloud Database                  |  |  |  | - Qwen3-Embedding-0.6B (1024-dim dense) |  |
 |  | - diskann_cosine Index (12,154 vectors)   |  |  |  | - Qwen3-Reranker-0.6B (Cross-Encoder)   |  |
 |  | - chunks_fts (BM25 full-text index)       |  |  |  +-----------------------------------------+  |
 |  | - Archival Metadata & Provenance Records  |  |  |                                               |
 |  +-------------------------------------------+  |  |  +-----------------------------------------+  |
 |                                                 |  |  | High-Speed LPU & Cloud Generation       |  |
 |  +-------------------------------------------+  |  |  | - Groq LPU (Qwen 3.8-27b) Primary       |  |
 |  | Local Storage & Cache Subsystem           |  |  |  | - Google Gemini 2.5 Flash Fallback      |  |
 |  | - vector_cache.npz (12,154 chunk matrix)  |  |  |  +-----------------------------------------+  |
 |  | - Facsimiles / Master TIFFs (Read-Only)   |  |  |                                               |
 |  | - IIIF Presentation & Image Manifests     |  |  |  +-----------------------------------------+  |
 |  | - Audio Tracks (BBC 1931, Speeches)       |  |  |  | Indic Processing Subsystem (Port 8001)  |  |
 |  +-------------------------------------------+  |  |  | - IndicTrans2 Dual-Branch Bridge        |  |
 |                                                 |  |  | - IndicConformer ASR / Whisper          |  |
 |                                                 |  |  +-----------------------------------------+  |
 +-------------------------------------------------+  +-----------------------------------------------+
```

---

## 2. Core Architectural Subsystems

### 2.1 Web Presentation & Kiosk Layer (Next.js 14)
- **Framework:** Next.js 14 App Router with React Server Components (RSC) and Client Hydration.
- **Design Philosophy:** Minimalist, museum-grade aesthetics using high-contrast typography (Cinzel, Inter), responsive CSS grids, and accessible color tokens.
- **Persistent AI Assistant Launcher:** Formally invariant position anchored to the **bottom-left corner** (`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[9999]`) across all archive interfaces.
- **Museum Touch Kiosk Mode (`/kiosk`):**
  - Viewport lockdown with touch-optimized targets ($\ge 80\text{px}$).
  - Hardware status bar displaying real-time peripheral telemetry (RFID, thermal printer, ambient lighting).
  - Native ServiceWorker caching of static exhibition media, timeline exhibits, and pre-indexed catalog chunks.

### 2.2 API & Business Logic Layer (FastAPI)
- **Runtime:** Python 3.11+ ASGI microservice using `uvicorn`.
- **Modularity:** Layered domain architecture:
  - `app/api/v1/`: Endpoint routing with Pydantic validation schemas.
  - `app/services/`: Core computational logic (RAG orchestration, Search, KG, Hardware HAL, Timeline, Audio/Video).
  - `app/core/`: Security filters, configuration loader, rate limiters, and custom exception handlers.
- **Performance Optimizations:**
  - Non-blocking asynchronous I/O (`asyncio`, `httpx.AsyncClient`).
  - Pre-warmed local vector matrix cache (`vector_cache.npz`, 12,154 vectors) ensuring sub-second vector similarity retrieval without repeated database round-trips.

### 2.3 Primary Data & Vector Persistence (Turso Cloud)
- **Database Engine:** Turso Cloud (libSQL dialect) hosted on AWS ap-south-1 (`libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io`).
- **Data Invariant:** No PostgreSQL dependency; Turso serves as the single source of truth for both relational entities and vector search.
- **Index Architecture:**
  - `chunks`: 12,154 archival text segments across 16 major volumes with volume, page, section, and original publication metadata.
  - `chunks_fts`: SQLite FTS5 full-text index leveraging Porter stemmer and unicode61 tokenization for high-precision BM25 lexical discovery.
  - `embeddings`: 1024-dimensional normalized dense vectors indexed via DiskANN cosine similarity.

---

## 3. Retrieval & Evidence-Based Synthesis (RAG) Architecture

```
[User Query] (Multilingual / English)
      |
      v
+-------------------------------+
| Cross-Lingual Query Normalizer| ---> Detected Indic Language -> Translated to English Context
+-------------------------------+
      |
      +-----------------------------------------+
      |                                         |
      v                                         v
+-----------------------------+   +-----------------------------+
| Lexical Search (FTS5 BM25)  |   | Vector Search (Qwen3-Dense) |
| Top 20 Exact Keyword Matches|   | Top 20 Cosine Nearest Chunks|
+-----------------------------+   +-----------------------------+
      |                                         |
      +--------------------+--------------------+
                           |
                           v
+-------------------------------------------------------+
| Reciprocal Rank Fusion (RRF, k=60)                    |
| Combined Score = Sum( 1 / (60 + rank_lexical) + ... ) |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
| Cross-Encoder Reranker (Qwen3-Reranker-0.6B)          |
| Scored Relevance: [0.0 - 1.0]                         |
+-------------------------------------------------------+
                           |
          +----------------+----------------+
          |                                 |
          v (Max Score < 0.20               v (Max Score >= 0.20)
             or Out-of-Corpus)              |
+-----------------------------------+       v
| Mandatory Abstention Generator    | +-----------------------------------+
| "The available archive does not   | | 4-Tier XML Prompt Constructor     |
|  contain sufficient evidence..."  | | <archive_corpus>                  |
+-----------------------------------+ |   <document id="..." page="...">  |
                                      |     [Primary Text Excerpt]        |
                                      |   </document>                     |
                                      | </archive_corpus>                 |
                                      +-----------------------------------+
                                                    |
                                                    v
                                      +-----------------------------------+
                                      | Groq LPU (Qwen 3.8-27b)           |
                                      | (Fallback: Gemini 2.5 Flash)      |
                                      +-----------------------------------+
                                                    |
                                                    v
                                      +-----------------------------------+
                                      | Post-Synthesis Citation Validator |
                                      | Strict Page, DocID & Viewer URL   |
                                      +-----------------------------------+
```

### 3.1 Four-Tier XML Prompt Hierarchy
To eliminate model hallucinations and defend against prompt injections, context is strictly partitioned into structured XML tags:
1. `<system_instruction>`: Enforces strict archival grounding, prohibits anachronistic speculation, and mandates that every factual claim must cite an embedded chunk identifier.
2. `<archive_corpus>`: Contains strictly retrieved archival documents with verified `doc_id`, `page_number`, `volume_title`, and text excerpt.
3. `<adversarial_defense>`: Pre-scanned user inputs with neutralized injection patterns (`[REDACTED_INJECTION_ATTEMPT]`).
4. `<grounding_verification>`: Instructs the model to emit an explicit abstention sentence if the retrieved corpus does not directly address the inquiry.

---

## 4. Hardware Abstraction Layer (HAL) & Physical-Digital Bridge

The Hardware Abstraction Layer provides a standardized interface for museum exhibits, kiosk peripherals, and ambient gallery automation.

### 4.1 Peripheral Matrix (10 Capabilities)
| Capability ID | Peripheral Description | Protocol / Driver | Supported Modes |
| :--- | :--- | :--- | :--- |
| `CAP-01` | RFID / NFC Physical Artifact Scanner | UART / Serial / WebUSB | Kiosk Exhibit Activation |
| `CAP-02` | High-Resolution Thermal Receipt Printer | ESC/POS via USB/Raw | Archival Citation Printout |
| `CAP-03` | Ambient Gallery Lighting Controller | DMX512 / ArtNet / HTTP | Era-Specific Mood Lighting |
| `CAP-04` | Directional Museum Audio Zone | ALSA / CoreAudio / WebAudio| Focused Audio Exhibits |
| `CAP-05` | Overhead Hand Gesture Sensor | I2C / Serial / Leap Motion | Touchless Document Paging |
| `CAP-06` | Tactile Rotary Timeline Dial | GPIO / USB HID Encoder | Chronological Scrubbing |
| `CAP-07` | Dual-Screen Exhibit Sync | Multi-Display WebSocket | Synchronized Facsimile View|
| `CAP-08` | Digital Asset Camera / Book Scanner | V4L2 / DirectShow / RTSP | On-Demand Document Digit. |
| `CAP-09` | Physical Emergency Lockdown Button | GPIO Interrupt / Virtual | Instant Kiosk Session Reset|
| `CAP-10` | ESP32 Sensor Telemetry Node | MQTT / REST / WiFi Serial | Temperature/Humidity Audit |

### 4.2 Hardware Execution Profiles
1. `DEVELOPMENT`: Full simulated peripheral bus running in software memory for headless testing and development.
2. `TABLET_DEMO`: Touchscreen, WebAudio, and Web Speech API enabled for SIH jury evaluations on portable tablets.
3. `KIOSK`: Locked touch interface with USB thermal printer, RFID scanner, and hardware watchdog enabled.
4. `INSTITUTIONAL`: Full gallery deployment including DMX512 lighting, directional audio zones, and dual-display synchronizers.

---

## 5. Security & Work-Group Data Protection Invariants

1. **Read-Only Facsimile Protection:** Original high-resolution archival TIFFs, JPEGs, and master PDFs are marked read-only at the filesystem level and served exclusively through authenticated streaming endpoints. Write or delete operations on raw facsimiles are prohibited by the API contract.
2. **Work-Group Anti-Leakage:** Cross-tenant segregation isolates administrative draft annotations, curator review logs, and unreleased scans from public kiosk endpoints.
3. **Strict Input Sanitization:** All search terms and chat inputs pass through regex-based traversal filters blocking path traversal (`../`, `..\\`), null-byte termination (`\x00`), and SQL/Script injection vectors before reaching the query planner.
4. **Credential Isolation:** Database credentials and API keys are stored in server-side environment variables and are never bundled into client-side JavaScript builds.
