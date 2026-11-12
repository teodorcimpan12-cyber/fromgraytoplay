import { COURTS_ALL } from "../app/core.js";

// Admin position corrections (settings/courtPos), cached so they apply before the first render.
export function applyCourtPos(map) {
  if (!map) return;
  COURTS_ALL.forEach(c => {
    const p = map[c.id];
    if (p && isFinite(p.lat) && isFinite(p.lng)) { c.lat = +p.lat; c.lng = +p.lng; c.posFixed = true; }
  });
}
