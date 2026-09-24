"""
Citation Resolver & Deep-Link Mapper — Phase 7
Maps retrieved evidence chunks into structured, verified citations with
direct links to the IIIF Document Viewer.
"""
from __future__ import annotations

import urllib.parse
from typing import Any

from app.schemas.assistant import CitationItem


def resolve_citations(
    chunks: list[dict[str, Any]],
    query: str,
) -> list[CitationItem]:
    """
    Transform evidence chunks into rich, verified citation items.
    Each citation resolves to document, page, section, source, and exact viewer deep-link.
    """
    citations: list[CitationItem] = []
    seen_pages: set[tuple[str, int | None]] = set()

    clean_q = urllib.parse.quote_plus(query.strip())

    for idx, c in enumerate(chunks, start=1):
        cid = c.get("chunk_id") or c.get("id") or f"chunk-{idx}"
        obj_id = c.get("object_id") or "AMBEDKAR-ARCHIVE"
        page_no = c.get("page_number")
        if isinstance(page_no, str):
            try:
                page_no = int(page_no)
            except ValueError:
                page_no = None

        # Deduplicate same document + page in citations list
        page_key = (obj_id, page_no)
        if page_key in seen_pages:
            continue
        seen_pages.add(page_key)

        title = c.get("object_title") or c.get("title") or obj_id
        sec_title = c.get("section_title")
        src = c.get("source_institution") or "Dr. Ambedkar Foundation"
        rerank_sc = c.get("reranker_score")

        # Build clean 1-2 sentence verbatim excerpt
        text = (c.get("text") or "").replace("\n", " ").strip()
        sentences = [s.strip() for s in text.split(". ") if len(s.strip()) > 20]
        excerpt = ". ".join(sentences[:2]) + "." if sentences else text[:200]

        # Generate exact viewer URL
        page_param = page_no if page_no is not None else 1
        viewer_url = f"/documents/{obj_id}/viewer?page={page_param}&query={clean_q}"

        citations.append(
            CitationItem(
                chunk_id=cid,
                object_id=obj_id,
                object_title=title,
                page_number=page_no,
                section_title=sec_title,
                source=src,
                excerpt=excerpt,
                viewer_url=viewer_url,
                reranker_score=float(rerank_sc) if rerank_sc is not None else None,
            )
        )

    return citations
