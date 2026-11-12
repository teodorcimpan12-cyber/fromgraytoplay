import { g2pSfx, useApp } from "./core.js";
import { useEffect, useRef, useState } from "../lib/react.js";

// Typing "1v1": catch as many falling balls as you can in 10 seconds.
export function CatchGame({ onClose }) {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(10);
  const [over, setOver] = useState(false);
  const [round, setRound] = useState(0);
  const boxRef = useRef(null), scoreRef = useRef(0);
  let best = 0; try { best = +(localStorage.getItem("g2p_1v1_best") || 0); } catch (e) {}
  useEffect(() => {
    scoreRef.current = 0; setScore(0); setLeft(10); setOver(false);
    let alive = true, secs = 10;
    const T = [];
    g2pSfx("whistle");
    const spawn = () => {
      if (!alive || !boxRef.current) return;
      const b = document.createElement("span");
      b.className = "catch-ball";
      b.textContent = Math.random() < .18 ? "⚽" : "🏀";
      b.style.left = (3 + Math.random() * 82) + "vw";
      const d = Math.max(.9, 1.6 + Math.random() * 1.1 - scoreRef.current * .03);
      b.style.setProperty("--d", d + "s");
      b.addEventListener("pointerdown", ev => {
        ev.preventDefault();
        if (!alive || b.classList.contains("got")) return;
        const r = b.getBoundingClientRect();
        b.style.setProperty("--y", (r.top + 70) + "px");
        b.classList.add("got");
        scoreRef.current++; setScore(scoreRef.current);
        g2pSfx(scoreRef.current % 5 === 0 ? "swish" : "bounce");
        try { navigator.vibrate && navigator.vibrate(8); } catch (e) {}
        setTimeout(() => b.remove(), 300);
      });
      boxRef.current.appendChild(b);
      T.push(setTimeout(() => b.remove(), d * 1000 + 200));
    };
    const sp = setInterval(spawn, 420);
    const clock = setInterval(() => {
      secs--; setLeft(secs);
      if (secs > 0) return;
      alive = false; clearInterval(sp); clearInterval(clock);
      if (boxRef.current) boxRef.current.querySelectorAll(".catch-ball").forEach(x => x.remove());
      g2pSfx("whistle");
      try { if (scoreRef.current > +(localStorage.getItem("g2p_1v1_best") || 0)) localStorage.setItem("g2p_1v1_best", String(scoreRef.current)); } catch (e) {}
      setOver(true);
    }, 1000);
    spawn();
    return () => { alive = false; clearInterval(sp); clearInterval(clock); T.forEach(clearTimeout); };
  }, [round]);
  useEffect(() => {
    const k = ev => { if (ev.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const e = React.createElement;
  const verdict = score < 6 ? L3("Încălzire. Mai încearcă.", "Warm-up. Go again.", "Bemelegítés. Még egyszer.")
    : score < 14 ? L3("Bun! Nici coșul îndoit nu te-ar opri.", "Nice! Not even a bent hoop could stop you.", "Szép! Még egy görbe kosár sem állítana meg.")
    : L3("Legendă de cartier. 🔥", "Neighbourhood legend. 🔥", "A környék legendája. 🔥");
  return e("div", { className: "catch", ref: boxRef, role: "dialog", "aria-modal": "true", "aria-label": "1v1" },
    e("div", { className: "catch-hud" }, e("span", null, "🏀 " + score), e("span", null, "⏱ " + left + "s")),
    over && e("div", { className: "catch-end" },
      e("div", { className: "text-xs", style: { color: "var(--textSec)", letterSpacing: ".1em" } }, "1V1 · " + L3("AI PRINS", "YOU CAUGHT", "ELKAPTÁL")),
      e("b", null, score),
      e("p", null, verdict),
      e("p", { className: "text-xs", style: { color: "var(--textSec)" } }, L3("Recordul tău: ", "Your best: ", "Legjobb: ") + Math.max(best, score)),
      e("div", { className: "flex gap-1" },
        e("button", { className: "btn btn-green btn-sm", onClick: () => setRound(r => r + 1) }, L3("Încă o dată", "Again", "Még egyszer")),
        e("button", { className: "btn btn-outline btn-sm", onClick: onClose }, L3("Închide", "Close", "Bezárás")))));
}
