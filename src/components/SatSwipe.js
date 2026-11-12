import { ACTIVE_CITY, COURTS, useApp } from "../app/core.js";
import { WB_TILE } from "../data/constants.js";
import { fxReduced } from "../lib/fx-reduced.js";
import { useEffect, useRef, useState } from "../lib/react.js";
import { tmFmt, tmSpan } from "../lib/tm-fmt.js";
import { tmPrecomputed } from "../lib/tm-json.js";

export function SatSwipe() {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const [pick, setPick] = useState(null);
  const [cut, setCut] = useState(50);
  const [dead, setDead] = useState(false);
  const [view, setView] = useState({ zoom: 1, vx: null, vy: null });
  const boxRef = useRef(null), errs = useRef(0), touched = useRef(false), ptrs = useRef({}), gest = useRef(null), lastTap = useRef(0);
  const viewRef = useRef(view);
  viewRef.current = view;
  useEffect(() => {
    let alive = true;
    tmPrecomputed().then(pre => {
      if (!alive) return;
      const ok = COURTS.filter(c => c.lat != null && !c.posFixed && pre[c.id] && pre[c.id].length >= 2);
      // A sharp colour image says more than an older blurry or black-and-white one.
      const good = caps => caps.filter(x => x.res <= .6 && !/WV01|SPOT/i.test(x.sensor || ""));
      const pairOf = c => { const g = good(pre[c.id]); return g.length >= 2 ? [g[0], g[g.length - 1]] : [pre[c.id][0], pre[c.id][pre[c.id].length - 1]]; };
      const preferred = ACTIVE_CITY === "sibiu" ? "sb13" : "c11";
      const c = ok.find(x => x.id === preferred) || ok.find(x => good(pre[x.id]).length >= 2) || ok[0];
      if (!c) { setDead(true); return; }
      const [a, b] = pairOf(c);
      setPick({ court: c, a, b });
    });
    return () => { alive = false; };
  }, []);
  // One sweep of the divider the first time it scrolls into view, to show it can be dragged.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || !pick || fxReduced() || !window.IntersectionObserver) return;
    let raf = 0;
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), keys = [50, 80, 20, 50];
      const step = now => {
        if (touched.current) return;
        const k = Math.min(1, (now - t0) / 2200) * 3, i = Math.min(2, Math.floor(k)), f = k - i, e = f * f * (3 - 2 * f);
        setCut(keys[i] + (keys[i + 1] - keys[i]) * e);
        if (k < 3) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: .6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [pick]);
  if (dead || !pick) return null;
  const { court, a, b } = pick;
  const z = 17, n = Math.pow(2, z) * 256, lr = court.lat * Math.PI / 180;
  const wx = (court.lng + 180) / 360 * n, wy = (1 - Math.log(Math.tan(lr) + 1 / Math.cos(lr)) / Math.PI) / 2 * n;
  const tx = Math.floor(wx / 256), ty = Math.floor(wy / 256);
  const ox = wx - (tx - 1) * 256, oy = wy - (ty - 1) * 256;
  const BASE = 2, MAXZ = 2.6;
  const S = BASE * view.zoom;
  // Keep the view inside the 3x3 tile mosaic.
  const clampView = (vx, vy, zoom) => {
    const r = boxRef.current ? boxRef.current.getBoundingClientRect() : { width: 360, height: 225 };
    const s = BASE * zoom, hw = r.width / 2 / s, hh = r.height / 2 / s;
    return { zoom, vx: Math.min(768 - hw, Math.max(hw, vx)), vy: Math.min(768 - hh, Math.max(hh, vy)) };
  };
  const vx = view.vx == null ? ox : view.vx, vy = view.vy == null ? oy : view.vy;
  const tiles = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) tiles.push({ x: tx + dx, y: ty + dy, l: (dx + 1) * 256, t: (dy + 1) * 256 });
  const onErr = () => { errs.current++; if (errs.current > 6) setDead(true); };
  const mosaic = cap => React.createElement("div", { className: "sw-mosaic", style: { transform: "scale(" + S + ") translate(" + (-vx) + "px," + (-vy) + "px)" } },
    tiles.map(tl => React.createElement("img", { key: tl.x + "_" + tl.y, src: WB_TILE + cap.r + "/" + z + "/" + tl.y + "/" + tl.x, alt: "", draggable: false, loading: "lazy", onError: onErr, style: { left: tl.l, top: tl.t } })));
  const zoomTo = (zoom, fx, fy) => {
    // Zoom around a focal point (box-relative px), so what is under the finger stays under it.
    const r = boxRef.current.getBoundingClientRect(), v = viewRef.current;
    const cvx = v.vx == null ? ox : v.vx, cvy = v.vy == null ? oy : v.vy;
    const zz = Math.min(MAXZ, Math.max(1, zoom)), s0 = BASE * v.zoom, s1 = BASE * zz;
    const px = fx == null ? 0 : fx - r.width / 2, py = fy == null ? 0 : fy - r.height / 2;
    const mx = cvx + px / s0, my = cvy + py / s0;
    setView(clampView(mx - px / s1, my - py / s1, zz));
  };
  const local = e => { const r = boxRef.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width }; };
  const onDown = e => {
    touched.current = true;
    const p = local(e);
    ptrs.current[e.pointerId] = p;
    const ids = Object.keys(ptrs.current);
    const onHandle = !!(e.target.closest && e.target.closest(".sw-line"));
    try { boxRef.current.setPointerCapture(e.pointerId); } catch (err) {}
    if (ids.length === 2) {
      const [p1, p2] = ids.map(i => ptrs.current[i]);
      gest.current = { mode: "pinch", d: Math.hypot(p1.x - p2.x, p1.y - p2.y) || 1, zoom: viewRef.current.zoom, fx: (p1.x + p2.x) / 2, fy: (p1.y + p2.y) / 2 };
    } else if (onHandle) {
      gest.current = { mode: "cut" };
    } else {
      const now = Date.now();
      if (now - lastTap.current < 300) { zoomTo(viewRef.current.zoom > 1.4 ? 1 : 2, p.x, p.y); lastTap.current = 0; gest.current = null; return; }
      lastTap.current = now;
      const v = viewRef.current;
      gest.current = viewRef.current.zoom > 1 ? { mode: "pan", x: p.x, y: p.y, vx: v.vx == null ? ox : v.vx, vy: v.vy == null ? oy : v.vy } : { mode: "tapcut", x: p.x };
    }
  };
  const onMove = e => {
    if (!(e.pointerId in ptrs.current)) return;
    const p = local(e);
    ptrs.current[e.pointerId] = p;
    const g = gest.current;
    if (!g) return;
    if (g.mode === "pinch") {
      const ids = Object.keys(ptrs.current);
      if (ids.length < 2) return;
      const [p1, p2] = ids.map(i => ptrs.current[i]);
      zoomTo(g.zoom * (Math.hypot(p1.x - p2.x, p1.y - p2.y) / g.d), g.fx, g.fy);
    } else if (g.mode === "cut") {
      setCut(Math.min(98, Math.max(2, p.x / p.w * 100)));
    } else if (g.mode === "pan") {
      const s = BASE * viewRef.current.zoom;
      setView(clampView(g.vx - (p.x - g.x) / s, g.vy - (p.y - g.y) / s, viewRef.current.zoom));
    }
  };
  const onUp = e => {
    const g = gest.current;
    // A plain tap on the image (not zoomed) moves the divider there.
    if (g && g.mode === "tapcut") { const p = local(e); if (Math.abs(p.x - g.x) < 8) setCut(Math.min(98, Math.max(2, p.x / p.w * 100))); }
    delete ptrs.current[e.pointerId];
    gest.current = null;
  };
  const key = e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); touched.current = true; setCut(c => Math.min(98, Math.max(2, c + (e.key === "ArrowLeft" ? -5 : 5)))); }
    if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomTo(viewRef.current.zoom + .4); }
    if (e.key === "-") { e.preventDefault(); zoomTo(viewRef.current.zoom - .4); }
  };
  const ringX = (ox - vx) * S, ringY = (oy - vy) * S, ringD = 42 * S;
  const zbtn = (lbl, aria, fn, dis) => React.createElement("button", { className: "sw-zb", "aria-label": aria, disabled: dis, onPointerDown: e => e.stopPropagation(), onClick: fn }, lbl);
  return React.createElement("section", { className: "section", "data-demo": "sat" },
    React.createElement("div", { className: "container" },
      React.createElement("h2", { className: "section-title" }, L3("Atunci și acum, din satelit", "Then and now, from space", "Akkor és most, műholdról")),
      React.createElement("p", { className: "section-sub" }, L3("Trage de cerc ca să compari. Mărește cu două degete sau cu dublu-tap.", "Drag the circle to compare. Pinch or double-tap to zoom.", "Húzd a kört az összehasonlításhoz. Két ujjal vagy dupla koppintással nagyíts.")),
      React.createElement("div", {
        ref: boxRef, className: "sw-box" + (view.zoom > 1 ? " zoomed" : ""), style: { "--cut": cut + "%" }, tabIndex: 0, role: "slider",
        "aria-label": L3("Comparație din satelit", "Satellite comparison", "Műholdas összehasonlítás") + " · " + court.name,
        "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(cut),
        onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp, onKeyDown: key
      },
        React.createElement("div", { className: "sw-layer" }, mosaic(a)),
        React.createElement("div", { className: "sw-layer sw-b" }, mosaic(b)),
        React.createElement("span", { className: "sw-ring", "aria-hidden": "true", style: { width: ringD, height: ringD, marginLeft: ringX - ringD / 2, marginTop: ringY - ringD / 2 } }),
        React.createElement("span", { className: "sw-tag l" }, tmFmt(a.date, lang, true)),
        React.createElement("span", { className: "sw-tag r" }, tmFmt(b.date, lang, true)),
        React.createElement("div", { className: "sw-line" },
          React.createElement("span", { className: "sw-knob", "aria-hidden": "true" },
            React.createElement("svg", { viewBox: "0 0 24 24", width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" },
              React.createElement("path", { d: "M9 6l-6 6 6 6M15 6l6 6-6 6" })))),
        React.createElement("div", { className: "sw-zoom" },
          zbtn("＋", L3("Mărește", "Zoom in", "Nagyítás"), () => zoomTo(view.zoom + .4), view.zoom >= MAXZ - .01),
          zbtn("－", L3("Micșorează", "Zoom out", "Kicsinyítés"), () => zoomTo(view.zoom - .4), view.zoom <= 1.01))
      ),
      React.createElement("div", { className: "sw-meta" },
        React.createElement("span", null, "📍 ", React.createElement("b", null, court.name), " · ", tmSpan(a.date, b.date, lang)),
        React.createElement("button", { className: "btn btn-sm btn-green", onClick: () => { location.hash = "#court-" + court.id; } }, L3("Toată arhiva terenului →", "Full archive of this court →", "A pálya teljes archívuma →"))
      ),
      React.createElement("p", { className: "text-xs", style: { maxWidth: 760, margin: ".5rem auto 0", color: "var(--textSec)" } },
        L3("Imaginile arată ce se vedea din satelit la acele date, nu starea de azi a terenului. ", "The images show what satellites saw on those dates, not the court's condition today. ", "A képek azt mutatják, amit a műhold akkor látott, nem a pálya mai állapotát. "),
        "Esri World Imagery Wayback · " + (b.provider || a.provider || ""))
    )
  );
}
