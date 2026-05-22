---
tags: [handoff, session, index]
updated: 2026-05-22
---

# Session Handoff — From Grey to Play

Everything a fresh Claude Code session needs to continue this project. Read
this first.

## 1. What the project is

**From Grey to Play** — a civic PWA documenting the inequality between
central and peripheral sports courts in Târgu Mureș. Live at
https://fromgraytoplay.netlify.app/.

- **Shipped surface = a single file: `index.html`** at repo root (~4.2k
  lines, hand-tuned, no build step). React 18 UMD + Firebase v9 compat +
  Leaflet, all from CDN. JSX is pre-transpiled to `React.createElement(...)`
  inside one big `<script>` — **write new live code in that same style**.
- `vite-next/` is a parked future migration target — **do NOT touch** unless
  the user explicitly says "migrate".
- Full project map lives in the `obsidian/` vault (46+ notes). Open the
  `obsidian/` folder as an Obsidian vault.
- Project rules: see `CLAUDE.md` at repo root (architecture, design tokens,
  Firebase schema, i18n, conventions). Follow it.

### Design tokens (site palette — use these exact hexes)
`--green #10B981` · `--coral #F97316` · `--teal #0D9488` · `--red #DC2626`
· `--dark #1A1A2E` · `--darkCard #16213E`. Fonts: Space Mono (headings),
Libre Franklin (body). Radius 12px.

### Languages
`T.ro`, `T.en`, `T.hu` dictionaries near the top of `index.html`. Add new
strings to **all three**. HU is draft — flag new HU prose with
`// TODO: HU review`.

## 2. Git / branch / how to push  ⚠️ IMPORTANT

- **Work branch (push here only):** `claude/start-building-BQQ1q`
- Repo: `teodorcimpan12-cyber/fromgraytoplay` (public). Default branch is the
  work branch.
- **The environment's git proxy and the GitHub MCP server are READ-ONLY**
  (every write returns 403 "Resource not accessible by integration"). You
  cannot push via `git push origin`, `create_or_update_file`, or
  `push_files`.
- **The only way to push is a user-supplied fine-grained PAT.** The user
  creates one at https://github.com/settings/personal-access-tokens/new
  (Repository = only `fromgraytoplay`, Contents = Read and write, short
  expiry), pastes it in chat, then you push with:
  ```
  git push "https://<TOKEN>@github.com/teodorcimpan12-cyber/fromgraytoplay.git" \
    claude/start-building-BQQ1q:claude/start-building-BQQ1q
  ```
  Always redact the token from any printed output:
  `... 2>&1 | sed -E 's/github_pat_[A-Za-z0-9_]+/[REDACTED]/g'`.
- If the push fails with "could not read Password", the token was revoked —
  ask for a fresh one. Remind the user to delete the token when done (it's
  exposed in chat).

## 3. Previewing on the user's phone (they have no PC)

The user reviews everything on a phone. Two working channels:

1. **githack live link** (best). The repo is public, so any committed file
   renders as a real web page (with working JS / external scripts) via:
   `https://rawcdn.githack.com/teodorcimpan12-cyber/fromgraytoplay/<COMMIT_SHA>/demos/<file>.html`
   Use a **commit-pinned SHA** so the user never gets a cached old version.
2. **`SendUserFile`** for screenshots (PNG) — good for showing render output.

**Do NOT use `htmlpreview.github.io`** for anything that loads an external
library (Three.js, Firebase, etc.) — htmlpreview blocks external scripts, so
those pages fall back to the error state. githack does not block them.

## 4. Self-evaluation: render + screenshot the 3D scene  ⚠️ DO THIS

