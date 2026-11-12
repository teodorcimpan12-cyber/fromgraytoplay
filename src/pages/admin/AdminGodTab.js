import { db, useApp } from "../../app/core.js";
import { downloadFile } from "../../lib/download-file.js";
import { useState } from "../../lib/react.js";
import { StringEditor } from "./StringEditor.js";
import { askConfirm } from "./helpers.js";

/* ============================================================
   ADMIN — GOD MODE. Direct read/write/delete on ANY Firebase
   path, node scanner, one-click full backup/restore, fast wipes.
   ============================================================ */
export function AdminGodTab() {
  const ROOTS = ["signups","signupStats","votes","reports","activity","courts","bookings","settings","pixels","presence","pledges","achievements","adoptions","letterCount","budgetLive","tasks","users","leaderboard","games","gallery","ratings","follows","forum","events","teams","partnerRequests"];
  const { toast } = useApp();
  const alert = toast;
  const [path, setPath] = useState("settings");
  const [val, setVal] = useState("");
  const [stat, setStat] = useState(null);
  const [busy, setBusy] = useState(false);
  const inputS = { background: "#0D101F", border: "1px solid #1E2235", color: "#E5E7EB", borderRadius: 8, padding: ".5rem .7rem" };
  const load = () => {
    setBusy(true);
    db.ref(path).once("value").then(s => { setVal(JSON.stringify(s.val(), null, 2) || "null"); setBusy(false); })
      .catch(e => { setVal("// EROARE: " + e.message); setBusy(false); });
  };
  const write = async () => {
    let v; try { v = JSON.parse(val); } catch (e) { alert("JSON invalid: " + e.message); return; }
    if (!(await askConfirm("Scrii peste „" + path + "” ?"))) return;
    db.ref(path).set(v).then(() => alert("Scris ✓")).catch(e => alert("Eroare: " + e.message));
  };
  const del = async () => {
    if (!(await askConfirm("ȘTERGI definitiv „" + path + "” ?"))) return;
    db.ref(path).remove().then(() => alert("Șters ✓")).catch(e => alert("Eroare: " + e.message));
  };
  const scan = () => {
    setBusy(true); const out = {};
    Promise.all(ROOTS.map(r => db.ref(r).once("value")
      .then(s => { const v = s.val(); out[r] = v == null ? 0 : (typeof v === "object" ? Object.keys(v).length : 1); })
      .catch(() => { out[r] = "🔒"; })))
      .then(() => { setStat(out); setBusy(false); });
  };
  const backup = () => {
    setBusy(true); const out = {};
    Promise.all(ROOTS.map(r => db.ref(r).once("value").then(s => { if (s.val() != null) out[r] = s.val(); }).catch(() => {})))
      .then(() => { downloadFile("g2p_backup_" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(out, null, 2), "application/json"); setBusy(false); });
  };
  const restore = e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = async () => {
      let d; try { d = JSON.parse(rd.result); } catch (err) { alert("JSON invalid"); return; }
      if (!(await askConfirm("Restaurezi " + Object.keys(d).length + " noduri PESTE datele live?"))) return;
      Promise.all(Object.keys(d).map(k => db.ref(k).set(d[k])))
        .then(() => alert("Restaurat ✓")).catch(err2 => alert("Eroare: " + err2.message));
    };
    rd.readAsText(f);
    e.target.value = "";
  };
  const wipe = async r => {
    if (!(await askConfirm("Golești „" + r + "” ? (ireversibil)"))) return;
    db.ref(r).remove().then(() => { alert(r + " golit ✓"); scan(); }).catch(e => alert("Eroare: " + e.message));
  };
  const WIPABLE = ["pixels","presence","bookings","tasks","adoptions","letterCount","pledges","achievements","games","gallery","ratings","follows"];
  return React.createElement("div", null,
    React.createElement("h2", null, "⚡ God Mode"),
    React.createElement("h3", { className: "a-sec" }, "✏️ Editor texte site"),
    React.createElement("p", { style: { color: "#6B7280", fontSize: ".8rem", marginBottom: "1rem" } },
      "Modifică orice text de pe site în RO/EN/HU. Se aplică live după salvare."),
    React.createElement(StringEditor, null),
    React.createElement("details", { style: { marginTop: "1.5rem" } },
    React.createElement("summary", { style: { cursor: "pointer", color: "#6B7280", fontSize: ".85rem", padding: ".4rem 0" } }, "🗄️ Editor direct Firebase (avansat)"),
    React.createElement("p", { style: { color: "#6B7280", fontSize: ".78rem", margin: ".5rem 0 1rem" } },
      "Acces brut la întreaga bază de date. Fără plasă de siguranță — folosește backup-ul înainte."),
    React.createElement("h3", { className: "a-sec" }, "🗄️ Editor direct Firebase"),
    React.createElement("div", { className: "flex gap-1 mb-1", style: { flexWrap: "wrap" } },
      React.createElement("input", { value: path, onChange: e => setPath(e.target.value), placeholder: "cale (ex: settings/banner)", style: Object.assign({ flex: 1, minWidth: 200 }, inputS), list: "god-roots" }),
      React.createElement("datalist", { id: "god-roots" }, ROOTS.map(r => React.createElement("option", { key: r, value: r }))),
      React.createElement("button", { className: "ab", style: { width: "auto", padding: ".5rem .9rem" }, disabled: busy, onClick: load }, busy ? "…" : "📥 Load"),
      React.createElement("button", { className: "ab", style: { width: "auto", padding: ".5rem .9rem", background: "#F97316" }, onClick: write }, "💾 Write"),
      React.createElement("button", { className: "ab", style: { width: "auto", padding: ".5rem .9rem", background: "#DC2626" }, onClick: del }, "🗑️ Delete")),
    React.createElement("textarea", { value: val, onChange: e => setVal(e.target.value), rows: 12, spellCheck: false,
      style: Object.assign({ width: "100%", fontFamily: "'Space Mono',monospace", fontSize: ".78rem", marginBottom: "1rem" }, inputS) }),
    React.createElement("h3", { className: "a-sec" }, "📊 Scanner noduri"),
    React.createElement("button", { className: "ab", style: { width: "auto", padding: ".5rem .9rem", marginBottom: ".6rem" }, disabled: busy, onClick: scan }, busy ? "…" : "🔍 Scan tot"),
    stat && React.createElement("div", { className: "a-stats", style: { gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", display: "grid", gap: ".5rem", marginBottom: "1rem" } },
      ROOTS.map(r => React.createElement("div", { key: r, className: "a-stat", style: { cursor: "pointer" }, onClick: () => { setPath(r); load(); }, title: "Click = load în editor" },
        React.createElement("div", { className: "n", style: { color: stat[r] === 0 ? "#6B7280" : "#10B981", fontSize: "1.05rem" } }, String(stat[r])),
        React.createElement("div", { className: "l" }, r)))),
    React.createElement("h3", { className: "a-sec" }, "💾 Backup / Restore total"),
    React.createElement("div", { className: "flex gap-1 mb-1", style: { flexWrap: "wrap" } },
      React.createElement("button", { className: "ab", style: { width: "auto", padding: ".5rem .9rem" }, disabled: busy, onClick: backup }, "⬇️ Backup complet (JSON)"),
      React.createElement("label", { className: "ab", style: { width: "auto", padding: ".5rem .9rem", background: "#0D9488", cursor: "pointer", display: "inline-block" }, },
        "⬆️ Restore din fișier",
        React.createElement("input", { type: "file", accept: "application/json", onChange: restore, style: { display: "none" } }))),
    React.createElement("h3", { className: "a-sec", style: { color: "#F87171" } }, "🧹 Golește rapid"),
    React.createElement("div", { className: "flex gap-1", style: { flexWrap: "wrap" } },
      WIPABLE.map(r => React.createElement("button", { key: r, onClick: () => wipe(r),
        style: { background: "none", border: "1px solid #7F1D1D", color: "#F87171", padding: ".35rem .7rem", borderRadius: 6, fontSize: ".75rem", cursor: "pointer" } }, "✕ " + r)))));
}
