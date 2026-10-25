#!/usr/bin/env node
// Runtime smoke test in real headless Chrome: serves the repo locally, opens every page in both
// cities plus a court detail, and fails on any crash. Run by the git pre-push hook.
// Usage: node tools/smoke.mjs
import { createServer } from "node:http";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";

const CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"
].find(p => p && existsSync(p));
if (!CHROME) { console.log("⚠ smoke: Chrome not found — skipped (the Netlify gate still runs)."); process.exit(0); }

const PAGES = ["home", "courts", "reports", "petition", "community", "impact", "help", "about", "profile"];
const CITIES = [["tgm", "c1"], ["sibiu", "sb1"]];
const IGNORE = [/ERR_|net::|Failed to load resource|vibrate/i];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".css": "text/css", ".webp": "image/webp" };

const root = process.cwd();
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([\\/])+/, "");
  try {
    const body = await readFile(join(root, path || "index.html"));
    res.writeHead(200, { "content-type": TYPES[extname(path || "index.html")] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port + "/";

const port = 9400 + Math.floor(Math.random() * 400);
const profile = await mkdtemp(join(tmpdir(), "g2p-smoke-"));
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "--no-first-run", "--window-size=390,844", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const problems = [];
let ws;
const finish = async code => {
  try { ws && ws.close(); } catch {}
  chrome.kill(); server.close();
  await sleep(300); await rm(profile, { recursive: true, force: true }).catch(() => {});
  process.exit(code);
};
try {
  let targets = [];
  for (let i = 0; i < 60 && !targets.length; i++) { try { targets = (await (await fetch("http://127.0.0.1:" + port + "/json")).json()).filter(t => t.type === "page"); } catch {} if (!targets.length) await sleep(250); }
  if (!targets.length) throw new Error("Chrome did not start");
  ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pend = {}; let where = "boot";
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id && pend[msg.id]) { pend[msg.id](msg); delete pend[msg.id]; }
    let text = null;
    if (msg.method === "Runtime.exceptionThrown") text = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") text = msg.params.args.map(a => a.value ?? a.description).join(" ");
    if (text && !IGNORE.some(r => r.test(text))) problems.push(where + ": " + String(text).split("\n")[0].slice(0, 220));
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async expr => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  for (const [city, courtId] of CITIES) {
    let booted = false;
    for (let attempt = 0; attempt < 3 && !booted; attempt++) {
      where = city + " boot";
      await send("Page.navigate", { url: base + "?c=" + city + "#home" });
      for (let i = 0; i < 50 && !booted; i++) {
        await sleep(400);
        booted = await evalJs("(() => { const s = [...document.querySelectorAll('button')].find(b => /^(Treci peste|Skip)/.test(b.textContent.trim())); if (s) s.click(); return !!document.querySelector('.nav-logo') && document.body.innerText.length > 400; })()");
      }
      if (!booted) {
        const cdn = await evalJs("typeof React !== 'undefined' && typeof firebase !== 'undefined'");
        const parsed = await evalJs("!!window.__G2P_PARSED");
        if (cdn && parsed) break;
        if (!parsed && cdn) { problems.push(city + ": main script did not run (syntax error?)"); break; }
      }
    }
    if (!booted) { problems.push(city + ": the app never rendered (blank page)"); continue; }
    for (const p of [...PAGES, "court-" + courtId]) {
      where = city + " #" + p;
      await evalJs("location.hash = '#" + p + "'");
      await sleep(1400);
      const state = await evalJs("({ crashed: /Mingea a ieșit din teren|went out of bounds/.test(document.body.innerText), blank: document.body.innerText.trim().length < 200 })");
      if (state && state.crashed) problems.push(where + ": page crashed (error boundary shown)");
      if (state && state.blank) problems.push(where + ": page is blank");
    }
    if (await evalJs("!document.querySelector('.cpulse')")) problems.push(city + ": court detail did not render the pulse monitor");
  }
} catch (e) {
  problems.push("smoke harness: " + e.message);
}
if (problems.length) {
  console.error("\n✋ SMOKE TEST FAILED — " + problems.length + " problem(s):");
  [...new Set(problems)].forEach(p => console.error("  ✗ " + p));
  await finish(1);
}
console.log("✅ smoke: " + CITIES.length + " cities × " + (PAGES.length + 1) + " screens rendered without errors.");
await finish(0);
