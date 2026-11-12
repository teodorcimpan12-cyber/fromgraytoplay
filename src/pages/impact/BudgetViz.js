import { useApp } from "../../app/core.js";
import { BUDGET } from "../../data/constants.js";

export function BudgetViz() {
  const {
    t,
    lang
  } = useApp();
  const mx = Math.max(...BUDGET.map(d => d.p));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "mb-2"
  }, lang === "ro" ? "Promis vs Cheltuit (mil. lei)" : "Promised vs Spent (M lei)"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1",
    style: {
      overflowX: "auto"
    }
  }, BUDGET.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.y,
    style: {
      flex: 1,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 180,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      background: "var(--green)",
      borderRadius: "3px 3px 0 0",
      height: d.p / mx * 160 + "px",
      opacity: .5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      background: "var(--red)",
      borderRadius: "3px 3px 0 0",
      height: d.s / mx * 160 + "px"
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1"
  }, d.y)))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mt-2",
    style: {
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      background: "var(--green)",
      borderRadius: 2,
      display: "inline-block",
      opacity: .5
    }
  }), " ", lang === "ro" ? "Promis" : "Promised"), /*#__PURE__*/React.createElement("span", {
    className: "text-xs flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      background: "var(--red)",
      borderRadius: 2,
      display: "inline-block"
    }
  }), " ", lang === "ro" ? "Cheltuit" : "Spent")));
}
