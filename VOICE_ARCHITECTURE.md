# VOICE ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System — Phase 9

---

### 1. Architectural Overview & Workflow

The Voice Search subsystem enables visitors to query the Dr. B.R. Ambedkar archival repository by speaking in English, Hindi, or Marathi. It is architected with strict uncertainty handling, query correction, and decoupled ASR providers.

```
       [ 🎤 Ask the Archive ] Button
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│                   CLIENT CAPTURE                       │
│  - MediaRecorder Web Audio API                         │
│  - 48 kHz / 16-bit Mono WAV format                     │
│  - Visual Pulse Animation & Auto-Stop (10s max)        │
└──────────────────────────┬─────────────────────────────┘
                           │ Multipart Audio Upload
                           ▼
┌────────────────────────────────────────────────────────┐
│              FASTAPI /api/v1/voice/transcribe          │
│  - Input validation: Empty recording check             │
│  - Content-Type verification (audio/wav, audio/webm)   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                    ASRProvider                         │
│  - Abstraction interface: Groq Whisper Large v3 Turbo  │
│  - Segment & Word-level timestamp output               │
│  - Automatic Language Detection                        │
│  - Compatibility fallback: IndicConformer (ASR)        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           UNCERTAINTY & EDITABLE QUERY UX              │
│  - Displays transcribed query in editable text field   │
│  - Displays detected language badge (EN / HI / MR)     │
│  - Allows visitor to correct OCR/phonetic ambiguities  │
└──────────────────────────┬─────────────────────────────┘
                           │ Confirmed by Visitor [Search Archive]
                           ▼
┌────────────────────────────────────────────────────────┐
│               HYBRID CROSS-LINGUAL SEARCH              │
│  - Reciprocal Rank Fusion (FTS5 + Qwen3 Vector)        │
│  - English archival source document retrieval          │
└────────────────────────────────────────────────────────┘
```

---

### 2. ASRProvider Abstraction

The speech recognition engine is decoupled through the `ASRProvider` class located in `backend/app/services/media/asr_service.py`:

```python
class ASRProvider:
    """ASR Abstraction managing Whisper Large v3 and IndicConformer."""

    def __init__(self, model_name: str = "whisper-large-v3-turbo") -> None:
        self.model_name = model_name

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        language: str | None = None,
    ) -> dict[str, Any]:
        ...
```

#### Error Boundaries & Failure Handling
1. **Silence / Empty Recording**: If client submits 0 bytes or audio containing only silence below the noise floor, returns HTTP 400 with `Empty audio recording submitted`.
2. **Background Noise**: Whisper Large v3 Turbo's deep transformer architecture filters stationary acoustic noise.
3. **Low ASR Confidence**: If confidence is low or words are garbled, the UI presents the text in an editable textarea with a warning prompt, enabling instant correction before running search.
4. **Hardware Failure**: If external Groq ASR times out, gracefully returns a structured error allowing keyboard-based search entry without crashing the application.

---

### 3. Voice Search User Experience (`VoiceSearchModal.tsx`)

The UI follows the specified interaction contract:
1. Visitor activates `[ 🎤 Ask the Archive ]`.
2. Modal opens with status: `Listening... (3s) Speak now` with pulsating audio waves.
3. On completion (or clicking Stop), displays status: `Transcribing Indic speech with Whisper...`.
4. Shows recognized text with editable controls:
   - Example Visitor Speech: `"मुझे संविधान सभा की बहस दिखाइए"`
   - Display:
     ```
     [Language: HI]
     ┌────────────────────────────────────────────────────────┐
     │ मुझे संविधान सभा की बहस दिखाइए                          │
     └────────────────────────────────────────────────────────┘
     You can correct or refine the transcript before searching.
     [Cancel]                                 [Search Archive]
     ```
5. Visitor can edit the recognized query or click `[Search Archive]` to immediately retrieve source documents.
