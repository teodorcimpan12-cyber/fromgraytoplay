import { ACTIVE_CITY, COURTS, useApp } from "../../app/core.js";
import { MapView } from "../../components/MapView.js";
import { SatSwipe } from "../../components/SatSwipe.js";
import { SibiuProgressBanner } from "../../components/SibiuProgressBanner.js";
import { TiltDiv } from "../../components/TiltDiv.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { courtStatusView, extraCourts, getCourtWeather } from "../../lib/court-status-view.js";
import { hoodName } from "../../lib/next-lang.js";
import { useEffect, useState } from "../../lib/react.js";
import { CourtDetail } from "../court-detail/CourtDetail.js";
import { AtlasSportCard } from "./AtlasSportCard.js";
import { BookingModal } from "./BookingModal.js";
import { ReportModal } from "./ReportModal.js";

/* ============================================================
   SEASON 4 — CIVIC UTILITY PACK
   Shared utilities + components. All animations gated behind
   prefers-reduced-motion + .no-fx. Firebase reads null-guarded.
   ============================================================ */

/* Haversine great-circle distance in km between two lat/lng pairs. */
export function haversineKm(lat1, lng1, lat2, lng2) {
  var toRad = function (d) { return d * Math.PI / 180; };
  var R = 6371;
  var dLat = toRad(lat2 - lat1);
  var dLng = toRad(lng2 - lng1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function CourtsPage() {
  const {
    t,
    lang,
    toast,
    user,
    setPage
  } = useApp();
  const [tab, setTab] = useState("map");
  const [filter, setFilter] = useState("all");
  const [hood, setHood] = useState("all");
  const [sel, setSel] = useState(null);
  const [showRep, setShowRep] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [myLoc, setMyLoc] = useState(null);
  const [locating, setLocating] = useState(false);
  const fbCourts = useFirebase("courts");
  const allGames = useFirebase("games");
  const extra = extraCourts(fbCourts);
  const all = [...COURTS, ...extra];
  // Season 3: live court heat — check-ins within the last 2 hours.
  const heatNow = id => {
    const ci = fbCourts && fbCourts[id] && fbCourts[id].checkins;
    if (!ci) return 0;
    const cutoff = Date.now() - 7200000;
    return Object.values(ci).filter(x => ((x && (x.ts || x.timestamp)) || 0) > cutoff).length;
  };
  const heatCls = n => n >= 5 ? " heat-3" : n >= 3 ? " heat-2" : n >= 1 ? " heat-1" : "";
  // Feature 1: Near Me — distance helpers.
  const distKm = c => (myLoc && c.lat && c.lng) ? haversineKm(myLoc.lat, myLoc.lng, c.lat, c.lng) : null;
  const fmtDist = km => km == null ? "" : (km < 1 ? Math.round(km * 1000) + " m" : km.toFixed(1) + " km");
  const walkMin = km => km == null ? 0 : Math.max(1, Math.round(km / 4.8 * 60));
  const findNearMe = () => {
    if (!navigator.geolocation) { toast(t.nearMeDenied); return; }
    if (myLoc) { setMyLoc(null); return; } // toggle off
    setLocating(true);
    try {
      navigator.geolocation.getCurrentPosition(
        p => { setMyLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); },
        () => { setLocating(false); toast(t.nearMeDenied); },
        { timeout: 8000, maximumAge: 60000 }
      );
    } catch (e) { setLocating(false); toast(t.nearMeDenied); }
  };
  let filtered = all.filter(c => (filter === "all" || c.status === filter) && (hood === "all" || c.neighbourhood === hood));
  if (myLoc) filtered = filtered.slice().sort((a, b) => {
    const da = distKm(a), db2 = distKm(b);
    if (da == null) return 1; if (db2 == null) return -1;
    return da - db2;
  });
  const gameCountFor = id => allGames && allGames[id] ? Object.keys(allGames[id]).length : 0;
  // Deep links: "#court-{id}" opens the detail (shareCourt URLs); back button closes it.
  const openCourt = c => {
    setSel(c);
    if (c && location.hash !== "#court-" + c.id) history.pushState(null, "", "#court-" + c.id);
  };
  const closeCourt = () => {
    setSel(null);
    if (/^#court-/.test(location.hash)) history.replaceState(null, "", "#courts");
  };
  useEffect(() => {
    const sync = () => {
      const m = location.hash.match(/^#court-(.+)$/);
      if (m) {
        const c = all.find(x => x.id === m[1]);
        if (c) setSel(c);
      } else {
        setSel(null);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [fbCourts]);
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-in"
  }, /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-2"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "\uD83C\uDFDF\uFE0F ", t.courts), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-sm",
    onClick: () => setShowRep(true)
  }, "+ ", t.reportCourt)), /*#__PURE__*/React.createElement(SibiuProgressBanner, null), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1 mb-2",
    style: {
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: filter,
    onChange: e => setFilter(e.target.value),
    style: {
      width: "auto",
      padding: ".3rem .5rem",
      fontSize: ".82rem"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, t.allStatus), ["degraded", "inProgress", "renovated", "excellent", "verified", "satellite", "unverified"]
    .filter(s => all.some(c => c.status === s))
    .map(s => /*#__PURE__*/React.createElement("option", {
      key: s,
      value: s
    }, s === "verified" ? t.fieldVerified : t[s]))), /*#__PURE__*/React.createElement("select", {
    value: hood,
    onChange: e => setHood(e.target.value),
    style: {
      width: "auto",
      padding: ".3rem .5rem",
      fontSize: ".82rem"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, t.neighbourhood), [...new Set(COURTS.map(c => c.neighbourhood))].map(h => React.createElement("option", {
    key: h,
    value: h
  }, hoodName(h, lang))))),/*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: tab === "map" ? "active" : "",
    onClick: () => setTab("map")
  }, "\uD83D\uDDFA\uFE0F"), /*#__PURE__*/React.createElement("button", {
    className: tab === "list" ? "active" : "",
    onClick: () => setTab("list")
  }, "\uD83D\uDCCB")), tab === "map" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MapView, {
    courts: filtered,
    onSelect: openCourt,
    height: "clamp(360px, 64vh, 680px)"
  }),/*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: { color: "var(--textSec)", textAlign: "center" }
  }, lang === "ro"
    ? /*#__PURE__*/React.createElement("span", null, ACTIVE_CITY === "sibiu" ? "Surs\u0103: OpenStreetMap + auditul din satelit al echipei; stadioane din presa local\u0103. " : "Surs\u0103: cercetare de teren + date municipale T\xE2rgu Mure\u0219. ", /*#__PURE__*/React.createElement("a", { href: "https://www.google.com/maps/search/terenuri+sport+" + (ACTIVE_CITY === "sibiu" ? "Sibiu" : "Targu+Mures"), target: "_blank", style: { color: "var(--green)" } }, "Caut\u0103 pe Google Maps \u2192"))
    : /*#__PURE__*/React.createElement("span", null, ACTIVE_CITY === "sibiu" ? "Source: OpenStreetMap + the team's satellite audit; stadiums from local press. " : "Source: field research + T\xE2rgu Mure\u0219 municipal data. ", /*#__PURE__*/React.createElement("a", { href: "https://www.google.com/maps/search/sports+courts+" + (ACTIVE_CITY === "sibiu" ? "Sibiu" : "Targu+Mures"), target: "_blank", style: { color: "var(--green)" } }, "Search Google Maps \u2192"))), React.createElement(AtlasSportCard, null)), tab === "list" && /*#__PURE__*/React.createElement("div", {
    className: "grid gap-1"
  }, filtered.map(c => /*#__PURE__*/React.createElement(TiltDiv, {
    key: c.id,
    max: 5,
    className: "card card-accent card-link" + heatCls(heatNow(c.id)),
    onClick: () => openCourt(c)
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center court-row"
  }, /*#__PURE__*/React.createElement("div", { style: { flex: "1 1 12rem", minWidth: 0 } }, /*#__PURE__*/React.createElement("h3", {
    className: "barlow",
    style: {
      fontSize: "1.05rem"
    }
  }, c.name), /*#__PURE__*/React.createElement("p", {
    className: "text-xs",
    style: {
      color: "var(--textSec)"
    }
  }, c.address)), c.condition != null && /*#__PURE__*/React.createElement("span", {
    className: "badge",
    title: getCourtWeather(c.condition, t).label,
    style: { background: getCourtWeather(c.condition, t).color + "22", color: getCourtWeather(c.condition, t).color, marginRight: ".3rem" }
  }, getCourtWeather(c.condition, t).icon, " ", getCourtWeather(c.condition, t).label), /*#__PURE__*/React.createElement("span", {
    className: `badge ${courtStatusView(c, t).badge}`
  }, courtStatusView(c, t).label),
  gameCountFor(c.id) > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge badge-coral",
    style: { animation: "livePing 1.5s infinite" }
  }, "⚽ ", gameCountFor(c.id), " ", t.activeGames),
  heatNow(c.id) > 0 && React.createElement("span", {
    className: "badge badge-coral",
    style: { marginLeft: ".3rem" }
  }, "🔥 ", heatNow(c.id), " ", t.heatPlaying),
  myLoc && distKm(c) != null && React.createElement("span", {
    className: "badge",
    style: { background: "var(--teal)22", color: "var(--teal)", marginLeft: ".3rem" }
  }, "📍 ", fmtDist(distKm(c)), " · ", walkMin(distKm(c)), " ", (t.walkMin || "min pe jos"))
  ), /*#__PURE__*/React.createElement("div", {
    className: "progress-bar mt-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill",
    style: {
      width: c.progress + "%"
    }
  }))))))), React.createElement(SatSwipe, null), sel && /*#__PURE__*/React.createElement(CourtDetail, {
    court: sel,
    onClose: closeCourt,
    onBook: () => setShowBook(true)
  }), showRep && /*#__PURE__*/React.createElement(ReportModal, {
    onClose: () => setShowRep(false)
  }), showBook && sel && /*#__PURE__*/React.createElement(BookingModal, {
    court: sel,
    onClose: () => setShowBook(false)
  }));
}
