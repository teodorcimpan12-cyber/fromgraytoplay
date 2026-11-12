import { NBH_N, roDe, useApp } from "../../app/core.js";
import { TIMELINE_SIBIU } from "../../data/timeline-sibiu.js";

/* Sibiu has no "promised vs spent" budget data: show the sourced public investments instead, and say what they don't cover. */
export function SibiuInvest() {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const inv = TIMELINE_SIBIU.filter(ev => ev.lei);
  return React.createElement("div", { className: "card" },
    React.createElement("h3", { className: "mb-1" }, L3("Investiții publice în terenuri de sport — Sibiu", "Public investment in sports courts — Sibiu", "Sportpálya-beruházások — Nagyszeben")), // TODO: HU review
    inv.map((ev, i) => React.createElement("div", { key: i, className: "flex justify-between fade-b", style: { gap: ".75rem", padding: ".45rem 0", flexWrap: "wrap" } },
      React.createElement("div", { style: { flex: "1 1 16rem" } }, React.createElement("b", null, ev.y), " · ", ev[lang] || ev.ro, " ",
        React.createElement("a", { href: ev.src, target: "_blank", rel: "noopener", style: { fontSize: ".75rem", color: "var(--textSec)" } }, "🔗")),
      React.createElement("div", { className: "font-bold", style: { color: "var(--green)", whiteSpace: "nowrap" } }, ev.lei))),
    React.createElement("p", { className: "mt-2", style: { fontSize: ".85rem", color: "var(--textSec)" } },
      L3("Toate investițiile găsite sunt baze mari sau curți de școală. Niciunul dintre cele " + roDe(NBH_N) + "terenuri de cartier de pe hartă nu apare încă într-o investiție cu sursă. Am cerut datele oficiale de la Primărie (Legea 544/2001, nr. 86747/26.10.2026); aceasta a prelungit termenul (adresa nr. 89234/03.11.2026), răspunsul e așteptat până la 25.11.2026.",
         "Every investment found is a large base or a school yard. None of the " + NBH_N + " neighbourhood courts on the map appears yet in a sourced investment. We requested the official data from City Hall (Law 544/2001, nr. 86747/26.10.2026); it extended the deadline (letter nr. 89234/03.11.2026), answer expected by 25.11.2026.",
         "Minden talált beruházás nagy sportbázis vagy iskolaudvar. A térkép " + NBH_N + " lakótelepi pályája közül egyik sem szerepel még forrással igazolt beruházásban. A hivatalos adatokat kikértük a Polgármesteri Hivataltól (544/2001, 86747/26.10.2026); a határidőt meghosszabbították (89234/03.11.2026), válasz 2026.11.25-ig várható.")), // TODO: HU review
    // Official answer: Serviciul Public Sport și Agrement Sibiu, nr. 4541/03.11.2026 (Law 544/2001), received 05.11.2026.
    React.createElement("div", { className: "mt-2", style: { borderLeft: "4px solid var(--teal)", paddingLeft: ".75rem" } },
      React.createElement("span", { className: "badge", style: { background: "var(--teal)", color: "#fff" } }, L3("📄 RĂSPUNS OFICIAL · Legea 544/2001", "📄 OFFICIAL ANSWER · Law 544/2001", "📄 HIVATALOS VÁLASZ · 544/2001")),
      React.createElement("p", { className: "mt-1", style: { fontSize: ".9rem" } }, L3(
        "Serviciul Public Sport și Agrement a enumerat investițiile din 2022–2026 în bazele pe care le administrează. Toate sunt la 4 baze mari: terenul din stațiunea Păltiniș, Stadionul Municipal (gazon hibrid, drenaj la terenul sintetic, utilaje), Baza Obor (containere vestiare) și Lacul lui Binder (echipamente nautice). Niciun teren de cartier nu apare în listă.",
        "The Public Sport and Leisure Service listed its 2022–2026 investments in the bases it manages. All of them are at 4 large sites: the court in the Păltiniș resort, the Municipal Stadium (hybrid turf, drainage on the synthetic pitch, machinery), the Obor base (changing-room containers) and Lake Binder (water-sports equipment). No neighbourhood court appears on the list.",
        "A Sport és Szabadidő Közszolgálat felsorolta a 2022–2026-os beruházásait az általa kezelt bázisokon. Mind 4 nagy helyszínen vannak: a páltinişi pálya, a Városi Stadion (hibrid gyep, a műfüves pálya vízelvezetése, gépek), az Obor bázis (öltözőkonténerek) és a Binder-tó (vízisport-felszerelés). Lakótelepi pálya nem szerepel a listán.")), // TODO: HU review
      React.createElement("p", { style: { fontSize: ".85rem", color: "var(--textSec)" } }, L3(
        "Ce lipsește din răspuns: valoarea lucrărilor în lei și starea terenurilor (am fost trimiși la bazesportive.sibiu.ro și sibiu.ro/primaria/buget). Am cerut completarea.",
        "Missing from the answer: the value of the works in lei and the condition of the courts (we were pointed to bazesportive.sibiu.ro and sibiu.ro/primaria/buget). We asked for the missing parts.",
        "A válaszból hiányzik: a munkák értéke lejben és a pályák állapota (a bazesportive.sibiu.ro és a sibiu.ro/primaria/buget oldalra irányítottak). Kértük a kiegészítést.")), // TODO: HU review
      React.createElement("p", { style: { fontSize: ".75rem", color: "var(--textSec)" } }, L3("Sursă: ", "Source: ", "Forrás: "), "Serviciul Public Sport și Agrement Sibiu, adresa nr. 4541/03.11.2026")),
  );
}
