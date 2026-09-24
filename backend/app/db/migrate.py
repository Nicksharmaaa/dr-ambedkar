"""
Migration runner for Turso/libSQL.
Reads .sql migration files in order, applies only unapplied ones.
Tracks applied migrations in the schema_migrations table.
"""
from __future__ import annotations

import asyncio
from pathlib import Path

from app.core.logging import get_logger
from app.db.database import DatabaseClient, get_db_client

logger = get_logger(__name__)

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


async def get_applied_migrations(db: DatabaseClient) -> set[str]:
    """Return set of already-applied migration versions."""
    try:
        result = await db.execute(
            "SELECT version FROM schema_migrations ORDER BY version"
        )
        return {row["version"] for row in result.rows}
    except Exception:
        # schema_migrations table doesn't exist yet — first run
        return set()


async def run_migrations(db: DatabaseClient | None = None) -> int:
    """
    Apply all pending SQL migrations.
    Returns the number of migrations applied.
    """
    if db is None:
        db = get_db_client()

    applied = await get_applied_migrations(db)
    sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))

    if not sql_files:
        logger.warning("No migration files found", dir=str(MIGRATIONS_DIR))
        return 0

    count = 0
    for sql_file in sql_files:
        version = sql_file.stem  # e.g. "001_initial_schema"
        if version in applied:
            logger.info("Migration already applied — skip", version=version)
            continue

        logger.info("Applying migration", version=version)
        sql_content = sql_file.read_text(encoding="utf-8")

        def split_sql_statements(sql: str) -> list[str]:
            """
            Split SQL text into individual statements, respecting parentheses nesting.
            Handles: CREATE TABLE (...), CREATE VIRTUAL TABLE (...), triggers, etc.
            """
            statements = []
            current: list[str] = []
            depth = 0
            for line in sql.splitlines():
                stripped = line.strip()
                # Skip comment-only lines
                if stripped.startswith("--") or not stripped:
                    continue
                current.append(line)
                depth += stripped.count("(") - stripped.count(")")
                if stripped.endswith(";") and depth <= 0:
                    stmt = "\n".join(current).strip().rstrip(";").strip()
                    if stmt:
                        statements.append(stmt)
                    current = []
                    depth = 0
            # Handle any trailing statement without final semicolon
            if current:
                stmt = "\n".join(current).strip().rstrip(";").strip()
                if stmt and not stmt.startswith("--"):
                    statements.append(stmt)
            return statements

        statements = split_sql_statements(sql_content)
        try:
            for stmt in statements:
                if stmt and not stmt.startswith("--"):
                    try:
                        await db.execute(stmt)
                    except KeyError:
                        # Legacy fallback: some clients return no result key for DDL
                        pass
                    except Exception as inner:
                        raise inner
            logger.info("Migration applied", version=version, statements=len(statements))
            count += 1
        except RuntimeError:
            raise
        except Exception as e:
            logger.error("Migration FAILED", version=version, error=str(e))
            raise RuntimeError(f"Migration {version} failed: {e}") from e

    if count == 0:
        logger.info("Schema is up to date — no migrations needed")
    else:
        logger.info("Migrations complete", applied_count=count)

    return count


if __name__ == "__main__":
    async def _main() -> None:
        db = get_db_client()
        n = await run_migrations(db)
        print(f"Applied {n} migration(s).")
        await db.close()

    asyncio.run(_main())
