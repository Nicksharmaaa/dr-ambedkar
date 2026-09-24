"""
Evidence-Based RAG Service — Phase 4
Grounds answers strictly in Dr. B.R. Ambedkar's archival corpus.
Zero-hallucination tolerance: every claim must cite Volume, Chapter, Page.
Provides both full response and SSE token streaming.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, AsyncGenerator

from app.core.config import settings
from app.services.corpus.search import HybridSearchService, SearchResult

logger = logging.getLogger("ambedkar.corpus.rag")

SYSTEM_PROMPT = """You are the official Ambedkar Heritage Intelligence Assistant, an evidence-grounded AI scholar dedicated to Dr. Babasaheb Bhimrao Ramji Ambedkar's life, writings, philosophy, and parliamentary debates.

CRITICAL RULES:
1. STRICT ARCHIVAL GROUNDING: You must answer questions ONLY using the provided Archival Excerpts below.
2. ZERO HALLUCINATION: If the provided excerpts do not contain the answer, or if there is insufficient evidence, explicitly state:
   "Based strictly on the available archival texts of Dr. B. R. Ambedkar in the collection, there is insufficient evidence to directly answer this question."
3. MANDATORY CITATIONS: Every key statement, argument, or historical reference MUST include an inline citation to its source excerpt in the format:
   [Vol. X, Chapter Name, p. ~Y]
