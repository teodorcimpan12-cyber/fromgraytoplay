import { useApp } from "./core.js";
import { useState } from "../lib/react.js";

/* === Admin Error Boundary === */
/* === Auth Modal (public sign-in/sign-up) === */
export function ChangePasswordModal({ onClose }) {
  const { lang, toast } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const u = firebase.auth().currentUser;
  const hasPw = !!u && u.providerData.some(p => p.providerId === "password");
  const [cur, setCur] = useState(""), [nw, setNw] = useState(""), [nw2, setNw2] = useState("");
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const inp = { width: "100%", boxSizing: "border-box", padding: ".6rem .85rem", background: "rgba(255,255,255,.05)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "1rem", marginBottom: ".6rem" };
  const save = () => {
    if (!cur || !nw) return setErr(L3("Completează ambele parole.", "Fill in both passwords.", "Töltsd ki mindkét jelszót."));
    if (nw.length < 6) return setErr(L3("Parola nouă: minim 6 caractere.", "New password: at least 6 characters.", "Új jelszó: legalább 6 karakter."));
    if (nw !== nw2) return setErr(L3("Parolele noi nu coincid.", "The new passwords don't match.", "Az új jelszavak nem egyeznek."));
    setBusy(true); setErr("");
    u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, cur))
      .then(() => u.updatePassword(nw))
      .then(() => { toast("🔑 " + L3("Parola a fost schimbată", "Password changed", "Jelszó módosítva")); onClose(); })
      .catch(e => { setBusy(false); setErr(/wrong-password|invalid-credential|INVALID_LOGIN/.test((e.code || "") + (e.message || "")) ? L3("Parola actuală e greșită.", "Current password is wrong.", "A jelenlegi jelszó hibás.") : /too-many/.test(e.code || "") ? L3("Prea multe încercări. Mai încearcă peste un minut.", "Too many attempts. Try again in a minute.", "Túl sok próbálkozás.") : L3("Nu s-a putut schimba parola.", "Could not change the password.", "Nem sikerült módosítani.")); });
  };
  const reset = () => firebase.auth().sendPasswordResetEmail(u.email)
    .then(() => { toast("📧 " + L3("Link de resetare trimis pe ", "Reset link sent to ", "Visszaállító link: ") + u.email); onClose(); })
    .catch(() => setErr(L3("Nu s-a putut trimite emailul.", "Could not send the email.", "Nem sikerült elküldeni.")));
  return React.createElement("div", { className: "modal-overlay", onClick: e => { if (e.target === e.currentTarget) onClose(); } },
    React.createElement("div", { className: "modal", style: { maxWidth: 400, padding: "1.5rem" } },
      React.createElement("h3", { style: { marginBottom: ".9rem" } }, "🔑 " + L3("Schimbă parola", "Change password", "Jelszó módosítása")),
      !u ? null : !hasPw ? React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)", marginBottom: "1rem" } },
        L3("Contul tău folosește Google sau numărul de telefon, deci nu are parolă la noi. Parola o schimbi din contul Google.",
           "Your account uses Google or a phone number, so it has no password here. Change it in your Google account.",
           "A fiókod Google-t vagy telefonszámot használ, ezért itt nincs jelszava.")) :
      React.createElement(React.Fragment, null,
        React.createElement("input", { style: inp, type: "password", autoComplete: "current-password", placeholder: L3("Parola actuală", "Current password", "Jelenlegi jelszó"), value: cur, onChange: e => setCur(e.target.value) }),
        React.createElement("input", { style: inp, type: "password", autoComplete: "new-password", placeholder: L3("Parola nouă (min. 6)", "New password (min. 6)", "Új jelszó (min. 6)"), value: nw, onChange: e => setNw(e.target.value) }),
        React.createElement("input", { style: inp, type: "password", autoComplete: "new-password", placeholder: L3("Repetă parola nouă", "Repeat new password", "Új jelszó újra"), value: nw2, onChange: e => setNw2(e.target.value), onKeyDown: e => e.key === "Enter" && save() }),
        err && React.createElement("p", { className: "text-sm", style: { color: "var(--red)", marginBottom: ".6rem" } }, err),
        React.createElement("button", { className: "btn btn-green btn-block", onClick: save, disabled: busy }, busy ? "…" : L3("Salvează parola", "Save password", "Mentés")),
        React.createElement("button", { onClick: reset, style: { background: "none", border: "none", color: "var(--textSec)", fontSize: ".85rem", marginTop: ".75rem", cursor: "pointer", width: "100%", minHeight: 40 } },
          L3("Nu mai știi parola actuală? Primești un link pe email", "Forgot your current password? Get a link by email", "Elfelejtetted? Link e-mailben"))),
      React.createElement("button", { className: "btn btn-outline btn-block", style: { marginTop: ".5rem" }, onClick: onClose }, L3("Închide", "Close", "Bezárás"))));
}
