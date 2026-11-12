import { RATE_DIMS } from "../../data/constants.js";

export function RadarChart({ values, labels, size }) {
  const S = size || 200;
  const cx = S / 2, cy = S / 2, R = S / 2 - 34;
  const n = RATE_DIMS.length;
  const angle = i => (Math.PI * 2 * i / n) - Math.PI / 2;
  const point = (i, r) => [cx + Math.cos(angle(i)) * R * r, cy + Math.sin(angle(i)) * R * r];
  const ringPath = r => RATE_DIMS.map((_, i) => { const [x, y] = point(i, r); return (i ? "L" : "M") + x.toFixed(1) + "," + y.toFixed(1); }).join(" ") + "Z";
  const dataPath = RATE_DIMS.map((k, i) => { const [x, y] = point(i, (values[k] || 0) / 5); return (i ? "L" : "M") + x.toFixed(1) + "," + y.toFixed(1); }).join(" ") + "Z";
  return React.createElement("svg", { width: S, height: S, viewBox: "0 0 " + S + " " + S, style: { display: "block" } },
    [0.25, 0.5, 0.75, 1].map(r => React.createElement("path", { key: r, d: ringPath(r), fill: "none", stroke: "var(--border)", strokeWidth: 1 })),
    RATE_DIMS.map((_, i) => { const [x, y] = point(i, 1); return React.createElement("line", { key: i, x1: cx, y1: cy, x2: x, y2: y, stroke: "var(--border)", strokeWidth: 1 }); }),
    React.createElement("path", { d: dataPath, fill: "rgba(16,185,129,.25)", stroke: "var(--green)", strokeWidth: 2, strokeLinejoin: "round" }),
    RATE_DIMS.map((k, i) => { const [x, y] = point(i, (values[k] || 0) / 5); return React.createElement("circle", { key: k, cx: x, cy: y, r: 3.5, fill: "var(--green)" }); }),
    RATE_DIMS.map((k, i) => {
      const [x, y] = point(i, 1.22);
      return React.createElement("text", { key: k, x: x, y: y, fill: "var(--textSec)", fontSize: 10, fontWeight: 600, textAnchor: "middle", dominantBaseline: "middle" }, labels[k]);
    })
  );
}
