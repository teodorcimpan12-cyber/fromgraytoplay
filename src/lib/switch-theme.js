import { THEME_FX_ALT } from "../data/constants.js";
import { themeFxBlocked } from "./download-file.js";

export function switchTheme(e, theme, setTheme) {
  const next = theme === "dark" ? "light" : "dark";
  const apply = () => setTheme(next);
  if (window.__g2pThemeFx && !themeFxBlocked()) {
    if (window.__g2pThemeFxBusy) return;
    const kind = Math.random() < .6 ? "flood" : THEME_FX_ALT[Math.floor(Math.random() * THEME_FX_ALT.length)];
    window.dispatchEvent(new CustomEvent("g2p:themefx", { detail: { next: next, kind: kind, apply: apply } }));
    return;
  }
  const rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (!document.startViewTransition || rm || !ReactDOM.flushSync) { apply(); return; }
  const x = (e && e.clientX) || window.innerWidth / 2, y = (e && e.clientY) || 40;
  const vt = document.startViewTransition(() => { ReactDOM.flushSync(apply); });
  vt.ready.then(() => {
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.animate(
      { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
      { duration: 550, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" }
    );
  }).catch(() => {});
}
