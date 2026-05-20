---
tags: [vite-next, file, index]
---

# vite-next/ — Source code

Every file in `vite-next/`. All parked; see [[vite-next/README]].

## Config + entry

| File | Purpose |
|---|---|
| `index.html` | Vite entry; loads fonts + Leaflet CSS, mounts `#root` |
| `vite.config.ts` | React plugin, `@/` alias, dev server on 5173 |
| `tsconfig.json` | Strict TS, `@/*` paths |
| `vite-env.d.ts` | Types for `VITE_FIREBASE_*` env vars |
| `.env.example` | Firebase web config template |
| `src/main.tsx` | Mounts `<BrowserRouter><I18nProvider><App/>` |
| `src/App.tsx` | Routes for all 8 pages |

## lib/

| File | Purpose |
|---|---|
| `lib/firebase.ts` | App init from env; `firebaseEnabled` flag; `getUserId()` |
| `lib/i18n.tsx` | `I18nProvider`, `useI18n`, browser detect, `t()` lookup |
| `lib/courtWeather.ts` | `getCourtWeather(condition)` → icon/color/bg/fill |
| `lib/utils.ts` | `cx`, `anonymizeName`, `formatNumber`, `distanceKm` |

## data/

| File | Purpose |
|---|---|
| `data/courts.ts` | Typed `Court[]` seed (8 courts) + `TGM_CENTER`. Shape differs from live [[Helpers/COURTS]] (`side`, localized `note`). |

## components/

`Layout`, `Nav`, `Footer`, `LangSwitcher`, `CourtWeather`, `CourtCard`,
`CourtMap` (react-leaflet), `ActivityFeed` (firebase modular),
`PetitionForm` (votes + signups + progress), `StatsRow`.

## pages/

`Home`, `Courts`, `CourtDetail`, `Petition`, `Community`, `Impact`,
`Help`, `About`. Mirror the live routes but thinner — no admin, no
booking, no community sub-tabs yet (those still only exist in the live
[[Files/index.html]]).

## translations/

`ro.json`, `en.json`, `hu.json` — nested keys (vs flat `T` in live).
HU draft.

## styles/

`tokens.css` (CSS vars + light/dark), `global.css` (base + utilities),
`components.css` (per-component). Mirrors [[Design System]] tokens.

## Migration gap

To reach feature parity with the live site, the scaffold still needs:
admin panel, booking, letter modal, community tabs (forum/events/gallery/
teams/leaderboard), impact calculators, profile + auth, onboarding,
install banner, certificate export. Port from the live file when the
user says "migrate."
