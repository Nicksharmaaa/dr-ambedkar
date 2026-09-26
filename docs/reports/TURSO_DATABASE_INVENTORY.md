# Turso / SQLite Database Schema & Row Inventory

Extracted directly from the baseline database on 2026-09-26.

## 1. System Summary

| Metric | Count |
|---|---|
| **Total Tables** | 52 |
| **Archival Objects (Volumes)** | 19 |
| **Work Manifests** | 112 |
| **Entities** | 30 |
| **Entity Aliases** | 71 |
| **Relationships** | 20 |
| **Relationship Evidence** | 20 |
| **Timeline Events** | 15 |
| **Curated Stories** | 3 |
| **Story Items** | 9 |
| **Roles** | 4 |
| **Schema Migrations** | 3 |
| **Cached Vector Embeddings** | 12,154 in `vector_cache.npz` |

---

## 2. Table-by-Table Inventory

### Table: `archival_objects` (Rows: 19)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `collection_id` | `TEXT` | YES | - | NO |
| `stable_id` | `TEXT` | NO | - | NO |
| `title` | `TEXT` | NO | - | NO |
| `subtitle` | `TEXT` | YES | - | NO |
| `object_type` | `TEXT` | NO | 'book' | NO |
| `language` | `TEXT` | NO | 'en' | NO |
| `source_institution` | `TEXT` | NO | '' | NO |
| `provenance` | `TEXT` | NO | '' | NO |
| `rights_status` | `TEXT` | NO | 'unknown' | NO |
| `creator` | `TEXT` | YES | - | NO |
| `publisher` | `TEXT` | YES | - | NO |
| `publication_date` | `TEXT` | YES | - | NO |
| `description` | `TEXT` | YES | - | NO |
| `subject_keywords` | `TEXT` | YES | - | NO |
| `physical_description` | `TEXT` | YES | - | NO |
| `review_status` | `TEXT` | NO | 'pending' | NO |
| `publication_status` | `TEXT` | NO | 'draft' | NO |
| `file_hash` | `TEXT` | YES | - | NO |
| `file_size_bytes` | `INTEGER` | YES | - | NO |
| `original_filename` | `TEXT` | YES | - | NO |
| `original_file_key` | `TEXT` | YES | - | NO |
| `page_count` | `INTEGER` | YES | - | NO |
| `metadata_json` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |
| `updated_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `collection_id` → `collections(id)`

**Indexes:** `idx_ao_language`, `idx_ao_status`, `idx_ao_collection`, `idx_ao_type`, `idx_ao_stable_id`, `sqlite_autoindex_archival_objects_2`, `sqlite_autoindex_archival_objects_1`

---

### Table: `audit_events` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `user_id` | `TEXT` | YES | - | NO |
| `action` | `TEXT` | NO | - | NO |
| `resource` | `TEXT` | NO | - | NO |
| `resource_id` | `TEXT` | YES | - | NO |
| `details` | `TEXT` | YES | - | NO |
| `ip_address` | `TEXT` | YES | - | NO |
| `user_agent` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `idx_audit_action`, `idx_audit_resource`, `idx_audit_user`, `sqlite_autoindex_audit_events_1`

---

### Table: `collections` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `slug` | `TEXT` | NO | - | NO |
| `title` | `TEXT` | NO | - | NO |
| `description` | `TEXT` | YES | - | NO |
| `cover_image_key` | `TEXT` | YES | - | NO |
| `display_order` | `INTEGER` | NO | 0 | NO |
| `is_public` | `INTEGER` | NO | 1 | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |
| `updated_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `idx_collections_slug`, `sqlite_autoindex_collections_2`, `sqlite_autoindex_collections_1`

---

### Table: `concepts` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `name` | `TEXT` | NO | - | NO |
| `definition` | `TEXT` | YES | - | NO |
| `domain` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `sqlite_autoindex_concepts_2`, `sqlite_autoindex_concepts_1`

---

