// Production on Netlify = a thin proxy to the GitHub Pages build of the same commit.
// Why: every Netlify production deploy costs credits; GitHub Pages publishes for free on every merge.
// After ONE Netlify deploy of this proxy, fromgreytoplay.netlify.app keeps its link and always serves
// the newest Pages build (folder /app/ = the unprefixed build, made by .github/workflows/pages.yml).
import { mkdirSync, writeFileSync } from "node:fs";
const ORIGIN = "https://teodorcimpan12-cyber.github.io/fromgraytoplay/app";
mkdirSync("netlify-proxy", { recursive: true });
writeFileSync("netlify-proxy/_redirects", [
  "/press  " + ORIGIN + "/index.html  200!",
  "/promo  " + ORIGIN + "/promo.html  200!",
  "/*  " + ORIGIN + "/:splat  200!"
].join("\n") + "\n");
console.log("netlify-proxy/_redirects written -> " + ORIGIN);
