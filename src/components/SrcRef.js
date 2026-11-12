import { useApp } from "../app/core.js";
import { SRC_KIND_IC, SRC_UI } from "../data/constants.js";
import { eggL } from "../lib/g2p-egg.js";
import { useState } from "../lib/react.js";
import { srcById, srcNum, srcVisible } from "../lib/src-by-id.js";

export function canHover() { try { return window.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) { return false; } }
// Jump to the source card in About, remembering where we came from so the card can link back.
export function srcGo(id, page, setPage) {
  try {
    sessionStorage.setItem("g2p_src_from", JSON.stringify({ page: page || "home", y: Math.round(window.scrollY || 0), id: id }));
    sessionStorage.setItem("g2p_about_tab", "sources");
    sessionStorage.setItem("g2p_src_focus", id);
  } catch (e) {}
  if (page === "about") window.dispatchEvent(new CustomEvent("g2p:srcfocus", { detail: { id: id } }));
  else setPage("about");
}
export function SrcRef({ id }) {
  const { lang, page, setPage } = useApp();
  const ui = SRC_UI[lang] || SRC_UI.ro;
  const ids = [].concat(id).filter(x => srcVisible(srcById(x)));
  const [hov, setHov] = useState(null);
  const [sheet, setSheet] = useState(null);
  if (!ids.length) return null;
  const go = x => { setSheet(null); setHov(null); srcGo(x, page, setPage); };
  const card = s => React.createElement(React.Fragment, null,
    React.createElement("div", { className: "srcpop-k" }, (SRC_KIND_IC[s.kind] || "🔗") + " " + s.pub + (s.d ? " · " + s.d : ""), s.isNew && React.createElement("span", { className: "src-new" }, ui.isNew)),
    React.createElement("div", { className: "srcpop-p" }, eggL(s.p, lang)));
  return React.createElement("sup", { className: "srcref" },
    ids.map((x, i) => {
      const s = srcById(x);
      return React.createElement("span", { key: x, className: "srcref-w",
          onMouseEnter: e => { if (canHover()) { const r = e.currentTarget.getBoundingClientRect(); setHov({ id: x, x: r.left + r.width / 2, y: r.top }); } },
          onMouseLeave: () => setHov(null) },
        i > 0 ? "," : null,
        React.createElement("button", { type: "button", className: "srcref-b", "aria-label": ui.src + " " + srcNum(x) + ": " + s.pub,
          onClick: e => { e.preventDefault(); e.stopPropagation(); if (canHover()) go(x); else setSheet(x); } }, srcNum(x)));
    }),
    hov && ReactDOM.createPortal(React.createElement("div", { className: "srcpop", role: "tooltip",
      style: { left: Math.max(150, Math.min(window.innerWidth - 150, hov.x)) + "px", top: hov.y + "px" } },
      card(srcById(hov.id)), React.createElement("div", { className: "srcpop-hint" }, ui.all + " →")), document.body),
    sheet && ReactDOM.createPortal(React.createElement("div", { className: "srcsheet-bg", onClick: () => setSheet(null) },
      React.createElement("div", { className: "srcsheet", role: "dialog", "aria-label": ui.src, onClick: e => e.stopPropagation() },
        React.createElement("div", { className: "srcsheet-grab", "aria-hidden": "true" }),
        React.createElement("div", { className: "srcsheet-n" }, ui.src + " " + srcNum(sheet)),
        React.createElement("strong", { className: "srcsheet-t" }, eggL(srcById(sheet).t, lang)),
        card(srcById(sheet)),
        React.createElement("div", { className: "srcsheet-acts" },
          srcById(sheet).url && React.createElement("a", { className: "btn btn-green btn-sm", href: srcById(sheet).url, target: "_blank", rel: "noopener" }, ui.open),
          React.createElement("button", { className: "btn btn-sm", onClick: () => go(sheet) }, ui.all),
          React.createElement("button", { className: "btn btn-sm btn-ghost", onClick: () => setSheet(null) }, ui.close)))), document.body));
}
