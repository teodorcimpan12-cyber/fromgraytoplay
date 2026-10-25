// Vendors the Esri World Imagery Wayback release list (the config file has no CORS header,
// so the browser cannot read it directly). Output: data/wayback.json, sorted oldest → newest.
// Usage: node tools/fetch_wayback.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const res = await fetch("https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json");
if (!res.ok) throw new Error("wayback config HTTP " + res.status);
const cfg = await res.json();
const releases = Object.entries(cfg).map(([id, r]) => ({
  id: +id,
  date: (r.itemTitle.match(/\d{4}-\d{2}-\d{2}/) || [""])[0],
  md: r.metadataLayerUrl
})).filter(r => r.date).sort((a, b) => a.date.localeCompare(b.date));
mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../data/wayback.json", import.meta.url), JSON.stringify({
  source: "Esri World Imagery Wayback — https://livingatlas.arcgis.com/wayback/",
  retrieved_at: new Date().toISOString(),
  releases
}));
console.log("releases", releases.length, releases[0].date, "→", releases[releases.length - 1].date);
