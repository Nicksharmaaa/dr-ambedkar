---
name: rag
description: Evidence-based RAG pipeline. Grounded generation using Qwen3-VL-2B (local) or cloud API fallback. ALL responses must cite specific archival sources. Zero hallucination tolerance.
---

# RAG Skill

## Purpose
Implement the evidence-grounded research assistant. Answer questions ONLY from archive evidence.

## BINDING RULES (Never violate these)
1. ALL generated answers must come from retrieved chunks
2. NEVER use model training memory as a historical source
3. NEVER fabricate: quotes, dates, citations, page numbers, document titles
4. If retrieved evidence is insufficient → return "Insufficient evidence in archive"
5. Every response must include source_chunk_ids
6. Every response must include object_id + page_number citations

## Pipeline
1. Query processing (language detect, translate, expand)
2. Retrieval (via retrieval skill)
3. Evidence assembly (select top-K chunks with metadata)
4. Context construction:
   ```
   CONTEXT:
   [CHUNK 1] Source: {title}, Page {n}, Date {date}
   {chunk_text}
   [CHUNK 2] ...

   QUESTION: {user_question}

   INSTRUCTIONS: Answer ONLY using the above context. Cite sources.
   If the context does not contain sufficient information, say so explicitly.
   Never use information from outside the provided context.
   ```
5. Generation: Qwen3-VL-2B (local) or cloud API
6. Response validation: verify all cited chunk IDs exist

## Features
- "Ask This Page": context = single page OCR text
- Research assistant: context = full search results
- Source comparison: context = multiple documents
- Knowledge graph Q&A: context = entity + relation data

## Response Schema
{
  "answer": "...",
  "confidence": 0.85,
  "source_chunks": [
    {"chunk_id": "...", "object_id": "...", "page": 42, "excerpt": "..."}
  ],
  "caveat": "..." or null
}

## API Endpoints
POST /api/v1/ai/ask - General RAG query
POST /api/v1/ai/ask-page - Ask This Page
POST /api/v1/ai/compare - Source comparison
