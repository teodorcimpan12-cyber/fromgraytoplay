import { COURTS, useApp } from "../app/core.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { verifyConsensus } from "../lib/verify-by-court.js";

/* Live presence counter — presence/{voterKey} written from App. */
export function PresenceBadge() {
  const { t } = useApp();
  const p = useFirebase("presence");
  const n = p ? Object.keys(p).length : 0;
  if (!n) return null;
  return React.createElement("span", { className: "presence", title: n + " " + t.onlineNow },
    React.createElement("i", null), n);
}
export function footyLines(cx, W, H, color) {
  cx.strokeStyle = color; cx.lineWidth = 5; cx.setLineDash([]);
  cx.beginPath(); cx.arc(W / 2, H / 2, 150, 0, Math.PI * 2); cx.stroke();
  var pbW = 150, pbH = 320, M = 64;
  cx.strokeRect(M, H / 2 - pbH / 2, pbW, pbH); cx.strokeRect(W - M - pbW, H / 2 - pbH / 2, pbW, pbH);
}
// Courts the satellite audit could not settle: gone first, then worn, then the oldest capture; community-verified ones drop off.
export function sibiuMissions(byCourt) {
  const rank = { gone: 0, worn: 1, ok: 2 };
  return COURTS.filter(c => c.city === "sibiu" && !c.stadium && c.sat && !((verifyConsensus(byCourt[c.id]) || {}).state === "verified"))
    .sort((a, b) => (rank[a.sat.v] - rank[b.sat.v]) || String(a.sat.at).localeCompare(String(b.sat.at)));
}
