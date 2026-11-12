import { COURTS } from "../app/core.js";
import { useFirebase } from "./useFirebase.js";

export function usePressData() {
  const votes = useFirebase("votes");
  const reports = useFirebase("reports");
  const signups = useFirebase("signupStats");
  const ids = {}; COURTS.forEach(c => { ids[c.id] = 1; });
  const rs = reports ? Object.values(reports).filter(r => r && ids[r.courtId]) : [];
  const checked = {}; rs.forEach(r => { if (r.category === "condition") checked[r.courtId] = 1; });
  return {
    ready: !!votes,
    votes: votes ? (votes.flip || 0) + (votes.mural || 0) + (votes.both || 0) : 0,
    courts: COURTS.length,
    reports: rs.filter(r => r.category !== "condition").length,
    resolved: rs.filter(r => r.status === "resolved").length,
    checked: Object.keys(checked).length,
    volunteers: signups ? Object.values(signups).filter(s => s && s.volunteer).length : 0,
    photos: rs.filter(r => r.photoDataUrl).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 4)
  };
}
