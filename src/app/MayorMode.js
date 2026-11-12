import { COURTS, useApp } from "./core.js";
import { useEffect, useRef, useState } from "../lib/react.js";
 // TODO: HU review

/* === #9 Mayor Mode — easter egg (type "fixit" anywhere, or via ⌘K).
   Cinematic canvas: all 5 courts flip grey → renovated, then the pitch. === */
export function MayorMode(props) {
  var onClose = props.onClose;
  var app = useApp();
  var t = app.t, setPage = app.setPage;
  var tRef = useRef(t);
  tRef.current = t;
  var cvRef = useRef(null);
  var btnSt = useState(false);
  var showBtn = btnSt[0], setShowBtn = btnSt[1];
  var rm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  useEffect(function () {
    var h = function (e) { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return function () { window.removeEventListener("keydown", h); };
  }, [onClose]);
  useEffect(function () {
    var cv = cvRef.current;
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 320, H = 320;
    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    resize();
    window.addEventListener("resize", resize);
    var N = COURTS.length;
    var flipAt = COURTS.map(function (_, i) { return rm ? 0 : 800 + i * 900; });
    var textDelay = rm ? 0 : flipAt[N - 1] + 1100;
    var spawned = COURTS.map(function () { return false; });
    var confetti = [];
    var btnShown = false;
    var CONF_COLS = ["#10B981", "#F97316", "#0D9488", "#F59E0B", "#EC4899"];
    // Static cracks per court (relative coords), generated once.
    var cracks = COURTS.map(function () {
      var lines = [];
      for (var i = 0; i < 3; i++) {
        var seg = [], x = 0.15 + Math.random() * 0.7, y = 0.15 + Math.random() * 0.7;
        for (var j = 0; j < 4; j++) { seg.push([x, y]); x += (Math.random() - 0.5) * 0.3; y += (Math.random() - 0.5) * 0.3; }
        lines.push(seg);
      }
      return lines;
    });
    function layout() {
      var cols = W > 680 ? 3 : 2;
      var rows = Math.ceil(N / cols);
      var cw = Math.min(W / cols * 0.72, 220);
      var ch = cw * 0.6;
      var out = [];
      for (var i = 0; i < N; i++) {
        var col = i % cols, row = Math.floor(i / cols);
        var inRow = row === rows - 1 ? N - cols * (rows - 1) : cols;
        var offset = (cols - inRow) * (W / cols) / 2;
        out.push({
          x: offset + (W / cols) * (col + 0.5),
          y: H * 0.1 + ((H * 0.58) / rows) * (row + 0.5),
          w: cw, h: ch
        });
      }
      return out;
    }
    function rr(x, y, w, h, r) {
      ctx.beginPath();
      if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
      ctx.rect(x, y, w, h);
    }
    function drawCourt(p, c, idx, el) {
      var flipped = el >= flipAt[idx];
      var fp = Math.max(0, Math.min(1, (el - flipAt[idx]) / 450));
      var sc = flipped && !rm ? 1 + 0.22 * Math.sin(fp * Math.PI) : 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(sc, sc);
      var w = p.w, h = p.h;
      if (!flipped) {
        ctx.fillStyle = "#3f444d";
        rr(-w / 2, -h / 2, w, h, 8); ctx.fill();
        ctx.strokeStyle = "rgba(12,12,16,.75)";
        ctx.lineWidth = 1.4;
        cracks[idx].forEach(function (seg) {
          ctx.beginPath();
          seg.forEach(function (q, k) {
            var qx = -w / 2 + Math.max(0.05, Math.min(0.95, q[0])) * w;
            var qy = -h / 2 + Math.max(0.05, Math.min(0.95, q[1])) * h;
            if (k) ctx.lineTo(qx, qy); else ctx.moveTo(qx, qy);
          });
          ctx.stroke();
        });
      } else {
        ctx.fillStyle = "#10B981";
        rr(-w / 2, -h / 2, w, h, 8); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.9)";
        ctx.lineWidth = 1.6;
        ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14);
        ctx.beginPath(); ctx.moveTo(0, -h / 2 + 7); ctx.lineTo(0, h / 2 - 7); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, h * 0.18, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(-w / 2 + 13, 0, 4, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(w / 2 - 13, 0, 4, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = "#C7CBD1";
      ctx.font = "11px 'Space Mono',monospace";
      ctx.textAlign = "center";
      ctx.fillText(c.name, p.x, p.y + p.h / 2 + 20);
      if (flipped && !spawned[idx]) {
        spawned[idx] = true;
        if (!rm) for (var i = 0; i < 16; i++) {
          confetti.push({
            x: p.x, y: p.y,
            vx: (Math.random() - 0.5) * 240,
            vy: -40 - Math.random() * 160,
            life: 1,
            color: CONF_COLS[i % CONF_COLS.length]
          });
        }
      }
    }
    var t0 = performance.now();
    var raf = null, last = t0;
    function frame(now) {
      var el = now - t0;
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var bgg = ctx.createLinearGradient(0, 0, W, H);
      bgg.addColorStop(0, "#0B0E18"); bgg.addColorStop(1, "#16213E");
      ctx.fillStyle = bgg;
      ctx.fillRect(0, 0, W, H);
      // ken burns drift
      ctx.save();
      if (!rm) {
        var s = 1.02 + 0.012 * Math.sin(el * 0.0003);
        ctx.translate(W / 2 + Math.sin(el * 0.00022) * 12, H / 2 + Math.cos(el * 0.00018) * 9);
        ctx.scale(s, s);
        ctx.translate(-W / 2, -H / 2);
      }
      var pos = layout();
      COURTS.forEach(function (c, i) { drawCourt(pos[i], c, i, el); });
      // confetti
      for (var i = confetti.length - 1; i >= 0; i--) {
        var cf = confetti[i];
        cf.vy += 320 * dt;
        cf.x += cf.vx * dt;
        cf.y += cf.vy * dt;
        cf.life -= dt * 1.1;
        if (cf.life <= 0) { confetti.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, cf.life);
        ctx.fillStyle = cf.color;
        ctx.fillRect(cf.x - 2, cf.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      // type-on pitch
      var tt = tRef.current;
      if (el >= textDelay) {
        var n1 = rm ? tt.mayorLine1.length : Math.floor((el - textDelay) / 45);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px 'Space Mono',monospace";
        ctx.textAlign = "center";
        ctx.fillText(tt.mayorLine1.slice(0, n1), W / 2, H * 0.78);
        var d2 = textDelay + tt.mayorLine1.length * 45 + 350;
        if (el >= d2) {
          var n2 = rm ? tt.mayorLine2.length : Math.floor((el - d2) / 35);
          ctx.fillStyle = "#9CA3AF";
          ctx.font = "15px 'Space Mono',monospace";
          ctx.fillText(tt.mayorLine2.slice(0, n2), W / 2, H * 0.78 + 32);
          if (!btnShown && (rm || n2 >= tt.mayorLine2.length)) {
            btnShown = true;
            setShowBtn(true);
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return function () {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [rm]);
  return React.createElement("div", { className: "mayor-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Mayor Mode" },
    React.createElement("canvas", { ref: cvRef }),
    React.createElement("button", { className: "mayor-x", onClick: onClose, "aria-label": t.close }, "✕"),
    React.createElement("button", {
      className: "btn btn-green mayor-cta" + (showBtn ? " show" : ""),
      style: { pointerEvents: showBtn ? "auto" : "none" },
      onClick: function () { onClose(); setPage("petition"); }
    }, "✊ " + t.mayorCta)
  );
}
