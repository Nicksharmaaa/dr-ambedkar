# Accessibility (a11y) & Inclusive Design Standard

**System:** Ambedkar Heritage Intelligence & Digital Preservation System  
**Version:** 1.0.0 (Phase 10 Accessibility Standard)  
**Target:** Full WCAG 2.1 Level AA Compliance across desktop, tablet, mobile, and museum kiosk displays.

---

## 1. Core Accessibility Principles

1. **Perceivable:** High contrast text-to-background ratios ($\ge 4.5:1$ for body text, $\ge 7:1$ for headings), scalable typography up to 200% without clipping, and non-color-exclusive semantic badges.
2. **Operable:** Complete keyboard navigability (Tab, Shift+Tab, Enter, Escape, Arrow keys), visible focus indicators, and touch targets $\ge 48\times 48\text{px}$ ($\ge 56\text{px}$ on kiosk).
3. **Understandable:** Predictable navigation order, clear error messages, and language attributes on multilingual text elements.
4. **Robust:** Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`), valid ARIA attributes (`aria-label`, `aria-expanded`, `aria-live`).

---

## 2. Multimodal & Assistive Capabilities

* **Voice Search:** Enabled via browser Web Speech API and backend Indic transcription (`/api/v1/voice/transcribe`) allowing users with motor impairments or non-Latin keyboard layouts to search by voice in English, Hindi, and Marathi.
* **Neural Speech Narration (TTS):** Integrated Indic neural text-to-speech (`/api/v1/indic/tts/synthesize`) provides audio narration of any archival facsimile page for visually impaired or auditory learners.
* **Synchronized Captions & Transcripts:** All archival audio and video recordings include timestamp-synchronized text transcripts that can be read, searched, and scrubbed.
* **Alternative Text & Labels:** Every interactive control features descriptive `aria-label` or visible label text; facsimile SVGs and photographs include descriptive `alt` tags and provenance descriptions.

---

## 3. High-Contrast Color Palette Matrix

| Element | Background | Text Color | Contrast Ratio | WCAG AA Status |
|:---|:---|:---|:---:|:---:|
| Primary Headings | `bg-slate-950` (`#020617`) | White (`#ffffff`) | **18.2:1** | PASS (AAA) |
| Heritage Gold Text | `bg-slate-950` (`#020617`) | Amber-400 (`#fbbf24`) | **10.5:1** | PASS (AAA) |
| Body Text | `bg-slate-900` (`#0f172a`) | Slate-200 (`#e2e8f0`) | **12.4:1** | PASS (AAA) |
| Metadata Labels | `bg-slate-900` (`#0f172a`) | Slate-400 (`#94a3b8`) | **5.8:1** | PASS (AA) |
| Verified Fixity Badge | `bg-emerald-950` (`#022c22`)| Emerald-300 (`#6ee7b7`) | **8.1:1** | PASS (AAA) |

---

## 4. Keyboard Navigation Shortcuts

* **`Tab` / `Shift + Tab`:** Navigate forward / backward through all focusable interactive controls.
* **`Enter` / `Space`:** Activate buttons, accordion tabs, and deep-zoom facsimile triggers.
* **`Escape`:** Dismiss modals, voice search dialogs, and navigation drawers.
* **`Arrow Left` / `Arrow Right`:** Scrub through facsimile pages in the Archival Viewer.
