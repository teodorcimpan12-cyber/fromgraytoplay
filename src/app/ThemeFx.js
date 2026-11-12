import { g2pSfx, useApp } from "./core.js";
import { useEffect, useState } from "../lib/react.js";

/* Full-screen theme effect layer, mounted once in App. */
export function ThemeFx() {
  const { settings } = useApp();
  const fxOff = !!(settings && settings.flags && settings.flags.effects === false);
  const [run, setRun] = useState(null);
  useEffect(() => {
    if (fxOff) { window.__g2pThemeFx = false; return; }
    window.__g2pThemeFx = true;
    const h = e => {
      const d = e.detail || {};
      if (window.__g2pThemeFxBusy) return;
      window.__g2pThemeFxBusy = true;
      setRun({ id: Date.now(), next: d.next, kind: d.kind, apply: d.apply });
    };
    window.addEventListener("g2p:themefx", h);
    return () => { window.removeEventListener("g2p:themefx", h); window.__g2pThemeFx = false; window.__g2pThemeFxBusy = false; };
  }, [fxOff]);
  useEffect(() => {
    if (!run) return;
    const dark = run.next === "dark", T = [];
    const at = (ms, f) => T.push(setTimeout(f, ms));
    // [when the screen is covered → swap theme, total length]
    const plan = {
      flood: dark ? [330, 2100] : [420, 1900],
      ball: [700, 1700], blackout: [760, 1650], spray: [700, 1500], whistle: [560, 1500], lines: [650, 1600]
    }[run.kind] || [400, 1500];
    if (run.kind === "flood") {
      if (dark) { g2pSfx("powerdown"); [520, 720, 920, 1120].forEach(ms => at(ms, () => g2pSfx("clack"))); }
      else { at(250, () => g2pSfx("chime")); at(900, () => g2pSfx("birds")); }
    } else if (run.kind === "ball") { g2pSfx("bounce"); at(330, () => g2pSfx("bounce")); at(760, () => g2pSfx("chime")); }
    else if (run.kind === "blackout") { for (let i = 0; i < 7; i++) at(90 * i, () => g2pSfx("click")); }
    else if (run.kind === "spray") { g2pSfx("spray"); }
    else if (run.kind === "whistle") { g2pSfx("whistle"); at(1050, () => g2pSfx("whistle")); }
    else if (run.kind === "lines") { g2pSfx("squeak"); at(380, () => g2pSfx("squeak")); }
    at(plan[0], () => { try { run.apply(); } catch (e) {} });
    at(plan[1], () => { setRun(null); window.__g2pThemeFxBusy = false; });
    return () => { T.forEach(clearTimeout); window.__g2pThemeFxBusy = false; };
  }, [run]);
  if (!run) return null;
  const dark = run.next === "dark", k = run.kind;
  const e = React.createElement;
  const L = (n, f) => Array.from({ length: n }, (_, i) => f(i));
  let body = null;
  if (k === "flood" && dark) {
    body = e(React.Fragment, null,
      e("div", { className: "tfx-black" }),
      L(4, i => e("div", { key: i, className: "tfx-tower", style: { "--x": (10 + i * 26.6) + "%", "--d": (520 + i * 200) + "ms", "--r": (i < 2 ? 1 : -1) } },
        e("div", { className: "tfx-beam" }), e("div", { className: "tfx-lamp" }, L(6, j => e("i", { key: j }))))));
  } else if (k === "flood") {
    body = e(React.Fragment, null, e("div", { className: "tfx-dawn" }), e("div", { className: "tfx-sun" }));
  } else if (k === "ball") {
    body = e(React.Fragment, null, e("div", { className: "tfx-tint" }),
      e("div", { className: "tfx-arc" }, e("div", { className: "tfx-ball " + (dark ? "moon" : "sun") },
        e("svg", { viewBox: "0 0 100 100", "aria-hidden": "true" },
          e("path", { d: "M50 2v96M2 50h96M18 14c18 20 18 52 0 72M82 14c-18 20-18 52 0 72", fill: "none", stroke: "rgba(0,0,0,.55)", strokeWidth: 3.2 })),
        e("i"), e("i"), e("i"))));
  } else if (k === "blackout") {
    body = e(React.Fragment, null, e("div", { className: "tfx-sky" }),
      L(7, i => e("div", { key: i, className: "tfx-block", style: { "--i": i, "--h": [72, 56, 88, 63, 94, 60, 80][i] + "%" } },
        L(52, j => e("i", { key: j, className: ((i * 7 + j * 13) % 5 < 2) ? "lit" : "", style: { "--w": ((i * 131 + j * 71) % 900) + "ms" } })))));
  } else if (k === "spray") {
    body = e(React.Fragment, null,
      L(16, i => e("div", { key: i, className: "tfx-blob", style: { "--x": ((i * 37) % 100) + "%", "--y": ((i * 61) % 100) + "%", "--i": i } })),
      e("div", { className: "tfx-tag" }, "G2P"));
  } else if (k === "whistle") {
    body = e("div", { className: "tfx-ref" }, e("div", { className: "tfx-t" }, e("i"), e("i")), e("b", null, "TIME-OUT"));
  } else if (k === "lines") {
    body = e(React.Fragment, null, e("div", { className: "tfx-tint slow" }),
      e("svg", { className: "tfx-court", viewBox: "0 0 280 150", preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" },
        e("rect", { x: 6, y: 6, width: 268, height: 138, rx: 2 }),
        e("line", { x1: 140, y1: 6, x2: 140, y2: 144 }),
        e("circle", { cx: 140, cy: 75, r: 18 }),
        e("path", { d: "M6 30h40a45 45 0 0 1 0 90H6M274 30h-40a45 45 0 0 0 0 90h40" }),
        e("rect", { x: 6, y: 55, width: 52, height: 40 }), e("rect", { x: 222, y: 55, width: 52, height: 40 })));
  }
  return e("div", { key: run.id, className: "tfx k-" + k + (dark ? " to-dark" : " to-light"), "aria-hidden": "true" }, body);
}
