import { ACTIVE_CITY, CITY_HALL, useApp } from "../../app/core.js";
import { cityName } from "../../lib/city-name.js";

/* === City Hall Guide — real contacts, legal procedures, arguments.
   Data from CITY_HALL_BRIEF.md (verified June 2026). Help > contact tab. === */
export function CityHallGuide() {
  var app = useApp(); var lang = app.lang;
  var L3 = function(ro, en, hu) { return lang === "en" ? en : lang === "hu" ? (hu || ro) : ro; };
  var OTHER = ACTIVE_CITY !== "tgm";
  var CONTACTS = OTHER ? [
    { ic: "🏛️", name: L3("Registratura Primăriei", "City Hall registry", null), role: CITY_HALL.address + " · sursă: " + CITY_HALL.source + " (" + CITY_HALL.retrieved + ")", tel: CITY_HALL.tel, telLabel: CITY_HALL.telLabel, mail: CITY_HALL.mail }
  ] : [
    { ic: "🏗️", name: "Direcția Tehnică — Ing. Racz Lucian", role: L3("Lucrări și investiții — contactul principal pentru renovări", "Works and investments — the main contact for renovations", null), tel: "0265262442", telLabel: "0265-262.442", mail: "tehnic@tirgumures.ro" },
    { ic: "⚽", name: "Serviciul Sport — Ciugudean Marina", role: L3("Buget operațional sport, finanțări cluburi — Str. N. Grigorescu 17-19", "Sport operations budget, club funding", null), tel: "0365882066", telLabel: "0365-882.066", mail: null },
    { ic: "📄", name: L3("Informații publice — Legea 544/2001", "Public information — Law 544/2001", null), role: L3("Răspuns obligatoriu în 10 zile lucrătoare", "Mandatory answer within 10 working days", null), tel: null, telLabel: null, mail: "infopublic@tirgumures.ro" },
    { ic: "🏛️", name: L3("Registratura Primăriei", "City Hall registry", null), role: "Piața Victoriei nr. 3, 540026 Târgu Mureș", tel: "0265268330", telLabel: "0265-268.330", mail: "primaria@tirgumures.ro" }
  ];
  var STEPS = OTHER ? [
    L3("Trimite cererea 544/2001 — buget sport, listă investiții, starea terenurilor (răspuns: 10 zile)", "Send the 544/2001 request — sport budget, investment list, court condition (answer: 10 days)", null),
    L3("Depune petiția formală OG 27/2002 — răspuns obligatoriu în 30 de zile", "File the formal OG 27/2002 petition — mandatory answer in 30 days", null),
    L3("Verifică pe teren scorurile estimate din satelit și raportează starea reală în aplicație", "Field-check the satellite-estimated scores and report the real condition in the app", null)
  ] : [
    L3("Trimite cererea 544/2001 — buget sport, listă investiții, HCL-uri terenuri (răspuns: 10 zile)", "Send the 544/2001 request — sport budget, investment list, court decisions (answer: 10 days)", null),
    L3("Depune petiția formală OG 27/2002 — răspuns obligatoriu în 30 de zile", "File the formal OG 27/2002 petition — mandatory answer in 30 days", null),
    L3("Contactează consilierii Mașca și Veress (POL) — au obținut 80.000 lei pentru terenul Plopilor", "Contact councillors Mașca and Veress (POL) — they secured 80,000 lei for the Plopilor court", null),
    L3("Programează întâlnirea cu Direcția Tehnică + Serviciul Sport", "Schedule the meeting with the Technical Directorate + Sport Service", null),
    L3("Comunicat de presă cu 1 săptămână înainte de întâlnire — Zi de Zi, Punctul.ro, Radio Mureș", "Press release one week before the meeting — Zi de Zi, Punctul.ro, Radio Mureș", null)
  ];
  var ARGS = OTHER ? [] : [
    L3("Precedent intern: HCL ian. 2025 — 80.000 lei pentru Plopilor. Cerem consecvență pentru celelalte cartiere.", "Internal precedent: Jan 2025 council decision — 80,000 lei for Plopilor. We ask for consistency across the other neighbourhoods.", null),
    L3("Cost minim: 100.000–400.000 lei per teren = 0,1–0,4% din bugetul anual de sport (99,5 mil. lei).", "Minimal cost: 100,000–400,000 lei per court = 0.1–0.4% of the yearly sport budget (99.5M lei).", null),
    L3("Model Cluj-Napoca: 26,5 mil. lei investiți în Mănăștur după presiune civică — același tip de cartier.", "Cluj-Napoca model: 26.5M lei invested in Mănăștur after civic pressure — the same kind of neighbourhood.", null),
    L3("Fonduri UE disponibile: PR Centru OS 4.3 — 45,5 mil. EUR pentru regenerare urbană; terenurile sport sunt eligibile.", "EU funds available: PR Centru OS 4.3 — 45.5M EUR for urban regeneration; sport courts are eligible.", null)
  ];
  if (OTHER) {
    var cityRo = cityName("ro");
    var m544 = "mailto:" + CITY_HALL.mail + "?subject=" + encodeURIComponent("Cerere de acces la informatii de interes public - Legea 544/2001 - terenuri sportive") + "&body=" + encodeURIComponent("Stimata doamna / Stimate domn,\n\nIn baza Legii nr. 544/2001, va solicit in format electronic:\n1. Bugetul pe sport si spatii publice pentru anul curent (capitolul 67)\n2. Lista terenurilor sportive publice administrate de municipiu si starea lor\n3. Lista proiectelor de investitii din ultimii 3 ani privind terenurile sportive\n\nTermenul legal de raspuns este de 10 zile lucratoare.\n\nCu respect,\n[numele tau]");
    var mPet = "mailto:" + CITY_HALL.mail + "?subject=" + encodeURIComponent("Petitie - starea terenurilor sportive publice (OG 27/2002)") + "&body=" + encodeURIComponent("Catre Primarul si Consiliul Local al Municipiului " + cityRo + ",\n\nIn baza OG 27/2002, solicit:\n1. Publicarea starii si a programului de intretinere pentru fiecare teren sportiv public\n2. Includerea terenurilor degradate in bugetul de investitii\n\nDate: fromgreytoplay.netlify.app/?c=" + ACTIVE_CITY + "\n\nAstept raspuns motivat in termenul legal de 30 de zile.\n\nCu respect,\n[numele tau]");
  } else {
  var m544 = "mailto:primaria@tirgumures.ro?subject=" + encodeURIComponent("Cerere de acces la informatii de interes public - Legea 544/2001 - terenuri sportive") + "&body=" + encodeURIComponent("Stimata doamna / Stimate domn,\n\nIn baza Legii nr. 544/2001, va solicit in format electronic:\n1. Bugetul detaliat pe sport si spatii publice 2025 (capitolul 67)\n2. Lista proiectelor de investitii 2022-2025 privind terenurile sportive\n3. Extrasul din SIDU 2021-2030 privind infrastructura sportiva\n4. Hotararile de Consiliu Local 2022-2025 privind terenurile sportive\n5. Stadiul terenului multisport din str. Plopilor (HCL ian. 2025)\n\nTermenul legal de raspuns este de 10 zile lucratoare.\n\nCu respect,\n[numele tau]");
  var mPet = "mailto:primaria@tirgumures.ro?subject=" + encodeURIComponent("Petitie - renovarea terenurilor sportive din cartierele periferice (OG 27/2002)") + "&body=" + encodeURIComponent("Catre Primarul si Consiliul Local al Municipiului Targu Mures,\n\nIn baza OG 27/2002, solicit:\n1. Includerea in bugetul 2026 a minimum 500.000 lei pentru reabilitarea a minimum 3 terenuri sportive din cartierele periferice (Tudor Vladimirescu, Unirii, Dambu Pietros)\n2. O intalnire de lucru cu Directia Tehnica si Serviciul Sport in termen de 30 de zile\n3. Includerea terenurilor de cartier in actualizarea SIDU 2021-2030\n4. Raport anual de transparenta privind investitiile sportive pe cartiere\n\nDate complete: fromgreytoplay.netlify.app\n\nAstept raspuns motivat in termenul legal de 30 de zile.\n\nCu respect,\n[numele tau]");
  }
  return React.createElement("div", { className: "mb-2" },
    React.createElement("div", { className: "card mb-2", style: { borderLeft: "4px solid var(--green)" } },
      React.createElement("h3", { className: "mb-1" }, L3("Ghid: cum obții renovarea de la Primărie", "Guide: how to get the renovation from City Hall", null)),
      React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)" } },
        L3("Date reale, verificate iunie 2026 — cine decide, ce legi te ajută și pașii exacți.", "Real data, verified June 2026 — who decides, which laws help and the exact steps.", null))),
    React.createElement("div", { className: "card mb-2" },
      React.createElement("h4", { className: "mb-1" }, L3("Cine decide", "Who decides", null)),
      CONTACTS.map(function(ct, i) {
        return React.createElement("div", { key: i, className: i < CONTACTS.length - 1 ? "fade-b" : undefined, style: { padding: ".6rem 0" } },
          React.createElement("div", { style: { fontWeight: 700, fontSize: ".9rem" } }, ct.ic, " ", ct.name),
          React.createElement("div", { className: "text-xs", style: { color: "var(--textSec)", margin: ".15rem 0 .35rem" } }, ct.role),
          React.createElement("div", { className: "flex gap-1", style: { flexWrap: "wrap" } },
            ct.tel && React.createElement("a", { href: "tel:" + ct.tel, className: "badge", style: { background: "var(--teal)22", color: "var(--teal)", textDecoration: "none" } }, "📞 " + ct.telLabel),
            ct.mail && React.createElement("a", { href: "mailto:" + ct.mail, className: "badge", style: { background: "var(--green)22", color: "var(--green)", textDecoration: "none" } }, "✉️ " + ct.mail)));
      })),
    React.createElement("div", { className: "card mb-2" },
      React.createElement("h4", { className: "mb-1" }, L3("Acțiuni legale într-un click", "Legal actions in one click", null)),
      React.createElement("p", { className: "text-xs mb-1", style: { color: "var(--textSec)" } },
        L3("Email pre-completat — deschide, semnează cu numele tău, trimite. Păstrează confirmarea.", "Pre-filled email — open it, sign with your name, send. Keep the receipt.", null)),
      React.createElement("a", { href: m544, className: "btn btn-green btn-block mb-1", style: { textAlign: "center", textDecoration: "none" } },
        "", L3("Cerere informații — Legea 544/2001 (10 zile)", "Information request — Law 544/2001 (10 days)", null)),
      React.createElement("a", { href: mPet, className: "btn btn-outline btn-block", style: { textAlign: "center", textDecoration: "none" } },
        "", L3("Petiție formală — OG 27/2002 (30 de zile)", "Formal petition — OG 27/2002 (30 days)", null))),
    React.createElement("div", { className: "card mb-2" },
      React.createElement("h4", { className: "mb-1" }, L3("Pașii, în ordine", "The steps, in order", null)),
      STEPS.map(function(s, i) {
        return React.createElement("div", { key: i, className: "flex gap-1 text-sm", style: { padding: ".35rem 0", alignItems: "flex-start" } },
          React.createElement("span", { style: { fontFamily: "Space Mono, monospace", fontWeight: 700, color: "var(--green)", flexShrink: 0 } }, (i + 1) + "."),
          React.createElement("span", null, s));
      })),
    React.createElement("div", { className: "card mb-2", style: { borderLeft: "4px solid var(--teal)" } },
      React.createElement("h4", { className: "mb-1" }, L3("Argumente care funcționează", "Arguments that work", null)),
      ARGS.map(function(a, i) {
        return React.createElement("p", { key: i, className: "text-sm", style: { padding: ".25rem 0", lineHeight: 1.5 } }, "• " + a);
      }),
      !OTHER && React.createElement("p", { className: "text-xs mt-1", style: { color: "var(--textSec)", fontWeight: 600 } },
        L3("Aliați în Consiliul Local: Dan-Sorin Mașca și Veress Beáta (POL) — au propus terenul Plopilor.", "Allies on the City Council: Dan-Sorin Mașca and Veress Beáta (POL) — they proposed the Plopilor court.", null))));
}
