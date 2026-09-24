# Relationship Provenance & Evidence Verification — Phase 8

## 1. Provenance Triples Architecture
In the Ambedkar Heritage Platform, graph relationships are never abstract connections. Every approved edge adheres to a formal provenance specification:

```
[ Subject Entity ] ── ( Predicate ) ──> [ Object Entity ]
        │
        ├── source_document_id : Primary archival object (e.g. AMBEDKAR-VOL-13)
        ├── source_page_id     : Physical printed page number (e.g. 6)
        ├── source_chunk_id    : Specific chunk UUID (e.g. 60bd3e9f-9337-4789-8722-9e8705c86c43)
        ├── evidence_text      : Verbatim quote from primary text
        ├── extraction_method  : Method of discovery (manual_seed | groq_qwen3)
        ├── created_by         : Creator tag (archivist | ai_pipeline)
        └── status             : CANDIDATE | VERIFIED | REJECTED
```

---

## 2. Approved Relationship Predicates
| Predicate | Typical Subject Type | Typical Object Type | Archival Example |
|---|---|---|---|
| `AUTHORED` | `PERSON` | `WORK` | Ambedkar authored *Annihilation of Caste* |
| `DELIVERED` | `PERSON` | `SPEECH` | Ambedkar delivered *Round Table Conference Speech* |
| `PARTICIPATED_IN` | `PERSON` | `EVENT` | Ambedkar participated in *Mahad Satyagraha* |
| `MEMBER_OF` | `PERSON` | `ORGANIZATION` | Ambedkar was member of *Drafting Committee* |
| `MENTIONED` | `WORK` / `SPEECH` | `PERSON` | *Annihilation of Caste* mentions *Prof. John Dewey* |
| `DISCUSSED` | `WORK` / `SPEECH` | `CONCEPT` | *Constituent Assembly Speech* discusses *Constitutional Morality* |
| `ARGUED` | `PERSON` | `CONCEPT` | Ambedkar argued *State Socialism in States and Minorities* |
| `RESPONDED_TO` | `PERSON` / `WORK` | `PERSON` / `WORK` | *Annihilation of Caste* responds to *M.K. Gandhi* |
| `OCCURRED_AT` | `EVENT` | `PLACE` | *Mahad Satyagraha* occurred at *Mahad, Kolaba District* |
| `SUPPORTS` | `WORK` | `CONCEPT` | *States and Minorities* supports *State Socialism* |

---

## 3. Evidence Deep-Linking Specification
Every relationship response provides an instant viewer URL formatted as:
```
/documents/{source_document_id}/viewer?page={source_page_id}&chunk={evidence_chunk_id}
```
When clicked by a researcher or visitor:
1. The archival viewer opens the exact volume PDF/SVG.
2. The viewer navigates automatically to the designated physical page.
3. The bounding box or text snippet of the evidence chunk is highlighted on screen.

---

## 4. Verification Workflow
1. **Candidate Ingestion**: When candidate triples are extracted via AI (Groq `qwen/qwen3.8-27b`), they enter as `CANDIDATE`.
2. **Archivist Audit**: The archivist navigates to `/admin` or reviews candidates via `/api/v1/admin/relationships/{id}/verify`.
3. **Status Transitions**:
   - `VERIFY`: Updates status to `VERIFIED`. The relationship becomes immediately discoverable in the public Knowledge Map.
   - `REJECT`: Updates status to `REJECTED`. The relationship is hidden from public views while maintaining the audit record in `entity_reviews`.
