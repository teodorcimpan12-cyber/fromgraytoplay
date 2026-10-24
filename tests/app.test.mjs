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
  assert.equal(getCourtHealthScore({ id: "x", condition: 5 }, {}, null), 40);
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

test("Sibiu courts are unverified, inside the city and from OSM", () => {
  assert.ok(data.COURTS_SIBIU.length >= 30);
  for (const c of data.COURTS_SIBIU) {
    assert.equal(c.city, "sibiu");
    assert.equal(c.status, "unverified");
    assert.equal(c.condition, null);
    assert.ok(c.lat > 45.74 && c.lat < 45.84 && c.lng > 24.06 && c.lng < 24.22, c.id + " outside Sibiu");
    assert.match(c.osm, /^(node|way|relation)\/\d+$/);
    assert.ok(data.CITY_CFG.sibiu.hoods[c.neighbourhood], c.id + " has unknown neighbourhood " + c.neighbourhood);
    for (const l of ["ro", "en", "hu"]) assert.ok(c.desc[l]);
  }
});

test("TGM courts keep a 1-5 condition and valid status", () => {
  for (const c of data.COURTS_TGM) {
    assert.ok(c.condition >= 1 && c.condition <= 5, c.id);
    assert.ok(["degraded", "inProgress", "renovated"].includes(c.status), c.id);
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
