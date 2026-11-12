import { ACTIVE_CITY, db, useApp } from "../../app/core.js";
import { Redirect35Card } from "../../components/Redirect35Card.js";
import { SrcRef } from "../../components/SrcRef.js";
import { FUNDING, G2P_EMAIL } from "../../data/constants.js";
import { useState } from "../../lib/react.js";

export function FundingTab() {
  const { t, lang, toast } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const sib = ACTIVE_CITY === "sibiu";
  const [pf, setPf] = useState({ company: "", email: "", offer: "", message: "" });
  const [sent, setSent] = useState(false);
  const offers = [
    { k: "logo", ic: "🏷️", h: L3("Logo pe site și pe panoul terenului", "Logo on the site and on the court panel", "Logó az oldalon és a pálya tábláján"), p: L3("După renovare, numele vostru stă pe panoul de la teren și pe pagina terenului.", "After the renovation, your name goes on the court panel and on the court's page.", "Felújítás után a nevetek a pálya tábláján és a pálya oldalán.") },
    { k: "kind", ic: "🏀", h: L3("Echipament în natură", "Equipment in kind", "Felszerelés természetben"), p: L3("Mingi, plase, coșuri, vopsea pentru linii sau pentru mural.", "Balls, nets, hoops, paint for the lines or the mural.", "Labdák, hálók, palánkok, festék a vonalakhoz vagy a falfestményhez.") },
    { k: "team", ic: "🧹", h: L3("O zi de voluntariat cu echipa voastră", "A volunteering day with your team", "Önkéntes nap a csapatotokkal"), p: L3("Curățăm și vopsim un teren împreună, într-o sâmbătă.", "We clean and paint a court together, on a Saturday.", "Egy szombaton együtt takarítunk és festünk egy pályát.") },
    { k: "talk", ic: "💬", h: L3("Altă idee? Discutăm", "Another idea? Let's talk", "Más ötlet? Beszéljük meg"), p: L3("Nu avem pachete fixe și nu promitem ce nu putem face. Scrie-ne.", "No fixed packages, and we don't promise what we can't do. Write to us.", "Nincsenek fix csomagok, és nem ígérünk olyat, amit nem tudunk. Írj nekünk.") }
  ];
  const send = () => {
    if (!pf.company || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(pf.email)) { toast(t.error); return; }
    db.ref("partnerRequests").push({ company: pf.company.slice(0, 120), email: pf.email.slice(0, 120), offer: pf.offer || "talk", message: pf.message.slice(0, 1500), city: ACTIVE_CITY, date: new Date().toISOString() })
      .then(() => { setSent(true); toast(t.success); }, () => toast(t.error));
  };
  const row = (ic, k, v, note) => React.createElement("div", { className: "fund-row" },
    React.createElement("span", { className: "fund-ic", "aria-hidden": "true" }, ic),
    React.createElement("div", null, React.createElement("div", { className: "fund-k" }, k), note && React.createElement("div", { className: "fund-note" }, note)),
    React.createElement("div", { className: "fund-v" }, v));
  return React.createElement("div", null,
    React.createElement(Redirect35Card, null),
    React.createElement("div", { className: "card fund-transp mt-3" },
      React.createElement("h3", { className: "mb-1" }, "🔍 " + L3("Transparență: banii, pe față", "Transparency: the money, in the open", "Átláthatóság: a pénz nyíltan")),
      row("💻", L3("Cât costă platforma", "What the platform costs", "Mennyibe kerül a platform"), "≈ 0 lei",
        L3("Găzduire gratuită (Netlify), bază de date pe planul gratuit (Firebase), muncă voluntară. Azi nu strângem bani. După înființare, veniturile și cheltuielile apar public pe acest site.", "Free hosting (Netlify), database on the free plan (Firebase), volunteer work. Today we collect no money. After registration, income and spending will be shown publicly on this site.", "Ingyenes tárhely (Netlify), ingyenes adatbázis (Firebase), önkéntes munka. Nem gyűjtünk pénzt.")),
      row("🏗️", L3("Cât costă renovarea unui teren", "What renovating a court costs", "Mennyibe kerül egy pálya felújítása"), L3("deviz în lucru", "estimate in progress", "költségvetés készül"),
        L3("Nu punem o cifră inventată. O publicăm când avem un deviz real, cu sursă.", "We won't put up an invented number. We'll publish it once there is a real estimate, with its source.", "Nem írunk kitalált számot. Akkor tesszük közzé, ha lesz valós költségvetés, forrással.")),
      row("🏛️", L3("Buget local", "Local budget", "Helyi költségvetés"), sib ? React.createElement(React.Fragment, null, "12 mil. lei", React.createElement(SrcRef, { id: "zsn-12m" })) : "—",
        sib ? L3("Agenda Sportivă 2024 a Primăriei Sibiu (pentru sport în general, nu doar terenuri).", "Sibiu City Hall's 2024 Sports Agenda (for sport in general, not just courts).", "Szeben 2024-es Sportprogramja (általában a sportra, nem csak pályákra).")
            : L3("Hotărâri de Consiliu Local pe teren, cu teren. Un pas mic, dar real.", "City Council decisions, court by court. A small step, but a real one.", "Helyi tanácsi döntések, pályánként. Kicsi, de valódi lépés.")),
      row("🌍", L3("Fonduri UE și naționale", "EU and national funds", "Uniós és nemzeti források"), FUNDING.length + " " + L3("programe", "programmes", "program"), L3("Lista de mai jos: unde se poate aplica.", "The list below: where one can apply.", "Az alábbi lista: hol lehet pályázni.")),
      row("🤝", L3("Sponsori", "Sponsors", "Szponzorok"), L3("căutăm", "looking", "keresünk"), L3("Încă niciun partener. Vezi mai jos ce ar primi.", "No partners yet. See below what they would get.", "Még nincs partner. Lent látod, mit kapnának."))),
    React.createElement("h3", { className: "mt-3 mb-1" }, "💶 " + L3("De unde pot veni banii", "Where the money could come from", "Honnan jöhet a pénz")),
    React.createElement("div", { className: "fund-grid" }, FUNDING.map((x, i) => React.createElement("a", { key: i, className: "fund-card", href: x.url, target: "_blank", rel: "noopener" },
      React.createElement("span", { className: "badge " + (x.type === "EU" ? "badge-teal" : x.type === "National" ? "badge-coral" : "badge-green") }, x.type),
      React.createElement("strong", null, x.name),
      x.amount !== "—" && React.createElement("span", { className: "fund-amt" }, x.amount),
      React.createElement("span", { className: "fund-go" }, L3("Detalii ↗", "Details ↗", "Részletek ↗"))))),
    React.createElement("div", { className: "card mt-3 partner-card" },
      React.createElement("div", { className: "partner-h" },
        React.createElement("span", { className: "partner-badge" }, L3("Parteneri: căutăm", "Partners: wanted", "Partnereket keresünk")),
        React.createElement("h3", null, "🤝 " + L3("Ce primește un partener", "What a partner gets", "Mit kap egy partner"))),
      React.createElement("div", { className: "partner-offers" }, offers.map(o => React.createElement("button", { key: o.k, type: "button", className: "partner-offer" + (pf.offer === o.k ? " on" : ""), "aria-pressed": pf.offer === o.k, onClick: () => setPf(v => ({ ...v, offer: o.k })) },
        React.createElement("span", { className: "po-ic", "aria-hidden": "true" }, o.ic),
        React.createElement("strong", null, o.h),
        React.createElement("span", null, o.p)))),
      sent ? React.createElement("p", { className: "partner-sent" }, "✓ " + L3("Am primit mesajul. Răspundem pe email.", "Message received. We'll reply by email.", "Megkaptuk az üzenetet. E-mailben válaszolunk."))
        : React.createElement("div", { className: "partner-form" },
          React.createElement("input", { placeholder: t.companyName, value: pf.company, onChange: e => setPf({ ...pf, company: e.target.value }) }),
          React.createElement("input", { placeholder: t.email, type: "email", value: pf.email, onChange: e => setPf({ ...pf, email: e.target.value }) }),
          React.createElement("textarea", { placeholder: t.message, rows: 3, value: pf.message, onChange: e => setPf({ ...pf, message: e.target.value }) }),
          React.createElement("button", { className: "btn btn-green btn-block", onClick: send }, "💬 " + L3("Discutăm — trimite", "Let's talk — send", "Beszéljük meg — küldés")),
          React.createElement("p", { className: "text-xs", style: { color: "var(--textSec)" } }, L3("Sau direct: ", "Or directly: ", "Vagy közvetlenül: "), React.createElement("a", { href: "mailto:" + G2P_EMAIL }, G2P_EMAIL)))));
}
