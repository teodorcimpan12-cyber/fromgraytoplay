import { ACTIVE_CITY, useApp } from "../../app/core.js";
import { TIMELINE_SIBIU } from "../../data/timeline-sibiu.js";
import { TIMELINE } from "../../data/timeline.js";

export function TimelineSec() {
  const {
    lang
  } = useApp();
  const list = ACTIVE_CITY === "sibiu" ? TIMELINE_SIBIU : TIMELINE;
  return /*#__PURE__*/React.createElement("div", null, list.map((ev, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "flex gap-2 mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: i === list.length - 1 ? "var(--green)" : "var(--coral)",
      flexShrink: 0
    }
  }), i < list.length - 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 2,
      flex: 1,
      background: "var(--border)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-teal"
  }, ev.y), ev.lei && /*#__PURE__*/React.createElement("span", {
    className: "badge badge-green",
    style: { marginLeft: ".4rem" }
  }, ev.lei), /*#__PURE__*/React.createElement("p", {
    className: "mt-1"
  }, ev[lang] || ev.ro), ev.src && /*#__PURE__*/React.createElement("a", {
    href: ev.src, target: "_blank", rel: "noopener",
    style: { fontSize: ".75rem", color: "var(--textSec)" }
  }, "🔗 ", new URL(ev.src).hostname.replace(/^www\./, ""))))));
}
