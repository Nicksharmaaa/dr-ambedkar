# SYSTEM LIMITATIONS & KNOWN BOUNDARIES
## Digital Heritage Archive for Memorials, Manuscripts & Ambedkar
**SIH Problem Statement 26096: AI-Powered Institutional Archive and Audio-Visual Knowledge Platform**  
**Final Validation Phase — Academic Honesty & Technical Disclosure**  
**Date:** September 2026 | **Classification:** PUBLIC DISCLOSURE

---

## 1. Purpose & Guiding Principles

Academic integrity and engineering rigor require an explicit, unvarnished disclosure of system boundaries, operating limitations, and edge-case behaviors. The Ambedkar Digital Heritage Archive prioritizes historical accuracy and provenance integrity over false impressions of omniscient capability.

---

## 2. Optical Character Recognition (OCR) Boundaries

### 2.1 Vintage Gujarati & Marathi Letterpress (1920–1935)
- **Observed Behavior:** While modern English and Devanagari achieve low Character Error Rates (1.82% and 2.45% respectively), historical scans of 1920s Gujarati periodicals exhibit an elevated Word Error Rate of approximately 9.88%.
- **Root Cause:** Early 20th-century vernacular periodicals were printed using manual lead type on acidic wood-pulp newsprint. Physical ink bleed, broken conjunct ligatures, uneven impression pressure, and micro-tears degrade automated line segmentation.
- **System Safeguard:** Ingestion pipelines flag text blocks where OCR confidence is below 75% as `REQUIRES_CURATOR_REVIEW`. Raw facsimiles are preserved alongside OCR transcripts so scholars can inspect the original typography directly.

### 2.2 Handwriting and Marginalia
- **Observed Behavior:** Handwritten annotations, marginal scribbles, and fountain-pen signatures on archival manuscripts are captured as high-resolution visual bounding boxes but are not transcribed by automated OCR engines.
- **System Safeguard:** Marginalia bounding boxes are tagged as `IMAGE_ANCILLARY` rather than ingested into full-text retrieval, preventing unverified phonetic approximations from contaminating semantic search.

---

## 3. Neural Model & AI Generation Boundaries

### 3.1 Strict Abstention Policy Over Creative Extrapolation
- **Observed Behavior:** The AI Research Assistant will explicitly refuse to answer speculative, counterfactual, or subjective queries that cannot be directly substantiated by primary documents in the archive (e.g., *"What would Ambedkar think of modern social media algorithms?"*).
- **Justification:** Archival platforms cannot afford to generate persuasive fiction. Abstention is an intentional, protective design feature ensuring the archive remains an authoritative scholarly reference.

### 3.2 Cloud API Rate Limits & Upstream Latency
- **Observed Behavior:** Under prolonged high-concurrency bursts, third-party inference endpoints (e.g. Groq LPU free-tier) may issue HTTP 429 Too Many Requests.
- **System Safeguard:**
  - Client timeout increased to 35.0 seconds.
  - Automatic 1.5-second exponential backoff retry logic.
  - Automated fallback cascade to Google Gemini 2.5 Flash.
  - In extreme network starvation, the system gracefully falls back to structured chunk summaries without conversational embellishment.

---

## 4. Hardware Abstraction Layer (HAL): Physical vs. Simulated Boundary

### 4.1 Deployment Environments & Sensor Emulation
- **Physical Hardware:** The platform includes native drivers for ESP32 microcontroller telemetry (via HTTP/Serial), ESC/POS USB thermal printers, and USB RFID/NFC readers.
- **Simulated Hardware Fallback:** When physical sensors or DMX512 lighting consoles are physically absent (e.g. during software evaluation or portable tablet demonstrations), the HAL transparently engages in-memory software drivers (`DEVELOPMENT` and `TABLET_DEMO` profiles). Evaluators must note that ambient gallery illumination in the demo environment reflects simulated control signals unless connected to physical DMX512 controllers.

---

## 5. Offline Operation & Storage Footprint

### 5.1 Offline Mode Operational Envelope
- **Available Offline:** Browsing static exhibition routes, high-contrast kiosk touch displays, pre-cached catalog metadata, and chronological timeline milestones.
- **Unavailable Offline:** Dynamic neural conversational generation (RAG Assistant) and on-the-fly deep cross-lingual query translation, which require cloud LLM inference or active GPU endpoints. The assistant explicitly displays an offline notice rather than hallucinating local responses.

### 5.2 Vector Cache RAM Footprint
- **Observed Behavior:** The pre-computed dense vector cache (`vector_cache.npz`) containing 12,154 chunk embeddings occupies approximately 47.5 MB on disk and expands to approximately 65 MB of RAM upon uncompressed NumPy matrix load.
- **Operational Requirement:** Host evaluation machines should allocate at least 512 MB of free RAM to the Python ASGI process for matrix dot-product operations.
