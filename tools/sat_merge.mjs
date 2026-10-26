// Merges the blind satellite reviews (tools/sat-review.html exports) into one audit.
//  - input: tools/data/sat_reviews/*.json (one file per reviewer; reviewer names starting "AI" are compared
//    with the humans but never count towards a consensus)
//  - per court: consensus only where the human reviewers who could tell agree; otherwise "disputed"
//  - agreement: percent agreement and Cohen's kappa for every pair of human reviewers, per question
//  - output: tools/data/sat_audit.json + tools/SAT_AUDIT.md (the table a jury or a journalist can check)
// Usage: node tools/sat_merge.mjs [reviews-dir]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const dir = pathToFileURL(resolve(fileURLToPath(root), process.argv[2] || "tools/data/sat_reviews") + "/");
if (!existsSync(dir)) { console.error("No reviews folder:", dir.pathname, "— save the exported JSON files there."); process.exit(1); }
const courts = JSON.parse(readFileSync(new URL("tools/data/courts_sibiu.json", root), "utf8")).courts;
const caps = JSON.parse(readFileSync(new URL("data/timemachine.json", root), "utf8")).courts;

const files = readdirSync(dir).filter(f => f.endsWith(".json"));
const reviews = files.map(f => JSON.parse(readFileSync(new URL(f, dir), "utf8")))
  .filter(r => r.tool === "sat-review" && r.version >= 2 && r.reviewer && r.reviews);
if (!reviews.length) { console.error("No version-2 sat-review exports in", dir.pathname); process.exit(1); }
const isAI = name => /^AI\b/i.test(name);
const humans = reviews.filter(r => !isAI(r.reviewer)), ais = reviews.filter(r => isAI(r.reviewer));
console.log(`reviewers: ${humans.map(r => r.reviewer).join(", ") || "none"}${ais.length ? " · AI: " + ais.map(r => r.reviewer).join(", ") : ""}`);

// Consensus of definite answers ("unsure" and blanks abstain); needs ≥ 2 human answers and no contradiction.
function consensus(values) {
  const definite = values.filter(v => v && v !== "unsure");
  if (definite.length < 2) return { value: null, state: definite.length ? "single" : "unknown", n: definite.length };
  const same = definite.every(v => v === definite[0]);
  return same ? { value: definite[0], state: "agreed", n: definite.length } : { value: null, state: "disputed", n: definite.length };
}

// Cohen's kappa for two raters over the items both answered definitely.
function kappa(pairs) {
  if (pairs.length < 2) return null;
  const cats = [...new Set(pairs.flat())], n = pairs.length;
  const po = pairs.filter(([a, b]) => a === b).length / n;
  const pe = cats.reduce((s, c) => s + (pairs.filter(p => p[0] === c).length / n) * (pairs.filter(p => p[1] === c).length / n), 0);
  return { n, agreement: po, kappa: pe === 1 ? 1 : (po - pe) / (1 - pe) };
}

const QUESTIONS = ["visible", "surface", "markings", "change"];
const agreement = [];
for (let i = 0; i < humans.length; i++) for (let j = i + 1; j < humans.length; j++) {
  const A = humans[i], B = humans[j], row = { pair: `${A.reviewer} × ${B.reviewer}` };
  for (const q of [...QUESTIONS, "timeline"]) {
    const pairs = [];
    for (const c of courts) {
      const a = A.reviews[c.id], b = B.reviews[c.id];
      if (!a || !b) continue;
      if (q === "timeline") {
        for (const d of Object.keys(a.timeline || {})) {
          const x = a.timeline[d], y = (b.timeline || {})[d];
          if (x && y && x !== "unsure" && y !== "unsure") pairs.push([x, y]);
        }
      } else if (a[q] && b[q] && a[q] !== "unsure" && b[q] !== "unsure") pairs.push([a[q], b[q]]);
    }
    row[q] = kappa(pairs);
  }
  agreement.push(row);
}

const audit = courts.map(c => {
  const cs = caps[c.id] || [], latest = cs.length ? cs[cs.length - 1].date : null;
  const hv = humans.map(r => r.reviews[c.id]).filter(Boolean);
  const out = { id: c.id, latestCapture: latest, reviewers: hv.length };
  for (const q of QUESTIONS) out[q] = consensus(hv.map(v => v[q]));
  out.timeline = cs.map(cap => ({ date: cap.date, ...consensus(hv.map(v => (v.timeline || {})[cap.date])) }));
  const seen = out.timeline.filter(t => t.value === "yes").map(t => t.date), notSeen = out.timeline.filter(t => t.value === "no").map(t => t.date);
  out.firstSeen = seen[0] || null;
  out.lastSeen = seen[seen.length - 1] || null;
  // Plain-language finding, only from agreed answers.
  if (out.visible.value === "no" && !seen.length && notSeen.length) out.finding = "no-court-visible";            // never seen as a court
  else if (out.visible.value === "no" && seen.length) out.finding = "gone-after-" + out.lastSeen;                // seen before, not in the latest
  else if (out.visible.value === "yes" && out.change.value === "none") out.finding = "unchanged";
  else if (out.visible.value === "yes" && out.change.value) {
    out.since = consensus(hv.map(v => v.since)).value;
    // No agreed date: the agreed timeline still brackets it (last image without the court → first image with it).
    const before = out.firstSeen && notSeen.filter(d => d < out.firstSeen).pop();
    out.finding = out.since ? out.change.value + "-before-" + out.since
      : before ? out.change.value + "-between-" + before + "-" + out.firstSeen : out.change.value + "-before-?";
  }
  else out.finding = "needs-review";
  out.ai = ais.map(r => ({ reviewer: r.reviewer, visible: (r.reviews[c.id] || {}).visible || null, change: (r.reviews[c.id] || {}).change || null }));
  out.notes = hv.map(v => v.notes).filter(Boolean);
  return out;
});

