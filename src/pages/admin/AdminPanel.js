import { db, useApp } from "../../app/core.js";
import { SHERIF_TABS } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { courtStatusView } from "../../lib/court-status-view.js";
import { useEffect, useRef, useState } from "../../lib/react.js";
import { AdminGodTab } from "./AdminGodTab.js";
import { AdminModTab } from "./AdminModTab.js";
import { AdminSherifsTab } from "./AdminSherifsTab.js";
import { AdminSiteTab } from "./AdminSiteTab.js";
import { askConfirm, resetSiteSettings } from "./helpers.js";

export function AdminPanel({
  onExit,
  onSignOut
}) {
  const { firebaseUser, isAdmin, toast, t } = useApp();
  const { isSherif: sherifOnly } = useApp();
  const [tab, setTab] = useState("site");
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef(null), burgerRef = useRef(null), swipe = useRef(null);
  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = e => { if (e.key === "Escape") setNavOpen(false); };
    window.addEventListener("keydown", onKey);
    const wide = window.matchMedia("(min-width:701px)");
    const onWide = () => { if (wide.matches) setNavOpen(false); };
    if (wide.addEventListener) wide.addEventListener("change", onWide);
    const act = navRef.current && navRef.current.querySelector("button.active");
    if (act) act.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      if (wide.removeEventListener) wide.removeEventListener("change", onWide);
      if (burgerRef.current) burgerRef.current.focus({ preventScroll: true });
    };
  }, [navOpen]);
  const pickTab = k => { setTab(k); setNavOpen(false); window.scrollTo(0, 0); };
  // Drag the drawer closed with a finger, like a native app.
  const navTouch = {
    onTouchStart: e => { if (navOpen) swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dx: 0, lock: null }; },
    onTouchMove: e => {
      const s = swipe.current, el = navRef.current;
      if (!s || !el) return;
      const dx = e.touches[0].clientX - s.x, dy = e.touches[0].clientY - s.y;
      if (!s.lock && Math.abs(dx) + Math.abs(dy) > 8) s.lock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (s.lock !== "x") return;
      s.dx = Math.min(0, dx);
      el.style.transition = "none";
      el.style.transform = "translateX(" + s.dx + "px)";
    },
    onTouchEnd: () => {
      const s = swipe.current, el = navRef.current;
      swipe.current = null;
      if (!s || !el) return;
      el.style.transition = ""; el.style.transform = "";
      if (s.dx < -70) setNavOpen(false);
    }
  };
  const su = useFirebase("signups");
  const vo = useFirebase("votes");
  const co = useFirebase("courts");
  const fo = useFirebase("forum");
  const ev = useFirebase("events");
  const lb = useFirebase("leaderboard");
  const us = useFirebase("users");
  const re = useFirebase("reports");
  useEffect(() => {
    if (!su) return;
    db.ref("signupStats").once("value").then(snap => {
      const have = snap.val() || {};
      Object.entries(su).forEach(([id, s]) => {
        if (have[id]) return;
        const date = s.date || (typeof s.timestamp === "number" ? new Date(s.timestamp).toISOString() : new Date().toISOString());
        db.ref("signupStats/" + id).set({ volunteer: !!s.volunteer, city: s.city || "tgm", date });
      });
    });
  }, [su ? Object.keys(su).length : 0]);
  const sl = su ? Object.entries(su).map(([id, s]) => ({
    id,
    ...s
  })) : [];
  const cl = co ? Object.entries(co).map(([id, c]) => ({
    id,
    ...c
  })) : [];
  const fl = fo ? Object.entries(fo).map(([id, p]) => ({
    id,
    ...p
  })) : [];
  const el = ev ? Object.entries(ev).map(([id, e]) => ({
    id,
    ...e
  })) : [];
  const ll = lb ? Object.entries(lb).map(([id, u]) => ({
    id,
    ...u
  })).sort((a, b) => (b.points || 0) - (a.points || 0)) : [];
  const ul = us ? Object.entries(us).map(([id, u]) => ({
    id,
    ...u
  })) : [];
  const rl = re ? Object.entries(re).map(([id, r]) => ({ id, ...r })).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")) : [];
  const [noteId, setNoteId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [chDate, setChDate] = useState(""), [chReg, setChReg] = useState("");
  const flip = vo?.flip || 0,
    mural = vo?.mural || 0,
    both = vo?.both || 0,
    tv = flip + mural + both;
  const csv = (rows, fn) => {
    if (!rows.length) return;
    const ks = Object.keys(rows[0]).filter(k => k !== "id");
    const h = ks.join(",");
    const b = rows.map(r => ks.map(k => String(r[k] || "").includes(",") ? `"${r[k]}"` : String(r[k] || "")).join(",")).join("\n");
    const bl = new Blob([h + "\n" + b], {
      type: "text/csv"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(bl);
    a.download = fn;
    a.click();
  };
  const [ef, setEf] = useState({
    title: "",
    desc: "",
    date: "",
    location: "",
    type: "volunteerDay"
  });
  const [editId, setEditId] = useState(null);
  const saveEv = () => {
    if (!ef.title || !ef.date) return;
    if (editId) {
      db.ref("events/" + editId).update(ef);
      setEditId(null);
    } else db.ref("events").push({
      ...ef,
      attendeeCount: 0
    });
    setEf({
      title: "",
      desc: "",
      date: "",
      location: "",
      type: "volunteerDay"
    });
  };
  const tabs = [{
    k: "site",
    l: "⚙️ Site Control"
  }, {
    k: "moderation",
    l: "🛡️ Moderation"
  }, {
    k: "god",
    l: "⚡ God Mode"
  }, {
    k: "signups",
    l: "📋 Signups (" + sl.length + ")"
  }, {
    k: "votes",
    l: "✊ Votes (" + tv + ")"
  }, {
    k: "reports",
    l: "⚠️ Reports (" + rl.length + ")"
  }, {
    k: "courts",
    l: "🏟️ Courts (" + cl.length + ")"
  }, {
    k: "forum",
    l: "💬 Forum (" + fl.length + ")"
  }, {
    k: "events",
    l: "📅 Events (" + el.length + ")"
  }, {
    k: "leaderboard",
    l: "🏆 Leaderboard"
  }, {
    k: "sherifs",
    l: "👮 Sheriffs"
  }, {
    k: "users",
    l: "👥 Users (" + ul.length + ")"
  }].filter(tb => !sherifOnly || SHERIF_TABS.indexOf(tb.k) >= 0);
  return /*#__PURE__*/React.createElement("div", {
    className: "admin-shell" + (sherifOnly ? " sherif-mode" : "")
  }, /*#__PURE__*/React.createElement("header", {
    className: "admin-hdr"
  }, React.createElement("button", {
    ref: burgerRef,
    className: "admin-burger",
    "aria-label": "Menu",
    "aria-controls": "admin-nav",
    "aria-expanded": navOpen,
    onClick: () => setNavOpen(true)
  }, React.createElement("span", { className: "bars", "aria-hidden": "true" }, React.createElement("i"), React.createElement("i"), React.createElement("i")),
    React.createElement("span", { className: "cur" }, (tabs.find(tb => tb.k === tab) || tabs[0] || { l: "Menu" }).l)
  ), /*#__PURE__*/React.createElement("h1", null, sherifOnly ? "👮 ȘERIF — From Grey to Play" : "\uD83D\uDD12 ADMIN \u2014 From Grey to Play"), React.createElement("div", { className: "a-auth" },
    React.createElement("span", { className: "dot" + (isAdmin ? "" : " bad") }),
    React.createElement("span", null, isAdmin ? "Owner · " + ((firebaseUser && firebaseUser.email) || "") : sherifOnly ? "Sheriff · " + ((firebaseUser && firebaseUser.email) || "") : "Not signed in as owner — changes will be rejected"),
    !sherifOnly && React.createElement("button", { className: "a-normal", style: { padding: ".3rem .7rem", fontSize: ".72rem" }, onClick: () => {
      askConfirm("Reset all Site Control settings back to normal?").then(ok => ok && resetSiteSettings()
        .then(() => toast("✅ Back to normal — site restored to defaults", 5000))
        .catch(e => toast("⛔ " + (e && e.message || "Reset failed"), 6000)));
    } }, "↺ BACK TO NORMAL"),
    React.createElement("button", { onClick: onExit, style: { background: "none", border: "1px solid #1E2235", color: "#9CA3AF", padding: ".3rem .7rem", borderRadius: 6, fontSize: ".78rem", cursor: "pointer" } }, "\u2190 Back to site"),
    onSignOut && React.createElement("button", { onClick: onSignOut, style: { background: "none", border: "1px solid #7F1D1D", color: "#F87171", padding: ".3rem .7rem", borderRadius: 6, fontSize: ".78rem", cursor: "pointer" } }, "\u21AA Sign out"))), /*#__PURE__*/React.createElement("div", {
    className: "admin-body"
  }, React.createElement("div", {
    className: "admin-scrim" + (navOpen ? " open" : ""),
    onClick: () => setNavOpen(false),
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("nav", Object.assign({
    id: "admin-nav",
    ref: navRef,
    className: "admin-side" + (navOpen ? " open" : ""),
    "aria-label": sherifOnly ? "Sheriff menu" : "Admin menu"
  }, navTouch), React.createElement("div", { className: "admin-side-hd" },
    React.createElement("span", null, sherifOnly ? "👮 Șerif" : "🔒 Admin"),
    React.createElement("button", { onClick: () => setNavOpen(false), "aria-label": "Close menu" }, "✕")
  ), tabs.map(tb => /*#__PURE__*/React.createElement("button", {
    key: tb.k,
    className: tab === tb.k ? "active" : "",
    "aria-current": tab === tb.k ? "page" : undefined,
    onClick: () => pickTab(tb.k)
  }, tb.l)), React.createElement("div", { className: "admin-side-ft" }, (firebaseUser && firebaseUser.email) || "")), /*#__PURE__*/React.createElement("div", {
    className: "admin-main"
  }, tab === "site" && React.createElement(AdminSiteTab, null), tab === "god" && React.createElement(AdminGodTab, null), tab === "moderation" && React.createElement(AdminModTab, null), tab === "signups" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Petition Signups"), /*#__PURE__*/React.createElement("div", {
    className: "a-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "a-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n",
    style: {
      color: "#10B981"
    }
  }, sl.length), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Total")), /*#__PURE__*/React.createElement("div", {
    className: "a-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n",
    style: {
      color: "#F97316"
    }
  }, sl.filter(s => s.volunteer).length), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Volunteers"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => csv(sl, "signups.csv"),
    className: "btn btn-sm btn-green mb-1"
  }, "\uD83D\uDCE5 CSV"), sl.length ? /*#__PURE__*/React.createElement("div", {
    className: "a-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "a-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "#"), /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "Choice"), /*#__PURE__*/React.createElement("th", null, "Vol"), /*#__PURE__*/React.createElement("th", null, "Date"))), /*#__PURE__*/React.createElement("tbody", null, sl.map((s, i) => /*#__PURE__*/React.createElement("tr", {
    key: s.id
  }, /*#__PURE__*/React.createElement("td", null, i + 1), /*#__PURE__*/React.createElement("td", null, s.name), /*#__PURE__*/React.createElement("td", null, s.email), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `a-badge ${s.choice === "flip" ? "a-badge-g" : s.choice === "mural" ? "a-badge-o" : "a-badge-t"}`
  }, s.choice)), /*#__PURE__*/React.createElement("td", null, s.volunteer ? "✓" : ""), /*#__PURE__*/React.createElement("td", null, s.date ? new Date(s.date).toLocaleDateString() : "")))))) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#6B7280"
    }
  }, "No signups yet")), tab === "votes" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Votes"), /*#__PURE__*/React.createElement("div", {
    className: "a-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "a-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n",
    style: {
      color: "#10B981"
    }
  }, tv), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Total")), /*#__PURE__*/React.createElement("div", {
    className: "a-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n",
    style: {
      color: "#10B981"
    }
  }, flip), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Flip")), /*#__PURE__*/React.createElement("div", {
    className: "a-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n",
    style: {
      color: "#F97316"
    }
  }, mural), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Canvas")), /*#__PURE__*/React.createElement("div", {
    className: "a-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n",
    style: {
      color: "#0D9488"
    }
  }, both), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Both"))), tv > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#151828",
      border: "1px solid #1E2235",
      borderRadius: 10,
      padding: "1rem"
    }
  }, [{
    l: "Flip-the-Court",
    v: flip,
    c: "#10B981"
  }, {
    l: "Street Canvas",
    v: mural,
    c: "#F97316"
  }, {
    l: "Both",
    v: both,
    c: "#0D9488"
  }].map(x => /*#__PURE__*/React.createElement("div", {
    key: x.l,
    style: {
      marginBottom: ".5rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: ".82rem",
      marginBottom: ".2rem"
    }
  }, /*#__PURE__*/React.createElement("span", null, x.l), /*#__PURE__*/React.createElement("span", {
    style: {
      color: x.c,
      fontWeight: 700
    }
  }, (x.v / tv * 100).toFixed(1), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      background: "#1E2235",
      borderRadius: 3,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: x.v / tv * 100 + "%",
      background: x.c,
      borderRadius: 3
    }
  })))))),
  tab === "reports" && React.createElement("div", null,
    React.createElement("h2", null, "⚠️ Reports (" + rl.length + ")"),
    React.createElement("div", { className: "a-stats" },
      ["received","analyzing","planned","resolved"].map(s => React.createElement("div", { key: s, className: "a-stat" },
        React.createElement("div", { className: "n", style: { color: s === "resolved" ? "#10B981" : s === "planned" ? "#0D9488" : s === "analyzing" ? "#F97316" : "#9CA3AF" } }, rl.filter(r => r.status === s).length),
        React.createElement("div", { className: "l" }, s)
      ))
    ),
    rl.length ? React.createElement("div", { className: "a-table-wrap" },
      React.createElement("table", { className: "a-table" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Court"), React.createElement("th", null, "Category"), React.createElement("th", null, "Description"), React.createElement("th", null, "User"), React.createElement("th", null, "Status"), React.createElement("th", null, "Date"), React.createElement("th", null, "Actions")
        )),
        React.createElement("tbody", null, rl.map(r => React.createElement(React.Fragment, { key: r.id },
          React.createElement("tr", null,
            React.createElement("td", null, r.courtName || r.courtId),
            React.createElement("td", null, r.category),
            React.createElement("td", { style: { maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" } }, r.description),
            React.createElement("td", null, r.userName || "Anonim"),
            React.createElement("td", null, React.createElement("span", { className: "a-badge " + (r.status === "resolved" ? "a-badge-g" : r.status === "analyzing" ? "a-badge-o" : r.status === "planned" ? "a-badge-t" : "") }, r.status)),
            React.createElement("td", null, r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""),
            React.createElement("td", { className: "acts" },
              React.createElement("select", {
                value: r.status,
                onChange: e => { const now = new Date().toISOString(); db.ref("reports/" + r.id).update({ status: e.target.value, updatedAt: now, ["statusAt/" + e.target.value]: now }); if (e.target.value === "planned" && !(r.cityHall && r.cityHall.regNo)) { setNoteId(r.id); setNoteText(r.official ? r.official.note : ""); setChDate(now.slice(0, 10)); setChReg(""); } db.ref("activity").push({ type: "statusChange", courtName: r.courtName, status: e.target.value, timestamp: now }); },
                style: { background: "#1A1D2E", border: "1px solid #1E2235", color: "#E5E7EB", borderRadius: 4, padding: ".15rem .3rem", fontSize: ".7rem", cursor: "pointer" }
              },
                React.createElement("option", { value: "received" }, "1 · Trimis"),
                React.createElement("option", { value: "analyzing" }, "2 · Văzut"),
                React.createElement("option", { value: "planned" }, "3 · La Primărie"),
                React.createElement("option", { value: "resolved" }, "4 · Rezolvat")
              ),
              React.createElement("button", { title: "Răspuns oficial + dovada trimiterii la Primărie", onClick: () => { setNoteId(noteId === r.id ? null : r.id); setNoteText(r.official ? r.official.note : ""); setChDate(r.cityHall && r.cityHall.sentAt ? r.cityHall.sentAt.slice(0, 10) : ""); setChReg((r.cityHall && r.cityHall.regNo) || ""); } }, "📝"),
              React.createElement("button", { className: "dng", onClick: () => askConfirm("Delete?").then(ok => ok && db.ref("reports/" + r.id).remove()) }, "✕")
            )
          ),
          noteId === r.id && React.createElement("tr", null,
            React.createElement("td", { colSpan: 7, style: { padding: ".5rem .7rem" } },
              React.createElement("div", { style: { display: "flex", gap: ".4rem", flexWrap: "wrap", alignItems: "center", marginBottom: ".45rem" } },
                React.createElement("span", { style: { fontSize: ".75rem", color: "#9CA3AF" } }, "📨 Trimis la Primărie:"),
                React.createElement("input", { type: "date", value: chDate, onChange: e => setChDate(e.target.value), style: { background: "#1A1D2E", border: "1px solid #1E2235", color: "#E5E7EB", borderRadius: 6, padding: ".3rem .5rem", fontSize: ".8rem" } }),
                React.createElement("input", { value: chReg, onChange: e => setChReg(e.target.value), placeholder: "Nr. înregistrare (ex. 12345/2026)", maxLength: 60, style: { flex: 1, minWidth: 140, background: "#1A1D2E", border: "1px solid #1E2235", color: "#E5E7EB", borderRadius: 6, padding: ".35rem .6rem", fontSize: ".8rem" } }),
                React.createElement("button", {
                  style: { background: "#0D9488", color: "#fff", border: "none", borderRadius: 6, padding: ".35rem .7rem", cursor: "pointer", fontSize: ".78rem", fontWeight: 700 },
                  onClick: () => {
                    if (!chDate && !chReg.trim()) { db.ref("reports/" + r.id + "/cityHall").remove(); return; }
                    db.ref("reports/" + r.id + "/cityHall").set({ sentAt: chDate ? new Date(chDate + "T12:00:00").toISOString() : null, regNo: chReg.trim() || null }).then(() => toast("✓ Saved")).catch(() => toast("❌ Permission denied"));
                  }
                }, "Save proof")),
              React.createElement("div", { style: { display: "flex", gap: ".4rem" } },
                React.createElement("input", { value: noteText, onChange: e => setNoteText(e.target.value), placeholder: "Official note / răspuns oficial...", style: { flex: 1, background: "#1A1D2E", border: "1px solid #1E2235", color: "#E5E7EB", borderRadius: 6, padding: ".35rem .6rem", fontSize: ".8rem" } }),
                React.createElement("button", {
                  style: { background: "#10B981", color: "#fff", border: "none", borderRadius: 6, padding: ".35rem .7rem", cursor: "pointer", fontSize: ".78rem", fontWeight: 700 },
                  onClick: () => { db.ref("reports/" + r.id + "/official").set({ note: noteText, at: new Date().toISOString(), by: "Admin" }); setNoteId(null); }
                }, "Save")
              )
            )
          )
        )))
      )
    ) : React.createElement("p", { style: { color: "#6B7280" } }, "No reports yet")
  ),
  tab === "courts" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Court Reports"), /*#__PURE__*/React.createElement("button", {
    onClick: () => csv(cl.map(c => ({
      name: c.name,
      address: c.address,
      status: c.status,
      condition: c.condition
    })), "courts.csv"),
    className: "btn btn-sm btn-green mb-1"
  }, "\uD83D\uDCE5 CSV"), cl.length ? /*#__PURE__*/React.createElement("div", {
    className: "a-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "a-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Cond"), /*#__PURE__*/React.createElement("th", null, "Date"), /*#__PURE__*/React.createElement("th", null, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, cl.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.id
  }, /*#__PURE__*/React.createElement("td", null, c.name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `a-badge ${courtStatusView(c, t).admin}`
  }, c.status)), /*#__PURE__*/React.createElement("td", null, c.condition, "/5"), /*#__PURE__*/React.createElement("td", null, c.date ? new Date(c.date).toLocaleDateString() : ""), /*#__PURE__*/React.createElement("td", {
    className: "acts"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => db.ref("courts/" + c.id + "/status").set("inProgress")
  }, "\u2192 WIP"), /*#__PURE__*/React.createElement("button", {
    onClick: () => db.ref("courts/" + c.id + "/status").set("renovated")
  }, "\u2713"), /*#__PURE__*/React.createElement("button", {
    className: "dng",
    onClick: () => {
      askConfirm("Delete?").then(ok => ok && db.ref("courts/" + c.id).remove());
    }
  }, "\u2715"))))))) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#6B7280"
    }
  }, "No reports")), tab === "forum" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Forum Moderation"), fl.length ? /*#__PURE__*/React.createElement("div", {
    className: "a-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "a-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\uD83D\uDCCC"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Title"), /*#__PURE__*/React.createElement("th", null, "Author"), /*#__PURE__*/React.createElement("th", null, "\u2191"), /*#__PURE__*/React.createElement("th", null, "\u2193"), /*#__PURE__*/React.createElement("th", null, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, fl.map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.id
  }, /*#__PURE__*/React.createElement("td", null, p.pinned ? "📌" : ""), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "a-badge a-badge-t"
  }, p.type)), /*#__PURE__*/React.createElement("td", null, p.title), /*#__PURE__*/React.createElement("td", null, p.author), /*#__PURE__*/React.createElement("td", {
    style: {
      color: "#10B981"
    }
  }, p.upvotes || 0), /*#__PURE__*/React.createElement("td", {
    style: {
      color: "#DC2626"
    }
  }, p.downvotes || 0), /*#__PURE__*/React.createElement("td", {
    className: "acts"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => db.ref("forum/" + p.id + "/pinned").set(!p.pinned)
  }, p.pinned ? "Unpin" : "Pin"), /*#__PURE__*/React.createElement("button", {
    className: "dng",
    onClick: () => {
      askConfirm("Delete?").then(ok => ok && db.ref("forum/" + p.id).remove());
    }
  }, "\uD83D\uDDD1"))))))) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#6B7280"
    }
  }, "No posts")), tab === "events" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Events"), /*#__PURE__*/React.createElement("div", {
    className: "a-form"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: ".4rem"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Title"), /*#__PURE__*/React.createElement("input", {
    value: ef.title,
    onChange: e => setEf({
      ...ef,
      title: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: ef.date,
    onChange: e => setEf({
      ...ef,
      date: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Location"), /*#__PURE__*/React.createElement("input", {
    value: ef.location,
    onChange: e => setEf({
      ...ef,
      location: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Type"), /*#__PURE__*/React.createElement("select", {
    value: ef.type,
    onChange: e => setEf({
      ...ef,
      type: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "volunteerDay"
  }, "Volunteer Day"), /*#__PURE__*/React.createElement("option", {
    value: "muralPainting"
  }, "Mural Painting"), /*#__PURE__*/React.createElement("option", {
    value: "tournament"
  }, "Tournament"), /*#__PURE__*/React.createElement("option", {
    value: "meeting"
  }, "Meeting")))), /*#__PURE__*/React.createElement("label", null, "Description"), /*#__PURE__*/React.createElement("textarea", {
    value: ef.desc,
    onChange: e => setEf({
      ...ef,
      desc: e.target.value
    }),
    rows: 2
  }), /*#__PURE__*/React.createElement("button", {
    onClick: saveEv,
    className: "btn btn-sm",
    style: {
      background: "#10B981",
      color: "#fff"
    }
  }, editId ? "💾 Update" : "+ Create")), el.length ? /*#__PURE__*/React.createElement("div", {
    className: "a-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "a-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Title"), /*#__PURE__*/React.createElement("th", null, "Date"), /*#__PURE__*/React.createElement("th", null, "Location"), /*#__PURE__*/React.createElement("th", null, "RSVPs"), /*#__PURE__*/React.createElement("th", null, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, el.map(e => /*#__PURE__*/React.createElement("tr", {
    key: e.id
  }, /*#__PURE__*/React.createElement("td", null, e.title), /*#__PURE__*/React.createElement("td", null, e.date), /*#__PURE__*/React.createElement("td", null, e.location), /*#__PURE__*/React.createElement("td", null, e.attendeeCount || 0), /*#__PURE__*/React.createElement("td", {
    className: "acts"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setEditId(e.id);
      setEf({
        title: e.title || "",
        desc: e.desc || "",
        date: e.date || "",
        location: e.location || "",
        type: e.type || "volunteerDay"
      });
    }
  }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
    className: "dng",
    onClick: () => {
      askConfirm("Delete?").then(ok => ok && db.ref("events/" + e.id).remove());
    }
  }, "\uD83D\uDDD1"))))))) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#6B7280"
    }
  }, "No events")), tab === "leaderboard" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Leaderboard"), ll.length ? /*#__PURE__*/React.createElement("div", {
    className: "a-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "a-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "#"), /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Points"), /*#__PURE__*/React.createElement("th", null, "Adjust"))), /*#__PURE__*/React.createElement("tbody", null, ll.map((u, i) => /*#__PURE__*/React.createElement("tr", {
    key: u.id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      color: i < 3 ? "#10B981" : "inherit"
    }
  }, i + 1), /*#__PURE__*/React.createElement("td", null, u.name || u.id), /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: "'Space Mono',monospace",
      fontWeight: 700
    }
  }, u.points || 0), /*#__PURE__*/React.createElement("td", {
    className: "acts"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => db.ref("leaderboard/" + u.id + "/points").transaction(v => Math.max(0, (v || 0) + 10))
  }, "+10"), /*#__PURE__*/React.createElement("button", {
    onClick: () => db.ref("leaderboard/" + u.id + "/points").transaction(v => Math.max(0, (v || 0) + 50))
  }, "+50"), /*#__PURE__*/React.createElement("button", {
    onClick: () => db.ref("leaderboard/" + u.id + "/points").transaction(v => Math.max(0, (v || 0) - 10))
  }, "-10"), /*#__PURE__*/React.createElement("button", {
    className: "dng",
    onClick: () => db.ref("leaderboard/" + u.id + "/points").set(0)
  }, "Reset"))))))) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#6B7280"
    }
  }, "Empty")), tab === "users" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Users"), /*#__PURE__*/React.createElement("button", {
    onClick: () => csv(ul.map(u => ({
      name: u.name,
      email: u.email,
      points: u.points,
      volunteer: u.volunteer ? "Yes" : "No"
    })), "users.csv"),
    className: "btn btn-sm btn-green mb-1"
  }, "\uD83D\uDCE5 CSV"), ul.length ? /*#__PURE__*/React.createElement("div", {
    className: "a-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "a-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "Points"), /*#__PURE__*/React.createElement("th", null, "Vol"))), /*#__PURE__*/React.createElement("tbody", null, ul.map(u => /*#__PURE__*/React.createElement("tr", {
    key: u.id
  }, /*#__PURE__*/React.createElement("td", null, u.name), /*#__PURE__*/React.createElement("td", null, u.email), /*#__PURE__*/React.createElement("td", null, u.points || 0), /*#__PURE__*/React.createElement("td", null, u.volunteer ? "✓" : "")))))) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#6B7280"
    }
  }, "No users")), tab === "sherifs" && React.createElement(AdminSherifsTab, null))));
}
