# MULTILINGUAL RAG ARCHITECTURE REPORT
## Cross-Language Evidence Retrieval, Question-Answer Decoupling, and Source Citation Fidelity
**Date:** September 24, 2026 | **Version:** 1.0 | **Status:** OPERATIONAL
**Platform:** Ambedkar Heritage Intelligence RAG Engine

---

## 1. Executive Summary

Phase 9.5 establishes the decoupled **Multilingual Retrieval-Augmented Generation (RAG)** architecture. In this system, the language of the visitor's research inquiry is decoupled from the authoritative archival language of the historical evidence.

### Architectural Rule: Citation Invariance
> **Zero Citation Translation:** Regardless of whether the visitor inquires in Hindi, Tamil, Bengali, or Gujarati, the cited archival source identity remains anchored to its authoritative source document (e.g. `AMBEDKAR-VOL-01 Page 14`). The AI never translates away or obscures the physical document identifier or historical edition provenance.

---

## 2. Decoupled RAG Pipeline Architecture

```
VISITOR INQUIRY (e.g. Hindi: "जाति भेद का उच्छेद में मुख्य तर्क क्या हैं?")
   │
   ▼
1. Language Detection: Detects "hi" (Devanagari script)
   │
   ▼
2. Cross-Lingual Hybrid Retrieval:
   Translates query to "Annihilation of Caste main arguments"
   Queries Turso FTS5 Lexical Index + Qwen3 Vector Index + Qwen3 Reranker
   Retrieves Top-5 Authoritative Primary Chunks (English BAWS Vol 1)
   │
   ▼
3. Evidence Synthesis & Grounding:
   Feeds verbatim English excerpts into Groq Qwen 27B / RAG Generator
   Instructs engine to formulate answer in visitor's language (Hindi)
   Mandates inline citations to [Vol. 1, Annihilation of Caste, p. ~14]
   │
   ▼
4. Formatted Multilingual Response:
   Displays Evidence Language, Answer Language, Document ID, Page Number, and Authority
```

---

## 3. Verified Cross-Lingual RAG Demonstrations

### Scenario A: Hindi Inquiry → English Archival Evidence → Grounded Hindi Response
- **Inquiry:** *"जाति भेद का उच्छेद में डॉ. आम्बेडकर ने श्रम विभाजन के विषय में क्या कहा है?"*
- **Detected Question Language:** `hi` (Hindi)
- **Retrieved Evidence Language:** `en` (English)
- **Authoritative Citation:** `Document: AMBEDKAR-VOL-01 (Castes in India / Annihilation of Caste), Page: 14`
- **Text Authority:** `SOURCE_TEXT`
- **Grounded Answer (Hindi):**
  > **Evidence Language:** English (`en`)  
  > **Answer Language:** Hindi (`hi`)  
  > **Authoritative Source:** `AMBEDKAR-VOL-01`, Annihilation of Caste, Page ~14  
  > 
  > डॉ. बी.आर. आम्बेडकर के अनुसार, जाति प्रथा केवल श्रम का विभाजन (division of labour) नहीं है, बल्कि यह मूलतः **श्रमजीवियों का विभाजन (division of labourers)** है। यह एक ऐसा विभाजन है जो व्यक्तियों की स्वाभाविक क्षमताओं या प्राथमिकताओं पर आधारित नहीं है, बल्कि जन्म के आधार पर थोपा गया एक श्रेणीबद्ध और कृत्रिम विभाजन है।  
  > *(स्रोतः [Vol. 1, Annihilation of Caste, p. ~14])*

### Scenario B: Tamil Inquiry → English Archival Evidence → Grounded Tamil Response
- **Inquiry:** *"தீண்டாமை தோற்றம் குறித்து அம்பேத்கர் முன்வைக்கும் கோட்பாடு என்ன?"*
- **Detected Question Language:** `ta` (Tamil)
- **Retrieved Evidence Language:** `en` (English)
- **Authoritative Citation:** `Document: AMBEDKAR-VOL-07 (The Untouchables), Page: 21`
- **Grounded Answer (Tamil):**
  > **Evidence Language:** English (`en`)  
  > **Answer Language:** Tamil (`ta`)  
  > **Authoritative Source:** `AMBEDKAR-VOL-07`, The Untouchables, Page ~21  
  > 
  > டாக்டர் பாபாசாகேப் அம்பேத்கர் அவர்கள் தீண்டாமையின் தோற்றம் குறித்து 'உடைந்த மனிதர்கள் கோட்பாடு' (Broken Men Theory) என்ற புரட்சிகரமான வாதத்தை முன்வைக்கிறார். பழங்கால பழங்குடி சமூகங்களுக்கிடையேயான போர்களில் தோல்வியடைந்த மனிதர்கள், பின்னர் ஊருக்கு வெளியே குடியேற நிர்பந்திக்கப்பட்டு தீண்டத்தகாதவர்களாக மாற்றப்பட்டனர் என்று அவர் நிறுவுகிறார்.  
  > *(ஆதாரம்: [Vol. 7, The Untouchables, p. ~21])*

### Scenario C: Bengali Inquiry → English Archival Evidence → Grounded Bengali Response
- **Inquiry:** *"বুদ্ধ ও তাঁর ধর্মে মুক্তির পথ কীভাবে বর্ণিত হয়েছে?"*
- **Detected Question Language:** `bn` (Bengali)
- **Retrieved Evidence Language:** `en` (English)
- **Authoritative Citation:** `Document: AMBEDKAR-VOL-11 (The Buddha and His Dhamma), Page: 5`
- **Grounded Answer (Bengali):**
  > **Evidence Language:** English (`en`)  
  > **Answer Language:** Bengali (`bn`)  
  > **Authoritative Source:** `AMBEDKAR-VOL-11`, The Buddha and His Dhamma, Page ~5  
  > 
  > ড. বি.আর. আম্বেদকরের মতে, বুদ্ধের ধর্ম (সদ্ধর্ম) অন্ধ বিশ্বাস বা অলৌকিকতার ওপর প্রতিষ্ঠিত নয়, বরং তা মানুষের দুঃখ মুক্তি এবং সামাজিক সমতার ওপর ভিত্তি করে গড়ে উঠেছে। নৈতিকতা (শীল) এবং প্রজ্ঞাই মানুষের মুক্তির একমাত্র সত্য পথ।  
  > *(উৎস: [Vol. 11, The Buddha and His Dhamma, p. ~5])*

---

## 4. UI Provenance & Disclaimer Display

Whenever cross-lingual RAG executes, the system renders prominent provenance metadata cards:
- **Evidence Language Badge:** Clearly identifies whether source evidence was English original text (`SOURCE_TEXT`) or non-English scanned OCR (`OCR_UNREVIEWED`).
- **Answer Language Badge:** Identifies the synthesized communication language.
- **Historical Disclaimer:**
  > *"Note: This scholarly response was formulated in your requested language based on authoritative historical evidence in the Ambedkar Archive. The original citation remains authoritative."*
