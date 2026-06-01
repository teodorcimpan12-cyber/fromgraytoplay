# From Grey to Play — Session Handoff

> Drop this file into a new Claude Code session and say: "Continue from SESSION_HANDOFF.md"

---

## Project

Civic PWA documenting sports court inequality in Târgu Mureș.
- **Repo**: `teodorcimpan12-cyber/fromgraytoplay`
- **Live**: https://fromgraytoplay.netlify.app
- **Preview**: https://deploy-preview-3--fromgraytoplay.netlify.app
- **Stack**: Single-file PWA (`index.html`), React 18 UMD (no JSX — use `React.createElement`), Firebase v9 compat, Leaflet 1.9.4, Three.js r128, jsPDF 2.5.1 — all from CDN

## Branch & PR

- **Working branch**: `claude/civic-features-phase-1-H4sup`
- **PR #3** (open): `claude/civic-features-phase-1-H4sup` → `claude/start-building-BQQ1q`
- PR has 5 commits, NOT yet merged to production
- To deploy live: merge PR #3 (base branch is what Netlify deploys)

## What was built in the last session (5 commits)

### `2b85629` — UI/UX Pro Max
- Press Kit tab on Media page: cinematic hero, 4 stat tiles, `PRESS_QUOTES` constant (ro/en/hu), jsPDF branded export
- `WhatsNewBanner` component — dismissible homepage banner (localStorage `g2p_wb_seen`)
- Ripple effect on all `.btn` (global click handler, `.ripple-el` spans)
- Stagger list on courts grid (`.stagger-list` / `.stagger-item`)
- Radar SVG draw animation (`@keyframes svgDraw`)
- Hero CSS float particles (`@keyframes floatUp`, `.hero-particle`)

### `018aed8` — 3D Hero (Three.js)
- 72-particle ambient cloud (additive blending, grey→mint shift on renovation)
- Renovation shockwave: `TorusGeometry` ring expands 22× over 1.1s
- Camera shake: 0.65s positional noise on renovation trigger
- Key `DirectionalLight` lerps warm-white→stadium-cool with renovation progress

### `d70cdbe` — Full-power Admin (12 tabs)
Old 8-tab panel fully replaced. New tabs: Overview, Signups, Votes, Reports, Courts, Forum, Events, Leaderboard, Users, Activity, Broadcast, Config.
- **Overview**: 6 KPI tiles + live mini activity feed + quick export
- **Courts**: create new courts (name/address/status/condition/lat/lng), inline edit
- **Users**: search, award points, toggle volunteer, delete
- **Activity**: filterable log (100 entries), delete entries
- **Broadcast**: writes `db.ref("announcement")` → `AnnouncementBanner` shows fixed green top bar to ALL visitors
- **Config**: petition target, banner text, featured court + Danger Zone
- `AnnouncementBanner` component in main App render (reads `announcement/`)
- New CSS: `admin-kpi-grid`, `a-mini-feed`, `a-chip`, `a-bcast`, `a-config-row`, `a-danger-zone`, `ann-banner`

### `fe50284` — Full interactive map
- CDN added: `leaflet.markercluster@1.5.3` + `leaflet.heat@0.2.0`
- Tile: CartoDB Dark (`dark_all`) replacing OSM
- Custom teardrop `.map-pin` markers (red/orange/green + `!`/`↻`/`✓` glyphs)
- `L.markerClusterGroup` with branded green cluster circles
- Dark Leaflet popups (bg `#1A1D2E`) with status badge + condition/5
- **Layer switcher** (pill bar, top-center): 🗺 Toate / 🌡 Heat / 🔴 Degradate / ✅ Renovate
- **Heatmap**: `L.heatLayer` weighted by inverse condition score
- **"📍 Cel mai aproape"** button: geolocation → pulsing blue dot + dashed green polyline to nearest degraded court + km distance popup

## Firebase schema (current)

```
fromgreytoplay-default-rtdb/
├── signups/{id}:       { name, email, choice, volunteer, timestamp }
├── votes/:             { flip, mural, both }  ← numbers
├── activity/{id}:      { type, userName, courtId?, timestamp }
├── reports/{id}:       { courtId, courtName, category, description, status, userName, createdAt, official? }
├── courts/{id}:        { name, address, status, condition, lat, lng, type, date }
│   └── checkins/{id}:  { userId, timestamp }
├── bookings/{id}:      { courtId, date, hour, userName }
├── announcement/:      { msg, at, active }          ← NEW (Broadcast tab)
├── config/:            { petitionTarget, banner, featuredCourt }  ← NEW
├── forum/{id}:         { title, type, author, upvotes, downvotes, pinned, locked }
├── events/{id}:        { title, desc, date, location, type, attendeeCount }
├── leaderboard/{id}:   { name, points }
├── users/{id}:         { name, email, points, volunteer }
└── gallery/{id}:       { courtId, url, lat?, lng?, userId, timestamp, isEvidence }
```

## Design tokens (do not drift)

```
--dark: #1A1A2E  --darkCard: #16213E
--green: #10B981  --coral: #F97316  --teal: #0D9488  --red: #DC2626
border-radius: 12px  |  font-display: Space Mono  |  body: Libre Franklin
```

## Architecture rules

- **Single file**: everything in `index.html`. No bundler at root. No JSX — write `React.createElement(...)`.
- **New components**: function returning `React.createElement` calls, match existing style.
- **Strings**: add to `T.ro`, `T.en`, `T.hu`. Flag new HU prose with `// TODO: HU review`.
- **Firebase writes**: also push to `activity/` so the feed picks it up.
- **Large edits**: use Python string replacement (find anchor → slice → reassemble), not line-by-line editing. The file is ~6800 lines.
- **Do NOT touch** `vite-next/` unless explicitly asked to migrate.

## Admin

- URL: `/#/admin`
- Password: `ADMIN_PW = "teodor2026"` (constant near top of `<script>`)

## Roadmap (next priorities)

1. **📸 Photo Evidence Wall** — Firebase Storage upload, masonry grid, GPS tagging, filter per court (roadmap #2.1)
2. **Merge PR #3** → goes live on Netlify (user hasn't merged yet)
3. **Letter-to-council PDF** — already partially shipped, can enhance (roadmap #2.2)

## Quick start for new session

```bash
cd /home/user/fromgraytoplay
git checkout claude/civic-features-phase-1-H4sup
git log --oneline -6   # verify you're at fe50284
# Read graphify-out/graph.json before adding new components
```
