import { useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useState } from "../../lib/react.js";
import { CourtPulse, courtPulseModel } from "./CourtPulse.js";

/* Small "heart + bpm" chip on the court sheet; the full ECG monitor opens on tap. */
export function CourtPulseChip({ court }) {
  const { lang } = useApp();
  const m = courtPulseModel(court, useFirebase("reports"), useFirebase("ratings/" + court.id));
  const [open, setOpen] = useState(false);
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro; // TODO: HU review
  const label = L3("Pulsul terenului", "Court pulse", "A pálya pulzusa");
  const e = React.createElement;
  return e(React.Fragment, null,
    e("button", { type: "button", className: "cdx-pchip" + (m.bpm ? " on" : ""), style: { color: m.tone }, onClick: () => setOpen(true), "aria-label": label + (m.bpm ? ": " + m.bpm : ""), title: label },
      e("span", { className: "cdx-heart", "aria-hidden": "true", style: m.bpm ? { animationDuration: (60 / m.bpm).toFixed(2) + "s" } : null }, "♥"),
      e("b", null, m.bpm || "—")),
    open && ReactDOM.createPortal(e("div", { className: "modal-overlay", onClick: ev => { ev.stopPropagation(); setOpen(false); } },
      e("div", { className: "modal cdx-pmodal", onClick: ev => ev.stopPropagation(), role: "dialog", "aria-modal": "true", "aria-label": label },
        e("button", { type: "button", className: "cdx-pclose", onClick: () => setOpen(false), "aria-label": L3("Închide", "Close", "Bezárás") }, "✕"),
        e(CourtPulse, { court }))), document.body));
}
