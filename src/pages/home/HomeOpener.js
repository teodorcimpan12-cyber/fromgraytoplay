import { useApp } from "../../app/core.js";
import { fxReduced } from "../../lib/fx-reduced.js";
import { useEffect, useRef } from "../../lib/react.js";
import { COURT_FRAG } from "./court-shader.glsl.js";

export function startCourtShader(canvas, host) {
  let gl = null;
  try { gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" }); } catch (e) {}
  if (!gl) return null;
  const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = mk(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"), fs = mk(gl.FRAGMENT_SHADER, COURT_FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["uRes", "uT", "uTan", "uRo", "uR", "uU", "uF", "uBall", "uMask"].forEach(k => { U[k] = gl.getUniformLocation(prog, k); });
  // Paint mask: FIELD is 34 m x 21 m around the court centre.
  const MW = 256, MH = 158, FX = 17, FY = 10.5;
  const mask = document.createElement("canvas"); mask.width = MW; mask.height = MH;
  const mc = mask.getContext("2d"); mc.fillStyle = "#000"; mc.fillRect(0, 0, MW, MH);
  const stamp = (qx, qy, r) => {
    const x = (qx / FX * .5 + .5) * MW, y = (qy / FY * .5 + .5) * MH, rr = r / (2 * FX) * MW;
    const g = mc.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
    mc.globalCompositeOperation = "lighter"; mc.fillStyle = g; mc.beginPath(); mc.arc(x, y, rr, 0, 6.2832); mc.fill();
    mc.globalCompositeOperation = "source-over";
  };
  const ballAt = t => [12.2 * Math.sin(t * .31 + .6), 5.9 * Math.sin(t * .47 + 1.9), Math.abs(Math.sin(t * 3.1)) * 2.1];
  for (let i = 0; i < 90; i++) { const b = ballAt(-i * .12); stamp(b[0], b[1], 3.4); } // the first frame already shows a painted stroke
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(U.uMask, 0);
  gl.disable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
  const coarse = !!(window.matchMedia && window.matchMedia("(pointer:coarse)").matches);
  const still = fxReduced();
  const cam = { ro: [0, 0, 0], r: [1, 0, 0], u: [0, 1, 0], f: [0, 0, 1], tan: .34, rot: 0, w: 1, h: 1 };
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  let quality = 1; // lowered automatically when frames run long
  const resize = () => {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight), dpr = Math.min(window.devicePixelRatio || 1, coarse ? 2 : 1.5) * quality;
    canvas.width = Math.max(2, Math.round(w * dpr)); canvas.height = Math.max(2, Math.round(h * dpr));
    cam.w = w; cam.h = h;
    const wide = !!(window.matchMedia && window.matchMedia("(min-width:900px)").matches);
    // Wide: the court sits bottom-right, clear of the headline. Narrow: the canvas is only the strip under the buttons, court across it.
    const ta = wide ? [-22, 0, 11] : [0, 1.2, .4];
    cam.ro = wide ? [-22, 30, -38] : [0, 12, -25];
    cam.tan = Math.tan((wide ? 39 : 31) * Math.PI / 360);
    cam.rot = 0;
    cam.f = norm([ta[0] - cam.ro[0], ta[1] - cam.ro[1], ta[2] - cam.ro[2]]);
    cam.r = norm(cross([0, 1, 0], cam.f)); cam.u = cross(cam.f, cam.r);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height); gl.uniform1f(U.uTan, cam.tan);
    gl.uniform3fv(U.uRo, cam.ro); gl.uniform3fv(U.uR, cam.r); gl.uniform3fv(U.uU, cam.u); gl.uniform3fv(U.uF, cam.f);
  };
  // Screen point -> court coordinates (same ray as the shader).
  const toCourt = (cx, cy) => {
    const rc = canvas.getBoundingClientRect();
    const px = ((cx - rc.left) / cam.w * 2 - 1) * (cam.w / cam.h) * cam.tan, py = (1 - (cy - rc.top) / cam.h * 2) * cam.tan;
    const d = [cam.r[0] * px + cam.u[0] * py + cam.f[0], cam.r[1] * px + cam.u[1] * py + cam.f[1], cam.r[2] * px + cam.u[2] * py + cam.f[2]];
    if (d[1] > -.001) return null;
    const t = -cam.ro[1] / d[1], gx = cam.ro[0] + d[0] * t, gz = cam.ro[2] + d[2] * t;
    return cam.rot ? [gz, gx] : [gx, gz];
  };
  // Play: the ball follows the pointer or finger and paints; a press makes a splash. With touch only the court strip reacts
  // (the section has touch-action: pan-y, so an up/down swipe always scrolls the page and a sideways drag paints).
  const hit = (cx, cy) => {
    const rc = canvas.getBoundingClientRect();
    if (cx < rc.left || cx > rc.right || cy < rc.top || cy > rc.bottom) return null;
    const q = toCourt(cx, cy);
    return q && Math.abs(q[0]) < FX + 3 && Math.abs(q[1]) < FY + 3 ? [Math.max(-13.4, Math.min(13.4, q[0])), Math.max(-7, Math.min(7, q[1]))] : null;
  };
  let userQ = null, userUntil = 0, splashes = [], bpos = null, lastT = 0;
  const onMove = e => {
    if (e.pointerType !== "mouse" && !e.pressure && !e.buttons) return;
    const q = hit(e.clientX, e.clientY); if (!q) return;
    stamp(q[0], q[1], 4.2); userQ = q; userUntil = performance.now() + 2400;
  };
  const onDown = e => {
    if (e.target && e.target.closest && e.target.closest("button,a,input,select")) return;
    const q = hit(e.clientX, e.clientY); if (!q) return;
    splashes.push({ q: q, t: performance.now() }); userQ = q; userUntil = performance.now() + 3000;
    host.classList.add("ao-played");
  };
  let raf = 0, visible = true, t0 = performance.now(), lastDecay = 0, skip = false, dead = false;
  const draw = now => {
    const t = (now - t0) / 1000, auto = ballAt(t), dt = Math.min(.1, Math.max(0, t - lastT)); lastT = t;
    const tgt = userQ && now < userUntil ? userQ : auto;
    if (!bpos) bpos = [auto[0], auto[1]];
    const k = 1 - Math.exp(-dt * (tgt === auto ? 2.2 : 9));
    bpos[0] += (tgt[0] - bpos[0]) * k; bpos[1] += (tgt[1] - bpos[1]) * k;
    const b = [bpos[0], bpos[1], auto[2]];
    if (!still) {
      if (b[2] < .5) stamp(b[0], b[1], 3.2);
      splashes = splashes.filter(s => now - s.t < 460);
      splashes.forEach(s => stamp(s.q[0], s.q[1], 2.5 + (now - s.t) / 460 * 6.5));
      if (now - lastDecay > 650) { lastDecay = now; mc.fillStyle = "rgba(0,0,0,.02)"; mc.fillRect(0, 0, MW, MH); }
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
    gl.uniform1f(U.uT, t); gl.uniform3f(U.uBall, b[0], b[1], still ? 0 : b[2]);
    gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  let lastNow = 0, slow = 0, fast = 0;
  const loop = now => {
    raf = 0; if (dead || !visible || document.hidden) { lastNow = 0; return; }
    // Frame budget: three long frames in a row drop the render resolution by 20% (down to 45%), so weak phones stay smooth.
    if (lastNow) { const dt = now - lastNow; if (dt > 26 && dt < 400) { fast = 0; if (++slow >= 3 && quality > .45) { slow = 0; quality = Math.max(.45, quality * .8); resize(); } } else if (dt <= 26) { slow = 0; fast++; } }
    lastNow = now;
    skip = coarse && !skip; if (!skip) draw(now); // phones render every other frame
    raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!still && !raf && !dead) raf = requestAnimationFrame(loop); };
  resize(); draw(performance.now());
  const ro = window.ResizeObserver ? new ResizeObserver(() => { resize(); draw(performance.now()); }) : null; if (ro) ro.observe(canvas);
  const io = window.IntersectionObserver ? new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); }) : null; if (io) io.observe(host);
  const onVis = () => kick();
  if (!still) {
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    kick();
  }
  return () => {
    dead = true; if (raf) cancelAnimationFrame(raf);
    if (ro) ro.disconnect(); if (io) io.disconnect();
    host.removeEventListener("pointermove", onMove); host.removeEventListener("pointerdown", onDown); host.classList.remove("ao-played");
    document.removeEventListener("visibilitychange", onVis);
    const lose = gl.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext();
  };
}
export function HomeOpener() {
  const { lang, setPage } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const go = pg => { setPage(pg); window.scrollTo(0, 0); };
  const openReport = () => { try { window.dispatchEvent(new CustomEvent("g2p:report", { detail: { courtId: "" } })); } catch (e) {} };
  const rings = [96, 76, 56, 36, 16].map(r => React.createElement("circle", { key: r, cx: 100, cy: 100, r: r }));
  const target = React.createElement("svg", { viewBox: "0 0 200 200", "aria-hidden": "true" },
    rings,
    React.createElement("path", { d: "M100 0V200M0 100H200" }),
    React.createElement("circle", { className: "dot", cx: 100, cy: 100, r: 4 }));
  const secRef = useRef(null), courtRef = useRef(null);
  // The shader court replaces the target drawing when WebGL is available.
  useEffect(() => {
    const sec = secRef.current, cv = courtRef.current;
    if (!sec || !cv) return;
    let stop = null;
    try { stop = startCourtShader(cv, sec); } catch (e) { stop = null; }
    if (!stop) return;
    sec.classList.add("ao-live");
    return () => { sec.classList.remove("ao-live"); stop(); };
  }, []);
  // Magnetic pull + 3D tilt for the three buttons, and a little parallax on the target. Mouse only; off with reduced motion / no-fx.
  useEffect(() => {
    const sec = secRef.current;
    if (!sec || !window.matchMedia || !window.matchMedia("(hover:hover) and (pointer:fine)").matches || fxReduced()) return;
    const btns = Array.prototype.slice.call(sec.querySelectorAll(".ao-btn"));
    let raf = 0, mx = 0, my = 0, inside = false;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const reset = b => { b.classList.remove("mag"); ["--tx", "--ty", "--rx", "--ry"].forEach(k => b.style.removeProperty(k)); };
    const frame = () => {
      raf = 0;
      const sr = sec.getBoundingClientRect();
      if (inside) {
        sec.style.setProperty("--px", ((mx - sr.left) / Math.max(1, sr.width) - .5).toFixed(3));
        sec.style.setProperty("--py", ((my - sr.top) / Math.max(1, sr.height) - .5).toFixed(3));
      } else { sec.style.removeProperty("--px"); sec.style.removeProperty("--py"); }
      // Only the button under the pointer (plus a 24px margin) moves, and never by more than 6px sideways:
      // the gap is ~9px, so neighbours can no longer slide into each other.
      let hot = null;
      if (inside) btns.forEach(b => {
        const r = b.getBoundingClientRect();
        if (mx >= r.left - 24 && mx <= r.right + 24 && my >= r.top - 24 && my <= r.bottom + 24) {
          const d = Math.abs(mx - (r.left + r.width / 2));
          if (!hot || d < hot.d) hot = { b, d };
        }
      });
      btns.forEach(b => {
        if (!hot || hot.b !== b) { reset(b); return; }
        const r = b.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        b.classList.add("mag");
        b.style.setProperty("--tx", clamp(dx * .08, -6, 6).toFixed(1) + "px");
        b.style.setProperty("--ty", clamp(dy * .12, -6, 6).toFixed(1) + "px");
        b.style.setProperty("--ry", (clamp(dx / (r.width / 2), -1, 1) * 6).toFixed(1) + "deg");
        b.style.setProperty("--rx", (clamp(dy / (r.height / 2), -1, 1) * -6).toFixed(1) + "deg");
        b.style.setProperty("--gx", (mx - r.left).toFixed(0) + "px");
        b.style.setProperty("--gy", (my - r.top).toFixed(0) + "px");
      });
    };
    const move = e => { mx = e.clientX; my = e.clientY; inside = true; if (!raf) raf = requestAnimationFrame(frame); };
    const leave = () => { inside = false; if (!raf) raf = requestAnimationFrame(frame); };
    sec.addEventListener("mousemove", move, { passive: true });
    sec.addEventListener("mouseleave", leave);
    return () => {
      sec.removeEventListener("mousemove", move);
      sec.removeEventListener("mouseleave", leave);
      if (raf) cancelAnimationFrame(raf);
      btns.forEach(reset);
    };
  }, []);
  const aoIcon = d => React.createElement("svg", { viewBox: "0 0 24 24" }, React.createElement("path", { d: d }));
  const btn = (cls, ic, label, fn) => React.createElement("button", { type: "button", className: "ao-btn " + cls, onClick: fn },
    React.createElement("span", { className: "ic", "aria-hidden": "true" }, ic), React.createElement("span", null, label));
  return React.createElement(React.Fragment, null,
    React.createElement("section", { className: "ao", "aria-labelledby": "ao-h1", ref: secRef },
      React.createElement("div", { className: "ao-bg", "aria-hidden": "true" }),
      React.createElement("canvas", { className: "ao-court", "aria-hidden": "true", ref: courtRef }),
      React.createElement("span", { className: "ao-hint", "aria-hidden": "true" }, L3("Atinge sau trage pe teren", "Tap or drag on the court", "Érintsd vagy húzd a pályán")), // TODO: HU review
      React.createElement("div", { className: "ao-target", "aria-hidden": "true" }, target),
      React.createElement("div", { className: "container ao-inner" },
        React.createElement("div", { className: "ao-eyebrow" }, React.createElement("span", { className: "ao-gears", "aria-hidden": "true" }, ["g1", "g2"].map(function (k) { return React.createElement("svg", { key: k, className: "ao-gear " + k, viewBox: "0 0 24 24" }, React.createElement("circle", { cx: 12, cy: 12, r: 9.5, className: "teeth" }), React.createElement("circle", { cx: 12, cy: 12, r: 6.2, className: "rim" }), React.createElement("path", { className: "spokes", d: "M12 12V5.8M12 12L17.4 15.1M12 12L6.6 15.1" })); })), L3("Asociație în constituire", "Association being established", "Egyesület alakulóban")), // TODO: HU review
        React.createElement("h1", { className: "ao-title", id: "ao-h1" },
          React.createElement("span", { className: "ao-kicker" }, L3("Asociația", "The association", "Az egyesület")),
          React.createElement("span", { className: "ao-name" }, React.createElement("b", null, "From Grey"), " ", React.createElement("em", null, "to Play"))),
        React.createElement("div", { className: "ao-block" },
          React.createElement("p", { className: "ao-msg" }, L3("Din ", "From ", ""), React.createElement("span", { className: "ao-grey" }, L3("gri", "grey", "szürkéből")), L3(", în ", ", to ", ", "), React.createElement("span", { className: "ao-play" }, L3("joc", "play", "játékba")), "."), // TODO: HU review
          React.createElement("div", { className: "ao-cta" },
            btn("go", aoIcon("M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"), L3("Semnează petiția", "Sign the petition", "Írd alá a petíciót"), () => go("petition")),
            btn("rep", aoIcon("M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z"), L3("Raportează", "Report", "Jelentsd"), openReport),
            btn("abt", aoIcon("M3 21h18M5 21V10M9.7 21V10M14.3 21V10M19 21V10M3 10l9-6 9 6z"), L3("Despre asociație", "About the association", "Az egyesületről"), () => go("association")))))),
    React.createElement("section", { className: "ao-why" },
      React.createElement("div", { className: "container" },
        React.createElement("div", null,
          React.createElement("h2", null, L3("Promovăm sănătatea și sportul prin restaurarea terenurilor de sport.", "We promote health and sport by restoring sports courts.", "Az egészséget és a sportot a sportpályák helyreállításával segítjük.")), // TODO: HU review
          React.createElement("p", null, L3("Documentăm terenurile degradate, cerem repararea lor și arătăm public ce se schimbă.", "We document degraded courts, ask for them to be repaired and show publicly what changes.", "Dokumentáljuk az elhanyagolt pályákat, kérjük a javításukat, és nyilvánosan megmutatjuk, mi változik.")))))); // TODO: HU review
}
