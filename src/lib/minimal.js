/* Minimal version (footer "Animații" off): a lighter site with only the core civic features.
   The class is set before React starts (inline head script) and the switch reloads the page,
   so a plain read at render time is enough. The original version is never affected. */
export function isMinimal() {
  try { return document.documentElement.classList.contains("minimal"); } catch (e) { return false; }
}
