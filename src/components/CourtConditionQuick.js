import { ACTIVE_CITY, COURTS, db, useApp } from "../app/core.js";
import { AiPhotoHint } from "./AiPhotoHint.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { compressImage } from "../lib/compress-image.js";
import { extraCourts } from "../lib/court-status-view.js";
import { aiStamp } from "../lib/g2p-ai.js";
import { g2pCelebrate } from "../lib/g2p-celebrate.js";
import { getVoterKey } from "../lib/get-voter-key.js";
import { logActivity } from "../lib/log-activity.js";
import { useEffect, useState } from "../lib/react.js";

/* === Court Condition Quick — Sibiu hackathon feature === */
export function CourtConditionQuick({ onClose, courtId: presetCourt }) {
  const { t, user, toast, lang } = useApp();
  const fbCourts = useFirebase("courts");
  const [courtId, setCourtId] = useState(presetCourt || "");
  useEffect(() => {
    // Capture phase so Escape closes only this modal, not a CourtDetail underneath.
    const onKey = e => { if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); onClose(); } };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
  const [condition, setCondition] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [ai, setAi] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const allCourts = [...COURTS, ...extraCourts(fbCourts)];
  const selectedCourt = allCourts.find(c => c.id === courtId);
  const conds = [
    { k: "good",      l: t.conditionGood },
    { k: "degraded",  l: t.conditionDegraded },
    { k: "abandoned", l: t.conditionAbandoned }
  ];
  const pickPhoto = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await compressImage(file, 900, 0.7);
    setPhotoDataUrl(data); setAi(null);
  };
  // The AI only fills an empty choice; a different opinion shows as a button.
  const onAi = r => { setAi(r); if (r && r.isCourt && r.condition !== "unclear" && !condition) setCondition(r.condition); };
  const submit = () => {
    if (!courtId || !condition) { toast(t.error); return; }
    setSubmitting(true);
    const now = new Date().toISOString();
    const userName = user ? user.name : "Anonim";
    const payload = {
      courtId, courtName: selectedCourt ? selectedCourt.name : courtId,
      category: "condition", conditionReport: condition,
      description: (conds.find(x => x.k === condition) || {}).l || condition,
      status: "received", city: ACTIVE_CITY,
      createdAt: now, updatedAt: now,
      voterKey: getVoterKey(), userName
    };
    if (photoDataUrl) payload.photoDataUrl = photoDataUrl;
    if (photoDataUrl && ai) payload.ai = aiStamp(ai);
    db.ref("reports").push(payload).then(() => {
      logActivity("conditionReport", userName, courtId);
      toast(t.conditionSubmitted);
      setSubmitting(false);
      onClose();
      g2pCelebrate("verify");
    }).catch(() => { setSubmitting(false); toast(t.error); });
  };
  return React.createElement("div", { className: "modal-overlay", onClick: onClose },
    React.createElement("div", { className: "modal", onClick: e => e.stopPropagation() },
      React.createElement("div", { className: "flex justify-between items-center mb-2" },
        React.createElement("h2", { style: { fontSize: "1rem" } }, t.conditionCheck),
        React.createElement("button", { className: "btn btn-sm btn-outline", onClick: onClose }, t.cancel)
      ),
      React.createElement("p", { className: "text-sm mb-1", style: { color: "var(--textSec)" } }, t.step3Location),
      React.createElement("select", { value: courtId, onChange: e => setCourtId(e.target.value), className: "mb-2" },
        React.createElement("option", { value: "" }, "— " + t.reportSelectCourt + " —"),
        allCourts.map(c => React.createElement("option", { key: c.id, value: c.id }, c.name))
      ),
      React.createElement("p", { className: "text-sm mb-1", style: { color: "var(--textSec)" } }, t.conditionCheck),
      React.createElement("div", { className: "rcat-grid" },
        conds.map(c => React.createElement("button", {
          key: c.k, className: "rcat-btn" + (condition === c.k ? " sel" : ""),
          onClick: () => setCondition(c.k),
          style: { fontSize: ".88rem", padding: ".5rem .3rem", lineHeight: 1.3 }
        }, c.l))
      ),
      React.createElement("p", { className: "text-sm mt-2 mb-1", style: { color: "var(--textSec)" } }, t.addPhotoOpt),
      photoDataUrl
        ? React.createElement("div", { style: { position: "relative", marginBottom: ".5rem" } },
            React.createElement("img", { src: photoDataUrl, alt: "prev", style: { width: "100%", borderRadius: 8, maxHeight: 120, objectFit: "cover" } }),
            React.createElement("button", { onClick: () => { setPhotoDataUrl(null); setAi(null); }, style: { position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,.5)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: ".8rem" } }, "✕")
          )
        : React.createElement("label", { style: { display: "block", cursor: "pointer", marginBottom: ".5rem" } },
            React.createElement("div", { className: "card", style: { textAlign: "center", padding: ".6rem", border: "2px dashed var(--border)", boxShadow: "none" } }, "📷 ", t.choosePhoto),
            React.createElement("input", { type: "file", accept: "image/*", capture: "environment", style: { display: "none" }, onChange: pickPhoto })
          ),
      React.createElement(AiPhotoHint, { photo: photoDataUrl, onResult: onAi, extra: r => r.condition !== "unclear" && condition && r.condition !== condition
        && React.createElement("button", { type: "button", className: "ai-btn ai-btn-sm", onClick: () => setCondition(r.condition) }, "", (conds.find(x => x.k === r.condition) || {}).l) }),
      photoDataUrl && ai && ai.isCourt === false && React.createElement("p", { className: "ai-block" }, "⛔ ", lang === "en" ? "The photo doesn't show a court, so it can't be sent. Remove it or take another." : lang === "hu" ? "A fotón nincs pálya, ezért nem küldhető el. Töröld vagy készíts másikat." : "Poza nu arată un teren, așa că nu o putem trimite. Scoate-o sau fă alta."),
      React.createElement("button", { className: "btn btn-green btn-block mt-2", disabled: !courtId || !condition || submitting || !!(photoDataUrl && ai && ai.isCourt === false), onClick: submit }, submitting ? "..." : t.submit)
    )
  );
}
