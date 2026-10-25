#!/usr/bin/env node
// Deploy gate. Netlify runs this as the build command: any failure cancels the deploy and
// the last good version stays live. The git pre-commit and pre-push hooks run it too.
// Usage: node tools/predeploy-check.mjs
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const fail = [];
const ok = msg => console.log("  ✓ " + msg);

// 1. index.html is complete (an interrupted write or bad merge truncates it).
const html = readFileSync("index.html", "utf8");
if (html.length < 300000) fail.push("index.html is only " + html.length + " bytes — truncated?");
if (!/<\/html>\s*$/.test(html)) fail.push("index.html does not end with </html> — truncated?");
for (const marker of ["window.__G2P_PARSED = 1", 'ReactDOM.createRoot(document.getElementById("root"))', "function App("])
  if (!html.includes(marker)) fail.push("index.html is missing a required piece: " + marker);
if (!fail.length) ok("index.html complete (" + Math.round(html.length / 1024) + " KB)");

// 2. Every inline script parses. One stray character (e.g. a smart quote) blanks the whole site.
const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
let m, scripts = 0;
while ((m = re.exec(html))) {
  const lineOffset = html.slice(0, m.index + m[0].indexOf(">") + 1).split("\n").length - 1;
  if (/type="application\/ld\+json"/.test(m[1])) {
    try { JSON.parse(m[2]); } catch (e) { fail.push("JSON-LD block near line " + (lineOffset + 1) + " is invalid: " + e.message); }
    continue;
  }
  scripts++;
  try {
    new vm.Script(m[2], { filename: "index.html", lineOffset });
  } catch (e) {
    const where = (String(e.stack).match(/index\.html:(\d+)/) || [])[1];
    const line = where ? html.split("\n")[+where - 1] : "";
    fail.push("SYNTAX ERROR in index.html" + (where ? " line " + where : "") + ": " + e.message + (line ? "\n      " + line.trim().slice(0, 160) : ""));
  }
}
if (!fail.some(f => f.startsWith("SYNTAX"))) ok(scripts + " inline scripts parse");

// 3. JSON files the site depends on are valid.
for (const f of ["manifest.json", "database.rules.json"]) {
  try { JSON.parse(readFileSync(f, "utf8")); ok(f + " valid"); } catch (e) { fail.push(f + " is not valid JSON: " + e.message); }
}

// 4. Files the deploy needs exist.
for (const f of ["sw.js", "manifest.json", "icons/icon-192.png", "icons/icon-512.png"])
  if (!existsSync(f)) fail.push("missing deploy file: " + f);
try { new vm.Script(readFileSync("sw.js", "utf8"), { filename: "sw.js" }); ok("sw.js parses"); } catch (e) { fail.push("sw.js syntax error: " + e.message); }

// 5. Test material must never ship.
const walk = dir => existsSync(dir) ? readdirSync(dir).flatMap(n => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; }) : [];
const testImgs = walk("img").filter(p => /(^|[\\/])test_/i.test(p));
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
