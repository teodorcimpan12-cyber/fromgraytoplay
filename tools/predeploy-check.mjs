#!/usr/bin/env node
// Deploy gate. Netlify runs this as the build command: any failure cancels the deploy and
// the last good version stays live. The git pre-commit and pre-push hooks run it too.
// It builds the site first, then checks what was built.
// Usage: node tools/predeploy-check.mjs   (needs dependencies: npm ci)
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const fail = [];
const ok = msg => console.log("  ✓ " + msg);

// 0. Build. The site that ships is dist/, produced by Vite from src/ + index.html + public/.
if (!existsSync("node_modules/vite")) {
  console.error("\n✋ Dependencies are missing. Run: npm ci\n"); process.exit(1);
}
try {
  execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build", "--logLevel", "warn"], { stdio: ["ignore", "pipe", "pipe"] });
  ok("vite build succeeded");
} catch (e) {
  console.error("\n✋ DEPLOY BLOCKED — the build failed:\n\n" + String(e.stdout || "") + String(e.stderr || e.message) + "\nThe live site was NOT changed.\n");
  process.exit(1);
}

// 1. The source still has the pieces the app cannot start without, and the built page is complete.
const walkSrc = dir => readdirSync(dir).flatMap(n => { const p = join(dir, n); return statSync(p).isDirectory() ? walkSrc(p) : [p]; });
const src = walkSrc("src").filter(p => /\.js$/.test(p)).map(p => readFileSync(p, "utf8")).join("\n");
for (const marker of ["window.__G2P_PARSED = 1", 'ReactDOM.createRoot(document.getElementById("root"))', "function App("])
  if (!src.includes(marker)) fail.push("src/ is missing a required piece: " + marker);
const html = readFileSync("dist/index.html", "utf8");
if (html.length < 300000) fail.push("dist/index.html is only " + html.length + " bytes — truncated?");
if (!/<\/html>\s*$/.test(html)) fail.push("dist/index.html does not end with </html> — truncated?");
for (const marker of ['<script type="module">', "__G2P_PARSED", '<div id="root">'])
  if (!html.includes(marker)) fail.push("dist/index.html is missing a required piece: " + marker);
if (/<script[^>]+src="\/(src|assets)\//.test(html) || /<link[^>]+href="\/(src|assets)\//.test(html)) fail.push("dist/index.html still points at separate app files — the single-file build did not inline them");
if (!fail.length) ok("dist/index.html complete (" + Math.round(html.length / 1024) + " KB)");

// 2. Every inline script parses. One stray character (e.g. a smart quote) blanks the whole site.
const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
let m, scripts = 0;
while ((m = re.exec(html))) {
  if (/type="application\/ld\+json"/.test(m[1])) {
    try { JSON.parse(m[2]); } catch (e) { fail.push("JSON-LD block is invalid: " + e.message); }
    continue;
  }
  scripts++;
  try {
    if (/type="module"/.test(m[1])) {
      const tmp = join(mkdtempSync(join(tmpdir(), "g2p-check-")), "app.mjs");
      writeFileSync(tmp, m[2]);
      execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
    } else new vm.Script(m[2], { filename: "dist/index.html" });
  } catch (e) {
    fail.push("SYNTAX ERROR in an inline script of dist/index.html: " + String(e.stderr || e.message).split("\n").slice(0, 5).join(" "));
  }
}
if (!fail.some(f => f.startsWith("SYNTAX"))) ok(scripts + " inline scripts parse");

// 3. JSON files the site depends on are valid.
for (const f of ["public/manifest.json", "database.rules.json"]) {
  try { JSON.parse(readFileSync(f, "utf8")); ok(f + " valid"); } catch (e) { fail.push(f + " is not valid JSON: " + e.message); }
}

// 4. Files the deploy needs exist.
for (const f of ["sw.js", "manifest.json", "icons/icon-192.png", "icons/icon-512.png", "promo.html", "data/timemachine.json"])
  if (!existsSync(join("dist", f))) fail.push("missing deploy file: dist/" + f);
try { new vm.Script(readFileSync("public/sw.js", "utf8"), { filename: "sw.js" }); ok("sw.js parses"); } catch (e) { fail.push("sw.js syntax error: " + e.message); }
// Netlify Functions: a file that does not parse fails the whole deploy, so check it here first.
if (existsSync("netlify/functions")) for (const f of readdirSync("netlify/functions").filter(n => /\.m?js$/.test(n))) {
  const p = join("netlify/functions", f), src = readFileSync(p, "utf8");
  try { execFileSync(process.execPath, ["--check", p], { stdio: "pipe" }); ok(p + " parses"); } catch (e) { fail.push("SYNTAX " + p + ": " + String(e.stderr || e.message).split("\n").slice(0, 4).join(" ")); }
  if (/sk-ant-[A-Za-z0-9_-]{10,}/.test(src)) fail.push(p + " contains an API key — keys belong in Netlify env vars only");
}
if (/sk-ant-[A-Za-z0-9_-]{10,}/.test(html) || /sk-ant-[A-Za-z0-9_-]{10,}/.test(src)) fail.push("the app code contains an API key — keys belong in Netlify env vars only");

// 5. Test material must never ship.
const walk = dir => existsSync(dir) ? readdirSync(dir).flatMap(n => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; }) : [];
const testImgs = [...walk("img"), ...walk("public/img")].filter(p => /(^|[\\/])test_/i.test(p));
if (testImgs.length) fail.push("test images would ship: " + testImgs.join(", "));
for (const f of ["tools/data/field_sibiu.csv", "tools/data/courts_sibiu.json"])
  if (existsSync(f) && /\bTEST\b/.test(readFileSync(f, "utf8"))) fail.push("TEST rows present in " + f);
if (!testImgs.length) ok("no test material in the publish folder");

// 6. Unit + data tests.
try {
  execFileSync(process.execPath, ["--test", "tests/app.test.mjs"], { stdio: ["ignore", "pipe", "pipe"] });
  ok("unit + data tests pass");
} catch (e) {
  const out = String(e.stdout || "") + String(e.stderr || "");
  fail.push("tests failed:\n" + out.split("\n").filter(l => /✖|not ok|Error|assert/i.test(l)).slice(0, 15).join("\n"));
}

if (fail.length) {
  console.error("\n✋ DEPLOY BLOCKED — " + fail.length + " problem(s):\n");
  fail.forEach(f => console.error("  ✗ " + f));
  console.error("\nThe live site was NOT changed.\n");
  process.exit(1);
}
console.log("\n✅ Safe to deploy.\n");
