import { COURTS, useApp } from "../../app/core.js";
import { courtStatusView } from "../../lib/court-status-view.js";
import { fxReduced } from "../../lib/fx-reduced.js";
import { useEffect, useRef, useState } from "../../lib/react.js";

export function hexA(hex, a) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || "");
  return m ? "rgba(" + parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16) + "," + a + ")" : "rgba(156,163,175," + a + ")";
}
export function City3D() {
  const { t, lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const cvRef = useRef(null);
  const [sel, setSel] = useState(null);
  const tRef = useRef(t);
  tRef.current = t;
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const still = fxReduced();
    const pts = COURTS.filter(c => c.lat != null && c.lng != null);
    if (pts.length < 2) return;
    const cLat = pts.reduce((s, c) => s + c.lat, 0) / pts.length, cLng = pts.reduce((s, c) => s + c.lng, 0) / pts.length;
    const k = Math.cos(cLat * Math.PI / 180);
    const raw = pts.map(c => ({ c, x: (c.lng - cLng) * k, z: (c.lat - cLat) }));
    const R = Math.max.apply(null, raw.map(p => Math.hypot(p.x, p.z))) || 1;
    const nodes = raw.map((p, i) => {
      const cond = typeof p.c.condition === "number" ? p.c.condition : null;
      const x = p.x / R, z = p.z / R;
      return { c: p.c, i, x, z, r: Math.hypot(x, z), h: cond == null ? .05 : .14 + cond / 5 * .55 + (p.c.status === "excellent" ? .2 : 0), col: courtStatusView(p.c, tRef.current).color, known: cond != null };
    });
    const links = [];
    nodes.forEach((a, i) => nodes.map((b, j) => ({ j, d: (a.x - b.x) * (a.x - b.x) + (a.z - b.z) * (a.z - b.z) }))
      .filter(o => o.j !== i).sort((p, q) => p.d - q.d).slice(0, 2)
      .forEach(o => { if (!links.some(l => (l[0] === i && l[1] === o.j) || (l[0] === o.j && l[1] === i))) links.push([i, o.j]); }));
    // Light pulses that travel along the links between neighbouring courts.
    const pulses = links.map((l, i) => ({ l, p: (i * .37) % 1, v: .18 + (i % 5) * .04 }));
    const stars = Array.from({ length: 80 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .2, v: Math.random() * .012 + .003, a: Math.random() * .5 + .2 }));
    const bursts = [], ripples = [];
    let shooting = null, nextShoot = 3 + Math.random() * 4;
    let W = 0, H = 0, rot = .7, pitch = still ? .95 : 1.32, zoom = still ? 1 : .78, raf = 0, last = 0, time = 0, grow = still ? 1 : 0, started = still;
    let visible = true, drag = null, hover = -1, selIdx = -1, vel = 0, flyTo = null, idleUntil = 0;
    const ptrs = {};
    let pinch = null;
    let proj = [];
    const resize = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const P = (x, y, z) => {
      const cr = Math.cos(rot), sr = Math.sin(rot), xr = x * cr - z * sr, zr = x * sr + z * cr;
      const cp = Math.cos(pitch), sp = Math.sin(pitch), yr = y * cp + zr * sp, zz = -y * sp + zr * cp;
      const d = 3.2, s = Math.min(W, H * 1.7) * .42 * zoom * d / (d + zz);
      return { x: W / 2 + xr * s, y: H * .58 - yr * s, s, z: zz };
    };
    const growOf = n => Math.min(1, Math.max(0, grow * 1.6 - n.r * .6));
    const ease = v => 1 - Math.pow(1 - v, 3);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => { ctx.fillStyle = "rgba(255,255,255," + (s.a * (.6 + .4 * Math.sin(time * 2 + s.x * 20))) + ")"; ctx.beginPath(); ctx.arc(s.x * W, s.y * H * .7, s.r, 0, 6.283); ctx.fill(); });
      if (shooting) {
        const q = shooting, tail = 70;
        const g = ctx.createLinearGradient(q.x, q.y, q.x - q.vx * tail, q.y - q.vy * tail);
        g.addColorStop(0, "rgba(255,255,255," + q.life + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * tail, q.y - q.vy * tail); ctx.stroke();
      }
      ctx.lineWidth = 1;
      [.4, .8, 1.15].forEach((rr, ri) => {
        ctx.strokeStyle = "rgba(16,185,129," + ((.22 - ri * .05) * Math.min(1, grow * 2)) + ")";
        ctx.beginPath();
        for (let a = 0; a <= 64; a++) { const q = P(Math.cos(a / 64 * 6.283) * rr, 0, Math.sin(a / 64 * 6.283) * rr); a ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
        ctx.stroke();
      });
      proj = nodes.map(n => { const g = ease(growOf(n)); return { n, g, b: P(n.x, 0, n.z), tp: P(n.x, n.h * g, n.z) }; });
      ctx.strokeStyle = "rgba(255,255,255,.1)";
      links.forEach(l => { const a = proj[l[0]].b, b = proj[l[1]].b; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
      if (grow >= 1) pulses.forEach(q => {
        const a = proj[q.l[0]].b, b = proj[q.l[1]].b, px = a.x + (b.x - a.x) * q.p, py = a.y + (b.y - a.y) * q.p;
        const rg = ctx.createRadialGradient(px, py, 0, px, py, 5);
        rg.addColorStop(0, "rgba(167,243,208,.9)"); rg.addColorStop(1, "rgba(167,243,208,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(px, py, 5, 0, 6.283); ctx.fill();
      });
      ripples.forEach(rp => {
        const n = nodes[rp.i], s = 1 - rp.life;
        ctx.strokeStyle = hexA(n.col, rp.life * .8); ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let a = 0; a <= 40; a++) { const q = P(n.x + Math.cos(a / 40 * 6.283) * s * .3, 0, n.z + Math.sin(a / 40 * 6.283) * s * .3); a ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
        ctx.stroke();
      });
      proj.slice().sort((p, q) => q.b.z - p.b.z).forEach(p => {
        const n = p.n, on = n.i === hover || n.i === selIdx, b = p.b, tp = p.tp, sz = Math.max(.6, b.s / 220);
        if (p.g <= 0) return;
        ctx.fillStyle = hexA(n.col, .35 * p.g);
        ctx.beginPath(); ctx.ellipse(b.x, b.y, 7 * sz, 3 * sz, 0, 0, 6.283); ctx.fill();
        if (!n.known) {
          const ph = (time * .8 + n.i * .37) % 1;
          ctx.strokeStyle = hexA(n.col, .7 * (1 - ph) * p.g);
          ctx.beginPath(); ctx.ellipse(b.x, b.y, (6 + ph * 18) * sz, (2.6 + ph * 7) * sz, 0, 0, 6.283); ctx.stroke();
        }
        if (n.i === selIdx) {
          // A soft beam of light over the chosen court.
          const bg = ctx.createLinearGradient(tp.x, tp.y, tp.x, tp.y - 120 * sz);
          bg.addColorStop(0, hexA(n.col, .45)); bg.addColorStop(1, hexA(n.col, 0));
          ctx.fillStyle = bg; ctx.fillRect(tp.x - 6 * sz, tp.y - 120 * sz, 12 * sz, 120 * sz);
        }
        const g = ctx.createLinearGradient(b.x, b.y, tp.x, tp.y);
        g.addColorStop(0, hexA(n.col, .05)); g.addColorStop(1, hexA(n.col, .95));
        ctx.strokeStyle = g; ctx.lineWidth = (on ? 5 : 3.2) * sz; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tp.x, tp.y); ctx.stroke();
        const glow = (on ? 18 : 11) * sz * (.6 + .4 * p.g);
        const rg = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, glow);
        rg.addColorStop(0, "rgba(255,255,255,.95)"); rg.addColorStop(.25, hexA(n.col, .9)); rg.addColorStop(1, hexA(n.col, 0));
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(tp.x, tp.y, glow, 0, 6.283); ctx.fill();
        if (on) {
          ctx.font = "600 12px 'Libre Franklin',sans-serif"; ctx.textAlign = "center";
          const label = n.c.name.length > 34 ? n.c.name.slice(0, 33) + "…" : n.c.name, w = ctx.measureText(label).width + 14;
          ctx.fillStyle = "rgba(10,12,22,.82)"; ctx.fillRect(tp.x - w / 2, tp.y - 34, w, 20);
          ctx.fillStyle = "#fff"; ctx.fillText(label, tp.x, tp.y - 20);
        }
      });
      for (let i = bursts.length - 1; i >= 0; i--) {
        const q = bursts[i];
        if (q.life <= 0) { bursts.splice(i, 1); continue; }
        ctx.fillStyle = hexA(q.col, q.life); ctx.beginPath(); ctx.arc(q.x, q.y, 2.2 * q.life + .4, 0, 6.283); ctx.fill();
      }
    };
    const angDiff = (a, b) => { let d = (b - a) % 6.283; if (d > 3.1416) d -= 6.283; if (d < -3.1416) d += 6.283; return d; };
    const frame = ts => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, last ? (ts - last) / 1000 : 0);
      last = ts;
      if (!visible || document.hidden || !W) return;
      if (!still) {
        time += dt;
        if (started && grow < 1) {
          // Entrance: the pillars rise while the camera settles into place.
          grow = Math.min(1, grow + dt / 1.8);
          const e = ease(grow);
          pitch = 1.32 + (.95 - 1.32) * e; zoom = .78 + (1 - .78) * e;
        }
        if (flyTo != null) {
          const d = angDiff(rot, flyTo);
          rot += d * Math.min(1, dt * 4);
          if (Math.abs(d) < .002) flyTo = null;
        } else if (!drag) {
          rot += vel * dt;
          vel *= Math.pow(.05, dt);
          if (Math.abs(vel) < .02 && time > idleUntil) rot += dt * .16;
        }
        stars.forEach(s => { s.x += s.v * dt; if (s.x > 1) s.x -= 1; });
        pulses.forEach(q => { q.p += q.v * dt; if (q.p > 1) q.p -= 1; });
        for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].life -= dt * .9; if (ripples[i].life <= 0) ripples.splice(i, 1); }
        bursts.forEach(q => { q.x += q.vx; q.y += q.vy; q.vy += .06; q.life -= .02; });
        nextShoot -= dt;
        if (!shooting && nextShoot <= 0) { shooting = { x: Math.random() * W * .7 + W * .2, y: Math.random() * H * .25, vx: -4.5, vy: 1.6, life: 1 }; nextShoot = 6 + Math.random() * 8; }
        if (shooting) { shooting.x += shooting.vx; shooting.y += shooting.vy; shooting.life -= dt * 1.4; if (shooting.life <= 0) shooting = null; }
      }
      draw();
    };
    const nearest = (cx, cy, max) => {
      let best = -1, bd = max * max;
      proj.forEach(p => { const dx = p.tp.x - cx, dy = p.tp.y - cy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = p.n.i; } });
      return best;
    };
    const local = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const down = e => {
      const p = local(e);
      ptrs[e.pointerId] = p;
      const ids = Object.keys(ptrs);
      if (ids.length === 2) {
        const [a, b] = ids.map(i => ptrs[i]);
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom };
        drag = null;
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        return;
      }
      flyTo = null; vel = 0;
      drag = { x: p.x, y: p.y, rot, pitch, moved: false, id: e.pointerId, lx: p.x, lt: performance.now() };
    };
    const move = e => {
      const p = local(e);
      if (e.pointerId in ptrs) ptrs[e.pointerId] = p;
      if (pinch) {
        const ids = Object.keys(ptrs);
        if (ids.length >= 2) { const [a, b] = ids.map(i => ptrs[i]); zoom = Math.min(2.2, Math.max(.7, pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d)); if (still) draw(); }
        return;
      }
      if (drag && drag.id === e.pointerId) {
        const dx = p.x - drag.x, dy = p.y - drag.y;
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 6) { drag.moved = true; try { cv.setPointerCapture(e.pointerId); } catch (err) {} }
        if (drag.moved) {
          // Dragging right turns the city to the right, as if you were spinning a globe.
          rot = drag.rot + dx * .009;
          pitch = Math.min(1.3, Math.max(.45, drag.pitch + dy * .004));
          const now = performance.now();
          if (now - drag.lt > 0) vel = vel * .5 + ((p.x - drag.lx) * .009 / ((now - drag.lt) / 1000)) * .5;
          drag.lx = p.x; drag.lt = now;
          if (still) draw();
        }
      } else if (e.pointerType === "mouse") {
        hover = nearest(p.x, p.y, 26);
        cv.style.cursor = hover >= 0 ? "pointer" : "";
        if (still) draw();
      }
    };
    const up = e => {
      delete ptrs[e.pointerId];
      if (pinch) { if (Object.keys(ptrs).length < 2) pinch = null; return; }
      if (!drag) return;
      const wasTap = !drag.moved;
      if (performance.now() - drag.lt > 90) vel = 0;
      drag = null;
      idleUntil = time + 2.5;
      if (!wasTap) return;
      vel = 0;
      const p = local(e), i = nearest(p.x, p.y, 30);
      selIdx = i;
      setSel(i >= 0 ? nodes[i].c : null);
      if (i >= 0) {
        const n = nodes[i], tp = proj.find(q => q.n.i === i).tp;
        for (let j = 0; j < 30; j++) { const a = Math.random() * 6.283, v = Math.random() * 3 + 1; bursts.push({ x: tp.x, y: tp.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, life: 1, col: n.col }); }
        ripples.push({ i, life: 1 }, { i, life: 1.35 });
        if (!still && n.r > .05) { flyTo = Math.atan2(-n.x, -n.z); idleUntil = time + 6; }
        if (navigator.vibrate) navigator.vibrate(12);
      }
      if (still) draw();
    };
    const leave = () => { hover = -1; };
    const cancel = e => { delete ptrs[e.pointerId]; drag = null; pinch = null; };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", cancel);
    cv.addEventListener("pointerleave", leave);
    resize();
    let ro = null, io = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(() => { resize(); if (still) draw(); }); ro.observe(cv); }
    if (window.IntersectionObserver) io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) started = true; }, { threshold: .35 });
    if (io) io.observe(cv); else started = true;
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); ro && ro.disconnect(); io && io.disconnect();
      cv.removeEventListener("pointerdown", down); cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up); cv.removeEventListener("pointercancel", cancel); cv.removeEventListener("pointerleave", leave);
    };
  }, []);
  // One legend entry per label actually on the map (Sibiu's satellite scores split into Bun / Degradat / Dispărut).
  const legend = [];
  COURTS.forEach(c => { const v = courtStatusView(c, t); if (!legend.some(l => l.label === v.label)) legend.push(v); });
  const anyUnknown = COURTS.some(c => c.condition == null);
  return React.createElement("section", { className: "section" },
    React.createElement("div", { className: "container" },
      React.createElement("h2", { className: "section-title" }, "🌌 ", L3("Orașul, în 3D", "The city, in 3D", "A város 3D-ben")),
      React.createElement("p", { className: "section-sub" }, !anyUnknown ? L3(
        "Fiecare stâlp e un teren real, așezat după coordonatele lui. Înălțimea arată starea (1–5); stadioanele sunt cele mai înalte.",
        "Each pillar is a real court, placed by its coordinates. Height shows its condition (1–5); the stadiums stand tallest.",
        "Minden oszlop egy valódi pálya a koordinátái szerint. A magasság az állapotot (1–5) mutatja; a stadionok a legmagasabbak.") : L3( // TODO: HU review
        "Fiecare stâlp e un teren real, așezat după coordonatele lui. Înălțimea arată starea (1–5) acolo unde a fost evaluată; punctele care pulsează nu au fost încă verificate.",
        "Each pillar is a real court, placed by its coordinates. Height shows its condition (1–5) where it has been rated; pulsing dots haven't been checked yet.",
        "Minden oszlop egy valódi pálya a koordinátái szerint. A magasság az állapotot (1–5) mutatja, ahol értékelték; a pulzáló pontokat még nem ellenőrizték.")),
      React.createElement("div", { className: "cc-wrap" },
        React.createElement("canvas", { ref: cvRef, role: "img", "aria-label": L3("Harta 3D a terenurilor", "3D map of the courts", "A pályák 3D térképe") }),
        React.createElement("div", { className: "cc-legend", "aria-hidden": "true" },
          legend.map(v => React.createElement("span", { key: v.label, style: { "--c": v.color } }, v.label.replace(/ · \d\/5$/, "")))),
        React.createElement("div", { className: "cc-info" },
          sel
            ? React.createElement(React.Fragment, null,
                React.createElement("span", null, "📍 ", React.createElement("b", null, sel.name), " · ", courtStatusView(sel, t).label),
                React.createElement("button", { className: "btn btn-sm btn-green", onClick: () => { location.hash = "#court-" + sel.id; } }, L3("Deschide →", "Open →", "Megnyitás →")))
            : React.createElement("span", null, "👆 ", L3("Rotește cu degetul · mărește cu două degete · atinge un stâlp", "Spin with a finger · pinch to zoom · tap a pillar", "Forgasd egy ujjal · két ujjal nagyíts · érints meg egy oszlopot")))
      )
    )
  );
}