### Table: `digital_files` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `archival_object_id` | `TEXT` | YES | - | NO |
| `file_path` | `TEXT` | NO | - | NO |
| `mime_type` | `TEXT` | NO | - | NO |
| `byte_size` | `INTEGER` | YES | - | NO |
| `sha256_hash` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `archival_object_id` → `archival_objects(id)`

**Indexes:** `idx_digital_files_object`, `sqlite_autoindex_digital_files_1`

---

### Table: `document_chunks` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `object_id` | `TEXT` | NO | - | NO |
| `page_id` | `TEXT` | YES | - | NO |
| `section_id` | `TEXT` | YES | - | NO |
| `chunk_index` | `INTEGER` | NO | - | NO |
| `text` | `TEXT` | NO | - | NO |
| `language` | `TEXT` | NO | 'en' | NO |
| `token_count` | `INTEGER` | YES | - | NO |
| `char_count` | `INTEGER` | YES | - | NO |
| `volume_number` | `TEXT` | YES | - | NO |
| `page_number` | `INTEGER` | YES | - | NO |
| `section_title` | `TEXT` | YES | - | NO |
| `is_header` | `INTEGER` | NO | 0 | NO |
| `is_footnote` | `INTEGER` | NO | 0 | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `section_id` → `document_sections(id)`
- `page_id` → `pages(id)`
- `object_id` → `archival_objects(id)`

**Indexes:** `idx_chunks_page_number`, `idx_chunks_language`, `idx_chunks_section`, `idx_chunks_page`, `idx_chunks_object`, `sqlite_autoindex_document_chunks_1`

---

### Table: `document_sections` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `object_id` | `TEXT` | NO | - | NO |
| `parent_id` | `TEXT` | YES | - | NO |
| `section_num` | `TEXT` | YES | - | NO |
| `title` | `TEXT` | NO | - | NO |
| `start_page` | `INTEGER` | YES | - | NO |
| `end_page` | `INTEGER` | YES | - | NO |
| `depth` | `INTEGER` | NO | 0 | NO |
| `display_order` | `INTEGER` | NO | 0 | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `parent_id` → `document_sections(id)`
- `object_id` → `archival_objects(id)`

**Indexes:** `idx_sections_object`, `sqlite_autoindex_document_sections_1`

---

### Table: `embeddings` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `chunk_id` | `TEXT` | NO | - | NO |
| `model_name` | `TEXT` | NO | - | NO |
| `embedding_version` | `TEXT` | NO | 'v1' | NO |
| `dimension` | `INTEGER` | NO | 1024 | NO |
| `embedding_json` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `chunk_id` → `document_chunks(id)`

**Indexes:** `idx_embeddings_version`, `idx_embeddings_model`, `idx_embeddings_chunk`, `sqlite_autoindex_embeddings_1`

---

