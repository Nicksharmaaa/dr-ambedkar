"""
Phase 6 — Embedding Engine
Wraps Qwen3-Embedding-0.6B for batch GPU embedding of text chunks.

Features:
- Instruction-aware query/passage encoding
- Configurable model (settings.ai_embedding_model)
- CUDA GPU by default; CPU fallback
- Batch size 16 (fits 0.8 GB VRAM)
- Embedding version tracking (never mix incompatible versions)
- Lazy loading (load on first call; stays resident)
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

# torch is imported lazily to keep baseline memory under 60MB on free-tier containers
logger = logging.getLogger(__name__)

# ── Embedding Version ─────────────────────────────────────────────────────────
# Bump this string whenever the model or dimension changes to prevent
# mixing incompatible vectors in the embeddings table.
EMBEDDING_VERSION = "v1"

# Instruction prefix (Qwen3 instruction-aware embedding)
PASSAGE_INSTRUCTION = "Represent this document for retrieval:"
QUERY_INSTRUCTION   = "Instruct: Given a research query about Dr. B.R. Ambedkar's writings, retrieve the most relevant passage\nQuery:"


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
        self._tokenizer: Any = None
        self._model: Any     = None
        logger.info("EmbeddingEngine initialised", extra={"model": model_name, "device": self.device})

    @classmethod
    def get(cls) -> "EmbeddingEngine":
        """Return (and lazily load) the shared embedding engine."""
        if cls._instance is None:
            from app.core.config import settings
            cuda_available = False
            if settings.model_provider != "cloud":
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

    def _ensure_loaded(self) -> None:
        """Load tokenizer + model on first use."""
        if self._model is not None:
            return

        global torch
        import torch
        from transformers import AutoTokenizer, AutoModel  # type: ignore

        logger.info("Loading embedding model …", extra={"model": self.model_name})
        cache_dir = None
        try:
            from app.core.config import settings
            cache_dir = str(settings.ai_model_cache_dir)
        except Exception:
            pass

        self._tokenizer = AutoTokenizer.from_pretrained(
            self.model_name,
            cache_dir=cache_dir,
        )
        self._model = AutoModel.from_pretrained(
            self.model_name,
            cache_dir=cache_dir,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
        ).to(self.device)
        self._model.eval()

        # Detect actual hidden dimension from model config
        cfg = getattr(self._model, "config", None)
        if cfg and hasattr(cfg, "hidden_size"):
            self.dimension = cfg.hidden_size
        logger.info("Embedding model ready", extra={"dim": self.dimension})

    # ── Public API ────────────────────────────────────────────────────────────

    def embed_passages(self, texts: list[str], batch_size: int = 16) -> list[list[float]]:
        """
        Encode a list of passage texts (for indexing).
        Returns list of float vectors (len = self.dimension).
        """
        self._ensure_loaded()
        return self._encode(texts, instruction=PASSAGE_INSTRUCTION, batch_size=batch_size)

    def embed_query(self, query: str) -> list[float]:
        """
        Encode a single search query (instruction-aware).
        Returns a float vector.
        """
        from app.core.config import settings
        if getattr(settings, "model_provider", "local") == "cloud":
            return self._embed_query_cloud(query)

        self._ensure_loaded()
        results = self._encode([query], instruction=QUERY_INSTRUCTION, batch_size=1)
        return results[0]

    def _embed_query_cloud(self, query: str) -> list[float]:
        """
        Call free Hugging Face Serverless Inference API for Qwen embedding.
        Uses 0 MB local RAM, preventing OOM crashes on 512 MB instances.
        """
        import httpx
        from app.core.config import settings

        prefixed = f"{QUERY_INSTRUCTION}\n{query}"
        hf_token = os.environ.get("HF_TOKEN") or getattr(settings, "hf_token", "")
        headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}
        url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.model_name}"

        try:
            with httpx.Client(timeout=6.0) as client:
                res = client.post(url, headers=headers, json={"inputs": prefixed, "parameters": {"wait_for_model": True}})
                if res.status_code == 200:
                    data = res.json()
                    if isinstance(data, list) and len(data) > 0:
                        if isinstance(data[0], list):
                            data = data[0]
                        return [float(x) for x in data]
        except Exception as exc:
            logger.warning("Cloud embedding API call failed: %s", exc)

        raise RuntimeError("Cloud embedding unavailable; gracefully falling back to lexical search")

    # ── Internals ─────────────────────────────────────────────────────────────

    def _encode(
        self,
        texts: list[str],
        instruction: str,
        batch_size: int,
    ) -> list[list[float]]:
        """Encode texts in batches; returns normalised L2 vectors."""
        all_embeddings: list[list[float]] = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            prefixed = [f"{instruction}\n{t}" if instruction else t for t in batch]

            encoded = self._tokenizer(
                prefixed,
                padding=True,
                truncation=True,
                max_length=512,
                return_tensors="pt",
            ).to(self.device)

            with torch.no_grad():
                output = self._model(**encoded)
                # Mean-pool the last hidden state
                attention_mask = encoded["attention_mask"]
                token_embeddings = output.last_hidden_state
                input_mask_expanded = (
                    attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
                )
                embeddings = torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(
                    input_mask_expanded.sum(1), min=1e-9
                )
                # L2 normalise
                embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)

            for vec in embeddings.cpu().float().tolist():
                all_embeddings.append(vec)

        return all_embeddings

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
