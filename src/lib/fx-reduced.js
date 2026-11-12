/* ===== Spectacle pack: the story on scroll, then-and-now from space, the city in 3D ===== */
export function fxReduced() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches) || document.documentElement.classList.contains("no-fx");
}
