import { useApp } from "../../app/core.js";
import { REPORT_CATS } from "../../data/constants.js";
import { anonName } from "../../lib/next-lang.js";
import { useState } from "../../lib/react.js";
import { reportStage, waitText } from "./helpers.js";

export function fmtDay(iso, lang) { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString(lang === "en" ? "en-GB" : lang === "hu" ? "hu-HU" : "ro-RO", { day: "numeric", month: "short" }); }
export function ReportTimeline({ r }) {
  const { t, lang } = useApp();
  const idx = reportStage(r), at = r.statusAt || {};
  const dates = [at.received || r.createdAt, at.analyzing, (r.cityHall && r.cityHall.sentAt) || at.planned, at.resolved];
  const labels = [t.statusReceived, t.statusAnalyzing, t.statusPlanned, t.statusResolved];
  return React.createElement("div", { className: "report-timeline", "aria-label": labels[idx] },
    labels.map((l, i) => React.createElement("div", { key: i, className: "rt-step" + (i <= idx ? " reached" : "") },
      React.createElement("div", { className: "rt-dot" + (i < idx || (i === idx && idx === 3) ? " done" : i === idx ? " active" : "") }, i < idx || idx === 3 ? "✓" : ""),
      React.createElement("div", { className: "rt-label" }, l),
      i <= idx && dates[i] && React.createElement("div", { className: "rt-date" }, fmtDay(dates[i], lang))
    ))
  );
}
export function ReportCard({ r, now, onCourt }) {
  const { t, lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [big, setBig] = useState(false);
  const cat = REPORT_CATS.find(c => c[0] === r.category);
  const isCheck = r.category === "condition";
  const condLabel = { good: t.conditionGood, degraded: t.conditionDegraded, abandoned: t.conditionAbandoned };
  const catLabel = k => ({ surface: t.catSurface, hoop: t.catHoop, fence: t.catFence, lighting: t.catLighting, trash: t.catTrash, safety: t.catSafety, other: t.catOther, condition: t.conditionCheck }[k] || k);
  const stage = reportStage(r);
  const sBadge = ["badge-received", "badge-analyzing", "badge-planned", "badge-resolved"][stage];
  const waiting = !isCheck && stage < 3 && r.createdAt ? now - new Date(r.createdAt).getTime() : 0;
  const e = React.createElement;
  return e("article", { className: "rp-card card" + (stage === 3 ? " solved" : "") },
    e("div", { className: "rp-head" },
      e("span", { className: "rp-ic", "aria-hidden": "true" }, isCheck ? "🩺" : cat ? cat[1] : "📌"),
      e("div", { className: "rp-who" },
        e("button", { className: "rp-court", onClick: () => onCourt(r.courtId) }, r.courtName || r.courtId),
        e("small", null, catLabel(r.category) + " · " + anonName(r.userName || "Anonim") + " · " + fmtDay(r.createdAt, lang))),
      isCheck ? e("span", { className: "badge badge-analyzing" }, L3("verificare", "check", "ellenőrzés")) : e("span", { className: "badge " + sBadge }, [t.statusReceived, t.statusAnalyzing, t.statusPlanned, t.statusResolved][stage])),
    e("p", { className: "rp-desc" }, (isCheck && condLabel[r.conditionReport]) || r.description),
    r.photoDataUrl && e("button", { className: "rp-photo" + (big ? " big" : ""), onClick: () => setBig(b => !b), "aria-label": L3("Mărește poza", "Enlarge photo", "Fotó nagyítása") },
      e("img", { src: r.photoDataUrl, alt: L3("Poză sesizare", "Report photo", "Bejelentés fotó"), loading: "lazy" })),
    !isCheck && e(ReportTimeline, { r: r }),
    r.cityHall && (r.cityHall.sentAt || r.cityHall.regNo) && e("p", { className: "rp-proof" },
      "📨 " + L3("Trimis la Primărie", "Sent to City Hall", "Elküldve a Városházának") + (r.cityHall.sentAt ? " · " + fmtDay(r.cityHall.sentAt, lang) : "") + (r.cityHall.regNo ? " · " + L3("Nr. înreg. ", "Reg. no. ", "Iktatószám: ") + r.cityHall.regNo : "")),
    r.official && r.official.note && e("div", { className: "rp-official" },
      e("span", { className: "badge badge-official" }, "🏛️ " + t.officialResponse),
      e("p", null, r.official.note),
      r.official.at && e("small", null, fmtDay(r.official.at, lang))),
    waiting > 0 && e("p", { className: "rp-wait", title: L3("Timp scurs de la trimitere", "Time since it was sent", "Elküldés óta eltelt idő") }, "⏳ " + L3("Așteaptă de ", "Waiting for ", "Vár: ") + waitText(waiting, lang)));
}
