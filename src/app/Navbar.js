import { isMinimal } from "../lib/minimal.js";
import { cdxIcon } from "../pages/court-detail/cdx-icons.js";
import { FunPanel } from "./FunPanel.js";
import { NotifPanel } from "./NotifPanel.js";
import { ACTIVE_CITY, useApp } from "./core.js";
import { LangFlip } from "../components/LangFlip.js";
import { ThemeBoard } from "../components/ThemeBoard.js";
import { CITY_CFG } from "../data/constants.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { useState } from "../lib/react.js";

export function CitySwitch() {
  const { lang } = useApp();
  const nameKey = lang === "hu" ? "nameHu" : lang === "en" ? "nameEn" : "nameRo";
  return React.createElement("select", {
    value: ACTIVE_CITY,
    "aria-label": lang === "ro" ? "Oraș" : lang === "hu" ? "Város" : "City",
    style: { width:"auto", minWidth:112, flexShrink:0, background:"var(--bgCard)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:8, padding:".3rem .5rem", fontSize:".78rem", cursor:"pointer" },
    onChange: e => {
      localStorage.setItem("g2p_city", e.target.value);
      const url = new URL(location.href);
      url.searchParams.set("c", e.target.value);
      location.href = url.toString();
    }
  }, Object.entries(CITY_CFG).map(([k,v]) =>
    React.createElement("option", { key:k, value:k }, v[nameKey])
  ));
}
export function Navbar() {
  const {
    t,
    lang,
    setLang,
    theme,
    setTheme,
    page,
    setPage,
    user,
    settings,
    setCmd,
    isAdmin,
    firebaseUser,
    authReady,
    openAuth,
    signOut,
    isSherif,
    nickname,
    openChangePw
  } = useApp();
  const [mob, setMob] = useState(false);
  const setShowAuth = v => v && openAuth();
  const [acct, setAcct] = useState(false);
  const acctName = firebaseUser ? (nickname || (user && user.name) || firebaseUser.displayName || firebaseUser.email || firebaseUser.phoneNumber || "") : "";
  const L3 = (ro, en, hu) => lang === "ro" ? ro : lang === "hu" ? hu : en;
  const [showNotif, setShowNotif] = useState(false);
  const notif = useNotifications();
  const unreadCount = notif.unread;
  const navs = [{
    k: "home",
    l: t.home
  }, {
    k: "courts",
    l: t.courts
  }, {
    k: "reports",
    l: t.reportPageTitle
  }, {
    k: "petition",
    l: t.petition
  }, {
    k: "community",
    l: t.community
  }, {
    k: "impact",
    l: t.impact
  }, {
    k: "help",
    l: t.help
  }, {
    k: "association",
    l: L3("Asociația", "Association", "Egyesület")
  }, {
    k: "about",
    l: t.about
  }].filter(n => !(settings && settings.flags && settings.flags[n.k] === false));
  const NL = ({
    k,
    l,
    click
  }) => /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: (page === k ? "active" : "") + (k === "association" ? " nav-assoc" : ""),
    onClick: e => {
      e.preventDefault();
      setPage(k);
      click && click();
    }
  }, l);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("nav", {
    className: "navbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-inner"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "nav-logo",
    onClick: e => {
      e.preventDefault();
      setPage("home");
    }
  }, "FROM GREY TO PLAY"), /*#__PURE__*/React.createElement("div", {
    className: "nav-links desktop"
  }, navs.filter(n => !(isMinimal() && (n.k === "community" || n.k === "about"))).map(n => /*#__PURE__*/React.createElement(NL, {
    key: n.k,
    k: n.k,
    l: n.l
  })),
  /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowNotif(v => !v), hidden: isMinimal(),
    style: { position: "relative", padding: unreadCount > 0 ? ".35rem 1.15rem .35rem .35rem" : undefined },
    title: t.notifications,
    "aria-label": t.notifications + (unreadCount ? " (" + unreadCount + ")" : "")
  }, cdxIcon("bell", 20), unreadCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: { position:"absolute", top:"1px", right:"0", background:"var(--coral)", color:"#fff", borderRadius:"50%", fontSize:".6rem", fontWeight:700, minWidth:"16px", height:"16px", lineHeight:"16px", textAlign:"center", padding:"0 2px" }
  }, unreadCount > 9 ? "9+" : unreadCount)),
  /*#__PURE__*/React.createElement("button", {
    className: "nav-cmd",
    title: "Ctrl+K",
    "aria-label": "Search (Ctrl+K)",
    onClick: () => setCmd(true)
  }, React.createElement("svg", { className: "nav-glass", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", "aria-hidden": "true" },
    React.createElement("circle", { cx: 10.5, cy: 10.5, r: 6.5 }), React.createElement("path", { d: "M15.5 15.5L21 21" }), React.createElement("path", { className: "ng-shine", d: "M7.5 9a3.2 3.2 0 0 1 3-2.6" }))),
  React.createElement(LangFlip, null),
  React.createElement(ThemeBoard, null),
  React.createElement(CitySwitch, null),
  React.createElement("div", { style: { position: "relative" } },
  /*#__PURE__*/React.createElement("button", {
    className: "nav-acct",
    title: firebaseUser ? acctName : L3("Intră în cont", "Sign in", "Bejelentkezés"),
    "aria-label": firebaseUser ? acctName : L3("Intră în cont", "Sign in", "Bejelentkezés"),
    "aria-haspopup": firebaseUser ? "menu" : undefined,
    "aria-expanded": firebaseUser ? acct : undefined,
    style: { display:"flex", alignItems:"center", gap:".28rem", height:28, padding:"0 .45rem", background: firebaseUser ? "color-mix(in srgb,var(--" + (isAdmin ? "coral" : "green") + ") 12%,transparent)" : "none", border: firebaseUser ? "1px solid color-mix(in srgb,var(--" + (isAdmin ? "coral" : "green") + ") 35%,transparent)" : "none", borderRadius:8, cursor:"pointer", color: firebaseUser ? (isAdmin ? "var(--coral)" : "var(--green)") : "var(--textSec)", fontSize:".7rem", fontFamily:"'Space Mono',monospace", transition:"all .18s", opacity: authReady ? 1 : .4 },
    onClick: () => { if (!authReady) return; if (firebaseUser) setAcct(v => !v); else openAuth(); }
  },
    isAdmin ? React.createElement("span", { "aria-hidden": "true" }, "\uD83D\uDC51") :
    React.createElement("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},
      ...(firebaseUser
        ? [React.createElement("path",{key:"a",d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),React.createElement("circle",{key:"b",cx:12,cy:7,r:4})]
        : [React.createElement("rect",{key:"a",x:3,y:11,width:18,height:11,rx:2}),React.createElement("path",{key:"b",d:"M7 11V7a5 5 0 0 1 10 0v4"})]
      )
    ),
    firebaseUser ? React.createElement("span",{className:"nav-acct-name"},acctName.split(/[ @]/)[0].substring(0,10)) : null
  ),
  acct && firebaseUser && React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 499 }, onClick: () => setAcct(false) }),
  acct && firebaseUser && React.createElement("div", { className: "acct-menu", role: "menu" },
    React.createElement("div", { className: "am-hd" },
      React.createElement("b", null, (isAdmin ? "\uD83D\uDC51 " : isSherif ? "\uD83D\uDC6E " : "") + (acctName.indexOf("@") < 0 ? acctName : L3("Contul meu", "My account", "Fiókom"))),
      React.createElement("span", null, firebaseUser.email || firebaseUser.phoneNumber || "")),
    React.createElement("button", { role: "menuitem", onClick: () => { setAcct(false); setPage("profile"); } }, "\uD83D\uDC64 " + L3("Profilul meu", "My profile", "Profilom")),
    (isAdmin || isSherif) && React.createElement("button", { role: "menuitem", onClick: () => { setAcct(false); location.hash = "#/admin"; } }, "\uD83D\uDEE1\uFE0F " + (isAdmin ? "Admin panel" : L3("Panou șerif", "Sheriff panel", "Seriff panel"))), // TODO: HU review
    React.createElement("button", { role: "menuitem", onClick: () => { setAcct(false); openChangePw(); } }, "\uD83D\uDD11 " + L3("Schimbă parola", "Change password", "Jelszó módosítása")),
    React.createElement("button", { role: "menuitem", style: { color: "var(--red)" }, onClick: () => { setAcct(false); signOut(); } }, "\u21AA " + L3("Deconectare", "Sign out", "Kijelentkezés")))
  ),
  isAdmin && /*#__PURE__*/React.createElement("button", {
    onClick: () => { location.hash = "#/admin"; },
    title: "Admin Panel",
    style: { display:"flex", alignItems:"center", height:28, padding:"0 .3rem", opacity: isAdmin ? 1 : 0.3, background:"none", border:"none", cursor:"pointer", color: isAdmin ? "var(--coral)" : "var(--textSec)", transition:"all .18s" }
  },
    React.createElement("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},
      React.createElement("path",{d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"})
    )
  )), React.createElement("button", {
    className: "nav-cmd nav-cmd-m",
    "aria-label": L3("Caută", "Search", "Keresés"),
    onClick: () => setCmd(true)
  }, React.createElement("svg", { className: "nav-glass", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", "aria-hidden": "true" },
    React.createElement("circle", { cx: 10.5, cy: 10.5, r: 6.5 }), React.createElement("path", { d: "M15.5 15.5L21 21" }))), /*#__PURE__*/React.createElement("button", {
    className: "hamburger",
    "aria-label": lang === "en" ? "Open menu" : lang === "hu" ? "Men\u00fc megnyit\u00e1sa" : "Deschide meniul",
    "aria-expanded": mob ? "true" : "false",
    onClick: () => setMob(true)
  }, "\u2630"))),
  showNotif && /*#__PURE__*/React.createElement(NotifPanel, { notif: notif, onClose: () => setShowNotif(false) }),
  mob && /*#__PURE__*/React.createElement("div", {
    className: "mobile-menu"
  }, React.createElement("span", { className: "mobile-menu-brand" }, "FROM GREY TO PLAY"), /*#__PURE__*/React.createElement("button", {
    className: "mobile-close",
    "aria-label": lang === "en" ? "Close menu" : lang === "hu" ? "Men\u00fc bez\u00e1r\u00e1sa" : "\u00cenchide meniul",
    onClick: () => setMob(false)
  }, React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", "aria-hidden": "true" },
    React.createElement("path", { d: "M6 6l12 12M18 6L6 18" }))), navs.filter(n => !(isMinimal() && (n.k === "community" || n.k === "about"))).map(n => /*#__PURE__*/React.createElement(NL, {
    key: n.k,
    k: n.k,
    l: n.l,
    click: () => setMob(false)
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1",
    style: {
      padding: "1rem",
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, React.createElement(CitySwitch, null), React.createElement(LangFlip, { big: true }), React.createElement(ThemeBoard, { big: true }), React.createElement("button", {
    className: "btn btn-sm btn-outline",
    onClick: () => { setMob(false); setShowNotif(true); }, hidden: isMinimal()
  }, "🔔 " + (unreadCount ? unreadCount + " " : "") + t.notifications), firebaseUser && React.createElement("button", {
    className: "btn btn-sm btn-outline",
    onClick: () => { setMob(false); setPage("profile"); }
  }, (isAdmin ? "\uD83D\uDC51 " : isSherif ? "\uD83D\uDC6E " : "\uD83D\uDC64 ") + acctName.split(/[ @]/)[0].substring(0, 14)), isAdmin && React.createElement("button", {
    className: "btn btn-sm btn-outline",
    onClick: () => { setMob(false); openChangePw(); }
  }, "\uD83D\uDD11 " + L3("Parolă", "Password", "Jelszó")), authReady && React.createElement("button", {
    className: "btn btn-sm btn-outline",
    onClick: () => { setMob(false); if (firebaseUser) signOut(); else setShowAuth(true); }
  }, firebaseUser ? (lang === "ro" ? "Deconectare" : lang === "hu" ? "Kijelentkezés" : "Sign out") : (lang === "ro" ? "Cont (Google / email / SMS)" : lang === "hu" ? "Fiók" : "Account (Google / email / SMS)")), React.createElement("button", {
    className: "btn btn-sm btn-outline",
    onClick: () => { setMob(false); location.hash = "#/admin"; }
  }, "Admin")), React.createElement(FunPanel, { menu: true })));
}
