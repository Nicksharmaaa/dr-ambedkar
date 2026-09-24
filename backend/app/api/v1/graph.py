"""
Phase 8: Knowledge Graph API Endpoints
Authoritative evidence-grounded graph exploration, neighbor expansion,
and signature 'Why Are These Connected?' explainability.
"""
from __future__ import annotations

import logging
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, Query, Path

from app.db.database import get_db_client
from app.services.knowledge_graph.graph_service import KnowledgeGraphService
from app.services.knowledge_graph.models import (
    EntityItem,
    GraphNeighborhood,
    WhyConnectedResponse,
)

logger = logging.getLogger("ambedkar.api.graph")
router = APIRouter(prefix="/graph", tags=["knowledge-graph"])


@router.get("/entities/{id}", response_model=EntityItem)
async def get_entity_by_id(
    id: str = Path(..., description="Unique entity ID (e.g. person-ambedkar, work-annihilation)"),
) -> EntityItem:
    """Fetch entity details, aliases, and provenance metadata."""
    db = get_db_client()
    service = KnowledgeGraphService(db)
    entity = await service.get_entity(id)
    if not entity:
        raise HTTPException(status_code=404, detail=f"Entity not found: {id}")
    return entity


@router.get("/entities/{id}/neighbors", response_model=GraphNeighborhood)
async def get_entity_neighbors(
    id: str = Path(..., description="Root entity ID"),
    depth: int = Query(1, ge=1, le=2, description="Neighborhood traversal depth (1 or 2)"),
    limit: int = Query(40, ge=1, le=100, description="Maximum edges to return"),
) -> GraphNeighborhood:
    """
    Progressive Graph Expansion:
    Returns immediate sub-graph around a node formatted specifically for Cytoscape.js.
    Avoids sending large monoliths to frontend.
    """
    db = get_db_client()
    service = KnowledgeGraphService(db)
    neighborhood = await service.get_neighborhood(entity_id=id, depth=depth, limit_edges=limit)
    if neighborhood.total_nodes == 0:
        raise HTTPException(status_code=404, detail=f"Entity not found: {id}")
    return neighborhood


@router.get("/search")
async def search_graph(
    q: str = Query(..., min_length=1, description="Search term for entities or aliases"),
    entity_type: Optional[str] = Query(None, description="Optional entity type filter (PERSON, WORK, CONCEPT, etc.)"),
    limit: int = Query(20, ge=1, le=50, description="Max results"),
) -> dict[str, Any]:
    """Search knowledge graph entities by canonical name or alias variations."""
    db = get_db_client()
    service = KnowledgeGraphService(db)
    results = await service.search_graph(query=q, entity_type=entity_type, limit=limit)
    return {
        "query": q,
        "total": len(results),
        "entities": results,
    }


@router.get("/relationships/{id}")
async def get_relationship_by_id(
    id: str = Path(..., description="Relationship ID"),
) -> dict[str, Any]:
    """Fetch relationship record with provenance, source document, and status."""
    db = get_db_client()
    res = await db.execute(
        """
        SELECT r.*,
               s.canonical_name AS subject_name, s.entity_type AS subject_type,
               o.canonical_name AS object_name, o.entity_type AS object_type,
               ao.title AS document_title
        FROM relationships r
        JOIN entities s ON s.id = r.subject_id
        JOIN entities o ON o.id = r.object_id
        LEFT JOIN archival_objects ao ON ao.id = r.source_document_id
        WHERE r.id = ?
        LIMIT 1
        """,
        [id],
    )
    if not res.rows:
        raise HTTPException(status_code=404, detail=f"Relationship not found: {id}")
    return dict(res.rows[0])


@router.get("/relationships/{id}/evidence")
async def get_relationship_evidence(
    id: str = Path(..., description="Relationship ID"),
) -> dict[str, Any]:
    """Fetch verified evidence excerpts and citations supporting this relationship."""
    db = get_db_client()
    res = await db.execute(
        """
        SELECT re.*, ao.title as document_title
        FROM relationship_evidence re
        LEFT JOIN archival_objects ao ON ao.id = re.document_id
        WHERE re.relationship_id = ?
        ORDER BY re.confidence DESC
        """,
        [id],
    )
    return {
        "relationship_id": id,
        "evidence_count": len(res.rows),
        "evidence": [dict(r) for r in res.rows],
    }


@router.get("/why-connected", response_model=WhyConnectedResponse)
async def why_are_these_connected(
    source_id: str = Query(..., description="Source entity ID (e.g. person-ambedkar)"),
    target_id: str = Query(..., description="Target entity ID (e.g. concept-constitutional-morality)"),
) -> WhyConnectedResponse:
    """
    Signature Phase 8 Explainability Feature:
    Answers 'Why Are These Connected?' with exact archival excerpts, document references,
    page numbers, and deep-links to the archival viewer.
    Zero hallucination policy: explains only via verified archival evidence.
    """
    db = get_db_client()
    service = KnowledgeGraphService(db)
    try:
        explanation = await service.why_connected(entity_a_id=source_id, entity_b_id=target_id)
        return explanation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("Error in why_connected query", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to resolve connection provenance")


# ── Curator Review / Admin Endpoints ──────────────────────────────────────────

@router.post("/entities/{id}/verify")
async def verify_entity(
    id: str = Path(..., description="Entity ID to verify"),
) -> dict[str, Any]:
    """Curator action: Mark a candidate entity as VERIFIED."""
    db = get_db_client()
    res = await db.execute(
        "UPDATE entities SET status = 'VERIFIED', updated_at = datetime('now') WHERE id = ?",
        [id],
    )
    return {"id": id, "status": "VERIFIED", "updated": True}


@router.post("/relationships/{id}/verify")
async def verify_relationship(
    id: str = Path(..., description="Relationship ID to verify"),
) -> dict[str, Any]:
    """Curator action: Mark a candidate relationship as VERIFIED."""
    db = get_db_client()
    await db.execute(
        "UPDATE relationships SET status = 'VERIFIED' WHERE id = ?",
        [id],
    )
    return {"id": id, "status": "VERIFIED", "updated": True}


@router.post("/relationships/{id}/reject")
async def reject_relationship(
    id: str = Path(..., description="Relationship ID to reject"),
) -> dict[str, Any]:
    """Curator action: Reject an erroneous candidate relationship."""
    db = get_db_client()
    await db.execute(
        "UPDATE relationships SET status = 'REJECTED' WHERE id = ?",
        [id],
    )
    return {"id": id, "status": "REJECTED", "updated": True}
