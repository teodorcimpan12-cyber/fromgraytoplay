import { ACTIVE_CITY, useApp } from "../../app/core.js";
import { SITE } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useState } from "../../lib/react.js";
import { copyText } from "../../lib/src-by-id.js";
import { verifyByCourt, verifyConsensus } from "../../lib/verify-by-court.js";
import { VerifyFlow } from "./VerifyFlow.js";

export function verifyLabel(cs, L3) {
  if (!cs) return null;
  const d = cs.at ? new Date(cs.at).toLocaleDateString("ro-RO") : "";
  const what = cs.exists === "no" ? L3("terenul nu mai există", "the court is gone", "a pálya már nincs meg") : cs.exists === "unsure" ? L3("nu e clar", "unclear", "nem egyértelmű")
    : cs.playable === "yes" ? L3("se poate juca", "playable", "játszható") : cs.playable === "partly" ? L3("se poate juca parțial", "partly playable", "részben játszható") : L3("nu se poate juca", "not playable", "nem játszható");
  if (cs.state === "verified") return "🙋 " + L3("Verificat de comunitate", "Verified by the community", "A közösség ellenőrizte") + " (" + cs.n + " " + L3("persoane", "people", "fő") + ", " + d + "): " + what;
  if (cs.state === "single") return "🙋 " + L3("Raportat de 1 persoană", "Reported by 1 person", "1 ember jelentette") + " (" + d + "): " + what + " · " + L3("mai trebuie o confirmare", "needs one more confirmation", "még egy megerősítés kell");
  return "🙋 " + cs.total + " " + L3("păreri diferite — mai trebuie o verificare", "different answers — one more check needed", "eltérő válasz — még egy ellenőrzés kell");
}
// Court detail: where the court's condition comes from, side by side, each with its date.
export function CourtSourcesCard({ court: c }) {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const all = useFirebase("verifications");
  const [open, setOpen] = useState(false);
  const cs = verifyConsensus(verifyByCourt(all)[c.id]);
  const e = React.createElement;
  const satL = c.sat ? "🛰️ " + L3("Satelit", "Satellite", "Műhold") + " (" + c.sat.at.slice(0, 7) + "): " + ({ ok: L3("pare întreg", "looks intact", "épnek látszik"), worn: L3("pare uzat", "looks worn", "kopottnak látszik"), gone: L3("nu se vede teren", "no court visible", "nem látszik pálya") }[c.sat.v] || "") : null;
  const pressL = c.stadium && c.src ? "📰 " + L3("Presă / surse publice", "Press / public sources", "Sajtó / nyilvános források") : null;
  const isMission = c.city === "sibiu" && !c.stadium && c.sat && (!cs || cs.state !== "verified");
  const share = () => { const u = SITE + "/?c=" + (c.city || ACTIVE_CITY) + "#court-" + c.id; copyText(u); };
  return e("div", { className: "vf-src" + (isMission ? " mission" : "") },
    isMission && e("div", { className: "vf-mis" }, "🎯 ", L3("Misiune: satelitul nu poate spune cum arată azi. Ajută-ne să verificăm.", "Mission: the satellite can't tell what it looks like today. Help us check.", "Küldetés: a műhold nem tudja megmondani, milyen ma. Segíts ellenőrizni.")),
    e("div", { className: "vf-src-l" },
      satL && e("span", null, satL), pressL && e("a", { href: c.src, target: "_blank", rel: "noopener" }, pressL),
      e("span", null, verifyLabel(cs, L3) || "🙋 " + L3("Comunitate: încă nicio verificare", "Community: no checks yet", "Közösség: még nincs ellenőrzés"))),
    e("div", { className: "flex gap-1", style: { flexWrap: "wrap", marginTop: ".5rem" } },
      e("button", { className: "btn btn-sm btn-green", onClick: () => setOpen(true) }, "🙋 ", L3("Ajută-ne să verificăm (60 s)", "Help us check (60 s)", "Segíts ellenőrizni (60 mp)")),
      e("button", { className: "btn btn-sm btn-outline", onClick: share }, "🔗 ", L3("Link pentru postare", "Link to post", "Link megosztáshoz"))),
    open && ReactDOM.createPortal(e(VerifyFlow, { court: c, onClose: () => setOpen(false) }), document.body));
}
