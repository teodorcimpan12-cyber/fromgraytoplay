import { App } from "./App.js";
import { CourtConditionQuick } from "../components/CourtConditionQuick.js";
import { CITY_CFG, SAT_DESC, SAT_SCORE, SITE } from "../data/constants.js";
import { COURTS_BASE } from "../data/courts-base.js";
import { COURTS_SIBIU } from "../data/courts-sibiu.js";
import { DEMO_STEPS } from "../data/demo-steps.js";
import { SAT_VIEW } from "../data/sat-view.js";
import { STADIUMS_SIBIU } from "../data/stadiums-sibiu.js";
import { TIMELINE_SIBIU } from "../data/timeline-sibiu.js";
import { T } from "../i18n/strings.js";
import { applyCourtPos } from "../lib/apply-court-pos.js";
import { cityName } from "../lib/city-name.js";
import { createContext, useContext, useEffect, useState } from "../lib/react.js";
import { saveUserProfile } from "../lib/save-user-profile.js";
window.__G2P_PARSED = 1; /* === Firebase === */
firebase.initializeApp({
  apiKey: "AIzaSyB0kq79ID_H6plE7KhO7zQZa_S4Mg1g_Mo",
  authDomain: "fromgreytoplay.firebaseapp.com",
  databaseURL: "https://fromgreytoplay-default-rtdb.firebaseio.com",
  projectId: "fromgreytoplay",
  storageBucket: "fromgreytoplay.firebasestorage.app",
  messagingSenderId: "186763946354",
  appId: "1:186763946354:web:067794ec899a4d5a9b95eb",
  measurementId: "G-Y6X5LSD42R"
});
window.addEventListener("load", () => { try { firebase.analytics && firebase.analytics(); } catch (e) {} });
export const db = firebase.database();
// Keep every account (owner included) signed in across refreshes/tabs.
// Explicit LOCAL persistence; falls back to session storage in private mode.
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(() => firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(() => {}));
// Google sign-in falls back to a full-page redirect when popups are blocked
// (mobile Safari, in-app browsers) — finish that flow here.
firebase.auth().getRedirectResult().then(r => {
  if (r && r.user) saveUserProfile(r.user);
}).catch(() => {});
// Leaflet 1.9 schedules zoom-end work in timers that map.remove() does not cancel; when a page
// unmounts its map mid-zoom those callbacks read a deleted pane and throw "_leaflet_pos".
if (window.L && L.Map && !L.Map.prototype.__g2pSafe) {
  L.Map.prototype.__g2pSafe = true;
  const panePos = L.Map.prototype._getMapPanePos;
  L.Map.prototype._getMapPanePos = function () { return this._mapPane ? panePos.call(this) : new L.Point(0, 0); };
  const zoomEnd = L.Map.prototype._onZoomTransitionEnd;
  L.Map.prototype._onZoomTransitionEnd = function () { if (this._mapPane) return zoomEnd.apply(this, arguments); };
}
// Load admin string overrides from Firebase on startup
db.ref("settings/strings").once("value").then(snap => {
  const ov = snap.val();
  if (!ov) return;
  ["ro","en","hu"].forEach(lng => { if (ov[lng]) Object.assign(T[lng], ov[lng]); });
});
export const AppCtx = createContext();
export const useApp = () => useContext(AppCtx);

/* Tiny synthesized sports sounds (no files). Only ever called from a user action, so the
   AudioContext starts after the visitor's first interaction. g2p_sound=0 mutes them. */
