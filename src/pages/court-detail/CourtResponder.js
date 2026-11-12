import { useApp } from "../../app/core.js";
import { CITY_REQUESTS } from "../../data/city-requests.js";
import { CITY_544, COURT_ADMIN } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { deadlineState } from "../../lib/deadline-state.js";

// "Cine răspunde" on the court page: administrator, the 30-day clock (only from a real send), report history.
export function CourtResponder({ court: c }) {
  const { t, lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const reports = useFirebase("reports");
  const e = React.createElement;
  const loc = lang === "en" ? "en-GB" : lang === "hu" ? "hu-HU" : "ro-RO";
  const day = ms => new Date(ms).toLocaleDateString(loc, { day: "numeric", month: "short", year: "numeric" });
  const adm = COURT_ADMIN[c.admin] ? c.admin : "unknown";
  const ai = lang === "en" ? 1 : lang === "hu" ? 2 : 0;
  const reps = reports ? Object.entries(reports).map(([id, r]) => Object.assign({ id }, r)).filter(r => r.courtId === c.id && r.category !== "condition")
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))) : [];
  // The clock starts only from a registration stamp entered by the admin (reports/*/cityHall.sentAt).
  const sent = reps.filter(r => r.cityHall && r.cityHall.sentAt).sort((a, b) => String(b.cityHall.sentAt).localeCompare(String(a.cityHall.sentAt)))[0];
  const ds = sent && deadlineState(sent.cityHall.sentAt, 30, !!sent.official || sent.status === "resolved");
  const req = CITY_544[c.city || "tgm"], reqDone = req && (CITY_REQUESTS.find(r => r.city === (c.city || "tgm")) || {}).answeredAt;
  const reqLate = req && !reqDone && Date.now() > Date.parse(req.due + "T23:59:59");
  const catL = k => ({ surface: t.catSurface, hoop: t.catHoop, fence: t.catFence, lighting: t.catLighting, trash: t.catTrash, safety: t.catSafety, other: t.catOther }[k] || k);
  const stL = k => ({ received: L3("primită", "received", "beérkezett"), analyzing: L3("în analiză", "being checked", "vizsgálat alatt"), planned: L3("planificată", "planned", "tervezett"), resolved: L3("rezolvată", "resolved", "megoldva") }[k] || k || "");
  const muted = { color: "var(--textSec)" };
  return e("div", { className: "card mb-2" },
    e("h3", { className: "mb-1" }, "🏛️ ", L3("Cine răspunde", "Who answers", "Ki felel")),
    e("p", { className: "text-sm mb-1" }, L3("Administrator: ", "Manager: ", "Kezelő: "), e("b", null, COURT_ADMIN[adm][ai]),
      adm === "unknown" && e("span", { className: "text-xs", style: muted }, " · " + L3("încă neverificat, nu ghicim", "not verified yet, we don't guess", "még nincs ellenőrizve, nem találgatunk"))),
    !ds && e("p", { className: "text-sm mb-1", style: muted }, "⏱️ ", L3("Nicio trimitere oficială înregistrată pentru acest teren. Ceasul de 30 de zile pornește când o sesizare e înregistrată la Primărie.", "No official submission recorded for this court. The 30-day clock starts when a report is registered at City Hall.", "Ehhez a pályához még nincs hivatalos beadvány rögzítve. A 30 napos óra akkor indul, amikor egy bejelentést iktatnak a Városházán.")),
    ds && e("div", { className: "mb-1" },
      e("p", { className: "text-sm" }, "📨 ", L3("Trimis la Primărie: ", "Sent to City Hall: ", "Elküldve a Városházának: "), e("b", null, day(ds.start)), sent.cityHall.regNo ? " · nr. " + sent.cityHall.regNo : "",
        " · ", L3("termen: ", "deadline: ", "határidő: "), e("b", null, day(ds.due))),
      ds.st === "wait" && e("div", { role: "progressbar", "aria-valuenow": Math.round(ds.pct), "aria-valuemin": 0, "aria-valuemax": 100, style: { height: 8, borderRadius: 8, background: "var(--border)", overflow: "hidden", margin: ".35rem 0" } },
        e("i", { style: { display: "block", height: "100%", width: ds.pct + "%", background: "var(--green)" } })),
      e("p", { className: "text-sm", style: { fontWeight: 600, color: ds.st === "late" ? "var(--coral)" : "var(--green)" } },
        ds.st === "done" ? "✓ " + L3("Răspuns înregistrat", "Answer recorded", "Válasz rögzítve")
          : ds.st === "wait" ? L3("Mai sunt " + Math.max(0, ds.left) + " zile", Math.max(0, ds.left) + " days left", "Még " + Math.max(0, ds.left) + " nap")
          : L3("Termenul a trecut: fără răspuns înregistrat", "Deadline passed: no answer recorded", "A határidő lejárt: nincs rögzített válasz"))),
    req && e("p", { className: "text-xs mb-1", style: muted }, "📄 ", L3("Cererea noastră (Legea 544/2001) către ", "Our request (Law 544/2001) to ", "Kérelmünk (544/2001-es törvény): ") + req.to + ", nr. " + req.no + " · ",
      reqDone ? L3("răspuns primit", "answer received", "válasz megérkezett") : reqLate ? L3("fără răspuns înregistrat", "no answer recorded", "nincs rögzített válasz") : L3("răspuns așteptat până la 25.11.2026", "answer due by 25.11.2026", "válasz várható 2026.11.25-ig")),
    e("h4", { className: "text-sm mb-1", style: { marginTop: ".6rem" } }, L3("Istoricul sesizărilor", "Report history", "Bejelentések előzményei"), reps.length ? " (" + reps.length + ")" : ""),
    !reps.length && e("p", { className: "text-xs", style: muted }, reports ? L3("Încă nicio sesizare pentru acest teren.", "No reports for this court yet.", "Ehhez a pályához még nincs bejelentés.") : "…"),
    reps.slice(0, 6).map(r => e("div", { key: r.id, className: "text-xs", style: { display: "flex", gap: ".5rem", flexWrap: "wrap", padding: ".3rem 0", borderTop: "1px solid var(--border)" } },
      e("span", { style: muted }, r.createdAt ? day(Date.parse(r.createdAt)) : ""),
      e("b", null, catL(r.category)),
      e("span", null, stL(r.status)),
      r.cityHall && r.cityHall.sentAt && e("span", null, "📨"),
      r.demo && e("span", { className: "badge", style: { fontSize: ".65rem" } }, "demo"))));
}
