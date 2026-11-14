import { isMinimal } from "../lib/minimal.js";
import { AdminLogin } from "./AdminLogin.js";
import { AmbientLight } from "./AmbientLight.js";
import { AuthModal } from "./AuthModal.js";
import { BigCelebration } from "./BigCelebration.js";
import { ChangePasswordModal } from "./ChangePasswordModal.js";
import { CommandPalette } from "./CommandPalette.js";
import { DemoLayer } from "./DemoLayer.js";
import { DemoRemote } from "./DemoRemote.js";
import { EggHub } from "./EggHub.js";
import { Footer } from "./Footer.js";
import { FunEggs } from "./FunEggs.js";
import { InstallBanner } from "./InstallBanner.js";
import { Mascot } from "./Mascot.js";
import { MayorMode } from "./MayorMode.js";
import { Navbar } from "./Navbar.js";
import { Onboarding } from "./Onboarding.js";
import { SecretKeys } from "./SecretKeys.js";
import { SignupNudge } from "./SignupNudge.js";
import { ThemeFx } from "./ThemeFx.js";
import { AdminBoundary, AppCtx, COURTS, DEMO_ON, DEMO_REMOTE, DemoRemoteBoundary, PageBoundary, db, useApp } from "./core.js";
import { QuickReportModal } from "../components/QuickReportModal.js";
import { ADMIN_UID, MENTORS, NICKNAMES, PAGE_IDS } from "../data/constants.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { T } from "../i18n/strings.js";
import { animOff, g2pEgg } from "../lib/g2p-egg.js";
import { getVoterKey } from "../lib/get-voter-key.js";
import { anonName } from "../lib/next-lang.js";
import { useCallback, useEffect, useRef, useState } from "../lib/react.js";
import { applyAccent, saveUserProfile } from "../lib/save-user-profile.js";
import { AboutPage } from "../pages/about/AboutPage.js";
import { AdminPanel } from "../pages/admin/AdminPanel.js";
import { AssociationPage } from "../pages/association/AssociationPage.js";
import { CommunityPage } from "../pages/community/CommunityPage.js";
import { CourtsPage } from "../pages/courts/CourtsPage.js";
import { HelpPage } from "../pages/help/HelpPage.js";
import { HomePage } from "../pages/home/HomePage.js";
import { ImpactPage } from "../pages/impact/ImpactPage.js";
import { PetitionPage } from "../pages/petition/PetitionPage.js";
import { PressPage } from "../pages/press/PressPage.js";
import { ProfilePage } from "../pages/profile/ProfilePage.js";
import { ReportsPage } from "../pages/reports/ReportsPage.js";

