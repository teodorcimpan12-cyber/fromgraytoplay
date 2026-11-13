import { useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { getCourtHealthScore } from "./helpers.js";

export function CourtHealthRing(props) {
  var court = props.court;
  var appCtx = useApp();
  var lang = appCtx.lang, t = appCtx.t;
  var allReports = useFirebase("reports");
  var ratingsData = useFirebase("ratings/" + court.id);
  var unknown = court.condition == null && !(ratingsData && Object.keys(ratingsData).length);
  if (unknown && props.small) {
    return React.createElement("div", { className: "health-ring sm unknown", title: lang === "ro" ? "Scor indisponibil — teren neverificat" : lang === "hu" ? "Nincs pontszám" : "No score yet — court not verified" },
      React.createElement("div", { className: "health-ring-label" }, React.createElement("span", { className: "health-ring-num" }, "?")));
  }
  if (unknown) {
    return React.createElement("div", { className: "health-ring-wrap", style: { color: "#6B7280", fontSize: ".82rem" } },
      "❔ " + (lang === "ro" ? "Scor indisponibil — teren neverificat. Evaluează-l după ce îl vizitezi." : lang === "hu" ? "Nincs pontszám — a pálya nincs ellenőrizve." : "No score yet — court not verified. Rate it after you visit."));
  }
  var score = getCourtHealthScore(court, allReports, ratingsData);
  var color = score >= 70 ? "var(--green)" : score >= 40 ? "var(--coral)" : "var(--red)";
  var R = 36, circ = 2 * Math.PI * R;
  var offset = circ - (score / 100) * circ;
  var trendClass = score >= 70 ? "up" : score >= 40 ? "mid" : "down";
  var trendLabel = score >= 70 ? "↑ " + (lang==="ro"?"excelent":lang==="hu"?"kiváló":"excellent")
    : score >= 40 ? "→ " + (lang==="ro"?"mediu":lang==="hu"?"közepes":"average")
    : "↓ " + (lang==="ro"?"critic":lang==="hu"?"kritikus":"critical");
  if (props.small) {
    return React.createElement("div", { className:"health-ring sm", title: (t.healthScore || "Scor sănătate") + ": " + score + "/100" },
      React.createElement("svg", { viewBox:"0 0 88 88", width:52, height:52, "aria-hidden":"true" },
        React.createElement("circle", { className:"health-ring-bg", cx:44, cy:44, r:R }),
        React.createElement("circle", { className:"health-ring-fill", cx:44, cy:44, r:R, stroke:color, strokeDasharray:circ, strokeDashoffset:offset })),
      React.createElement("div", { className:"health-ring-label" }, React.createElement("span", { className:"health-ring-num", style:{color:color} }, score)));
  }
  return React.createElement("div", { className:"health-ring-wrap" },
    React.createElement("div", { className:"health-ring" },
      React.createElement("svg", { viewBox:"0 0 88 88", width:88, height:88, "aria-hidden":"true" },
        React.createElement("circle", { className:"health-ring-bg", cx:44, cy:44, r:R }),
        React.createElement("circle", { className:"health-ring-fill", cx:44, cy:44, r:R, stroke:color, strokeDasharray:circ, strokeDashoffset:offset })
      ),
      React.createElement("div", { className:"health-ring-label" },
        React.createElement("span", { className:"health-ring-num", style:{color:color} }, score),
        React.createElement("span", { className:"health-ring-sub" }, "/100")
      )
    ),
    React.createElement("span", { className:"health-trend-badge " + trendClass }, trendLabel)
  );
}
