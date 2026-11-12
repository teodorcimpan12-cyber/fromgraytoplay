import { g2pSfx, useApp } from "./core.js";
import { funFx } from "../lib/g2p-egg.js";
import { useEffect, useRef } from "../lib/react.js";

// Something small crosses the screen every 30-60 s. Tap it and it reacts.
export function FunEggs() {
  const { lang, settings, toast } = useApp();
  const fxOff = !!(settings && settings.flags && settings.flags.effects === false);
  const layerRef = useRef(null), langRef = useRef(lang), toastRef = useRef(toast);
  langRef.current = lang; toastRef.current = toast;
  useEffect(() => {
    if (fxOff) return;
    let alive = true, tid = 0;
    const L3 = (ro, en, hu) => { const l = langRef.current; return l === "en" ? en : l === "hu" ? hu : ro; }; // TODO: HU review
    const PLANE = '<i><svg viewBox="0 0 46 30" aria-hidden="true"><path d="M2 15 44 2 30 28 22 18Z" fill="var(--bgCard)" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M44 2 22 18 24 26" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></i>';
    const DRONE = () => '<i><svg viewBox="0 0 58 30" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5h16M37 5h16M13 5v7M45 5v7M13 12h32"/><rect x="21" y="9" width="16" height="9" rx="3" fill="var(--bgCard)"/><path d="M25 18l-3 6M33 18l3 6"/></g><circle cx="29" cy="13.5" r="2" fill="var(--red)"/></svg></i><small>' + L3("Primăria inspectează…", "City Hall inspecting…", "A Városháza ellenőriz…") + "</small>";
    const KINDS = [
      { c: "cr-walk cr-ball", h: "<i>🏀</i>", b: [3, 12], d: 5, s: "bounce" },
      { c: "cr-walk cr-ball", h: "<i>⚽</i>", b: [3, 12], d: 5, s: "bounce" },
      { c: "cr-walk cr-ball", h: "<i>🏐</i>", b: [3, 12], d: 5.5, s: "bounce" },
      { c: "cr-mb", h: "<i></i>", b: [3, 10], d: 6, s: "squeak", tap: () => toastRef.current(L3("Hei! Eu sunt fratele mai mic al mascotei. 🏀", "Hey! I'm the mascot's little brother. 🏀", "Hé! Én vagyok a kabala öccse. 🏀")) },
      { c: "cr-walk cr-pigeon", h: "<i>🐦</i>", b: [2, 6], d: 11, s: "birds", keep: 1 },
      { c: "cr-cat", h: "<i>🐈</i>", b: [2, 6], d: 9, s: "squeak" },
      { c: "cr-walk cr-dog", h: "<i><b>⚽</b>🐕</i>", b: [2, 7], d: 3.6, s: "bounce" },
      { c: "cr-walk cr-kid", h: "<i>🛴</i>", b: [2, 8], d: 3.4, s: "squeak" },
      { c: "cr-walk cr-skate", h: "<i>🛹</i>", b: [2, 8], d: 4.2, s: "click" },
      { c: "cr-walk", h: "<i>🏃</i>", b: [2, 9], d: 2.6, s: "squeak" },
      { c: "cr-walk", h: "<i>🚲</i>", b: [2, 8], d: 3.8, s: "click" },
      { c: "cr-plane", h: PLANE, top: [18, 55], d: 7, s: "swish" },
      { c: "cr-drone", h: DRONE, top: [14, 30], d: 9, s: "whistle", tap: () => toastRef.current(L3("Inspecție amânată. Din nou. 🚁", "Inspection postponed. Again. 🚁", "Ellenőrzés elhalasztva. Megint. 🚁")) },
      { c: "cr-leaf", h: "<i>🍂</i>", x: [40, 100], d: 7, s: "swish", n: 3 },
      { c: "cr-up", h: "<i>🎈</i>", x: [10, 85], d: 9, s: "pop", keep: 1 },
      { c: "cr-fly", h: "<i>🦋</i>", top: [25, 60], d: 8, s: "chime", keep: 1 }
    ];
    const one = (k, delay) => {
      const el = document.createElement("span");
      el.className = "cr " + k.c;
      el.innerHTML = typeof k.h === "function" ? k.h() : k.h;
      el.setAttribute("aria-hidden", "true");
      const rnd = r => r[0] + Math.random() * (r[1] - r[0]);
      if (k.top) el.style.top = rnd(k.top) + "vh";
      else if (k.x) { el.style.left = rnd(k.x) + "vw"; if (k.c.indexOf("cr-leaf") >= 0) el.style.top = "-40px"; }
      else el.style.bottom = rnd(k.b) + "vh";
      el.style.setProperty("--d", (k.d * (k.n ? .8 + Math.random() * .4 : 1)) + "s");
      if (delay) el.style.animationDelay = delay + "s";
      el.addEventListener("pointerdown", ev => {
        ev.stopPropagation();
        if (el.classList.contains("cr-hit")) return;
        el.classList.add("cr-hit");
        g2pSfx(k.s);
        try { navigator.vibrate && navigator.vibrate(10); } catch (e) {}
        if (k.tap) k.tap();
        if (k.keep) setTimeout(() => el.remove(), 900);
        else setTimeout(() => el.classList.remove("cr-hit"), 600);
      });
      layerRef.current.appendChild(el);
      setTimeout(() => el.remove(), (k.d * 1.25 + (delay || 0) + 1) * 1000);
    };
    const spawn = () => {
      if (!alive || !layerRef.current || document.hidden || !funFx()) return;
      if (document.querySelector(".modal-overlay,.mobile-menu,.celeb,.catch,.mayor-overlay,.egg-fx")) return;
      const k = KINDS[Math.floor(Math.random() * KINDS.length)];
      for (let i = 0; i < (k.n || 1); i++) one(k, i * .9);
    };
    const schedule = first => {
      tid = setTimeout(() => { spawn(); schedule(); }, first ? 20000 + Math.random() * 15000 : 30000 + Math.random() * 30000);
    };
    schedule(true);
    return () => { alive = false; clearTimeout(tid); };
  }, [fxOff]);
  if (fxOff) return null;
  return React.createElement("div", { className: "egg-layer", ref: layerRef, "aria-hidden": "true" });
}
