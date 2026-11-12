import { ACTIVE_CITY, COURTS, STADIUM_N, roDe, useApp } from "../app/core.js";
import { SrcRef } from "../components/SrcRef.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { fxReduced } from "../lib/fx-reduced.js";
import { useEffect, useRef, useState } from "../lib/react.js";

export function courtsPhrase(lang) {
  const n = COURTS.length, k = STADIUM_N;
  if (lang === "en") return n + " public courts" + (k ? " (" + k + " of them " + (k === 1 ? "a stadium" : "stadiums") + ")" : "");
  if (lang === "hu") return n + " közpálya" + (k ? " (ebből " + k + " stadion)" : ""); // TODO: HU review
  return roDe(n) + "terenuri publice" + (k ? " (dintre care " + (k === 1 ? "un stadion" : roDe(k) + "stadioane") + ")" : "");
}
export function StoryScroll() {
  const { lang, setPage } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const sib = ACTIVE_CITY === "sibiu";
  const reports = useFirebase(sib ? "reports" : null);
  const [still] = useState(fxReduced);
  const [scene, setScene] = useState(0);
  const ref = useRef(null), numRef = useRef(null), stampRef = useRef(null);
  const N = 4;
  const checked = {};
  if (reports) Object.values(reports).forEach(r => { if (r && r.category === "condition" && r.courtId) checked[r.courtId] = 1; });
  const sbCourts = COURTS.filter(c => c.city === "sibiu");
  const lit = sbCourts.filter(c => checked[c.id]).length;
  const money = v => Math.round(v).toLocaleString("ro-RO") + " lei";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (still) {
      if (numRef.current) numRef.current.textContent = money(5000000);
      if (stampRef.current) stampRef.current.classList.add("hit");
      return;
    }
    const nav = document.querySelector(".navbar");
    let raf = 0, last = -1;
    const tick = () => {
      raf = 0;
      const navH = nav ? nav.offsetHeight : 58;
      el.style.setProperty("--navH", navH + "px");
      // The stage is a card at ~3/4 of the screen, centred: progress runs while it is stuck.
      const tr = el.querySelector(".story-track"), st = el.querySelector(".story-stage");
      const r = (tr || el).getBoundingClientRect(), sh = st ? st.offsetHeight : window.innerHeight - navH;
      const top = navH + (window.innerHeight - navH - sh) / 2;
      const total = Math.max(1, r.height - sh);
      const p = Math.min(1, Math.max(0, (top - r.top) / total));
      const pos = p * N, idx = Math.min(N - 1, Math.floor(pos)), local = idx === N - 1 && p >= 1 ? 1 : Math.min(1, pos - idx);
      el.querySelectorAll(".st-scene").forEach((s, i) => s.style.setProperty("--t", i < idx ? "1" : i > idx ? "0" : local.toFixed(3)));
      if (idx !== last) { last = idx; setScene(idx); }
      if (numRef.current) {
        const v = idx > 2 ? 1 : idx < 2 ? 0 : Math.min(1, local / .55);
        numRef.current.textContent = money(5000000 * (1 - Math.pow(1 - v, 3)));
      }
      if (stampRef.current) stampRef.current.classList.toggle("hit", idx > 2 || (idx === 2 && local > .6));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [still]);

  const court = React.createElement("svg", { className: "st-court", viewBox: "0 0 300 200", "aria-hidden": "true" },
    React.createElement("polygon", { className: "floor", points: "30,190 270,190 225,48 75,48" }),
    React.createElement("polygon", { className: "floor-g", points: "30,190 270,190 225,48 75,48" }),
    React.createElement("polygon", { className: "ln", points: "30,190 270,190 225,48 75,48" }),
    React.createElement("line", { className: "ln", x1: 52, y1: 119, x2: 248, y2: 119 }),
    React.createElement("ellipse", { className: "ln", cx: 150, cy: 119, rx: 30, ry: 12 }),
    !sib && React.createElement("path", { className: "crk", d: "M62 182 L88 160 L82 146 L112 128 L108 108" }),
    !sib && React.createElement("path", { className: "crk", d: "M236 186 L222 160 L242 140 L232 112 L246 96" }),
    !sib && React.createElement("path", { className: "crk", d: "M140 60 L152 82 L134 98 L164 118 L150 140" }),
    React.createElement("g", { className: "hoop" },
      React.createElement("line", { x1: 150, y1: 48, x2: 150, y2: 14, stroke: "var(--lightGrey)", strokeWidth: 4 }),
      React.createElement("rect", { x: 128, y: 2, width: 44, height: 18, rx: 2, fill: "var(--white)", opacity: .9 }),
      React.createElement("ellipse", { cx: 150, cy: 24, rx: 10, ry: 3.5, fill: "none", stroke: "var(--coral)", strokeWidth: 3 })
    ),
    sib && React.createElement("text", { x: 150, y: 140, textAnchor: "middle", fontSize: 74, fontWeight: 800, fill: "var(--white)", style: { opacity: "var(--t,0)" } }, "?")
  );
  const scenes = [
    {
      vis: React.createElement(React.Fragment, null, React.createElement("span", { className: "st-shadow" }), React.createElement("span", { className: "st-ball", "aria-hidden": "true" }, "🏀")),
      h: L3("Ai 15 ani și vrei doar să joci.", "You're 15 and you just want to play.", "15 éves vagy, és csak játszani akarsz."),
      p: L3("După școală, cu prietenii. Mingea o ai. Îți trebuie doar un teren.", "After school, with your friends. You've got the ball. You just need a court.", "Iskola után, a barátaiddal. A labda megvan. Csak egy pálya kell.")
    },
    {
      vis: court,
      h: sib ? L3("Cum arată terenul de lângă tine?", "What does the court near you look like?", "Milyen a hozzád legközelebbi pálya?")
             : L3("Cel mai apropiat teren arată așa.", "The nearest court looks like this.", "A legközelebbi pálya így néz ki."),
      p: sib ? L3("Pe hartă sunt " + courtsPhrase("ro") + ". Starea lor nu a verificat-o încă nimeni.", "There are " + courtsPhrase("en") + " on the map. Nobody has checked their condition yet.", courtsPhrase("hu") + " van a térképen. Az állapotukat még senki sem ellenőrizte.")
             : L3("Coș îndoit, asfalt crăpat, linii șterse. Și nu e singurul.", "Bent hoop, cracked asphalt, faded lines. And it isn't the only one.", "Görbe kosár, repedezett aszfalt, kopott vonalak. És nem ez az egyetlen.")
    },
    sib ? {
      vis: React.createElement("div", { className: "st-dots", "aria-hidden": "true" }, sbCourts.map(c => React.createElement("i", { key: c.id, className: checked[c.id] ? "on" : "" }))),
      h: lit + " / " + sbCourts.length,
      p: L3("terenuri verificate de comunitate. Fiecare punct e un teren real și se aprinde când cineva îl verifică.", "courts checked by the community. Each dot is a real court and lights up when someone checks it.", "pályát ellenőrzött a közösség. Minden pont egy valódi pálya, és kigyullad, ha valaki ellenőrzi."),
      src: React.createElement(React.Fragment, null, L3("Sursă: OpenStreetMap (ODbL) · verificări live", "Source: OpenStreetMap (ODbL) · live checks", "Forrás: OpenStreetMap (ODbL) · élő ellenőrzések"), React.createElement(SrcRef, { id: "osm" }))
    } : {
      vis: React.createElement("div", null, React.createElement("div", { ref: numRef, className: "st-num" }, money(0)), React.createElement("span", { ref: stampRef, className: "st-stamp" }, "0%")),
      h: L3("promiși pentru renovări. Realizat: zero.", "promised for renovations. Delivered: zero.", "ígéret felújításra. Megvalósult: semmi."),
      p: "",
      src: React.createElement(React.Fragment, null, L3("Surse: SIDU Târgu Mureș · Punctul.ro", "Sources: SIDU Târgu Mureș · Punctul.ro", "Források: SIDU Marosvásárhely · Punctul.ro"), React.createElement(SrcRef, { id: ["sidu", "punctul-5m"] }))
    },
    {
      vis: React.createElement(React.Fragment, null,
        React.createElement("div", { className: "st-phone", "aria-hidden": "true" }, React.createElement("i"), React.createElement("i"), React.createElement("i"), React.createElement("i"), React.createElement("i"), React.createElement("i")),
        React.createElement("span", { className: "st-env", "aria-hidden": "true" }, "✉️"),
        React.createElement("span", { className: "st-hall", "aria-hidden": "true" }, "🏛️")),
      h: L3("Acum poți face ceva.", "Now you can do something.", "Most tehetsz valamit."),
      p: sib ? L3("Verifici un teren din telefon. Verificarea apare live pe hartă, iar scrisoarea pleacă la Primăria Sibiu.", "Check a court from your phone. It shows up live on the map, and the letter goes to Sibiu City Hall.", "Ellenőrizz egy pályát a telefonodról. Élőben megjelenik a térképen, a levél pedig a városházára megy.")
             : L3("Raportezi din telefon, cu o poză. Semnezi petiția. Scrisoarea pleacă la Primărie, gata de depus.", "Report from your phone, with a photo. Sign the petition. The letter goes to City Hall, ready to file.", "Jelents a telefonodról, fotóval. Írd alá a petíciót. A levél kész, mehet a városházára."),
      cta: true
    }
  ];
  return React.createElement("section", { ref, className: "story" + (still ? " static" : ""), "aria-label": L3("Povestea", "The story", "A történet") },
    React.createElement("div", { className: "story-track", "data-demo": "story", style: { "--n": N } },
      React.createElement("div", { className: "story-stage" },
        scenes.map((s, i) => React.createElement("div", { key: i, className: "st-scene" + (still || i === scene ? " on" : i < scene ? " past" : "") },
          React.createElement("div", { className: "st-vis" }, s.vis),
          React.createElement("h2", { className: "st-h" }, s.h),
          s.p && React.createElement("p", { className: "st-p" }, s.p),
          s.src && React.createElement("span", { className: "st-src" }, s.src),
          s.cta && React.createElement("div", { className: "flex gap-1", style: { flexWrap: "wrap", justifyContent: "center" } },
            sib ? React.createElement("button", { className: "btn btn-green btn-lg", onClick: () => { setPage("courts"); scrollTo(0, 0); } }, "🩺 ", L3("Verifică un teren", "Check a court", "Ellenőrizz egy pályát"))
                : React.createElement("button", { className: "btn btn-green btn-lg", onClick: () => { setPage("petition"); scrollTo(0, 0); } }, "✍️ ", L3("Semnează petiția", "Sign the petition", "Írd alá a petíciót")),
            React.createElement("button", { className: "btn btn-outline btn-lg", style: { color: "var(--white)", borderColor: "var(--lightGrey)" }, onClick: () => { setPage(sib ? "petition" : "courts"); scrollTo(0, 0); } },
              sib ? "✍️ " + L3("Petiția", "The petition", "A petíció") : "📍 " + L3("Vezi terenurile", "See the courts", "Pályák"))
          )
        )),
        !still && React.createElement("div", { className: "st-rail", "aria-hidden": "true" }, scenes.map((_, i) => React.createElement("i", { key: i, className: i === scene ? "on" : "" }))),
        !still && scene === 0 && React.createElement("div", { className: "st-hint", "aria-hidden": "true" }, "↓ ", L3("DERULEAZĂ", "SCROLL", "GÖRGESS"))
      )
    )
  );
}
