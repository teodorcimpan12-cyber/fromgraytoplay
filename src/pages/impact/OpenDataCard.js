import { COURTS_ALL, useApp } from "../../app/core.js";
import { SITE } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { aiEstimateOf } from "../../lib/ai-estimate-of.js";
import { extraCourts } from "../../lib/court-status-view.js";
import { downloadFile } from "../../lib/download-file.js";

/* ============================================================
   OPEN DATA EXPORT — JSON/CSV download of the public dataset.
   Strips voterKey + photoDataUrl (privacy / file size).
   ============================================================ */
export function OpenDataCard() {
  const { t, toast } = useApp();
  const reports = useFirebase("reports");
  const votes = useFirebase("votes");
  const fbCourts = useFirebase("courts");
  const ratings = useFirebase("ratings");
  // condition_source: field (team visit / city data), satellite (team audit), press (stadiums), none
  const buildCourts = () => [...COURTS_ALL, ...extraCourts(fbCourts, true)].map(c => Object.assign({}, c, {
    condition_source: c.condition == null ? null : c.estimate === "sat" ? "satellite" : c.stadium && c.city === "sibiu" ? "press" : "field",
    ai_estimate: reports ? (aiEstimateOf(reports, c.id) || {}).score || null : null
  }));
  const buildReports = () => reports ? Object.entries(reports).map(([id, r]) => ({
    id,
    courtId: r.courtId || "",
    courtName: r.courtName || "",
    neighbourhood: r.neighborhood || r.neighbourhood || "",
    category: r.category || "",
    description: r.description || "",
    status: r.status || "",
    lat: r.lat || null,
    lng: r.lng || null,
    createdAt: r.createdAt || null,
    condition_source: r.ai && r.ai.score ? "ai_estimate" : r.conditionReport ? "community" : null,
    ai_score: r.ai && r.ai.score || null
  })) : [];
  const buildRatings = () => {
    const out = {};
    if (!ratings) return out;
    const dims = ["surface", "lighting", "equipment", "safety"];
    Object.entries(ratings).forEach(([cid, byUser]) => {
      const list = Object.values(byUser || {});
      if (!list.length) return;
      const avg = { count: list.length };
      dims.forEach(d => { avg[d] = +(list.reduce((s, r) => s + (+r[d] || 0), 0) / list.length).toFixed(2); });
      out[cid] = avg;
    });
    return out;
  };
  const exportJson = () => {
    const data = {
      meta: { project: "From Grey to Play", source: SITE, generated: new Date().toISOString(), license: "CC BY 4.0" },
      votes: votes || {},
      courts: buildCourts(),
      reports: buildReports(),
      ratings: buildRatings()
    };
    downloadFile("g2p_open_data.json", JSON.stringify(data, null, 2), "application/json");
    toast(t.openDataReady);
  };
  const exportCsv = () => {
    const esc = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const head = ["id", "courtId", "courtName", "neighbourhood", "category", "status", "lat", "lng", "createdAt", "condition_source", "ai_score", "description"];
    const rows = buildReports().map(r => head.map(k => esc(r[k])).join(","));
    downloadFile("g2p_sesizari.csv", [head.join(",")].concat(rows).join("\n"), "text/csv;charset=utf-8");
    toast(t.openDataReady);
  };
  return React.createElement("div", { className: "card mb-2", style: { borderLeft: "4px solid var(--teal)" } },
    React.createElement("div", { className: "flex justify-between items-center", style: { gap: "1rem", flexWrap: "wrap" } },
      React.createElement("div", { style: { flex: 1, minWidth: 180 } },
        React.createElement("h3", { className: "barlow", style: { fontSize: "1.15rem", marginBottom: ".25rem" } }, "🗂️ ", t.openData),
        React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)" } }, t.openDataSub)
      ),
      React.createElement("div", { className: "flex gap-1", style: { flexWrap: "wrap" } },
        React.createElement("button", { className: "btn btn-outline btn-sm", onClick: exportJson }, "📥 " + t.downloadJson),
        React.createElement("button", { className: "btn btn-outline btn-sm", onClick: exportCsv }, "📥 " + t.downloadCsv)
      )
    )
  );
}
