// Server-side proxy to the Claude API. The key lives only in the Netlify env var
// ANTHROPIC_API_KEY and never reaches the browser.
// POST /.netlify/functions/ai  { task: "photo", image: "<base64 jpeg>", court: {...}, lang }
//                              { task: "letter", court: {...}, lang }
const MODEL = "claude-sonnet-5-5";
const ALLOWED = [/^https:\/\/fromgreytoplay\.netlify\.app$/, /^https:\/\/[a-z0-9-]+--fromgreytoplay\.netlify\.app$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
const MAX_IMAGE = 1_600_000; // base64 chars (~1.2 MB jpeg)
const PER_IP = 30;            // calls per IP per hour (best effort: resets when the function goes cold; a venue Wi-Fi shares one IP)
const PHOTO_PER_KEY = 3;      // Court Doctor diagnoses per voterKey per hour (spec: docs/SPEC_6NOV.md §1)
const hits = new Map(), keyHits = new Map();

const json = (status, body, origin) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json", "access-control-allow-origin": origin || "https://fromgreytoplay.netlify.app", "access-control-allow-headers": "content-type", "vary": "origin" }
});

const LANG = { ro: "Romanian", en: "English", hu: "Hungarian" };
const clean = (s, n) => String(s == null ? "" : s).replace(/[\u0000-\u001f]/g, " ").slice(0, n);

function courtFacts(c) {
  // Only facts the site already shows; the model is told not to add any others.
  c = c || {};
  const f = [];
  if (c.name) f.push("Court: " + clean(c.name, 80));
  if (c.city) f.push("City: " + clean(c.city, 30));
  if (c.type) f.push("Type: " + clean(c.type, 40));
  if (c.stadium) f.push("This is a stadium.");
  if (c.status) f.push("Status on the site: " + clean(c.status, 20));
  if (c.condition) f.push("Latest community condition report: " + clean(c.condition, 20));
  if (Number.isFinite(c.aiScore)) f.push("AI estimate from citizens' photos (not an inspection): " + c.aiScore + "/5");
  if (Number.isFinite(c.reports)) f.push("Community reports so far: " + c.reports);
  if (Number.isFinite(c.health)) f.push("Site health score (0-100): " + c.health);
  if (Array.isArray(c.issues) && c.issues.length) f.push("Reported issues: " + c.issues.slice(0, 8).map(x => clean(x, 60)).join("; "));
  return f.join("\n");
}

const PHOTO_PROMPT = lang => `You look at one photo of an outdoor public sports court or stadium sent by a citizen.
Reply with ONLY a JSON object, no other text:
{"isCourt": true|false, "condition": "good"|"degraded"|"abandoned"|"unclear", "score": 1-5, "category": "surface"|"hoop"|"fence"|"lighting"|"trash"|"safety"|"other"|"none", "issues": [up to 6 objects {"type": "cracks"|"rim"|"net"|"lines"|"lighting"|"drainage"|"graffiti"|"fence"|"trash"|"other", "severity": 1-3, "note": "short phrase"}], "fix": {"items": [up to 4 short repair steps], "cost": "<10k"|"10-50k"|"50-200k"|">200k"}, "confidence": 0-1, "summary": "one or two sentences"}
"score": 5 = like new, 4 = good, 3 = playable with wear, 2 = degraded, 1 = unusable or abandoned.
"category" is the main visible problem: surface (cracks, potholes, worn paint), hoop (backboard, rim, net, goals), fence, lighting, trash, safety (sharp or broken parts), other, or none if nothing is wrong.
"fix.cost" is a rough band in Romanian lei for the visible repairs only.
Rules: describe only what is visible in the photo. Do not guess anything you cannot see (location, age, owner). If it is not a sports court, set isCourt false, condition "unclear", score 0, no issues. Write "note", "fix.items" and "summary" in ${LANG[lang] || "Romanian"}.`;
const ISSUE_TYPES = ["cracks", "rim", "net", "lines", "lighting", "drainage", "graffiti", "fence", "trash", "other"];
const COST_BANDS = ["<10k", "10-50k", "50-200k", ">200k"];

