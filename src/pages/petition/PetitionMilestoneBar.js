import { useApp } from "../../app/core.js";
import { MILESTONES } from "../../data/constants.js";

export function PetitionMilestoneBar({ total }) {
  var app = useApp();
  var lang = app.lang;
  var nextMs = MILESTONES.find(function(m) { return m > total; }) || null;
  var barMax = nextMs || MILESTONES[MILESTONES.length - 1];
  var pct = Math.min((total / barMax) * 100, 100);
  return React.createElement("div", { className: "card mb-3", style: { borderLeft: "3px solid var(--green)" } },
    React.createElement("div", { className: "flex justify-between items-center mb-1" },
      React.createElement("span", { style: { fontWeight: 700, fontSize: ".88rem" } },
        "🎯 ", lang === "ro" ? "Progres petiție" : lang === "hu" ? "Petíció állapota" : "Petition progress"
      ),
      React.createElement("span", {
        style: { fontFamily: "'Barlow Condensed',monospace", fontSize: "1.4rem", fontWeight: 800, color: "var(--green)" }
      },
        total,
        React.createElement("span", { style: { fontSize: ".74rem", color: "var(--textSec)", fontFamily: "inherit", marginLeft: 4 } },
          lang === "ro" ? "sem." : lang === "hu" ? "al." : "sig."
        )
      )
    ),
    React.createElement("div", { className: "milestone-bar" },
      React.createElement("div", { className: "milestone-fill", style: { width: pct + "%" } }),
      MILESTONES.filter(function(m) { return m <= barMax; }).map(function(m) {
        var pos = (m / barMax) * 100;
        var reached = total >= m;
        return React.createElement("div", {
          key: m,
          className: "milestone-marker " + (reached ? "ms-reached" : "ms-next"),
          style: { left: pos + "%" },
          title: m + (lang === "ro" ? " semnături" : " signatures")
        },
          React.createElement("span", { className: "milestone-label" }, m >= 1000 ? "1K" : m)
        );
      })
    ),
    nextMs
      ? React.createElement("p", { style: { fontSize: ".76rem", color: "var(--textSec)", marginTop: "1.4rem" } },
          (nextMs - total) + " " + (lang === "ro" ? "până la " + nextMs + " semnături" : lang === "hu" ? "a(z) " + nextMs + "-ig" : "until " + nextMs + " signatures")
        )
      : React.createElement("p", { style: { fontSize: ".76rem", color: "var(--green)", marginTop: "1.4rem", fontWeight: 700 } },
          lang === "ro" ? "🏆 Toate reperele atinse! Incredibil!" : "🏆 All milestones reached! Incredible!"
        )
  );
}
