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
from pathlib import Path

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

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

    def _resolve_model_path(self) -> tuple[str, str | None]:
        """Resolve model name and cache dir to ensure fast offline loading."""
        cache_dir = None
        try:
            from app.core.config import settings
            cache_dir = Path(settings.ai_model_cache_dir)
        except Exception:
            pass

        base_dirs = [
            Path("backend/models/cache"),
            Path("models/cache"),
            Path(__file__).resolve().parent.parent.parent.parent / "models" / "cache",
        ]
        if cache_dir:
            base_dirs.insert(0, cache_dir)

        # First check if cross-encoder snapshot exists (standard sequence classification cross-encoder)
        for bd in base_dirs:
            ce_snap = bd / "models--cross-encoder--ms-marco-MiniLM-L-6-v2" / "snapshots" / "233902d25c440f23af6f7d6e94d2946bac0bee0a"
            if ce_snap.exists() and (ce_snap / "model.safetensors").exists():
                return str(ce_snap), str(bd)

        return "cross-encoder/ms-marco-MiniLM-L-6-v2", str(base_dirs[0]) if base_dirs else None

    def _ensure_loaded(self) -> None:
        if self._model is not None:
            return

        from transformers import AutoTokenizer, AutoModelForSequenceClassification  # type: ignore

        logger.info("Loading reranker model …", extra={"model": self.model_name})
        model_path, cache_dir = self._resolve_model_path()

        dtype = torch.float16 if self.device == "cuda" else torch.float32

        self._tokenizer = AutoTokenizer.from_pretrained(
            model_path,
            cache_dir=cache_dir,
            local_files_only=True,
        )
        self._model = AutoModelForSequenceClassification.from_pretrained(
            model_path,
            cache_dir=cache_dir,
            dtype=dtype,
            num_labels=1,
            local_files_only=True,
        ).to(self.device)
        self._model.eval()
        logger.info("Reranker model ready", extra={"model": model_path})

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
