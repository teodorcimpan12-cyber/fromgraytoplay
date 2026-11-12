import { useApp } from "./core.js";
import { useEffect, useRef, useState } from "../lib/react.js";
import { saveUserProfile } from "../lib/save-user-profile.js";

export function AuthModal({ onClose, initialMode }) {
  const { t, lang, toast } = useApp();
  const [mode, setMode] = useState(initialMode || "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const saveUser = saveUserProfile;
  const rcRef = useRef(null);
  useEffect(() => () => { try { rcRef.current && rcRef.current.clear(); } catch (e) {} }, []);
  const L3 = (ro, en, hu) => lang === "ro" ? ro : lang === "hu" ? hu : en;
  const welcome = u => toast("👋 " + L3("Bun venit", "Welcome", "Üdv") + ", " + ((u && (u.displayName || (u.email || "").split("@")[0])) || "") + "!");

  function friendlyErr(msg) {
    if (!msg) return "";
    if (msg.includes("operation-not-supported") || msg.includes("location.protocol"))
      return lang === "ro" ? "Google Sign-In necesită site-ul live. Accesează fromgreytoplay.netlify.app" : "Google Sign-In requires the live site. Visit fromgreytoplay.netlify.app";
    if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential") || msg.includes("INVALID_LOGIN"))
      return lang === "ro" ? "Email sau parolă incorectă" : "Incorrect email or password";
    if (msg.includes("email-already-in-use")) return lang === "ro" ? "Email deja înregistrat" : "Email already in use";
    if (msg.includes("weak-password")) return lang === "ro" ? "Parolă prea slabă (min. 6 caractere)" : "Password too weak (min. 6 chars)";
    if (msg.includes("too-many-requests")) return lang === "ro" ? "Prea multe încercări. Încearcă mai târziu." : "Too many attempts. Try again later.";
    if (msg.includes("network-request-failed")) return lang === "ro" ? "Eroare de rețea. Verifică conexiunea." : "Network error. Check connection.";
    if (msg.includes("invalid-email")) return L3("Email invalid", "Invalid email", "Érvénytelen e-mail");
    if (msg.includes("popup-closed-by-user") || msg.includes("cancelled-popup-request")) return "";
    if (msg.includes("unauthorized-domain")) return L3("Domeniul nu e autorizat în Firebase Auth.", "This domain isn't authorised in Firebase Auth.", "A domain nincs engedélyezve a Firebase Authban.");
    if (msg.includes("invalid-phone-number")) return L3("Număr invalid — folosește formatul +40…", "Invalid number — use the +40… format", "Érvénytelen szám — +40… formátum");
    if (msg.includes("invalid-verification-code")) return L3("Cod SMS greșit", "Wrong SMS code", "Hibás SMS-kód");
    return msg.replace(/^Firebase:\s*/, "").replace(/\s*\(auth\/[^)]+\)\.?$/, "");
  }

  const doLogin = () => {
    if (!email || !pw) { setErr(lang === "ro" ? "Completează email și parolă" : "Fill in email and password"); return; }
    setBusy(true); setErr("");
    firebase.auth().signInWithEmailAndPassword(email, pw)
      .then(({user}) => { saveUser(user); welcome(user); onClose(); })
      .catch(e => { setErr(friendlyErr(e.message)); setBusy(false); });
  };

  const doReset = () => {
    if (!email) { setErr(L3("Scrie emailul mai întâi, apoi apasă din nou.", "Type your email first, then tap again.", "Előbb írd be az e-mailt.")); return; }
    setBusy(true); setErr("");
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => { setBusy(false); toast("📧 " + L3("Link de resetare trimis pe " + email, "Reset link sent to " + email, "Visszaállító link elküldve: " + email)); })
      .catch(e => { setErr(friendlyErr(e.message)); setBusy(false); });
  };

  const doSignup = () => {
    if (!name || !email || !pw) { setErr(lang === "ro" ? "Completează toate câmpurile" : "Fill in all fields"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setErr(lang === "ro" ? "Email invalid" : "Invalid email"); return; }
    setBusy(true); setErr("");
    firebase.auth().createUserWithEmailAndPassword(email, pw)
      .then(({user}) => { user.updateProfile({ displayName: name }).catch(() => {}); saveUser(user, name); welcome({ displayName: name }); onClose(); })
      .catch(e => { setErr(friendlyErr(e.message)); setBusy(false); });
  };

  const doGoogle = () => {
    setBusy(true); setErr("");
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    firebase.auth().signInWithPopup(provider)
      .then(({user}) => { saveUser(user); welcome(user); onClose(); })
      .catch(e => {
        // Popup blocked / unsupported (mobile, in-app browsers) → redirect flow.
        if (/popup-blocked|operation-not-supported|web-storage-unsupported/.test(e.code || e.message || "")) {
          firebase.auth().signInWithRedirect(provider).catch(e2 => { setErr(friendlyErr(e2.message)); setBusy(false); });
          return;
        }
        setErr(friendlyErr(e.message)); setBusy(false);
      });
  };

  const doPhone1 = () => {
    if (!phone) { setErr(lang === "ro" ? "Introduceți numărul de telefon" : "Enter phone number"); return; }
    setBusy(true); setErr("");
    try {
      // One verifier per modal — re-creating it throws "already rendered".
      if (!rcRef.current) rcRef.current = new firebase.auth.RecaptchaVerifier("g2p-recaptcha", { size: "invisible" });
      firebase.auth().signInWithPhoneNumber(phone.replace(/\s+/g, ""), rcRef.current)
        .then(cr => { setConfirmResult(cr); setBusy(false); })
        .catch(e => {
          setErr(friendlyErr(e.message)); setBusy(false);
          try { rcRef.current.clear(); } catch (x) {}
          rcRef.current = null;
        });
    } catch(e) { setErr(friendlyErr(e.message)); setBusy(false); }
  };

  const doPhone2 = () => {
    if (!code || !confirmResult) return;
    setBusy(true); setErr("");
    confirmResult.confirm(code)
      .then(({user}) => { saveUser(user); welcome(user); onClose(); })
      .catch(e => { setErr(friendlyErr(e.message)); setBusy(false); });
  };

  const inpStyle = { width:"100%", boxSizing:"border-box", padding:".6rem .85rem", background:"rgba(255,255,255,.05)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:".9rem", fontFamily:"'Libre Franklin',sans-serif", marginBottom:".6rem", outline:"none", transition:"border-color .2s" };
  const svgUser = React.createElement("svg",{width:13,height:13,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.3,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),React.createElement("circle",{cx:12,cy:7,r:4}));
  const svgUserPlus = React.createElement("svg",{width:13,height:13,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.3,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"}),React.createElement("circle",{cx:8.5,cy:7,r:4}),React.createElement("line",{x1:20,y1:8,x2:20,y2:14}),React.createElement("line",{x1:23,y1:11,x2:17,y2:11}));
  const svgPhone = React.createElement("svg",{width:13,height:13,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.3,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("rect",{x:5,y:2,width:14,height:20,rx:2}),React.createElement("line",{x1:12,y1:18,x2:12.01,y2:18}));
  const googleG = React.createElement("svg",{width:18,height:18,viewBox:"0 0 24 24",style:{flexShrink:0}},React.createElement("path",{fill:"#4285F4",d:"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"}),React.createElement("path",{fill:"#34A853",d:"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"}),React.createElement("path",{fill:"#FBBC05",d:"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"}),React.createElement("path",{fill:"#EA4335",d:"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"}));
  const tabs = [
    { id:"login", label: lang==="ro"?"Intră":"Sign In", icon: svgUser },
    { id:"signup", label: lang==="ro"?"Cont nou":"Sign Up", icon: svgUserPlus },
    { id:"phone", label:"SMS", icon: svgPhone }
  ];

  return React.createElement("div", {
    className: "modal-overlay",
    onClick: e => { if (e.target === e.currentTarget) onClose(); }
  },
    React.createElement("div", { className: "modal", style: { maxWidth: 400, padding: "1.75rem" } },
      React.createElement("div", { style: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" } },
        React.createElement("div", { style: { display:"flex", alignItems:"center", gap:".7rem" } },
          React.createElement("div", { style: { width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,var(--green),var(--teal))", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 } },
            React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"#fff",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),React.createElement("circle",{cx:12,cy:7,r:4}))
          ),
          React.createElement("div", null,
            React.createElement("div", { style:{ fontWeight:700, fontFamily:"'Space Mono',monospace", fontSize:".92rem" } }, lang==="ro"?"Cont G2P":"G2P Account"),
            React.createElement("div", { style:{ fontSize:".7rem", color:"var(--textSec)", marginTop:1 } }, "fromgreytoplay.netlify.app")
          )
        ),
        React.createElement("button", { onClick: onClose, style:{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,.06)", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", color:"var(--textSec)" } },
          React.createElement("svg",{width:13,height:13,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.5,strokeLinecap:"round"},React.createElement("line",{x1:18,y1:6,x2:6,y2:18}),React.createElement("line",{x1:6,y1:6,x2:18,y2:18}))
        )
      ),
      React.createElement("div", { style:{ display:"flex", gap:".4rem", marginBottom:"1.25rem" } },
        tabs.map(tab => React.createElement("button", {
          key: tab.id,
          onClick: () => { setMode(tab.id); setErr(""); },
          style:{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:".3rem", padding:".5rem .4rem", border:"1px solid " + (mode===tab.id?"var(--green)":"var(--border)"), borderRadius:10, background: mode===tab.id?"rgba(16,185,129,.1)":"transparent", color: mode===tab.id?"var(--green)":"var(--textSec)", fontSize:".73rem", fontFamily:"'Space Mono',monospace", cursor:"pointer", transition:"all .18s", fontWeight: mode===tab.id?700:400 }
        }, tab.icon, tab.label))
      ),
      err && React.createElement("div", { style:{ background:"rgba(220,38,38,.1)", border:"1px solid rgba(220,38,38,.3)", borderRadius:8, padding:".6rem .8rem", color:"#F87171", fontSize:".82rem", marginBottom:".85rem", lineHeight:1.4 } }, err),
      React.createElement("button", {
        onClick: doGoogle, disabled: busy,
        style:{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:".7rem", padding:".72rem 1rem", border:"1px solid rgba(255,255,255,.13)", borderRadius:10, background:"rgba(255,255,255,.05)", color:"var(--text)", fontFamily:"'Libre Franklin',sans-serif", fontSize:".9rem", fontWeight:500, cursor: busy?"wait":"pointer", transition:"all .2s", marginBottom:".15rem" }
      }, googleG, lang==="ro"?"Continuă cu Google":"Continue with Google"),
      React.createElement("div", { style:{ display:"flex", alignItems:"center", gap:".7rem", margin:".9rem 0", color:"var(--textSec)", fontSize:".72rem" } },
        React.createElement("div", { style:{ flex:1, height:1, background:"var(--border)" } }),
        lang==="ro"?"sau":"or",
        React.createElement("div", { style:{ flex:1, height:1, background:"var(--border)" } })
      ),
      mode === "login" && React.createElement("div", null,
        React.createElement("input", { style: inpStyle, type:"email", autoComplete:"email", placeholder:"Email", value:email, onChange: e => setEmail(e.target.value) }),
        React.createElement("input", { style: inpStyle, type:"password", autoComplete:"current-password", placeholder: lang==="ro"?"Parolă":"Password", value:pw, onChange: e => setPw(e.target.value), onKeyDown: e => e.key==="Enter" && doLogin() }),
        React.createElement("button", { className:"btn btn-green btn-block", onClick:doLogin, disabled:busy }, busy?"…":(lang==="ro"?"Intră în cont":"Sign In")),
        React.createElement("button", { onClick: doReset, disabled: busy, style: { display:"block", margin:".7rem auto 0", background:"none", border:"none", color:"var(--textSec)", fontSize:".75rem", cursor:"pointer", textDecoration:"underline" } },
          L3("Ai uitat parola?", "Forgot password?", "Elfelejtett jelszó?"))
      ),
      mode === "signup" && React.createElement("div", null,
        React.createElement("input", { style: inpStyle, placeholder: lang==="ro"?"Numele tău":"Your name", value:name, onChange: e => setName(e.target.value) }),
        React.createElement("input", { style: inpStyle, type:"email", placeholder:"Email", value:email, onChange: e => setEmail(e.target.value) }),
        React.createElement("input", { style: inpStyle, type:"password", placeholder: lang==="ro"?"Parolă (min. 6 caractere)":"Password (min. 6 chars)", value:pw, onChange: e => setPw(e.target.value), onKeyDown: e => e.key==="Enter" && doSignup() }),
        React.createElement("button", { className:"btn btn-green btn-block", onClick:doSignup, disabled:busy }, busy?"…":(lang==="ro"?"Creează cont":"Create Account"))
      ),
      mode === "phone" && React.createElement("div", null,
        !confirmResult ? React.createElement("div", null,
          React.createElement("input", { style: inpStyle, type:"tel", placeholder:"+40 7XX XXX XXX", value:phone, onChange: e => setPhone(e.target.value) }),
          React.createElement("div", { id: "g2p-recaptcha" }),
          React.createElement("button", { className:"btn btn-green btn-block", onClick:doPhone1, disabled:busy }, busy?"…":(lang==="ro"?"Trimite SMS":"Send SMS"))
        ) : React.createElement("div", null,
          React.createElement("p", { style: { fontSize: ".85rem", marginBottom: ".5rem" } }, lang === "ro" ? "Introdu codul primit prin SMS:" : "Enter the SMS code:"),
          React.createElement("input", { style: inpStyle, type: "text", inputMode: "numeric", autoComplete: "one-time-code", placeholder: "123456", value: code, onChange: e => setCode(e.target.value),
            onKeyDown: e => e.key === "Enter" && doPhone2() }),
          React.createElement("button", { className: "btn btn-green btn-block", onClick: doPhone2, disabled: busy },
            busy ? "…" : (lang === "ro" ? "Verifică codul" : "Verify Code"))
        )
      )
    )
  );
}
