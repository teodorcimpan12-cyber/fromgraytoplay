import { isMentor } from "../../data/constants.js";
import { useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { anonName } from "../../lib/next-lang.js";
import { isOwnerName } from "./helpers.js";

export function LBTab() {
  const {
    t,
    lang
  } = useApp();
  const lb = useFirebase("leaderboard");
  const medals = ["🥇", "🥈", "🥉"];
  const list = lb ? Object.values(lb).filter(u => u && !isOwnerName(u.name)).sort((a, b) => (isMentor(b.name) ? 1 : 0) - (isMentor(a.name) ? 1 : 0) || (b.points || 0) - (a.points || 0)).slice(0, 20) : [];
  if (!list.length) return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      textAlign: "center",
      padding: "2rem"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--textSec)"
    }
  }, t.noData));
  return /*#__PURE__*/React.createElement("div", {
    className: "grid gap-1"
  }, list.map((u, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `card flex items-center gap-2 ${i < 3 ? "card-accent" : ""}`,
    style: {
      padding: ".6rem 1rem"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: i < 3 ? "1.3rem" : "1rem",
      width: "2rem",
      textAlign: "center"
    }
  }, i < 3 ? medals[i] : i + 1 + "."), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, anonName(u.name || "User")), isMentor(u.name) && React.createElement("span", { className: "mentor-tag" }, "MENTOR")), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-green"
  }, u.points || 0, " pts"))), /*#__PURE__*/React.createElement("div", {
    className: "card mt-1",
    style: {
      fontSize: ".82rem",
      color: "var(--textSec)"
    }
  }, /*#__PURE__*/React.createElement("p", null, lang === "ro" ? "Punctaj" : "Points", ": Vote +10 \xB7 Report +25 \xB7 Volunteer +50 \xB7 Challenge +30")));
}
