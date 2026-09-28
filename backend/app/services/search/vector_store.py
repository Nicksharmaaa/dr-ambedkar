"""
Phase 6 — VectorStore Interface + TursoVectorStore Implementation

The VectorStore abstraction keeps vector search decoupled from infrastructure.
Current implementation: TursoVectorStore — loads embedding JSON from Turso,
uses numpy cosine similarity (Python-side ANN).

Upgrade path (no caller changes):
  - Swap TursoVectorStore for QdrantVectorStore when corpus exceeds 500K chunks
  - Swap for TursoDiskANNStore when Turso DiskANN index is provisioned
"""
from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


# ── Data Types ────────────────────────────────────────────────────────────────

@dataclass
class VectorResult:
    chunk_id: str
    score: float               # Cosine similarity [0, 1] — higher is better
    metadata: dict = field(default_factory=dict)


# ── Abstract Interface ─────────────────────────────────────────────────────────

class VectorStore(ABC):
    """
    Abstract vector store.
    Implementations: TursoVectorStore (current), QdrantVectorStore (future).
    """

    @abstractmethod
    async def search(
        self,
        query_embedding: list[float],
        top_k: int = 50,
        filters: dict[str, Any] | None = None,
        embedding_version: str = "v1",
        model_name: str | None = None,
    ) -> list[VectorResult]:
        """
        Return top_k most similar chunks for the query embedding.
        filters: optional dict of field->value constraints (applied on metadata).
        """
        ...

    @abstractmethod
    async def upsert(
        self,
        chunk_id: str,
        embedding: list[float],
        model_name: str,
        embedding_version: str = "v1",
    ) -> None:
        """Store or update a chunk's embedding."""
        ...

    @abstractmethod
    async def count(self, embedding_version: str | None = None) -> int:
        """Return total number of stored embeddings."""
        ...


# ── TursoVectorStore ──────────────────────────────────────────────────────────

class TursoVectorStore(VectorStore):
    """
    Vector store backed by Turso (libSQL/SQLite) `embeddings` table.

    Search: loads all embeddings with matching model/version into memory,
    runs batch numpy cosine similarity, returns top-k.

    Sufficient for up to ~100K chunks at <100ms search latency.
    Upgrade path: provisioned Turso DiskANN -> swap _cosine_search() body only.
    """

    def __init__(self, db: Any) -> None:
        self.db = db

    async def upsert(
        self,
        chunk_id: str,
        embedding: list[float],
        model_name: str,
        embedding_version: str = "v1",
    ) -> None:
        import uuid
        from datetime import datetime, timezone

        emb_id   = str(uuid.uuid4())
        now      = datetime.now(timezone.utc).isoformat()
        emb_json = json.dumps(embedding)
        dim      = len(embedding)

        # Use embeddings table (supports both embedding_json and native column)
        try:
            await self.db.execute(
                """
                INSERT OR REPLACE INTO embeddings (
                    id, chunk_id, model_name, dimension, embedding_json, created_at, embedding_version
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [emb_id, chunk_id, model_name, dim, emb_json, now, embedding_version],
            )
        except Exception:
            # Fallback if embedding_version column not present
            await self.db.execute(
                """
                INSERT OR REPLACE INTO embeddings (
                    id, chunk_id, model_name, dimension, embedding_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                [emb_id, chunk_id, model_name, dim, emb_json, now],
            )

    _cached_matrix: Any = None
    _cached_chunk_ids: list[str] = []
    _cached_mtime: float = 0.0

    @classmethod
    def _load_cache(cls) -> tuple[Any, list[str]]:
        import os
        from pathlib import Path
        import numpy as np

        candidates = [
            Path("storage/local/vector_cache.npz"),
            Path("backend/storage/local/vector_cache.npz"),
            Path(__file__).resolve().parent.parent.parent.parent / "storage" / "local" / "vector_cache.npz",
        ]
        for cache_path in candidates:
            if cache_path.exists():
                mtime = os.path.getmtime(cache_path)
                if cls._cached_matrix is not None and cls._cached_mtime == mtime:
                    return cls._cached_matrix, cls._cached_chunk_ids

                try:
                    data = np.load(cache_path, allow_pickle=True)
                    cls._cached_matrix = data["matrix"]
                    cls._cached_chunk_ids = [str(x) for x in data["chunk_ids"]]
                    cls._cached_mtime = mtime
                    logger.info("Loaded %d vectors from %s", len(cls._cached_chunk_ids), cache_path)
                    return cls._cached_matrix, cls._cached_chunk_ids
                except Exception as exc:
                    logger.warning("Failed to load vector cache: %s", exc)

        return None, []

    async def search(
        self,
        query_embedding: list[float],
        top_k: int = 50,
        filters: dict[str, Any] | None = None,
        embedding_version: str = "v1",
        model_name: str | None = None,
    ) -> list[VectorResult]:
        """
        Load embeddings from DB/cache and compute cosine similarity in Python (numpy).
        """
        try:
            import numpy as np
        except ImportError:
            logger.warning("numpy not available; vector search disabled")
            return []

        # 1. Fast path: load from pre-built local vector cache
        mat, chunk_ids = self._load_cache()
        if mat is not None and mat.shape[1] != len(query_embedding):
            logger.warning(
                "Vector cache dimension mismatch (%d vs %d); falling back to DB",
                mat.shape[1],
                len(query_embedding),
            )
            mat = None
            chunk_ids = []

        # 2. Slow fallback: fetch from Turso in safe pages of 1000
        if mat is None or len(chunk_ids) == 0:
            chunk_ids = []
            vectors: list[list[float]] = []
            page_size = 1000
            offset = 0

            while True:
                sql = "SELECT chunk_id, embedding_json FROM embeddings LIMIT ? OFFSET ?"
                res = await self.db.execute(sql, [page_size, offset])
                if not res.rows:
                    break
                for row in res.rows:
                    cid = row.get("chunk_id", "")
                    raw = row.get("embedding_json")
                    if raw:
                        try:
                            vec = json.loads(raw) if isinstance(raw, str) else raw
                            chunk_ids.append(cid)
                            vectors.append(vec)
                        except Exception:
                            continue
                offset += len(res.rows)
                if len(res.rows) < page_size:
                    break

            if not vectors:
                return []
            mat = np.array(vectors, dtype=np.float32)

        q = np.array(query_embedding, dtype=np.float32)

        # Both should be L2-normalised from the embedding engine, so dot == cosine
        scores = mat @ q                                     # (N,)

        # Get top_k indices
        if len(scores) <= top_k:
            top_indices = list(range(len(scores)))
        else:
            top_indices = list(np.argpartition(scores, -top_k)[-top_k:])

        # Sort by score descending
        top_sorted = sorted(top_indices, key=lambda i: float(scores[i]), reverse=True)

        return [
            VectorResult(
                chunk_id=chunk_ids[i],
                score=float(scores[i]),
            )
            for i in top_sorted
            if float(scores[i]) > 0.0
        ]

    async def count(self, embedding_version: str | None = None) -> int:
        result = await self.db.execute("SELECT COUNT(*) AS cnt FROM embeddings")
        row = result.first()
        return int(row["cnt"]) if row else 0


# PostgreSQL vector store alias
PostgresVectorStore = TursoVectorStore

