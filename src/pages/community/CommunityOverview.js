import { ACTIVE_CITY, db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { activityMsg } from "../../lib/activity-msg.js";
import { activityCity, realActivity } from "../../lib/log-activity.js";
import { anonName, tsOf } from "../../lib/next-lang.js";
import { useEffect, useState } from "../../lib/react.js";
import { relTime } from "../../lib/rel-time.js";
import { communityTabLabel, isOwnerName } from "./helpers.js";

// One live card per tab. Gallery photos are heavy (base64), so only the newest one is read.
export function CommunityOverview({ go, purpose }) {
  const { t, lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const activity = useFirebase("activity"), pixels = useFirebase("pixels"), forum = useFirebase("forum"), events = useFirebase("events"),
    teams = useFirebase("teams"), lb = useFirebase("leaderboard"), presence = useFirebase("presence");
  const [photo, setPhoto] = useState(undefined);
  useEffect(() => {
    const ref = db.ref("gallery").limitToLast(1);
    const h = s => { const v = s.val(); const k = v && Object.keys(v)[0]; setPhoto(k ? v[k] : null); };
    ref.on("value", h, () => setPhoto(null));
    return () => ref.off("value", h);
  }, []);
  const vals = o => o ? Object.keys(o).map(k => Object.assign({ id: k }, o[k])) : [];
  const acts = vals(activity).filter(a => realActivity(a) && activityCity(a) === ACTIVE_CITY).sort((a, b) => tsOf(b) - tsOf(a));
  const day = Date.now() - 86400000;
  const today = acts.filter(a => tsOf(a) > day).length;
  const posts = vals(forum).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const upcoming = vals(events).filter(ev => !ev.date || new Date(ev.date).getTime() > Date.now() - 86400000).sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
  const tms = vals(teams), top = vals(lb).filter(u => !isOwnerName(u.name)).sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 3);
  const online = presence ? Object.keys(presence).length : 0;
  const px = pixels ? Object.keys(pixels).length : 0;
  const e = React.createElement;
  const Card = (tb, body, cta, extra) => e("button", { key: tb, className: "cm-card" + (extra || ""), onClick: () => go(tb) },
    e("span", { className: "cm-k" }, communityTabLabel(tb, t)),
    e("span", { className: "cm-p" }, purpose[tb]),
    e("span", { className: "cm-live" }, body),
    e("span", { className: "cm-cta" }, cta + " →"));
  const empty = s => e("i", { className: "cm-empty" }, s);
  return e("div", null,
    e("div", { className: "cm-strip" },
      e("span", null, e("b", { className: "live-dot" }), online + " " + L3("online acum", "online now", "online most")),
      e("span", null, "⚡ " + today + " " + L3("acțiuni în ultimele 24 h", "actions in the last 24 h", "művelet az elmúlt 24 órában")),
      e("span", null, "🏆 " + vals(lb).filter(u => !isOwnerName(u.name)).length + " " + L3("în clasament", "on the leaderboard", "a ranglistán"))),
    e("div", { className: "cm-grid" },
      Card("activity", acts.length
        ? e("span", { className: "cm-list" }, acts.slice(0, 3).map(a => e("span", { key: a.id }, activityMsg(a, t), e("small", null, " · " + relTime(a.timestamp, lang)))))
        : empty(L3("Liniște. Fă tu prima mișcare.", "Quiet. Make the first move.", "Csend. Tedd meg az első lépést.")), L3("Vezi fluxul", "See the feed", "Hírfolyam"), " wide"),
      Card("events", upcoming.length
        ? e("span", null, e("b", null, upcoming[0].title), e("small", null, (upcoming[0].date || "") + (upcoming[0].location ? " · " + upcoming[0].location : "")))
        : empty(L3("Niciun meci programat încă.", "No game scheduled yet.", "Még nincs meccs kiírva.")), upcoming.length ? L3("Vin și eu", "I'm in", "Ott leszek") : L3("Organizează primul meci — 2 minute", "Organise the first game — 2 minutes", "Szervezd meg az első meccset — 2 perc")),
      Card("forum", posts.length
        ? e("span", null, e("b", null, posts[0].title), e("small", null, posts.length + " " + L3("discuții", "threads", "téma")))
        : empty(L3("Echipa a lăsat un mesaj de bun venit.", "The team left a welcome note.", "A csapat üdvözlő üzenetet hagyott.")), posts.length ? L3("Intră în discuție", "Join in", "Szólj hozzá") : L3("Scrie prima idee", "Post the first idea", "Írd meg az első ötletet")),
      Card("pixel", e("span", null, e("b", { className: "cm-num" }, px), e("small", null, " / 2304 " + L3("pixeli pictați", "pixels painted", "kifestett pixel"))), L3("Pune un pixel", "Place a pixel", "Tegyél egy pixelt")),
      Card("gallery", photo
        ? e("span", { className: "cm-photo" }, e("img", { src: photo.img, alt: photo.caption || t.gallery, loading: "lazy" }), e("small", null, anonName(photo.author || "Anonim")))
        : empty(photo === undefined ? "…" : L3("Nicio poză încă. Terenul tău arată cum arată.", "No photos yet. Show us your court.", "Még nincs fotó. Mutasd meg a pályádat.")), L3("Adaugă o poză", "Add a photo", "Tölts fel fotót")),
      Card("teams", tms.length
        ? e("span", null, e("b", { className: "cm-num" }, tms.length), e("small", null, " " + L3("echipe", "teams", "csapat")))
        : empty(L3("Nicio echipă încă. Cartierul tău poate fi primul.", "No teams yet. Your area can be first.", "Még nincs csapat. A te környéked lehet az első.")), tms.length ? L3("Vezi echipele", "See the teams", "Csapatok") : L3("Fă prima echipă", "Start the first team", "Alapítsd meg az elsőt")),
      Card("leaderboard", top.length
        ? e("span", { className: "cm-list" }, top.map((u, i) => e("span", { key: i }, ["🥇", "🥈", "🥉"][i] + " " + anonName(u.name || "User"), e("small", null, " · " + (u.points || 0) + " pts"))))
        : empty(L3("Clasamentul așteaptă primul punct.", "The board is waiting for its first point.", "A ranglista az első pontra vár.")), L3("Vezi clasamentul", "See the board", "Ranglista"))));
}
