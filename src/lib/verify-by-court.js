export function verifyByCourt(all) {
  const out = {};
  if (all) Object.values(all).forEach(v => { if (v && v.courtId && v.exists) (out[v.courtId] = out[v.courtId] || []).push(v); });
  return out;
}
// latest answer per device; consensus = at least 2 devices with the same (exists, playable)
export function verifyConsensus(list) {
  if (!list || !list.length) return null;
  const byDev = {};
  list.forEach(v => { const k = v.dev || Math.random().toString(36); if (!byDev[k] || String(v.at) > String(byDev[k].at)) byDev[k] = v; });
  const ans = Object.values(byDev), groups = {};
  ans.forEach(v => { const k = v.exists + "|" + (v.exists === "yes" ? v.playable : "-"); (groups[k] = groups[k] || []).push(v); });
  const best = Object.values(groups).sort((a, b) => b.length - a.length)[0];
  const at = ans.map(v => v.at).sort().pop();
  if (best.length >= 2) return { state: "verified", n: best.length, total: ans.length, exists: best[0].exists, playable: best[0].playable, at };
  return { state: ans.length === 1 ? "single" : "split", n: 1, total: ans.length, exists: ans[0].exists, playable: ans[0].playable, at };
}