The user insists on visual correctness ("evaluate if it looks normal from a
human perspective"). A headless render harness is set up under `/tmp/render/`
(ephemeral — recreate if the container reset):

```
mkdir -p /tmp/render && cd /tmp/render && npm init -y && npm i puppeteer@23
curl -sL -o three.min.js https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
# render.js: injects <script src=three.min.js> into the demo head, loads
# file://, screenshots grey + (click #renovateBtn) renovated + a rotated
# view + a court crop. Launch flags for software WebGL:
#   --no-sandbox --enable-webgl --use-gl=angle --use-angle=swiftshader
#   --enable-unsafe-swiftshader --ignore-gpu-blocklist
node render.js   # writes grey.png renov.png renov_rot.png crop.png
```
Then **Read the PNGs and actually look** before telling the user it's done.
Note: headless runs the renovate cinematic slowly, so the white flash
lingers for several seconds — wait ~9s after the click, and the rotated
frame (taken latest) is the cleanest renovated view. In a real browser the
transform is ~1.5s.

## 5. What's been built this session (all on the work branch)

- Obsidian vault mapping every file (`obsidian/`).
- QR/share fix: single `SITE` const, killed 5 stale-domain refs.
- Letter-to-council generator upgrade (#2.2): neighbourhood targeting,
  "why it matters" field, trilingual body citing SIDU + live count, email +
  download.
- **Photo evidence wall (#2.1)** — `GalleryTab` in `index.html`: upload
  (camera/library) → client-side canvas compress to a data URL → stored in
  Firebase RTDB `gallery/` (Storage bucket isn't configured, so no Firebase
  Storage; this is the pragmatic path). Tags court, neighbourhood, status,
  caption; writes an `activity/` entry; per-court strip shown in
  `CourtDetail`. Standalone preview: `demos/photo-wall-demo.html`.
- **3D hero (#1)** — built in isolation as `demos/hero3d-demo.html` (NOT yet
  integrated into `index.html`). Details below.

## 6. The 3D hero — `demos/hero3d-demo.html`

Self-contained Three.js (r128) scene, vanilla JS (no React). Loads Three
dynamically with 3 CDN fallbacks (cdnjs/unpkg/jsdelivr) so it survives
different renderers. Concept: a small realistic "world" — a fenced
multi-use court (MUGA) as a colour oasis inside a grey, monotonous city.

Structure: `world` (scaled 0.7) → `group` (rotates: court + city + props +
balls + kids) + a grey **base plate** everything stands on. Drag to rotate
the whole world; tap **Renovează** for a cinematic (fast spin → white flash
→ renovated court revealed) with confetti + kids that appear and play.

Implemented & visually verified:
- Court texture: grey cracked asphalt (bump-mapped) ⇄ renovated acrylic
  matching the user's reference image but in **site colours** (teal
  surround, `#1A1A2E` court, green/teal/coral concentric end fans, white
  lines, G2P emblem + "FROM GREY TO PLAY" wordmark).
- MUGA end units: football goal + basketball backboard/hoop mounted on the
  goal frame (net stays in the mouth, doesn't cross poles). Goal net has
  back + sloped top + side panels.
- Two balls (basketball + soccer) with touch grab-and-flick + real
  gravity/bounce physics; idle bounce until touched; resume bounce when left
  to rest. Can score in goals ("⚽ Gol!") and hoops ("🏀 Coș!").
- Detailed kids (eyes, hair, hands, shoes) running; modern anthracite fence
  (posts, rails, welded mesh, kickboard, gate gap); grey city of
  Târgu-Mureș-style blocks with looping detailed cars on a ring road;
  bigger grass park with floodlights/bench/trees ON the grass; soft shadows.
- Renovate-only items (appear only when renovated): floodlights, smart
  equipment locker (Flip-the-Court app cabinet, inside the fence), the two
  campaign posters (Flip the Court + Street Canvas) hung on the fence.

### Recurring gotchas / things the user has flagged
- Keep everything **on the grey base plate** (rotates with the world) so
  nothing floats.
- No object overlaps: floodlights on grass (not asphalt), trees away from
  poles and **not in front of the entrance**, posters clear of fence posts,
  locker inside the fence (not clipping).
- Renovated court must use **site colours**, not neon.
- Balls must read as real — uniform basketball with correct seam layout,
  soccer with pentagons.

## 7. Pending / next steps

- **Integrate the 3D hero into `index.html`** as the Home hero (the demo is
  approved-in-progress). Wrap as a React component (`React.createElement`
  style), init Three in a `useEffect` with a ref, clean up on unmount, and
  **pause rAF when offscreen / tab hidden** (battery). Keep the live
  "Semnează petiția" button wired to the petition.
- Possible further hero polish the user may still want (balls realism,
  micro-details).
- Roadmap after hero: revisit photo wall on real uploads; other civic
  features per `CLAUDE.md` roadmap.
- **Deploy:** `index.html` is the deploy file. Easiest for a phone-only
  user is connecting Netlify to the GitHub repo (auto-deploy from the work
  branch); otherwise manual upload of `index.html` + `/manifest.json` +
  `/icons/*`.

## 8. File map (quick)

- `index.html` — the shipped app (edit here for real features).
- `demos/hero3d-demo.html` — 3D hero (isolation).
- `demos/photo-wall-demo.html` — photo wall preview.
- `obsidian/` — knowledge-graph vault of the whole project.
- `CLAUDE.md` — project rules.
- `vite-next/` — parked; do not touch.

## 9. Working style the user expects

- They're on a phone, mostly writing in Romanian — reply in Romanian.
- After each change: push (PAT) → give a commit-pinned githack link → and
  for the 3D scene, render + look at it yourself before claiming done.
- Be meticulous; they call out every visual bug. Verify, don't assume.
