import { COURTS, useApp } from "../../app/core.js";
import { Reveal } from "../../components/Reveal.js";
import { TiltDiv } from "../../components/TiltDiv.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { extraCourts, getCourtWeather } from "../../lib/court-status-view.js";

/* Admin-picked "court of the week" spotlight on Home (settings/featuredCourtId). */
export function FeaturedCourt() {
  const { t, settings } = useApp();
  const fbCourts = useFirebase("courts");
  const id = settings && settings.featuredCourtId;
  if (!id) return null;
  const extra = extraCourts(fbCourts);
  const c = COURTS.concat(extra).find(x => x.id === id);
  if (!c) return null;
  const w = getCourtWeather(c.condition, t);
  return React.createElement("section", { className: "section" },
    React.createElement("div", { className: "container" },
      React.createElement(Reveal, null,
        React.createElement(TiltDiv, { max: 5, className: "card glow-border featured-card" },
          React.createElement("div", { className: "flex justify-between items-center", style: { gap: "1rem", flexWrap: "wrap" } },
            React.createElement("div", null,
              React.createElement("span", { className: "badge badge-green", style: { display: "inline-block", marginBottom: ".4rem" } }, "⭐ " + t.featured),
              React.createElement("h3", { className: "barlow", style: { fontSize: "1.35rem" } }, c.name),
              React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)", marginBottom: ".4rem" } }, c.address),
              React.createElement("span", { className: "badge", style: { background: w.color + "22", color: w.color } }, w.icon, " ", w.label)),
            React.createElement("button", { className: "btn btn-green", onClick: () => { location.hash = "#court-" + c.id; } }, t.featuredCta + " →"))))));
}
