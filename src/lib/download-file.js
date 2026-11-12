import { fxReduced } from "./fx-reduced.js";

/* === Trigger a client-side file download (open data export). === */
export function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
/* Theme switch: a little show every time (60% stadium floodlights / sunrise, 40% a random
   neighbourhood gag). The real switch happens while the effect covers the screen, so the
   swap itself is never seen. Falls back to the circular reveal, or a plain toggle. */
export function themeFxBlocked() {
  return fxReduced() || document.documentElement.classList.contains("no-fx");
}
