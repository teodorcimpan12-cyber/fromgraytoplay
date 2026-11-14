import { useApp } from "../app/core.js";
import { useState } from "../lib/react.js";

/* Secondary blocks of a page, folded behind one quiet "Mai mult" button so the page reads clean.
   Nothing is removed: one tap shows everything, and the choice is remembered for the session. */
export function MoreSection({ id, children }) {
  const { lang } = useApp();
  const key = "g2p_more_" + (id || "x");
  const [open, setOpen] = useState(() => { try { return sessionStorage.getItem(key) === "1"; } catch (e) { return false; } });
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro; // TODO: HU review
  const flip = () => { const v = !open; setOpen(v); try { sessionStorage.setItem(key, v ? "1" : "0"); } catch (e) {} };
  const e = React.createElement;
  return e("div", { className: "more-sec" + (open ? " open" : "") },
    open && e("div", { className: "more-body" }, children),
    e("button", { type: "button", className: "more-btn", onClick: flip, "aria-expanded": open },
      open ? L3("Mai puțin", "Show less", "Kevesebb") : L3("Mai mult", "Show more", "Több"),
      e("svg", { viewBox: "0 0 24 24", width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        e("path", { d: open ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6" }))));
}
