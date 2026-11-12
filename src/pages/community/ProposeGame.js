import { COURTS, db, g2pSfx, useApp } from "../../app/core.js";
import { anonName } from "../../lib/next-lang.js";
import { useState } from "../../lib/react.js";

// Only sheriffs publish events, so the empty Events tab lets anyone propose a game: it lands in the forum.
export function ProposeGame({ more }) {
  const { lang, toast, user } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ court: COURTS[0] ? COURTS[0].id : "", date: "", time: "17:00", sport: "basket" });
  const [sent, setSent] = useState(false);
  const sports = { basket: "🏀 " + L3("Baschet", "Basketball", "Kosárlabda"), fotbal: "⚽ " + L3("Fotbal", "Football", "Foci"), volei: "🏐 " + L3("Volei", "Volleyball", "Röplabda"), tenis: "🎾 " + L3("Tenis", "Tennis", "Tenisz") };
  const send = () => {
    const c = COURTS.find(x => x.id === f.court);
    if (!c || !f.date) { toast(L3("Alege terenul și ziua.", "Pick the court and the day.", "Válaszd ki a pályát és a napot.")); return; }
    db.ref("forum").push({
      title: "📅 " + sports[f.sport] + " · " + c.name + " · " + f.date + " " + f.time,
      body: L3("Propun un meci aici. Cine vine? Scrie în răspunsuri.", "I'm proposing a game here. Who's in? Reply below.", "Meccset javaslok itt. Ki jön? Írj alább."),
      category: c.neighbourhood || "general", neighbourhood: c.neighbourhood || "general", type: "proposal",
      author: anonName(user?.name || "Anonim"), date: new Date().toISOString(), upvotes: 0, downvotes: 0, pinned: false, replies: {}
    }).then(() => { setSent(true); g2pSfx("whistle"); toast("✓ " + L3("Propunere trimisă în Forum.", "Proposal posted in the Forum.", "Javaslat elküldve a Fórumba.")); })
      .catch(() => toast(L3("Nu s-a putut trimite.", "Could not send.", "Nem sikerült elküldeni.")));
  };
  const e = React.createElement;
  return e("div", { className: "card cm-emptycard" },
    e("div", { style: { fontSize: "2.2rem" } }, "📅"),
    e("h3", null, more ? L3("Vrei încă un meci?", "Want another game?", "Még egy meccs?") : L3("Niciun meci programat încă.", "No game scheduled yet.", "Még nincs meccs kiírva.")),
    sent ? e("p", null, L3("Gata! Propunerea ta e în Forum. Echipa o mută aici când e confirmată.", "Done! Your proposal is in the Forum. The team moves it here once it is confirmed.", "Kész! A javaslatod a Fórumban van. A csapat ide teszi, ha megerősítették."))
    : !open ? e(React.Fragment, null,
        e("p", null, L3("Alegi terenul, ziua și ora. Restul se adună singur.", "Pick the court, the day and the time. People will show up.", "Válaszd ki a pályát, a napot és az időt. A többi jön magától.")),
        e("button", { className: "btn btn-green", onClick: () => setOpen(true) }, "＋ " + L3("Organizează primul meci — 2 minute", "Organise the first game — 2 minutes", "Szervezd meg az első meccset — 2 perc")))
    : e("div", { className: "cm-propose" },
        e("select", { value: f.sport, onChange: ev => setF(o => ({ ...o, sport: ev.target.value })), "aria-label": L3("Sport", "Sport", "Sport") }, Object.keys(sports).map(k => e("option", { key: k, value: k }, sports[k]))),
        e("select", { value: f.court, onChange: ev => setF(o => ({ ...o, court: ev.target.value })), "aria-label": L3("Teren", "Court", "Pálya") }, COURTS.map(c => e("option", { key: c.id, value: c.id }, c.name))),
        e("div", { className: "flex gap-1" },
          e("input", { type: "date", value: f.date, min: new Date().toISOString().slice(0, 10), onChange: ev => setF(o => ({ ...o, date: ev.target.value })), "aria-label": L3("Ziua", "Day", "Nap"), style: { flex: 1 } }),
          e("input", { type: "time", value: f.time, onChange: ev => setF(o => ({ ...o, time: ev.target.value })), "aria-label": L3("Ora", "Time", "Időpont"), style: { width: 120 } })),
        e("div", { className: "flex gap-1", style: { justifyContent: "center" } },
          e("button", { className: "btn btn-outline btn-sm", onClick: () => setOpen(false) }, L3("Renunță", "Cancel", "Mégse")),
          e("button", { className: "btn btn-green btn-sm", onClick: send }, "📣 " + L3("Propune meciul", "Propose the game", "Meccs javaslása")))));
}
