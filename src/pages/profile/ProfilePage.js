import { useApp } from "../../app/core.js";
import { EggCollection } from "../../components/EggCollection.js";
import { LangFlip } from "../../components/LangFlip.js";
import { Reveal } from "../../components/Reveal.js";
import { ThemeBoard } from "../../components/ThemeBoard.js";
import { BadgesGrid } from "./BadgesGrid.js";
import { StreakCard } from "./StreakCard.js";

/* === Profile === */
export function ProfilePage() {
  const {
    t,
    lang,
    theme,
    setTheme,
    setLang,
    user,
    setUser,
    toast
  } = useApp();
  const { isAdmin, setAdminMode, openAuth, signOut, authReady } = useApp();
  const logout = () => signOut();
  const cert = () => {
    const c = `══════════════════════\nCERTIFICAT VOLUNTAR\n══════════════════════\n\nFROM GREY TO PLAY\n\n${user?.name || "___"}\n\na participat ca voluntar.\nPuncte: ${user?.points || 0}\n\nCoordinator: Cîmpan Teodor\nData: ${new Date().toLocaleDateString()}\n══════════════════════`;
    const b = new Blob([c], {
      type: "text/plain"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "certificat_voluntar_g2p.txt";
    a.click();
  };
  if (!user) return React.createElement("div", { className: "animate-in" },
    React.createElement("section", { className: "section" },
      React.createElement("div", { className: "container", style: { maxWidth: 380, margin: "0 auto", textAlign: "center" } },
        React.createElement("h2", { className: "section-title", style: { textAlign: "center" } }, t.signIn),
        React.createElement("div", { className: "card" },
          React.createElement("div", { style: { fontSize: "2.2rem", marginBottom: ".5rem" } }, "\uD83D\uDD10"),
          React.createElement("p", { className: "text-sm mb-2", style: { color: "var(--textSec)" } },
            lang === "ro" ? "Intră cu Google, email sau SMS. Rămâi conectat pe acest dispozitiv până apeși Deconectare."
              : lang === "hu" ? "Lépj be Google-lel, e-maillel vagy SMS-sel. Ezen az eszközön bejelentkezve maradsz, amíg ki nem jelentkezel." // TODO: HU review
              : "Sign in with Google, email or SMS. You stay signed in on this device until you sign out."),
          React.createElement("button", { className: "btn btn-green btn-block", disabled: !authReady, onClick: openAuth },
            authReady ? (t.signIn + " / " + t.signUp) : "…")))));
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-in"
  }, /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card mb-2",
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 70,
      height: 70,
      borderRadius: "50%",
      background: "var(--green)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
      fontSize: "1.8rem",
      color: "#fff"
    }
  }, (user.name || "?")[0].toUpperCase()), /*#__PURE__*/React.createElement("h2", {
    className: "mt-1"
  }, user.name), /*#__PURE__*/React.createElement("p", {
    className: "text-sm",
    style: {
      color: "var(--textSec)"
    }
  }, user.email)), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-3 mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number"
  }, user.points || 0), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, t.points)), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number",
    style: {
      color: "var(--coral)"
    }
  }, (user.badges || []).length), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, t.badges)), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-sm mt-1",
    onClick: cert
  }, "", t.volunteerCertificate))), /*#__PURE__*/React.createElement("div", {
    className: "card mb-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "mb-1"
  }, t.settings), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-1"
  }, /*#__PURE__*/React.createElement("span", null, theme === "dark" ? "🌙 Dark" : "☀️ Light"), React.createElement(ThemeBoard, { big: true })), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-1"
  }, /*#__PURE__*/React.createElement("span", null, "Language"), React.createElement(LangFlip, { big: true }))), isAdmin && React.createElement("div", { className: "card mb-2", style: { borderLeft: "4px solid var(--green)" } },
      React.createElement("div", { className: "flex items-center gap-2", style: { marginBottom: ".5rem" } },
        React.createElement("span", { style: { fontSize: "1.4rem" } }, "\uD83D\uDD11"),
        React.createElement("div", null,
          React.createElement("div", { style: { fontWeight: 700 } }, "Administrator"),
          React.createElement("div", { className: "text-xs", style: { color: "var(--textSec)" } }, "teodor.cimpan12@gmail.com \u2022 acces complet")
        )
      ),
      React.createElement("button", { className: "btn btn-green", style: { width: "100%" },
        onClick: () => { location.hash = "#/admin"; }
      }, "Deschide Admin Panel")
    ), React.createElement(StreakCard, null), React.createElement(Reveal, { as:"div", className:"card mt-2" },
    React.createElement(BadgesGrid, { lang:lang })
  ), React.createElement(Reveal, { as:"div", className:"card mt-2" }, React.createElement(EggCollection, { inline: true })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline btn-block mt-2",
    style: {
      color: "var(--red)",
      borderColor: "var(--red)"
    },
    onClick: logout
  }, t.signOut))));
}
