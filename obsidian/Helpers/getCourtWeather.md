---
tags: [helper]
symbol: getCourtWeather
line: 559
---

# getCourtWeather

`function getCourtWeather(condition, t)` — `index.html:559`. Maps a
court's `condition` (0–1) to an icon + label + color. Shipped session 2.

## Buckets

| Condition | Icon | Label key | Color |
|---|---|---|---|
| ≥ 0.8 | ☀️ | excellent | `#10B981` |
| ≥ 0.6 | 🌤️ | good | `#22C55E` |
| ≥ 0.4 | ⛅ | okay | `#F59E0B` |
| ≥ 0.2 | 🌧️ | poor | `#F97316` |
| < 0.2 | ⛈️ | broken | `#DC2626` |

Returns `{ icon, label, color }`. `label` is localized via the passed
`t` ([[Helpers/T dictionary]]).

## Used by

- [[Pages/CourtDetail]] weather badge.
- [[Pages/CourtsPage]] court cards.

The Vite scaffold has a parallel `courtWeather.ts` ([[vite-next/Source code]])
that returns the same buckets plus a `bg` and `fill` value.
