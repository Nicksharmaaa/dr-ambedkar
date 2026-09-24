"""
Structure-Aware Chunker — Phase 4
Converts a CorpusDocument into database-ready Chunk records.

Strategy:
- Chunks respect paragraph and chapter boundaries (never mid-sentence)
- Target: 512 tokens with 64-token overlap
- Token counting: tiktoken cl100k_base (closest available to bge-m3 tokenizer)
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone

try:
    import tiktoken
    _enc = tiktoken.get_encoding("cl100k_base")
    def _count_tokens(text: str) -> int:
        return len(_enc.encode(text))
except Exception:
    # Fallback: rough word-based estimate
    def _count_tokens(text: str) -> int:  # type: ignore
        return len(text.split()) * 4 // 3


from app.services.corpus.parser import CorpusDocument, Chapter, Section, Paragraph

TARGET_TOKENS   = 512
OVERLAP_TOKENS  = 64
MIN_CHUNK_TOKENS = 30     # discard trivially small fragments


@dataclass
class Chunk:
    id: str
    doc_id: str
    vol_num: int
    part_num: int | None
    chapter: str | None
    section: str | None
    page_est: int | None
    chunk_index: int
    char_start: int
    char_end: int
    text: str
    token_count: int
    language: str
    created_at: str


def _make_chunk(
    doc_id: str,
    vol_num: int,
    part_num: int | None,
    chapter: str | None,
    section: str | None,
    page_est: int | None,
    chunk_index: int,
    text: str,
    char_start: int,
    language: str = "en",
) -> Chunk:
    token_count = _count_tokens(text)
    return Chunk(
        id=str(uuid.uuid4()),
        doc_id=doc_id,
        vol_num=vol_num,
        part_num=part_num,
        chapter=chapter,
        section=section,
        page_est=page_est,
        chunk_index=chunk_index,
        char_start=char_start,
        char_end=char_start + len(text),
        text=text,
        token_count=token_count,
        language=language,
        created_at=datetime.now(timezone.utc).isoformat(),
    )


def chunk_document(doc: CorpusDocument) -> list[Chunk]:
    """
    Convert a CorpusDocument into a flat list of Chunk records.
    """
    chunks: list[Chunk] = []
    chunk_index = 0
    char_cursor = 0     # approximate — we track offset in the assembled text stream

    for chapter in doc.chapters:
        chapter_label = chapter.heading or f"Chapter {chapter.chapter_num}"

        for section in chapter.sections:
            section_label = section.heading

            # Accumulate paragraphs into chunks
            pending_tokens = 0
            pending_paras: list[Paragraph] = []
            pending_page: int | None = section.page_est

            def flush() -> None:
                nonlocal pending_tokens, pending_paras, pending_page, chunk_index, char_cursor

                if not pending_paras:
                    return

                text = "\n\n".join(p.text for p in pending_paras)
                tc = _count_tokens(text)
                if tc < MIN_CHUNK_TOKENS:
                    pending_paras.clear()
                    pending_tokens = 0
                    return

                chunk = _make_chunk(
                    doc_id=doc.archival_id,
                    vol_num=doc.vol_num,
                    part_num=doc.part_num,
                    chapter=chapter_label,
                    section=section_label,
                    page_est=pending_page,
                    chunk_index=chunk_index,
                    text=text,
                    char_start=char_cursor,
                )
                chunks.append(chunk)
                chunk_index += 1
                char_cursor += len(text) + 2

                # Keep last paragraph as overlap for next chunk
                overlap_para = pending_paras[-1]
                pending_paras.clear()
                pending_tokens = 0

                overlap_tokens = _count_tokens(overlap_para.text)
                if overlap_tokens <= OVERLAP_TOKENS:
                    pending_paras.append(overlap_para)
                    pending_tokens = overlap_tokens

            for para in section.paragraphs:
                pt = _count_tokens(para.text)

                if pending_tokens + pt > TARGET_TOKENS and pending_paras:
                    flush()

                # If single paragraph exceeds target, split it by sentences
                if pt > TARGET_TOKENS:
                    sentences = para.text.replace("! ", ". ").replace("? ", ". ").split(". ")
                    current_sentences: list[str] = []
                    current_tokens = 0
                    for sent in sentences:
                        st = _count_tokens(sent)
                        if current_tokens + st > TARGET_TOKENS and current_sentences:
                            sub_text = ". ".join(current_sentences) + "."
                            sub_chunk = _make_chunk(
                                doc_id=doc.archival_id,
                                vol_num=doc.vol_num,
                                part_num=doc.part_num,
                                chapter=chapter_label,
                                section=section_label,
                                page_est=para.page_est,
                                chunk_index=chunk_index,
                                text=sub_text,
                                char_start=char_cursor,
                            )
                            if sub_chunk.token_count >= MIN_CHUNK_TOKENS:
                                chunks.append(sub_chunk)
                                chunk_index += 1
                                char_cursor += len(sub_text) + 2
                            current_sentences = [sent]
                            current_tokens = st
                        else:
                            current_sentences.append(sent)
                            current_tokens += st
                    if current_sentences:
                        remaining = Paragraph(
                            text=". ".join(current_sentences),
                            page_est=para.page_est,
                        )
                        pending_paras.append(remaining)
                        pending_tokens += current_tokens
                else:
                    pending_paras.append(para)
                    pending_tokens += pt
                    if pending_page is None:
                        pending_page = para.page_est

            flush()

    return chunks
