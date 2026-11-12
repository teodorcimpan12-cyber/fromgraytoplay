import { ACTIVE_CITY, useApp } from "../../app/core.js";
import { CIVIC_FACTS_DATA } from "../../data/civic-facts-data.js";

export function CivicFactsTape() {
  if (ACTIVE_CITY !== "tgm") return null;
  var lang = useApp().lang;
  return React.createElement("div", { className: "card mb-2", style: { padding: ".75rem" } },
    React.createElement("h4", { className: "text-xs mb-2", style: { color: "var(--textSec)", fontFamily: "Space Mono, monospace", letterSpacing: ".05em" } },
      lang === "ro" ? "📊 NUMERELE CARE CONTEAZĂ — DATE VERIFICATE 2025" :
      lang === "hu" ? "📊 A FONTOS SZÁMOK — ELLENŐRZÖTT ADATOK 2025" :
      "📊 THE NUMBERS THAT MATTER — VERIFIED DATA 2025"
    ),
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: ".5rem" } },
      CIVIC_FACTS_DATA.map(function(f, i) {
        return React.createElement("div", {
          key: i,
          style: { background: "var(--bgCard)", borderRadius: 10, padding: ".55rem .75rem", borderLeft: "3px solid " + f.color }
        },
          React.createElement("div", { style: { fontSize: "1.2rem", fontWeight: 900, fontFamily: "Space Mono, monospace", color: f.color, lineHeight: 1.1 } }, f.num),
          React.createElement("div", { className: "text-xs mt-1", style: { color: "var(--textSec)", lineHeight: 1.3 } }, f.icon + " " + (f.label[lang] || f.label.ro))
        );
      })
    )
  );
}
