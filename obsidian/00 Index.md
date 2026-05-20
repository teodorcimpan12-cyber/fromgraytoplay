---
tags: [index, map]
aliases: [Index, Project Map, Home]
---

# 00 Index — Project Map

**From Grey to Play** — civic PWA documenting the gap between central and
peripheral sports courts in Târgu Mureș. Live at
[fromgraytoplay.netlify.app](https://fromgraytoplay.netlify.app/).

> [!info] One-file deploy
> The shipped site is a single hand-tuned `index.html` (4,185 lines).
> A Vite migration scaffold sits in `vite-next/` but is *not* the deploy
> target — see [[Architecture]] for why.

## Top-level files

| File | Purpose |
|---|---|
| [[Files/index.html]] | The whole shipped site — React via UMD, inline `<script>`, ~4.2k lines |
| [[Files/manifest.json]] | PWA manifest — icons, theme color, shortcuts |
| [[Files/CLAUDE.md]] | Project rules loaded into every Claude session |
| [[Files/README]] | (none yet at root) |
| [[Files/.gitignore]] | Ignores `node_modules`, env files, build output |
| [[vite-next/README]] | Migration scaffold target — Vite + React + TS |

## Topic notes

- [[Architecture]] — single-file deploy, no bundler, CDN dependencies
- [[Design System]] — color tokens, fonts, radii, theme switching
- [[Firebase Schema]] — every RTDB path, write conventions
- [[i18n]] — `T.ro / T.en / T.hu`, language cycling, draft HU strings
- [[Conventions]] — coding style, `React.createElement`, toast pattern
- [[Roadmap]] — what's next, prioritized from the brief
- [[Session Log]] — what shipped in each Claude session

## Pages (in shipped `index.html`)

| Page | Route | Source line | Note |
|---|---|---|---|
| Home | `home` | 1086 | [[Pages/HomePage]] |
| Courts | `courts` | 1229 | [[Pages/CourtsPage]] |
| Court Detail | `court/:id` | 1377 | [[Pages/CourtDetail]] |
| Petition | `petition` | 1745 | [[Pages/PetitionPage]] |
| Community | `community` | 2111 | [[Pages/CommunityPage]] — 5 tabs |
| Impact | `impact` | 2580 | [[Pages/ImpactPage]] — 6 calculators |
| Help | `help` | 2964 | [[Pages/HelpPage]] |
| About | `about` | 3130 | [[Pages/AboutPage]] |
| Profile | `profile` | 3351 | [[Pages/ProfilePage]] |
| Admin Login | `admin` (gated) | 3549 | [[Pages/AdminLogin]] |
| Admin Panel | `admin` (after pw) | 3591 | [[Pages/AdminPanel]] |

## Shared components

- [[Components/Toast]] (820)
- [[Components/Onboarding]] (834)
- [[Components/InstallBanner]] (887)
- [[Components/Navbar]] (933)
- [[Components/MapView]] (1040)
- [[Components/ActivityFeed]] (2068)
- [[Components/Modals]] — ReportModal (1489), BookingModal (1613), LetterModal (2017)
- [[Components/Community Tabs]] — Forum, Events, Gallery, Teams, LB
- [[Components/Impact Calculators]] — ImpactCalc, CityComp, BudgetViz, CarbonCalc, HealthCalc, MentalSec, TimelineSec
- [[Components/Footer]] (4033)

## Helpers and globals

- [[Helpers/useFirebase]] (171) — read-only Firebase listener
- [[Helpers/T dictionary]] (184) — i18n strings
- [[Helpers/getCourtWeather]] (559) — condition → icon/label/color
- [[Helpers/nextLang]] (571) — `ro → en → hu → ro`
- [[Helpers/anonName]] (577) — "Andrei P." privacy strip
- [[Helpers/logActivity]] (585) — single source of writes to `activity/`
- [[Helpers/COURTS]] (594) — court seed data
- [[Helpers/TIMELINE]] (786) — historical timeline data
- [[Helpers/ADMIN_PW]] (817) — hardcoded admin password

## Vite migration scaffold (parked)

Don't edit for shipped features. See [[Architecture#Why both code paths exist]].

- [[vite-next/README]]
- [[vite-next/package.json]]
- [[vite-next/Source code]] — App, main, lib, components, pages, styles

## Quick links

- Live site → https://fromgraytoplay.netlify.app/
- GitHub → https://github.com/teodorcimpan12-cyber/fromgraytoplay
- Firebase RTDB → `fromgreytoplay-default-rtdb.firebaseio.com`
- Brief → `/root/.claude/uploads/.../FROM_GREY_TO_PLAY_BUILD_BRIEF.md` (uploaded)
- Roadmap → `/root/.claude/uploads/.../FROM_GREY_TO_PLAY_ROADMAP.md` (uploaded)
