# Unified API Contract Specification — Phase 10

## Version & Host
- **API Version**: `0.10.0-phase10`
- **Prefix**: `/api/v1`
- **Protocol**: HTTP/1.1 REST + JSON

---

## 1. System & Health
- `GET /api/v1/health`: Overall system and subsystem health (Database, Storage, Memory).
- `GET /api/v1/health/database`: Turso Cloud ping and query check.

---

## 2. Archival Corpus & Preservation
- `GET /api/v1/collections`: List digital collections.
- `GET /api/v1/documents`: Paginated archival objects.
- `GET /api/v1/documents/{id}`: Detailed archival object metadata.
- `GET /api/v1/documents/{id}/pages/{page_num}`: Digital facsimile page data.
- `GET /api/v1/preservation/events`: PREMIS preservation event audit trail.

---

## 3. Search & Cross-Lingual Retrieval (Phase 9)
- `POST /api/v1/search`: Hybrid search with automatic Indic language detection (`hi`, `mr`, `en`), cross-lingual query translation, FTS5 + Qwen3 vector retrieval, and reranking. Returns `detected_language` and `translated_query`.
- `POST /api/v1/assistant/ask`: Evidence-grounded conversational assistant with citations and claim validation.
- `POST /api/v1/assistant/ask-page`: Targeted Q&A on a specific archival page.
- `POST /api/v1/assistant/ask-page-action`: Phase 9 Signature Ask This Page engine (`SUMMARIZE`, `EXPLAIN`, `TRANSLATE`, `READ_ALOUD`, `IDENTIFY_ENTITIES`, `CUSTOM_QUESTION`) strictly attributing `Source: Current Page`.
- `GET /api/v1/assistant/modes`: Available scholarly research modes.

---

## 4. Multilingual & Neural Speech Synthesis (Phase 9)
- `POST /api/v1/indic/translate`: Academic Indic translation with SHA-256 persistent caching in `translations_cache`.
- `POST /api/v1/indic/tts/synthesize`: Neural Indic speech narration generating MP3 streams cached in `tts_cache` with `AI_NARRATION` tag.
- `GET /api/v1/indic/tts/audio/{filename}`: Audio stream endpoint for synthesized narration MP3 files.
- `GET /api/v1/indic/localizations/entities/{id}`: Localized Devanagari display names in Hindi and Marathi for knowledge graph nodes.
- `GET /api/v1/indic/localizations/timeline/{id}`: Localized Devanagari event titles and descriptions for historical timeline milestones.

---

## 5. Voice Search & ASR (Phase 9)
- `POST /api/v1/voice/transcribe`: Audio upload endpoint for `[ 🎤 Ask the Archive ]`. Transcribes speech with Whisper Large v3 Turbo, detects language, and provides timestamped segments for visitor review and query editing.

---

## 6. Audio & Video Heritage Archive (Phase 9)
- `GET /api/v1/media/tracks`: Catalog of archival audio speeches and documentary video tracks with preservation metadata.
- `GET /api/v1/media/tracks/{id}`: Track details with ordered timestamped segments (`start_time`, `end_time`, `text`, `speaker_name`).
- `GET /api/v1/media/search`: Spoken word search across recordings returning direct seek-to-timestamp links (`/media?track=...&t=...`).

---

## 7. Multimodal Page Understanding (Phase 9)
- `POST /api/v1/multimodal/analyze-page`: Qwen3 Vision AI layout reasoning and OCR conflict detection for difficult or degraded folios. Preserves archival OCR while reporting layout structure, footnotes, signatures, and transcription conflicts.

---

## 8. Knowledge Graph & Explainability (Phase 8)
- `GET /api/v1/graph/entities/{id}`: Entity details and aliases.
- `GET /api/v1/graph/entities/{id}/neighbors`: Progressive neighborhood sub-graph for Cytoscape.js.
- `GET /api/v1/graph/search`: Entity search across canonical names and variations.
- `GET /api/v1/graph/why-connected`: Signature explainability endpoint delivering verbatim archival proof.

---

## 9. Historical Timeline & Stories (Phase 8)
- `GET /api/v1/timeline`: Precision-aware chronology feed with date and category filters.
- `GET /api/v1/timeline/events/{id}`: Single event with full archival citation.
- `GET /api/v1/stories`: Directory of published narrative journeys.
- `GET /api/v1/stories/{id}`: Complete sequential chapter reader with archival viewer deep-links.

---

## 10. Multilingual Corpus, Curation & Comparison (Phase 9.5 & Phase 10)
- `GET /api/v1/multilingual-corpus/dashboard`: Aggregated dashboard metrics for 112 documents, page counts by language, and authority tiers.
- `GET /api/v1/multilingual-corpus/works`: List canonical creative works (FRBR Work level).
- `GET /api/v1/multilingual-corpus/relationships`: Cross-document relationships (`translation_of`, `edition_of`, `volume_split`).
- `GET /api/v1/multilingual-corpus/alignments`: Structural passage, chapter, and section cross-lingual alignments.
- `GET /api/v1/multilingual-corpus/documents`: Cryptographic manifest entries filterable by language name, code, or format nature.
- `GET /api/v1/ocr/baseline`: Empirical OCR baseline metrics reported separately for Hindi, Bengali, Gujarati, and Tamil.
- `GET /api/v1/ocr/page/{document_id}/{page_number}`: Fetch raw and reviewed OCR text for an archival page.
- `POST /api/v1/ocr/review`: Non-destructive curator review endpoint updating `reviewed_ocr_text` without altering immutable `raw_ocr_text`.
- `POST /api/v1/assistant/ask` with `mode: "compare"`: Source comparison engine generating structured analysis of common themes, divergences, and supporting passages across two selected archival works.

