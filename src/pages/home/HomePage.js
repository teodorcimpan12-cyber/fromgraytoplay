import { isMinimal } from "../../lib/minimal.js";
import { MoreSection } from "../../components/MoreSection.js";
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
  }, React.createElement(HomeOpener, null), /*#__PURE__*/React.createElement("section", {
    className: "home-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    ref: heroRef,
    className: "reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-3 mt-3"
  }, /*#__PURE__*/React.createElement(StatTile, {
    value: COURTS.length, label: t.courtsReported, color: "var(--green)"
  }), /*#__PURE__*/React.createElement(StatTile, {
    value: tv, label: t.petitionVotes, color: "var(--coral)"
  }), /*#__PURE__*/React.createElement(StatTile, {
    value: vc, label: t.volunteers, color: "var(--teal)"
  }))))), React.createElement(ActivityTicker, null), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, React.createElement(SibiuProgressBanner, null), React.createElement(HomeAiCard, null), React.createElement("div", { className: "home-actions" },
    [["courts", "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z", t.reportCourt], ["petition", "M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4", t.voteTitle], ["help", "M12 20s-7-4.4-7-9.6A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.4C19 15.6 12 20 12 20z", t.quickVolunteer]].map(([pg, ic, lbl]) =>
      React.createElement("button", { key: pg, className: "action-card ha-card", onClick: () => setPage(pg) },
        React.createElement("span", { className: "ac-icon ac-svg", "aria-hidden": "true" }, React.createElement("svg", { viewBox: "0 0 24 24" }, React.createElement("path", { d: ic }))),
        React.createElement("span", { className: "ha-label" }, lbl),
        React.createElement("span", { className: "ha-arrow", "aria-hidden": "true" }, "\u2192")))))), !isMinimal() && React.createElement(MoreSection, { id: "home" }, React.createElement(FeaturedCourt, null), React.createElement(City3D, null), React.createElement(Showcase, null)),
  React.createElement(QuickReportFAB, null));
}
