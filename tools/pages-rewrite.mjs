// GitHub Pages serves the site under /<repo>/, while the app uses root paths (/icons, /data, /sw.js...).
// Run after the build, only for the Pages mirror: node tools/pages-rewrite.mjs /fromgraytoplay
// The Netlify build is not touched by this script.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const prefix = (process.argv[2] || "").replace(/\/$/, "");
if (!/^\/[\w.-]+$/.test(prefix)) { console.error("usage: node tools/pages-rewrite.mjs /<repo-name>"); process.exit(1); }
const NETLIFY = "https://fromgreytoplay.netlify.app";
let total = 0;
for (const f of ["dist/index.html", "dist/sw.js", "dist/manifest.json", "dist/promo.html", "dist/hero/index.html"]) {
  if (!existsSync(f)) continue;
  let s = readFileSync(f, "utf8"), n = 0;
  const rep = (re, to) => { s = s.replace(re, (...m) => { n++; return typeof to === "function" ? to(...m) : to; }); };
  rep(/(["'`(=])\/(data|icons|promo|docs|hero|demos)\//g, (m, q, d) => q + prefix + "/" + d + "/");
  rep(/(["'`])\/(manifest\.json|sw\.js|promo\.html|promo)(["'`?#])/g, (m, q, p, e) => q + prefix + "/" + p + e);
  rep(/(["'`])\/\.netlify\/functions\//g, (m, q) => q + NETLIFY + "/.netlify/functions/"); // the AI function stays on Netlify
  if (f.endsWith("sw.js")) rep(/const SHELL = \["\/",/, 'const SHELL = ["' + prefix + '/",');
  if (f.endsWith("manifest.json")) rep(/"(start_url|id|scope)":\s*"\/"/g, (m, k) => '"' + k + '": "' + prefix + '/"');
  writeFileSync(f, s); total += n;
  console.log(f + ": " + n + " paths");
}
if (!total) { console.error("nothing rewritten: the build output changed shape"); process.exit(1); }
