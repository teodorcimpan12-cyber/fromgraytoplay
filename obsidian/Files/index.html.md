---
tags: [file, root, monolith]
file: index.html
lines: 4185
---

# `index.html`

The whole shipped site. ~4,185 lines. Loaded at the repo root.

## Top-of-file (lines 1–166)

- `<head>`: meta tags, theme color `#10B981`, PWA manifest link,
  apple touch icons, Space Mono + Libre Franklin from Google Fonts,
  Leaflet CSS + JS from unpkg, Firebase compat SDK from gstatic,
  React 18 UMD from unpkg.
- Inline `<style>`: ~150 lines of CSS — see [[Design System]].

## Script init (lines 167–183)

```js
firebase.initializeApp({ databaseURL: "https://fromgreytoplay-default-rtdb.firebaseio.com" });
const db = firebase.database();
const { useState, useEffect, useRef, createContext, useContext, useCallback } = React;
const AppCtx = createContext();
const useApp = () => useContext(AppCtx);
```

## Helpers (171–593)

- L171: [[Helpers/useFirebase]]
- L184: [[Helpers/T dictionary]]
- L559: [[Helpers/getCourtWeather]]
- L571: [[Helpers/nextLang]]
- L577: [[Helpers/anonName]]
- L585: [[Helpers/logActivity]]

## Constants (594–819)

- L594: [[Helpers/COURTS]] — court seed data.
- L786: [[Helpers/TIMELINE]] — historical timeline beats.
- L817: [[Helpers/ADMIN_PW]] — `"teodor2026"`, client-side gate.

## Components (820–4032)

| Line | Symbol | Note |
|---|---|---|
| 820 | `Toast` | [[Components/Toast]] |
| 834 | `Onboarding` | [[Components/Onboarding]] |
| 887 | `InstallBanner` | [[Components/InstallBanner]] |
| 933 | `Navbar` | [[Components/Navbar]] |
| 1040 | `MapView` | [[Components/MapView]] |
| 1086 | `HomePage` | [[Pages/HomePage]] |
| 1229 | `CourtsPage` | [[Pages/CourtsPage]] |
| 1377 | `CourtDetail` | [[Pages/CourtDetail]] |
| 1489 | `ReportModal` | [[Components/Modals]] |
| 1613 | `BookingModal` | [[Components/Modals]] |
| 1745 | `PetitionPage` | [[Pages/PetitionPage]] |
| 2017 | `LetterModal` | [[Components/Modals]] |
| 2068 | `ActivityFeed` | [[Components/ActivityFeed]] |
| 2111 | `CommunityPage` | [[Pages/CommunityPage]] |
| 2132 | `ForumTab` | [[Components/Community Tabs]] |
| 2337 | `EventsTab` | [[Components/Community Tabs]] |
| 2401 | `GalleryTab` | [[Components/Community Tabs]] |
| 2456 | `TeamsTab` | [[Components/Community Tabs]] |
| 2529 | `LBTab` (leaderboard) | [[Components/Community Tabs]] |
| 2580 | `ImpactPage` | [[Pages/ImpactPage]] |
| 2619 | `ImpactCalc` | [[Components/Impact Calculators]] |
| 2672 | `CityComp` | [[Components/Impact Calculators]] |
| 2695 | `BudgetViz` | [[Components/Impact Calculators]] |
| 2768 | `CarbonCalc` | [[Components/Impact Calculators]] |
| 2821 | `HealthCalc` | [[Components/Impact Calculators]] |
| 2874 | `MentalSec` | [[Components/Impact Calculators]] |
| 2923 | `TimelineSec` | [[Components/Impact Calculators]] |
| 2964 | `HelpPage` | [[Pages/HelpPage]] |
| 3130 | `AboutPage` | [[Pages/AboutPage]] |
| 3351 | `ProfilePage` | [[Pages/ProfilePage]] |
| 3549 | `AdminLogin` | [[Pages/AdminLogin]] |
| 3591 | `AdminPanel` | [[Pages/AdminPanel]] |
| 4033 | `Footer` | [[Components/Footer]] |
| 4060 | `App` | top-level; owns `page`, `lang`, `theme`, `user`, `toast` |

## App + render (4060–end)

- `App()` declares state, exposes the context, runs effects:
  - hash-routing listener (`window.addEventListener("hashchange", h)`)
  - theme persistence to `localStorage.fgtp_theme`
  - language persistence to `localStorage.fgtp_lang`
- `P` is the page resolver — big switch on `page` returning the right
  page component.
- `ReactDOM.createRoot(document.getElementById("root")).render(...)`.

## Editing checklist

Before changing this file:

1. Read [[Conventions]] — JSX is not allowed.
2. Read the relevant page or component note (linked above).
3. If you add a write, also wire [[Helpers/logActivity]].
4. If you add a string, update **all three** of `T.ro / T.en / T.hu`
   ([[i18n]]).
5. Commit with a clear message — the file is the deploy surface.
