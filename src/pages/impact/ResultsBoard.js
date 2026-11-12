import { COURTS_ALL, db, useApp } from "../../app/core.js";
import { CITY_REQUESTS } from "../../data/city-requests.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useEffect, useState } from "../../lib/react.js";
import { useFbCount } from "./useFbCount.js";

export function ResultsBoard() {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const e = React.createElement;
  const votes = useFirebase("votes");
  const [votesReady, setVotesReady] = useState(false);
  useEffect(() => { const ref = db.ref("votes"), fn = () => setVotesReady(true); ref.on("value", fn); return () => ref.off("value", fn); }, []);
  const voteTotal = !votesReady ? "…" : votes ? (votes.flip || 0) + (votes.mural || 0) + (votes.both || 0) : 0;
  const reports = useFbCount("reports", r => !r.demo && r.category !== "condition");
  const letters = useFbCount("letters", x => !!x.sentAt);
  const num = (list, f) => list === null ? "…" : (f ? list.filter(f) : list).length;
  const now = Date.now();
  const reqOpen = CITY_REQUESTS.filter(r => !r.answeredAt);
  const waitDays = reqOpen.length ? Math.max(0, Math.floor((now - Math.min.apply(null, reqOpen.map(r => Date.parse(r.reg + "T00:00:00")))) / 864e5)) : 0;
  const tiles = [
    [voteTotal, L3("voturi pe petiție", "petition votes", "szavazat a petíción")],
    [num(reports), L3("sesizări de la locuitori", "reports from residents", "lakossági bejelentés")],
    [num(reports, r => r.cityHall && r.cityHall.sentAt), L3("din ele, înregistrate la Primărie", "of those, registered at City Hall", "ebből a Városházán iktatva")],
    [num(reports, r => r.status === "resolved"), L3("din ele, rezolvate", "of those, resolved", "ebből megoldva")],
    [num(letters), L3("scrisori trimise Primăriei", "letters sent to City Hall", "a Városházának küldött levél")],
    [num(letters, x => !!x.reply), L3("din ele, cu răspuns", "of those, answered", "ebből megválaszolva")],
    [CITY_REQUESTS.length - reqOpen.length + " / " + CITY_REQUESTS.length, L3("cereri oficiale (Legea 544) cu răspuns", "official requests (Law 544) answered", "megválaszolt hivatalos kérelem (544-es törvény)")],
    [COURTS_ALL.length, L3("terenuri documentate, în două orașe", "courts documented, in two cities", "dokumentált pálya két városban")]
  ];
  return e("div", { className: "card mb-2 res-board" },
    e("h3", { className: "mb-1 res-head" }, e("span", null, "✅ ", L3("Rezultate până azi", "Results so far", "Eredmények máig")),
      e("span", { className: "res-live" }, e("i", { "aria-hidden": "true" }), L3("live", "live", "élő"))),
    e("p", { className: "text-sm mb-2", style: { color: "var(--textSec)" } }, L3(
      "Cifre din baza de date, din ambele orașe. Se schimbă singure, fără reîncărcare, când cineva votează sau trimite o sesizare. Nimic estimat; sesizările de test nu sunt numărate.",
      "Numbers from the database, for both cities. They change on their own, without a reload, when someone votes or sends a report. Nothing estimated; test reports are not counted.",
      "Számok az adatbázisból, mindkét városból. Újratöltés nélkül, maguktól változnak, amikor valaki szavaz vagy bejelentést küld. Semmi becslés; a tesztbejelentéseket nem számoljuk.")),
    e("div", { className: "res-grid" }, tiles.map(([n, label], i) => e("div", { key: i, className: "res-tile" },
      e("div", { className: "stat-number", key: String(n) }, n),
      e("div", { className: "stat-label" }, label)))),
    reqOpen.length > 0 && e("p", { className: "text-sm mt-2", style: { fontWeight: 600 } }, "⏱️ ", L3(
      "Așteptăm de " + waitDays + " zile răspunsul la cererile oficiale.",
      "We have been waiting " + waitDays + " days for the answer to the official requests.",
      waitDays + " napja várjuk a választ a hivatalos kérelmekre.")));
}
