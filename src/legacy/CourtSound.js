import { useApp } from "../app/core.js";
import { useEffect, useRef, useState } from "../lib/react.js";
 // TODO: HU review

/* === #7 Sound of neglect — WebAudio scenes: "alive" (bounces, crowd,
   squeaks) vs "abandoned" (wind, drips, distant rumble). === */
export function CourtSound(props) {
  var court = props.court;
  var app = useApp();
  var t = app.t;
  var playSt = useState(false);
  var playing = playSt[0], setPlaying = playSt[1];
  var stopRef = useRef(null);
  var alive = court.status === "renovated" || (court.condition || 0) >= 4;
  useEffect(function () {
    return function () { if (stopRef.current) stopRef.current(); };
  }, []);
  var toggle = function () {
    if (stopRef.current) { stopRef.current(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    var ctx;
    try { ctx = new AC(); } catch (e) { return; }
    if (ctx.resume) { try { ctx.resume(); } catch (e) {} }
    var on = true;
    var timers = [];
    var later = function (fn, ms) { var id = setTimeout(function () { if (on) fn(); }, ms); timers.push(id); };
    var master = ctx.createGain();
    master.gain.value = 0.25;
    master.connect(ctx.destination);
    var noiseBuf = function (sec) {
      var b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sec), ctx.sampleRate);
      var d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return b;
    };
    var brownBuf = function (sec) {
      var b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sec), ctx.sampleRate);
      var d = b.getChannelData(0);
      var lastV = 0;
      for (var i = 0; i < d.length; i++) {
        var w = Math.random() * 2 - 1;
        lastV = (lastV + 0.02 * w) / 1.02;
        d[i] = lastV * 3.5;
      }
      return b;
    };
    var loopNoise = function (buf, type, freq, gain) {
      var src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      var f = ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq;
      var g = ctx.createGain(); g.gain.value = gain;
      src.connect(f); f.connect(g); g.connect(master);
      src.start();
      return { src: src, filter: f, gain: g };
    };
    if (alive) {
      loopNoise(brownBuf(2), "lowpass", 520, 0.1); // crowd murmur
      var bounce = function (when, vol) {
        var o = ctx.createOscillator();
        o.type = "sine"; o.frequency.setValueAtTime(60, when);
        var og = ctx.createGain();
        og.gain.setValueAtTime(0.0001, when);
        og.gain.exponentialRampToValueAtTime(vol, when + 0.005);
        og.gain.exponentialRampToValueAtTime(0.0001, when + 0.13);
        o.connect(og); og.connect(master);
        o.start(when); o.stop(when + 0.16);
        var n = ctx.createBufferSource(); n.buffer = noiseBuf(0.06);
        var nf = ctx.createBiquadFilter(); nf.type = "lowpass"; nf.frequency.value = 420;
        var ng = ctx.createGain();
        ng.gain.setValueAtTime(vol * 0.6, when);
        ng.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
        n.connect(nf); nf.connect(ng); ng.connect(master);
        n.start(when);
      };
      var bounceSeq = function () {
        // a dropped ball: bounces accelerate, then the pattern resets
        var t0 = ctx.currentTime + 0.05;
        var gap = 0.42, dt = 0;
        for (var i = 0; i < 9; i++) { bounce(t0 + dt, Math.max(0.12, 0.5 - i * 0.045)); dt += gap; gap *= 0.72; }
        later(bounceSeq, 2500 + Math.random() * 800);
      };
      bounceSeq();
      var squeak = function () {
        var when = ctx.currentTime + 0.02;
        var n = ctx.createBufferSource(); n.buffer = noiseBuf(0.2);
        var bf = ctx.createBiquadFilter(); bf.type = "bandpass";
        bf.frequency.setValueAtTime(2200, when);
        bf.frequency.exponentialRampToValueAtTime(3800, when + 0.13);
        bf.Q.value = 9;
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(0.12, when + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
        n.connect(bf); bf.connect(g); g.connect(master);
        n.start(when);
        later(squeak, 3000 + Math.random() * 4000);
      };
      later(squeak, 1500);
    } else {
      var wind = loopNoise(brownBuf(3), "lowpass", 550, 0.16);
      var lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.07;
      var lfoG = ctx.createGain(); lfoG.gain.value = 250;
      lfo.connect(lfoG); lfoG.connect(wind.filter.frequency);
      lfo.start();
      var rum = ctx.createOscillator(); rum.type = "sine"; rum.frequency.value = 46;
      var rumG = ctx.createGain(); rumG.gain.value = 0.03;
      rum.connect(rumG); rumG.connect(master);
      rum.start();
      var drip = function () {
        var when = ctx.currentTime + 0.02;
        var o = ctx.createOscillator(); o.type = "sine";
        o.frequency.setValueAtTime(820, when);
        o.frequency.exponentialRampToValueAtTime(300, when + 0.18);
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(0.16, when + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
        o.connect(g); g.connect(master);
        o.start(when); o.stop(when + 0.25);
        later(drip, 2000 + Math.random() * 4000);
      };
      later(drip, 900);
    }
    stopRef.current = function () {
      on = false;
      timers.forEach(clearTimeout);
      try { ctx.close(); } catch (e) {}
      stopRef.current = null;
      setPlaying(false);
    };
    setPlaying(true);
  };
  return React.createElement("div", { className: "card mt-2", style: { borderLeft: "3px solid var(--green)" } },
    React.createElement("div", { className: "flex items-center gap-2", style: { flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: "1.4rem" } }, "🎧"),
      React.createElement("div", { style: { flex: 1, minWidth: 150 } },
        React.createElement("h4", { style: { fontSize: ".88rem" } }, t.soundTitle),
        React.createElement("p", { className: "text-xs", style: { color: "var(--textSec)" } }, t.soundSub)
      ),
      playing && React.createElement("span", { className: "eq", "aria-hidden": "true" },
        React.createElement("i", null), React.createElement("i", null), React.createElement("i", null)),
      React.createElement("button", {
        className: "btn btn-sm " + (playing ? "btn-outline" : "btn-green"),
        onClick: toggle, "aria-pressed": playing
      }, playing ? "⏹ " + t.soundStop : "▶ " + t.soundPlay)
    )
  );
}
