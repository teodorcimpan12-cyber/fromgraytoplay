---
tags: [vite-next, file]
file: vite-next/package.json
---

# vite-next/package.json

## Scripts

| Script | Command |
|---|---|
| `dev` | `vite` |
| `build` | `tsc --noEmit && vite build` |
| `preview` | `vite preview` |
| `typecheck` | `tsc --noEmit` |

## Runtime deps

`react`, `react-dom`, `react-router-dom`, `firebase` (v10 modular —
**not** compat like the live site), `leaflet`, `react-leaflet`,
`date-fns`, `nanoid`.

## Dev deps

`vite`, `@vitejs/plugin-react`, `typescript`, `@types/*`.

## Notes

- Firebase v10 **modular** here vs v9 **compat** in the live site — APIs
  differ (`onValue(ref(db, path))` vs `db.ref(path).on(...)`).
- This `package.json` lives **only** under `vite-next/`. Per
  [[Conventions]], never add one at the repo root.
