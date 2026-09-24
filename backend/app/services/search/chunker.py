"""
Phase 6 — Chunking Engine
Splits page OCR text into overlapping sentence-aware chunks.

Strategy:
- Target: 512 tokens (~2000 chars) per chunk
- Overlap: 64 tokens (~250 chars)
- Boundary: sentence-aware (split on '. ', '? ', '! ', '\n\n')
- Preserves: object_id, page_id, page_number, volume_number, language

This module is stateless — it takes page dicts and returns chunk dicts.
"""
from __future__ import annotations

import re
from typing import Any


# ── Constants ─────────────────────────────────────────────────────────────────

CHUNK_SIZE_CHARS = 2000      # ~512 tokens at ~4 chars/token
OVERLAP_CHARS    = 250       # ~64 tokens overlap

# Sentence boundary pattern — split after . ? ! or double newline
_SENT_BOUNDARY = re.compile(r'(?<=[.!?])\s+|\n\n+')


# ── Public API ────────────────────────────────────────────────────────────────

def chunk_page(
    page: dict[str, Any],
    object_id: str,
    chunk_index_start: int = 0,
) -> list[dict[str, Any]]:
    """
    Split a single page's OCR text into overlapping sentence-aware chunks.

    Args:
        page:              Row from the `pages` table (dict).
        object_id:         Parent archival object ID.
        chunk_index_start: Offset for chunk_index numbering (for sequential numbering across pages).

    Returns:
        List of chunk dicts ready for bulk_insert_chunks().
    """
    text: str = (page.get("ocr_text") or "").strip()
    if not text:
        return []

    page_id      = page.get("id", "")
    page_number  = page.get("page_number", 0)
    volume_num   = page.get("volume_number") or page.get("label") or ""
    language     = page.get("language", "en")
    section_title = page.get("section_title") or ""

    # Split text into sentence tokens
    sentences = _split_into_sentences(text)

    # Build overlapping windows
    chunks_text = _build_chunks(sentences, CHUNK_SIZE_CHARS, OVERLAP_CHARS)

    results = []
    for i, chunk_text in enumerate(chunks_text):
        chunk_text = chunk_text.strip()
        if not chunk_text:
            continue
        results.append({
            "object_id":     object_id,
            "page_id":       page_id if page_id else None,
            "chunk_index":   chunk_index_start + i,
            "text":          chunk_text,
            "language":      language,
            "token_count":   _estimate_tokens(chunk_text),
            "char_count":    len(chunk_text),
            "volume_number": str(volume_num) if volume_num else None,
            "page_number":   page_number,
            "section_title": section_title or None,
            "is_header":     False,
            "is_footnote":   False,
        })

    return results


def chunk_pages(
    pages: list[dict[str, Any]],
    object_id: str,
) -> list[dict[str, Any]]:
    """
    Chunk an ordered list of pages from one archival object.
    Returns all chunks with sequential chunk_index values.
    """
    all_chunks: list[dict[str, Any]] = []
    idx = 0
    for page in pages:
        page_chunks = chunk_page(page, object_id, chunk_index_start=idx)
        all_chunks.extend(page_chunks)
        idx += len(page_chunks)
    return all_chunks


# ── Internals ──────────────────────────────────────────────────────────────────

def _split_into_sentences(text: str) -> list[str]:
    """Split text into sentence-like units using regex boundaries."""
    parts = _SENT_BOUNDARY.split(text)
    # Re-add stripped trailing space/newline to maintain spacing
    sentences = []
    for p in parts:
        p = p.strip()
        if p:
            sentences.append(p)
    return sentences


def _build_chunks(
    sentences: list[str],
    max_chars: int,
    overlap_chars: int,
) -> list[str]:
    """
    Build overlapping text chunks from a list of sentences.
    Each chunk is at most max_chars characters.
    Consecutive chunks overlap by overlap_chars.
    """
    if not sentences:
        return []

    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for sent in sentences:
        sent_len = len(sent) + 1  # +1 for space separator

        if current_len + sent_len > max_chars and current:
            # Emit current chunk
            chunk_text = " ".join(current)
            chunks.append(chunk_text)

            # Rollback: keep tail sentences for overlap
            overlap_buf: list[str] = []
            overlap_len = 0
            for s in reversed(current):
                if overlap_len + len(s) + 1 > overlap_chars:
                    break
                overlap_buf.insert(0, s)
                overlap_len += len(s) + 1

            current = overlap_buf
            current_len = overlap_len

        current.append(sent)
        current_len += sent_len

    # Emit final chunk
    if current:
        chunks.append(" ".join(current))

    return chunks


def _estimate_tokens(text: str) -> int:
    """Rough token count estimate: ~4 chars per token."""
    return max(1, len(text) // 4)
