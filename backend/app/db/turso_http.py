"""
Native Turso HTTP Client using httpx directly.
Bypasses libsql-client which has compatibility issues with the current Turso server
response format (KeyError: 'result' for non-SELECT statements).

Uses the Turso v2/pipeline API which is stable and well-documented.
"""
from __future__ import annotations

from typing import Any, Sequence

import asyncio
import httpx

from app.db.database import DatabaseClient, ResultSet, Row


class TursoHTTPClient(DatabaseClient):
    """
    Direct Turso HTTP client using v2/pipeline API.
    Fully async via httpx. No libsql-client dependency.
    
    Turso v2/pipeline API: POST /v2/pipeline
    Supports batched execution, transactions, and SELECT/DDL/DML.
    """

    def __init__(self, url: str, auth_token: str | None = None) -> None:
        # Normalize URL: libsql:// → https://
        if url.startswith("libsql://"):
            url = "https://" + url[len("libsql://"):]
        self._base_url = url.rstrip("/")
        self._headers = {
            "Authorization": f"Bearer {auth_token}" if auth_token else "",
            "Content-Type": "application/json",
        }
        self._http_client: httpx.AsyncClient | None = None

    def _get_client(self) -> httpx.AsyncClient:
        current_loop = None
        try:
            current_loop = asyncio.get_running_loop()
        except RuntimeError:
            pass

        if (
            self._http_client is None
            or self._http_client.is_closed
            or getattr(self, "_current_loop", None) != current_loop
        ):
            self._current_loop = current_loop
            self._http_client = httpx.AsyncClient(
                base_url=self._base_url,
                headers=self._headers,
                timeout=httpx.Timeout(60.0, connect=15.0),
            )
        return self._http_client

    @staticmethod
    def _parse_result(result_obj: dict) -> ResultSet:
        """Parse a Turso v2/pipeline execute result into our ResultSet."""
        cols = [c.get("name", "") for c in result_obj.get("cols", [])]
        raw_rows = result_obj.get("rows", [])
        rows = []
        for raw_row in raw_rows:
            # Each cell is {"type": "integer"|"text"|"float"|"blob"|"null", "value": ...}
            values = []
            for cell in raw_row:
                if cell.get("type") == "null":
                    values.append(None)
                elif cell.get("type") in ("integer",):
                    try:
                        values.append(int(cell["value"]))
                    except (ValueError, TypeError):
                        values.append(cell.get("value"))
                elif cell.get("type") == "float":
                    try:
                        values.append(float(cell["value"]))
                    except (ValueError, TypeError):
                        values.append(cell.get("value"))
                else:
                    values.append(cell.get("value"))
            rows.append(Row(zip(cols, values)))
        return ResultSet(columns=cols, rows=rows)

    async def execute(
        self,
        sql: str,
        params: Sequence[Any] = (),
    ) -> ResultSet:
        """Execute a single SQL statement via v2/pipeline."""
        stmt: dict[str, Any] = {"sql": sql}
        if params:
            stmt["args"] = [
                {"type": "text", "value": str(p)} if isinstance(p, str)
                else {"type": "null", "value": None} if p is None
                else {"type": "integer", "value": str(int(p))} if isinstance(p, int)
                else {"type": "float", "value": float(p)} if isinstance(p, float)
                else {"type": "text", "value": str(p)}
                for p in params
            ]

        payload = {
            "requests": [
                {"type": "execute", "stmt": stmt},
                {"type": "close"},
            ]
        }

        resp = None
        for attempt in range(3):
            try:
                client = self._get_client()
                resp = await client.post("/v2/pipeline", json=payload)
                resp.raise_for_status()
                break
            except (httpx.ReadTimeout, httpx.ConnectTimeout, httpx.NetworkError) as exc:
                if attempt == 2:
                    raise
                await asyncio.sleep(1.0 * (attempt + 1))
        assert resp is not None
        data = resp.json()

        results = data.get("results", [])
        if not results:
            return ResultSet(columns=[], rows=[])

        first = results[0]
        if first.get("type") == "error":
            error_data = first.get("error", {})
            raise RuntimeError(f"Turso error: {error_data.get('message', 'Unknown error')}")

        result_obj = first.get("response", {}).get("result", {})
        return self._parse_result(result_obj)

    async def batch(
        self,
        statements: list[tuple[str, Sequence[Any]]],
    ) -> list[ResultSet]:
        """Execute multiple statements in a single pipeline request."""
        requests = []
        for sql, params in statements:
            stmt: dict[str, Any] = {"sql": sql}
            if params:
                stmt["args"] = [
                    {"type": "text", "value": str(p)} if isinstance(p, str)
                    else {"type": "null", "value": None} if p is None
                    else {"type": "integer", "value": str(int(p))} if isinstance(p, int)
                    else {"type": "float", "value": float(p)} if isinstance(p, float)
                    else {"type": "text", "value": str(p)}
                    for p in params
                ]
            requests.append({"type": "execute", "stmt": stmt})
        requests.append({"type": "close"})

        payload = {"requests": requests}
        resp = None
        for attempt in range(3):
            try:
                client = self._get_client()
                resp = await client.post("/v2/pipeline", json=payload)
                resp.raise_for_status()
                break
            except (httpx.ReadTimeout, httpx.ConnectTimeout, httpx.NetworkError) as exc:
                if attempt == 2:
                    raise
                await asyncio.sleep(1.0 * (attempt + 1))
        assert resp is not None
        data = resp.json()

        results_out = []
        for item in data.get("results", []):
            if item.get("type") == "error":
                error_data = item.get("error", {})
                raise RuntimeError(f"Turso batch error: {error_data.get('message', 'Unknown')}")
            if item.get("type") == "ok":
                result_obj = item.get("response", {}).get("result", {})
                if result_obj is not None:
                    results_out.append(self._parse_result(result_obj))

        return results_out

    async def close(self) -> None:
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()
            self._http_client = None
