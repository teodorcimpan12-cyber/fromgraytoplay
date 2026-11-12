import { useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { tsOf } from "../../lib/next-lang.js";
import { relTime } from "../../lib/rel-time.js";

/* === S4-F2: Court Timeline ===
   Reads activity/ from Firebase, filters by courtId, shows as vertical list. */
export function CourtTimeline({ court }) {
  var _ref = useApp(), t = _ref.t, lang = _ref.lang;
  var rawAct = useFirebase("activity");
  var items = rawAct
    ? Object.values(rawAct)
        .filter(function(a) { return a && a.courtId === court.id; })
        .sort(function(a, b) { return tsOf(b) - tsOf(a); })
        .slice(0, 20)
    : [];
  var typeLabel = function(type) {
    if (type === "check-in") return t.actCheckin || "checked in";
    if (type === "report")   return t.actReport  || "filed a report";
    if (type === "conditionReport") return t.actConditionReport;
    if (type === "photo")    return t.actPhoto   || "added photo evidence";
    if (type === "adopt")    return t.actAdopt   || "adopted the court";
    if (type === "task")     return t.actTask    || "volunteered for a repair";
    if (type === "letter")   return t.actLetter  || "generated a letter";
    return t.actDefault || "was active here";
  };
  return React.createElement("div", { className: "card mt-2" },
    React.createElement("h4", { className: "mb-1" }, "📋 ", t.courtTimeline || "Court history"),
    items.length === 0
      ? React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)" } }, t.timelineEmpty || "No activity yet — be the first.")
      : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: ".45rem" } },
          items.map(function(a, i) {
            return React.createElement("div", { key: i, className: "flex gap-1 items-center text-sm", style: { borderLeft: "2px solid var(--border)", paddingLeft: ".6rem" } },
              React.createElement("span", { style: { color: "var(--textSec)", minWidth: 68, fontSize: ".73rem" } }, relTime(a.timestamp, lang)),
              React.createElement("span", { style: { fontWeight: 600 } }, a.userName || "?"),
              React.createElement("span", { style: { color: "var(--textSec)" } }, " ", typeLabel(a.type))
            );
          })
        )
  );
}
