import { useApp } from "./core.js";
import { ACTIVITY_ICONS } from "../data/constants.js";
import { activityMsg } from "../lib/activity-msg.js";
import { cityName } from "../lib/city-name.js";
import { useEffect, useState } from "../lib/react.js";
import { relTime } from "../lib/rel-time.js";

export function NotifPanel({ onClose, notif }) {
  const { t, lang, setPage } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const [tab, setTab] = useState("all");
  const { all, mine, bc, seen, markRead, followedIds } = notif;
  const list = tab === "mine" ? mine : all;
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const open = a => {
    onClose();
    if (a.courtId) location.hash = "#court-" + a.courtId;
    else if (a.type === "petition") setPage("petition");
    else if (a.type === "pixel") setPage("community");
  };
  const row = (a, body, icon) => React.createElement("button", {
    key: a.id, className: "ntf-row" + (a.ts > seen ? " unread" : ""), onClick: () => open(a)
  },
    React.createElement("span", { className: "ntf-ic", "aria-hidden": "true" }, icon),
    React.createElement("span", { className: "ntf-body" },
      React.createElement("span", { className: "ntf-txt" }, body),
      React.createElement("time", null, relTime(a.ts, lang))),
    a.ts > seen && React.createElement("span", { className: "ntf-dot", "aria-label": L3("nou", "new", "új") }));
  return ReactDOM.createPortal(React.createElement(React.Fragment, null,
    React.createElement("div", { className: "ntf-scrim", onClick: onClose }),
    React.createElement("div", { className: "ntf-panel", role: "dialog", "aria-label": t.notifications },
      React.createElement("div", { className: "ntf-hd" },
        React.createElement("strong", null, "🔔 ", t.notifications),
        React.createElement("button", { className: "ntf-link", onClick: markRead }, L3("Marchează citite", "Mark all read", "Mind olvasott")),
        React.createElement("button", { className: "ntf-x", onClick: onClose, "aria-label": L3("Închide", "Close", "Bezárás") }, "×")),
      React.createElement("div", { className: "ntf-tabs", role: "tablist" },
        React.createElement("button", { role: "tab", "aria-selected": tab === "all", className: tab === "all" ? "on" : "", onClick: () => setTab("all") }, L3("Tot orașul", "Whole city", "Az egész város") + " · " + cityName(lang)),
        React.createElement("button", { role: "tab", "aria-selected": tab === "mine", className: tab === "mine" ? "on" : "", onClick: () => setTab("mine") }, L3("Terenurile mele", "My courts", "Pályáim") + (followedIds.length ? " (" + followedIds.length + ")" : ""))),
      React.createElement("div", { className: "ntf-list" },
        bc && tab === "all" && row(bc, React.createElement("b", null, bc.text), "📢"),
        tab === "mine" && followedIds.length === 0
          ? React.createElement("div", { className: "ntf-empty" },
              React.createElement("p", null, "⭐ " + L3("Nu urmărești încă niciun teren.", "You don't follow any court yet.", "Még nem követsz pályát.")),
              React.createElement("p", null, L3("Deschide un teren și apasă „Urmărește”: aici vezi tot ce se întâmplă acolo — check-in-uri, poze, sesizări.", "Open a court and tap “Follow”: you'll see everything that happens there — check-ins, photos, reports.", "Nyiss meg egy pályát és kövesd: itt látod, mi történik ott.")),
              React.createElement("button", { className: "btn btn-green btn-sm", onClick: () => { onClose(); setPage("courts"); } }, L3("Alege un teren", "Pick a court", "Válassz pályát")))
          : list.length === 0
            ? React.createElement("p", { className: "ntf-empty" }, L3("Nicio activitate încă în " + cityName(lang) + ". Fii primul: fă check-in la un teren.", "No activity yet in " + cityName(lang) + ". Be the first: check in at a court.", "Még nincs aktivitás. Légy az első!"))
            : list.map(a => row(a, activityMsg(a, t), ACTIVITY_ICONS[a.type] || "•"))))), document.body);
}
