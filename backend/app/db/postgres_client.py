"""
PostgreSQL Database Client implementation for Ambedkar Heritage Platform.
Wraps psycopg 3 connection pool with async interface via asyncio.to_thread for robust Windows compatibility.
Transparently adapts parameter placeholders (? -> %s) and SQLite-specific SQL constructs.
"""
from __future__ import annotations

import asyncio
import re
from typing import Any, Sequence
import psycopg
from psycopg_pool import ConnectionPool

from app.db.database import DatabaseClient, ResultSet, Row


def _adapt_sqlite_sql_to_postgres(sql: str) -> str:
    """
    Transparently translate common SQLite idioms to PostgreSQL.
    - datetime('now') -> CURRENT_TIMESTAMP
    - ? placeholder -> %s
    - INSERT OR IGNORE INTO -> INSERT INTO ... ON CONFLICT DO NOTHING
    - FTS match: fts_chunks MATCH ? -> tsv @@ plainto_tsquery('english', %s)
    """
    # Replace datetime('now')
    sql = re.sub(r"datetime\(\s*'now'\s*\)", "CURRENT_TIMESTAMP", sql, flags=re.IGNORECASE)

    # Replace FTS MATCH syntax
    sql = re.sub(
        r"fts_chunks\s+MATCH\s+\?",
        "tsv @@ plainto_tsquery('english', %s)",
        sql,
        flags=re.IGNORECASE
    )

    # Replace INSERT OR IGNORE
    if re.search(r"INSERT\s+OR\s+IGNORE\s+INTO", sql, re.IGNORECASE):
        sql = re.sub(r"INSERT\s+OR\s+IGNORE\s+INTO", "INSERT INTO", sql, flags=re.IGNORECASE)
        if "ON CONFLICT" not in sql.upper():
            sql = sql.rstrip("; \t\n") + " ON CONFLICT DO NOTHING"

    # Replace INSERT OR REPLACE
    if re.search(r"INSERT\s+OR\s+REPLACE\s+INTO", sql, re.IGNORECASE):
        sql = re.sub(r"INSERT\s+OR\s+REPLACE\s+INTO", "INSERT INTO", sql, flags=re.IGNORECASE)
        if "ON CONFLICT" not in sql.upper():
            sql = sql.rstrip("; \t\n") + " ON CONFLICT DO NOTHING"

    # Replace GROUP_CONCAT
    sql = re.sub(r"\bGROUP_CONCAT\s*\(", "string_agg(", sql, flags=re.IGNORECASE)

    # Replace ? with %s for parameters
    sql = sql.replace("?", "%s")

    return sql


class PostgresClient(DatabaseClient):
    """
    Thread-safe PostgreSQL Client using psycopg 3 ConnectionPool wrapped with async calls.
    Windows-native compatible without ProactorEventLoop limitations.
    """

    def __init__(self, conninfo: str, min_size: int = 2, max_size: int = 10) -> None:
        self._conninfo = conninfo
        self._pool = ConnectionPool(
            conninfo=self._conninfo,
            min_size=min_size,
            max_size=max_size,
            open=True,
            kwargs={"autocommit": True}
        )

    @staticmethod
    def _to_result_set(columns: list[str], rows_data: list[tuple[Any, ...]]) -> ResultSet:
        rows: list[Row] = []
        for raw_row in rows_data:
            row = Row(zip(columns, raw_row))
            rows.append(row)
        return ResultSet(columns=columns, rows=rows)

    def _sync_execute(self, sql: str, params: Sequence[Any] | None) -> ResultSet:
        pg_sql = _adapt_sqlite_sql_to_postgres(sql)
        with self._pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(pg_sql, list(params) if params else None)
                if cur.description:
                    columns = [d.name for d in cur.description]
                    rows = cur.fetchall()
                    return self._to_result_set(columns, rows)
                return ResultSet(columns=[], rows=[])

    async def execute(
        self,
        sql: str,
        params: Sequence[Any] = (),
    ) -> ResultSet:
        return await asyncio.to_thread(self._sync_execute, sql, params)

    def _sync_batch(self, statements: list[tuple[str, Sequence[Any]]]) -> list[ResultSet]:
        results: list[ResultSet] = []
        with self._pool.connection() as conn:
            with conn.transaction():
                for sql, params in statements:
                    pg_sql = _adapt_sqlite_sql_to_postgres(sql)
                    with conn.cursor() as cur:
                        cur.execute(pg_sql, list(params) if params else None)
                        if cur.description:
                            columns = [d.name for d in cur.description]
                            rows = cur.fetchall()
                            results.append(self._to_result_set(columns, rows))
                        else:
                            results.append(ResultSet(columns=[], rows=[]))
        return results

    async def batch(
        self,
        statements: list[tuple[str, Sequence[Any]]],
    ) -> list[ResultSet]:
        return await asyncio.to_thread(self._sync_batch, statements)

    async def close(self) -> None:
        await asyncio.to_thread(self._pool.close)
