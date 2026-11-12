import { ACTIVE_CITY, COURTS, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { activityMsg } from "../../lib/activity-msg.js";
import { activityCity, realActivity } from "../../lib/log-activity.js";
import { tsOf } from "../../lib/next-lang.js";
import { relTime } from "../../lib/rel-time.js";

/* === Activity Feed (build brief #5) === */
export function ActivityFeed() {
  const { t, lang } = useApp();
  const data = useFirebase("activity");
  const list = data
    ? Object.entries(data).map(([id, a]) => ({ id, ...a })).filter(a => realActivity(a) && activityCity(a) === ACTIVE_CITY).sort((a, b) => tsOf(b) - tsOf(a)).slice(0, 30)
    : [];
  const COURT_NAMES = COURTS.reduce((acc, c) => (acc[c.id] = c.name, acc), {});
  const ICONS = { "check-in": "🏀", petition: "✍️", photo: "📸", report: "⚠️", game: "⚽", join: "🤝" };
  const msgFor = a => activityMsg(a, t);
  const ago = ts => {
    if (!ts) return "—";
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return s + "s";
    if (s < 3600) return Math.floor(s / 60) + "m";
    if (s < 86400) return Math.floor(s / 3600) + "h";
    return Math.floor(s / 86400) + "d";
  };
  return /*#__PURE__*/React.createElement("div", null,
    /*#__PURE__*/React.createElement("h3", { style: { marginBottom: ".8rem", display: "flex", alignItems: "center", gap: ".5rem" } },
      /*#__PURE__*/React.createElement("span", { className: "live-dot" }),
      t.liveActivity
    ),
    list.length === 0
      ? /*#__PURE__*/React.createElement("p", { style: { color: "var(--textSec)" } }, t.feedEmpty)
      : /*#__PURE__*/React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: ".5rem" } },
          list.map((a, i) => /*#__PURE__*/React.createElement("div", {
            key: a.id,
            className: "card" + (i === 0 ? " card-accent" : ""),
            style: { display: "flex", gap: ".7rem", alignItems: "center", padding: ".7rem .9rem" }
          },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: "1.3rem", lineHeight: 1, flexShrink: 0 } }, ICONS[a.type] || "•"),
            /*#__PURE__*/React.createElement("div", { style: { flex: 1, minWidth: 0 } },
              /*#__PURE__*/React.createElement("p", { style: { margin: 0, fontSize: ".92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, msgFor(a)),
              /*#__PURE__*/React.createElement("time", { style: { fontFamily: "'Space Mono', monospace", fontSize: ".68rem", color: "var(--textSec)", textTransform: "uppercase", letterSpacing: ".06em" } }, relTime(a.timestamp, lang))
            ),
            i === 0 && /*#__PURE__*/React.createElement("span", { className: "live-dot", style: { flexShrink: 0 } })
          ))
        )
  );
}
