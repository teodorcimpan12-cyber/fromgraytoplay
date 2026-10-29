import { test } from "node:test";
import assert from "node:assert/strict";
import { extractFunction, extractConst, load, html } from "./g2p-utils.mjs";

const t = { unverified: "Neverificat", weatherExcellent: "E", weatherGood: "G", weatherOkay: "O", weatherPoor: "P", weatherBroken: "B" };

test("getCourtWeather maps condition to buckets and treats null as unverified", () => {
  const { getCourtWeather } = load([extractFunction("getCourtWeather")], ["getCourtWeather"]);
  assert.equal(getCourtWeather(5, t).key, "weatherExcellent");
  assert.equal(getCourtWeather(3, t).key, "weatherGood");
  assert.equal(getCourtWeather(1, t).key, "weatherPoor");
  assert.equal(getCourtWeather(0, t).key, "weatherBroken");
  assert.equal(getCourtWeather(null, t).key, "unverified");
  assert.equal(getCourtWeather(undefined, t).key, "unverified");
});

test("tsOf sorts numeric and ISO timestamps together", () => {
  const { tsOf } = load([extractFunction("tsOf")], ["tsOf"]);
  const items = [{ timestamp: "2026-10-20T10:00:00.000Z" }, { timestamp: Date.parse("2026-10-24T10:00:00Z") }, { timestamp: "garbage" }, {}];
  const sorted = items.slice().sort((a, b) => tsOf(b) - tsOf(a));
  assert.equal(sorted[0], items[1]);
  assert.equal(sorted[1], items[0]);
  assert.equal(tsOf({}), 0);
});

test("getCourtHealthScore stays within 0..100", () => {
  const { getCourtHealthScore } = load([extractFunction("getCourtHealthScore")], ["getCourtHealthScore"]);
  // No user ratings: the condition carries the score (5/5 -> 90); stadiums never drop below 92.
  assert.equal(getCourtHealthScore({ id: "x", condition: 5 }, {}, null), 90);
  assert.equal(getCourtHealthScore({ id: "x", condition: 4 }, {}, null), 72);
  assert.equal(getCourtHealthScore({ id: "x", condition: 5, status: "excellent" }, { r: { courtId: "x", status: "received" } }, null), 92);
  const many = Object.fromEntries(Array.from({ length: 10 }, (_, i) => ["r" + i, { courtId: "x", status: "received" }]));
  assert.equal(getCourtHealthScore({ id: "x", condition: 0 }, many, null), 0);
  const perfect = { a: { surface: 5, lighting: 5, equipment: 5, safety: 5 } };
  assert.ok(getCourtHealthScore({ id: "x", condition: 5 }, {}, perfect) <= 100);
});

const data = load([
  extractConst("COURTS_BASE"),
  "const COURTS_TGM = COURTS_BASE.map(c => ({ ...c, city: 'tgm' }));",
  extractConst("CITY_CFG", "{"),
  extractConst("COURTS_SIBIU")
], ["COURTS_TGM", "COURTS_SIBIU", "CITY_CFG"]);

