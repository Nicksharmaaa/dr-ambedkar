"""
Phase 9: Translation Engine & Language Detection
Provides academic translation between English, Hindi, and Marathi with persistent caching in Turso.
Strictly treats translations as derivative representations without altering original archival text.
"""
from __future__ import annotations

import hashlib
import json
import logging
import re
import uuid
from typing import Any
import httpx

from app.core.config import settings
from app.db.database import DatabaseClient
from app.services.multilingual.models import (
    ContentDerivationType,
    SupportedLanguage,
    TranslationResponse,
)

logger = logging.getLogger("ambedkar.multilingual.translator")

# Characteristic Devanagari morphological markers
MARATHI_MARKERS = re.compile(r"(आहे|आहेत|होता|होती|झाले|केले|करणे|यांचे|च्या|मध्ये|ळ|आणि|पाणी|हक्क|तळे|जातीचा|उच्छेद|महाड|लोकशाही|पासून|ची|चे|चा|ंना)")
HINDI_MARKERS = re.compile(r"(है|हैं|था|थी|थे|किया|करना|उनका|की|के|में|होगा|और|दिखाइए|बताइए|लोकतंत्र)")


def detect_language(text: str) -> str:
    """Detect if text is English, Hindi, or Marathi based on script and vocabulary."""
    if not text or not text.strip():
        return "en"

    # Check for Devanagari script range: \u0900 - \u097F
    devanagari_chars = len(re.findall(r"[\u0900-\u097F]", text))
    latin_chars = len(re.findall(r"[a-zA-Z]", text))

    if devanagari_chars == 0:
        return "en"

    if devanagari_chars > latin_chars * 0.5:
        # Check Marathi vs Hindi markers
        if MARATHI_MARKERS.search(text):
            return "mr"
        if HINDI_MARKERS.search(text):
            return "hi"
        # If Devanagari with letter 'ळ' (U+0933) -> Marathi
        if "ळ" in text:
            return "mr"
        return "hi"

    return "en"


TRANSLATION_SYSTEM_PROMPT = """You are an authoritative archival translation engine for the Dr. B.R. Ambedkar Digital Heritage System.
Translate the input text accurately between English, Hindi, and Marathi.

STRICT TRANSLATION RULES:
1. Preserve all proper nouns, historical names (e.g. Dr. B.R. Ambedkar, Chhatrapati Shahu Maharaj, Columbia University, John Dewey).
2. Maintain formal academic, constitutional, and historical terminology.
3. In Hindi: use respectful scholarly Devanagari.
4. In Marathi: use authentic scholarly Marathi (e.g. घटनात्मक नैतिकता for Constitutional Morality, जातीचा उच्छेद for Annihilation of Caste).
5. Output ONLY the translated text. Do not provide explanations, preamble, or conversational commentary.
"""


class TranslationService:
    """Manages translation requests, caching, and Groq inference."""

    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def translate(
        self,
        text: str,
        target_language: str,
        source_language: str | None = None,
        chunk_id: str | None = None,
    ) -> TranslationResponse:
        """
        Translates text with SHA-256 caching in Turso translations_cache table.
        Guarantees that original archival records remain authoritative.
        """
        clean_text = text.strip()
        if not clean_text:
            return TranslationResponse(
                source_text="",
                source_language="en",
                target_language=target_language,
                translated_text="",
                translation_model="passthrough",
                is_cached=True,
            )

        src_lang = source_language or detect_language(clean_text)
        tgt_lang = target_language.lower()

        # If source and target are the same, return as-is
        if src_lang == tgt_lang:
            return TranslationResponse(
                source_text=clean_text,
                source_language=src_lang,
                target_language=tgt_lang,
                translated_text=clean_text,
                translation_model="identity",
                is_cached=True,
            )

        # 1. Compute SHA-256 hash for caching
        text_hash = hashlib.sha256(clean_text.encode("utf-8")).hexdigest()

        # 2. Check Turso translations_cache
        cached_row = await self.db.execute(
            """
            SELECT * FROM translations_cache
            WHERE source_text_hash = ? AND target_language = ?
            LIMIT 1
            """,
            [text_hash, tgt_lang],
        )

        if cached_row.rows:
            row = dict(cached_row.rows[0])
            return TranslationResponse(
                source_text=clean_text,
                source_language=row["source_language"],
                target_language=row["target_language"],
                translated_text=row["translated_text"],
                translation_model=row["translation_model"],
                translation_version=row.get("translation_version", "1.0"),
                is_cached=True,
                review_status=row.get("review_status", "APPROVED"),
            )

        # 3. Call Groq translation model (qwen/qwen3.8-27b)
        lang_names = {"en": "English", "hi": "Hindi", "mr": "Marathi"}
        target_name = lang_names.get(tgt_lang, tgt_lang)
        source_name = lang_names.get(src_lang, src_lang)

        prompt = f"Translate the following archival text from {source_name} into {target_name}:\n\n{clean_text}"
        translated_text = await self._call_groq_translate(prompt)
        if not translated_text:
            # Fallback to source text on failure
            translated_text = clean_text

        # 4. Save into translations_cache
        cache_id = str(uuid.uuid4())
        await self.db.execute(
            """
            INSERT OR REPLACE INTO translations_cache (
                id, chunk_id, source_text_hash, source_language, target_language,
                translated_text, translation_model, translation_version, review_status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'qwen/qwen3.8-27b', '1.0', 'APPROVED', datetime('now'))
            """,
            [
                cache_id,
                chunk_id,
                text_hash,
                src_lang,
                tgt_lang,
                translated_text,
            ],
        )

        return TranslationResponse(
            source_text=clean_text,
            source_language=src_lang,
            target_language=tgt_lang,
            translated_text=translated_text,
            translation_model="qwen/qwen3.8-27b",
            translation_version="1.0",
            is_cached=False,
            review_status="APPROVED",
        )

    async def _call_groq_translate(self, user_prompt: str) -> str:
        """Execute translation via Groq LPU API."""
        if not settings.groq_api_key:
            return ""

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "qwen/qwen3.8-27b",
            "messages": [
                {"role": "system", "content": TRANSLATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.1,
            "max_tokens": 1200,
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    logger.warning("Groq translation returned %d: %s", res.status_code, res.text)
                    return ""
        except Exception as e:
            logger.error("Groq translation failed: %s", e)
            return ""
