import { ACTIVE_CITY, useApp } from "../../app/core.js";
import { ATLAS_PROJECTS } from "../../data/constants.js";
import { cityName } from "../../lib/city-name.js";
import { eggL } from "../../lib/g2p-egg.js";

export function AtlasSportCard() {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const list = ATLAS_PROJECTS[ACTIVE_CITY] || [];
  if (!list.length) return null;
  return React.createElement("div", { className: "card mt-2 atlas-card" },
    React.createElement("strong", { style: { display: "block", marginBottom: ".2rem" } }, "📸 ", L3("Cum arată un teren făcut bine", "What a well-built court looks like", "Így néz ki egy jól megépített pálya")), // TODO: HU review
    React.createElement("p", { className: "text-xs", style: { color: "var(--textSec)", margin: "0 0 .5rem" } },
      L3("Poze și video de la Atlas Sport (Târgu Mureș), din " + cityName(lang) + ". Pozele sunt ale lor, le vezi pe site-ul lor.",
        "Photos and video by Atlas Sport (Târgu Mureș), from " + cityName(lang) + ". The photos are theirs; you see them on their site.",
        "Fotók és videó az Atlas Sporttól (Marosvásárhely), " + cityName(lang) + ". A fotók az övék, az ő oldalukon láthatók.")), // TODO: HU review
    React.createElement("div", { className: "atlas-links" }, list.map(p => React.createElement("a", { key: p.url, href: p.url, target: "_blank", rel: "noopener", className: "atlas-link" },
      React.createElement("span", null, eggL(p, lang)), React.createElement("span", { "aria-hidden": "true" }, "↗"))))
  );
}
