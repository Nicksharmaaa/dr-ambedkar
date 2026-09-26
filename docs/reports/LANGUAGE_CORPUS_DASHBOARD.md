# LANGUAGE CORPUS DASHBOARD
## Multilingual Books & Writings Collection Analytics & Archival Inventory
**Date:** September 24, 2026 | **Version:** 1.0 | **Status:** ACTIVE
**Source Directory:** `c:\dr ambedkar\incoming_documents\books_and_writings\`

---

## 1. Executive Analytics Overview

| Metric | Total | English (`en`) | Hindi (`hi`) | Bengali (`bn`) | Gujarati (`gu`) | Tamil (`ta`) |
|---|---|---|---|---|---|---|
| **Total Archival Documents** | **112** | 19 | 39 | 14 | 9 | 31 |
| **Physical Scanned Pages** | **35,371** | 0 | 14,431 | 4,863 | 3,353 | 12,724 |
| **Clean Digital Pages** | **12,154** | 12,154 | 0 | 0 | 0 | 0 |
| **Total Corpus Footprint** | **1,145.37 MB**| 27.26 MB | 444.62 MB | 143.03 MB | 91.02 MB | 439.44 MB |
| **Primary Format** | — | TXT (`.txt`) | PDF (`.pdf`) | PDF (`.pdf`) | PDF (`.pdf`) | PDF (`.pdf`) |
| **Page Nature** | — | Born-Digital | 100% Scanned | 100% Scanned | 100% Scanned | 100% Scanned |

---

## 2. Text Authority & OCR Verification Status

| Authority Classification | Documents | Pages | Status Description |
|---|---|---|---|
| `SOURCE_TEXT` | 19 | 12,154 | Authoritative English text layer extracted from DjVu digital editions |
| `OCR_UNREVIEWED` | 93 | 35,371 | Initial high-density OCR extraction across Hindi, Bengali, Gujarati, and Tamil scans |
| `OCR_REVIEWED` | — | Seed Batches | Curator-verified and corrected page transcripts |
| `NATIVE_PDF_TEXT` | 0 | 0 | Born-digital selectable text in PDFs (0 pages detected) |

---

## 3. Work Relationship & Alignment Summary

### A. Canonical Master Works Indexed: **8 Works**
1. *Annihilation of Caste* (`work-annihilation-of-caste`)
2. *Castes in India: Their Mechanism, Genesis and Development* (`work-castes-in-india`)
3. *Who Were the Shudras?* (`work-who-were-the-shudras`)
4. *The Untouchables: Who Were They?* (`work-the-untouchables`)
5. *Pakistan or the Partition of India* (`work-pakistan-partition`)
6. *Riddles in Hinduism* (`work-riddles-in-hinduism`)
7. *The Buddha and His Dhamma* (`work-buddha-and-his-dhamma`)
8. *States and Minorities* (`work-states-and-minorities`)

### B. Cross-Document Relationships
- **Verified Translation Relationships:** **4 pairs**
  - English Vol 1 ↔ Hindi Vol 1 (*Castes in India*)
  - English Vol 1 ↔ Hindi Vol 1 (*Annihilation of Caste*)
  - English Vol 1 ↔ Tamil Vol 2 (*Annihilation of Caste*)
  - English Vol 11 ↔ Bengali Vol 11 (*The Buddha and His Dhamma*)
- **Candidate Translation Relationships:** **64 pairs**
- **Rejected Non-Corresponding Pairs:** **0**

### C. Cross-Language Segment Alignments
- **Verified Paragraph Alignments:** **3 verified seed alignments** (English-Hindi, English-Tamil, English-Bengali).
- **Candidate Alignments:** **64 alignments** queued for archivist verification.
- **Alignment Hierarchy:** Work → Section → Paragraph → Page.

---

## 4. API Endpoints Available
- Dashboard Stats: `GET /api/v1/multilingual-corpus/dashboard`
- Manifest Catalog: `GET /api/v1/multilingual-corpus/documents`
- Canonical Works: `GET /api/v1/multilingual-corpus/works`
- Work Relationships: `GET /api/v1/multilingual-corpus/relationships`
- Segment Alignments: `GET /api/v1/multilingual-corpus/alignments`
- OCR Baseline: `GET /api/v1/ocr/baseline`
- Curator Review: `POST /api/v1/ocr/review`
