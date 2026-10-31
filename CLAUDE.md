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

## Safety gates (TOP PRIORITY — the live site must never break)

A syntax error anywhere in the main `<script>` blanks the entire site (happened in
`905ade1` and again in `ef587ba`: smart quotes `“en”` used as JS delimiters).
Three gates now stand between a mistake and production:

1. **Netlify build** runs `node tools/predeploy-check.mjs` (see `netlify.toml`). Any failure
   cancels the deploy; the last good version stays live.
2. **git pre-commit** runs the same static check; **pre-push** adds `tools/smoke.mjs`
   (real headless Chrome: every page × both cities + a court detail, fails on any crash).
   Hooks live in `tools/hooks/`; install with `node tools/install-hooks.mjs`.
3. **Runtime**: `PageBoundary` keeps nav/footer alive if one page crashes; a boot guard
   at the end of `<body>` shows a reload screen if the main script failed to parse.

Rules: never `--no-verify`; never paste code with typographic quotes; run
`node tools/predeploy-check.mjs` and `node tools/smoke.mjs` before saying "done".

## Tech baseline

| Layer | Choice |
|---|---|
| UI | React 18 UMD (`react.production.min.js`) |
| Data | Firebase v9 compat (`firebase-{app,database,auth}-compat.js`) |
| Map | Leaflet 1.9.4 |
| Fonts | Space Mono (headings), Libre Franklin (body) |
| Theme | Light + dark via `[data-theme="dark"]` and CSS vars |
| Auth | Firebase Auth `signInWithEmailAndPassword`; `isAdmin` = `firebaseUser.uid === ADMIN_UID` |

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
├── bookings/{pushId}: {courtId, date, hour, userName}
├── settings/: {maintenance, banner:{on,text,type}, flags:{petition,
│               community,booking,effects}, featuredCourtId, accent,
│               broadcast:{text,ts}}            [admin Site Control]
├── pixels/{x_y}: color                          [48×48 collective mural,
│               hex string, 1 px / 10 min / voterKey — Season 3]
└── presence/{voterKey}: true                   [live online counter]
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
- Show-off animation pack: ripple on all buttons (delegated listener in
  App), 3D tilt (`TiltDiv`) on court cards + stat tiles, letter-by-letter
  hero title (`LetterReveal`), floating hero particles, cinematic page
  transitions (keyed `main`), `Reveal` stagger wrapper. All gated behind
  `prefers-reduced-motion`.
- Report heatmap toggle on the courts map (density circles from static
  `reports` + live `reports/` counts).
- Confetti now fires on every petition vote (was milestones-only).
- Pro-max effect pack (per user request): cursor spotlight on all cards,
  magnetic CTA buttons, green page-wipe on navigation, animated conic
  `glow-border` on stat tiles, aurora blobs + shimmer headline in hero,
  live `ActivityTicker` marquee on Home (reads `activity/`). All gated
  behind `prefers-reduced-motion` / `hover:none`.
- REMOVED per user feedback: Before/After slider, scrollytelling
  StoryPage (essay already on About), Google My Maps iframe on Courts.
- Admin "rule everything" (admin panel → ⚙️ Site Control + 🛡️ Moderation):
  live `settings/` node — maintenance mode, announcement banner,
  broadcast toast to all visitors, feature flags (petition/community/
  booking/effects kill-switch), court-of-the-week, accent color override,
  danger zone (reset votes, clear activity). Moderation tab deletes any
  forum/gallery/event/team/game/activity entry.
- Command palette (Ctrl/Cmd+K or 🔍 in navbar): pages, courts (deep
  link), theme/language actions; keyboard nav; respects feature flags.
- Live presence counter (`presence/{voterKey}` + onDisconnect) shown as
  pulsing badge in navbar.
- `FeaturedCourt` spotlight on Home, picked by admin.
- Theme toggle now does a circular reveal (View Transitions API +
  `ReactDOM.flushSync`, falls back gracefully).
- Season 2 feature pack:
  - Achievement/Badge System (12 badges) — `useBadges()` hook, `BadgesGrid` in
    ProfilePage, `BadgeUnlockModal` overlay; badges awarded on petition vote
    (vocal/voter) and court check-in (first_checkin). Firebase: `achievements/`.
  - Court Health Score Ring — `CourtHealthRing` SVG ring (0-100, animated),
    `getCourtHealthScore()` util; integrated into CourtDetail below status badges.
  - Neighborhood Civic Race — `NeighborhoodRace` live bar-chart race of 4
    neighbourhoods by activity+report score; tab "🏁" on ImpactPage.
  - Council Countdown — `CouncilCountdown` days/hours/min until next council
    session; shown on same "race" tab in ImpactPage.
  - Pledge Wall — `PledgeWall` community promise board with emoji picker;
    writes `pledges/`; added to PetitionPage.
  - QR Code Generator — `CourtQRCard` modal using QRious (lazy CDN); branded
    PNG download; "📱 QR" button in CourtDetail.
  - Liquid wave progress bar — `milestone-fill::after` CSS animation.
  - New T strings (neighborhoodRace, civicScore, pledgeWall, countdownTitle,
    qrCardTitle, healthScore, etc.) in ro/en/hu.
