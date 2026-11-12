# From Grey to Play — Project Rules (CLAUDE.md)

Civic PWA documenting the inequality between central and peripheral
sports courts in Târgu Mureș. Live at https://fromgreytoplay.netlify.app/.

## Owner preference

Replies to the owner: Romanian, very short (a few lines), no long explanations. Details only if asked.
- "CIC" = Claude in Chrome (the browser extension).
- Skills: before a task, pick the best already-installed skill and use it without being asked. If none fits, look for one
  (skill registries / `.claude/skills/install-saved-reel-skills`) and PROPOSE it; install a new skill only after the owner
  says yes for that skill, pinned to the exact commit SHA that was reviewed (never a moving branch).
- GitHub Copilot works alongside Claude here: request a Copilot review on PRs; treat Copilot/autofix PRs like any
  reviewer's work (verify before merging).

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

- **Vite source, single-file output** (migrated 12 Nov 2026). Source is `index.html` (shell: meta, CDN tags, small inline
  scripts) + `src/`: `main.js` → `app/core.js` (module state, derived consts, side effects, in the original order) →
  `app/`, `components/`, `hooks/`, `lib/`, `pages/<slug>/`, `data/` (literal data, no imports), `i18n/strings.js` (`T`),
  `styles/00…19-*.css` (order matters, listed in `styles/index.css`). `src/legacy/` is unreachable old code, not bundled.
- `npm run build` (Vite 5 + `vite-plugin-singlefile`) writes ONE `dist/index.html` with JS + CSS inlined, plus `public/*`
  copied as is (`manifest.json`, `sw.js`, `icons/`, `data/`, `promo/`, `promo.html`). Netlify publishes `dist/`.
- React + Firebase + Leaflet still load from CDN as globals (`src/lib/react.js` re-exports the hooks). No JSX: components
  are `React.createElement(...)` calls.
- Dev: `npm ci`, then `npm run dev`. Check: `npm run check` (builds, then tests). Smoke: `npm run smoke` (serves `dist/`).

## Safety gates (TOP PRIORITY — the live site must never break)

