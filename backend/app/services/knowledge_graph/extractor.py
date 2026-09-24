"""
Phase 8: Entity & Relationship Extraction Pipeline
Extracts candidate entities and relationships from archival text chunks using Groq LPU (qwen/qwen3.8-27b).
Extracted items enter the system strictly as CANDIDATE records with source provenance.
"""
from __future__ import annotations

import json
import logging
import uuid
from typing import Any
import httpx

from app.core.config import settings
from app.db.database import DatabaseClient
from app.services.knowledge_graph.models import (
    EntityType,
    RelationshipPredicate,
    VerificationStatus,
)
from app.services.knowledge_graph.resolution import EntityResolutionEngine

logger = logging.getLogger("ambedkar.kg.extractor")

EXTRACTION_SYSTEM_PROMPT = """You are an archival Named Entity and Relationship Extraction engine for the Dr. B.R. Ambedkar Heritage Archive.
Analyze the provided archival text chunk and extract historical entities and relationships.

Extract only factual, explicitly mentioned entities in these categories:
- PEOPLE (historical figures, authors, leaders)
- ORGANIZATIONS (committees, parties, institutions, universities)
- PLACES (cities, countries, venues)
- WORKS (books, papers, speeches, bills)
- EVENTS (satyagrahas, pacts, conferences)
- CONCEPTS (core doctrines: democracy, caste, endosmosis, fraternity, state socialism)

For relationships, identify subject-predicate-object triples with exact supporting verbatim evidence from the text.
Use predicates: AUTHORED, DELIVERED, PARTICIPATED_IN, MEMBER_OF, MENTIONED, DISCUSSED, ARGUED, RESPONDED_TO, RELATED_TO, OCCURRED_AT, REFERENCES.

Respond ONLY with valid JSON in this exact structure:
{
  "entities": [
    {"name": "...", "type": "PERSON|ORGANIZATION|PLACE|WORK|EVENT|CONCEPT", "description": "...", "date": "optional"}
  ],
  "relationships": [
    {"subject": "...", "predicate": "...", "object": "...", "evidence": "verbatim text excerpt"}
  ]
}
"""


class EntityExtractorPipeline:
    """Pipelines archival text chunks through Groq to generate candidate graph records."""

    def __init__(self, db: DatabaseClient) -> None:
        self.db = db
        self.resolver = EntityResolutionEngine(db)

    async def extract_from_chunk(
        self,
        chunk_id: str,
        text: str,
        document_id: str,
        page_number: int,
    ) -> dict[str, Any]:
        """Process a single document chunk through extraction and resolution."""
        if not settings.groq_api_key or len(text.strip()) < 80:
            return {"entities": [], "relationships": []}

        prompt = f"DOCUMENT ID: {document_id}\nPAGE NUMBER: {page_number}\n\nTEXT CHUNK:\n{text[:1800]}\n"

        extracted_data = await self._call_groq_extractor(prompt)
        if not extracted_data:
            return {"entities": [], "relationships": []}

        candidate_entities = []
        name_to_id = {}

        # 1. Process and resolve entities
        for ent in extracted_data.get("entities", []):
            name = ent.get("name", "").strip()
            etype = ent.get("type", "CONCEPT").upper()
            if not name or len(name) < 2:
                continue

            # Resolve against existing canonical entities
            res_match = await self.resolver.resolve_mention(
                mention=name,
                entity_type=etype,
                source_chunk_id=chunk_id,
            )

            if res_match["status"] == "EXACT":
                ent_id = res_match["entity_id"]
                name_to_id[name.lower()] = ent_id
            else:
                # Insert novel candidate entity
                ent_id = f"cand-{uuid.uuid4().hex[:10]}"
                await self.db.execute(
                    """
                    INSERT OR IGNORE INTO entities (
                        id, entity_type, canonical_name, description, source, status,
                        date, object_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, 'groq_extraction', 'CANDIDATE', ?, ?, datetime('now'), datetime('now'))
                    """,
                    [
                        ent_id,
                        etype if etype in EntityType.__members__ else "CONCEPT",
                        name,
                        ent.get("description"),
                        ent.get("date"),
                        document_id,
                    ],
                )
                name_to_id[name.lower()] = ent_id
                candidate_entities.append({"id": ent_id, "name": name, "type": etype})

        # 2. Process and link candidate relationships
        candidate_relationships = []
        for rel in extracted_data.get("relationships", []):
            sub_name = rel.get("subject", "").strip().lower()
            obj_name = rel.get("object", "").strip().lower()
            pred = rel.get("predicate", "RELATED_TO").upper()
            evidence = rel.get("evidence", text[:200]).strip()

            sub_id = name_to_id.get(sub_name)
            obj_id = name_to_id.get(obj_name)

            if sub_id and obj_id and sub_id != obj_id:
                rel_id = f"rel-{uuid.uuid4().hex[:12]}"
                await self.db.execute(
                    """
                    INSERT INTO relationships (
                        id, subject_type, subject_id, predicate, object_type, object_id,
                        evidence_chunk_id, confidence, source, source_document_id,
                        source_page_id, evidence_text, extraction_method, created_by, status,
                        created_at
                    ) VALUES (?, 'ENTITY', ?, ?, 'ENTITY', ?, ?, 0.85, 'groq_extraction', ?, ?, ?, 'groq_qwen_27b', 'ai_pipeline', 'CANDIDATE', datetime('now'))
                    """,
                    [
                        rel_id,
                        sub_id,
                        pred if pred in RelationshipPredicate.__members__ else "RELATED_TO",
                        obj_id,
                        chunk_id,
                        document_id,
                        page_number,
                        evidence,
                    ],
                )
                candidate_relationships.append({"id": rel_id, "subject": sub_id, "predicate": pred, "object": obj_id})

        return {
            "entities": candidate_entities,
            "relationships": candidate_relationships,
        }

    async def _call_groq_extractor(self, prompt: str) -> dict[str, Any] | None:
        """Call Groq Qwen chat endpoint to produce structured entity/relation JSON."""
        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.groq_model,
            "messages": [
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.1,
            "max_tokens": 1024,
            "response_format": {"type": "json_object"},
        }
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    raw = data["choices"][0]["message"]["content"]
                    return json.loads(raw)
                else:
                    logger.warning("Groq extraction HTTP %s: %s", resp.status_code, resp.text[:100])
        except Exception as exc:
            logger.warning("Groq extraction failed: %s", exc)
        return None
