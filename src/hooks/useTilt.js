import { useEffect, useRef } from "../lib/react.js";

/* Show-off: 3D tilt that follows the cursor. Skipped on touch + reduced motion. */
export function useTilt(max) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia) return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches || window.matchMedia("(hover: none)").matches) return;
    const mv = e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = "perspective(700px) rotateX(" + (-py * (max || 7)).toFixed(2) + "deg) rotateY(" + (px * (max || 7)).toFixed(2) + "deg) translateY(-2px)";
    };
    const lv = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", mv);
    el.addEventListener("mouseleave", lv);
    return () => { el.removeEventListener("mousemove", mv); el.removeEventListener("mouseleave", lv); };
  }, [max]);
  return ref;
}
