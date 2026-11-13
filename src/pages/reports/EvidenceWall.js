import { COURTS, db, g2pSfx, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { compressImage } from "../../lib/compress-image.js";
import { courtStatusView } from "../../lib/court-status-view.js";
import { getVoterKey } from "../../lib/get-voter-key.js";
import { logActivity } from "../../lib/log-activity.js";
import { anonName } from "../../lib/next-lang.js";
import { useRef, useState } from "../../lib/react.js";

/* === Reports Page === */
/* === Evidence Wall (#2.1) === */
export function EvidenceWall() {
  const { t, toast, user } = useApp();
  const [filterCourt, setFilterCourt] = useState("all");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selCourt, setSelCourt] = useState(COURTS[0].id);
  const [caption, setCaption] = useState("");
  const [gps, setGps] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [kind, setKind] = useState("evidence");
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [myVotes, setMyVotes] = useState(() => { try { return JSON.parse(localStorage.getItem("g2p_gvotes") || "{}") || {}; } catch (e) { return {}; } });
  const fileRef = useRef(null);
  const gallery = useFirebase("gallery");
  // Most-voted evidence first, then the newest.
  const imgs = gallery
    ? Object.entries(gallery).map(([id, g]) => ({ id, ...g })).filter(g => g && g.img && (!g.courtId || COURTS.some(c => c.id === g.courtId)))
        .sort((a, b) => ((b.votes || 0) - (a.votes || 0)) || ((b.timestamp || 0) - (a.timestamp || 0)))
    : [];
  const vote = id => {
    if (myVotes[id]) return;
    const next = Object.assign({}, myVotes, { [id]: 1 });
    setMyVotes(next);
    try { localStorage.setItem("g2p_gvotes", JSON.stringify(next)); } catch (e) {}
    db.ref("gallery/" + id + "/votes").transaction(v => (v || 0) + 1);
    g2pSfx("click");
  };
  // Courts that have both a "before" and an "after" photo get a side-by-side pair on top.
  const pairs = COURTS.map(c => ({ c: c, b: imgs.find(p => p.courtId === c.id && p.kind === "before"), a: imgs.find(p => p.courtId === c.id && p.kind === "after") })).filter(x => x.b && x.a);
  const kindLabel = k => k === "before" ? L3("Înainte", "Before", "Előtte") : k === "after" ? L3("După", "After", "Utána") : L3("Dovadă", "Evidence", "Bizonyíték");
  const filtered = filterCourt === "all" ? imgs : imgs.filter(p => p.courtId === filterCourt);
  const uniqueWitnesses = new Set(imgs.map(p => p.author || "?")).size;
  const courtsDoc = new Set(imgs.filter(p => p.courtId).map(p => p.courtId)).size;
  const statusColor = c => courtStatusView(c, t).color;
  const statusLabel = c => courtStatusView(c, t).label;
  const onFile = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setPreview(await compressImage(file, 900, 0.72)); }
    catch { toast(t.error); }
  };
  const captureGps = () => {
    if (!navigator.geolocation) { toast(t.error); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setGps({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) }); toast(t.gpsAdded); },
      () => toast(t.error)
    );
  };
  const upload = () => {
    if (!preview) { toast(t.needPhoto); return; }
    setBusy(true);
    const c = COURTS.find(x => x.id === selCourt) || COURTS[0];
    db.ref("gallery").push({
      courtId: selCourt, courtName: c.name, neighbourhood: c.neighbourhood, status: c.status,
      caption: caption.trim(), img: preview,
      author: anonName(user?.name || "Anonim"), voterKey: getVoterKey(),
      gps: gps || null, isEvidence: true, kind: kind, votes: 0, timestamp: Date.now()
    }).then(() => {
      logActivity("photo", user?.name || "Anonim", selCourt);
      toast(t.evidenceAdded);
      setPreview(null); setCaption(""); setGps(null); setBusy(false); setShowUpload(false);
      if (fileRef.current) fileRef.current.value = "";
    }).catch(() => { toast(t.error); setBusy(false); });
  };
  const courtsWithPhotos = COURTS.filter(c => imgs.some(p => p.courtId === c.id));
  return React.createElement("div", null,
    React.createElement("div", { className: "flex gap-2 mb-2", style: { flexWrap: "wrap" } },
      [
        [imgs.length, "📸", null],
        [uniqueWitnesses, t.witnessCount, null],
        [courtsDoc, t.courtsDocumented, "var(--coral)"]
      ].map(([val, label, color], i) =>
        React.createElement("div", { key: i, className: "card", style: { flex: 1, minWidth: 70, textAlign: "center", padding: ".6rem .4rem" } },
          React.createElement("div", { className: "stat-number", style: { fontSize: "1.5rem", color: color || "inherit" } }, val),
          React.createElement("div", { className: "stat-label", style: { fontSize: ".72rem" } }, label)
        )
      )
    ),
    React.createElement("button", {
      className: "btn btn-block mb-2",
      style: { background: showUpload ? "var(--border)" : "var(--green)", color: "#fff" },
      onClick: () => setShowUpload(v => !v)
    }, showUpload ? "✕ " + t.cancel : "📷 " + t.addEvidence),
    showUpload && React.createElement("div", { className: "card mb-2", style: { borderLeft: "3px solid var(--green)" } },
      React.createElement("label", {
        htmlFor: "ew-photo",
        style: { display: "block", border: "2px dashed var(--border)", borderRadius: 10, padding: ".8rem", cursor: "pointer", textAlign: "center", marginBottom: ".6rem" }
      },
        preview
          ? React.createElement("img", { src: preview, alt: "preview", style: { width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 } })
          : React.createElement("div", null,
              React.createElement("div", { style: { fontSize: "2.2rem" } }, "📷"),
              React.createElement("div", { className: "text-sm", style: { color: "var(--textSec)" } }, t.choosePhoto)
            )
      ),
      React.createElement("input", { id: "ew-photo", ref: fileRef, type: "file", accept: "image/*", capture: "environment", onChange: onFile, style: { display: "none" } }),
      React.createElement("select", { value: selCourt, onChange: e => setSelCourt(e.target.value), className: "mb-1" },
        COURTS.map(c => React.createElement("option", { key: c.id, value: c.id }, c.name))
      ),
      React.createElement("div", { className: "rp-chips", style: { marginBottom: ".5rem" } }, ["evidence", "before", "after"].map(k =>
        React.createElement("button", { key: k, className: "rp-chip" + (kind === k ? " on" : ""), onClick: () => setKind(k) }, (k === "before" ? "⏪ " : k === "after" ? "⏩ " : "📸 ") + kindLabel(k)))),
      React.createElement("textarea", { value: caption, onChange: e => setCaption(e.target.value), rows: 2, placeholder: t.photoCaptionPh, className: "mb-1" }),
      React.createElement("div", { className: "flex gap-1" },
        React.createElement("button", {
          className: "btn btn-sm " + (gps ? "btn-green" : "btn-outline"),
          onClick: captureGps, title: t.gpsOptional
        }, "", gps ? " ✓" : " GPS"),
        React.createElement("button", {
          className: "btn btn-green", style: { flex: 1 },
          onClick: upload, disabled: busy || !preview,
          style: { flex: 1, opacity: !preview ? .5 : 1, cursor: !preview ? "not-allowed" : "pointer" }
        }, busy ? "..." : t.addToWall)
      )
    ),
    pairs.length > 0 && React.createElement("div", { className: "ba-wrap" },
      React.createElement("h4", null, L3("Înainte / După", "Before / After", "Előtte / Utána")),
      pairs.map(x => React.createElement("div", { key: x.c.id, className: "ba-pair card" },
        [x.b, x.a].map(p => React.createElement("figure", { key: p.id },
          React.createElement("img", { src: p.img, alt: kindLabel(p.kind) + " — " + x.c.name, loading: "lazy" }),
          React.createElement("figcaption", null, kindLabel(p.kind) + (p.timestamp ? " · " + new Date(p.timestamp).toLocaleDateString() : "")))),
        React.createElement("p", null, "📍 " + x.c.name)))),
    imgs.length > 0 && React.createElement("div", { className: "flex gap-1 mb-2", style: { overflowX: "auto", paddingBottom: ".3rem" } },
      React.createElement("button", { className: "btn btn-sm " + (filterCourt === "all" ? "btn-green" : "btn-outline"), onClick: () => setFilterCourt("all") }, t.allCourts),
      courtsWithPhotos.map(c => React.createElement("button", {
        key: c.id,
        className: "btn btn-sm " + (filterCourt === c.id ? "btn-green" : "btn-outline"),
        style: { whiteSpace: "nowrap", flexShrink: 0 },
        onClick: () => setFilterCourt(c.id)
      }, c.name.split(" ").slice(0, 2).join(" ")))
    ),
    filtered.length === 0
      ? React.createElement("p", { style: { color: "var(--textSec)", textAlign: "center", padding: "2rem 0" } }, t.noEvidence)
      : React.createElement("div", { style: { columns: "2 150px", gap: ".5rem" } },
          filtered.map(p => {
            const c = COURTS.find(x => x.id === p.courtId);
            return React.createElement("div", { key: p.id, className: "card", style: { breakInside: "avoid", marginBottom: ".5rem", padding: 0, overflow: "hidden" } },
              React.createElement("img", { src: p.img, alt: p.caption || "evidence", loading: "lazy", style: { width: "100%", display: "block", objectFit: "cover", maxHeight: 220, minHeight: 80 } }),
              React.createElement("div", { style: { padding: ".45rem .6rem" } },
                c && React.createElement("div", { className: "flex gap-1 mb-1", style: { flexWrap: "wrap" } },
                  React.createElement("span", { className: "badge", style: { background: statusColor(c) + "22", color: statusColor(c), fontSize: ".7rem" } }, c.name.split(" ").slice(0,2).join(" ")),
                  React.createElement("span", { className: "badge " + courtStatusView(c, t).badge, style: { fontSize: ".7rem" } }, statusLabel(c))
                ),
                p.caption && React.createElement("p", { style: { fontSize: ".78rem", marginBottom: ".25rem", lineHeight: 1.3 } }, p.caption),
                React.createElement("div", { className: "flex justify-between items-center" },
                  React.createElement("span", { style: { fontSize: ".68rem", color: "var(--textSec)" } }, (p.kind && p.kind !== "evidence" ? kindLabel(p.kind) + " · " : "") + anonName(p.author || "Anonim")),
                  React.createElement("button", { className: "ev-vote" + (myVotes[p.id] ? " on" : ""), onClick: () => vote(p.id), "aria-pressed": !!myVotes[p.id], title: L3("Dovadă bună", "Good evidence", "Jó bizonyíték") }, "👍 " + (p.votes || 0))),
                React.createElement("div", { className: "flex justify-between" },
                  React.createElement("span", null),
                  React.createElement("span", { style: { fontSize: ".68rem", color: "var(--textSec)" } },
                    p.gps ? "📍 " : "",
                    p.timestamp ? new Date(p.timestamp).toLocaleDateString() : ""
                  )
                )
              )
            );
          })
        )
  );
}