4. DIRECT QUOTATION INTEGRITY: When quoting Dr. Ambedkar, preserve his exact words within quotation marks.
5. SCHOLARLY & RESPECTFUL TONE: Maintain academic rigor, precision, and respect for historical fact.
"""


def _build_context_prompt(query: str, results: list[SearchResult]) -> str:
    """Format retrieved chunks into a structured evidence prompt."""
    evidence_blocks = []
    for idx, r in enumerate(results, 1):
        vol = f"Volume {r.vol_num}" if r.vol_num else "Unknown Vol"
        if r.part_num:
            vol += f" (Part {r.part_num})"
        chap = r.chapter or "General"
        page = f"p. ~{r.page_est}" if r.page_est else "Page unlisted"

        block = (
            f"--- [EXCERPT {idx}] ---\n"
            f"Source: {vol} | {chap} | {page}\n"
            f"Document ID: {r.doc_id} | Chunk ID: {r.chunk_id}\n"
            f"Relevance Score: {r.score:.4f}\n"
            f"Content:\n{r.text}\n"
        )
        evidence_blocks.append(block)

    joined_evidence = "\n".join(evidence_blocks)

    return (
        f"USER QUESTION:\n{query}\n\n"
        f"ARCHIVAL EXCERPTS ({len(results)} sources retrieved from the Ambedkar Archive):\n"
        f"{joined_evidence}\n\n"
        f"INSTRUCTIONS:\n"
        f"Answer the user's question using ONLY the evidence in the excerpts above. "
        f"Always provide citations in brackets such as [Vol. X, Chapter, p. ~Y]. "
        f"If the excerpts do not address the question, state so clearly."
    )


class AmbedkarRAGService:
    def __init__(self, search_service: HybridSearchService | None = None) -> None:
        self.search = search_service or HybridSearchService()
        self.model_name = settings.gemini_model or "gemini-2.0-flash"

    def _get_gemini_client(self):
        if not settings.gemini_api_key:
            return None
        try:
            from google import genai
            return genai.Client(api_key=settings.gemini_api_key)
        except ImportError:
            return None

    def _get_legacy_model(self, model_name: str):
        if not settings.gemini_api_key:
            return None
        try:
            import warnings
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", category=FutureWarning)
                import google.generativeai as genai
                genai.configure(api_key=settings.gemini_api_key)
                return genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=SYSTEM_PROMPT,
                    generation_config={
                        "temperature": 0.2,
                        "top_p": 0.95,
                        "max_output_tokens": 2048,
                    },
                )
        except ImportError:
            return None

    def _calculate_confidence(self, results: list[SearchResult]) -> float:
        """Estimate answer confidence score (0.0 to 1.0) based on retrieval quality."""
        if not results:
            return 0.0
        top_score = results[0].score
        # RRF top score with K=60 is typically between 0.016 and 0.033
        normalized = min(1.0, top_score / 0.030)
        return round(max(0.2, normalized), 2)

    def _fallback_extractive_synthesis(self, question: str, results: list[SearchResult]) -> str:
        """Construct a high-quality extractive grounded summary directly from archival excerpts."""
        lines = [
            f"Based on direct evidence retrieved from Dr. Babasaheb Ambedkar's archival corpus across {len(results)} source excerpts:\n"
        ]
        for idx, r in enumerate(results, 1):
            citation = r.citation
            # Extract first 2-3 substantive sentences
            sentences = [s.strip() for s in r.text.replace("\n", " ").split(".") if len(s.strip()) > 25]
            snippet = ". ".join(sentences[:2]) + "." if sentences else r.text[:200]
            lines.append(f"### {idx}. {citation}\n> \"{snippet}\"\n")

        lines.append(
            "\n*Note: Synthesized directly from archival records under local evidence preservation protocol.*"
        )
        return "\n".join(lines)

    async def ask(
        self,
        question: str,
        top_k: int = 6,
        vol_filter: int | None = None,
    ) -> dict[str, Any]:
        """Generate a fully grounded answer with complete citation metadata."""
        start_time = datetime.now(timezone.utc)

        # 1. Retrieve evidence chunks
        results = await self.search.search(question, top_k=top_k, vol_filter=vol_filter)

        if not results:
            return {
                "answer": "No relevant archival material was found in the Dr. Ambedkar collection for this query.",
                "confidence": 0.0,
                "citations": [],
                "sources_used": 0,
                "model": self.model_name,
                "retrieved_at": start_time.isoformat(),
            }

        # 2. Build prompt and attempt generation with fast timeout
        prompt = _build_context_prompt(question, results)
        answer_text = None
        used_model = settings.groq_model if settings.groq_api_key else (settings.gemini_model or "qwen/qwen3.8-27b")

        # 2a. Try Groq Primary API
        if settings.groq_api_key:
            import httpx

            groq_models = [settings.groq_model, "qwen/qwen3.8-27b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"]
            for candidate in groq_models:
                try:
                    headers = {
                        "Authorization": f"Bearer {settings.groq_api_key}",
                        "Content-Type": "application/json",
                    }
                    payload = {
                        "model": candidate,
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.2,
                        "max_tokens": 2048,
                        "top_p": 0.95,
                    }
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        resp = await client.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers=headers,
                            json=payload,
                        )
                        if resp.status_code == 200:
                            data = resp.json()
                            choices = data.get("choices", [])
                            if choices and "message" in choices[0]:
                                text = choices[0]["message"].get("content", "").strip()
                                if text:
                                    answer_text = text
                                    used_model = candidate
                                    break
                        else:
                            logger.warning("Groq API returned HTTP %s: %s", resp.status_code, resp.text[:120])
                except Exception as e:
                    logger.warning("Groq generation failed for %s: %s", candidate, str(e)[:100])

        # 2b. Try Gemini Fallback
        if not answer_text and settings.gemini_api_key:
            models_to_try = [settings.gemini_model, "gemini-3.6-flash", "gemini-3.8-flash"]
            genai_client = self._get_gemini_client()
            if genai_client:
                from google.genai import types

                for candidate_model in models_to_try:
                    try:
                        import asyncio

                        response = await asyncio.to_thread(
                            genai_client.models.generate_content,
                            model=candidate_model,
                            contents=prompt,
                            config=types.GenerateContentConfig(
                                system_instruction=SYSTEM_PROMPT,
                                temperature=0.2,
                                top_p=0.95,
                                max_output_tokens=2048,
                            ),
                        )
                        if response and response.text:
                            answer_text = response.text.strip()
                            used_model = candidate_model
                            break
                    except Exception as e:
                        logger.warning("google.genai generation attempt failed on %s: %s", candidate_model, str(e)[:100])

            # Try legacy google.generativeai if modern failed
            if not answer_text:
                for candidate_model in models_to_try:
                    legacy_model = self._get_legacy_model(candidate_model)
                    if not legacy_model:
                        continue
                    try:
                        import asyncio

                        response = await asyncio.to_thread(
                            legacy_model.generate_content,
                            prompt,
                            request_options={"timeout": 6.0},
                        )
                        if response and response.text:
                            answer_text = response.text.strip()
                            used_model = candidate_model
                            break
                    except Exception as e:
                        logger.warning("Legacy generation attempt failed on %s: %s", candidate_model, str(e)[:100])

        # 2c. Fallback to instant extractive archival grounding
        if not answer_text:
            logger.info("Providing direct extractive archival grounding.")
            answer_text = self._fallback_extractive_synthesis(question, results)
            used_model = "extractive-archival-grounding"

        citations = [r.to_dict() for r in results]
        confidence = self._calculate_confidence(results)

        return {
            "query": question,
            "answer": answer_text,
            "confidence": confidence,
            "citations": citations,
            "sources_used": len(results),
            "model": used_model,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    async def ask_stream(
        self,
        question: str,
        top_k: int = 6,
        vol_filter: int | None = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream answer tokens as Server-Sent Events (SSE).
        Yields JSON strings:
        - data: {"type": "citations", "citations": [...]}
        - data: {"type": "token", "text": "..."}
        - data: {"type": "done", "confidence": 0.85}
        """
        # 1. Retrieve evidence
        results = await self.search.search(question, top_k=top_k, vol_filter=vol_filter)

        if not results:
            yield json.dumps({
                "type": "error",
                "message": "No relevant archival material was found for this query.",
            })
            return

        # Emit citations first so UI can render source cards immediately
        citations = [r.to_dict() for r in results]
        yield json.dumps({"type": "citations", "citations": citations})

        # 2. Stream generation
        prompt = _build_context_prompt(question, results)
        streamed = False
        used_model = settings.groq_model if settings.groq_api_key else (settings.gemini_model or "qwen/qwen3.8-27b")

        # 2a. Stream via Groq
        if settings.groq_api_key:
            import httpx

            groq_models = [settings.groq_model, "qwen/qwen3.8-27b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"]
            for candidate in groq_models:
                try:
                    headers = {
                        "Authorization": f"Bearer {settings.groq_api_key}",
                        "Content-Type": "application/json",
                    }
                    payload = {
                        "model": candidate,
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.2,
                        "max_tokens": 2048,
                        "top_p": 0.95,
                        "stream": True,
                    }
                    async with httpx.AsyncClient(timeout=45.0) as client:
                        async with client.stream(
                            "POST",
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers=headers,
                            json=payload,
                        ) as response:
                            if response.status_code == 200:
                                async for line in response.aiter_lines():
                                    line = line.strip()
                                    if not line or not line.startswith("data: "):
                                        continue
                                    data_str = line[len("data: "):].strip()
                                    if data_str == "[DONE]":
                                        break
                                    try:
                                        chunk_data = json.loads(data_str)
                                        delta = chunk_data.get("choices", [{}])[0].get("delta", {})
                                        content = delta.get("content", "")
                                        if content:
                                            yield json.dumps({"type": "token", "text": content})
                                    except Exception:
                                        continue
                                streamed = True
                                used_model = candidate
                                break
                            else:
                                logger.warning("Groq stream HTTP %s", response.status_code)
                except Exception as e:
                    logger.warning("Groq stream failed on %s: %s", candidate, str(e)[:100])

        # 2b. Stream via Gemini if Groq did not stream
        if not streamed and settings.gemini_api_key:
            genai_client = self._get_gemini_client()
            if genai_client:
                from google.genai import types

                for candidate_model in [settings.gemini_model, "gemini-3.6-flash", "gemini-3.8-flash"]:
                    try:
                        stream = genai_client.models.generate_content_stream(
                            model=candidate_model,
                            contents=prompt,
                            config=types.GenerateContentConfig(
                                system_instruction=SYSTEM_PROMPT,
                                temperature=0.2,
                                top_p=0.95,
                                max_output_tokens=2048,
                            ),
                        )
                        for chunk in stream:
                            if chunk.text:
                                yield json.dumps({"type": "token", "text": chunk.text})
                        streamed = True
                        used_model = candidate_model
                        break
                    except Exception as e:
                        logger.warning("google.genai stream failed on %s: %s", candidate_model, str(e)[:100])

            if not streamed:
                legacy_model = self._get_legacy_model(settings.gemini_model)
                if legacy_model:
                    try:
                        response_stream = legacy_model.generate_content(prompt, stream=True)
                        for chunk in response_stream:
                            if chunk.text:
                                yield json.dumps({"type": "token", "text": chunk.text})
                        streamed = True
                        used_model = settings.gemini_model
                    except Exception as e:
                        yield json.dumps({"type": "error", "message": str(e)})

        # 2c. Fallback to extractive synthesis
        if not streamed:
            fallback = self._fallback_extractive_synthesis(question, results)
            yield json.dumps({"type": "token", "text": fallback})
            used_model = "extractive-archival-grounding"

        confidence = self._calculate_confidence(results)
        yield json.dumps({
            "type": "done",
            "confidence": confidence,
            "model": used_model,
        })
