import { ACTIVE_CITY, SOURCES } from "../app/core.js";
import { eggL } from "./g2p-egg.js";

export function srcById(id) { return SOURCES.find(s => s.id === id) || null; }
export function srcVisible(s) { return !!s && (s.city === "general" || s.city === ACTIVE_CITY); }
export function srcList() { return SOURCES.filter(srcVisible); }
export function srcNum(id) { return srcList().findIndex(s => s.id === id) + 1; }
export function srcCite(s, lang) {
  const acc = lang === "en" ? "accessed" : lang === "hu" ? "letöltve" : "accesat";
  return s.pub + ". „" + eggL(s.t, lang) + "”" + (s.d ? ", " + s.d : "") + "." + (s.url ? " " + s.url + " (" + acc + " " + new Date().toLocaleDateString("ro-RO") + ")" : "");
}
export function copyText(txt) {
  try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt).then(() => true, () => false); } catch (e) {}
  try {
    const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return Promise.resolve(ok);
  } catch (e) { return Promise.resolve(false); }
}
