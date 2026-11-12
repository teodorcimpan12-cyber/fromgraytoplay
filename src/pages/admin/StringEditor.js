import { db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { T } from "../../i18n/strings.js";
import { useState } from "../../lib/react.js";
import { askConfirm } from "./helpers.js";

/* === String Editor === */
export function StringEditor() {
  const { lang, toast } = useApp();
  const saved = useFirebase("settings/strings");
  const [edits, setEdits] = useState({});
  const [filter, setFilter] = useState("");

  const keys = Object.keys(T.ro).filter(k => !filter || k.includes(filter) || (T.ro[k] && String(T.ro[k]).toLowerCase().includes(filter.toLowerCase())));

  const setEdit = (key, lng, val) => {
    setEdits(prev => ({ ...prev, [key]: { ...prev[key], [lng]: val } }));
  };

  const getVal = (key, lng) => {
    if (edits[key] && edits[key][lng] !== undefined) return edits[key][lng];
    if (saved && saved[lng] && saved[lng][key] !== undefined) return saved[lng][key];
    return (T[lng] && T[lng][key]) || "";
  };

  const saveAll = () => {
    const ro = { ...(saved && saved.ro || {}) };
    const en = { ...(saved && saved.en || {}) };
    const hu = { ...(saved && saved.hu || {}) };
    Object.entries(edits).forEach(([k, v]) => {
      if (v.ro !== undefined) ro[k] = v.ro;
      if (v.en !== undefined) en[k] = v.en;
      if (v.hu !== undefined) hu[k] = v.hu;
    });
    db.ref("settings/strings").set({ ro, en, hu }).then(() => { toast("✅ Texte salvate!"); setEdits({}); });
  };

  const resetAll = async () => {
    if (!(await askConfirm("Resetezi toate textele la valorile default din cod?"))) return;
    db.ref("settings/strings").remove().then(() => toast("↩️ Reset la default"));
  };

  const inputS = { fontSize: ".78rem", padding: ".25rem .4rem", background: "#0D101F", border: "1px solid #1E2235", color: "#E5E7EB", borderRadius: 4, width: "100%" };

  return React.createElement("div", null,
    React.createElement("div", { className: "flex gap-1 mb-1", style: { flexWrap: "wrap" } },
      React.createElement("input", { placeholder: "Caută cheie sau text...", value: filter, onChange: e => setFilter(e.target.value), style: { flex: 1 } }),
      React.createElement("button", { className: "btn btn-green", onClick: saveAll }, "💾 Salvează"),
      React.createElement("button", { className: "btn btn-sm", style: { background: "#6B7280", color: "#fff" }, onClick: resetAll }, "↩️ Reset")
    ),
    React.createElement("div", { style: { maxHeight: 400, overflowY: "auto", border: "1px solid #1E2235", borderRadius: 8, padding: ".5rem" } },
      keys.slice(0, 60).map(key =>
        React.createElement("div", { key, style: { display: "grid", gridTemplateColumns: "110px 1fr 1fr 1fr", gap: ".25rem", marginBottom: ".35rem", alignItems: "center" } },
          React.createElement("span", { style: { fontSize: ".7rem", color: "#10B981", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, key),
          ["ro","en","hu"].map(lng =>
            React.createElement("input", { key: lng, value: String(getVal(key, lng)), onChange: e => setEdit(key, lng, e.target.value), placeholder: lng, style: inputS })
          )
        )
      ),
      keys.length > 60 && React.createElement("p", { style: { color: "#6B7280", fontSize: ".78rem", textAlign: "center", padding: ".5rem" } }, "+" + (keys.length - 60) + " — folosește filtrul")
    )
  );
}
