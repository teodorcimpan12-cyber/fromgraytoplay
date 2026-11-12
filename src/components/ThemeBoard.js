import { g2pSfx, useApp } from "../app/core.js";
import { themeFxBlocked } from "../lib/download-file.js";
import { useRef, useState } from "../lib/react.js";
import { switchTheme } from "../lib/switch-theme.js";

/* Theme button: a mechanical DAY / NIGHT scoreboard. Switch 5 times in a few seconds and it
   goes into overtime. */
export function ThemeBoard({ big }) {
  const { theme, setTheme, lang } = useApp();
  const [ot, setOt] = useState(false);
  const hits = useRef([]);
  const W = { ro: ["ZI", "NOAPTE", "PRELUNGIRI"], en: ["DAY", "NIGHT", "OVERTIME"], hu: ["NAP", "ÉJ", "HOSSZABBÍTÁS"] }[lang] || ["ZI", "NOAPTE", "PRELUNGIRI"];
  const label = ot ? W[2] : theme === "dark" ? W[1] : W[0];
  const onClick = e => {
    const now = Date.now();
    hits.current = hits.current.filter(t => now - t < 6000).concat(now);
    if (hits.current.length >= 5 && !ot) {
      hits.current = [];
      setOt(true); g2pSfx("whistle");
      try { window.dispatchEvent(new CustomEvent("g2p:egg", { detail: { id: "overtime" } })); } catch (err) {}
      setTimeout(() => setOt(false), 2600);
      return;
    }
    if (!window.__g2pThemeFx || themeFxBlocked()) g2pSfx("flip");
    switchTheme(e, theme, setTheme);
  };
  const next = theme === "dark" ? W[0] : W[1];
  return React.createElement("button", {
    className: "theme-board" + (big ? " big" : "") + (theme === "dark" ? " night" : " day") + (ot ? " ot" : ""),
    onClick: onClick, title: next, "aria-label": (lang === "en" ? "Switch to " : lang === "hu" ? "Váltás: " : "Treci pe ") + next.toLowerCase()
  },
    React.createElement("span", { className: "tb-led", "aria-hidden": "true" }),
    React.createElement("span", { className: "tb-win", "aria-hidden": "true" },
      React.createElement("span", { key: label, className: "tb-flap" }, label)));
}
