-- Auto-generated Exact PostgreSQL Schema from SQLite Inventory
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS archival_objects (
    id TEXT PRIMARY KEY,
    collection_id TEXT,
    stable_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    object_type TEXT NOT NULL DEFAULT 'book',
    language TEXT NOT NULL DEFAULT 'en',
    source_institution TEXT NOT NULL DEFAULT '',
    provenance TEXT NOT NULL DEFAULT '',
    rights_status TEXT NOT NULL DEFAULT 'unknown',
    creator TEXT,
    publisher TEXT,
    publication_date TEXT,
    description TEXT,
    subject_keywords TEXT,
    physical_description TEXT,
    review_status TEXT NOT NULL DEFAULT 'pending',
    publication_status TEXT NOT NULL DEFAULT 'draft',
    file_hash TEXT,
    file_size_bytes BIGINT,
    original_filename TEXT,
    original_file_key TEXT,
    page_count BIGINT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_key TEXT,
    display_order BIGINT NOT NULL DEFAULT 0,
    is_public BIGINT NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    definition TEXT,
    domain TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS digital_files (
    id TEXT PRIMARY KEY,
    archival_object_id TEXT,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    byte_size BIGINT,
    sha256_hash TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id TEXT PRIMARY KEY,
    object_id TEXT NOT NULL,
    page_id TEXT,
    section_id TEXT,
    chunk_index BIGINT NOT NULL,
    text TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    token_count BIGINT,
    char_count BIGINT,
    volume_number TEXT,
    page_number BIGINT,
    section_title TEXT,
    is_header BIGINT NOT NULL DEFAULT 0,
    is_footnote BIGINT NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_sections (
    id TEXT PRIMARY KEY,
    object_id TEXT NOT NULL,
    parent_id TEXT,
    section_num TEXT,
    title TEXT NOT NULL,
    start_page BIGINT,
    end_page BIGINT,
    depth BIGINT NOT NULL DEFAULT 0,
    display_order BIGINT NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    chunk_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    embedding_version TEXT NOT NULL DEFAULT 'v1',
    dimension BIGINT NOT NULL DEFAULT 1024,
    embedding_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    canonical_name TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL DEFAULT 'archival_corpus',
    status TEXT NOT NULL DEFAULT 'CANDIDATE',
    date TEXT,
    date_precision TEXT DEFAULT 'YEAR',
    language TEXT DEFAULT 'en',
    location TEXT,
    aliases TEXT,
    external_identifiers TEXT,
    rights TEXT DEFAULT 'public_domain',
    object_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_aliases (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    alias TEXT NOT NULL,
    alias_type TEXT DEFAULT 'variant',
    language TEXT DEFAULT 'en',
    confidence DOUBLE PRECISION DEFAULT 1.0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_localizations (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    language TEXT NOT NULL,
    localized_name TEXT NOT NULL,
    localized_description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_reviews (
    id TEXT PRIMARY KEY,
    entity_id TEXT,
    original_mention TEXT NOT NULL,
    suggested_entity_id TEXT,
    reviewer TEXT NOT NULL DEFAULT 'curator',
    action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    supporting_chunk_id TEXT,
    review_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eval_dataset_items (
    id TEXT PRIMARY KEY,
    dataset_type TEXT NOT NULL,
    query_text TEXT NOT NULL,
    query_language TEXT NOT NULL,
    positive_chunk_id TEXT,
    positive_doc_id TEXT,
    positive_language TEXT,
    negative_chunk_id TEXT,
    negative_doc_id TEXT,
    negative_type TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL,
    event_type TEXT,
    start_date TEXT,
    end_date TEXT,
    location_id TEXT,
    description TEXT,
    significance TEXT,
    wikidata_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    object_id TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_hash TEXT,
    width_px BIGINT,
    height_px BIGINT,
    duration_secs DOUBLE PRECISION,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fts_chunks (
    chunk_id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    object_id TEXT,
    tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', text)) STORED
);
CREATE INDEX IF NOT EXISTS idx_fts_chunks_tsv ON fts_chunks USING GIN(tsv);
CREATE INDEX IF NOT EXISTS idx_fts_chunks_obj ON fts_chunks(object_id);

CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY,
    object_id TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    title TEXT,
    storage_key TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    duration_secs DOUBLE PRECISION,
    transcript_text TEXT,
    transcript_language TEXT,
    iiif_manifest_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multilingual_works (
    id TEXT PRIMARY KEY,
    canonical_title TEXT NOT NULL,
    author TEXT DEFAULT 'Dr. B.R. Ambedkar',
    original_language TEXT DEFAULT 'en',
    description TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS multimodal_page_analyses (
    id TEXT PRIMARY KEY,
    object_id TEXT NOT NULL,
    page_number BIGINT NOT NULL,
    model_name TEXT NOT NULL,
    visual_summary TEXT NOT NULL,
    visual_ocr_text TEXT,
    conflict_detected BIGINT NOT NULL DEFAULT 0,
    conflict_details TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ocr_pages (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    page_number BIGINT NOT NULL,
    language TEXT NOT NULL,
    ocr_engine TEXT NOT NULL,
    confidence_avg DOUBLE PRECISION NOT NULL,
    raw_ocr_text TEXT,
    reviewed_ocr_text TEXT,
    review_status TEXT DEFAULT 'OCR_UNREVIEWED',
    reviewer TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL,
    aliases TEXT,
    org_type TEXT,
    founded_date TEXT,
    dissolved_date TEXT,
    description TEXT,
    wikidata_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    object_id TEXT NOT NULL,
    page_number BIGINT NOT NULL,
    label TEXT,
    image_file_key TEXT,
    thumbnail_key TEXT,
    alto_xml_key TEXT,
    ocr_text TEXT,
    ocr_confidence DOUBLE PRECISION,
    processing_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    role_id TEXT NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL,
    aliases TEXT,
    birth_date TEXT,
    death_date TEXT,
    description TEXT,
    wikidata_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL,
    place_type TEXT,
    country TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    wikidata_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS preservation_events (
    id TEXT PRIMARY KEY,
    object_id TEXT,
    event_type TEXT NOT NULL,
    event_detail TEXT,
    event_outcome TEXT NOT NULL,
    outcome_detail TEXT,
    agent_name TEXT NOT NULL,
    agent_type TEXT NOT NULL DEFAULT 'software',
    event_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_hash_before TEXT,
    file_hash_after TEXT
);

CREATE TABLE IF NOT EXISTS processing_jobs (
    id TEXT PRIMARY KEY,
    object_id TEXT NOT NULL,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    priority BIGINT NOT NULL DEFAULT 5,
    attempts BIGINT NOT NULL DEFAULT 0,
    max_attempts BIGINT NOT NULL DEFAULT 3,
    payload_json TEXT,
    result_json TEXT,
    error_message TEXT,
    queued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TEXT,
    completed_at TEXT,
    worker_id TEXT
);

CREATE TABLE IF NOT EXISTS relationship_evidence (
    id TEXT PRIMARY KEY,
    relationship_id TEXT NOT NULL,
    chunk_id TEXT NOT NULL,
    document_id TEXT,
    page_number BIGINT,
    excerpt TEXT NOT NULL,
    confidence DOUBLE PRECISION DEFAULT 1.0,
    verified_by TEXT DEFAULT 'curator',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    subject_type TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    predicate TEXT NOT NULL,
    object_type TEXT NOT NULL,
    object_id TEXT NOT NULL,
    evidence_chunk_id TEXT,
    confidence DOUBLE PRECISION DEFAULT 1.0,
    source TEXT NOT NULL DEFAULT 'manual',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_document_id TEXT,
    source_page_id BIGINT,
    evidence_text TEXT,
    extraction_method TEXT,
    created_by TEXT,
    status TEXT DEFAULT 'CANDIDATE'
);

CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_index_meta (
    id TEXT PRIMARY KEY,
    index_type TEXT NOT NULL,
    model_name TEXT,
    embedding_version TEXT,
    total_chunks BIGINT DEFAULT 0,
    last_run_at TEXT,
    run_duration_s DOUBLE PRECISION,
    status TEXT NOT NULL DEFAULT 'idle'
);

CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT,
    year TEXT,
    publisher TEXT,
    url TEXT,
    doi TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS story_collections (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    summary TEXT NOT NULL,
    cover_image_url TEXT,
    category TEXT NOT NULL DEFAULT 'MEMORIAL',
    published BIGINT NOT NULL DEFAULT 1,
    display_order BIGINT NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS story_items (
    id TEXT PRIMARY KEY,
    story_id TEXT NOT NULL,
    sequence BIGINT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    narrative_text TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT DEFAULT 'document',
    document_id TEXT,
    page_number BIGINT,
    chunk_id TEXT,
    evidence_quote TEXT,
    interactive_graph_config TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    date_precision TEXT NOT NULL DEFAULT 'DAY',
    category TEXT NOT NULL DEFAULT 'HISTORICAL',
    location TEXT,
    related_people TEXT,
    related_documents TEXT,
    related_topics TEXT,
    source TEXT NOT NULL,
    evidence_chunk_id TEXT,
    evidence_text TEXT,
    document_id TEXT,
    page_number BIGINT,
    publication_status TEXT NOT NULL DEFAULT 'APPROVED',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline_localizations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    language TEXT NOT NULL,
    localized_title TEXT NOT NULL,
    localized_description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transcript_segments (
    id TEXT PRIMARY KEY,
    media_asset_id TEXT NOT NULL,
    segment_index BIGINT NOT NULL,
    start_time DOUBLE PRECISION NOT NULL,
    end_time DOUBLE PRECISION NOT NULL,
    text TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    speaker_id TEXT,
    speaker_name TEXT,
    confidence DOUBLE PRECISION DEFAULT 1.0,
    source TEXT DEFAULT 'archival_recording',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transcripts (
    id TEXT PRIMARY KEY,
    media_asset_id TEXT NOT NULL,
    language TEXT NOT NULL,
    transcript_text TEXT NOT NULL,
    model_name TEXT NOT NULL,
    word_timestamps TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS translations (
    id TEXT PRIMARY KEY,
    chunk_id TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    model_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS translations_cache (
    id TEXT PRIMARY KEY,
    chunk_id TEXT,
    source_text_hash TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    translation_model TEXT NOT NULL,
    translation_version TEXT NOT NULL,
    review_status TEXT DEFAULT 'APPROVED',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tts_cache (
    id TEXT PRIMARY KEY,
    source_text_hash TEXT NOT NULL,
    source_text TEXT NOT NULL,
    language TEXT NOT NULL,
    model TEXT NOT NULL,
    audio_path TEXT NOT NULL,
    generation_type TEXT NOT NULL DEFAULT 'AI_NARRATION',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT,
    hashed_password TEXT,
    full_name TEXT,
    role_id TEXT,
    is_active BIGINT NOT NULL DEFAULT 1,
    is_superuser BIGINT NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS work_alignments (
    id TEXT PRIMARY KEY,
    work_id TEXT NOT NULL,
    source_segment_id TEXT NOT NULL,
    target_segment_id TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    alignment_level TEXT NOT NULL,
    alignment_method TEXT NOT NULL,
    alignment_status TEXT NOT NULL,
    source_text_snippet TEXT,
    target_text_snippet TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_manifests (
    archival_id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    language TEXT NOT NULL,
    script TEXT NOT NULL,
    source_format TEXT NOT NULL,
    format_nature TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    page_count BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    text_authority TEXT NOT NULL,
    ingested_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_relationships (
    id TEXT PRIMARY KEY,
    source_document_id TEXT NOT NULL,
    target_document_id TEXT NOT NULL,
    work_id TEXT,
    relationship_type TEXT NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    verification_status TEXT NOT NULL,
    evidence_notes TEXT,
    created_at TEXT NOT NULL
);
