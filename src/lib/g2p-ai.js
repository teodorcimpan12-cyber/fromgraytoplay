/* === AI helpers — POST /.netlify/functions/ai (the key stays on the server) === */
export function g2pAI(body) {
  // offline: say so at once instead of hanging; a call that takes over 40 s is given up
  if (typeof navigator !== "undefined" && navigator.onLine === false) return Promise.reject(Object.assign(new Error("offline"), { code: "offline" }));
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null, tm = ctl && setTimeout(() => ctl.abort(), 40000);
  return fetch("/.netlify/functions/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
    .catch(err => { throw Object.assign(new Error("network"), { code: err && err.name === "AbortError" ? "timeout" : navigator.onLine === false ? "offline" : "network" }); })
    .then(r => r.json().catch(() => ({ error: "bad_json" })).then(d => {
      if (!r.ok || d.error) throw Object.assign(new Error(d.error || "http " + r.status), { code: d.error || "http" });
      return d;
    }))
    .finally(() => { if (tm) clearTimeout(tm); });
}
export function aiErrMsg(code, L3) { // TODO: HU review
  if (code === "rate_limited") return L3("Prea multe încercări. Mai încearcă peste câteva minute.", "Too many tries. Try again in a few minutes.", "Túl sok próbálkozás. Próbáld újra pár perc múlva.");
  if (code === "bad_image") return L3("Poza nu poate fi citită. Încearcă alta.", "This photo can't be read. Try another one.", "A fotó nem olvasható. Próbálj meg egy másikat.");
  if (code === "offline") return L3("Ai nevoie de internet pentru AI. Raportul îl poți trimite și fără.", "The AI needs a connection. You can still send the report without it.", "Az AI-hoz internet kell. A bejelentést nélküle is elküldheted.");
  if (code === "timeout") return L3("AI-ul răspunde prea greu. Mai încearcă o dată.", "The AI is taking too long. Try once more.", "Az AI túl lassan válaszol. Próbáld újra.");
  return L3("AI-ul nu răspunde acum. Poți continua și fără el.", "The AI isn't answering right now. You can go on without it.", "Az AI most nem válaszol. Folytathatod nélküle is.");
}
// What the AI saw in a photo, saved next to the report and always kept apart from what the person chose.
export function aiStamp(r) {
  if (!r) return null;
  const o = { condition: r.condition, category: r.category || "none", confidence: r.confidence, summary: String(r.summary || "").slice(0, 300), model: r.model || "", at: new Date().toISOString() };
  if (r.diag && r.diag.score) {
    o.score = r.diag.score;
    o.issues = (r.diag.issues || []).slice(0, 10).map(x => ({ type: x.type, severity: x.severity, note: String(x.note || "").slice(0, 120) }));
    if (r.diag.fix && (r.diag.fix.items || []).length) o.fix = { items: r.diag.fix.items.slice(0, 4), cost: r.diag.fix.cost || "" };
  }
  return o;
}
