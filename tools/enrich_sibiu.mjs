// Builds courts_sibiu.json from tools/data/osm_sibiu.json:
//  - neighbourhood = nearest OSM place node (approximate; most Sibiu suburbs have no polygon in OSM)
//  - address via Nominatim reverse geocode (1 req/s)
//  - photos via Wikimedia Commons geosearch (200 m), free licences only, keyword-filtered
// Usage: node tools/enrich_sibiu.mjs [--dry-run] [--no-photos]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const DRY = process.argv.includes("--dry-run");
const NO_PHOTOS = process.argv.includes("--no-photos");
const UA = "FromGreyToPlay/1.0 (civic project; teodor.cimpan12@gmail.com)";
const root = new URL("../", import.meta.url);
const osm = JSON.parse(readFileSync(new URL("tools/data/osm_sibiu.json", root), "utf8"));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const now = () => new Date().toISOString();

const MERGE = {
  "Hipodrom I": "Hipodrom", "Hipodrom II": "Hipodrom", "Hipodrom III": "Hipodrom", "Hipodrom IV": "Hipodrom",
  "Ștrand II": "Ștrand", "Orașul de Sus": "Centrul Istoric", "Orașul de Jos": "Centrul Istoric",
  "Cartier Valea Aurie": "Valea Aurie", "Cartier Lazaret": "Lazaret", "CFR Triaj (Broscărie)": "Broscărie"
};
const slug = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const places = osm.places.filter(p => p.name).map(p => ({ ...p, label: MERGE[p.name] || p.name }));

function dist(a, b) {
  const R = 6371000, toR = x => x * Math.PI / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const SPORT = {
  basketball: { cat: "basketball", ro: "baschet", en: "basketball", hu: "kosárlabda" },
  soccer: { cat: "football", ro: "fotbal", en: "football", hu: "foci" },
  multi: { cat: "multiuse", ro: "multisport", en: "multi-sport", hu: "multisport" },
  volleyball: { cat: "volleyball", ro: "volei", en: "volleyball", hu: "röplabda" }
};
const SURFACE = {
  asphalt: { ro: "asfalt", en: "asphalt", hu: "aszfalt" }, concrete: { ro: "beton", en: "concrete", hu: "beton" },
  artificial_turf: { ro: "gazon artificial", en: "artificial turf", hu: "műfű" }, grass: { ro: "iarbă", en: "grass", hu: "fű" },
  tartan: { ro: "tartan", en: "tartan", hu: "tartan" }, acrylic: { ro: "acril", en: "acrylic", hu: "akril" },
  rubber: { ro: "cauciuc", en: "rubber", hu: "gumi" }, dirt: { ro: "pământ", en: "dirt", hu: "föld" },
  sand: { ro: "nisip", en: "sand", hu: "homok" }, paving_stones: { ro: "pavaj", en: "paving", hu: "térkő" }
};

function sportOf(tags) {
  const s = (tags.sport || "").split(";");
  if (s.length > 1) return SPORT.multi;
  return SPORT[s[0]] || SPORT.multi;
}

function describe(sp, tags) {
  const surf = SURFACE[tags.surface];
  const lit = tags.lit === "yes" ? { ro: "iluminat", en: "lit", hu: "világítással" } : tags.lit === "no" ? { ro: "neiluminat", en: "unlit", hu: "világítás nélkül" } : null;
  const parts = l => [surf && surf[l], lit && lit[l]].filter(Boolean).join(", ");
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  return {
    ro: cap(`teren de ${sp.ro}${parts("ro") ? ", " + parts("ro") : ""} (OpenStreetMap, neverificat pe teren).`),
    en: cap(`${sp.en} court${parts("en") ? ", " + parts("en") : ""} (OpenStreetMap, not field-verified).`),
    // TODO: HU review
    hu: cap(`${sp.hu}pálya${parts("hu") ? ", " + parts("hu") : ""} (OpenStreetMap, helyszínen nem ellenőrzött).`)
  };
}

async function reverse(lat, lng) {
  const u = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lng}`;
  const r = await fetch(u, { headers: { "User-Agent": UA, "Accept-Language": "ro" } });
  if (!r.ok) return null;
  const j = await r.json();
  const a = j.address || {};
  const street = [a.road, a.house_number].filter(Boolean).join(" ");
  return { value: street ? street + ", Sibiu" : (j.display_name || "").split(",").slice(0, 2).join(",").trim(), source_url: u, retrieved_at: now(), confidence: street ? "medium" : "low" };
}

const FREE = /^(cc0|public domain|pd|cc by(-sa)? [0-9.]+|cc by(-sa)?)/i;
const KEYWORDS = /(teren|court|baschet|basket|fotbal|soccer|football|pitch|sport|stadion|stadium|minifotbal|multisport)/i;
async function commonsPhoto(lat, lng) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=geosearch&ggsnamespace=6&ggsradius=200&ggslimit=20&ggscoord=${lat}|${lng}&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1200`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) return { candidates: 0 };
  const j = await r.json();
  const pages = Object.values(j.query?.pages || {});
  for (const p of pages) {
    const ii = p.imageinfo?.[0]; if (!ii) continue;
    const md = ii.extmetadata || {};
    const lic = (md.LicenseShortName?.value || "").trim();
    const text = p.title + " " + (md.ImageDescription?.value || "") + " " + (md.Categories?.value || "");
    if (!FREE.test(lic) || !KEYWORDS.test(text)) continue;
    return {
      candidates: pages.length,
      photo: {
        file: p.title, thumb: ii.thumburl || ii.url, page: ii.descriptionurl, license: lic,
        license_url: md.LicenseUrl?.value || null,
        author: (md.Artist?.value || "").replace(/<[^>]+>/g, "").trim() || "unknown",
        retrieved_at: now()
      }
    };
  }
  return { candidates: pages.length };
}

