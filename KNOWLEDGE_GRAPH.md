# Knowledge Graph Architecture — Phase 8

## 1. Overview & Architectural Philosophy
The Ambedkar Heritage Knowledge Graph provides an evidence-backed, source-grounded graph exploration layer on top of the archival corpus of Babasaheb Dr. B.R. Ambedkar.

### Core Architectural Principle
```
ARCHIVAL CORPUS (12,154 Chunks across 19 Volumes)
         ↓
Structured Metadata & Entities
         ↓
Candidate Relationships (LLM extraction via Groq LPU)
         ↓
Verifiable Grounding & Citation Mapping
         ↓
Curator Verification (CANDIDATE → VERIFIED / REJECTED)
         ↓
Authoritative Relational Graph (Turso Cloud)
         ↓
Interactive Knowledge Map & Sub-Graph Exploration (Cytoscape.js)
```

**Zero Hallucination Tolerance:** The graph is NOT a speculative AI representation. Every approved node and edge is linked to an authoritative primary source (`document_id`, `page_number`, `chunk_id`, and exact verbatim `evidence_text`).

---

## 2. Relational Database Foundation (No Neo4j)
Per Phase 7.5 audit recommendations, Turso Cloud (SQLite/libSQL over HTTP) provides authoritative storage. Sub-20ms relational index lookups on `(subject_type, subject_id)` and `(object_type, object_id)` eliminate the complexity and operational overhead of dedicated graph databases while guaranteeing ACID compliance and zero external data drift.

---

## 3. Entity Classification (18 Supported Types)
| Entity Type | Description | Color Token | Example Canonical Entities |
|---|---|---|---|
| `PERSON` | Historical leaders, scholars, mentors | Amber (`#F59E0B`) | Dr. B.R. Ambedkar, Prof. John Dewey, Frank Sly |
| `WORK` | Monographs, scholarly treatises | Blue (`#3B82F6`) | Annihilation of Caste, The Problem of the Rupee |
| `BOOK` | Published volumes | Blue (`#3B82F6`) | BAWS Vol 1–17 |
| `SPEECH` | Historic addresses and lectures | Cyan (`#06B6D4`) | Annihilation of Caste, Constituent Assembly Address |
| `CONSTITUENT_ASSEMBLY_DEBATE` | Parliamentary drafting interventions | Orange (`#F97316`) | CAD 4 Nov 1948, CAD 25 Nov 1949 |
| `EVENT` | Historical milestones, satyagrahas | Emerald (`#10B981`) | Mahad Satyagraha 1927, Nagpur Dhamma Diksha 1956 |
| `CONCEPT` | Core philosophical and legal doctrines | Purple (`#8B5CF6`) | Social Endosmosis, Constitutional Morality |
| `PLACE` | Cities, institutions, movement venues | Pink (`#EC4899`) | Mhow, London, Bombay, Nagpur, Columbia University |
| `ORGANIZATION` | Parties, committees, universities | Teal (`#14B8A6`) | Drafting Committee, Columbia University, LSE |
| `TOPIC` | Subject classification keywords | Violet (`#A855F7`) | Endogamy, Monetary Standards, Minorities |

---

## 4. Progressive Neighborhood Traversal
To eliminate massive browser payload bottlenecks:
- The server computes sub-graph neighborhoods on demand via `GET /api/v1/graph/entities/{id}/neighbors`.
- Payloads are restricted to `depth=1` or `depth=2` with edge limits (`default=40`).
- Payloads average **8.39 KB** (sub-80ms latency), rendering smoothly on desktop and mobile devices.

---

## 5. Signature Feature: "Why Are These Connected?"
When any two nodes are selected (e.g. *Dr. B.R. Ambedkar* and *Constitutional Morality*), the system traverses the relational evidence graph and presents:
1. **Connection Type**: Direct Archival Triple (1-hop) or Mediated Historical Path (2-hop).
2. **Archival Excerpt**: Verbatim text passage from the verified chunk.
3. **Primary Citation**: Volume number, Document ID, and exact Page Number.
4. **Deep Links**: Direct navigation to `/documents/{id}/viewer?page={n}` and `/assistant?q=...`.
