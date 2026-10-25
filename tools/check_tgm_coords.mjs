// Compares each hand-entered Târgu Mureș court with the nearest OSM sports pitch.
// Output: tools/data/tgm_osm_match.json + console table. Does not modify index.html.
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", root), "utf8");
const at = html.indexOf("const COURTS_BASE = [");
let i = html.indexOf("[", at), depth = 0, q = null;
for (; i < html.length; i++) {
  const c = html[i];
  if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
  if (c === '"' || c === "'" || c === "`") q = c; else if (c === "[") depth++; else if (c === "]" && --depth === 0) break;
}
const courts = vm.runInNewContext("(" + html.slice(html.indexOf("[", at), i + 1) + ")");

const BBOX = "46.50,24.48,46.59,24.62";
const query = `[out:json][timeout:60];(nwr["leisure"="pitch"](${BBOX}););out center tags;`;
const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "FromGreyToPlay/1.0" }, body: "data=" + encodeURIComponent(query) });
const pitches = (await res.json()).elements.map(e => ({ osm: e.type + "/" + e.id, lat: e.lat ?? e.center?.lat, lng: e.lon ?? e.center?.lon, sport: e.tags?.sport || "?", name: e.tags?.name || "" })).filter(p => p.lat);
const dist = (a, b) => { const R = 6371000, r = x => x * Math.PI / 180; const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const SPORT = { basketball: /basket/, football: /soccer|football/, multiuse: /multi|basket|soccer|handball|volley/, tennis: /tennis/, handball: /handball|multi/, volleyball: /volley|multi/ };
const out = courts.map(c => {
  const re = SPORT[c.category] || /./;
  const ranked = pitches.map(p => ({ ...p, d: dist(c, p) })).sort((a, b) => a.d - b.d);
  const best = ranked.find(p => re.test(p.sport)) || ranked[0];
  return { id: c.id, name: c.name, category: c.category, lat: c.lat, lng: c.lng, nearest: best && { osm: best.osm, sport: best.sport, name: best.name, d: Math.round(best.d), lat: best.lat, lng: best.lng } };
});
writeFileSync(new URL("tools/data/tgm_osm_match.json", root), JSON.stringify({ retrieved_at: new Date().toISOString(), pitches: pitches.length, courts: out }, null, 2));
console.log("OSM pitches in TGM:", pitches.length);
for (const o of out) console.log(o.id.padEnd(4), String(o.nearest?.d ?? "-").padStart(5) + " m", (o.nearest?.sport || "").padEnd(18), o.name.slice(0, 44), "| OSM:", o.nearest?.name || "");
