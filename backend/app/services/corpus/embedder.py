"""
Corpus Embedder Service — Phase 4
Generates vector embeddings for corpus chunks and search queries.
Supports:
1. Gemini Cloud Embeddings (models/gemini-embedding-001) - default when GEMINI_API_KEY is present
2. SentenceTransformers local fallback (lightweight / BAAI/bge-m3 / all-MiniLM-L6-v2)
"""
from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Sequence

from app.core.config import settings

logger = logging.getLogger("ambedkar.corpus.embedder")


class CorpusEmbedder:
    def __init__(self) -> None:
        self.provider = "gemini" if settings.gemini_api_key else "local"
        self._local_model = None

        if self.provider == "gemini":
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.gemini_api_key)
                self.gemini_model = "models/gemini-embedding-001"
                self.dimension = 768
                logger.info("CorpusEmbedder configured with Gemini Embeddings: %s", self.gemini_model)
            except Exception as e:
                logger.warning("Failed initializing Gemini embedder: %s. Falling back to local.", e)
                self.provider = "local"

        if self.provider == "local":
            self.dimension = 384  # default all-MiniLM-L6-v2
            self.local_model_name = "sentence-transformers/all-MiniLM-L6-v2"

    def _get_local_model(self):
        if self._local_model is None:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading local embedding model: %s", self.local_model_name)
            self._local_model = SentenceTransformer(self.local_model_name)
        return self._local_model

    def embed_text(self, text: str, is_query: bool = False) -> list[float]:
        """Embed a single text string."""
        if self.provider == "gemini":
            try:
                import google.generativeai as genai
                task = "retrieval_query" if is_query else "retrieval_document"
                res = genai.embed_content(
                    model=self.gemini_model,
                    content=text[:8000],  # safety cap
                    task_type=task,
                )
                return res["embedding"]
            except Exception as e:
                logger.warning("Gemini embedding failed: %s. Falling back to local.", e)
                # Fall back to local
                self.provider = "local"

        model = self._get_local_model()
        vec = model.encode(text, convert_to_numpy=True)
        return vec.tolist()

    def embed_batch(self, texts: Sequence[str], is_query: bool = False) -> list[list[float]]:
        """Embed a batch of texts."""
        if not texts:
            return []

        if self.provider == "gemini":
            results = []
            for text in texts:
                results.append(self.embed_text(text, is_query=is_query))
            return results

        model = self._get_local_model()
        vecs = model.encode(list(texts), batch_size=32, convert_to_numpy=True)
        return [v.tolist() for v in vecs]
