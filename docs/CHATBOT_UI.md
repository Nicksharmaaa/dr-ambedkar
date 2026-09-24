# AI Research Assistant User Interface & Interaction Specification
**Project**: SIH Problem Statement 26096 — Digital Heritage Archive for Memorials, Manuscripts & Ambedkar  
**Target Architecture**: Phase 12 Bottom-Left Persistent Launcher & Drawer Interaction  

---

## 1. Visual Placement & The Bottom-Left Invariant

### Critical Design Decision
To prevent overlapping with standard website support widgets, floating feedback buttons, and right-hand scrollbars, the **Persistent AI Research Assistant Launcher is strictly anchored in the BOTTOM-LEFT CORNER**:

```tsx
<div className="fixed bottom-6 left-6 z-[9999] pointer-events-auto">
  {/* Pulsing heritage gold halo ring */}
  <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/40 via-amber-400/20 to-amber-600/40 blur-sm animate-pulse pointer-events-none" />
  
  <button className="h-14 min-w-[56px] px-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 ...">
    <Sparkles className="w-4 h-4 text-slate-950" />
    <span>Ask the Archive</span>
  </button>
</div>
```

---

## 2. Touch & Accessibility Ergonomics (56px Standards)

In accordance with institutional museum touch standards (ADA Title III / WCAG 2.1 AAA touch target guidelines):
1. **Target Dimensions**: Minimum button height is 56px (`h-14`), with generous touch padding for museum visitors of all ages and abilities.
2. **Visual Affordance**: Features a gold gradient (`from-amber-500 via-amber-600 to-amber-700`), dark text for high contrast (`text-slate-950`), and an active pulsing halo.
3. **Status Indicator Dot**:
   - **Green (Emerald)**: Connected to Turso vector store (Live AI Q&A operational).
   - **Amber**: Disconnected / Offline Mode (Mandatory abstention active; exhibits browsable).

---

## 3. The Assistant Drawer Interface

When the launcher is tapped, the **Assistant Drawer** animates smoothly from the left:

```
+--------------------------------------------------------------+
| [Sparkles] Ambedkar Heritage Assistant        [Online] [R] [X] |
| Grounded Turso Vector RAG • Zero Hallucination               |
+--------------------------------------------------------------+
| Modes: [Ask] [Explain] [Summarize] [Evidence]  Lang: [English] |
+--------------------------------------------------------------+
|                                                              |
| (Assistant)                                                  |
| [ShieldCheck] Verified Source Grounded  [96% Match]     [🔊] |
| In "Castes in India" (1916), Dr. Ambedkar demonstrated that  |
| endogamy is the only character that is peculiar to caste...  |
|                                                              |
| [BookOpen] 2 Archival Citations             [View Excerpts]  |
|   +------------------------------------------------------+   |
|   | [BAWS Vol 1 • p.12 ->]   [Castes in India • p.15 ->] |   |
|   +------------------------------------------------------+   |
|                                                              |
|   (Collapsible Excerpt Drawer)                               |
|   > "Endogamy is the only character that is peculiar to      |
|      caste... Thus the superposition of endogamy on         |
|      exogamy means the creation of caste."                   |
|                                                              |
+--------------------------------------------------------------+
| Quick Queries: [Endogamy] [Social Endosmosis] [1949 Warning] |
+--------------------------------------------------------------+
| [Mic] [ Ask the archive about doctrines or events... ] [Send] |
+--------------------------------------------------------------+
```

### Key UI Capabilities
- **Direct Link to Facsimile Viewer**: Clicking `[BAWS Vol 1 • p.12 ->]` navigates directly to `/documents/AMBEDKAR-VOL-01?page=12`, opening the high-resolution scanned page facsimile.
- **"🔊 Listen" TTS Audio**: Clicking the speaker icon reads the verified answer in clear speech synthesis with play/stop toggle.
- **Voice Microphone Input**: Integrated with the Web Speech API (`SpeechRecognition`), enabling hands-free spoken queries with language adaptation (English, Hindi, Marathi, Bengali, Gujarati, Tamil).
- **Offline Shield**: If the device loses internet connection, the input transitions to offline mode, explicitly explaining why generative AI is disabled to maintain archival integrity.
