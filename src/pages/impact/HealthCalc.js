import { COURTS, useApp } from "../../app/core.js";
import { useState } from "../../lib/react.js";

export function HealthCalc() {
  const {
    t,
    lang
  } = useApp();
  const [n, setN] = useState(3);
  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "mb-2"
  }, "\uD83D\uDCAA ", t.healthImpact), /*#__PURE__*/React.createElement("label", {
    className: "text-sm"
  }, t.courtsRenovated, ": ", n), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: String(COURTS.length),
    value: n,
    onChange: e => setN(+e.target.value),
    className: "mb-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-3"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number"
  }, n * 12), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, lang === "ro" ? "Obezitate prevenită" : "Obesity prevented")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number",
    style: {
      color: "var(--teal)"
    }
  }, n * 25, "%"), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, lang === "ro" ? "Sedentarism redus" : "Sedentarism reduced")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number",
    style: {
      color: "var(--coral)"
    }
  }, "\u20AC", (n * 18000).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, lang === "ro" ? "Economii sănătate" : "Health savings"))));
}