export let _sfxCtx = null;
export function g2pSfx(name) {
  try {
    if (localStorage.getItem("g2p_sound") === "0") return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_sfxCtx) _sfxCtx = new AC();
    const ac = _sfxCtx;
    if (ac.state === "suspended") ac.resume();
    const t0 = ac.currentTime + .01;
    const out = ac.createGain(); out.gain.value = .22; out.connect(ac.destination);
    const noise = (dur, type, freq, q, vol, at) => {
      const n = Math.max(1, Math.floor(ac.sampleRate * dur)), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource(); src.buffer = buf;
      const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
      const g = ac.createGain(); const s = t0 + (at || 0);
      g.gain.setValueAtTime(vol, s); g.gain.exponentialRampToValueAtTime(.001, s + dur);
      src.connect(f); f.connect(g); g.connect(out); src.start(s); src.stop(s + dur + .02);
    };
    const tone = (type, f1, f2, dur, vol, at) => {
      const o = ac.createOscillator(), g = ac.createGain(), s = t0 + (at || 0);
      o.type = type; o.frequency.setValueAtTime(f1, s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + dur);
      g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(vol, s + .012); g.gain.exponentialRampToValueAtTime(.001, s + dur);
      o.connect(g); g.connect(out); o.start(s); o.stop(s + dur + .02);
      return o;
    };
    if (name === "clack") { noise(.05, "bandpass", 1900, 2, .9); tone("sine", 110, 55, .14, .5); }
    else if (name === "powerdown") { tone("sawtooth", 180, 40, .32, .18); }
    else if (name === "flip") { noise(.018, "highpass", 2500, 1, .5); }
    else if (name === "click") { noise(.012, "bandpass", 3200, 3, .7); }
    else if (name === "bounce") { tone("sine", 150, 55, .16, .8); noise(.03, "lowpass", 600, 1, .3); }
    else if (name === "swish") { noise(.28, "bandpass", 5200, .7, .35); }
    else if (name === "spray") { noise(.55, "highpass", 4200, .5, .32); noise(.3, "highpass", 5000, .5, .22, .45); }
    else if (name === "squeak") { tone("triangle", 1300, 2300, .09, .25); tone("triangle", 1900, 1400, .08, .2, .1); }
    else if (name === "chime") { tone("sine", 660, 0, .7, .3); tone("sine", 990, 0, .7, .2, .09); }
    else if (name === "birds") { tone("sine", 3000, 4600, .07, .12); tone("sine", 3200, 4900, .07, .1, .12); tone("sine", 2900, 4300, .06, .09, .5); }
    else if (name === "pfff") { noise(.9, "bandpass", 1300, .8, .55); tone("sine", 380, 90, .8, .07); }
    else if (name === "crack") { noise(.08, "highpass", 1800, 1, .9); noise(.3, "lowpass", 280, 1, .7, .02); }
    else if (name === "pop") { tone("sine", 900, 260, .09, .45); noise(.02, "highpass", 3000, 1, .4); }
    else if (name === "fire") { noise(.9, "lowpass", 900, .7, .55); noise(.5, "bandpass", 2600, 2, .16, .25); }
    else if (name === "whistle") {
      [2850, 3050].forEach(f => {
        const o = tone("square", f, 0, .5, .07);
        const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 32; lg.gain.value = 70;
        lfo.connect(lg); lg.connect(o.frequency); lfo.start(t0); lfo.stop(t0 + .52);
      });
    }
  } catch (e) {}
}

/* === QR Code Generator for Courts === */
export var _qrP = null;
export function loadQRious() {
  if (typeof QRious !== "undefined") return Promise.resolve();
  if (_qrP) return _qrP;
  _qrP = new Promise(function(resolve, reject) {
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js";
    s.onload = function() { resolve(); };
    s.onerror = function() { reject(new Error("qrious")); };
    document.head.appendChild(s);
  });
  return _qrP;
}

/* === Council Countdown === */
export var COUNCIL_DATES = [
  new Date("2026-07-15T10:00:00"),
  new Date("2026-09-16T10:00:00"),
  new Date("2026-11-18T10:00:00"),
  new Date("2027-01-20T10:00:00"),
];

