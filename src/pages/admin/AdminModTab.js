import { db } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { askConfirm } from "./helpers.js";

/* ADMIN — MODERATION: delete any user-generated content. */
export function AdminModTab() {
  const fo = useFirebase("forum");
  const ga = useFirebase("gallery");
  const ev = useFirebase("events");
  const te = useFirebase("teams");
  const ac = useFirebase("activity");
  const gm = useFirebase("games");
  const del = path => askConfirm("Delete permanently?").then(ok => ok && db.ref(path).remove());
  const gameList = gm ? Object.entries(gm).flatMap(([cid, g]) =>
    Object.entries(g || {}).map(([gid, v]) => ({ id: cid + "/" + gid, ...v }))) : null;
  const sec = (title, obj, path, fmt) => {
    const list = (Array.isArray(obj) ? obj.slice() : obj ? Object.entries(obj).map(([id, v]) => ({ id, ...v })) : [])
      .sort((a, b) => (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0)).slice(0, 15);
    const total = Array.isArray(obj) ? obj.length : obj ? Object.keys(obj).length : 0;
    return React.createElement("div", { key: title, style: { marginBottom: "1.4rem" } },
      React.createElement("h3", { className: "a-sec" }, title + " (" + total + ")"),
      list.length === 0
        ? React.createElement("p", { style: { color: "#6B7280", fontSize: ".8rem" } }, "Empty")
        : list.map(it => React.createElement("div", { className: "a-row", key: it.id },
            React.createElement("div", { style: { minWidth: 0, flex: 1 } },
              React.createElement("div", { style: { fontSize: ".85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, fmt(it) || "—"),
              React.createElement("div", { style: { color: "#6B7280", fontSize: ".72rem" } },
                (it.userName || it.createdBy || it.name || "?") + " · " + (it.timestamp || it.createdAt ? new Date(it.timestamp || it.createdAt).toLocaleString() : ""))),
            React.createElement("button", { className: "a-del", onClick: () => del(path + "/" + it.id) }, "🗑"))));
  };
  return React.createElement("div", null,
    React.createElement("h2", null, "🛡️ Moderation"),
    React.createElement("p", { style: { color: "#6B7280", fontSize: ".8rem", marginBottom: "1rem" } },
      "Latest 15 of each. Deleting is immediate and permanent."),
    sec("💬 Forum", fo, "forum", x => x.text),
    sec("📸 Gallery / evidence", ga, "gallery", x => x.caption || x.courtName || "photo"),
    sec("📅 Events", ev, "events", x => x.title),
    sec("👥 Teams", te, "teams", x => (x.name || "") + (x.sport ? " · " + x.sport : "")),
    sec("⚽ Active games", gameList, "games", x => (x.sport || "game") + (x.note ? " · " + x.note : "")),
    sec("⚡ Activity feed", ac, "activity", x => x.type));
}
