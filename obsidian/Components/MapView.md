---
tags: [component, map]
symbol: MapView
line: 1040
---

# MapView

`function MapView({ courts, height })` — `index.html:1040`. Leaflet map
wrapper. Class `.map-box`.

## Behavior

- Initializes a Leaflet map in a `useEffect` (Leaflet loaded from CDN as
  global `L`).
- Drops a marker per court; marker color/popup reflects condition/status.
- Cleans up the map instance on unmount.

## Props

- `courts` — array (static [[Helpers/COURTS]] + Firebase courts).
- `height` — CSS height string (e.g. `"320px"` on [[Pages/HomePage]]).

## Notes

- Center is Târgu Mureș (~`46.5455, 24.5586`).
- Roadmap #4.3 proposes upgrading to MapLibre GL with 3D terrain /
  flyovers — would replace this component. The [[vite-next/Source code]]
  scaffold uses `react-leaflet` instead of raw `L`.