### Table: `entities` (Rows: 30)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `entity_type` | `TEXT` | NO | - | NO |
| `canonical_name` | `TEXT` | NO | - | NO |
| `description` | `TEXT` | YES | - | NO |
| `source` | `TEXT` | NO | 'archival_corpus' | NO |
| `status` | `TEXT` | NO | 'CANDIDATE' | NO |
| `date` | `TEXT` | YES | - | NO |
| `date_precision` | `TEXT` | YES | 'YEAR' | NO |
| `language` | `TEXT` | YES | 'en' | NO |
| `location` | `TEXT` | YES | - | NO |
| `aliases` | `TEXT` | YES | - | NO |
| `external_identifiers` | `TEXT` | YES | - | NO |
| `rights` | `TEXT` | YES | 'public_domain' | NO |
| `object_id` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |
| `updated_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `object_id` → `archival_objects(id)`

**Indexes:** `idx_entities_object`, `idx_entities_name`, `idx_entities_type_status`, `sqlite_autoindex_entities_1`

---

### Table: `entity_aliases` (Rows: 71)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `entity_id` | `TEXT` | NO | - | NO |
| `alias` | `TEXT` | NO | - | NO |
| `alias_type` | `TEXT` | YES | 'variant' | NO |
| `language` | `TEXT` | YES | 'en' | NO |
| `confidence` | `REAL` | YES | 1.0 | NO |
| `created_at` | `TEXT` | YES | datetime('now') | NO |

**Foreign Keys:**
- `entity_id` → `entities(id)`

**Indexes:** `idx_aliases_entity`, `idx_aliases_lookup`, `sqlite_autoindex_entity_aliases_1`

---

### Table: `entity_localizations` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `entity_id` | `TEXT` | NO | - | NO |
| `language` | `TEXT` | NO | - | NO |
| `localized_name` | `TEXT` | NO | - | NO |
| `localized_description` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `entity_id` → `entities(id)`

**Indexes:** `idx_ent_loc`, `sqlite_autoindex_entity_localizations_1`

---

### Table: `entity_reviews` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `entity_id` | `TEXT` | YES | - | NO |
| `original_mention` | `TEXT` | NO | - | NO |
| `suggested_entity_id` | `TEXT` | YES | - | NO |
| `reviewer` | `TEXT` | NO | 'curator' | NO |
| `action` | `TEXT` | NO | - | NO |
| `status` | `TEXT` | NO | 'PENDING' | NO |
| `supporting_chunk_id` | `TEXT` | YES | - | NO |
| `review_notes` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | YES | datetime('now') | NO |

**Foreign Keys:**
- `supporting_chunk_id` → `document_chunks(id)`
- `entity_id` → `entities(id)`

**Indexes:** `idx_reviews_status`, `idx_reviews_entity`, `sqlite_autoindex_entity_reviews_1`

---

### Table: `eval_dataset_items` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `dataset_type` | `TEXT` | NO | - | NO |
| `query_text` | `TEXT` | NO | - | NO |
| `query_language` | `TEXT` | NO | - | NO |
| `positive_chunk_id` | `TEXT` | YES | - | NO |
| `positive_doc_id` | `TEXT` | YES | - | NO |
| `positive_language` | `TEXT` | YES | - | NO |
| `negative_chunk_id` | `TEXT` | YES | - | NO |
| `negative_doc_id` | `TEXT` | YES | - | NO |
| `negative_type` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | - | NO |

**Indexes:** `idx_eval_dataset_type`, `sqlite_autoindex_eval_dataset_items_1`

---

### Table: `events` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `canonical_name` | `TEXT` | NO | - | NO |
| `event_type` | `TEXT` | YES | - | NO |
| `start_date` | `TEXT` | YES | - | NO |
| `end_date` | `TEXT` | YES | - | NO |
| `location_id` | `TEXT` | YES | - | NO |
| `description` | `TEXT` | YES | - | NO |
| `significance` | `TEXT` | YES | - | NO |
| `wikidata_id` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `sqlite_autoindex_events_1`

---

### Table: `files` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `object_id` | `TEXT` | NO | - | NO |
| `file_type` | `TEXT` | NO | - | NO |
| `storage_key` | `TEXT` | NO | - | NO |
| `mime_type` | `TEXT` | NO | - | NO |
| `file_size_bytes` | `INTEGER` | YES | - | NO |
| `file_hash` | `TEXT` | YES | - | NO |
| `width_px` | `INTEGER` | YES | - | NO |
| `height_px` | `INTEGER` | YES | - | NO |
| `duration_secs` | `REAL` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `object_id` → `archival_objects(id)`

**Indexes:** `idx_files_type`, `idx_files_object`, `sqlite_autoindex_files_1`

---

### Table: `fts_chunks` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `text` | `` | YES | - | NO |
| `object_id` | `` | YES | - | NO |
| `chunk_id` | `` | YES | - | NO |

---

### Table: `fts_chunks_config` (Rows: 1)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `k` | `` | NO | - | YES |
| `v` | `` | YES | - | NO |

**Indexes:** `sqlite_autoindex_fts_chunks_config_1`

---

### Table: `fts_chunks_content` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `INTEGER` | YES | - | YES |
| `c0` | `` | YES | - | NO |
| `c1` | `` | YES | - | NO |
| `c2` | `` | YES | - | NO |

---

### Table: `fts_chunks_data` (Rows: 2)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `INTEGER` | YES | - | YES |
| `block` | `BLOB` | YES | - | NO |

---

### Table: `fts_chunks_docsize` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `INTEGER` | YES | - | YES |
| `sz` | `BLOB` | YES | - | NO |

---

### Table: `fts_chunks_idx` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `segid` | `` | NO | - | YES |
| `term` | `` | NO | - | YES |
| `pgno` | `` | YES | - | NO |

**Indexes:** `sqlite_autoindex_fts_chunks_idx_1`

---

### Table: `media_assets` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `object_id` | `TEXT` | NO | - | NO |
| `asset_type` | `TEXT` | NO | - | NO |
| `title` | `TEXT` | YES | - | NO |
| `storage_key` | `TEXT` | NO | - | NO |
| `mime_type` | `TEXT` | NO | - | NO |
| `duration_secs` | `REAL` | YES | - | NO |
| `transcript_text` | `TEXT` | YES | - | NO |
| `transcript_language` | `TEXT` | YES | - | NO |
| `iiif_manifest_json` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `object_id` → `archival_objects(id)`

**Indexes:** `idx_media_object`, `sqlite_autoindex_media_assets_1`

---

### Table: `multilingual_works` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `canonical_title` | `TEXT` | NO | - | NO |
| `author` | `TEXT` | YES | 'Dr. B.R. Ambedkar' | NO |
| `original_language` | `TEXT` | YES | 'en' | NO |
| `description` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | - | NO |

**Indexes:** `sqlite_autoindex_multilingual_works_1`

---

### Table: `multimodal_page_analyses` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `object_id` | `TEXT` | NO | - | NO |
| `page_number` | `INTEGER` | NO | - | NO |
| `model_name` | `TEXT` | NO | - | NO |
| `visual_summary` | `TEXT` | NO | - | NO |
| `visual_ocr_text` | `TEXT` | YES | - | NO |
| `conflict_detected` | `INTEGER` | NO | 0 | NO |
| `conflict_details` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `object_id` → `archival_objects(id)`

**Indexes:** `idx_mpage_lookup`, `sqlite_autoindex_multimodal_page_analyses_1`

---

### Table: `ocr_pages` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `document_id` | `TEXT` | NO | - | NO |
| `page_number` | `INTEGER` | NO | - | NO |
| `language` | `TEXT` | NO | - | NO |
| `ocr_engine` | `TEXT` | NO | - | NO |
| `confidence_avg` | `REAL` | NO | - | NO |
| `raw_ocr_text` | `TEXT` | YES | - | NO |
| `reviewed_ocr_text` | `TEXT` | YES | - | NO |
| `review_status` | `TEXT` | YES | 'OCR_UNREVIEWED' | NO |
| `reviewer` | `TEXT` | YES | - | NO |
| `reviewed_at` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | - | NO |

**Foreign Keys:**
- `document_id` → `work_manifests(archival_id)`

**Indexes:** `idx_ocr_pages_doc_pno`, `sqlite_autoindex_ocr_pages_1`

---

### Table: `organizations` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `canonical_name` | `TEXT` | NO | - | NO |
| `aliases` | `TEXT` | YES | - | NO |
| `org_type` | `TEXT` | YES | - | NO |
| `founded_date` | `TEXT` | YES | - | NO |
| `dissolved_date` | `TEXT` | YES | - | NO |
| `description` | `TEXT` | YES | - | NO |
| `wikidata_id` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `sqlite_autoindex_organizations_1`

---

### Table: `pages` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `object_id` | `TEXT` | NO | - | NO |
| `page_number` | `INTEGER` | NO | - | NO |
| `label` | `TEXT` | YES | - | NO |
| `image_file_key` | `TEXT` | YES | - | NO |
| `thumbnail_key` | `TEXT` | YES | - | NO |
| `alto_xml_key` | `TEXT` | YES | - | NO |
| `ocr_text` | `TEXT` | YES | - | NO |
| `ocr_confidence` | `REAL` | YES | - | NO |
| `processing_status` | `TEXT` | NO | 'pending' | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |
| `updated_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `object_id` → `archival_objects(id)`

