import { ACTIVE_CITY, COURTS_ALL, db, useApp } from "../../app/core.js";
import { LETTER_BASIS } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { deadlineState } from "../../lib/deadline-state.js";
import { logActivity } from "../../lib/log-activity.js";
import { useState } from "../../lib/react.js";

export function LettersTracker() {
  const { lang, toast } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const letters = useFirebase("letters");
  const [replying, setReplying] = useState(null);
  const [regNo, setRegNo] = useState("");
  const e = React.createElement;
  const list = letters ? Object.entries(letters).map(([id, x]) => Object.assign({ id }, x)).filter(x => x && x.city === ACTIVE_CITY && x.sentAt).sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt))) : [];
  const byCourt = {}; list.forEach(x => { byCourt[x.courtId] = (byCourt[x.courtId] || 0) + 1; });
  const top = Object.entries(byCourt).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const nameOf = id => (COURTS_ALL.find(c => c.id === id) || { name: id }).name;
  const daysLeft = x => { const b = LETTER_BASIS[x.basis] || LETTER_BASIS.og27, ds = deadlineState(x.sentAt, b.days); return ds ? ds.left : 0; };
  const save = x => {
    const r = { at: new Date().toISOString() }; if (regNo.trim()) r.regNo = regNo.trim().slice(0, 40);
    db.ref("letters/" + x.id + "/reply").set(r).then(() => { logActivity("cityReply", "", x.courtId); toast(L3("Mulțumim! Răspunsul e notat.", "Thanks! The reply is logged.", "Köszönjük! A válasz rögzítve.")); setReplying(null); setRegNo(""); })
      .catch(() => toast(L3("Nu s-a putut salva.", "Could not save.", "Nem sikerült menteni.")));
  };
  return e("div", { className: "card" },
    e("h3", { className: "mb-1" }, L3("Scrisori trimise către Primărie", "Letters sent to City Hall", "A Városházának küldött levelek")),
    e("p", { className: "text-sm mb-2", style: { color: "var(--textSec)" } }, L3("Fiecare scrisoare trimisă din pagina unui teren apare aici, cu termenul legal de răspuns: 30 de zile pentru o petiție (OG 27/2002), 10 zile pentru o cerere de informații (Legea 544/2001). Nu păstrăm nume sau adrese.",
      "Every letter sent from a court page shows up here with its legal answer deadline: 30 days for a petition (OG 27/2002), 10 days for an information request (Law 544/2001). We keep no names or addresses.",
      "Minden pályaoldalról küldött levél itt jelenik meg a törvényes válaszhatáridővel: petíciónál 30 nap (OG 27/2002), információkérésnél 10 nap (544/2001-es törvény). Neveket és címeket nem tárolunk.")),
    !list.length && e("p", { className: "text-sm" }, L3("Încă nicio scrisoare. Deschide un teren → ✉️ Scrisoare AI.", "No letters yet. Open a court → ✉️ AI letter.", "Még nincs levél. Nyiss meg egy pályát → ✉️ AI-levél.")),
    top.length > 0 && e("div", { className: "flex gap-1 mb-2", style: { flexWrap: "wrap" } }, top.map(([id, n]) => e("span", { key: id, className: "badge badge-green" }, nameOf(id), " · ", n))),
    list.slice(0, 40).map(x => {
      const d = daysLeft(x), b = LETTER_BASIS[x.basis] || LETTER_BASIS.og27;
      return e("div", { key: x.id, className: "lt-row" },
        e("a", { className: "lt-n", href: "#court-" + x.courtId }, nameOf(x.courtId)),
        e("span", { className: "badge" }, b.law),
        e("span", { className: "text-xs", style: { color: "var(--textSec)" } }, new Date(x.sentAt).toLocaleDateString(lang === "en" ? "en-GB" : lang === "hu" ? "hu-HU" : "ro-RO")),
        x.reply ? e("span", { className: "lt-due ok" }, "✓ ", L3("a răspuns", "replied", "válaszolt"), x.reply.regNo ? " · nr. " + x.reply.regNo : "")
          : e("span", { className: "lt-due" + (d < 0 ? " late" : "") }, d >= 0 ? L3("mai are ", "", "még ") + d + L3(" zile", " days left", " nap") : L3("termen depășit cu ", "overdue by ", "lejárt ") + (-d) + L3(" zile", " days", " napja")),
        !x.reply && (replying === x.id
          ? e("span", { className: "flex gap-1" }, e("input", { value: regNo, onChange: ev => setRegNo(ev.target.value), maxLength: 40, placeholder: L3("nr. de înregistrare (opțional)", "registration no. (optional)", "iktatószám (nem kötelező)"), style: { width: "12rem", padding: ".3rem .5rem" } }),
              e("button", { className: "btn btn-sm btn-green", onClick: () => save(x) }, "✓"))
          : e("button", { className: "btn btn-sm btn-outline", onClick: () => { setReplying(x.id); setRegNo(""); } }, L3("Primăria a răspuns", "City Hall replied", "A Városháza válaszolt"))));
    }));
}
