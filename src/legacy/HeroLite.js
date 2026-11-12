import { useApp } from "../app/core.js";
import { useEffect, useRef } from "../lib/react.js";

export function HeroLite() {
  var app = useApp(), t = app.t, setPage = app.setPage;
  var ctaRef = useRef(null);
  // While the big report button is on screen the floating .fab would duplicate it: hide the fab.
  useEffect(function () {
    var el = ctaRef.current, b = document.body;
    if (!el || typeof IntersectionObserver === "undefined") return;
    var io = new IntersectionObserver(function (es) { b.classList.toggle("hl-cta-vis", es[0].isIntersecting); });
    io.observe(el);
    return function () { io.disconnect(); b.classList.remove("hl-cta-vis"); };
  }, []);
  return React.createElement("section", { className: "h3d-hero h3d-lite" },
    React.createElement("div", { className: "h3d-sky", "aria-hidden": "true" }),
    React.createElement("svg", { className: "hl-ball", viewBox: "0 0 100 100", "aria-hidden": "true" },
      React.createElement("circle", { cx: 50, cy: 50, r: 46, fill: "#E8762B" }),
      React.createElement("path", { d: "M4 50h92M50 4v92M17 17c18 18 18 48 0 66M83 17c-18 18-18 48 0 66", fill: "none", stroke: "#1A1A2E", strokeWidth: 3.5, strokeLinecap: "round" })),
    React.createElement("div", { className: "h3d-overlay" },
      React.createElement("div", { className: "h3d-kicker" }, t.heroKicker),
      React.createElement("div", { className: "h3d-title" }, React.createElement("span", { className: "g" }, "From Grey"), React.createElement("br", null), "to ", React.createElement("span", { className: "p" }, "Play")),
      React.createElement("p", { className: "h3d-sub" }, t.heroLiteSub),
      React.createElement("button", { className: "hl-report", ref: ctaRef, onClick: function () { location.hash = "raporteaza"; } },
        React.createElement("span", { "aria-hidden": "true" }, "\uD83D\uDCF8"), t.reportProblem),
      React.createElement("div", { className: "h3d-cta" },
        React.createElement("button", { className: "h3d-btn h3d-btn-ghost", onClick: function () { setPage("petition"); } }, t.heroSign))));
}
