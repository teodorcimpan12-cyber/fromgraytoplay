import { useApp } from "../../app/core.js";
import { streakDateStr } from "../../lib/rel-time.js";

export function readStreak() {
  try {
    var raw = localStorage.getItem("g2p_streak");
    if (!raw) return { count: 0, last: null };
    var st = JSON.parse(raw);
    var today = streakDateStr();
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yesterday = streakDateStr(y);
    // Streak only "alive" if last action was today or yesterday.
    if (st.last === today || st.last === yesterday) return st;
    return { count: 0, last: st.last };
  } catch (e) { return { count: 0, last: null }; }
}
/* === S4-F8: Civic Streak Card ===
   Reads readStreak(); shown in ProfilePage. */
export function StreakCard() {
  var _ref = useApp(), t = _ref.t;
  var st = readStreak();
  var count = st.count || 0;
  var dots = Array.from({ length: 7 }, function(_, i) {
    var daysAgo = 6 - i;
    var active = count > 0 && daysAgo < count;
    return active;
  });
  return React.createElement("div", { className: "card mb-2" },
    React.createElement("div", { className: "flex justify-between items-center mb-1" },
      React.createElement("h3", null, t.streakTitle || "Seria ta civică"),
      React.createElement("div", { className: "stat-number", style: { fontSize: "2rem", color: "var(--coral)", lineHeight: 1 } }, count)
    ),
    React.createElement("p", { className: "text-sm mb-1", style: { color: "var(--textSec)" } },
      count > 0
        ? count + " " + (t.streakDays || "zile la rând active civic")
        : (t.streakStart || "Fă o acțiune azi ca să-ți pornești seria!")
    ),
    React.createElement("div", { className: "flex gap-1" },
      dots.map(function(active, i) {
        return React.createElement("div", { key: i, style: {
          width: 30, height: 30, borderRadius: 6, flexShrink: 0,
          background: active ? "var(--coral)" : "var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem"
        } }, active ? "🔥" : "");
      })
    )
  );
}
