"""
Phase 8: Entity Resolution Engine
Resolves orthographic, honorific, and OCR variations to canonical entities.
Adheres strictly to the rule: DO NOT automatically merge ambiguous entities.
Ambiguous matches are routed to CANDIDATE state and recorded for curator review.
"""
from __future__ import annotations

import re
import uuid
import logging
from typing import Any
from app.db.database import DatabaseClient
from app.services.knowledge_graph.models import VerificationStatus

logger = logging.getLogger("ambedkar.kg.resolution")

HONORIFICS = [
    r"^dr\.?\s+",
    r"^doctor\s+",
    r"^prof\.?\s+",
    r"^professor\s+",
    r"^babasaheb\s+",
    r"^shri\s+",
    r"^mr\.?\s+",
    r"^mrs\.?\s+",
    r"^miss\s+",
    r"^sir\s+",
    r"^lord\s+",
    r"^rev\.?\s+",
    r"^mahatma\s+",
    r"^pandit\s+",
]

PUNCT_RE = re.compile(r"[^\w\s]")


def normalize_mention(text: str) -> str:
    """Normalize text mention for comparison by stripping honorifics and punctuation."""
    norm = text.strip()
    for h in HONORIFICS:
        norm = re.sub(h, "", norm, flags=re.IGNORECASE).strip()
    norm = PUNCT_RE.sub(" ", norm)
    norm = re.sub(r"\s+", " ", norm).strip().lower()
    return norm


def token_similarity(a: str, b: str) -> float:
    """Calculate token Jaccard similarity between two strings."""
    tokens_a = set(a.split())
    tokens_b = set(b.split())
    if not tokens_a or not tokens_b:
        return 0.0
    inter = len(tokens_a & tokens_b)
    union = len(tokens_a | tokens_b)
    return inter / union


class EntityResolutionEngine:
    """Manages alias resolution, duplicate detection, and curator review queues."""

    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def resolve_mention(
        self,
        mention: str,
        entity_type: str | None = None,
        source_chunk_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Attempt to resolve a mention to an existing canonical entity.
        Returns match status:
        - 'EXACT': perfect alias or canonical match (VERIFIED)
        - 'CANDIDATE': high token similarity, requires curator review
        - 'NEW': novel entity candidate
        """
        clean_norm = normalize_mention(mention)
        if not clean_norm:
            return {"status": "REJECTED", "entity_id": None, "confidence": 0.0}

        # 1. Check exact canonical match
        query = "SELECT id, canonical_name, entity_type, status FROM entities WHERE lower(canonical_name) = ?"
        params: list[Any] = [mention.strip().lower()]
        if entity_type:
            query += " AND entity_type = ?"
            params.append(entity_type)

        res = await self.db.execute(query, params)
        if res.rows:
            row = res.rows[0]
            return {
                "status": "EXACT",
                "entity_id": row["id"],
                "canonical_name": row["canonical_name"],
                "entity_type": row["entity_type"],
                "confidence": 1.0,
            }

        # 2. Check exact alias match
        alias_res = await self.db.execute(
            """
            SELECT e.id, e.canonical_name, e.entity_type, a.confidence
            FROM entity_aliases a
            JOIN entities e ON e.id = a.entity_id
            WHERE lower(a.alias) = ?
            LIMIT 1
            """,
            [mention.strip().lower()],
        )
        if alias_res.rows:
            row = alias_res.rows[0]
            return {
                "status": "EXACT",
                "entity_id": row["id"],
                "canonical_name": row["canonical_name"],
                "entity_type": row["entity_type"],
                "confidence": row.get("confidence", 1.0),
            }

        # 3. Fuzzy search for potential duplicates among existing entities
        all_res = await self.db.execute("SELECT id, canonical_name, entity_type FROM entities")
        best_match = None
        best_sim = 0.0

        for r in all_res.rows:
            c_norm = normalize_mention(r["canonical_name"])
            sim = token_similarity(clean_norm, c_norm)
            if sim > best_sim:
                best_sim = sim
                best_match = r

        if best_match and best_sim >= 0.70:
            # High similarity, but ambiguous -> Route to curator review as CANDIDATE
            review_id = str(uuid.uuid4())
            await self.db.execute(
                """
                INSERT INTO entity_reviews (id, entity_id, original_mention, suggested_entity_id, reviewer, action, status, supporting_chunk_id, review_notes)
                VALUES (?, ?, ?, ?, 'system_resolver', 'REVIEW', 'PENDING', ?, ?)
                """,
                [
                    review_id,
                    best_match["id"],
                    mention,
                    best_match["id"],
                    source_chunk_id,
                    f"Fuzzy candidate match (similarity: {best_sim:.2f}) with canonical name '{best_match['canonical_name']}'",
                ],
            )
            return {
                "status": "CANDIDATE",
                "entity_id": best_match["id"],
                "canonical_name": best_match["canonical_name"],
                "entity_type": best_match["entity_type"],
                "confidence": round(best_sim, 2),
                "review_id": review_id,
            }

        return {
            "status": "NEW",
            "entity_id": None,
            "canonical_name": mention.strip(),
            "confidence": 0.0,
        }

    async def add_alias(
        self,
        entity_id: str,
        alias: str,
        alias_type: str = "variant",
        confidence: float = 1.0,
    ) -> None:
        """Register a verified alias for an entity."""
        alias_id = str(uuid.uuid4())
        await self.db.execute(
            """
            INSERT OR IGNORE INTO entity_aliases (id, entity_id, alias, alias_type, confidence)
            VALUES (?, ?, ?, ?, ?)
            """,
            [alias_id, entity_id, alias.strip(), alias_type, confidence],
        )
