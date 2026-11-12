import { PRESS_URL, useApp } from "../app/core.js";
import { qrDataUrl } from "../lib/press-numbers.js";
import { useEffect, useState } from "../lib/react.js";

// Full-screen QR to the press page, to hold up in front of a journalist (the surprise of this batch).
export function PressQR({ onClose }) {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    qrDataUrl(PRESS_URL, 720).then(setSrc, () => setErr(true));
    let wl = null;
    try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(l => { wl = l; }, () => {}); } catch (e) {}
    const k = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); try { wl && wl.release(); } catch (e) {} };
  }, []);
  return ReactDOM.createPortal(React.createElement("div", { className: "pressqr", role: "dialog", "aria-label": "QR", onClick: onClose },
    React.createElement("div", { className: "pressqr-box", onClick: e => e.stopPropagation() },
      React.createElement("div", { className: "pressqr-k" }, "FROM GREY TO PLAY · " + L3("PRESĂ", "PRESS", "SAJTÓ")),
      src ? React.createElement("img", { src: src, alt: PRESS_URL, className: "pressqr-img" })
          : React.createElement("div", { className: "pressqr-img pressqr-wait" }, err ? PRESS_URL.replace("https://", "") : "…"),
      React.createElement("strong", { className: "pressqr-u" }, PRESS_URL.replace("https://", "")),
      React.createElement("p", null, L3("Scanează cu camera telefonului: cifre cu sursă, comunicat și PDF.", "Scan with your phone camera: sourced numbers, release and PDF.", "Szkenneld a telefonoddal: forrásolt számok, közlemény és PDF.")),
      React.createElement("button", { className: "btn btn-sm", onClick: onClose }, L3("Închide", "Close", "Bezár") + " ✕"))), document.body);
}
