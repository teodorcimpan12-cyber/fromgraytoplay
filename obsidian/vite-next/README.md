---
tags: [vite-next, scaffold]
---

# vite-next/ (migration scaffold)

A Vite + React + TypeScript scaffold parked under `vite-next/`. It is the
**future** migration target per roadmap §5.6 — **not** the deploy
surface. Don't add shipped features here unless the user explicitly says
"migrate." See [[Architecture#Why both code paths exist]].

## Why it exists

The shipped [[Files/index.html]] is a 4k-line single file with no build
step. Eventually that becomes a maintenance liability. This scaffold is
the landing pad: file-per-component, TypeScript types, real tests
possible, env-driven Firebase.

## Differences from the live site

| Aspect | Live `index.html` | `vite-next/` |
|---|---|---|
| Build | none (CDN UMD) | Vite |
| Language | JS, `React.createElement` | TS, JSX |
| Firebase | hardcoded `databaseURL`, public | env vars (`VITE_FIREBASE_*`) |
| Map | raw Leaflet `L` | `react-leaflet` |
| i18n | `T` object in file | `translations/*.json` + context |
| Routing | `page` string + switch | `react-router-dom` |
| Court data | `COURTS` array | typed `data/courts.ts` |

## Status

- Builds and typechecks clean.
- Offline fallback when Firebase env vars are absent.
- HU translations are draft (same caveat as live — [[i18n]]).
- **Not synced** with the live site. When migration starts, the live
  `index.html` is the source of truth to port *from*.

## Files

- [[vite-next/package.json]] — deps + scripts.
- [[vite-next/Source code]] — every `src/` file, one-liners.
