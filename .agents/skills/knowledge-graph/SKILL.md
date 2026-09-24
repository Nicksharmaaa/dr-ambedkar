---
name: knowledge-graph
description: Extract entities and relationships from archival text. Maintain the Turso-backed knowledge graph (entities + relations tables). Visualize with Sigma.js on frontend.
---

# Knowledge Graph Skill

## Purpose
Build and maintain a structured knowledge graph from the archival corpus.

## Entity Types
- PERSON (Ambedkar, Gandhi, Nehru, Jinnah, etc.)
- PLACE (Nagpur, Bombay, Delhi, London, Columbia University, etc.)
- ORGANIZATION (Congress, Buddhist Society, Constituent Assembly, etc.)
- CONCEPT (Untouchability, Caste, Buddhism, Constitution, etc.)
- WORK (books, speeches, articles)
- EVENT (Round Table Conference, Poona Pact, Ambedkar conversion, etc.)
- DATE (significant dates)

## Relation Types
- AUTHORED
- DELIVERED_SPEECH_AT
- MEMBER_OF
- OPPOSED_BY
- INFLUENCED_BY
- OCCURRED_AT (event-place)
- PARTICIPATED_IN
- WROTE_ABOUT
- CONVERTED_TO

## Extraction Pipeline
1. Retrieve OCR text from Turso chunks
2. Run NER (Named Entity Recognition) using local model or Qwen3-VL
3. Identify entities + normalize to canonical names
4. Detect relations between entities in same context window
5. Store in Turso: entities + relations tables
6. Assign confidence score and evidence_chunk_id

## Turso Tables
- entities (id, entity_type, canonical_name, aliases, description)
- relations (source_id, target_id, relation_type, confidence, evidence_chunk_id)

## Visualization
- Frontend: Sigma.js (GPU-accelerated WebGL graph)
- Filters: by entity type, relation type, date range, source document
- Click entity → show related archive documents

## API Endpoints
GET /api/v1/graph/entities - List entities
GET /api/v1/graph/entity/{id} - Entity detail + relations
GET /api/v1/graph/subgraph - Subgraph around entity
POST /api/v1/graph/search - Search entities
