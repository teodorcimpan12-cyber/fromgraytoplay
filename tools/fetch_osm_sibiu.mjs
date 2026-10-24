// Pulls public sports pitches + neighbourhood centroids for Sibiu from OpenStreetMap (Overpass).
// Output: tools/data/osm_sibiu.json. Data © OpenStreetMap contributors, ODbL.
import { writeFileSync, mkdirSync } from "node:fs";

const BBOX = "45.745,24.060,45.835,24.215";
const query = `
[out:json][timeout:60];
(
  nwr["leisure"="pitch"]["sport"~"^(basketball|soccer|multi|handball|volleyball|futsal|streetball)$|basketball|soccer"](${BBOX});
);
out center tags;
(
  nwr["place"~"^(suburb|neighbourhood|quarter)$"](${BBOX});
);
out center tags;
`;

const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "FromGreyToPlay/1.0 (civic project; teodor.cimpan12@gmail.com)" },
  body: "data=" + encodeURIComponent(query)
});
if (!res.ok) throw new Error("Overpass HTTP " + res.status);
const json = await res.json();

const pitches = [], places = [];
for (const el of json.elements) {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon;
  if (lat == null) continue;
  if (tags.leisure === "pitch") {
    if (["private", "no", "customers"].includes(tags.access)) continue;
    pitches.push({ osm: `${el.type}/${el.id}`, lat: +lat.toFixed(6), lng: +lng.toFixed(6), tags });
  } else if (tags.place) {
    places.push({ osm: `${el.type}/${el.id}`, name: tags.name, place: tags.place, lat, lng });
  }
}
mkdirSync(new URL("./data/", import.meta.url), { recursive: true });
writeFileSync(new URL("./data/osm_sibiu.json", import.meta.url),
  JSON.stringify({ retrieved_at: new Date().toISOString(), source: "https://www.openstreetmap.org (ODbL)", bbox: BBOX, pitches, places }, null, 2));
console.log("pitches", pitches.length, "places", places.length);
console.log("sports", Object.entries(pitches.reduce((a, p) => (a[p.tags.sport] = (a[p.tags.sport] || 0) + 1, a), {})));
console.log("places", places.map(p => p.name + ":" + p.place).join(" | "));
