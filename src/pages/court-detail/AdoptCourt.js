import { db, useApp } from "../../app/core.js";
import { BadgeUnlockModal } from "../../components/BadgeUnlockModal.js";
import { useBadges } from "../../hooks/useBadges.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { getVoterKey } from "../../lib/get-voter-key.js";
import { logActivity } from "../../lib/log-activity.js";

/* === S4-F5: Court Adoption ===
   Firebase adoptions/{courtId}/{voterKey}: {name, ts}. Awards guardian badge. */
export function AdoptCourt({ court }) {
  var _ref = useApp(), t = _ref.t, lang = _ref.lang, toast = _ref.toast;
  var _b = useBadges(), awardBadge = _b.awardBadge;
  var vk = getVoterKey();
  var adoptions = useFirebase("adoptions/" + court.id) || {};
  var names = Object.values(adoptions).map(function(a) { return a && a.name ? a.name : "?"; });
  var isAdopted = !!adoptions[vk];
  var _s = React.useState(""), joinName = _s[0], setJoinName = _s[1];
  var _u = React.useState(null), unlockBadge = _u[0], setUnlockBadge = _u[1];
  var adopt = function() {
    if (!joinName.trim()) { toast(t.error); return; }
    db.ref("adoptions/" + court.id + "/" + vk).set({ name: joinName.trim(), ts: Date.now() });
    logActivity("adopt", joinName.trim(), court.id);
    awardBadge("guardian", function(b) { setUnlockBadge(b); });
    toast(t.adopted || "Ești acum gardianul acestui teren!");
    setJoinName("");
  };
  var unadopt = function() {
    db.ref("adoptions/" + court.id + "/" + vk).remove();
    toast(t.success);
  };
  return React.createElement("div", { className: "card mt-2" },
    React.createElement("h4", { className: "mb-1" }, "🤝 ", t.adoptCourt || "Adoptă acest teren"),
    names.length > 0 && React.createElement("div", { className: "mb-1", style: { display: "flex", flexWrap: "wrap", gap: ".3rem", alignItems: "center" } },
      React.createElement("span", { className: "text-xs font-bold", style: { color: "var(--textSec)" } }, (t.guardiansOf || "Gardieni") + ":"),
      names.map(function(n, i) { return React.createElement("span", { key: i, className: "badge badge-green" }, "🛡️ ", n); })
    ),
    !isAdopted
      ? React.createElement("div", { className: "flex gap-1" },
          React.createElement("input", { placeholder: t.yourName || "Numele tău", value: joinName, onChange: function(e) { setJoinName(e.target.value); }, style: { flex: 1 } }),
          React.createElement("button", { className: "btn btn-green btn-sm", onClick: adopt }, t.adoptCourt || "Adoptă")
        )
      : React.createElement("div", null,
          React.createElement("p", { className: "text-sm mb-1", style: { color: "var(--green)", fontWeight: 600 } }, "🛡️ ", t.youAreGuardian || "Ești gardianul acestui teren"),
          React.createElement("button", { className: "btn btn-sm btn-outline", style: { color: "var(--red)", borderColor: "var(--red)" }, onClick: unadopt }, t.unadopt || "Renunță")
        ),
    unlockBadge && React.createElement(BadgeUnlockModal, { badge: unlockBadge, lang: lang, onClose: function() { setUnlockBadge(null); } })
  );
}