// basis: "og27" = petition under OG 27/2002 (answer within 30 days); "l544" = information request under Law 544/2001 (10 days)
const LETTER_PROMPT = (lang, city, basis) => `Write a short, polite, formal letter from a young resident to the City Hall of ${city === "sibiu" ? "Sibiu (Primăria Municipiului Sibiu)" : "Târgu Mureș (Primăria Municipiului Târgu Mureș)"} about the court or stadium below.
${basis === "l544"
    ? "It is a request for public information under Law 544/2001 (Legea nr. 544/2001 privind liberul acces la informațiile de interes public), which must be answered within 10 days. Ask, as numbered points: who administers this facility; how much was spent on its maintenance or repairs in the last 3 years; whether any works are planned, with dates and budget; and whether it is open to the public, on what schedule. Do not ask for repairs."
    : "It is a petition under OG 27/2002 (Ordonanța Guvernului nr. 27/2002 privind reglementarea activității de soluționare a petițiilor), which must be answered within 30 days. Ask for the court to be checked and repaired, based on the facts given."}
Use ONLY the facts given. You may name only the law above, exactly as written; never invent numbers, dates, budgets, other laws or names. Leave "[Nume]" as the signature placeholder.
Max 190 words. Language: ${LANG[lang] || "Romanian"}. Plain text, no markdown.`;

// Our own key (sk-ant-api…) goes straight to Anthropic. Netlify's AI Gateway also injects
// ANTHROPIC_API_KEY (a JWT) + ANTHROPIC_BASE_URL, so the user's key lives in ANTHROPIC_API_KEY1;
// without an own key we fall back to the gateway.
function endpoint() {
  const own = [process.env.ANTHROPIC_API_KEY1, process.env.ANTHROPIC_API_KEY].find(k => k && /^sk-ant-(?!admin)/.test(k.trim()));
  if (own) return { key: own.trim(), url: "https://api.anthropic.com/v1/messages", via: "own" };
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_BASE_URL)
    return { key: process.env.ANTHROPIC_API_KEY, url: process.env.ANTHROPIC_BASE_URL.replace(/\/+$/, "") + "/v1/messages", via: "gateway" };
  return null;
}

async function callClaude(content, system, maxTokens) {
  const ep = endpoint();
  const r = await fetch(ep.url, {
    method: "POST",
    headers: { "x-api-key": ep.key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content }] })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error((data.error && data.error.message) || "upstream " + r.status), { status: r.status, type: data.error && data.error.type });
  return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
}

