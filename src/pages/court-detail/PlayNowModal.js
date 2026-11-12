import { db, useApp } from "../../app/core.js";
import { logActivity } from "../../lib/log-activity.js";
import { useState } from "../../lib/react.js";

/* === Play Now Modal (B2) === */
export function PlayNowModal({ court, onClose }) {
  const { t, toast, user } = useApp();
  const SPORTS = ["basketball","football","handball","tennis","multiuse"];
  const [sport, setSport] = useState("basketball");
  const [max, setMax] = useState(6);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = () => {
    setBusy(true);
    const name = user?.name || "Anonim";
    const ref = db.ref("games/" + court.id).push({
      sport, maxPlayers: max, note: note.trim(),
      createdBy: name, playerCount: 1, timestamp: Date.now()
    });
    logActivity("game", name, court.id);
    setTimeout(() => ref.remove(), 7200000);
    toast(t.gameCreated);
    setBusy(false);
    onClose();
  };
  return React.createElement("div", { className: "modal-overlay", onClick: onClose },
    React.createElement("div", { className: "modal", onClick: e => e.stopPropagation() },
      React.createElement("div", { className: "flex justify-between items-center mb-2" },
        React.createElement("h2", null, t.playNow),
        React.createElement("button", { onClick: onClose, style: { background:"none",border:"none",fontSize:"1.4rem",color:"var(--text)" } }, "✕")
      ),
      React.createElement("p", { className: "text-sm mb-2", style: { color:"var(--textSec)" } }, t.playNowSub, " — ", court.name),
      React.createElement("label", { className: "text-xs mb-1", style: { display:"block", fontWeight:600 } }, t.sport),
      React.createElement("div", { className: "flex gap-1 mb-2", style: { flexWrap:"wrap" } },
        SPORTS.map(s => React.createElement("button", {
          key: s,
          className: "btn btn-sm " + (sport === s ? "btn-green" : "btn-outline"),
          onClick: () => setSport(s)
        }, t[s]))
      ),
      React.createElement("label", { className: "text-xs mb-1", style: { display:"block", fontWeight:600 } }, t.maxPlayers),
      React.createElement("div", { className: "flex gap-1 mb-2", style: { flexWrap:"wrap" } },
        [2,4,6,8,10].map(n => React.createElement("button", {
          key: n,
          className: "btn btn-sm " + (max === n ? "btn-green" : "btn-outline"),
          onClick: () => setMax(n)
        }, n))
      ),
      React.createElement("input", {
        placeholder: t.gameNotePh,
        value: note, onChange: e => setNote(e.target.value),
        className: "mb-2"
      }),
      React.createElement("div", { className: "flex gap-1" },
        React.createElement("button", { className: "btn btn-green btn-block", onClick: submit, disabled: busy }, t.startGame),
        React.createElement("button", { className: "btn btn-outline", onClick: onClose }, t.cancel)
      )
    )
  );
}
