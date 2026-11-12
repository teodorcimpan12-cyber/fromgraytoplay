/* Court detail: the AI photo estimates, always apart from the court's status (never written to `condition`). */
export function aiEstimateOf(reports, courtId) {
  const list = reports ? Object.values(reports).filter(r => r && r.courtId === courtId && r.ai && r.ai.score >= 1 && r.ai.score <= 5) : [];
  if (!list.length) return null;
  const recent = list.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0, 5);
  const sc = recent.map(r => r.ai.score).sort((a, b) => a - b);
  return { score: sc[Math.floor(sc.length / 2)], n: list.length, at: recent[0].createdAt || "" };   // median of the latest 5 photos
}
