# Audiovisual Media UX & Spoken Search Specification

**System:** Ambedkar Heritage Intelligence & Digital Preservation System  
**Version:** 1.0.0 (Phase 10 Media Standard)  
**Scope:** Interactive presentation of historic audio recordings, documentary video footage, and archival photographs.

---

## 1. Audiovisual Explorer (`/media`)

The Media Explorer provides a centralized portal categorized into:
1. **Photographs:** High-resolution scans of historical moments (Mahad 1927, London 1931, Constituent Assembly 1949, Nagpur 1956).
2. **Audio Recordings:** Verified historical speeches with acoustic cleanups and transcripts (e.g., BBC 1931 address on constitutional safeguards, AIR 1950 broadcast).
3. **Video Footage:** Restored documentary footage with synchronized timestamps (e.g., Constituent Assembly final presentation on 25 November 1949).

---

## 2. Spoken Word Search Engine (`/api/v1/media/search`)

* **Search Mechanism:** Lexical and phonetic indexing across verified speech transcripts.
* **Result Structure:**
  * Media Track Title & Asset Type (Audio / Video)
  * Exact Timestamp string (`MM:SS`) and second coordinate
  * Speaker identification (e.g., *Dr. B.R. Ambedkar*)
  * Matching snippet with highlighted query terms
  * Single-click trigger that launches the player and seeks directly to the spoken occurrence.

---

## 3. Dedicated Video Experience (`/media/video/[id]`)

* **Canvas Player:** 16:9 aspect ratio video canvas with custom dark-slate controls.
* **Timestamped Transcript Drawer:** Interactive right-hand panel displaying speaker labels, start/end timestamps, and spoken text.
* **Interactive Seeking:** Clicking any transcript card immediately updates the video time index (`videoRef.current.currentTime = seg.start_time`) and begins playback.
* **Transcript Search:** Real-time filter input instantly isolates segments containing specific spoken words.
* **Interconnected Archival Links:** Direct links to the corresponding written volumes (e.g., BAWS Vol 13 for Constituent Assembly debates) and Knowledge Graph entities.

---

## 4. Dedicated Audio Experience (`/media/audio/[id]`)

* **Canvas Player:** Distinct audio card featuring an interactive 48-bar visual waveform scrubber.
* **Interactive Playback:** Clicking anywhere on the waveform or time slider seeks playback with millisecond accuracy.
* **Synchronized Transcript:** Aligned spoken passages with speaker identification.
* **Ask About This Recording:** Direct RAG trigger (`/assistant?mode=ask`) allowing users to query the historical context and implications of the speech.
