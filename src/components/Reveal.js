import { useReveal } from "../hooks/useReveal.js";

/* Show-off: wrapper element with scroll-reveal + stagger delay (--d). */
export function Reveal(props) {
  const ref = useReveal();
  const p = { ...props, ref, className: "reveal " + (props.className || ""), style: { ...(props.style || {}), "--d": (props.d || 0) + "ms" } };
  delete p.d; delete p.as;
  return React.createElement(props.as || "div", p);
}
