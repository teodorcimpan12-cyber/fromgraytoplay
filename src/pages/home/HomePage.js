import { COURTS, useApp } from "../../app/core.js";
import { QuickReportFAB } from "../../components/QuickReportFAB.js";
import { SibiuProgressBanner } from "../../components/SibiuProgressBanner.js";
import { TiltDiv } from "../../components/TiltDiv.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useReveal } from "../../hooks/useReveal.js";
import { cityName } from "../../lib/city-name.js";
import { ActivityTicker } from "./ActivityTicker.js";
import { City3D } from "./City3D.js";
import { FeaturedCourt } from "./FeaturedCourt.js";
import { Hero3D } from "./Hero3D.js";
import { HomeAiCard } from "./HomeAiCard.js";
import { HomeOpener } from "./HomeOpener.js";
import { Showcase } from "./Showcase.js";
import { useCountUp } from "./useCountUp.js";

/* Polish: animated stat tile with count-up + colored glow */
export function StatTile({ value, label, color }) {
  const n = useCountUp(value);
  return React.createElement(TiltDiv, { max: 9, className: "stat-tile glow-border" },
    React.createElement("div", { className: "stat-glow", style: { background: color } }),
    React.createElement("div", { className: "stat-number", style: { color } }, n),
    React.createElement("div", { className: "stat-label" }, label)
  );
}
export function HomePage() {
  const {
    t,
    lang,
    setPage
  } = useApp();
  const votes = useFirebase("votes");
  const signups = useFirebase("signupStats");
  const tv = votes ? (votes.flip || 0) + (votes.mural || 0) + (votes.both || 0) : 0;
  const vc = signups ? Object.values(signups).filter(s => s.volunteer).length : 0;
  const heroRef = useReveal();
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-in"
  }, React.createElement(HomeOpener, null), /*#__PURE__*/React.createElement(Hero3D, null), /*#__PURE__*/React.createElement("section", {
    className: "hero-premium"
  }, /*#__PURE__*/React.createElement("div", { className: "hero-mesh" }),
     React.createElement("div", { className: "aurora", "aria-hidden": "true" }, React.createElement("span", null), React.createElement("span", null), React.createElement("span", null)),
     /*#__PURE__*/React.createElement("div", { className: "hero-grid-lines" }),
     /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: { position: "relative", zIndex: 1 }
  }, /*#__PURE__*/React.createElement("div", {
    ref: heroRef,
    className: "reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-pill"
  }, /*#__PURE__*/React.createElement("span", { className: "live-dot" }), " 2026"), /*#__PURE__*/React.createElement("h2", {
    className: "hero-title shimmer-text"
  }, lang === "ro" ? "Terenurile tale contează" : "Your courts matter"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#C7CBD1",
      maxWidth: 560
    }
  }, lang === "ro" ? "Documentăm inegalitatea infrastructurii sportive din " + cityName(lang) + ". Semnează petiția, raportează terenuri degradate." : "Documenting sports infrastructure inequality in " + cityName(lang) + ". Sign the petition, report degraded courts.")),/*#__PURE__*/React.createElement("div", {
    className: "grid grid-3 mt-3"
  }, /*#__PURE__*/React.createElement(StatTile, {
    value: COURTS.length, label: t.courtsReported, color: "var(--green)"
  }), /*#__PURE__*/React.createElement(StatTile, {
    value: tv, label: t.petitionVotes, color: "var(--coral)"
  }), /*#__PURE__*/React.createElement(StatTile, {
    value: vc, label: t.volunteers, color: "var(--teal)"
  })))), React.createElement(ActivityTicker, null), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, React.createElement(SibiuProgressBanner, null), React.createElement(HomeAiCard, null), React.createElement("div", { className: "home-actions" },
    [["courts", "\uD83D\uDCCD", t.reportCourt], ["petition", "\u270A", t.voteTitle], ["help", "\uD83E\uDD1D", t.quickVolunteer]].map(([pg, ic, lbl]) =>
      React.createElement("button", { key: pg, className: "action-card ha-card", onClick: () => setPage(pg) },
        React.createElement("span", { className: "ac-icon", "aria-hidden": "true" }, ic),
        React.createElement("span", { className: "ha-label" }, lbl),
        React.createElement("span", { className: "ha-arrow", "aria-hidden": "true" }, "\u2192")))))), React.createElement(FeaturedCourt, null), React.createElement(City3D, null), React.createElement(Showcase, null),
  React.createElement(QuickReportFAB, null));
}
