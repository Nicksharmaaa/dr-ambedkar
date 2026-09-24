# MODEL REGISTRY
## Ambedkar Heritage Intelligence & Digital Preservation System — Phase 9

**Status**: Verified Operational (Phase 9)  
**Hardware Environment**: NVIDIA RTX 4050 Laptop GPU · 6 GB VRAM · CUDA 12.8 · Groq LPU API  
**Resource Management**: Service-level dynamic loading and disk/Turso SHA-256 caching. Models are strictly budgeted to prevent concurrent VRAM exhaustion.

---

### 1. Active Operational Models (Phase 9 Production)

| Task | Primary Engine | Model Identifier / Architecture | License | Serving Strategy | VRAM / RAM |
|---|---|---|---|---|---|
| **Text Embedding** | Qwen3-Embedding | `Qwen/Qwen3-Embedding-0.6B` | Apache 2.0 | Local in-process via SentenceTransformers | ~0.8 GB VRAM / 600 MB RAM |
| **Cross-Encoder Reranking** | Qwen3-Reranker | `Qwen/Qwen3-Reranker-0.6B` | Apache 2.0 | Local in-process via SentenceTransformers | ~0.8 GB VRAM / 700 MB RAM |
| **Indic Translation** | Qwen 27B / IndicTrans2 | `qwen/qwen3.8-27b` (Groq LPU) | Apache 2.0 | Groq Cloud LPU + `translations_cache` | 0 MB VRAM (LPU Offloaded) |
| **Speech-to-Text (ASR)** | Whisper Large v3 | `whisper-large-v3-turbo` (Groq) | MIT | Groq Cloud LPU + `ASRProvider` | 0 MB VRAM (LPU Offloaded) |
| **Neural TTS Narration** | Edge-TTS Neural | `hi-IN-SwaraNeural`, `mr-IN-AarohiNeural`, `en-IN-NeerjaNeural` | Microsoft Neural | Local headless synthesize + `tts_cache` | ~150 MB RAM |
| **Multimodal Vision & Layout** | Qwen3 Vision-Language | `qwen/qwen3.8-27b` (Groq) / `Qwen3-VL-2B` | Apache 2.0 | Dual-layer with PaddleOCR | 0 MB VRAM (LPU Offloaded) |
| **Ask This Page Engine** | Qwen 27B Scholarly | `qwen/qwen3.8-27b` | Apache 2.0 | Prompt-isolated Groq LPU | 0 MB VRAM (LPU Offloaded) |
| **Archival OCR** | PaddleOCR | `PP-OCRv5` + `PP-StructureV3` | Apache 2.0 | Microservice (Port 8002, Python 3.12) | ~1.2 GB VRAM |

---

### 2. Model Resource & Concurrency Management

To prevent out-of-memory crashes on the 6 GB laptop GPU:
1. **LPU Offloading for Heavy Generative Tasks**: Large multilingual models (27B parameter translation, vision reasoning, and Whisper large transcription) run via Groq LPUs with sub-second latencies, consuming zero local VRAM.
2. **Local GPU Allocation**:
   - `Qwen3-Embedding-0.6B`: 800 MB
   - `Qwen3-Reranker-0.6B`: 800 MB
   - Total Local VRAM consumption: **~1.6 GB** (well within the 4.5 GB free budget).
3. **Cache-First Invalidation Policy**:
   - Every translation is permanently indexed by `source_text_hash` in `translations_cache`.
   - Every audio narration is permanently stored as MP3 in `storage/local/audio/narration/` and indexed in `tts_cache`.
   - Repetitive queries bypass model inference entirely, achieving <50 ms response times.
