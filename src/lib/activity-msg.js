import { COURTS } from "../app/core.js";
import { anonName } from "./next-lang.js";

// Shared by the activity feed and the overview: names always shown as "First L.".
export function activityMsg(a, t) {
  const c = a.courtId ? COURTS.find(x => x.id === a.courtId) : null, courtName = c ? c.name : (a.courtId || "");
  const tplKey = "feed" + (a.type === "check-in" ? "Checkin" : (a.type || "").charAt(0).toUpperCase() + (a.type || "").slice(1));
  const who = anonName(a.userName || "Anon");
  const tpl = t[tplKey] || (who + " — " + (a.type || ""));
  return tpl.replace("{name}", who).replace("{court}", courtName);
}
