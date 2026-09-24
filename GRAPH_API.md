# Knowledge Graph, Timeline & Stories API Reference — Phase 8

## Base URL
All endpoints are versioned under:
```
http://127.0.0.1:8000/api/v1
```

---

## 1. Knowledge Graph Endpoints

### `GET /graph/entities/{id}`
Fetch detailed entity record, canonical name, aliases, external identifiers, and metadata.
- **Parameters**: `id` (e.g. `person-ambedkar`, `work-annihilation`, `concept-constitutional-morality`)
- **Response**: `EntityItem`

### `GET /graph/entities/{id}/neighbors`
Progressive expansion endpoint returning a sub-graph formatted specifically for Cytoscape.js.
- **Parameters**:
  - `depth`: integer (`1` or `2`, default `1`)
  - `limit`: integer (default `40`, max `100`)
- **Response**:
```json
{
  "center_id": "person-ambedkar",
  "nodes": [
    {
      "data": {
        "id": "person-ambedkar",
        "label": "Dr. B.R. Ambedkar",
        "type": "PERSON",
        "description": "...",
        "status": "VERIFIED",
        "degree": 10
      }
    }
  ],
  "edges": [
    {
      "data": {
        "id": "rel-ambedkar-wrote-annihilation",
        "source": "person-ambedkar",
        "target": "work-annihilation",
        "label": "authored",
        "status": "VERIFIED",
        "has_evidence": true
      }
    }
  ],
  "total_nodes": 11,
  "total_edges": 10
}
```

### `GET /graph/search`
Search entities by canonical name or alias variations.
- **Parameters**:
  - `q`: search query string
  - `entity_type`: optional type filter (`PERSON`, `WORK`, `CONCEPT`, etc.)
  - `limit`: max results (default `20`)

### `GET /graph/why-connected`
Signature explainability endpoint. Returns exact archival passages explaining the connection between two entities.
- **Parameters**:
  - `source_id`: e.g. `person-ambedkar`
  - `target_id`: e.g. `concept-constitutional-morality`
- **Response**: `WhyConnectedResponse`

### `POST /graph/entities/{id}/verify`
Admin/Curator action to promote candidate entity to `VERIFIED`.

### `POST /graph/relationships/{id}/verify`
Admin/Curator action to approve candidate relationship.

### `POST /graph/relationships/{id}/reject`
Admin/Curator action to reject candidate relationship.

---

## 2. Historical Timeline Endpoints

### `GET /timeline`
Retrieve chronologically ordered events.
- **Parameters**:
  - `year_from`: integer
  - `year_to`: integer
  - `category`: string (`CONSTITUTIONAL`, `EDUCATION`, `SOCIAL_REFORM`, `POLITICAL`, etc.)
  - `limit`: integer (default `50`)
  - `offset`: integer (default `0`)

### `GET /timeline/events/{id}`
Fetch single timeline event with full evidence snippet and archival document citation.

### `GET /timeline/search`
Full-text search across historical timeline events.
- **Parameters**: `q` (query string)

### `GET /timeline/categories`
List all timeline categories with active event counts.

---

## 3. Heritage Stories Endpoints

### `GET /stories`
List all published curated heritage story collections.

### `GET /stories/{id}`
Fetch complete story collection with all sequential archival chapters, primary document citations, and highlighted excerpts.
- **Parameters**: `id` (slug or UUID, e.g. `ambedkar-and-the-constitution`)
