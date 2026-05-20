---
tags: [page]
symbol: HomePage
line: 1086
---

# HomePage

`function HomePage()` — `index.html:1086`. Route: `home` (default).

## What it renders

1. **Hero band** — dark gradient (`--dark → #16213E`), big basketball
   emoji watermark, title + subtitle (inline ro/en ternary, *not* via
   `T`), green left border.
2. **Three stat cards** (`grid grid-3`):
   - Courts reported = `COURTS.length`
   - Petition votes = `votes.flip + votes.mural + votes.both`
   - Volunteers = count of `signups` where `volunteer === true`
3. **Three quick-action cards** → `setPage("courts" | "petition" | "help")`.
4. **Map section** — embeds [[Components/MapView]] with all `COURTS`,
   height 320px.

## Data

- `useFirebase("votes")` and `useFirebase("signups")`.
- `useApp()` → `t`, `lang`, `setPage`.

## Notes / debt

- Hero copy is inlined as `lang === "ro" ? ... : ...` — only ro/en, **no
  hu**. Should move to [[Helpers/T dictionary]] for full trilingual
  support. See [[i18n]].
- Stat cards reuse the `--green / --coral / --teal` semantics from
  [[Design System]].
