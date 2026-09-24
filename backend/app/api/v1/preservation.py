"""
Preservation API (PREMIS 3.0 Compliance).
Endpoints for fixity verification, PREMIS event histories, and repository preservation health.
"""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException, Query, status

from app.db.database import get_db_client
from app.services.preservation.engine import PreservationEngine

router = APIRouter(prefix="/preservation", tags=["preservation"])


@router.post("/fixity-check/{object_id}")
async def run_fixity_check(object_id: str) -> dict[str, Any]:
    """
    Execute an on-demand cryptographic fixity check on an archival object.
    Verifies SHA-256 against stored hash and logs a PREMIS fixity_check event.
    """
    engine = PreservationEngine(get_db_client())
    try:
        result = await engine.run_fixity_check(object_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fixity check error: {str(e)}")


@router.post("/fixity-check/all")
async def run_all_fixity_checks() -> dict[str, Any]:
    """
    Execute fixity checks on all archival objects in the repository.
    """
    engine = PreservationEngine(get_db_client())
    results = await engine.run_corpus_fixity_check()
    verified = sum(1 for r in results if r.get("status") == "verified")
    mismatches = sum(1 for r in results if r.get("status") == "mismatch")
    errors = sum(1 for r in results if r.get("status") == "error")
    return {
        "total_objects": len(results),
        "verified": verified,
        "mismatches": mismatches,
        "errors": errors,
        "results": results,
    }


@router.get("/events/{object_id}")
async def get_preservation_events(object_id: str) -> list[dict[str, Any]]:
    """
    Retrieve chronologically ordered PREMIS 3.0 event log for an archival object.
    """
    engine = PreservationEngine(get_db_client())
    events = await engine.get_preservation_events(object_id)
    return events


@router.get("/report")
async def get_preservation_report() -> dict[str, Any]:
    """
    Retrieve archive-wide digital preservation health metrics,
    fixity audit statistics, and recent PREMIS events.
    """
    engine = PreservationEngine(get_db_client())
    report = await engine.get_repository_health()
    return report
