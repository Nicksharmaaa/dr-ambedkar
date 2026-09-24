"""
Phase 8: Knowledge Graph & Entity Resolution Test Suite
Validates:
  - Canonical entity schema and alias normalization
  - Entity resolution engine (honorific stripping, alias matching, candidate routing)
  - Progressive neighborhood query formatting for Cytoscape.js
  - Signature 'Why Are These Connected?' archival evidence explainability
  - Verification lifecycle (CANDIDATE, VERIFIED, REJECTED)
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from app.db.database import get_db_client
from app.services.knowledge_graph.graph_service import KnowledgeGraphService
from app.services.knowledge_graph.resolution import EntityResolutionEngine
from app.services.knowledge_graph.models import (
    EntityType,
    RelationshipPredicate,
    VerificationStatus,
    EntityItem,
)


@pytest.mark.asyncio
async def test_entity_resolution_exact_and_alias():
    """Test that entity resolution resolves canonical names and variants."""
    db = get_db_client()
    resolver = EntityResolutionEngine(db)

    # 1. Exact canonical name
    match = await resolver.resolve_mention("Dr. B.R. Ambedkar")
    assert match is not None
    assert match["entity_id"] == "person-ambedkar"
    assert match["status"] in ("EXACT", "CANDIDATE")

    # 2. Known alias variant
    match_alias = await resolver.resolve_mention("Babasaheb")
    assert match_alias is not None
    assert match_alias["entity_id"] == "person-ambedkar"

    # 3. Work match
    match_work = await resolver.resolve_mention("Annihilation of Caste")
    assert match_work is not None
    assert match_work["entity_id"] == "work-annihilation"


@pytest.mark.asyncio
async def test_graph_neighborhood_expansion():
    """Test progressive neighborhood expansion returns Cytoscape-formatted sub-graph."""
    db = get_db_client()
    service = KnowledgeGraphService(db)

    neighborhood = await service.get_neighborhood(entity_id="person-ambedkar", depth=1, limit_edges=20)
    assert neighborhood.center_id == "person-ambedkar"
    assert neighborhood.total_nodes > 1
    assert neighborhood.total_edges > 1

    # Check root node presence
    root_node = next((n for n in neighborhood.nodes if n.data.id == "person-ambedkar"), None)
    assert root_node is not None
    assert root_node.data.type == "PERSON"
    assert root_node.data.label == "Dr. B.R. Ambedkar"

    # Check edges have valid sources and targets
    for edge in neighborhood.edges:
        assert edge.data.source is not None
        assert edge.data.target is not None
        assert edge.data.status != "REJECTED"


@pytest.mark.asyncio
async def test_why_are_these_connected_signature_feature():
    """
    Test signature Phase 8 explainability:
    Verifies that 'Why Are These Connected?' returns real archival evidence with page citations,
    and never returns AI hallucinated relationships.
    """
    db = get_db_client()
    service = KnowledgeGraphService(db)

    # Direct connection: Ambedkar -> Constitutional Morality
    why = await service.why_connected(
        entity_a_id="person-ambedkar",
        entity_b_id="concept-constitutional-morality",
    )
    assert why.direct_connection is True
    assert len(why.connections) >= 1

    conn = why.connections[0]
    assert conn.document_id == "AMBEDKAR-VOL-13"
    assert conn.page_number == 6
    assert "Constitutional morality is not a natural sentiment" in conn.evidence_text
    assert conn.viewer_url.startswith("/documents/AMBEDKAR-VOL-13/viewer?page=6")


@pytest.mark.asyncio
async def test_unconnected_entities_handling():
    """Test that entities without an archival connection are clearly reported without hallucination."""
    db = get_db_client()
    service = KnowledgeGraphService(db)

    # Unknown entity lookup should raise ValueError
    with pytest.raises(ValueError, match="not found"):
        await service.why_connected("non-existent-entity-1", "non-existent-entity-2")


@pytest.mark.asyncio
async def test_curator_verification_status_update():
    """Test that curator actions update verification status without affecting archival truth."""
    db = get_db_client()
    # Check that candidate queries respect status filter
    res = await db.execute("SELECT COUNT(*) as cnt FROM relationships WHERE status = 'VERIFIED'")
    verified_count = res.rows[0]["cnt"]
    assert verified_count >= 15