const courts = [], report = [], attribution = [], nameCount = {};
mkdirSync(new URL("img/sibiu/", root), { recursive: true });
let n = 0;
for (const p of osm.pitches) {
  n++;
  const id = "sb" + n;
  const sp = sportOf(p.tags);
  const near = places.map(pl => ({ pl, d: dist(p, pl) })).sort((a, b) => a.d - b.d)[0];
  const hoodLabel = near.pl.label;
  const addr = DRY ? null : await reverse(p.lat, p.lng);
  if (!DRY) await sleep(1100);
  let ph = { candidates: 0 };
  if (!DRY && !NO_PHOTOS) { ph = await commonsPhoto(p.lat, p.lng); await sleep(300); }
  let img = null;
  if (ph.photo) {
    const r = await fetch(ph.photo.thumb, { headers: { "User-Agent": UA } });
    const buf = Buffer.from(await r.arrayBuffer());
    if (r.ok && buf.length <= 300 * 1024) {
      img = `img/sibiu/${id}.jpg`;
      writeFileSync(new URL(img, root), buf);
      attribution.push({ id, ...ph.photo, local: img, bytes: buf.length });
    }
  }
  const base = p.tags.name || `Teren ${sp.ro} — ${hoodLabel}`;
  nameCount[base] = (nameCount[base] || 0) + 1;
  const name = nameCount[base] > 1 ? `${base} ${nameCount[base]}` : base;
  courts.push({
    id, city: "sibiu", name,
    address: addr ? addr.value : "Sibiu",
    lat: p.lat, lng: p.lng,
    status: "unverified", condition: null, occupancy: "unknown", progress: 0, reports: 0,
    neighbourhood: slug(hoodLabel), neighbourhoodLabel: hoodLabel,
    category: sp.cat,
    accessibility: { wheelchair: p.tags.wheelchair === "yes", lighting: p.tags.lit === "yes", parking: false, flatSurface: false },
    description: describe(sp, p.tags),
    img,
    sources: {
      osm: { value: p.osm, source_url: "https://www.openstreetmap.org/" + p.osm, retrieved_at: osm.retrieved_at, confidence: "high" },
      address: addr,
      neighbourhood: { value: hoodLabel, method: "nearest OSM place node", distance_m: Math.round(near.d), confidence: near.d < 600 ? "medium" : "low" },
      photo: ph.photo ? { value: img, source_url: ph.photo.page, license: ph.photo.license, confidence: "low" } : null
    }
  });
  report.push(`| ${id} | ${name} | ${sp.ro} | ${hoodLabel} (${Math.round(near.d)} m) | ${addr ? addr.value : "—"} | ${p.tags.surface || "?"} | ${p.tags.lit || "?"} | ${img ? "✅ " + ph.photo.license : ph.candidates ? `— (${ph.candidates} foto în zonă, niciuna cu teren)` : "—"} | [${p.osm}](https://www.openstreetmap.org/${p.osm}) |`);
  process.stdout.write(`${id} `);
}

const hoods = [...new Map(courts.map(c => [c.neighbourhood, c.neighbourhoodLabel])).entries()];
writeFileSync(new URL("tools/data/courts_sibiu.json", root), JSON.stringify({ generated_at: now(), license: "Data © OpenStreetMap contributors, ODbL 1.0", courts, neighbourhoods: Object.fromEntries(hoods) }, null, 2));
writeFileSync(new URL("img/sibiu/ATTRIBUTION.json", root), JSON.stringify(attribution, null, 2));
writeFileSync(new URL("tools/REPORT.md", root), `# Sibiu — raport îmbogățire date

Generat: ${now()} · Sursă: OpenStreetMap (ODbL), Nominatim, Wikimedia Commons.
Toate terenurile sunt **NEVERIFICATE** până la vizita pe teren. Cartierul e atribuit
**aproximativ** (cel mai apropiat centru de cartier din OSM — în OSM cartierele Sibiului
sunt puncte, nu poligoane). Verifică coloana „Cartier" înainte de prezentare.

Terenuri: ${courts.length} · Cu foto liberă: ${attribution.length} · Cartiere folosite: ${hoods.length}

| ID | Nume | Sport | Cartier (dist.) | Adresă (Nominatim) | Suprafață | Iluminat | Foto | OSM |
|---|---|---|---|---|---|---|---|---|
${report.join("\n")}

## Ce rămâne NEVERIFICAT
- Starea fizică (condiție 1–5), program, acces efectiv — necesită vizită pe teren.
- Numele: unde OSM nu are \`name\`, numele e generat („Teren {sport} — {cartier}").
- Fotografii Mapillary: sărite (necesită token în \`.env\`, rulează cu MAPILLARY_TOKEN).
`);
console.log("\ncourts", courts.length, "photos", attribution.length, "hoods", hoods.length);
