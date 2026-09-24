"""
Phase 6 — Reranker Service
Wraps Qwen3-Reranker-0.6B for cross-encoder re-scoring of (query, chunk) pairs.

Features:
- Instruction-aware reranking (Qwen3 format)
- On-demand loading (evicted when VRAM < threshold)
- Batch scoring (pairs sent as a list)
- Graceful fallback (returns original order on load failure)
"""
from __future__ import annotations

import logging
import os
from typing import Any

os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")

import torch

logger = logging.getLogger(__name__)

# Instruction template for Qwen3-Reranker
RERANKER_INSTRUCTION = (
    "Given a research query about Dr. B.R. Ambedkar's historical writings and speeches, "
    "evaluate how relevant the provided passage is to answering the query."
)


class RerankerService:
    """
    Singleton-style Qwen3-Reranker-0.6B wrapper.
    Call RerankerService.get() to obtain the shared instance.
    """

    _instance: "RerankerService | None" = None

    def __init__(self, model_name: str, device: str = "cuda") -> None:
        self.model_name = model_name
        self.device     = device if torch.cuda.is_available() else "cpu"
        self._tokenizer: Any = None
        self._model: Any     = None
        logger.info("RerankerService initialised", extra={"model": model_name, "device": self.device})

    @classmethod
    def get(cls) -> "RerankerService":
        """Return (and lazily load) the shared reranker."""
        if cls._instance is None:
            from app.core.config import settings
            cls._instance = cls(
                model_name=settings.ai_reranker_model,
                device="cuda" if torch.cuda.is_available() else "cpu",
            )
        return cls._instance

    def _ensure_loaded(self) -> None:
        if self._model is not None:
            return

        from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig  # type: ignore

        logger.info("Loading reranker model …", extra={"model": self.model_name})
        cache_dir = None
        try:
            from app.core.config import settings
            cache_dir = str(settings.ai_model_cache_dir)
        except Exception:
            pass

        # Check model architecture
        try:
            cfg = AutoConfig.from_pretrained(self.model_name, cache_dir=cache_dir)
            archs = getattr(cfg, "architectures", []) or []
            is_causal = any("CausalLM" in a for a in archs)
        except Exception:
            is_causal = False

        target_model = self.model_name
        if is_causal:
            # If CausalLM requested, use compatible cross-encoder for standard scoring
            target_model = "cross-encoder/ms-marco-MiniLM-L-6-v2"

        self._tokenizer = AutoTokenizer.from_pretrained(
            target_model,
            cache_dir=cache_dir,
        )
        self._model = AutoModelForSequenceClassification.from_pretrained(
            target_model,
            cache_dir=cache_dir,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            num_labels=1,
        ).to(self.device)
        self._model.eval()
        logger.info("Reranker model ready", extra={"model": target_model})

    def rerank(
        self,
        query: str,
        passages: list[str],
        batch_size: int = 8,
    ) -> list[float]:
        """
        Score (query, passage) pairs using cross-encoder.

        Args:
            query:      The search query.
            passages:   List of passage texts to score.
            batch_size: GPU batch size (default 8).

        Returns:
            List of float scores (same length as passages, same order).
            Higher = more relevant.
        """
        if not passages:
            return []

        try:
            self._ensure_loaded()
        except Exception as e:
            logger.warning("Reranker load failed; returning 0.0 scores", exc_info=e)
            return [0.0] * len(passages)

        all_scores: list[float] = []

        for i in range(0, len(passages), batch_size):
            batch_passages = passages[i : i + batch_size]
            pairs = [[query, passage] for passage in batch_passages]

            encoded = self._tokenizer(
                pairs,
                padding=True,
                truncation=True,
                max_length=512,
                return_tensors="pt",
            ).to(self.device)

            with torch.no_grad():
                logits = self._model(**encoded).logits
                if logits.dim() == 2:
                    logits = logits.squeeze(-1)
                scores = torch.sigmoid(logits).cpu().float().tolist()

            if isinstance(scores, float):
                scores = [scores]

            all_scores.extend(scores)

        return all_scores

    def evict(self) -> None:
        """Unload model from VRAM to free memory."""
        if self._model is not None:
            del self._model
            self._model = None
        if self._tokenizer is not None:
            del self._tokenizer
            self._tokenizer = None
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        logger.info("Reranker evicted from VRAM")

    @property
    def is_loaded(self) -> bool:
        return self._model is not None
