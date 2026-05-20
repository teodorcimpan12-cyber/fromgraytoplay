---
tags: [page]
symbol: CourtsPage
line: 1229
---

# CourtsPage

`function CourtsPage()` — `index.html:1229`. Route: `courts`.

## What it renders

- Header with **+ Report court** button → opens [[Components/Modals]] ReportModal.
- Two filter dropdowns:
  - **Status**: `all | degraded | inProgress | renovated`
  - **Neighbourhood**: `all | <hood>`
- Tab switch: **map** (default) vs **list**.
- Selecting a court opens [[Pages/CourtDetail]] as a modal.
- Can also open [[Components/Modals]] BookingModal.

## Data

- Static [[Helpers/COURTS]] **merged** with `useFirebase("courts")`
  (resident-reported courts):
  ```js
  const all = [...COURTS, ...extra];   // extra = Firebase courts
  ```
- Filtered by `status` and `neighbourhood`.

## Court object shape

```
{ id, name, address, condition (0-1), status, progress (0-100),
  accessibility: { [feature]: bool }, neighbourhood, lat, lng, category }
```

`status` ∈ `degraded | inProgress | renovated` (maps to red/coral/green
badges). `condition` (0–1) drives the weather chip via
[[Helpers/getCourtWeather]].

## Related

- [[Components/MapView]] renders the map tab.
- [[Pages/CourtDetail]] is the per-court modal.
