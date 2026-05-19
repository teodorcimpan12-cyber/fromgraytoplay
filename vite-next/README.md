# From Grey to Play

A civic PWA documenting the gap between central and peripheral sports courts in
Târgu Mureș. Built around three asks: **Flip-the-Court** (renovation),
**Street Canvas** (community murals), and **Adopt-a-court** (resident
accountability).

This is the foundation pass. It ships the design system, trilingual content,
eight pages, Firebase wiring, court weather (#12) and a live activity feed
(#5). Tier-S features from the build brief layer on top.

## Stack

- Vite + React 18 + TypeScript
- Plain CSS + CSS variables (no Tailwind)
- Firebase Realtime Database (env-driven)
- React Router v6
- Leaflet via react-leaflet (no API key needed)
- date-fns for locale-aware time formatting

## Run

```bash
npm install
cp .env.example .env   # paste your Firebase web config
npm run dev
```

Without Firebase env vars the app runs in **demo mode**: pages render, but
live signatures, check-ins, and the activity feed are inert. Petition submits
will surface a "you're offline" notice instead of writing.

## Layout

```
src/
  data/courts.ts        Seed court list (approximate Târgu Mureș coords)
  lib/
    firebase.ts         App init + getUserId()
    i18n.tsx            Provider, lookup, browser detect (ro/en/hu)
    courtWeather.ts     Condition → weather icon/color
    utils.ts            cx, anonymizeName, distanceKm, formatNumber
  translations/         ro / en / hu JSON (HU draft — needs native review)
  components/           Nav, Layout, CourtMap, PetitionForm, ActivityFeed, …
  pages/                Home, Courts, CourtDetail, Petition, Community,
                        Impact, Help, About
  styles/               tokens.css + global.css + components.css
```

## Firebase schema

Matches the brief. Top-level keys: `votes`, `signups`, `courts/{id}/{checkins,photos,…}`,
`activity`, `games`, `murals`, `reports`. Add the rules from the brief before
opening up writes publicly — the rules in the brief are MVP-permissive.

## Hungarian translations

The HU file is a working draft. Per the brief's guidance ("don't
machine-translate"), have a Hungarian-speaking classmate or association
review every string before publishing. The strings most worth refining are
the long-form ones in `home.problemBody`, `home.solutionMuralBody`,
`impact.explainBody`, and `petition.lead`.

## Next steps from the roadmap

Foundation done. Highest-value adds, in order:

1. **2.1 Photo evidence wall** — civic dataset, M difficulty
2. **2.2 Letter-to-council generator** — high leverage, S
3. **4.1 3D hero (grey→play)** — visual thesis, L
4. **3.1 Court rating widget** — already half-supported by the schema
5. **5.5 Background sync queue** — for offline petition submits
