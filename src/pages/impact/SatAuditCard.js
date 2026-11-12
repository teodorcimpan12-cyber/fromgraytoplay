import { COURTS, useApp } from "../../app/core.js";

/* Sibiu "city" tab: the satellite audit, until its results exist. */
export function SatAuditCard() {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  return React.createElement("div", { className: "card" },
    React.createElement("h3", { className: "mb-1" }, "🛰️ ", L3("Sibiu din satelit", "Sibiu from space", "Nagyszeben műholdról")),
    React.createElement("p", null, L3(
      "Fiecare dintre cele " + COURTS.length + " terenuri e verificat pe 6–7 imagini din satelit din 2011–2022: există? s-a construit, s-a refăcut, a dispărut? Doi membri ai echipei evaluează independent, fără să știe cartierul; un rezultat apare doar unde sunt de acord.",
      "Each of the " + COURTS.length + " courts is checked on 6–7 satellite images from 2011–2022: does it exist? was it built, resurfaced, removed? Two team members review independently, without knowing the neighbourhood; a result appears only where they agree.",
      "Mind a " + COURTS.length + " pályát 6–7 műholdképen ellenőrizzük 2011–2022 között: létezik? épült, felújították, eltűnt? Két csapattag egymástól függetlenül értékel, a városrész ismerete nélkül; eredmény csak egyezés esetén jelenik meg.")), // TODO: HU review
    React.createElement("p", { style: { fontSize: ".85rem", color: "var(--textSec)" } }, L3(
      "Imaginile din satelit nu arată starea de azi. Rezultatele apar aici după evaluare. Sursă: Esri World Imagery Wayback; contururi © OpenStreetMap.",
      "Satellite images do not show today's condition. Results appear here after the review. Source: Esri World Imagery Wayback; outlines © OpenStreetMap.",
      "A műholdképek nem a mai állapotot mutatják. Az eredmények az értékelés után jelennek meg. Forrás: Esri World Imagery Wayback; körvonalak © OpenStreetMap.")) // TODO: HU review
  );
}
