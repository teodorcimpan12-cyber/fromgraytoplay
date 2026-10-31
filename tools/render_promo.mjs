#!/usr/bin/env node
// Renders promo.html frame-exact to MP4 (9:16 + 16:9) with headless Chromium + ffmpeg.
// promo.html is a pure function of time (window.__frame(t)), so every frame is deterministic.
// Usage: node tools/render_promo.mjs [--lang ro|en|hu] [--fps 30] [--only 9x16|16x9] [--cues]
//   --cues  only writes promo/cues.json (audio cue list used to mix promo/soundtrack.m4a)
// Needs: playwright (require-able), ffmpeg on PATH. Output: promo/promo-{9x16,16x9}.mp4 + posters.
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, extname, normalize } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const LANG = arg("lang", "ro"), FPS = +arg("fps", 30), ONLY = arg("only", null), CUES_ONLY = process.argv.includes("--cues");
const SUFFIX = LANG === "ro" ? "" : "-" + LANG;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".m4a": "audio/mp4", ".mp4": "video/mp4", ".jpg": "image/jpeg" };

const root = process.cwd();
const server = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([\\/])+/, "");
  try { const body = await readFile(join(root, p || "index.html")); res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, r));
const base = "http://127.0.0.1:" + server.address().port;

const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "127.0.0.1,localhost" } : undefined;
const browser = await chromium.launch({ proxy, args: ["--ignore-certificate-errors"] });
await mkdir("promo", { recursive: true });

const run = (cmd, args, input) => new Promise((ok, bad) => {
  const p = spawn(cmd, args, { stdio: [input ? "pipe" : "ignore", "ignore", "pipe"] });
  let err = ""; p.stderr.on("data", d => { err += d; });
  p.on("close", c => c ? bad(new Error(cmd + " failed: " + err.slice(-800))) : ok());
  if (input) input(p.stdin);
});

for (const ar of ["9x16", "16x9"]) {
  if (ONLY && ONLY !== ar) continue;
  const [w, h] = ar === "9x16" ? [1080, 1920] : [1920, 1080];
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on("pageerror", e => { console.error("page error:", e.message); process.exitCode = 1; });
  await page.goto(base + "/promo.html?render=1&ar=" + ar + "&lang=" + LANG, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  const T = await page.evaluate(() => window.__T);
  if (CUES_ONLY) { await writeFile("promo/cues.json", JSON.stringify({ T, cues: await page.evaluate(() => window.__cues) }, null, 1)); console.log("✓ promo/cues.json"); break; }

  const grab = t => page.evaluate(t => { window.__frame(t); return document.getElementById("cv").toDataURL("image/jpeg", 0.94).split(",")[1]; }, t);
  const silent = "promo/_video-" + ar + ".mp4", out = "promo/promo-" + ar + SUFFIX + ".mp4", N = Math.round(T * FPS);
  const t0 = Date.now();
  await run("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", silent], async stdin => {
    for (let i = 0; i < N; i++) {
      const buf = Buffer.from(await grab(i / FPS), "base64");
      if (!stdin.write(buf)) await new Promise(r => stdin.once("drain", r));
      if (i % 120 === 0) process.stdout.write("  " + ar + " frame " + i + "/" + N + "\r");
    }
    stdin.end();
  });
  // posters for og:image / video poster
  for (const [t, name] of [[29.6, "poster-" + ar + SUFFIX + ".jpg"]]) await writeFile(join("promo", name), Buffer.from(await grab(t), "base64"));
  if (existsSync("promo/soundtrack.m4a"))
    await run("ffmpeg", ["-y", "-i", silent, "-i", "promo/soundtrack.m4a", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out]);
  else await run("ffmpeg", ["-y", "-i", silent, "-c", "copy", out]);
  await import("node:fs").then(fs => fs.rmSync(silent));
  console.log("✓ " + out + " (" + N + " frames, " + ((Date.now() - t0) / 1000).toFixed(0) + " s)");
  await page.close();
}
await browser.close();
server.close();