- Season 3 feature pack (Cinema Pack):
  - 🛰️ Satellite Time-Machine — `SatelliteTimeMachine` in CourtDetail: Leaflet
    with Esri Wayback 2014 + today's World Imagery, opacity-slider crossfade;
    self-hides after 8 tile errors.
  - 🎮 Shoot-a-Hoop petition hook — `HoopGame` (2D canvas, slingshot physics,
    rigged bent rim that always deflects) at top of PetitionPage for non-voters;
    after 2 throws → "rim's been bent since 2019" + sign CTA; localStorage
    `g2p_hoop`; skipped under reduced-motion.
  - 🗺️ Pixel Wall — `PixelWall`, new "🎨 Pixel" tab in CommunityPage. Shared
    48×48 mural at `pixels/{x_y}` (hex string), 10-color palette, 1 px/10 min
    per voterKey (`g2p_px_ts`), mm:ss cooldown chip, PNG export, live counter,
    logs `pixel` activity.
  - 📊 Inequality Receipt — `InequalityReceipt` canvas receipt (per-hood line
    items from COURTS, "TOTAL DE PLATĂ: 1 RENOVARE", fake barcode, torn edge,
    live supporter count); PNG download + navigator.share. On ImpactPage (calc
    tab) and PetitionPage.
  - 🔥 Live Court Heat — `.heat-1/2/3` glow classes + "🔥 n playing now" chip on
    CourtsPage list cards (check-ins < 2h), plus `HeatWatcher` in App: global
    "join them" toast on fresh check-ins (1 / 3 min max).
  - 🌗 Ambient Light — `AmbientLight` fixed overlay in App: golden tint ±90 min
    around monthly-approximated Târgu Mureș sunset, deep blue at night, 2.5s red
    flash when a new report lands. Off under reduced-motion / `flags.effects`.
  - 🎙️ Sound of Neglect — `CourtSound` in CourtDetail: WebAudio scenes — alive
    (accelerating ball bounces, crowd murmur, sneaker squeaks) vs abandoned
    (LFO wind, water drips, traffic rumble); lazy AudioContext, full cleanup.
  - 🧬 City Pulse — `CityPulse` full-screen 2D-canvas time-lapse (~30s) replaying
    activity+signups: city-hall blooms, court bursts, live counters, scrubber +
    play/pause, Esc. Launched from ImpactPage card and ⌘K (via sessionStorage
    `g2p_open_pulse`). Reduced-motion → static final state.
  - ⌨️ Mayor Mode — type "fixit" (or ⌘K action): cinematic canvas where all 5
    courts flip grey→renovated with confetti + ken burns, type-on pitch
    ("Cost: ~0.3% of the city's annual budget"), CTA → petition.
  - All Season 3 strings in T.ro/T.en/T.hu (HU flagged `// TODO: HU review`);
    every animation gated behind `prefers-reduced-motion` + `.no-fx`.

- Perf pass: preconnects for fonts/unpkg/gstatic, React pinned to 18.3.1
  (the `@18` alias cost a 302 per file), CDN libs moved to end of `<body>`
  (+ preload), jsPDF + Firebase Analytics `defer`red (analytics inits on
  `load`), Leaflet CSS non-blocking, unused Libre Franklin 300 dropped,
  static splash inside `#root`. `netlify.toml` added with cache headers —
  deploy surface now also includes `netlify.toml`. SW cache → `g2p-v4`.

## Roadmap priorities (from the brief)

