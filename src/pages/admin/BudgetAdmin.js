import { db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";

/* Admin panel companion for BudgetWatchdog. */
export function BudgetAdmin() {
  var _ref = useApp(), t = _ref.t, toast = _ref.toast;
  var year = new Date().getFullYear();
  var data = useFirebase("budgetLive/" + year) || { promised: 5000000, spent: 0 };
  var _p = React.useState(5000000), pv = _p[0], setPv = _p[1];
  var _s = React.useState(0), sv = _s[0], setSv = _s[1];
  React.useEffect(function() { setPv(data.promised || 5000000); setSv(data.spent || 0); }, [data.promised, data.spent]);
  var save = function() { db.ref("budgetLive/" + year).set({ promised: Number(pv), spent: Number(sv) }); toast(t.success); };
  return React.createElement("div", { className: "card mt-2" },
    React.createElement("h4", { className: "mb-1" }, "🐕 ", t.budgetWatchdog || "Budget Watchdog", " — ", year),
    React.createElement("div", { className: "flex gap-1 mb-1" },
      React.createElement("label", { style: { flex: 1, fontSize: ".82rem", color: "var(--textSec)" } }, t.budgetPromised || "Promis",
        React.createElement("input", { type: "number", value: pv, onChange: function(e) { setPv(e.target.value); }, style: { marginTop: ".25rem", display: "block", width: "100%" } })
      ),
      React.createElement("label", { style: { flex: 1, fontSize: ".82rem", color: "var(--textSec)" } }, t.budgetSpent || "Cheltuit",
        React.createElement("input", { type: "number", value: sv, onChange: function(e) { setSv(e.target.value); }, style: { marginTop: ".25rem", display: "block", width: "100%" } })
      )
    ),
    React.createElement("button", { className: "btn btn-green btn-sm", onClick: save }, "💾 Save")
  );
}
