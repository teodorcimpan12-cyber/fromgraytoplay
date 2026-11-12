import { COURTS, useApp } from "../app/core.js";
import { CourtConditionQuick } from "./CourtConditionQuick.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { useState } from "../lib/react.js";
import { verifyByCourt, verifyConsensus } from "../lib/verify-by-court.js";

export function SibiuProgressBannerInner() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const allReports = useFirebase("reports");
  const byCourt = verifyByCourt(useFirebase("verifications"));
  const checked = {};
  if (allReports) Object.values(allReports).forEach(r => { if (r && r.category === "condition" && r.courtId) checked[r.courtId] = 1; });
  Object.keys(byCourt).forEach(id => { checked[id] = (verifyConsensus(byCourt[id]) || {}).state === "verified" ? 2 : Math.max(checked[id] || 0, 1); });
  const sbCourts = COURTS.filter(c => c.city === "sibiu");
  const lit = sbCourts.filter(c => checked[c.id]).length, confirmed = sbCourts.filter(c => checked[c.id] === 2).length;
  return React.createElement("div", {
    "data-demo": "verify",
    style: {
      background: "linear-gradient(135deg, var(--green) 0%, var(--teal) 100%)",
      color: "var(--white)", borderRadius: "var(--radius)", padding: "1rem", marginBottom: "1rem",
      boxShadow: "var(--shadow)"
    }
  },
    React.createElement("div", { className: "flex justify-between items-center", style: { gap: ".6rem" } },
      React.createElement("div", { style: { minWidth: 0 } },
        React.createElement("strong", { style: { fontSize: ".93rem", display: "block", marginBottom: ".2rem" } }, t.sibiuVerifyTitle),
        React.createElement("span", { style: { fontSize: ".8rem", opacity: .9, fontFamily: "'Space Mono',monospace" } }, "🩺 ", lit, " / ", sbCourts.length, " ", t.sibiuCourtsChecked, confirmed ? " · ✔ " + confirmed + " " + L3("confirmate de 2 persoane", "confirmed by 2 people", "2 ember megerősítette") : "")
      ),
      React.createElement("button", {
        className: "btn btn-sm",
        style: { background: "var(--white)", color: "var(--green)", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 },
        onClick: () => setOpen(true)
      }, "＋ ", t.verifyCourtCTA)
    ),
    React.createElement("div", { className: "sb-dots", "aria-hidden": "true" },
      sbCourts.map(c => React.createElement("span", { key: c.id, className: "sb-dot" + (checked[c.id] === 2 ? " on" : checked[c.id] ? " half" : ""), title: c.name }))
    ),
    open && ReactDOM.createPortal(React.createElement(CourtConditionQuick, { onClose: () => setOpen(false) }), document.body)
  );
}
