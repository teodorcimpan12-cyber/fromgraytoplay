import { loadJsPDF } from "../../lib/load-jspdf.js";
import { ACTIVE_CITY, db, g2pSfx, useApp } from "../../app/core.js";
import { AI_LETTER_EXAMPLES } from "../../data/ai-letter-examples.js";
import { CITY_HALL_EMAIL, CITY_RO, LETTER_BASIS, SITE } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { aiEstimateOf } from "../../lib/ai-estimate-of.js";
import { aiErrMsg, g2pAI } from "../../lib/g2p-ai.js";
import { logActivity } from "../../lib/log-activity.js";
import { pdfTxt } from "../../lib/press-numbers.js";
import { useEffect, useRef, useState } from "../../lib/react.js";
import { copyText } from "../../lib/src-by-id.js";
import { getCourtHealthScore } from "./helpers.js";

// The evidence block under the letter: only facts the site shows for this court, never another city's numbers.
export function letterEvidence(c, reports, sigCount, city) {
  const reps = reports ? Object.values(reports).filter(r => r && r.courtId === c.id) : [];
  const open = reps.filter(r => r.status !== "resolved" && r.category !== "condition");
  const last = reps.map(r => r.createdAt).filter(Boolean).sort().pop();
  const day = iso => new Date(iso).toLocaleDateString("ro-RO");
  const L = [];
  L.push("Sesizări deschise pe site pentru acest teren: " + open.length + (last ? " (ultima activitate: " + day(last) + ")" : ""));
  if (c.stadium && c.status === "excellent") L.push("Stare: stadion în stare foarte bună, conform surselor publice");
  else if (c.condition == null) L.push("Stare: neverificată încă pe teren");
  else if (c.estimate === "sat") L.push("Stare estimată din imagini satelit: " + c.condition + "/5" + (c.sat && c.sat.at ? " (imagine din " + c.sat.at.slice(0, 7) + ")" : ""));
  else L.push("Stare pe site: " + c.condition + "/5" + (reports ? " · scor de sănătate " + getCourtHealthScore(c, reports) + "/100" : ""));
  const est = typeof aiEstimateOf === "function" ? aiEstimateOf(reports, c.id) : null;
  if (est) L.push("Estimare AI din " + est.n + " " + (est.n === 1 ? "poză trimisă" : "poze trimise") + " de cetățeni (nu e o inspecție): " + est.score + "/5");
  if (sigCount != null) L.push("Semnături pe petiția From Grey to Play din " + (CITY_RO[city] || city) + ": " + sigCount);
  L.push("Detalii și poze: " + SITE + "/#court-" + c.id);
  return L;
}
// The court's photos for the PDF: gallery first, then report photos; at most 3.
export function letterPhotos(c, gallery, reports) {
  const g = gallery ? Object.values(gallery).filter(x => x && x.courtId === c.id && x.img).map(x => x.img) : [];
  const r = reports ? Object.values(reports).filter(x => x && x.courtId === c.id && x.photoDataUrl).map(x => x.photoDataUrl) : [];
  return g.concat(r).filter(u => /^data:image\/(jpeg|png)/.test(u)).slice(0, 3);
}
// "Scrisoare AI": a letter to City Hall written only from what the site knows about this court.
export function AiLetterModal({ court: c, onClose }) {
  const { lang, toast, user } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const allReports = useFirebase("reports");
  const gallery = useFirebase("gallery");
  const sigStats = useFirebase("signupStats");
  const [st, setSt] = useState({ s: "idle" });
  const [text, setText] = useState("");
  const [basis, setBasis] = useState(c.status === "renovated" || c.status === "excellent" ? "l544" : "og27");
  const sentRef = useRef(false);
  const [name, setName] = useState(user && user.name ? user.name : "");
  useEffect(() => {
    const onKey = ev => { if (ev.key === "Escape") { ev.preventDefault(); ev.stopImmediatePropagation(); onClose(); } };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
  const city = c.city || ACTIVE_CITY;
  const facts = () => {
    const reps = allReports ? Object.values(allReports).filter(r => r && r.courtId === c.id) : [];
    const open = reps.filter(r => r.status !== "resolved" && r.category !== "condition");
    const last = reps.filter(r => r.category === "condition" && r.conditionReport).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0];
    const catRo = { surface: "suprafața de joc degradată", hoop: "coș, panou sau poartă stricate", fence: "gard deteriorat", lighting: "iluminat nefuncțional", trash: "gunoi pe teren", safety: "probleme de siguranță", other: "alte probleme" };
    const typeRo = { basketball: "teren de baschet", football: "teren de fotbal", tennis: "teren de tenis", multiuse: "teren multisport" };
    const f = { name: c.name + (c.address ? ", " + c.address : ""), city, type: c.stadium ? "stadion" : typeRo[c.category] || c.category || "", issues: [...new Set(open.map(r => catRo[r.category]).filter(Boolean))] };
    if (c.stadium) f.stadium = true;
    if (c.status) f.status = c.status;
    const est = aiEstimateOf(allReports, c.id); if (est) f.aiScore = est.score;
    const cond = last ? last.conditionReport : c.status === "degraded" ? "degraded" : "";
    if (cond) f.condition = cond;
    f.reports = allReports ? open.length : (c.reports || 0);
    if (allReports) f.health = getCourtHealthScore(c, allReports);
    return f;
  };
  const gen = () => {
    setSt({ s: "busy" });
    // Always Romanian: the letter goes to a Romanian City Hall.
    g2pAI({ task: "letter", court: facts(), lang: "ro", basis }).then(r => { setText(r.letter || ""); setSt({ s: "done" }); g2pSfx("chime"); })
      .catch(err => setSt({ s: "err", code: err.code }));
  };
  const ex = AI_LETTER_EXAMPLES[city === "sibiu" ? "sibiu" : "tgm"];
  const showExample = () => { setText(ex.letter); setSt({ s: "done", ex: true }); };
  const final = () => text.split("[Nume]").join(name.trim() || "[Nume]");
  const sigs = sigStats ? Object.values(sigStats).filter(x => x && (x.city || "tgm") === city).length : null;
  const evidence = letterEvidence(c, allReports, sigs, city);
  const evTitle = "Dovezi (From Grey to Play, " + new Date().toLocaleDateString("ro-RO") + "):";
  const full = () => final() + "\n\n" + evTitle + "\n" + evidence.map(x => "- " + x).join("\n");
  const subject = LETTER_BASIS[basis].subj + c.name;
  // One record per letter, no personal data: city, court, legal basis, when (Impact shows the reply countdown).
  const track = via => {
    if (sentRef.current) return; sentRef.current = true;
    db.ref("letters").push({ city, courtId: c.id, basis, sentAt: new Date().toISOString(), via }).catch(() => {});
    db.ref("letterCount/total").transaction(v => (v || 0) + 1);
    logActivity("letter", "", c.id);
  };
  const copy = () => copyText(full()).then(ok => { toast(ok ? L3("Copiat ✓", "Copied ✓", "Másolva ✓") : L3("Nu s-a putut copia", "Could not copy", "Nem sikerült másolni")); if (ok) track("copy"); });
  const mail = () => { track("email"); window.location.href = "mailto:" + CITY_HALL_EMAIL[city === "sibiu" ? "sibiu" : "tgm"] + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(full()); };
  const imgSize = src => new Promise(res => { const im = new Image(); im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight }); im.onerror = () => res(null); im.src = src; });
  const pdf = async () => {
    const JsPDF = await loadJsPDF().catch(() => null);
    if (!JsPDF) { toast(L3("PDF-ul încă se încarcă. Mai încearcă o dată.", "The PDF tool is still loading. Try again.", "A PDF még töltődik. Próbáld újra.")); return; }
    const doc = new JsPDF({ unit: "mm", format: "a4" });
    const M = 22, maxW = 210 - M * 2;
    let y = 24;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(110, 115, 125);
    doc.text(pdfTxt(new Date().toLocaleDateString("ro-RO")), 210 - M, y, { align: "right" });
    y += 10;
    doc.setFontSize(11.5); doc.setTextColor(30, 30, 40);
    const para = (par, lh) => { const lines = par.trim() ? doc.splitTextToSize(pdfTxt(par), maxW) : [""]; lines.forEach(line => { if (y > 275) { doc.addPage(); y = 24; } doc.text(line, M, y); y += lh; }); };
    final().split("\n").forEach(par => para(par, 5.6));
    // evidence block, then up to 3 photos of the court as annexes
    y += 4; if (y > 260) { doc.addPage(); y = 24; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); para(evTitle, 5.2); doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(60, 64, 72);
    evidence.forEach(x => para("- " + x, 4.9));
    const photos = letterPhotos(c, gallery, allReports);
    if (photos.length) {
      y += 4; if (y > 230) { doc.addPage(); y = 24; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30, 30, 40); para("Anexe: " + photos.length + (photos.length === 1 ? " fotografie" : " fotografii") + " ale terenului", 6);
      let x = M; const W = (maxW - 8) / 3;
      for (const src of photos) {
        const sz = await imgSize(src); if (!sz) continue;
        const h = Math.min(60, W * sz.h / sz.w);
        if (y + h > 280) { doc.addPage(); y = 24; x = M; }
        try { doc.addImage(src, /^data:image\/png/.test(src) ? "PNG" : "JPEG", x, y, W, h); } catch (e) {}
        x += W + 4;
      }
    }
    doc.setFontSize(8); doc.setTextColor(140, 145, 155);
    doc.text(pdfTxt("From Grey to Play · " + SITE.replace("https://", "") + "/#court-" + c.id), M, 288);
    doc.save("scrisoare-" + c.id + ".pdf");
    track("pdf");
  };
  const e = React.createElement;
  return e("div", { className: "modal-overlay", onClick: onClose },
    e("div", { className: "modal modal-lg ai-letter", onClick: ev => ev.stopPropagation(), role: "dialog", "aria-modal": "true", "aria-label": L3("Scrisoare către Primărie", "Letter to City Hall", "Levél a Városházának") },
      e("div", { className: "flex justify-between items-center mb-1" },
        e("h2", { style: { fontSize: "1rem", margin: 0 } }, L3("Scrisoare către Primărie", "Letter to City Hall", "Levél a Városházának")),
        e("button", { className: "btn btn-sm btn-outline", onClick: onClose }, L3("Închide", "Close", "Bezár"))),
      e("p", { className: "text-sm mb-1", style: { color: "var(--textSec)" } }, "📍 ", c.name, " → ", CITY_HALL_EMAIL[city === "sibiu" ? "sibiu" : "tgm"]),
      st.s !== "done" && e("div", { className: "lt-basis", role: "radiogroup", "aria-label": L3("Tipul scrisorii", "Letter type", "Levél típusa") },
        ["og27", "l544"].map(k => e("button", { key: k, type: "button", role: "radio", "aria-checked": basis === k, className: "lt-b" + (basis === k ? " on" : ""), onClick: () => setBasis(k) },
          e("b", null, LETTER_BASIS[k][lang] || LETTER_BASIS[k].ro),
          e("small", null, LETTER_BASIS[k].law + " · " + L3("răspuns în ", "answer within ", "válasz ") + LETTER_BASIS[k].days + L3(" de zile", " days", " napon belül"))))),
      st.s !== "done" && e("div", { className: "ai-letter-start" },
        e("p", null, L3("AI-ul scrie o scrisoare politicoasă în română, doar din ce știe site-ul despre teren: nume, stare, sesizări. Nu inventează cifre.", "The AI writes a polite letter in Romanian, only from what the site knows about this court: name, condition, reports. It invents no numbers.", "Az AI udvarias román nyelvű levelet ír, csak abból, amit az oldal tud a pályáról: név, állapot, bejelentések. Nem talál ki számokat.")),
        st.s === "err" && e("p", { className: "ai-err-t" }, aiErrMsg(st.code, L3)),
        st.s === "err" && e("button", { className: "btn btn-outline", style: { marginRight: ".5rem" }, onClick: showExample }, "", L3("Arată un exemplu salvat", "Show a saved example", "Mentett példa")),
        e("button", { className: "btn btn-green", onClick: gen, disabled: st.s === "busy" }, st.s === "busy" ? "✨ " + L3("Scrie…", "Writing…", "Írja…") : "✨ " + L3("Scrie scrisoarea", "Write the letter", "Írd meg a levelet"))),
      st.s === "done" && e(React.Fragment, null,
        st.ex ? e("div", { className: "ai-tag ai-tag-ex mb-1" }, "📌 ", L3("Exemplu salvat: scris de AI pe " + ex.at + " pentru „" + ex.name + "”", "Saved example: written by AI on " + ex.at + " for “" + ex.name + "”", "Mentett példa: az AI írta " + ex.at + "-án ehhez: „" + ex.name + "”"), ex.id !== c.id ? L3(", nu pentru terenul ăsta.", ", not for this court.", ", nem ehhez a pályához.") : ".") :
        e("div", { className: "ai-tag mb-1" }, "✨ ", L3("Scris de AI. Citește-l și schimbă ce vrei înainte să-l trimiți.", "Written by AI. Read it and change anything before you send it.", "AI írta. Olvasd el, és változtass rajta küldés előtt.")),
        e("label", { className: "text-sm", style: { display: "block", marginBottom: ".5rem" } }, L3("Numele tău (pentru semnătură)", "Your name (for the signature)", "A neved (az aláíráshoz)"),
          e("input", { value: name, onChange: ev => setName(ev.target.value), maxLength: 80, placeholder: "[Nume]", style: { marginTop: ".25rem" } })),
        // Shows the name in place of [Nume] as it is typed; edits are stored back with the placeholder.
        e("textarea", { className: "ai-letter-text", value: final(), onChange: ev => setText(name.trim() ? ev.target.value.split(name.trim()).join("[Nume]") : ev.target.value), rows: 12, maxLength: 4000, "aria-label": L3("Textul scrisorii", "Letter text", "A levél szövege") }),
        e("div", { className: "lt-ev" }, e("b", null, "📎 ", evTitle), e("ul", null, evidence.map((x, i) => e("li", { key: i }, x))),
          e("small", null, L3("Se adaugă singur la email și în PDF (cu până la 3 poze ale terenului).", "Added automatically to the email and the PDF (with up to 3 photos of the court).", "Automatikusan bekerül az e-mailbe és a PDF-be (legfeljebb 3 fotóval)."))),
        e("div", { className: "ai-letter-acts" },
          e("button", { className: "btn btn-outline", onClick: copy }, "", L3("Copiază", "Copy", "Másolás")),
          e("button", { className: "btn btn-green", onClick: mail }, "", L3("Trimite pe email", "Send by email", "Küldés e-mailben")),
          e("button", { className: "btn btn-outline", onClick: pdf }, "PDF"),
          e("button", { className: "btn btn-sm btn-outline", onClick: gen, title: L3("Scrie din nou", "Write again", "Írd újra") }, "↻")))
    ));
}
