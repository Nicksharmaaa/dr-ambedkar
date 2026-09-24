---
name: ml-evaluation
description: Measurement framework for OCR accuracy, embedding quality, retrieval precision, reranking improvement, and RAG faithfulness. Establishes baselines before any model adaptation.
---

# ML Evaluation Skill

## Purpose
Measure system performance. Establish baselines. Never claim a feature works without measurement.

## Evaluation Metrics

### OCR
- Character Error Rate (CER): correct chars / total chars
- Word Error Rate (WER): correct words / total words  
- Segment detection: IoU of detected text blocks
- Handwriting CER (separate metric)
- Devanagari-specific CER

### Embedding / Retrieval
- Recall@K (K=5, 10, 20): fraction of relevant docs in top-K
- MRR (Mean Reciprocal Rank)
- NDCG@10
- Latency: p50, p95, p99 in milliseconds

### Reranking
- NDCG improvement after reranking
- Reranking latency per query

### RAG
- Faithfulness: fraction of claims supported by cited chunks (manual spot-check)
- Answer relevance: user rating 1-5
- Citation accuracy: cited chunk IDs contain supporting text (automated check)
- Hallucination rate: manual audit of N=50 responses

## Baseline Procedure
1. Collect 50 test queries + known relevant documents
2. Run retrieval → record Recall@10, MRR
3. Run reranking → record NDCG improvement
4. Run RAG → manual faithfulness audit on 20 responses
5. Record all metrics in: docs/evaluation/baseline_{date}.json

## Principle
Do NOT fine-tune any model until:
- OCR baseline measured
- Retrieval baseline measured
- RAG baseline measured
- Metrics show which component is the bottleneck

## Output
- docs/evaluation/baseline_{phase}.json
- evaluation_report.md per phase
