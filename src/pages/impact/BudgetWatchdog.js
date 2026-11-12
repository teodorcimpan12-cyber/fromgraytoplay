import { useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";

/* === S4-F6: Budget Watchdog ===
   Reads budgetLive/{year} from Firebase. Shown on ImpactPage > budget tab. */
export function BudgetWatchdog() {
  var _ref = useApp(), t = _ref.t;
  var year = new Date().getFullYear();
  var data = useFirebase("budgetLive/" + year) || { promised: 5000000, spent: 0 };
  var promised = data.promised || 0, spent = data.spent || 0;
  var gap = Math.max(0, promised - spent);
  var pct = promised > 0 ? Math.min(100, Math.round(spent / promised * 100)) : 0;
  return React.createElement("div", { className: "card mt-2" },
    React.createElement("h3", { className: "mb-1" }, t.budgetWatchdog || "Câinele de pază al bugetului"),
    React.createElement("p", { className: "text-xs mb-2", style: { color: "var(--textSec)" } }, year),
    React.createElement("div", { className: "grid grid-2 mb-2" },
      React.createElement("div", { style: { textAlign: "center" } },
        React.createElement("div", { className: "stat-number", style: { color: "var(--green)" } }, promised.toLocaleString()),
        React.createElement("div", { className: "stat-label" }, t.budgetPromised || "Promis")
      ),
      React.createElement("div", { style: { textAlign: "center" } },
        React.createElement("div", { className: "stat-number", style: { color: "var(--coral)" } }, spent.toLocaleString()),
        React.createElement("div", { className: "stat-label" }, t.budgetSpent || "Cheltuit")
      )
    ),
    React.createElement("div", { className: "progress-bar mb-1" },
      React.createElement("div", { className: "progress-fill", style: { width: pct + "%" } })
    ),
    React.createElement("p", { className: "text-xs mb-1", style: { color: "var(--textSec)" } }, pct + "% cheltuit"),
    React.createElement("div", { className: "card", style: { background: "var(--red)22", borderLeft: "4px solid var(--red)", padding: "1rem", textAlign: "center" } },
      React.createElement("div", { className: "stat-number", style: { color: "var(--red)", fontSize: "1.5rem" } }, gap.toLocaleString() + " lei"),
      React.createElement("div", { className: "stat-label" }, t.budgetGap || "promiși dar necheltuiți")
    )
  );
}
