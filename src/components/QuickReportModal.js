import { ACTIVE_CITY, COURTS, RQ_MAX, RQ_WIN, db, g2pSfx, useApp } from "../app/core.js";
import { AiPhotoHint } from "./AiPhotoHint.js";
import { REPORT_CATS, SITE } from "../data/constants.js";
import { useBadges } from "../hooks/useBadges.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { compressImage } from "../lib/compress-image.js";
import { courtStatusView, extraCourts } from "../lib/court-status-view.js";
import { aiStamp } from "../lib/g2p-ai.js";
import { getVoterKey } from "../lib/get-voter-key.js";
import { anonName, hoodName } from "../lib/next-lang.js";
import { useEffect, useState } from "../lib/react.js";
import { reportDraft } from "../lib/report-draft.js";

export function rqRecent() {
  try {
    const o = JSON.parse(localStorage.getItem("g2p_rq_ts") || "null");
    const now = Date.now();
    return o && o.vk === getVoterKey() ? (o.ts || []).filter(x => now - x < RQ_WIN) : [];
  } catch (e) { return []; }
}
export function rqMark() { try { localStorage.setItem("g2p_rq_ts", JSON.stringify({ vk: getVoterKey(), ts: rqRecent().concat(Date.now()) })); } catch (e) {} }
export function QuickReportModal({ onClose, courtId: preset, demo }) {
  const { t, user, toast, lang, firebaseUser, openAuth } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const fbCourts = useFirebase("courts");
  const { awardBadge } = useBadges();
  const [draft0] = useState(reportDraft);
  const [step, setStep] = useState(draft0 ? 3 : preset ? 2 : 1);
  const [f, setF] = useState(draft0 || { courtId: preset || "", category: "", note: "", photoDataUrl: null, lat: null, lng: null });
  const [q, setQ] = useState("");
  const [here, setHere] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ai, setAi] = useState(null);
  const [done, setDone] = useState(null);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape" && document.querySelectorAll(".modal-overlay").length < 2) { e.preventDefault(); e.stopImmediatePropagation(); onClose(); } };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
  const allCourts = [...COURTS, ...extraCourts(fbCourts)].filter(c => (c.city || "tgm") === ACTIVE_CITY);
  const court = allCourts.find(c => c.id === f.courtId);
  const catLabel = k => ({ surface: t.catSurface, hoop: t.catHoop, fence: t.catFence, lighting: t.catLighting, trash: t.catTrash, safety: t.catSafety, other: t.catOther }[k] || k);
  const dist = c => here && c.lat != null ? Math.hypot((c.lat - here.lat) * 111, (c.lng - here.lng) * 111 * Math.cos(here.lat * Math.PI / 180)) : null;
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const list = allCourts
    .filter(c => !q || norm(c.name + " " + (c.address || "") + " " + (c.neighbourhood || "")).indexOf(norm(q)) >= 0)
    .sort((a, b) => here ? (dist(a) || 99) - (dist(b) || 99) : 0)
    .slice(0, q || here ? 8 : 6);
  const geolocate = silent => {
    if (!navigator.geolocation) { if (!silent) toast(t.error); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p => { setHere({ lat: p.coords.latitude, lng: p.coords.longitude }); setF(o => ({ ...o, lat: p.coords.latitude, lng: p.coords.longitude })); setLocating(false); },
      () => { setLocating(false); if (!silent) toast(L3("Nu am primit locația. Caută terenul după nume.", "No location. Search the court by name.", "Nincs hely. Keresd a pályát név szerint.")); },
      { timeout: 8000 }
    );
  };
  // GPS asked once on open; refused or unavailable -> the list stays as it is.
  useEffect(() => { if (!preset && !draft0) geolocate(true); }, []);
  // Nearest court within 2 km is preselected; the person can still change it (step 1).
  useEffect(() => {
    if (!here || f.courtId || step !== 1) return;
    const best = allCourts.map(c => [c, dist(c)]).filter(x => x[1] != null).sort((a, b) => a[1] - b[1])[0];
    if (best && best[1] <= 2) { setF(o => ({ ...o, courtId: best[0].id })); setAuto(true); setStep(2); }
  }, [here]);
  const pickPhoto = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try { const data = await compressImage(file, 900, 0.7); setF(o => ({ ...o, photoDataUrl: data })); setAi(null); } catch (err) { toast(t.error); }
  };
  const login = () => {
    try { sessionStorage.setItem("g2p_report_draft", JSON.stringify(f)); }
    catch (e) { try { sessionStorage.setItem("g2p_report_draft", JSON.stringify(Object.assign({}, f, { photoDataUrl: null }))); } catch (e2) {} }
    openAuth();
  };
  const submit = () => {
    if (!f.category || !f.courtId) { toast(t.error); return; }
    const recent = rqRecent();
    if (recent.length >= RQ_MAX) {
      const mins = Math.max(1, Math.ceil((RQ_WIN - (Date.now() - Math.min.apply(null, recent))) / 60000));
      toast(L3("Ai trimis deja 2 sesizări în ultimele 10 minute. Mai poți trimite una peste " + mins + " min.", "You already sent 2 reports in the last 10 minutes. You can send another in " + mins + " min.", "Az elmúlt 10 percben már 2 bejelentést küldtél. " + mins + " perc múlva küldhetsz újat.")); // TODO: HU review
      return;
    }
    setSubmitting(true);
    const now = new Date().toISOString();
    const userName = anonName(user ? user.name : "");
    const payload = {
      courtId: f.courtId, courtName: court ? court.name : f.courtId, neighborhood: court ? (court.neighbourhood || "") : "",
      category: f.category, description: (f.note || "").trim().slice(0, 2000) || catLabel(f.category),
      status: "received", statusAt: { received: now }, city: ACTIVE_CITY, createdAt: now, updatedAt: now,
      voterKey: getVoterKey(), userName: userName
    };
    if (firebaseUser) payload.uid = firebaseUser.uid;
    if (demo) payload.demo = true;
    if (f.photoDataUrl) payload.photoDataUrl = f.photoDataUrl;
    if (f.photoDataUrl && ai) payload.ai = aiStamp(ai);
    if (f.lat) { payload.lat = f.lat; payload.lng = f.lng; }
    db.ref("reports").push(payload).then(() => {
      rqMark();
      const act = { type: "report", userName: userName, courtId: f.courtId, courtName: payload.courtName, timestamp: now };
      if (demo) act.demo = true;
      db.ref("activity").push(act);
      try { sessionStorage.removeItem("g2p_report_draft"); } catch (e) {}
      awardBadge("reporter");
      g2pSfx("whistle");
      setSubmitting(false);
      setDone({ courtId: f.courtId, courtName: payload.courtName, category: f.category });
    }).catch(() => { setSubmitting(false); toast(t.error); });
  };
  const close = () => { try { sessionStorage.removeItem("g2p_report_draft"); } catch (e) {} onClose(); };
  const e = React.createElement;
  const stepNames = [L3("Terenul", "Court", "Pálya"), L3("Problema", "Problem", "Probléma"), L3("Poza", "Photo", "Fotó")];
  if (done) {
    const url = SITE + "/#court-" + done.courtId;
    const share = () => {
      const txt = L3("Am raportat o problemă la " + done.courtName + " (" + catLabel(done.category) + "). Vezi fișa terenului:", "I reported a problem at " + done.courtName + " (" + catLabel(done.category) + "). See the court's page:", "Problémát jelentettem: " + done.courtName + " (" + catLabel(done.category) + "). A pálya adatlapja:"); // TODO: HU review
      if (navigator.share) { navigator.share({ title: "From Grey to Play", text: txt, url: url }).catch(() => {}); return; }
      (navigator.clipboard ? navigator.clipboard.writeText(txt + " " + url) : Promise.reject()).then(() => toast(L3("Link copiat", "Link copied", "Link másolva"))).catch(() => toast(url));
    };
    return e("div", { className: "modal-overlay", onClick: onClose },
      e("div", { className: "modal rq", onClick: ev => ev.stopPropagation(), role: "dialog", "aria-modal": "true", "aria-label": L3("Sesizare creată", "Report created", "Bejelentés létrehozva"), style: { textAlign: "center" } },
        e("div", { style: { fontSize: "2.4rem" }, "aria-hidden": "true" }, "✅"),
        e("h2", { style: { fontSize: "1.15rem", margin: ".3rem 0" } }, L3("Sesizare creată.", "Report created.", "Bejelentés létrehozva.")),
        e("p", { className: "text-sm" }, L3("Termen legal de răspuns: 30 de zile.", "Legal answer deadline: 30 days.", "Törvényes válaszhatáridő: 30 nap.")),
        e("p", { className: "text-xs mb-1", style: { color: "var(--textSec)" } }, L3("Ceasul pornește când sesizarea e înregistrată la Primărie. Îl vezi pe fișa terenului.", "The clock starts when the report is registered at City Hall. You can follow it on the court's page.", "Az óra akkor indul, amikor a bejelentést iktatják a Városházán. A pálya adatlapján követheted.")), // TODO: HU review
        e("button", { className: "btn btn-green btn-block mt-1", onClick: share }, "📤 ", L3("Trimite mai departe", "Share", "Megosztás")),
        e("button", { className: "btn btn-outline btn-block mt-1", onClick: () => { onClose(); location.hash = "#court-" + done.courtId; } }, "📍 ", L3("Vezi fișa terenului", "See the court's page", "A pálya adatlapja")),
        !firebaseUser && e("button", { className: "btn btn-outline btn-block mt-1", onClick: () => { onClose(); openAuth(); } }, "🔐 ", L3("Salvează-ți sesizările (cont)", "Save your reports (account)", "Mentsd a bejelentéseidet (fiók)")),
        e("button", { className: "btn btn-block mt-1", onClick: onClose }, L3("Închide", "Close", "Bezárás"))));
  }
  return e("div", { className: "modal-overlay", onClick: close },
    e("div", { className: "modal modal-lg rq", onClick: ev => ev.stopPropagation(), role: "dialog", "aria-modal": "true", "aria-label": t.reportNew },
      e("div", { className: "flex justify-between items-center mb-1" },
        e("h2", { style: { fontSize: "1rem", margin: 0 } }, "⚠️ ", t.reportNew),
        e("button", { className: "btn btn-sm btn-outline", onClick: close }, t.cancel)),
      e("ol", { className: "rq-steps" }, stepNames.map((n, i) => e("li", { key: i, className: i + 1 < step ? "done" : i + 1 === step ? "on" : "" },
        e("button", { disabled: i + 1 > step, onClick: () => setStep(i + 1) }, e("b", null, i + 1 < step ? "✓" : i + 1), n)))),
      (court || f.category) && e("div", { className: "rq-sum" },
        court && e("span", null, "📍 " + court.name),
        f.category && e("span", null, (REPORT_CATS.find(c => c[0] === f.category) || [0, "📌"])[1] + " " + catLabel(f.category))),
      step === 1 && e("div", { className: "rq-pane", key: "s1" },
        e("div", { className: "flex gap-1 mb-1" },
          e("input", { value: q, onChange: ev => setQ(ev.target.value), placeholder: L3("Caută terenul (nume, stradă, cartier)", "Search the court (name, street, area)", "Pálya keresése (név, utca, negyed)"), "aria-label": t.reportSelectCourt, style: { flex: 1 } }),
          e("button", { className: "btn btn-sm btn-outline", onClick: () => geolocate(false), disabled: locating, style: { whiteSpace: "nowrap" } }, locating ? "…" : "📍 " + L3("Lângă mine", "Near me", "Közelben"))),
        e("div", { className: "rq-courts" }, list.map(c => e("button", { key: c.id, className: "rq-court" + (f.courtId === c.id ? " sel" : ""), onClick: () => { setF(o => ({ ...o, courtId: c.id })); setStep(2); } },
          e("span", { className: "rq-dot", style: { background: courtStatusView(c, t).color } }),
          e("span", { className: "rq-cn" }, e("b", null, c.name), e("small", null, c.address || hoodName(c.neighbourhood, lang) || "")),
          dist(c) != null && e("span", { className: "rq-km" }, dist(c) < 1 ? Math.round(dist(c) * 1000) + " m" : dist(c).toFixed(1) + " km"))),
          !list.length && e("p", { className: "text-sm", style: { color: "var(--textSec)" } }, L3("Niciun teren găsit.", "No court found.", "Nincs ilyen pálya.")))),
      step === 2 && e("div", { className: "rq-pane", key: "s2" },
        auto && court && e("p", { className: "text-xs mb-1", style: { color: "var(--textSec)" } }, "📍 ", L3("Am ales terenul cel mai apropiat: ", "We picked the nearest court: ", "A legközelebbi pályát választottuk: "), e("b", null, court.name), " · ",
          e("a", { href: "#", onClick: ev => { ev.preventDefault(); setAuto(false); setStep(1); } }, L3("nu e ăsta?", "not this one?", "nem ez?"))), // TODO: HU review
        e("p", { className: "text-sm mb-1", style: { color: "var(--textSec)" } }, L3("Ce e în neregulă? Atinge una.", "What is wrong? Tap one.", "Mi a baj? Koppints egyre.")),
        e("div", { className: "rq-cats" }, REPORT_CATS.map(c => e("button", { key: c[0], className: "rq-cat" + (f.category === c[0] ? " sel" : ""), onClick: () => { setF(o => ({ ...o, category: c[0] })); g2pSfx("click"); setStep(3); } },
          e("span", { "aria-hidden": "true" }, c[1]), catLabel(c[0]))))),
      step === 3 && e("div", { className: "rq-pane", key: "s3" },
        f.photoDataUrl
          ? e("div", { className: "rq-photo" },
              e("img", { src: f.photoDataUrl, alt: L3("Poza ta", "Your photo", "A fotód") }),
              e("button", { onClick: () => { setF(o => ({ ...o, photoDataUrl: null })); setAi(null); }, "aria-label": L3("Scoate poza", "Remove photo", "Fotó törlése") }, "✕"))
          : e("label", { className: "rq-drop" },
              e("span", { style: { fontSize: "2rem" } }, "📷"),
              e("b", null, L3("Fă o poză", "Take a photo", "Készíts fotót")),
              e("small", null, L3("Opțional, dar o poză valorează cât 100 de cuvinte la Primărie.", "Optional, but a photo is worth 100 words at City Hall.", "Nem kötelező, de egy fotó 100 szót ér a Városházán.")),
              e("input", { type: "file", accept: "image/*", capture: "environment", style: { display: "none" }, onChange: pickPhoto })),
        e(AiPhotoHint, { photo: f.photoDataUrl, onResult: setAi, extra: r => e("div", { className: "ai-acts" },
          r.category !== "none" && r.category !== f.category && e("button", { type: "button", className: "ai-btn ai-btn-sm", onClick: () => setF(o => ({ ...o, category: r.category })) },
            "↪ ", (REPORT_CATS.find(c => c[0] === r.category) || [0, "📌"])[1], " ", catLabel(r.category)),
          r.summary && (f.note || "").indexOf(r.summary) < 0 && e("button", { type: "button", className: "ai-btn ai-btn-sm", onClick: () => setF(o => ({ ...o, note: ((o.note || "").trim() ? o.note.trim() + "\n" : "") + r.summary })) },
            "＋ ", L3("Pune în descriere", "Add to the note", "Hozzáadás a leíráshoz"))) }),
        e("textarea", { value: f.note, onChange: ev => setF(o => ({ ...o, note: ev.target.value })), rows: 2, maxLength: 2000, placeholder: L3("Vrei să adaugi ceva? (opțional)", "Anything to add? (optional)", "Szeretnél még valamit írni? (nem kötelező)"), style: { marginTop: ".6rem", resize: "vertical" } }),
        f.photoDataUrl && ai && ai.isCourt === false && e("p", { className: "ai-block" }, "⛔ ", L3("Poza nu arată un teren, așa că nu o putem trimite. Scoate-o sau fă alta.", "The photo doesn't show a court, so it can't be sent. Remove it or take another.", "A fotón nincs pálya, ezért nem küldhető el. Töröld vagy készíts másikat.")),
        e("button", { className: "btn btn-green btn-block mt-1", disabled: submitting || !f.courtId || !f.category || !!(f.photoDataUrl && ai && ai.isCourt === false), onClick: submit },
          submitting ? "…" : "📨 " + t.submit))
    ));
}
