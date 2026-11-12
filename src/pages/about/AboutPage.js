import { ACTIVE_CITY, COURTS, SAT_N, SAT_RECENT, STADIUM_N, useApp } from "../../app/core.js";
import { AssociationTab } from "../../components/AssociationTab.js";
import { PressQR } from "../../components/PressQR.js";
import { SrcRef } from "../../components/SrcRef.js";
import { G2P_EMAIL } from "../../data/constants.js";
import { ESSAY } from "../../data/essay.js";
import { usePressData } from "../../hooks/usePressData.js";
import { buildPressPdf, pressNumbers } from "../../lib/press-numbers.js";
import { useEffect, useState } from "../../lib/react.js";
import { srcList } from "../../lib/src-by-id.js";
import { FundingTab } from "./FundingTab.js";
import { SourcesTab } from "./SourcesTab.js";

/* === About === */
export function AboutPage() {
  const { t, lang, setPage } = useApp();
  const [tab, setTab] = useState(() => {
    try { const s = sessionStorage.getItem("g2p_about_tab"); if (s) { sessionStorage.removeItem("g2p_about_tab"); if (["project", "association", "sources", "funding", "press"].indexOf(s) >= 0) return s; } } catch (e) {}
    return "project";
  });
  const [essayOpen, setEssayOpen] = useState(false);
  const [qr, setQr] = useState(false);
  const [busy, setBusy] = useState(false);
  const pd = usePressData();
  useEffect(() => {
    const h = () => setTab("sources");
    window.addEventListener("g2p:srcfocus", h);
    return () => window.removeEventListener("g2p:srcfocus", h);
  }, []);
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const sib = ACTIVE_CITY === "sibiu";
  const openEssay = () => { setTab("project"); setEssayOpen(true); setTimeout(() => { const el = document.getElementById("about-essay"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 120); };
  // Key data: only facts of the city on screen (TGM facts never show on Sibiu).
  const keyData = sib ? [
    { n: String(COURTS.length), l: L3("terenuri", "courts", "pálya") + (STADIUM_N ? " · " + STADIUM_N + " " + L3("stadioane", "stadiums", "stadion") : ""), c: "var(--green)", src: "osm" },
    { n: SAT_RECENT + "/" + SAT_N, l: L3("cu satelit din 2021–22", "satellite from 2021–22", "2021–22-es műholdkép"), c: "var(--coral)", src: "sbt1" },
    { n: "12M", l: L3("lei pentru sport, 2024", "lei for sport, 2024", "lej sportra, 2024"), c: "var(--teal)", src: "zsn-12m" },
    { n: "28%", l: L3("adolescenți activi", "active teens", "aktív serdülő"), c: "var(--red)", src: "mediafax-28" }
  ] : [
    { n: "12/15", l: L3("rezidenți", "residents", "lakos"), c: "var(--green)", src: "survey" },
    { n: "5M", l: L3("lei înghețați", "lei frozen", "lej befagyasztva"), c: "var(--coral)", src: "punctul-5m" },
    { n: "0%", l: L3("renovare", "renovation", "felújítás"), c: "var(--red)", src: "sidu" },
    { n: "3km", l: L3("decalaj", "gap", "távolság"), c: "var(--teal)", src: "mymaps" }
  ];
  const tabs = [
    ["project", "📖", t.theProject],
    ["association", "🏛️", L3("Asociația", "The Association", "Az egyesület")],
    ["sources", "📚", L3("Surse", "Sources", "Források")],
    ["funding", "💰", L3("Finanțare & parteneriate", "Funding & partnerships", "Finanszírozás & partnerségek")],
    ["press", "📰", L3("Presă", "Press", "Sajtó")]
  ];
  const pressPdf = () => { if (busy) return; setBusy(true); buildPressPdf(lang, pd).then(() => setBusy(false), () => setBusy(false)); };
  return React.createElement("div", { className: "animate-in" },
    React.createElement("section", { className: "section" },
      React.createElement("div", { className: "container" },
        React.createElement("h2", { className: "section-title" }, "📖 ", t.about),
        React.createElement("div", { className: "tabs about-tabs", role: "tablist" }, tabs.map(([k, ic, label]) => React.createElement("button", { key: k, role: "tab", "aria-selected": tab === k, className: tab === k ? "active" : "", onClick: () => setTab(k) }, ic + " " + label,
          k === "sources" && React.createElement("span", { className: "about-tab-n" }, srcList().length)))),
        tab === "project" && React.createElement("div", null,
          React.createElement("div", { className: "card", id: "about-essay" },
            React.createElement("div", { className: "flex justify-between items-center", style: { borderLeft: "6px solid var(--coral)", paddingLeft: "1rem", marginBottom: "1rem" } },
              React.createElement("div", null,
                React.createElement("h3", { style: { margin: 0 } }, "🏆 FROM GREY TO PLAY"),
                React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)", margin: ".25rem 0 0" } },
                  L3("Lucrare câștigătoare · Loc 1 Național · EdVenture ATW 2026", "Winning essay · National #1 · EdVenture ATW 2026", "Nyertes dolgozat · Nemzeti 1. · EdVenture ATW 2026"))),
              React.createElement("button", { className: "btn btn-sm", style: { flexShrink: 0 }, onClick: () => setEssayOpen(o => !o) },
                essayOpen ? L3("Închide ✕", "Close ✕", "Bezár ✕") : "📖 " + L3("Citește lucrarea", "Read essay", "Dolgozat"))),
            essayOpen && React.createElement("div", { className: "fade-t", style: { whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: ".92rem", paddingTop: ".8rem" } }, ESSAY[lang] || ESSAY.ro)),
          React.createElement("div", { className: "card mt-2" },
            React.createElement("h3", { className: "mb-2" }, "📊 " + L3("Date cheie", "Key Data", "Kulcsadatok")),
            React.createElement("div", { className: "grid grid-4" }, keyData.map((k, i) => React.createElement("div", { key: i, style: { textAlign: "center" } },
              React.createElement("div", { className: "stat-number", style: { color: k.c } }, k.n, React.createElement(SrcRef, { id: k.src })),
              React.createElement("div", { className: "stat-label" }, k.l)))),
            React.createElement("button", { className: "btn btn-sm btn-ghost mt-2", onClick: () => setTab("sources") }, "📚 " + L3("De unde știm? Toate sursele →", "How do we know? All sources →", "Honnan tudjuk? Összes forrás →"))),
          React.createElement("div", { className: "card mt-2" },
            React.createElement("h3", { className: "mb-2" }, "🗺️ " + L3("Terenurile pe hartă", "The courts on the map", "Pályák a térképen")),
            React.createElement("a", { href: "#courts", className: "btn btn-green btn-sm" }, "🏀 " + L3("Harta celor " + COURTS.length + " de terenuri", "Map of all " + COURTS.length + " courts", "Mind a " + COURTS.length + " pálya térképen")),
            React.createElement("p", { className: "text-xs mt-1", style: { color: "var(--textSec)" } }, L3("Asociația From Grey to Play (în constituire). Contact: ", "From Grey to Play Association (being established). Contact: ", "From Grey to Play Egyesület (alakulóban). Kapcsolat: "), React.createElement("a", { href: "mailto:" + G2P_EMAIL }, G2P_EMAIL)))),
        tab === "association" && React.createElement(AssociationTab, { onFunding: () => setTab("funding") }),
        tab === "sources" && React.createElement(SourcesTab, { onEssay: openEssay }),
        tab === "funding" && React.createElement(FundingTab, null),
        tab === "press" && React.createElement("div", { className: "card about-press" },
          React.createElement("h3", { className: "mb-1" }, "📰 " + L3("Ești jurnalist?", "Are you a journalist?", "Újságíró vagy?")),
          React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)" } }, L3("Cifre cheie cu sursă, un comunicat RO/EN făcut din datele live, imagini și contact — într-un singur PDF.", "Sourced key numbers, a RO/EN release built from live data, images and contact — in one PDF.", "Forrásolt kulcsszámok, élő adatokból készült RO/EN közlemény, képek és kapcsolat — egyetlen PDF-ben.")),
          React.createElement("div", { className: "press-mini" }, pressNumbers(lang, pd).slice(0, 4).map((k, i) => React.createElement("div", { key: i }, React.createElement("b", null, k.n, k.src && React.createElement(SrcRef, { id: k.src })), React.createElement("span", null, k.l)))),
          React.createElement("div", { className: "press-cta" },
            React.createElement("button", { className: "btn btn-green", onClick: () => { setPage("press"); window.scrollTo(0, 0); } }, "📰 " + L3("Pagina de presă", "Press page", "Sajtóoldal")),
            React.createElement("button", { className: "btn", onClick: pressPdf, disabled: busy }, busy ? "⏳ …" : "📥 PDF"),
            React.createElement("button", { className: "btn btn-ghost", onClick: () => setQr(true) }, "📱 QR"))))),
    qr && React.createElement(PressQR, { onClose: () => setQr(false) }));
}
