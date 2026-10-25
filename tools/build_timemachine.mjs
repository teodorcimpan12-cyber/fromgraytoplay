// Precomputes, for every court, the distinct real satellite captures available in Esri Wayback.
// Walks back through releases with the tilemap endpoint (z17), reads capture metadata
// (date, resolution, provider, sensor), checks z18 availability, dedupes by capture date.
// Output: data/timemachine.json  { courtId: [{ r, date, res, provider, sensor, z }] } (oldest → newest)
// Usage: node tools/fetch_wayback.mjs && node tools/build_timemachine.mjs
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const { releases } = JSON.parse(readFileSync(new URL("data/wayback.json", root), "utf8"));
const html = readFileSync(new URL("index.html", root), "utf8");
function grab(name) {
  const at = html.indexOf("const " + name + " = [");
  let i = html.indexOf("[", at), depth = 0, q = null;
  for (; i < html.length; i++) {
    const c = html[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if (c === "[") depth++;
    else if (c === "]" && --depth === 0) break;
  }
  return vm.runInNewContext("(" + html.slice(html.indexOf("[", at), i + 1) + ")");
}
const courts = [...grab("COURTS_BASE"), ...grab("COURTS_SIBIU")];
const byId = new Map(releases.map((r, i) => [r.id, i]));
const BASE = "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tilemap/";

async function j(url, tries = 3) {
  for (let k = 0; k < tries; k++) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch (e) {}
    await new Promise(r => setTimeout(r, 600 * (k + 1)));
  }
  return null;
}
function tileXY(lat, lng, z) {
  const n = 2 ** z;
  return { x: Math.floor((lng + 180) / 360 * n), y: Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n) };
}
async function capturesFor(c) {
  const { x, y } = tileXY(c.lat, c.lng, 17);
  const z18 = tileXY(c.lat, c.lng, 18);
  const rels = [];
  let idx = releases.length - 1;
  for (let guard = 0; idx >= 0 && guard < 40; guard++) {
    const t = await j(`${BASE}${releases[idx].id}/17/${y}/${x}/1/1`);
    if (!t || !t.data || !t.data[0]) break;
    const srcIdx = byId.has(t.select && t.select[0]) ? byId.get(t.select[0]) : idx;
    rels.push(releases[srcIdx]);
    idx = srcIdx - 1;
  }
  const metas = await Promise.all(rels.map(async rel => {
    const lat = c.lat, lng = c.lng;
    const m = await j(`${rel.md}/identify?f=json&geometry=${lng},${lat}&geometryType=esriGeometryPoint&sr=4326&layers=all&tolerance=0&mapExtent=${lng - 0.001},${lat - 0.001},${lng + 0.001},${lat + 0.001}&imageDisplay=100,100,96&returnGeometry=false`);
    const best = ((m && m.results) || []).map(r => r.attributes).filter(a => a.SRC_DATE).sort((a, b) => (+a.SRC_RES || 99) - (+b.SRC_RES || 99))[0];
    const t18 = await j(`${BASE}${rel.id}/18/${z18.y}/${z18.x}/1/1`);
    const native18 = !!(t18 && t18.data && t18.data[0] && (t18.select ? t18.select[0] === rel.id || byId.get(t18.select[0]) <= byId.get(rel.id) : true));
    if (!best) return null;
    const d = String(best.SRC_DATE);
    return { r: rel.id, date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, res: Math.round(+best.SRC_RES * 100) / 100, provider: best.NICE_DESC || "", sensor: best.SRC_DESC || "", z: native18 ? 18 : 17 };
  }));
  const byDate = new Map();
  for (const m of metas) if (m && !byDate.has(m.date)) byDate.set(m.date, m); // rels are newest-first: keep newest release per capture date
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

const out = {}, queue = courts.slice();
let done = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const c = queue.shift();
    out[c.id] = await capturesFor(c);
    done++;
    process.stdout.write(`${c.id}:${out[c.id].length} `);
  }
}));
writeFileSync(new URL("data/timemachine.json", root), JSON.stringify({ source: "Esri World Imagery Wayback", built_at: new Date().toISOString(), courts: out }));
const counts = Object.values(out).map(a => a.length);
console.log(`\ncourts ${done}, captures min ${Math.min(...counts)} max ${Math.max(...counts)}, empty ${counts.filter(n => !n).length}`);