**Indexes:** `idx_pages_status`, `idx_pages_object`, `sqlite_autoindex_pages_1`

---

### Table: `permissions` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `role_id` | `TEXT` | NO | - | NO |
| `resource` | `TEXT` | NO | - | NO |
| `action` | `TEXT` | NO | - | NO |

**Foreign Keys:**
- `role_id` → `roles(id)`

**Indexes:** `sqlite_autoindex_permissions_1`

---

### Table: `persons` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `canonical_name` | `TEXT` | NO | - | NO |
| `aliases` | `TEXT` | YES | - | NO |
| `birth_date` | `TEXT` | YES | - | NO |
| `death_date` | `TEXT` | YES | - | NO |
| `description` | `TEXT` | YES | - | NO |
| `wikidata_id` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `sqlite_autoindex_persons_1`

---

### Table: `places` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `canonical_name` | `TEXT` | NO | - | NO |
| `place_type` | `TEXT` | YES | - | NO |
| `country` | `TEXT` | YES | - | NO |
| `latitude` | `REAL` | YES | - | NO |
| `longitude` | `REAL` | YES | - | NO |
| `wikidata_id` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `sqlite_autoindex_places_1`

---

### Table: `preservation_events` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `object_id` | `TEXT` | YES | - | NO |
| `event_type` | `TEXT` | NO | - | NO |
| `event_detail` | `TEXT` | YES | - | NO |
| `event_outcome` | `TEXT` | NO | - | NO |
| `outcome_detail` | `TEXT` | YES | - | NO |
| `agent_name` | `TEXT` | NO | - | NO |
| `agent_type` | `TEXT` | NO | 'software' | NO |
| `event_date` | `TEXT` | NO | datetime('now') | NO |
| `file_hash_before` | `TEXT` | YES | - | NO |
| `file_hash_after` | `TEXT` | YES | - | NO |

