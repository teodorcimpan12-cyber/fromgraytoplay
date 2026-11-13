import { MoreSection } from "../../components/MoreSection.js";
import { ACTIVE_CITY, useApp } from "../../app/core.js";
import { InequalityReceipt } from "../../components/InequalityReceipt.js";
import { CITIES } from "../../data/constants.js";
import { useEffect, useState } from "../../lib/react.js";
import { BudgetViz } from "./BudgetViz.js";
import { BudgetWatchdog } from "./BudgetWatchdog.js";
import { CarbonCalc } from "./CarbonCalc.js";
import { CityPulse } from "./CityPulse.js";
import { CivicFactsTape } from "./CivicFactsTape.js";
import { CouncilCountdown } from "./CouncilCountdown.js";
import { CsmInvest } from "./CsmInvest.js";
import { DossierButton } from "./DossierButton.js";
import { HealthCalc } from "./HealthCalc.js";
import { HoodChart } from "./HoodChart.js";
import { ImpactCalc } from "./ImpactCalc.js";
import { LettersTracker } from "./LettersTracker.js";
import { MentalSec } from "./MentalSec.js";
import { NeighborhoodRace } from "./NeighborhoodRace.js";
import { OpenDataCard } from "./OpenDataCard.js";
import { ProiecteTab } from "./ProiecteTab.js";
import { ResultsBoard } from "./ResultsBoard.js";
import { SatAuditCard } from "./SatAuditCard.js";
import { SibiuInvest } from "./SibiuInvest.js";
import { TimelineSec } from "./TimelineSec.js";

export function ImpactPage() {
  const {
    t,
    lang
  } = useApp();
  const tabL = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [tab, setTab] = useState(() => { const v = sessionStorage.getItem("g2p_impact_tab"); sessionStorage.removeItem("g2p_impact_tab"); return v || "calc"; });
  const [pulse, setPulse] = useState(false);
  // Command palette deep-link: open City Pulse on arrival.
  useEffect(() => {
    if (sessionStorage.getItem("g2p_open_pulse")) {
      sessionStorage.removeItem("g2p_open_pulse");
      setPulse(true);
    }
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-in"
  }, /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, t.impact), React.createElement(ResultsBoard, null), /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: tab === "calc" ? "active" : "",
    onClick: () => setTab("calc")
  }, tabL("Calculator", "Calculator", "Kalkulátor")), /*#__PURE__*/React.createElement("button", {
    className: tab === "city" ? "active" : "",
    onClick: () => setTab("city")
  }, tabL("Comparație", "Comparison", "Összehasonlítás")), /*#__PURE__*/React.createElement("button", {
    className: tab === "budget" ? "active" : "",
    onClick: () => setTab("budget")
  }, tabL("Buget", "Budget", "Költségvetés")), /*#__PURE__*/React.createElement("button", {
    className: tab === "carbon" ? "active" : "",
    onClick: () => setTab("carbon")
  }, tabL("Mediu", "Environment", "Környezet")), /*#__PURE__*/React.createElement("button", {
    className: tab === "health" ? "active" : "",
    onClick: () => setTab("health")
  }, tabL("Sănătate", "Health", "Egészség")), /*#__PURE__*/React.createElement("button", {
    className: tab === "mental" ? "active" : "",
    onClick: () => setTab("mental")
  }, tabL("Sănătate mintală", "Mental health", "Lelki egészség")), /*#__PURE__*/React.createElement("button", {
    className: tab === "tl" ? "active" : "",
    onClick: () => setTab("tl")
  }, tabL("Cronologie", "Timeline", "Idővonal")), React.createElement("button", { className: tab === "hood" ? "active" : "", onClick: function() { setTab("hood"); }, title: "Neighbourhoods" }, tabL("Cartiere", "Neighbourhoods", "Negyedek")),
  React.createElement("button", { className: tab === "race" ? "active" : "", onClick: function() { setTab("race"); }, title: t.neighborhoodRace||"Cursa cartierelor" }, tabL("Cursă", "Race", "Verseny")),
  React.createElement("button", { className: tab === "letters" ? "active" : "", onClick: function() { setTab("letters"); }, title: lang === "en" ? "Letters to City Hall" : lang === "hu" ? "Levelek a Városházának" : "Scrisori către Primărie" }, tabL("Scrisori", "Letters", "Levelek"))),
  tab === "letters" && React.createElement(LettersTracker, null),
  tab === "proiecte" && React.createElement(ProiecteTab, null), tab === "calc" && React.createElement(React.Fragment, null, React.createElement(ImpactCalc, null), React.createElement(InequalityReceipt, null)), tab === "city" && (ACTIVE_CITY === "tgm" ? /*#__PURE__*/React.createElement(CityComp, null) : React.createElement(SatAuditCard, null)), tab === "budget" && (ACTIVE_CITY === "tgm" ? React.createElement(React.Fragment, null, React.createElement(CsmInvest, null), /*#__PURE__*/React.createElement(BudgetViz, null), React.createElement(BudgetWatchdog, null)) : React.createElement(SibiuInvest, null)), tab === "carbon" && /*#__PURE__*/React.createElement(CarbonCalc, null), tab === "health" && /*#__PURE__*/React.createElement(HealthCalc, null), tab === "mental" && /*#__PURE__*/React.createElement(MentalSec, null), tab === "tl" && /*#__PURE__*/React.createElement(TimelineSec, null), tab === "hood" && React.createElement(HoodChart, null),
  tab === "race" && React.createElement(React.Fragment, null,
    React.createElement(CouncilCountdown, null),
    React.createElement(NeighborhoodRace, null)
  ), React.createElement(MoreSection, { id: "impact" }, /*#__PURE__*/React.createElement(DossierButton, null), /*#__PURE__*/React.createElement(OpenDataCard, null), React.createElement(CivicFactsTape, null),
  React.createElement("div", { className: "card mb-2", style: { borderLeft: "4px solid var(--green)" } },
    React.createElement("div", { className: "flex justify-between items-center", style: { gap: "1rem", flexWrap: "wrap" } },
      React.createElement("div", { style: { flex: 1, minWidth: 180 } },
        React.createElement("h3", { className: "barlow", style: { fontSize: "1.15rem", marginBottom: ".25rem" } }, t.pulseTitle),
        React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)" } }, t.pulseOpenSub)
      ),
      React.createElement("button", { className: "btn btn-green", onClick: () => setPulse(true) }, t.pulseOpen)
    )
  )))), pulse && React.createElement(CityPulse, { onClose: () => setPulse(false) }));
}
export function CityComp() {
  const {
    t
  } = useApp();
  const cs = Object.values(CITIES);
  const mx = Math.max(...cs.map(c => c.b));
  return /*#__PURE__*/React.createElement("div", null, cs.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    className: "mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-sm"
  }, /*#__PURE__*/React.createElement("span", null, c.name), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, "\u20AC", c.b, "/cap")), /*#__PURE__*/React.createElement("div", {
    className: "progress-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill",
    style: {
      width: c.b / mx * 100 + "%",
      background: c.name === "Târgu Mureș" ? "var(--red)" : "var(--green)"
    }
  })))));
}
