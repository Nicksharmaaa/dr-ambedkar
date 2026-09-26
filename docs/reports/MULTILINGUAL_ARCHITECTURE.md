# MULTILINGUAL ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System — Phase 9

---

### 1. Architectural Philosophy & Source Provenance

The multilingual architecture of the Ambedkar Heritage system is designed around a single immutable tenet: **The archival corpus is the sole authoritative source of truth. Every translation, summary, or narration is strictly a derivative layer.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AUTHORITATIVE ARCHIVAL CORPUS                        │
│   (Original Scans, Verbatim PaddleOCR ALTO XML, Preservation Bitstream) │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
              ┌──────────────────────┴──────────────────────┐
              ▼                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     DERIVATIVE TRANSLATION    │             │   AI RESEARCH EXPLANATION     │
│  - Academic Indic translation │             │  - Grounded RAG synthesis     │
│  - Persistent SHA-256 caching │             │  - Verbatim citations         │
│  - Review status & provenance │             │  - Strict claim validation    │
└─────────────┬─────────────────┘             └─────────────┬─────────────────┘
              │                                             │
              └──────────────────────┬──────────────────────┘
                                     ▼
                      ┌───────────────────────────────┐
                      │    DERIVATIVE AI NARRATION    │
                      │  - Neural Edge-TTS / IndicF5  │
                      │  - Distinct from Archival     │
                      │    Original Recordings        │
                      └───────────────────────────────┘
```

#### Content Derivation Classifications
1. **`ORIGINAL_CONTENT`**: Authoritative printed or handwritten folios written or spoken by Dr. B.R. Ambedkar. Never overwritten, modified, or silently replaced.
2. **`TRANSLATED_CONTENT`**: Derivative linguistic rendering in Hindi (Devanagari) or Marathi (Devanagari). Must retain source text hash, translation model identifier, version, and review status.
3. **`AI_GENERATED_EXPLANATION`**: Pedagogical or executive synthesis created by the AI Research Assistant. Always accompanied by explicit citations (`Source: Current Page` or archival chunk ID).
4. **`AI_NARRATION`**: Neural text-to-speech audio synthesized from approved source or translated text. Explicitly segregated in the database and user interface from `ORIGINAL_RECORDING`.

---

### 2. Translation Engine & Verification

#### Model Architecture
- **Primary Engine**: `qwen/qwen3.8-27b` operating via Groq LPUs for sub-second academic Indic inference.
- **System Prompt**: Constrained by strict digital preservation rules:
  1. Mandatory preservation of historical and legal proper nouns (e.g. *Dr. B.R. Ambedkar*, *Columbia University*, *Chhatrapati Shahu Maharaj*, *John Dewey*).
  2. Respectful scholarly Devanagari in Hindi.
  3. Authentic constitutional Marathi vocabulary (e.g., घटनात्मक नैतिकता for *Constitutional Morality*, जातीचा उच्छेद for *Annihilation of Caste*, सामाजिक अंतःप्रसरण for *Social Endosmosis*).
  4. Zero conversational preambles or extraneous commentary.
- **Compatibility Pathway**: `IndicTrans2-Indic-en-1B` and `IndicTrans2-en-Indic-1B` in `venv-indic` (Python 3.10) for on-prem air-gapped deployments.

#### Provenance Data Schema
Every translation record is permanently stored in Turso Cloud (`translations_cache`):
```sql
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
    created_at TEXT NOT NULL,
    FOREIGN KEY (chunk_id) REFERENCES document_chunks(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_trans_hash_lang ON translations_cache(source_text_hash, target_language);
```

---

### 3. Multilingual Search & Cross-Lingual Retrieval

A visitor may formulate an inquiry in Hindi or Marathi, while the primary archival source is composed in English or Marathi. The system reuses the existing Phase 6 hybrid search architecture without fragmenting indices.

#### Processing Pipeline:
```
User Query (e.g. "संविधान सभा")
  │
  ▼
Language Detection (Script analysis & Devanagari morphological markers)
  │── Detected: "hi" (Hindi)
  ▼
Cross-Lingual Normalization & Translation
  │── Translated Query: "Constituent Assembly"
  │── Effective Queries: ["संविधान सभा", "Constituent Assembly"]
  ▼
Dual-Branch Retrieval:
  ├── Branch A: FTS5 Lexical Search (BM25 on fts_chunks)
  │     Runs on original and translated query
  └── Branch B: Qwen3 Multilingual Vector Search (DiskANN Cosine)
        Embeds queries into 1024-dim shared vector space
  ▼
Reciprocal Rank Fusion (RRF k=60)
  │── rrf_score = sum(1 / (60 + rank_i))
  ▼
Metadata Filtering (SQL WHERE on collection, date range, object_type)
  ▼
Cross-Encoder Reranking (Qwen3-Reranker-0.6B)
  │── Re-scores candidate passages against query
  ▼
Enriched Results with Viewer Deep-Links & Translation Telemetry
```

---

### 4. Multilingual Document Viewer

In accordance with Phase 9 requirements, the document viewer provides four tabbed representations:
1. **`ORIGINAL`**: High-resolution IIIF SVG/Canvas representation of the printed scan with interactive coordinate bounding boxes.
2. **`OCR TEXT`**: Verbatim extracted text blocks from PaddleOCR PP-OCRv5.
3. **`TRANSLATION`**: Derivative Devanagari translation with persistent caching and language toggle (`EN` | `HI` | `MR`).
4. **`AUDIO`**: AI narration player with speed control and explicit `AI_NARRATION` tag.

**Page Position Invariance Rule**:
When a researcher navigates to Page 37 in English and switches to Hindi, the viewer remains anchored precisely to Page 37, seamlessly fetching or rendering the Page 37 derivative translation without altering scroll offset or folio index.

---

### 5. Language-Aware Knowledge Graph & Timeline

1. **Language-Neutral Canonical Identifiers**:
   - Entities use canonical ASCII slugs: `person-ambedkar`, `concept-constitutional-morality`, `event-mahad`.
   - Events use date-structured IDs: `event-1927-mahad-water`, `event-1956-dhamma-conversion`.
   - Prevents graph graph duplication where "Democracy", "लोकतंत्र", and "लोकशाही" would erroneously create three disconnected nodes.
2. **Localized Presentation Tables**:
   - `entity_localizations`: Maps `(entity_id, language)` to `(localized_name, localized_description)`.
   - `timeline_localizations`: Maps `(event_id, language)` to `(localized_title, localized_description)`.
   - The UI displays localized strings based on visitor preference while Cytoscape/Sigma.js graph edges remain grounded in canonical relationships.
