import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

async function sourceFunction(path, name) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const match = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n\\}`));
  assert.ok(match, `${name} is present in ${path}`);
  return vm.runInNewContext(`(${match[0]})`);
}

test("Sibiu metadata tag stripping removes nested tags completely", async () => {
  const stripHtmlTags = await sourceFunction("../tools/enrich_sibiu.mjs", "stripHtmlTags");
  assert.equal(stripHtmlTags("<b>Artist</b>"), "Artist");
  assert.equal(stripHtmlTags("<<script>script>alert(1)</script>"), "scriptalert(1)");
});

test("Firebase host matching excludes only the exact domain and its subdomains", async () => {
  const isFirebaseHost = await sourceFunction("../public/sw.js", "isFirebaseHost");
  assert.equal(isFirebaseHost("firebaseio.com", "firebaseio.com"), true);
  assert.equal(isFirebaseHost("project.firebaseio.com", "firebaseio.com"), true);
  assert.equal(isFirebaseHost("evilfirebaseio.com", "firebaseio.com"), false);
  assert.equal(isFirebaseHost("firebaseio.com.example.org", "firebaseio.com"), false);
});
