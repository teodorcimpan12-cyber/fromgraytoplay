import { db, useApp } from "./core.js";
import { ADMIN_UID } from "../data/constants.js";
import { useState } from "../lib/react.js";
import { saveUserProfile } from "../lib/save-user-profile.js";

export function AdminLogin({
  onAuth,
  onBack
}) {
  const { firebaseUser, signOut, isSherif, isAdmin } = useApp();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fail = m => { setErr(m); setBusy(false); };
  const authErr = e => /too-many-requests/.test(e.code || "") ? "Too many attempts — wait a minute." : /network/.test(e.code || "") ? "Network error." : "Wrong password for this account.";
  // Owner or a sheriff listed in settings/sherifs/{uid}.
  const done = u => {
    if (!u) return fail("Sign-in failed.");
    if (u.uid === ADMIN_UID) { saveUserProfile(u); onAuth(); return; }
    db.ref("settings/sherifs/" + u.uid).once("value").then(sn => {
      if (sn.exists()) { saveUserProfile(u); onAuth(); } else fail("This account is not the owner or a sheriff.");
    }).catch(() => fail("Could not check sheriff rights."));
  };
  const me = firebaseUser;
  const privileged = !!me && (isAdmin || isSherif);
  const hasPw = !!me && me.providerData.some(p => p.providerId === "password");
  const go = () => {
    if (!pw) return;
    setBusy(true); setErr("");
    if (privileged && hasPw) {
      me.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(me.email, pw)).then(() => done(me)).catch(e => fail(authErr(e)));
      return;
    }
    if (!email) return fail("Enter your email.");
    firebase.auth().signInWithEmailAndPassword(email.trim(), pw).then(r => done(r.user)).catch(e => fail(authErr(e)));
  };
  const google = () => {
    setBusy(true); setErr("");
    const pr = new firebase.auth.GoogleAuthProvider();
    pr.setCustomParameters({ prompt: "select_account" });
    const run = privileged && !hasPw ? me.reauthenticateWithPopup(pr).then(() => me) : firebase.auth().signInWithPopup(pr).then(r => r.user);
    run.then(done).catch(e => {
      if (!privileged && /popup-blocked|operation-not-supported/.test(e.code || "")) { firebase.auth().signInWithRedirect(pr); return; }
      fail(/popup-closed|cancelled/.test(e.code || "") ? "" : "Google sign-in failed.");
    });
  };
  const resetTo = privileged ? me.email : email.trim();
  const reset = () => {
    if (!resetTo) return setErr("Enter your email first.");
    firebase.auth().sendPasswordResetEmail(resetTo)
      .then(() => setErr("📧 Reset link sent to " + resetTo)).catch(() => setErr("Could not send reset email."));
  };
  const ghost = { background: "none", border: "none", color: "#6B7280", marginTop: ".6rem", cursor: "pointer", fontSize: ".8rem", display: "block", width: "100%" };
  const who = me && (me.email || me.phoneNumber || "another user");
  return React.createElement("div", { className: "admin-login" },
    React.createElement("div", { className: "admin-login-box" },
      React.createElement("h2", null, "ADMIN"),
      React.createElement("p", null, "From Grey to Play"),
      privileged && React.createElement("p", { style: { color: "#D1D5DB", fontSize: ".85rem" } },
        (isAdmin ? "Owner" : "Sheriff") + " · " + who + (hasPw ? " — confirm with your own password." : " — confirm with Google.")),
      me && !privileged && React.createElement("div", { className: "err", style: { background: "rgba(249,115,22,.12)", color: "#FDBA74" } },
        "Signed in as " + who + " (not owner or sheriff). ",
        React.createElement("a", { href: "#", style: { color: "#fff" }, onClick: e => { e.preventDefault(); signOut(); } }, "Sign out")),
      err && React.createElement("div", { className: "err" }, err),
      !privileged && !me && React.createElement("input", { type: "email", placeholder: "Your email", autoComplete: "email", value: email,
        onChange: e => setEmail(e.target.value), autoFocus: true }),
      (!privileged || hasPw) && (privileged || !me) && React.createElement("input", { type: "password", placeholder: privileged ? "Your password" : "Password", autoComplete: "current-password", value: pw,
        onChange: e => setPw(e.target.value), onKeyDown: e => { if (e.key === "Enter") go(); }, autoFocus: privileged }),
      (!privileged || hasPw) && (privileged || !me) && React.createElement("button", { className: "ab", onClick: go, disabled: busy }, busy ? "…" : "Log In"),
      (!me || (privileged && !hasPw)) && React.createElement("button", { className: "ab", onClick: google, disabled: busy,
        style: { marginTop: ".5rem", background: "#fff", color: "#1F2937" } }, "G  Continue with Google"),
      (!me || hasPw) && React.createElement("button", { onClick: reset, style: ghost }, "Forgot password?"),
      React.createElement("button", { onClick: onBack, style: ghost }, "Back")));
}