/* Team's blind satellite audit (tools/sat_merge.mjs → data/sat_findings.json): what the images showed, never today's state. */
export var satFindCache = null;
export function SatFinding({ court: c }) {
  const { lang } = useApp();
  const [d, setD] = useState(null);
  const [verify, setVerify] = useState(false);
  useEffect(() => {
    if (!/^sb\d/.test(c.id)) return;
    if (!satFindCache) satFindCache = fetch("/data/sat_findings.json").then(r => r.ok ? r.json() : null).catch(() => { satFindCache = null; return null; });
    let alive = true;
    satFindCache.then(j => { if (alive) setD(j); });
    return () => { alive = false; };
  }, [c.id]);
  // Rebuilt stadiums (sb8, sb21) have a dated press source; old satellite captures predate the rebuild.
  const f = !c.stadium && d && d.courts && d.courts[c.id];
  if (!f) return null;
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const loc = lang === "en" ? "en-GB" : lang === "hu" ? "hu-HU" : "ro-RO";
  const md = s => s ? new Date(s + "T12:00:00").toLocaleDateString(loc, { month: "short", year: "numeric" }) : "?";
  const last = md(f.latestCapture);
  const kinds = { built: L3("apare prima dată", "first appears", "először látható"), resurfaced: L3("refăcut", "resurfaced", "felújítva"), degraded: L3("degradat vizibil", "visibly degraded", "láthatóan leromlott"), construction: L3("șantier", "construction site", "építkezés"), removed: L3("dispare", "disappears", "eltűnik") };
  let text, tone = "var(--textSec)";
  const fd = f.finding;
  if (fd === "no-court-visible") { text = L3("Niciun teren vizibil în nicio imagine, până în " + last + ". Poate a fost construit după, sau e o eroare pe hartă.", "No court visible in any image up to " + last + ". It may have been built later, or the map is wrong.", "Egyik képen sem látszik pálya " + last + "-ig. Lehet, hogy később épült, vagy hibás a térkép."); tone = "var(--red)"; }
  else if (/^gone-after-/.test(fd)) { text = L3("Văzut ca teren până în " + md(fd.slice(11)) + "; nu mai apare în imaginea din " + last + ".", "Seen as a court until " + md(fd.slice(11)) + "; gone in the " + last + " image.", "Pályaként látható " + md(fd.slice(11)) + "-ig; a " + last + " képen már nincs."); tone = "var(--red)"; }
  else if (fd === "unchanged") text = L3("Neschimbat în toate imaginile, până în " + last + ".", "Unchanged in every image up to " + last + ".", "Minden képen változatlan " + last + "-ig.");
  else if (/-between-/.test(fd)) { const m = fd.match(/^(\w+)-between-(\d{4}-\d\d-\d\d)-(\d{4}-\d\d-\d\d)$/); text = m ? (kinds[m[1]] || m[1]) + " " + L3("între " + md(m[2]) + " și " + md(m[3]), "between " + md(m[2]) + " and " + md(m[3]), md(m[2]) + " és " + md(m[3]) + " között") + "." : null; tone = "var(--green)"; }
  else if (/-before-/.test(fd)) { const k = fd.split("-before-"); text = (kinds[k[0]] || k[0]) + (k[1] && k[1] !== "?" ? " " + L3("înainte de ", "before ", "előtt: ") + md(k[1]) : "") + "."; tone = "var(--green)"; }
  else if (c.sat) {
    const sv = { ok: L3("pare întreg", "looks intact", "épnek látszik"), worn: L3("pare uzat", "looks worn", "kopottnak látszik"), gone: L3("nu se vede teren", "no court visible", "nem látszik pálya") }[c.sat.v];
    text = L3("În imaginea din " + md(c.sat.at) + " " + sv + " — părerea a " + c.sat.n + " din " + c.sat.of + " evaluatori; ceilalți au văzut altceva.", "In the " + md(c.sat.at) + " image it " + sv + " — " + c.sat.n + " of " + c.sat.of + " reviewers; the others saw something else.", "A " + md(c.sat.at) + " képen " + sv + " — " + c.sat.of + " értékelőből " + c.sat.n + "; a többiek mást láttak.");
    tone = c.sat.v === "ok" ? "#0EA5E9" : c.sat.v === "worn" ? "#F59E0B" : "var(--red)";
  }
  else text = L3("Evaluatorii nu au căzut încă de acord pe imaginile acestui teren.", "The reviewers don't agree yet on this court's images.", "Az értékelők még nem értenek egyet ennél a pályánál.");
  if (!text) return null;
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return React.createElement("div", { className: "card sat-find", style: { borderLeft: "4px solid " + tone } },
    React.createElement("div", { className: "sat-find-h" }, "🛰️ ", L3("Ce a văzut satelitul", "What the satellite saw", "Amit a műhold látott")),
    React.createElement("p", { className: "sat-find-t" }, text),
    React.createElement("p", { className: "sat-find-s" },
      L3("Evaluat orb, separat, de " + f.n + " membri ai echipei · imagini Esri World Imagery Wayback · satelitul nu arată starea de azi. ", "Reviewed blind and separately by " + f.n + " team members · Esri World Imagery Wayback · the satellite does not show today's state. ", "Vakon, külön értékelte " + f.n + " csapattag · Esri World Imagery Wayback · a műhold nem a mai állapotot mutatja. "),
      React.createElement("button", { className: "sat-find-a", onClick: () => setVerify(true) }, L3("Știi cum arată azi? Verifică-l →", "Know how it looks today? Check it →", "Tudod, milyen ma? Ellenőrizd →"))),
    verify && ReactDOM.createPortal(React.createElement("div", { onClick: ev => ev.stopPropagation() }, React.createElement(CourtConditionQuick, { courtId: c.id, onClose: () => setVerify(false) })), document.body));
}