A syntax error anywhere in the bundled script blanks the entire site (happened in
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

Rules live in `database.rules.json` (deployed to Firebase separately by the owner): no node is open-ended any more —
every public write is create-only, +1-only or shape/size-validated. Visitors are not signed in, so there is no true
per-person rate limit; that needs Firebase App Check (owner, in the console).

## Languages

- `T.ro`, `T.en`, `T.hu` live in `src/i18n/strings.js`.
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
- One component per file, named exports, explicit imports. New CSS goes in a new or the last `src/styles/` file.
- Static files that must be served as is go in `public/`.
- Don't add runtime npm dependencies or JSX without asking; the output must stay one `dist/index.html`.

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
- Session 5 Nov 2026 — official data from Law 544/2001 replies: `CsmInvest` card first on Impact → 💰
  (TGM) with `CSM_INVEST` (29 items, verbatim from CSM reply nr. 2692/03.11.2026) + `CSM_BUDGET`
  (HCL 299/2022, 374/2023, 294/2024, 276/2025): 1.86M lei in 4 years, 49.5% on Liga 3 homologation +
  Sala Polivalentă pedestrian platform; CSM budget +70% vs grounds spending −65% (2022→2025). City Hall
  TGM (51941/04.11.2026) and Sibiu (89234/03.11.2026) extended to 30 days → answers due 25.11.2026;
  `SibiuInvest` text + TIMELINE updated. SW cache → `g2p-v10`. `tools/smoke.mjs` accepts
  `G2P_CDN_MIRROR=<dir>` (<dir>/<host>/<path> copies of the pinned CDN files) for sandboxes that block
  unpkg/gstatic; unset = real CDN, unchanged.
- Same day: Sibiu official answer (Serviciul Public Sport și Agrement, nr. 4541/03.11.2026) shown inside
  `SibiuInvest`: 2022–2026 investments only at Păltiniș, Stadionul Municipal, Obor, Lacul lui Binder; no
  amounts, no court condition, no neighbourhood court. Follow-up asks for values, condition, and who
  manages block courts.
- Mobile platform pass (6 Nov 2026): viewport `viewport-fit=cover, interactive-widget=resizes-content`
  (the 16 existing `env(safe-area-inset-*)` uses were all 0 before); all 78 top-level `:hover` rules now
  sit in `@media(hover:hover) and (pointer:fine)` (non-hover selectors of the same rule stay outside);
  `theme-color` follows the nav bar (#FFFFFF / #0F172A) on boot + theme toggle, no longer the accent;
  app shells `100dvh` (with `100vh` fallback); `touch-action: manipulation` on controls; 16px inputs on
  `pointer: coarse`; nav top + body sides + toast bottom padded by safe-area insets. Block "Mobile
  platform layer" at the end of the main `<style>`. New `:hover` rules go inside the hover media query.
- Break-ui pass on `CsmInvest` (6 Nov 2026): years/budgets derived from the data (no hardcoded 2022/2025),
  every division guarded (`pct` → "—" on 0), unknown `loc` keys get an "Other location: key" label,
  bars clamped 0–100 (negatives shown red, bar at 0), empty state card, "M" only ≥ 1M, RO plurals via
  `Intl.PluralRules` (1 lucrare / 29 de lucrări), numbers formatted in the active language (ro-RO/en-GB/hu-HU),
  rows wrap at 200% zoom, trend sentence picks rose/fell by direction. Stats 2/3 hide when their data is absent.
- Session 6 Nov 2026 (branch `claude/tender-cray-owgf9p`): nav at 200% zoom — between the 1240px
  collapse and 1440px the desktop nav had ~22px spare in EN with a classic scrollbar; signed in, the
  account name pushed it off-page (and the 1240px `.nav-inner` cap overflowed on wide screens too).
  Fix block "Desktop nav at 200% zoom" at the end of the main `<style>`: links padding .48rem ≥1241px,
  account button icon-only 1241–1440px (`.nav-acct-name`, name kept in title/aria-label),
  `.nav-inner` max-width 1320px ≥1441px. SW → `g2p-v11`. New project skill `.claude/skills/arena`
  (/arena: parallel subagents with different strategies + blind judging rounds).
- Session 6 Nov 2026 (branch `claude/asociatie-g2p`): About → new tab **🏛️ Asociația** (`AssociationTab`, key `association`;
  `g2p_about_tab` accepts it). Honest status "în constituire": 3 adult founders (Cîmpan Teodor, Trofin Matei, Drăgan Gabriel),
  steps done/in progress/next (statute, name reservation, court filing OG 26/2000, CIF + account), sustainability rules
  (≈0 lei running cost, no source above 40%, money only through the association after registration, public reports).
  Home-of-About hero has a button to it. Team member "Drăgan Ilie" renamed to "Drăgan Gabriel" (owner-confirmed).
  No legal-entity, bank-account or amount claims anywhere. HU falls back to RO for the new strings (`// TODO: HU review`).
- Session 6 Nov 2026, night (same branch): Sigiliul G2P was built and then **reverted at the owner's request** (commit `0e8bef8`; nothing of it remains).
  Home now opens with `HomeOpener` (before `Hero3D`): full-viewport dark opener with eyebrow "Asociație · în constituire", H1 "Asociația / From Grey to Play",
  message **"Din gri, în joc."** (owner-chosen; EN "From grey, to play."), CTAs (petition, About → Asociația), then a short "why" band:
  "Promovăm sănătatea și sportul prin restaurarea terenurilor de sport." + Health/Sport/Community pills; then the 3D hero scrolls in as before.
  The old hero-premium headline "Terenurile tale contează" is now an `h2` (one `h1` per page). CSS block "Association opener" at the end of the main `<style>`
  (always dark, motion gated by `prefers-reduced-motion`). HU strings are drafts (`// TODO: HU review`).
- Session 6 Nov 2026, late night (same branch, owner feedback — "made for phones, on the road"): Home opener rebuilt mobile-first. Compact (no
  full-viewport height below 900px), single pill "Asociație în constituire", H1 "Asociația / From Grey to Play", message "Din gri, în joc.", then **three equal
  buttons exactly as wide as the message** (Semnează petiția · Raportează (fires `g2p:report`) · Despre asociație → `association` page); the `.ao-cta` uses
  `width:0;min-width:100%` inside `.ao-block{width:fit-content}` to get that width. The target drawing is 5 rings at equal 20-unit spacing + dot + cross
  (`vector-effect:non-scaling-stroke`). The descender of "j" is no longer clipped (padding-bottom on `.ao-play`). The "why" band is one heading + one line
  (no pills; `className: "bar"` is forbidden by a test). New page **`association`** (`AssociationPage`, in `PAGE_IDS`, nav item "🏛️ Asociația" between
  "Cum ajuți" and "Despre", class `nav-assoc`, also in ⌘K); About keeps its Asociația tab. Founder roles: Cîmpan Teodor — coordination; Trofin Matei —
  public relations and finance; Drăgan Gabriel — external activities and project delivery.
- Session 6 Nov 2026, evening (branch `claude/ui-instagram-court`, draft PR on top of `claude/asociatie-g2p`, NOT live until the owner says so): section lines
  fade at both ends (`--fade-line`, `border-image`; classes `fade-b`/`fade-t` for inline rows); About lost the quote + "Echipa" block (team lives only under Asociația);
  opener target moved to the top-right corner and masked so it never touches the buttons; opener buttons are magnetic + 3D-tilt on mouse (`HomeOpener` effect, off with
  reduced-motion/no-fx); Hero3D: green kicker removed, two invisible `.h3d-gutter` strips (16% each, `touch-action: pan-y`, coarse pointers only) so vertical swipes scroll the page;
  `CourtDetail` redesigned Instagram-style (`.cdx*`): photo carousel (uploaded photos, then a static Esri satellite mosaic via `courtTileMosaic`), `CourtPulse` always visible,
  head with badges, one scrolling panel, bottom bar Rezervă · Info · Satelit (centre, raised) · Comunitate · QR (Rezervă/QR open the existing modals). Mascot hidden while the sheet is open (`body.cdx-open`).
- Session 6 Nov 2026, night (same branch `claude/ui-instagram-court`): `AssociationTab` extended from the Astra Hack plan (no amounts, no legal-entity claims): legal steps in the order the law needs
  (statute/act → name reservation → initial assets → office → court filing → CIF/account), "Pregătim acum" checklist, collapsible draft statute (`.assoc-statute`), "Cum devine sustenabilă" revenue ladder
  (founders, Adoptă un teren, 3.5%, local funding, EU as partner, ancillary) and risks + answers. All strings via local `L3` (HU falls back to RO, `// TODO: HU review`).
- Session 6 Nov 2026, night (branch `claude/finantare-230`): PR #36 + #37 merged on the owner's "merge" (live). New `Redirect35Card` (Formularul 230 / 3.5%) at the top of the Association page/tab
  and of the Funding tab: motivation, income-tax calculator (3.5% × the user's own number, pure arithmetic), 4 donor steps, honest "what we still lack" (legal personality, CIF + account, ANAF register via
  form 163, annual report), mailto "anunță-mă", copyable message. Rules from the ANAF guide `Ghid_3_5_2025.pdf` (salary/assimilated income, deadline 25 May, CIF + name + IBAN, 3.5% cap, 2-year option);
  no CIF/IBAN/amount of ours is shown and no year is promised. Association steps gained "Înscriere în registrul pentru 3,5%"; income ladder row updated.
- Session 6 Nov 2026, 23:40 (branch `claude/finantare-230`, PR #38 draft, NOT live): Home opener pill "Asociație în constituire" is now orange with two counter-rotating gears (`.ao-gears`, animation only under `prefers-reduced-motion:no-preference`) = continuous construction; court-sheet bottom bar: the hard line that crossed the raised "Satelit" circle replaced by a soft fade (`.cdx-bar::before`); meta titles/descriptions describe the platform (not the association alone); About contact line "Asociația From Grey to Play (în constituire)"; Funding: "Azi nu strângem bani…"; `AssociationTab` gained a "Jurnal de progres, 6 noiembrie" (real commit times, no invented claims).
- Session 6 Nov 2026, 23:55 (branch `claude/finantare-230`, PR #38, NOT live): `ActivityTicker` fixed — activity types are stored as "check-in"/"conditionReport"/"pixel"/"adopt" but the ticker only knew "checkin", so most rows fell back to "Anon e activ în comunitate"; now every written type has its own verb (new `tickPixel/tickAdopt/tickCondition/tickAnon` in ro/en/hu), names go through `anonName`, rows with unknown types are skipped; `.ticker-wrap` back to its plain border (removed from the fade-line rule). Opener gears: both were turning but the small one was radially symmetric; now each has 3 spokes (`.ao-gear .spokes`) + chunkier teeth, so rotation is visible.
- Session 7 Nov 2026, 00:20 (branch `claude/finantare-230`, PR #38, NOT live): `AssociationTab` progress log now covers the whole of 6 Nov (three untimed "ziua" rows from the earlier sessions in this file + the real 16:35 merge of PR #34, then the evening commits) and every row carries a name (`journal` = [time, text, who]). Rule: only real, documented work goes in; the "who" is Cîmpan Teodor (with Claude) until the owner tells us what Trofin Matei / Drăgan Gabriel actually did — never invent entries or attributions. "Sigiliul retras" now says "la cererea lui Cîmpan Teodor" (was wrongly "echipei").
- Session 7 Nov 2026, 00:35 (branch `claude/finantare-230`, PR #38, NOT live): progress log shows no names (owner request; entries kept, `journal` = [time, text]). Mobile search: the ⌘K magnifier lived only inside `.nav-links.desktop` (hidden ≤1240px), so phones had none; new `button.nav-cmd-m` sits before the hamburger in `.nav-inner` (shown ≤1240px, 40×40, `margin-left:auto`), opens the same `CommandPalette`; desktop button unchanged.
- Session 7 Nov 2026, 00:50 (branch `claude/finantare-230`, PR #38, NOT live): "Anunță-mă când pot redirecționa" was a `mailto:` link — dead on phones without a mail app. Now an in-page form in `Redirect35Card` (email + explicit consent checkbox, validation, busy state, "ești pe listă" via `g2p_r35`); writes `partnerRequests/{pushId}: {company:"3,5%: anunță-mă", email, offer:"redirect35", consent:true, lang, city, date}` — reuses the existing write-once, admin-read-only path so it works with the rules already deployed (read them in Admin → God → `partnerRequests`). Founders are first-year university students, not high-schoolers: the risk row "Fondatorii pleacă după liceu" became "Fondatorii au program încărcat și pot pleca din oraș" (no institution named on the site).
- Session 7 Nov 2026, 01:05 (branch `claude/harti-heatmap-onboarding`, NOT live until the owner says "merge"): Courts tab bar lost the 🔥 heatmap toggle and the 📍 near-me button (both cities share the page). The report heatmap is now permanent on every `MapView` (`heat = true` default; live `reports/` counts are loaded inside `MapView`, rebuild only when the counts change via `heatKey`) — Courts map and the reports-page map. Sibiu courts carry no static `reports` count, so its heat shows only from live `reports/`. First-visit onboarding line 1 names both cities (`bothCities(lang)`: "…din Târgu Mureș și Sibiu"), not only the active one. The near-me helpers (`findNearMe`, `myLoc`) are now unreachable but left in place.
- Session 11 Nov 2026 (branch `ccr-f015c42b-qkn89a`, NOT live until the owner says "merge"): Astra Hack result was 6th of 20 (jury: nothing wrong,
  others scored higher) → priority is proof, not features. New `ResultsBoard` card at the top of Impact ("Rezultate până azi"): live counts via
  `useFbCount` (`signupStats`, `reports` without `demo`/`condition`, `letters`, `CITY_REQUESTS`, `COURTS_ALL`), nothing estimated, "…" while loading.
  New `docs/asociatie/` = draft founding file on OG 26/2000 (checklist, name reservation, office loan contract, founding act, statute, court filing);
  drafts only, a lawyer/notary must check them; never put CNPs or home addresses in the repo. Vite migration postponed (owner asked why; not urgent).
- Same session, showpiece (owner asked for "show-off, professional"): the Home opener's target drawing is replaced by a live court rendered by one
  hand-written WebGL fragment shader (`COURT_FRAG` + `startCourtShader(canvas, host)`, no library). Per-pixel ray onto the ground plane; cracked grey
  asphalt vs painted court blended by a paint mask (256×158 2D canvas uploaded as a texture). The bouncing ball and the visitor's mouse/touch stamp
  paint; the mask decays (2% every 650 ms), so grey creeps back. `.ao-live` on the section shows `.ao-court` and hides `.ao-target` (the target stays
  as the fallback without WebGL). ≥900px: court bottom-right, masked clear of the headline; <900px: a 118px strip under the buttons (extra
  `padding-bottom` on `.ao-inner`). DPR capped 1.5 (1 + every other frame on coarse pointers), paused off-screen/hidden tab, one static frame under
  `fxReduced()`. Camera numbers live in `resize()`; the JS `toCourt()` ray must stay identical to the shader's. Opener buttons use SVG line icons
  (`aoIcon`) instead of emoji.
- Same session, owner feedback: Results card shows **votes** (sum of `votes/`, the number used everywhere else; `signupStats` has fewer rows), has a
  pulsing "live" tag and each number re-animates when it changes (all listeners are `on("value")`, no reload). Shader on phones: `.ao-court` is only the
  150px strip (<900px), so it renders ~4x fewer pixels; camera for the strip is `ro [0,10,-22]`, fov 27; DPR cap 2 on coarse, and a frame-budget guard
  drops `quality` by 20% after three frames over 26 ms (floor 45%). `toCourt()` now measures the canvas, not the section. The site is phone-first:
  check every change at 390px before desktop.
- Same session, owner feedback from a real phone ("it either scrolls or doesn't work; graphics not the best"): shader v2 — linear lighting with sun + sky
  ambient, ACES tone map, micro-relief normals, puddles that reflect the sky, wet-paint lip, two analytic 3D hoops (pole, arm, backboard, rim) that turn
  from rusty to fresh when the paint reaches their key, analytic soft shadows for hoops and ball, resolution-aware line AA. Play model: `.ao-live` has
  `touch-action: pan-y` below 900px, so an up/down swipe ALWAYS scrolls the page and a sideways drag or a tap on the 190px court strip plays (pointer
  events on the section, filtered to the canvas rect by `hit()`; buttons are ignored). The ball follows the finger/cursor for ~2.4 s, a press makes a
  growing splash, then the ball returns to its own path. `.ao-hint` pill ("Atinge sau trage pe teren") fades after the first press (`.ao-played`).
  CDP `Input.synthesizeScrollGesture` does not scroll this page in headless Chromium; test scrolling with raw `Input.dispatchTouchEvent` swipes.
- Session 12 Nov 2026 (branch `ccr-f015c42b-qkn89a`, NOT live until the owner says "merge"): **Vite migration**. The 20k-line `index.html` was split
  mechanically (acorn + scope analysis) into 203 modules under `src/`; behaviour unchanged (text parity crawl of 2 cities × 11 pages × all tabs: 80/81
  states identical, the one difference a mid-animation counter). Static files moved to `public/`; `vite-next/` deleted. `tools/predeploy-check.mjs` now
  builds first and checks `dist/index.html`; `tools/smoke.mjs` serves `dist/`; tests read `index.html` + `src/**` as one text. Data tools patch
  `src/data/*.js` and `public/data/*`. Two intended changes: a garbled CSS comment that swallowed the dark-mode `.card:hover` shadow was repaired
  (`src/styles/16-*.css`), and the first (dead) duplicate of `activityMsg` was dropped. Dead code parked in `src/legacy/`. SW cache → `g2p-v14`.
  Netlify needs `npm ci` to run (it does by default when `package-lock.json` exists).
- Same session: `database.rules.json` — the 11 nodes that were `".write": true` (bookings, pixels, presence, achievements, adoptions, tasks,
  leaderboard, games, gallery, ratings, follows) now validate key shape, types and sizes; counters accept only +1 (forum votes, gallery votes,
  game players); leaderboard points can rise by at most 50 per write and never fall (admin bypasses via the root rule); gallery/games are
  create-only (games may be deleted by their timer). NOT tested on the emulator and NOT deployed — after deploying, try one booking, one pixel,
  one photo, one rating. If you add a field or a write path, update the rule in the same commit.
- Same session, build bug caught before merge: the document-order plugin put the app `<style>` inside the Leaflet `<noscript>`, so the built site
  was unstyled while the text crawl and smoke still passed. Fixed in `vite.config.js`; `predeploy-check` now requires a live `<style>` outside
  `<noscript>` and `smoke` fails if `--green` is not set or `.nav-logo` is unstyled. A failed build leaves an old `dist/`: never trust smoke
  without a green predeploy first.
- Same session, professional cleanup (owner-approved list): Home has ONE hero (`HomeOpener`); `Hero3D` is no longer on Home (file kept, one line
  to restore) and the old `hero-premium` headline is gone — the three stat tiles follow the opener in `.home-stats`. Home action cards use SVG line
  icons (`.ac-svg`). Tabs are words, not emoji: Impact (Calculator, Comparație, Buget, Mediu, Sănătate, Sănătate mintală, Cronologie, Cartiere,
  Cursă, Scrisori), Courts (Hartă/Listă), About, Community; nav item "Asociația" and ~80 h1–h4 headings lost their emoji prefix (admin and
  easter-egg files untouched). ~880 emoji remain in body text, buttons and admin; new headings/tabs/nav items take no emoji. CSS in
  `src/styles/20-home-single-hero.css`. HU tab labels are drafts (`// TODO: HU review`).
- Session 12 Nov 2026, afternoon (same branch): **Târgu Mureș City Hall answered** the Law 544 request (nr. 51941/11.11.2026, by email on 12.11):
  sports budget lines 67.02.05.01 = 5,915,289 lei for 2026 (awards, project contests, partnerships); DALI in progress for courts on str. Busuiocului,
  Budai Nagy Antal and Plopilor; the first two postponed by the Local Council on 24 Sept (cost cuts); skatepark feasibility study approved (HCL 345/19.12.2024);
  SIDU sports pages 396–404. Stored as `CITY_REQUESTS[tgm].answer` (+ `answeredAt`, `answerNo`), rendered by `RequestTracker`; `CsmInvest` note and
  TIMELINE updated. Sibiu's full answer is still due 25.11.2026.
- Same afternoon: `realActivity()` hides admin `statusChange` rows from every feed and from the bell; **mentors** (`MENTORS`, `isMentor`, `MENTOR_BLUE`
  #2F6CF7 from sibiu-it.ro in `data/constants.js`): `anonName` keeps a mentor's full name, leaderboard pins them first with a blue `.mentor-tag`.
  `MENTORS[i].hash` is the SHA-256 of the account email (never the address): when the owner is signed in, `App` makes that account a sheriff with
  `role: "mentor"` in `settings/sherifs/{uid}` — the person must already have a G2P account. Sheriffs get a one-time toast (`g2p_sherif_ack_<uid>`)
  and a row in the bell (`useNotifications().sherif`). SW cache → `g2p-v15`.
- Same afternoon, hosting: Netlify builds deploy previews but has NOT published production since the credits ran out (live stayed at SW `g2p-v11`
  while the default branch was at v13+). Fallback: `.github/workflows/pages.yml` builds the default branch and publishes a mirror on GitHub Pages
  (`https://teodorcimpan12-cyber.github.io/fromgraytoplay/`), after `tools/pages-rewrite.mjs /fromgraytoplay` prefixes the root paths in `dist/`
  (checked locally under the sub-path: no 404, SW scope correct). Owner must enable it once: repo Settings → Pages → Source "GitHub Actions".
  On the mirror the AI function is called on the Netlify domain (cross-origin, not verified) and canonical/OG URLs still point at Netlify.
- Session 12 Nov 2026, night: **Netlify = proxy to GitHub Pages** (keeps fromgreytoplay.netlify.app forever without paying a deploy per merge).
  `netlify.toml` `[context.production]` publishes `netlify-proxy/` (made by `tools/netlify-proxy.mjs`: `/* → github.io/fromgraytoplay/app/:splat 200!`);
  `.github/workflows/pages.yml` puts the unprefixed build in `dist/app/`. Production builds are skipped by `ignore` unless `netlify.toml`,
  the proxy script or `netlify/` change, so it costs ONE deploy (15 credits) to activate, then nothing. Deploy previews still build the full site.
  Not verified on Netlify: that `/.netlify/functions/ai` still reaches the function under the forced `/*` rule, and that header rules apply to proxied files.
  Opener buttons: magnetic pull only on the hovered button, max 6px, so neighbours never overlap (gap stays ≥2px at 1000–1440px).
