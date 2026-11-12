import { g2pSfx, loadThree, useApp } from "./core.js";
import { EGGS } from "../data/eggs.js";
import { MASCOT_LINES } from "../data/mascot-lines.js";
import { fxReduced } from "../lib/fx-reduced.js";
import { mascotOff } from "../lib/g2p-celebrate.js";
import { eggCount, eggL, eggsFound, g2pEgg, isPartyDay, partyKind } from "../lib/g2p-egg.js";
import { makeMascotBall } from "../lib/make-mascot-ball.js";
import { useEffect, useRef, useState } from "../lib/react.js";

export function Mascot({ page }) {
  const { lang, settings } = useApp();
  const fxOff = !!(settings && settings.flags && settings.flags.effects === false);
  const [off, setOff] = useState(mascotOff);
  const [ready, setReady] = useState(false);
  const [bubble, setBubble] = useState(null);
  const [away, setAway] = useState(false);
  const wrapRef = useRef(null), cvRef = useRef(null), api = useRef({}), bubbleT = useRef(0), said = useRef({});
  const tapsRef = useRef([]), holdRef = useRef({ timer: 0, fired: false });
  const L = MASCOT_LINES[lang] || MASCOT_LINES.ro;
  const Lref = useRef(L); Lref.current = L;
  const say = (text, ms) => { clearTimeout(bubbleT.current); setBubble(text); bubbleT.current = setTimeout(() => setBubble(null), ms || 3400); };
  useEffect(() => {
    const h = () => setOff(mascotOff());
    window.addEventListener("g2p:mascot", h);
    return () => window.removeEventListener("g2p:mascot", h);
  }, []);
  useEffect(() => {
    if (off || fxOff || fxReduced()) return;
    let alive = true, raf = 0, renderer = null, model = null, idleT = 0;
    const start = () => loadThree().then(() => {
      if (!alive || !cvRef.current) return;
      try { renderer = new THREE.WebGLRenderer({ canvas: cvRef.current, alpha: true, antialias: true }); } catch (e) { return; }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(88, 88, false);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(32, 1, .1, 50); cam.position.set(0, .15, 5.2);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x553322, .95));
      const sun = new THREE.DirectionalLight(0xffffff, .85); sun.position.set(2, 3, 4); scene.add(sun);
      model = makeMascotBall(THREE, 1);
      scene.add(model.root);
      // Party days: a little cone hat. All secrets found: the ball turns gold.
      if (isPartyDay()) {
        // Christmas: red Santa hat with a white brim; Easter: pastel; other days: pink party cone.
        const pk = partyKind();
        const hatCol = pk === "xmas" ? 0xDC2626 : pk === "easter" ? 0xA78BFA : 0xEC4899;
        const pomCol = pk === "xmas" ? 0xFFFFFF : pk === "easter" ? 0xFDE68A : 0xFACC15;
        const hat = new THREE.Mesh(new THREE.ConeGeometry(.34, .62, 20), new THREE.MeshStandardMaterial({ color: hatCol, roughness: .5 }));
        hat.position.set(.2, 1.08, .1); hat.rotation.z = -.32; model.body.add(hat);
        const pom = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), new THREE.MeshStandardMaterial({ color: pomCol }));
        pom.position.y = .33; hat.add(pom);
        if (pk === "xmas") {
          const brim = new THREE.Mesh(new THREE.TorusGeometry(.32, .07, 8, 24), new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: .9 }));
          brim.rotation.x = Math.PI / 2; brim.position.y = -.3; hat.add(brim);
        }
      }
      const gild = () => { if (eggCount() >= EGGS.length) model.gild(); };
      gild();
      window.addEventListener("g2p:eggs", gild);
      const st = { mood: window.__g2pMood || null, hop: -1, spin: 0, blink: 0, nextBlink: 2, lx: 0, ly: 0, tx: 0, ty: 0, look: 0, born: performance.now(), dizzy: 0, inf: 0, holding: false, pf: 0, tl: 0 };
      api.current.hop = () => { if (st.hop < 0) st.hop = 0; };
      api.current.mood = m => { st.mood = m; };
      api.current.dizzy = () => { st.dizzy = 3; };
      api.current.hold = v => { st.holding = v; };
      api.current.pfff = () => { st.holding = false; st.pf = 1; };
      const onMove = e => {
        const r = cvRef.current && cvRef.current.getBoundingClientRect(); if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 400);
        st.tx = dx / d * k; st.ty = dy / d * k; st.look = performance.now();
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      api.current.cleanup = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("g2p:eggs", gild); };
      let last = performance.now();
      const tick = now => {
        if (!alive) return;
        raf = requestAnimationFrame(tick);
        if (document.hidden) return;
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        const t = now / 1000, b = model.body, m = st.mood;
        // Enter: drop in from above with a squash.
        const age = (now - st.born) / 1000;
        let y = age < .7 ? 3 * Math.pow(1 - age / .7, 2) : 0;
        let sx = 1, sy = 1;
        if (age >= .7 && age < 1) { const k = Math.sin((age - .7) / .3 * Math.PI); sy = 1 - .22 * k; sx = 1 + .14 * k; }
        // Idle bob; sad = slower and flatter, happy = little hops every few seconds.
        const slow = m === "sad" || m === "sleepy";
        y += (slow ? .03 : .07) * Math.sin(t * (slow ? 1.2 : 2.2));
        if (m === "happy" && st.hop < 0 && Math.sin(t * .9) > .995) st.hop = 0;
        if (st.hop >= 0) {
          st.hop += dt / .62;
          const h = st.hop;
          if (h < .15) { const k = h / .15; sy *= 1 - .2 * k; sx *= 1 + .12 * k; }
          else if (h < .85) { const k = (h - .15) / .7; y += 1.15 * 4 * k * (1 - k); st.spin = k * Math.PI * 2; }
          else if (h < 1) { const k = Math.sin((h - .85) / .15 * Math.PI); sy *= 1 - .18 * k; sx *= 1 + .1 * k; st.spin = 0; }
          else { st.hop = -1; st.spin = 0; }
        }
        if (m === "sad") { sy *= .86; sx *= 1.07; }
        // Held down: slowly inflates; after 3 s it lets the air out (pfff) and wobbles back.
        let mul = 1, jx = 0, jr = 0;
        if (st.pf > 0) {
          st.pf = Math.max(0, st.pf - dt / 1.2);
          const k = 1 - st.pf;
          if (k < .35) { mul = 1.42 - .72 * (k / .35); jx = (Math.random() - .5) * .3; jr = (Math.random() - .5) * .6; }
          else mul = 1 - .3 * Math.exp(-(k - .35) * 6) * Math.cos((k - .35) * 18);
          st.inf = 0;
        } else {
          st.inf = st.holding ? Math.min(1, st.inf + dt / 3) : Math.max(0, st.inf - dt * 3);
          mul = 1 + .42 * st.inf * st.inf;
          if (st.inf > .6) jx = (Math.random() - .5) * .04 * st.inf;
        }
        if (st.dizzy > 0) st.dizzy -= dt;
        // Phone tilt rolls the ball a little to that side.
        st.tl += ((window.__g2pTilt || 0) - st.tl) * .08;
        b.position.y = y; b.position.x = st.tl * .38 + jx; b.scale.set(sx * mul, sy * mul, sx * mul);
        model.ball.rotation.x = st.spin;
        // Look at the pointer (eases back to the camera after 2 s of no movement).
        const idle = now - st.look > 2000;
        const gx = idle ? Math.sin(t * .5) * .15 : st.tx, gy = idle ? 0 : st.ty;
        st.lx += (gx - st.lx) * .12; st.ly += (gy - st.ly) * .12;
        b.rotation.y = st.lx * .45;
        b.rotation.x = st.ly * .35 + (m === "sad" ? .22 : 0);
        b.rotation.z = (m === "curious" ? .26 * Math.sin(t * 1.4) : 0) + (st.dizzy > 0 ? .4 * Math.sin(t * 13) : 0) - st.tl * .6 + jr;
        if (st.dizzy > 0) model.pupils.forEach((p, i) => { const a = t * 12 * (i ? -1 : 1); p.position.x = Math.cos(a) * .08; p.position.y = Math.sin(a) * .08; });
        else model.pupils.forEach(p => { p.position.x = st.lx * .07; p.position.y = -st.ly * .07; });
        // Blink.
        st.nextBlink -= dt;
        if (st.nextBlink <= 0) { st.blink = 1; st.nextBlink = 2.5 + Math.random() * 4; }
        if (st.blink > 0) st.blink = Math.max(0, st.blink - dt * 7);
        const lid = st.blink > 0 ? Math.abs(Math.cos(st.blink * Math.PI)) : 1;
        model.eyes.forEach(e => { e.scale.y = Math.max(.08, lid * (m === "sleepy" ? .2 : m === "sad" ? .6 : 1)); });
        // Mouth: smile, frown when sad, small "o" when curious.
        model.mouth.rotation.z = m === "sad" ? 0 : Math.PI;
        model.mouth.position.y = m === "sad" ? -.32 : -.12;
        const ms = m === "happy" ? 1.3 : m === "curious" || m === "sleepy" ? .6 : 1;
        model.mouth.scale.set(ms, ms, 1);
        renderer.render(scene, cam);
      };
      raf = requestAnimationFrame(tick);
      setReady(true);
    }).catch(() => {});
    // Wait until the page has settled so the ball never competes with the first paint.
    idleT = setTimeout(start, 2200);
    return () => {
      alive = false; clearTimeout(idleT); cancelAnimationFrame(raf);
      api.current.cleanup && api.current.cleanup();
      if (model) model.dispose();
      if (renderer) { renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {} }
      api.current = {};
      setReady(false);
    };
  }, [off, fxOff]);
  // React to what is on screen: a court's status, or the petition page.
  useEffect(() => {
    const h = e => {
      const m = e.detail && e.detail.mood;
      api.current.mood && api.current.mood(m);
      // Each mood speaks once per visit, so 35 unverified courts do not mean 35 speeches.
      if (m && Lref.current[m] && !said.current[m]) { said.current[m] = 1; say(Lref.current[m], 4200); }
    };
    window.addEventListener("g2p:mood", h);
    return () => window.removeEventListener("g2p:mood", h);
  }, []);
  useEffect(() => {
    if (!ready || page !== "petition") return;
    const id = setTimeout(() => say(Lref.current.petition, 4000), 6000);
    return () => clearTimeout(id);
  }, [ready, page]);
  // During the big celebration the ball is "on the court", so the corner one steps away.
  useEffect(() => {
    let id = 0;
    const h = () => { setAway(true); clearTimeout(id); id = setTimeout(() => { setAway(false); api.current.hop && api.current.hop(); }, 3200); };
    window.addEventListener("g2p:celebrate", h);
    return () => { window.removeEventListener("g2p:celebrate", h); clearTimeout(id); };
  }, []);
  // Phone shake (EggHub) makes it hop.
  useEffect(() => {
    const h = () => api.current.hop && api.current.hop();
    window.addEventListener("g2p:mascot-hop", h);
    return () => window.removeEventListener("g2p:mascot-hop", h);
  }, []);
  useEffect(() => () => { clearTimeout(bubbleT.current); clearTimeout(holdRef.current.timer); }, []);
  if (off || fxOff) return null;
  const onTap = () => {
    if (holdRef.current.fired) { holdRef.current.fired = false; return; }
    api.current.hop && api.current.hop();
    g2pSfx("bounce");
    try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
    const now = Date.now();
    tapsRef.current = tapsRef.current.filter(x => now - x < 5000); tapsRef.current.push(now);
    if (tapsRef.current.length >= 10) {
      tapsRef.current = [];
      api.current.dizzy && api.current.dizzy();
      g2pSfx("whistle"); say(Lref.current.dizzy); g2pEgg("dizzy");
      return;
    }
    // Now and then it gives away a secret that is still hidden.
    const found = eggsFound(), left = EGGS.filter(x => !found[x.id]);
    if (!left.length && Math.random() < .25) { say(Lref.current.gold); return; }
    if (left.length && Math.random() < .3) { const x = left[Math.floor(Math.random() * left.length)]; say(Lref.current.hint + eggL(x.h, lang), 5600); return; }
    const lines = Lref.current.tap;
    say(lines[Math.floor(Math.random() * lines.length)]);
  };
  const holdStart = () => {
    const h = holdRef.current;
    clearTimeout(h.timer); h.fired = false;
    api.current.hold && api.current.hold(true);
    h.timer = setTimeout(() => {
      h.fired = true;
      api.current.pfff && api.current.pfff();
      g2pSfx("pfff"); say(Lref.current.pfff); g2pEgg("inflate");
    }, 3000);
  };
  const holdEnd = () => { clearTimeout(holdRef.current.timer); api.current.hold && api.current.hold(false); };
  const hide = e => {
    e.stopPropagation();
    try { localStorage.setItem("g2p_mascot_off", "1"); } catch (err) {}
    window.dispatchEvent(new CustomEvent("g2p:mascot"));
  };
  return React.createElement("div", { ref: wrapRef, className: "mascot" + (ready ? " on" : "") + (away ? " away" : "") },
    bubble && React.createElement("div", { className: "mascot-bubble", role: "status" },
      bubble,
      React.createElement("button", { className: "mascot-hide", onClick: hide }, L.hide)),
    React.createElement("button", { className: "mascot-btn", "aria-label": L.label, onClick: onTap, onPointerDown: holdStart, onPointerUp: holdEnd, onPointerLeave: holdEnd, onPointerCancel: holdEnd, onContextMenu: ev => ev.preventDefault() },
      React.createElement("canvas", { ref: cvRef, width: 176, height: 176 }),
      React.createElement("span", { className: "mascot-shadow", "aria-hidden": "true" })));
}
