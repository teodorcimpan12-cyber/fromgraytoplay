// AI as an extra, blind reviewer for the Sibiu satellite audit. It answers exactly the questions the team answers
// in tools/sat-review.html, from the same timeline strips, and is saved in the same format — so
// tools/sat_merge.mjs can measure how often it agrees with the humans. It never decides anything:
// sat_merge.mjs excludes reviewers named "AI …" from every consensus.
//
// Before running: check that Esri's terms allow sending World Imagery captures to an AI model for analysis.
// Usage: node tools/sat_strips.mjs && ANTHROPIC_API_KEY=... node tools/sat_ai_review.mjs [sb13 sb22 …]
//   PowerShell: $env:ANTHROPIC_API_KEY = "..."; node tools/sat_ai_review.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY) { console.error("Set ANTHROPIC_API_KEY in your shell first (never in a file in this repo)."); process.exit(1); }
const root = new URL("../", import.meta.url);
const MODEL = "claude-opus-5-5", REVIEWER = "AI Claude Opus 5.5";
const plan = JSON.parse(readFileSync(new URL("tools/.cache/strips/plan.json", root), "utf8"));
const want = process.argv.slice(2);
const outDir = new URL("tools/data/sat_reviews/", root);
mkdirSync(outDir, { recursive: true });
const outFile = new URL("ai-claude-opus-5-5.json", outDir);
const prev = existsSync(outFile) ? JSON.parse(readFileSync(outFile, "utf8")).reviews : {};

const ENUM = (...v) => ({ type: "string", enum: v });
const SCHEMA = {
  type: "object",
  properties: {
    timeline: { type: "array", items: { type: "object", properties: { frame: { type: "integer" }, court_visible: ENUM("yes", "no", "unsure") }, required: ["frame", "court_visible"], additionalProperties: false } },
    visible: ENUM("yes", "partly", "no", "unsure"),
    surface: ENUM("uniform", "patchy", "overgrown", "unsure"),
    markings: ENUM("clear", "faint", "none", "unsure"),
    since_frame: { type: "integer" },
    change: ENUM("none", "resurfaced", "built", "degraded", "construction", "removed", "other", "unsure"),
    confidence: { type: "integer" },
    notes: { type: "string" }
  },
  required: ["timeline", "visible", "surface", "markings", "since_frame", "change", "confidence", "notes"],
  additionalProperties: false
};

function prompt(frames) {
  return `This image is a strip of ${frames.length} satellite photos of the same spot in a city, oldest on the left, numbered 1–${frames.length}
with their capture dates (${frames.map((f, i) => `${i + 1} = ${f.date}`).join(", ")}). Each frame is 110 m wide, centred on where
OpenStreetMap says a public outdoor sports court is; the dashed yellow outline is that mapped position. Older frames can be shifted
a few metres, so judge by what you see, not by the outline.

Answer as a careful human reviewer would, from what is visible only:
- timeline: for every frame, is an outdoor sports court (marked or clearly laid-out paved/turf playing area) visible at that spot?
- visible: in the newest frame, is the court there? "partly" = hidden by shadow/trees; "no" = something else is there (grass, building, construction, parking).
- surface (newest frame): uniform, patchy (patches/cracks/areas of different colour), overgrown, or unsure.
- markings (newest frame): clear, faint, none, unsure.
- since_frame: the earliest frame in which the spot already looks as it does in the newest frame (1 if it looks the same throughout).
- change: what changed before since_frame — none, resurfaced, built, degraded, construction, removed, other, unsure.
- confidence: 1 low, 2 medium, 3 high. notes: one or two sentences on what you saw (≤ 300 characters).
Use "unsure" whenever the resolution does not let you tell. A wrong confident answer is worse than "unsure".`;
}

async function review(court) {
  const data = readFileSync(new URL(`tools/.cache/strips/${court.id}.png`, root)).toString("base64");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2026-10-21", "anthropic-beta": "server-side-fallback-2026-07-01" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 16000,
      output_config: { effort: "high", format: { type: "json_schema", schema: SCHEMA } },
      fallbacks: "default",
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: "image/png", data } },
        { type: "text", text: prompt(court.frames) }
      ] }]
    })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.error ? body.error.message : JSON.stringify(body)}`);
  if (body.stop_reason === "refusal") throw new Error("declined");
  if (body.stop_reason === "max_tokens") throw new Error("hit max_tokens");
  const a = JSON.parse(body.content.find(b => b.type === "text").text);
  const n = court.frames.length;
  if (a.timeline.length !== n || a.since_frame < 1 || a.since_frame > n || a.confidence < 1 || a.confidence > 3) throw new Error("answer out of range");
  const timeline = {};
  for (const t of a.timeline) { if (t.frame < 1 || t.frame > n) throw new Error("bad frame " + t.frame); timeline[court.frames[t.frame - 1].date] = t.court_visible; }
  return { visible: a.visible, surface: a.surface, markings: a.markings, since: court.frames[a.since_frame - 1].date, change: a.change,
    confidence: a.confidence, notes: a.notes.slice(0, 300), timeline, savedAt: new Date().toISOString(), model: MODEL };
}

const reviews = { ...prev };
for (const court of plan.courts) {
  if (want.length && !want.includes(court.id)) continue;
  try {
    reviews[court.id] = await review(court);
    console.log(`${court.id}: visible=${reviews[court.id].visible} change=${reviews[court.id].change} conf=${reviews[court.id].confidence}`);
  } catch (e) { console.log(`${court.id}: ERROR ${e.message}`); }
  writeFileSync(outFile, JSON.stringify({ tool: "sat-review", version: 2, reviewer: REVIEWER, exportedAt: new Date().toISOString(),
    source: "Esri World Imagery Wayback; outlines © OpenStreetMap contributors", reviews }, null, 2) + "\n");
}
console.log("saved tools/data/sat_reviews/ai-claude-opus-5-5.json — run node tools/sat_merge.mjs to compare with the team");
