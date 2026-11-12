import { g2pSfx, useApp } from "./core.js";
import { funFx, g2pEgg } from "../lib/g2p-egg.js";
import { useEffect } from "../lib/react.js";

export function SecretKeys() {
  var toast = useApp().toast;
  useEffect(function () {
    var buf = "", seq = [];
    var KONAMI = "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a";
    var rm = function () { return !funFx(); };
    var rain = function (emoji, n) {
      if (rm()) return;
      for (var i = 0; i < n; i++) (function (i) {
        setTimeout(function () {
          var s = document.createElement("span");
          s.className = "ball-rain";
          s.textContent = emoji;
          s.style.left = (Math.random() * 96) + "vw";
          document.body.appendChild(s);
          setTimeout(function () { s.remove(); }, 2800);
        }, i * 75);
      })(i);
    };
    var disco = function () {
      toast("🪩 DISCO MODE");
      if (rm()) return;
      document.documentElement.classList.add("disco-fx");
      setTimeout(function () { document.documentElement.classList.remove("disco-fx"); }, 8000);
    };
    var god = function () {
      toast("🏆 GOD MODE — ai găsit codul Konami!");
      document.body.classList.add("godmode-fx");
      if (!rm() && typeof confetti === "function") confetti({ particleCount: 240, spread: 110, origin: { y: 0.6 } });
      setTimeout(function () { document.body.classList.remove("godmode-fx"); }, 12000);
      g2pEgg("konami");
    };
    // One place for every typed secret (keyboard, or the search box on phones).
    var fire = function (w) {
      if (w === "dunk") { toast("🏀 DUNK!"); rain("🏀", 26); g2pSfx("swish"); g2pEgg("dunk"); }
      else if (w === "disco") { disco(); g2pEgg("disco"); }
      else if (w === "tgm") {
        toast("💚 Târgu Mureș — From Grey to Play");
        if (!rm() && typeof confetti === "function") confetti({ particleCount: 90, spread: 75, colors: ["#10B981", "#0D9488", "#F97316"], origin: { y: 0.7 } });
        g2pEgg("tgm");
      }
      else if (w === "rain") { rain("⚽", 20); g2pEgg("rain"); }
      else if (w === "1v1") { window.dispatchEvent(new CustomEvent("g2p:1v1")); }
      else if (w === "sibiu" || w === "mures") { window.dispatchEvent(new CustomEvent("g2p:rival", { detail: { w: w } })); }
      else if (w === "fixit") { window.dispatchEvent(new Event("g2p-mayor")); }
    };
    var h = function (e) {
      var el = e.target;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (e.key) {
        seq.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
        if (seq.length > 10) seq = seq.slice(-10);
        if (seq.join(",") === KONAMI) { seq = []; god(); return; }
      }
      if (!e.key || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      buf = (buf + e.key.toLowerCase()).slice(-6);
      // "fixit" is handled by App's own listener.
      var W = ["dunk", "disco", "tgm", "rain", "1v1", "sibiu", "mures"];
      for (var i = 0; i < W.length; i++) if (buf.slice(-W[i].length) === W[i]) { buf = ""; fire(W[i]); return; }
    };
    var fromSearch = function (e) { fire(e.detail && e.detail.w); };
    window.addEventListener("keydown", h);
    window.addEventListener("g2p:secret", fromSearch);
    return function () { window.removeEventListener("keydown", h); window.removeEventListener("g2p:secret", fromSearch); };
  }, []);
  return null;
}
