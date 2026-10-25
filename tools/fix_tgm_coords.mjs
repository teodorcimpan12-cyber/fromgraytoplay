// Proposes corrected coordinates for Târgu Mureș courts:
//  1. geocode name / address with Nominatim (1 req/s),
//  2. snap to the nearest OSM pitch of a matching sport within 300 m of that point.
// High-confidence matches are written to tools/data/tgm_coords_fix.json (applied by --apply).
// Usage: node tools/check_tgm_coords.mjs && node tools/fix_tgm_coords.mjs [--apply]
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const UA = "FromGreyToPlay/1.0 (civic project; teodor.cimpan12@gmail.com)";
const match = JSON.parse(readFileSync(new URL("tools/data/tgm_osm_match.json", root), "utf8"));
const BBOX = "46.50,24.48,46.59,24.62";
const q = `[out:json][timeout:60];(nwr["leisure"~"pitch|sports_centre|stadium|fitness_centre"](${BBOX}););out center tags;`;
const els = (await (await fetch("https://overpass-api.de/api/interpreter", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA }, body: "data=" + encodeURIComponent(q) })).json()).elements;
const feats = els.map(e => ({ osm: e.type + "/" + e.id, lat: e.lat ?? e.center?.lat, lng: e.lon ?? e.center?.lon, leisure: e.tags?.leisure, sport: e.tags?.sport || "", name: e.tags?.name || "" })).filter(f => f.lat);
const pitches = feats.filter(f => f.leisure === "pitch");
const dist = (a, b) => { const R = 6371000, r = x => x * Math.PI / 180; const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const SPORT = { basketball: /basket/, football: /soccer|football/, multiuse: /multi|basket|soccer|handball|volley/, tennis: /tennis/, handball: /handball|multi/, volleyball: /volley|multi/ };
const html = readFileSync(new URL("index.html", root), "utf8");
const addrOf = id => { const m = html.match(new RegExp('id: "' + id + '",\\s*name: "[^"]*",\\s*address: "([^"]*)"')); return m ? m[1] : ""; };
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

async function geocode(text) {
  const u = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&countrycodes=ro&viewbox=24.48,46.59,24.62,46.50&bounded=1&q=" + encodeURIComponent(text);
  const r = await fetch(u, { headers: { "User-Agent": UA, "Accept-Language": "ro" } });
  await new Promise(res => setTimeout(res, 1100));
  return r.ok ? (await r.json()).map(x => ({ lat: +x.lat, lng: +x.lon, label: x.display_name.split(",").slice(0, 2).join(","), type: x.type })) : [];
}

const rows = [];
for (const c of match.courts) {
  const re = SPORT[c.category] || /./;
  const brand = c.name.split(" — ")[0];
  const STOP = new Set(["teren", "terenuri", "baza", "sportiva", "sport", "sporturilor", "baschet", "fotbal", "tenis", "multisport", "multifunctional", "complex", "cartier", "mic", "str", "strada", "zona", "sala", "scolar", "club", "center", "centre", "fitness", "aleea", "bulevardul", "platoul", "stadionul", "de", "si"]);
  const tokens = norm(brand).replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
  const named = tokens.length ? feats.filter(f => f.name && tokens.every(w => norm(f.name).includes(w))) : [];
  const addr = addrOf(c.id);
  const anchors = [];
  for (const f of named) anchors.push({ lat: f.lat, lng: f.lng, via: "OSM name: " + f.name, radius: 300 });
  if (!anchors.length && addr && /\d/.test(addr)) for (const g of (await geocode(addr.replace(/^Str\.\s*/i, "Strada ") + ", Târgu Mureș")).filter(g => g.type === "house" || g.type === "building" || g.type === "residential" || g.type === "yes")) anchors.push({ ...g, via: "Nominatim address: " + g.label, radius: 150 });
  let best = null;
  for (const a of anchors) {
    const near = pitches.filter(p => re.test(p.sport)).map(p => ({ ...p, d: dist(a, p) })).sort((x, y) => x.d - y.d)[0];
    if (near && near.d <= a.radius && (!best || near.d < best.pitch.d)) best = { anchor: a, pitch: near };
  }
  const moved = best ? Math.round(dist(c, best.pitch)) : null;
  rows.push({ id: c.id, name: c.name, address: addr, old: { lat: c.lat, lng: c.lng }, confident: !!best, new: best ? { lat: +best.pitch.lat.toFixed(6), lng: +best.pitch.lng.toFixed(6) } : null, osm: best ? best.pitch.osm : null, via: best ? best.anchor.via : (anchors[0] ? anchors[0].via + " (no matching pitch ≤300 m)" : "not found"), moved_m: moved });
  console.log(c.id.padEnd(4), best ? ("✓ move " + moved + " m → " + best.pitch.osm) : "✗ keep", "|", c.name.slice(0, 40), "|", (best ? best.anchor.via : rows[rows.length - 1].via).slice(0, 70));
}
writeFileSync(new URL("tools/data/tgm_coords_fix.json", root), JSON.stringify(rows, null, 2));

if (process.argv.includes("--apply")) {
  let out = html, n = 0;
  for (const r of rows.filter(r => r.confident)) {
    const re = new RegExp('(id: "' + r.id + '",[\\s\\S]*?lat: )[-0-9.]+(, lng: )[-0-9.]+');
    if (re.test(out)) { out = out.replace(re, `$1${r.new.lat}$2${r.new.lng}`); n++; }
  }
  writeFileSync(new URL("index.html", root), out);
  console.log("applied", n);
}