/* === Multi-city === */
export const COURTS_TGM = COURTS_BASE.map(c => ({ ...c, city: "tgm" }));
export const ACTIVE_CITY = [new URLSearchParams(location.search).get("c"), localStorage.getItem("g2p_city")].find(c => c && CITY_CFG[c]) || "tgm";
export const CITY_HALL = {
  tgm: { ro: "Consiliul Local și Primăria Municipiului Târgu Mureș", en: "Târgu Mureș City Council and City Hall", hu: "Marosvásárhely Helyi Tanácsa és Polgármesteri Hivatala",
    registry: "Registratura Primăriei Municipiului Târgu Mureș", address: "Piața Victoriei nr. 3, 540026 Târgu Mureș", tel: "0265268330", telLabel: "0265-268.330", mail: "primaria@tirgumures.ro" },
  sibiu: { ro: "Consiliul Local și Primăria Municipiului Sibiu", en: "Sibiu City Council and City Hall", hu: "Nagyszeben Helyi Tanácsa és Polgármesteri Hivatala", // TODO: HU review
    registry: "Registratura Primăriei Municipiului Sibiu", address: "Str. Samuel Brukenthal nr. 2, 550178 Sibiu", tel: "0269208800", telLabel: "0269-208.800", mail: "pms@sibiu.ro",
    source: "https://www.sibiu.ro/ro/contact", retrieved: "2026-10-24" }
}[ACTIVE_CITY];
if (ACTIVE_CITY !== "tgm") {
  ["ro", "en", "hu"].forEach(l => {
    T[l].dossierForCouncil = (l === "ro" ? "Pentru " : l === "en" ? "For the " : "") + CITY_HALL[l] + (l === "hu" ? " részére" : "");
    T[l].heroKicker = cityName(l) + (l === "ro" ? " · terenuri sportive publice" : l === "en" ? " · public sports courts" : " · közpályák");
  });
} // TODO: HU review
COURTS_SIBIU.forEach(c => {
  const st = STADIUMS_SIBIU[c.id];
  if (st) {
    Object.assign(c, { name: st.name, address: st.address, lat: st.lat, lng: st.lng, category: st.category, status: "excellent", condition: 5, occupancy: "active", progress: 100,
      accessibility: { wheelchair: true, lighting: true, parking: true, flatSurface: true }, description: st.desc.ro, desc: st.desc, src: st.src, stadium: true });
    return;
  }
  const v = SAT_VIEW[c.id];
  if (!v || c.status !== "unverified") return;
  c.status = "satellite"; c.sat = v; c.estimate = "sat";
  c.condition = SAT_SCORE[v.v] || 1;
  c.occupancy = v.v === "ok" ? "active" : "empty";
  c.progress = v.v === "ok" ? 80 : v.v === "worn" ? 15 : 5;
  const fix = s => SAT_DESC.reduce((a, r) => a.replace(r[0], r[1]), String(s || ""));
  c.description = fix(c.description);
  if (c.desc) c.desc = { ro: fix(c.desc.ro), en: fix(c.desc.en), hu: fix(c.desc.hu) };
});
export const COURTS_ALL = [...COURTS_TGM, ...COURTS_SIBIU];
export const COURTS = COURTS_ALL.filter(c => c.city === ACTIVE_CITY);
/* Court counts for prose: never hard-code them. Stadiums are counted with the courts and named separately. */
export const STADIUM_N = COURTS.filter(c => c.stadium).length;
export const NBH_N = COURTS.length - STADIUM_N;
export const SAT_N = COURTS.filter(c => SAT_VIEW[c.id]).length;
export const SAT_RECENT = COURTS.filter(c => SAT_VIEW[c.id] && /^202[12]/.test(SAT_VIEW[c.id].at)).length;
// Romanian puts "de" between a number and its noun from 20 up ("29 de terenuri", "2 stadioane").
export const roDe = n => (n % 100 >= 20 || (n >= 100 && n % 100 === 0)) ? n + " de " : n + " ";
try { applyCourtPos(JSON.parse(localStorage.getItem("g2p_courtpos") || "null")); } catch (e) {}
db.ref("settings/courtPos").once("value").then(s => {
  const next = JSON.stringify(s.val() || {});
  let prev = null;
  try { prev = localStorage.getItem("g2p_courtpos"); localStorage.setItem("g2p_courtpos", next); } catch (e) {}
  if (prev !== next) applyCourtPos(s.val() || {});
}).catch(() => {});
export var SOCCER_CELLS = null;
export function soccerCells() {
  if (SOCCER_CELLS) return SOCCER_CELLS;
  var p = (1 + Math.sqrt(5)) / 2, v = [], f = [];
  [[0, 1, p], [0, -1, p], [0, 1, -p], [0, -1, -p]].forEach(function (a) { v.push(a, [a[1], a[2], a[0]], [a[2], a[0], a[1]]); });
  function d2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]); }
  for (var i = 0; i < 12; i++) for (var j = i + 1; j < 12; j++) for (var k = j + 1; k < 12; k++)
    if (Math.abs(d2(v[i], v[j]) - 4) < 1e-6 && Math.abs(d2(v[j], v[k]) - 4) < 1e-6 && Math.abs(d2(v[i], v[k]) - 4) < 1e-6) f.push([v[i][0] + v[j][0] + v[k][0], v[i][1] + v[j][1] + v[k][1], v[i][2] + v[j][2] + v[k][2]]);
  function n(a) { var l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }
  // pentagon cells (icosahedron vertices) reach 16.5° from their centre, hexagons 20.9°: bias pentagons by 4.38°
  SOCCER_CELLS = v.map(function (a) { return { c: n(a), pent: true }; }).concat(f.map(function (a) { return { c: n(a), pent: false }; }));
  return SOCCER_CELLS;
}
export var _g2pThreeP = null;
export function loadThree() {
  if (typeof THREE !== "undefined") return Promise.resolve();
  if (_g2pThreeP) return _g2pThreeP;
  var cdns = ["https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "https://unpkg.com/three@0.128.0/build/three.min.js", "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"];
  _g2pThreeP = new Promise(function (resolve, reject) {
    var i = 0;
    function tryOne() {
      if (typeof THREE !== "undefined") { resolve(); return; }
      if (i >= cdns.length) { reject(new Error("three")); return; }
      var s = document.createElement("script"); s.src = cdns[i++];
      s.onload = function () { typeof THREE !== "undefined" ? resolve() : tryOne(); };
      s.onerror = tryOne;
      document.head.appendChild(s);
    }
    tryOne();
  });
  return _g2pThreeP;
}
export const LETTER_AREAS = ACTIVE_CITY !== "tgm"
  ? Object.entries(CITY_CFG[ACTIVE_CITY].hoods || {}).map(([k, v]) => ({ k, ro: v, en: v, hu: v }))
  : [
  { k: "tudor",      ro: "Tudor",       en: "Tudor",       hu: "Tudor" },
  { k: "auchan",     ro: "Zona Auchan", en: "Auchan Area", hu: "Auchan körzet" },
  { k: "mureseni",   ro: "Mureșeni",    en: "Mureșeni",    hu: "Mureșeni" },
  { k: "center",     ro: "Centru",      en: "Center",      hu: "Központ" },
  { k: "pandurilor", ro: "Pandurilor",  en: "Pandurilor",  hu: "Pandurilor" },
  { k: "libertate",  ro: "Libertate",   en: "Libertate",   hu: "Libertate" },
  { k: "unirii",     ro: "Unirii",      en: "Unirii",      hu: "Unirii" }
];
export const SOURCES = [
  { id: "survey", city: "tgm", kind: "survey", pub: "From Grey to Play", d: null, url: null, essay: true, at: ["about", "press"],
    t: { ro: "Sondaj informal: 15 rezidenți din Tudor, zona Auchan și Sportcomplex", en: "Informal poll: 15 residents of Tudor, the Auchan area and Sportcomplex", hu: "Informális felmérés: 15 lakos Tudorból, az Auchan környékéről és a Sportcomplexből" }, // TODO: HU review
    p: { ro: "12 din 15 nu folosesc terenul cel mai apropiat: e prea degradat. Metoda e descrisă în lucrare.", en: "12 of 15 don't use their nearest court: too run-down. The method is described in the essay.", hu: "15-ből 12 nem használja a legközelebbi pályát: túl rossz állapotú. A módszer a dolgozatban olvasható." } }, // TODO: HU review
  { id: "punctul-5m", city: "tgm", kind: "news", pub: "Punctul.ro", d: "Oct 2025", url: "https://punctul.ro/eroare-tehnica-de-5-milioane-de-lei-baza-sportiva-din-str-insulei-identificata-gresit-in-acte/", at: ["home", "about", "press"],
    t: { ro: "Eroare tehnică de 5 milioane de lei: baza sportivă din str. Insulei, identificată greșit în acte", en: "A 5-million-lei technical error: the Insulei St. sports base, misidentified in the paperwork", hu: "5 millió lejes technikai hiba: az Insulei utcai sportbázist rosszul azonosították az iratokban" }, // TODO: HU review
    p: { ro: "5 milioane de lei pentru renovare, blocați de o greșeală în acte.", en: "5 million lei for renovation, frozen by a paperwork mistake.", hu: "5 millió lej felújításra, egy irathiba miatt befagyasztva." } }, // TODO: HU review
  { id: "sidu", city: "tgm", kind: "gov", pub: "Primăria Târgu Mureș", d: "SIDU 2021–2030", url: "https://www.tirgumures.ro/strategie/SIDU_Targu_Mures.pdf", at: ["home", "about", "press"],
    t: { ro: "Strategia Integrată de Dezvoltare Urbană (SIDU) Târgu Mureș", en: "Târgu Mureș Integrated Urban Development Strategy (SIDU)", hu: "Marosvásárhely Integrált Városfejlesztési Stratégiája (SIDU)" },
    p: { ro: "Cartierele periferice, cu cei mai mulți tineri, primesc cele mai puține investiții în infrastructură.", en: "Peripheral districts, with the youngest populations, get the least infrastructure investment.", hu: "A legfiatalabb lakosságú peremkerületek kapják a legkevesebb infrastrukturális beruházást." } }, // TODO: HU review
  { id: "mymaps", city: "tgm", kind: "map", pub: "Google My Maps", d: "2025–2026", url: "https://www.google.com/maps/d/viewer?mid=19tND_bqOJoFbhTNKN0PenNW7S7yUog8", at: ["about"],
    t: { ro: "Harta terenurilor documentate de echipă", en: "The team's map of documented courts", hu: "A csapat által dokumentált pályák térképe" },
    p: { ro: "Poziții, poze și distanțe între terenurile din centru și cele din cartiere.", en: "Positions, photos and distances between central and neighbourhood courts.", hu: "Helyek, fotók és távolságok a központi és a lakótelepi pályák között." } }, // TODO: HU review
  { id: "punctul-hubs", city: "tgm", kind: "news", pub: "Punctul.ro", d: "Mar 2026", url: "https://punctul.ro/din-centrale-in-restaurante-hub-uri-digitale-si-cartiere-3-exemple-care-sa-inspire-targu-muresul/", at: ["about"],
    t: { ro: "Din centrale în restaurante, hub-uri digitale și cartiere: 3 exemple care să inspire Târgu Mureșul", en: "From power plants to restaurants, digital hubs and neighbourhoods: 3 examples to inspire Târgu Mureș", hu: "Erőművekből éttermek, digitális központok és negyedek: 3 példa Marosvásárhelynek" }, // TODO: HU review
    p: { ro: "Alte orașe au transformat spații urbane neglijate. Contrastul cu Târgu Mureș.", en: "Other cities turned neglected urban sites around. The contrast with Târgu Mureș.", hu: "Más városok átalakították az elhanyagolt területeket. A kontraszt Marosvásárhellyel." } }, // TODO: HU review
  { id: "agerpres-rink", city: "tgm", kind: "news", pub: "Agerpres", d: "12 Mar 2021", isNew: true, url: "https://agerpres.ro/administratie/2021/03/12/mures-situatia-taberelor-de-tineret-si-infrastructura-sportiva-discutata-de-autoritatile-locale-cu-m--677272", at: ["press"],
    t: { ro: "Mureș: situația taberelor de tineret și infrastructura sportivă, discutate de autoritățile locale", en: "Mureș: youth camps and sports infrastructure discussed by local authorities", hu: "Maros: az ifjúsági táborok és a sportinfrastruktúra helyzete" }, // TODO: HU review
    p: { ro: "Patinoarul acoperit din Parcul Municipal: început cu 13 ani în urmă, abandonat în 2013 la ~70%, urma să fie terminat de Compania Națională de Investiții.", en: "The covered ice rink in the Municipal Park: started 13 years earlier, abandoned in 2013 at ~70%, to be finished by the National Investment Company.", hu: "A Városi park fedett jégpályája: 13 éve kezdték, 2013-ban ~70%-on abbahagyták; az Országos Beruházási Társaság fejezné be." } }, // TODO: HU review
  { id: "mdpi", city: "general", kind: "study", pub: "MDPI · Urban Science 8(4):203", d: "2024", url: "https://www.mdpi.com/2413-8851/8/4/203", at: ["about"],
    t: { ro: "Studiu despre distribuția infrastructurii recreative în orașele europene", en: "Study on how recreational infrastructure is distributed in European cities", hu: "Tanulmány a szabadidős infrastruktúra eloszlásáról az európai városokban" }, // TODO: HU review
    p: { ro: "Distribuția inegală a infrastructurii recreative tinde să adâncească decalajele sociale.", en: "Uneven distribution of recreational infrastructure tends to widen social gaps.", hu: "A szabadidős infrastruktúra egyenlőtlen eloszlása növeli a társadalmi különbségeket." } }, // TODO: HU review
  { id: "mediafax-28", city: "general", kind: "news", pub: "Mediafax", d: "31 Jan 2025", isNew: true, url: "https://www.mediafax.ro/?p=22673482", at: ["help", "press"],
    t: { ro: "Raport OMS despre activitatea fizică a adolescenților din România", en: "WHO report on the physical activity of Romanian adolescents", hu: "WHO-jelentés a romániai serdülők fizikai aktivitásáról" }, // TODO: HU review
    p: { ro: "Doar 28% dintre adolescenții români de 11–15 ani fac minimul de mișcare recomandat; 23% fac destulă activitate moderată sau intensă.", en: "Only 28% of Romanian adolescents aged 11–15 reach the minimum recommended activity; 23% get enough moderate or vigorous activity.", hu: "A 11–15 éves romániai serdülőknek csak 28%-a éri el a minimális ajánlott mozgást; 23%-uk mozog eleget mérsékelten vagy intenzíven." } }, // TODO: HU review
  { id: "who-81", city: "general", kind: "study", pub: "WHO · Guthold et al., Lancet Child & Adolescent Health", d: "2019", isNew: true, url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity", at: ["press"],
    t: { ro: "Organizația Mondială a Sănătății: fișa despre activitatea fizică", en: "World Health Organization: physical activity fact sheet", hu: "Egészségügyi Világszervezet: tájékoztató a fizikai aktivitásról" }, // TODO: HU review
    p: { ro: "81% dintre adolescenții de 11–17 ani din lume nu fac destulă mișcare.", en: "81% of adolescents aged 11–17 worldwide are not active enough.", hu: "A 11–17 éves serdülők 81%-a világszerte nem mozog eleget." } }, // TODO: HU review
  { id: "osm", city: "sibiu", kind: "data", pub: "OpenStreetMap (ODbL)", d: "live", url: "https://www.openstreetmap.org/copyright", at: ["home", "about", "press"],
    t: { ro: "Terenurile publice de cartier din Sibiu, din OpenStreetMap", en: "Sibiu's public neighbourhood courts, from OpenStreetMap", hu: "Szeben lakótelepi közpályái az OpenStreetMapből" }, // TODO: HU review
    p: { ro: roDe(NBH_N) + "terenuri publice de cartier pe hartă. Starea lor o verifică acum comunitatea.", en: NBH_N + " public neighbourhood courts on the map. The community is checking their condition now.", hu: NBH_N + " lakótelepi közpálya a térképen. Az állapotukat most a közösség ellenőrzi." } }, // TODO: HU review
  { id: "zsn-12m", city: "sibiu", kind: "news", pub: "Zile și Nopți", d: "24 Feb 2024", isNew: true, url: "https://zilesinopti.ro/2024/02/24/finantari-sportul-sibian-2024/", at: ["about", "press"],
    t: { ro: "Finanțări pentru sportul sibian în 2024", en: "Funding for Sibiu sport in 2024", hu: "A szebeni sport finanszírozása 2024-ben" }, // TODO: HU review
    p: { ro: "Primăria Sibiu: 12 milioane lei prin Agenda Sportivă 2024, plus 500.000 lei pentru cluburile de drept public.", en: "Sibiu City Hall: 12 million lei through the 2024 Sports Agenda, plus 500,000 lei for public-law clubs.", hu: "Szeben polgármesteri hivatala: 12 millió lej a 2024-es Sportprogramon át, plusz 500 000 lej a közjogi kluboknak." } } // TODO: HU review
].concat(TIMELINE_SIBIU.map((e, i) => {
  // Sibiu timeline events already carry a public source each; they become source cards too.
  const host = String(e.src || "").replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  const pre = e.lei ? e.lei + " · " : "";
  return { id: "sbt" + i, city: "sibiu", kind: /livingatlas/.test(host) ? "sat" : /(^|\.)sibiu\.ro$/.test(host) ? "gov" : "news", pub: host, d: String(e.y), url: e.src, at: ["about"],
    t: { ro: e.ro, en: e.en, hu: e.hu }, p: { ro: pre + e.ro, en: pre + e.en, hu: pre + (e.hu || e.ro) } };
})); // only inside the PDF, never in page text (owner's choice)
export const PRESS_URL = SITE + "/press";

/* A crash inside one page must never blank the whole site: nav, footer and other pages keep working. */
export class PageBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch(e, info) { console.error("[G2P page crash]", e, info && info.componentStack); }
  render() {
    if (!this.state.err) return this.props.children;
    const l = document.documentElement.lang;
    const L = (ro, en, hu) => l === "en" ? en : l === "hu" ? hu : ro;
    return React.createElement("section", { className: "section" },
      React.createElement("div", { className: "container", style: { maxWidth: 520, textAlign: "center" } },
        React.createElement("div", { className: "card", style: { padding: "2rem 1.2rem" } },
          React.createElement("div", { style: { fontSize: "2.4rem", marginBottom: ".5rem" } }, "🏀"),
          React.createElement("h2", { style: { fontSize: "1.1rem", marginBottom: ".5rem" } }, L("Mingea a ieșit din teren.", "The ball went out of bounds.", "A labda kiment a pályáról.")),
          React.createElement("p", { className: "text-sm mb-2", style: { color: "var(--textSec)" } }, L("Pagina asta a întâmpinat o eroare. Restul site-ului funcționează.", "This page hit an error. The rest of the site still works.", "Ez az oldal hibába ütközött. Az oldal többi része működik.")),
          React.createElement("div", { className: "flex gap-1", style: { justifyContent: "center", flexWrap: "wrap" } },
            React.createElement("button", { className: "btn btn-green", onClick: () => location.reload() }, "↻ ", L("Reîncarcă", "Reload", "Újratöltés")),
            React.createElement("button", { className: "btn btn-outline", onClick: () => { location.hash = "#home"; this.setState({ err: null }); } }, "🏠 ", L("Acasă", "Home", "Kezdőlap"))
          )
        )
      )
    );
  }
}

