import { ACTIVE_CITY, useApp } from "../app/core.js";
import { CITY_CFG } from "../data/constants.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { courtStatusView } from "../lib/court-status-view.js";
import { escHtml } from "../lib/next-lang.js";
import { useEffect, useRef } from "../lib/react.js";

/* === Map === */
export function MapView({
  courts,
  height = "380px",
  onSelect,
  heat = true,
  heatCounts: heatCountsProp = null,
  myLoc = null
}) {
  // The report heatmap is always on, on every map: static c.reports + the live reports/ counts.
  const liveReports = useFirebase(heat && !heatCountsProp ? "reports" : null);
  const heatCounts = React.useMemo(() => {
    if (heatCountsProp) return heatCountsProp;
    const out = {};
    if (liveReports) Object.values(liveReports).forEach(r => { if (r && r.courtId) out[r.courtId] = (out[r.courtId] || 0) + 1; });
    return out;
  }, [liveReports, heatCountsProp]);
  const heatKey = JSON.stringify(heatCounts); // rebuild the map only when the counts really change
  const ref = useRef(null);
  const mapRef = useRef(null);
  const {
    t
  } = useApp();
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const m = L.map(ref.current, { scrollWheelZoom: false, maxZoom: 19 }).setView(CITY_CFG[ACTIVE_CITY].center, CITY_CFG[ACTIVE_CITY].zoom);
    m.attributionControl.setPrefix(false);
    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL)'
    });
    const sat = L.layerGroup([
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "© Esri World Imagery, Maxar, Earthstar Geographics" }),
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 })
    ]);
    let base = "street";
    try { base = localStorage.getItem("g2p_basemap") || "street"; } catch (e) {}
    (base === "sat" ? sat : street).addTo(m);
    L.control.layers({ [t.mapStreet || "Hartă"]: street, [t.mapSat || "Satelit"]: sat }, null, { position: "topright" }).addTo(m);
    m.on("baselayerchange", e => { try { localStorage.setItem("g2p_basemap", e.layer === sat ? "sat" : "street"); } catch (err) {} });
    m.on("click focus", () => m.scrollWheelZoom.enable());
    m.on("mouseout", () => m.scrollWheelZoom.disable());
    // Heatmap: concentric translucent circles per court, radius/opacity
    // scaled by report density (static c.reports + live heatCounts).
    if (heat) {
      courts.forEach(c => {
        const n = (c.reports || 0) + (heatCounts && heatCounts[c.id] || 0);
        if (!n) return;
        const f = Math.min(1, n / 8);
        [[1, 0.07], [0.62, 0.12], [0.3, 0.2]].forEach(([rf, op]) => {
          L.circle([c.lat, c.lng], {
            radius: (180 + 420 * f) * rf,
            stroke: false,
            color: "#DC2626",
            fillColor: "#DC2626",
            fillOpacity: op + f * 0.1
          }).addTo(m);
        });
      });
    }
    courts.forEach(c => {
      if (c.lat == null || c.lng == null) return;
      const col = courtStatusView(c, t).color;
      const icon = L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${col};border:2.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.45)"></div>`,
        className: "",
        iconSize: [16, 16]
      });
      const mk = L.marker([c.lat, c.lng], {
        icon,
        alt: c.name || "",
        keyboard: true
      }).addTo(m);
      mk.bindTooltip(`<b>${escHtml(c.name)}</b>${c.address ? "<br>" + escHtml(c.address) : ""}`, { direction: "top", offset: [0, -8] });
      if (onSelect) mk.on('click', () => onSelect(c));
      else mk.bindPopup(`<b>${escHtml(c.name)}</b><br>${escHtml(c.address)}`);
    });
    const pts = courts.filter(c => c.lat != null && c.lng != null).map(c => [c.lat, c.lng]);
    if (pts.length > 1 && !myLoc) m.fitBounds(pts, { padding: [28, 28], maxZoom: 15 });
    if (myLoc) {
      const uIcon = L.divIcon({
        html: '<div style="width:18px;height:18px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 5px rgba(37,99,235,.35)"></div>',
        className: "",
        iconSize: [18, 18]
      });
      L.marker([myLoc.lat, myLoc.lng], { icon: uIcon, zIndexOffset: 1000 }).addTo(m).bindPopup(t.youAreHere || "Esti aici");
      m.setView([myLoc.lat, myLoc.lng], 14);
    }
    mapRef.current = m;
    const sizeTimer = setTimeout(() => m.invalidateSize(), 200);
    return () => {
      clearTimeout(sizeTimer);
      // Stop running zoom/pan animations first: removing mid-animation throws "_leaflet_pos" in Leaflet 1.9.
      m.stop(); m.off();
      m.remove();
      mapRef.current = null;
    };
  }, [courts, heat, heatKey, myLoc]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: "map-box",
    style: {
      height
    }
  });
}
