# PHASE 8 IMPLEMENTATION PLAN
## Ambedkar Heritage Intelligence & Digital Preservation System
### Knowledge Graph, Knowledge Map, Historical Timeline, and Heritage Story Engine

**Target Execution Window**: Immediate  
**Baseline Verification**: Phase 7.5 Audit Complete — Full Go Authorized  
**Authoritative Data Store**: Turso Cloud (`libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io`)  
**AI Extraction & Generation**: Groq LPU (`qwen/qwen3.8-27b`) + Qwen local retrieval (`Qwen3-Embedding-0.6B`)  
**Visualization Engine**: Cytoscape.js (WebGL / Canvas)

---

## 1. Executive Strategy & Architectural Principles

The objective of Phase 8 is to construct an evidence-grounded knowledge infrastructure on top of the 12,154 verified archival pages of Dr. B.R. Ambedkar's Writings & Speeches.

```
ARCHIVAL CORPUS (12,154 pages, 19 volumes)
       │
       ▼
Structured Document Chunks & ALTO XML
       │
       ▼
Entity & Relationship Extraction Pipeline (Groq Qwen 27B + Deterministic Rule Parsers)
       │
       ▼
Entity Resolution Engine (Aliases, Orthographic Variants, OCR Noise Normalization)
       │
       ▼
Source-Aware Relational Knowledge Graph (Turso Cloud)
       ├── Entities & Aliases
       ├── Provenance-Backed Relationships
       ├── Evidence Anchors (document_chunks, page_number, exact excerpt)
       └── Curator Verification Workflow (CANDIDATE → VERIFIED / REJECTED)
       │
       ├─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼
Intelligent Knowledge Map    Historical Timeline     Heritage Story Engine
 (Cytoscape.js Progressive)  (Precision-Aware Days)   (Archival Object Chapters)
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 ▼
                    "WHY ARE THESE CONNECTED?"
               Signature Evidence Deep-Linking to 
                    Archival Document Viewer
```

### Core Constraints & Rules:
1. **Zero Hallucination / Grounding Mandate**: No entity, relation, timeline event, or story claim exists without explicit backing citations (`document_id`, `page_number`, `chunk_id`, `evidence_text`).
2. **Authoritative Relational Core**: Turso Cloud remains the single source of truth. No external graph database (Neo4j) is introduced.
3. **Graph Exploration**: Progressive server-side neighborhood queries (depth 1–2). The frontend never downloads the full graph monolith.
4. **Curator Review Governance**: Every machine-extracted node and edge enters as `CANDIDATE` until reviewed and marked `VERIFIED` or `REJECTED`.

---

## 2. Implementation Work Breakdown Structure (WBS)

### Workstream A: Database Schema Evolution
- **Migration `004_phase8_knowledge_graph.sql`**:
  - `entities`: Polymorphic master entity registry (PERSON, WORK, BOOK, SPEECH, MANUSCRIPT, DOCUMENT, PAGE, CONSTITUENT_ASSEMBLY_DEBATE, EVENT, PLACE, ORGANIZATION, TOPIC, CONCEPT, PHOTOGRAPH, AUDIO, VIDEO, COLLECTION, SOURCE).
  - `entity_aliases`: Alias normalization dictionary for entity resolution.
  - `entity_reviews`: Archivist audit trail and review decisions.
  - `relationships`: Enhanced provenance-first edge table with `source_document_id`, `source_page_id`, `source_chunk_id`, `evidence_text`, `extraction_method`, and `status`.
  - `timeline_events`: Chronological history with precision metadata (`DAY`, `MONTH`, `YEAR`, `RANGE`, `APPROXIMATE`, `UNKNOWN`) and configurable taxonomies (`PERSONAL`, `EDUCATION`, `SOCIAL_REFORM`, `POLITICAL`, `CONSTITUTIONAL`, `ECONOMIC`, `ACADEMIC`, `WRITINGS`, `SPEECHES`, `MOVEMENTS`, `INSTITUTIONS`, `LEGACY`).
  - `story_collections` & `story_items`: Curated historical narratives structured into multimedia chapters linked to primary source pages.
  - Comprehensive B-Tree indexing on `(entity_type, status)`, `(subject_id, predicate)`, `(object_id)`, and `(start_date)`.

### Workstream B: Backend Knowledge Graph & Provenance Services
- `backend/app/services/knowledge_graph/`:
  - `models.py`: Pydantic models & enums for entity types, relation predicates, date precisions, and statuses.
  - `extractor.py`: Hybrid extraction engine (pattern-based canonical dictionary matcher + Groq LPU `qwen/qwen3.8-27b` candidate extractor).
  - `resolution.py`: Entity resolution service detecting duplicate variants (e.g., "Dr. B.R. Ambedkar", "B. R. Ambedkar", "Bhimrao Ramji Ambedkar").
  - `graph_service.py`: Server-side graph traverser, neighborhood generator, progressive expander, and the signature `why_connected(id_a, id_b)` solver.
