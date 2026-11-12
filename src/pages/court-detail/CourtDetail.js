import { SatFinding, db, useApp } from "../../app/core.js";
import { BadgeUnlockModal } from "../../components/BadgeUnlockModal.js";
import { CourtConditionQuick } from "../../components/CourtConditionQuick.js";
import { SITE } from "../../data/constants.js";
import { useBadges } from "../../hooks/useBadges.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useFollows } from "../../hooks/useFollows.js";
import { aiEstimateOf } from "../../lib/ai-estimate-of.js";
import { cityName } from "../../lib/city-name.js";
import { courtStatusView, getCourtWeather } from "../../lib/court-status-view.js";
import { g2pMood } from "../../lib/g2p-celebrate.js";
import { logActivity } from "../../lib/log-activity.js";
import { useEffect, useState } from "../../lib/react.js";
import { ActiveGames } from "./ActiveGames.js";
import { AdoptCourt } from "./AdoptCourt.js";
import { AiLetterModal } from "./AiLetterModal.js";
import { CourtHealthRing } from "./CourtHealthRing.js";
import { CourtPulse } from "./CourtPulse.js";
import { CourtQRCard } from "./CourtQRCard.js";
import { CourtResponder } from "./CourtResponder.js";
import { CourtSourcesCard } from "./CourtSourcesCard.js";
import { CourtTimeline } from "./CourtTimeline.js";
import { PlayNowModal } from "./PlayNowModal.js";
import { RatingSection } from "./RatingSection.js";
import { SatelliteTimeMachine } from "./SatelliteTimeMachine.js";
import { TaskBoard } from "./TaskBoard.js";
import { WantedPoster } from "./WantedPoster.js";

