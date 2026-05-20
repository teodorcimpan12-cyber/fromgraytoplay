---
tags: [helper, data]
symbol: COURTS
line: 594
---

# COURTS

`const COURTS = [ {...}, ... ]` — `index.html:594`. Static seed list of
documented courts, merged at runtime with resident-reported courts from
`useFirebase("courts")` (see [[Pages/CourtsPage]]).

## Per-court shape

```
{ id, name, address, neighbourhood,
  condition: 0–1,            // drives weather chip
  status: "degraded"|"inProgress"|"renovated",
  progress: 0–100,           // renovation progress bar
  accessibility: { [feature]: bool },
  lat, lng, category }
```

## Notes

- `condition` (0–1) → [[Helpers/getCourtWeather]].
- `status` → red/coral/green badge.
- Coordinates center on Târgu Mureș; used by [[Components/MapView]].
- The Vite scaffold has its own typed `courts.ts` ([[vite-next/Source code]])
  with a slightly different shape (`side: central|peripheral`, localized
  `note`). They are **not** synced — the live `COURTS` is canonical.
