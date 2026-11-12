import { useApp } from "../../app/core.js";

export function MentalSec() {
  const {
    lang
  } = useApp();
  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "mb-2"
  }, "\uD83E\uDDE0 ", lang === "ro" ? "Sport și sănătate mintală" : "Sport and mental health"), /*#__PURE__*/React.createElement("p", {
    className: "mb-2"
  }, lang === "ro" ? "Activitatea fizică reduce depresia cu 30% și anxietatea cu 20% la tineri." : "Physical activity reduces depression by 30% and anxiety by 20% in youth."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-2 mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      background: "rgba(16,185,129,.06)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number"
  }, "30%"), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, lang === "ro" ? "Reducere depresie" : "Depression reduction")), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      background: "rgba(13,148,136,.06)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number",
    style: {
      color: "var(--teal)"
    }
  }, "20%"), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, lang === "ro" ? "Reducere anxietate" : "Anxiety reduction"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(249,115,22,.06)",
      padding: ".8rem",
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm"
  }, /*#__PURE__*/React.createElement("strong", null, lang === "ro" ? "Linii de ajutor" : "Helplines", ":")), /*#__PURE__*/React.createElement("p", {
    className: "text-sm"
  }, "\uD83D\uDCDE ", lang === "ro" ? "Telefonul Sufletului" : "Mental Health Line", ": 0800 801 200"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm"
  }, "\uD83D\uDCDE ", lang === "ro" ? "Telefonul Copilului" : "Child Helpline", ": 116 111")));
}
