/* Relative time label ("acum 2h" / "2h ago" / "2 órája"). */
export function relTime(ts, lang) {
  // Timestamps come as ms numbers, ISO strings (older reports) or seconds. Unknown -> "".
  var n = typeof ts === "number" ? ts : (Number(ts) || Date.parse(ts || "") || 0);
  if (n > 0 && n < 1e11) n *= 1000;
  if (!n) return "";
  var diff = Math.max(0, Date.now() - n);
  var mins = Math.floor(diff / 60000);
  var hrs = Math.floor(diff / 3600000);
  var days = Math.floor(diff / 86400000);
  if (lang === "ro") {
    if (mins < 1) return "chiar acum";
    if (mins < 60) return "acum " + mins + " min";
    if (hrs < 24) return "acum " + hrs + "h";
    return "acum " + days + (days === 1 ? " zi" : " zile");
  }
  if (lang === "hu") { // TODO: HU review
    if (mins < 1) return "épp most";
    if (mins < 60) return mins + " perce";
    if (hrs < 24) return hrs + " órája";
    return days + " napja";
  }
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  if (hrs < 24) return hrs + "h ago";
  return days + (days === 1 ? " day ago" : " days ago");
}
/* Civic streak: bumped on every civic action via logActivity().
   localStorage g2p_streak = {count, last:"YYYY-MM-DD"}. */
export function streakDateStr(d) {
  d = d || new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
export function bumpStreak() {
  try {
    var today = streakDateStr();
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yesterday = streakDateStr(y);
    var raw = localStorage.getItem("g2p_streak");
    var st = raw ? JSON.parse(raw) : null;
    var count;
    if (st && st.last === today) { count = st.count; }
    else if (st && st.last === yesterday) { count = (st.count || 0) + 1; }
    else { count = 1; }
    localStorage.setItem("g2p_streak", JSON.stringify({ count: count, last: today }));
    return count;
  } catch (e) { return 0; }
}