export class AdminBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return React.createElement("div", {
      style: { padding: "2rem", maxWidth: 600, margin: "4rem auto", fontFamily: "monospace" }
    },
      React.createElement("h2", { style: { color: "#F87171", marginBottom: "1rem" } }, "⚠️ Admin panel error"),
      React.createElement("pre", { style: { fontSize: ".75rem", color: "#9CA3AF", overflowX: "auto", whiteSpace: "pre-wrap" } }, String(this.state.err)),
      React.createElement("button", {
        style: { marginTop: "1rem", padding: ".4rem 1rem", background: "#10B981", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
        onClick: () => this.setState({ err: null })
      }, "↩ Retry")
    );
    return this.props.children;
  }
}
// Client-side anti-spam: at most 2 reports per 10 minutes per device (voter key).
export const RQ_MAX = 2, RQ_WIN = 10 * 60 * 1000;

/* === App === */
/* === Demo mode v2 (Astra Hack pitch, 5 min, 3 speakers). Secret link ?demo=5&c=sibiu (?demo=1 = same run).
   Next: → / Space / PageDown (clicker) or › on the bar. Back: ← / PageUp or ‹. 1–9 jump to a step. H hides the bar. Esc closes a Q&A card.
   Phone remote: ?demo=remote, signed in with the admin account; it writes demo/{step,at,qa} and every demo screen follows.
   Tab "Pitch" = steps, who speaks, what to say, free jump. Tab "Întrebări" = hard jury questions with short answers;
   "Arată pe ecran" puts a backup card on the projector (demo/qa), "Ascunde" removes it.
   Every number on the slides has a source in docs/ (INVESTITII_SIBIU.md, tools/SAT_AUDIT.md, CLAUDE.md 5 Nov). === */