- `backend/app/services/timeline/`:
  - `service.py`: Timeline retrieval, date filtering, category filtering, search, and document linkage.
- `backend/app/services/story/`:
  - `service.py`: Narrative engine retrieving approved story collections, chapter progression, and RAG contextual integration.

### Workstream C: API Contracts & Routing
- `backend/app/api/v1/graph.py`:
  - `GET /api/v1/graph/entities/{id}`
  - `GET /api/v1/graph/entities/{id}/neighbors`
  - `GET /api/v1/graph/search`
  - `GET /api/v1/graph/relationships/{id}`
  - `GET /api/v1/graph/why-connected`
- `backend/app/api/v1/timeline.py`:
  - `GET /api/v1/timeline`
  - `GET /api/v1/timeline/events/{id}`
  - `GET /api/v1/timeline/search`
- `backend/app/api/v1/stories.py`:
  - `GET /api/v1/stories`
  - `GET /api/v1/stories/{id}`
- `backend/app/api/v1/admin.py`:
  - `POST /api/v1/admin/entities/{id}/verify`
  - `POST /api/v1/admin/entities/{id}/reject`
  - `POST /api/v1/admin/relationships/{id}/verify`
  - `POST /api/v1/admin/relationships/{id}/reject`

### Workstream D: Corpus Extraction & Seed Graph Population
- Ingest and verify canonical knowledge graph entities from the core archival corpus:
  - Key Figures: Dr. B.R. Ambedkar, Mahatma Gandhi, John Dewey, Jawaharlal Nehru, Lord Linlithgow, Periyar E.V. Ramasamy, etc.
  - Key Works & Speeches: *Annihilation of Caste* (1936), *Castes in India* (1916), *The Problem of the Rupee* (1923), *Who Were the Shudras?* (1946), *States and Minorities* (1947), *The Buddha and His Dhamma* (1957), Constituent Assembly Speeches (1946–1949).
  - Key Historical Events: Mahad Satyagraha (1927), Kalaram Temple Satyagraha (1930), Round Table Conferences (1930–1932), Poona Pact (1932), Nagpur Buddhist Conversion (1956).
  - Key Institutions & Organizations: Bahishkrit Hitakarini Sabha, Independent Labour Party, Scheduled Castes Federation, Drafting Committee of the Constituent Assembly, People's Education Society, Reserve Bank of India, Columbia University, London School of Economics.
  - Core Theoretical Concepts: Social Endosmosis, State Socialism, Constitutional Morality, Annihilation of Caste, Liberty-Equality-Fraternity Union of Trinity, Dhamma vs Religion.
- Link every single entity and relationship to exact verified chunk IDs from `document_chunks`.

### Workstream E: Frontend Experience & Cytoscape.js Integration
- `/knowledge-map`:
  - Cytoscape.js canvas with dark-mode aesthetic, node physics, categorical coloring, and progressive click-to-expand.
  - Interactive "Why Are These Connected?" drawer displaying verified archival excerpts with instant viewer deep-links (`/documents/[id]/viewer?page=[num]`).
  - Search node autocomplete and category filtering.
  - "Ask Archive about this entity" integration.
- `/timeline`:
  - Interactive chronological scrubber, category filters, and zoom controls.
  - Event cards featuring exact dates, location, historical significance, and source document links.
- `/stories`:
  - Heritage Storytelling experience ("Ambedkar & The Making of the Constitution", "The Mahad Satyagraha & Water Rights", "Monetary Theory & The Birth of RBI").
  - Multi-chapter flow with primary document viewer embedding and interactive map context.

### Workstream F: Verification & Testing
- Unit tests for resolution, provenance, timeline filters, and graph neighbors.
- Performance tests for graph queries (<50ms).
- End-to-end user experience audit.

---

## 3. Execution Schedule & Milestones

1. **Step 1**: Apply database migration `004_phase8_knowledge_graph.sql` to Turso Cloud.
2. **Step 2**: Implement Python backend services (`knowledge_graph`, `timeline`, `story`) and data schemas.
3. **Step 3**: Populate canonical verified knowledge graph and timeline events from Ambedkar corpus with exact chunk citations.
4. **Step 4**: Implement FastAPI routes and mount them in `app/main.py`.
5. **Step 5**: Implement Next.js frontend pages (`/knowledge-map`, `/timeline`, `/stories`).
6. **Step 6**: Execute test suite (`backend/tests/test_phase8_*.py`) and benchmark latency.
7. **Step 7**: Compile required documentation and `PHASE_8_COMPLETION_REPORT.md`.
