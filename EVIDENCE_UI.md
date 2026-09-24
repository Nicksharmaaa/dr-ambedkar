# Evidence Presentation & Claim UI Specification

**System:** Ambedkar Heritage Intelligence & Digital Preservation System  
**Version:** 1.0.0 (Phase 10 Evidence Standard)  
**Standard:** Every generated AI answer or research synthesis must strictly follow the four-tier evidence hierarchy to eliminate hallucination risk and guarantee scholarly verifiability.

---

## 1. The Four-Tier Evidence Hierarchy (Section 12)

AI responses must never present a monolithic wall of text followed by obscure endnotes. All responses are visually structured into four distinct, progressive tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. THE ANSWER (Executive Synthesis)                                    │
│    Concise, scholarly explanation directly answering the user query.   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. CLAIM-LEVEL EVIDENCE AUDIT                                          │
│    Sentence-by-sentence decomposition with validation badges:          │
│    [SUPPORTED] • [PARTIAL] • [UNSUPPORTED]                             │
├────────────────────────────────────────────────────────────────────────┤
│ 3. CITED ARCHIVAL PASSAGES                                             │
│    Exact verbatim excerpts from the historical source texts.           │
│    Displaying: Title, Historical Date, Volume, and Printed Page.       │
├────────────────────────────────────────────────────────────────────────┤
│ 4. DIRECT EXACT PAGE DEEP-LINK                                         │
│    One-click jump opening the deep-zoom archival viewer directly to    │
│    the physical document and exact page (zero approximate scrolling).  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Claim-Level Verification Badges (Section 13 & 25)

The `ClaimValidator` engine decomposes generated responses into discrete factual claims and evaluates them against retrieved archival chunks:

* **`SUPPORTED` (Emerald Badge):** Factual claim is directly corroborated by the text in the referenced archival chunk.
* **`PARTIAL` (Amber Badge):** Claim is generally consistent with the archival context but contains generalized phrasing or minor inferences.
* **`UNSUPPORTED` (Rose/Red Badge):** Claim cannot be verified against the retrieved archival evidence; flagged for archivist review.
* **`ABSTENTION` (Indigo Badge):** System explicitly abstains from answering when the archival corpus does not contain sufficient verified primary source material, preventing speculative hallucination.

---

## 3. Visual Authority Tier Badges

To prevent visitors from confusing primary source texts with derivative translations or AI summaries, content elements are stamped with explicit authority badges:

* **`SOURCE_ORIGINAL` (Heritage Gold):** Unaltered primary text from the *Babasaheb Ambedkar: Writings and Speeches* (BAWS) DjVu extractions.
* **`CURATOR_VERIFIED` / `OCR_REVIEWED` (Emerald):** Scanned facsimile text audited and approved by an archival curator.
* **`OCR_UNREVIEWED` (Slate):** Raw machine optical character recognition text awaiting human curation.
* **`TRANSLATION` (Royal Blue):** Derivative linguistic translation generated via IndicTrans2 / Qwen.
* **`AI_GENERATED` (Purple):** Synthesized summary, comparison, or conceptual explanation accompanied by mandatory evidence links.
