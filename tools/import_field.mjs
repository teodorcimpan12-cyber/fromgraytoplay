// Imports Sibiu field-visit results into tools/data/courts_sibiu.json (then run inject_sibiu.mjs).
//  - reads tools/data/field_sibiu.csv (columns documented in docs/FIELD_VISIT.md)
//  - checks every row: known court id, ISO date, condition 1–5 or empty, access value, photos on disk
//  - photos: originals in field-raw/ (git-ignored, keep GPS EXIF as proof) are resized by
//    tools/resize_photos.ps1 into img/sibiu/field/ (≤ 1200 px, ≤ 300 KB, metadata stripped)
// Nothing is guessed: an empty cell stays empty. Any error stops the import and nothing is written.
// Usage: node tools/import_field.mjs [--dry-run]
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";

const DRY = process.argv.includes("--dry-run");
const root = new URL("../", import.meta.url);
const dataUrl = new URL("tools/data/courts_sibiu.json", root);
const data = JSON.parse(readFileSync(dataUrl, "utf8"));
const csv = readFileSync(new URL("tools/data/field_sibiu.csv", root), "utf8").replace(/^﻿/, "");

// Minimal RFC 4180 parser: quoted fields, "" escapes, commas or semicolons (Excel RO uses ";").
function parse(text) {
  const firstLine = text.split(/\r?\n/, 1)[0];
  const sep = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some(c => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some(c => c.trim())) rows.push(row);
  return rows;
}

const ACCESS = { public: "public", privat: "private", private: "private", "închis": "closed", inchis: "closed",
  closed: "closed", "nu există": "missing", "nu exista": "missing", missing: "missing" };
const YESNO = { da: true, yes: true, nu: false, no: false };

const [head, ...rows] = parse(csv);
const cols = head.map(h => h.trim().toLowerCase());
const need = ["id", "visited_on", "visited_by", "condition", "access"];
const missingCols = need.filter(c => !cols.includes(c));
if (missingCols.length) { console.error("field_sibiu.csv is missing columns:", missingCols.join(", ")); process.exit(1); }

const byId = Object.fromEntries(data.courts.map(c => [c.id, c]));
const errors = [], warnings = [], visits = {};
rows.forEach((r, i) => {
  const line = i + 2, v = Object.fromEntries(cols.map((c, j) => [c, (r[j] || "").trim()]));
  const err = m => errors.push(`line ${line} (${v.id || "?"}): ${m}`);
  if (!byId[v.id]) return err(`unknown court id "${v.id}"`);
  if (visits[v.id]) return err("court listed twice — keep one row per court (the latest visit)");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.visited_on) || isNaN(Date.parse(v.visited_on))) err(`visited_on must be YYYY-MM-DD, got "${v.visited_on}"`);
  else if (Date.parse(v.visited_on) > Date.now()) err("visited_on is in the future");
  if (!v.visited_by) err("visited_by is empty (initials are enough)");
  const access = ACCESS[v.access.toLowerCase()];
  if (!access) err(`access must be public / privat / închis / nu există, got "${v.access}"`);
  let condition = null;
  if (v.condition) {
    condition = Number(v.condition);
    if (!Number.isInteger(condition) || condition < 1 || condition > 5) err(`condition must be 1–5 or empty, got "${v.condition}"`);
  } else if (access === "public") warnings.push(`line ${line} (${v.id}): public court without a condition score stays "unverified"`);
  const photos = (v.photos || "").split(/[;|]/).map(s => s.trim()).filter(Boolean);
  for (const p of photos) {
    if (!/^[a-z0-9_.-]+\.jpe?g$/i.test(p)) { err(`bad photo name "${p}"`); continue; }
    const web = new URL(`img/sibiu/field/${p}`, root);
    if (!existsSync(web)) { err(`photo img/sibiu/field/${p} not found — run tools/resize_photos.ps1 first`); continue; }
    if (statSync(web).size > 300 * 1024) warnings.push(`line ${line} (${v.id}): ${p} is over 300 KB`);
  }
  visits[v.id] = {
    visited_on: v.visited_on, visited_by: v.visited_by, condition, access,
    surface: v.surface || null, lighting: v.lighting ? (YESNO[v.lighting.toLowerCase()] ?? null) : null,
    equipment: v.equipment || null, issues: v.issues || null, maintainer: v.maintainer || null,
    photos: photos.map(p => `img/sibiu/field/${p}`), notes: v.notes || null,
    source: "field visit (From Grey to Play team)"
  };
});

warnings.forEach(w => console.warn("warn:", w));
if (errors.length) { errors.forEach(e => console.error("error:", e)); console.error(`\n${errors.length} error(s) — nothing written.`); process.exit(1); }

const now = new Date().toISOString();
for (const c of data.courts) {
  if (visits[c.id]) c.field = { ...visits[c.id], imported_at: now };
}
const n = Object.keys(visits).length;
const scored = Object.values(visits).filter(v => v.condition != null && v.access === "public").length;
console.log(`${n} visit(s) read, ${scored} public court(s) with a condition score.`);
if (DRY) console.log("--dry-run: nothing written.");
else { writeFileSync(dataUrl, JSON.stringify(data, null, 2) + "\n"); console.log("updated tools/data/courts_sibiu.json — next: node tools/inject_sibiu.mjs"); }
