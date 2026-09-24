"""Admin API routes."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db.database import get_db_client
from app.db.migrate import run_migrations
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/schema/init", response_model=MessageResponse)
async def init_schema() -> MessageResponse:
    """
    Apply all pending database migrations.
    Safe to call multiple times — only unapplied migrations are run.
    """
    db = get_db_client()
    try:
        count = await run_migrations(db)
        return MessageResponse(
            message=f"Schema initialized. {count} migration(s) applied.",
            success=True,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Schema migration failed: {str(e)}",
        )


@router.get("/schema/status")
async def schema_status() -> dict:
    """List all applied migrations."""
    db = get_db_client()
    try:
        result = await db.execute(
            "SELECT version, applied_at FROM schema_migrations ORDER BY version"
        )
        return {
            "applied_migrations": [dict(r) for r in result.rows],
            "count": len(result.rows),
        }
    except Exception as e:
        return {"applied_migrations": [], "count": 0, "error": str(e)}