**Foreign Keys:**
- `object_id` → `archival_objects(id)`

**Indexes:** `idx_pev_date`, `idx_pev_type`, `idx_pev_object`, `sqlite_autoindex_preservation_events_1`

---

### Table: `processing_jobs` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `object_id` | `TEXT` | NO | - | NO |
| `job_type` | `TEXT` | NO | - | NO |
| `status` | `TEXT` | NO | 'queued' | NO |
| `priority` | `INTEGER` | NO | 5 | NO |
| `attempts` | `INTEGER` | NO | 0 | NO |
| `max_attempts` | `INTEGER` | NO | 3 | NO |
| `payload_json` | `TEXT` | YES | - | NO |
| `result_json` | `TEXT` | YES | - | NO |
| `error_message` | `TEXT` | YES | - | NO |
| `queued_at` | `TEXT` | NO | datetime('now') | NO |
| `started_at` | `TEXT` | YES | - | NO |
| `completed_at` | `TEXT` | YES | - | NO |
| `worker_id` | `TEXT` | YES | - | NO |

**Foreign Keys:**
- `object_id` → `archival_objects(id)`

**Indexes:** `idx_jobs_type`, `idx_jobs_object`, `idx_jobs_status`, `sqlite_autoindex_processing_jobs_1`

---

### Table: `relationship_evidence` (Rows: 20)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `relationship_id` | `TEXT` | NO | - | NO |
| `chunk_id` | `TEXT` | NO | - | NO |
| `document_id` | `TEXT` | YES | - | NO |
| `page_number` | `INTEGER` | YES | - | NO |
| `excerpt` | `TEXT` | NO | - | NO |
| `confidence` | `REAL` | YES | 1.0 | NO |
| `verified_by` | `TEXT` | YES | 'curator' | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `document_id` → `archival_objects(id)`
- `chunk_id` → `document_chunks(id)`
- `relationship_id` → `relationships(id)`

**Indexes:** `idx_relev_chunk`, `idx_relev_rel`, `sqlite_autoindex_relationship_evidence_1`

---

