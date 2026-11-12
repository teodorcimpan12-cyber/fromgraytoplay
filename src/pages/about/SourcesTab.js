import { ACTIVE_CITY, useApp } from "../../app/core.js";
import { RequestTracker } from "../../components/RequestTracker.js";
import { SRC_KIND_IC, SRC_UI } from "../../data/constants.js";
import { cityName } from "../../lib/city-name.js";
import { fxReduced } from "../../lib/fx-reduced.js";
import { eggL } from "../../lib/g2p-egg.js";
import { useEffect, useState } from "../../lib/react.js";
import { copyText, srcCite, srcList, srcNum } from "../../lib/src-by-id.js";

export function srcPageName(p, t) { return ({ home: t.home, courts: t.courts, reports: t.reports, petition: t.petition, community: t.community, impact: t.impact, help: t.howToHelp, about: t.about, press: "Press" })[p] || p; }
/* About -> Sources: grouped by city with a filter, type icon + date + what each source proves,
   copy citation, "new" marks for sources added in Oct 2026, and links both ways with the numbers. */
export function SourcesTab({ onEssay }) {
  const { t, lang, setPage } = useApp();
  const ui = SRC_UI[lang] || SRC_UI.ro;
  const [f, setF] = useState("all");
  const [focus, setFocus] = useState(() => { try { return sessionStorage.getItem("g2p_src_focus") || null; } catch (e) { return null; } });
  const [copied, setCopied] = useState(null);
  const from = (() => { try { return JSON.parse(sessionStorage.getItem("g2p_src_from") || "null"); } catch (e) { return null; } })();
  useEffect(() => {
    const h = e => { setF("all"); setFocus(e.detail.id); };
    window.addEventListener("g2p:srcfocus", h);
    return () => window.removeEventListener("g2p:srcfocus", h);
  }, []);
  useEffect(() => {
    if (!focus) return;
    try { sessionStorage.removeItem("g2p_src_focus"); } catch (e) {}
    const tm = setTimeout(() => { const el = document.getElementById("src-" + focus); if (el) el.scrollIntoView({ behavior: fxReduced() ? "auto" : "smooth", block: "center" }); }, 250);
    return () => clearTimeout(tm);
  }, [focus]);
  const all = srcList();
  const groups = [[ACTIVE_CITY, cityName(lang)], ["general", ui.general]];
  const shown = all.filter(s => f === "all" || s.city === f);
  const goBack = () => { setPage(from.page); const y = from.y; setTimeout(() => window.scrollTo(0, y), 450); };
  return React.createElement("div", null,
    React.createElement(RequestTracker, null),
    React.createElement("div", { className: "src-filter", role: "group" },
      [["all", ui.filterAll]].concat(groups).map(([k, label]) => React.createElement("button", { key: k, className: "g2chip" + (f === k ? " g2chip-on" : ""), "aria-pressed": f === k, onClick: () => setF(k) },
        label + " · " + (k === "all" ? all.length : all.filter(s => s.city === k).length)))),
    groups.filter(([k]) => f === "all" || f === k).map(([k, label]) => {
      const list = shown.filter(s => s.city === k);
      if (!list.length) return null;
      return React.createElement("div", { key: k, className: "src-group" },
        React.createElement("h3", { className: "src-group-h" }, (k === "general" ? "" : "📍 ") + label),
        React.createElement("div", { className: "src-grid" }, list.map(s => React.createElement("article", { key: s.id, id: "src-" + s.id, className: "src-card" + (focus === s.id ? " src-focus" : "") },
          React.createElement("div", { className: "src-top" },
            React.createElement("span", { className: "src-num" }, srcNum(s.id)),
            React.createElement("span", { className: "src-ic", "aria-hidden": "true" }, SRC_KIND_IC[s.kind] || "🔗"),
            React.createElement("span", { className: "src-pub" }, s.pub),
            s.d && React.createElement("span", { className: "src-date" }, s.d),
            s.isNew && React.createElement("span", { className: "src-new" }, ui.isNew)),
          React.createElement("strong", { className: "src-title" }, eggL(s.t, lang)),
          React.createElement("p", { className: "src-proves" }, eggL(s.p, lang)),
          React.createElement("div", { className: "src-used" }, ui.usedAt + " ",
            s.at && s.at.filter(p => p !== "about").length
              ? s.at.filter(p => p !== "about").map(p => React.createElement("button", { key: p, className: "src-used-b", onClick: () => { setPage(p); window.scrollTo(0, 0); } }, srcPageName(p, t)))
              : React.createElement("span", null, ui.nowhere)),
          React.createElement("div", { className: "src-acts" },
            s.url ? React.createElement("a", { className: "btn btn-sm btn-green", href: s.url, target: "_blank", rel: "noopener" }, ui.open)
                  : s.essay && React.createElement("button", { className: "btn btn-sm btn-green", onClick: onEssay }, "📖 " + ui.essay),
            React.createElement("button", { className: "btn btn-sm", onClick: () => copyText(srcCite(s, lang)).then(ok => { if (ok) { setCopied(s.id); setTimeout(() => setCopied(c => c === s.id ? null : c), 1800); } }) }, copied === s.id ? ui.copied : "📋 " + ui.copy),
            from && from.id === s.id && from.page !== "about" && React.createElement("button", { className: "btn btn-sm btn-coral", onClick: goBack }, ui.back))))));
    }));
}
