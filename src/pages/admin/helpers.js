import { db } from "../../app/core.js";
import { applyAccent } from "../../lib/save-user-profile.js";

// In-page replacement for window.confirm(), which browsers may silently suppress.
export function askConfirm(msg) {
  return new Promise(resolve => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = ReactDOM.createRoot(host);
    const done = v => { root.unmount(); host.remove(); resolve(v); };
    root.render(React.createElement("div", { className: "modal-overlay", style: { zIndex: 10000 }, onClick: () => done(false) },
      React.createElement("div", { className: "modal", style: { maxWidth: 380, textAlign: "center" }, onClick: e => e.stopPropagation() },
        React.createElement("p", { style: { marginBottom: "1.2rem", fontWeight: 600 } }, msg),
        React.createElement("div", { className: "flex gap-1", style: { justifyContent: "center" } },
          React.createElement("button", { className: "btn", onClick: () => done(false) }, "Anulează"),
          React.createElement("button", { className: "btn", autoFocus: true, style: { background: "#DC2626", color: "#fff" }, onClick: () => done(true) }, "Confirmă")))));
  });
}
// BACK TO NORMAL: wipe every Site Control override (keeps sherifs + data).
export function resetSiteSettings() {
  return db.ref("settings").update({
    maintenance: null, banner: null, broadcast: null, flags: null,
    accent: null, accent2: null, featuredCourtId: null, strings: null
  }).then(() => {
    applyAccent("", "");
    document.documentElement.classList.remove("no-fx");
    try { localStorage.removeItem("g2p_banner_x"); } catch (e) {}
  });
}
