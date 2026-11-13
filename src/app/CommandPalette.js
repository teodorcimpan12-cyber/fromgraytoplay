import { isMinimal } from "../lib/minimal.js";
import { ACTIVE_CITY, COURTS, g2pSfx, useApp } from "./core.js";
import { CITY_CFG, LANG_NAMES } from "../data/constants.js";
import { EGGS } from "../data/eggs.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { courtStatusView } from "../lib/court-status-view.js";
import { mascotOff } from "../lib/g2p-celebrate.js";
import { eggCount } from "../lib/g2p-egg.js";
import { nextLang } from "../lib/next-lang.js";
import { useEffect, useRef, useState } from "../lib/react.js";
import { switchTheme } from "../lib/switch-theme.js";

/* ============================================================
   COMMAND PALETTE — Ctrl/Cmd+K. Pages, courts, quick actions.
   ============================================================ */
export function CommandPalette({ onClose }) {
  const { t, lang, setLang, theme, setTheme, setPage, settings, toast } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro; // TODO: HU review
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [cat, setCat] = useState("all");
  const [shake, setShake] = useState(0);
  const inputRef = useRef(null), listRef = useRef(null);
  const reports = useFirebase("reports");
  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);
  const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const flags = (settings && settings.flags) || {};
  const courtById = {};
  COURTS.forEach(c => { courtById[c.id] = c; });
  const go = pg => () => { setPage(pg); scrollTo(0, 0); };
  const CATS = [
    ["all", L3("Tot", "All", "Minden"), "✨"],
    ["courts", L3("Terenuri", "Courts", "Pályák"), "📍"],
    ["reports", L3("Sesizări", "Reports", "Bejelentések"), "⚠️"],
    ["pages", L3("Pagini", "Pages", "Oldalak"), "🧭"],
    ["actions", L3("Acțiuni", "Actions", "Műveletek"), "⚡"]
  ];
  const items = [];
  [["home", t.home, "🏠", L3("acasa start", "start", "")], ["courts", t.courts, "🏟️", L3("harta terenuri", "map", "térkép")],
   ["reports", t.reportPageTitle, "⚠️", L3("probleme sesizari", "issues", "")], ["petition", t.petition, "✊", L3("semnatura vot", "sign vote", "")],
   ["community", t.community, "💬", L3("forum galerie evenimente echipe pixel clasament", "forum gallery events teams pixel leaderboard", "")],
   ["impact", t.impact, "📊", L3("statistici cifre", "stats numbers", "")], ["help", t.help, "🤝", L3("voluntar doneaza distribuie contact", "volunteer donate share contact", "")], ["association", L3("Asociația", "Association", "Egyesület"), "🏛️", L3("asociatie fondatori statut constituire", "association founders statute", "")],
   ["about", t.about, "ℹ️", L3("echipa surse finantare parteneri presa", "team sources funding partners press", "")], ["profile", t.profile, "👤", L3("cont insigne", "account badges", "")]]
    .filter(pg => flags[pg[0]] !== false)
    .forEach(pg => items.push({ c: "pages", ic: pg[2], l: pg[1], kw: pg[3], run: go(pg[0]) }));
  COURTS.forEach(c => {
    const v = courtStatusView(c, t);
    items.push({ c: "courts", ic: "📍", l: c.name, sub: c.address, kw: (c.neighbourhood || "") + " " + (c.category || ""), dot: v.color, chip: v.label, chipCls: v.badge, pop: (c.reports || 0), run: () => { location.hash = "#court-" + c.id; } });
  });
  const catEmoji = { surface: "🏗️", hoop: "🏀", fence: "🚧", lighting: "💡", trash: "🗑️", safety: "⚠️", other: "📌", condition: "🩺" };
  const ago = ts => { const m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + " min" : m < 1440 ? Math.round(m / 60) + " h" : Math.round(m / 1440) + (lang === "en" ? " d" : lang === "hu" ? " n" : " z"); };
  if (reports) Object.keys(reports).map(k => Object.assign({ id: k }, reports[k]))
    .filter(r => r && courtById[r.courtId])
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 60)
    .forEach(r => items.push({ c: "reports", ic: catEmoji[r.category] || "📌", l: String(r.issue || r.note || L3("Sesizare", "Report", "Bejelentés")).slice(0, 80),
      sub: courtById[r.courtId].name + (r.timestamp ? " · " + ago(r.timestamp) : ""), kw: r.category || "",
      chip: r.status === "resolved" ? L3("rezolvat", "resolved", "megoldva") : null, chipCls: "badge-green", run: () => { location.hash = "#court-" + r.courtId; } }));
  const A = (ic, l, kw, run) => items.push({ c: "actions", ic: ic, l: l, kw: kw, run: run });
  if (flags.petition !== false) A("✍️", L3("Semnează petiția", "Sign the petition", "Írd alá a petíciót"), "vot", go("petition"));
  A("📸", L3("Raportează o problemă", "Report a problem", "Probléma bejelentése"), "sesizare poza photo", go("reports"));
  A("🩺", L3("Verifică un teren", "Check a court", "Ellenőrizz egy pályát"), "stare condition", go("courts"));
  A("📚", L3("Sursele datelor", "Data sources", "Adatforrások"), "surse sources dovezi", go("about"));
  A(theme === "dark" ? "☀️" : "🌙", t.cmdTheme, "dark light tema zi noapte", () => switchTheme(null, theme, setTheme));
  A("🌐", t.cmdLang + " → " + LANG_NAMES[nextLang(lang)], "limba language nyelv", () => setLang(nextLang(lang)));
  if (flags.impact !== false && !isMinimal()) A("🧬", t.pulseTitle, "pulse", () => { sessionStorage.setItem("g2p_open_pulse", "1"); setPage("impact"); });
  !isMinimal() && A("🏛️", "Mayor Mode", "fixit primar", () => { window.dispatchEvent(new Event("g2p-mayor")); });
  A("🎬", L3("Promo de 32 de secunde", "32-second promo", "32 másodperces promó"), "promo video film reel", () => { location.href = "/promo"; });
  const mascotIsOff = mascotOff();
  A("🏀", mascotIsOff ? L3("Adu mingea înapoi", "Bring the ball back", "Hozd vissza a labdát") : L3("Ascunde mingea", "Hide the ball", "Labda elrejtése"), "mascota mascot", () => {
    try { if (mascotIsOff) localStorage.removeItem("g2p_mascot_off"); else localStorage.setItem("g2p_mascot_off", "1"); } catch (e) {}
    window.dispatchEvent(new CustomEvent("g2p:mascot"));
  });
  A("🥚", L3("Secrete găsite", "Secrets found", "Megtalált titkok") + " " + eggCount() + "/" + EGGS.length, "easter egg secret secrete ou", () => window.dispatchEvent(new CustomEvent("g2p:eggs-open")));
  let soundOff = false; try { soundOff = localStorage.getItem("g2p_sound") === "0"; } catch (e) {}
  A(soundOff ? "🔈" : "🔇", soundOff ? L3("Pornește sunetele", "Turn sounds on", "Hangok be") : L3("Oprește sunetele", "Mute sounds", "Hangok ki"), "sunet sound audio", () => {
    try { localStorage.setItem("g2p_sound", soundOff ? "1" : "0"); } catch (e) {}
    toast(soundOff ? "🔈" : "🔇");
  });

  // Search: every word must appear; names that start with the query come first.
  const words = norm(q).split(/\s+/).filter(Boolean);
  let list = items.filter(i => cat === "all" || i.c === cat);
  if (words.length) {
    list = list.map(i => { const hay = norm(i.l + " " + (i.sub || "") + " " + (i.kw || "")); const nl = norm(i.l);
      return words.every(w => hay.indexOf(w) >= 0) ? { i: i, s: (nl.indexOf(words[0]) === 0 ? 0 : nl.indexOf(words[0]) > 0 ? 1 : 2) } : null; })
      .filter(Boolean).sort((a, b) => a.s - b.s).map(x => x.i);
  }
  // A typed secret word gets one extra row on top (phones have no keyboard shortcuts).
  const secretW = norm(q).trim();
  if (["dunk", "disco", "rain", "tgm", "fixit", "1v1", "sibiu", "mures"].indexOf(secretW) >= 0)
    list = [{ c: "actions", ic: "🤫", l: L3("Ceva se mișcă… apasă aici", "Something is moving… press here", "Valami mozog… nyomd meg"), sub: "", run: () => window.dispatchEvent(new CustomEvent("g2p:secret", { detail: { w: secretW } })) }].concat(list);
  // Empty box: recent picks, the most-reported courts, and one button you should not press.
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem("g2p_cp_recent") || "[]"); } catch (e) {}
  const suggest = !words.length && cat === "all";
  if (suggest) {
    const rec = recent.map(l => items.find(i => i.l === l)).filter(Boolean).slice(0, 4).map(i => Object.assign({}, i, { g: L3("Recente", "Recent", "Legutóbbi"), ic2: "🕘" }));
    const pop = items.filter(i => i.c === "courts").sort((a, b) => b.pop - a.pop).slice(0, 4).map(i => Object.assign({}, i, { g: L3("Cele mai raportate", "Most reported", "Legtöbbet jelentett") }));
    const egg = { c: "actions", g: L3("Altceva", "Something else", "Más"), ic: "🙈", l: L3("Nu apăsa aici", "Don't press this", "Ne nyomd meg"), sub: "", egg: true, run: null };
    list = rec.concat(pop, items.filter(i => i.c === "actions").slice(0, 4).map(i => Object.assign({}, i, { g: L3("Acțiuni rapide", "Quick actions", "Gyors műveletek") })), [egg]);
  }
  const sel = Math.max(0, Math.min(idx, list.length - 1));
  useEffect(() => {
    const el = listRef.current && listRef.current.querySelector(".cp-item.sel");
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }, [sel]);
  const exec = i => {
    if (!i) return;
    if (i.egg) {
      setShake(s => s + 1); g2pSfx("whistle");
      try { window.dispatchEvent(new CustomEvent("g2p:egg", { detail: { id: "dontpress" } })); } catch (e) {}
      toast(L3("Ți-am zis. 😏", "Told you. 😏", "Mondtam. 😏"));
      return;
    }
    try { localStorage.setItem("g2p_cp_recent", JSON.stringify([i.l].concat(recent.filter(x => x !== i.l)).slice(0, 6))); } catch (e) {}
    onClose(); i.run();
  };
  const key = e => {
    if (e.key === "ArrowDown") { setIdx(v => Math.min(v + 1, list.length - 1)); e.preventDefault(); }
    else if (e.key === "ArrowUp") { setIdx(v => Math.max(v - 1, 0)); e.preventDefault(); }
    else if (e.key === "Tab") { e.preventDefault(); const n = CATS.findIndex(c => c[0] === cat); setCat(CATS[(n + (e.shiftKey ? CATS.length - 1 : 1)) % CATS.length][0]); setIdx(0); }
    else if (e.key === "Enter") exec(list[sel]);
    else if (e.key === "Escape") onClose();
  };
  const mark = s => {
    if (!words.length || !s) return s;
    const n = norm(s), w = words[0], at = n.indexOf(w);
    if (at < 0) return s;
    return React.createElement(React.Fragment, null, s.slice(0, at), React.createElement("mark", null, s.slice(at, at + w.length)), s.slice(at + w.length));
  };
  const counts = {};
  items.forEach(i => { counts[i.c] = (counts[i.c] || 0) + 1; });
  const groupName = i => i.g || (CATS.find(c => c[0] === i.c) || [0, ""])[1];
  let lastG = null;
  return React.createElement("div", { className: "cp-overlay", onClick: onClose },
    React.createElement("div", { key: shake, className: "cp cp2" + (shake ? " shake" : ""), onClick: e => e.stopPropagation(), role: "dialog", "aria-modal": "true", "aria-label": t.cmdPlaceholder },
      React.createElement("div", { className: "cp-top" },
        React.createElement("span", { className: "cp-glass", "aria-hidden": "true" },
          React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" },
            React.createElement("circle", { cx: 10.5, cy: 10.5, r: 6.5 }), React.createElement("path", { d: "M15.5 15.5L21 21" }))),
        React.createElement("input", { ref: inputRef, className: "cp-input", placeholder: L3("Caută terenuri, sesizări, pagini, acțiuni…", "Search courts, reports, pages, actions…", "Keress pályát, bejelentést, oldalt…"), value: q,
          onChange: e => { setQ(e.target.value); setIdx(0); }, onKeyDown: key, "aria-label": t.cmdPlaceholder }),
        React.createElement("kbd", { className: "cp-esc", onClick: onClose }, "Esc")),
      React.createElement("div", { className: "cp-cats", role: "tablist" },
        CATS.map(c => React.createElement("button", { key: c[0], role: "tab", "aria-selected": cat === c[0], className: "cp-cat" + (cat === c[0] ? " on" : ""),
          onClick: () => { setCat(c[0]); setIdx(0); inputRef.current && inputRef.current.focus(); } },
          c[2] + " " + c[1], c[0] !== "all" && React.createElement("b", null, counts[c[0]] || 0)))),
      React.createElement("div", { ref: listRef, className: "cp-list", role: "listbox" },
        list.length === 0
          ? React.createElement("div", { className: "cp-empty" },
              React.createElement("div", { className: "cp-empty-ball", "aria-hidden": "true" }, "🏀"),
              L3("Nimic. Nici măcar o minge pierdută.", "Nothing. Not even a lost ball.", "Semmi. Még egy elveszett labda sem."))
          : list.slice(0, 50).map((i, n) => {
              const g = groupName(i);
              const head = g !== lastG ? React.createElement("div", { className: "cp-group", key: "g" + n }, g) : null;
              lastG = g;
              return React.createElement(React.Fragment, { key: n }, head,
                React.createElement("div", {
                  className: "cp-item" + (n === sel ? " sel" : "") + (i.egg ? " egg" : ""), role: "option", "aria-selected": n === sel,
                  style: { "--i": Math.min(n, 12) },
                  onMouseEnter: () => setIdx(n), onClick: () => exec(i)
                },
                  React.createElement("span", { className: "cp-ic cp-ic-" + i.c }, i.ic, i.dot && React.createElement("i", { style: { background: i.dot } })),
                  React.createElement("span", { className: "cp-l" },
                    React.createElement("span", { className: "cp-name" }, mark(i.l)),
                    i.sub && React.createElement("small", null, mark(i.sub))),
                  i.chip && React.createElement("span", { className: "badge " + (i.chipCls || ""), style: { fontSize: ".64rem" } }, i.chip),
                  React.createElement("span", { className: "cp-go", "aria-hidden": "true" }, "↵")));
            })),
      React.createElement("div", { className: "cp-hint" },
        React.createElement("span", null, React.createElement("kbd", null, "↑↓"), " ", L3("alege", "move", "mozgás")),
        React.createElement("span", null, React.createElement("kbd", null, "↵"), " ", L3("deschide", "open", "megnyitás")),
        React.createElement("span", null, React.createElement("kbd", null, "Tab"), " ", L3("categorie", "category", "kategória")),
        React.createElement("span", { className: "cp-city" }, "📍 " + (CITY_CFG[ACTIVE_CITY] ? CITY_CFG[ACTIVE_CITY][lang === "hu" ? "nameHu" : lang === "en" ? "nameEn" : "nameRo"] : "")))));
}
