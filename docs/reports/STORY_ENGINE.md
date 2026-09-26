# Heritage Story Engine — Phase 8

## 1. Overview & Narrative Philosophy
The Heritage Story Engine provides an immersive reading and exploration experience for museum visitors, students, and scholars.

### Fundamental Principle
Historical stories must NOT invent fictional dialogs or unverified events. Stories are composed strictly of **sequences of approved archival objects and historical chapters**, accompanied by scholarly narrative commentary and exact primary document quotations.

---

## 2. Story Collections Data Architecture
Stories are modeled in two relational tables:
1. `story_collections`: The overarching historical journey (slug, title, subtitle, summary, cover image, category).
2. `story_items`: Sequential narrative chapters (title, narrative text, primary document ID, page number, chunk ID, highlighted passage, media link).

---

## 3. Seed Canonical Stories
The platform launches with three core, evidence-grounded historical narratives:

### Story 1: Dr. Ambedkar & The Making of the Indian Constitution
- **Slug**: `ambedkar-and-the-constitution`
- **Category**: `CONSTITUTIONAL`
- **Chapters**:
  1. *The Call to the Drafting Committee*: Appointment on 29 August 1947 (Source: BAWS Vol. 13, Page 6).
  2. *Constitutional Morality over Majoritarianism*: The doctrine that democracy requires institutional restraint (Source: BAWS Vol. 13, Page 6).
  3. *The Union of Trinity*: Liberty, Equality, and Fraternity as an inseparable triumvirate (Source: BAWS Vol. 13, Page 6).

### Story 2: The Mahad Satyagraha: Awakening Civil Rights
- **Slug**: `mahad-satyagraha-civil-rights`
- **Category**: `SOCIAL_REFORM`
- **Chapters**:
  1. *The Water Declaration at Chhadar Tank*: 20 March 1927 assertion of universal civic rights (Source: BAWS Vol. 17-P1, Page 3).
  2. *Manusmriti Dahan*: The symbolic burning of the code of inequality on 25 December 1927 (Source: BAWS Vol. 17-P1, Page 3).

### Story 3: Monetary Economics & The Genesis of the Reserve Bank
- **Slug**: `monetary-economics-and-the-rbi`
- **Category**: `ECONOMIC`
- **Chapters**:
  1. *The Problem of the Rupee*: D.Sc. dissertation at LSE in 1923 analyzing currency stability (Source: BAWS Vol. 6, Page 10).
  2. *Hilton Young Commission Testimony*: Foundational testimony recommending central banking mechanisms (Source: BAWS Vol. 6, Page 10).

---

## 4. RAG Assistant Chapter Integration
In the Story Reader, users can click **"Ask AI About This"** on any chapter. The system invokes `/api/v1/assistant/ask` with the exact chapter context, document reference, and page number, enabling interactive Q&A strictly grounded in that chapter's archival source.
