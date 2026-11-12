import { loadThree, useApp } from "./core.js";
import { fxReduced } from "../lib/fx-reduced.js";
import { makeMascotBall } from "../lib/make-mascot-ball.js";
import { useEffect, useRef, useState } from "../lib/react.js";

export function BigCelebration() {
  const { lang } = useApp();
  const [show, setShow] = useState(null);
  const cvRef = useRef(null);
  useEffect(() => {
    const h = e => { if (!fxReduced()) setShow({ kind: (e.detail && e.detail.kind) || "petition", id: Date.now() }); };
    window.addEventListener("g2p:celebrate", h);
    return () => window.removeEventListener("g2p:celebrate", h);
  }, []);
  useEffect(() => {
    if (!show) return;
    let alive = true, raf = 0, renderer = null, model = null, killT = setTimeout(() => setShow(null), 3600);
    try { navigator.vibrate && navigator.vibrate([20, 60, 20, 200, 40]); } catch (e) {}
    loadThree().then(() => {
      if (!alive || !cvRef.current) return;
      const W = window.innerWidth, H = window.innerHeight;
      try { renderer = new THREE.WebGLRenderer({ canvas: cvRef.current, alpha: true, antialias: true }); } catch (e) { return; }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(W, H, false);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(45, W / H, .1, 100); cam.position.set(0, 2, 9); cam.lookAt(0, 2, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1));
      const sun = new THREE.DirectionalLight(0xffffff, .9); sun.position.set(-3, 6, 6); scene.add(sun);
      const halfW = Math.tan(22.5 * Math.PI / 180) * 9 * (W / H);
      const hx = Math.min(halfW * .5, 3.2), rimY = 3.2, R = .34;
      const hoop = new THREE.Group(); hoop.position.set(hx, 0, 0); scene.add(hoop);
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.2, .06), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .88, roughness: .2 }));
      board.position.set(0, rimY + .55, -.62); hoop.add(board);
      const square = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.7, .5, .07)), new THREE.LineBasicMaterial({ color: 0xF97316 }));
      square.position.set(0, rimY + .3, -.58); hoop.add(square);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xF97316, emissive: 0x000000, metalness: .4, roughness: .4 });
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.44, .035, 10, 40), rimMat);
      rim.rotation.x = Math.PI / 2; rim.position.set(0, rimY, -.08); hoop.add(rim);
      const net = new THREE.Mesh(new THREE.CylinderGeometry(.44, .27, .6, 14, 4, true), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: .85 }));
      net.position.set(0, rimY - .3, -.08); hoop.add(net);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, rimY + .6, 10), new THREE.MeshStandardMaterial({ color: 0x555b66 }));
      pole.position.set(0, (rimY + .6) / 2 - .2, -.9); hoop.add(pole);
      model = makeMascotBall(THREE, R);
      scene.add(model.root);
      // Confetti: flat paper bits in the brand colours.
      const COLS = [0x10B981, 0x0D9488, 0xF97316, 0xFACC15, 0xffffff, 0xEC4899];
      const bits = [], bitGeo = new THREE.PlaneGeometry(.09, .14);
      const pop = () => {
        for (let i = 0; i < 140; i++) {
          const m = new THREE.Mesh(bitGeo, new THREE.MeshBasicMaterial({ color: COLS[i % COLS.length], side: THREE.DoubleSide, transparent: true }));
          const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 4.5;
          m.position.set(hx, rimY, 0);
          m.userData = { vx: Math.cos(a) * sp * .7, vy: 3 + Math.random() * 5, vz: Math.sin(a) * sp * .4, rx: Math.random() * 9, ry: Math.random() * 9 };
          scene.add(m); bits.push(m);
        }
      };
      const sx0 = -halfW - .8, jx = -halfW * .45;
      let popped = false, last = performance.now(), t0 = last;
      const tick = now => {
        if (!alive) return;
        raf = requestAnimationFrame(tick);
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        const t = (now - t0) / 1000, b = model.root, bd = model.body;
        let sx = 1, sy = 1;
        if (t < .65) { // roll in
          const k = t / .65, e = 1 - Math.pow(1 - k, 3);
          b.position.set(sx0 + (jx - sx0) * e, R, 0); model.ball.rotation.x = 0; bd.rotation.z = -(b.position.x - sx0) / R * .5;
        } else if (t < .9) { // crouch
          const k = Math.sin((t - .65) / .25 * Math.PI / 2); sy = 1 - .3 * k; sx = 1 + .18 * k;
          b.position.set(jx, R * sy, 0); bd.rotation.z *= .8;
        } else if (t < 1.75) { // the shot
          const k = (t - .9) / .85, top = rimY + 1.7, y0 = R, y1 = rimY + .25;
          const x = jx + (hx - jx) * k;
          const y = (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * (top + .9) + k * k * y1;
          b.position.set(x, y, -.08 * k); model.ball.rotation.x -= dt * 9; bd.rotation.z = 0;
          sy = 1 + .12 * Math.sin(k * Math.PI); sx = 1 / sy;
        } else if (t < 2.1) { // swish through the net
          const k = (t - 1.75) / .35;
          b.position.set(hx, rimY + .25 - 1.1 * k, -.08);
          net.scale.y = 1 + .45 * Math.sin(k * Math.PI); net.position.y = rimY - .3 - .12 * Math.sin(k * Math.PI);
          if (!popped && k > .35) {
            popped = true; pop(); rimMat.emissive.setHex(0xF97316);
            const fl = document.querySelector(".celeb-flash"); fl && fl.classList.add("go");
          }
        } else { // bounce away under the hoop
          const k = t - 2.1, y = Math.abs(Math.sin(k * 6)) * Math.exp(-k * 2.2) * 1.3;
          b.position.set(hx - k * 1.1, R + y, -.08);
          model.ball.rotation.x -= dt * 5;
        }
        rimMat.emissive.multiplyScalar(.93);
        bd.scale.set(sx, sy, sx);
        model.pupils.forEach(p => { p.position.x = .02; p.position.y = .02; });
        bits.forEach(m => {
          const u = m.userData; u.vy -= 9 * dt; u.vx *= .985; u.vz *= .985;
          m.position.x += u.vx * dt; m.position.y += Math.max(u.vy, -2.2) * dt; m.position.z += u.vz * dt;
          m.rotation.x += u.rx * dt; m.rotation.y += u.ry * dt;
          if (t > 2.8) m.material.opacity = Math.max(0, 1 - (t - 2.8) / .7);
        });
        renderer.render(scene, cam);
      };
      raf = requestAnimationFrame(tick);
    }).catch(() => {});
    return () => {
      alive = false; clearTimeout(killT); cancelAnimationFrame(raf);
      if (model) model.dispose();
      if (renderer) { renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {} }
    };
  }, [show && show.id]);
  if (!show) return null;
  const petition = show.kind !== "verify";
  const title = lang === "en" ? "SWISH!" : lang === "hu" ? "KOSÁR!" : "COȘ!";
  const sub = petition
    ? (lang === "en" ? "Your signature just went in." : lang === "hu" ? "Az aláírásod bement." : "Semnătura ta a intrat în coș.")
    : (lang === "en" ? "Court checked. Legend behaviour." : lang === "hu" ? "Pálya ellenőrizve. Legenda." : "Teren verificat. Comportament de legendă.");
  return React.createElement("div", { className: "celeb", key: show.id, "aria-live": "polite", onClick: () => setShow(null) },
    React.createElement("canvas", { ref: cvRef, className: "celeb-cv" }),
    React.createElement("div", { className: "celeb-flash" }),
    React.createElement("div", { className: "celeb-text" },
      React.createElement("b", null, title),
      React.createElement("span", null, sub)));
}
