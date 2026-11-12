/* === Community === */
/* === Community: an overview of the 7 tabs first, then each tab with one line saying what it is for === */
// The organiser does not compete: his own entry stays out of the public leaderboard (name modesty rule).
export function isOwnerName(n) { const x = String(n || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); return x.indexOf("teodor") >= 0 && x.indexOf("cimpan") >= 0; }
export function communityTabLabel(tb, t) {
  return tb === "overview" ? t.cmOverview : tb === "activity" ? t.liveActivity : tb === "pixel" ? "Pixel" : tb === "forum" ? t.forum : tb === "events" ? t.events : tb === "gallery" ? t.gallery : tb === "teams" ? t.teams : t.leaderboard;
}
