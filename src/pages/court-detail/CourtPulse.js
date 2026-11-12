import { useApp } from "../../app/core.js";
import { CourtConditionQuick } from "../../components/CourtConditionQuick.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useEffect, useRef, useState } from "../../lib/react.js";
import { getCourtHealthScore } from "./helpers.js";

/* === Court Pulse: an ECG monitor whose rhythm comes from the court's real health data === */
export function pulseFromScore(s) {
  if (s >= 70) return { bpm: 72, amp: 1, irregular: 0, tone: "var(--green)", state: "steady" };
  if (s >= 40) return { bpm: 104, amp: .75, irregular: .35, tone: "var(--coral)", state: "irregular" };
  if (s >= 10) return { bpm: 44, amp: .42, irregular: .5, tone: "var(--red)", state: "weak" };
  return { bpm: 0, amp: 0, irregular: 0, tone: "var(--red)", state: "flat" };
}
export function courtPulseModel(court, allReports, ratingsData) {
  const rated = ratingsData && Object.keys(ratingsData).length > 0;
  if (court.condition != null || rated) {
    return Object.assign({ kind: "score" }, pulseFromScore(getCourtHealthScore(court, allReports, ratingsData)));
  }
  const checks = allReports ? Object.values(allReports).filter(r => r && r.courtId === court.id && r.category === "condition" && r.conditionReport) : [];
  if (!checks.length) return { kind: "none", bpm: 0, amp: 0, irregular: 0, tone: "var(--grey)", state: "none" };
  checks.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  const s = { good: 80, degraded: 50, abandoned: 12 }[checks[0].conditionReport];
  return Object.assign({ kind: "community", count: checks.length }, pulseFromScore(s == null ? 50 : s));
}
export function ecgWave(p) {
  const g = (c, w, a) => a * Math.exp(-Math.pow((p - c) / w, 2));
  return g(.16, .03, .11) + g(.34, .012, -.13) + g(.37, .014, 1) + g(.40, .014, -.28) + g(.6, .055, .26);
}
export function pulseRng(str) {
  let a = 2166136261;
  for (let i = 0; i < str.length; i++) { a ^= str.charCodeAt(i); a = Math.imul(a, 16777619); }
  return function () {
    a = a + 0x6D2B79F5 | 0;
    let x = Math.imul(a ^ a >>> 15, 1 | a);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}
export function CourtPulse({ court }) {
  const { t } = useApp();
  const allReports = useFirebase("reports");
  const ratingsData = useFirebase("ratings/" + court.id);
  const m = courtPulseModel(court, allReports, ratingsData);
  const [listening, setListening] = useState(false);
  const [verify, setVerify] = useState(false);
  const boxRef = useRef(null), scopeRef = useRef(null), canvasRef = useRef(null), headRef = useRef(null), heartRef = useRef(null), bpmRef = useRef(null);
  const audio = useRef(null);
  // The animation loop reads the latest model from here, so live Firebase updates change the rhythm without a restart.
  const live = useRef({});
  live.current.m = m;
  live.current.listening = listening;

  const onBeat = (amp, interval) => {
    const h = heartRef.current;
    if (h) { h.classList.remove("beat"); void h.offsetWidth; h.classList.add("beat"); }
    if (bpmRef.current && interval > 0) bpmRef.current.textContent = String(Math.round(60 / interval));
    const a = audio.current;
    if (!live.current.listening || !a || a.ctx.state !== "running") return;
    const now = a.ctx.currentTime;
    const thump = (when, vol) => {
      const o = a.ctx.createOscillator(), g = a.ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(110, when);
      o.frequency.exponentialRampToValueAtTime(52, when + .13);
      g.gain.setValueAtTime(.0001, when);
      g.gain.exponentialRampToValueAtTime(vol, when + .012);
      g.gain.exponentialRampToValueAtTime(.0001, when + .17);
      o.connect(g); g.connect(a.body); o.start(when); o.stop(when + .2);
    };
    thump(now, .25 + .55 * amp);
    thump(now + .16, .12 + .3 * amp);
    const b = a.ctx.createOscillator(), bg = a.ctx.createGain();
    b.frequency.value = 960;
    bg.gain.setValueAtTime(.0001, now);
    bg.gain.exponentialRampToValueAtTime(.05, now + .006);
    bg.gain.exponentialRampToValueAtTime(.0001, now + .09);
    b.connect(bg); bg.connect(a.ctx.destination); b.start(now); b.stop(now + .1);
    if (navigator.vibrate) navigator.vibrate(amp > .6 ? [32, 110, 22] : [18, 140, 12]);
  };
  const onBeatRef = useRef(onBeat);
  onBeatRef.current = onBeat;

  useEffect(() => {
    const cv = canvasRef.current, scope = scopeRef.current, head = headRef.current, box = boxRef.current;
    if (!cv || !scope || !box) return;
    const ctx = cv.getContext("2d");
    const still = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches) || document.documentElement.classList.contains("no-fx");
    const rnd = pulseRng(String(court.id));
    const SPEED = 72;
    let W = 0, H = 0, x = 0, acc = 0, lastY = null, simT = 0, lastTs = 0, raf = 0, visible = true;
    let nextBeat = .35, beatStart = -10, beatDur = .8, beatAmp = 0, beatGap = 0, rFired = true, color = "", toneKey = "";
    const yOf = v => H * .6 - v * H * .5;
    const sample = model => {
      if (model.bpm === 0) return (rnd() - .5) * .014;
      if (simT >= nextBeat) {
        const base = 60 / model.bpm;
        // After a model change (e.g. first live check) the schedule may lag; resync instead of firing a burst of beats.
        beatStart = simT - nextBeat > base ? simT : nextBeat;
        beatDur = Math.min(base * .9, .75);
        const dropped = model.irregular > 0 && rnd() < model.irregular * .3;
        beatAmp = dropped ? 0 : model.amp * (1 - model.irregular * .4 * rnd());
        rFired = beatAmp === 0;
        beatGap = base * (1 + model.irregular * (rnd() - .5) * 1.2);
        nextBeat = beatStart + beatGap;
      }
      const p = (simT - beatStart) / beatDur;
      return (p >= 0 && p < 1 ? ecgWave(p) * beatAmp : 0) + (rnd() - .5) * .022;
    };
    const resize = () => {
      const r = scope.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      x = 0; lastY = null;
      if (still) {
        const model = live.current.m;
        color = getComputedStyle(box).color; toneKey = model.tone;
        ctx.clearRect(0, 0, W, H);
        ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.lineJoin = "round";
        for (let i = 0; i < W; i++) { simT += 1 / SPEED; const y = yOf(sample(model)); i ? ctx.lineTo(i, y) : ctx.moveTo(i, y); }
        ctx.stroke();
      }
    };
    const frame = ts => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, lastTs ? (ts - lastTs) / 1000 : 0);
      lastTs = ts;
      if (!visible || document.hidden || !W) return;
      const model = live.current.m;
      if (still) {
        // No sweep animation, but the heart still beats for sound and haptics.
        if (model.tone !== toneKey) resize();
        simT += dt;
        if (model.bpm && simT >= nextBeat) { sample(model); if (beatAmp) onBeatRef.current(beatAmp, beatGap); }
        return;
      }
      if (model.tone !== toneKey) { toneKey = model.tone; color = getComputedStyle(box).color; }
      acc += dt * SPEED;
      if (acc < 1) return;
      ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath();
      if (lastY != null) ctx.moveTo(x, lastY);
      while (acc >= 1) {
        acc -= 1;
        simT += 1 / SPEED;
        const y = yOf(sample(model));
        x += 1;
        if (x >= W) { ctx.stroke(); ctx.beginPath(); x = 0; ctx.moveTo(0, y); }
        else if (lastY == null) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        lastY = y;
        if (!rFired && simT >= beatStart + .37 * beatDur) { rFired = true; onBeatRef.current(beatAmp, beatGap); }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      const gap = 22;
      ctx.clearRect(x + 2, 0, gap, H);
      if (x + 2 + gap > W) ctx.clearRect(0, 0, x + 2 + gap - W, H);
      if (head) { head.style.opacity = model.kind === "none" ? "0" : "1"; head.style.transform = "translate(" + x + "px," + lastY + "px)"; }
    };
    resize();
    let ro = null, io = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(scope); }
    if (window.IntersectionObserver) { io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }); io.observe(scope); }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro && ro.disconnect(); io && io.disconnect(); };
  }, [court.id]);

  // A flatline is a continuous tone, as on a real monitor.
  useEffect(() => {
    const a = audio.current;
    if (!a || !listening || m.state !== "flat") return;
    const o = a.ctx.createOscillator(), g = a.ctx.createGain();
    o.frequency.value = 960; g.gain.value = .035;
    o.connect(g); g.connect(a.ctx.destination); o.start();
    return () => { try { g.gain.setTargetAtTime(0, a.ctx.currentTime, .04); o.stop(a.ctx.currentTime + .25); } catch (e) {} };
  }, [listening, m.state]);

  useEffect(() => () => {
    if (!audio.current) return;
    if (navigator.vibrate) navigator.vibrate(0);
    try { audio.current.ctx.close(); } catch (e) {}
  }, []);

  const toggleListen = () => {
    if (listening) { setListening(false); if (navigator.vibrate) navigator.vibrate(0); return; }
    if (!audio.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        const body = ctx.createBiquadFilter();
        body.type = "lowpass"; body.frequency.value = 700;
        body.connect(ctx.destination);
        audio.current = { ctx, body };
      }
    }
    if (audio.current && audio.current.ctx.state === "suspended") audio.current.ctx.resume();
    setListening(true);
  };

  const none = m.kind === "none";
  const msg = none ? t.pulseNoSignalDesc : { steady: t.pulseSteady, irregular: t.pulseIrregular, weak: t.pulseWeak, flat: t.pulseFlat }[m.state];
  const src = m.kind === "score" ? t.pulseFromScore : m.kind === "community" ? t.pulseFromCommunity.replace("{n}", m.count) : "";
  return React.createElement("div", { ref: boxRef, className: "cpulse", style: { color: m.tone }, role: "group", "aria-label": t.courtPulseTitle },
    React.createElement("div", { className: "cpulse-top" },
      React.createElement("span", { className: "cpulse-ttl" }, React.createElement("span", { className: "cpulse-rec", style: { color: m.tone } }), t.courtPulseTitle),
      React.createElement("span", { className: "cpulse-read", "aria-label": none ? t.pulseNoSignal : m.bpm + " BPM" },
        React.createElement("span", { ref: heartRef, className: "cpulse-heart", "aria-hidden": "true" }, "♥"),
        React.createElement("span", { ref: bpmRef, className: "cpulse-bpm" }, none ? "--" : String(m.bpm)),
        React.createElement("span", { className: "cpulse-unit" }, "BPM")
      )
    ),
    React.createElement("div", { ref: scopeRef, className: "cpulse-scope" },
      React.createElement("canvas", { ref: canvasRef, "aria-hidden": "true" }),
      React.createElement("span", { ref: headRef, className: "cpulse-head" }),
      none && React.createElement("div", { className: "cpulse-nosig" }, React.createElement("span", null, t.pulseNoSignal))
    ),
    React.createElement("div", { className: "cpulse-bot" },
      React.createElement("span", { className: "cpulse-msg", style: none ? { color: "var(--monitorText)" } : null }, msg),
      none
        ? React.createElement("button", { className: "cpulse-btn", style: { color: "var(--green)" }, onClick: () => setVerify(true) }, t.pulseFirst)
        : React.createElement("button", { className: "cpulse-btn" + (listening ? " on" : ""), "aria-pressed": listening, onClick: toggleListen }, listening ? t.pulseStop : t.pulseListen),
      src && React.createElement("span", { className: "cpulse-src" }, src)
    ),
    verify && ReactDOM.createPortal(React.createElement(CourtConditionQuick, { courtId: court.id, onClose: () => setVerify(false) }), document.body)
  );
}
