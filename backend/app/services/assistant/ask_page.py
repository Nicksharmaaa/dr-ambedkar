"""
Phase 9: Ask This Page Signature Service
Provides interactive, source-grounded inquiry on any active archival document page.
Strictly distinguishes between 'Source: Current Page' and supplementary related archival sources.
"""
from __future__ import annotations

import logging
from enum import Enum
from typing import Any, Optional
import httpx
from pydantic import BaseModel, Field

from app.core.config import settings
from app.db.database import DatabaseClient
from app.services.multilingual.translator import TranslationService, detect_language
from app.services.media.tts_service import TTSService

logger = logging.getLogger("ambedkar.assistant.ask_page")


class PageAction(str, Enum):
    SUMMARIZE = "SUMMARIZE"
    EXPLAIN = "EXPLAIN"
    TRANSLATE = "TRANSLATE"
    READ_ALOUD = "READ_ALOUD"
    IDENTIFY_ENTITIES = "IDENTIFY_ENTITIES"
    CUSTOM_QUESTION = "CUSTOM_QUESTION"


class AskPageRequest(BaseModel):
    object_id: str
    page_number: int
    action: PageAction = PageAction.SUMMARIZE
    question: Optional[str] = None
    target_language: str = "en"  # "en", "hi", "mr"


class AskPageResponse(BaseModel):
    object_id: str
    page_number: int
    action: PageAction
    language: str
    answer: str
    source_attribution: str = "Current Page"
    current_page_citation: dict[str, Any]
    related_citations: list[dict[str, Any]] = Field(default_factory=list)
    audio_url: Optional[str] = None
    model_name: str = "qwen/qwen3.8-27b"
    took_ms: float = 0.0


ASK_PAGE_SYSTEM_PROMPTS = {
    PageAction.SUMMARIZE: """You are an archival scholar summarizing a single printed page from Dr. B.R. Ambedkar's corpus.
Provide a clear, accurate 2-paragraph summary based ONLY on the provided page text.
Do not hallucinate external facts. Mention key arguments, names, and concepts.""",

    PageAction.EXPLAIN: """You are a teacher explaining a historical or legal page from Dr. B.R. Ambedkar's writings.
Explain the concepts, context, and core argument of this page in simple, accessible language.
Strictly base your explanation on the provided page text.""",

    PageAction.IDENTIFY_ENTITIES: """You are an entity extractor. Identify all people, organizations, historical events, publications, and philosophical/constitutional concepts mentioned on this page.
Output as a clean markdown bulleted list with a one-sentence archival context for each.""",

    PageAction.CUSTOM_QUESTION: """You are an archival reference librarian for the Dr. B.R. Ambedkar Digital Heritage System.
Answer the user's specific question strictly using the provided page text.
If the page does not contain the answer, explicitly state that this specific page does not discuss that topic.""",
}


class AskPageEngine:
    """Processes page-level inquiries with strict provenance and citation integrity."""

    def __init__(self, db: DatabaseClient) -> None:
        self.db = db
        self.translator = TranslationService(db)
        self.tts = TTSService(db)

    async def execute(self, req: AskPageRequest) -> AskPageResponse:
        import time
        t0 = time.perf_counter()

        # 1. Fetch current page text chunks
        chunks = await self.db.execute(
            """
            SELECT c.*, ao.title as document_title
            FROM document_chunks c
            JOIN archival_objects ao ON ao.id = c.object_id
            WHERE c.object_id = ? AND c.page_number = ?
            ORDER BY c.chunk_index ASC
            """,
            [req.object_id, req.page_number],
        )

        if not chunks.rows:
            return AskPageResponse(
                object_id=req.object_id,
                page_number=req.page_number,
                action=req.action,
                language=req.target_language,
                answer="No text is indexed for this page facsimile. Please check that the document has been OCR-processed.",
                current_page_citation={"source": "Current Page", "document_id": req.object_id, "page_number": req.page_number},
            )

        doc_title = chunks.rows[0]["document_title"]
        page_text = "\n\n".join(r["text"] for r in chunks.rows)

        current_citation = {
            "source": "Current Page",
            "document_id": req.object_id,
            "document_title": doc_title,
            "page_number": req.page_number,
            "chunk_count": len(chunks.rows),
        }

        # Handle Action: READ_ALOUD
        if req.action == PageAction.READ_ALOUD:
            tts_res = await self.tts.synthesize(
                text=page_text[:1200],  # synthesize first 1200 chars for responsive reading
                language=req.target_language,
            )
            dt = (time.perf_counter() - t0) * 1000
            return AskPageResponse(
                object_id=req.object_id,
                page_number=req.page_number,
                action=PageAction.READ_ALOUD,
                language=req.target_language,
                answer=f"Generated audio narration for Page {req.page_number} ({doc_title}).",
                current_page_citation=current_citation,
                audio_url=tts_res.get("audio_url"),
                took_ms=round(dt, 2),
            )

        # Handle Action: TRANSLATE
        if req.action == PageAction.TRANSLATE:
            trans_res = await self.translator.translate(
                text=page_text[:1800],
                target_language=req.target_language,
                source_language="en",
                chunk_id=chunks.rows[0]["id"],
            )
            dt = (time.perf_counter() - t0) * 1000
            return AskPageResponse(
                object_id=req.object_id,
                page_number=req.page_number,
                action=PageAction.TRANSLATE,
                language=req.target_language,
                answer=trans_res.translated_text,
                current_page_citation=current_citation,
                took_ms=round(dt, 2),
            )

        # Handle AI Generation Actions (SUMMARIZE, EXPLAIN, IDENTIFY_ENTITIES, CUSTOM_QUESTION)
        sys_prompt = ASK_PAGE_SYSTEM_PROMPTS.get(req.action, ASK_PAGE_SYSTEM_PROMPTS[PageAction.SUMMARIZE])
        
        # If target language is Hindi or Marathi, add language instruction to prompt
        lang_instruction = ""
        if req.target_language == "hi":
            lang_instruction = "\nIMPORTANT: Answer fluently in Hindi (हिंदी) while preserving proper nouns."
        elif req.target_language == "mr":
            lang_instruction = "\nIMPORTANT: Answer fluently in Marathi (मराठी) while preserving proper nouns."

        user_content = (
            f"SOURCE: {doc_title} (Page {req.page_number})\n\n"
            f"PAGE CONTENT:\n{page_text[:2500]}\n"
        )
        if req.action == PageAction.CUSTOM_QUESTION and req.question:
            user_content += f"\nUSER QUESTION: {req.question}\n"

        answer = await self._call_groq_llm(sys_prompt + lang_instruction, user_content)
        if not answer:
            answer = f"Summary of Page {req.page_number} in {doc_title}."

        dt = (time.perf_counter() - t0) * 1000

        return AskPageResponse(
            object_id=req.object_id,
            page_number=req.page_number,
            action=req.action,
            language=req.target_language,
            answer=answer,
            source_attribution="Current Page",
            current_page_citation=current_citation,
            related_citations=[],
            took_ms=round(dt, 2),
        )

    async def _call_groq_llm(self, system_prompt: str, user_content: str) -> str:
        """Execute Groq LLM inference for Ask This Page."""
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
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0.2,
            "max_tokens": 1000,
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
                return ""
        except Exception as e:
            logger.error("Groq Ask This Page LLM call failed: %s", e)
            return ""
