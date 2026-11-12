import { ACTIVE_CITY, db, useApp } from "../../app/core.js";
import { AiPhotoHint } from "../../components/AiPhotoHint.js";
import { VERIFY_MISSING } from "../../data/constants.js";
import { compressImage } from "../../lib/compress-image.js";
import { aiStamp } from "../../lib/g2p-ai.js";
import { g2pCelebrate } from "../../lib/g2p-celebrate.js";
import { getVoterKey } from "../../lib/get-voter-key.js";
import { logActivity } from "../../lib/log-activity.js";
import { useEffect, useState } from "../../lib/react.js";
 // TODO: HU review
// A short, non-reversible tag of the device key: enough to count two answers from one phone once, nothing more.
export function devTag(vk) { let h = 2166136261; for (let i = 0; i < vk.length; i++) { h ^= vk.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
export function VerifyFlow({ court: c, onClose }) {
  const { lang, toast } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [exists, setExists] = useState("");
  const [playable, setPlayable] = useState("");
  const [missing, setMissing] = useState({});
  const [photos, setPhotos] = useState([]);
  const [ok, setOk] = useState(() => { try { return localStorage.getItem("g2p_ai_ok") === "1"; } catch (x) { return false; } });
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState(null);
  useEffect(() => {
    const onKey = ev => { if (ev.key === "Escape") { ev.preventDefault(); ev.stopImmediatePropagation(); onClose(); } };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
  const e = React.createElement;
  const opt = (val, cur, set, label) => e("button", { type: "button", className: "rcat-btn" + (cur === val ? " sel" : ""), onClick: () => set(val), style: { fontSize: ".86rem", padding: ".5rem .3rem" } }, label);
  const addPhoto = async ev => {
    const files = Array.from(ev.target.files || []).slice(0, 3 - photos.length);
    for (const f of files) { try { const d = await compressImage(f, 720, 0.62); setPhotos(p => p.concat(d).slice(0, 3)); } catch (x) {} }
    ev.target.value = "";
  };
  const done = exists && (exists !== "yes" || playable) && (!photos.length || ok) && !(ai && ai.isCourt === false);
  const submit = () => {
    if (!done || busy) return;
    setBusy(true);
    const m = {}; Object.keys(missing).forEach(k => { if (missing[k]) m[k] = true; });
    const rec = { courtId: c.id, city: c.city || ACTIVE_CITY, exists, playable: exists === "yes" ? playable : "na", at: new Date().toISOString(), dev: devTag(getVoterKey()) };
    if (Object.keys(m).length) rec.missing = m;
    if (photos.length) rec.photos = photos;
    if (ai && ai.diag) rec.ai = aiStamp(ai);
    db.ref("verifications").push(rec).then(() => {
      logActivity("verification", "", c.id);
      g2pCelebrate("verify"); toast(L3("Mulțumim! Răspunsul tău contează.", "Thank you! Your answer counts.", "Köszönjük! A válaszod számít."));
      onClose();
    }).catch(() => { setBusy(false); toast(L3("Nu s-a putut trimite. Mai încearcă.", "Could not send. Try again.", "Nem sikerült elküldeni.")); });
  };
  return e("div", { className: "modal-overlay", onClick: onClose },
    e("div", { className: "modal vf", onClick: ev => ev.stopPropagation(), role: "dialog", "aria-modal": "true", "aria-label": L3("Verifică terenul", "Check the court", "Pálya ellenőrzése") },
      e("div", { className: "flex justify-between items-center mb-1" },
        e("h2", { style: { fontSize: "1rem", margin: 0 } }, "🙋 ", L3("Verifică în 60 de secunde", "Check in 60 seconds", "Ellenőrzés 60 másodperc alatt")),
        e("button", { className: "btn btn-sm btn-outline", onClick: onClose }, L3("Închide", "Close", "Bezár"))),
      e("p", { className: "text-sm mb-1", style: { color: "var(--textSec)" } }, "📍 ", c.name),
      e("p", { className: "vf-q" }, "1. ", L3("Există terenul?", "Is the court there?", "Megvan a pálya?")),
      e("div", { className: "rcat-grid" }, opt("yes", exists, setExists, "✅ " + L3("Da", "Yes", "Igen")), opt("no", exists, setExists, "❌ " + L3("Nu mai e", "It's gone", "Már nincs")), opt("unsure", exists, setExists, "🤷 " + L3("Nu sunt sigur", "Not sure", "Nem tudom"))),
      exists === "yes" && e(React.Fragment, null,
        e("p", { className: "vf-q" }, "2. ", L3("Se poate juca pe el?", "Can you play on it?", "Lehet rajta játszani?")),
        e("div", { className: "rcat-grid" }, opt("yes", playable, setPlayable, "🏀 " + L3("Da", "Yes", "Igen")), opt("partly", playable, setPlayable, "⚠️ " + L3("Parțial", "Partly", "Részben")), opt("no", playable, setPlayable, "🚫 " + L3("Nu", "No", "Nem"))),
        e("p", { className: "vf-q" }, "3. ", L3("Ce lipsește? (oricâte)", "What is missing? (any)", "Mi hiányzik? (bármennyi)")),
        e("div", { className: "vf-chips" }, VERIFY_MISSING.map(m => e("button", { key: m[0], type: "button", className: "vf-chip" + (missing[m[0]] ? " on" : ""), onClick: () => setMissing(o => Object.assign({}, o, { [m[0]]: !o[m[0]] })) }, m[1], " ", lang === "en" ? m[3] : lang === "hu" ? m[4] : m[2])))),
      e("p", { className: "vf-q" }, "📷 ", L3("Poze (opțional, 1–3, fără oameni în ele)", "Photos (optional, 1–3, no people in them)", "Fotók (nem kötelező, 1–3, emberek nélkül)")),
      e("div", { className: "vf-photos" },
        photos.map((p, i) => e("div", { key: i, className: "vf-ph" }, e("img", { src: p, alt: "" }), e("button", { type: "button", onClick: () => { setPhotos(ps => ps.filter((_, j) => j !== i)); if (i === 0) setAi(null); }, "aria-label": L3("Scoate", "Remove", "Törlés") }, "✕"))),
        photos.length < 3 && e("label", { className: "vf-add" }, "＋", e("input", { type: "file", accept: "image/*", capture: "environment", multiple: true, style: { display: "none" }, onChange: addPhoto }))),
      photos.length > 0 && e("label", { className: "ai-consent" }, e("input", { type: "checkbox", checked: ok, onChange: ev => { setOk(ev.target.checked); try { if (ev.target.checked) localStorage.setItem("g2p_ai_ok", "1"); } catch (x) {} } }),
        e("span", null, L3("Pozele nu au oameni în ele. Le trimit fără datele de localizare din fișier; prima poate fi citită de AI (Anthropic) ca ajutor, nu ca verdict.", "The photos have no people in them. I send them without the file's location data; the first one may be read by the AI (Anthropic) as a help, not a verdict.", "A fotókon nincsenek emberek. Helyadatok nélkül küldöm; az elsőt az AI (Anthropic) segítségként elolvashatja, nem ítéletként."))),
      photos.length > 0 && ok && e(AiPhotoHint, { photo: photos[0], onResult: setAi }),
      ai && ai.isCourt === false && e("p", { className: "ai-block" }, "⛔ ", L3("Prima poză nu arată un teren. Scoate-o sau fă alta.", "The first photo doesn't show a court. Remove it or take another.", "Az első fotón nincs pálya. Töröld vagy készíts másikat.")),
      e("p", { className: "text-xs mt-1", style: { color: "var(--textSec)" } }, L3("Fără nume, fără email. Un teren devine „verificat de comunitate” doar când 2 persoane diferite spun același lucru.", "No name, no email. A court becomes “verified by the community” only when 2 different people say the same thing.", "Név és e-mail nélkül. Egy pálya akkor lesz „a közösség által ellenőrzött”, ha 2 különböző ember ugyanazt mondja.")),
      e("button", { className: "btn btn-green btn-block mt-1", disabled: !done || busy, onClick: submit }, busy ? "…" : "📨 " + L3("Trimite verificarea", "Send the check", "Ellenőrzés küldése"))));
}
