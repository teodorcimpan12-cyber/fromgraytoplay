import { ACTIVE_CITY, COURTS, useApp } from "../../app/core.js";
import { SITE } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { courtStatusView } from "../../lib/court-status-view.js";
import { useEffect, useRef, useState } from "../../lib/react.js";
 // TODO: HU review

/* === #8 Live City Pulse — full-screen 2D-canvas time-lapse of civic activity.
   Petition events bloom from the "city hall" centre; court events burst at
   their court node. ~30s replay with a scrubber. === */
export function CityPulse(props) {
  var onClose = props.onClose;
  var app = useApp();
  var t = app.t, lang = app.lang;
  var activity = useFirebase("activity");
  var signups = useFirebase("signupStats");
  var cvRef = useRef(null), stageRef = useRef(null), scrubRef = useRef(null), seekRef = useRef(null);
  var playSt = useState(true);
  var playing = playSt[0], setPlaying = playSt[1];
  var playRef = useRef(true);
  var rm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  var events = React.useMemo(function () {
    var ev = [];
    // Outside Târgu Mureș only count this city's courts and signups (signups without a city tag are all TGM).
    var own = ACTIVE_CITY === "tgm" ? null : COURTS.reduce(function (m, c) { m[c.id] = 1; return m; }, {});
    if (activity) Object.values(activity).forEach(function (a) {
      var ts = typeof a.timestamp === "number" ? a.timestamp : (Date.parse(a.timestamp || "") || 0);
      if (!ts) return;
      if (own && !own[a.courtId]) return;
      ev.push({ ts: ts, type: a.type || "other", courtId: a.courtId || null });
    });
    if (signups) Object.values(signups).forEach(function (s) {
      if ((s.city || "tgm") !== ACTIVE_CITY) return;
      var ts = Date.parse(s.date || "") || (typeof s.timestamp === "number" ? s.timestamp : 0);
      if (!ts) return;
      ev.push({ ts: ts, type: "signup", courtId: null });
    });
    ev.sort(function (a, b) { return a.ts - b.ts; });
    return ev;
  }, [activity, signups]);
  var stats = React.useMemo(function() {
    if (!events.length) return null;
    var totalSignups = signups ? Object.values(signups).filter(function (s) { return (s.city || "tgm") === ACTIVE_CITY; }).length : 0;
    var activeDays = {};
    events.forEach(function(e) { var d = new Date(e.ts).toLocaleDateString("ro-RO"); activeDays[d] = (activeDays[d]||0)+1; });
    var peakEntry = Object.entries(activeDays).sort(function(a,b){return b[1]-a[1];})[0];
    var courtActivity = {};
    events.filter(function(e){return e.courtId;}).forEach(function(e){ courtActivity[e.courtId] = (courtActivity[e.courtId]||0)+1; });
    var topCourtEntry = Object.entries(courtActivity).sort(function(a,b){return b[1]-a[1];})[0];
    var topCourtName = topCourtEntry ? (COURTS.find(function(c){return c.id===topCourtEntry[0];})||{name:topCourtEntry[0]}).name : null;
    var last24h = events.filter(function(e){return e.ts > Date.now()-86400000;}).length;
    return { totalSignups: totalSignups, peakDay: peakEntry ? peakEntry[0] : null, topCourt: topCourtName, last24h: last24h };
  }, [events, signups]);
  useEffect(function () {
    var h = function (e) { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return function () { window.removeEventListener("keydown", h); };
  }, [onClose]);
  useEffect(function () {
    var cv = cvRef.current, stage = stageRef.current;
    if (!cv || !stage) return;
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 320, H = 320;
    var prog = rm ? 1 : 0;
    var particles = [], rings = [];
    var tMin = events.length ? events[0].ts : Date.now() - 1;
    var tMax = events.length ? events[events.length - 1].ts : Date.now();
    if (tMax <= tMin) tMax = tMin + 1;
    var prevT = tMin - 1;
    var lats = COURTS.map(function (c) { return c.lat; });
    var lngs = COURTS.map(function (c) { return c.lng; });
    var laMin = Math.min.apply(null, lats), laMax = Math.max.apply(null, lats);
    var loMin = Math.min.apply(null, lngs), loMax = Math.max.apply(null, lngs);
    function proj(lat, lng) {
      var nx = (lng - loMin) / ((loMax - loMin) || 1);
      var ny = 1 - (lat - laMin) / ((laMax - laMin) || 1);
      return { x: (0.16 + nx * 0.68) * W, y: (0.24 + ny * 0.56) * H };
    }
    function resize() {
      W = stage.clientWidth || 320;
      H = stage.clientHeight || 320;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    resize();
    window.addEventListener("resize", resize);
    var colorFor = function (ty) {
      return ty === "petition" || ty === "signup" ? "#10B981"
        : ty === "report" ? "#DC2626"
        : ty === "check-in" || ty === "checkin" ? "#F97316"
        : ty === "photo" ? "#8B5CF6" : "#0D9488";
    };
    function spawn(ev) {
      var col = colorFor(ev.type);
      var court = ev.courtId && COURTS.find(function (c) { return c.id === ev.courtId; });
      if (court) {
        var p = proj(court.lat, court.lng);
        var n = 6 + Math.floor(Math.random() * 5);
        for (var i = 0; i < n; i++) {
          var ang = Math.random() * Math.PI * 2, sp = 30 + Math.random() * 90;
          particles.push({ x: p.x, y: p.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, decay: 0.5 + Math.random() * 0.5, color: col, r: 1.5 + Math.random() * 2 });
        }
        rings.push({ x: p.x, y: p.y, r: 4, vr: 50, a: 0.7, color: col });
      } else {
        rings.push({ x: W / 2, y: H * 0.46, r: 5, vr: 90, a: 0.9, color: col });
        rings.push({ x: W / 2, y: H * 0.46, r: 2, vr: 55, a: 0.7, color: col });
      }
    }
    seekRef.current = function (p) {
      prog = Math.max(0, Math.min(1, p));
      prevT = tMin + (tMax - tMin) * prog;
      particles.length = 0;
      rings.length = 0;
    };
    function draw(playT, dt) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#0B0E18";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.035)";
      ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = 0; gy < H; gy += 48) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      ctx.font = "16px serif";
      ctx.textAlign = "center";
      ctx.fillText("🏛️", W / 2, H * 0.46 + 5);
      COURTS.forEach(function (c) {
        var p = proj(c.lat, c.lng);
        var col = courtStatusView(c, t).color;
        ctx.save();
        ctx.shadowColor = col;
        ctx.shadowBlur = 14;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#9CA3AF";
        ctx.font = "10px 'Space Mono',monospace";
        ctx.fillText(c.name, p.x, p.y + 18);
      });
      ctx.globalCompositeOperation = "lighter";
      for (var i = rings.length - 1; i >= 0; i--) {
        var rg = rings[i];
        rg.r += rg.vr * dt;
        rg.a -= dt * 0.55;
        if (rg.a <= 0) { rings.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, rg.a);
        ctx.strokeStyle = rg.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2); ctx.stroke();
      }
      for (var j = particles.length - 1; j >= 0; j--) {
        var pp = particles[j];
        pp.x += pp.vx * dt;
        pp.y += pp.vy * dt;
        pp.vx *= Math.pow(0.25, dt);
        pp.vy *= Math.pow(0.25, dt);
        pp.life -= pp.decay * dt;
        if (pp.life <= 0) { particles.splice(j, 1); continue; }
        ctx.globalAlpha = Math.max(0, pp.life);
        ctx.fillStyle = pp.color;
        ctx.beginPath(); ctx.arc(pp.x, pp.y, pp.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      var sig = 0, rep = 0, chk = 0;
      events.forEach(function (e) {
        if (e.ts > playT) return;
        if (e.type === "petition" || e.type === "signup") sig++;
        else if (e.type === "report") rep++;
        else if (e.type === "check-in" || e.type === "checkin") chk++;
      });
      ctx.textAlign = "left";
      var rows = [[sig, t.pulseSig, "#10B981"], [rep, t.pulseRep, "#DC2626"], [chk, t.pulseCheck, "#F97316"]];
      var cy = 38;
      rows.forEach(function (r) {
        ctx.fillStyle = r[2];
        ctx.font = "800 30px 'Barlow Condensed',sans-serif";
        ctx.fillText(String(r[0]), 16, cy);
        ctx.fillStyle = "#9CA3AF";
        ctx.font = "10px 'Space Mono',monospace";
        ctx.fillText(String(r[1]).toUpperCase(), 16, cy + 13);
        cy += 52;
      });
      if (events.length) {
        ctx.fillStyle = "#6B7280";
        ctx.font = "11px 'Space Mono',monospace";
        ctx.fillText(new Date(playT).toLocaleDateString(lang === "ro" ? "ro-RO" : lang === "hu" ? "hu-HU" : "en-GB"), 16, cy + 6);
      }
    }
    if (rm) {
      // Reduced motion: render the final, fully-counted state. No animation.
      prevT = tMax;
      if (scrubRef.current) scrubRef.current.value = "1000";
      draw(tMax, 0);
      var redraw = function () { draw(tMax, 0); };
      window.addEventListener("resize", redraw);
      return function () {
        window.removeEventListener("resize", redraw);
        window.removeEventListener("resize", resize);
        seekRef.current = null;
      };
    }
    var raf = null, last = performance.now();
    function loop(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (playRef.current && prog < 1) {
        prog = Math.min(1, prog + dt / 30);
        if (prog >= 1) { playRef.current = false; setPlaying(false); }
      }
      var playT = tMin + (tMax - tMin) * prog;
      events.forEach(function (e) { if (e.ts > prevT && e.ts <= playT) spawn(e); });
      prevT = playT;
      if (scrubRef.current) scrubRef.current.value = String(Math.round(prog * 1000));
      draw(playT, dt);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return function () {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      seekRef.current = null;
    };
  }, [events, rm, lang]);
  var togglePlay = function () {
    if (!playRef.current && scrubRef.current && +scrubRef.current.value >= 1000 && seekRef.current) seekRef.current(0);
    playRef.current = !playRef.current;
    setPlaying(playRef.current);
  };
  return React.createElement("div", { className: "pulse-overlay", role: "dialog", "aria-modal": "true", "aria-label": t.pulseTitle },
    React.createElement("div", { className: "pulse-hdr" },
      React.createElement("div", null,
        React.createElement("h3", null, t.pulseTitle),
        React.createElement("p", null, t.pulseSub)
      ),
      React.createElement("button", { className: "pulse-x", onClick: onClose, "aria-label": t.close }, "✕")
    ),
    React.createElement("div", { className: "pulse-stage", ref: stageRef },
      React.createElement("canvas", { ref: cvRef })
    ),
    React.createElement("div", { className: "pulse-ctrl" },
      React.createElement("button", { className: "pulse-play", onClick: togglePlay, "aria-label": playing ? "⏸" : "▶" }, playing ? "⏸" : "▶"),
      React.createElement("input", {
        ref: scrubRef, type: "range", min: 0, max: 1000, defaultValue: 0,
        onInput: function (e) { if (seekRef.current) seekRef.current((+e.target.value) / 1000); },
        "aria-label": t.pulseTitle
      })
    ),
    stats && React.createElement("div", {
      style: { padding: ".8rem 1rem", background: "rgba(0,0,0,.5)", borderTop: "1px solid rgba(255,255,255,.08)" }
    },
      React.createElement("div", { style: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:".4rem", marginBottom:".6rem" } },
        [
          stats.totalSignups && ["👥", lang==="ro"?"Susținători":"Supporters", stats.totalSignups],
          stats.peakDay && ["📅", lang==="ro"?"Ziua de vârf":"Peak day", stats.peakDay],
          stats.topCourt && ["🏟️", lang==="ro"?"Cel mai activ":"Most active", stats.topCourt.slice(0,22)],
          stats.last24h > 0 && ["🔴", "● LIVE (24h)", stats.last24h + (lang==="ro"?" acț.":" actions")]
        ].filter(Boolean).map(function(item) {
          return React.createElement("div", { key: item[1], style:{background:"rgba(16,185,129,.1)",borderRadius:8,padding:".4rem .6rem"} },
            React.createElement("div", { style:{fontSize:"1rem"} }, item[0]),
            React.createElement("div", { style:{fontSize:".65rem",color:"#9CA3AF"} }, item[1]),
            React.createElement("div", { style:{fontWeight:700,color:"#fff",fontSize:".85rem"} }, String(item[2]))
          );
        })
      ),
      React.createElement("div", { style:{display:"flex",gap:".5rem",flexWrap:"wrap"} },
        React.createElement("button", {
          className: "btn btn-green btn-sm",
          onClick: function() {
            var url = SITE;
            var text = (lang==="ro"?"📊 "+stats.totalSignups+" sibieni susțin renovarea terenurilor!":"📊 "+stats.totalSignups+" citizens support court renovation!");
            if (navigator.share) { navigator.share({title:"City Pulse — From Grey to Play",text:text,url:url}); }
            else { window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text)+"&url="+encodeURIComponent(url),"_blank"); }
          }
        }, (lang==="ro"?"Distribuie":"Share")),
        React.createElement("button", {
          className: "btn btn-sm",
          style:{background:"#F97316",color:"#fff"},
          onClick: function() {
            var cv = cvRef.current; if (!cv) return;
            var a = document.createElement("a");
            a.href = cv.toDataURL("image/png");
            a.download = "city-pulse-g2p.png";
            a.click();
          }
        }, "📸 " + (lang==="ro"?"Salvează":"Save image")),
        React.createElement("button", {
          className: "btn btn-sm",
          style:{background:"#10B981",color:"#fff"},
          onClick: function() { onClose(); setTimeout(function(){document.getElementById("g2p-vote-form") && document.getElementById("g2p-vote-form").scrollIntoView({behavior:"smooth"});},100); }
        }, (lang==="ro"?"Semnează petiția":"Sign petition"))
      )
    )
  );
}