// Downscale + JPEG-compress a File so it fits in RTDB as a data URL (~80-150KB).
// Storage bucket isn't configured (config has only databaseURL), so photos live
// in the gallery/ node for now; migrating to Firebase Storage is the future step.
export function shareCourt(court, t, toast) {
  const url = SITE + "/#court-" + court.id;
  const title = "From Grey to Play · " + court.name;
  const text = court.name + " · " + (court.address || cityName("ro"));
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => toast(t.copiedLink)).catch(() => toast(t.error));
  }
}
/* === Court Detail === */
/* Static satellite backdrop for the court sheet: 3x3 Esri World Imagery tiles (z18) around the court. */
export function courtTileMosaic(c) {
  if (!c || typeof c.lat !== "number" || typeof c.lng !== "number") return null;
  const z = 18, n = Math.pow(2, z), rad = c.lat * Math.PI / 180;
  const fx = (c.lng + 180) / 360 * n;
  const fy = (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n;
  const x0 = Math.floor(fx) - 1, y0 = Math.floor(fy) - 1;
  const tiles = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    tiles.push({ key: i + "_" + j, src: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + z + "/" + (y0 + j) + "/" + (x0 + i), left: i * 256, top: j * 256 });
  }
  return { tiles, cx: (fx - x0) * 256, cy: (fy - y0) * 256 };
}
export function CourtDetail({
  court: c,
  onClose,
  onBook
}) {
  const {
    t,
    lang,
    toast,
    user,
    settings
  } = useApp();
  const [ci, setCi] = useState(false);
  const [showPlay, setShowPlay] = useState(false);
  useEffect(() => { g2pMood(moodOfCourt(c)); return () => g2pMood(null); }, [c && c.id]);
  const [showQR, setShowQR] = useState(false);
  const [showWanted, setShowWanted] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [unlockBadge, setUnlockBadge] = useState(null);
  const { awardBadge } = useBadges();
  const { isFollowing, toggle: toggleFollow } = useFollows();
  const following = isFollowing(c.id);
  const liveCI = useFirebase("courts/" + c.id + "/checkins");
  const cnt = liveCI ? Object.keys(liveCI).length : 0;
  const liveGames = useFirebase("games/" + c.id);
  const gameCount = liveGames ? Object.keys(liveGames).length : 0;
  const gallery = useFirebase("gallery");
  const courtPhotos = gallery ? Object.entries(gallery).map(([id, g]) => ({ id, ...g })).filter(p => p.courtId === c.id).reverse() : [];
  const occ = cnt === 0 ? "empty" : cnt < 5 ? "active" : "full";
  const doCI = () => {
    const uid = user?.id || "g" + Date.now();
    db.ref("courts/" + c.id + "/checkins/" + uid).set({
      name: user?.name || "Guest",
      ts: Date.now()
    });
    logActivity("check-in", user?.name || "Guest", c.id);
    setCi(true);
    toast(t.success);
    awardBadge("first_checkin", (b) => setUnlockBadge(b));
    setTimeout(() => db.ref("courts/" + c.id + "/checkins/" + uid).remove(), 7200000);
  };
  const doCO = () => {
    const uid = user?.id || "g" + Date.now();
    db.ref("courts/" + c.id + "/checkins/" + uid).remove();
    setCi(false);
    toast(t.success);
  };
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape" && !e.defaultPrevented) onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("cdx-open");
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.body.classList.remove("cdx-open"); window.removeEventListener("keydown", onKey); };
  }, []);
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro; // TODO: HU review
  const [tab, setTab] = useState("info");
  const [slide, setSlide] = useState(0);
  const mosaic = courtTileMosaic(c);
  const wx = getCourtWeather(c.condition, t);
  const bookOn = !(settings && settings.flags && settings.flags.booking === false);
  const photos = courtPhotos.slice(0, 8);
  const slideCount = photos.length + 1;
  const desc = (c.desc && c.desc[lang]) || c.description;
  const act = (key, kind, onClick, ic, label) => React.createElement("button", { key, className: "cd-act cd-" + kind, onClick, title: label },
    React.createElement("span", { className: "cd-ic", "aria-hidden": "true" }, ic),
    React.createElement("span", { className: "cd-l" }, label));
  const hero = React.createElement("div", { className: "cdx-hero" },
    React.createElement("div", {
      className: "cdx-slides", "data-no-drag": "true",
      onScroll: e => { const el = e.currentTarget; const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth)); if (i !== slide) setSlide(i); }
    },
      photos.map(p => React.createElement("div", { key: p.id, className: "cdx-slide" },
        React.createElement("img", { src: p.img, alt: p.caption || t.gallery, draggable: false }))),
      React.createElement("div", {
        key: "sat", className: "cdx-slide cdx-sat", role: "button", tabIndex: 0,
        "aria-label": L3("Deschide imaginea din satelit", "Open the satellite view", "Műholdkép megnyitása"),
        onClick: () => setTab("sat"),
        onKeyDown: e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTab("sat"); } }
      },
        mosaic ? React.createElement("div", { className: "cdx-mosaic", style: { marginLeft: -mosaic.cx, marginTop: -mosaic.cy, transformOrigin: mosaic.cx + "px " + mosaic.cy + "px" } },
          mosaic.tiles.map(tl => React.createElement("img", { key: tl.key, src: tl.src, alt: "", draggable: false, style: { left: tl.left, top: tl.top } }))) : React.createElement("div", { className: "cdx-nosat", "aria-hidden": "true" }, "⚽"),
        React.createElement("span", { className: "cdx-cap" }, "🛰️ " + L3("imagine din satelit", "satellite image", "műholdkép")))),
    React.createElement("div", { className: "cdx-grab", "aria-hidden": "true" }),
    React.createElement("button", {
      onClick: onClose, className: "cdx-x",
      "aria-label": lang === "ro" ? "Închide" : lang === "hu" ? "Bezárás" : "Close"
    }, "✕"),
    slideCount > 1 && React.createElement("span", { className: "cdx-count", "aria-hidden": "true" }, (Math.min(slide, slideCount - 1) + 1) + "/" + slideCount));
  const head = React.createElement("div", { className: "cdx-head" },
    React.createElement("h2", { className: "cdx-name" }, c.name),
    React.createElement("p", { className: "cdx-addr" }, c.address),
    React.createElement("div", { className: "flex gap-1", style: { flexWrap: "wrap" } },
      React.createElement("span", { className: "badge", title: wx.label, style: { background: wx.color + "22", color: wx.color } }, wx.icon, " ", wx.label),
      React.createElement("span", { className: "badge " + courtStatusView(c, t).badge }, courtStatusView(c, t).label),
      React.createElement("span", { className: "badge " + (occ === "empty" ? "badge-green" : occ === "active" ? "badge-coral" : "badge-red") },
        occ === "empty" ? "🟢 " + t.empty + " (0)" : occ === "active" ? "🟡 " + t.active + " (" + cnt + ")" : "🔴 " + t.full + " (" + cnt + ")"),
      React.createElement(AiEstimateBadge, { court: c })));
  const infoPanel = React.createElement(React.Fragment, null,
    desc && React.createElement("p", { className: "text-sm mb-1", style: { color: "var(--textSec)" } }, desc, c.osm && React.createElement("a", {
      href: "https://www.openstreetmap.org/" + c.osm, target: "_blank", rel: "noopener", style: { color: "var(--green)", marginLeft: ".4rem" }
    }, "OSM ↗"), c.src && React.createElement("a", {
      href: c.src, target: "_blank", rel: "noopener", style: { color: "var(--green)", marginLeft: ".4rem" }
    }, L3("Sursă", "Source", "Forrás") + " ↗")),
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap", margin: ".6rem 0 1rem" } },
      React.createElement(CourtHealthRing, { court: c }),
      React.createElement("div", null,
        React.createElement("div", { className: "text-xs mb-1", style: { color: "var(--textSec)", fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "1.5px" } }, t.healthScore || "Scor sănătate"),
        React.createElement("p", { className: "text-xs", style: { color: "var(--textSec)", maxWidth: 200 } },
          L3("Calculat din stare, rapoarte și evaluări", "Based on condition, reports and ratings", "Állapot, jelentések és értékelések alapján")))),
    React.createElement("div", { className: "cd-actions", style: { marginTop: 0 } },
      act("play", "coral", () => setShowPlay(true), "⚽", t.playNow),
      !ci ? act("ci", "line", doCI, "📍", t.checkIn) : act("co", "red", doCO, "📍", t.checkOut),
      act("follow", following ? "line" : "teal", () => toggleFollow(c.id), following ? "🔕" : "🔔", following ? t.unfollow : t.follow),
      act("share", "line", () => shareCourt(c, t, toast), "🔗", t.shareCourt),
      c.category !== "gym" && act("poster", "line", () => setShowWanted(true), "🪧", L3("Afiș", "Poster", "Plakát")),
      c.category !== "gym" && act("letter", "line", () => setShowLetter(true), "✉️", L3("Scrisoare AI", "AI letter", "AI-levél"))),
    React.createElement(CourtResponder, { court: c }),
    React.createElement(CourtSourcesCard, { court: c }),
    React.createElement(AiCourtCard, { court: c, onLetter: c.category !== "gym" ? () => setShowLetter(true) : null }),
    React.createElement("h4", { className: "mb-1 mt-2" }, "Progress"),
    React.createElement("div", { className: "progress-bar mb-2" }, React.createElement("div", { className: "progress-fill", style: { width: c.progress + "%" } })),
    React.createElement("h4", { className: "mb-1" }, t.accessibility),
    React.createElement("div", { className: "flex gap-1 mb-2", style: { flexWrap: "wrap" } },
      Object.entries(c.accessibility || {}).map(([k, v]) => React.createElement("span", { key: k, className: "badge " + (v ? "badge-green" : "badge-red") }, k, ": ", v ? "✓" : "✗"))));
  const communityPanel = React.createElement(React.Fragment, null,
    React.createElement("h4", { className: "mb-1" },
      React.createElement("span", { className: "live-dot", style: { display: "inline-block", verticalAlign: "middle", marginRight: ".35rem" } }),
      t.activeGames, gameCount > 0 ? " (" + gameCount + ")" : ""),
    React.createElement(ActiveGames, { court: c }),
    React.createElement(RatingSection, { court: c }),
    courtPhotos.length > 0 && React.createElement(React.Fragment, null,
      React.createElement("h4", { className: "mb-1 mt-2" }, t.gallery, " (", courtPhotos.length, ")"),
      React.createElement("div", { className: "flex gap-1 mb-2", style: { overflowX: "auto" }, "data-no-drag": "true" },
        courtPhotos.slice(0, 8).map(p => React.createElement("img", {
          key: p.id, src: p.img, alt: "evidence", title: p.caption || "",
          style: { width: 90, height: 90, objectFit: "cover", borderRadius: 8, flexShrink: 0 }
        })))),
    (c.status === "degraded" || c.status === "inProgress") && React.createElement(TaskBoard, { court: c }),
    c.category !== "gym" && React.createElement(AdoptCourt, { court: c }),
    React.createElement(CourtTimeline, { court: c }));
  const satPanel = React.createElement(React.Fragment, null,
    React.createElement(SatFinding, { court: c }),
    React.createElement(SatelliteTimeMachine, { court: c }));
  const items = [
    bookOn && { k: "book", ic: "📅", label: t.bookCourt, run: onBook },
    { k: "info", ic: "ℹ️", label: "Info", panel: true },
    { k: "sat", ic: "🛰️", label: L3("Satelit", "Satellite", "Műhold"), panel: true, mid: true },
    { k: "com", ic: "👥", label: L3("Comunitate", "Community", "Közösség"), panel: true },
    { k: "qr", ic: "📱", label: "QR", run: () => setShowQR(true) }
  ].filter(Boolean);
  const bar = React.createElement("nav", { className: "cdx-bar", "aria-label": L3("Secțiunile terenului", "Court sections", "A pálya szakaszai") },
    items.map(it => React.createElement("button", {
      key: it.k, type: "button", className: "cdx-tab" + (it.mid ? " mid" : "") + (it.panel && tab === it.k ? " on" : ""),
      "aria-current": it.panel && tab === it.k ? "true" : undefined,
      onClick: () => { if (it.panel) setTab(it.k); else it.run(); }
    },
      React.createElement("span", { className: "cdx-ic", "aria-hidden": "true" }, it.ic),
      React.createElement("span", { className: "cdx-lb" }, it.label))));
  return React.createElement("div", {
    className: "modal-overlay", onClick: onClose, role: "dialog", "aria-modal": "true", "aria-label": c.name
  },
    React.createElement("div", { className: "modal modal-lg cdx", onClick: e => e.stopPropagation() },
      React.createElement("div", { className: "cdx-media" }, hero, React.createElement("div", { className: "cdx-pulse" }, React.createElement(CourtPulse, { court: c }))),
      React.createElement("div", { className: "cdx-main" },
        head,
        React.createElement("div", { className: "cdx-body", key: tab, "data-no-drag": "true", role: "region", "aria-label": c.name },
          tab === "info" ? infoPanel : tab === "sat" ? satPanel : communityPanel),
        bar),
      // Portals: inside the court modal (animated transform) a fixed overlay is trapped in the modal's box.
      // The wrapper stops clicks bubbling (React tree) to the court overlay, which would close the court too.
      showPlay && ReactDOM.createPortal(React.createElement("div", { onClick: ev => ev.stopPropagation() }, React.createElement(PlayNowModal, { court: c, onClose: () => setShowPlay(false) })), document.body),
      showQR && ReactDOM.createPortal(React.createElement("div", { onClick: ev => ev.stopPropagation() }, React.createElement(CourtQRCard, { court: c, onClose: () => setShowQR(false) })), document.body),
      showWanted && ReactDOM.createPortal(React.createElement("div", { onClick: ev => ev.stopPropagation() }, React.createElement(WantedPoster, { court: c, onClose: () => setShowWanted(false) })), document.body),
      showLetter && ReactDOM.createPortal(React.createElement("div", { onClick: ev => ev.stopPropagation() }, React.createElement(AiLetterModal, { court: c, onClose: () => setShowLetter(false) })), document.body),
      unlockBadge && ReactDOM.createPortal(React.createElement("div", { onClick: ev => ev.stopPropagation() }, React.createElement(BadgeUnlockModal, { badge: unlockBadge, lang: lang, onClose: () => setUnlockBadge(null) })), document.body)));
}
export function AiEstimateBadge({ court: c }) {
  const { lang } = useApp();
  const est = aiEstimateOf(useFirebase("reports"), c.id);
  if (!est) return null;
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const d = est.at ? new Date(est.at).toLocaleDateString(lang === "en" ? "en-GB" : lang === "hu" ? "hu-HU" : "ro-RO") : "";
  return React.createElement("span", { className: "ai-est", title: L3("Estimare AI din pozele trimise — nu e o inspecție oficială și nu schimbă starea terenului.", "AI estimate from the photos sent — not an official inspection, it does not change the court's status.", "AI-becslés a beküldött fotókból — nem hivatalos szemle, nem módosítja a pálya állapotát.") },
    "🩺 ", L3("Estimare AI: ", "AI estimate: ", "AI-becslés: "), est.score, "/5 · ", est.n, " ", est.n === 1 ? L3("poză", "photo", "fotó") : L3("poze", "photos", "fotó"), d && " · " + d);
}
/* The two AI helpers, shown high in the court detail so people find them. */
export function AiCourtCard({ court: c, onLetter }) {
  const { lang } = useApp();
  const [verify, setVerify] = useState(false);
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const e = React.createElement;
  return e("div", { className: "ai-card" },
    e("div", { className: "ai-card-h" }, e("span", { className: "ai-card-pill" }, "✨ ", L3("NOU · AI", "NEW · AI", "ÚJ · AI")), L3("AI-ul te ajută cu terenul ăsta", "The AI helps with this court", "Az AI segít ezzel a pályával")),
    e("div", { className: "ai-card-b" },
      e("button", { className: "btn btn-green", onClick: () => setVerify(true) }, "📷 ", L3("Pune o poză — AI-ul îți spune starea", "Add a photo — the AI reads its condition", "Tölts fel fotót — az AI megmondja az állapotát")),
      onLetter && e("button", { className: "btn btn-outline", onClick: onLetter }, "✉️ ", L3("Scrisoare AI către Primărie", "AI letter to City Hall", "AI-levél a Városházának"))),
    verify && ReactDOM.createPortal(e("div", { onClick: ev => ev.stopPropagation() }, e(CourtConditionQuick, { courtId: c.id, onClose: () => setVerify(false) })), document.body));
}
export function moodOfCourt(c) {
  if (!c) return null;
  if (c.status === "degraded") return "sad";
  if (c.status === "renovated" || c.status === "excellent") return "happy";
  if (c.status === "unverified") return "curious";
  if (c.status === "satellite") return c.sat && c.sat.v === "ok" ? "happy" : "sad";
  return null;
}