const count = k => audit.filter(a => a.finding.startsWith(k)).length;
const summary = {
  courts: audit.length, reviewed_by_two_or_more: audit.filter(a => a.reviewers >= 2).length,
  unchanged: count("unchanged"), changed: audit.filter(a => /-(before|between)-/.test(a.finding)).length,
  gone: count("gone-after"), never_visible: count("no-court-visible"), needs_review: count("needs-review")
};
writeFileSync(new URL("tools/data/sat_audit.json", root), JSON.stringify({
  method: "Blind review of Esri World Imagery Wayback captures (2011–2025) by ≥ 2 team members; consensus only where they agree.",
  source: "Esri World Imagery Wayback; court outlines © OpenStreetMap contributors (ODbL)",
  generated_at: new Date().toISOString(), reviewers: humans.map(r => r.reviewer), ai_reviewers: ais.map(r => r.reviewer),
  summary, agreement, courts: audit
}, null, 2) + "\n");

// Small public copy for the app (court detail): findings only, no reviewer names.
writeFileSync(new URL("data/sat_findings.json", root), JSON.stringify({
  generated_at: new Date().toISOString(), reviewers: humans.length, source: "Esri World Imagery Wayback",
  courts: Object.fromEntries(audit.map(a => [a.id, { finding: a.finding, latestCapture: a.latestCapture, firstSeen: a.firstSeen, lastSeen: a.lastSeen, n: a.reviewers }]))
}) + "\n");

const pct = x => x == null ? "—" : Math.round(x * 100) + "%";
const kap = k => k ? `${k.kappa.toFixed(2)} (${pct(k.agreement)}, n=${k.n})` : "—";
const FIND = { unchanged: "neschimbat", "no-court-visible": "**niciun teren vizibil**", "needs-review": "de revăzut" };
const label = f => FIND[f] || (f.startsWith("gone-after-") ? `**dispărut** după ${f.slice(11)}` : f.replace(/-between-(\d{4}-\d\d-\d\d)-/, " între $1 și ").replace(/-before-/, " înainte de ").replace(/^resurfaced/, "refăcut").replace(/^built/, "construit").replace(/^degraded/, "degradat").replace(/^construction/, "șantier"));
const md = [
  "# Sibiu din satelit — audit al celor 35 de terenuri",
  "",
  `Generat: ${new Date().toISOString()} · Sursă: Esri World Imagery Wayback (capturi 2011–2025); contururi © OpenStreetMap contributors (ODbL).`,
  `Metodă: fiecare teren a fost evaluat **orb** (fără nume și cartier) de cel puțin doi membri ai echipei, pe toate imaginile disponibile.`,
  "Un rezultat apare doar unde evaluatorii sunt de acord; altfel terenul rămâne „de revăzut”. Imaginile din satelit **nu** arată starea de azi.",
  "",
  `Evaluatori: ${humans.map(r => r.reviewer).join(", ")}${ais.length ? ` · comparat cu AI: ${ais.map(r => r.reviewer).join(", ")} (nu decide nimic)` : ""}`,
  "",
  "## Rezumat",
  "",
  `- Terenuri evaluate de ≥ 2 persoane: **${summary.reviewed_by_two_or_more} / ${summary.courts}**`,
  `- Neschimbate din prima imagine: **${summary.unchanged}** · cu o schimbare vizibilă: **${summary.changed}**`,
  `- Dispărute (văzute înainte, nu și în ultima imagine): **${summary.gone}** · niciodată vizibile ca teren: **${summary.never_visible}**`,
  `- De revăzut (dezacord sau „nu se poate spune”): **${summary.needs_review}**`,
  "",
  "## Acordul între evaluatori (Cohen's kappa; 1 = acord perfect, 0 = la întâmplare)",
  "",
  "| Pereche | Se vede terenul | Suprafață | Marcaje | Schimbare | Pe fiecare imagine |",
  "|---|---|---|---|---|---|",
  ...agreement.map(a => `| ${a.pair} | ${kap(a.visible)} | ${kap(a.surface)} | ${kap(a.markings)} | ${kap(a.change)} | ${kap(a.timeline)} |`),
  "",
  "## Pe teren",
  "",
  "| ID | Ultima imagine | Evaluatori | Se vede acum | Prima / ultima dată văzut | Rezultat | AI |",
  "|---|---|---|---|---|---|---|",
  ...audit.map(a => `| ${a.id} | ${a.latestCapture || "—"} | ${a.reviewers} | ${a.visible.value || a.visible.state} | ${a.firstSeen || "—"} / ${a.lastSeen || "—"} | ${label(a.finding)} | ${a.ai.map(x => x.visible || "—").join(", ") || "—"} |`),
  ""
].join("\n");
writeFileSync(new URL("tools/SAT_AUDIT.md", root), md);
console.log(JSON.stringify(summary));
console.log("wrote tools/data/sat_audit.json and tools/SAT_AUDIT.md");