test("court ids are unique across cities", () => {
  const ids = [...data.COURTS_TGM, ...data.COURTS_SIBIU].map(c => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("Sibiu courts are unverified or field-verified, inside the city and from OSM", () => {
  assert.ok(data.COURTS_SIBIU.length >= 30);
  for (const c of data.COURTS_SIBIU) {
    assert.equal(c.city, "sibiu");
    assert.ok(["unverified", "verified"].includes(c.status), c.id);
    if (c.status === "unverified") assert.equal(c.condition, null, c.id);
    else {
      // A score only ever comes from a team visit to a public court (tools/import_field.mjs).
      assert.ok(Number.isInteger(c.condition) && c.condition >= 1 && c.condition <= 5, c.id);
      assert.ok(c.field && /^\d{4}-\d{2}-\d{2}$/.test(c.field.visitedOn), c.id + " verified without a visit date");
      assert.equal(c.field.access, "public", c.id);
    }
    assert.ok(c.lat > 45.74 && c.lat < 45.84 && c.lng > 24.06 && c.lng < 24.22, c.id + " outside Sibiu");
    assert.match(c.osm, /^(node|way|relation)\/\d+$/);
    assert.ok(data.CITY_CFG.sibiu.hoods[c.neighbourhood], c.id + " has unknown neighbourhood " + c.neighbourhood);
    for (const l of ["ro", "en", "hu"]) assert.ok(c.desc[l]);
  }
});

test("TGM courts keep a 1-5 condition and valid status", () => {
  for (const c of data.COURTS_TGM) {
    assert.ok(c.condition >= 1 && c.condition <= 5, c.id);
    assert.ok(["degraded", "inProgress", "renovated", "excellent"].includes(c.status), c.id);
  }
});

test("UI regressions: caret, squeezed tabs, fixed min-widths, stray decorative lines", () => {
  assert.match(html, /\*\{caret-color:transparent\}/, "global caret guard missing");
  assert.match(html, /\.tabs button\{flex-shrink:0/, "tab buttons must not shrink");
  assert.doesNotMatch(html, /minWidth:\s*(3[6-9]\d|[4-9]\d\d)\b/, "inline minWidth >= 360px overflows phones");
  assert.doesNotMatch(html, /\.section-title::after/, "section-title underline came back");
  assert.doesNotMatch(html, /className: "bar"/, "caret-like logo bar came back");
});

test("map popups escape user-provided text", () => {
  for (const m of html.matchAll(/bindPopup\(`([^`]*)`\)/g)) {
    for (const expr of m[1].matchAll(/\$\{([^}]*)\}/g)) assert.match(expr[1], /^escHtml\(/, "unescaped popup value: " + expr[1]);
  }
});

test("HoopGame: bent rim gap is smaller than the ball", () => {
  const src = extractFunction("HoopGame");
  const num = name => Number(src.match(new RegExp(name + " = ([0-9.]+)"))[1]);
  assert.equal(num("BALL_R"), 0.12);
  assert.ok(/front = \{ x: back\.x - 0\.193, y: RIM_H - 0\.112 \}/.test(src));
  const gap = Math.hypot(0.193, 0.112) - 2 * num("TIP_R");
  assert.ok(gap < 2 * num("BALL_R"), "a ball must not fit through the bent rim");
});

test("no hardcoded admin password in the app", () => {
  assert.doesNotMatch(html, /ADMIN_PW|teodor2026/);
});

test("every T key in ro exists in en and hu", () => {
  const assigns = (html.match(/(?<![\w.])T\.(ro|en|hu)\.\w+\s*=\s*("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')\s*;/g) || []);
  const T = load([extractConst("T", "{"), ...assigns], ["T"]).T;
  const missing = l => Object.keys(T.ro).filter(k => !(k in T[l]));
  assert.deepEqual(missing("en"), []);
  assert.deepEqual(missing("hu"), []);
});

test("courtStatusView never calls a field-verified court renovated", () => {
  const { courtStatusView } = load([extractFunction("courtStatusView")], ["courtStatusView"]);
  const tt = { fieldVerified: "Verificat pe teren", renovated: "Renovat", unverified: "Neverificat", degraded: "Degradat" };
  const good = courtStatusView({ status: "verified", condition: 5 }, tt);
  assert.equal(good.badge, "badge-green");
  assert.match(good.label, /^Verificat pe teren · 5\/5$/);
  assert.doesNotMatch(good.label, /Renovat/);
  assert.equal(courtStatusView({ status: "verified", condition: 3 }, tt).badge, "badge-coral");
  const bad = courtStatusView({ status: "verified", condition: 2 }, tt);
  assert.equal(bad.badge, "badge-red");
  assert.equal(bad.bad, true);
  assert.equal(courtStatusView({ status: "unverified", condition: null }, tt).badge, "badge-gray");
  assert.equal(courtStatusView({ status: "renovated", condition: 5 }, tt).label, "Renovat");
});

test("check-in nodes are not extra courts; extra courts stay in their city", () => {
  const { extraCourts } = load([
    "const COURTS_ALL = [{ id: 'c1' }, { id: 'sb28' }];",
    "const ACTIVE_CITY = 'sibiu';",
    extractFunction("extraCourts")
  ], ["extraCourts"]);
  const fb = {
    sb28: { checkins: { g1: { name: "Guest" } } },
    "-new1": { name: "Teren nou", city: "sibiu" },
    "-new2": { name: "Teren vechi" },
    "-noname": { city: "sibiu" }
  };
  assert.deepEqual(Array.from(extraCourts(fb), c => c.id), ["-new1"]);
  assert.deepEqual(Array.from(extraCourts(fb, true), c => c.id), ["-new1", "-new2"]);
  assert.equal(extraCourts(null).length, 0);
});

test("submitted courts never get invented coordinates", () => {
  assert.doesNotMatch(html, /lat:\s*[\d.]+\s*\+\s*Math\.random/);
  assert.doesNotMatch(html, /lng:\s*[\d.]+\s*\+\s*Math\.random/);
});

test("every inline script in index.html parses (no smart quotes as delimiters)", () => {
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
  let m, n = 0;
  while ((m = re.exec(html))) {
    if (/type="(application\/ld\+json|module)"/.test(m[1])) continue;
    n++;
    assert.doesNotThrow(() => new Function(m[2]), "inline script #" + n + " has a syntax error");
  }
  assert.ok(n > 0);
});

test("community condition checks are not counted as open problems", () => {
  const { getCourtHealthScore } = load([extractFunction("getCourtHealthScore")], ["getCourtHealthScore"]);
  const checks = { a: { courtId: "x", status: "received", category: "condition", conditionReport: "good" } };
  assert.equal(getCourtHealthScore({ id: "x", condition: 5 }, checks, null), 90);
});

test("court pulse: no data means no signal, never an invented rhythm", () => {
  const { courtPulseModel } = load([
    extractFunction("getCourtHealthScore"), extractFunction("pulseFromScore"), extractFunction("courtPulseModel")
  ], ["courtPulseModel"]);
  assert.equal(courtPulseModel({ id: "sb1", condition: null }, {}, null).kind, "none");
  assert.equal(courtPulseModel({ id: "sb1", condition: null }, { r: { courtId: "sb2", category: "condition", conditionReport: "good" } }, null).kind, "none");
  const c = courtPulseModel({ id: "sb1", condition: null }, { r: { courtId: "sb1", category: "condition", conditionReport: "abandoned", createdAt: "2026-10-26" } }, null);
  assert.equal(c.kind, "community"); assert.equal(c.count, 1); assert.equal(c.state, "weak");
  assert.equal(courtPulseModel({ id: "c1", condition: 5 }, {}, { a: { surface: 5, lighting: 5, equipment: 5, safety: 5 } }).state, "steady");
});

test("no translation key is assigned twice (a later assignment silently overrides the first)", () => {
  for (const lang of ["ro", "en", "hu"]) {
    const keys = [...html.matchAll(new RegExp("^T\." + lang + "\.([A-Za-z0-9_]+) =", "gm"))].map(m => m[1]);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    assert.deepEqual(dupes, [], "duplicate T." + lang + " keys: " + dupes.join(", "));
  }
});

test("Sibiu after the satellite pass: every court has a score, stadiums are excellent, no 'unverified' left", () => {
  const start = html.indexOf("const SAT_VIEW = "), end = html.indexOf("const COURTS_ALL = ");
  const { COURTS_SIBIU } = load([extractConst("COURTS_SIBIU"), html.slice(start, end)], ["COURTS_SIBIU"]);
  assert.equal(COURTS_SIBIU.length, 35);
  COURTS_SIBIU.forEach(c => {
    assert.notEqual(c.status, "unverified", c.id);
    assert.ok(c.condition >= 1 && c.condition <= 5, c.id);
    assert.ok(!/neverificat|not field-verified/i.test(c.description + JSON.stringify(c.desc || {})), c.id);
  });
  const st = COURTS_SIBIU.filter(c => c.status === "excellent").map(c => c.id).sort();
  assert.equal(JSON.stringify(st), JSON.stringify(["sb21", "sb8"]));
  COURTS_SIBIU.filter(c => c.stadium).forEach(c => { assert.equal(c.condition, 5); assert.ok(/^https:\/\//.test(c.src), c.id); });
});

test("letterEvidence never carries another city's facts and labels the source of each condition", () => {
  const { letterEvidence } = load([extractConst("CITY_RO", "{"), extractFunction("aiEstimateOf"), extractFunction("letterEvidence")], ["letterEvidence"],
    { SITE: "https://example.org", getCourtHealthScore: () => 50 });
  const reports = { a: { courtId: "sb13", category: "surface", status: "received", createdAt: "2026-10-28T10:00:00Z", ai: { score: 2 } }, b: { courtId: "c6", category: "hoop", status: "received" } };
  const sat = letterEvidence({ id: "sb13", condition: 2, estimate: "sat", sat: { at: "2022-08-06" } }, reports, 7, "sibiu").join("\n");
  assert.match(sat, /Sesizări deschise pe site pentru acest teren: 1/);
  assert.match(sat, /imagini satelit: 2\/5 \(imagine din 2022-08\)/);
  assert.match(sat, /Estimare AI din 1 poză trimisă de cetățeni \(nu e o inspecție\): 2\/5/);
  assert.match(sat, /petiția From Grey to Play din Sibiu: 7/);
  assert.doesNotMatch(sat, /Târgu|Mureș|SIDU|12\/15|5 mil/);
  const stadium = letterEvidence({ id: "c11", condition: 5, status: "excellent", stadium: true }, null, null, "tgm").join("\n");
  assert.match(stadium, /stadion în stare foarte bună, conform surselor publice/);
  assert.doesNotMatch(stadium, /Semnături/);
  const unseen = letterEvidence({ id: "sb5", condition: null }, {}, 0, "sibiu").join("\n");
  assert.match(unseen, /neverificată încă pe teren/);
});
