/* Hand-drawn flags: Windows has no emoji flags, so these are SVG. */
export function FlagIcon({ code }) {
  const e = React.createElement;
  if (code === "en") return e("svg", { className: "flag", viewBox: "0 0 60 40", "aria-hidden": "true" },
    e("rect", { width: 60, height: 40, fill: "var(--flagBlue2)" }),
    e("path", { d: "M0 0L60 40M60 0L0 40", stroke: "var(--flagWhite)", strokeWidth: 8 }),
    e("path", { d: "M0 0L60 40M60 0L0 40", stroke: "var(--flagRed2)", strokeWidth: 3 }),
    e("path", { d: "M30 0v40M0 20h60", stroke: "var(--flagWhite)", strokeWidth: 12 }),
    e("path", { d: "M30 0v40M0 20h60", stroke: "var(--flagRed2)", strokeWidth: 7 }));
  if (code === "hu") return e("svg", { className: "flag", viewBox: "0 0 30 20", "aria-hidden": "true" },
    e("rect", { width: 30, height: 7, fill: "var(--flagRed3)" }),
    e("rect", { y: 6.6, width: 30, height: 6.8, fill: "var(--flagWhite)" }),
    e("rect", { y: 13.3, width: 30, height: 6.7, fill: "var(--flagGreen3)" }));
  return e("svg", { className: "flag", viewBox: "0 0 30 20", "aria-hidden": "true" },
    e("rect", { width: 10.2, height: 20, fill: "var(--flagBlue1)" }),
    e("rect", { x: 10, width: 10.2, height: 20, fill: "var(--flagYellow1)" }),
    e("rect", { x: 20, width: 10, height: 20, fill: "var(--flagRed1)" }));
}
