---
name: document-ai
description: OCR, layout analysis, and document intelligence using PaddleOCR PP-OCRv5 and PP-StructureV3. Runs in the venv-ocr Python 3.12 microservice on port 8002. Produces ALTO XML output and confidence-scored text blocks.
---

# Document AI Skill

## Purpose
Extract text and structure from archival documents using state-of-the-art OCR.

## Stack
- PaddleOCR PP-OCRv5 (text detection + recognition)
- PP-StructureV3 (layout analysis, table recognition, formula)
- Python 3.12 venv (venv-ocr)
- FastAPI microservice on port 8002
- GPU-accelerated (PaddlePaddle-GPU, CUDA 12)

## Output Formats
- ALTO XML 4.x (primary; bounding boxes + text + confidence)
- Plain text (for chunking pipeline)
- JSON blocks (for structured data extraction)

## Confidence Scoring
- Per-block confidence: 0.0 to 1.0
- Flag blocks with confidence < 0.7 for human review
- Store in ocr_output.confidence_avg and ocr_output.needs_review

## Supported Scripts
- Latin (English)
- Devanagari (Hindi, Marathi, Sanskrit)
- Mixed-script documents
- Handwritten text (PP-OCRv5 handwriting model)

## API Endpoints
POST /ocr/process-page - OCR a single page image
POST /ocr/process-pdf - OCR all pages in a PDF
GET /ocr/status/{job_id} - Processing status

## Turso Tables Updated
- ocr_output (store results)
- pages (update dimensions)
- processing_jobs (update status)

## Model Management
- Loaded on startup of venv-ocr microservice
- GPU resident while microservice runs
- VRAM: ~0.5 GB for PP-OCRv5
