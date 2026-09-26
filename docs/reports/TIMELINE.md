# Historical Timeline System — Phase 8

## 1. Overview
The Historical Timeline represents a first-class chronological exploration engine grounded in verified milestones of Dr. B.R. Ambedkar's life and public service.

**Core Rule:** The timeline is NOT an AI-generated biography. Every event is sourced from documented historical records, gazetteers, and published writings in the archival corpus.

---

## 2. Precision-Aware Chronology Model
Historical documents often lack exact calendar dates. Converting approximate or year-level dates into arbitrary days distorts historical accuracy. The timeline model implements six distinct levels of date precision:

| Date Precision | Date Value Example | Display Format |
|---|---|---|
| `DAY` | `1891-04-14` | 14 April 1891 |
| `MONTH` | `1913-06` | June 1913 |
| `YEAR` | `1923` | 1923 |
| `RANGE` | `1916–1923` | 1916 – 1923 |
| `APPROXIMATE` | `c. 1907` | Circa 1907 |
| `UNKNOWN` | `UNKNOWN` | Date Unknown |

---

## 3. Event Taxonomy & Categories
Timeline events are categorized into 12 configurable archival classifications:
1. `PERSONAL`: Family, childhood, residences.
2. `EDUCATION`: Academic milestones at Elphinstone College, Columbia University, London School of Economics, Gray's Inn.
3. `SOCIAL_REFORM`: Mahad Satyagraha, Kalaram Temple Entry Satyagraha.
4. `MOVEMENTS`: Mooknayak, Bahishkrit Bharat, Manusmriti Dahan Din.
5. `POLITICAL`: Independent Labour Party, Scheduled Castes Federation.
6. `CONSTITUTIONAL`: Drafting Committee Chairmanship, Constituent Assembly Debates, Constitution Presentation.
7. `ECONOMIC`: Hilton Young Commission testimony, Problem of the Rupee, RBI foundation.
8. `ACADEMIC`: Research papers (*Castes in India*), teaching positions at Sydenham College.
9. `WRITINGS`: Major publications (*Annihilation of Caste*, *Who Were the Shudras?*).
10. `SPEECHES`: Historic addresses (*Annihilation of Caste*, Last CAD Speech).
11. `INSTITUTIONS`: People's Education Society, Siddharth College, Milind College.
12. `LEGACY`: Nagpur Dhamma Diksha 1956, Mahaparinirvan.

---

## 4. Archival Deep-Link Integration
Every timeline event card displays:
- Canonical date with precision pill.
- Event title and narrative summary.
- Location badge (e.g. *Mhow*, *New York*, *London*, *Mahad*, *New Delhi*).
- Exact primary citation quote card with page reference.
- **Open Exact Page** action button linking directly to the archival viewer.
- **Ask AI Assistant** action button linking directly to the RAG assistant with context pre-loaded.
