import { db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { logActivity } from "../../lib/log-activity.js";

/* === Active Games list shown inside CourtDetail (B2) === */
export function ActiveGames({ court }) {
  const { t, toast, user } = useApp();
  const raw = useFirebase("games/" + court.id);
  const games = raw ? Object.entries(raw).map(([id, g]) => ({ id, ...g })) : [];
  if (games.length === 0) return React.createElement("p", { className: "text-sm", style: { color:"var(--textSec)" } }, t.noGames);
  const join = (g) => {
    if (g.playerCount >= g.maxPlayers) { toast(t.gameFull); return; }
    db.ref("games/" + court.id + "/" + g.id + "/playerCount").transaction(v => (v || 0) + 1);
    logActivity("join", user?.name || "Anonim", court.id);
    toast(t.gameJoined);
  };
  return React.createElement("div", { className: "grid gap-1" },
    games.map(g => React.createElement("div", { key: g.id, className: "card", style: { padding:".6rem .9rem" } },
      React.createElement("div", { className: "flex justify-between items-center" },
        React.createElement("div", null,
          React.createElement("span", { className: "badge badge-green", style:{ marginRight:".4rem" } }, t[g.sport] || g.sport),
          React.createElement("span", { className: "text-xs", style:{ color:"var(--textSec)" } }, g.createdBy)
        ),
        React.createElement("div", { className: "flex items-center gap-1" },
          React.createElement("span", { className: "barlow", style:{ fontSize:"1rem", fontWeight:700 } },
            g.playerCount, "/", g.maxPlayers, " ", t.players),
          React.createElement("button", {
            className: "btn btn-green btn-sm",
            onClick: () => join(g),
            disabled: g.playerCount >= g.maxPlayers,
            style: { opacity: g.playerCount >= g.maxPlayers ? .5 : 1 }
          }, t.joinGame)
        )
      ),
      g.note ? React.createElement("p", { className: "text-xs mt-1", style:{ color:"var(--textSec)" } }, g.note) : null
    ))
  );
}
