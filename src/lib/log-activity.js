import { ACTIVE_CITY, COURTS_ALL, db } from "../app/core.js";
import { anonName } from "./next-lang.js";
import { bumpStreak } from "./rel-time.js";

export function logActivity(type, userName, courtId) {
  try {
    db.ref("activity").push({
      type, userName: anonName(userName), courtId: courtId || null, city: ACTIVE_CITY, timestamp: Date.now()
    });
  } catch (e) { /* offline — silently drop */ }
  try { bumpStreak(); } catch (e) { /* streak is best-effort */ }
}
// Which city an activity row belongs to: its own tag, else its court's city, else TGM (all untagged history is TGM).
export function activityCity(a) {
  if (a.city) return a.city;
  const c = a.courtId && COURTS_ALL.find(x => x.id === a.courtId);
  return c ? (c.city || "tgm") : "tgm";
}
// Demo rows (reports sent from the #raporteaza QR path) stay out of the public ticker and feed.
// Status changes made in the admin panel are bookkeeping, not community activity: never shown in a feed.
export function realActivity(a) { return !!a && !a.demo && a.type !== "statusChange" && a.type !== "status"; }
