import { useApp } from "../app/core.js";
import { cityName } from "../lib/city-name.js";

/* === #4 Inequality receipt — canvas-rendered shareable "store receipt" === */
export function CityDataPending() {
  var lang = useApp().lang;
  return React.createElement("div", { className: "card", style: { borderLeft: "4px solid #6B7280", color: "var(--textSec)", fontSize: ".9rem" } },
    "❔ " + (lang === "ro" ? "Pentru " + cityName(lang) + " starea terenurilor nu e încă verificată pe teren. Graficul apare după primele evaluări."
      : lang === "hu" ? cityName(lang) + ": a pályák állapota még nincs helyszínen ellenőrizve." // TODO: HU review
      : "Court condition in " + cityName(lang) + " is not field-verified yet. This chart appears after the first ratings."));
}
