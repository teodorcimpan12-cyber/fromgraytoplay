import { DEMO_TOTAL, db, demoClock, useApp } from "./core.js";
import { DEMO_WHO } from "../data/constants.js";
import { DEMO_QA } from "../data/demo-qa.js";
import { DEMO_STEPS } from "../data/demo-steps.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { useEffect, useState } from "../lib/react.js";

export function DemoRemote() {
  const { isAdmin, authReady, openAuth } = useApp();
  const live = useFirebase("demo");
  const [tab, setTab] = useState("pitch");
  const [cat, setCat] = useState("");
  const [find, setFind] = useState("");
  const [open, setOpen] = useState(-1);
  const [t0, setT0] = useState(0);
  const [stepAt, setStepAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [err, setErr] = useState("");
  const [slow, setSlow] = useState(false);
  useEffect(() => { const id = setTimeout(() => setSlow(true), 4000); return () => clearTimeout(id); }, []);
  const step = live && typeof live.step === "number" ? Math.min(live.step, DEMO_STEPS.length - 1) : 0;
  const onScreen = live && typeof live.qa === "number" && live.qa >= 0 && live.qa < DEMO_QA.length ? live.qa : -1;
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id); }, []);
  // keep the phone screen on while it is the remote
  useEffect(() => {
    let wl = null;
    try { navigator.wakeLock && navigator.wakeLock.request("screen").then(l => { wl = l; }).catch(() => {}); } catch (e) {}
    return () => { try { wl && wl.release(); } catch (e) {} };
  }, []);
  const write = (n, qa) => {
    db.ref("demo").set({ step: n, at: firebase.database.ServerValue.TIMESTAMP, qa: qa })
      .then(() => setErr(""))
      .catch(() => setErr("Nu pot scrie demo/ — ești logat cu contul de admin? Regulile bazei de date sunt publicate?"));
    try { navigator.vibrate && navigator.vibrate(30); } catch (e) {}
  };
  const send = i => {
    const n = Math.max(0, Math.min(DEMO_STEPS.length - 1, i));
    const at = Date.now();
    setT0(v => v || at); setStepAt(at);
    write(n, -1);
  };
  const s = DEMO_STEPS[step], nx = DEMO_STEPS[step + 1];
  const stepMs = t0 ? now - stepAt : 0, over = stepMs > s.sec * 1000;
  const cats = DEMO_QA.reduce((a, x) => a.indexOf(x.c) < 0 ? a.concat(x.c) : a, []);
  const f = find.trim().toLowerCase();
  const list = DEMO_QA.map((x, i) => [x, i]).filter(([x]) => (!cat || x.c === cat) && (!f || (x.q + " " + x.a).toLowerCase().indexOf(f) >= 0));
  const e = React.createElement;
  const top = e("div", { className: "demo-rm-top" },
    e("span", null, step + 1, "/", DEMO_STEPS.length),
    e("span", { className: over ? "over" : "" }, demoClock(stepMs), " / ", demoClock(s.sec * 1000)),
    e("span", null, demoClock(t0 ? now - t0 : 0), " / ", demoClock(DEMO_TOTAL)));
  const tabs = e("div", { className: "demo-rm-tabs", role: "tablist" },
    e("button", { role: "tab", "aria-selected": tab === "pitch", className: tab === "pitch" ? "on" : "", onClick: () => setTab("pitch") }, "Pitch"),
    e("button", { role: "tab", "aria-selected": tab === "qa", className: tab === "qa" ? "on" : "", onClick: () => setTab("qa") }, "Întrebări (" + DEMO_QA.length + ")"));
  const screenBar = onScreen >= 0 && e("div", { className: "demo-rm-onscreen" },
    e("span", null, "Pe ecran: ", DEMO_QA[onScreen].q),
    e("button", { onClick: () => write(step, -1) }, "Ascunde"));
  const pitch = e(React.Fragment, null,
    e("p", { className: "demo-rm-who" }, "Vorbește: ", e("b", null, DEMO_WHO[s.who])),
    e("h2", null, s.ro),
    e("p", { className: "demo-rm-note" }, s.note),
    nx && e("p", { className: "demo-rm-next" }, "Urmează: ", nx.ro, " · ", DEMO_WHO[nx.who]),
    e("div", { className: "demo-rm-steps" }, DEMO_STEPS.map((x, i) => e("button", { key: x.id, className: i === step ? "on" : "", onClick: () => send(i) }, (i + 1) + " " + x.ro))),
    e("div", { className: "demo-rm-btns" },
      e("button", { onClick: () => send(step - 1), disabled: step === 0, "aria-label": "Înapoi" }, "‹"),
      e("button", { className: "go", onClick: () => send(step + 1), disabled: !nx, "aria-label": "Înainte" }, "›")),
    e("button", { className: "demo-rm-reset", onClick: () => { setT0(0); send(0); } }, "↺ De la început"));
  const qaTab = e(React.Fragment, null,
    e("input", { className: "demo-rm-find", type: "search", placeholder: "Caută (bani, AI, GDPR…)", value: find, onChange: ev => setFind(ev.target.value) }),
    e("div", { className: "demo-rm-cats" },
      e("button", { className: !cat ? "on" : "", onClick: () => setCat("") }, "Toate"),
      cats.map(c => e("button", { key: c, className: cat === c ? "on" : "", onClick: () => setCat(c) }, c))),
    e("div", { className: "demo-rm-qa" }, list.map(([x, i]) => e("div", { key: i, className: "demo-rm-q" + (open === i ? " open" : "") },
      e("button", { className: "demo-rm-qh", "aria-expanded": open === i, onClick: () => setOpen(open === i ? -1 : i) },
        e("span", { className: "demo-rm-qc" }, x.c + " · " + DEMO_WHO[x.who]), e("b", null, x.q)),
      open === i && e("div", { className: "demo-rm-qb" },
        e("p", null, x.a),
        x.s && (onScreen === i
          ? e("button", { className: "demo-rm-show off", onClick: () => write(step, -1) }, "Ascunde de pe ecran")
          : e("button", { className: "demo-rm-show", onClick: () => write(step, i) }, "Arată pe ecran")))))));
  return ReactDOM.createPortal(e("div", { className: "demo-remote" },
    e("p", { className: "demo-rm-brand" }, "📱 Telecomandă · From Grey to Play"),
    !authReady && !slow ? e("p", { className: "demo-rm-wait" }, "Se verifică contul…") :
    !isAdmin ? e("div", { className: "demo-rm-login" },
      e("p", null, authReady ? "Telecomanda merge doar cu contul de admin." : "Contul nu răspunde. Conectează-te din nou sau reîncarcă."),
      !authReady && e("button", { className: "btn btn-outline", onClick: () => location.reload() }, "↻ Reîncarcă"),
      e("button", { className: "btn btn-green", onClick: () => openAuth() }, "Conectează-te")) :
    e(React.Fragment, null, top, tabs, screenBar, err && e("p", { className: "demo-rm-err" }, err), tab === "pitch" ? pitch : qaTab)), document.body);
}
