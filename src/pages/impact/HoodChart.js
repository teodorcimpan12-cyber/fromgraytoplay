import { ACTIVE_CITY, COURTS, useApp } from "../../app/core.js";
import { CityDataPending } from "../../components/CityDataPending.js";
import { T } from "../../i18n/strings.js";
import { courtStatusView } from "../../lib/court-status-view.js";
import { hoodName } from "../../lib/next-lang.js";
import { gapReady, scoredCourts } from "../../lib/scored-courts.js";

export function VerifiedShare() {
  var t = useApp().t, n = scoredCourts().length;
  if (n === COURTS.length) return null;
  return React.createElement("div", { style: { fontSize: ".78rem", color: "var(--textSec)", margin: ".25rem 0 .6rem" } },
    "✔ " + t.verifiedShare.replace("{n}", n).replace("{m}", COURTS.length));
}
/* ============================================================
   NEIGHBOURHOOD INEQUALITY CHART
   ============================================================ */
export function HoodChart() {
  if (!gapReady()) return React.createElement(CityDataPending, null);
  var app = useApp();
  var t = app.t, lang = app.lang;
  var hoodNames = {
    tudor:      "Tudor Vladimirescu",
    auchan:     "Zona Auchan",
    mureseni:   "Mureșeni",
    center:     "Centru / Cornești",
    pandurilor: "Pandurilor",
    libertate:  "Libertate",
    unirii:     "Unirii"
  };
  var hoods = {};
  scoredCourts().forEach(function(c) {
    if (!hoods[c.neighbourhood]) hoods[c.neighbourhood] = [];
    hoods[c.neighbourhood].push(c);
  });
  var rows = Object.entries(hoods).map(function(entry) {
    var id = entry[0], courts = entry[1];
    var avg = courts.reduce(function(s,c) { return s + c.condition; }, 0) / courts.length;
    var acc = courts.reduce(function(s,c) {
      var a = c.accessibility;
      return s + [a.wheelchair, a.lighting, a.parking, a.flatSurface].filter(Boolean).length;
    }, 0) / (courts.length * 4) * 100;
    var degraded = courts.filter(function(c) { return courtStatusView(c, t).bad; }).length;
    return { id: id, name: ACTIVE_CITY === "tgm" ? (hoodNames[id] || id) : hoodName(id, lang), courts: courts, avg: avg, acc: acc, degraded: degraded };
  }).sort(function(a, b) { return a.avg - b.avg; });

  var worstAvg = rows[0] ? rows[0].avg : 1;
  var bestAvg = rows[rows.length - 1] ? rows[rows.length - 1].avg : 5;
  var gap = bestAvg - worstAvg;

  function barColor(v) {
    return v <= 2 ? "var(--red)" : v <= 3.5 ? "var(--coral)" : "var(--green)";
  }
  function accColor(v) {
    return v <= 30 ? "var(--red)" : v <= 60 ? "var(--coral)" : "var(--green)";
  }

  return React.createElement("div", null,
    React.createElement(VerifiedShare, null),
    // Gap callout
    React.createElement("div", { className: "hood-gap-callout" },
      React.createElement("div", { className: "flex justify-between items-center", style: { flexWrap: "wrap", gap: ".5rem" } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: ".72rem", fontWeight: 700, color: "var(--red)", letterSpacing: 1, textTransform: "uppercase", marginBottom: ".2rem" } },
            lang === "ro" ? "Decalaj documentat" : lang === "hu" ? "Dokumentált különbség" : "Documented gap"
          ),
          React.createElement("div", { style: { fontSize: "2rem", fontWeight: 800, fontFamily: "'Barlow Condensed',monospace", color: "var(--red)", lineHeight: 1 } },
            gap.toFixed(1) + " / 5 pts"
          ),
          React.createElement("div", { style: { fontSize: ".78rem", color: "var(--textSec)", marginTop: ".2rem" } },
            rows[0] && rows[rows.length-1]
              ? (lang === "ro"
                  ? rows[0].name + " (" + worstAvg.toFixed(1) + ") vs " + rows[rows.length-1].name + " (" + bestAvg.toFixed(1) + ")"
                  : rows[0].name + " (" + worstAvg.toFixed(1) + ") vs " + rows[rows.length-1].name + " (" + bestAvg.toFixed(1) + ")")
              : ""
          )
        ),
        React.createElement("div", { className: "flex gap-3" },
          React.createElement("div", { style: { textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "1.6rem", fontFamily: "'Barlow Condensed',monospace", fontWeight: 800, color: "var(--red)", lineHeight: 1 } },
              scoredCourts().filter(function(c) { return courtStatusView(c, t).bad; }).length
            ),
            React.createElement("div", { style: { fontSize: ".68rem", color: "var(--textSec)" } },
              lang === "ro" ? "degradate" : "degraded"
            )
          ),
          // Outside TGM nothing is being renovated yet — show the good courts among those scored instead.
          ACTIVE_CITY !== "tgm" && React.createElement("div", { style: { textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "1.6rem", fontFamily: "'Barlow Condensed',monospace", fontWeight: 800, color: "var(--green)", lineHeight: 1 } },
              scoredCourts().filter(function(c) { return c.condition >= 4; }).length
            ),
            React.createElement("div", { style: { fontSize: ".68rem", color: "var(--textSec)" } },
              lang === "ro" ? "în stare bună" : lang === "hu" ? "jó állapotú" : "in good shape" // TODO: HU review
            )
          ),
          ACTIVE_CITY === "tgm" && React.createElement("div", { style: { textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "1.6rem", fontFamily: "'Barlow Condensed',monospace", fontWeight: 800, color: "var(--coral)", lineHeight: 1 } },
              COURTS.filter(function(c) { return c.status === "inProgress"; }).length
            ),
            React.createElement("div", { style: { fontSize: ".68rem", color: "var(--textSec)" } },
              lang === "ro" ? "în lucru" : "in progress"
            )
          ),
          ACTIVE_CITY === "tgm" && React.createElement("div", { style: { textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "1.6rem", fontFamily: "'Barlow Condensed',monospace", fontWeight: 800, color: "var(--green)", lineHeight: 1 } },
              COURTS.filter(function(c) { return c.status === "renovated"; }).length
            ),
            React.createElement("div", { style: { fontSize: ".68rem", color: "var(--textSec)" } },
              lang === "ro" ? "renovate" : "renovated"
            )
          )
        )
      )
    ),
    // Condition bar chart
    React.createElement("div", { className: "card mb-2" },
      React.createElement("h4", { style: { fontSize: ".9rem", marginBottom: "1rem", fontWeight: 700 } },
        lang === "ro" ? "Condiție medie pe cartier (1=degradat → 5=excelent)"
        : lang === "hu" ? "Átlagos állapot kerületenként (1=leromlott → 5=kiváló)"
        : "Average condition by neighbourhood (1=degraded → 5=excellent)"
      ),
      rows.map(function(row) {
        var color = barColor(row.avg);
        var pct = (row.avg / 5) * 100;
        return React.createElement("div", { key: row.id, className: "hood-chart-row" },
          React.createElement("div", { className: "hood-chart-label" }, row.name),
          React.createElement("div", { className: "hood-chart-bar-wrap" },
            React.createElement("div", { className: "hood-chart-bar", style: { width: pct + "%", background: color } })
          ),
          React.createElement("div", { className: "hood-chart-val", style: { color: color } }, row.avg.toFixed(1))
        );
      }),
      // Legend
      React.createElement("div", { className: "flex gap-3 mt-2", style: { flexWrap: "wrap" } },
        [["var(--red)", lang === "ro" ? "Degradat (1-2)" : "Degraded (1-2)"],
         ["var(--coral)", lang === "ro" ? "Parțial (3)" : "Partial (3)"],
         ["var(--green)", lang === "ro" ? "Bun (4-5)" : "Good (4-5)"]
        ].map(function(item) {
          return React.createElement("div", { key: item[1], className: "flex items-center gap-1", style: { fontSize: ".74rem" } },
            React.createElement("div", { style: { width: 11, height: 11, borderRadius: 3, background: item[0], flexShrink: 0 } }),
            React.createElement("span", { style: { color: "var(--textSec)" } }, item[1])
          );
        })
      )
    ),
    // Accessibility chart
    React.createElement("div", { className: "card mb-2" },
      React.createElement("h4", { style: { fontSize: ".9rem", marginBottom: "1rem", fontWeight: 700 } },
        lang === "ro" ? "Accesibilitate pe cartier (rampe + iluminat + parcare + suprafață)"
        : lang === "hu" ? "Akadálymentesség kerületenként"
        : "Accessibility by neighbourhood (ramps + lighting + parking + surface)"
      ),
      rows.map(function(row) {
        var color = accColor(row.acc);
        return React.createElement("div", { key: row.id + "_a", className: "hood-chart-row" },
          React.createElement("div", { className: "hood-chart-label" }, row.name),
          React.createElement("div", { className: "hood-chart-bar-wrap" },
            React.createElement("div", { className: "hood-chart-bar", style: { width: row.acc + "%", background: color } })
          ),
          React.createElement("div", { className: "hood-chart-val", style: { color: color, fontSize: ".88rem" } }, Math.round(row.acc) + "%")
        );
      })
    ),
    // Full court list
    React.createElement("div", { className: "card" },
      React.createElement("h4", { style: { fontSize: ".88rem", marginBottom: ".8rem", fontWeight: 700 } },
        lang === "ro" ? "Toate terenurile" : lang === "hu" ? "Minden pálya" : "All courts"
      ),
      COURTS.map(function(c) {
        var sView = courtStatusView(c, T[lang] || T.ro), sColor = sView.color, sLabel = sView.label;
        return React.createElement("div", {
          key: c.id,
          className: "flex justify-between items-center",
          style: { borderBottom: "1px solid var(--border)", padding: ".42rem 0", fontSize: ".82rem" }
        },
          React.createElement("div", null,
            React.createElement("span", { style: { fontWeight: 600 } }, c.name),
            React.createElement("span", { style: { color: "var(--textSec)", marginLeft: ".4rem", fontSize: ".72rem" } },
              hoodNames[c.neighbourhood] || hoodName(c.neighbourhood, lang)
            )
          ),
          React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement("span", { style: { color: sColor, fontSize: ".72rem", fontWeight: 700 } }, sLabel),
            React.createElement("span", { style: { color: "var(--coral)", fontFamily: "'Barlow Condensed',monospace", fontWeight: 800, fontSize: "1rem" } },
              c.condition == null ? "?" : c.condition + "/5"
            )
          )
        );
      })
    )
  );
}
