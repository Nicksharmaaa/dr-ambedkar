"""
Preservation Service Engine (PREMIS 3.0 Compliance)
Handles fixity checking, preservation event logging, immutability auditing,
and repository preservation health metrics.
"""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any

from app.core.logging import get_logger
from app.db.database import DatabaseClient, get_db_client
from app.db.repositories.archival_objects import ArchivalObjectRepository
from app.db.repositories.preservation import PreservationRepository
from app.services.storage.provider import get_storage_backend

logger = get_logger(__name__)

# PREMIS 3.0 Event Categories
PREMIS_EVENT_TYPES = {
    "ingestion": "Initial archival registration and provenance capture",
    "validation": "File format, structure, and integrity validation",
    "fixity_check": "Cryptographic digest recalculation and verification",
    "derivative_creation": "Generation of ALTO XML, thumbnails, or derivative formats",
    "metadata_update": "Modification of descriptive, technical, or administrative metadata",
    "ocr": "Optical character recognition and layout extraction",
    "ocr_correction": "Reviewer correction of recognized text coordinates",
    "translation": "Multilingual translation generation",
    "publication": "Status transition to published access tier",
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class PreservationEngine:
    def __init__(self, db: DatabaseClient | None = None) -> None:
        self.db = db or get_db_client()
        self.preservation_repo = PreservationRepository(self.db)
        self.obj_repo = ArchivalObjectRepository(self.db)
        self.storage = get_storage_backend()

    async def log_event(
        self,
        object_id: str | None,
        event_type: str,
        event_detail: str,
        event_outcome: str,
        agent_name: str = "AmbedkarHeritagePreservationEngine/1.0",
        agent_type: str = "software",
        outcome_detail: str | None = None,
        file_hash_before: str | None = None,
        file_hash_after: str | None = None,
    ) -> str:
        """Record an official PREMIS 3.0 preservation event in the immutable log."""
        event_id = await self.preservation_repo.log_preservation_event(
            object_id=object_id,
            event_type=event_type,
            event_detail=event_detail,
            event_outcome=event_outcome,
            agent_name=agent_name,
            agent_type=agent_type,
            outcome_detail=outcome_detail,
            file_hash_before=file_hash_before,
            file_hash_after=file_hash_after,
        )
        logger.info(
            "PREMIS event logged",
            event_id=event_id,
            object_id=object_id,
            event_type=event_type,
            outcome=event_outcome,
        )
        return event_id

    async def run_fixity_check(self, object_id: str) -> dict[str, Any]:
        """
        Perform an on-demand SHA-256 fixity check for an archival object:
        1. Fetch archival object metadata
        2. Read original binary directly from storage backend
        3. Recalculate SHA-256 digest
        4. Compare with recorded file_hash
        5. Record PREMIS fixity_check event
        """
        obj = await self.obj_repo.get_by_id(object_id)
        if not obj:
            obj = await self.obj_repo.get_by_stable_id(object_id)
        if not obj:
            raise ValueError(f"Archival object '{object_id}' not found")

        stored_hash = obj.get("file_hash")
        file_key = obj.get("original_file_key")
        actual_id = obj["id"]

        if not file_key:
            event_id = await self.log_event(
                object_id=actual_id,
                event_type="fixity_check",
                event_detail="Fixity verification failed: No original_file_key recorded",
                event_outcome="failure",
                outcome_detail="Missing storage key reference",
                file_hash_before=stored_hash,
            )
            return {
                "object_id": actual_id,
                "status": "failed",
                "message": "No original_file_key recorded",
                "event_id": event_id,
                "verified_at": _now(),
            }

        try:
            # Read binary from storage
            data = await self.storage.get(file_key)
            computed_hash = hashlib.sha256(data).hexdigest()
            match = stored_hash and (computed_hash.lower() == stored_hash.lower())

            outcome = "success" if match else "failure"
            detail = (
                f"SHA-256 fixity verified ({len(data)} bytes)"
                if match
                else f"SHA-256 MISMATCH! stored={stored_hash}, computed={computed_hash}"
            )

            event_id = await self.log_event(
                object_id=actual_id,
                event_type="fixity_check",
                event_detail="Cryptographic SHA-256 digest re-verification against stored binary",
                event_outcome=outcome,
                outcome_detail=detail,
                file_hash_before=stored_hash,
                file_hash_after=computed_hash,
            )

            return {
                "object_id": actual_id,
                "file_key": file_key,
                "stored_hash": stored_hash,
                "computed_hash": computed_hash,
                "status": "verified" if match else "mismatch",
                "bytes_checked": len(data),
                "event_id": event_id,
                "verified_at": _now(),
            }
        except Exception as exc:
            event_id = await self.log_event(
                object_id=actual_id,
                event_type="fixity_check",
                event_detail=f"Fixity verification exception: {exc}",
                event_outcome="failure",
                outcome_detail=str(exc),
                file_hash_before=stored_hash,
            )
            return {
                "object_id": actual_id,
                "file_key": file_key,
                "stored_hash": stored_hash,
                "status": "error",
                "message": str(exc),
                "event_id": event_id,
                "verified_at": _now(),
            }

    async def get_preservation_events(self, object_id: str) -> list[dict]:
        """Fetch all PREMIS events recorded for an object."""
        # Check by id or stable_id
        obj = await self.obj_repo.get_by_id(object_id)
        if not obj:
            obj = await self.obj_repo.get_by_stable_id(object_id)
        target_id = obj["id"] if obj else object_id
        return await self.preservation_repo.get_preservation_events(target_id)

    async def get_repository_health(self) -> dict[str, Any]:
        """Generate high-level preservation health report for the archive."""
        obj_count_res = await self.db.execute("SELECT count(*) as c, sum(file_size_bytes) as total_bytes FROM archival_objects")
        row = obj_count_res.first() or {}
        total_objects = row.get("c") or 0
        total_bytes = row.get("total_bytes") or 0

        # Fixity checks summary
        fixity_res = await self.db.execute(
            """
            SELECT 
                count(*) as total_checks,
                sum(case when event_outcome = 'success' then 1 else 0 end) as passed_checks,
                sum(case when event_outcome = 'failure' then 1 else 0 end) as failed_checks
            FROM preservation_events
            WHERE event_type = 'fixity_check'
            """
        )
        fixity_row = fixity_res.first() or {}
        total_checks = fixity_row.get("total_checks") or 0
        passed_checks = fixity_row.get("passed_checks") or 0
        failed_checks = fixity_row.get("failed_checks") or 0

        # All events summary
        all_events_res = await self.db.execute("SELECT count(*) as c FROM preservation_events")
        all_events_row = all_events_res.first() or {}
        total_events = all_events_row.get("c") or 0

        # Recent events
        recent_events_res = await self.db.execute(
            "SELECT * FROM preservation_events ORDER BY event_date DESC LIMIT 10"
        )
        recent_events = [dict(r) for r in recent_events_res.rows]

        integrity_rate = 100.0 if total_checks == 0 else round((passed_checks / total_checks) * 100.0, 2)

        return {
            "total_objects": total_objects,
            "total_bytes": total_bytes,
            "total_preservation_events": total_events,
            "fixity": {
                "total_checks": total_checks,
                "passed_checks": passed_checks,
                "failed_checks": failed_checks,
                "integrity_rate_pct": integrity_rate,
            },
            "status": "healthy" if failed_checks == 0 else "attention_required",
            "evaluated_at": _now(),
            "recent_events": recent_events,
        }

    async def run_corpus_fixity_check(self) -> list[dict[str, Any]]:
        """Run fixity check on all ingested archival objects."""
        res = await self.db.execute("SELECT id, stable_id FROM archival_objects ORDER BY id")
        results = []
        for row in res.rows:
            obj_id = row["id"]
            check_res = await self.run_fixity_check(obj_id)
            results.append(check_res)
        return results
