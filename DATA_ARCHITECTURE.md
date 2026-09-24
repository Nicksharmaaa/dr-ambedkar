# DATA ARCHITECTURE
## Ambedkar Heritage Intelligence & Digital Preservation System

**Version**: 1.0.0
**Date**: 2026-09-22

---

## 1. Data Layers

```
┌────────────────────────────────────────────────────────────────────┐
│                      DATA ARCHITECTURE                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Layer 1: ORIGINAL ARCHIVE                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ storage/local/originals/ — IMMUTABLE                         │  │
│  │ Raw PDFs, scans, audio, video, photographs                    │  │
│  │ SHA-256 verified at ingest; never modified                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓ OCR + Structure                      │
│  Layer 2: PROCESSED DERIVATIVES                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ storage/local/derivatives/ — Reproducible from Layer 1       │  │
│  │ Searchable PDFs, thumbnails, ALTO XML, normalized images      │  │
│  │ storage/local/iiif-tiles/ — Image pyramid for deep zoom       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓ Chunking + Embedding                 │
│  Layer 3: STRUCTURED DATA (Turso/libSQL)                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Collections, Objects, Pages, OCR text                         │  │
│  │ Chunks (512 tokens), FTS5 index, Vector embeddings            │  │
│  │ Metadata (Dublin Core, PREMIS), IIIF Manifests               │  │
│  │ Knowledge graph (entities + relations)                        │  │
│  │ Timeline events                                               │  │
│  │ Users, audit log, processing jobs                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓ RAG                                  │
│  Layer 4: AI-GENERATED KNOWLEDGE                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Grounded answers (citations required)                         │  │
│  │ Entity summaries (sourced from archive)                       │  │
│  │ Translation outputs (stored in Turso)                         │  │
│  │ Transcript outputs (stored in Turso)                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flows

### Ingest Flow
```
Upload → Validate → Stage → Hash → Store Original
    → OCR → Structure → ALTO XML
    → Text extraction → Chunk → Embed → Store in Turso
    → Generate IIIF tiles
    → Extract entities → Update knowledge graph
    → Log preservation event
```

### Query Flow
```
User query → Language detect → Translate if needed
    → Embed query (Qwen3-0.6B) → Turso vector_top_k()
    → FTS5 MATCH → Merge (RRF) → Rerank (Qwen3-0.6B)
    → Assemble evidence → Ground generation
    → Return: answer + citations + source links
```

### Kiosk Sync Flow
```
Online mode: query main Turso Cloud DB
Offline sync: pull subset to local SQLite file
              download selected documents to local storage
Offline mode: query local SQLite file (kiosk subset)
```

---

## 3. Corpus Planning

### Estimated Corpus Sizes

| Scenario | Objects | Pages | Chunks | Embeddings | Storage |
|---|---|---|---|---|---|
| Minimal demo | 10 | 500 | 5,000 | 5,000 | ~50 MB |
| Hackathon | 100 | 5,000 | 50,000 | 50,000 | ~500 MB |
| Institutional | 1,000 | 100,000 | 1,000,000 | 1,000,000 | ~5 GB |

### Vector Storage Requirements (Turso)
```
Dimension: 1024
Bytes per vector: 1024 × 4 bytes = 4 KB
50,000 vectors (hackathon): 200 MB — COMFORTABLE in Turso
1,000,000 vectors (institutional): 4 GB — DiskANN handles this
```

---

## 4. Data Policies

### Source of Truth
- **Original files** are the ground truth
- **OCR text** is derived; confidence-scored
- **AI responses** are derived from archive evidence only; never from model memory

### What NEVER Goes in the Database
- Large binary files (PDFs, audio, video) → object storage only
- Raw pixel data → object storage only
- Model weights → `models/cache/` only

### What Turso Stores
Everything listed in the DATABASE_ARCHITECTURE.md schema:
- Collections, objects, pages, OCR, chunks, embeddings
- Knowledge graph, timeline, preservation events, audit logs
- Users, roles, jobs

### Fabrication Prevention
All AI-generated text must:
1. Be generated from retrieved chunks only
2. Include `source_chunk_ids` in the response
3. Include `object_id` and `page_number` citations
4. State "insufficient evidence" rather than fabricate

---

## 5. Metadata Standards

### Per Object: Dublin Core Minimum
```json
{
  "dc:title": "The Annihilation of Caste",
  "dc:creator": ["B.R. Ambedkar"],
  "dc:date": "1936",
  "dc:language": ["en"],
  "dc:type": "Text",
  "dc:format": "application/pdf",
  "dc:rights": "Public Domain",
  "dc:source": "Provided by [institution]",
  "dc:description": "..."
}
```

### Per Object: PREMIS Minimum
```json
{
  "premis:objectIdentifier": {"type": "UUID", "value": "..."},
  "premis:objectCharacteristics": {
    "premis:fixity": {"messageDigestAlgorithm": "SHA-256", "messageDigest": "..."},
    "premis:size": 12345678,
    "premis:format": {"premis:formatName": "PDF", "premis:formatVersion": "1.7"}
  }
}
```

### IIIF Manifest Structure
- Presentation API 3.0
- One manifest per archival object
- Canvases = pages
- Annotations = OCR text (W3C Web Annotation)
- Audio/video manifests for media objects
