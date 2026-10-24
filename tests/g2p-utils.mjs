// Loads pieces of the single-file app (index.html) into a Node vm so they can be unit-tested
// without duplicating code or adding a build step.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

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
  const at = html.indexOf(decl);
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
