# VERCEL FRONTEND ↔ CLOUDFLARE TUNNEL ↔ AI ASSISTANT ↔ VOICE ASR
# ROOT CAUSE FORENSIC REPORT

================================================================================
REPORT 1: ASSISTANT API FAILURE
================================================================================

### ERROR
`POST https://appearance-base-society-mark.trycloudflare.com/api/v1/assistant/ask`
Browser error: `TypeError: Failed to fetch` or HTTP 404.

### ROOT CAUSE
Tri-part failure across DNS, Environment Configuration, and CORS:
1. **Terminated Ephemeral Tunnel (Primary):** The Cloudflare Quick Tunnel process (`cloudflared`) on the local laptop was stopped. Because `trycloudflare.com` tunnels are account-less and ephemeral, terminating the process immediately destroys the DNS record (`getaddrinfo` failed with `[Errno 11001]`).
2. **Malformed URL in Vercel Environment (Secondary):** In the Vercel project dashboard, `NEXT_PUBLIC_API_URL` was entered with an accidental trailing space (`https://appearance-base-society-mark.trycloudflare.com `) and without `/api/v1`. The client constructed the URL as `...trycloudflare.com%20/assistant/ask`, which triggered a malformed URL / 404 Not Found error.
3. **CORS Rejection on Vercel Origin (Tertiary):** In `backend/.env`, `CORS_ORIGINS=["http://localhost:3000"]` strictly allowed localhost. Because `allow_credentials=True` was set in FastAPI, browsers issuing cross-origin requests from `https://*.vercel.app` received no `Access-Control-Allow-Origin` header and blocked the request at the preflight stage.

### EVIDENCE
- DNS Lookup test on old tunnel:
  ```python
  urllib.request.urlopen('https://appearance-base-society-mark.trycloudflare.com/api/v1/health')
  # Output: urllib.error.URLError: <urlopen error [Errno 11001] getaddrinfo failed>
  ```
- Process check:
  `Get-Process -Name "*cloudflared*"` returned empty.
- Git log inspection of commit `efaab12` showed un-sanitized `const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";`.
- Inspection of `backend/.env` line 56: `CORS_ORIGINS=["http://localhost:3000"]`.

### AFFECTED COMPONENTS
- Cloudflare Tunnel daemon (`cloudflared.exe`)
- `frontend/lib/api.ts` (`getApiBase()`)
- `backend/app/main.py` (`CORSMiddleware`)
- `backend/app/core/config.py` (`cors_origin_regex`)

### FIX
1. Added `getApiBase()` in `frontend/lib/api.ts` to automatically `.trim()`, strip whitespace/quotes/trailing slashes, and guarantee the `/api/v1` prefix.
2. Updated `backend/app/core/config.py` to introduce `cors_origin_regex: str | None = r"^https://.*\.vercel\.app$"`.
3. Updated `backend/app/main.py` to pass `allow_origin_regex=settings.cors_origin_regex` to `CORSMiddleware`.
4. Relaunched `cloudflared.exe` with a healthy tunnel connection (`https://tear-venture-suppliers-many.trycloudflare.com`).

### TEST
- Tested `OPTIONS /api/v1/assistant/ask` over public tunnel with `Origin: https://dr-ambedkar.vercel.app`:
  Returned `HTTP 200 OK` with `Access-Control-Allow-Origin: https://dr-ambedkar.vercel.app` and `Access-Control-Allow-Credentials: true`.
- Tested `POST /api/v1/assistant/ask` over public tunnel with question "What did Dr. Ambedkar write about social endosmosis and fraternity?":
  Returned `HTTP 200 OK` in 2.34 seconds with full answer, model `qwen/qwen3.8-27b`, and 5 citations.

### RESULT
**VERIFIED**

---

================================================================================
REPORT 2: BROWSER SPEECH RECOGNITION FAILURE
================================================================================

### ERROR
Browser console output:
`Speech recognition event: network`

### ROOT CAUSE
Chromium (Google Chrome / Microsoft Edge) implements the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) by streaming recorded audio to Google's proprietary cloud servers (`https://www.google.com/speech-api/v2/recognize`). When client machines operate on networks that throttle, block, or misroute requests to Google's speech API (common on university campuses, institutional Wi-Fi, certain Indian ISP configurations, corporate VPNs, or browsers with strict tracking prevention), the Web Speech engine aborts and raises the `network` event error.

### EVIDENCE
- Browser console stack trace: `recognition.onerror @ 2568-789f84e2904fac5e.js:1` with `event.error === 'network'`.
- This is a well-documented browser architectural characteristic: the Web Speech API is not offline-capable in desktop Chrome and relies unconditionally on connectivity to Google's speech servers.

### AFFECTED COMPONENTS
- `frontend/utils/speechUtils.ts` (`VoiceRecognitionController`)
- `frontend/lib/utils/speechUtils.ts` (`VoiceRecognitionController`)

### FIX
1. Preserved primary browser SpeechRecognition for environments where Google Speech is unblocked.
2. Added proactive detection in `recognition.onerror`: when `event.error === 'network'`, the controller automatically halts the browser speech instance and switches to `startMediaRecorderFallback(options)`.
3. Added status updates via `onStatusChange`:
   - "Listening..." while recording
   - "Using server transcription..." when switching to Whisper fallback
   - "Transcribing..." when audio processing begins
