import { DemoSlide } from "./DemoSlide.js";
import { DEMO_TOTAL, db, demoClock, useApp } from "./core.js";
import { DEMO_WHO } from "../data/constants.js";
import { DEMO_QA } from "../data/demo-qa.js";
import { DEMO_STEPS } from "../data/demo-steps.js";
import { useCallback, useEffect, useRef, useState } from "../lib/react.js";

export function demoShow(i, setPage) {
  const s = DEMO_STEPS[i];
  if (s.slide) return; // a slide covers the app; keep the page where it is
  setPage(s.page || "home");
  setTimeout(() => {
    const el = s.sel && document.querySelector(s.sel);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (s.id === "hero") window.scrollTo({ top: 0, behavior: "smooth" });
  }, 260);
}
export function DemoLayer() {
  const { setPage, lang } = useApp();
  const [step, setStep] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [slideX, setSlideX] = useState(false);
  const [qa, setQa] = useState(-1);
  const [t0, setT0] = useState(0); // the run clock starts on the first step change
  const [stepAt, setStepAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const stepRef = useRef(0);
  stepRef.current = step;
  const go = useCallback(i => {
    const n = Math.max(0, Math.min(DEMO_STEPS.length - 1, i));
    const at = Date.now();
    setT0(v => v || at);
    setStep(n); setStepAt(at); setSlideX(false); setQa(-1);
    demoShow(n, setPage);
  }, [setPage]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id); }, []);
  useEffect(() => {
    const h = e => {
      const el = e.target;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      let d = 0;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") d = 1;
      else if (e.key === "ArrowLeft" || e.key === "PageUp") d = -1;
      else if (e.key === "h" || e.key === "H") { setHidden(v => !v); return; }
      else if (e.key === "Escape") { setQa(-1); return; }
      else if (/^[1-9]$/.test(e.key) && +e.key <= DEMO_STEPS.length) { e.preventDefault(); go(+e.key - 1); return; }
      else return;
      e.preventDefault(); e.stopPropagation();
      go(stepRef.current + d);
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [go]);
  // phone remote: skip the snapshot that is already there, follow every new one
  useEffect(() => {
    let first = true;
    const ref = db.ref("demo");
    const cb = s => {
      const v = s.val();
      if (first) { first = false; return; }
      if (!v || typeof v.step !== "number") return;
      const q = typeof v.qa === "number" && v.qa >= 0 && v.qa < DEMO_QA.length ? v.qa : -1;
      if (v.step !== stepRef.current) go(v.step);
      setQa(q);
    };
    ref.on("value", cb, () => {});
    return () => ref.off("value", cb);
  }, [go]);
  const s = DEMO_STEPS[step];
  const runMs = t0 ? now - t0 : 0, stepMs = t0 ? now - stepAt : 0;
  const over = stepMs > s.sec * 1000;
  const q = qa >= 0 ? DEMO_QA[qa] : null;
  const e = React.createElement;
  return e(React.Fragment, null,
    !hidden && e("div", { className: "demo-bar", role: "toolbar", "aria-label": "Demo" },
      e("button", { onClick: () => go(step - 1), disabled: step === 0, "aria-label": "Înapoi" }, "‹"),
      e("span", { className: "demo-n" }, step + 1, "/", DEMO_STEPS.length),
      e("span", { className: "demo-t" }, (lang === "en" ? s.en : s.ro) + " · " + DEMO_WHO[s.who]),
      e("span", { className: "demo-c" + (over ? " over" : "") }, demoClock(stepMs), " · ", demoClock(runMs), "/", demoClock(DEMO_TOTAL)),
      e("button", { onClick: () => go(step + 1), disabled: step === DEMO_STEPS.length - 1, "aria-label": "Înainte" }, "›")),
    s.slide && !slideX && !q && e(DemoSlide, { sl: s.slide, onClose: () => setSlideX(true) }),
    q && q.s && e(DemoSlide, { sl: q.s, kicker: "Întrebare · " + q.q, onClose: () => setQa(-1) }));
}