export const DEMO_Q = new URLSearchParams(location.search).get("demo");
export const DEMO_ON = DEMO_Q === "1" || DEMO_Q === "5";
export const DEMO_REMOTE = DEMO_Q === "remote";
// the pitch always opens on the grey court, and the first-visit onboarding must not cover it
if (DEMO_ON) { try { localStorage.setItem("g2p_ob", "1"); localStorage.removeItem("g2p_hero_renov"); } catch (e) {} }
// the phone remote must open straight on the controls, never under the onboarding
if (DEMO_REMOTE) { try { localStorage.setItem("g2p_ob", "1"); } catch (e) {} }
export const demoClock = ms => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
export const DEMO_TOTAL = DEMO_STEPS.reduce((a, x) => a + x.sec, 0) * 1000;
export class DemoRemoteBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch(e, info) { console.error("[G2P remote crash]", e, info && info.componentStack); }
  render() {
    if (!this.state.err) return this.props.children;
    const e = React.createElement;
    return e("div", { className: "demo-remote" },
      e("h2", null, "Telecomanda a dat o eroare"),
      e("p", { className: "demo-rm-err" }, String(this.state.err && this.state.err.message || this.state.err)),
      e("p", null, "Fă o captură de ecran și trimite-o. Între timp: pe laptop folosește săgețile → ← sau cifrele 1–9."),
      e("button", { className: "btn btn-green", onClick: () => location.reload() }, "↻ Reîncarcă"));
  }
}
try {
  ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
} catch (e) {
  document.getElementById("root").innerHTML = '<div style="padding:2rem;text-align:center;color:#DC2626;font-family:sans-serif"><h2>Error</h2><p>' + e.message + '</p><p style="color:#6B7280;margin-top:1rem">Deploy pe Netlify pentru funcționalitate completă.</p></div>';
}
