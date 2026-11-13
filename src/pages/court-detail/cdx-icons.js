/* Line icons for the court sheet (24x24, stroke = currentColor). */
const P = {
  book: "M5 5h14v15H5zM5 9h14M9 3v4M15 3v4",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5",
  // satellite: body, two solar panels, antenna, signal arc
  sat: "M13 7 9 3 5 7l4 4M17 11l4 4-4 4-4-4M8 12l4 4 6-6-4-4zM16 8l3-3M9 21a6 6 0 0 0-6-6",
  com: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c.6-3.4 3-5 6-5s5.4 1.6 6 5M16 4.5a3.3 3.3 0 0 1 0 6.3M18 14.5c1.7.6 2.7 2.4 3 5",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0",
  bellOff: "M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l1.5 2H8M10 20.5a2 2 0 0 0 4 0M4 4l16 16",
  share: "M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v6h14v-6",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  ball: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9",
  poster: "M6 3h12v18H6zM9 7h6M9 11h6M9 15h3",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  x: "M6 6l12 12M18 6 6 18"
};
export function cdxIcon(k, size) {
  const s = size || 22;
  return React.createElement("svg", { viewBox: "0 0 24 24", width: s, height: s, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" },
    React.createElement("path", { d: P[k] || P.info }));
}