export default async (req, context) => {
  const origin = req.headers.get("origin") || "";
  const okOrigin = ALLOWED.some(r => r.test(origin)) ? origin : null;
  // A 204 can't carry a body (new Response would throw), so the preflight gets its own reply.
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": okOrigin || "https://fromgreytoplay.netlify.app", "access-control-allow-headers": "content-type", "access-control-allow-methods": "POST, OPTIONS", "vary": "origin" } });
  if (req.method !== "POST") return json(405, { error: "method" }, okOrigin);
  if (!okOrigin) return json(403, { error: "origin" });
  // Names and key kinds only (never values), so a wrong paste in the Netlify env is easy to spot.
  if (!endpoint()) return json(503, { error: "not_configured", vars: Object.keys(process.env).filter(n => /^ANTHROPIC/.test(n))
    .map(n => n + ":" + (((process.env[n] || "").trim().match(/^sk-ant-([a-z]+)/) || [])[1] || (/^eyJ/.test(process.env[n] || "") ? "jwt" : (process.env[n] || "").length ? "other" : "empty"))) }, okOrigin);

  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "?";
  const now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  if (h.length >= PER_IP) return json(429, { error: "rate_limited" }, okOrigin);
  h.push(now); hits.set(ip, h);

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }, okOrigin); }
  const lang = ["ro", "en", "hu"].includes(body.lang) ? body.lang : "ro";

  try {
    if (body.task === "photo") {
      // per-device limit on top of the per-IP one (a venue Wi-Fi shares one IP; the pitch demo is exempt)
      const vk = clean(body.vk, 40);
      if (vk && body.demo !== 1) {
        const kh = (keyHits.get(vk) || []).filter(t => now - t < 3600e3);
        if (kh.length >= PHOTO_PER_KEY) return json(429, { error: "rate_limited" }, okOrigin);
        kh.push(now); keyHits.set(vk, kh);
      }
      const img = String(body.image || "").replace(/^data:image\/\w+;base64,/, "");
      if (!img || img.length > MAX_IMAGE || !/^[A-Za-z0-9+/=]+$/.test(img)) return json(400, { error: "bad_image" }, okOrigin);
      const media = /^\/9j\//.test(img) ? "image/jpeg" : /^iVBOR/.test(img) ? "image/png" : /^UklGR/.test(img) ? "image/webp" : null;
      if (!media) return json(400, { error: "bad_image" }, okOrigin);
      const text = await callClaude([
        { type: "image", source: { type: "base64", media_type: media, data: img } },
        { type: "text", text: "Analyse this court photo." }
      ], PHOTO_PROMPT(lang), 900);
      const m = text.match(/\{[\s\S]*\}/);
      let out;
      try { out = JSON.parse(m ? m[0] : text); } catch { return json(502, { error: "bad_model_output" }, okOrigin); }
      const cond = ["good", "degraded", "abandoned", "unclear"].includes(out.condition) ? out.condition : "unclear";
      const isCourt = out.isCourt !== false;
      // structured issues; plain strings from an older reply still work
      const diagIssues = (Array.isArray(out.issues) ? out.issues : []).slice(0, 6).map(x => typeof x === "string"
        ? { type: "other", severity: 2, note: clean(x, 120) }
        : { type: ISSUE_TYPES.includes(x && x.type) ? x.type : "other", severity: Math.max(1, Math.min(3, Math.round(Number(x && x.severity) || 2))), note: clean(x && x.note, 120) }).filter(x => x.note);
      const score = isCourt ? Math.max(1, Math.min(5, Math.round(Number(out.score) || ({ good: 4, degraded: 2, abandoned: 1 }[cond] || 3)))) : 0;
      const fix = out.fix && typeof out.fix === "object" ? { items: (Array.isArray(out.fix.items) ? out.fix.items : []).slice(0, 4).map(x => clean(x, 100)).filter(Boolean), cost: COST_BANDS.includes(out.fix.cost) ? out.fix.cost : "" } : { items: [], cost: "" };
      return json(200, {
        isCourt, condition: cond, score: isCourt ? score : 0,
        diag: isCourt ? { score, issues: diagIssues, fix } : null,
        issues: diagIssues.slice(0, 5).map(x => x.note),
        category: ["surface", "hoop", "fence", "lighting", "trash", "safety", "other", "none"].includes(out.category) ? out.category : "none",
        confidence: Math.max(0, Math.min(1, Number(out.confidence) || 0)),
        summary: clean(out.summary, 300), model: MODEL
      }, okOrigin);
    }
    if (body.task === "letter") {
      const facts = courtFacts(body.court);
      if (!facts) return json(400, { error: "no_court" }, okOrigin);
      const city = body.court && body.court.city === "sibiu" ? "sibiu" : "tgm";
      const basis = body.basis === "l544" ? "l544" : "og27";
      const text = await callClaude([{ type: "text", text: facts }], LETTER_PROMPT(lang, city, basis), 1400); // Romanian diacritics cost many tokens; 600 cut letters off mid-sentence
      // keep the paragraph breaks, drop other control chars
      const letter = String(text).replace(/\r/g, "").replace(/[\u0000-\u0009\u000b-\u001f]/g, " ").replace(/\n{3,}/g, "\n\n").replace(/ {2,}/g, " ").slice(0, 2000);
      return json(200, { letter, basis, model: MODEL }, okOrigin);
    }
    return json(400, { error: "task" }, okOrigin);
  } catch (e) {
    const code = e.status === 400 && /credit/i.test(e.message) ? "no_credits" : "upstream";
    // status + Anthropic error type only (never the message, it can echo request data)
    const out = { error: code, status: e.status || 0, type: clean(e.type, 40) };
    out.via = (endpoint() || {}).via;
    return json(502, out, okOrigin);
  }
};
