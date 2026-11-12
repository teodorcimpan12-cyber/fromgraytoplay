import { useApp } from "../app/core.js";
import { useEffect, useRef, useState } from "../lib/react.js";
 // TODO: HU review

/* === #2 Shoot-a-Hoop petition hook — 2D canvas, rigged bent rim.
   The rim always deflects; after 2 throws the overlay invites a signature. === */
export function HoopGame(props) {
  var onDone = props.onDone;
  var app = useApp();
  var t = app.t;
  var tRef = useRef(t);
  tRef.current = t;
  var cvRef = useRef(null);
  var overSt = useState(false);
  var over = overSt[0], setOver = overSt[1];
  var proofSt = useState(0);
  var proofs = proofSt[0], setProofs = proofSt[1];
  var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  useEffect(function () {
    var cv = cvRef.current;
    if (rm || !cv) return;
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var H = 380, W = 560;
    // Real-world units (metres, seconds). y is height above the court.
    var G = 9.81, BALL_R = 0.12, TIP_R = 0.012, RIM_H = 3.05, RIM_L = 0.45;
    var E_RIM = 0.55, E_BOARD = 0.62, E_FLOOR = 0.78, E_CRACK = 0.5, VMAX = 7, DRAG_MAX = 120, SUB = 1 / 240;
    var S, groundY, hoopX, release, cracks;
    function layout() {
      W = (cv.parentNode && cv.parentNode.clientWidth) || 560;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      groundY = H - 44;
      S = (groundY - 22) / 4.1;
      hoopX = (W - 46) / S;
      release = { x: 0.95, y: 2.05 };
      cracks = [0.34, 0.52, 0.71].map(function (f, i) { return { x: release.x + 0.6 + (hoopX - release.x - 1) * f, w: 0.13, tilt: i % 2 ? 0.24 : -0.2 }; });
    }
    layout();
    function px(x) { return x * S; }
    function py(y) { return groundY - y * S; }

    // Bent rim: the tube is folded back on itself, so the gap between the tips is 20 cm (ball: 24 cm).
    function geo(bent) {
      var back = { x: hoopX - 0.15, y: RIM_H };
      if (!bent) return { back: back, front: { x: back.x - RIM_L, y: RIM_H }, tube: null };
      var kink = { x: back.x - 0.3, y: RIM_H - 0.05 };
      var front = { x: back.x - 0.193, y: RIM_H - 0.112 };
      return { back: back, front: front, kink: kink, tube: [back, kink, front] };
    }
    var BENT = geo(true), STRAIGHT = geo(false);
    var GAP_CM = Math.round((Math.hypot(BENT.back.x - BENT.front.x, BENT.back.y - BENT.front.y) - 2 * TIP_R) * 100);

    function hitCircle(b, cx, cy, r, e) {
      var dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy), min = BALL_R + r;
      if (d >= min || d === 0) return 0;
      var nx = dx / d, ny = dy / d;
      b.x = cx + nx * min; b.y = cy + ny * min;
      var vn = b.vx * nx + b.vy * ny;
      if (vn >= 0) return 0;
      b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny;
      return -vn;
    }
    function hitSegment(b, a, c, r, e) {
      var vx = c.x - a.x, vy = c.y - a.y, u = ((b.x - a.x) * vx + (b.y - a.y) * vy) / (vx * vx + vy * vy);
      u = Math.max(0, Math.min(1, u));
      return hitCircle(b, a.x + vx * u, a.y + vy * u, r, e);
    }
    function hitRect(b, x0, y0, x1, y1, e) {
      return hitCircle(b, Math.max(x0, Math.min(b.x, x1)), Math.max(y0, Math.min(b.y, y1)), 0, e);
    }
    function crackAt(x) {
      for (var i = 0; i < cracks.length; i++) if (Math.abs(x - cracks[i].x) < cracks[i].w) return cracks[i];
      return null;
    }

    // One physics substep. Returns event flags for sound/visuals.
    function sub(b, g, dt) {
      var ev = { rim: 0, board: 0, floor: 0, crack: null, scored: false };
      b.vy -= G * dt;
      var prevY = b.y;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (g.tube) {
        ev.rim = Math.max(hitSegment(b, g.tube[0], g.tube[1], TIP_R, E_RIM), hitSegment(b, g.tube[1], g.tube[2], TIP_R, E_RIM));
      } else {
        ev.rim = Math.max(hitCircle(b, g.front.x, g.front.y, TIP_R, E_RIM), hitCircle(b, g.back.x, g.back.y, TIP_R, E_RIM));
        if (prevY > RIM_H && b.y <= RIM_H && b.vy < 0 && b.x > g.front.x + TIP_R && b.x < g.back.x - TIP_R) ev.scored = true;
      }
      ev.board = Math.max(hitRect(b, hoopX, 2.9, hoopX + 0.05, 3.95, E_BOARD), hitRect(b, hoopX + 0.05, 0, hoopX + 0.13, 2.9, E_BOARD));
      ev.board = Math.max(ev.board, hitSegment(b, { x: hoopX, y: RIM_H }, g.back, 0.01, E_RIM));
      if (b.y - BALL_R <= 0) {
        var c = crackAt(b.x), tilt = c ? c.tilt : 0, e = c ? E_CRACK : E_FLOOR;
        var nx = Math.sin(tilt), ny = Math.cos(tilt);
        b.y = BALL_R;
        var vn = b.vx * nx + b.vy * ny;
        if (vn < 0) {
          b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny;
          b.vx *= 0.92;
          ev.floor = -vn; ev.crack = c && -vn > 0.8 ? c : null;
        } else {
          b.vx *= 0.995;
        }
      }
      b.spin = (b.spin || 0) + (b.vx / BALL_R) * dt;
      return ev;
    }
    function launchVel(d) {
      var dx = release.x - d.x, dy = release.y - d.y;
      var dist = Math.hypot(dx, dy) * S, k = Math.min(dist, DRAG_MAX) / DRAG_MAX * VMAX / (Math.hypot(dx, dy) || 1);
      return { vx: dx * k, vy: dy * k, speed: Math.min(dist, DRAG_MAX) / DRAG_MAX * VMAX };
    }
    // Replays the same shot on an undamaged rim to see if it would have gone in.
    function ghostShot(v0) {
      var b = { x: release.x, y: release.y, vx: v0.vx, vy: v0.vy }, path = [];
      for (var i = 0; i < 4 / SUB; i++) {
        var ev = sub(b, STRAIGHT, SUB);
        if (i % 6 === 0) path.push({ x: b.x, y: b.y });
        if (ev.scored) { path.push({ x: b.x, y: b.y }); return { scored: true, path: path }; }
        if (b.y <= BALL_R + 0.001 && Math.abs(b.vy) < 0.3) break;
      }
      return { scored: false, path: path };
    }

    var ball = { x: release.x, y: release.y, vx: 0, vy: 0, spin: 0 };
    var flying = false, drag = null, throws = 0, finished = false, launchT = 0, clangT = 0, crackT = 0, crackMark = null;
    var shake = 0, particles = [], THROWS_MAX = 3, shots = [], ghost = null, lastResult = null, proofCount = 0, acc = 0;

    function spark(x, y, n, col) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, s = 1.2 + Math.random() * 2.2;
        particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s + 1, life: 1, r: 1.5 + Math.random() * 2, col: col || (Math.random() > 0.4 ? "#F97316" : "#FCD34D") });
      }
    }
    function endThrow() {
      flying = false;
      shots.push(ghost && ghost.scored);
      lastResult = { proof: ghost && ghost.scored };
      if (ghost) ghost.at = performance.now();
      if (ghost && ghost.scored) { proofCount++; setProofs(proofCount); }
      throws += 1;
      ball.x = release.x; ball.y = release.y; ball.vx = 0; ball.vy = 0;
      if (throws >= THROWS_MAX) { finished = true; setTimeout(function () { setOver(true); }, 900); }
    }
    function step(dt) {
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.vy -= G * 0.6 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.4;
        if (p.life <= 0) particles.splice(i, 1);
      }
      if (shake > 0.2) shake *= 0.85; else shake = 0;
      if (!flying) return;
      acc += dt;
      while (acc >= SUB) {
        acc -= SUB;
        var ev = sub(ball, BENT, SUB);
        if (ev.rim > 0.6) { clangT = performance.now(); shake = Math.min(8, ev.rim * 1.3); spark(ball.x - BALL_R * 0.5, ball.y, 10); }
        if (ev.board > 0.6) { shake = Math.min(5, ev.board); spark(hoopX, ball.y, 5, "#E5E7EB"); }
        if (ev.crack) { crackT = performance.now(); crackMark = ev.crack; spark(ball.x, 0.02, 6, "#9CA3AF"); }
      }
      var resting = ball.y <= BALL_R + 0.002 && Math.abs(ball.vy) < 0.4 && Math.abs(ball.vx) < 0.4;
      if (resting || ball.x < -1 || ball.x > hoopX + 2 || performance.now() - launchT > 6500) endThrow();
    }

    function drawBall(bx, by, alpha) {
      var r = BALL_R * S;
      ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
      ctx.translate(px(bx), py(by)); ctx.rotate(-ball.spin);
      var grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
      grad.addColorStop(0, "#FF9A45"); grad.addColorStop(0.55, "#F97316"); grad.addColorStop(1, "#B45309");
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(90,35,0,.7)"; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.bezierCurveTo(r * 0.55, -r * 0.5, r * 0.55, r * 0.5, 0, r); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.bezierCurveTo(-r * 0.55, -r * 0.5, -r * 0.55, r * 0.5, 0, r); ctx.stroke();
      ctx.restore();
    }
    function label(text, x, y, color, align) {
      ctx.font = "bold 10px 'Space Mono',monospace"; ctx.textAlign = align || "center";
      var w = ctx.measureText(text).width + 10, lx = align === "right" ? x - w + 5 : align === "left" ? x - 5 : x - w / 2;
      ctx.fillStyle = "rgba(8,13,23,.82)"; ctx.fillRect(lx, y - 11, w, 15);
      ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.textAlign = "left";
    }

    function draw() {
      var now = performance.now(), tt = tRef.current;
      var sx = shake ? (Math.random() - 0.5) * shake : 0, sy = shake ? (Math.random() - 0.5) * shake : 0;
      ctx.save(); ctx.translate(sx, sy);
      var sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, "#080D17"); sky.addColorStop(1, "#111827");
      ctx.fillStyle = sky; ctx.fillRect(-10, -10, W + 20, H + 20);
      var fl = ctx.createLinearGradient(0, groundY, 0, H);
      fl.addColorStop(0, "#2A2F38"); fl.addColorStop(1, "#1A1D23");
      ctx.fillStyle = fl; ctx.fillRect(-10, groundY, W + 20, H - groundY + 10);
      ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
      // Cracks: drawn where the floor normal is actually tilted in the physics.
      cracks.forEach(function (c) {
        var cx = px(c.x), hw = c.w * S, lit = crackMark === c && now - crackT < 900;
        ctx.strokeStyle = lit ? "#F97316" : "rgba(0,0,0,.75)"; ctx.lineWidth = lit ? 2 : 1.4;
        ctx.beginPath(); ctx.moveTo(cx - hw, groundY + 1);
        ctx.lineTo(cx - hw * 0.3, groundY + 6); ctx.lineTo(cx + hw * 0.2, groundY + 2); ctx.lineTo(cx + hw, groundY + 9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - hw * 0.3, groundY + 6); ctx.lineTo(cx - hw * 0.1, groundY + 18); ctx.stroke();
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.beginPath(); ctx.moveTo(cx - hw, groundY); ctx.lineTo(cx + hw, groundY + (c.tilt > 0 ? -3 : 3)); ctx.lineTo(cx + hw, groundY); ctx.closePath(); ctx.fill();
        if (lit) label(tt.hoopCrack || "Fisură", cx, groundY - 8, "#F97316");
      });
      // Pole + backboard + arm
      ctx.fillStyle = "#6B7280"; ctx.fillRect(px(hoopX + 0.05), py(2.9), (0.08) * S, py(0) - py(2.9));
      ctx.fillStyle = "#D7DDE4"; ctx.fillRect(px(hoopX), py(3.95), 0.05 * S, (3.95 - 2.9) * S);
      ctx.strokeStyle = "#F97316"; ctx.lineWidth = 1.2; ctx.strokeRect(px(hoopX) + 0.5, py(3.5), 0.05 * S - 1, 0.45 * S);
      ctx.strokeStyle = "#6B7280"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(px(hoopX), py(RIM_H)); ctx.lineTo(px(BENT.back.x), py(BENT.back.y)); ctx.stroke();
      // Ghost: where a proper rim would be.
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(16,185,129,.55)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px(STRAIGHT.front.x), py(RIM_H)); ctx.lineTo(px(STRAIGHT.back.x), py(RIM_H)); ctx.stroke();
      ctx.setLineDash([]);
      // Torn net hanging from the bent tube
      ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 0.9;
      [[BENT.back, 0.34], [BENT.kink, 0.22], [BENT.front, 0.4]].forEach(function (n) {
        ctx.beginPath(); ctx.moveTo(px(n[0].x), py(n[0].y)); ctx.lineTo(px(n[0].x) + 2, py(n[0].y - n[1])); ctx.stroke();
      });
      // Bent rim tube
      var fresh = now - clangT < 200;
      ctx.strokeStyle = fresh ? "#FFFFFF" : "#F97316"; ctx.lineWidth = Math.max(3, TIP_R * 2 * S + 1.5); ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(px(BENT.back.x), py(BENT.back.y)); ctx.lineTo(px(BENT.kink.x), py(BENT.kink.y)); ctx.lineTo(px(BENT.front.x), py(BENT.front.y)); ctx.stroke();
      // Ghost path of the last throw on a straight rim
      if (ghost && ghost.path.length && !flying && (finished || now - ghost.at < 3000)) {
        ctx.fillStyle = ghost.scored ? "rgba(16,185,129,.7)" : "rgba(156,163,175,.45)";
        ghost.path.forEach(function (p, i) { if (i % 2 === 0) { ctx.beginPath(); ctx.arc(px(p.x), py(p.y), 1.6, 0, Math.PI * 2); ctx.fill(); } });
        if (ghost.scored) { var gp = ghost.path[ghost.path.length - 1]; drawBall(gp.x, gp.y, 0.35); }
      }
      // Shooter
      var hx = px(0.55), feet = groundY;
      ctx.strokeStyle = "#9CA3AF"; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(hx, py(1.72), 0.11 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx, py(1.6)); ctx.lineTo(hx, py(0.95)); ctx.lineTo(hx - 0.18 * S, feet); ctx.moveTo(hx, py(0.95)); ctx.lineTo(hx + 0.18 * S, feet); ctx.stroke();
      var hand = flying ? { x: release.x - 0.1, y: release.y + 0.1 } : ball;
      ctx.beginPath(); ctx.moveTo(hx, py(1.45)); ctx.lineTo(px(hand.x), py(hand.y)); ctx.stroke();
      // Aim preview: identical physics, until the first contact.
      if (drag && !flying) {
        var v = launchVel(drag), b = { x: release.x, y: release.y, vx: v.vx, vy: v.vy };
        for (var i = 0; i < 1.8 / SUB; i++) {
          var ev = sub(b, BENT, SUB);
          if (ev.rim || ev.board || ev.floor) break;
          if (i % 10 === 0) { ctx.globalAlpha = 0.55 * (1 - i * SUB / 1.8); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px(b.x), py(b.y), 2, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
        label(v.speed.toFixed(1) + " m/s", px(release.x), py(release.y) - 22, "#E5E7EB");
      }
      drawBall(ball.x, ball.y);
      particles.forEach(function (p) {
        ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(px(p.x), py(p.y), p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      // Measurements that explain the miss.
      label((tt.hoopGap || "Bent rim: {g} cm gap · ball 24 cm").replace("{g}", GAP_CM), W - 10, H - 14, "#FCD34D", "right");
      if (fresh) label(tt.hoopBent || "BENT!", px(BENT.kink.x), py(BENT.kink.y) - 14, "#F97316");
      if (lastResult && !flying && (finished || now - ghost.at < 3000)) {
        label(lastResult.proof ? (tt.hoopProof || "On a proper rim this shot scores ✓") : (tt.hoopFairMiss || "That one would miss on a proper rim too"),
          W / 2, 44, lastResult.proof ? "#10B981" : "#9CA3AF");
      }
      for (var si = 0; si < THROWS_MAX; si++) {
        ctx.fillStyle = si < shots.length ? (shots[si] ? "#10B981" : "#F97316") : "rgba(255,255,255,.22)";
        ctx.beginPath(); ctx.arc(20 + si * 16, 18, 5, 0, Math.PI * 2); ctx.fill();
      }
      if (!flying && !finished && !drag) {
        ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = "10px 'Space Mono',monospace"; ctx.textAlign = "center";
        ctx.fillText(tt.hoopHint, W / 2, 22); ctx.textAlign = "left";
      }
      ctx.restore();
    }

    var raf, last = performance.now();
    function loop(now) {
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      step(dt); draw();
      if (!finished || particles.length || shake) raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    function toWorld(e) {
      var r = cv.getBoundingClientRect();
      var x = (e.clientX - r.left) * (W / r.width), y = (e.clientY - r.top) * (H / r.height);
      return { x: x / S, y: (groundY - y) / S };
    }
    function down(e) {
      if (finished || flying) return;
      var p = toWorld(e);
      if (Math.hypot(p.x - ball.x, p.y - ball.y) * S < 60) {
        drag = { x: ball.x, y: ball.y };
        if (cv.setPointerCapture && e.pointerId != null) { try { cv.setPointerCapture(e.pointerId); } catch (err) {} }
        e.preventDefault();
      }
    }
    function move(e) {
      if (!drag) return;
      var p = toWorld(e), dx = p.x - release.x, dy = p.y - release.y, d = Math.hypot(dx, dy) * S;
      if (d > DRAG_MAX) { dx *= DRAG_MAX / d; dy *= DRAG_MAX / d; }
      drag = { x: release.x + dx, y: release.y + dy };
      ball.x = drag.x; ball.y = Math.max(BALL_R, drag.y);
      e.preventDefault();
    }
    function up() {
      if (!drag) return;
      var v = launchVel(drag);
      drag = null;
      ball.x = release.x; ball.y = release.y;
      if (v.speed < 2) return;
      ball.vx = v.vx; ball.vy = v.vy; ball.spin = 0;
      ghost = ghostShot(v); ghost.at = Infinity;
      flying = true; acc = 0; launchT = performance.now(); lastResult = null;
    }
    function onResize() { layout(); BENT = geo(true); STRAIGHT = geo(false); ball.x = release.x; ball.y = release.y; }
    window.addEventListener("resize", onResize);
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    return function () {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
    };
  }, [rm]);
  if (rm) return null;
  return React.createElement("div", { className: "card mb-2", style: { padding: 0, borderLeft: "3px solid var(--coral)", maxWidth: 600, margin: "0 auto 1.2rem" } },
    React.createElement("div", { className: "hoop-wrap" },
      React.createElement("canvas", { ref: cvRef, className: "hoop-canvas", height: 380, style: { touchAction: "none" } }),
      !over && React.createElement("button", { className: "hoop-skip", onClick: onDone }, t.hoopSkip + " →"),
      over && React.createElement("div", { className: "hoop-overlay" },
        React.createElement("p", { style: { color: "#fff", fontFamily: "'Space Mono',monospace", fontSize: ".95rem", maxWidth: 440, marginBottom: ".6rem", lineHeight: 1.55 } }, t.hoopMiss),
        proofs > 0 && React.createElement("p", { style: { color: "#10B981", fontFamily: "'Space Mono',monospace", fontSize: ".85rem", marginBottom: "1rem" } },
          (t.hoopProofCount || "{n}/3 of your shots would have scored on a proper rim.").replace("{n}", proofs)),
        React.createElement("button", { className: "btn btn-green", onClick: onDone }, t.hoopSign)
      )
    )
  );
}
