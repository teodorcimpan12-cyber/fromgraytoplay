import { ACTIVE_CITY } from "../app/core.js";
import { useFirebase } from "./useFirebase.js";
import { useFollows } from "./useFollows.js";
import { activityCity } from "../lib/log-activity.js";
import { tsOf } from "../lib/next-lang.js";
import { useState } from "../lib/react.js";

/* === Navbar === */
/* B3 — Notifications panel */
/* Notifications: this city's activity (or only followed courts) + the latest admin announcement.
   "Seen" is a timestamp in localStorage; the bell shows the unread count for everyone, not only followers. */
export function useNotifications() {
  const { follows } = useFollows();
  const followedIds = Object.keys(follows);
  const actData = useFirebase("activity");
  const settings = useFirebase("settings");
  const [seen, setSeen] = useState(() => parseInt(localStorage.getItem("g2p_notif_seen") || "0", 10) || 0);
  const all = actData ? Object.entries(actData).map(([id, a]) => ({ id, ...a, ts: tsOf(a) }))
    .filter(a => a.ts && activityCity(a) === ACTIVE_CITY).sort((a, b) => b.ts - a.ts).slice(0, 40) : [];
  const bc = settings && settings.broadcast && settings.broadcast.text ? { id: "bc", type: "broadcast", text: settings.broadcast.text, ts: settings.broadcast.ts || 0 } : null;
  const mine = all.filter(a => a.courtId && followedIds.indexOf(a.courtId) >= 0);
  const unread = all.filter(a => a.ts > seen).length + (bc && bc.ts > seen ? 1 : 0);
  const markRead = () => { const n = Date.now(); try { localStorage.setItem("g2p_notif_seen", String(n)); } catch (e) {} setSeen(n); };
  return { all, mine, bc, unread, seen, markRead, followedIds };
}
