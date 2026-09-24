-- Phase 9.5: Multilingual Books & Writings Corpus Migration
-- Schema for Multilingual Works, File Manifests, Work Relationships,
-- Cross-Language Alignments, OCR Pages, and Evaluation Datasets.

CREATE TABLE IF NOT EXISTS multilingual_works (
    id TEXT PRIMARY KEY,
    canonical_title TEXT NOT NULL,
    author TEXT DEFAULT 'Dr. B.R. Ambedkar',
    original_language TEXT DEFAULT 'en',
    description TEXT,
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
    file_size_bytes INTEGER NOT NULL,
    page_count INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    text_authority TEXT NOT NULL,
    ingested_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_relationships (
    id TEXT PRIMARY KEY,
    source_document_id TEXT NOT NULL,
    target_document_id TEXT NOT NULL,
    work_id TEXT,
    relationship_type TEXT NOT NULL, -- same_work, edition_of, translation_of, related_work
    confidence_score REAL NOT NULL,
    verification_status TEXT NOT NULL, -- CANDIDATE, VERIFIED, REJECTED
    evidence_notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (source_document_id) REFERENCES work_manifests(archival_id) ON DELETE CASCADE,
    FOREIGN KEY (target_document_id) REFERENCES work_manifests(archival_id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES multilingual_works(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS work_alignments (
    id TEXT PRIMARY KEY,
    work_id TEXT NOT NULL,
    source_segment_id TEXT NOT NULL,
    target_segment_id TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    alignment_level TEXT NOT NULL, -- WORK, SECTION, PARAGRAPH, PAGE
    alignment_method TEXT NOT NULL, -- TITLE_MATCH, SECTION_STRUCTURE, SEMANTIC_SIMILARITY, MANUAL_CURATION
    alignment_status TEXT NOT NULL, -- CANDIDATE, VERIFIED, REJECTED, NEEDS_REVIEW
    source_text_snippet TEXT,
    target_text_snippet TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (work_id) REFERENCES multilingual_works(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ocr_pages (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    language TEXT NOT NULL,
    ocr_engine TEXT NOT NULL,
    confidence_avg REAL NOT NULL,
    raw_ocr_text TEXT,
    reviewed_ocr_text TEXT,
    review_status TEXT DEFAULT 'OCR_UNREVIEWED', -- OCR_UNREVIEWED, OCR_REVIEWED, NEEDS_CORRECTION
    reviewer TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES work_manifests(archival_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS eval_dataset_items (
    id TEXT PRIMARY KEY,
    dataset_type TEXT NOT NULL, -- RETRIEVAL_EVAL, ALIGNMENT_EVAL, HARD_NEGATIVE
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

CREATE INDEX IF NOT EXISTS idx_work_manifests_lang ON work_manifests(language);
CREATE INDEX IF NOT EXISTS idx_work_relationships_src ON work_relationships(source_document_id);
CREATE INDEX IF NOT EXISTS idx_work_relationships_tgt ON work_relationships(target_document_id);
CREATE INDEX IF NOT EXISTS idx_work_alignments_work ON work_alignments(work_id);
CREATE INDEX IF NOT EXISTS idx_ocr_pages_doc_pno ON ocr_pages(document_id, page_number);
CREATE INDEX IF NOT EXISTS idx_eval_dataset_type ON eval_dataset_items(dataset_type);
