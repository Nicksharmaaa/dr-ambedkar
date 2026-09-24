"""
ALTO XML Generation Service (Library of Congress ALTO v4.2).
Generates standards-compliant ALTO XML layout files with word-level and line-level
spatial coordinates on standard archival folios (1800 x 2700 px at 300 DPI).
"""
from __future__ import annotations

import html
import re
from typing import Any


PAGE_WIDTH = 1800
PAGE_HEIGHT = 2700
MARGIN_LEFT = 150
MARGIN_TOP = 180
CONTENT_WIDTH = 1500
CONTENT_HEIGHT = 2340
LINE_HEIGHT = 48
CHAR_WIDTH = 18
SPACE_WIDTH = 14


def generate_alto_xml(
    doc_id: str,
    page_number: int,
    page_id: str,
    text: str,
    chapter_title: str | None = None,
) -> str:
    """
    Generate valid Library of Congress ALTO v4.2 XML from page text and metadata.
    Synthesizes precise spatial coordinates for blocks, lines, and words.
    """
    safe_doc_id = html.escape(doc_id)
    safe_page_id = html.escape(page_id)
    
    # Split text into paragraphs
    raw_paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    if not raw_paras:
        raw_paras = [text.strip()] if text.strip() else [""]

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<alto xmlns="http://www.loc.gov/standards/alto/ns-v4#"',
        '      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        '      xsi:schemaLocation="http://www.loc.gov/standards/alto/ns-v4# http://www.loc.gov/standards/alto/v4/alto-4-2.xsd">',
        '  <Description>',
        '    <MeasurementUnit>pixel</MeasurementUnit>',
        '    <sourceImageInformation>',
        f'      <fileName>{safe_page_id}.svg</fileName>',
        '    </sourceImageInformation>',
        '    <OCRProcessing ID="OCR_0">',
        '      <ocrProcessingStep>',
        '        <processingSoftware>',
        '          <softwareCreator>Ambedkar Heritage Preservation Engine</softwareCreator>',
        '          <softwareName>Ambedkar-ALTO-Layout-Synthesizer</softwareName>',
        '          <softwareVersion>5.0.0</softwareVersion>',
        '        </processingSoftware>',
        '      </ocrProcessingStep>',
        '    </OCRProcessing>',
        '  </Description>',
        '  <Layout>',
        f'    <Page ID="{safe_page_id}" PHYSICAL_IMG_NR="{page_number}" WIDTH="{PAGE_WIDTH}" HEIGHT="{PAGE_HEIGHT}">',
        f'      <TopMargin HPOS="0" VPOS="0" WIDTH="{PAGE_WIDTH}" HEIGHT="{MARGIN_TOP}">',
    ]

    # Running header in top margin if chapter available
    if chapter_title:
        safe_ch = html.escape(chapter_title[:80])
        xml_lines.append(
            f'        <TextBlock ID="header_{page_number}" HPOS="{MARGIN_LEFT}" VPOS="70" WIDTH="{CONTENT_WIDTH}" HEIGHT="40">'
        )
        xml_lines.append(
            f'          <TextLine ID="header_line_{page_number}" HPOS="{MARGIN_LEFT}" VPOS="70" WIDTH="{CONTENT_WIDTH}" HEIGHT="40">'
        )
        xml_lines.append(
            f'            <String CONTENT="{safe_ch}" HPOS="{MARGIN_LEFT}" VPOS="70" WIDTH="800" HEIGHT="36" WC="0.99"/>'
        )
        xml_lines.append(
            f'            <String CONTENT="[Page {page_number}]" HPOS="{MARGIN_LEFT + CONTENT_WIDTH - 200}" VPOS="70" WIDTH="200" HEIGHT="36" WC="0.99"/>'
        )
        xml_lines.append('          </TextLine>')
        xml_lines.append('        </TextBlock>')

    xml_lines.append('      </TopMargin>')
    xml_lines.append(
        f'      <PrintSpace HPOS="{MARGIN_LEFT}" VPOS="{MARGIN_TOP}" WIDTH="{CONTENT_WIDTH}" HEIGHT="{CONTENT_HEIGHT}">'
    )

    current_vpos = MARGIN_TOP + 20
    block_idx = 0
    string_idx = 0

    for para_idx, para in enumerate(raw_paras):
        if current_vpos + LINE_HEIGHT > MARGIN_TOP + CONTENT_HEIGHT:
            break

        words = para.split()
        if not words:
            continue

        # Estimate lines in this paragraph with word wrapping
        para_lines: list[list[str]] = []
        cur_line_words: list[str] = []
        cur_line_width = 0

        for w in words:
            word_w = max(len(w) * CHAR_WIDTH, 30)
            if cur_line_width + word_w + SPACE_WIDTH > CONTENT_WIDTH and cur_line_words:
                para_lines.append(cur_line_words)
                cur_line_words = [w]
                cur_line_width = word_w
            else:
                cur_line_words.append(w)
                cur_line_width += word_w + SPACE_WIDTH

        if cur_line_words:
            para_lines.append(cur_line_words)

        block_height = len(para_lines) * LINE_HEIGHT
        xml_lines.append(
            f'        <TextBlock ID="block_{block_idx}" HPOS="{MARGIN_LEFT}" VPOS="{current_vpos}" WIDTH="{CONTENT_WIDTH}" HEIGHT="{block_height}">'
        )

        for line_idx, line_words in enumerate(para_lines):
            line_vpos = current_vpos + (line_idx * LINE_HEIGHT)
            line_hpos = MARGIN_LEFT
            line_id = f"line_{block_idx}_{line_idx}"

            # Calculate total width of this line
            line_text_width = sum(max(len(w) * CHAR_WIDTH, 30) for w in line_words) + (len(line_words) - 1) * SPACE_WIDTH

            xml_lines.append(
                f'          <TextLine ID="{line_id}" HPOS="{line_hpos}" VPOS="{line_vpos}" WIDTH="{line_text_width}" HEIGHT="{LINE_HEIGHT}">'
            )

            word_hpos = line_hpos
            for w_idx, w in enumerate(line_words):
                w_width = max(len(w) * CHAR_WIDTH, 30)
                safe_w = html.escape(w)
                xml_lines.append(
                    f'            <String ID="str_{string_idx}" CONTENT="{safe_w}" HPOS="{word_hpos}" VPOS="{line_vpos}" WIDTH="{w_width}" HEIGHT="{LINE_HEIGHT - 10}" WC="0.98"/>'
                )
                string_idx += 1
                word_hpos += w_width
                if w_idx < len(line_words) - 1:
                    xml_lines.append(
                        f'            <SP HPOS="{word_hpos}" VPOS="{line_vpos}" WIDTH="{SPACE_WIDTH}"/>'
                    )
                    word_hpos += SPACE_WIDTH

            xml_lines.append('          </TextLine>')

        xml_lines.append('        </TextBlock>')
        block_idx += 1
        current_vpos += block_height + 24  # paragraph spacing

    xml_lines.append('      </PrintSpace>')
    xml_lines.append(
        f'      <BottomMargin HPOS="0" VPOS="{MARGIN_TOP + CONTENT_HEIGHT}" WIDTH="{PAGE_WIDTH}" HEIGHT="{PAGE_HEIGHT - (MARGIN_TOP + CONTENT_HEIGHT)}">'
    )
    xml_lines.append(
        f'        <TextBlock ID="footer_{page_number}" HPOS="{MARGIN_LEFT}" VPOS="{PAGE_HEIGHT - 100}" WIDTH="{CONTENT_WIDTH}" HEIGHT="40">'
    )
    xml_lines.append(
        f'          <TextLine ID="footer_line_{page_number}" HPOS="{MARGIN_LEFT}" VPOS="{PAGE_HEIGHT - 100}" WIDTH="{CONTENT_WIDTH}" HEIGHT="40">'
    )
    xml_lines.append(
        f'            <String CONTENT="{safe_doc_id}" HPOS="{MARGIN_LEFT}" VPOS="{PAGE_HEIGHT - 100}" WIDTH="400" HEIGHT="30" WC="0.99"/>'
    )
    xml_lines.append(
        f'            <String CONTENT="Dr. B.R. Ambedkar Writings and Speeches Archive" HPOS="{MARGIN_LEFT + 500}" VPOS="{PAGE_HEIGHT - 100}" WIDTH="600" HEIGHT="30" WC="0.99"/>'
    )
    xml_lines.append('          </TextLine>')
    xml_lines.append('        </TextBlock>')
    xml_lines.append('      </BottomMargin>')
    xml_lines.append('    </Page>')
    xml_lines.append('  </Layout>')
    xml_lines.append('</alto>')

    return "\n".join(xml_lines)


def parse_alto_bounding_boxes(alto_xml: str) -> list[dict[str, Any]]:
    """
    Extract word-level and line-level bounding boxes from ALTO XML
    for fast frontend overlay rendering.
    """
    boxes = []
    # Match <String .../>
    string_pattern = re.compile(
        r'<String\s+ID="([^"]+)"\s+CONTENT="([^"]+)"\s+HPOS="(\d+)"\s+VPOS="(\d+)"\s+WIDTH="(\d+)"\s+HEIGHT="(\d+)"(?:\s+WC="([^"]+)")?',
        re.MULTILINE
    )
    for match in string_pattern.finditer(alto_xml):
        s_id, content, hpos, vpos, width, height, wc = match.groups()
        boxes.append({
            "id": s_id,
            "text": html.unescape(content),
            "x": int(hpos),
            "y": int(vpos),
            "w": int(width),
            "h": int(height),
            "confidence": float(wc) if wc else 0.98,
        })
    return boxes
