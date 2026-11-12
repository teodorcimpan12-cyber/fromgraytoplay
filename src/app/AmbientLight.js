import { db, useApp } from "./core.js";
import { G2P_SUNSET } from "../data/constants.js";
import { useEffect, useState } from "../lib/react.js";

export function AmbientLight() {
  var app = useApp();
  var settings = app.settings;
  var modeSt = useState("none");
  var mode = modeSt[0], setMode = modeSt[1];
  var flashSt = useState(false);
  var flash = flashSt[0], setFlash = flashSt[1];
  var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var off = !!rm || !!(settings && settings.flags && settings.flags.effects === false);
  useEffect(function () {
    if (off) return;
    var tick = function () {
      var d = new Date();
      var h = d.getHours() + d.getMinutes() / 60;
      var sunset = G2P_SUNSET[d.getMonth()];
      if (Math.abs(h - sunset) <= 1.5) setMode("golden");
      else if (h > sunset + 1.5 || h < 6.5) setMode("night");
      else setMode("none");
    };
    tick();
    var iv = setInterval(tick, 60000);
    return function () { clearInterval(iv); };
  }, [off]);
  useEffect(function () {
    if (off) return;
    var mounted = Date.now();
    var tid = null;
    var ref = db.ref("reports").limitToLast(1);
    var fn = function (snap) {
      var r = snap.val();
      if (!r) return;
      var ts = Date.parse((r && r.createdAt) || "") || (typeof r.timestamp === "number" ? r.timestamp : 0);
      if (!ts || ts < mounted) return;
      setFlash(true);
      if (tid) clearTimeout(tid);
      tid = setTimeout(function () { setFlash(false); }, 2500);
    };
    ref.on("child_added", fn);
    return function () { ref.off("child_added", fn); if (tid) clearTimeout(tid); };
  }, [off]);
  if (off) return null;
  var bg = flash
    ? "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,.6), transparent 70%)"
    : mode === "golden"
      ? "radial-gradient(ellipse at 50% 100%, rgba(245,158,11,.55), transparent 65%)"
      : mode === "night"
        ? "radial-gradient(ellipse at 50% 0%, rgba(30,58,138,.6), transparent 70%)"
        : "transparent";
  var visible = flash || mode !== "none";
  return React.createElement("div", {
    className: "ambient-overlay" + (flash ? " amb-flash" : ""),
    "aria-hidden": "true",
    style: { background: bg, opacity: visible ? (flash ? 0.16 : 0.09) : 0 }
  });
}
