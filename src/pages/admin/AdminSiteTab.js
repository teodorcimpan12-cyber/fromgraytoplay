import { COURTS_ALL, db, useApp } from "../../app/core.js";
import { ACCENT_PRESETS, ACCENT_SHADES, BANNER_COLORS } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { extraCourts } from "../../lib/court-status-view.js";
import { useState } from "../../lib/react.js";
import { BudgetAdmin } from "./BudgetAdmin.js";
import { askConfirm, resetSiteSettings } from "./helpers.js";

export function AdminSiteTab() {
  const { toast, isSherif } = useApp();
  const s = useFirebase("settings") || {};
  const flags = s.flags || {};
  const fbCourts = useFirebase("courts");
  const allCourts = COURTS_ALL.concat(extraCourts(fbCourts, true));
  // Every write reports success/failure — a silent permission error was why
  // switches "didn't work" (they flipped, then snapped back).
  const fail = e => toast("⛔ " + (/permission/i.test(e && e.message || "") ? "Permission denied — sign in again as owner." : (e && e.message) || "Write failed"), 6000);
  const set = (path, val, okMsg) => db.ref("settings/" + path).set(val)
    .then(() => okMsg && toast(okMsg)).catch(fail);
  const banner = s.banner && typeof s.banner === "object" ? s.banner : {};
  const [bText, setBText] = useState("");
  const [bType, setBType] = useState(banner.type || "info");
  const [bColor, setBColor] = useState(banner.color || "");
  const [bcast, setBcast] = useState("");
  const [custom, setCustom] = useState(s.accent || "#10B981");
  const [custom2, setCustom2] = useState(s.accent2 || "#0D9488");
  const Row = (title, sub, child, danger) => React.createElement("div", { className: "a-row" + (danger ? " a-danger" : ""), key: title },
    React.createElement("div", { style: { minWidth: 0 } },
      React.createElement("div", { style: { fontWeight: 600, fontSize: ".88rem" } }, title),
      sub && React.createElement("div", { style: { color: "#6B7280", fontSize: ".74rem" } }, sub)),
    React.createElement("div", { className: "flex gap-1 items-center", style: { flexShrink: 0 } }, child));
  const Toggle = (on, onChange) => React.createElement("button", {
    className: "a-toggle" + (on ? " on" : ""), onClick: () => onChange(!on), "aria-pressed": !!on
  }, React.createElement("i", null));
  const inS = { flex: 1, minWidth: 180, background: "#0D101F", border: "1px solid #1E2235", color: "#E5E7EB" };
  const selS = { width: "auto", background: "#0D101F", border: "1px solid #1E2235", color: "#E5E7EB" };
  const setAccent = (p, p2, name) => db.ref("settings").update({ accent: p || null, accent2: p2 || null })
    .then(() => toast("🎨 " + (name || p || "Default"))).catch(fail);
  const curP = s.accent || "", curS = s.accent2 || "";
  const bcAge = s.broadcast && s.broadcast.ts ? Math.round((Date.now() - s.broadcast.ts) / 6e4) : null;
  const previewBg = /^#[0-9a-fA-F]{6}$/.test(bColor) ? { background: bColor } : undefined;
  return React.createElement("div", null,
    React.createElement("h2", null, "⚙️ Site Control"),
    React.createElement("p", { style: { color: "#6B7280", fontSize: ".8rem", marginBottom: "1rem" } },
      "Live switches — every visitor's app reacts instantly. No deploy needed."),
    React.createElement("div", { className: "a-row", style: { flexWrap: "wrap", borderColor: "#10B981" } },
      React.createElement("div", { style: { minWidth: 0, flex: 1 } },
        React.createElement("div", { style: { fontWeight: 700, fontSize: ".92rem" } }, "🩹 Something broke while testing?"),
        React.createElement("div", { style: { color: "#9CA3AF", fontSize: ".74rem" } },
          "Turns off maintenance, removes banner + broadcast, re-enables every feature, restores G2P colours, clears court of the week and custom texts. Votes, signups, users and sherifs are NOT touched.")),
      React.createElement("button", { className: "a-normal", onClick: () => {
        askConfirm("Reset all Site Control settings back to normal?").then(ok => ok && resetSiteSettings()
          .then(() => { setBColor(""); setBType("info"); toast("✅ Back to normal — site restored to defaults", 5000); })
          .catch(fail));
      } }, "↺ BACK TO NORMAL")),
    React.createElement("h3", { className: "a-sec" }, "🚦 Status"),
    Row("Maintenance mode", "Locks the whole site behind a maintenance screen. Admin keeps access.",
      Toggle(!!s.maintenance, v => set("maintenance", v, v ? "🛠️ Maintenance ON" : "✅ Maintenance OFF")), !!s.maintenance),
    React.createElement("h3", { className: "a-sec" }, "📣 Announcement banner"),
    Row("Visible", banner.text ? "Now: “" + banner.text + "”" : "No banner text saved yet.",
      React.createElement(React.Fragment, null,
        Toggle(banner.on === true, v => {
          if (v && !banner.text) { toast("Write a banner text first, then Save."); return; }
          set("banner/on", v, v ? "📣 Banner shown" : "🙈 Banner hidden");
        }),
        banner.text && React.createElement("button", { className: "a-del", title: "Delete banner", onClick: () => {
          db.ref("settings/banner").remove().then(() => toast("🗑 Banner deleted")).catch(fail);
        } }, "🗑"))),
    React.createElement("div", { className: "a-row", style: { flexWrap: "wrap" } },
      React.createElement("input", { placeholder: banner.text || "Banner text…", value: bText,
        onChange: e => setBText(e.target.value), style: inS, maxLength: 200 }),
      React.createElement("select", { value: bType, onChange: e => setBType(e.target.value), style: selS },
        React.createElement("option", { value: "info" }, "info"),
        React.createElement("option", { value: "warn" }, "warn"),
        React.createElement("option", { value: "alert" }, "alert")),
      React.createElement("select", { value: bColor, onChange: e => setBColor(e.target.value), style: selS, title: "Banner colour (independent of site accent)" },
        BANNER_COLORS.map(([hex, n]) => React.createElement("option", { key: n, value: hex }, n))),
      React.createElement("button", { className: "btn btn-sm btn-green", onClick: () => {
        const text = bText.trim() || banner.text || "";
        if (!text) { toast("Write a banner text first."); return; }
        set("banner", { on: true, text, type: bType, color: bColor || null }, "📣 Banner saved & shown");
        setBText("");
      } }, "Save & show")),
    (bText.trim() || banner.text) && React.createElement("div", { className: "site-banner sb-" + bType, style: Object.assign({ borderRadius: 8, marginBottom: ".5rem", paddingRight: "1rem" }, previewBg) },
      "Preview: " + (bText.trim() || banner.text)),
    React.createElement("h3", { className: "a-sec" }, "📢 Broadcast toast"),
    React.createElement("div", { className: "a-row", style: { flexWrap: "wrap" } },
      React.createElement("input", { placeholder: "Message pushed live to every visitor, once…", value: bcast, maxLength: 160,
        onChange: e => setBcast(e.target.value), onKeyDown: e => e.key === "Enter" && e.target.nextSibling && e.target.nextSibling.click(), style: inS }),
      React.createElement("button", { className: "btn btn-sm btn-green", onClick: () => {
        const text = bcast.trim();
        if (!text) { toast("Write a message first."); return; }
        set("broadcast", { text, ts: firebase.database.ServerValue.TIMESTAMP }, "📢 Sent to everyone online: " + text);
        setBcast("");
      } }, "Send")),
    Row("Last broadcast", s.broadcast && s.broadcast.text
        ? "“" + s.broadcast.text + "” · " + (bcAge < 1 ? "just now" : bcAge < 60 ? bcAge + " min ago" : Math.round(bcAge / 60) + " h ago") + (bcAge >= 1440 ? " · expired (no longer shown)" : "")
        : "None. Visitors see each message once, as an 8-second toast, for 24h.",
      s.broadcast && React.createElement("button", { className: "a-del", onClick: () => {
        db.ref("settings/broadcast").remove().then(() => toast("🗑 Broadcast cleared")).catch(fail);
      } }, "Clear")),
    React.createElement("h3", { className: "a-sec" }, "🎛 Feature flags"),
    Row("Petition", "Page + nav link", Toggle(flags.petition !== false, v => set("flags/petition", v))),
    Row("Community", "Forum, events, gallery, teams", Toggle(flags.community !== false, v => set("flags/community", v))),
    Row("Bookings", "Reserve-a-slot button on court pages", Toggle(flags.booking !== false, v => set("flags/booking", v))),
    Row("Animations & effects", "Site-wide kill-switch for the show-off effect pack", Toggle(flags.effects !== false, v => set("flags/effects", v))),
    React.createElement("h3", { className: "a-sec" }, "⭐ Court of the week"),
    React.createElement("div", { className: "a-row" },
      React.createElement("select", { value: s.featuredCourtId || "", onChange: e => set("featuredCourtId", e.target.value),
        style: { background: "#0D101F", border: "1px solid #1E2235", color: "#E5E7EB" } },
        React.createElement("option", { value: "" }, "— none —"),
        allCourts.map(c => React.createElement("option", { key: c.id, value: c.id }, c.name)))),
    React.createElement("h3", { className: "a-sec" }, "🎨 Site colours (accent)"),
    React.createElement("p", { style: { color: "#6B7280", fontSize: ".74rem", margin: "-.3rem 0 .5rem" } },
      "Changes buttons, links, tabs and highlights for everyone. Works with or without a banner — the banner keeps its own colour."),
    React.createElement("div", { className: "a-row" },
      React.createElement("div", { className: "a-pal" },
        React.createElement("div", { className: "a-pal-row" },
          React.createElement("b", null, "Themes"),
          ACCENT_PRESETS.map(([p, p2, name]) => React.createElement("button", {
            key: name, className: "a-preset" + (curP === p && curS === p2 ? " on" : ""), onClick: () => setAccent(p, p2, name)
          }, React.createElement("i", { style: { background: "linear-gradient(135deg," + (p || "#10B981") + " 50%," + (p2 || "#0D9488") + " 50%)" } }), name))),
        ACCENT_SHADES.map(([fam, list]) => React.createElement("div", { className: "a-pal-row", key: fam },
          React.createElement("b", null, fam),
          list.map(hex => React.createElement("button", {
            key: hex, title: hex,
            className: "a-swatch" + (curP.toUpperCase() === hex ? " on" : ""),
            style: { background: hex },
            onClick: () => setAccent(hex, curS, hex)
          })))),
        React.createElement("div", { className: "a-pal-row" },
          React.createElement("b", null, "Custom"),
          React.createElement("input", { type: "color", value: custom, onChange: e => setCustom(e.target.value), title: "Primary", style: { width: 44, height: 30, padding: 0, border: "none", background: "none" } }),
          React.createElement("input", { type: "color", value: custom2, onChange: e => setCustom2(e.target.value), title: "Secondary", style: { width: 44, height: 30, padding: 0, border: "none", background: "none" } }),
          React.createElement("button", { className: "btn btn-sm btn-green", onClick: () => setAccent(custom.toUpperCase(), custom2.toUpperCase(), "Custom") }, "Apply"),
          React.createElement("button", { className: "a-del", onClick: () => setAccent("", "", "G2P Classic") }, "↺ Default"),
          React.createElement("span", { style: { fontSize: ".72rem", color: "#9CA3AF" } }, "Now: " + (curP || "#10B981") + " / " + (curS || "#0D9488"))))),
    React.createElement(BudgetAdmin, null),
    !isSherif && React.createElement("h3", { className: "a-sec", style: { color: "#F87171" } }, "☢️ Danger zone"),
    !isSherif && Row("Reset petition votes", "Sets flip / mural / both to 0. Signup rows are kept.",
      React.createElement("button", { className: "a-del", onClick: () => {
        askConfirm("Reset ALL votes to 0?").then(ok => ok && db.ref("votes").set({ flip: 0, mural: 0, both: 0 }));
      } }, "Reset"), true),
    !isSherif && Row("Clear activity feed", "Removes every entry from activity/ (ticker + feed + notifications).",
      React.createElement("button", { className: "a-del", onClick: () => {
        askConfirm("Delete the entire activity feed?").then(ok => ok && db.ref("activity").remove());
      } }, "Clear"), true));
}
