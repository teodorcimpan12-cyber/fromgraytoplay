import { db, useApp } from "../../app/core.js";
import { WB_MAP, WB_TILE, tmCache } from "../../data/constants.js";
import { escHtml } from "../../lib/next-lang.js";
import { useEffect, useRef, useState } from "../../lib/react.js";
import { tmFmt, tmSpan } from "../../lib/tm-fmt.js";
import { tmJson, tmPrecomputed } from "../../lib/tm-json.js";

export function tmReleases() {
  if (!tmCache.rel) tmCache.rel = tmJson("/data/wayback.json").then(function (d) { return d.releases; });
  return tmCache.rel;
}
export function tmTile(lat, lng, z) {
  var n = Math.pow(2, z), r = lat * Math.PI / 180;
  return { x: Math.floor((lng + 180) / 360 * n), y: Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n) };
}
export function tmLive(court, onStep) {
  return tmReleases().then(function (releases) {
    var idxById = {}; releases.forEach(function (r, i) { idxById[r.id] = i; });
    var t17 = tmTile(court.lat, court.lng, 17), rels = [];
    function walk(idx, guard) {
      if (idx < 0 || guard > 40) return Promise.resolve();
      return tmJson(WB_MAP + releases[idx].id + "/17/" + t17.y + "/" + t17.x + "/1/1").then(function (t) {
        if (!t.data || !t.data[0]) return;
        var src = t.select && idxById[t.select[0]] != null ? idxById[t.select[0]] : idx;
        rels.push(releases[src]); onStep && onStep(rels.length);
        return walk(src - 1, guard + 1);
      });
    }
    return walk(releases.length - 1, 0).then(function () {
      return Promise.all(rels.map(function (rel) {
        var lat = court.lat, lng = court.lng;
        var u = rel.md + "/identify?f=json&geometry=" + lng + "," + lat + "&geometryType=esriGeometryPoint&sr=4326&layers=all&tolerance=0&mapExtent=" +
          (lng - 0.001) + "," + (lat - 0.001) + "," + (lng + 0.001) + "," + (lat + 0.001) + "&imageDisplay=100,100,96&returnGeometry=false";
        return tmJson(u).then(function (m) {
          var best = (m.results || []).map(function (x) { return x.attributes; }).filter(function (a) { return a.SRC_DATE; })
            .sort(function (a, b) { return (+a.SRC_RES || 99) - (+b.SRC_RES || 99); })[0];
          if (!best) return null;
          var d = String(best.SRC_DATE);
          return { r: rel.id, date: d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6, 8), res: Math.round(+best.SRC_RES * 100) / 100, provider: best.NICE_DESC || "", sensor: best.SRC_DESC || "", z: 17 };
        }).catch(function () { return null; });
      }));
    }).then(function (metas) {
      var seen = {}, out = [];
      metas.forEach(function (m) { if (m && !seen[m.date]) { seen[m.date] = 1; out.push(m); } });
      return out.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    });
  });
}
export function tmSensor(s) {
  var m = { WV01: "WorldView-1", WV02: "WorldView-2", WV03: "WorldView-3", WV04: "WorldView-4", GE01: "GeoEye-1", QB02: "QuickBird", IK02: "IKONOS" };
  if (m[s]) return m[s];
  if (/SPOT\s*5/i.test(s)) return "SPOT 5";
  return s || "";
}
export function SatelliteTimeMachine(props) {
  var court = props.court;
  var app = useApp();
  var t = app.t, lang = app.lang, isAdmin = app.isAdmin, toast = app.toast;
  var wrapRef = useRef(null), mapEl = useRef(null), mapRef = useRef(null), layersRef = useRef({}), ratioRef = useRef(0.5);
  var editSt = useState(false), editing = editSt[0], setEditing = editSt[1];
  var candSt = useState(null), cand = candSt[0], setCand = candSt[1];
  var editRef = useRef(false), candMarkerRef = useRef(null);
  editRef.current = editing;
  var capsSt = useState(null), caps = capsSt[0], setCaps = capsSt[1];
  var errSt = useState(null), err = errSt[0], setErr = errSt[1];
  var stepSt = useState(0), steps = stepSt[0], setSteps = stepSt[1];
  var aSt = useState(0), ai = aSt[0], setAi = aSt[1];
  var bSt = useState(0), bi = bSt[0], setBi = bSt[1];
  var pickSt = useState("a"), pick = pickSt[0], setPick = pickSt[1];
  var modeSt = useState("compare"), mode = modeSt[0], setMode = modeSt[1];
  var playSt = useState(false), playing = playSt[0], setPlaying = playSt[1];
  var ratioSt = useState(0.5), ratio = ratioSt[0], setRatio = ratioSt[1];
  var fsSt = useState(false), fs = fsSt[0], setFs = fsSt[1];
  var tryN = useState(0), attempt = tryN[0], setAttempt = tryN[1];
  var L3 = function (ro, en, hu) { return lang === "en" ? en : lang === "hu" ? (hu || en) : ro; };

  useEffect(function () {
    var alive = true;
    setCaps(null); setErr(null); setSteps(0);
    tmPrecomputed().then(function (pre) {
      if (!court.posFixed && pre[court.id] && pre[court.id].length) return pre[court.id];
      return tmLive(court, function (n) { if (alive) setSteps(n); });
    }).then(function (list) {
      if (!alive) return;
      if (!list || !list.length) { setErr("empty"); return; }
      setCaps(list); setAi(0); setBi(list.length - 1);
    }).catch(function () { if (alive) setErr("net"); });
    return function () { alive = false; };
  }, [court.id, attempt]);

  // Map with two panes; pane B is clipped to the right of the divider.
  useEffect(function () {
    if (!caps || !mapEl.current || typeof L === "undefined") return;
    var m = L.map(mapEl.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, maxZoom: 19, minZoom: 14 }).setView([court.lat, court.lng], 18);
    m.attributionControl.setPrefix(false);
    m.createPane("tmA").style.zIndex = 200;
    var pb = m.createPane("tmB"); pb.style.zIndex = 210; pb.style.transition = "opacity .7s ease";
    L.circle([court.lat, court.lng], { radius: 22, color: "#F97316", weight: 2.5, fill: false, dashArray: "6 5", pane: "markerPane" }).addTo(m);
    L.marker([court.lat, court.lng], {
      interactive: false, pane: "markerPane",
      icon: L.divIcon({ className: "", iconSize: [0, 0], html: '<div class="tm-pin">🏀 ' + escHtml(t.satHere || "TERENUL") + "</div>" })
    }).addTo(m);
    mapRef.current = m; layersRef.current = {};
    var clip = function () {
      var size = m.getSize(), nw = m.containerPointToLayerPoint([0, 0]), se = m.containerPointToLayerPoint(size);
      var x = nw.x + size.x * ratioRef.current;
      pb.style.clip = "rect(" + nw.y + "px," + se.x + "px," + se.y + "px," + x + "px)";
    };
    m.on("move zoom resize zoomend moveend", clip);
    m.on("click", function (e) { if (editRef.current) setCand({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) }); });
    m._tmClip = clip;
    var tid = setTimeout(function () { m.invalidateSize(); clip(); }, 120);
    return function () { clearTimeout(tid); m.stop(); m.off(); m.remove(); mapRef.current = null; layersRef.current = {}; };
  }, [caps]);

  function layerFor(i, pane) {
    var key = pane + ":" + caps[i].r, m = mapRef.current, ls = layersRef.current;
    if (!ls[key]) ls[key] = L.tileLayer(WB_TILE + caps[i].r + "/{z}/{y}/{x}", {
      pane: pane, maxZoom: 19, maxNativeZoom: caps[i].z || 17, keepBuffer: 4,
      attribution: "Esri World Imagery Wayback · " + escHtml(caps[i].provider || "")
    });
    return ls[key];
  }
  function show(pane, i) {
    var m = mapRef.current; if (!m) return;
    Object.keys(layersRef.current).forEach(function (k) {
      if (k.indexOf(pane + ":") === 0 && m.hasLayer(layersRef.current[k]) && k !== pane + ":" + caps[i].r) m.removeLayer(layersRef.current[k]);
    });
    var l = layerFor(i, pane); if (!m.hasLayer(l)) l.addTo(m);
  }
  useEffect(function () {
    if (!caps || !mapRef.current) return;
    show("tmA", ai); show("tmB", bi);
    ratioRef.current = mode === "compare" ? ratio : 0;
    mapRef.current._tmClip && mapRef.current._tmClip();
  }, [caps, ai, bi, mode, ratio]);

  useEffect(function () {
    var m = mapRef.current; if (!m) return;
    if (candMarkerRef.current) { m.removeLayer(candMarkerRef.current); candMarkerRef.current = null; }
    if (cand) candMarkerRef.current = L.circleMarker([cand.lat, cand.lng], { radius: 9, color: "#fff", weight: 3, fillColor: "#10B981", fillOpacity: 1, pane: "markerPane" }).addTo(m);
    mapEl.current && (mapEl.current.style.cursor = editing ? "crosshair" : "");
  }, [cand, editing]);
  function savePos() {
    if (!cand) return;
    db.ref("settings/courtPos/" + court.id).set({ lat: cand.lat, lng: cand.lng, ts: Date.now() }).then(function () {
      court.lat = cand.lat; court.lng = cand.lng; court.posFixed = true;
      try { var c = JSON.parse(localStorage.getItem("g2p_courtpos") || "{}"); c[court.id] = { lat: cand.lat, lng: cand.lng }; localStorage.setItem("g2p_courtpos", JSON.stringify(c)); } catch (e) {}
      setEditing(false); setCand(null); setAttempt(function (n) { return n + 1; });
      toast(L3("Poziție salvată. Arhiva se recalculează.", "Position saved. Rebuilding the archive.", "Pozíció mentve."));
    }).catch(function (e) { toast(L3("Eroare: ", "Error: ", "Hiba: ") + e.message); });
  }

  // Chronology: step through captures; B fades in over A.
  useEffect(function () {
    if (!playing || !caps || mode !== "timeline") return;
    var pane = mapRef.current && mapRef.current.getPane("tmB");
    var id = setInterval(function () {
      setBi(function (cur) {
        var next = cur + 1 >= caps.length ? 0 : cur + 1;
        setAi(cur);
        if (pane) { pane.style.opacity = 0; requestAnimationFrame(function () { requestAnimationFrame(function () { pane.style.opacity = 1; }); }); }
        return next;
      });
    }, 2600);
    return function () { clearInterval(id); if (pane) pane.style.opacity = 1; };
  }, [playing, caps, mode]);

  useEffect(function () {
    var onFs = function () { setFs(document.fullscreenElement === wrapRef.current); setTimeout(function () { mapRef.current && mapRef.current.invalidateSize(); }, 150); };
    document.addEventListener("fullscreenchange", onFs);
    return function () { document.removeEventListener("fullscreenchange", onFs); };
  }, []);
  useEffect(function () {
    var m = mapRef.current; if (!m) return;
    if (fs) m.scrollWheelZoom.enable(); else m.scrollWheelZoom.disable();
  }, [fs]);

  function dragDivider(e) {
    var box = mapEl.current.getBoundingClientRect(), m = mapRef.current;
    e.preventDefault();
    if (m) m.dragging.disable();
    var moveTo = function (cx) { var r = Math.min(0.98, Math.max(0.02, (cx - box.left) / box.width)); ratioRef.current = r; setRatio(r); m && m._tmClip && m._tmClip(); };
    var mv = function (ev) { moveTo(ev.clientX); };
    var up = function () { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); if (m) m.dragging.enable(); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
    moveTo(e.clientX);
  }
  function choose(i) {
    setPlaying(false);
    if (mode === "timeline") { setAi(bi); setBi(i); return; }
    if (pick === "a") { if (i === bi) return; setAi(i); setPick("b"); } else { if (i === ai) return; setBi(i); setPick("a"); }
  }
  function toggleFs() {
    var el = wrapRef.current; if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen();
  }

  var head = React.createElement("div", { className: "flex justify-between items-center mb-1", style: { gap: ".5rem", flexWrap: "wrap" } },
    React.createElement("h4", { style: { margin: 0 } }, "🛰️ ", L3("Arhiva satelit", "Satellite archive", "Műholdas archívum")),
    caps && React.createElement("span", { className: "text-xs", style: { color: "var(--textSec)" } },
      caps.length + " " + L3("capturi reale", "real captures", "valós felvétel") + " · " + caps[0].date.slice(0, 4) + "–" + caps[caps.length - 1].date.slice(0, 4)));

  if (err) return React.createElement("div", { className: "card mt-2 tm-card" }, head,
    React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)" } },
      err === "empty" ? L3("Nu există imagini istorice pentru acest punct.", "No historical imagery for this spot.", "Nincs történeti felvétel erre a pontra.")
        : L3("Arhiva Esri nu răspunde acum.", "The Esri archive is not responding right now.", "Az Esri archívum most nem válaszol.")),
    React.createElement("button", { className: "btn btn-sm btn-outline", onClick: function () { setAttempt(attempt + 1); } }, L3("Reîncearcă", "Retry", "Újra")));
  if (!caps) return React.createElement("div", { className: "card mt-2 tm-card" }, head,
    React.createElement("div", { className: "tm-map tm-skeleton" },
      React.createElement("span", null, steps ? L3("Caut capturi… ", "Finding captures… ", "Felvételek keresése… ") + steps : L3("Se încarcă arhiva…", "Loading archive…", "Archívum betöltése…"))));

  var A = caps[ai], B = caps[bi];
  var t0 = new Date(caps[0].date).getTime(), t1 = new Date(caps[caps.length - 1].date).getTime(), spanMs = Math.max(1, t1 - t0);
  var chip = function (c, side) {
    return React.createElement("div", { className: "tm-label tm-label-" + side },
      React.createElement("b", null, tmFmt(c.date, lang)),
      React.createElement("span", null, String(c.res).replace(".", lang === "en" ? "." : ",") + " m/px · " + tmSensor(c.sensor) +
        (c.res > 1 ? " · " + L3("rezoluție joasă", "low resolution", "alacsony felbontás") : "") +
        (c.sensor === "WV01" ? " · " + L3("alb-negru: satelitul nu are senzor de culoare", "black & white: this satellite has no colour sensor", "fekete-fehér: a műholdnak nincs színérzékelője") : "")));
  };
  return React.createElement("div", { className: "card mt-2 tm-card" + (fs ? " tm-fs" : ""), ref: wrapRef },
    head,
    React.createElement("div", { className: "tm-modes" },
      React.createElement("button", { className: mode === "compare" ? "on" : "", onClick: function () { setMode("compare"); setPlaying(false); } }, "⇆ " + L3("Comparare", "Compare", "Összehasonlítás")),
      React.createElement("button", { className: mode === "timeline" ? "on" : "", onClick: function () { setMode("timeline"); } }, "⏱ " + L3("Cronologie", "Timeline", "Idővonal")),
      mode === "timeline" && React.createElement("button", { className: playing ? "on" : "", onClick: function () { setPlaying(!playing); } }, playing ? "⏸ " + L3("Pauză", "Pause", "Szünet") : "▶ " + L3("Redă", "Play", "Lejátszás")),
      isAdmin && React.createElement("button", { className: editing ? "on" : "", onClick: function () { setEditing(!editing); setCand(null); setPlaying(false); } }, "📍 " + L3("Corectează poziția", "Fix position", "Pozíció javítása")),
      React.createElement("button", { onClick: toggleFs, "aria-label": "Fullscreen", style: { marginLeft: "auto" } }, fs ? "✕" : "⛶")),
    editing && React.createElement("div", { className: "tm-edit" },
      React.createElement("span", null, cand ? cand.lat + ", " + cand.lng : L3("Atinge terenul real pe imagine.", "Tap the real court on the image.", "Koppints a valódi pályára.")),
      cand && React.createElement("button", { className: "btn btn-sm btn-green", onClick: savePos }, L3("Salvează poziția", "Save position", "Mentés")),
      React.createElement("button", { className: "btn btn-sm btn-outline", onClick: function () { setEditing(false); setCand(null); } }, L3("Anulează", "Cancel", "Mégse"))),
    React.createElement("div", { className: "tm-stage" },
      React.createElement("div", { className: "tm-map", ref: mapEl }),
      mode === "compare" && React.createElement("div", { className: "tm-divider", style: { left: (ratio * 100) + "%" }, onPointerDown: dragDivider },
        React.createElement("div", { className: "tm-knob", role: "slider", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(ratio * 100), "aria-label": L3("Comparare imagini", "Compare images", "Képek összehasonlítása"), tabIndex: 0,
          onKeyDown: function (e) { var d = e.key === "ArrowLeft" ? -0.05 : e.key === "ArrowRight" ? 0.05 : 0; if (d) { var r = Math.min(0.98, Math.max(0.02, ratio + d)); ratioRef.current = r; setRatio(r); } } }, "⇆")),
      mode === "compare" ? chip(A, "a") : null,
      chip(B, mode === "compare" ? "b" : "big")),
    React.createElement("div", { className: "tm-track" },
      React.createElement("div", { className: "tm-line" }),
      caps.map(function (c, i) {
        var pos = 4 + 92 * (new Date(c.date).getTime() - t0) / spanMs;
        var isA = mode === "compare" && i === ai, isB = i === bi;
        return React.createElement("button", {
          key: c.r + c.date, className: "tm-dot" + (i % 2 ? " up" : "") + (isA ? " a" : "") + (isB ? " b" : ""), style: { left: pos + "%" },
          title: tmFmt(c.date, lang) + " · " + c.res + " m/px", onClick: function () { choose(i); }
        }, React.createElement("span", null, c.date.slice(0, 4)));
      })),
    React.createElement("div", { className: "tm-foot" },
      mode === "compare"
        ? React.createElement("span", null, "⏳ " + tmSpan(A.date, B.date, lang) + " · " + (pick === "a" ? L3("Atinge o dată pentru stânga", "Tap a date for the left side", "Válassz dátumot a bal oldalhoz") : L3("Atinge o dată pentru dreapta", "Tap a date for the right side", "Válassz dátumot a jobb oldalhoz")))
        : React.createElement("span", null, L3("Fiecare cadru e o captură reală, nu o simulare.", "Every frame is a real capture, not a simulation.", "Minden kocka valós felvétel.")),
      React.createElement("span", null, "© Esri World Imagery Wayback · " + (B.provider || ""))));
}
