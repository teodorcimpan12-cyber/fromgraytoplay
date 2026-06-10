# From Grey to Play — Project Rules (CLAUDE.md)

Civic PWA documenting the inequality between central and peripheral
sports courts in Târgu Mureș. Live at https://fromgreytoplay.netlify.app/.

## Knowledge Graph

**Înainte de a genera cod sau arhitectură, citește `graphify-out/graph.json`.**
Fișierul conține graful complet al proiectului: componente, pagini, Firebase paths,
utilitare, rute, clase CSS și design tokens — cu relațiile dintre ele.

Utilizare:
- Verifică în `edges[]` ce scrie/citește o componentă înainte să adaugi logică nouă.
- Verifică în `routes{}` ce componentă corespunde unei pagini.
- Nu cere copy-paste din repository dacă informația există în graf.
- După ce adaugi o componentă sau cale Firebase nouă, actualizează `graphify-out/graph.json`.

## Architecture

- **Single-file PWA.** Everything lives in `index.html` at repo root. Build
  output is hand-tuned, not regenerated. Deploy = upload that one file +
  `/manifest.json`, `/sw.js`, `/icons/*` to Netlify.
- **No bundler at root.** React + Firebase + Leaflet load from CDN
  (unpkg / gstatic). JSX is pre-transpiled to `React.createElement(...)`
  inside `<script>` — write new code in that same style or paste raw JSX
  only if you also transpile it.
- **Vite scaffold** lives under `vite-next/` as a future migration target
  per the roadmap §5.6. Do NOT edit it for shipped features; only when
  the user explicitly says "migrate."

## Tech baseline

| Layer | Choice |
|---|---|
| UI | React 18 UMD (`react.production.min.js`) |
| Data | Firebase v9 compat (`firebase-{app,database,auth}-compat.js`) |
| Map | Leaflet 1.9.4 |
| Fonts | Space Mono (headings), Libre Franklin (body) |
| Theme | Light + dark via `[data-theme="dark"]` and CSS vars |
| Auth | Firebase auth, admin pw at top of script (`ADMIN_PW`) |

## Design tokens (don't drift)

- `--dark` `#1A1A2E` · `--darkCard` `#16213E`
- `--green` `#10B981` (primary, sign/sport/active)
- `--coral` `#F97316` (mural/in-progress)
- `--teal` `#0D9488` (both/secondary)
- `--red` `#DC2626` (degraded/danger)
- Border radius `12px`, font display Space Mono.

## Firebase schema (live)

```
fromgreytoplay-default-rtdb/
├── signups/{pushId}: {name, email, choice: flip|mural|both,
│                       volunteer: bool, timestamp}
├── votes/{flip|mural|both}: number
├── activity/{pushId}: {type, userName, courtId?, timestamp}   [new]
├── reports/{pushId}: {courtId, issue, status, timestamp}
├── courts/{id}/checkins/{pushId}: {userId, timestamp}
└── bookings/{pushId}: {courtId, date, hour, userName}
```

Anyone can write — rules are MVP-permissive. Tighten before any press.

## Languages

- `T.ro` and `T.en` dictionaries at ~line 184.
- `T.hu` was added — when adding new strings, add to all three.
- Language switcher cycles `ro → en → hu → ro`.
- Long-form prose (essay, timeline) lives in `ESSAY.{ro,en,hu}` and
  `TIMELINE[i].{ro,en,hu}`.
- HU translations are **draft** — flag any new HU prose with `// TODO: HU review`
  per the brief's "don't machine-translate" rule.

## Conventions

- New components are functions returning `React.createElement(...)` calls.
  Match the existing style — don't introduce JSX without a transpile step.
- Toast for transient success/error: `useApp().toast("message")`.
- Firebase reads: `useFirebase("path")`. Writes: `db.ref(path).push({...})`
  or `db.ref(path).transaction(v => (v||0)+1)` for counters.
- Avoid touching `vite-next/` unless the task is the migration itself.
- Don't add bundlers, package.json, or build steps at the root. Single-file
  is the deploy surface.

## Adding a feature — checklist

1. Add strings to `T.ro`, `T.en`, `T.hu`.
2. If it writes to Firebase, also push an entry to `activity/` so the
   feed picks it up.
3. Use the existing `card`, `btn`, `badge` classes where possible.
4. Keep it mobile-first; nav collapses at 860px.

## What we've shipped this session

- Hungarian translation dictionary + 3-way language cycle.
- `getCourtWeather(condition)` helper + visual weather chip on court cards.
- Live activity feed component (Community page).
- Activity writes from petition vote + check-in.
- Hash routing: every page is bookmarkable; `#court-{id}` deep-links open
  CourtDetail (fixes dead `shareCourt` links + manifest shortcuts).
- `sw.js` created (was registered but missing) — offline shell + CDN cache.
  Deploy surface is now `index.html` + `manifest.json` + `sw.js` + `icons/*`.
- Open Graph / Twitter / canonical / JSON-LD meta for link unfurls.
- Open-data export card (JSON full dataset / CSV reports, CC BY 4.0) on
  Impact page; strips `voterKey` and `photoDataUrl`.
- `<html lang>` follows the active language switcher.
- Fixed dead domain: `SITE`/meta pointed at fromgr**a**ytoplay.netlify.app
  (404); live site is fromgr**e**ytoplay.netlify.app.
- `icons/*` generated and committed (were 404 on the live site — manifest,
  favicon and og:image all referenced missing files).

## Roadmap priorities (from the brief)

Highest civic-value next steps:
1. Photo evidence wall (#2.1) — Firebase Storage, M.
2. Letter-to-council generator (#2.2) — jsPDF, S.
3. 3D hero (#1) — Three.js, L. Build in isolation first.
