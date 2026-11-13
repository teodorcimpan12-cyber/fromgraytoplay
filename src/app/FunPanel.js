import { isMinimal } from "../lib/minimal.js";
import { g2pSfx, useApp } from "./core.js";
import { EGGS } from "../data/eggs.js";
import { mascotOff } from "../lib/g2p-celebrate.js";
import { animOff, eggCount, motionNeedsPerm, motionOn } from "../lib/g2p-egg.js";
import { useEffect, useState } from "../lib/react.js";

// Footer switch: bring the ball back (or send it away).
export function MascotToggle() {
  const { lang } = useApp();
  const [off, setOff] = useState(mascotOff);
  useEffect(() => { const h = () => setOff(mascotOff()); window.addEventListener("g2p:mascot", h); return () => window.removeEventListener("g2p:mascot", h); }, []);
  const flip = () => {
    try { localStorage.setItem("g2p_mascot_off", off ? "0" : "1"); } catch (e) {}
    window.dispatchEvent(new CustomEvent("g2p:mascot"));
  };
  const lbl = lang === "en" ? (off ? "Bring the ball back" : "Hide the ball") : lang === "hu" ? (off ? "Labda vissza" : "Labda elrejtése") : (off ? "Adu mingea înapoi" : "Ascunde mingea");
  return React.createElement("button", { className: "mascot-toggle", onClick: flip, "aria-pressed": !off }, "", lbl);
}
// Footer (and phone menu) switches: mascot, animations, sounds, phone motion, secrets.
export function FunPanel({ menu }) {
  const { lang, toast } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force(x => x + 1), ev = ["g2p:eggs", "g2p:anim", "g2p:motion"];
    ev.forEach(n => window.addEventListener(n, h));
    return () => ev.forEach(n => window.removeEventListener(n, h));
  }, []);
  let snd = true; try { snd = localStorage.getItem("g2p_sound") !== "0"; } catch (e) {}
  const anim = !animOff(), mot = motionOn();
  const touch = typeof DeviceMotionEvent !== "undefined" && !!(window.matchMedia && window.matchMedia("(hover: none)").matches);
  const store = (k, v, evn) => { try { localStorage.setItem(k, v); } catch (e) {} window.dispatchEvent(new CustomEvent(evn)); force(x => x + 1); };
  const motion = () => {
    if (mot) { store("g2p_motion", "0", "g2p:motion"); return; }
    if (!motionNeedsPerm()) { store("g2p_motion", "1", "g2p:motion"); g2pSfx("bounce"); return; }
    const ask = [DeviceMotionEvent.requestPermission()];
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") ask.push(DeviceOrientationEvent.requestPermission());
    Promise.all(ask).then(r => {
      if (r[0] === "granted") { store("g2p_motion", "1", "g2p:motion"); g2pSfx("bounce"); toast(L3("📱 Scutură telefonul. Înclină-l. Vezi ce face mingea.", "📱 Shake your phone. Tilt it. Watch the ball.", "📱 Rázd meg a telefont. Döntsd meg. Figyeld a labdát.")); }
      else toast(L3("Fără permisiune, fără mișcare. 🤷", "No permission, no motion. 🤷", "Engedély nélkül nincs mozgás. 🤷"));
    }).catch(() => {});
  };
  const B = (on, ic, label, click) => React.createElement("button", { className: "mascot-toggle", "aria-pressed": on, onClick: click }, label);
  const panel = React.createElement("div", { className: "fun-panel" + (menu ? " menu" : "") },
    !isMinimal() && React.createElement(MascotToggle, null),
    B(anim, "✨", L3("Animații", "Animations", "Animációk"), () => { store("g2p_anim_off", anim ? "1" : "0", "g2p:anim"); setTimeout(() => location.reload(), 900); toast(anim ? L3("Mod minimalist: fără animații și efecte.", "Minimal mode: no animations or effects.", "Minimalista mód: animációk nélkül.") : L3("Animațiile sunt pornite.", "Animations are on.", "Animációk bekapcsolva.")); }),
    B(snd, snd ? "🔊" : "🔈", L3("Sunete", "Sounds", "Hangok"), () => { store("g2p_sound", snd ? "0" : "1", "g2p:anim"); if (!snd) g2pSfx("bounce"); }),
    touch && B(mot, "📱", L3("Mișcare", "Motion", "Mozgás"), motion),
    !isMinimal() && React.createElement("button", { className: "mascot-toggle", onClick: () => window.dispatchEvent(new CustomEvent("g2p:eggs-open")) }, L3("Secrete", "Secrets", "Titkok") + " " + eggCount() + "/" + EGGS.length));
  if (menu) return panel;
  // Footer: the switches sit behind one quiet "Setări" line.
  return React.createElement("details", { className: "fun-set" },
    React.createElement("summary", null, L3("Setări", "Settings", "Beállítások")), panel);
}
