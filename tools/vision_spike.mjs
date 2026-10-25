// THROWAWAY spike for the 6 Nov "AI Court Doctor": does a vision model score courts the way the team does?
// Sends each field photo to the Claude API, asks for a strict JSON diagnosis, and compares the AI's 1–5
// with the condition the team wrote in tools/data/field_sibiu.csv. Not part of the app — nothing is written
// to the site or to Firebase. Run it on the team's own photos before the event, then decide.
//
// Usage:  ANTHROPIC_API_KEY=... node tools/vision_spike.mjs [photo-dir]      (default: img/sibiu/field)
//   PowerShell: $env:ANTHROPIC_API_KEY = "..."; node tools/vision_spike.mjs
// The key stays in your shell — never put it in a file in this repo.
import { readFileSync, readdirSync, existsSync } from "node:fs";

const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY) { console.error("Set ANTHROPIC_API_KEY in your shell first (see the header of this file)."); process.exit(1); }
const root = new URL("../", import.meta.url);
const dir = new URL((process.argv[2] || "img/sibiu/field").replace(/\\/g, "/").replace(/\/?$/, "/"), root);
if (!existsSync(dir)) { console.error("Photo folder not found:", dir.pathname); process.exit(1); }

// Team scores from the field CSV (same file tools/import_field.mjs reads), keyed by court id.
const team = {};
try {
  const lines = readFileSync(new URL("tools/data/field_sibiu.csv", root), "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
  const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ";" : ",";
  const cols = lines[0].split(sep).map(s => s.trim().toLowerCase());
  for (const l of lines.slice(1)) {
    const v = l.split(sep), id = v[cols.indexOf("id")], c = Number(v[cols.indexOf("condition")]);
    if (id && c >= 1 && c <= 5) team[id.trim()] = c;
  }
} catch (e) { /* no CSV yet — the spike still prints the AI scores */ }

const SCHEMA = {
  type: "object",
  properties: {
    is_sports_court: { type: "boolean" },
    condition: { type: "integer" },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["cracks", "rim", "net", "lines", "lighting", "drainage", "graffiti", "other"] },
          severity: { type: "integer" },
          note: { type: "string" }
        },
        required: ["type", "severity", "note"],
        additionalProperties: false
      }
    },
    confidence: { type: "number" }
  },
  required: ["is_sports_court", "condition", "issues", "confidence"],
  additionalProperties: false
};

const PROMPT = `You are assessing the physical condition of a public outdoor sports court from one photo, for a civic
map that tells residents and City Hall which courts need repair.

Score "condition" on this exact scale (the field team uses the same one):
5 = like new: intact surface, complete equipment, visible markings
4 = good: minor wear, everything works
3 = usable: cracks, faded markings, one element missing or broken
2 = degraded: large cracks or uneven surface, bent or missing equipment, unsafe in places
1 = unusable: destroyed, no equipment, effectively closed

List each visible problem in "issues" (severity 1 = cosmetic, 2 = limits play, 3 = safety risk; note ≤ 120 characters).
Only report what is visible in the photo; if part of the court is out of frame, lower "confidence" rather than guessing.
Set "is_sports_court" to false if the photo does not show a sports court (then use condition 1, no issues, confidence 0).
"confidence" is 0 to 1.`;

async function diagnose(file) {
  const data = readFileSync(new URL(file, dir)).toString("base64");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": KEY,
      "anthropic-version": "2026-10-21",
      "anthropic-beta": "server-side-fallback-2026-07-01"
    },
    body: JSON.stringify({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      fallbacks: "default", // a false-positive safety decline is retried on another model instead of failing
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data } },
          { type: "text", text: PROMPT }
        ]
      }]
    })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.error ? body.error.message : JSON.stringify(body)}`);
  if (body.stop_reason === "refusal") throw new Error("declined" + (body.stop_details ? ` (${body.stop_details.category})` : ""));
  if (body.stop_reason === "max_tokens") throw new Error("hit max_tokens");
  const text = body.content.find(b => b.type === "text");
  const out = JSON.parse(text.text);
  // The schema can't express ranges, so check them here — a value out of range is a failed diagnosis.
  if (!Number.isInteger(out.condition) || out.condition < 1 || out.condition > 5) throw new Error("condition out of range: " + out.condition);
  if (!(out.confidence >= 0 && out.confidence <= 1)) throw new Error("confidence out of range: " + out.confidence);
  return { ...out, usage: body.usage };
}

const files = readdirSync(dir).filter(f => /\.jpe?g$/i.test(f)).sort();
if (!files.length) { console.error("No .jpg photos in", dir.pathname); process.exit(1); }
console.log(`Diagnosing ${files.length} photo(s) with claude-opus-5-5…\n`);
const rows = [];
for (const f of files) {
  const id = (f.match(/(sb\d+)/i) || [])[1];
  try {
    const d = await diagnose(f);
    const t = id && team[id.toLowerCase()];
    rows.push({ f, id, t, d });
    console.log(`${f.padEnd(22)} court=${d.is_sports_court ? "yes" : "NO "} AI=${d.condition}/5 team=${t ? t + "/5" : "—"} conf=${d.confidence.toFixed(2)} issues=${d.issues.map(i => i.type + ":" + i.severity).join(",") || "none"}`);
  } catch (e) {
    console.log(`${f.padEnd(22)} ERROR ${e.message}`);
  }
}

// Agreement with the field team, per court (photos of the same court are averaged).
const byCourt = {};
for (const r of rows) if (r.id && r.t && r.d.is_sports_court) (byCourt[r.id] = byCourt[r.id] || { t: r.t, ai: [] }).ai.push(r.d.condition);
const pairs = Object.entries(byCourt).map(([id, v]) => ({ id, t: v.t, ai: v.ai.reduce((a, b) => a + b, 0) / v.ai.length }));
if (pairs.length) {
  const mae = pairs.reduce((s, p) => s + Math.abs(p.ai - p.t), 0) / pairs.length;
  const within1 = pairs.filter(p => Math.abs(p.ai - p.t) <= 1).length;
  console.log(`\nCourts compared with the field team: ${pairs.length}`);
  console.log(`Mean absolute difference: ${mae.toFixed(2)} points · within ±1 point: ${within1}/${pairs.length}`);
  console.log("Rule of thumb for the 6 Nov decision: ≤ 0.75 average and most courts within ±1 → keep Court Doctor;");
  console.log("otherwise ship Letter v2 and show the AI only as a labelled estimate, or not at all.");
} else console.log("\nNo field scores to compare with yet (fill tools/data/field_sibiu.csv after the visits).");
