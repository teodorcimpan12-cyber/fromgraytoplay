import { CatchGame } from "./CatchGame.js";
import { db, g2pSfx, useApp } from "./core.js";
import { EggCollection } from "../components/EggCollection.js";
import { EGGS } from "../data/eggs.js";
import { g2pMood } from "../lib/g2p-celebrate.js";
import { eggCount, eggL, eggsFound, funFx, g2pEgg, isPartyDay, motionOn, partyKind } from "../lib/g2p-egg.js";
import { getVoterKey } from "../lib/get-voter-key.js";
import { useEffect, useRef, useState } from "../lib/react.js";

export function eggSave(id) {
  const f = eggsFound();
  if (f[id]) return false;
  f[id] = Date.now();
  try { localStorage.setItem("g2p_eggs", JSON.stringify(f)); } catch (e) {}
  try { const vk = getVoterKey(); if (vk) db.ref("achievements/" + vk + "/egg_" + id).set(f[id]); } catch (e) {}
  return true;
}
// Records secrets, runs the effects that are not tied to one component, and owns the
// collection modal and the 1v1 catch game.
export function EggHub({ page }) {
  const { lang, toast, theme, setTheme, settings } = useApp();
  const fxOff = !!(settings && settings.flags && settings.flags.effects === false);
  const [pop, setPop] = useState(null);
  const [fx, setFx] = useState(null);
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState(false);
  const [motionTick, setMotionTick] = useState(0);
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const ref = useRef({}); ref.current = { L3: L3, toast: toast, theme: theme, setTheme: setTheme };
  const effect = (k, ms, extra) => { if (!funFx() || fxOff) return false; setFx(Object.assign({ k: k, id: Date.now() }, extra || {})); setTimeout(() => setFx(f => (f && f.k === k ? null : f)), ms); return true; };
  const effectRef = useRef(effect); effectRef.current = effect;
  useEffect(() => {
    const h = e => {
      const id = e.detail && e.detail.id, egg = EGGS.find(x => x.id === id);
      if (!egg || !eggSave(id)) return;
      const n = eggCount(), all = n >= EGGS.length;
      window.dispatchEvent(new CustomEvent("g2p:eggs"));
      // Let the secret's own effect play first, then say what was found.
      setTimeout(() => { g2pSfx("chime"); setPop({ egg: egg, n: n, all: all, id: Date.now() }); }, 1100);
    };
    const op = () => setOpen(true);
    const g = () => { setGame(true); g2pEgg("catch"); };
    const rival = e => {
      const w = (e.detail && e.detail.w) || "sibiu";
      effectRef.current("rival", 2700);
      g2pSfx("whistle");
      setTimeout(() => ref.current.toast(w === "sibiu"
        ? ref.current.L3("Sibiu vs Mureș: cine repară primul un coș câștigă derby-ul. ⚔️", "Sibiu vs Mureș: whoever fixes a hoop first wins the derby. ⚔️", "Szeben vs Maros: aki előbb megjavít egy kosarat, nyeri a derbit. ⚔️")
        : ref.current.L3("Mureș vs Sibiu: rivalitate sănătoasă. Premiul: un teren fără gropi. ⚔️", "Mureș vs Sibiu: a healthy rivalry. The prize: a court without potholes. ⚔️", "Maros vs Szeben: egészséges rivalizálás. A díj: egy kátyúmentes pálya. ⚔️"), 4200), 2300);
      g2pEgg("rivalry");
    };
    window.addEventListener("g2p:egg", h);
    window.addEventListener("g2p:eggs-open", op);
    window.addEventListener("g2p:1v1", g);
    window.addEventListener("g2p:rival", rival);
    return () => {
      window.removeEventListener("g2p:egg", h);
      window.removeEventListener("g2p:eggs-open", op);
      window.removeEventListener("g2p:1v1", g);
      window.removeEventListener("g2p:rival", rival);
    };
  }, []);
  useEffect(() => { if (!pop) return; const id = setTimeout(() => setPop(null), 3600); return () => clearTimeout(id); }, [pop && pop.id]);
  // Logo tapped 7 times in a row: a ball drops out of it and rolls away.
  useEffect(() => {
    let taps = [];
    const h = e => {
      const a = e.target.closest && e.target.closest(".nav-logo");
      if (!a) return;
      const now = Date.now();
      taps = taps.filter(x => now - x < 3500); taps.push(now);
      if (taps.length < 7) return;
      taps = [];
      const r = a.getBoundingClientRect();
      g2pSfx("bounce");
      effectRef.current("logo", 2600, { x: r.left + r.width / 2, y: r.top });
      g2pEgg("logo");
    };
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  }, []);
  // Reach the bottom of a long page three times.
  useEffect(() => {
    let hits = 0, at = false, raf = 0;
    const check = () => {
      raf = 0;
      const doc = document.documentElement;
      if (doc.scrollHeight < window.innerHeight * 1.6) return;
      const bottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 6;
      if (bottom && !at) {
        hits++;
        if (hits >= 3) {
          hits = 0;
          g2pSfx("bounce"); setTimeout(() => g2pSfx("bounce"), 900);
          effectRef.current("fall", 2600);
          setTimeout(() => ref.current.toast(ref.current.L3("Ai ajuns la fund. Terenul a ajuns de mult. 🕳️", "You hit rock bottom. The court got there years ago. 🕳️", "Elérted a mélypontot. A pálya már rég ott van. 🕳️"), 4200), 1500);
          g2pEgg("bottom");
        }
      }
      at = bottom;
    };
    const h = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener("scroll", h, { passive: true });
    return () => { window.removeEventListener("scroll", h); cancelAnimationFrame(raf); };
  }, [page]);
  // Time-based secrets: the night shift (00:00-00:30) and party days.
  useEffect(() => {
    const T = [];
    const d = new Date();
    if (d.getHours() === 0 && d.getMinutes() < 30) T.push(setTimeout(() => {
      g2pMood("sleepy");
      const r = ref.current;
      if (r.theme !== "dark" && window.__g2pThemeFx && funFx()) window.dispatchEvent(new CustomEvent("g2p:themefx", { detail: { kind: "flood", next: "dark", apply: () => r.setTheme("dark") } }));
      g2pEgg("midnight");
    }, 3500));
    if (isPartyDay()) T.push(setTimeout(() => {
      effectRef.current("party", 7500);
      const pk = partyKind(), L3 = ref.current.L3;
      const msg = pk === "xmas" ? L3("🎄 Crăciun fericit! Moșul aduce mingi. Coșuri drepte, încă nu.", "🎄 Merry Christmas! Santa brings balls. Straight hoops, not yet.", "🎄 Boldog karácsonyt! A Télapó labdát hoz. Egyenes gyűrűt még nem.") // TODO: HU review
        : pk === "easter" ? L3("🐣 Paște fericit! Căutăm ouă azi. Și terenuri bune, tot anul.", "🐣 Happy Easter! Egg hunt today. Good courts, all year.", "🐣 Boldog húsvétot! Ma tojást keresünk. Jó pályát egész évben.") // TODO: HU review
        : pk === "bday" ? L3("🎂 Azi e ziua unuia dintre noi. Tort n-avem, terenuri de renovat avem.", "🎂 It's one of our team's birthday today. No cake, but plenty of courts to fix.", "🎂 Ma az egyikünk születésnapja. Torta nincs, felújítandó pálya van.") // TODO: HU review
        : L3("🎉 1 Iunie! La mulți ani, copii. Și terenurilor voastre.", "🎉 1 June! Happy Children's Day. And to your courts.", "🎉 Június 1! Boldog gyereknapot. És a pályáitoknak is.");
      ref.current.toast(msg, 5000);
      g2pEgg("party");
    }, 4000));
    return () => T.forEach(clearTimeout);
  }, []);
  // Phone extras: shake = the mascot hops (3 quick shakes crack the screen, then it heals); tilt = it rolls.
  useEffect(() => {
    if (fxOff) return;
    let shakes = [], last = 0, lastG = 0;
    const crack = () => {
      if (effectRef.current("crack", 2500)) {
        document.documentElement.classList.add("g2p-shake");
        setTimeout(() => document.documentElement.classList.remove("g2p-shake"), 1600);
      }
      g2pSfx("crack");
      try { navigator.vibrate && navigator.vibrate([30, 40, 60]); } catch (e) {}
      setTimeout(() => { g2pSfx("chime"); ref.current.toast(ref.current.L3("Reparat. Mai repede decât Primăria. 🛠️", "Fixed. Faster than City Hall. 🛠️", "Megjavítva. Gyorsabban, mint a Városháza. 🛠️")); }, 1700);
      g2pEgg("shake");
    };
    const onMotion = e => {
      if (!motionOn()) return;
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const m = Math.hypot(a.x || 0, a.y || 0, a.z || 0), now = Date.now();
      if (m < 23 || now - last < 380) return;
      last = now;
      window.dispatchEvent(new CustomEvent("g2p:mascot-hop"));
      shakes = shakes.filter(x => now - x < 2600); shakes.push(now);
      if (shakes.length >= 3) { shakes = []; crack(); }
    };
    const onTilt = e => {
      if (!motionOn() || e.gamma == null) { window.__g2pTilt = 0; return; }
      const g = Math.max(-1, Math.min(1, e.gamma / 35));
      if (Math.abs(g - lastG) > .03) { lastG = g; window.__g2pTilt = g; }
    };
    const re = () => setMotionTick(x => x + 1);
    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("deviceorientation", onTilt);
    window.addEventListener("g2p:motion", re);
    return () => {
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("g2p:motion", re);
      window.__g2pTilt = 0;
    };
  }, [fxOff, motionTick]);
  const e = React.createElement;
  let fxEl = null;
  if (fx) {
    const W = window.innerWidth, H = window.innerHeight;
    if (fx.k === "logo") fxEl = e("span", { className: "fx-ball", style: { left: fx.x - 20, top: fx.y, "--dx": (W - fx.x + 80) + "px", "--dy": (H - fx.y - 64) + "px" } }, "🏀");
    else if (fx.k === "fall") fxEl = e("span", { className: "fx-ball", style: { left: W * .3, top: -60, "--dx": (W * .7 + 80) + "px", "--dy": (H - 4) + "px" } }, "🏀");
    else if (fx.k === "rival") fxEl = e(React.Fragment, null, e("div", { className: "fx-rival l" }, "SIBIU"), e("div", { className: "fx-rival r" }, "MUREȘ"), e("div", { className: "fx-vs" }, "VS"));
    else if (fx.k === "crack") {
      const cx = W * (.35 + Math.random() * .3), cy = H * (.35 + Math.random() * .3), paths = [];
      for (let i = 0; i < 9; i++) {
        let a = i / 9 * Math.PI * 2 + Math.random() * .5, x = cx, y = cy, d = "M" + x.toFixed(0) + " " + y.toFixed(0);
        const steps = 5 + Math.floor(Math.random() * 4);
        for (let s = 0; s < steps; s++) { a += (Math.random() - .5) * .7; const L = 30 + Math.random() * 70; x += Math.cos(a) * L; y += Math.sin(a) * L; d += " L" + x.toFixed(0) + " " + y.toFixed(0); }
        paths.push(e("path", { key: i, d: d }));
      }
      fxEl = e("svg", { className: "fx-crack", viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" }, paths);
    } else if (fx.k === "party") fxEl = Array.from({ length: 14 }, (_, i) => e("span", { key: i, className: "fx-balloon", style: { left: (3 + Math.random() * 90) + "vw", "--d": (4.5 + Math.random() * 2.5) + "s", animationDelay: (Math.random() * 1.8) + "s" } }, i % 4 === 0 ? "🎊" : "🎈"));
  }
  return e(React.Fragment, null,
    fxEl && e("div", { className: "egg-fx", key: fx.id, "aria-hidden": "true" }, fxEl),
    pop && e("div", { className: "egg-pop" + (pop.all ? " gold" : ""), key: pop.id, role: "status", onClick: () => { setPop(null); setOpen(true); } },
      e("span", { className: "ep-ic" }, pop.all ? "👑" : pop.egg.ic),
      e("div", null,
        e("b", null, (pop.all ? L3("Toate secretele!", "Every secret!", "Minden titok!") : L3("Secret găsit", "Secret found", "Titok megtalálva")) + " · " + pop.n + "/" + EGGS.length),
        e("span", null, pop.all ? L3("Mingea e acum de aur. 👑", "The ball is gold now. 👑", "A labda most arany. 👑") : eggL(pop.egg.n, lang)))),
    open && e(EggCollection, { onClose: () => setOpen(false) }),
    game && e(CatchGame, { onClose: () => setGame(false) }));
}
