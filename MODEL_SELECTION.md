# MODEL SELECTION
## Ambedkar Heritage Intelligence & Digital Preservation System

**Version**: 1.0.0
**Date**: 2026-09-22
**Hardware**: NVIDIA RTX 4050 Laptop GPU · 6 GB VRAM · CUDA 12.8 · PyTorch 2.11

---

## 1. Hardware Constraints

| Resource | Available | Notes |
|---|---|---|
| VRAM | 6,141 MiB total; ~4,500 MiB free | Desktop apps consume ~1.5 GB |
| RAM | 16.9 GB total; ~4.2 GB available | Shared with all services |
| CUDA | 12.8 (verified) | PyTorch 2.11+cu128 operational |
| Compute Capability | 8.9 (Ada Lovelace) | Flash Attention 2 supported |
| CPU | i5-13450HX 16-core | CPU fallback viable |

**VRAM Budget Rule**: Embedding (0.8 GB) + Reranker (0.8 GB) + VL (2.0 GB) + OCR (0.5 GB) = **4.1 GB** — fits within 4.5 GB available.

---

## 2. Model Selection by Task

### 2.1 Text Embedding

| Model | Size | VRAM | Context | License | Decision |
|---|---|---|---|---|---|
| **Qwen3-Embedding-0.6B** | 0.6B | ~0.8 GB | 32K | Apache 2.0 | **SELECTED (local)** |
| Qwen3-Embedding-4B | 4B | ~8 GB | 32K | Apache 2.0 | Too large for local |
| Qwen3-Embedding-8B | 8B | ~16 GB | 32K | Apache 2.0 | Too large for local |
| text-embedding-3-small | API | API-only | 8K | OpenAI | API fallback option |

**Selected**: Qwen3-Embedding-0.6B
- Dimension: 1024 (configurable down to 32)
- MTEB multilingual leaderboard competitive
- Instruction-aware queries
- Apache 2.0 — no restrictions

### 2.2 Reranking

| Model | Size | VRAM | Context | Decision |
|---|---|---|---|---|
| **Qwen3-Reranker-0.6B** | 0.6B | ~0.8 GB | 32K | **SELECTED (local)** |
| Qwen3-Reranker-4B | 4B | ~4 GB INT4 | 32K | API fallback |
| Qwen3-Reranker-8B | 8B | ~8 GB | 32K | Cloud only |

**Selected**: Qwen3-Reranker-0.6B
- Cross-encoder scoring; instruction-aware
- 32K context covers full document chunks
- Adequate precision for document corpus reranking

### 2.3 Vision-Language (Document Understanding / "Ask This Page")

| Model | Size | VRAM (INT4) | Decision |
|---|---|---|---|
| **Qwen3-VL-2B** | 2B | ~2.0 GB | **SELECTED (local, INT4)** |
| Qwen3-VL-4B | 4B | ~4 GB | TIGHT — use as fallback if 2B insufficient |
| Qwen3-VL-8B | 8B | ~8 GB | Cloud API only |
| Qwen3-VL-32B | 32B | ~64 GB | Cloud API only |

**Selected**: Qwen3-VL-2B-Instruct-AWQ (INT4 quantized)
- Document OCR assistance, image understanding
- "Ask This Page" interactive document queries
- Requires: `transformers>=4.57.0`, `accelerate`

### 2.4 OCR & Document Intelligence

| Model/Tool | Task | Python Compat | Decision |
|---|---|---|---|
| **PaddleOCR PP-OCRv5** | Text recognition (5 types + handwriting) | 3.11–3.13 | **SELECTED** |
| **PP-StructureV3** | Layout analysis, table, formula | 3.11–3.13 | **SELECTED** |
| Tesseract 5 | Fallback OCR | Any | Fallback only |
| EasyOCR | Alternative | 3.10+ | Not needed |

**Selected**: PaddleOCR 3.x (PP-OCRv5 + PP-StructureV3)
- Requires Python 3.12 or 3.13 virtual environment (NOT 3.14)
- GPU-accelerated via PaddlePaddle-GPU
- Handles Devanagari script natively
- ALTO XML output supported

### 2.5 Translation

| Model | Languages | Compat | Decision |
|---|---|---|---|
| **IndicTrans2** | 22 Indic ↔ English | Python 3.10–3.13 | **SELECTED** |
| NLLB-200 | 200 languages | Python 3.10+ | Fallback |
| Google Translate API | Any | API | Cloud fallback |

**Selected**: IndicTrans2 (AI4Bharat)
- Purpose-built for Indian language pairs
- Highest quality for Hindi/Marathi ↔ English
- Requires Python 3.10 virtual environment
- VRAM: ~1.5 GB

### 2.6 Speech Recognition (ASR)

| Model | Languages | Compat | Decision |
|---|---|---|---|
| **IndicConformer** | 22 Indic languages | Python 3.10 (NeMo) | **SELECTED** |
| Whisper large-v3 | 100+ languages | Python 3.10+ | Fallback |

**Selected**: IndicConformer (AI4Bharat)
- NeMo-based; Python 3.10 venv required
- Best Indic speech recognition quality
- Fallback: Whisper if NeMo install fails

### 2.7 Text-to-Speech (TTS)

