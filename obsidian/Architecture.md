---
tags: [topic, architecture]
---

# Architecture

## One-file deploy

The shipped site is a single `index.html` at the repo root. Everything —
React tree, styles, helpers, Firebase init — lives in inline `<script>`
and `<style>` tags. Deploy = upload that one file plus `manifest.json`
and `/icons/*` to Netlify.

```
fromgraytoplay/
├── index.html         ← the entire app, 4,185 lines
├── manifest.json      ← PWA manifest
└── icons/             ← PWA icons (not in repo here)
```

## No bundler at root

The site loads React, Firebase, and Leaflet from CDNs at runtime. There
is no `package.json` at root, no build step, no transpile pipeline.

```html
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

JSX is pre-transpiled to `React.createElement(...)` calls before being
pasted into `index.html`. New components must follow the same form —
plain JS calls to `React.createElement(tag, props, ...children)`. See
[[Conventions]].

## Why both code paths exist

The roadmap (§5.6) recommends a Vite + React + TS migration eventually.
A scaffold sits at `vite-next/`. It's **not deployed** and **not
maintained alongside features** — only touch it when explicitly migrating.

| Rule | Applies to |
|---|---|
| Edit for shipped features | `index.html` only |
| Don't add `package.json` here | repo root |
| Vite is the future, not the present | `vite-next/` |
| Migration trigger | User says "migrate" |

## Tech baseline

| Layer | Choice | Where it loads |
|---|---|---|
| UI | React 18 UMD | `react.production.min.js` from unpkg |
| Data | Firebase v9 compat | `firebase-{app,database,auth}-compat.js` from gstatic |
| Map | Leaflet 1.9.4 | unpkg |
| Fonts | Space Mono · Libre Franklin | Google Fonts |
| Theme | Light + dark | `[data-theme="dark"]` toggle |
| Auth | Firebase auth + `ADMIN_PW` constant | inline |

## State model

```
App (top-level state)
└── AppCtx (React.createContext)
    ├── page (string, e.g. "home")
    ├── lang ("ro" | "en" | "hu")
    ├── theme ("light" | "dark")
    ├── user (Firebase auth user or null)
    ├── toast({ message }) helper
    └── nav(page) helper

Every component calls useApp() to read context.
```

## Data model

See [[Firebase Schema]] for paths. Two rules of thumb:

- **Reads:** `useFirebase("path")` — sets up an `on('value')` listener
  and cleans up.
- **Writes:** `db.ref(path).push({...})` for collections,
  `db.ref(path).transaction(v => (v||0)+1)` for counters.

Every meaningful write should also call [[Helpers/logActivity]] so the
[[Components/ActivityFeed]] picks it up.

## Page routing

Custom: a single `page` string in App state, plus a `nav(name)` helper.
No `react-router`. The big `switch` is at the bottom of `App()`
(around line 4144 of `index.html`).
