import { db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useState } from "../../lib/react.js";

/* === Admin Sherifs Tab === */
export function AdminSherifsTab() {
  const { lang, toast } = useApp();
  const sherifs = useFirebase("settings/sherifs");
  const users = useFirebase("users");
  const [inputEmail, setInputEmail] = useState("");

  const addSherif = () => {
    if (!inputEmail) return;
    const found = users && Object.entries(users).find(([uid, u]) => u.email === inputEmail);
    if (!found) { toast(lang === "ro" ? "User negăsit. Trebuie să aibă cont G2P." : "User not found. They must have a G2P account."); return; }
    const [uid, u] = found;
    // settings/ is publicly readable, so the sheriff list stores no email.
    db.ref("settings/sherifs/" + uid).set({ name: u.name || "Sherif", addedAt: Date.now() });
    setInputEmail("");
    toast("✅ Sherif adăugat!");
  };

  const removeSherif = uid => {
    db.ref("settings/sherifs/" + uid).remove();
    toast("Sherif eliminat");
  };

  const sh = sherifs ? Object.entries(sherifs) : [];
  return React.createElement("div", null,
    React.createElement("h2", null, "👮 " + (lang === "ro" ? "Șerifi" : "Sheriffs")),
    React.createElement("p", { style: { color: "#6B7280", fontSize: ".85rem", marginBottom: "1rem" } },
      lang === "ro" ? "Șerifii editează site-ul și moderează comunitatea, dar NU pot șterge, reseta sau vedea emailurile oamenilor. Admin suprem: teodor.cimpan12@gmail.com" :
      "Sheriffs edit the site and moderate the community, but CANNOT delete, reset or see people's emails. Supreme admin: teodor.cimpan12@gmail.com"),
    React.createElement("div", { className: "flex gap-1 mb-2" },
      React.createElement("input", { value: inputEmail, onChange: e => setInputEmail(e.target.value), placeholder: "Email utilizator existent", style: { flex: 1 }, onKeyDown: e => e.key === "Enter" && addSherif() }),
      React.createElement("button", { className: "btn btn-green", onClick: addSherif }, "+ Adaugă Sherif")
    ),
    sh.length === 0 ? React.createElement("p", { style: { color: "#6B7280" } }, "Niciun sherif adăugat încă.") :
    sh.map(([uid, s]) => React.createElement("div", { key: uid, className: "card mb-1", style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
      React.createElement("div", null,
        React.createElement("strong", null, s.name || "—"), " ",
        React.createElement("span", { style: { color: "#6B7280", fontSize: ".82rem" } }, s.email),
        React.createElement("div", { style: { fontSize: ".75rem", color: "#6B7280" } }, uid)
      ),
      React.createElement("button", { className: "btn btn-sm", style: { background: "#DC2626", color: "#fff" }, onClick: () => removeSherif(uid) }, "✕ Remove")
    ))
  );
}