Highest civic-value next steps:
1. Photo evidence wall (#2.1) — Firebase Storage, M.
2. Letter-to-council generator (#2.2) — jsPDF, S.
3. 3D hero (#1) — Three.js, L. Build in isolation first.

- Admin repair pass: Site Control writes now report success/permission errors
  (silent failures were why switches "snapped back"); ↺ BACK TO NORMAL
  (`resetSiteSettings()`) in Site Control + admin header; banner has its own
  colour (`settings/banner/color`, not tied to accent), delete button and
  visitor ✕; broadcast is an 8s toast, consumed only when visible, expires
  after 24h, shows "last broadcast" + Clear; accent palette = 13 two-tone
  themes (`settings/accent` + `settings/accent2` → `--green`/`--teal`) +
  44 shades + custom picker, cached pre-paint via `g2p_accent`.
- Login: explicit LOCAL persistence, `authReady` gate, Google popup →
  redirect fallback, password reset, SMS fix; `user` is derived from
  Firebase Auth + `users/{uid}` (legacy password-less `g2p_user` removed);
  owner gets 👑 account menu; exiting admin no longer signs out.
- Session 29 Oct 2026 (branch `claude/cool-babbage-lacz7g`, PR #19, NOT live until the owner says so):
  stadium c30 Ladislau Bölöni + `stadium: true`; court counts computed (`courtsPhrase`, `NBH_N`,
  `STADIUM_N`); hero PBR basketball + torus hoop collider; AI Court Doctor (structured diagnosis,
  consent, `reports/*/ai.score`, `AiEstimateBadge`); Letter v2 (OG 27/2002 vs Law 544/2001,
  evidence, photos in PDF, `letters/` + Impact ✉️ tab); residents' verification (`verifications/`,
  consensus of 2 devices, missions from the satellite audit). Firebase schema adds `letters/` and
  `verifications/` — `database.rules.json` must be deployed to Firebase separately.
- Session 30 Oct 2026 (branch `claude/beautiful-newton-blkqs3`): **/promo** — `promo.html`, a
  standalone 32 s kinetic-typography motion promo (canvas, pure `draw(t)`, 120 BPM, cuts on beats,
  ball-wipe transitions, grain + shake, RO/EN/HU, 9:16 + 16:9). Scenes: "NU MAI E GRI" glitch slam →
  chrome logo sting → typing prompt card + paint-splash wipe (grey turns to colour) → court
  today/could-be slider + film strip → data slam (13/30 degraded, 12 in neighbourhoods; centre 11%
  vs neighbourhoods 57%) → "UN TEREN. O COMUNITATE. JOC PENTRU TOȚI." → open-data counters → CTA +
  QR. `node tools/render_promo.mjs` renders `promo/promo-{9x16,16x9}.mp4` + posters; soundtrack
  `promo/soundtrack.m4a` mixed from Higgsfield's CC0 SFX library. Linked from footer + ⌘K.
  Numbers are hard-coded from `COURTS_BASE` (TGM) — update `COPY` in promo.html if the map changes.
  AI B-roll prompts for later: `higgsfield/shots.md`. Deploy surface adds `promo.html` + `promo/*`.
  `sw.js` (g2p-v9): standalone pages no longer overwrite the cached app shell.
- Session 31 Oct 2026 — motion: easing tokens `--ease-out/--ease-in-out/--ease-drawer` + `--spring`
  (Apple damping 0.8 / response 0.4 as CSS `linear()`) in the "Motion polish" / "Apple fluid pack"
  blocks at the end of the main `<style>`. ≤600px every `.modal` inside `.modal-overlay` is an iOS sheet:
  rises from the bottom, grabber, drag-to-dismiss (small `<script>` before the boot guard: 10 px
  hysteresis, 1:1 tracking, rubber-band, Apple momentum projection). Dismiss calls the overlay's own
  React `onClick`, so a modal whose overlay has no onClick simply springs back. Opt out an element with
  `data-no-drag`. Ctrl/Cmd+K palette has no open animation on purpose (keyboard action).
- iOS premium pack (same session): nav fix (`.nav-inner` gap 1rem + max-width 1240px — links overflowed by
  14 px between 1240–1360 px and the active pill touched the logo); navbar scroll-edge (`.nav-scrolled`);
  a gliding `.glide-pill` (desktop nav) and `.glide-ink` (every `.tabs`) driven by a tiny script that only
  reads the existing `.active` classes; staggered mobile-menu links; frosted pill toasts; blurred modal
  backdrops; soft focus ring; 8 ms haptic tick on sheet dismiss. Nothing was removed.
- Apple.com pass (same session; values measured on apple.com): antialiased text, green ::selection,
  smooth scroll; nav glass saturate(180%) blur(20px); **pill buttons** (`.btn`, `.btn-sm`, `.pet-submit`,
  `.h3d-btn` → radius 980px; cards keep 12px); display tracking (h1 -0.015em / lh 1.08, h2 -0.01em);
  scroll-driven reveals (`animation-timeline: view()`, `:where()` so any existing animation on an element
  wins; uses the individual `translate/scale/opacity` properties so tilt + hover transforms still compose);
  hero copy recedes on scroll via the named timeline `--g2pHero` (the hero clips, so plain view() can't see it).
- Premium handoff (F2G-premium-design-handoff.md, same session) — only non-fundamental details taken:
  `text-wrap: balance/pretty`, more section air ≥900px, dimmed-at-rest nav links, Apple 300 ms ease
  (`--ease-apple`) on colour changes, lighter card hover shadow, big 600-weight mobile-menu links,
  quieter footer with hairline, 3 px focus offset. Deliberately NOT taken (would change fundamentals):
  monochrome palette, Inter font, 28 px cards, no-playful-motion rule, page restructure.
