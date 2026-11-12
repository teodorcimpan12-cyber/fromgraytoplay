import { useEffect, useState } from "../lib/react.js";

/* === Install Banner === */
export function InstallBanner({
  lang
}) {
  const [dp, setDp] = useState(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(display-mode:standalone)').matches) return;
    const d = localStorage.getItem("g2p_ib_d");
    if (d && Date.now() - +d < 7 * 86400000) return;
    const h = e => {
      e.preventDefault();
      setDp(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", h);
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (ios) setTimeout(() => setShow(true), 2e3);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  const install = async () => {
    if (dp) {
      dp.prompt();
      const r = await dp.userChoice;
      if (r.outcome === "accepted") setShow(false);
      setDp(null);
    } else {
      alert(lang === "ro" ? "Apasă Share ⬆️ → Adaugă pe ecranul principal" : "Tap Share ⬆️ → Add to Home Screen");
    }
  };
  const dismiss = () => {
    setShow(false);
    localStorage.setItem("g2p_ib_d", String(Date.now()));
  };
  if (!show) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "install-banner"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCF2"), /*#__PURE__*/React.createElement("span", null, lang === "ro" ? "Instalează aplicația From Grey to Play!" : "Install the From Grey to Play app!"), /*#__PURE__*/React.createElement("button", {
    className: "ib-btn",
    onClick: install
  }, lang === "ro" ? "Instalează" : "Install"), /*#__PURE__*/React.createElement("button", {
    className: "ib-x",
    onClick: dismiss
  }, "\u2715"));
}
