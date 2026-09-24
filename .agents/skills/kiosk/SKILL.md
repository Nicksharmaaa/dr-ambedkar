---
name: kiosk
description: Touch-optimized kiosk interface for museum and institutional settings. Offline-capable PWA. Pre-populated SQLite subset. Multilingual UI (English/Hindi/Marathi). Large touch targets.
---

# Kiosk Skill

## Purpose
Build and maintain the touch kiosk interface for museum/institutional deployment.

## Technical Stack
- Next.js 16 PWA (offline-capable)
- Electron shell OR Chromium kiosk mode (--kiosk flag)
- Local SQLite file (subset of Turso data)
- Local storage (selected documents pre-cached)
- No GPU assumed on kiosk device

## Kiosk Route
/kiosk - dedicated kiosk page
Separate CSS bundle: large touch targets (min 48px), no hover states
High contrast, readable at distance

## Languages
- English / Hindi / Marathi (switchable via UI)
- Language selection persists in localStorage

## Offline Architecture
- SQLite file: kiosk/ambedkar_kiosk.db
  - Pre-populated with 500+ documents
  - Updated via sync when online
- Storage: kiosk/storage/ (local document files)
- Service worker: caches Next.js app shell + static assets

## Sync Protocol
- Background delta sync when network detected
- Sync only new/modified records from Turso Cloud
- Verify hashes on sync

## UI Features
- Large document thumbnails
- Touch-friendly search (soft keyboard)
- Voice input (browser Web Speech API or IndicConformer)
- Audio narration button per document
- Timeline explorer (touch-friendly)
- "Ask about this document" (local RAG if GPU available, else simplified retrieval)

## Kiosk Admin
- PIN-protected admin mode
- Content curator can mark documents as "kiosk featured"
- Manage which documents are in kiosk subset

## Deployment
kiosk/
├── ambedkar_kiosk.db    # pre-populated SQLite
├── storage/             # local document files
└── electron/            # Electron shell config
