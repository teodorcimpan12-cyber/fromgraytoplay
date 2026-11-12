import { COURTS, useApp } from "../../app/core.js";
import { fxReduced } from "../../lib/fx-reduced.js";
import { useEffect, useRef, useState } from "../../lib/react.js";

/* "What this site can do": the deep features most visitors never find, one tap each. Copy states only what exists. */
export function Showcase() {
  const { lang, setPage, firebaseUser, openAuth } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const firstCourt = COURTS.find(c => c.lat != null);
  const impact = tab => () => { sessionStorage.setItem("g2p_impact_tab", tab); setPage("impact"); scrollTo(0, 0); };
  const [cnt, setCnt] = useState(0);
  const [blk, setBlk] = useState(false);
  // Tiles flip in once when the grid scrolls into view, then tilt toward the mouse.
  const gridRef = useRef(null);
  const [phase, setPhase] = useState(() => fxReduced() || !window.IntersectionObserver ? "" : "pre");
  useEffect(() => {
    if (phase !== "pre" || !gridRef.current) return;
    let tid = 0;
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      setPhase("enter");
      tid = setTimeout(() => setPhase(""), 1400);
    }, { threshold: .2 });
    io.observe(gridRef.current);
    return () => { io.disconnect(); clearTimeout(tid); };
  }, []);
  const tilt = e => {
    if (e.pointerType !== "mouse" || phase) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    el.style.setProperty("--ry", (px * 14).toFixed(2) + "deg");
    el.style.setProperty("--rx", (-py * 12).toFixed(2) + "deg");
    el.style.setProperty("--px", (px * 2).toFixed(3));
    el.style.setProperty("--py", (py * 2).toFixed(3));
    el.style.setProperty("--gx", ((px + .5) * 100).toFixed(1) + "%");
    el.style.setProperty("--gy", ((py + .5) * 100).toFixed(1) + "%");
    el.classList.add("tilting");
  };
  const untilt = e => {
    const el = e.currentTarget;
    ["--rx", "--ry", "--px", "--py"].forEach(p => el.style.removeProperty(p));
    el.classList.remove("tilting");
  };
  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(v + 90000, 5000000);
      setCnt(v);
      if (v >= 5000000) { clearInterval(id); setTimeout(() => setBlk(true), 300); }
    }, 30);
    return () => clearInterval(id);
  }, []);
  const tiles = [
    {
      key: "sat", icon: "🛰️", color: "var(--teal)",
      preview: React.createElement("div", { className: "sc-sat-anim", "aria-hidden": "true" },
        React.createElement("div", { className: "sc-sat-strip sc-sat-s1" }),
        React.createElement("div", { className: "sc-sat-strip sc-sat-s2" }),
        React.createElement("div", { className: "sc-sat-strip sc-sat-s3" })
      ),
      title: L3("Terenuri văzute din satelit", "Courts from space", "Pályák műholdról"),
      desc: L3("Imagini reale 2011–2022: apasă pe orice teren.", "Real images 2011–2022: tap any court.", "Valódi képek 2011–2022: érintsd a pályát."),
      action: () => { if (firstCourt) location.hash = "#court-" + firstCourt.id; }
    },
    {
      key: "cnt", icon: "💸", color: "var(--coral)",
      preview: React.createElement("div", { className: "sc-cnt-wrap", "aria-hidden": "true" },
        React.createElement("span", { className: "sc-cnt-num" }, (cnt / 1e6).toFixed(1) + "M lei"),
        React.createElement("span", { className: "sc-cnt-zero" + (blk ? " sc-blink" : "") }, "0%")
      ),
      title: L3("Chitanța inegalității", "The inequality receipt", "Az egyenlőtlenség nyugtája"),
      desc: L3("5.000.000 lei promise. Zero renovate.", "5,000,000 lei promised. Zero renovated.", "5 000 000 lej ígérve. Nulla felújítva."),
      action: impact("calc")
    },
    {
      key: "pulse", icon: "🧬", color: "var(--green)",
      preview: React.createElement("div", { className: "sc-orb-mini", "aria-hidden": "true" },
        React.createElement("div", { className: "sc-orb-ring" }),
        React.createElement("div", { className: "sc-orb-core" })
      ),
      title: L3("Pulsul orașului", "City pulse", "A város pulzusa"),
      desc: L3("Fiecare semnătură și sesizare animată.", "Every signature and report animated.", "Minden aláírás animálva."),
      action: () => { sessionStorage.setItem("g2p_open_pulse", "1"); setPage("impact"); scrollTo(0, 0); }
    },
    {
      key: "letter", icon: "✉️", color: "var(--green)",
      preview: React.createElement("div", { className: "sc-letter-mini", "aria-hidden": "true" },
        React.createElement("span", null, L3("Stimate Primar,\nVă sesizez că...", "Dear Mayor,\nI hereby report...", "Tisztelt Polgármester,\nezúton jelzem..."))
      ),
      title: L3("Scrisoare la Primărie", "Letter to City Hall", "Levél a városházának"),
      desc: L3("Oficială, completată automat. Tu o trimiți.", "Official, auto-filled. You send it.", "Hivatalos, automatikusan kitöltve."),
      action: () => { setPage("petition"); scrollTo(0, 0); }
    }
  ];
  return React.createElement("section", { className: "section showcase" },
    React.createElement("div", { className: "container" },
      React.createElement("h2", { className: "section-title" }, "✨ " + L3("Ce poate face site-ul ăsta", "What this site can do", "Mit tud ez az oldal")),
      React.createElement("p", { className: "section-sub" }, L3("Patru instrumente. Fiecare face ceva diferit.", "Four tools. Each one does something different.", "Négy eszköz, mind más-más.")),
      React.createElement("div", { ref: gridRef, className: "sc-grid sc-grid-v2" + (phase ? " " + phase : "") },
        tiles.map((tile, i) => React.createElement("button", {
          key: tile.key, className: "sc-tile sc-tile-v2", onClick: tile.action,
          style: { "--sc-acc": tile.color, "--i": i },
          onPointerMove: tilt, onPointerLeave: untilt
        },
          tile.preview,
          React.createElement("span", { className: "sc-ic", "aria-hidden": "true" }, tile.icon),
          React.createElement("b", null, tile.title),
          React.createElement("span", null, tile.desc)
        ))
      ),
      !firebaseUser && React.createElement("div", { className: "sc-cta" },
        React.createElement("p", null, L3("Toate merg mai bine cu un cont.", "Everything works better with an account.", "Fiókkal minden jobb.")),
        React.createElement("button", { className: "btn btn-green btn-lg", onClick: () => openAuth("signup") }, "👤 " + L3("Creează cont gratuit", "Create a free account", "Ingyenes fiók")))));
}
