import { useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { realActivity } from "../../lib/log-activity.js";
import { anonName, tsOf } from "../../lib/next-lang.js";

/* ============================================================
   LIVE ACTIVITY TICKER — infinite marquee fed by activity/.
   Two copies of the row give a seamless loop; hover pauses.
   ============================================================ */
export function ActivityTicker() {
  const { t } = useApp();
  const data = useFirebase("activity");
  // Activity types are stored as written by each feature ("check-in", "conditionReport", ...); only rows we can phrase are shown.
  const ICO = { petition: "✊", "check-in": "📍", checkin: "📍", photo: "📸", report: "⚠️", conditionReport: "🩺", game: "⚽", join: "👥", pixel: "🎨", adopt: "💚" };
  const VERB = { petition: t.tickPetition, "check-in": t.tickCheckin, checkin: t.tickCheckin, photo: t.tickPhoto, report: t.tickReport, conditionReport: t.tickCondition, game: t.tickGame, join: t.tickJoin, pixel: t.tickPixel, adopt: t.tickAdopt };
  const items = data ? Object.values(data).filter(a => realActivity(a) && VERB[a.type]).sort((a, b) => tsOf(b) - tsOf(a)).slice(0, 14) : [];
  if (!items.length) return null;
  const nm = a => { const n = anonName(a.userName); return n === "Anonim" ? t.tickAnon : n; };
  const row = key => React.createElement("div", { className: "ticker", key: key, "aria-hidden": key === "b" ? "true" : undefined },
    items.map((a, i) => React.createElement("span", { className: "ticker-item", key: i },
      (ICO[a.type] || "•") + " ", React.createElement("b", null, nm(a)), " " + VERB[a.type])));
  return React.createElement("section", { className: "ticker-wrap", title: t.tickerTitle }, row("a"), row("b"));
}