### Table: `relationships` (Rows: 20)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `subject_type` | `TEXT` | NO | - | NO |
| `subject_id` | `TEXT` | NO | - | NO |
| `predicate` | `TEXT` | NO | - | NO |
| `object_type` | `TEXT` | NO | - | NO |
| `object_id` | `TEXT` | NO | - | NO |
| `evidence_chunk_id` | `TEXT` | YES | - | NO |
| `confidence` | `REAL` | YES | 1.0 | NO |
| `source` | `TEXT` | NO | 'manual' | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |
| `source_document_id` | `TEXT` | YES | - | NO |
| `source_page_id` | `INTEGER` | YES | - | NO |
| `evidence_text` | `TEXT` | YES | - | NO |
| `extraction_method` | `TEXT` | YES | - | NO |
| `created_by` | `TEXT` | YES | - | NO |
| `status` | `TEXT` | YES | 'CANDIDATE' | NO |

**Foreign Keys:**
- `evidence_chunk_id` → `document_chunks(id)`

**Indexes:** `idx_rel_predicate`, `idx_rel_evidence`, `idx_rel_status`, `idx_rel_object`, `idx_rel_subject`, `sqlite_autoindex_relationships_1`

---

### Table: `roles` (Rows: 4)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `name` | `TEXT` | NO | - | NO |
| `description` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `sqlite_autoindex_roles_2`, `sqlite_autoindex_roles_1`

---

