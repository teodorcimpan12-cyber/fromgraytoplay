// Loads pieces of the app source into a Node vm so they can be unit-tested without a browser.
import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";

// The app used to be one index.html; it is now index.html + src/. The tests keep reading it as one text.
const root = new URL("../", import.meta.url);
const walk = dir => readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(dir + e.name + "/") : [dir + e.name]);
const html = [readFileSync(new URL("index.html", root), "utf8"), ...walk("src/").filter(f => /\.(js|css)$/.test(f)).sort().map(f => readFileSync(new URL(f, root), "utf8"))].join("\n");

function sliceBalanced(startIdx, open, close) {
  let depth = 0, i = startIdx, quote = null;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (ch === "\\") { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return html.slice(startIdx, i + 1);
  }
  throw new Error("unbalanced from " + startIdx);
}

export function extractFunction(name) {
  const at = html.indexOf("function " + name + "(");
  if (at < 0) throw new Error("function not found: " + name);
  const body = sliceBalanced(html.indexOf("{", html.indexOf(")", at)), "{", "}");
  return html.slice(at, html.indexOf("{", html.indexOf(")", at))) + body;
}

export function extractConst(name, open = "[") {
  const decl = "const " + name + " = ";
  const ex = html.indexOf("export " + decl);
  const at = ex >= 0 ? ex + 7 : html.indexOf(decl);
  if (at < 0) throw new Error("const not found: " + name);
  const start = html.indexOf(open, at + decl.length - 1);
  const close = open === "[" ? "]" : "}";
  return "const " + name + " = " + sliceBalanced(start, open, close) + ";";
}

export function load(sources, expose, globals = {}) {
  const ctx = vm.createContext({ ...globals });
  vm.runInContext(sources.join("\n") + "\n;globalThis.__out = {" + expose.join(",") + "};", ctx);
  return ctx.__out;
}

export { html };
