import { useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useEffect, useRef } from "../../lib/react.js";
 // TODO: HU review

/* ============================================================
   CIVIC MOMENTUM ENGINE — live Firebase canvas constellation
   Signatures orbit a pulsing core; ghost-shot replays on a
   straight rim prove the court is at fault, not the player.
   ============================================================ */
export function CivicMomentum() {
  var cvRef = useRef(null);
  var app = useApp(); var lang = app.lang;
  var L3 = function (ro, en, hu) { return lang === "en" ? en : lang === "hu" ? (hu || ro) : ro; };
  var votes = useFirebase("votes");
  var total = votes ? (votes.flip || 0) + (votes.mural || 0) + (votes.both || 0) : 0;
  var nextMs = [50, 100, 200, 500, 1000, 2000, 5000].find(function (m) { return m > total; }) || total;
  var totalRef = useRef(0);
  totalRef.current = total;
  useEffect(function () {
    var cv = cvRef.current; if (!cv) return;
    var ctx = cv.getContext("2d");
    var W = 0, H = 240, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var raf, lastT = 0, shown = -1, parts = [], flyers = [], flash = 0;
    var still = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
    // Three tilted orbits around one sphere; each signature is a particle on one of them.
    var ORBITS = [{ rx: 70, tilt: -0.32, sq: 0.28, sp: 0.55 }, { rx: 96, tilt: 0.38, sq: 0.24, sp: -0.38 }, { rx: 118, tilt: -0.08, sq: 0.2, sp: 0.26 }];
    var COLS = ["#34D399", "#10B981", "#5EEAD4", "#A7F3D0"];
    function resize() {
      W = (cv.parentNode && cv.parentNode.clientWidth) || 480;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);
    function mk(i) {
      return { o: i % 3, a: (i * 2.399) % (Math.PI * 2), sz: 1.6 + ((i * 7) % 10) / 6, c: COLS[i % COLS.length], j: ((i * 13) % 9 - 4) };
    }
    function sync() {
      var n = Math.min(totalRef.current, 180);
      if (shown < 0) { parts = []; for (var i = 0; i < n; i++) parts.push(mk(i)); shown = n; return; }
      while (shown < n) { var p = mk(shown); flyers.push({ p: p, t: 0 }); shown++; flash = 1; }
    }
    function pos(p, k, cx, cy) {
      var o = ORBITS[p.o], r = o.rx + p.j * (o.rx / 70) * 0.6;
      var x = Math.cos(p.a) * r, y = Math.sin(p.a) * r * o.sq;
      var c = Math.cos(o.tilt), s = Math.sin(o.tilt);
      var sc = k == null ? 1 : k;
      return { x: cx + (x * c - y * s) * sc, y: cy + (x * s + y * c) * sc, front: Math.sin(p.a) > 0 };
    }
    function drawOrbit(o, cx, cy, front) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.tilt); ctx.scale(1, o.sq);
      ctx.beginPath(); ctx.arc(0, 0, o.rx, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
      ctx.restore();
      ctx.strokeStyle = front ? "rgba(52,211,153,.32)" : "rgba(52,211,153,.12)"; ctx.lineWidth = 1; ctx.stroke();
    }
    function dot(q, p, alpha) {
      var depth = q.front ? 1 : 0.55;
      ctx.globalAlpha = alpha * (q.front ? 1 : 0.45);
      ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = q.front ? 8 : 2;
      ctx.beginPath(); ctx.arc(q.x, q.y, p.sz * depth, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    function sphere(cx, cy, t) {
      var R = 30 + Math.sin(t / 900) * 1.2 + flash * 4;
      var halo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 2.6);
      halo.addColorStop(0, "rgba(16,185,129," + (0.28 + flash * 0.3) + ")"); halo.addColorStop(1, "rgba(16,185,129,0)");
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 2.6, 0, Math.PI * 2); ctx.fill();
      // lit from the top-left: highlight, body, dark rim = a 3D ball without WebGL
      var g = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.1, cx, cy, R);
      g.addColorStop(0, "#D1FAE5"); g.addColorStop(0.25, "#34D399"); g.addColorStop(0.7, "#059669"); g.addColorStop(1, "#064E3B");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.lineWidth = 1;
      for (var k = -1; k <= 1; k++) { ctx.beginPath(); ctx.ellipse(cx, cy + k * R * 0.42, R, R * 0.16, 0, 0, Math.PI * 2); ctx.stroke(); }
      var m = (t / 4000) % 1; ctx.beginPath(); ctx.ellipse(cx + (m - 0.5) * R * 1.2, cy, R * 0.22, R, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    function draw(t) {
      var dt = still ? 0 : Math.min(t - lastT, 50) / 1000; lastT = t;
      sync();
      var cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) { p.a += ORBITS[p.o].sp * dt; });
      var back = [], front = [];
      parts.forEach(function (p) { var q = pos(p, 1, cx, cy); (q.front ? front : back).push([q, p]); });
      ORBITS.forEach(function (o) { drawOrbit(o, cx, cy, false); });
      back.forEach(function (e) { dot(e[0], e[1], 1); });
      sphere(cx, cy, t);
      ORBITS.forEach(function (o) { drawOrbit(o, cx, cy, true); });
      front.forEach(function (e) { dot(e[0], e[1], 1); });
      // a new signature flies in from outside and settles on its orbit
      flyers = flyers.filter(function (f) {
        f.t += dt * 0.9; f.p.a += ORBITS[f.p.o].sp * dt;
        var k = 1 + Math.pow(1 - Math.min(f.t, 1), 2) * 3, q = pos(f.p, k, cx, cy);
        dot(q, f.p, Math.min(1, f.t * 2));
        if (f.t >= 1) { parts.push(f.p); return false; }
        return true;
      });
      flash = Math.max(0, flash - dt * 1.2);
      if (!still || flyers.length) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return function () { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  var pct = nextMs > 0 ? Math.min(100, Math.round(total / nextMs * 100)) : 100;
  return React.createElement("div", { className: "civic-orb" },
    React.createElement("p", { className: "co-kicker" }, "● " + L3("Impuls civic în timp real", "Live civic momentum", "Élő civil lendület")),
    React.createElement("canvas", { ref: cvRef, style: { display: "block", width: "100%", height: 240 }, role: "img",
      "aria-label": L3(total + " semnături, fiecare e o particulă pe orbită", total + " signatures, each one a particle in orbit", total + " aláírás") }),
    React.createElement("div", { className: "co-num" }, React.createElement("b", null, total), " " + L3("semnături", "signatures", "aláírás")),
    total < nextMs && React.createElement("div", { className: "co-goal" },
      React.createElement("div", { className: "co-bar" }, React.createElement("span", { style: { width: pct + "%" } })),
      React.createElement("span", null, L3("Încă " + (nextMs - total) + " până la " + nextMs, (nextMs - total) + " more to reach " + nextMs, "Még " + (nextMs - total) + " a(z) " + nextMs + "-ig"))),
    React.createElement("p", { className: "co-note" }, L3("Fiecare semnătură e o particulă pe orbită. Semnezi și tu? Apare una nouă, în direct.",
      "Every signature is a particle in orbit. Sign, and a new one appears live.",
      "Minden aláírás egy részecske a pályán. Írd alá, és megjelenik egy új.")));
}