export function pageFromHash() {
  const h = location.hash.replace(/^#\/?/, "");
  if (h.indexOf("court-") === 0) return "courts";
  if (h === "raporteaza") return "home"; // contract with the mobile shell: ReportHashListener opens the report form
  if (!h && /^\/press\/?$/.test(location.pathname)) return "press";
  return PAGE_IDS.indexOf(h) >= 0 ? h : "home";
} // TODO: HU review

/* === #5 HeatWatcher — global "join them" toast on fresh check-ins.
   Mounted once in App; max 1 toast / 3 minutes; skips pre-mount events. === */
export function HeatWatcher() {
  var app = useApp();
  var tRef = useRef(app.t), toastRef = useRef(app.toast), userRef = useRef(app.user);
  tRef.current = app.t; toastRef.current = app.toast; userRef.current = app.user;
  useEffect(function () {
    var mounted = Date.now();
    var lastToast = 0;
    var ref = db.ref("activity").limitToLast(1);
    var fn = function (snap) {
      var a = snap.val();
      if (!a) return;
      var ts = typeof a.timestamp === "number" ? a.timestamp : (Date.parse(a.timestamp || "") || 0);
      if (ts < mounted) return;
      if (a.type !== "check-in" && a.type !== "checkin") return;
      var me = anonName((userRef.current && userRef.current.name) || "");
      if (me && me !== "Anonim" && a.userName === me) return;
      if (Date.now() - lastToast < 180000) return;
      var c = COURTS.find(function (x) { return x.id === a.courtId; });
      if (!c) return;
      lastToast = Date.now();
      var t = tRef.current;
      toastRef.current("🏀 " + (a.userName || "Anon") + " " + t.heatJoin + " " + c.name + " — " + t.heatJoinCta);
    };
    ref.on("child_added", fn);
    return function () { ref.off("child_added", fn); };
  }, []);
  return null;
}
/* === Toast === */
export function Toast({
  msg,
  onClose,
  ms
}) {
  useEffect(() => {
    const t = setTimeout(onClose, ms || 3000);
    return () => clearTimeout(t);
  }, [msg]);
  return /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, msg);
}
/* Astra mobile shell: phones (narrow or touch) get a static hero, no three.js, no blur/particles. */
export function isPhone() {
  try { return window.matchMedia("(max-width:600px), (pointer:coarse)").matches; } catch (e) { return false; }
}
// "#raporteaza" (QR on the pitch slide, mobile shell button) opens the report form on any page.
// Reports sent from here are tagged demo:true. The hash is cleared once the form is open.
export function ReportHashListener() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const check = () => {
      if (location.hash !== "#raporteaza") return;
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      setOpen(true);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);
  return open ? React.createElement(QuickReportModal, { demo: true, onClose: () => setOpen(false) }) : null;
}
export function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("g2p_lang") || "ro");
  const [theme, setTheme] = useState(() => localStorage.getItem("g2p_theme") || (window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"));
  const [page, setPageRaw] = useState(pageFromHash);
  const [wipe, setWipe] = useState(0);
  const [cmd, setCmd] = useState(false);
  const [mayor, setMayor] = useState(false);
  useEffect(() => { if (mayor) g2pEgg("fixit"); }, [mayor]);
  // Season 3 easter egg: type "fixit" anywhere (outside form fields) → Mayor Mode.
  useEffect(() => {
    let buf = "";
    const h = e => {
      const el = e.target;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (!e.key || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      buf = (buf + e.key.toLowerCase()).slice(-5);
      if (buf === "fixit") { buf = ""; setMayor(true); }
    };
    const open = () => setMayor(true);
    window.addEventListener("keydown", h);
    window.addEventListener("g2p-mayor", open);
    return () => {
      window.removeEventListener("keydown", h);
      window.removeEventListener("g2p-mayor", open);
    };
  }, []);
  // Admin "rule everything": live site settings (maintenance, banner, flags,
  // featured court, accent, broadcast) — every client reacts in realtime.
  const settings = useFirebase("settings");
  // setPage keeps the URL hash in sync so every page (and shared court link)
  // is bookmarkable; pushState avoids re-triggering the hashchange listener.
  const setPage = useCallback(p => {
    setPageRaw(p);
    setWipe(w => w + 1);
    const h = p === "home" ? "" : "#" + p;
    // Leaving /press (the QR address) for another page goes back to the root path.
    const onPress = /^\/press\/?$/.test(location.pathname);
    if (location.hash !== h || (onPress && p !== "press")) history.pushState(null, "", h ? (onPress ? "/" + location.search + h : h) : (onPress ? "/" : location.pathname) + location.search);
  }, []);
  const [toastMsg, setToastMsg] = useState("");
  const [toastMs, setToastMs] = useState(3000);
  const [authOpen, setAuthOpen] = useState(false);
  const [onboard, setOnboard] = useState(() => !/^#(raporteaza|court-)/.test(location.hash) && !localStorage.getItem("g2p_ob")) // deep links (QR, shared court) open straight on their target;
  const [adminMode, setAdminMode] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(() => firebase.auth().currentUser);
  // authReady: Firebase has restored (or ruled out) the saved session. Until
  // then we neither show "Sign in" nor the admin password screen.
  const [authReady, setAuthReady] = useState(() => !!firebase.auth().currentUser);
  useEffect(() => {
    try { localStorage.removeItem("g2p_user"); } catch (e) {} // legacy password-less fake login
    return firebase.auth().onAuthStateChanged(u => {
      setFirebaseUser(u);
      setAuthReady(true);
      if (u) saveUserProfile(u);
    });
  }, []);
  // App-level user = the real Firebase account merged with its users/{uid} profile.
  const fbProfile = useFirebase(firebaseUser ? "users/" + firebaseUser.uid : null);
  const user = firebaseUser ? Object.assign({
    id: firebaseUser.uid,
    name: firebaseUser.displayName || (firebaseUser.email || firebaseUser.phoneNumber || "user").split("@")[0],
    email: firebaseUser.email || firebaseUser.phoneNumber || "",
    points: 0,
    badges: ["🌱"]
  }, fbProfile || {}, { id: firebaseUser.uid }) : null;
  const setUser = () => {};
  const signOut = useCallback(() => {
    firebase.auth().signOut().then(() => {
      setToastMs(3000);
      setToastMsg("👋 " + (T[lang] && T[lang].signOut ? T[lang].signOut + " ✓" : "Signed out"));
    }).catch(() => {});
  }, [lang]);
  const openAuth = useCallback(mode => setAuthOpen(mode === "signup" ? "signup" : true), []);
  useEffect(() => {
    localStorage.setItem("g2p_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    localStorage.setItem("g2p_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    // Status bar / browser chrome match the nav bar (--navBg), not the brand accent.
    const tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", theme === "dark" ? "#0F172A" : "#FFFFFF");
  }, [theme]);
  useEffect(() => {
    window.scrollTo(0, 0);
    const bar = document.getElementById("g2p-progress");
    if (bar) bar.style.transform = "scaleX(0)";
  }, [page]);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  // Show-off: ripple micro-interaction on every button, via one delegated listener.
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const h = e => {
      const b = e.target.closest && e.target.closest(".btn,.h3d-btn,.tabs button");
      if (!b) return;
      const r = b.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 1.2;
      const s = document.createElement("span");
      s.className = "ripple";
      s.style.width = s.style.height = d + "px";
      s.style.left = e.clientX - r.left - d / 2 + "px";
      s.style.top = e.clientY - r.top - d / 2 + "px";
      b.appendChild(s);
      setTimeout(() => s.remove(), 600);
    };
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, []);
  // Pro-max: cursor spotlight on cards + magnetic CTA buttons (desktop only).
  useEffect(() => {
    if (!window.matchMedia) return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches || window.matchMedia("(hover: none)").matches) return;
    const spot = e => {
      const c = e.target.closest && e.target.closest(".card,.stat-tile");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    };
    const magnet = e => {
      const b = e.target.closest && e.target.closest(".h3d-btn,.btn-green");
      if (!b || b.dataset.mag) return;
      b.dataset.mag = "1";
      const mv = ev => {
        const r = b.getBoundingClientRect();
        const dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2);
        b.style.transform = "translate(" + (dx * 0.18).toFixed(1) + "px," + (dy * 0.18).toFixed(1) + "px)";
      };
      const lv = () => { b.style.transform = ""; };
      b.addEventListener("mousemove", mv);
      b.addEventListener("mouseleave", lv);
    };
    document.addEventListener("mousemove", spot, { passive: true });
    document.addEventListener("mouseover", magnet);
    return () => {
      document.removeEventListener("mousemove", spot);
      document.removeEventListener("mouseover", magnet);
    };
  }, []);
  // Command palette hotkey.
  useEffect(() => {
    const h = e => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setCmd(v => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  // Live presence: register this visitor, auto-cleanup on disconnect.
  useEffect(() => {
    try {
      const ref = db.ref("presence/" + getVoterKey());
      ref.set(true);
      ref.onDisconnect().remove();
      const bye = () => { try { ref.remove(); } catch (e) {} };
      window.addEventListener("beforeunload", bye);
      return () => { window.removeEventListener("beforeunload", bye); bye(); };
    } catch (e) { /* offline */ }
  }, []);
  // Admin site colours (settings/accent + settings/accent2). Independent of the
  // announcement banner, which has its own fixed colour.
  useEffect(() => {
    if (!settings) return; // not loaded yet — keep the cached colour from <head>
    applyAccent(/^#[0-9a-fA-F]{6}$/.test(settings.accent || "") ? settings.accent : "",
      /^#[0-9a-fA-F]{6}$/.test(settings.accent2 || "") ? settings.accent2 : "");
  }, [settings, settings && settings.accent, settings && settings.accent2]);
  // Admin effects kill-switch (settings/flags/effects === false).
  // The visitor's own "Animații" switch (footer) turns the whole site into its minimal version:
  // no decorative motion (no-fx) plus the calm layout rules under html.minimal.
  useEffect(() => {
    const apply = () => {
      const mine = animOff();
      const off = mine || !!(settings && settings.flags && settings.flags.effects === false);
      const r = document.documentElement;
      r.classList.toggle("no-fx", off);
      r.classList.toggle("minimal", mine);
    };
    apply();
    window.addEventListener("g2p:anim", apply);
    return () => window.removeEventListener("g2p:anim", apply);
  }, [settings && settings.flags && settings.flags.effects]);
  useEffect(() => {
    const h = e => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setAdminMode(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    if (location.hash === "#/admin") setAdminMode(true);
    const h = () => {
      if (location.hash === "#/admin") {
        setAdminMode(true);
        return;
      }
      setPageRaw(pageFromHash());
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  // Toast auto-hides inside <Toast> (ms, default 3s); a new message restarts the timer.
  const toast = useCallback((msg, ms) => {
    setToastMs(ms || 3000);
    setToastMsg(msg);
  }, []);
  // Admin broadcast: one realtime toast per message to every visitor.
  // Only consumed once the visitor can actually see it (not during onboarding,
  // maintenance or inside the admin panel) and only while < 24h old.
  const bc = settings && settings.broadcast;
  const bcVisible = !onboard && !adminMode && !(settings && settings.maintenance);
  useEffect(() => {
    if (!bc || !bc.ts || !bc.text || !bcVisible) return;
    if (Date.now() - bc.ts > 864e5) return;
    if (bc.ts <= +(localStorage.getItem("g2p_bc_seen") || 0)) return;
    localStorage.setItem("g2p_bc_seen", String(bc.ts));
    toast("📢 " + bc.text, 8000);
  }, [bc && bc.ts, bcVisible]);
  // Visitors can dismiss the current announcement banner (per text).
  const [bannerX, setBannerX] = useState(() => localStorage.getItem("g2p_banner_x") || "");
  const t = T[lang];
  const isAdmin = !!(firebaseUser && firebaseUser.uid === ADMIN_UID);
  const sherifData = useFirebase(firebaseUser ? "settings/sherifs/" + firebaseUser.uid : null);
  const isSherif = !!sherifData && !isAdmin;
  const isPrivileged = isAdmin || isSherif;
  // Tell a sheriff once, on this device, that they were promoted.
  useEffect(() => {
    if (!isSherif || !firebaseUser) return;
    const k = "g2p_sherif_ack_" + firebaseUser.uid;
    try { if (localStorage.getItem(k)) return; localStorage.setItem(k, "1"); } catch (e) { return; }
    toast(lang === "en" ? "You were made a sheriff. Open My account \u2192 Sheriff panel." : lang === "hu" ? "Seriff lett\u00e9l. Fi\u00f3kom \u2192 Seriff panel." : "Ai fost promovat \u0219erif. Deschide Contul meu \u2192 Panou \u0219erif.", 8000); // TODO: HU review
  }, [isSherif]);
  // Owner signed in: accounts whose email hash is in MENTORS become sheriffs with role "mentor" (only the owner may write settings/sherifs).
  useEffect(() => {
    if (!isAdmin || !window.crypto || !crypto.subtle) return;
    const hex = b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join("");
    Promise.all([db.ref("users").once("value"), db.ref("settings/sherifs").once("value")]).then(([us, sh]) => {
      const users = us.val() || {}, sherifs = sh.val() || {};
      Object.keys(users).forEach(uid => {
        const u = users[uid] || {};
        if (!u.email || (sherifs[uid] && sherifs[uid].role === "mentor")) return;
        crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(u.email).trim().toLowerCase())).then(b => {
          const m = MENTORS.find(x => x.hash === hex(b));
          if (!m) return;
          return db.ref("settings/sherifs/" + uid).set({ name: m.name, role: "mentor", addedAt: (sherifs[uid] && sherifs[uid].addedAt) || Date.now() })
            .then(() => toast(m.name + ": \u0219erif + mentor", 6000));
        }).catch(() => {});
      });
    }).catch(() => {});
  }, [isAdmin]);
  const [nickKey, setNickKey] = useState("");
  const fbEmail = firebaseUser && firebaseUser.email;
  useEffect(() => {
    setNickKey("");
    if (!fbEmail || !window.crypto || !crypto.subtle) return;
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(fbEmail.trim().toLowerCase())).then(b => {
      const h = Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join("");
      if (NICKNAMES[h]) setNickKey(h);
    }).catch(() => {});
  }, [fbEmail]);
  const nickname = nickKey ? (NICKNAMES[nickKey][lang] || NICKNAMES[nickKey].ro) : "";
  const [pwOpen, setPwOpen] = useState(false);
  const openChangePw = useCallback(() => setPwOpen(true), []);
  // Auto-authenticate if logged-in user is the admin email — no password needed.
  useEffect(() => {
    if (isAdmin && adminMode) setAdminAuth(true);
  }, [isAdmin, adminMode]);
  // Premium polish v2: scroll progress bar + section-title underline reveals + court card condition glow.
  useEffect(() => {
    const bar = document.createElement("div");
    bar.id = "g2p-progress";
    document.body.prepend(bar);
    let rafId;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ")";
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const onPage = () => setTimeout(onScroll, 60);
    window.addEventListener("hashchange", onPage);
    const onOver = e => {
      const card = e.target.closest && e.target.closest(".card.card-link");
      if (!card) return;
      const badge = card.querySelector(".badge");
      if (badge && badge.style.color) card.style.setProperty("--cond-clr", badge.style.color);
    };
    document.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      bar.remove();
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onPage);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);
  const ctx = {
    t,
    lang,
    setLang,
    theme,
    setTheme,
    page,
    setPage,
    user,
    setUser,
    toast,
    settings,
    setCmd,
    isAdmin,
    isSherif,
    isPrivileged,
    firebaseUser,
    authReady,
    openAuth,
    signOut,
    setAdminMode,
    nickname,
    openChangePw
  };
  const toastEl = toastMsg && React.createElement(Toast, { key: toastMsg, msg: toastMsg, ms: toastMs, onClose: () => setToastMsg("") });
  const authEl = (authOpen || pwOpen || null) && ReactDOM.createPortal(authOpen
    ? React.createElement(AuthModal, { onClose: () => setAuthOpen(false), initialMode: authOpen === "signup" ? "signup" : "login" })
    : React.createElement(ChangePasswordModal, { onClose: () => setPwOpen(false) }), document.body);
  const nudgeEl = authReady && !firebaseUser && !onboard && !adminMode && !authOpen && React.createElement(SignupNudge, { onSignup: () => setAuthOpen("signup") });
  // Phone remote: render ONLY the remote (no nav, pages, mascot, effects), inside its own boundary,
  // so nothing else on the site can blank the phone during the pitch.
  if (DEMO_REMOTE) return React.createElement(AppCtx.Provider, { value: ctx },
    React.createElement(DemoRemoteBoundary, null, React.createElement(DemoRemote, null)), toastEl, authEl);
  // Saved session still being restored → short neutral screen instead of a
  // password prompt that the owner doesn't actually need.
  if (adminMode && !authReady) return React.createElement("div", { className: "admin-login" },
    React.createElement("div", { className: "admin-login-box" }, React.createElement("p", null, "⏳ …")));
  if (adminMode && !adminAuth && !isAdmin) return /*#__PURE__*/React.createElement(AppCtx.Provider, { value: ctx }, React.createElement(AdminLogin, {
    onAuth: () => setAdminAuth(true),
    onBack: () => {
      setAdminMode(false);
      location.hash = "";
    }
  }));
  if (adminMode && (adminAuth || isAdmin)) return /*#__PURE__*/React.createElement(AppCtx.Provider, { value: ctx }, React.createElement(AdminBoundary, null, React.createElement(AdminPanel, {
    // Exit keeps the owner signed in (like any real app); sign-out is explicit.
    onExit: () => {
      setAdminMode(false);
      location.hash = "";
    },
    onSignOut: () => {
      setAdminMode(false);
      setAdminAuth(false);
      location.hash = "";
      signOut();
    }
  })), toastEl);
  if (settings && settings.maintenance && !adminMode) return /*#__PURE__*/React.createElement("div", {
    className: "maint"
  }, /*#__PURE__*/React.createElement("div", { className: "maint-ic" }, "🛠️"),
     /*#__PURE__*/React.createElement("h1", null, t.maintenanceTitle),
     /*#__PURE__*/React.createElement("p", null, t.maintenanceMsg));
  if (onboard) return /*#__PURE__*/React.createElement(Onboarding, {
    lang: lang,
    onDone: () => {
      localStorage.setItem("g2p_ob", "1");
      setOnboard(false);
    }
  });
  const P = () => {
    if (settings && settings.flags && settings.flags[page] === false) return /*#__PURE__*/React.createElement(HomePage, null);
    switch (page) {
      case "courts":
        return /*#__PURE__*/React.createElement(CourtsPage, null);
      case "reports":
        return /*#__PURE__*/React.createElement(ReportsPage, null);
      case "petition":
        return /*#__PURE__*/React.createElement(PetitionPage, null);
      case "community":
        if (isMinimal()) return /*#__PURE__*/React.createElement(HomePage, null);
        return /*#__PURE__*/React.createElement(CommunityPage, null);
      case "impact":
        return /*#__PURE__*/React.createElement(ImpactPage, null);
      case "help":
        return /*#__PURE__*/React.createElement(HelpPage, null);
      case "association":
        return React.createElement(AssociationPage, null);
      case "about":
        if (isMinimal()) return /*#__PURE__*/React.createElement(AssociationPage, null);
        return /*#__PURE__*/React.createElement(AboutPage, null);
      case "press":
        return React.createElement(PressPage, null);
      case "profile":
        return /*#__PURE__*/React.createElement(ProfilePage, null);
      default:
        return /*#__PURE__*/React.createElement(HomePage, null);
    }
  };
  return /*#__PURE__*/React.createElement(AppCtx.Provider, {
    value: ctx
  }, wipe > 0 && /*#__PURE__*/React.createElement("div", {
    key: wipe,
    className: "page-wipe",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement(InstallBanner, {
    lang: lang
  }), /*#__PURE__*/React.createElement(Navbar, null), settings && settings.banner && settings.banner.on === true && settings.banner.text && bannerX !== settings.banner.text && /*#__PURE__*/React.createElement("div", {
    className: "site-banner sb-" + (settings.banner.type || "info"),
    style: /^#[0-9a-fA-F]{6}$/.test(settings.banner.color || "") ? { background: settings.banner.color } : undefined,
    role: "status"
  }, settings.banner.text, React.createElement("button", {
    className: "sb-x", "aria-label": "Close",
    onClick: () => { localStorage.setItem("g2p_banner_x", settings.banner.text); setBannerX(settings.banner.text); }
  }, "\u2715")), cmd && /*#__PURE__*/React.createElement(CommandPalette, {
    onClose: () => setCmd(false)
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      minHeight: "80vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    key: page
  }, React.createElement(PageBoundary, null, P()))), React.createElement(HeatWatcher, null), !isMinimal() && React.createElement(AmbientLight, null), React.createElement(ReportHashListener, null), !isMinimal() && React.createElement(FunEggs, null), !isMinimal() && React.createElement(EggHub, { page: page }), !isMinimal() && React.createElement(SecretKeys, null), !isPhone() && !isMinimal() && React.createElement(Mascot, { page: page }), React.createElement(BigCelebration, null), React.createElement(ThemeFx, null), mayor && !isMinimal() && React.createElement(MayorMode, {
    onClose: () => setMayor(false)
  }), /*#__PURE__*/React.createElement(Footer, null), toastEl, authEl, nudgeEl, DEMO_ON && React.createElement(DemoLayer, null));
}
