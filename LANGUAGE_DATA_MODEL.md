# LANGUAGE DATA MODEL
## Ambedkar Heritage Intelligence & Digital Preservation System — Phase 9

---

### 1. Linguistic Entity Classifications & Schemas

The system defines formal relational models in Turso Cloud (`backend/app/db/migrations/005_phase9_multilingual_multimodal.sql`) to govern all derivative multilingual representations, neural narrations, and audio/video transcripts.

#### Supported Languages
- Initial Tier:
  - `en`: English (Primary archival source language for BAWS Volumes 1–19)
  - `hi`: Hindi (मानक हिंदी, Devanagari script)
  - `mr`: Marathi (मराठी, Devanagari script — maternal and historical language of Dr. Ambedkar's periodicals)
- Extensibility: ISO 639-1 / 639-2 codes ready for all 22 official Indic languages (`ta`, `te`, `bn`, `gu`, `kn`, `ml`, `pa`, `or`, `as`, `ur`, etc.).

---

### 2. Table Specifications

#### A. `translations_cache`
Stores all approved derivative translations with SHA-256 fixity caching.
| Field | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | UUIDv4 |
| `chunk_id` | `TEXT` | FK to `document_chunks(id)` (nullable for ad-hoc queries) |
| `source_text_hash` | `TEXT NOT NULL` | SHA-256 hash of normalized source text |
| `source_language` | `TEXT NOT NULL` | e.g. `en`, `mr`, `hi` |
| `target_language` | `TEXT NOT NULL` | e.g. `hi`, `mr`, `en` |
| `translated_text` | `TEXT NOT NULL` | Derivative translation text |
| `translation_model`| `TEXT NOT NULL` | e.g. `qwen/qwen3.8-27b` / `indictrans2` |
| `translation_version`| `TEXT NOT NULL` | e.g. `1.0` |
| `review_status` | `TEXT DEFAULT 'APPROVED'` | `APPROVED`, `PENDING_REVIEW`, `REVISED` |
| `created_at` | `TEXT NOT NULL` | ISO 8601 UTC timestamp |

#### B. `tts_cache`
Stores neural audio narration files and guarantees distinction from original recordings.
| Field | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | UUIDv4 |
| `source_text_hash` | `TEXT NOT NULL` | SHA-256 hash of text spoken |
| `language` | `TEXT NOT NULL` | `en`, `hi`, `mr` |
| `model_name` | `TEXT NOT NULL` | e.g. `edge-tts` / `indicf5` |
| `voice_id` | `TEXT NOT NULL` | Voice identifier (e.g. `mr-IN-AarohiNeural`) |
| `audio_path` | `TEXT NOT NULL` | Relative file path in storage repository |
| `duration_seconds` | `REAL` | Audio playback duration in seconds |
| `generation_type` | `TEXT NOT NULL` | Strictly `AI_NARRATION` |
| `created_at` | `TEXT NOT NULL` | ISO 8601 UTC timestamp |

#### C. `transcript_segments`
Stores word and segment-level time-aligned transcripts for archival audio/video tracks.
| Field | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Segment identifier |
| `media_id` | `TEXT NOT NULL` | Identifier of parent audio or video asset |
| `start_time` | `REAL NOT NULL` | Segment start in seconds (e.g. `5.0`) |
| `end_time` | `REAL NOT NULL` | Segment end in seconds (e.g. `12.5`) |
| `text` | `TEXT NOT NULL` | Spoken verbatim text |
| `language` | `TEXT NOT NULL` | Language code of speech |
| `speaker_id` | `TEXT` | Canonical speaker identifier |
| `speaker_name` | `TEXT NOT NULL` | `Dr. B.R. Ambedkar` or `Speaker 1` |
| `confidence` | `REAL DEFAULT 1.0` | ASR confidence score |
| `source` | `TEXT NOT NULL` | Provenance source (e.g. `BBC Sound Archive`) |
| `created_at` | `TEXT NOT NULL` | Creation timestamp |

#### D. `entity_localizations`
Stores localized Devanagari display names for knowledge graph nodes without duplicating canonical entities.
| Field | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Localization identifier |
| `entity_id` | `TEXT NOT NULL` | FK to `entities(id)` (e.g. `event-mahad`) |
| `language` | `TEXT NOT NULL` | `hi`, `mr` |
| `localized_name` | `TEXT NOT NULL` | e.g. `महाड़ सत्याग्रह`, `महाड चवदार तळे सत्याग्रह` |
| `localized_description`| `TEXT` | Localized scholarly summary |
| `created_at` | `TEXT NOT NULL` | Creation timestamp |

#### E. `timeline_localizations`
Stores localized titles and narratives for historical timeline events.
| Field | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Localization identifier |
| `event_id` | `TEXT NOT NULL` | FK to `timeline_events(id)` |
| `language` | `TEXT NOT NULL` | `hi`, `mr` |
| `localized_title` | `TEXT NOT NULL` | Localized Devanagari event title |
| `localized_description`| `TEXT` | Localized historical context |
| `created_at` | `TEXT NOT NULL` | Creation timestamp |
