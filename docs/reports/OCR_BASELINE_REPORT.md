# OCR BASELINE REPORT
## Ambedkar Heritage Intelligence & Digital Preservation System

**Phase**: 4
**Generated**: 2026-09-23
**Status**: BASELINE ESTABLISHED (Pre-OCR Phase)

---

## Summary

| Metric | Value |
|---|---|
| Fresh OCR jobs run (Phase 4) | 0 |
| PaddleOCR invocations | 0 |
| Source images available | 0 |
| DjVu text files (pre-extracted) | 19 |
| Ground truth pages available | 0 |
| CER measured | N/A (no ground truth) |
| WER measured | N/A (no ground truth) |
| Handwritten pages flagged | 0 |

---

## Why OCR Was Not Run

The corpus consists of `.djvu.txt` files — text layers extracted from DjVu-encoded
scanned books at time of digitization. These files were produced by the Government of
Maharashtra publishing pipeline, not by the current system.

**OCR is NOT required or applicable in Phase 4.**

The original page image files (PDF, TIFF, JPEG) are not part of the current corpus delivery.

---

## DjVu Text Quality Assessment

| Observation | Detail |
|---|---|
| UTF-8 encoding | CLEAN — zero replacement characters (U+FFFD) |
| Non-ASCII chars | Typographic only: em dash, curly quotes, bullets |
| Devanagari content | None detected in 5,000-char samples per volume |
| Apparent OCR errors | Low — text reads fluently in all sampled sections |
| Running headers in text | Present — need parser filtering |
| Page numbers in text stream | Present — detected via numeric line pattern |

---

## Phase 5 OCR Plan (when images are provided)

When original scanned page images are added to `data/inbox/scans/`:

1. Run PaddleOCR PP-OCRv5 (Python 3.12 venv-ocr microservice)
2. Compare OCR output against DjVu text layer as pseudo-ground-truth
3. Measure CER and WER per page
4. Flag pages below configurable confidence threshold for human review
5. Store ALTO XML layout output per page
6. Update this report with measured baseline

---

## Handwriting Assessment

No handwritten pages have been identified. The current corpus is fully typewritten/printed.
If manuscript or handwritten material is added in future:

- Flag with `content_type = handwritten`
- Apply dedicated handwriting OCR model (future)
- Do NOT claim accuracy without measurement

---

STATUS: BASELINE RECORDED. PHASE 5 OCR PIPELINE PENDING IMAGE DELIVERY.
