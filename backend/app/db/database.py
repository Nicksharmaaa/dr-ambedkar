"""
Database layer — Turso (libsql-client) and SQLite (stdlib) implementations.
Repository pattern: SQL never leaks into API route handlers.

Phase 1 verified: libsql-client 0.3.1 — pure Python, no Rust, Windows-compatible.
No SQLAlchemy (Python 3.14 + sqlalchemy-libsql compatibility unverified).
"""
from __future__ import annotations

import sqlite3
from abc import ABC, abstractmethod
from typing import Any, Sequence


# ── Abstract Base ─────────────────────────────────────────────────────────────

class Row(dict):
    """A single result row — dict-like with attribute access."""
    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError:
            raise AttributeError(name)


class ResultSet:
    """Holds query results — list of Row dicts + columns list."""

    def __init__(self, columns: list[str], rows: list[Row]) -> None:
        self.columns = columns
        self.rows = rows

    def __iter__(self):
        return iter(self.rows)

    def __len__(self) -> int:
        return len(self.rows)

    def first(self) -> Row | None:
        return self.rows[0] if self.rows else None

    def scalar(self) -> Any | None:
        row = self.first()
        if row is None:
            return None
        return next(iter(row.values()))


class DatabaseClient(ABC):
    """
    Abstract database client.
    Implementations: TursoClient (libsql-client), SQLiteClient (stdlib sqlite3).
    Swap implementations without changing any repository or service code.
    """

    @abstractmethod
    async def execute(
        self,
        sql: str,
        params: Sequence[Any] = (),
    ) -> ResultSet:
        """Execute a single SQL statement. Returns ResultSet."""
        ...

    @abstractmethod
    async def batch(
        self,
        statements: list[tuple[str, Sequence[Any]]],
    ) -> list[ResultSet]:
        """Execute multiple statements atomically. Returns list of ResultSets."""
        ...

    @abstractmethod
    async def close(self) -> None:
        """Release connection resources."""
        ...


# ── Turso Client (libsql-client) ──────────────────────────────────────────────

class TursoClient(DatabaseClient):
    """
    Turso remote client using libsql-client (async, pure Python).
    Works with:
      - Turso Cloud: url=libsql://... + auth_token=...
      - Local file:  url=file:path/to/db.db  (no auth_token needed)
      - In-memory:   url=:memory:            (for testing)
    """

    def __init__(self, url: str, auth_token: str | None = None) -> None:
        import libsql_client  # type: ignore

        self._client = libsql_client.create_client(
            url=url,
            auth_token=auth_token,
        )

    @staticmethod
    def _to_result_set(result: Any) -> ResultSet:
        """Convert libsql_client result to our ResultSet."""
        columns: list[str] = list(result.columns) if result.columns else []
        rows: list[Row] = []
        for raw_row in result.rows:
            row = Row(zip(columns, raw_row))
            rows.append(row)
        return ResultSet(columns=columns, rows=rows)

    async def execute(
        self,
        sql: str,
        params: Sequence[Any] = (),
    ) -> ResultSet:
        try:
            result = await self._client.execute(sql, list(params))
            return self._to_result_set(result)
        except KeyError:
            # Turso HTTP client does not return a 'result' key for DDL statements
            # (CREATE TABLE, CREATE INDEX, INSERT OR IGNORE, etc.) — treat as success
            return ResultSet(columns=[], rows=[])

    async def batch(
        self,
        statements: list[tuple[str, Sequence[Any]]],
    ) -> list[ResultSet]:
        stmts = [
            {"sql": sql, "args": list(params)}
            for sql, params in statements
        ]
        results = await self._client.batch(stmts)
        return [self._to_result_set(r) for r in results]

    async def close(self) -> None:
        await self._client.close()


# ── SQLite Client (stdlib — for unit tests / offline) ─────────────────────────

class SQLiteClient(DatabaseClient):
    """
    Synchronous stdlib sqlite3 wrapped with async interface.
    Used for tests and kiosk offline mode.
    url=":memory:" for in-memory test databases.
    url="file:path/to/db.db" for local file.
    """

    def __init__(self, url: str = ":memory:") -> None:
        db_path = url.replace("file:", "")
        self._conn = sqlite3.connect(db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        # Enable WAL mode for concurrent reads
        self._conn.execute("PRAGMA journal_mode=WAL")
        self._conn.execute("PRAGMA foreign_keys=ON")

    @staticmethod
    def _to_result_set(cursor: sqlite3.Cursor) -> ResultSet:
        columns = [d[0] for d in cursor.description] if cursor.description else []
        rows = [Row(zip(columns, row)) for row in cursor.fetchall()]
        return ResultSet(columns=columns, rows=rows)

    async def execute(
        self,
        sql: str,
        params: Sequence[Any] = (),
    ) -> ResultSet:
        cur = self._conn.execute(sql, list(params))
        self._conn.commit()
        return self._to_result_set(cur)

    async def batch(
        self,
        statements: list[tuple[str, Sequence[Any]]],
    ) -> list[ResultSet]:
        results = []
        with self._conn:
            for sql, params in statements:
                cur = self._conn.execute(sql, list(params))
                results.append(self._to_result_set(cur))
        return results

    async def close(self) -> None:
        self._conn.close()


# ── Factory ───────────────────────────────────────────────────────────────────

_client_instance: DatabaseClient | None = None


def get_db_client() -> DatabaseClient:
    """
    Return the singleton database client based on config.
    - Turso Cloud URL → TursoClient with auth token
    - Local file URL  → TursoClient without auth token
    - :memory:        → SQLiteClient (tests)
    """
    global _client_instance
    if _client_instance is not None:
        return _client_instance

    from app.core.config import settings

    url = settings.turso_db_url

    if url == ":memory:":
        _client_instance = SQLiteClient(":memory:")
    elif url.startswith("file:") and not url.startswith("file://"):
        # Local file — use SQLiteClient for full local-only support
        _client_instance = SQLiteClient(url)
    else:
        # Turso Cloud: use native httpx-based HTTP client (v2/pipeline API)
        # libsql-client's HTTP path has compatibility issues with current Turso server
        from app.db.turso_http import TursoHTTPClient
        _client_instance = TursoHTTPClient(
            url=url,
            auth_token=settings.turso_auth_token or None,
        )

    return _client_instance


async def close_db_client() -> None:
    """Call during application shutdown."""
    global _client_instance
    if _client_instance is not None:
        await _client_instance.close()
        _client_instance = None
