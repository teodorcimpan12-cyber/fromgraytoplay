import { useApp } from "../../app/core.js";
import { useState } from "../../lib/react.js";

export function CarbonCalc() {
  const {
    lang
  } = useApp();
  const [y, setY] = useState(200);
  const [d, setD] = useState(5);
  const co2 = Math.round(y * d * 0.21 * 365 / 1000 * 10) / 10;
  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "mb-2"
  }, lang === "ro" ? "Amprenta de carbon" : "Carbon Footprint"), /*#__PURE__*/React.createElement("label", {
    className: "text-sm"
  }, lang === "ro" ? "Tineri" : "Youth", ": ", y), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "50",
    max: "1000",
    step: "50",
    value: y,
    onChange: e => setY(+e.target.value),
    className: "mb-1"
  }), /*#__PURE__*/React.createElement("label", {
    className: "text-sm"
  }, lang === "ro" ? "Distanță medie" : "Avg distance", ": ", d, "km"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: "15",
    value: d,
    onChange: e => setD(+e.target.value),
    className: "mb-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number"
  }, co2, "t"), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "CO\u2082/", lang === "ro" ? "an" : "year")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number",
    style: {
      color: "var(--teal)"
    }
  }, Math.round(co2 / 21), " \uD83C\uDF33"), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, lang === "ro" ? "Echivalent copaci" : "Trees equivalent"))));
}
