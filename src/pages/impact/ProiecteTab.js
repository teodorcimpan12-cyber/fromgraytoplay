import { useApp } from "../../app/core.js";
import { PROIECTE } from "../../data/proiecte.js";

export function ProiecteTab() {
  var app = useApp(); var t = app.t; var lang = app.lang;
  var statusColors = { done: "var(--teal)", approved: "var(--green)", inProgress: "var(--coral)", model: "var(--green)" };
  var statusLabels = {
    done: t.statusDone || "Finalizat",
    approved: t.statusApproved || "Aprobat",
    inProgress: t.statusInProgress || "În lucru",
    model: t.statusModel || "Model alt oraș"
  };
  var statusIcons = { done: "✅", approved: "🟢", inProgress: "🔨", model: "🌟" };
  return React.createElement("div", { className: "mt-2" },
    React.createElement("p", { className: "text-sm mb-2", style: { color: "var(--textSec)" } },
      lang === "ro" ? "Proiecte reale în Târgu Mureș + model comparabil — date verificate" :
      lang === "hu" ? "Valós TGM-projektek + összehasonlító modell — ellenőrzött adatok" :
      "Real projects in Târgu Mureș + comparable model — verified data"
    ),
    PROIECTE.map(function(p) {
      var col = statusColors[p.status];
      return React.createElement("div", { key: p.id, className: "card mb-2", style: { borderLeft: "4px solid " + col } },
        React.createElement("div", { className: "flex justify-between items-center mb-1" },
          React.createElement("span", { style: { fontSize: "1.4rem" } }, p.icon),
          React.createElement("span", {
            className: "badge",
            style: { background: col + "22", color: col, fontWeight: 700, fontSize: ".72rem", padding: ".2rem .6rem" }
          }, statusIcons[p.status] + " " + statusLabels[p.status])
        ),
        React.createElement("h4", { style: { fontSize: "1rem", fontWeight: 700, marginBottom: ".2rem" } }, p.name[lang] || p.name.ro),
        React.createElement("div", { style: { fontSize: "1.8rem", fontWeight: 900, fontFamily: "Space Mono, monospace", color: col, lineHeight: 1.1, marginBottom: ".3rem" } }, p.amount),
        React.createElement("div", { className: "text-xs mb-1", style: { color: "var(--textSec)" } },
          "📍 ", p.address[lang] || p.address.ro, " · 📅 ", p.year
        ),
        React.createElement("p", { className: "text-sm mb-1", style: { lineHeight: 1.5 } }, p.desc[lang] || p.desc.ro),
        React.createElement("div", { className: "text-xs mb-2", style: { color: "var(--textSec)" } },
          "💰 ", p.funding[lang] || p.funding.ro
        ),
        React.createElement("div", {
          style: { background: p.noteColor + "18", border: "1px solid " + p.noteColor + "55", borderRadius: 8, padding: ".5rem .75rem", fontSize: ".8rem", fontWeight: 600, color: p.noteColor, lineHeight: 1.45 }
        }, p.note[lang] || p.note.ro)
      );
    })
  );
}
