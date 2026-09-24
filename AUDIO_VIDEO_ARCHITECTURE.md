# AUDIO & VIDEO ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System — Phase 9

---

### 1. Architectural Principles & Segregation

The Audio and Video subsystem distinguishes strictly between **authentic historical recordings** and **derivative AI syntheses**:

```
                       AUDIO / VIDEO ASSETS
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     ORIGINAL_RECORDING        │             │        AI_NARRATION           │
│  - 1931 BBC Round Table Conf  │             │  - Edge-TTS / IndicF5 neural  │
│  - 1949 Constituent Assembly  │             │  - Dynamic reading of pages   │
│  - 1950 AIR Republic Address  │             │  - Hindi (Swara), Marathi     │
│  - 1956 Nagpur Deekshabhoomi  │             │    (Aarohi), English (Neerja) │
│  - Read-only archival master  │             │  - Cached in tts_cache        │
└──────────────┬────────────────┘             └───────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│             ASR & TIMESTAMPTED TRANSCRIPTION           │
│  - Groq Whisper Large v3 / IndicConformer              │
│  - Timestamped segments [start_time, end_time]         │
│  - Verified Speaker attribution: Dr. B.R. Ambedkar     │
│  - Unknown Speaker attribution: Speaker 1, Speaker 2   │
└──────────────┬─────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│           SPOKEN TRANSCRIPT SEARCH INDEX               │
│  - Direct Seek-to-Timestamp URL generation             │
│  - /media?track=track-bbc-1931&t=5.0                   │
└────────────────────────────────────────────────────────┘
```

---

### 2. Audio & Video Ingestion and Processing Pipeline

For every archival audio or video master:
1. **Metadata Extraction**: Media format, duration in seconds, codec, sample rate, channels, bit rate, and language.
2. **Audio Stream Extraction**: For video assets, audio streams are extracted via FFmpeg (`ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 output.wav`).
3. **ASR & Word/Segment Alignment**: Audio is transcribed with exact second-level boundaries (`start_time`, `end_time`).
4. **Speaker Tagging**:
   - If historical metadata confirms speaker: Verified canonical identity (e.g. `Dr. B.R. Ambedkar`).
   - If speaker is unverified: Assigned systematic identifiers (`Speaker 1`, `Speaker 2`). No fictional attribution is permitted.
5. **Segment Archival Store (`transcript_segments`)**:
   ```sql
   CREATE TABLE IF NOT EXISTS transcript_segments (
       id TEXT PRIMARY KEY,
       media_id TEXT NOT NULL,
       start_time REAL NOT NULL,
       end_time REAL NOT NULL,
       text TEXT NOT NULL,
       language TEXT NOT NULL,
       speaker_id TEXT,
       speaker_name TEXT NOT NULL,
       confidence REAL DEFAULT 1.0,
       source TEXT NOT NULL,
       created_at TEXT NOT NULL
   );
   CREATE INDEX IF NOT EXISTS idx_segments_media ON transcript_segments(media_id, start_time);
   ```

---

### 3. Seek-to-Timestamp Spoken Search

Visitors can search spoken transcripts across audio and video collections via `/api/v1/media/search?q=...`.
- Matches return:
  - `media_title`: Title of the speech or documentary.
  - `timestamp_str`: Formatted timestamp (e.g. `00:05`, `12:43`).
  - `timestamp_seconds`: Float seconds for browser seeking.
  - `speaker_name`: `Dr. B.R. Ambedkar`.
  - `matching_text`: Verbatim spoken passage.
  - `seek_url`: Direct deep link (e.g. `/media?track=track-bbc-1931&t=5.0`).
- Clicking seeks `<audio>` or `<video>` player immediately to that exact second.

---

### 4. Neural Narration Pipeline (`TTSService`)

To provide screen-reader accessibility for visually impaired visitors:
1. Approved archival chunk text (or approved derivative translation) is passed to `TTSService`.
2. Voice models:
   - Hindi (`hi`): `hi-IN-SwaraNeural`
   - Marathi (`mr`): `mr-IN-AarohiNeural`
   - English (`en`): `en-IN-NeerjaNeural`
3. Output audio is saved as standard MP3 in `storage/local/audio/narration/` and indexed in `tts_cache`:
   ```sql
   CREATE TABLE IF NOT EXISTS tts_cache (
       id TEXT PRIMARY KEY,
       source_text_hash TEXT NOT NULL,
       language TEXT NOT NULL,
       model_name TEXT NOT NULL,
       voice_id TEXT NOT NULL,
       audio_path TEXT NOT NULL,
       duration_seconds REAL,
       generation_type TEXT NOT NULL, -- 'AI_NARRATION'
       created_at TEXT NOT NULL
   );
   ```
4. Streamed via `/api/v1/indic/tts/audio/{filename}`.
