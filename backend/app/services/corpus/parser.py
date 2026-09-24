"""
Corpus Text Parser — Phase 4
Parses DjVu-extracted text into structured chapters, sections, and paragraphs.
Input:  raw .txt file content (DjVu text layer)
Output: CorpusDocument with chapters → sections → paragraphs
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field


# ── Data structures ───────────────────────────────────────────────────────────

@dataclass
class Paragraph:
    text: str
    page_est: int | None = None
    block_type: str = "paragraph"   # paragraph | footnote | list_item | caption


@dataclass
class Section:
    heading: str | None
    page_est: int | None
    paragraphs: list[Paragraph] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        parts = []
        if self.heading:
            parts.append(self.heading)
        parts.extend(p.text for p in self.paragraphs)
        return "\n\n".join(parts)


@dataclass
class Chapter:
    heading: str | None
    page_est: int | None
    chapter_num: int | None
    sections: list[Section] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        parts = []
        if self.heading:
            parts.append(self.heading)
        for s in self.sections:
            parts.append(s.full_text)
        return "\n\n".join(parts)


@dataclass
class CorpusDocument:
    archival_id: str
    vol_num: int
    part_num: int | None
    title: str
    filename: str
    chapters: list[Chapter] = field(default_factory=list)
    raw_word_count: int = 0
    raw_line_count: int = 0

    @property
    def total_paragraphs(self) -> int:
        return sum(
            len(s.paragraphs)
            for ch in self.chapters
            for s in ch.sections
        )


# ── Parser ────────────────────────────────────────────────────────────────────

# Regexes for structural markers in DjVu text
_PAGE_NUMBER_RE = re.compile(r"^\s*(\d{1,4})\s*$")
_RUNNING_HEADER_RE = re.compile(
    r"^\s*(?:\d+\s+)?(?:[A-Z][A-Z\s\-\:\&\']{3,60})(?:\s+\d+)?\s*$"
)
_CHAPTER_HEADING_RE = re.compile(
    r"^\s*(?:CHAPTER|PART|SECTION|APPENDIX|PREFACE|FOREWORD|INTRODUCTION|"
    r"CONCLUSION|INDEX|BIBLIOGRAPHY|CONTENTS|ANNEX)\b",
    re.IGNORECASE,
)
_ROMAN_RE = re.compile(r"^\s*[IVXLCDM]{1,6}\s*$")
_FOOTNOTE_RE = re.compile(r"^\s*\d+\s+[A-Z]")  # e.g. "1 The term caste..."
_TYPOGRAPHIC_ARTIFACT_RE = re.compile(r"[\u2014\u2013\u2018\u2019\u201c\u201d\u2022]")


def _clean_line(line: str) -> str:
    """Normalize typographic chars to ASCII equivalents."""
    line = line.replace("\u2014", "--").replace("\u2013", "-")
    line = line.replace("\u2018", "'").replace("\u2019", "'")
    line = line.replace("\u201c", '"').replace("\u201d", '"')
    line = line.replace("\u2022", "*")
    return line


def _is_noise_line(line: str) -> bool:
    """Return True if line is structural noise (page number, running header, roman numeral)."""
    stripped = line.strip()
    if not stripped:
        return False
    if _PAGE_NUMBER_RE.match(stripped):
        return True
    if _ROMAN_RE.match(stripped):
        return True
    return False


def _estimate_page(line_num: int, total_lines: int, estimated_pages: int) -> int:
    """Linearly map line number to estimated page number."""
    if total_lines == 0:
        return 1
    return max(1, int((line_num / total_lines) * estimated_pages))


def _is_chapter_heading(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    # All-caps line of reasonable length
    if stripped.upper() == stripped and 3 < len(stripped) <= 80 and stripped[0].isalpha():
        return True
    if _CHAPTER_HEADING_RE.match(stripped):
        return True
    return False


def parse_volume(
    content: str,
    archival_id: str,
    vol_num: int,
    part_num: int | None,
    title: str,
    filename: str,
) -> CorpusDocument:
    """
    Parse a full DjVu text volume into a CorpusDocument.
    """
    lines = content.splitlines()
    total_lines = len(lines)
    estimated_pages = max(1, total_lines // 40)

    doc = CorpusDocument(
        archival_id=archival_id,
        vol_num=vol_num,
        part_num=part_num,
        title=title,
        filename=filename,
        raw_word_count=len(content.split()),
        raw_line_count=total_lines,
    )

    # ── First pass: group lines into paragraph blocks ─────────────────────────
    current_chapter: Chapter = Chapter(
        heading="[PREAMBLE]", page_est=1, chapter_num=0
    )
    current_section: Section = Section(heading=None, page_est=1)
    current_para_lines: list[str] = []
    current_page = 1
    chapter_num = 0

    def flush_paragraph() -> None:
        nonlocal current_para_lines
        text = " ".join(
            _clean_line(l) for l in current_para_lines if l.strip()
        ).strip()
        if len(text) > 20:  # discard very short fragments
            block_type = "footnote" if _FOOTNOTE_RE.match(current_para_lines[0] if current_para_lines else "") else "paragraph"
            current_section.paragraphs.append(
                Paragraph(text=text, page_est=current_page, block_type=block_type)
            )
        current_para_lines.clear()

    def flush_section() -> None:
        flush_paragraph()
        if current_section.paragraphs:
            current_chapter.sections.append(current_section)

    def flush_chapter() -> None:
        flush_section()
        if current_chapter.sections:
            doc.chapters.append(current_chapter)

    for line_idx, line in enumerate(lines):
        page_est = _estimate_page(line_idx, total_lines, estimated_pages)

        if _is_noise_line(line):
            # Update page tracker but don't add to paragraphs
            if _PAGE_NUMBER_RE.match(line.strip()):
                current_page = page_est
            continue

        if not line.strip():
            # Blank line = paragraph separator
            flush_paragraph()
            continue

        if _is_chapter_heading(line):
            # New chapter detected
            flush_chapter()
            chapter_num += 1
            current_chapter = Chapter(
                heading=_clean_line(line).strip(),
                page_est=page_est,
                chapter_num=chapter_num,
            )
            current_section = Section(heading=None, page_est=page_est)
            current_page = page_est
            continue

        current_para_lines.append(line)

    # Flush remaining
    flush_chapter()

    return doc
