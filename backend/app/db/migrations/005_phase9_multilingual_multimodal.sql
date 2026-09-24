-- ============================================================
-- Migration 005: Phase 9 Multilingual & Multimodal Accessibility
-- ============================================================

-- ── 1. Translation Cache & Provenance ──────────────────────────
CREATE TABLE IF NOT EXISTS translations_cache (
    id                  TEXT PRIMARY KEY,
    chunk_id            TEXT REFERENCES document_chunks(id),
    source_text_hash    TEXT NOT NULL,
    source_language     TEXT NOT NULL,
    target_language     TEXT NOT NULL,
    translated_text     TEXT NOT NULL,
    translation_model   TEXT NOT NULL,
    translation_version TEXT NOT NULL,
    review_status       TEXT DEFAULT 'APPROVED',
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_trans_hash_lang ON translations_cache(source_text_hash, target_language);
CREATE INDEX IF NOT EXISTS idx_trans_chunk ON translations_cache(chunk_id);

-- ── 2. TTS Narration Cache ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS tts_cache (
    id               TEXT PRIMARY KEY,
    source_text_hash TEXT NOT NULL,
    source_text      TEXT NOT NULL,
    language         TEXT NOT NULL,
    model            TEXT NOT NULL,
    audio_path       TEXT NOT NULL,
    generation_type  TEXT NOT NULL DEFAULT 'AI_NARRATION',
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tts_hash_lang ON tts_cache(source_text_hash, language);
CREATE INDEX IF NOT EXISTS idx_tts_type ON tts_cache(generation_type);

-- ── 3. Timestamped Transcript Segments ─────────────────────────
CREATE TABLE IF NOT EXISTS transcript_segments (
    id             TEXT PRIMARY KEY,
    media_asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    segment_index  INTEGER NOT NULL,
    start_time     REAL NOT NULL,
    end_time       REAL NOT NULL,
    text           TEXT NOT NULL,
    language       TEXT NOT NULL DEFAULT 'en',
    speaker_id     TEXT,
    speaker_name   TEXT,
    confidence     REAL DEFAULT 1.0,
    source         TEXT DEFAULT 'archival_recording',
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tseg_media ON transcript_segments(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_tseg_time ON transcript_segments(media_asset_id, start_time);

-- ── 4. Multimodal Page Analysis & OCR Conflict Auditing ────────
CREATE TABLE IF NOT EXISTS multimodal_page_analyses (
    id                TEXT PRIMARY KEY,
    object_id         TEXT NOT NULL REFERENCES archival_objects(id),
    page_number       INTEGER NOT NULL,
    model_name        TEXT NOT NULL,
    visual_summary    TEXT NOT NULL,
    visual_ocr_text   TEXT,
    conflict_detected INTEGER NOT NULL DEFAULT 0,
    conflict_details  TEXT,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mpage_lookup ON multimodal_page_analyses(object_id, page_number);

-- ── 5. Entity Localizations (Multilingual Knowledge Graph) ─────
CREATE TABLE IF NOT EXISTS entity_localizations (
    id                    TEXT PRIMARY KEY,
    entity_id             TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    language              TEXT NOT NULL,
    localized_name        TEXT NOT NULL,
    localized_description TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ent_loc ON entity_localizations(entity_id, language);

-- ── 6. Timeline Localizations (Multilingual Timeline) ──────────
CREATE TABLE IF NOT EXISTS timeline_localizations (
    id                    TEXT PRIMARY KEY,
    event_id              TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
    language              TEXT NOT NULL,
    localized_title       TEXT NOT NULL,
    localized_description TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_time_loc ON timeline_localizations(event_id, language);
