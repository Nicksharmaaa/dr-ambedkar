"""
Phase 6 — Embedding Engine
Wraps Qwen3-Embedding-0.6B for batch GPU embedding of text chunks.

Features:
- SentenceTransformer wrapper with native last-token pooling for Qwen3
- Configurable model (settings.ai_embedding_model)
- CUDA GPU by default; CPU fallback
- Fast batch inference
- Embedding version tracking (never mix incompatible versions)
- Lazy loading (load on first call; stays resident)
"""
from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any

# Ensure Hugging Face runs strictly offline to prevent network hangs
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

logger = logging.getLogger(__name__)

# ── Embedding Version ─────────────────────────────────────────────────────────
# Bump this string whenever the model or dimension changes to prevent
# mixing incompatible vectors in the embeddings table.
EMBEDDING_VERSION = "v1"


class EmbeddingEngine:
    """
    Singleton-style embedding engine using Qwen3-Embedding-0.6B.
    Call EmbeddingEngine.get() to obtain the shared instance.
    """

    _instance: "EmbeddingEngine | None" = None

    def __init__(self, model_name: str, device: str = "cpu") -> None:
        self.model_name = model_name
        self.device     = device
        self.dimension  = 1024
        self._model: Any = None
        logger.info("EmbeddingEngine initialised", extra={"model": model_name, "device": self.device})

    @classmethod
    def get(cls) -> "EmbeddingEngine":
        """Return (and lazily load) the shared embedding engine."""
        if cls._instance is None:
            from app.core.config import settings
            cuda_available = False
            if getattr(settings, "model_provider", "local") != "cloud":
                try:
                    import torch
                    cuda_available = torch.cuda.is_available()
                except Exception:
                    pass
            cls._instance = cls(
                model_name=settings.ai_embedding_model,
                device="cuda" if cuda_available else "cpu",
            )
        return cls._instance

    def _resolve_model_path(self) -> str:
        """Find local model snapshot or return model_name."""
        cache_dir = None
        try:
            from app.core.config import settings
            cache_dir = Path(settings.ai_model_cache_dir)
        except Exception:
            pass

        candidates = [
            Path("backend/models/cache/models--Qwen--Qwen3-Embedding-0.6B/snapshots/97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3"),
            Path("models/cache/models--Qwen--Qwen3-Embedding-0.6B/snapshots/97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3"),
            Path(__file__).resolve().parent.parent.parent.parent / "models" / "cache" / "models--Qwen--Qwen3-Embedding-0.6B" / "snapshots" / "97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3",
        ]
        if cache_dir:
            candidates.append(cache_dir / "models--Qwen--Qwen3-Embedding-0.6B" / "snapshots" / "97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3")

        for p in candidates:
            if p.exists() and (p / "model.safetensors").exists():
                return str(p)

        return self.model_name

    def _ensure_loaded(self) -> None:
        """Load SentenceTransformer model on first use."""
        if self._model is not None:
            return

        import torch
        from sentence_transformers import SentenceTransformer

        logger.info("Loading embedding model …", extra={"model": self.model_name})
        resolved_path = self._resolve_model_path()

        model_kwargs = {}
        if self.device == "cuda":
            model_kwargs["torch_dtype"] = torch.float16

        self._model = SentenceTransformer(
            resolved_path,
            device=self.device,
            model_kwargs=model_kwargs,
        )
        self.dimension = 1024
        logger.info("Embedding model ready", extra={"dim": self.dimension, "device": self.device})

    # ── Public API ────────────────────────────────────────────────────────────

    def embed_passages(self, texts: list[str], batch_size: int = 64) -> list[list[float]]:
        """
        Encode a list of passage texts (for indexing).
        Returns list of normalized float vectors (len = self.dimension).
        """
        if not texts:
            return []
        self._ensure_loaded()
        vecs = self._model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=False,
            normalize_embeddings=True,
        )
        return [[float(x) for x in v] for v in vecs]

    def embed_query(self, query: str) -> list[float]:
        """
        Encode a single search query.
        Returns a normalized 1024-dim float vector.
        """
        from app.core.config import settings
        if getattr(settings, "model_provider", "local") == "cloud":
            return self._embed_query_cloud(query)

        self._ensure_loaded()
        vec = self._model.encode(
            [query],
            show_progress_bar=False,
            normalize_embeddings=True,
        )[0]
        return [float(x) for x in vec]

    def _embed_query_cloud(self, query: str) -> list[float]:
        """
        Call free Hugging Face Serverless Inference API for Qwen embedding.
        Uses 0 MB local RAM, preventing OOM crashes on 512 MB instances.
        """
        import httpx
        from app.core.config import settings

        hf_token = os.environ.get("HF_TOKEN") or getattr(settings, "hf_token", "")
        headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}
        url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.model_name}"

        try:
            with httpx.Client(timeout=6.0) as client:
                res = client.post(url, headers=headers, json={"inputs": query, "parameters": {"wait_for_model": True}})
                if res.status_code == 200:
                    data = res.json()
                    if isinstance(data, list) and len(data) > 0:
                        if isinstance(data[0], list):
                            data = data[0]
                        return [float(x) for x in data]
        except Exception as exc:
            logger.warning("Cloud embedding API call failed: %s", exc)

        raise RuntimeError("Cloud embedding unavailable; gracefully falling back to lexical search")

    def embedding_to_json(self, embedding: list[float]) -> str:
        """Serialise embedding to JSON string for storage."""
        return json.dumps(embedding)

    def json_to_embedding(self, json_str: str) -> list[float]:
        """Deserialise embedding from stored JSON string."""
        return json.loads(json_str)

    @property
    def version(self) -> str:
        return EMBEDDING_VERSION

    @property
    def is_loaded(self) -> bool:
        return self._model is not None
