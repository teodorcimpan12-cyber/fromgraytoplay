// Server-side proxy to the Claude API. The key lives only in the Netlify env var
// ANTHROPIC_API_KEY and never reaches the browser.
// POST /.netlify/functions/ai  { task: "photo", image: "<base64 jpeg>", court: {...}, lang }
//                              { task: "letter", court: {...}, lang }
const MODEL = "claude-sonnet-5-5";
const ALLOWED = [/^https:\/\/fromgreytoplay\.netlify\.app$/, /^https:\/\/[a-z0-9-]+--fromgreytoplay\.netlify\.app$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
const MAX_IMAGE = 1_600_000; // base64 chars (~1.2 MB jpeg)
const PER_IP = 30;            // calls per IP per hour (best effort: resets when the function goes cold; a venue Wi-Fi shares one IP)
const hits = new Map();

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
  if (c.condition) f.push("Latest community condition report: " + clean(c.condition, 20));
  if (Number.isFinite(c.reports)) f.push("Community reports so far: " + c.reports);
  if (Number.isFinite(c.health)) f.push("Site health score (0-100): " + c.health);
  if (Array.isArray(c.issues) && c.issues.length) f.push("Reported issues: " + c.issues.slice(0, 8).map(x => clean(x, 60)).join("; "));
  return f.join("\n");
}

const PHOTO_PROMPT = lang => `You look at one photo of an outdoor public sports court sent by a citizen.
Reply with ONLY a JSON object, no other text:
{"isCourt": true|false, "condition": "good"|"degraded"|"abandoned"|"unclear", "category": "surface"|"hoop"|"fence"|"lighting"|"trash"|"safety"|"other"|"none", "issues": [up to 5 short strings], "confidence": 0-1, "summary": "one or two sentences"}
"category" is the main visible problem: surface (cracks, potholes, worn paint), hoop (backboard, rim, net, goals), fence, lighting, trash, safety (sharp or broken parts), other, or none if nothing is wrong.
Rules: describe only what is visible in the photo. Do not guess anything you cannot see (location, age, cost, owner). If it is not a sports court, set isCourt false and condition "unclear". Write "issues" and "summary" in ${LANG[lang] || "Romanian"}.`;

const LETTER_PROMPT = (lang, city) => `Write a short, polite, formal letter from a young resident to the City Hall of ${city === "sibiu" ? "Sibiu (Primăria Municipiului Sibiu)" : "Târgu Mureș (Primăria Municipiului Târgu Mureș)"} asking for the court below to be checked and repaired.
Use ONLY the facts given. Never invent numbers, dates, budgets, laws or names. Leave "[Nume]" as the signature placeholder.
Max 170 words. Language: ${LANG[lang] || "Romanian"}. Plain text, no markdown.`;

// Our own key (sk-ant-api…) goes straight to Anthropic. Netlify's AI Gateway also injects
// ANTHROPIC_API_KEY (a JWT) + ANTHROPIC_BASE_URL, so the user's key lives in ANTHROPIC_API_KEY1;
// without an own key we fall back to the gateway.
function endpoint() {
  const own = [process.env.ANTHROPIC_API_KEY1, process.env.ANTHROPIC_API_KEY].find(k => k && k.trim().startsWith("sk-ant-api"));
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
  if (!endpoint()) return json(503, { error: "not_configured" }, okOrigin);

  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "?";
  const now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  if (h.length >= PER_IP) return json(429, { error: "rate_limited" }, okOrigin);
  h.push(now); hits.set(ip, h);

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }, okOrigin); }
  const lang = ["ro", "en", "hu"].includes(body.lang) ? body.lang : "ro";

  try {
    if (body.task === "photo") {
      const img = String(body.image || "").replace(/^data:image\/\w+;base64,/, "");
      if (!img || img.length > MAX_IMAGE || !/^[A-Za-z0-9+/=]+$/.test(img)) return json(400, { error: "bad_image" }, okOrigin);
      const media = /^\/9j\//.test(img) ? "image/jpeg" : /^iVBOR/.test(img) ? "image/png" : /^UklGR/.test(img) ? "image/webp" : null;
      if (!media) return json(400, { error: "bad_image" }, okOrigin);
      const text = await callClaude([
        { type: "image", source: { type: "base64", media_type: media, data: img } },
        { type: "text", text: "Analyse this court photo." }
      ], PHOTO_PROMPT(lang), 400);
      const m = text.match(/\{[\s\S]*\}/);
      let out;
      try { out = JSON.parse(m ? m[0] : text); } catch { return json(502, { error: "bad_model_output" }, okOrigin); }
      const cond = ["good", "degraded", "abandoned", "unclear"].includes(out.condition) ? out.condition : "unclear";
      return json(200, {
        isCourt: out.isCourt !== false, condition: cond,
        issues: (Array.isArray(out.issues) ? out.issues : []).slice(0, 5).map(x => clean(x, 80)),
        category: ["surface", "hoop", "fence", "lighting", "trash", "safety", "other", "none"].includes(out.category) ? out.category : "none",
        confidence: Math.max(0, Math.min(1, Number(out.confidence) || 0)),
        summary: clean(out.summary, 300), model: MODEL
      }, okOrigin);
    }
    if (body.task === "letter") {
      const facts = courtFacts(body.court);
      if (!facts) return json(400, { error: "no_court" }, okOrigin);
      const city = body.court && body.court.city === "sibiu" ? "sibiu" : "tgm";
      const text = await callClaude([{ type: "text", text: facts }], LETTER_PROMPT(lang, city), 600);
      // keep the paragraph breaks, drop other control chars
      const letter = String(text).replace(/\r/g, "").replace(/[\u0000-\u0009\u000b-\u001f]/g, " ").replace(/\n{3,}/g, "\n\n").replace(/ {2,}/g, " ").slice(0, 2000);
      return json(200, { letter, model: MODEL }, okOrigin);
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
