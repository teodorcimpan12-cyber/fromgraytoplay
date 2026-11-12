import { COURTS, useApp } from "../../app/core.js";
import { useState } from "../../lib/react.js";

export function ImpactCalc() {
  const {
    t,
    lang
  } = useApp();
  const [n, setN] = useState(3);
  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("label", {
    className: "font-bold"
  }, t.courtsRenovated, ": ", n), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: String(COURTS.length),
    value: n,
    onChange: e => setN(+e.target.value),
    className: "mt-1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-3 mt-3"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number"
  }, n * 180), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, t.youthAffected)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number"
  }, (n * 2400).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, t.sportHours)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number",
    style: {
      color: "var(--coral)"
    }
  }, "\u20AC", (n * 45000).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, t.healthSavings))), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-2",
    style: {
      color: "var(--textSec)"
    }
  }, lang === "ro" ? "Bazat pe date WHO și EU Sport" : "Based on WHO and EU Sport data"));
}
