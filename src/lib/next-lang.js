import { ACTIVE_CITY } from "../app/core.js";
import { CITY_CFG, HOOD_DISPLAY, LANG_ORDER, isMentor } from "../data/constants.js";

export function nextLang(l) {
  const i = LANG_ORDER.indexOf(l);
  return LANG_ORDER[(i + 1) % LANG_ORDER.length];
}
/* === Anonymize a name to "Andrei P." for the activity feed. === */
export function anonName(s) {
  const x = String(s || "").trim();
  if (!x) return "Anonim";
  if (isMentor(x)) return x; // mentors appear with their full public name
  // Keep only words that start with a letter, so stray quotes or emoji never become an "initial".
  const parts = x.split(/\s+/).filter(w => /^\p{L}/u.test(w));
  if (!parts.length) return "Anonim";
  return parts.length === 1 ? parts[0] : parts[0] + " " + parts[parts.length - 1][0] + ".";
}
/* === Push an activity entry. Fire-and-forget. === */
export function hoodName(key, lang) {
  const cfg = CITY_CFG[ACTIVE_CITY];
  return (cfg && cfg.hoods && cfg.hoods[key]) || (HOOD_DISPLAY[lang] || HOOD_DISPLAY.ro)[key] || key;
}
export function escHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}
// activity/ mixes numeric and ISO-string timestamps.
export function tsOf(a) { return typeof a.timestamp === "number" ? a.timestamp : (Date.parse(a.timestamp || "") || 0); }
