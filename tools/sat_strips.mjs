// Renders one satellite timeline strip per Sibiu court: every dated Esri Wayback capture, 110 m wide,
// centred on the court, OSM outline dashed. Same framing as tools/sat-review.html.
// Output: tools/.cache/strips/{id}.png (git-ignored; tiles cached in tools/.cache/tiles/).
// Used by tools/sat_ai_review.mjs and for pitch visuals (credit: Esri World Imagery Wayback; © OSM contributors).
// Windows only (composition uses .NET via tools/sat_compose.ps1).
// Usage: node tools/sat_strips.mjs [sb13 sb22 …]   (default: all courts)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url);
const WB = "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/";
const UA = "FromGreyToPlay/1.0 (civic project; teodor.cimpan12@gmail.com)";
const BOX_M = 110, SIZE = 320;
const caps = JSON.parse(readFileSync(new URL("data/timemachine.json", root), "utf8")).courts;
const polys = JSON.parse(readFileSync(new URL("tools/data/sibiu_court_polygons.json", root), "utf8"));
const courts = JSON.parse(readFileSync(new URL("tools/data/courts_sibiu.json", root), "utf8")).courts;
const want = process.argv.slice(2);
const tilesDir = new URL("tools/.cache/tiles/", root), outDir = new URL("tools/.cache/strips/", root);
mkdirSync(tilesDir, { recursive: true }); mkdirSync(outDir, { recursive: true });

const px = (lat, lng, z) => {
  const n = 256 * 2 ** z, s = Math.sin(lat * Math.PI / 180);
  return [(lng + 180) / 360 * n, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n];
};
const mpp = (lat, z) => 156543.03392 * Math.cos(lat * Math.PI / 180) / 2 ** z;

async function tile(r, z, x, y) {
  const f = new URL(`${r}_${z}_${y}_${x}.jpg`, tilesDir);
  if (!existsSync(f)) {
    const res = await fetch(`${WB}${r}/${z}/${y}/${x}`, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    writeFileSync(f, Buffer.from(await res.arrayBuffer()));
  }
  return fileURLToPath(f);
}

const plan = { size: SIZE, box_m: BOX_M, courts: [] };
for (const c of courts) {
  if (want.length && !want.includes(c.id)) continue;
  const p = polys[c.id];
  const [la, lo] = p ? [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length] : [c.lat, c.lng];
  const frames = [];
  for (const cap of caps[c.id] || []) {
    const z = cap.z, half = BOX_M / 2 / mpp(la, z), [cx, cy] = px(la, lo, z), x0 = cx - half, y0 = cy - half, scale = SIZE / (2 * half);
    const tiles = [];
    for (let tx = Math.floor(x0 / 256); tx <= Math.floor((x0 + 2 * half) / 256); tx++)
      for (let ty = Math.floor(y0 / 256); ty <= Math.floor((y0 + 2 * half) / 256); ty++)
        tiles.push({ file: await tile(cap.r, z, tx, ty), dx: tx * 256 - x0, dy: ty * 256 - y0 });
    const outline = (p || []).map(([a, b]) => { const [X, Y] = px(a, b, z); return [(X - x0) * scale, (Y - y0) * scale]; });
    frames.push({ date: cap.date, res: cap.res, scale, tiles, outline });
  }
  plan.courts.push({ id: c.id, approxOutline: !p, frames });
  process.stdout.write(c.id + " ");
}
writeFileSync(new URL("plan.json", outDir), JSON.stringify(plan));
const r = spawnSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", fileURLToPath(new URL("tools/sat_compose.ps1", root)), "-Dir", fileURLToPath(outDir)], { encoding: "utf8" });
if (r.status !== 0) { console.error("\ncompose failed:", r.stderr || r.stdout); process.exit(1); }
console.log(`\n${plan.courts.length} strip(s) in tools/.cache/strips/`);
