# Museum Kiosk UX & Deployment Specification

**System:** Ambedkar Heritage Intelligence & Digital Preservation System  
**Version:** 1.0.0 (Phase 10 Kiosk Specification)  
**Route:** `/kiosk`  
**Deployment Context:** Museum lobbies, university exhibition halls, institutional touchscreens (10"–11" tablets up to 27" and 32" large format touchscreens).

---

## 1. Kiosk Operational Cycle

```
      ┌────────────────────────────────────────────────────────┐
      │                  ATTRACT MODE SCREEN                   │
      │   Rotating monumental quotes (every 8s)                │
      │   Heritage branding & "Touch Screen to Begin"          │
      └───────────────────────────┬────────────────────────────┘
                                  │ Touch / Click Event
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │                  ACTIVE EXPLORATION                    │
      │   Large Touch Search Bar                               │
      │   4 Major Discovery Cards (Writings, Timeline,         │
      │   Stories, Media)                                      │
      │   Full touch target sizing (≥ 56px)                    │
      └───────────────────────────┬────────────────────────────┘
                                  │ Inactivity (60s timer)
                                  │ or "End Session" Click
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │                 SESSION PRIVACY RESET                  │
      │   Clear sessionStorage                                 │
      │   Purge search query, active filters & temporary state │
      │   Return to Attract Mode Screen                        │
      └────────────────────────────────────────────────────────┘
```

---

## 2. Attract Screen Architecture (Section 27)

When the exhibition kiosk is idle:
* **Visual Anchor:** High-contrast obsidian canvas (`bg-slate-950`) with warm amber ambient glow.
* **Monumental Typography:** Rotating authoritative quotes from Dr. B.R. Ambedkar with exact historical citations:
  1. *"Educate, Agitate, Organise, have faith in yourself and never lose hope."* (Nagpur, 1942)
  2. *"Political democracy cannot last unless there lies at the base of it social democracy."* (Constituent Assembly, 1949)
  3. *"Caste is not just a division of labour, it is a division of labourers."* (Annihilation of Caste, 1936)
  4. *"Lost rights are never regained by begging... but by relentless struggle."* (1927)
* **Touch Call to Action:** Pulsing tactile pill button: `Touch Screen to Begin Exploring`.

---

## 3. Active Kiosk Shell & Touch Ergonomics (Section 26)

* **Fullscreen Mode:** One-touch toggle via browser Fullscreen API (`document.documentElement.requestFullscreen()`).
* **Header Controls:**
  * Home Button: Persistent return to main portal.
  * Inactivity Countdown: Live visual badge: `Reset in 60s`, reset on every user touch/keystroke.
  * End Session: Immediate manual privacy purge and attract reset.
* **Large Touch Cards ($\ge 56\text{px}$ Targets):**
  1. *Explore Writings & Speeches* (112 Multilingual Volumes)
  2. *Interactive Timeline* (1891–1956 Chronological Eras)
  3. *Historical Stories* (Curated Narrative Walkthroughs)
  4. *Audiovisual Gallery* (Historic Recordings & Footage)

---

## 4. Visitor Privacy & Data Hygiene (Section 28)

Museum visitors frequently input personal research questions or voice queries on shared public devices. The kiosk architecture enforces strict zero-retention session privacy:
* All query terms, voice transcription buffers, and document selections are stored exclusively in non-persistent memory and `sessionStorage`.
* Upon timer expiration (60 seconds of inactivity) or clicking "End Session", `sessionStorage.clear()` is executed immediately, resetting all components to their baseline state.
* Zero visitor identifiers, IP addresses, or typed queries are persisted to local storage or external telemetry.
