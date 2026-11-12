import { ACTIVE_CITY, CITY_HALL, db, g2pSfx, useApp } from "../../app/core.js";
import { QuickReportModal } from "../../components/QuickReportModal.js";
import { Reveal } from "../../components/Reveal.js";
import { SrcRef } from "../../components/SrcRef.js";
import { G2P_EMAIL, HELP_TIERS, SITE } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { cityName } from "../../lib/city-name.js";
import { fxReduced } from "../../lib/fx-reduced.js";
import { funFx } from "../../lib/g2p-egg.js";
import { getVoterKey } from "../../lib/get-voter-key.js";
import { logActivity } from "../../lib/log-activity.js";
import { anonName } from "../../lib/next-lang.js";
import { useEffect, useRef, useState } from "../../lib/react.js";
import { copyText } from "../../lib/src-by-id.js";
import { CityHallGuide } from "./CityHallGuide.js";

export function helpDone() { try { return JSON.parse(localStorage.getItem("g2p_help") || "{}") || {}; } catch (e) { return {}; } }
export function helpMark(id) {
  const f = helpDone();
  if (f[id]) return false;
  f[id] = Date.now();
  try { localStorage.setItem("g2p_help", JSON.stringify(f)); } catch (e) {}
  try { const vk = getVoterKey(); if (vk) db.ref("achievements/" + vk + "/help_" + id).set(f[id]); } catch (e) {}
  return true;
}
export function HelpPage() {
  const { t, lang, toast, setPage } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const sib = ACTIVE_CITY === "sibiu";
  const [tier, setTier] = useState(null);
  const [sweep, setSweep] = useState(0);
  const [done, setDone] = useState(helpDone);
  const [report, setReport] = useState(false);
  const [vf, setVf] = useState({ name: "", email: "", phone: "", when: "" });
  const [volSent, setVolSent] = useState(false);
  const listRef = useRef(null);
  // Pull the account's progress into this device (and this device's into the account).
  const vk = getVoterKey();
  const remote = useFirebase(vk ? "achievements/" + vk : null);
  useEffect(() => {
    if (!remote) return;
    const f = helpDone(); let changed = false;
    Object.keys(remote).forEach(k => { if (k.indexOf("help_") === 0 && !f[k.slice(5)]) { f[k.slice(5)] = remote[k]; changed = true; } });
    if (changed) { try { localStorage.setItem("g2p_help", JSON.stringify(f)); } catch (e) {} setDone(f); }
  }, [remote]);
  const voted = (() => { try { return !!localStorage.getItem("g2p_voted"); } catch (e) { return false; } })();
  const scrollTo = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: fxReduced() ? "auto" : "smooth", block: "start" }); };
  const share = () => {
    const text = L3("Terenurile din " + cityName(lang) + " pot arăta mai bine. Uite ce facem:", "The courts in " + cityName(lang) + " can be better. Here's what we're doing:", "A " + cityName(lang) + "-i pályák lehetnek jobbak. Ezt csináljuk:");
    if (navigator.share) navigator.share({ title: "From Grey to Play", text: text, url: SITE }).catch(() => {});
    else copyText(text + " " + SITE).then(ok => ok && toast(L3("Link copiat ✓", "Link copied ✓", "Link másolva ✓")));
  };
  const mail = subj => { window.location.href = "mailto:" + G2P_EMAIL + "?subject=" + encodeURIComponent(subj); };
  const go = p => () => { setPage(p); window.scrollTo(0, 0); };
  const ACTIONS = {
    "5m": [
      { id: "sign", ic: "✍️", h: L3("Semnează petiția", "Sign the petition", "Írd alá a petíciót"), p: L3("Un nume și un email. Fiecare semnătură apare live.", "A name and an email. Every signature shows up live.", "Egy név és egy e-mail. Minden aláírás élőben látszik."), btn: L3("Semnez", "Sign", "Aláírom"), auto: voted, run: go("petition") },
      { id: "verify", ic: "🔍", h: L3("Verifică un teren", "Check a court", "Ellenőrizz egy pályát"), p: sib ? L3("Alege un teren din Sibiu și spune-ne în ce stare e. 20 de secunde.", "Pick a Sibiu court and tell us its condition. 20 seconds.", "Válassz egy szebeni pályát, és mondd el, milyen állapotban van. 20 mp.") : L3("Deschide un teren pe hartă și confirmă ce vezi.", "Open a court on the map and confirm what you see.", "Nyiss meg egy pályát a térképen, és erősítsd meg, amit látsz."), btn: L3("La hartă", "To the map", "A térképhez"), run: go("courts") },
      { id: "report", ic: "⚠️", h: L3("Raportează o problemă", "Report a problem", "Jelents egy hibát"), p: L3("Coș rupt, plasă lipsă, gunoi. Trei pași: teren, problemă, poză.", "Broken hoop, missing net, trash. Three steps: court, problem, photo.", "Törött palánk, hiányzó háló, szemét. Három lépés: pálya, hiba, fotó."), btn: L3("Raportez", "Report", "Jelentem"), run: () => setReport(true) },
      { id: "share", ic: "📣", h: L3("Trimite site-ul unui prieten", "Send the site to a friend", "Küldd el egy barátodnak"), p: L3("Cine joacă pe terenul tău? Lui îi trimiți.", "Who plays on your court? Send it to them.", "Ki játszik a pályádon? Neki küldd."), btn: L3("Trimit", "Send", "Küldöm"), run: share }
    ],
    "1h": [
      { id: "letter", ic: "✉️", h: L3("Scrie scrisoarea către Primărie", "Write the letter to City Hall", "Írd meg a levelet a városházának"), p: L3("Gata scrisă, cu cifrele și sursele. O completezi cu de ce contează pentru tine.", "Ready-written, with the numbers and sources. Add why it matters to you.", "Kész levél számokkal és forrásokkal. Írd hozzá, miért fontos neked."), btn: L3("Scriu", "Write", "Megírom"), run: go("petition") },
      { id: "visit", ic: "📸", h: L3("Mergi la cel mai apropiat teren", "Walk to your nearest court", "Menj el a legközelebbi pályához"), p: L3("Fă o poză și trimite-o ca sesizare. O poză bate o mie de păreri.", "Take a photo and send it as a report. One photo beats a thousand opinions.", "Fotózd le, és küldd be bejelentésként. Egy fotó ezer véleményt ér."), btn: L3("Trimit poza", "Send the photo", "Fotó küldése"), run: () => setReport(true) },
      { id: "game", ic: "⚽", h: L3("Propune un meci în cartier", "Propose a game in your area", "Javasolj egy meccset a környéken"), p: L3("Un teren folosit e un teren pe care nu-l mai poate ignora nimeni.", "A court in use is a court nobody can ignore.", "Egy használt pályát senki sem hagyhat figyelmen kívül."), btn: L3("La comunitate", "To the community", "A közösséghez"), run: go("community") },
      { id: "cityhall", ic: "🏛️", h: L3("Află cum depui o cerere la Primărie", "Learn how to file a request at City Hall", "Tudd meg, hogyan nyújts be kérvényt"), p: L3("Pașii, adresa și un șablon gata făcut, mai jos pe pagină.", "The steps, the address and a ready template, further down this page.", "A lépések, a cím és egy kész sablon lejjebb az oldalon."), btn: L3("Arată-mi", "Show me", "Mutasd"), run: () => scrollTo("help-cityhall") }
    ],
    "1d": [
      { id: "volunteer", ic: "🙋", h: L3("Înscrie-te voluntar", "Sign up as a volunteer", "Jelentkezz önkéntesnek"), p: L3("Te sunăm sau îți scriem când avem nevoie de mâini.", "We'll call or write when we need hands.", "Hívunk vagy írunk, ha kéz kell."), btn: L3("Mă înscriu", "Sign me up", "Jelentkezem"), run: () => scrollTo("help-volunteer") },
      { id: "cleanup", ic: "🧹", h: L3("Organizează o zi de curățenie", "Organise a clean-up day", "Szervezz takarítónapot"), p: L3("Saci, mănuși, prieteni, o sâmbătă. Noi ajutăm cu anunțul.", "Bags, gloves, friends, a Saturday. We help with the announcement.", "Zsákok, kesztyűk, barátok, egy szombat. A hirdetésben segítünk."), btn: L3("Scrie-ne", "Write to us", "Írj nekünk"), run: () => mail("Zi de curățenie — From Grey to Play") },
      { id: "canvas", ic: "🎨", h: L3("Ajută la Street Canvas", "Help with Street Canvas", "Segíts a Street Canvasban"), p: L3("Desenezi, vopsești sau aduci vopsea pentru muralul de pe teren.", "Draw, paint or bring paint for the court mural.", "Rajzolj, fess vagy hozz festéket a pálya falfestményéhez."), btn: L3("Scrie-ne", "Write to us", "Írj nekünk"), run: () => mail("Street Canvas — From Grey to Play") },
      { id: "map", ic: "🗺️", h: L3("Cartografiază cartierul tău", "Map your neighbourhood", "Térképezd fel a környéked"), p: L3("Treci pe la toate terenurile din zonă și verifică-le pe rând.", "Visit every court in your area and check them one by one.", "Járd végig a környék pályáit, és ellenőrizd őket sorban."), btn: L3("La hartă", "To the map", "A térképhez"), run: go("courts") }
    ]
  };
  const isDone = a => !!(done[a.id] || a.auto);
  const doAction = a => {
    if (helpMark(a.id)) {
      const f = helpDone(); setDone(f);
      g2pSfx("click");
      const tk = Object.keys(ACTIONS).find(k => ACTIONS[k].some(x => x.id === a.id));
      if (tk && ACTIONS[tk].every(x => f[x.id] || x.auto) && helpMark("tier_" + tk)) {
        setDone(helpDone()); g2pSfx("chime");
        toast(HELP_TIERS.find(x => x.k === tk).badge + " " + L3("Insignă nouă: ", "New badge: ", "Új jelvény: ") + tierName(tk).badge, 4200);
      }
    }
    a.run();
  };
  const tierName = k => ({
    "5m": { q: L3("Am 5 minute", "I have 5 minutes", "Van 5 percem"), s: L3("din autobuz, din pauză", "on the bus, at break", "a buszon, szünetben"), badge: L3("Erou de 5 minute", "5-minute hero", "5 perces hős") },
    "1h": { q: L3("Am o oră", "I have an hour", "Van egy órám"), s: L3("după școală", "after school", "suli után"), badge: L3("Ora de aur", "Golden hour", "Aranyóra") },
    "1d": { q: L3("Am o zi", "I have a day", "Van egy napom"), s: L3("un weekend cu prietenii", "a weekend with friends", "egy hétvége a barátokkal"), badge: L3("Ziua cartierului", "Neighbourhood day", "A környék napja") }
  })[k];
  const pick = k => {
    setTier(k); setSweep(s => s + 1);
    g2pSfx("swish");
    setTimeout(() => { const el = listRef.current; if (el) el.scrollIntoView({ behavior: fxReduced() ? "auto" : "smooth", block: "start" }); }, fxReduced() ? 0 : 380);
  };
  const subVol = () => {
    if (!vf.name || vf.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(vf.email)) { toast(t.error); return; }
    const volDate = new Date().toISOString();
    const volRef = db.ref("signups").push();
    volRef.set({ name: vf.name.trim().slice(0, 100), email: vf.email.trim().slice(0, 120), phone: vf.phone.slice(0, 30), when: vf.when || "", volunteer: true, city: ACTIVE_CITY, date: volDate, choice: "both" })
      .then(() => {
        db.ref("signupStats/" + volRef.key).set({ volunteer: true, city: ACTIVE_CITY, date: volDate });
        const k = vf.name.replace(/[.#$/\[\]]/g, "_");
        db.ref("leaderboard/" + k).transaction(v => ({ ...(v || {}), points: (v?.points || 0) + 50, name: vf.name }));
        logActivity("join", anonName(vf.name), null);
        helpMark("volunteer"); setDone(helpDone());
        setVolSent(true); g2pSfx("chime"); toast(t.success + " +50 pts");
      }, () => toast(t.error));
  };
  const totalActs = Object.keys(ACTIONS).reduce((n, k) => n + ACTIONS[k].length, 0);
  const totalDone = Object.keys(ACTIONS).reduce((n, k) => n + ACTIONS[k].filter(isDone).length, 0);
  const list = tier ? ACTIONS[tier] : null;
  return React.createElement("div", { className: "animate-in help" },
    React.createElement("section", { className: "section help-hero" },
      React.createElement("div", { className: "container" },
        React.createElement("h1", { className: "help-h1" }, t.howToHelp),
        React.createElement("p", { className: "help-lead" },
          L3("Doar 28% dintre adolescenții din România fac destulă mișcare", "Only 28% of Romanian teenagers get enough exercise", "A romániai tinédzsereknek csak 28%-a mozog eleget"),
          React.createElement(SrcRef, { id: "mediafax-28" }),
          L3(". Un teren bun în cartier schimbă asta. Cât timp ai?", ". A good court nearby changes that. How much time do you have?", ". Egy jó pálya a közelben ezen változtat. Mennyi időd van?")),
        React.createElement("div", { className: "help-choose", role: "group", "aria-label": L3("Cât timp ai?", "How much time?", "Mennyi időd van?") },
          HELP_TIERS.map((x, i) => {
            const n = ACTIONS[x.k].filter(isDone).length, all = ACTIONS[x.k].length, got = !!done["tier_" + x.k];
            return React.createElement("button", { key: x.k, type: "button", className: "help-opt" + (tier === x.k ? " on" : "") + (tier && tier !== x.k ? " off" : ""), "aria-pressed": tier === x.k, onClick: () => pick(x.k), style: { "--i": i } },
              React.createElement("span", { className: "help-opt-ic", "aria-hidden": "true" }, x.ic),
              React.createElement("strong", null, tierName(x.k).q),
              React.createElement("span", { className: "help-opt-s" }, tierName(x.k).s),
              React.createElement("span", { className: "help-opt-bar", "aria-hidden": "true" }, React.createElement("i", { style: { width: (n / all * 100) + "%" } })),
              React.createElement("span", { className: "help-opt-n" }, got ? x.badge + " " + tierName(x.k).badge : n + " / " + all));
          })),
        totalDone > 0 && React.createElement("p", { className: "help-total" }, L3("Ai făcut ", "You've done ", "Megcsináltál ") + totalDone + L3(" din ", " of ", " / ") + totalActs + L3(" lucruri. Mulțumim.", " things. Thank you.", " dolgot. Köszönjük.")))),
    React.createElement("div", { ref: listRef, className: "help-list-anchor" }),
    tier && React.createElement("section", { className: "section help-acts-sec", key: "s" + sweep },
      sweep > 0 && funFx() && React.createElement("div", { className: "help-sweep", "aria-hidden": "true" }, React.createElement("span", null, HELP_TIERS.find(x => x.k === tier).ic)),
      React.createElement("div", { className: "container" },
        React.createElement("h2", { className: "section-title" }, HELP_TIERS.find(x => x.k === tier).ic + " " + tierName(tier).q),
        React.createElement("div", { className: "help-acts" }, list.map((a, i) => React.createElement("div", { key: a.id, className: "help-act" + (isDone(a) ? " done" : ""), style: { "--i": i } },
          React.createElement("span", { className: "help-act-ic", "aria-hidden": "true" }, isDone(a) ? "✓" : a.ic),
          React.createElement("div", { className: "help-act-b" }, React.createElement("strong", null, a.h), React.createElement("p", null, a.p)),
          React.createElement("button", { className: "btn btn-sm " + (isDone(a) ? "" : "btn-green"), onClick: () => doAction(a) }, isDone(a) ? L3("Încă o dată", "Again", "Újra") : a.btn)))))),
    React.createElement("section", { className: "section", id: "help-volunteer" },
      React.createElement("div", { className: "container" },
        React.createElement(Reveal, { className: "card help-vol" },
          React.createElement("h2", { className: "section-title", style: { marginTop: 0 } }, t.volunteerSignup),
          volSent ? React.createElement("p", { className: "partner-sent" }, "✓ " + L3("Ești pe listă. Îți scriem când facem prima acțiune în zona ta.", "You're on the list. We'll write when there's an action near you.", "Rajta vagy a listán. Írunk, ha lesz akció a környékeden."))
            : React.createElement("div", { className: "partner-form" },
              React.createElement("input", { placeholder: L3("Numele tău", "Your name", "A neved"), value: vf.name, onChange: e => setVf({ ...vf, name: e.target.value }) }),
              React.createElement("input", { placeholder: t.email, type: "email", value: vf.email, onChange: e => setVf({ ...vf, email: e.target.value }) }),
              React.createElement("input", { placeholder: t.phone + " (" + L3("opțional", "optional", "opcionális") + ")", value: vf.phone, onChange: e => setVf({ ...vf, phone: e.target.value }) }),
              React.createElement("div", { className: "src-filter", role: "group" }, HELP_TIERS.map(x => React.createElement("button", { key: x.k, type: "button", className: "g2chip" + (vf.when === x.k ? " g2chip-on" : ""), "aria-pressed": vf.when === x.k, onClick: () => setVf({ ...vf, when: x.k }) }, x.ic + " " + tierName(x.k).q))),
              React.createElement("button", { className: "btn btn-green btn-block", onClick: subVol }, t.submit)),
          React.createElement("p", { className: "text-sm mt-1", style: { color: "var(--textSec)" } }, L3("Preferi email? Scrie-ne la ", "Prefer email? Write to ", "Inkább e-mail? Írj ide: "), React.createElement("a", { href: "mailto:" + G2P_EMAIL + "?subject=" + encodeURIComponent("Voluntar — From Grey to Play") }, G2P_EMAIL))))),
    React.createElement("section", { className: "section", id: "help-cityhall" },
      React.createElement("div", { className: "container" },
        React.createElement(Reveal, null, React.createElement(CityHallGuide, null)),
        React.createElement(Reveal, { className: "card mb-2" },
          React.createElement("h3", { className: "mb-1" }, (lang === "ro" ? "Primăria " + cityName(lang) : cityName(lang) + " City Hall")),
          React.createElement("p", { className: "text-sm" }, "📍 " + CITY_HALL.address),
          React.createElement("p", { className: "text-sm" }, "📞 " + CITY_HALL.telLabel),
          React.createElement("p", { className: "text-sm" }, "📧 " + CITY_HALL.mail),
          React.createElement("p", { className: "text-sm" }, "🌐 " + (ACTIVE_CITY === "tgm" ? "www.tirgumures.ro" : "www.sibiu.ro")),
          React.createElement("button", { className: "btn btn-green mt-1", onClick: () => {
            const c = `CĂTRE: ${CITY_HALL.registry}\n${CITY_HALL.address}\n\nSubsemnatul/a _____________, domiciliat/ă în _____________,\n\nsolicit:\n1. Informare privind stadiul renovării terenurilor sportive din cartierele periferice\n2. Alocarea de fonduri pentru programul pilot Flip-the-Court\n3. Accesarea fondurilor Erasmus+ Sport KA2\n\nCu stimă,\n_____________\nData: ${new Date().toLocaleDateString("ro-RO")}`;
            const b = new Blob([c], { type: "text/plain" });
            const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "cerere_g2p.txt"; a.click();
          } }, "📥 ", t.downloadPDF)))),
    report && React.createElement(QuickReportModal, { courtId: "", onClose: () => setReport(false) }));
}
