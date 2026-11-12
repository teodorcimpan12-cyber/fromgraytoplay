import { useApp } from "../../app/core.js";
import { CSM_BUDGET, CSM_SRC } from "../../data/constants.js";
import { CSM_INVEST } from "../../data/csm-invest.js";
import { useState } from "../../lib/react.js";

export function CsmInvest() {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const [open, setOpen] = useState(false);
  const e = React.createElement;
  const loc = {
    polivalenta: L3("Sala Polivalentă (platformă pietonală)", "Sala Polivalentă (pedestrian platform)", "Sala Polivalentă (gyalogos platform)"),
    plutelor: L3("Baza Str. Plutelor (fotbal)", "Str. Plutelor base (football)", "Str. Plutelor bázis (foci)"),
    parc: L3("Parcul Municipal", "Municipal Park", "Városi park"),
    insulei: L3("Baza Str. Insulei", "Str. Insulei base", "Str. Insulei bázis"),
    mureseni: L3("Baza Mureșeni (fotbal)", "Mureșeni base (football)", "Mureșeni bázis (foci)"),
    na: L3("Fără locație în document", "No location in the document", "Helyszín nélkül a dokumentumban")
  }; // TODO: HU review
  // A location key the labels don't know yet (a future reply) still gets a name.
  const locName = k => loc[k] || (L3("Altă locație", "Other location", "Egyéb helyszín") + ": " + k);
  const LOC = { ro: "ro-RO", en: "en-GB", hu: "hu-HU" }[lang] || "ro-RO";
  const fmt = n => Math.round(n || 0).toLocaleString(LOC);
  const mil = n => ((n || 0) / 1e6).toLocaleString(LOC, { maximumFractionDigits: 1 });
  const pct = (a, b) => b ? (a / b * 100).toLocaleString(LOC, { maximumFractionDigits: 1 }) + "%" : "—";
  const n = CSM_INVEST.length;
  const items = L3(n + " " + (new Intl.PluralRules("ro-RO").select(n) === "one" ? "lucrare" : new Intl.PluralRules("ro-RO").select(n) === "few" ? "lucrări" : "de lucrări"),
    n + (n === 1 ? " item" : " items"), n + " tétel");
  const total = CSM_INVEST.reduce((s, r) => s + r.lei, 0);
  const l3 = CSM_INVEST.filter(r => r.l3).reduce((s, r) => s + r.lei, 0);
  const byLoc = {}; CSM_INVEST.forEach(r => { byLoc[r.loc] = (byLoc[r.loc] || 0) + r.lei; });
  const locs = Object.keys(byLoc).sort((a, b) => byLoc[b] - byLoc[a]);
  const years = Object.keys(CSM_BUDGET).map(Number).sort((a, b) => a - b);
  const byYear = {}; CSM_INVEST.forEach(r => { byYear[r.y] = (byYear[r.y] || 0) + r.lei; });
  const y0 = years[0], y1 = years[years.length - 1];
  const span = years.length > 1 ? y0 + "–" + y1 : String(y1 || "");
  const mxL = Math.max(1, ...locs.map(k => byLoc[k]));
  const mxY = Math.max(1, ...years.map(y => byYear[y] || 0));
  const bud0 = CSM_BUDGET[y0], bud1 = CSM_BUDGET[y1], sp0 = byYear[y0] || 0, sp1 = byYear[y1] || 0;
  const bar = (w, color) => e("div", { style: { height: 10, borderRadius: 5, background: "var(--border)", overflow: "hidden" } },
    e("div", { style: { width: Math.max(0, Math.min(100, w)) + "%", height: "100%", background: color, borderRadius: 5 } }));
  const amt = v => e("b", { style: { whiteSpace: "nowrap", color: v < 0 ? "var(--red)" : undefined, fontVariantNumeric: "tabular-nums" } }, fmt(v) + " lei");
  const row = { className: "flex justify-between", style: { fontSize: ".85rem", gap: ".25rem .5rem", flexWrap: "wrap" } };
  const head = e(React.Fragment, null,
    e("span", { className: "badge", style: { background: "var(--teal)", color: "#fff" } }, L3("📄 DATE OFICIALE · Legea 544/2001", "📄 OFFICIAL DATA · Law 544/2001", "📄 HIVATALOS ADAT · 544/2001")),
    e("h3", { className: "mt-1 mb-1" }, L3("Ce a investit CSM Târgu Mureș în terenuri de sport", "What CSM Târgu Mureș spent on sports grounds", "Mire költött a CSM Marosvásárhely sportpályákon") + (span ? ", " + span : ""))); // TODO: HU review
  const src = e("p", { className: "mt-1", style: { fontSize: ".75rem", color: "var(--textSec)" } }, L3("Sursă: ", "Source: ", "Forrás: "), CSM_SRC, L3(". Bugete: HCL 299/2022, 374/2023, 294/2024, 276/2025. Textul lucrărilor e copiat din document.", ". Budgets: HCL 299/2022, 374/2023, 294/2024, 276/2025. Item text copied from the document (Romanian).", ". Költségvetések: HCL 299/2022, 374/2023, 294/2024, 276/2025. A tételek szövege a dokumentumból (románul)."));
  if (!n) return e("div", { className: "card mb-2", style: { borderLeft: "4px solid var(--teal)" } }, head,
    e("p", { style: { color: "var(--textSec)" } }, L3("Încă nu avem date oficiale despre investiții.", "No official investment data yet.", "Még nincs hivatalos beruházási adat.")), src); // TODO: HU review
  const l3share = (byLoc.polivalenta || 0) + l3;
  const trend = years.length > 1 && bud0 && sp0;
  const grewFell = trend && bud1 > bud0 && sp1 < sp0;
  return e("div", { className: "card mb-2", style: { borderLeft: "4px solid var(--teal)" } }, head,
    e("div", { className: "grid grid-3 mb-2" },
      e("div", { style: { textAlign: "center" } }, e("div", { className: "stat-number", style: { color: "var(--teal)" } }, Math.abs(total) >= 1e6 ? (total / 1e6).toLocaleString(LOC, { maximumFractionDigits: 2 }) + "M" : fmt(total)),
        e("div", { className: "stat-label" }, L3("lei", "lei", "lej") + (years.length > 1 ? L3(" în " + years.length + " ani", " in " + years.length + " years", " " + years.length + " év alatt") : "") + ", " + items)),
      l3share > 0 && e("div", { style: { textAlign: "center" } }, e("div", { className: "stat-number", style: { color: "var(--coral)" } }, pct(l3share, total)), e("div", { className: "stat-label" }, L3("pe omologarea Liga 3 + o platformă pietonală", "on Liga 3 homologation + a pedestrian platform", "Liga 3 hitelesítésre + egy gyalogos platformra"))),
      bud1 > 0 && e("div", { style: { textAlign: "center" } }, e("div", { className: "stat-number", style: { color: "var(--red)" } }, pct(sp1, bud1)), e("div", { className: "stat-label" }, L3("din bugetul CSM " + y1 + " a ajuns la terenuri", "of the " + y1 + " CSM budget went to grounds", "a " + y1 + "-es CSM-költségvetésből jutott pályákra")))), // TODO: HU review
    e("h4", { className: "mb-1" }, L3("Unde au mers banii", "Where the money went", "Hová ment a pénz")),
    locs.map(k => e("div", { key: k, style: { marginBottom: ".55rem" } },
      e("div", row, e("span", { style: { minWidth: 0 } }, locName(k)), e("span", { style: { whiteSpace: "nowrap" } }, amt(byLoc[k]), e("b", null, " · " + pct(byLoc[k], total)))),
      bar(byLoc[k] / mxL * 100, k === "mureseni" ? "var(--green)" : k === "na" ? "var(--textSec)" : "var(--teal)"))),
    years.length > 0 && e("h4", { className: "mt-2 mb-1" }, grewFell ? L3("Bugetul CSM a crescut, investițiile în terenuri au scăzut", "CSM's budget grew, spending on grounds fell", "A CSM költségvetése nőtt, a pályákra fordított összeg csökkent") : L3("Bugetul CSM și investițiile în terenuri, pe ani", "CSM budget and spending on grounds, by year", "A CSM költségvetése és a pályákra fordított összeg évenként")), // TODO: HU review
    years.map(y => e("div", { key: y, style: { marginBottom: ".55rem" } },
      e("div", row,
        e("span", null, e("b", null, y), " · " + L3("buget CSM ", "CSM budget ", "CSM-költségvetés ") + mil(CSM_BUDGET[y]) + "M lei"),
        e("span", { style: { whiteSpace: "nowrap" } }, amt(byYear[y] || 0), e("b", null, " · " + pct(byYear[y] || 0, CSM_BUDGET[y])))),
      bar((byYear[y] || 0) / mxY * 100, "var(--coral)"))),
    trend && e("p", { className: "mt-2", style: { fontSize: ".9rem" } }, L3(
      "Între " + y0 + " și " + y1 + " bugetul CSM " + (bud1 >= bud0 ? "a crescut" : "a scăzut") + " de la " + mil(bud0) + " la " + mil(bud1) + " milioane lei (" + (bud1 >= bud0 ? "+" : "−") + pct(Math.abs(bud1 - bud0), bud0) + "), iar suma pentru terenuri " + (sp1 >= sp0 ? "a crescut" : "a scăzut") + " de la " + fmt(sp0) + " la " + fmt(sp1) + " lei (" + (sp1 >= sp0 ? "+" : "−") + pct(Math.abs(sp1 - sp0), sp0) + ").",
      "Between " + y0 + " and " + y1 + " CSM's budget " + (bud1 >= bud0 ? "rose" : "fell") + " from " + mil(bud0) + " to " + mil(bud1) + " million lei (" + (bud1 >= bud0 ? "+" : "−") + pct(Math.abs(bud1 - bud0), bud0) + "), while spending on grounds " + (sp1 >= sp0 ? "rose" : "fell") + " from " + fmt(sp0) + " to " + fmt(sp1) + " lei (" + (sp1 >= sp0 ? "+" : "−") + pct(Math.abs(sp1 - sp0), sp0) + ").",
      y0 + " és " + y1 + " között a CSM költségvetése " + mil(bud0) + "-ről " + mil(bud1) + " millió lejre " + (bud1 >= bud0 ? "nőtt" : "csökkent") + " (" + (bud1 >= bud0 ? "+" : "−") + pct(Math.abs(bud1 - bud0), bud0) + "), a pályákra fordított összeg pedig " + fmt(sp0) + "-ről " + fmt(sp1) + " lejre " + (sp1 >= sp0 ? "nőtt" : "csökkent") + " (" + (sp1 >= sp0 ? "+" : "−") + pct(Math.abs(sp1 - sp0), sp0) + ").")), // TODO: HU review
    e("p", { style: { fontSize: ".85rem", color: "var(--textSec)" } }, L3(
      "Ce nu acoperă lista: CSM administrează doar bazele sale. Terenurile de bloc din cartiere — inclusiv terenul multisport de pe str. Plopilor aprobat în ian. 2025 — nu sunt în administrarea CSM, iar extrasul din SIDU 2021–2030 nu îl deține. Le-am cerut de la Primărie; aceasta a prelungit termenul de răspuns la 30 de zile (adresa nr. 51941/04.11.2026), deci până la 25.11.2026.",
      "What the list does not cover: CSM only manages its own bases. Block courts in the neighbourhoods — including the Str. Plopilor multisport court approved in Jan 2025 — are not managed by CSM, and it does not hold the SIDU 2021–2030 extract. We asked City Hall; it extended its answer deadline to 30 days (letter nr. 51941/04.11.2026), i.e. by 25.11.2026.",
      "Amit a lista nem fed le: a CSM csak a saját bázisait kezeli. A lakótelepi pályák — köztük a 2025 januárjában jóváhagyott Str. Plopilor multisport pálya — nem a CSM kezelésében vannak, és a SIDU 2021–2030 kivonatát sem birtokolja. A Polgármesteri Hivataltól kértük; a válaszhatáridőt 30 napra hosszabbította (51941/04.11.2026), azaz 2026.11.25-ig.")), // TODO: HU review
    e("button", { className: "btn btn-sm btn-outline", onClick: () => setOpen(!open) }, open ? L3("Ascunde lista", "Hide the list", "Lista elrejtése") : L3(n === 1 ? "Vezi lucrarea" : "Vezi toate cele " + items, n === 1 ? "See the item" : "See all " + items, n === 1 ? "A tétel" : "Mind a " + items)),
    open && e("div", { className: "mt-1", style: { fontSize: ".82rem" } }, CSM_INVEST.map((r, i) => e("div", { key: i, className: "flex justify-between fade-b", style: { gap: ".25rem .75rem", padding: ".35rem 0", flexWrap: "wrap" } },
      e("span", { style: { flex: "1 1 12rem", minWidth: 0 } }, e("b", null, r.y), " · ", r.k === "i" ? L3("Investiție", "Investment", "Beruházás") : L3("Reparație", "Repair", "Javítás"), " · ", r.what),
      amt(r.lei)))),
    src
  );
}