4. Replaced raw error disclosures with clean user guidance: "Voice transcription is currently unavailable. Please try again or type your question."

### TEST
- Simulated browser network error trigger in test harness: verified automatic switchover to `startMediaRecorderFallback` without user intervention or page disruption.

### RESULT
**VERIFIED**

---

================================================================================
REPORT 3: WHISPER FALLBACK FAILURE
================================================================================

### ERROR
`Backend voice transcription fallback error: TypeError: Failed to fetch` inside `transcribeVoice(...)`.

### ROOT CAUSE
Dual failure in endpoint reachability and audio MIME mismatch:
1. **Network Ingress Failure:** The fetch was targeting the stale, dead Cloudflare Quick Tunnel URL (`appearance-base-society-mark.trycloudflare.com`) and was subject to CORS preflight failure from the Vercel domain.
2. **MIME/Container Incompatibility:** Desktop Chrome's `MediaRecorder` captures audio in `audio/webm;codecs=opus`. The fallback hardcoded `{ type: 'audio/wav' }` on WebM byte chunks and sent them with a `.wav` filename. When received by the backend, if MIME headers and magic bytes disagreed, Groq Whisper ASR threw a decoding error.

### EVIDENCE
- In `frontend/utils/speechUtils.ts`:
  `const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });`
  Chrome's `MediaRecorder.mimeType` is actually `audio/webm;codecs=opus`.
- Live test to `/api/v1/voice/transcribe` showed that when `fetch()` failed at the network boundary, the browser surfaced `TypeError: Failed to fetch`.

### AFFECTED COMPONENTS
- `frontend/utils/speechUtils.ts`
- `frontend/lib/utils/speechUtils.ts`
- `frontend/lib/api.ts` (`transcribeVoice`)
- `backend/app/services/media/asr_service.py` (`ASRProvider`)

### FIX
1. In `frontend/utils/speechUtils.ts`, inspect `MediaRecorder.isTypeSupported` and record with `audio/webm` where available. Package the blob with `this.mediaRecorder.mimeType`.
2. In `frontend/lib/api.ts`, inspect `audioBlob.type` and dynamically name the form-data file with `.webm`, `.ogg`, or `.wav`.
3. In `backend/app/services/media/asr_service.py`, inspect the magic bytes of incoming audio (`\x1a\x45\xdf\xa3` for WebM, `OggS` for Ogg, `RIFF` for WAV) and forward the exact MIME type to the Groq Whisper API.
4. Resolved tunnel reachability and CORS so the fetch call connects cleanly.

### TEST
- Tested `POST https://tear-venture-suppliers-many.trycloudflare.com/api/v1/voice/transcribe` with multipart audio over the public tunnel.
  Returned `HTTP 200 OK` in 1.78 seconds with recognized text, word segments, and language detection.

### RESULT
**VERIFIED**

---

================================================================================
REPORT 4: POSTGRESQL FTS LEXICAL SEARCH FAILURE
================================================================================

### ERROR
`psycopg.errors.WrongObjectType: WITHIN GROUP is required for ordered-set aggregate rank`
`LINE 4: fts.rank AS fts_rank`

### ROOT CAUSE
In `backend/app/db/repositories/chunks.py`, `fts_search` was hardcoded with SQLite FTS5 syntax (`WHERE fts_chunks MATCH ? ORDER BY fts.rank`). When the repository was migrated to PostgreSQL, `_adapt_sqlite_sql_to_postgres` replaced `fts_chunks MATCH ?` with `tsv @@ plainto_tsquery('english', %s)` but left `fts.rank AS fts_rank` and `ORDER BY fts.rank`. In PostgreSQL, `rank` is an ordered-set aggregate function, not a column name. Every FTS search silently failed and returned `[]`, leaving only vector search for candidate retrieval. This caused queries with specific historical keywords (e.g. "social endosmosis") to miss exact document matches, triggering RAG abstention under the zero-hallucination policy.

### EVIDENCE
- Direct query test in Python:
  `SELECT fts.rank AS fts_rank FROM fts_chunks fts` raised `psycopg.errors.WrongObjectType`.
- `fts_search` returned 0 hits for all queries.

### AFFECTED COMPONENTS
- `backend/app/db/repositories/chunks.py` (`ChunkRepository.fts_search`)

### FIX
Updated `fts_search` to detect PostgreSQL (`hasattr(self.db, "_pool") or PostgresClient`) and execute native PostgreSQL full-text search:
```sql
SELECT dc.id, dc.object_id, dc.text, dc.language,
       dc.page_number, dc.volume_number, dc.section_title,
       ts_rank(fts.tsv, plainto_tsquery('english', %s)) AS fts_rank
FROM fts_chunks fts
JOIN document_chunks dc ON dc.id = fts.chunk_id
WHERE fts.tsv @@ plainto_tsquery('english', %s)
ORDER BY fts_rank DESC
LIMIT %s
```

### TEST
- Ran hybrid search on "social endosmosis":
  Retrieved 10 FTS hits, 50 vector hits. Page 1 from Volume 1 was retrieved as top candidate.
- Tested assistant response on "social endosmosis":
  Returned scholarly answer with 5 grounded citations.

### RESULT
**VERIFIED**