| Model | Languages | Compat | Decision |
|---|---|---|---|
| **IndicF5** | Indic languages | Python 3.10 | **SELECTED** |
| Coqui TTS | Multi | Python 3.10+ | Fallback |

**Selected**: IndicF5 (AI4Bharat)
- High-quality Indic TTS
- Requires Python 3.10 venv

---

## 3. Python Virtual Environments

```
venv-main    (Python 3.14)   FastAPI backend + Qwen3 embedding/reranker/VL
venv-ocr     (Python 3.12)   PaddleOCR + PP-StructureV3 + FastAPI microservice
venv-indic   (Python 3.10)   IndicTrans2 + IndicConformer + IndicF5 + FastAPI microservice
```

---

## 4. Deployment Profiles

### DEVELOPMENT (Current Machine)
```yaml
profile: DEVELOPMENT
embedding:
  model: Qwen/Qwen3-Embedding-0.6B
  device: cuda
  batch_size: 16
reranker:
  model: Qwen/Qwen3-Reranker-0.6B
  device: cuda
vl_model:
  model: Qwen/Qwen3-VL-2B-Instruct-AWQ
  device: cuda
  quantization: int4
ocr:
  engine: paddleocr_v5
  device: gpu
  venv: venv-ocr
translation:
  model: ai4bharat/indictrans2
  device: cuda
  venv: venv-indic
asr:
  model: ai4bharat/indicconformer
  device: cuda
  venv: venv-indic
tts:
  model: ai4bharat/indicf5
  device: cuda
  venv: venv-indic
api_fallback:
  enabled: true
  provider: openrouter
  model: qwen/qwen3-8b
  trigger_vram_threshold_gb: 1.0
```

### DEMO (Hackathon Presentation)
```yaml
profile: DEMO
# Same as DEVELOPMENT but with:
# - Embedding model pre-loaded at startup
# - Document corpus pre-indexed (no on-demand indexing)
# - API fallback always enabled for generation
# - Reduced batch sizes to minimize latency
# - Demo corpus pre-populated in Turso
```

### SERVER (Production Target)
```yaml
profile: SERVER
embedding:
  model: Qwen/Qwen3-Embedding-4B  # Upgrade when more VRAM available
  device: cuda
reranker:
  model: Qwen/Qwen3-Reranker-4B
  device: cuda
vl_model:
  model: Qwen/Qwen3-VL-8B
  device: cuda
  quantization: int8
ocr:
  engine: paddleocr_v5
  device: gpu
# Cloud managed Turso database
# R2 object storage
# Docker Compose orchestration
```

### EDGE / KIOSK
```yaml
profile: EDGE
# Offline-capable subset:
embedding:
  model: Qwen/Qwen3-Embedding-0.6B
  device: cpu  # No GPU guaranteed on kiosk
  quantization: int8
reranker:
  model: disabled  # Omit for latency
vl_model:
  model: disabled  # Too slow on CPU
ocr:
  engine: disabled  # Pre-indexed at setup
database:
  url: file:kiosk/ambedkar_kiosk.db  # Pre-populated SQLite
storage:
  backend: LOCAL
  root: kiosk/storage
```

---

## 5. Model Loading Strategy

### Model Manager (prevents OOM)

```python
class ModelManager:
    """
    Manages AI model lifecycle.
    - Keeps embedding model resident (most-used, smallest)
    - Loads other models on-demand
    - Evicts LRU model when VRAM < threshold
    - Maintains per-model VRAM accounting
    """
    ALWAYS_RESIDENT = ["embedding"]       # 0.8 GB
    ON_DEMAND = ["reranker", "vl", "ocr"] # Load/evict as needed
    VRAM_EVICT_THRESHOLD_GB = 1.0        # Evict if free VRAM < 1 GB
```

---

## 6. API Fallback Strategy

When local VRAM is insufficient or model fails to load:

| Task | Local Model | Cloud Fallback | Trigger |
|---|---|---|---|
| Embedding | Qwen3-Embedding-0.6B | Qwen3-Embedding-4B via OpenRouter | VRAM < 1 GB |
| Reranking | Qwen3-Reranker-0.6B | Qwen3-Reranker-4B via OpenRouter | VRAM < 1 GB |
| VL/Generation | Qwen3-VL-2B INT4 | Qwen3-VL-8B via Groq | VRAM < 2 GB |
| Complex reasoning | N/A | Qwen3-8B via Groq | Always API |
| Translation | IndicTrans2 | Google Translate API | venv load failure |
| ASR | IndicConformer | Whisper API | venv load failure |
| TTS | IndicF5 | Cloud TTS | venv load failure |

---

## 7. Models NOT Selected and Reasons

| Model | Reason Not Selected |
|---|---|
| GPT-4o | Not open-source; API-only; data privacy concern |
| Llama 3.3 70B | Too large for local (requires 40+ GB VRAM) |
| Gemini API | Not appropriate for offline/kiosk use |
| pgvector | Requires PostgreSQL (excluded by requirement) |
| Pinecone/Qdrant | External vector DB not needed yet; Turso sufficient |
| OpenSearch | Infrastructure complexity; FTS5 sufficient |
| NLLB-200 | IndicTrans2 superior for Indic languages |
| Whisper (primary) | IndicConformer superior for Indic ASR |