### Table: `schema_migrations` (Rows: 3)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `version` | `TEXT` | YES | - | YES |
| `applied_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `sqlite_autoindex_schema_migrations_1`

---

### Table: `search_index_meta` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `index_type` | `TEXT` | NO | - | NO |
| `model_name` | `TEXT` | YES | - | NO |
| `embedding_version` | `TEXT` | YES | - | NO |
| `total_chunks` | `INTEGER` | YES | 0 | NO |
| `last_run_at` | `TEXT` | YES | - | NO |
| `run_duration_s` | `REAL` | YES | - | NO |
| `status` | `TEXT` | NO | 'idle' | NO |

**Indexes:** `idx_sim_type`, `sqlite_autoindex_search_index_meta_1`

---

### Table: `sources` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `title` | `TEXT` | NO | - | NO |
| `authors` | `TEXT` | YES | - | NO |
| `year` | `TEXT` | YES | - | NO |
| `publisher` | `TEXT` | YES | - | NO |
| `url` | `TEXT` | YES | - | NO |
| `doi` | `TEXT` | YES | - | NO |
| `notes` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `sqlite_autoindex_sources_1`

---

### Table: `story_collections` (Rows: 3)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `slug` | `TEXT` | NO | - | NO |
| `title` | `TEXT` | NO | - | NO |
| `subtitle` | `TEXT` | YES | - | NO |
| `summary` | `TEXT` | NO | - | NO |
| `cover_image_url` | `TEXT` | YES | - | NO |
| `category` | `TEXT` | NO | 'MEMORIAL' | NO |
| `published` | `INTEGER` | NO | 1 | NO |
| `display_order` | `INTEGER` | NO | 0 | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `idx_stories_published`, `idx_stories_slug`, `sqlite_autoindex_story_collections_2`, `sqlite_autoindex_story_collections_1`

---

### Table: `story_items` (Rows: 9)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `story_id` | `TEXT` | NO | - | NO |
| `sequence` | `INTEGER` | NO | 1 | NO |
| `title` | `TEXT` | NO | - | NO |
| `narrative_text` | `TEXT` | NO | - | NO |
| `media_url` | `TEXT` | YES | - | NO |
| `media_type` | `TEXT` | YES | 'document' | NO |
| `document_id` | `TEXT` | YES | - | NO |
| `page_number` | `INTEGER` | YES | - | NO |
| `chunk_id` | `TEXT` | YES | - | NO |
| `evidence_quote` | `TEXT` | YES | - | NO |
| `interactive_graph_config` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `chunk_id` → `document_chunks(id)`
- `document_id` → `archival_objects(id)`
- `story_id` → `story_collections(id)`

**Indexes:** `idx_story_items_story`, `sqlite_autoindex_story_items_1`

---

### Table: `timeline_events` (Rows: 15)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `title` | `TEXT` | NO | - | NO |
| `description` | `TEXT` | NO | - | NO |
| `start_date` | `TEXT` | NO | - | NO |
| `end_date` | `TEXT` | YES | - | NO |
| `date_precision` | `TEXT` | NO | 'DAY' | NO |
| `category` | `TEXT` | NO | 'HISTORICAL' | NO |
| `location` | `TEXT` | YES | - | NO |
| `related_people` | `TEXT` | YES | - | NO |
| `related_documents` | `TEXT` | YES | - | NO |
| `related_topics` | `TEXT` | YES | - | NO |
| `source` | `TEXT` | NO | - | NO |
| `evidence_chunk_id` | `TEXT` | YES | - | NO |
| `evidence_text` | `TEXT` | YES | - | NO |
| `document_id` | `TEXT` | YES | - | NO |
| `page_number` | `INTEGER` | YES | - | NO |
| `publication_status` | `TEXT` | NO | 'APPROVED' | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `document_id` → `archival_objects(id)`
- `evidence_chunk_id` → `document_chunks(id)`

**Indexes:** `idx_timeline_status`, `idx_timeline_category`, `idx_timeline_date`, `sqlite_autoindex_timeline_events_1`

---

### Table: `timeline_localizations` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `event_id` | `TEXT` | NO | - | NO |
| `language` | `TEXT` | NO | - | NO |
| `localized_title` | `TEXT` | NO | - | NO |
| `localized_description` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `event_id` → `timeline_events(id)`

**Indexes:** `idx_time_loc`, `sqlite_autoindex_timeline_localizations_1`

---

### Table: `topics` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `name` | `TEXT` | NO | - | NO |
| `description` | `TEXT` | YES | - | NO |
| `parent_id` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `parent_id` → `topics(id)`

**Indexes:** `sqlite_autoindex_topics_2`, `sqlite_autoindex_topics_1`

---

### Table: `transcript_segments` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `media_asset_id` | `TEXT` | NO | - | NO |
| `segment_index` | `INTEGER` | NO | - | NO |
| `start_time` | `REAL` | NO | - | NO |
| `end_time` | `REAL` | NO | - | NO |
| `text` | `TEXT` | NO | - | NO |
| `language` | `TEXT` | NO | 'en' | NO |
| `speaker_id` | `TEXT` | YES | - | NO |
| `speaker_name` | `TEXT` | YES | - | NO |
| `confidence` | `REAL` | YES | 1.0 | NO |
| `source` | `TEXT` | YES | 'archival_recording' | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `media_asset_id` → `media_assets(id)`

**Indexes:** `idx_tseg_time`, `idx_tseg_media`, `sqlite_autoindex_transcript_segments_1`

---

### Table: `transcripts` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `media_asset_id` | `TEXT` | NO | - | NO |
| `language` | `TEXT` | NO | - | NO |
| `transcript_text` | `TEXT` | NO | - | NO |
| `model_name` | `TEXT` | NO | - | NO |
| `word_timestamps` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `media_asset_id` → `media_assets(id)`

**Indexes:** `sqlite_autoindex_transcripts_1`

---

### Table: `translations` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `chunk_id` | `TEXT` | NO | - | NO |
| `source_language` | `TEXT` | NO | - | NO |
| `target_language` | `TEXT` | NO | - | NO |
| `translated_text` | `TEXT` | NO | - | NO |
| `model_name` | `TEXT` | NO | - | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `chunk_id` → `document_chunks(id)`

**Indexes:** `sqlite_autoindex_translations_1`

---

### Table: `translations_cache` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `chunk_id` | `TEXT` | YES | - | NO |
| `source_text_hash` | `TEXT` | NO | - | NO |
| `source_language` | `TEXT` | NO | - | NO |
| `target_language` | `TEXT` | NO | - | NO |
| `translated_text` | `TEXT` | NO | - | NO |
| `translation_model` | `TEXT` | NO | - | NO |
| `translation_version` | `TEXT` | NO | - | NO |
| `review_status` | `TEXT` | YES | 'APPROVED' | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Foreign Keys:**
- `chunk_id` → `document_chunks(id)`

**Indexes:** `idx_trans_chunk`, `idx_trans_hash_lang`, `sqlite_autoindex_translations_cache_1`

---

### Table: `tts_cache` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `source_text_hash` | `TEXT` | NO | - | NO |
| `source_text` | `TEXT` | NO | - | NO |
| `language` | `TEXT` | NO | - | NO |
| `model` | `TEXT` | NO | - | NO |
| `audio_path` | `TEXT` | NO | - | NO |
| `generation_type` | `TEXT` | NO | 'AI_NARRATION' | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |

**Indexes:** `idx_tts_type`, `idx_tts_hash_lang`, `sqlite_autoindex_tts_cache_1`

---

### Table: `users` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `email` | `TEXT` | NO | - | NO |
| `username` | `TEXT` | YES | - | NO |
| `hashed_password` | `TEXT` | YES | - | NO |
| `full_name` | `TEXT` | YES | - | NO |
| `role_id` | `TEXT` | YES | - | NO |
| `is_active` | `INTEGER` | NO | 1 | NO |
| `is_superuser` | `INTEGER` | NO | 0 | NO |
| `created_at` | `TEXT` | NO | datetime('now') | NO |
| `updated_at` | `TEXT` | NO | datetime('now') | NO |
| `last_login_at` | `TEXT` | YES | - | NO |

**Foreign Keys:**
- `role_id` → `roles(id)`

**Indexes:** `idx_users_email`, `sqlite_autoindex_users_3`, `sqlite_autoindex_users_2`, `sqlite_autoindex_users_1`

---

### Table: `work_alignments` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `work_id` | `TEXT` | NO | - | NO |
| `source_segment_id` | `TEXT` | NO | - | NO |
| `target_segment_id` | `TEXT` | NO | - | NO |
| `source_language` | `TEXT` | NO | - | NO |
| `target_language` | `TEXT` | NO | - | NO |
| `alignment_level` | `TEXT` | NO | - | NO |
| `alignment_method` | `TEXT` | NO | - | NO |
| `alignment_status` | `TEXT` | NO | - | NO |
| `source_text_snippet` | `TEXT` | YES | - | NO |
| `target_text_snippet` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | - | NO |

**Foreign Keys:**
- `work_id` → `multilingual_works(id)`

**Indexes:** `idx_work_alignments_work`, `sqlite_autoindex_work_alignments_1`

---

### Table: `work_manifests` (Rows: 112)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `archival_id` | `TEXT` | YES | - | YES |
| `filename` | `TEXT` | NO | - | NO |
| `relative_path` | `TEXT` | NO | - | NO |
| `language` | `TEXT` | NO | - | NO |
| `script` | `TEXT` | NO | - | NO |
| `source_format` | `TEXT` | NO | - | NO |
| `format_nature` | `TEXT` | NO | - | NO |
| `file_size_bytes` | `INTEGER` | NO | - | NO |
| `page_count` | `INTEGER` | NO | - | NO |
| `sha256` | `TEXT` | NO | - | NO |
| `text_authority` | `TEXT` | NO | - | NO |
| `ingested_at` | `TEXT` | NO | - | NO |

**Indexes:** `idx_work_manifests_lang`, `sqlite_autoindex_work_manifests_1`

---

### Table: `work_relationships` (Rows: 0)

| Column | Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `TEXT` | YES | - | YES |
| `source_document_id` | `TEXT` | NO | - | NO |
| `target_document_id` | `TEXT` | NO | - | NO |
| `work_id` | `TEXT` | YES | - | NO |
| `relationship_type` | `TEXT` | NO | - | NO |
| `confidence_score` | `REAL` | NO | - | NO |
| `verification_status` | `TEXT` | NO | - | NO |
| `evidence_notes` | `TEXT` | YES | - | NO |
| `created_at` | `TEXT` | NO | - | NO |

**Foreign Keys:**
- `work_id` → `multilingual_works(id)`
- `target_document_id` → `work_manifests(archival_id)`
- `source_document_id` → `work_manifests(archival_id)`

**Indexes:** `idx_work_relationships_tgt`, `idx_work_relationships_src`, `sqlite_autoindex_work_relationships_1`

---
